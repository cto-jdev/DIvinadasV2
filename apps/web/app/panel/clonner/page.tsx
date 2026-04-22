'use client';
/**
 * Clonner — duplicación inteligente de campañas/adsets/ads con preflight de compliance.
 * Scaffold v1: selector + preflight stub. La duplicación real usa /act_{id}/copies.
 */
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type { AdAccountSnapshot, CampaignSnapshot } from '@/lib/domain/types';
import { useRegisterCopilotScope } from '@/components/copilot/context';
import { EmptyState, SectionHeader, SkeletonRow, Stat } from '@/components/dashboard/primitives';

type Conn = { id: string; display_name: string | null };
type PreflightCheck = { key: string; label: string; status: 'ok' | 'warn' | 'danger' | 'pending'; detail?: string };

function ClonnerContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connParam = sp.get('conn');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState(connParam ?? '');
    const [accounts, setAccounts] = useState<AdAccountSnapshot[] | null>(null);
    const [acctId, setAcctId] = useState('');
    const [campaigns, setCampaigns] = useState<CampaignSnapshot[] | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [preflight, setPreflight] = useState<PreflightCheck[] | null>(null);

    useRegisterCopilotScope({
        module: 'clonner',
        tenantId: tenantId ?? undefined,
        connectionId: connId || undefined,
        summary: { campaigns_count: campaigns?.length },
        top_decisions: [], scores: [],
    }, [tenantId, connId, campaigns]);

    const loadConns = useCallback(async () => {
        if (!tenantId) return;
        const r = await apiFetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return;
        setConns(j.data);
        if (!connId && j.data?.length) setConnId(j.data[0].id);
    }, [tenantId, connId]);
    useEffect(() => { loadConns(); }, [loadConns]);

    const loadAccounts = useCallback(async () => {
        if (!tenantId || !connId) return;
        const r = await apiFetch(`/api/web/graph/adaccounts/list?tenant_id=${tenantId}&connection_id=${connId}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return;
        const list: AdAccountSnapshot[] = (j.data ?? []).map((a: any) => ({
            id: a.id, name: a.name, currency: a.currency,
            account_status: a.account_status, amount_spent: a.amount_spent,
            spend_cap: a.spend_cap, balance: a.balance,
            disable_reason: a.disable_reason, timezone_name: a.timezone_name,
            business_id: a.business?.id ?? null,
            source_type: 'api', source_endpoint: '/me/adaccounts',
            last_sync_at: new Date().toISOString(),
        }));
        setAccounts(list);
        if (!acctId && list.length) setAcctId(list.find(a => a.account_status === 1)?.id ?? list[0].id);
    }, [tenantId, connId, acctId]);
    useEffect(() => { loadAccounts(); }, [loadAccounts]);

    const loadCampaigns = useCallback(async () => {
        if (!tenantId || !connId || !acctId) return;
        setCampaigns(null); setSelected(new Set());
        const qs = `tenant_id=${tenantId}&connection_id=${connId}&ad_account_id=${acctId}`;
        const r = await apiFetch(`/api/web/graph/campaigns/list?${qs}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok) return;
        setCampaigns((j.data ?? []).map((c: any) => ({
            id: c.id, ad_account_id: acctId, name: c.name,
            objective: c.objective, status: c.status, effective_status: c.effective_status,
            daily_budget: c.daily_budget, lifetime_budget: c.lifetime_budget,
            budget_remaining: c.budget_remaining, bid_strategy: c.bid_strategy,
            buying_type: c.buying_type, start_time: c.start_time, stop_time: c.stop_time,
            spend: c.spend, impressions: c.impressions, clicks: c.clicks,
            source_type: 'api', source_endpoint: '/{acct}/campaigns+insights',
            last_sync_at: new Date().toISOString(),
        })));
    }, [tenantId, connId, acctId]);
    useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

    function toggle(id: string) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
        setPreflight(null);
    }

    function runPreflight() {
        if (!campaigns || !accounts) return;
        const acct = accounts.find(a => a.id === acctId);
        const picked = campaigns.filter(c => selected.has(c.id));
        const checks: PreflightCheck[] = [];
        checks.push({
            key: 'account_active',
            label: 'Cuenta destino activa',
            status: acct?.account_status === 1 ? 'ok' : 'danger',
            detail: acct ? `status ${acct.account_status}` : 'sin cuenta',
        });
        checks.push({
            key: 'has_selection',
            label: 'Selección no vacía',
            status: picked.length > 0 ? 'ok' : 'warn',
            detail: `${picked.length} campaña(s)`,
        });
        checks.push({
            key: 'budgets_ok',
            label: 'Presupuestos definidos',
            status: picked.every(c => c.daily_budget || c.lifetime_budget) ? 'ok' : 'warn',
            detail: 'Las copias heredan presupuesto',
        });
        checks.push({
            key: 'objectives_supported',
            label: 'Objetivos soportados para copia',
            status: picked.every(c => c.objective) ? 'ok' : 'warn',
            detail: 'Campañas sin objective pueden requerir setup manual',
        });
        checks.push({
            key: 'copy_endpoint',
            label: 'Endpoint /copies disponible',
            status: 'pending',
            detail: 'Integración de ejecución aún no implementada (v2).',
        });
        setPreflight(checks);
    }

    if (!tenantId) return <div className="card"><h2>Falta tenant</h2><p className="muted">Abre desde <Link href="/panel">inicio</Link>.</p></div>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 26, marginBottom: 4 }}>🧬 Clonner</h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Duplica campañas con preflight de compliance antes de ejecutar en Meta.
                    </p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

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
                    <div className="field" style={{ marginBottom: 0, flex: '2 1 280px' }}>
                        <label className="label">AdAccount origen/destino</label>
                        <select value={acctId} onChange={e => setAcctId(e.target.value)} disabled={!accounts}>
                            {accounts?.map(a => (
                                <option key={a.id} value={a.id}>{a.name} · {a.currency} · status {a.account_status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <section className="card" style={{ marginBottom: 12 }}>
                <SectionHeader icon="📋" title="Selecciona campañas a clonar" hint={`${selected.size} seleccionada(s)`} />
                {campaigns === null ? <SkeletonRow count={3} /> : campaigns.length === 0 ? (
                    <EmptyState icon="∅" title="Sin campañas" description="Esta cuenta no tiene campañas aún." />
                ) : (
                    <div className="col" style={{ gap: 6 }}>
                        {campaigns.map(c => (
                            <label key={c.id} className="row" style={{
                                gap: 10, alignItems: 'center',
                                padding: '8px 10px', borderRadius: 8,
                                background: selected.has(c.id) ? 'rgba(168,85,247,.1)' : 'rgba(255,255,255,.02)',
                                border: `1px solid ${selected.has(c.id) ? 'rgba(168,85,247,.4)' : 'var(--border)'}`,
                                cursor: 'pointer',
                            }}>
                                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                                    <div className="muted" style={{ fontSize: 11 }}>
                                        {c.objective ?? '—'} · {c.effective_status ?? c.status}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </section>

            <section className="card" style={{ marginBottom: 12 }}>
                <SectionHeader icon="🛂" title="Preflight" hint="Verifica antes de ejecutar"
                    action={
                        <button className="btn btn-primary btn-sm" disabled={selected.size === 0} onClick={runPreflight}>
                            Ejecutar preflight
                        </button>
                    } />
                {preflight === null ? (
                    <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                        Selecciona campañas y ejecuta el preflight para verificar riesgos antes de duplicar.
                    </p>
                ) : (
                    <div className="col" style={{ gap: 6 }}>
                        {preflight.map(ch => (
                            <div key={ch.key} className="row" style={{
                                gap: 10, alignItems: 'center',
                                padding: '8px 10px', borderRadius: 8,
                                background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)',
                            }}>
                                <StatusDot status={ch.status} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{ch.label}</div>
                                    {ch.detail && <div className="muted" style={{ fontSize: 11 }}>{ch.detail}</div>}
                                </div>
                            </div>
                        ))}
                        <div className="row" style={{ gap: 10, marginTop: 8 }}>
                            <Stat label="Checks OK" value={preflight.filter(c => c.status === 'ok').length} tone="ok" />
                            <Stat label="Advertencias" value={preflight.filter(c => c.status === 'warn').length} tone="warn" />
                            <Stat label="Bloqueantes" value={preflight.filter(c => c.status === 'danger').length} tone="danger" />
                        </div>
                        <div className="alert" style={{
                            marginTop: 10, padding: 10, borderRadius: 8,
                            background: 'rgba(100,116,139,.1)', border: '1px solid var(--border)',
                            fontSize: 12, color: 'var(--text-dim)',
                        }}>
                            ℹ La ejecución real (<code>/act_&lt;id&gt;/copies</code>) está pendiente — este preflight valida el flujo antes de habilitarlo.
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

function StatusDot({ status }: { status: 'ok' | 'warn' | 'danger' | 'pending' }) {
    const bg = status === 'ok' ? 'var(--success)' : status === 'warn' ? 'var(--warning)'
        : status === 'danger' ? 'var(--danger)' : 'var(--muted)';
    return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 5, background: bg, flexShrink: 0 }} />;
}

export default function ClonnerPage() {
    return <Suspense><ClonnerContent /></Suspense>;
}
