/**
 * GET /api/graph/pixels/list?connection_id=...&bm_id=...
 * Lista los pixels de un BM (adspixels del BM) o del usuario (/me/adspixels).
 * Requiere flag: pixel.module
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateExtension } from '@/lib/ext-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';

const FIELDS = 'id,name,code,creation_time,last_fired_time,is_unavailable';
const Query  = z.object({
    connection_id: z.string().uuid(),
    bm_id: z.string().optional(),
});

export async function GET(req: NextRequest) {
    const q = Query.safeParse({
        connection_id: req.nextUrl.searchParams.get('connection_id'),
        bm_id: req.nextUrl.searchParams.get('bm_id') ?? undefined,
    });
    if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const gate = await authenticateExtension(req, {
        requireFlag: 'pixel.module',
        connectionId: q.data.connection_id,
    });
    if (!gate.ok) return gate.res;

    const supa = getSupabaseService();
    try {
        const token = await getTokenForConnection(supa, q.data.connection_id);

        let data: any[] = [];
        if (q.data.bm_id) {
            const r = await graphGet<{ data: any[] }>(
                `/${q.data.bm_id}/adspixels`,
                token,
                { fields: FIELDS, limit: '200' },
            ).catch(() => ({ data: [] }));
            data = r.data;
        } else {
            const r = await graphGet<{ data: any[] }>(
                '/me/adspixels',
                token,
                { fields: FIELDS, limit: '200' },
            ).catch(() => ({ data: [] }));
            data = r.data;
        }

        await supa.from('audit_logs').insert({
            tenant_id: gate.ctx.tenant_id,
            actor_user_id: gate.ctx.user_id,
            actor_install_id: gate.ctx.install_id,
            action: 'pixels.list',
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
