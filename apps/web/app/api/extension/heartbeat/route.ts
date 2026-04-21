/**
 * POST /api/extension/heartbeat
 * Keep-alive periódico de la extensión (cada ~30 min).
 * Actualiza last_seen_at y devuelve el estado del tenant/licencia
 * para que la extensión sepa si puede seguir operando.
 *
 * La extensión llama esto en el service worker con chrome.alarms.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getInstallFromJwt } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import { requireActiveLicense } from '@/lib/license';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const claim = await getInstallFromJwt(req);
    if (!claim) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const supa = getSupabaseService();

    // Verificar install no revocado
    const { data: install } = await supa.from('extension_installs')
        .select('id, revoked_at, tenant_id')
        .eq('id', claim.install_id).maybeSingle();

    if (!install || install.revoked_at) {
        return NextResponse.json({ active: false, reason: 'install_revoked' }, { status: 200 });
    }

    // Estado licencia
    const gate = await requireActiveLicense(install.tenant_id);

    // Verificar JTI no revocado
    const { data: jtiRevoked } = await supa.rpc('is_jti_revoked', { p_jti: claim.jti });

    if (jtiRevoked) {
        return NextResponse.json({ active: false, reason: 'token_revoked' }, { status: 200 });
    }

    // Actualizar last_seen (fire-and-forget)
    supa.from('extension_installs')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', install.id)
        .then(() => null)
        .catch((err) => console.error('[heartbeat] last_seen_at update failed:', err));

    return NextResponse.json({
        active:    gate.ok,
        plan:      gate.ok ? gate.plan : null,
        reason:    gate.ok ? null : gate.body.reason,
        tenant_id: install.tenant_id,
    });
}
