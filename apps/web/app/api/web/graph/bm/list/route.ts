/**
 * GET /api/web/graph/bm/list?tenant_id=...&connection_id=...
 * Lista Business Managers (owned + client) para el panel web.
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
});

type BmEdge = { id: string; name: string; verification_status?: string };

export async function GET(req: NextRequest) {
    try {
        const q = Query.safeParse({
            tenant_id: req.nextUrl.searchParams.get('tenant_id'),
            connection_id: req.nextUrl.searchParams.get('connection_id'),
        });
        if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

        const gate = await authenticateWebGraph(req, {
            tenantId: q.data.tenant_id,
            connectionId: q.data.connection_id,
        });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, q.data.connection_id);

        const owned = await graphGet<{ data: BmEdge[] }>(
            '/me/businesses', token, { fields: 'id,name,verification_status', limit: '200' },
        );
        const client = await graphGet<{ data: BmEdge[] }>(
            '/me/client_businesses', token, { fields: 'id,name,verification_status', limit: '200' },
        ).catch((err) => {
            console.warn('[web/bm/list] client_businesses:', err instanceof GraphError ? err.fbMessage : err);
            return { data: [] as BmEdge[] };
        });

        const merged = [
            ...owned.data.map(b => ({ ...b, role: 'owner' as const })),
            ...client.data.map(b => ({ ...b, role: 'client' as const })),
        ];
        return NextResponse.json({ data: merged });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[web/bm/list] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
