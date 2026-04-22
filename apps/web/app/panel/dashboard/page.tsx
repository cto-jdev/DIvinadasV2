'use client';
/**
 * Dashboard Principal — plataforma de decisión.
 * Spec: dashboard_meta_claude_spec.md §7.1.
 *
 * Consume las capas de dominio (types + budget + scoring) y renderiza:
 *  - Top bar con selectores + freshness
 *  - 8 tarjetas de resumen ejecutivo (incluye Global Health Score)
 *  - Budget Health Summary (spend 7d, cuentas cerca de cap, pacing)
 *  - Global Decision Queue (prioriza acciones con evidencia y severidad)
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type {
    AdAccountSnapshot, CampaignSnapshot, PageSnapshot, BmSnapshot,
    DecisionItem, Score, Severity,
} from '@/lib/domain/types';
import {
    toCents, capUtilizationPct, remainingCapCents,
    expectedSpendToDate, classifyPacing, budgetWasteRisk,
} from '@/lib/domain/budget';
import {
    billingHealthScore, campaignEfficiencyScore, campaignPacingScore,
    pageHealthScore, accessRiskScore, globalHealthScore,
} from '@/lib/domain/scoring';

type Conn = { id: string; display_name: string | null; email: string | null; status: string };
type Status = 'loading' | 'ready' | 'reconnect' | 'no_conns' | 'error';

const NOW_ISO = () => new Date().toISOString();

function DashboardContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState<string>('');
    const [bms, setBms] = useState<BmSnapshot[] | null>(null);
    const [accounts, setAccounts] = useState<AdAccountSnapshot[] | null>(null);
    const [pages, setPages] = useState<PageSnapshot[] | null>(null);
    const [campaigns, setCampaigns] = useState<Record<string, CampaignSnapshot[]>>({});
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('loading');

    const loadConns = useCallback(async () => {
        if (!tenantId) return;
        const r = await apiFetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) { setErr(j.error ?? `HTTP ${r.status}`); setStatus('error'); return; }
        setConns(j.data);
        if (j.data?.length === 0) { setStatus('no_conns'); return; }
        if (!connId) setConnId(j.data[0].id);
    }, [tenantId, connId]);

    useEffect(() => { loadConns(); }, [loadConns]);

    const loadAll = useCallback(async () => {
        if (!tenantId || !connId) return;
        setStatus('loading'); setErr(null);
        setBms(null); setAccounts(null); setPages(null); setCampaigns({});

        const qs = `tenant_id=${tenantId}&connection_id=${connId}`;
        const [bmRes, acctRes, pagesRes] = await Promise.all([
            apiFetch(`/api/web/graph/bm/list?${qs}`),
            apiFetch(`/api/web/graph/adaccounts/list?${qs}`),
            apiFetch(`/api/web/graph/pages/list?${qs}`),
        ]);
        const [bmJ, acctJ, pagesJ] = await Promise.all([
            bmRes.json().catch(() => ({})),
            acctRes.json().catch(() => ({})),
            pagesRes.json().catch(() => ({})),
        ]);

        const tokenMissing = [bmJ, acctJ, pagesJ].some(j =>
            j?.message === 'token_unavailable' || j?.error === 'token_unavailable',
        );
        if (tokenMissing) { setStatus('reconnect'); return; }
        if (!bmRes.ok)   { setErr(bmJ.message ?? `BM ${bmRes.status}`); setStatus('error'); return; }
        if (!acctRes.ok) { setErr(acctJ.message ?? `ADS ${acctRes.status}`); setStatus('error'); return; }

        const now = NOW_ISO();
        const bmList: BmSnapshot[] = (bmJ.data ?? []).map((b: any) => ({
            id: b.id, name: b.name, role: b.role,
            verification_status: b.verification_status,
            source_type: 'api', source_endpoint: '/me/businesses|client_businesses', last_sync_at: now,
        }));
        const acctList: AdAccountSnapshot[] = (acctJ.data ?? []).map((a: any) => ({
            id: a.id, name: a.name, currency: a.currency,
            account_status: a.account_status,
            amount_spent: a.amount_spent, spend_cap: a.spend_cap, balance: a.balance,
            disable_reason: a.disable_reason, timezone_name: a.timezone_name,
            business_id: a.business?.id ?? null,
            source_type: 'api', source_endpoint: '/me/adaccounts', last_sync_at: now,
        }));
        const pageList: PageSnapshot[] = pagesRes.ok ? (pagesJ.data ?? []).map((p: any) => ({
            id: p.id, name: p.name, category: p.category,
            fan_count: p.fan_count, followers_count: p.followers_count,
            verification_status: p.verification_status,
            link: p.link, is_published: p.is_published,
            instagram_business_account: p.instagram_business_account ?? null,
            picture_url: p.picture?.data?.url,
            source_type: 'api', source_endpoint: '/me/accounts', last_sync_at: now,
        })) : [];

        setBms(bmList); setAccounts(acctList); setPages(pageList);
        setLastSync(now);

        const firstActive = acctList.find(a => a.account_status === 1) ?? acctList[0];
        if (firstActive) setSelectedAccount(firstActive.id);
        setStatus('ready');
    }, [tenantId, connId]);

    useEffect(() => { if (connId) loadAll(); }, [connId, loadAll]);

    // Load campaigns for the currently selected account (lazy, per-account cache).
    useEffect(() => {
        if (!tenantId || !connId || !selectedAccount) return;
        if (campaigns[selectedAccount]) return;
        const qs = `tenant_id=${tenantId}&connection_id=${connId}&ad_account_id=${selectedAccount}`;
        apiFetch(`/api/web/graph/campaigns/list?${qs}`)
            .then(r => r.json().catch(() => ({})))
            .then(j => {
                const now = NOW_ISO();
                const list: CampaignSnapshot[] = (j.data ?? []).map((c: any) => ({
                    id: c.id, ad_account_id: selectedAccount, name: c.name,
                    objective: c.objective, status: c.status, effective_status: c.effective_status,
                    daily_budget: c.daily_budget, lifetime_budget: c.lifetime_budget,
                    budget_remaining: c.budget_remaining, bid_strategy: c.bid_strategy,
                    buying_type: c.buying_type, start_time: c.start_time, stop_time: c.stop_time,
                    spend: c.spend, impressions: c.impressions, clicks: c.clicks,
                    source_type: 'api', source_endpoint: '/{acct}/campaigns+insights', last_sync_at: now,
                }));
                setCampaigns(prev => ({ ...prev, [selectedAccount]: list }));
            });
    }, [tenantId, connId, selectedAccount, campaigns]);

    // Scoring + derivations
    const derived = useMemo(() => {
        if (!accounts || !bms || !pages) return null;

        const billing = accounts.map(a => billingHealthScore(a));
        const pageScores = pages.map(p => pageHealthScore(p));
        const access = accessRiskScore(bms);
        const global = globalHealthScore({ billing, pages: pageScores, access });

        const totalSpend7d = Object.values(campaigns).flat().reduce((a, c) => a + toCents(c.spend), 0);

        const accountsNearCap = accounts.filter(a => {
            const u = capUtilizationPct(a.amount_spent, a.spend_cap);
            return u !== null && u >= 80;
        });
        const accountsFrozen = accounts.filter(a => a.account_status !== 1);

        const allCamps = Object.values(campaigns).flat();
        const pacingList = allCamps.map(c => ({ c, ...campaignPacingScore(c) }));
        const accelerating = pacingList.filter(p => p.state === 'accelerated' || p.state === 'critically_accelerated');
        const underpaced = pacingList.filter(p => p.state === 'underpaced');
        const wasteful = allCamps.filter(c => {
            const r = budgetWasteRisk({
                spendCents: toCents(c.spend),
                clicks: Number(c.clicks ?? 0),
                impressions: Number(c.impressions ?? 0),
            });
            return r !== null && r >= 60;
        });

        return {
            billing, pageScores, access, global,
            totalSpend7d, accountsNearCap, accountsFrozen,
            accelerating, underpaced, wasteful,
        };
    }, [accounts, bms, pages, campaigns]);

    const decisions: DecisionItem[] = useMemo(() => {
        if (!derived || !accounts) return [];
        const now = NOW_ISO();
        const out: DecisionItem[] = [];

        for (const a of derived.accountsFrozen) {
            out.push({
                entity_type: 'ad_account', entity_id: a.id, entity_name: a.name,
                problem: `Cuenta con estado ${a.account_status} (${a.disable_reason ? 'bloqueada' : 'inactiva'})`,
                severity: a.account_status === 2 ? 'critical' : 'high',
                evidence: `account_status=${a.account_status}, disable_reason=${a.disable_reason ?? '—'}`,
                recommended_action: 'Revisar motivo en Ads Manager y apelar si procede.',
                score_ref: 'billing_health_score',
                as_of: now,
            });
        }
        for (const a of derived.accountsNearCap) {
            const u = capUtilizationPct(a.amount_spent, a.spend_cap) ?? 0;
            const remaining = remainingCapCents(a.amount_spent, a.spend_cap);
            out.push({
                entity_type: 'ad_account', entity_id: a.id, entity_name: a.name,
                problem: `Spend cap al ${u.toFixed(1)}%`,
                severity: u >= 95 ? 'critical' : 'high',
                evidence: `amount_spent=${a.amount_spent}, spend_cap=${a.spend_cap}`,
                recommended_action: 'Aumentar spend_cap antes de pausa automática.',
                economic_impact: remaining !== null ? `${a.currency} ${(remaining / 100).toFixed(2)} restantes` : undefined,
                score_ref: 'billing_health_score', as_of: now,
            });
        }
        for (const p of derived.accelerating) {
            out.push({
                entity_type: 'campaign', entity_id: p.c.id, entity_name: p.c.name,
                problem: p.state === 'critically_accelerated' ? 'Pacing críticamente acelerado' : 'Pacing acelerado',
                severity: p.state === 'critically_accelerated' ? 'high' : 'medium',
                evidence: `spend_7d=${p.c.spend ?? 0}, daily_budget=${p.c.daily_budget ?? p.c.lifetime_budget ?? 0}`,
                recommended_action: 'Revisar bid strategy o reducir budget diario.',
                score_ref: 'campaign_pacing_score', as_of: now,
            });
        }
        for (const p of derived.underpaced) {
            out.push({
                entity_type: 'campaign', entity_id: p.c.id, entity_name: p.c.name,
                problem: 'Campaña no gasta lo planificado (underpaced)',
                severity: 'low',
                evidence: `spend_7d=${p.c.spend ?? 0}, expected>${toCents(p.c.daily_budget).toFixed(0)}`,
                recommended_action: 'Ampliar audiencia, revisar bid o creativo.',
                score_ref: 'campaign_pacing_score', as_of: now,
            });
        }
        for (const c of derived.wasteful) {
            out.push({
                entity_type: 'campaign', entity_id: c.id, entity_name: c.name,
                problem: 'Riesgo alto de desperdicio presupuestal',
                severity: 'medium',
                evidence: `ctr/cpc/clicks por debajo de umbrales (spend=${c.spend ?? 0})`,
                recommended_action: 'Iterar copy/creatividad o pausar.',
                score_ref: 'budget_waste_risk', as_of: now,
            });
        }
        const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
    }, [derived, accounts]);

    if (!tenantId) return (
        <div className="card">
            <h2>Falta tenant</h2>
            <p className="muted">Abre un workspace desde <Link href="/panel">inicio</Link>.</p>
        </div>
    );

    const currency = accounts?.find(a => a.id === selectedAccount)?.currency ?? 'USD';

    return (
        <>
            <header className="row-between" style={{ marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 28, marginBottom: 4 }}>🏠 Dashboard Principal</h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Plataforma de decisión: prioriza acciones sobre presupuesto, accesos y calidad.
                    </p>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {lastSync && (
                        <span className="muted" style={{ fontSize: 12 }}>
                            ◷ Sync {new Date(lastSync).toLocaleTimeString()}
                        </span>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={loadAll}>↻ Refrescar</button>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-ghost btn-sm">Conexiones</Link>
                </div>
            </header>

            {/* Top bar: connection + account selector */}
            {status === 'ready' && accounts && accounts.length > 0 && (
                <div className="card" style={{ marginBottom: 12 }}>
                    <div className="row" style={{ gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        {conns && conns.length > 1 && (
                            <div className="field" style={{ marginBottom: 0, flex: '1 1 220px' }}>
                                <label className="label">Cuenta Meta</label>
                                <select value={connId} onChange={e => setConnId(e.target.value)}>
                                    {conns.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.display_name ?? c.email ?? c.id.slice(0, 8)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 260px' }}>
                            <label className="label">AdAccount activa</label>
                            <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)}>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} ({a.currency}) · status {a.account_status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <span className="muted" style={{ fontSize: 12 }}>
                            Ventana: últimos 7 días · fuente API Meta
                        </span>
                    </div>
                </div>
            )}

            {status === 'no_conns' && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <h3>Sin conexiones Meta</h3>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-primary">+ Conectar Meta</Link>
                </div>
            )}

            {status === 'reconnect' && (
                <div className="card" style={{ padding: 32, borderLeft: '4px solid #f59e0b' }}>
                    <h3 style={{ marginTop: 0 }}>⚠ Reconecta tu cuenta de Meta</h3>
                    <p>El token de acceso no está disponible. Vuelve a conectar para restaurar el Graph API.</p>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-primary">Ir a Conexiones</Link>
                </div>
            )}

            {status === 'error' && err && <div className="alert alert-error">Error: {err}</div>}
            {status === 'loading' && <p className="muted">Cargando Graph API…</p>}

            {status === 'ready' && derived && (
                <>
                    {/* Executive summary */}
                    <div className="row" style={{ gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <HealthCard score={derived.global} accent />
                        <Kpi icon="💼" label="BMs" value={bms?.length ?? 0} />
                        <Kpi icon="📊" label="AdAccounts" value={accounts?.length ?? 0}
                             hint={`${accounts?.filter(a => a.account_status === 1).length ?? 0} activas`} />
                        <Kpi icon="📄" label="Pages" value={pages?.length ?? 0}
                             hint={`${pages?.filter(p => p.instagram_business_account).length ?? 0} con IG`} />
                        <Kpi icon="🛡" label="Access risk" value={Math.round(100 - derived.access.score)}
                             accent={derived.access.score < 60 ? '#ef4444' : undefined}
                             hint={derived.access.score < 60 ? 'Vulnerable' : 'OK'} />
                        <Kpi icon="🚨" label="Decisiones críticas"
                             value={decisions.filter(d => d.severity === 'critical' || d.severity === 'high').length}
                             accent={decisions.some(d => d.severity === 'critical') ? '#ef4444' : undefined} />
                    </div>

                    {/* Budget Health Summary */}
                    <section className="card" style={{ marginBottom: 12 }}>
                        <div className="row-between" style={{ marginBottom: 10 }}>
                            <h2 style={{ fontSize: 16, margin: 0 }}>💰 Budget Health Summary</h2>
                            <span className="muted" style={{ fontSize: 11 }}>últimos 7 días</span>
                        </div>
                        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                            <MiniStat label="Spend 7d" value={`${currency} ${(derived.totalSpend7d / 100).toFixed(2)}`} />
                            <MiniStat label="Cuentas ≥80% cap" value={derived.accountsNearCap.length}
                                      tone={derived.accountsNearCap.length > 0 ? 'warn' : 'ok'} />
                            <MiniStat label="Cuentas bloqueadas" value={derived.accountsFrozen.length}
                                      tone={derived.accountsFrozen.length > 0 ? 'danger' : 'ok'} />
                            <MiniStat label="Campañas aceleradas" value={derived.accelerating.length}
                                      tone={derived.accelerating.length > 0 ? 'warn' : 'ok'} />
                            <MiniStat label="Campañas underpaced" value={derived.underpaced.length}
                                      tone={derived.underpaced.length > 0 ? 'warn' : 'ok'} />
                            <MiniStat label="Riesgo de desperdicio" value={derived.wasteful.length}
                                      tone={derived.wasteful.length > 0 ? 'warn' : 'ok'} />
                        </div>
                        {Object.keys(campaigns).length === 0 && (
                            <p className="muted" style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>
                                Selecciona una AdAccount para cargar campañas y activar pacing/eficiencia.
                            </p>
                        )}
                    </section>

                    {/* Global Decision Queue */}
                    <section className="card" style={{ marginBottom: 12 }}>
                        <div className="row-between" style={{ marginBottom: 10 }}>
                            <h2 style={{ fontSize: 16, margin: 0 }}>🧭 Global Decision Queue</h2>
                            <span className="muted" style={{ fontSize: 11 }}>{decisions.length} items</span>
                        </div>
                        {decisions.length === 0 ? (
                            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                                Sin alertas. Sigue monitoreando pacing y spend cap.
                            </p>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: 'var(--muted)' }}>
                                            <th style={thStyle}>Sev.</th>
                                            <th style={thStyle}>Entidad</th>
                                            <th style={thStyle}>Problema</th>
                                            <th style={thStyle}>Evidencia</th>
                                            <th style={thStyle}>Acción</th>
                                            <th style={thStyle}>Impacto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {decisions.slice(0, 20).map((d, i) => (
                                            <tr key={`${d.entity_id}-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                                                <td style={tdStyle}><SevPill s={d.severity} /></td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: 600 }}>{d.entity_name}</div>
                                                    <div className="muted" style={{ fontSize: 11 }}>{d.entity_type}</div>
                                                </td>
                                                <td style={tdStyle}>{d.problem}</td>
                                                <td style={{ ...tdStyle, fontSize: 11, color: 'var(--muted)' }}>{d.evidence}</td>
                                                <td style={tdStyle}>{d.recommended_action}</td>
                                                <td style={{ ...tdStyle, fontSize: 12 }}>{d.economic_impact ?? '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                    {/* Modules */}
                    <section>
                        <h2 style={{ fontSize: 16, marginBottom: 10 }}>Módulos</h2>
                        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                            <ModuleCard icon="📊" title="ADS" desc="Cuentas, spend cap, balance, pacing."
                                href={`/panel/ads?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard icon="💼" title="BM Hub" desc="Business Managers, verificación, accesos."
                                href={`/panel/bm?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard icon="📄" title="Pages" desc="Fanpages: IG, publicación, verificación."
                                href={`/panel/pages?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard icon="🧬" title="Clonner" desc="Clona anuncios A/B." soon
                                href={`/panel/clonner?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard icon="🤖" title="Copilot" desc="IA agentic sobre tu data." soon
                                href={`/panel/copilot?tenant=${tenantId}&conn=${connId}`} />
                        </div>
                    </section>
                </>
            )}
        </>
    );
}

const thStyle: React.CSSProperties = { padding: '8px 10px', fontSize: 11, textTransform: 'uppercase', letterSpacing: .5 };
const tdStyle: React.CSSProperties = { padding: '10px', verticalAlign: 'top' };

function SevPill({ s }: { s: Severity }) {
    const map: Record<Severity, { bg: string; label: string }> = {
        critical: { bg: '#ef4444', label: 'CRIT' },
        high:     { bg: '#f97316', label: 'HIGH' },
        medium:   { bg: '#f59e0b', label: 'MED'  },
        low:      { bg: '#64748b', label: 'LOW'  },
    };
    const { bg, label } = map[s];
    return <span style={{
        background: bg, color: 'white', fontSize: 10, fontWeight: 700,
        padding: '2px 6px', borderRadius: 4, letterSpacing: .5,
    }}>{label}</span>;
}

function HealthCard({ score, accent }: { score: Score; accent?: boolean }) {
    const color = score.score >= 75 ? '#22c55e' : score.score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="card" title={score.explanation} style={{
            flex: '1 1 220px', minWidth: 220, marginBottom: 0,
            borderLeft: accent ? `3px solid ${color}` : undefined,
        }}>
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>{score.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 4 }}>{score.score}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                {score.factors.map(f => `${f.label} ${Math.round(f.value)}`).join(' · ')}
            </div>
        </div>
    );
}

function Kpi({ icon, label, value, hint, accent }: {
    icon: string; label: string; value: number | string; hint?: string; accent?: string;
}) {
    return (
        <div className="card" style={{ flex: '1 1 150px', minWidth: 150, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: accent ?? 'var(--text)', marginTop: 4 }}>{value}</div>
            {hint && <div className="muted" style={{ fontSize: 11 }}>{hint}</div>}
        </div>
    );
}

function MiniStat({ label, value, tone }: {
    label: string; value: string | number; tone?: 'ok' | 'warn' | 'danger';
}) {
    const color = tone === 'danger' ? '#ef4444' : tone === 'warn' ? '#f59e0b' : undefined;
    return (
        <div style={{
            flex: '1 1 150px', minWidth: 140,
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
        }}>
            <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: color ?? 'var(--text)', marginTop: 2 }}>{value}</div>
        </div>
    );
}

function ModuleCard({ icon, title, desc, href, soon }: {
    icon: string; title: string; desc: string; href: string; soon?: boolean;
}) {
    const content = (
        <div className="card" style={{
            flex: '1 1 220px', minWidth: 220, marginBottom: 0,
            opacity: soon ? 0.7 : 1, cursor: soon ? 'default' : 'pointer',
        }}>
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div style={{ fontSize: 24 }}>{icon}</div>
                {soon && <span className="pill pill-muted" style={{ fontSize: 10 }}>Soon</span>}
            </div>
            <h3 style={{ margin: '8px 0 4px', fontSize: 15 }}>{title}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 12 }}>{desc}</p>
        </div>
    );
    if (soon) return <div style={{ flex: '1 1 220px' }}>{content}</div>;
    return <Link href={href} style={{ textDecoration: 'none', flex: '1 1 220px' }}>{content}</Link>;
}

export default function DashboardPage() {
    return <Suspense><DashboardContent /></Suspense>;
}
