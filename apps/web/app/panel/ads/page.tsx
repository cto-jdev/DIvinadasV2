'use client';
/**
 * ADS Module — decision-oriented AdAccount workbench.
 * Spec: dashboard_meta_claude_spec.md §7.3.
 *
 * 4 tabs:
 *   Resumen  · Presupuesto & facturación · Performance & pacing · Recomendaciones
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type {
    AdAccountSnapshot, CampaignSnapshot, BmSnapshot,
    DecisionItem, Score, Severity,
} from '@/lib/domain/types';
import {
    toCents, capUtilizationPct, remainingCapCents,
    burnRate, daysToExhaust, budgetWasteRisk,
} from '@/lib/domain/budget';
import {
    billingHealthScore, campaignEfficiencyScore, campaignPacingScore,
} from '@/lib/domain/scoring';
import { useRegisterCopilotScope } from '@/components/copilot/context';

type Conn = { id: string; display_name: string | null; status: string };
type Tab = 'resumen' | 'budget' | 'performance' | 'reco';

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

const fmtMoneyCents = (cents: number, currency: string) => {
    try {
        return new Intl.NumberFormat('es', {
            style: 'currency', currency, maximumFractionDigits: 2,
        }).format(cents / 100);
    } catch { return `${(cents / 100).toFixed(2)} ${currency}`; }
};
const fmtInt = (n: number) => new Intl.NumberFormat('es').format(n);
const fmtPct = (n: number) => `${n.toFixed(1)}%`;

function AdsContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connParam = sp.get('conn');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState(connParam ?? '');
    const [bms, setBms] = useState<BmSnapshot[] | null>(null);
    const [bmId, setBmId] = useState('');
    const [accounts, setAccounts] = useState<AdAccountSnapshot[] | null>(null);
    const [selectedId, setSelectedId] = useState('');
    const [campaigns, setCampaigns] = useState<CampaignSnapshot[] | null>(null);
    const [tab, setTab] = useState<Tab>('resumen');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        const now = new Date().toISOString();
        setBms((j.data ?? []).map((b: any) => ({
            ...b, source_type: 'api',
            source_endpoint: '/me/businesses|client_businesses', last_sync_at: now,
        })));
    }, [tenantId, connId]);
    useEffect(() => { loadBms(); }, [loadBms]);

    const loadAccounts = useCallback(async () => {
        if (!tenantId || !connId) return;
        setAccounts(null); setErr(null); setLoading(true);
        const url = new URL('/api/web/graph/adaccounts/list', window.location.origin);
        url.searchParams.set('tenant_id', tenantId);
        url.searchParams.set('connection_id', connId);
        if (bmId) url.searchParams.set('bm_id', bmId);
        const r = await apiFetch(url.pathname + url.search);
        const j = await r.json().catch(() => ({}));
        setLoading(false);
        if (!r.ok) { setErr(j.message ?? `HTTP ${r.status}`); return; }
        const now = new Date().toISOString();
        const list: AdAccountSnapshot[] = (j.data ?? []).map((a: any) => ({
            id: a.id, name: a.name, currency: a.currency,
            account_status: a.account_status,
            amount_spent: a.amount_spent, spend_cap: a.spend_cap, balance: a.balance,
            disable_reason: a.disable_reason, timezone_name: a.timezone_name,
            business_id: a.business?.id ?? null,
            source_type: 'api', source_endpoint: '/me/adaccounts', last_sync_at: now,
        }));
        setAccounts(list);
        const first = list.find(a => a.account_status === 1) ?? list[0];
        if (first) setSelectedId(first.id);
    }, [tenantId, connId, bmId]);
    useEffect(() => { if (bms !== null) loadAccounts(); }, [bms, bmId, loadAccounts]);

    const loadCampaigns = useCallback(async () => {
        if (!tenantId || !connId || !selectedId) return;
        setCampaigns(null);
        const qs = `tenant_id=${tenantId}&connection_id=${connId}&ad_account_id=${selectedId}`;
        const r = await apiFetch(`/api/web/graph/campaigns/list?${qs}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return;
        const now = new Date().toISOString();
        setCampaigns((j.data ?? []).map((c: any) => ({
            id: c.id, ad_account_id: selectedId, name: c.name,
            objective: c.objective, status: c.status, effective_status: c.effective_status,
            daily_budget: c.daily_budget, lifetime_budget: c.lifetime_budget,
            budget_remaining: c.budget_remaining, bid_strategy: c.bid_strategy,
            buying_type: c.buying_type, start_time: c.start_time, stop_time: c.stop_time,
            spend: c.spend, impressions: c.impressions, clicks: c.clicks,
            source_type: 'api', source_endpoint: '/{acct}/campaigns+insights', last_sync_at: now,
        })));
    }, [tenantId, connId, selectedId]);
    useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

    const selected = accounts?.find(a => a.id === selectedId) ?? null;
    const currency = selected?.currency ?? 'USD';
    const billing: Score | null = selected ? billingHealthScore(selected) : null;

    const derivations = useMemo(() => {
        if (!selected) return null;
        const remaining = remainingCapCents(selected.amount_spent, selected.spend_cap);
        const utilization = capUtilizationPct(selected.amount_spent, selected.spend_cap);
        const spend7d = campaigns?.reduce((a, c) => a + toCents(c.spend), 0) ?? 0;
        const burn = burnRate(spend7d, 7);
        const days = daysToExhaust(remaining, burn);
        return { remaining, utilization, spend7d, burn, days };
    }, [selected, campaigns]);

    const campaignAnalytics = useMemo(() => {
        if (!campaigns) return null;
        return campaigns.map(c => {
            const eff = campaignEfficiencyScore(c);
            const pacing = campaignPacingScore(c);
            const waste = budgetWasteRisk({
                spendCents: toCents(c.spend),
                clicks: Number(c.clicks ?? 0),
                impressions: Number(c.impressions ?? 0),
            });
            return { c, eff, pacing, waste };
        });
    }, [campaigns]);

    const recommendations: DecisionItem[] = useMemo(() => {
        if (!selected) return [];
        const now = new Date().toISOString();
        const out: DecisionItem[] = [];
        if (selected.account_status !== 1) {
            out.push({
                entity_type: 'ad_account', entity_id: selected.id, entity_name: selected.name,
                problem: `Cuenta en estado ${selected.account_status}`,
                severity: selected.account_status === 2 ? 'critical' : 'high',
                evidence: `disable_reason=${selected.disable_reason ?? '—'}`,
                recommended_action: 'Revisar y apelar en Ads Manager.',
                score_ref: 'billing_health_score', as_of: now,
            });
        }
        if (derivations?.utilization !== null && derivations && derivations.utilization! >= 80) {
            out.push({
                entity_type: 'ad_account', entity_id: selected.id, entity_name: selected.name,
                problem: `Spend cap al ${derivations.utilization!.toFixed(1)}%`,
                severity: derivations.utilization! >= 95 ? 'critical' : 'high',
                evidence: `amount_spent=${selected.amount_spent}, spend_cap=${selected.spend_cap}`,
                recommended_action: 'Aumentar spend_cap antes de pausa automática.',
                economic_impact: derivations.remaining !== null ? fmtMoneyCents(derivations.remaining, currency) : undefined,
                score_ref: 'billing_health_score', as_of: now,
            });
        }
        if (derivations?.days !== null && derivations && derivations.days! < 7) {
            out.push({
                entity_type: 'ad_account', entity_id: selected.id, entity_name: selected.name,
                problem: `Balance se agotará en ~${derivations.days!.toFixed(1)} días al ritmo actual`,
                severity: derivations.days! < 3 ? 'high' : 'medium',
                evidence: `burn_rate=${fmtMoneyCents(derivations.burn, currency)}/día`,
                recommended_action: 'Recargar balance o reducir budgets diarios.',
                score_ref: 'billing_health_score', as_of: now,
            });
        }
        for (const row of campaignAnalytics ?? []) {
            if (row.pacing.state === 'critically_accelerated' || row.pacing.state === 'accelerated') {
                out.push({
                    entity_type: 'campaign', entity_id: row.c.id, entity_name: row.c.name,
                    problem: row.pacing.state === 'critically_accelerated' ? 'Pacing crítico' : 'Pacing acelerado',
                    severity: row.pacing.state === 'critically_accelerated' ? 'high' : 'medium',
                    evidence: `spend=${row.c.spend ?? 0}, budget=${row.c.daily_budget ?? row.c.lifetime_budget ?? 0}`,
                    recommended_action: 'Reducir budget diario o ajustar bid strategy.',
                    score_ref: 'campaign_pacing_score', as_of: now,
                });
            }
            if (row.waste !== null && row.waste >= 60) {
                out.push({
                    entity_type: 'campaign', entity_id: row.c.id, entity_name: row.c.name,
                    problem: `Riesgo de desperdicio ${row.waste}/100`,
                    severity: row.waste >= 80 ? 'high' : 'medium',
                    evidence: `eficiencia ${row.eff.score}/100, clicks=${row.c.clicks ?? 0}`,
                    recommended_action: 'Iterar copy/creativo o pausar.',
                    score_ref: 'budget_waste_risk', as_of: now,
                });
            }
        }
        const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
    }, [selected, derivations, campaignAnalytics, currency]);

    useRegisterCopilotScope({
        module: 'ads',
        tenantId: tenantId ?? undefined,
        connectionId: connId || undefined,
        currency,
        active_account: selected ? { id: selected.id, name: selected.name } : null,
        summary: {
            accounts_count: accounts?.length,
            campaigns_count: campaigns?.length,
            campaigns_accelerating: (campaignAnalytics ?? []).filter(r =>
                r.pacing.state === 'accelerated' || r.pacing.state === 'critically_accelerated').length,
            campaigns_underpaced: (campaignAnalytics ?? []).filter(r => r.pacing.state === 'underpaced').length,
            campaigns_wasteful: (campaignAnalytics ?? []).filter(r => r.waste !== null && r.waste >= 60).length,
            total_spend_7d_cents: derivations?.spend7d,
        },
        top_decisions: recommendations.slice(0, 12),
        scores: billing ? [billing] : [],
        raw: { accounts: accounts ?? undefined, campaigns: campaigns ?? undefined },
    }, [tenantId, connId, selected, accounts, campaigns, campaignAnalytics, billing, derivations, recommendations]);

    if (!tenantId) return <div className="card"><h2>Falta tenant</h2><p className="muted">Abre desde <Link href="/panel">inicio</Link>.</p></div>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 26, marginBottom: 4 }}>📊 ADS — Workbench</h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Presupuesto, pacing y recomendaciones por cuenta publicitaria.
                    </p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

            {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>Error: {err}</div>}

            {/* Selectors */}
            <div className="card" style={{ marginBottom: 12 }}>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    {conns && conns.length > 1 && (
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                            <label className="label">Conexión</label>
                            <select value={connId} onChange={e => setConnId(e.target.value)}>
                                {conns.map(c => <option key={c.id} value={c.id}>{c.display_name ?? c.id.slice(0, 8)}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="field" style={{ marginBottom: 0, flex: '1 1 200px' }}>
                        <label className="label">Business Manager</label>
                        <select value={bmId} onChange={e => setBmId(e.target.value)} disabled={!bms}>
                            <option value="">— Todos —</option>
                            {bms?.map(b => <option key={b.id} value={b.id}>{b.name} · {b.role}</option>)}
                        </select>
                    </div>
                    <div className="field" style={{ marginBottom: 0, flex: '2 1 280px' }}>
                        <label className="label">AdAccount</label>
                        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} disabled={!accounts}>
                            {accounts?.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name} · {a.currency} · status {a.account_status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading && <p className="muted">Cargando cuentas…</p>}

            {selected && billing && derivations && (
                <>
                    {/* Tabs */}
                    <div className="row" style={{ gap: 4, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
                        <TabBtn active={tab === 'resumen'}     onClick={() => setTab('resumen')}>Resumen</TabBtn>
                        <TabBtn active={tab === 'budget'}      onClick={() => setTab('budget')}>Presupuesto & facturación</TabBtn>
                        <TabBtn active={tab === 'performance'} onClick={() => setTab('performance')}>Performance & pacing</TabBtn>
                        <TabBtn active={tab === 'reco'}        onClick={() => setTab('reco')}>
                            Recomendaciones {recommendations.length > 0 && <span className="pill pill-danger" style={{ fontSize: 10, marginLeft: 4 }}>{recommendations.length}</span>}
                        </TabBtn>
                    </div>

                    {tab === 'resumen' && <TabResumen acct={selected} billing={billing} derivations={derivations} currency={currency} />}
                    {tab === 'budget' && <TabBudget acct={selected} billing={billing} derivations={derivations} currency={currency} />}
                    {tab === 'performance' && <TabPerformance rows={campaignAnalytics} currency={currency} />}
                    {tab === 'reco' && <TabRecommendations items={recommendations} />}
                </>
            )}
        </>
    );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            background: 'transparent', border: 'none',
            padding: '10px 14px', fontSize: 13, cursor: 'pointer',
            color: active ? 'var(--text)' : 'var(--muted)',
            borderBottom: active ? '2px solid var(--accent, #A855F7)' : '2px solid transparent',
            fontWeight: active ? 600 : 400,
        }}>{children}</button>
    );
}

