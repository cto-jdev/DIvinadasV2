/**
 * GET  /api/web/settings?tenant_id=...   → returns settings (API key masked).
 * POST /api/web/settings                 → body: { tenant_id, patch: {...} }
 *
 * Persists into `tenants.settings` JSONB. Requires tenant membership.
 * Supported fields (all optional):
 *   ai: { provider: 'anthropic', api_key, model }
 *   system: { timezone, currency, default_objective, notify_email, locale }
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUser } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SettingsShape = {
    ai?: { provider?: string; api_key?: string; model?: string };
    system?: {
        timezone?: string;
        currency?: string;
        default_objective?: string;
        notify_email?: string;
        locale?: string;
    };
};

function maskKey(k?: string): string | null {
    if (!k) return null;
    if (k.length <= 10) return '•'.repeat(k.length);
    return `${k.slice(0, 6)}…${k.slice(-4)}`;
}

async function assertMember(userId: string, tenantId: string) {
    const supa = getSupabaseService();
    const { data } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', tenantId).eq('user_id', userId).maybeSingle();
    return !!data;
}

export async function GET(req: NextRequest) {
    try {
        const auth = await resolveUser(req);
        if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        const tenantId = req.nextUrl.searchParams.get('tenant_id');
        if (!tenantId) return NextResponse.json({ error: 'missing_tenant' }, { status: 400 });
        if (!(await assertMember(auth.user.id, tenantId))) {
            return NextResponse.json({ error: 'forbidden' }, { status: 403 });
        }
        const supa = getSupabaseService();
        const { data: t, error } = await supa.from('tenants')
            .select('id,display_name,settings').eq('id', tenantId).maybeSingle();
        if (error || !t) return NextResponse.json({ error: 'not_found' }, { status: 404 });
        const s = (t.settings as SettingsShape | null) ?? {};
        const apiKey = s.ai?.api_key ?? '';
        return NextResponse.json({
            tenant: { id: t.id, display_name: t.display_name },
            settings: {
                ai: {
                    provider: s.ai?.provider ?? 'anthropic',
                    model: s.ai?.model ?? 'claude-sonnet-4-6',
                    api_key_masked: maskKey(apiKey),
                    api_key_set: !!apiKey,
                },
                system: {
                    timezone: s.system?.timezone ?? 'America/Bogota',
                    currency: s.system?.currency ?? 'USD',
                    default_objective: s.system?.default_objective ?? 'OUTCOME_SALES',
                    notify_email: s.system?.notify_email ?? '',
                    locale: s.system?.locale ?? 'es',
                },
            },
            env_key_present: !!process.env.ANTHROPIC_API_KEY,
        });
    } catch (e) {
        console.error('[settings GET]', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}

const Patch = z.object({
    tenant_id: z.string().uuid(),
    patch: z.object({
        ai: z.object({
            provider: z.enum(['anthropic']).optional(),
            api_key: z.string().min(10).max(500).optional(),
            clear_api_key: z.boolean().optional(),
            model: z.string().min(3).max(80).optional(),
        }).partial().optional(),
        system: z.object({
            timezone: z.string().min(1).max(60).optional(),
            currency: z.string().min(3).max(8).optional(),
            default_objective: z.string().min(3).max(60).optional(),
            notify_email: z.string().email().or(z.literal('')).optional(),
            locale: z.string().min(2).max(8).optional(),
        }).partial().optional(),
    }),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await resolveUser(req);
        if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        const parsed = Patch.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) {
            return NextResponse.json({ error: 'validation_error', issues: parsed.error.issues }, { status: 400 });
        }
        const { tenant_id, patch } = parsed.data;
        if (!(await assertMember(auth.user.id, tenant_id))) {
            return NextResponse.json({ error: 'forbidden' }, { status: 403 });
        }

        const supa = getSupabaseService();
        const { data: current, error: rErr } = await supa.from('tenants')
            .select('settings').eq('id', tenant_id).maybeSingle();
        if (rErr || !current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

        const cur = (current.settings as SettingsShape | null) ?? {};
        const next: SettingsShape = { ...cur };

        if (patch.ai) {
            const curAi = cur.ai ?? {};
            const nextAi = { ...curAi };
            if (patch.ai.provider) nextAi.provider = patch.ai.provider;
            if (patch.ai.model) nextAi.model = patch.ai.model;
            if (patch.ai.clear_api_key) delete nextAi.api_key;
            else if (patch.ai.api_key) nextAi.api_key = patch.ai.api_key;
            next.ai = nextAi;
        }
        if (patch.system) {
            next.system = { ...(cur.system ?? {}), ...patch.system };
        }

        const { error: uErr } = await supa.from('tenants')
            .update({ settings: next as any, updated_at: new Date().toISOString() })
            .eq('id', tenant_id);
        if (uErr) return NextResponse.json({ error: 'update_failed', detail: uErr.message }, { status: 500 });

        return NextResponse.json({ ok: true });
    } catch (e) {
        console.error('[settings POST]', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
