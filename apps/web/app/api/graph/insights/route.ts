/**
 * GET /api/graph/insights?connection_id=...&ad_account_id=...&level=...&date_preset=...
 * Insights de una cuenta publicitaria. Parámetros opcionales: fields, breakdowns.
 * Requiere flag: ads.module
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateExtension } from '@/lib/ext-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';

const DEFAULT_FIELDS = 'impressions,clicks,spend,reach,cpm,cpc,ctr,actions,action_values';

const Query = z.object({
    connection_id:  z.string().uuid(),
    ad_account_id:  z.string().min(1),
    level:          z.enum(['account', 'campaign', 'adset', 'ad']).default('account'),
    date_preset:    z.string().default('last_30d'),
    fields:         z.string().optional(),
    breakdowns:     z.string().optional(),
    limit:          z.string().optional(),
});

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const q = Query.safeParse({
        connection_id:  sp.get('connection_id'),
        ad_account_id:  sp.get('ad_account_id'),
        level:          sp.get('level') ?? 'account',
        date_preset:    sp.get('date_preset') ?? 'last_30d',
        fields:         sp.get('fields')     ?? undefined,
        breakdowns:     sp.get('breakdowns') ?? undefined,
        limit:          sp.get('limit')      ?? undefined,
    });
    if (!q.success) return NextResponse.json({ error: 'validation_error', issues: q.error.issues }, { status: 400 });

    const gate = await authenticateExtension(req, {
        requireFlag: 'ads.module',
        connectionId: q.data.connection_id,
    });
    if (!gate.ok) return gate.res;

    const supa = getSupabaseService();
    try {
        const token = await getTokenForConnection(supa, q.data.connection_id);

        const params: Record<string, string> = {
            level:       q.data.level,
            date_preset: q.data.date_preset,
            fields:      q.data.fields ?? DEFAULT_FIELDS,
            limit:       q.data.limit ?? '500',
        };
        if (q.data.breakdowns) params.breakdowns = q.data.breakdowns;

        const accountId = q.data.ad_account_id.startsWith('act_')
            ? q.data.ad_account_id
            : `act_${q.data.ad_account_id}`;

        const res = await graphGet<{ data: any[]; paging?: any }>(
            `/${accountId}/insights`,
            token,
            params,
        );

        await supa.from('audit_logs').insert({
            tenant_id: gate.ctx.tenant_id,
            actor_user_id: gate.ctx.user_id,
            actor_install_id: gate.ctx.install_id,
            action: 'insights.fetch',
            resource_type: 'ad_account',
            resource_id: q.data.ad_account_id,
            metadata: { level: q.data.level, date_preset: q.data.date_preset },
        });

        return NextResponse.json({ data: res.data, paging: res.paging ?? null });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
