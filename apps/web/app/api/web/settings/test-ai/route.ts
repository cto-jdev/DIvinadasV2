/**
 * POST /api/web/settings/test-ai
 * Body: { tenant_id, api_key?, model? }
 *
 * Tests a live call to Anthropic. If api_key omitted, uses the key stored in
 * tenants.settings.ai.api_key, then falls back to process.env.ANTHROPIC_API_KEY.
 * Does NOT persist anything.
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveUser } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
    tenant_id: z.string().uuid(),
    api_key: z.string().min(10).max(500).optional(),
    model: z.string().min(3).max(80).optional(),
});

export async function POST(req: NextRequest) {
    try {
        const auth = await resolveUser(req);
        if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        const parsed = Body.safeParse(await req.json().catch(() => ({})));
        if (!parsed.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });
        const { tenant_id, api_key, model } = parsed.data;

        const supa = getSupabaseService();
        const { data: mem } = await supa.from('tenant_members')
            .select('role').eq('tenant_id', tenant_id).eq('user_id', auth.user.id).maybeSingle();
        if (!mem) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

        let key = api_key;
        let modelId = model;
        if (!key || !modelId) {
            const { data: t } = await supa.from('tenants')
                .select('settings').eq('id', tenant_id).maybeSingle();
            const s = (t?.settings as any) ?? {};
            key = key ?? s.ai?.api_key ?? process.env.ANTHROPIC_API_KEY;
            modelId = modelId ?? s.ai?.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
        }
        if (!key) return NextResponse.json({ ok: false, error: 'no_key' }, { status: 400 });

        const t0 = Date.now();
        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: modelId,
                max_tokens: 32,
                messages: [{ role: 'user', content: 'ping' }],
            }),
        });
        const latency = Date.now() - t0;
        if (!r.ok) {
            const txt = await r.text().catch(() => '');
            return NextResponse.json({
                ok: false, status: r.status, latency_ms: latency,
                error: r.status === 401 ? 'invalid_key' : 'anthropic_error',
                detail: txt.slice(0, 240),
            }, { status: 200 });
        }
        const j = await r.json().catch(() => ({}));
        const text = Array.isArray(j.content)
            ? j.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim()
            : '';
        return NextResponse.json({ ok: true, latency_ms: latency, model: modelId, sample: text.slice(0, 120) });
    } catch (e) {
        console.error('[settings/test-ai]', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}
