/**
 * GET /api/graph/pages/list?connection_id=...
 * Lista las Páginas de Facebook del usuario Meta conectado.
 * Requiere flag: pages.module
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateExtension } from '@/lib/ext-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';

const FIELDS = 'id,name,category,fan_count,followers_count,verification_status,tasks,access_token';
const Query  = z.object({ connection_id: z.string().uuid() });

export async function GET(req: NextRequest) {
    const q = Query.safeParse({ connection_id: req.nextUrl.searchParams.get('connection_id') });
    if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const gate = await authenticateExtension(req, {
        requireFlag: 'pages.module',
        connectionId: q.data.connection_id,
    });
    if (!gate.ok) return gate.res;

    const supa = getSupabaseService();
    try {
        const token = await getTokenForConnection(supa, q.data.connection_id);
        const res   = await graphGet<{ data: any[] }>(
            '/me/accounts',
            token,
            { fields: FIELDS, limit: '200' },
        );
        await supa.from('audit_logs').insert({
            tenant_id: gate.ctx.tenant_id,
            actor_user_id: gate.ctx.user_id,
            actor_install_id: gate.ctx.install_id,
            action: 'pages.list',
            resource_type: 'meta_connection',
            resource_id: q.data.connection_id,
            metadata: { count: res.data.length },
        });
        // No exponer page access_token al cliente — solo metadata
        const sanitized = res.data.map(({ access_token: _at, ...p }) => p);
        return NextResponse.json({ data: sanitized });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
