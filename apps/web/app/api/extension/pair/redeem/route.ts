/**
 * POST /api/extension/pair/redeem
 * La extensión envía el código de 6 dígitos; el backend lo valida,
 * crea extension_install y devuelve un session_token JWT.
 *
 * Atomicidad: toda la operación (consume + insert install) ocurre
 * dentro de la RPC redeem_pair_code (SECURITY DEFINER, serialized),
 * eliminando la race condition de requests concurrentes.
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
    const rl = await rateLimit(`pair:redeem:${ip}`, 5, '1 m');
    if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, {
        status: 429,
        headers: { 'Retry-After': '60' },
    });

    const body = parseOrThrow(PairingRedeemInput, await req.json());
    const codeHash = crypto.createHash('sha256').update(body.code).digest('hex');

    // Generate JTI + token hash before calling RPC so the hash is stored
    // atomically alongside the install row.
    const jti       = crypto.randomUUID();
    const tokenHash = crypto.createHash('sha256').update(jti).digest('hex');

    const supa = getSupabaseService();

    const { data, error } = await supa.rpc('redeem_pair_code', {
        p_code_hash:          codeHash,
        p_session_token_hash: tokenHash,
        p_label:              body.label ?? undefined,
        p_user_agent:         body.user_agent ?? req.headers.get('user-agent') ?? undefined,
    });

    if (error) {
        const msg = error.message ?? '';
        if (msg.includes('already_used')) return NextResponse.json({ error: 'already_used' }, { status: 409 });
        if (msg.includes('expired'))      return NextResponse.json({ error: 'expired' },      { status: 410 });
        if (msg.includes('not_found'))    return NextResponse.json({ error: 'not_found' },    { status: 404 });
        console.error('[pair/redeem] rpc error', error);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.install_id) return NextResponse.json({ error: 'internal_error' }, { status: 500 });

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90; // 90d
    const jwt = await new SignJWT({
        tid: row.out_tenant_id,
        uid: row.out_user_id,
        iid: row.install_id,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(jti)
        .setIssuedAt()
        .setExpirationTime(exp)
        .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    await supa.from('audit_logs').insert({
        tenant_id:        row.out_tenant_id,
        actor_user_id:    row.out_user_id,
        actor_install_id: row.install_id,
        action:           'extension.pair',
        resource_type:    'extension_install',
        resource_id:      row.install_id,
    });

    return NextResponse.json({
        session_token: jwt,
        tenant_id:     row.out_tenant_id,
        install_id:    row.install_id,
        expires_at:    new Date(exp * 1000).toISOString(),
    });
}
