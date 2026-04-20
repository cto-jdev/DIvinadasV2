/**
 * GET /api/graph/bm/list?connection_id=...
 * Proxy al Graph API: lista Business Managers owned/client del usuario Meta.
 * Invocado por la extensión Chrome con Bearer <session_token>.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateExtension } from '@/lib/ext-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';

const Query = z.object({ connection_id: z.string().uuid() });

type BmEdge = { id: string; name: string; verification_status?: string };

export async function GET(req: NextRequest) {
    const q = Query.safeParse({ connection_id: req.nextUrl.searchParams.get('connection_id') });
    if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const gate = await authenticateExtension(req, {
        requireFlag: 'bm.module',
        connectionId: q.data.connection_id,
    });
    if (!gate.ok) return gate.res;

    const supa = getSupabaseService();
    try {
        const token = await getTokenForConnection(supa, q.data.connection_id);
        const owned = await graphGet<{ data: BmEdge[] }>(
            '/me/businesses',
            token,
            { fields: 'id,name,verification_status', limit: '200' },
        );
        const client = await graphGet<{ data: BmEdge[] }>(
            '/me/client_businesses',
            token,
            { fields: 'id,name,verification_status', limit: '200' },
        ).catch(() => ({ data: [] }));

        const merged = [
            ...owned.data.map(b => ({ ...b, role: 'owner' })),
            ...client.data.map(b => ({ ...b, role: 'client' })),
        ];

        await supa.from('audit_logs').insert({
            tenant_id: gate.ctx.tenant_id,
            actor_user_id: gate.ctx.user_id,
            actor_install_id: gate.ctx.install_id,
            action: 'bm.list',
            resource_type: 'meta_connection',
            resource_id: q.data.connection_id,
            metadata: { owned: owned.data.length, client: client.data.length },
        });

        return NextResponse.json({ data: merged });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
