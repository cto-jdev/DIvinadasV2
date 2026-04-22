/**
 * GET /api/web/graph/adsets/list
 *   ?tenant_id=...&connection_id=...&ad_account_id=act_xxx
 *   &date_preset=last_7d (optional)
 *
 * Returns ad sets with budget + insights (spend/impressions/clicks/ctr/cpc).
 * Used by ADS module to power ad-set-level pacing & waste analytics.
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

const ADSET_FIELDS = [
    'id', 'name', 'campaign_id', 'status', 'effective_status',
    'daily_budget', 'lifetime_budget', 'budget_remaining',
    'bid_strategy', 'billing_event', 'optimization_goal',
    'start_time', 'end_time',
    'targeting',
].join(',');

type AdSetRow = {
    id: string; name: string; campaign_id: string;
    status: string; effective_status?: string;
    daily_budget?: string; lifetime_budget?: string; budget_remaining?: string;
    bid_strategy?: string; billing_event?: string; optimization_goal?: string;
    start_time?: string; end_time?: string;
};
type InsightRow = {
    adset_id: string;
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

        const [adsetRes, insightRes] = await Promise.all([
            graphGet<{ data: AdSetRow[] }>(
                `/${accountId}/adsets`, token, { fields: ADSET_FIELDS, limit: '500' },
            ),
            graphGet<{ data: InsightRow[] }>(
                `/${accountId}/insights`, token, {
                    level: 'adset',
                    date_preset: q.data.date_preset,
                    fields: 'adset_id,spend,impressions,clicks,ctr,cpc',
                    limit: '500',
                },
            ).catch(err => {
                console.warn('[web/adsets] insights:', err instanceof GraphError ? err.fbMessage : err);
                return { data: [] as InsightRow[] };
            }),
        ]);

        const byAdset = new Map<string, InsightRow>();
        for (const row of insightRes.data) byAdset.set(row.adset_id, row);

        const merged = adsetRes.data.map(a => {
            const ins = byAdset.get(a.id);
            return {
                ...a,
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
        console.error('[web/adsets] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
