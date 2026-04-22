'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';

type Settings = {
    ai: { provider: string; model: string; api_key_masked: string | null; api_key_set: boolean };
    system: {
        timezone: string;
        currency: string;
        default_objective: string;
        notify_email: string;
        locale: string;
    };
};

type Payload = {
    tenant: { id: string; display_name: string };
    settings: Settings;
    env_key_present: boolean;
};

const MODELS = [
    { id: 'claude-opus-4-7',     label: 'Opus 4.7 (máxima calidad)' },
    { id: 'claude-sonnet-4-6',   label: 'Sonnet 4.6 (balance)' },
    { id: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5 (rápido/económico)' },
];

const OBJECTIVES = [
    'OUTCOME_SALES', 'OUTCOME_LEADS', 'OUTCOME_ENGAGEMENT',
    'OUTCOME_AWARENESS', 'OUTCOME_TRAFFIC', 'OUTCOME_APP_PROMOTION',
];

const TIMEZONES = [
    'America/Bogota', 'America/Mexico_City', 'America/Argentina/Buenos_Aires',
    'America/Santiago', 'America/Lima', 'America/New_York', 'Europe/Madrid', 'UTC',
];

const CURRENCIES = ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BRL'];

function SettingsContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [tab, setTab] = useState<'ai' | 'system'>('ai');
    const [data, setData] = useState<Payload | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const [newKey, setNewKey] = useState('');
    const [model, setModel] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

    const [sys, setSys] = useState<Settings['system'] | null>(null);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        if (!tenantId) return;
        setErr(null);
        const r = await apiFetch(`/api/web/settings?tenant_id=${tenantId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.error ?? `HTTP ${r.status}`); return; }
        setData(j);
        setModel(j.settings.ai.model);
        setSys(j.settings.system);
    }, [tenantId]);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        if (!toast) return;
        const id = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(id);
    }, [toast]);

    async function saveAi(opts: { clear?: boolean } = {}) {
        if (!tenantId) return;
        setSaving(true);
        const patch: any = { ai: {} };
        if (opts.clear) patch.ai.clear_api_key = true;
        else if (newKey.trim()) patch.ai.api_key = newKey.trim();
        if (model) patch.ai.model = model;
        const r = await apiFetch('/api/web/settings', {
            method: 'POST',
            body: JSON.stringify({ tenant_id: tenantId, patch }),
        });
        setSaving(false);
        if (r.ok) {
            setToast(opts.clear ? 'API key eliminada.' : 'Configuración IA guardada.');
            setNewKey('');
            setTestResult(null);
            load();
        } else {
            const j = await r.json().catch(() => ({}));
            setToast(`Error: ${j.error ?? r.status}`);
        }
    }

    async function testAi() {
        if (!tenantId) return;
        setTesting(true);
        setTestResult(null);
        const body: any = { tenant_id: tenantId };
        if (newKey.trim()) body.api_key = newKey.trim();
        if (model) body.model = model;
        const r = await apiFetch('/api/web/settings/test-ai', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        const j = await r.json().catch(() => ({}));
        setTesting(false);
        if (j.ok) {
            setTestResult({ ok: true, msg: `OK (${j.latency_ms}ms) — ${j.model}` });
        } else {
            setTestResult({ ok: false, msg: j.error === 'no_key' ? 'Falta API key' : (j.detail || j.error || 'Error') });
        }
    }

    async function saveSystem() {
        if (!tenantId || !sys) return;
        setSaving(true);
        const r = await apiFetch('/api/web/settings', {
            method: 'POST',
            body: JSON.stringify({ tenant_id: tenantId, patch: { system: sys } }),
        });
        setSaving(false);
        if (r.ok) { setToast('Preferencias del sistema guardadas.'); load(); }
        else setToast('Error al guardar');
    }

    if (!tenantId) return <p className="muted">Falta tenant.</p>;
    if (err) return <div className="alert alert-error">{err}</div>;
    if (!data || !sys) return <p className="muted">Cargando…</p>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>Ajustes</h1>
                    <p className="muted" style={{ margin: 0 }}>
                        Configura la IA y preferencias del tenant <strong>{data.tenant.display_name}</strong>.
                    </p>
                </div>
            </header>

            <div className="row" style={{ gap: 8, marginBottom: 20 }}>
                <button
                    className={`btn btn-sm ${tab === 'ai' ? '' : 'btn-ghost'}`}
                    onClick={() => setTab('ai')}
                >⚡ Inteligencia Artificial</button>
                <button
                    className={`btn btn-sm ${tab === 'system' ? '' : 'btn-ghost'}`}
                    onClick={() => setTab('system')}
                >⚙ Sistema</button>
            </div>

            {tab === 'ai' && (
                <div className="card" style={{ maxWidth: 760 }}>
                    <h3 style={{ marginTop: 0 }}>Conexión Anthropic (Claude)</h3>
                    <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
                        Configura tu API key para que el copiloto IA genere respuestas reales.
                        Sin clave, el copiloto usa análisis basado en reglas.
                    </p>

                    <div className="col" style={{ gap: 14, marginTop: 16 }}>
                        <div>
                            <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                                Estado actual
                            </label>
                            <div className="row" style={{ gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                                {data.settings.ai.api_key_set ? (
                                    <>
                                        <span className="pill" style={{ background: 'rgba(34,197,94,.15)', color: '#22c55e' }}>
                                            ✓ Key configurada
                                        </span>
                                        <code style={{ fontSize: 13 }}>{data.settings.ai.api_key_masked}</code>
                                    </>
                                ) : data.env_key_present ? (
                                    <span className="pill" style={{ background: 'rgba(59,130,246,.15)', color: '#3b82f6' }}>
                                        ⓘ Usando ANTHROPIC_API_KEY del entorno
                                    </span>
                                ) : (
                                    <span className="pill" style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444' }}>
                                        ✗ Sin key — copiloto en modo reglas
                                    </span>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                                API Key de Anthropic
                            </label>
                            <input
                                type="password"
                                placeholder={data.settings.ai.api_key_set ? 'Dejar vacío para mantener la actual' : 'sk-ant-…'}
                                value={newKey}
                                onChange={e => setNewKey(e.target.value)}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                                Se almacena cifrada en la base de datos del tenant.
                                Puedes generarla en console.anthropic.com → API Keys.
                            </div>
                        </div>

                        <div>
                            <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                                Modelo
                            </label>
                            <select value={model} onChange={e => setModel(e.target.value)}>
                                {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                        </div>

                        {testResult && (
                            <div
                                className="alert"
                                style={{
                                    background: testResult.ok ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)',
                                    border: `1px solid ${testResult.ok ? 'rgba(34,197,94,.3)' : 'rgba(239,68,68,.3)'}`,
                                    color: testResult.ok ? '#22c55e' : '#ef4444',
                                    fontSize: 13,
                                }}
                            >
                                {testResult.ok ? '✓ Conexión OK — ' : '✗ '}{testResult.msg}
                            </div>
                        )}

                        <div className="row" style={{ gap: 8, marginTop: 6 }}>
                            <button
                                className="btn"
                                onClick={() => saveAi()}
                                disabled={saving || (!newKey.trim() && model === data.settings.ai.model)}
                            >
                                {saving ? 'Guardando…' : 'Guardar'}
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={testAi}
                                disabled={testing || (!newKey.trim() && !data.settings.ai.api_key_set && !data.env_key_present)}
                            >
                                {testing ? 'Probando…' : 'Probar conexión'}
                            </button>
                            {data.settings.ai.api_key_set && (
                                <button
                                    className="btn btn-ghost"
                                    style={{ marginLeft: 'auto', color: '#ef4444' }}
                                    onClick={() => { if (confirm('¿Eliminar la API key del tenant?')) saveAi({ clear: true }); }}
                                >
                                    Eliminar key
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'system' && (
                <div className="card" style={{ maxWidth: 760 }}>
                    <h3 style={{ marginTop: 0 }}>Preferencias del sistema</h3>
                    <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
                        Valores por defecto del tenant aplicados a dashboards, reportes y creación de campañas.
                    </p>

                    <div className="col" style={{ gap: 14, marginTop: 16 }}>
                        <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 220px' }}>
                                <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Zona horaria</label>
                                <select value={sys.timezone} onChange={e => setSys({ ...sys, timezone: e.target.value })}>
                                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 160px' }}>
                                <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Moneda</label>
                                <select value={sys.currency} onChange={e => setSys({ ...sys, currency: e.target.value })}>
                                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 160px' }}>
                                <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>Idioma</label>
                                <select value={sys.locale} onChange={e => setSys({ ...sys, locale: e.target.value })}>
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                    <option value="pt">Português</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                                Objetivo por defecto al crear campaña
                            </label>
                            <select value={sys.default_objective} onChange={e => setSys({ ...sys, default_objective: e.target.value })}>
                                {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="muted" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                                Email para notificaciones (opcional)
                            </label>
                            <input
                                type="email"
                                placeholder="alerts@empresa.com"
                                value={sys.notify_email}
                                onChange={e => setSys({ ...sys, notify_email: e.target.value })}
                            />
                        </div>

                        <div className="row" style={{ gap: 8, marginTop: 6 }}>
                            <button className="btn" onClick={saveSystem} disabled={saving}>
                                {saving ? 'Guardando…' : 'Guardar preferencias'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div
                    style={{
                        position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
                        background: 'var(--panel)', border: '1px solid var(--border)',
                        padding: '12px 16px', borderRadius: 10, fontSize: 13,
                        boxShadow: '0 8px 24px rgba(0,0,0,.3)',
                    }}
                >
                    {toast}
                </div>
            )}
        </>
    );
}

export default function SettingsPage() {
    return <Suspense fallback={<p className="muted">Cargando…</p>}><SettingsContent /></Suspense>;
}
