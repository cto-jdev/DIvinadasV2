/**
 * GET /api/meta/connections?tenant_id=...
 * Auth: Bearer access_token (Authorization header). RLS garantiza
 * que solo ve conexiones del tenant del cual el usuario es miembro.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseService } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({ tenant_id: z.string().uuid() });

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const q = Query.safeParse({ tenant_id: req.nextUrl.searchParams.get('tenant_id') });
    if (!q.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const supa = getSupabaseService();
    const { data: mem } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', q.data.tenant_id).eq('user_id', user.id).maybeSingle();
    if (!mem) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data, error } = await supa.from('meta_connections')
        .select('id, meta_user_id, display_name, email, picture_url, status, connected_at, last_refreshed_at')
        .eq('tenant_id', q.data.tenant_id)
        .neq('status', 'revoked')
        .order('connected_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    return NextResponse.json({ data });
}
