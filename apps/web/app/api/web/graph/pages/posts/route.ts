/**
 * GET  /api/web/graph/pages/posts?tenant_id=...&connection_id=...&page_id=...
 *      Returns recent published posts for a Page.
 * POST /api/web/graph/pages/posts
 *      Body: { tenant_id, connection_id, page_id, message, link? }
 *      Publishes a new text/link post on the Page.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateWebGraph } from '@/lib/web-graph-auth';
import { getSupabaseService } from '@/lib/supabase';
import { graphGet, graphPost, getTokenForConnection, GraphError } from '@/lib/graph';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const POST_FIELDS = [
    'id', 'message', 'story', 'created_time', 'updated_time',
    'permalink_url', 'status_type', 'is_published',
    'full_picture',
    'reactions.summary(total_count).limit(0)',
    'comments.summary(total_count).limit(0)',
    'shares',
].join(',');

const GetQ = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    page_id: z.string().min(1),
    limit: z.coerce.number().int().min(1).max(100).default(25),
});

async function getPageToken(token: string, pageId: string): Promise<string> {
    const r = await graphGet<{ access_token?: string }>(`/${pageId}`, token, { fields: 'access_token' });
    if (!r.access_token) throw new GraphError(403, null, 'page_token_unavailable');
    return r.access_token;
}

export async function GET(req: NextRequest) {
    try {
        const q = GetQ.safeParse({
            tenant_id: req.nextUrl.searchParams.get('tenant_id'),
            connection_id: req.nextUrl.searchParams.get('connection_id'),
            page_id: req.nextUrl.searchParams.get('page_id'),
            limit: req.nextUrl.searchParams.get('limit') ?? 25,
        });
        if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

        const gate = await authenticateWebGraph(req, { tenantId: q.data.tenant_id, connectionId: q.data.connection_id });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const userToken = await getTokenForConnection(supa, q.data.connection_id);
        const pageToken = await getPageToken(userToken, q.data.page_id);

        const r = await graphGet<{ data: any[] }>(`/${q.data.page_id}/posts`, pageToken, {
            fields: POST_FIELDS, limit: String(q.data.limit),
        });
        return NextResponse.json({ data: r.data });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[pages/posts GET] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}

const PostB = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    page_id: z.string().min(1),
    message: z.string().min(1).max(5000),
    link: z.string().url().optional(),
    published: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
    try {
        const parsed = PostB.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json({ error: 'validation_error', issues: parsed.error.issues }, { status: 400 });
        }
        const b = parsed.data;
        const gate = await authenticateWebGraph(req, { tenantId: b.tenant_id, connectionId: b.connection_id });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const userToken = await getTokenForConnection(supa, b.connection_id);
        const pageToken = await getPageToken(userToken, b.page_id);

        const payload: Record<string, string | boolean> = {
            message: b.message,
            published: b.published,
        };
        if (b.link) payload.link = b.link;
        const r = await graphPost<{ id: string }>(`/${b.page_id}/feed`, pageToken, payload);
        return NextResponse.json({ ok: true, id: r.id });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[pages/posts POST] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}

const DeleteB = z.object({
    tenant_id: z.string().uuid(),
    connection_id: z.string().uuid(),
    page_id: z.string().min(1),
    post_id: z.string().min(1),
});

export async function DELETE(req: NextRequest) {
    try {
        const parsed = DeleteB.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json({ error: 'validation_error', issues: parsed.error.issues }, { status: 400 });
        }
        const b = parsed.data;
        const gate = await authenticateWebGraph(req, { tenantId: b.tenant_id, connectionId: b.connection_id });
        if (!gate.ok) return gate.res;

        const supa = getSupabaseService();
        const userToken = await getTokenForConnection(supa, b.connection_id);
        const pageToken = await getPageToken(userToken, b.page_id);

        const { graphDelete } = await import('@/lib/graph');
        await graphDelete(`/${b.post_id}`, pageToken);
        return NextResponse.json({ ok: true });
    } catch (e) {
        if (e instanceof GraphError) {
            return NextResponse.json({ error: 'meta_error', code: e.fbCode, message: e.fbMessage }, { status: 502 });
        }
        console.error('[pages/posts DELETE] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