function TabResumen({ acct, billing, derivations, currency }: {
    acct: AdAccountSnapshot; billing: Score; derivations: any; currency: string;
}) {
    const st = ACCOUNT_STATUS[acct.account_status] ?? { label: `#${acct.account_status}`, klass: 'pill-muted' };
    return (
        <>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <ScoreCard score={billing} />
                <InfoCard label="Estado">
                    <span className={`pill ${st.klass}`}>{st.label}</span>
                    {acct.disable_reason ? <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>motivo #{acct.disable_reason}</div> : null}
                </InfoCard>
                <InfoCard label="Moneda / TZ"><strong>{acct.currency}</strong><div className="muted" style={{ fontSize: 11 }}>{acct.timezone_name ?? '—'}</div></InfoCard>
                <InfoCard label="ID Meta"><code style={{ fontSize: 11 }}>{acct.id}</code></InfoCard>
            </div>
            <div className="card">
                <h3 style={{ marginTop: 0, fontSize: 15 }}>Snapshot financiero</h3>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <Stat label="Gastado total" value={fmtMoneyCents(toCents(acct.amount_spent), currency)} />
                    <Stat label="Spend cap" value={toCents(acct.spend_cap) > 0 ? fmtMoneyCents(toCents(acct.spend_cap), currency) : 'Sin límite'} />
                    <Stat label="Balance actual" value={fmtMoneyCents(toCents(acct.balance), currency)} />
                    <Stat label="Utilización cap" value={derivations.utilization !== null ? fmtPct(derivations.utilization) : '—'}
                          tone={derivations.utilization !== null && derivations.utilization >= 80 ? 'warn' : undefined} />
                </div>
            </div>
        </>
    );
}

function TabBudget({ acct, billing, derivations, currency }: {
    acct: AdAccountSnapshot; billing: Score; derivations: any; currency: string;
}) {
    const util = derivations.utilization;
    return (
        <>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                <Stat label="Spend cap total" value={toCents(acct.spend_cap) > 0 ? fmtMoneyCents(toCents(acct.spend_cap), currency) : 'Sin límite'} />
                <Stat label="Consumido" value={fmtMoneyCents(toCents(acct.amount_spent), currency)} />
                <Stat label="Restante del cap" value={derivations.remaining !== null ? fmtMoneyCents(derivations.remaining, currency) : 'N/A'}
                      tone={derivations.remaining !== null && derivations.remaining < toCents(acct.spend_cap) * 0.1 ? 'warn' : undefined} />
                <Stat label="Balance" value={fmtMoneyCents(toCents(acct.balance), currency)} />
            </div>
            <div className="card" style={{ marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>Utilización del Spend Cap</h3>
                {util !== null ? (
                    <>
                        <div style={{ height: 12, background: 'rgba(255,255,255,.08)', borderRadius: 6, overflow: 'hidden', margin: '8px 0' }}>
                            <div style={{
                                width: `${Math.min(100, util)}%`, height: '100%',
                                background: util >= 95 ? '#ef4444' : util >= 80 ? '#f59e0b' : '#22c55e',
                                transition: 'width .3s',
                            }} />
                        </div>
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                            {fmtPct(util)} consumido · {derivations.remaining !== null ? `${fmtMoneyCents(derivations.remaining, currency)} restantes` : ''}
                        </p>
                    </>
                ) : <p className="muted" style={{ margin: 0 }}>Esta cuenta no tiene spend cap configurado.</p>}
            </div>
            <div className="card" style={{ marginBottom: 12 }}>
                <h3 style={{ marginTop: 0, fontSize: 15 }}>Burn rate (últimos 7 días)</h3>
                <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                    <Stat label="Spend 7d" value={fmtMoneyCents(derivations.spend7d, currency)} />
                    <Stat label="Ritmo diario" value={fmtMoneyCents(derivations.burn, currency)} />
                    <Stat label="Días hasta agotar balance" value={derivations.days !== null ? `${derivations.days.toFixed(1)}` : '∞'}
                          tone={derivations.days !== null && derivations.days < 7 ? 'warn' : undefined} />
                </div>
            </div>
            <ScoreCard score={billing} expanded />
        </>
    );
}

function TabPerformance({ rows, currency }: { rows: any[] | null; currency: string }) {
    if (rows === null) return <p className="muted">Cargando campañas…</p>;
    if (rows.length === 0) return <p className="muted">Sin campañas en esta cuenta.</p>;
    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,.03)' }}>
                            <th style={th}>Campaña</th>
                            <th style={th}>Status</th>
                            <th style={{ ...th, textAlign: 'right' }}>Spend 7d</th>
                            <th style={{ ...th, textAlign: 'right' }}>Clicks</th>
                            <th style={{ ...th, textAlign: 'right' }}>CTR</th>
                            <th style={{ ...th, textAlign: 'right' }}>CPC</th>
                            <th style={{ ...th, textAlign: 'center' }}>Eficiencia</th>
                            <th style={{ ...th, textAlign: 'center' }}>Pacing</th>
                            <th style={{ ...th, textAlign: 'center' }}>Waste</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r: any) => (
                            <tr key={r.c.id} style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                                <td style={td}>
                                    <div style={{ fontWeight: 600 }}>{r.c.name}</div>
                                    <div className="muted" style={{ fontSize: 11 }}>{r.c.objective ?? '—'}</div>
                                </td>
                                <td style={td}><span className="pill pill-muted" style={{ fontSize: 10 }}>{r.c.effective_status ?? r.c.status}</span></td>
                                <td style={{ ...td, textAlign: 'right' }}>{fmtMoneyCents(toCents(r.c.spend), currency)}</td>
                                <td style={{ ...td, textAlign: 'right' }}>{fmtInt(Number(r.c.clicks ?? 0))}</td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                    {Number(r.c.impressions ?? 0) > 0 ? fmtPct((Number(r.c.clicks ?? 0) / Number(r.c.impressions ?? 0)) * 100) : '—'}
                                </td>
                                <td style={{ ...td, textAlign: 'right' }}>
                                    {Number(r.c.clicks ?? 0) > 0 ? fmtMoneyCents(toCents(r.c.spend) / Number(r.c.clicks), currency) : '—'}
                                </td>
                                <td style={{ ...td, textAlign: 'center' }}><ScorePill value={r.eff.score} tooltip={r.eff.explanation} /></td>
                                <td style={{ ...td, textAlign: 'center' }}><PacingPill state={r.pacing.state} /></td>
                                <td style={{ ...td, textAlign: 'center' }}>
                                    {r.waste !== null ? <ScorePill value={100 - r.waste} tooltip={`Waste risk ${r.waste}/100`} /> : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TabRecommendations({ items }: { items: DecisionItem[] }) {
    if (items.length === 0) return (
        <div className="card"><p style={{ margin: 0 }} className="muted">✅ Sin recomendaciones pendientes para esta cuenta.</p></div>
    );
    return (
        <div className="card" style={{ padding: 0 }}>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,.03)' }}>
                            <th style={th}>Sev.</th>
                            <th style={th}>Entidad</th>
                            <th style={th}>Problema</th>
                            <th style={th}>Evidencia</th>
                            <th style={th}>Acción</th>
                            <th style={th}>Impacto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((d, i) => (
                            <tr key={`${d.entity_id}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                                <td style={td}><SevPill s={d.severity} /></td>
                                <td style={td}>
                                    <div style={{ fontWeight: 600 }}>{d.entity_name}</div>
                                    <div className="muted" style={{ fontSize: 11 }}>{d.entity_type}</div>
                                </td>
                                <td style={td}>{d.problem}</td>
                                <td style={{ ...td, fontSize: 11, color: 'var(--muted)' }}>{d.evidence}</td>
                                <td style={td}>{d.recommended_action}</td>
                                <td style={{ ...td, fontSize: 12 }}>{d.economic_impact ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ScoreCard({ score, expanded }: { score: Score; expanded?: boolean }) {
    const color = score.score >= 75 ? '#22c55e' : score.score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="card" title={score.explanation} style={{
            flex: expanded ? '1 1 100%' : '1 1 220px', minWidth: 220, marginBottom: 0,
            borderLeft: `3px solid ${color}`,
        }}>
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>{score.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 4 }}>{score.score}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                {score.factors.map(f => (
                    <div key={f.key} style={{ marginTop: 2 }}>
                        {f.label}: <strong style={{ color: 'var(--text)' }}>{Math.round(f.value)}</strong>
                        <span style={{ opacity: .6 }}> · peso {(f.weight * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="card" style={{ flex: '1 1 180px', minWidth: 180, marginBottom: 0 }}>
            <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ marginTop: 6 }}>{children}</div>
        </div>
    );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'warn' | 'danger' }) {
    const color = tone === 'danger' ? '#ef4444' : tone === 'warn' ? '#f59e0b' : undefined;
    return (
        <div style={{
            flex: '1 1 180px', minWidth: 160,
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
        }}>
            <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: color ?? 'var(--text)', marginTop: 2 }}>{value}</div>
        </div>
    );
}

function ScorePill({ value, tooltip }: { value: number; tooltip?: string }) {
    const bg = value >= 75 ? '#22c55e' : value >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <span title={tooltip} style={{
            display: 'inline-block', minWidth: 32,
            background: bg, color: 'white', fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 4,
        }}>{value}</span>
    );
}

function PacingPill({ state }: { state: string | null }) {
    if (!state) return <span className="muted">—</span>;
    const map: Record<string, { bg: string; label: string }> = {
        on_track: { bg: '#22c55e', label: 'on track' },
        underpaced: { bg: '#64748b', label: 'lento' },
        accelerated: { bg: '#f59e0b', label: 'acelerado' },
        critically_accelerated: { bg: '#ef4444', label: 'crítico' },
    };
    const s = map[state] ?? { bg: '#64748b', label: state };
    return <span style={{ background: s.bg, color: 'white', fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>{s.label}</span>;
}

function SevPill({ s }: { s: Severity }) {
    const map: Record<Severity, { bg: string; label: string }> = {
        critical: { bg: '#ef4444', label: 'CRIT' },
        high:     { bg: '#f97316', label: 'HIGH' },
        medium:   { bg: '#f59e0b', label: 'MED'  },
        low:      { bg: '#64748b', label: 'LOW'  },
    };
    const { bg, label } = map[s];
    return <span style={{ background: bg, color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>{label}</span>;
}

const th: React.CSSProperties = { padding: '10px 12px', fontSize: 11, textTransform: 'uppercase', letterSpacing: .5, color: 'var(--muted)', fontWeight: 600, textAlign: 'left' };
const td: React.CSSProperties = { padding: '10px 12px' };

export default function AdsPage() {
    return <Suspense><AdsContent /></Suspense>;
}
