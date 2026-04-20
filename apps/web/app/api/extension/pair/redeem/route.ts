/**
 * POST /api/extension/pair/redeem
 * La extensión envía el código de 6 dígitos; el backend lo valida,
 * crea extension_install y devuelve un session_token JWT.
 *
 * Contexto: MIGRATION_V2.md §14.
 *
 * Este endpoint es PÚBLICO (sin login) pero:
 *  - rate-limit 5/IP/1min (detecta brute-force en segundos)
 *  - el código se consume atómicamente (consumed_at IS NULL)
 *  - el JWT se firma con JWT_SECRET y tiene jti + install_id
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { SignJWT } from 'jose';
import { PairingRedeemInput, parseOrThrow } from '@divinads/types';
import { getSupabaseService } from '@/lib/supabase';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    // 5 intentos por IP por minuto — brute-force de 6 dígitos = 200 000 min mínimo
    const rl = await rateLimit(`pair:redeem:${ip}`, 5, '1 m');
    if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, {
        status: 429,
        headers: { 'Retry-After': '60' },
    });

    const body = parseOrThrow(PairingRedeemInput, await req.json());
    const codeHash = crypto.createHash('sha256').update(body.code).digest('hex');

    const supa = getSupabaseService();

    const { data: pair, error: pErr } = await supa
        .from('device_pairings')
        .select('id, tenant_id, user_id, expires_at, consumed_at')
        .eq('code_hash', codeHash)
        .maybeSingle();

    if (pErr || !pair)          return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (pair.consumed_at)        return NextResponse.json({ error: 'already_used' }, { status: 409 });
    if (new Date(pair.expires_at).getTime() < Date.now())
        return NextResponse.json({ error: 'expired' }, { status: 410 });

    // Generar install + session token
    const jti = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(jti).digest('hex');

    const { data: install, error: iErr } = await supa.from('extension_installs').insert({
        tenant_id: pair.tenant_id,
        user_id: pair.user_id,
        label: body.label ?? null,
        user_agent: body.user_agent ?? req.headers.get('user-agent'),
        session_token_hash: tokenHash,
        last_seen_at: new Date().toISOString(),
    }).select('id').single();

    if (iErr || !install) return NextResponse.json({ error: 'internal_error' }, { status: 500 });

    // Atomic consume (recheck race-safe)
    const { data: consumed, error: cErr } = await supa
        .from('device_pairings')
        .update({ consumed_at: new Date().toISOString(), consumed_by_install: install.id })
        .eq('id', pair.id)
        .is('consumed_at', null)
        .select('id')
        .maybeSingle();
    if (cErr || !consumed) {
        // Rollback install (otra petición ganó la carrera)
        await supa.from('extension_installs').delete().eq('id', install.id);
        return NextResponse.json({ error: 'already_used' }, { status: 409 });
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90; // 90d
    const jwt = await new SignJWT({
        tid: pair.tenant_id,
        uid: pair.user_id,
        iid: install.id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    await supa.from('audit_logs').insert({
        tenant_id: pair.tenant_id,
        actor_user_id: pair.user_id,
        actor_install_id: install.id,
        action: 'extension.pair',
        resource_type: 'extension_install',
        resource_id: install.id,
    });

    return NextResponse.json({
        session_token: jwt,
        tenant_id: pair.tenant_id,
        install_id: install.id,
        expires_at: new Date(exp * 1000).toISOString(),
    });
}
