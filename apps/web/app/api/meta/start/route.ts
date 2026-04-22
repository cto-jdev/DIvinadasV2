/**
 * POST /api/meta/start
 * Inicia flujo OAuth Meta (server-side). Auth: Bearer token (Supabase
 * access_token) en Authorization header. Genera state firmado HMAC,
 * registra la transacción en Supabase y devuelve la redirect_url.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { OAuthStartInput, parseOrThrow } from '@divinads/types';
import { getSupabaseService } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

const FB_AUTH = 'https://www.facebook.com/v20.0/dialog/oauth';
const SCOPES = (process.env.FB_OAUTH_SCOPES ?? 'ads_management,ads_read,business_management,pages_show_list,pages_read_engagement,public_profile').split(',');

function signState(payload: string, secret: string): string {
    const mac = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
    return `${payload}.${mac}`;
}

export async function POST(req: NextRequest) {
    try {
        return await handle(req);
    } catch (e) {
        const message = e instanceof Error ? e.message : 'unknown';
        console.error('[meta/start] uncaught:', e);
        return NextResponse.json({ error: 'internal_error', message }, { status: 500 });
    }
}

async function handle(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return NextResponse.json({ error: 'unauthorized', message: 'login required' }, { status: 401 });
    }

    let body;
    try {
        body = parseOrThrow(OAuthStartInput, await req.json());
    } catch (e) {
        const message = e instanceof Error ? e.message : 'invalid body';
        return NextResponse.json({ error: 'validation_error', message }, { status: 400 });
    }
    const supa = getSupabaseService();

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
    const appId = process.env.FB_APP_ID;
    const redirectUri = process.env.FB_REDIRECT_URI;
    const missing = [
        !secret && 'OAUTH_STATE_SECRET',
        !appId && 'FB_APP_ID',
        !redirectUri && 'FB_REDIRECT_URI',
    ].filter(Boolean);
    if (missing.length) {
        return NextResponse.json({ error: 'config_error', message: `missing env: ${missing.join(', ')}` }, { status: 500 });
    }

    const nonce = crypto.randomBytes(16).toString('base64url');
    const ts    = Date.now().toString(36);
    const payload = [body.tenant_id, user.id, nonce, ts].join('|');
    const state = signState(Buffer.from(payload).toString('base64url'), secret!);

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const { error: insErr } = await supa.from('oauth_transactions').insert({
        tenant_id: body.tenant_id,
        user_id: user.id,
        state,
        redirect_uri: redirectUri!,
        scopes: SCOPES,
        expires_at: expiresAt.toISOString(),
    });
    if (insErr) {
        return NextResponse.json({ error: 'internal_error', message: insErr.message }, { status: 500 });
    }

    const url = new URL(FB_AUTH);
    url.searchParams.set('client_id', appId!);
    url.searchParams.set('redirect_uri', redirectUri!);
    url.searchParams.set('scope', SCOPES.join(','));
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');

    return NextResponse.json({
        redirect_url: url.toString(),
        state,
        expires_at: expiresAt.toISOString(),
    });
}
