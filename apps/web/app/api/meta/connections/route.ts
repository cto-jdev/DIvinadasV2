/**
 * GET /api/meta/connections?tenant_id=...
 * Lista conexiones Meta activas del tenant. RLS garantiza que solo
 * ve las del tenant del cual el usuario es miembro.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Query = z.object({ tenant_id: z.string().uuid() });

export async function GET(req: NextRequest) {
    const cookieStore = cookies();
    const cookieNames = cookieStore.getAll().map(c => c.name);
    const supaAuth = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                    cs.forEach(({ name, value, options }) => {
                        try { cookieStore.set({ name, value, ...options }); } catch { /* RSC */ }
                    });
                },
            },
        },
    );
    const { data: { user }, error: authErr } = await supaAuth.auth.getUser();
    if (!user) return NextResponse.json({
        error: 'unauthorized',
        debug: {
            cookieNames,
            hasSupabaseCookie: cookieNames.some(n => /^sb-.*-auth-token/.test(n)),
            authError: authErr?.message ?? null,
        },
    }, { status: 401 });

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
