'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useCopilot } from './context';
import { apiFetch } from '@/lib/api-client';

type Msg = { role: 'user' | 'assistant'; content: string; typing?: boolean };

const QUICK: { label: string; q: string }[] = [
    { label: 'Analiza presupuesto', q: '¿Cómo está el ritmo de gasto de mis campañas? ¿Hay riesgo de sobregasto?' },
    { label: 'Riesgos de acceso',   q: 'Identifica riesgos de compliance y bus-factor en mis Business Managers.' },
    { label: 'Optimizaciones',      q: 'Dame 3 optimizaciones priorizadas para esta vista.' },
    { label: 'Resumen ejecutivo',   q: 'Hazme un resumen ejecutivo del estado actual en 4 bullets.' },
];

export function CopilotSidebar() {
    const { scope, open, toggle } = useCopilot();
    const [msgs, setMsgs] = useState<Msg[]>([
        { role: 'assistant', content: 'Soy tu copiloto. Uso el contexto del módulo activo para darte recomendaciones específicas. Pregúntame o usa un atajo.' },
    ]);
    const [input, setInput] = useState('');
    const [busy, setBusy] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [msgs]);

    async function ask(q: string) {
        if (!q.trim() || busy) return;
        setBusy(true);
        setMsgs(m => [...m, { role: 'user', content: q }, { role: 'assistant', content: '', typing: true }]);
        setInput('');
        try {
            const r = await apiFetch('/api/copilot/analyze', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ scope, question: q }),
            });
            const j = await r.json().catch(() => ({ answer: 'No pude analizar en este momento.' }));
            setMsgs(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: 'assistant', content: j.answer || 'Sin respuesta.' };
                return copy;
            });
        } catch {
            setMsgs(m => {
                const copy = [...m];
                copy[copy.length - 1] = { role: 'assistant', content: 'Error de conexión con el copiloto.' };
                return copy;
            });
        } finally {
            setBusy(false);
        }
    }

    if (!open) {
        return (
            <aside className="app-side-right closed" aria-label="Copilot">
                <button className="copilot-toggle" onClick={toggle} title="Abrir copiloto" aria-label="Abrir copiloto">
                    <span style={{ fontSize: 18 }}>✦</span>
                </button>
            </aside>
        );
    }

    return (
        <aside className="app-side-right" aria-label="Copilot">
            <div className="copilot-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14 }}>✦</span>
                    <strong style={{ fontSize: 13 }}>Copilot IA</strong>
                    <span className="chip chip-low" style={{ fontSize: 9 }}>{scope.module}</span>
                </div>
                <button className="copilot-toggle sm" onClick={toggle} aria-label="Cerrar copiloto">×</button>
            </div>

            <div className="copilot-body" ref={scrollRef}>
                <div className="copilot-context-card">
                    <div className="stat-label" style={{ marginBottom: 4 }}>Contexto activo</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>
                        {summarizeScope(scope)}
                    </div>
                </div>

                {msgs.map((m, i) => (
                    <div key={i} className={`copilot-bubble ${m.role === 'user' ? 'user' : ''} ${m.typing ? 'typing' : ''}`}>
                        {m.typing ? '' : m.content}
                    </div>
                ))}

                <div className="copilot-quick">
                    {QUICK.map(q => (
                        <button key={q.label} className="copilot-quick-btn" onClick={() => ask(q.q)} disabled={busy}>
                            {q.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="copilot-foot">
                <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); }
                    }}
                    placeholder="Pregunta al copiloto…"
                    rows={2}
                    disabled={busy}
                />
                <button className="btn btn-primary" onClick={() => ask(input)} disabled={busy || !input.trim()}>
                    {busy ? '…' : 'Enviar'}
                </button>
            </div>
        </aside>
    );
}

function summarizeScope(scope: ReturnType<typeof useCopilot>['scope']): string {
    const s = scope.summary;
    const bits: string[] = [];
    if (s.bms_count != null) bits.push(`${s.bms_count} BM`);
    if (s.accounts_count != null) bits.push(`${s.accounts_count} cuentas${s.accounts_frozen ? ` (${s.accounts_frozen} congeladas)` : ''}`);
    if (s.campaigns_count != null) bits.push(`${s.campaigns_count} campañas`);
    if (s.pages_count != null) bits.push(`${s.pages_count} páginas`);
    if (s.global_health != null) bits.push(`salud ${s.global_health}/100`);
    if (!bits.length) return 'Navega a un módulo para cargar su contexto.';
    return bits.join(' · ');
}
