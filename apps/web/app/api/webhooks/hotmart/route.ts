/**
 * POST /api/webhooks/hotmart
 * Recibe eventos de Hotmart para gestión de licencias.
 *
 * Eventos manejados:
 *  - PURCHASE_APPROVED      → activar / renovar licencia
 *  - PURCHASE_COMPLETE      → confirmar pago (igual a APPROVED)
 *  - PURCHASE_CANCELED      → cancelar licencia
 *  - PURCHASE_REFUNDED      → reembolso → desactivar
 *  - PURCHASE_EXPIRED       → expirar licencia
 *  - SUBSCRIPTION_CANCELLATION → cancelar suscripción recurrente
 *
 * Seguridad: verificación HOTTOK por header x-hotmart-hottok usando
 * timingSafeEqual. Cualquier solicitud sin token válido devuelve 401.
 *
 * Idempotencia: payload.id se registra en webhook_events antes de
 * procesar. Si ya existe (unique violation), se devuelve 200 sin
 * reprocesar para tolerar reintentos de Hotmart.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

// ─── Tipos Hotmart (webhook v2.0) ─────────────────────────────────────────────

interface HotmartPayload {
    id: string;
    creation_date: number;      // unix ms
    event: string;
    version: string;
    data: {
        product?: { id: number; ucode?: string; name?: string };
        buyer?: { email?: string; name?: string; code?: string };
        purchase?: {
            transaction?: string;
            status?: string;
            recurrence_number?: number;
        };
        subscription?: {
            status?: string;
            subscriber?: { code?: string };
            plan?: { name?: string; id?: number };
        };
    };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mapea el nombre del plan de Hotmart al plan interno de DivinAds.
 * Se puede sobreescribir con la variable HOTMART_PLAN_MAP en formato JSON.
 * Ejemplo: '{"Pro Mensal":"pro","Starter Anual":"starter"}'
 */
function resolvePlan(planName?: string): 'starter' | 'pro' | 'enterprise' {
    if (!planName) return 'starter';

    try {
        const custom = process.env.HOTMART_PLAN_MAP
            ? JSON.parse(process.env.HOTMART_PLAN_MAP) as Record<string, string>
            : {};
        if (custom[planName]) return custom[planName] as 'starter' | 'pro' | 'enterprise';
    } catch { /* ignorar JSON inválido */ }

    const lower = planName.toLowerCase();
    if (lower.includes('enterprise')) return 'enterprise';
    if (lower.includes('pro'))        return 'pro';
    return 'starter';
}

/**
 * Busca el tenant_id principal de un usuario por email.
 * Devuelve null si no existe en la plataforma.
 */
async function getTenantByEmail(email: string): Promise<string | null> {
    const supa = getSupabaseService();

    const { data: users, error } = await supa.auth.admin.listUsers();
    if (error || !users) {
        console.error('[hotmart-webhook] listUsers failed:', error?.message);
        return null;
    }
    const user = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (!user) return null;

    const { data: member } = await supa
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', user.id)
        .in('role', ['owner', 'admin'])
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

    return member?.tenant_id ?? null;
}

// ─── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    const hottok = process.env.HOTMART_HOTTOK;
    if (!hottok) {
        console.error('[hotmart-webhook] HOTMART_HOTTOK not configured');
        return NextResponse.json({ error: 'webhook_not_configured' }, { status: 500 });
    }

    // Verificar HOTTOK en header (Hotmart v2.0+)
    const receivedToken = req.headers.get('x-hotmart-hottok') ?? '';
    const valid = receivedToken.length > 0 &&
        receivedToken.length === hottok.length &&
        crypto.timingSafeEqual(Buffer.from(receivedToken), Buffer.from(hottok));

    if (!valid) {
        return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    let payload: HotmartPayload;
    try {
        payload = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
    }

    if (!payload.id || !payload.event) {
        return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
    }

    const { event, data } = payload;
    const supa = getSupabaseService();

    // Idempotency: insert event ID before processing. If the insert fails with
    // a unique violation (23505), this event was already processed — return 200
    // so Hotmart stops retrying.
    const { error: idempErr } = await supa.from('webhook_events').insert({
        provider: 'hotmart',
        event_id: payload.id,
    });
    if (idempErr) {
        if ((idempErr as { code?: string }).code === '23505') {
            return NextResponse.json({ received: true, event, duplicate: true });
        }
        // Non-uniqueness error: log but continue (don't block billing on idempotency table issues)
        console.error('[hotmart-webhook] idempotency insert failed:', idempErr.message);
    }

    try {
        switch (event) {

        case 'PURCHASE_APPROVED':
        case 'PURCHASE_COMPLETE': {
            const email = data.buyer?.email;
            if (!email) break;

            const tenantId = await getTenantByEmail(email);
            if (!tenantId) {
                console.warn('[hotmart-webhook] No tenant found for buyer:', email);
                break;
            }

            const plan      = resolvePlan(data.subscription?.plan?.name ?? data.product?.name);
            const subCode   = data.subscription?.subscriber?.code ?? null;
            const buyerCode = data.buyer?.code ?? null;

            const periodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

            await supa.from('licenses').upsert({
                tenant_id:                   tenantId,
                plan,
                status:                      'active',
                hotmart_buyer_code:          buyerCode,
                hotmart_subscription_code:   subCode,
                current_period_ends_at:      periodEnd,
            }, { onConflict: 'tenant_id' });

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.activated',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { plan, hotmart_event: event, transaction: data.purchase?.transaction },
            });
            break;
        }

        case 'PURCHASE_CANCELED':
        case 'PURCHASE_REFUNDED':
        case 'SUBSCRIPTION_CANCELLATION': {
            const email = data.buyer?.email;
            if (!email) break;

            const tenantId = await getTenantByEmail(email);
            if (!tenantId) break;

            await supa.from('licenses').update({
                status:                    'canceled',
                hotmart_subscription_code: null,
                current_period_ends_at:    null,
            }).eq('tenant_id', tenantId);

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.cancelled',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { reason: event, transaction: data.purchase?.transaction },
            });
            break;
        }

        case 'PURCHASE_EXPIRED': {
            const email = data.buyer?.email;
            if (!email) break;

            const tenantId = await getTenantByEmail(email);
            if (!tenantId) break;

            await supa.from('licenses').update({
                status:                    'expired',
                hotmart_subscription_code: null,
                current_period_ends_at:    null,
            }).eq('tenant_id', tenantId);

            await supa.from('audit_logs').insert({
                tenant_id:    tenantId,
                action:       'license.expired',
                resource_type:'license',
                resource_id:  tenantId,
                meta:         { hotmart_event: event },
            });
            break;
        }

        default:
            break;
        }

        return NextResponse.json({ received: true, event });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[hotmart-webhook]', event, msg);
        return NextResponse.json({ error: 'handler_error' }, { status: 500 });
    }
}
