/**
 * GET /api/web/graph/campaigns/list
 *   ?tenant_id=...&connection_id=...&ad_account_id=act_xxx
 *   &date_preset=last_7d (optional, for insights)
 *
 * Returns campaigns with budget + last-7d insight fields folded in.
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
    ad_account_id: z.string().min(1),
    date_preset: z.string().default('last_7d'),
});

const CAMP_FIELDS = [
    'id', 'name', 'objective', 'status', 'effective_status',
    'daily_budget', 'lifetime_budget', 'budget_remaining',
    'bid_strategy', 'buying_type',
    'start_time', 'stop_time',
    'account_id',
].join(',');

type CampaignRow = {
    id: string; name: string; objective?: string;
    status: string; effective_status?: string;
    daily_budget?: string; lifetime_budget?: string; budget_remaining?: string;
    bid_strategy?: string; buying_type?: string;
    start_time?: string; stop_time?: string;
    account_id?: string;
};
type InsightRow = {
    campaign_id: string;
    spend?: string; impressions?: string; clicks?: string;
    ctr?: string; cpc?: string;
};

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams;
        const q = Query.safeParse({
            tenant_id: sp.get('tenant_id'),
            connection_id: sp.get('connection_id'),
            ad_account_id: sp.get('ad_account_id'),
            date_preset: sp.get('date_preset') ?? 'last_7d',
        });
        if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

        const gate = await authenticateWebGraph(req, {
            tenantId: q.data.tenant_id,
            connectionId: q.data.connection_id,
        });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, q.data.connection_id);

        const accountId = q.data.ad_account_id.startsWith('act_')
            ? q.data.ad_account_id : `act_${q.data.ad_account_id}`;

        const [campRes, insightRes] = await Promise.all([
            graphGet<{ data: CampaignRow[] }>(
                `/${accountId}/campaigns`, token, { fields: CAMP_FIELDS, limit: '500' },
            ),
            graphGet<{ data: InsightRow[] }>(
                `/${accountId}/insights`, token, {
                    level: 'campaign',
                    date_preset: q.data.date_preset,
                    fields: 'campaign_id,spend,impressions,clicks,ctr,cpc',
                    limit: '500',
                },
            ).catch(err => {
                console.warn('[web/campaigns] insights:', err instanceof GraphError ? err.fbMessage : err);
                return { data: [] as InsightRow[] };
            }),
        ]);

        const byCampaign = new Map<string, InsightRow>();
        for (const row of insightRes.data) byCampaign.set(row.campaign_id, row);

        const merged = campRes.data.map(c => {
            const ins = byCampaign.get(c.id);
            return {
                ...c,
                spend: ins?.spend,
                impressions: ins?.impressions,
                clicks: ins?.clicks,
                ctr: ins?.ctr,
                cpc: ins?.cpc,
            };
        });

        return NextResponse.json({ data: merged, date_preset: q.data.date_preset });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[web/campaigns] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
