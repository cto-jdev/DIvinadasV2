/**
 * POST /api/tenant/create  { slug, display_name }
 * Creates a tenant and adds the caller as owner.
 * Auth: reads the user from cookies; writes use the service role so the
 * tenant_members bootstrap isn't blocked by the admin-only RLS policy.
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

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = req.cookies;
    const supaAuth = createServerClient(url, key, {
        cookies: {
            getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
            setAll: () => { /* read-only: don't need to propagate here */ },
        },
    });

    const { data: { user }, error: authErr } = await supaAuth.auth.getUser();
    if (authErr || !user) {
        return NextResponse.json({ error: 'unauthorized', detail: authErr?.message }, { status: 401 });
    }

    const svc = getSupabaseService();

    const { data: existing } = await svc.from('tenants')
        .select('id').eq('slug', parsed.data.slug).maybeSingle();
    if (existing) {
        return NextResponse.json({ error: 'duplicate_slug' }, { status: 409 });
    }

    const { data: tenant, error: insErr } = await svc.from('tenants').insert({
        slug: parsed.data.slug.toLowerCase(),
        display_name: parsed.data.display_name.trim(),
        owner_id: user.id,
    }).select('id').single();

    if (insErr || !tenant) {
        if (insErr?.message.includes('duplicate key')) {
            return NextResponse.json({ error: 'duplicate_slug' }, { status: 409 });
        }
        return NextResponse.json({ error: 'internal_error', message: insErr?.message }, { status: 500 });
    }

    const { error: memErr } = await svc.from('tenant_members').insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'owner',
    });
    if (memErr) {
        // Roll back the tenant so we don't leave orphans.
        await svc.from('tenants').delete().eq('id', tenant.id);
        return NextResponse.json({ error: 'internal_error', message: memErr.message }, { status: 500 });
    }

    return NextResponse.json({ tenant_id: tenant.id });
}
