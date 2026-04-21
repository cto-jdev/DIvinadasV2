/**
 * GET /api/graph/adaccounts/list?connection_id=...&bm_id=...
 * Si `bm_id` viene: lista las ad accounts de ese BM (owned + client).
 * Si no: lista /me/adaccounts del usuario.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateExtension } from '@/lib/ext-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';

const Query = z.object({
    connection_id: z.string().uuid(),
    bm_id: z.string().optional(),
});

const FIELDS = 'id,name,account_status,currency,business,amount_spent,balance,disable_reason';

export async function GET(req: NextRequest) {
    const q = Query.safeParse({
        connection_id: req.nextUrl.searchParams.get('connection_id'),
        bm_id:         req.nextUrl.searchParams.get('bm_id') ?? undefined,
    });
    if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const gate = await authenticateExtension(req, {
        requireFlag: 'ads.module',
        connectionId: q.data.connection_id,
    });
    if (!gate.ok) return gate.res;

    const supa = getSupabaseService();
    try {
        const token = await getTokenForConnection(supa, q.data.connection_id);

        let data: any[] = [];
        if (q.data.bm_id) {
            // owned_ad_accounts must succeed — if it fails the outer catch returns a 502
            const owned = await graphGet<{ data: any[] }>(
                `/${q.data.bm_id}/owned_ad_accounts`, token, { fields: FIELDS, limit: '500' },
            );
            // client_ad_accounts is supplemental; not all BMs have client accounts
            const client = await graphGet<{ data: any[] }>(
                `/${q.data.bm_id}/client_ad_accounts`, token, { fields: FIELDS, limit: '500' },
            ).catch((err) => {
                console.warn('[adaccounts] client_ad_accounts error:', err instanceof GraphError ? err.fbMessage : err);
                return { data: [] as any[] };
            });
            data = [
                ...owned.data.map(a  => ({ ...a, source: 'owned' })),
                ...client.data.map(a => ({ ...a, source: 'client' })),
            ];
        } else {
            const r = await graphGet<{ data: any[] }>('/me/adaccounts', token, { fields: FIELDS, limit: '500' });
            data = r.data;
        }

        await supa.from('audit_logs').insert({
            tenant_id: gate.ctx.tenant_id,
            actor_user_id: gate.ctx.user_id,
            actor_install_id: gate.ctx.install_id,
            action: 'ads.list',
            resource_type: 'meta_connection',
            resource_id: q.data.connection_id,
            metadata: { bm_id: q.data.bm_id ?? null, count: data.length },
        });

        return NextResponse.json({ data });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
