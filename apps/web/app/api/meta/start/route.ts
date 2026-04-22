/**
 * POST /api/meta/start
 * Inicia flujo OAuth Meta (server-side). Genera state firmado HMAC,
 * registra la transacción en Supabase y devuelve la redirect_url.
 *
 * Contexto: MIGRATION_V2.md §13 (OAuth Meta server-side), §15 (Endpoints).
 *
 * Seguridad:
 *  - Requiere usuario autenticado (cookie Supabase).
 *  - Requiere membresía en tenant_id (is_tenant_member enforced por RLS).
 *  - state = base64url(tenant_id|nonce|ts) + "." + HMAC(state, OAUTH_STATE_SECRET)
 *  - TTL: 10 min.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'node:crypto';
import { createServerClient } from '@supabase/ssr';
import { OAuthStartInput, parseOrThrow } from '@divinads/types';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const FB_AUTH = 'https://www.facebook.com/v20.0/dialog/oauth';
const SCOPES = (process.env.FB_OAUTH_SCOPES ?? 'ads_management,ads_read,business_management,pages_show_list,pages_read_engagement,public_profile').split(',');

function signState(payload: string, secret: string): string {
    const mac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${mac}`;
}

export async function POST(req: NextRequest) {
    const cookieStore = cookies();
    const cookieNames = cookieStore.getAll().map(c => c.name);
    const supaAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                    cs.forEach(({ name, value, options }) => {
                        try { cookieStore.set({ name, value, ...options }); } catch { /* RSC */ }
                    });
                },
            },
        },
    );
    const { data: { user }, error: authErr } = await supaAuth.auth.getUser();
    if (!user) {
        const body: Record<string, unknown> = { error: 'unauthorized', message: 'login required' };
        if (process.env.NODE_ENV !== 'production') {
            body.debug = {
                cookieNames,
                hasSupabaseCookie: cookieNames.some(n => /^sb-.*-auth-token/.test(n)),
                authError: authErr?.message ?? null,
            };
        }
        return NextResponse.json(body, { status: 401 });
    }

    const body = parseOrThrow(OAuthStartInput, await req.json());
    const supa = getSupabaseService();

    // Verificar membresía (defense-in-depth por encima de RLS)
    const { data: mem } = await supa
        .from('tenant_members')
        .select('role')
        .eq('tenant_id', body.tenant_id)
        .eq('user_id', user.id)
        .maybeSingle();
    if (!mem) {
        return NextResponse.json({ error: 'forbidden', message: 'not a tenant member' }, { status: 403 });
    }

    const secret = process.env.OAUTH_STATE_SECRET;
    if (!secret) throw new Error('OAUTH_STATE_SECRET missing');

    const nonce = crypto.randomBytes(16).toString('base64url');
    const ts    = Date.now().toString(36);
    const payload = [body.tenant_id, user.id, nonce, ts].join('|');
    const state = signState(Buffer.from(payload).toString('base64url'), secret);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { error: insErr } = await supa.from('oauth_transactions').insert({
        tenant_id: body.tenant_id,
        user_id: user.id,
        state,
        redirect_uri: process.env.FB_REDIRECT_URI!,
        scopes: SCOPES,
        expires_at: expiresAt.toISOString(),
    });
    if (insErr) {
        return NextResponse.json({ error: 'internal_error', message: insErr.message }, { status: 500 });
    }

    const url = new URL(FB_AUTH);
    url.searchParams.set('client_id', process.env.FB_APP_ID!);
    url.searchParams.set('redirect_uri', process.env.FB_REDIRECT_URI!);
    url.searchParams.set('scope', SCOPES.join(','));
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');

    return NextResponse.json({
        redirect_url: url.toString(),
        state,
        expires_at: expiresAt.toISOString(),
    });
}
