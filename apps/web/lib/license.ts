/**
 * Licenciamiento y feature flags — wrappers para handlers Next.js.
 *
 * Uso típico:
 *   const gate = await requireActiveLicense(tenantId);
 *   if (!gate.ok) return NextResponse.json(gate.body, { status: gate.status });
 *
 *   if (!(await tenantHasFlag(tenantId, 'ads.module'))) {
 *       return NextResponse.json({ error: 'forbidden', reason: 'feature_off' }, { status: 403 });
 *   }
 */
import { getSupabaseService } from './supabase';

export type LicensePlan = 'trial' | 'starter' | 'pro' | 'enterprise';

const PLAN_MODULES: Record<LicensePlan, string[]> = {
    trial:      ['bm.module', 'ads.module'],
    starter:    ['bm.module', 'ads.module', 'pages.module', 'pixel.module'],
    pro:        ['bm.module', 'ads.module', 'pages.module', 'pixel.module',
                 'advantage.module', 'attribution.module'],
    enterprise: ['*'],
};

export async function requireActiveLicense(tenantId: string) {
    const supa = getSupabaseService();
    const { data: lic } = await supa.from('licenses')
        .select('plan, status, trial_ends_at, current_period_ends_at')
        .eq('tenant_id', tenantId)
        .maybeSingle();

    if (!lic) return {
        ok: false as const, status: 402,
        body: { error: 'license_inactive', reason: 'no_license' },
    };

    if (lic.status !== 'active') return {
        ok: false as const, status: 402,
        body: { error: 'license_inactive', reason: lic.status },
    };

    const ends = lic.plan === 'trial' ? lic.trial_ends_at : lic.current_period_ends_at;
    if (ends && new Date(ends).getTime() < Date.now()) {
        await supa.from('licenses').update({ status: 'expired' }).eq('tenant_id', tenantId);
        return {
            ok: false as const, status: 402,
            body: { error: 'license_inactive', reason: 'expired' },
        };
    }

    return { ok: true as const, plan: lic.plan as LicensePlan };
}

export async function tenantHasFlag(tenantId: string, flagKey: string): Promise<boolean> {
    const supa = getSupabaseService();

    // 1) Override por tenant
    const { data: tff } = await supa.from('tenant_feature_flags')
        .select('enabled').eq('tenant_id', tenantId).eq('key', flagKey).maybeSingle();
    if (tff) return tff.enabled;

    // 2) Plan del tenant (enterprise = todos)
    const { data: lic } = await supa.from('licenses')
        .select('plan').eq('tenant_id', tenantId).maybeSingle();
    if (lic) {
        const mods = PLAN_MODULES[lic.plan as LicensePlan] ?? [];
        if (mods.includes('*') || mods.includes(flagKey)) return true;
    }

    // 3) Default global
    const { data: ff } = await supa.from('feature_flags')
        .select('default_enabled').eq('key', flagKey).maybeSingle();
    return ff?.default_enabled ?? false;
}
