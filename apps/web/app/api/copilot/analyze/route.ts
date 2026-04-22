/**
 * POST /api/copilot/analyze
 * Body: { scope: CopilotScope, question?: string }
 * Uses Anthropic API if ANTHROPIC_API_KEY is set, else falls back to rule-based analysis.
 * Auth: Bearer Supabase access_token.
 */
import { NextRequest, NextResponse } from 'next/server';
import { resolveUser } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FALLBACK_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';

async function resolveAiConfig(tenantId: string | null, userId: string): Promise<{ key: string | null; model: string }> {
    let key: string | null = null;
    let model: string = FALLBACK_MODEL;
    if (tenantId) {
        const supa = getSupabaseService();
        const { data: mem } = await supa.from('tenant_members')
            .select('role').eq('tenant_id', tenantId).eq('user_id', userId).maybeSingle();
        if (mem) {
            const { data: t } = await supa.from('tenants')
                .select('settings').eq('id', tenantId).maybeSingle();
            const ai = ((t?.settings as any) ?? {}).ai ?? {};
            if (typeof ai.api_key === 'string' && ai.api_key) key = ai.api_key;
            if (typeof ai.model === 'string' && ai.model) model = ai.model;
        }
    }
    if (!key) key = process.env.ANTHROPIC_API_KEY ?? null;
    return { key, model };
}

export async function POST(req: NextRequest) {
    try {
        const auth = await resolveUser(req);
        if (!auth.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const scope = body?.scope ?? { module: 'other', summary: {}, top_decisions: [], scores: [] };
        const question: string = (body?.question ?? '').toString().slice(0, 2000);
        const tenantId: string | null = typeof body?.tenant_id === 'string' ? body.tenant_id : null;

        const { key, model: MODEL } = await resolveAiConfig(tenantId, auth.user.id);
        if (!key) {
            return NextResponse.json({ answer: fallbackAnswer(scope, question), source: 'rule-based' });
        }

        const system = [
            'Eres el copiloto IA de DivinAds, un panel SaaS para agencias que gestionan Meta Business Managers.',
            'Analizas el contexto JSON (scope) del módulo activo y das recomendaciones accionables, priorizadas y breves.',
            'Responde en español, con bullets cortos. Nombra cuentas/BMs/campañas por nombre cuando estén disponibles.',
            'Si detectas riesgos críticos (congelado, cerca de cap, bus-factor=1), menciónalos primero.',
            'No inventes datos: usa sólo el scope provisto. Si falta información, dilo en una línea.',
        ].join(' ');

        const userMsg = [
            `Módulo: ${scope.module}`,
            `Resumen: ${JSON.stringify(scope.summary ?? {})}`,
            `Top decisiones (${(scope.top_decisions ?? []).length}): ${JSON.stringify((scope.top_decisions ?? []).slice(0, 8))}`,
            `Scores: ${JSON.stringify((scope.scores ?? []).map((s: any) => ({ k: s.key, v: s.score })))}`,
            question ? `\nPregunta del usuario: ${question}` : '\nDa un análisis ejecutivo del estado actual en 4-6 bullets priorizados.',
        ].join('\n');

        const r = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-api-key': key,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: MODEL,
                max_tokens: 800,
                system,
                messages: [{ role: 'user', content: userMsg }],
            }),
        });

        if (!r.ok) {
            const t = await r.text().catch(() => '');
            console.error('[copilot] anthropic error', r.status, t.slice(0, 300));
            return NextResponse.json({ answer: fallbackAnswer(scope, question), source: 'rule-based-fallback' });
        }

        const j = await r.json();
        const text = Array.isArray(j.content)
            ? j.content.filter((c: any) => c.type === 'text').map((c: any) => c.text).join('\n').trim()
            : '';
        return NextResponse.json({ answer: text || fallbackAnswer(scope, question), source: 'anthropic' });
    } catch (e) {
        console.error('[copilot/analyze] uncaught:', e);
        return NextResponse.json({ error: 'internal_error' }, { status: 500 });
    }
}

function fallbackAnswer(scope: any, question: string): string {
    const s = scope?.summary ?? {};
    const lines: string[] = [];
    if (s.accounts_frozen) lines.push(`⚠️ ${s.accounts_frozen} cuenta(s) congelada(s) — revisa estado en Business Suite.`);
    if (s.accounts_near_cap) lines.push(`⚠️ ${s.accounts_near_cap} cuenta(s) cerca del spend cap.`);
    if (s.campaigns_accelerating) lines.push(`⏫ ${s.campaigns_accelerating} campaña(s) acelerando — revisa pacing diario.`);
    if (s.campaigns_underpaced) lines.push(`⏬ ${s.campaigns_underpaced} campaña(s) lentas — considera subir presupuesto o revisar entrega.`);
    if (s.campaigns_wasteful) lines.push(`🔻 ${s.campaigns_wasteful} campaña(s) con CPA alto — considera pausar o reoptimizar.`);
    if (s.pages_count != null && s.pages_ready != null) {
        lines.push(`📄 Páginas listas para ads: ${s.pages_ready}/${s.pages_count}.`);
    }
    const decisions = (scope?.top_decisions ?? []).slice(0, 3);
    if (decisions.length) {
        lines.push('\nTop recomendaciones:');
        for (const d of decisions) lines.push(`• ${d.title ?? d.key}: ${d.rationale ?? ''}`);
    }
    if (!lines.length) lines.push('No hay señales relevantes en el scope actual. Carga un módulo con datos para obtener recomendaciones.');
    if (question) lines.unshift(`(Análisis basado en reglas; configura ANTHROPIC_API_KEY para respuestas IA.)\n`);
    return lines.join('\n');
}
