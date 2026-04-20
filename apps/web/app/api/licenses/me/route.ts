/**
 * GET /api/licenses/me?tenant_id=...
 * Estado completo de la licencia del tenant: plan, status, módulos activos,
 * días restantes. Usado por el panel y la extensión para feature-gating en UI.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { getInstallFromJwt } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const PLAN_MODULES: Record<string, string[]> = {
    trial:      ['bm.module', 'ads.module'],
    starter:    ['bm.module', 'ads.module', 'pages.module', 'pixel.module'],
    pro:        ['bm.module', 'ads.module', 'pages.module', 'pixel.module', 'advantage.module', 'attribution.module'],
    enterprise: ['*'],
};

export async function GET(req: NextRequest) {
    const tenantIdParam = req.nextUrl.searchParams.get('tenant_id');

    // Soporte doble: panel (cookie Supabase) o extensión (Bearer JWT)
    let tenantId: string | null = tenantIdParam;

    const user = await getUserFromRequest(req);
    const install = !user ? await getInstallFromJwt(req) : null;

    if (!user && !install) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Si viene de la extensión, usar el tenant del JWT
    if (install && !tenantId) tenantId = install.tenant_id;
    if (!tenantId) return NextResponse.json({ error: 'validation_error', message: 'tenant_id required' }, { status: 400 });

    const supa = getSupabaseService();

    // Verificar membresía (si es usuario de panel)
    if (user) {
        const { data: mem } = await supa.from('tenant_members')
            .select('role').eq('tenant_id', tenantId).eq('user_id', user.id).maybeSingle();
        if (!mem) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    const { data: lic } = await supa.from('licenses')
        .select('plan, status, seats, trial_ends_at, current_period_ends_at, hotmart_subscription_code')
        .eq('tenant_id', tenantId).maybeSingle();

    if (!lic) return NextResponse.json({ error: 'not_found', reason: 'no_license' }, { status: 404 });

    const ends = lic.plan === 'trial' ? lic.trial_ends_at : lic.current_period_ends_at;
    const daysRemaining = ends
        ? Math.max(0, Math.ceil((new Date(ends).getTime() - Date.now()) / 86400000))
        : null;

    const modules = PLAN_MODULES[lic.plan] ?? [];
    const activeModules = modules.includes('*')
        ? ['bm.module', 'ads.module', 'pages.module', 'pixel.module', 'advantage.module', 'attribution.module']
        : modules;

    return NextResponse.json({
        tenant_id:          tenantId,
        plan:               lic.plan,
        status:             lic.status,
        seats:              lic.seats,
        ends_at:            ends,
        days_remaining:     daysRemaining,
        modules:            activeModules,
        has_subscription:   !!lic.hotmart_subscription_code,
    });
}
