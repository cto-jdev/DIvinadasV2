/**
 * GET /api/tenant/me
 * Devuelve los tenants del usuario autenticado + su rol en cada uno
 * + estado de licencia + último install activo.
 * Usado por el panel para poblar el selector de tenant.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const supa = getSupabaseService();

    const { data: memberships, error } = await supa
        .from('tenant_members')
        .select(`
            role,
            joined_at,
            tenants (
                id, slug, display_name, status,
                licenses ( plan, status, trial_ends_at, current_period_ends_at, seats )
            )
        `)
        .eq('user_id', user.id)
        .neq('tenants.status', 'deleted');

    if (error) return NextResponse.json({ error: 'internal_error' }, { status: 500 });

    // flatMap drops rows where the nested tenant join returned null (deleted tenants
    // filtered by .neq above can still appear as null in the join result).
    const data = (memberships ?? []).flatMap((m) => {
        const t = m.tenants as Record<string, unknown> | null;
        if (!t) return [];
        return [{
            tenant_id:    t['id']           as string,
            slug:         t['slug']         as string,
            display_name: t['display_name'] as string,
            status:       t['status']       as string,
            role:         m.role,
            joined_at:    m.joined_at,
            license:      (t['licenses'] as unknown) ?? null,
        }];
    });

    return NextResponse.json({ data });
}
