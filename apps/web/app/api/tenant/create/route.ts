/**
 * POST /api/tenant/create
 * Body: { slug: string, display_name: string }
 * Auth: Bearer token.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const SLUG_RE = /^[a-z0-9][a-z0-9-]{2,48}$/;

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const slug = String(body.slug ?? '').toLowerCase().trim();
        const display_name = String(body.display_name ?? '').trim();

        if (!SLUG_RE.test(slug)) return NextResponse.json({ error: 'invalid_slug' }, { status: 400 });
        if (display_name.length < 2 || display_name.length > 80) {
            return NextResponse.json({ error: 'invalid_display_name' }, { status: 400 });
        }

        const svc = getSupabaseService();

        const { data: tenant, error: insErr } = await svc.from('tenants').insert({
            slug, display_name, owner_id: user.id,
        }).select('id').single();

        if (insErr || !tenant) {
            if (insErr?.message?.includes('duplicate key')) {
                return NextResponse.json({ error: 'duplicate_slug' }, { status: 409 });
            }
            return NextResponse.json({ error: 'internal_error', message: insErr?.message }, { status: 500 });
        }

        const { error: memErr } = await svc.from('tenant_members').insert({
            tenant_id: tenant.id, user_id: user.id, role: 'owner',
        });
        if (memErr) {
            await svc.from('tenants').delete().eq('id', tenant.id);
            return NextResponse.json({ error: 'internal_error', message: memErr.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, tenant_id: tenant.id });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'unknown';
        console.error('[tenant/create] uncaught:', e);
        return NextResponse.json({ error: 'internal_error', message }, { status: 500 });
    }
}
