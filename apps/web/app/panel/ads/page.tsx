'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type Conn = { id: string; display_name: string | null; status: string };
type Bm = { id: string; name: string; role: 'owner' | 'client' };
type AdAccount = {
    id: string; name: string; account_status: number; currency: string;
    amount_spent?: string; balance?: string; disable_reason?: number;
    source?: 'owned' | 'client'; timezone_name?: string;
};
type Insight = { impressions?: string; clicks?: string; spend?: string; cpc?: string; ctr?: string };

const ACCOUNT_STATUS: Record<number, { label: string; klass: string }> = {
    1: { label: 'Activa', klass: 'pill-success' },
    2: { label: 'Deshabilitada', klass: 'pill-danger' },
    3: { label: 'Sin pagar', klass: 'pill-warn' },
    7: { label: 'En revisión', klass: 'pill-muted' },
    9: { label: 'En gracia', klass: 'pill-warn' },
    100: { label: 'Cerrada', klass: 'pill-muted' },
    101: { label: 'Pendiente', klass: 'pill-muted' },
    102: { label: 'Pendiente revisión', klass: 'pill-muted' },
};
const DATE_PRESETS = [
    { id: 'today', label: 'Hoy' },
    { id: 'yesterday', label: 'Ayer' },
    { id: 'last_7d', label: '7 días' },
    { id: 'last_30d', label: '30 días' },
    { id: 'last_90d', label: '90 días' },
    { id: 'this_month', label: 'Este mes' },
];

function fmtMoney(v: string | undefined, currency: string) {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return '—';
    try { return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n); }
    catch { return `${n.toFixed(2)} ${currency}`; }
}
function fmtInt(v: string | undefined) {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? new Intl.NumberFormat('es').format(n) : '—';
}
function fmtPct(v: string | undefined) {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? `${n.toFixed(2)}%` : '—';
}

function AdsContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connParam = sp.get('conn');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState(connParam ?? '');
    const [bms, setBms] = useState<Bm[] | null>(null);
    const [bmId, setBmId] = useState('');
    const [accounts, setAccounts] = useState<AdAccount[] | null>(null);
    const [datePreset, setDatePreset] = useState('last_7d');
    const [insights, setInsights] = useState<Record<string, Insight | 'loading' | 'error'>>({});
    const [err, setErr] = useState<string | null>(null);

    const loadConns = useCallback(async () => {
        if (!tenantId) return;
        const r = await apiFetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.error ?? `HTTP ${r.status}`); return; }
        setConns(j.data);
        if (!connId && j.data?.length) setConnId(j.data[0].id);
    }, [tenantId, connId]);
    useEffect(() => { loadConns(); }, [loadConns]);

    const loadBms = useCallback(async () => {
        if (!tenantId || !connId) return;
        setBms(null); setBmId('');
        const r = await apiFetch(`/api/web/graph/bm/list?tenant_id=${tenantId}&connection_id=${connId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); return; }
        setBms(j.data);
    }, [tenantId, connId]);
    useEffect(() => { loadBms(); }, [loadBms]);

    const loadAccounts = useCallback(async () => {
        if (!tenantId || !connId) return;
        setAccounts(null); setInsights({}); setErr(null);
        const url = new URL('/api/web/graph/adaccounts/list', window.location.origin);
        url.searchParams.set('tenant_id', tenantId);
        url.searchParams.set('connection_id', connId);
        if (bmId) url.searchParams.set('bm_id', bmId);
        const r = await apiFetch(url.pathname + url.search);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); return; }
        setAccounts(j.data);
    }, [tenantId, connId, bmId]);
    useEffect(() => { if (bms !== null) loadAccounts(); }, [bms, bmId, loadAccounts]);

    const loadInsightFor = useCallback(async (acc: AdAccount) => {
        if (!tenantId || !connId) return;
        setInsights(prev => ({ ...prev, [acc.id]: 'loading' }));
        const url = new URL('/api/web/graph/insights', window.location.origin);
        url.searchParams.set('tenant_id', tenantId);
        url.searchParams.set('connection_id', connId);
        url.searchParams.set('ad_account_id', acc.id);
        url.searchParams.set('date_preset', datePreset);
        const r = await apiFetch(url.pathname + url.search);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setInsights(prev => ({ ...prev, [acc.id]: 'error' })); return; }
        setInsights(prev => ({ ...prev, [acc.id]: j.data?.[0] ?? {} }));
    }, [tenantId, connId, datePreset]);

    useEffect(() => {
        if (!accounts) return;
        setInsights({});
        const concurrency = 4;
        let i = 0;
        const worker = async () => {
            while (i < accounts.length) {
                const idx = i++;
                const acc = accounts[idx];
                if (acc.account_status !== 1 && acc.account_status !== 9) {
                    setInsights(prev => ({ ...prev, [acc.id]: {} })); continue;
                }
                await loadInsightFor(acc);
            }
        };
        Promise.all(Array.from({ length: concurrency }, worker));
    }, [accounts, datePreset, loadInsightFor]);

    const totals = useMemo(() => {
        if (!accounts) return null;
        let spend = 0, impressions = 0, clicks = 0;
        const currency = accounts[0]?.currency ?? 'USD';
        let mixed = false;
        for (const acc of accounts) {
            if (acc.currency !== currency) mixed = true;
            const ins = insights[acc.id];
            if (ins && typeof ins === 'object') {
                spend += Number((ins as Insight).spend ?? 0) || 0;
                impressions += Number((ins as Insight).impressions ?? 0) || 0;
                clicks += Number((ins as Insight).clicks ?? 0) || 0;
            }
        }
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        return { spend, impressions, clicks, ctr, cpc, currency, mixed };
    }, [accounts, insights]);

    if (!tenantId) return <div className="card"><h2>Falta tenant</h2><p className="muted">Abre desde <Link href="/panel">inicio</Link>.</p></div>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 28, marginBottom: 4 }}>📊 ADS — Cuentas publicitarias</h1>
                    <p className="muted" style={{ margin: 0 }}>Balance, límites y métricas consolidadas por cuenta.</p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

            {err && <div className="alert alert-error" style={{ marginBottom: 16 }}>Error: {err}</div>}

            {conns && conns.length > 0 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 220px' }}>
                            <label className="label">Conexión</label>
                            <select value={connId} onChange={e => setConnId(e.target.value)}>
                                {conns.map(c => <option key={c.id} value={c.id}>{c.display_name ?? c.id.slice(0, 8)}</option>)}
                            </select>
                        </div>
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 220px' }}>
                            <label className="label">Business Manager</label>
                            <select value={bmId} onChange={e => setBmId(e.target.value)} disabled={!bms}>
                                <option value="">— Todos (/me/adaccounts) —</option>
                                {bms?.map(b => <option key={b.id} value={b.id}>{b.name} · {b.role}</option>)}
                            </select>
                        </div>
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 160px' }}>
                            <label className="label">Rango</label>
                            <select value={datePreset} onChange={e => setDatePreset(e.target.value)}>
                                {DATE_PRESETS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {totals && accounts && accounts.length > 0 && (
                <div className="row" style={{ gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    <Kpi label="Gasto total" value={fmtMoney(String(totals.spend), totals.currency)}
                         hint={totals.mixed ? 'Monedas mixtas' : undefined} />
                    <Kpi label="Impresiones" value={fmtInt(String(totals.impressions))} />
                    <Kpi label="Clics" value={fmtInt(String(totals.clicks))} />
                    <Kpi label="CTR" value={fmtPct(String(totals.ctr))} />
                    <Kpi label="CPC medio" value={fmtMoney(String(totals.cpc), totals.currency)} />
                    <Kpi label="Cuentas" value={String(accounts.length)} />
                </div>
            )}

            {accounts === null && !err && <p className="muted">Cargando cuentas…</p>}

            {accounts && accounts.length > 0 && (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                                <th style={th}>Cuenta</th>
                                <th style={th}>Estado</th>
                                <th style={{ ...th, textAlign: 'right' }}>Gasto (rango)</th>
                                <th style={{ ...th, textAlign: 'right' }}>Total histórico</th>
                                <th style={{ ...th, textAlign: 'right' }}>Balance</th>
                                <th style={{ ...th, textAlign: 'right' }}>CPC</th>
                                <th style={{ ...th, textAlign: 'right' }}>CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(acc => {
                                const ins = insights[acc.id];
                                const st = ACCOUNT_STATUS[acc.account_status] ?? { label: `#${acc.account_status}`, klass: 'pill-muted' };
                                const centsToMoney = (c?: string) => c ? fmtMoney(String(Number(c) / 100), acc.currency) : '—';
                                return (
                                    <tr key={acc.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <td style={td}>
                                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{acc.name}</div>
                                            <div className="muted" style={{ fontSize: 12 }}>{acc.id} · {acc.currency}{acc.timezone_name ? ` · ${acc.timezone_name}` : ''}</div>
                                        </td>
                                        <td style={td}><span className={`pill ${st.klass}`}>{st.label}</span>
                                            {acc.disable_reason && acc.disable_reason !== 0
                                                ? <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>motivo #{acc.disable_reason}</div> : null}
                                        </td>
                                        <td style={{ ...td, textAlign: 'right' }}>{cell(ins, 'spend', acc.currency)}</td>
                                        <td style={{ ...td, textAlign: 'right' }}>{centsToMoney(acc.amount_spent)}</td>
                                        <td style={{ ...td, textAlign: 'right' }}>{centsToMoney(acc.balance)}</td>
                                        <td style={{ ...td, textAlign: 'right' }}>{cell(ins, 'cpc', acc.currency)}</td>
                                        <td style={{ ...td, textAlign: 'right' }}>{cell(ins, 'ctr', undefined, true)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
    return (
        <div className="card" style={{ flex: '1 1 160px', minWidth: 160, marginBottom: 0 }}>
            <div className="muted" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>{value}</div>
            {hint && <div className="muted" style={{ fontSize: 11 }}>{hint}</div>}
        </div>
    );
}

function cell(ins: Insight | 'loading' | 'error' | undefined, key: keyof Insight, currency?: string, pct = false) {
    if (ins === undefined || ins === 'loading') return <span className="muted">…</span>;
    if (ins === 'error') return <span style={{ color: '#ef4444' }}>×</span>;
    const v = (ins as Insight)[key];
    if (pct) return fmtPct(v);
    if (currency) return fmtMoney(v, currency);
    return fmtInt(v);
}

const th: React.CSSProperties = { padding: '12px 16px', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--muted)', fontWeight: 600 };
const td: React.CSSProperties = { padding: '12px 16px', fontSize: 14 };

export default function AdsPage() {
    return <Suspense><AdsContent /></Suspense>;
}
