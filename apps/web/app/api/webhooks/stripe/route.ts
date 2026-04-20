/**
 * POST /api/webhooks/stripe
 * Recibe eventos de Stripe para gestión de licencias.
 *
 * Eventos manejados:
 *  - checkout.session.completed   → activar suscripción
 *  - customer.subscription.updated → cambiar plan / status
 *  - customer.subscription.deleted → cancelar / pasar a trial
 *  - invoice.payment_succeeded     → renovar período
 *  - invoice.payment_failed        → marcar past_due
 *
 * Seguridad: firma HMAC verificada con stripe.webhooks.constructEvent()
 * usando STRIPE_WEBHOOK_SECRET. Cualquier solicitud con firma inválida
 * devuelve 400 inmediatamente.
 */
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

// Mapeo Stripe price_id → plan interno
const PRICE_TO_PLAN: Record<string, string> = {
    [process.env.STRIPE_PRICE_STARTER_MONTHLY ?? '']:  'starter',
    [process.env.STRIPE_PRICE_STARTER_ANNUAL ?? '']:   'starter',
    [process.env.STRIPE_PRICE_PRO_MONTHLY ?? '']:      'pro',
    [process.env.STRIPE_PRICE_PRO_ANNUAL ?? '']:       'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE ?? '']:       'enterprise',
};

function getStripe(): Stripe {
    if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
    return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
}

export async function POST(req: NextRequest) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: 'webhook_not_configured' }, { status: 500 });
    }

    const body = await req.text();
    const sig  = req.headers.get('stripe-signature');
    if (!sig) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
    } catch {
        return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
    }

    const supa = getSupabaseService();

    try {
        switch (event.type) {

        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const tenantId = session.metadata?.tenant_id;
            if (!tenantId || session.mode !== 'subscription') break;

            const subId = session.subscription as string;
            const sub   = await getStripe().subscriptions.retrieve(subId, { expand: ['items.data.price'] });
            const priceId = (sub.items.data[0]?.price as Stripe.Price)?.id ?? '';
            const plan    = PRICE_TO_PLAN[priceId] ?? 'starter';
            const seats   = Number(session.metadata?.seats ?? 1);
            const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

            await supa.from('licenses').upsert({
                tenant_id:                tenantId,
                plan,
                status:                   'active',
                seats,
                stripe_customer_id:       session.customer as string,
                stripe_subscription_id:   subId,
                current_period_ends_at:   periodEnd,
            }, { onConflict: 'tenant_id' });

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.activated',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { plan, seats, stripe_subscription_id: subId },
            });
            break;
        }

        case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription;
            const tenantId = sub.metadata?.tenant_id;
            if (!tenantId) break;

            const priceId = (sub.items.data[0]?.price as Stripe.Price)?.id ?? '';
            const plan    = PRICE_TO_PLAN[priceId] ?? 'starter';
            const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

            const stripeStatus = sub.status; // active | past_due | canceled | trialing | ...
            const internalStatus = stripeStatus === 'active'    ? 'active'
                                 : stripeStatus === 'past_due'  ? 'past_due'
                                 : stripeStatus === 'trialing'  ? 'trial'
                                 : 'inactive';

            await supa.from('licenses').update({
                plan,
                status:                 internalStatus,
                current_period_ends_at: periodEnd,
            }).eq('tenant_id', tenantId);

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.updated',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { plan, status: internalStatus, stripe_status: stripeStatus },
            });
            break;
        }

        case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            const tenantId = sub.metadata?.tenant_id;
            if (!tenantId) break;

            await supa.from('licenses').update({
                status:                 'inactive',
                stripe_subscription_id: null,
                current_period_ends_at: null,
            }).eq('tenant_id', tenantId);

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.cancelled',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { reason: 'subscription_deleted' },
            });
            break;
        }

        case 'invoice.payment_succeeded': {
            const invoice = event.data.object as Stripe.Invoice;
            const subId   = invoice.subscription as string;
            if (!subId) break;

            const sub = await getStripe().subscriptions.retrieve(subId);
            const tenantId = sub.metadata?.tenant_id;
            if (!tenantId) break;

            const periodEnd = new Date(sub.current_period_end * 1000).toISOString();
            await supa.from('licenses').update({
                status:                 'active',
                current_period_ends_at: periodEnd,
            }).eq('tenant_id', tenantId);
            break;
        }

        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            const subId   = invoice.subscription as string;
            if (!subId) break;

            const sub = await getStripe().subscriptions.retrieve(subId);
            const tenantId = sub.metadata?.tenant_id;
            if (!tenantId) break;

            await supa.from('licenses').update({ status: 'past_due' }).eq('tenant_id', tenantId);

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.payment_failed',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { invoice_id: invoice.id, attempt: invoice.attempt_count },
            });
            break;
        }

        default:
            // Ignorar eventos no manejados
            break;
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('[stripe-webhook]', event.type, err?.message);
        return NextResponse.json({ error: 'handler_error' }, { status: 500 });
    }
}
