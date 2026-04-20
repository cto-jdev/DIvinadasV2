/**
 * PATCH /api/team/role — cambia el rol de un miembro.
 * Solo owner/admin pueden cambiar roles. No se puede degradar al owner.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const Body = z.object({
    tenant_id: z.string().uuid(),
    user_id:   z.string().uuid(),
    role:      z.enum(['admin', 'operator', 'viewer']),
});

export async function PATCH(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const { tenant_id, user_id, role } = parsed.data;
    const supa = getSupabaseService();

    const { data: actor } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', tenant_id).eq('user_id', user.id).maybeSingle();
    if (!actor || !['owner', 'admin'].includes(actor.role)) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { data: target } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', tenant_id).eq('user_id', user_id).maybeSingle();
    if (!target) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (target.role === 'owner') {
        return NextResponse.json({ error: 'forbidden', reason: 'cannot_change_owner_role' }, { status: 403 });
    }

    const { error } = await supa.from('tenant_members')
        .update({ role }).eq('tenant_id', tenant_id).eq('user_id', user_id);
    if (error) return NextResponse.json({ error: 'internal_error' }, { status: 500 });

    await supa.from('audit_logs').insert({
        tenant_id, actor_user_id: user.id, action: 'team.role_change',
        resource_type: 'tenant_member', resource_id: user_id,
        metadata: { new_role: role, old_role: target.role },
    });
    return NextResponse.json({ ok: true });
}
