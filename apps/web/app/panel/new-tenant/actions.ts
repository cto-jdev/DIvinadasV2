'use server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseService } from '@/lib/supabase';

type ActionResult = { ok: false; error: string } | { ok: true; tenant_id: string };

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,48}$/;

export async function createTenantAction(formData: FormData): Promise<ActionResult> {
    const slug         = String(formData.get('slug') ?? '').toLowerCase().trim();
    const display_name = String(formData.get('display_name') ?? '').trim();

    if (!SLUG_RE.test(slug)) return { ok: false, error: 'invalid_slug' };
    if (display_name.length < 2 || display_name.length > 80) {
        return { ok: false, error: 'invalid_display_name' };
    }

    const cookieStore = cookies();
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

    const { data: { user } } = await supaAuth.auth.getUser();
    if (!user) return { ok: false, error: 'unauthorized' };

    const svc = getSupabaseService();

    const { data: tenant, error: insErr } = await svc.from('tenants').insert({
        slug,
        display_name,
        owner_id: user.id,
    }).select('id').single();

    if (insErr || !tenant) {
        if (insErr?.message.includes('duplicate key')) return { ok: false, error: 'duplicate_slug' };
        return { ok: false, error: insErr?.message ?? 'internal_error' };
    }

    const { error: memErr } = await svc.from('tenant_members').insert({
        tenant_id: tenant.id,
        user_id: user.id,
        role: 'owner',
    });
    if (memErr) {
        await svc.from('tenants').delete().eq('id', tenant.id);
        return { ok: false, error: memErr.message };
    }

    return { ok: true, tenant_id: tenant.id };
}
