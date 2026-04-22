/**
 * POST /api/web/graph/campaigns/delete
 * Body: { tenant_id, connection_id, campaign_id, hard?: boolean }
 * Soft delete sets status=DELETED (reversible). hard=true uses DELETE verb.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWebGraph } from '@/lib/web-graph-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphPost, graphDelete, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    campaign_id: z.string().regex(/^\d+$/),
    hard: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
    try {
        const parsed = Body.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json({ error: 'validation_error', issues: parsed.error.issues }, { status: 400 });
        }
        const { tenant_id, connection_id, campaign_id, hard } = parsed.data;

        const gate = await authenticateWebGraph(req, { tenantId: tenant_id, connectionId: connection_id });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, connection_id);

        if (hard) {
            await graphDelete(`/${campaign_id}`, token);
        } else {
            await graphPost(`/${campaign_id}`, token, { status: 'DELETED' });
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[campaigns/delete] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
