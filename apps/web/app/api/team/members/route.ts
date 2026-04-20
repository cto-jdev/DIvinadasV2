/**
 * GET  /api/team/members?tenant_id=...  — lista miembros del tenant
 * DELETE /api/team/members              — elimina un miembro (solo admin)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const DeleteBody = z.object({
    tenant_id: z.string().uuid(),
    user_id:   z.string().uuid(),
});

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const tenantId = req.nextUrl.searchParams.get('tenant_id');
    if (!tenantId) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const supa = getSupabaseService();
    const { data: mem } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', tenantId).eq('user_id', user.id).maybeSingle();
    if (!mem) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    const { data, error } = await supa.from('tenant_members')
        .select('user_id, role, joined_at, profiles(email, full_name)')
        .eq('tenant_id', tenantId)
        .order('joined_at');

    if (error) return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = DeleteBody.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const { tenant_id, user_id } = parsed.data;
    const supa = getSupabaseService();

    const { data: actor } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', tenant_id).eq('user_id', user.id).maybeSingle();
    if (!actor || !['owner', 'admin'].includes(actor.role)) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // No se puede remover al owner
    const { data: target } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', tenant_id).eq('user_id', user_id).maybeSingle();
    if (target?.role === 'owner') {
        return NextResponse.json({ error: 'forbidden', reason: 'cannot_remove_owner' }, { status: 403 });
    }

    const { error } = await supa.from('tenant_members')
        .delete().eq('tenant_id', tenant_id).eq('user_id', user_id);
    if (error) return NextResponse.json({ error: 'internal_error' }, { status: 500 });

    await supa.from('audit_logs').insert({
        tenant_id, actor_user_id: user.id, action: 'team.remove',
        resource_type: 'tenant_member', resource_id: user_id,
    });
    return NextResponse.json({ ok: true });
}
