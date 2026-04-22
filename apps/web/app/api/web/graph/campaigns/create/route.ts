/**
 * POST /api/web/graph/campaigns/create
 * Body: { tenant_id, connection_id, ad_account_id, name, objective, status?, daily_budget_cents?, lifetime_budget_cents?, bid_strategy?, buying_type?, special_ad_categories? }
 * Creates a Meta campaign at /act_{id}/campaigns.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWebGraph } from '@/lib/web-graph-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphPost, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OBJECTIVES = [
    'OUTCOME_AWARENESS', 'OUTCOME_TRAFFIC', 'OUTCOME_ENGAGEMENT',
    'OUTCOME_LEADS', 'OUTCOME_APP_PROMOTION', 'OUTCOME_SALES',
] as const;

const STATUS = ['ACTIVE', 'PAUSED'] as const;
const BID_STRATEGIES = ['LOWEST_COST_WITHOUT_CAP', 'LOWEST_COST_WITH_BID_CAP', 'COST_CAP'] as const;
const BUYING_TYPES = ['AUCTION', 'RESERVED'] as const;

const Body = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    ad_account_id: z.string().min(1),
    name: z.string().min(1).max(200),
    objective: z.enum(OBJECTIVES),
    status: z.enum(STATUS).default('PAUSED'),
    daily_budget_cents: z.number().int().positive().optional(),
    lifetime_budget_cents: z.number().int().positive().optional(),
    bid_strategy: z.enum(BID_STRATEGIES).optional(),
    buying_type: z.enum(BUYING_TYPES).default('AUCTION'),
    special_ad_categories: z.array(z.string()).default([]),
});

export async function POST(req: NextRequest) {
    try {
        const parsed = Body.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json({ error: 'validation_error', issues: parsed.error.issues }, { status: 400 });
        }
        const b = parsed.data;

        const gate = await authenticateWebGraph(req, {
            tenantId: b.tenant_id, connectionId: b.connection_id,
        });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, b.connection_id);
        const accountId = b.ad_account_id.startsWith('act_') ? b.ad_account_id : `act_${b.ad_account_id}`;

        const payload: Record<string, string | number> = {
            name: b.name,
            objective: b.objective,
            status: b.status,
            buying_type: b.buying_type,
            special_ad_categories: JSON.stringify(b.special_ad_categories),
        };
        if (b.daily_budget_cents) payload.daily_budget = b.daily_budget_cents;
        if (b.lifetime_budget_cents) payload.lifetime_budget = b.lifetime_budget_cents;
        if (b.bid_strategy) payload.bid_strategy = b.bid_strategy;

        const r = await graphPost<{ id: string }>(`/${accountId}/campaigns`, token, payload);
        return NextResponse.json({ ok: true, id: r.id });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[campaigns/create] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
