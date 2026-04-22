'use client';
/**
 * Dashboard Principal — plataforma de decisión (2026 UX rev).
 * Spec: dashboard_meta_claude_spec.md §7.1.
 *
 * Mejoras UX 2026:
 *  - Sticky module bar con glassmorphism y freshness dot animado.
 *  - Skeleton loaders en lugar de texto "Cargando".
 *  - Decision queue ordenable y filtrable por severidad.
 *  - Atajo de teclado R para refrescar.
 *  - Score cards con barras de factores animadas.
 *  - Animación fade-in por sección.
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type {
    AdAccountSnapshot, CampaignSnapshot, PageSnapshot, BmSnapshot,
    BmUsersSnapshot, DecisionItem, Severity,
} from '@/lib/domain/types';
import {
    toCents, capUtilizationPct, remainingCapCents,
    classifyPacing, expectedSpendToDate, budgetWasteRisk,
} from '@/lib/domain/budget';
import {
    billingHealthScore, campaignPacingScore,
    pageHealthScore, accessRiskScore, globalHealthScore,
} from '@/lib/domain/scoring';
import {
    ScoreCard, Stat, SeverityChip, Segmented, SkeletonRow, SkeletonStats,
    EmptyState, FreshnessBadge, SortableTable, SectionHeader, type Column,
} from '@/components/dashboard/primitives';

type Conn = { id: string; display_name: string | null; email: string | null; status: string };
type Status = 'loading' | 'ready' | 'reconnect' | 'no_conns' | 'error';
type SevFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';

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
    const [bmUsers, setBmUsers] = useState<Record<string, BmUsersSnapshot>>({});
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [status, setStatus] = useState<Status>('loading');
    const [sevFilter, setSevFilter] = useState<SevFilter>('all');

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
        setBms(null); setAccounts(null); setPages(null); setCampaigns({}); setBmUsers({});

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

        // Load BM users in background (best-effort, may 403 if scope missing).
        for (const bm of bmList) {
            const r = await apiFetch(`/api/web/graph/bm/users?${qs}&bm_id=${bm.id}`);
            if (!r.ok) continue;
            const j = await r.json().catch(() => null);
            if (!j?.data) continue;
            setBmUsers(prev => ({
                ...prev,
                [bm.id]: {
                    bm_id: bm.id,
                    humans: j.data.business_users.map((u: any) => ({ ...u, kind: 'human' as const })),
                    system: j.data.system_users.map((u: any) => ({ ...u, kind: 'system' as const })),
                    pending: j.data.pending_users.map((u: any) => ({ ...u, kind: 'pending' as const })),
                    scope_missing: j.scope_missing,
                    source_type: 'api',
                    source_endpoint: j.source_endpoint,
                    last_sync_at: now,
                },
            }));
        }
    }, [tenantId, connId]);

    useEffect(() => { if (connId) loadAll(); }, [connId, loadAll]);

    // Keyboard shortcut: R to refresh.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey
                && document.activeElement?.tagName !== 'INPUT'
                && document.activeElement?.tagName !== 'SELECT'
                && document.activeElement?.tagName !== 'TEXTAREA') {
                loadAll();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [loadAll]);

    // Lazy load campaigns for selected account.
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

    const derived = useMemo(() => {
        if (!accounts || !bms || !pages) return null;
        const billing = accounts.map(a => billingHealthScore(a));
        const pageScores = pages.map(p => pageHealthScore(p));
        const access = accessRiskScore(bms, Object.keys(bmUsers).length > 0 ? bmUsers : undefined);
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
        return { billing, pageScores, access, global, totalSpend7d, accountsNearCap, accountsFrozen, accelerating, underpaced, wasteful };
    }, [accounts, bms, pages, campaigns, bmUsers]);

    const decisions: DecisionItem[] = useMemo(() => {
        if (!derived || !accounts) return [];
        const now = NOW_ISO();
        const out: DecisionItem[] = [];
        for (const a of derived.accountsFrozen) {
            out.push({
                entity_type: 'ad_account', entity_id: a.id, entity_name: a.name,
                problem: `Cuenta con estado ${a.account_status}`,
                severity: a.account_status === 2 ? 'critical' : 'high',
                evidence: `account_status=${a.account_status}, disable_reason=${a.disable_reason ?? '—'}`,
                recommended_action: 'Revisar motivo y apelar en Ads Manager.',
                score_ref: 'billing_health_score', as_of: now,
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
                economic_impact: remaining !== null ? `${a.currency} ${(remaining / 100).toFixed(2)} rest.` : undefined,
                score_ref: 'billing_health_score', as_of: now,
            });
        }
        for (const p of derived.accelerating) {
            out.push({
                entity_type: 'campaign', entity_id: p.c.id, entity_name: p.c.name,
                problem: p.state === 'critically_accelerated' ? 'Pacing crítico' : 'Pacing acelerado',
                severity: p.state === 'critically_accelerated' ? 'high' : 'medium',
                evidence: `spend_7d=${p.c.spend ?? 0}, budget=${p.c.daily_budget ?? p.c.lifetime_budget ?? 0}`,
                recommended_action: 'Revisar bid strategy o reducir budget diario.',
                score_ref: 'campaign_pacing_score', as_of: now,
            });
        }
        for (const p of derived.underpaced) {
            out.push({
                entity_type: 'campaign', entity_id: p.c.id, entity_name: p.c.name,
                problem: 'Campaña underpaced',
                severity: 'low',
                evidence: `spend_7d=${p.c.spend ?? 0}`,
                recommended_action: 'Ampliar audiencia, revisar bid o creativo.',
                score_ref: 'campaign_pacing_score', as_of: now,
            });
        }
        for (const c of derived.wasteful) {
            out.push({
                entity_type: 'campaign', entity_id: c.id, entity_name: c.name,
                problem: 'Riesgo alto de desperdicio',
                severity: 'medium',
                evidence: `ctr/cpc fuera de rango (spend=${c.spend ?? 0})`,
                recommended_action: 'Iterar copy/creatividad o pausar.',
                score_ref: 'budget_waste_risk', as_of: now,
            });
        }
        const rank: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
    }, [derived, accounts]);

    const filteredDecisions = useMemo(() => {
        if (sevFilter === 'all') return decisions;
        return decisions.filter(d => d.severity === sevFilter);
    }, [decisions, sevFilter]);

    const sevCounts = useMemo(() => {
        const out: Record<SevFilter, number> = { all: decisions.length, critical: 0, high: 0, medium: 0, low: 0 };
        for (const d of decisions) out[d.severity]++;
        return out;
    }, [decisions]);

    if (!tenantId) return (
        <div className="card">
            <h2>Falta tenant</h2>
            <p className="muted">Abre un workspace desde <Link href="/panel">inicio</Link>.</p>
        </div>
    );

    const currency = accounts?.find(a => a.id === selectedAccount)?.currency ?? 'USD';

    return (
        <>
            <header className="row-between fade-in" style={{ marginBottom: 14, gap: 12, flexWrap: 'wrap' }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 28, marginBottom: 4, lineHeight: 1.1 }}>
                        🏠 Dashboard Principal
                    </h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Plataforma de decisión · prioriza presupuesto, accesos y calidad. <kbd style={{
                            padding: '1px 6px', borderRadius: 4, background: 'rgba(255,255,255,.05)',
                            border: '1px solid var(--border-hi)', fontSize: 10,
                        }}>R</kbd> refrescar.
                    </p>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FreshnessBadge lastSync={lastSync} status="ok" />
                    <button className="btn btn-ghost btn-sm" onClick={loadAll} aria-label="Refrescar">↻</button>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-ghost btn-sm">Conexiones</Link>
                </div>
            </header>

            {/* Sticky top bar */}
            {status === 'ready' && accounts && accounts.length > 0 && (
                <div className="module-bar fade-in">
                    <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        {conns && conns.length > 1 && (
                            <div style={{ flex: '1 1 200px', minWidth: 180 }}>
                                <label className="label" style={{ fontSize: 10, marginBottom: 2 }}>Conexión</label>
                                <select value={connId} onChange={e => setConnId(e.target.value)} style={{ padding: '7px 10px', fontSize: 13 }}>
                                    {conns.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.display_name ?? c.email ?? c.id.slice(0, 8)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div style={{ flex: '2 1 260px', minWidth: 220 }}>
                            <label className="label" style={{ fontSize: 10, marginBottom: 2 }}>AdAccount activa</label>
                            <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} style={{ padding: '7px 10px', fontSize: 13 }}>
                                {accounts.map(a => (
                                    <option key={a.id} value={a.id}>
                                        {a.name} · {a.currency} · status {a.account_status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="muted" style={{ fontSize: 11 }}>
                            Ventana: últimos 7 días · {bms?.length ?? 0} BMs · {accounts.length} cuentas · {pages?.length ?? 0} pages
                        </div>
                    </div>
                </div>
            )}

            {status === 'no_conns' && (
                <EmptyState
                    icon="◇"
                    title="Sin conexiones Meta"
                    description="Conecta tu primera cuenta para activar el dashboard."
                    cta={<Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-primary">+ Conectar Meta</Link>}
                />
            )}

            {status === 'reconnect' && (
                <div className="card" style={{ padding: 28, borderLeft: '3px solid var(--warning)' }}>
                    <h3 style={{ marginTop: 0 }}>⚠ Reconecta tu cuenta de Meta</h3>
                    <p className="muted">El token de acceso no está disponible. Vuelve a conectar para restaurar el Graph API.</p>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-primary">Ir a Conexiones</Link>
                </div>
            )}

            {status === 'error' && err && <div className="alert alert-error">Error: {err}</div>}

            {status === 'loading' && (
                <>
                    <div style={{ marginBottom: 12 }}><SkeletonStats count={6} /></div>
                    <div className="card" style={{ padding: 16 }}><SkeletonRow count={3} /></div>
                </>
            )}

            {status === 'ready' && derived && (
                <>
                    {/* Executive summary */}
                    <div className="row fade-in" style={{ gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                        <ScoreCard score={derived.global} accent />
                        <Stat icon="💼" label="BMs" value={bms?.length ?? 0} />
                        <Stat icon="📊" label="AdAccounts" value={accounts?.length ?? 0}
                             hint={`${accounts?.filter(a => a.account_status === 1).length ?? 0} activas`} />
                        <Stat icon="📄" label="Pages" value={pages?.length ?? 0}
                             hint={`${pages?.filter(p => p.instagram_business_account).length ?? 0} con IG`} />
                        <Stat icon="🛡" label="Access risk"
                             value={Math.round(100 - derived.access.score)}
                             tone={derived.access.score < 60 ? 'danger' : 'ok'}
                             hint={derived.access.score < 60 ? 'Vulnerable' : 'OK'} />
                        <Stat icon="🚨" label="Decisiones críticas"
                             value={sevCounts.critical + sevCounts.high}
                             tone={sevCounts.critical > 0 ? 'danger' : sevCounts.high > 0 ? 'warn' : 'ok'} />
                    </div>

                    {/* Budget Health Summary */}
                    <section className="card fade-in" style={{ marginBottom: 14, padding: 18 }}>
                        <SectionHeader icon="💰" title="Budget Health Summary" hint="últimos 7 días" />
                        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                            <Stat label="Spend 7d"
                                  value={`${currency} ${(derived.totalSpend7d / 100).toFixed(2)}`} />
                            <Stat label="Cuentas ≥80% cap" value={derived.accountsNearCap.length}
                                  tone={derived.accountsNearCap.length > 0 ? 'warn' : 'ok'} />
                            <Stat label="Cuentas bloqueadas" value={derived.accountsFrozen.length}
                                  tone={derived.accountsFrozen.length > 0 ? 'danger' : 'ok'} />
                            <Stat label="Campañas aceleradas" value={derived.accelerating.length}
                                  tone={derived.accelerating.length > 0 ? 'warn' : 'ok'} />
                            <Stat label="Campañas lentas" value={derived.underpaced.length}
                                  tone={derived.underpaced.length > 0 ? 'warn' : 'ok'} />
                            <Stat label="Riesgo desperdicio" value={derived.wasteful.length}
                                  tone={derived.wasteful.length > 0 ? 'warn' : 'ok'} />
                        </div>
                        {Object.keys(campaigns).length === 0 && (
                            <p className="muted" style={{ fontSize: 11, marginTop: 10, marginBottom: 0 }}>
                                💡 Las métricas de campañas se cargan al seleccionar una AdAccount.
                            </p>
                        )}
                    </section>

                    {/* Global Decision Queue */}
                    <section className="card fade-in" style={{ marginBottom: 14, padding: 18 }}>
                        <SectionHeader
                            icon="🧭"
                            title="Global Decision Queue"
                            hint={`${filteredDecisions.length} de ${decisions.length} items`}
                            action={
                                <Segmented<SevFilter>
                                    value={sevFilter}
                                    onChange={setSevFilter}
                                    options={[
                                        { id: 'all',      label: `Todas (${sevCounts.all})` },
                                        { id: 'critical', label: `🔴 ${sevCounts.critical}` },
                                        { id: 'high',     label: `🟠 ${sevCounts.high}` },
                                        { id: 'medium',   label: `🟡 ${sevCounts.medium}` },
                                        { id: 'low',      label: `⚪ ${sevCounts.low}` },
                                    ]}
                                />
                            }
                        />
                        {filteredDecisions.length === 0 ? (
                            <EmptyState
                                icon={decisions.length === 0 ? '✓' : '∅'}
                                title={decisions.length === 0 ? 'Todo bajo control' : 'Sin items en este filtro'}
                                description={decisions.length === 0 ? 'No hay alertas activas.' : 'Cambia el filtro para ver otras severidades.'}
                            />
                        ) : (
                            <SortableTable<DecisionItem>
                                rows={filteredDecisions}
                                rowKey={(r, i) => `${r.entity_id}-${i}`}
                                initialSort={{ key: 'severity', dir: 'desc' }}
                                columns={decisionColumns()}
                            />
                        )}
                    </section>

                    {/* Modules grid */}
                    <section className="fade-in">
                        <SectionHeader title="Módulos" />
                        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
                            <ModuleCard icon="📊" title="ADS" desc="Cuentas, spend cap, balance, pacing."
                                href={`/panel/ads?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard icon="💼" title="BM Hub" desc="BMs, verificación, governance." badge={Object.keys(bmUsers).length > 0 ? 'usuarios ✓' : undefined}
                                href={`/panel/bm?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard icon="📄" title="Pages" desc="IG, publicación, readiness."
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

function decisionColumns(): Column<DecisionItem>[] {
    const sevRank: Record<Severity, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return [
        {
            key: 'severity', label: 'Sev.', sortable: true, width: 70,
            sortFn: (a, b) => sevRank[a.severity] - sevRank[b.severity],
            render: d => <SeverityChip s={d.severity} />,
        },
        {
            key: 'entity', label: 'Entidad', sortable: true,
            sortFn: (a, b) => a.entity_name.localeCompare(b.entity_name),
            render: d => (
                <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.entity_name}</div>
                    <div className="muted" style={{ fontSize: 10 }}>{d.entity_type}</div>
                </div>
            ),
        },
        { key: 'problem', label: 'Problema', render: d => <span style={{ fontSize: 13 }}>{d.problem}</span> },
        { key: 'evidence', label: 'Evidencia', render: d => (
            <code style={{ fontSize: 10, color: 'var(--muted)' }}>{d.evidence}</code>
        ) },
        { key: 'action', label: 'Acción', render: d => <span style={{ fontSize: 13 }}>{d.recommended_action}</span> },
        { key: 'impact', label: 'Impacto', align: 'right', render: d => (
            <span style={{ fontSize: 12 }}>{d.economic_impact ?? '—'}</span>
        ) },
    ];
}

function ModuleCard({ icon, title, desc, href, soon, badge }: {
    icon: string; title: string; desc: string; href: string; soon?: boolean; badge?: string;
}) {
    const content = (
        <div className="card" style={{
            flex: '1 1 220px', minWidth: 200, marginBottom: 0, padding: 16,
            opacity: soon ? 0.65 : 1, cursor: soon ? 'default' : 'pointer',
        }}>
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div style={{ fontSize: 22 }}>{icon}</div>
                {soon
                    ? <span className="pill pill-muted" style={{ fontSize: 10 }}>Soon</span>
                    : badge ? <span className="pill pill-success" style={{ fontSize: 10 }}>{badge}</span> : null}
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
