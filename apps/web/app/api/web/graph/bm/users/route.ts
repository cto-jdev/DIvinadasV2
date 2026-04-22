/**
 * GET /api/web/graph/bm/users?tenant_id=...&connection_id=...&bm_id=...
 *
 * Returns human business_users + system_users + pending_users for a BM.
 * Requires scope `business_management`. If missing, returns empty arrays
 * with `scope_missing: true` so the UI can suggest re-auth.
 *
 * Auth: Bearer Supabase.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWebGraph } from '@/lib/web-graph-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    bm_id: z.string().regex(/^\d+$/),
});

type UserRow = {
    id: string; name?: string; email?: string; role?: string;
    pending_email?: string;
};

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams;
        const q = Query.safeParse({
            tenant_id: sp.get('tenant_id'),
            connection_id: sp.get('connection_id'),
            bm_id: sp.get('bm_id'),
        });
        if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

        const gate = await authenticateWebGraph(req, {
            tenantId: q.data.tenant_id,
            connectionId: q.data.connection_id,
        });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, q.data.connection_id);

        let scopeMissing = false;
        const handle = async <T,>(p: Promise<T>, fallback: T): Promise<T> => {
            try { return await p; }
            catch (err) {
                if (err instanceof GraphError && (err.fbCode === 200 || err.fbCode === 10 || err.status === 403)) {
                    scopeMissing = true;
                }
                console.warn('[web/bm/users]', err instanceof GraphError ? err.fbMessage : err);
                return fallback;
            }
        };

        const [business, system, pending] = await Promise.all([
            handle(
                graphGet<{ data: UserRow[] }>(
                    `/${q.data.bm_id}/business_users`, token,
                    { fields: 'id,name,email,role', limit: '200' },
                ),
                { data: [] as UserRow[] },
            ),
            handle(
                graphGet<{ data: UserRow[] }>(
                    `/${q.data.bm_id}/system_users`, token,
                    { fields: 'id,name,role', limit: '200' },
                ),
                { data: [] as UserRow[] },
            ),
            handle(
                graphGet<{ data: UserRow[] }>(
                    `/${q.data.bm_id}/pending_users`, token,
                    { fields: 'id,email,role,pending_email', limit: '200' },
                ),
                { data: [] as UserRow[] },
            ),
        ]);

        const admins = business.data.filter(u =>
            u.role && ['FINANCE_ANALYST', 'FINANCE_EDITOR', 'ADMIN'].includes(u.role.toUpperCase()),
        );

        return NextResponse.json({
            data: {
                business_users: business.data,
                system_users: system.data,
                pending_users: pending.data,
                counts: {
                    total: business.data.length + system.data.length,
                    humans: business.data.length,
                    system: system.data.length,
                    pending: pending.data.length,
                    admins: admins.length,
                },
            },
            scope_missing: scopeMissing,
            source_endpoint: '/{bm}/business_users|system_users|pending_users',
        });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[web/bm/users] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
