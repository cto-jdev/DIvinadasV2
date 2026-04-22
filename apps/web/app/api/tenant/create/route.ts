/**
 * POST /api/tenant/create  { slug, display_name }
 * Creates a tenant and adds the caller as owner (via SECURITY DEFINER RPC).
 * Uses cookie-based Supabase client so auth.uid() inside the RPC resolves,
 * and propagates refreshed auth cookies back on the response so the next
 * request doesn't see a stale/invalidated session.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const Body = z.object({
    slug: z.string().regex(/^[a-z0-9][a-z0-9-]{2,48}$/),
    display_name: z.string().min(2).max(80),
});

export async function POST(req: NextRequest) {
    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
        return NextResponse.json({ error: 'validation_error', detail: parsed.error.flatten() }, { status: 400 });
    }

    const res = NextResponse.next();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = req.cookies;
    const supa = createServerClient(url, key, {
        cookies: {
            getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
            setAll: (cs) => {
                cs.forEach(({ name, value, options }) => {
                    res.cookies.set({ name, value, ...options });
                });
            },
        },
    });

    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const svc = getSupabaseService();
    const { data: existing } = await svc.from('tenants')
        .select('id').eq('slug', parsed.data.slug).maybeSingle();
    if (existing) return NextResponse.json({ error: 'duplicate_slug' }, { status: 409 });

    const { data, error } = await supa.rpc('create_tenant', {
        p_slug: parsed.data.slug,
        p_display_name: parsed.data.display_name,
    });

    if (error) {
        const key = (error.message.match(/invalid_slug|invalid_display_name|not_authenticated/) || [])[0];
        if (key) return NextResponse.json({ error: key }, { status: 400 });
        if (error.message.includes('duplicate key')) {
            return NextResponse.json({ error: 'duplicate_slug' }, { status: 409 });
        }
        return NextResponse.json({ error: 'internal_error', message: error.message }, { status: 500 });
    }

    const out = NextResponse.json({ tenant_id: data });
    res.cookies.getAll().forEach(c => out.cookies.set(c));
    return out;
}
