/**
 * GET /api/web/graph/insights?tenant_id=...&connection_id=...&ad_account_id=...
 *   &level=account|campaign|adset|ad  &date_preset=last_7d|last_30d|...
 * Auth: Bearer access_token Supabase.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWebGraph } from '@/lib/web-graph-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_FIELDS = 'impressions,clicks,spend,reach,cpm,cpc,ctr';

const Query = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    ad_account_id: z.string().min(1),
    level: z.enum(['account', 'campaign', 'adset', 'ad']).default('account'),
    date_preset: z.string().default('last_7d'),
    fields: z.string().optional(),
    limit: z.string().optional(),
});

export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams;
        const q = Query.safeParse({
            tenant_id: sp.get('tenant_id'),
            connection_id: sp.get('connection_id'),
            ad_account_id: sp.get('ad_account_id'),
            level: sp.get('level') ?? 'account',
            date_preset: sp.get('date_preset') ?? 'last_7d',
            fields: sp.get('fields') ?? undefined,
            limit: sp.get('limit') ?? undefined,
        });
        if (!q.success) return NextResponse.json({ error: 'validation_error', issues: q.error.issues }, { status: 400 });

        const gate = await authenticateWebGraph(req, {
            tenantId: q.data.tenant_id,
            connectionId: q.data.connection_id,
        });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const token = await getTokenForConnection(supa, q.data.connection_id);

        const params: Record<string, string> = {
            level: q.data.level,
            date_preset: q.data.date_preset,
            fields: q.data.fields ?? DEFAULT_FIELDS,
            limit: q.data.limit ?? '100',
        };
        const accountId = q.data.ad_account_id.startsWith('act_')
            ? q.data.ad_account_id : `act_${q.data.ad_account_id}`;

        const res = await graphGet<{ data: any[]; paging?: any }>(
            `/${accountId}/insights`, token, params,
        );
        return NextResponse.json({ data: res.data, paging: res.paging ?? null });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[web/insights] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
