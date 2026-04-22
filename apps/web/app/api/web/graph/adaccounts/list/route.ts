/**
 * GET /api/web/graph/adaccounts/list?tenant_id=...&connection_id=...&bm_id=...
 * Si `bm_id` viene: owned+client del BM. Si no: /me/adaccounts.
 * Auth: Bearer access_token Supabase.
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
    bm_id: z.string().regex(/^\d+$/, 'bm_id must be numeric').optional(),
});

const FIELDS = 'id,name,account_status,currency,business,amount_spent,balance,disable_reason,timezone_name';

export async function GET(req: NextRequest) {
    try {
        const q = Query.safeParse({
            tenant_id: req.nextUrl.searchParams.get('tenant_id'),
            connection_id: req.nextUrl.searchParams.get('connection_id'),
            bm_id: req.nextUrl.searchParams.get('bm_id') ?? undefined,
        });
        if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

        const gate = await authenticateWebGraph(req, {
            tenantId: q.data.tenant_id,
            connectionId: q.data.connection_id,
        });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, q.data.connection_id);

        let data: any[] = [];
        if (q.data.bm_id) {
            const owned = await graphGet<{ data: any[] }>(
                `/${q.data.bm_id}/owned_ad_accounts`, token, { fields: FIELDS, limit: '500' },
            );
            const client = await graphGet<{ data: any[] }>(
                `/${q.data.bm_id}/client_ad_accounts`, token, { fields: FIELDS, limit: '500' },
            ).catch((err) => {
                console.warn('[web/adaccounts] client:', err instanceof GraphError ? err.fbMessage : err);
                return { data: [] as any[] };
            });
            data = [
                ...owned.data.map(a => ({ ...a, source: 'owned' })),
                ...client.data.map(a => ({ ...a, source: 'client' })),
            ];
        } else {
            const r = await graphGet<{ data: any[] }>(
                '/me/adaccounts', token, { fields: FIELDS, limit: '500' },
            );
            data = r.data;
        }
        return NextResponse.json({ data });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[web/adaccounts] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
