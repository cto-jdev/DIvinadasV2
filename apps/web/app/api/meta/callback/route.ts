/**
 * GET /api/meta/callback?code=...&state=...
 * Callback OAuth Meta. Valida state firmado, canjea code, obtiene long-lived
 * token, guarda conexión + token cifrado, audita y redirige al panel.
 *
 * Contexto: MIGRATION_V2.md §13.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const FB_API = process.env.FB_API_VERSION || 'v20.0';

function verifyState(state: string, secret: string): { payload: string; valid: boolean } {
    const dot = state.lastIndexOf('.');
    if (dot < 0) return { payload: '', valid: false };
    const payload = state.slice(0, dot);
    const mac     = state.slice(dot + 1);
    const expect  = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    // timingSafeEqual evita side-channel
    const a = Buffer.from(mac);
    const b = Buffer.from(expect);
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    return { payload, valid };
}

export async function GET(req: NextRequest) {
    const code  = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    if (!code || !state) {
        return NextResponse.redirect(new URL('/connect?error=missing_params', req.url));
    }

    const secret = process.env.OAUTH_STATE_SECRET;
    if (!secret) throw new Error('OAUTH_STATE_SECRET missing');

    const { valid } = verifyState(state, secret);
    if (!valid) {
        return NextResponse.redirect(new URL('/connect?error=bad_state', req.url));
    }

    const supa = getSupabaseService();

    // Atomic consume: la tx debe existir, no haber expirado y no estar consumida
    const { data: tx, error: txErr } = await supa
        .from('oauth_transactions')
        .select('id, tenant_id, user_id, scopes, expires_at, consumed_at')
        .eq('state', state)
        .maybeSingle();

    if (txErr || !tx) {
        return NextResponse.redirect(new URL('/connect?error=tx_not_found', req.url));
    }
    if (tx.consumed_at) {
        return NextResponse.redirect(new URL('/connect?error=tx_replay', req.url));
    }
    if (new Date(tx.expires_at).getTime() < Date.now()) {
        return NextResponse.redirect(new URL('/connect?error=tx_expired', req.url));
    }

    // 1) Code → short-lived
    const shortUrl = new URL(`https://graph.facebook.com/${FB_API}/oauth/access_token`);
    shortUrl.searchParams.set('client_id', process.env.FB_APP_ID!);
    shortUrl.searchParams.set('client_secret', process.env.FB_APP_SECRET!);
    shortUrl.searchParams.set('redirect_uri', process.env.FB_REDIRECT_URI!);
    shortUrl.searchParams.set('code', code);

    const shortRes = await fetch(shortUrl);
    if (!shortRes.ok) {
        return NextResponse.redirect(new URL('/connect?error=code_exchange', req.url));
    }
    const shortJson = await shortRes.json() as { access_token: string };

    // 2) Short → long-lived (60d)
    const longUrl = new URL(`https://graph.facebook.com/${FB_API}/oauth/access_token`);
    longUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longUrl.searchParams.set('client_id', process.env.FB_APP_ID!);
    longUrl.searchParams.set('client_secret', process.env.FB_APP_SECRET!);
    longUrl.searchParams.set('fb_exchange_token', shortJson.access_token);

    const longRes = await fetch(longUrl);
    if (!longRes.ok) {
        return NextResponse.redirect(new URL('/connect?error=long_exchange', req.url));
    }
    const longJson = await longRes.json() as { access_token: string; expires_in?: number };

    // 3) /me (+appsecret_proof) para datos de perfil
    const appsecretProof = crypto.createHmac('sha256', process.env.FB_APP_SECRET!)
        .update(longJson.access_token)
        .digest('hex');

    const meUrl = new URL(`https://graph.facebook.com/${FB_API}/me`);
    meUrl.searchParams.set('access_token', longJson.access_token);
    meUrl.searchParams.set('appsecret_proof', appsecretProof);
    meUrl.searchParams.set('fields', 'id,name,email,picture');
    const meRes = await fetch(meUrl);
    const me = meRes.ok ? await meRes.json() as any : { id: 'unknown', name: 'Meta User' };

    // 4) Upsert meta_connection + meta_token (RPC SECURITY DEFINER cifra)
    const { data: conn, error: connErr } = await supa
        .from('meta_connections')
        .upsert({
            tenant_id: tx.tenant_id,
            meta_user_id: me.id,
            display_name: me.name ?? null,
            email: me.email ?? null,
            picture_url: me.picture?.data?.url ?? null,
            status: 'active',
            connected_by: tx.user_id,
            last_refreshed_at: new Date().toISOString(),
        }, { onConflict: 'tenant_id,meta_user_id' })
        .select('id')
        .single();

    if (connErr || !conn) {
        return NextResponse.redirect(new URL('/connect?error=conn_save', req.url));
    }

    // pgp_sym_encrypt se hace en una RPC aparte (store_meta_token) para mantener
    // la clave en Vault y nunca tocarla desde este handler.
    const expiresAt = longJson.expires_in
        ? new Date(Date.now() + longJson.expires_in * 1000).toISOString()
        : null;

    const { error: tokErr } = await supa.rpc('store_meta_token', {
        p_connection_id: conn.id,
        p_access_token: longJson.access_token,
        p_scopes: tx.scopes,
        p_expires_at: expiresAt,
    });
    if (tokErr) {
        return NextResponse.redirect(new URL('/connect?error=token_save', req.url));
    }

    await supa.from('oauth_transactions')
        .update({ consumed_at: new Date().toISOString() })
        .eq('id', tx.id);

    await supa.from('audit_logs').insert({
        tenant_id: tx.tenant_id,
        actor_user_id: tx.user_id,
        action: 'meta.connect',
        resource_type: 'meta_connection',
        resource_id: conn.id,
        metadata: { meta_user_id: me.id, scopes: tx.scopes },
    });

    return NextResponse.redirect(new URL(`/panel/connections?ok=${conn.id}`, req.url));
}
