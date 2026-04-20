/**
 * POST /api/extension/pair/create
 * Genera un código de pareo de 6 dígitos (TTL 5 min, single-use) para
 * enlazar una instalación Chrome MV3 con la sesión del panel.
 *
 * Contexto: MIGRATION_V2.md §14.
 *
 * Seguridad:
 *  - Usuario autenticado + miembro del tenant.
 *  - Solo se almacena el sha256 del código; el valor plano solo se
 *    devuelve UNA vez al creador.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { PairingCreateInput, parseOrThrow } from '@divinads/types';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import { rateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

function sixDigits(): string {
    // Rechazo para evitar sesgo módulo: 1_000_000 divide 2^32 no-uniforme.
    // Usamos crypto.randomInt que ya implementa rejection sampling.
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const rl = await rateLimit(`pair:create:${user.id}`, 10, '1 h');
    if (!rl.success) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

    const body = parseOrThrow(PairingCreateInput, await req.json());
    const supa = getSupabaseService();

    const { data: mem } = await supa
        .from('tenant_members').select('role')
        .eq('tenant_id', body.tenant_id).eq('user_id', user.id).maybeSingle();
    if (!mem) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const code = sixDigits();
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const { error } = await supa.from('device_pairings').insert({
        tenant_id: body.tenant_id,
        user_id: user.id,
        code_hash: codeHash,
        expires_at: expiresAt.toISOString(),
    });
    if (error) return NextResponse.json({ error: 'internal_error', message: error.message }, { status: 500 });

    return NextResponse.json({ code, expires_at: expiresAt.toISOString() });
}
