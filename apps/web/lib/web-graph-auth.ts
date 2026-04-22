/**
 * Middleware compartido para endpoints de Graph consumidos por el panel web.
 * Verifica Bearer token de Supabase, membresía del tenant y que la conexión
 * pertenezca a ese tenant. No requiere JWT de extensión.
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveUser } from './auth';
import { getSupabaseService } from './supabase';

export type WebGraphCtx = {
    user_id: string;
    tenant_id: string;
    connection_id: string;
};

export async function authenticateWebGraph(
    req: NextRequest,
    opts: { tenantId: string; connectionId: string },
): Promise<{ ok: true; ctx: WebGraphCtx } | { ok: false; res: NextResponse }> {
    const auth = await resolveUser(req);
    if (!auth.user) {
        return {
            ok: false,
            res: NextResponse.json({ error: 'unauthorized', diag: auth.diag }, { status: 401 }),
        };
    }
    const supa = getSupabaseService();
    const { data: mem } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', opts.tenantId).eq('user_id', auth.user.id).maybeSingle();
    if (!mem) {
        return { ok: false, res: NextResponse.json({ error: 'forbidden' }, { status: 403 }) };
    }
    const { data: conn } = await supa.from('meta_connections')
        .select('id').eq('id', opts.connectionId).eq('tenant_id', opts.tenantId)
        .neq('status', 'revoked').maybeSingle();
    if (!conn) {
        return { ok: false, res: NextResponse.json({ error: 'not_found', reason: 'connection' }, { status: 404 }) };
    }
    return {
        ok: true,
        ctx: { user_id: auth.user.id, tenant_id: opts.tenantId, connection_id: opts.connectionId },
    };
}
