/**
 * POST /api/web/graph/campaigns/update
 * Body: { tenant_id, connection_id, campaign_id, patch: { name?, status?, daily_budget_cents?, lifetime_budget_cents?, bid_strategy? } }
 * Applies field-level updates to an existing Meta campaign.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWebGraph } from '@/lib/web-graph-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphPost, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    campaign_id: z.string().regex(/^\d+$/),
    patch: z.object({
        name: z.string().min(1).max(200).optional(),
        status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
        daily_budget_cents: z.number().int().positive().nullable().optional(),
        lifetime_budget_cents: z.number().int().positive().nullable().optional(),
        bid_strategy: z.enum(['LOWEST_COST_WITHOUT_CAP', 'LOWEST_COST_WITH_BID_CAP', 'COST_CAP']).optional(),
    }).refine(p => Object.keys(p).length > 0, { message: 'patch_empty' }),
});

export async function POST(req: NextRequest) {
    try {
        const parsed = Body.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json({ error: 'validation_error', issues: parsed.error.issues }, { status: 400 });
        }
        const { tenant_id, connection_id, campaign_id, patch } = parsed.data;

        const gate = await authenticateWebGraph(req, { tenantId: tenant_id, connectionId: connection_id });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, connection_id);

        const payload: Record<string, string | number> = {};
        if (patch.name !== undefined) payload.name = patch.name;
        if (patch.status !== undefined) payload.status = patch.status;
        if (patch.daily_budget_cents !== undefined && patch.daily_budget_cents !== null) payload.daily_budget = patch.daily_budget_cents;
        if (patch.lifetime_budget_cents !== undefined && patch.lifetime_budget_cents !== null) payload.lifetime_budget = patch.lifetime_budget_cents;
        if (patch.bid_strategy !== undefined) payload.bid_strategy = patch.bid_strategy;

        await graphPost<{ success: boolean }>(`/${campaign_id}`, token, payload);
        return NextResponse.json({ ok: true });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[campaigns/update] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
