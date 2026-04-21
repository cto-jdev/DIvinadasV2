/**
 * Middleware compartido para endpoints consumidos por la extensión Chrome.
 * Verifica:
 *   1. JWT de pareo válido (jti presente en extension_installs, no revocado).
 *   2. La conexión solicitada pertenece al tenant del JWT.
 *   3. Licencia activa del tenant.
 *   4. Feature flag activo (si se proporciona).
 *
 * Retorna un objeto `ctx` con { tenant_id, user_id, install_id, plan } o
 * una NextResponse de error ya lista para devolver.
 */
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getInstallFromJwt } from './auth';
import { getSupabaseService } from './supabase';
import { requireActiveLicense, tenantHasFlag, LicensePlan } from './license';

export type ExtContext = {
    tenant_id: string;
    user_id: string;
    install_id: string;
    plan: LicensePlan;
};

export async function authenticateExtension(
    req: NextRequest,
    opts: { requireFlag?: string; connectionId?: string } = {},
): Promise<{ ok: true; ctx: ExtContext } | { ok: false; res: NextResponse }> {
    const claim = await getInstallFromJwt(req);
    if (!claim) return {
        ok: false,
        res: NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    };

    const supa = getSupabaseService();

    // Una sola RPC resuelve install + JTI revocado (evita N+1 queries)
    const { data: ctx } = await supa.rpc('get_install_context', {
        p_install_id: claim.install_id,
        p_jti: claim.jti,
    });

    const install = Array.isArray(ctx) ? ctx[0] : ctx;

    if (!install) return {
        ok: false,
        res: NextResponse.json({ error: 'unauthorized', reason: 'install_not_found' }, { status: 401 }),
    };
    if (install.revoked) return {
        ok: false,
        res: NextResponse.json({ error: 'unauthorized', reason: 'install_revoked' }, { status: 401 }),
    };
    if (install.jti_revoked) return {
        ok: false,
        res: NextResponse.json({ error: 'unauthorized', reason: 'token_revoked' }, { status: 401 }),
    };

    // SHA-256 del JTI debe coincidir con session_token_hash registrado
    const expectedHash = crypto.createHash('sha256').update(claim.jti).digest('hex');
    if (expectedHash !== install.token_hash) {
        return {
            ok: false,
            res: NextResponse.json({ error: 'unauthorized', reason: 'token_mismatch' }, { status: 401 }),
        };
    }

    // Licencia
    const gate = await requireActiveLicense(install.tenant_id);
    if (!gate.ok) return {
        ok: false,
        res: NextResponse.json(gate.body, { status: gate.status }),
    };

    // Feature flag
    if (opts.requireFlag) {
        const ok = await tenantHasFlag(install.tenant_id, opts.requireFlag);
        if (!ok) return {
            ok: false,
            res: NextResponse.json({ error: 'forbidden', reason: 'feature_off' }, { status: 403 }),
        };
    }

    // Si se pide connectionId, verificar pertenencia al tenant
    if (opts.connectionId) {
        const { data: conn } = await supa.from('meta_connections')
            .select('id').eq('id', opts.connectionId).eq('tenant_id', install.tenant_id)
            .neq('status', 'revoked').maybeSingle();
        if (!conn) return {
            ok: false,
            res: NextResponse.json({ error: 'not_found', reason: 'connection' }, { status: 404 }),
        };
    }

    // Touch last_seen (fire-and-forget — no await para no bloquear el handler)
    supa.from('extension_installs')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', claim.install_id)
        .then(() => null)
        .catch((err) => console.error('[ext-auth] last_seen_at update failed:', err));

    return {
        ok: true,
        ctx: {
            tenant_id: install.tenant_id,
            user_id: install.user_id,
            install_id: claim.install_id,
            plan: gate.plan,
        },
    };
}
