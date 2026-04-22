/**
 * GET /api/web/graph/pages/list?tenant_id=...&connection_id=...
 * Lista Facebook Pages accesibles por el usuario Meta (con feedback signals).
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

const FIELDS = [
    'id', 'name', 'category', 'fan_count', 'followers_count',
    'verification_status', 'link', 'picture{url}',
    'is_published', 'is_webhooks_subscribed',
    'instagram_business_account{id,username}',
].join(',');

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

        const r = await graphGet<{ data: any[] }>(
            '/me/accounts', token, { fields: FIELDS, limit: '200' },
        );
        return NextResponse.json({ data: r.data });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[web/pages/list] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
