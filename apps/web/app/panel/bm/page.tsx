'use client';
/**
 * BM Hub — gobernanza y exposición financiera.
 * Spec: dashboard_meta_claude_spec.md §7.4.
 *
 * Por cada Business Manager: rol, verificación, cuentas que controla,
 * exposición financiera (spend_cap + balance agregados) y access risk.
 * Los "hidden admins" y usuarios privilegiados requieren business_users
 * / system_users — pendientes de scopes. Se marca como `unsupported`.
 */
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';
import type { BmSnapshot, AdAccountSnapshot } from '@/lib/domain/types';
import { toCents, capUtilizationPct } from '@/lib/domain/budget';
import { accessRiskScore } from '@/lib/domain/scoring';

type Conn = { id: string; display_name: string | null };

const fmtMoneyCents = (cents: number, currency: string) => {
    try {
        return new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
    } catch { return `${(cents / 100).toFixed(0)} ${currency}`; }
};

function BmContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connParam = sp.get('conn');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState(connParam ?? '');
    const [bms, setBms] = useState<BmSnapshot[] | null>(null);
    const [accounts, setAccounts] = useState<AdAccountSnapshot[] | null>(null);
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

    const load = useCallback(async () => {
        if (!tenantId || !connId) return;
        setErr(null); setBms(null); setAccounts(null);
        const qs = `tenant_id=${tenantId}&connection_id=${connId}`;
        const [bmR, acctR] = await Promise.all([
            apiFetch(`/api/web/graph/bm/list?${qs}`),
            apiFetch(`/api/web/graph/adaccounts/list?${qs}`),
        ]);
        const [bmJ, acctJ] = await Promise.all([bmR.json().catch(() => ({})), acctR.json().catch(() => ({}))]);
        if (!bmR.ok) { setErr(bmJ.message ?? `BM ${bmR.status}`); return; }
        const now = new Date().toISOString();
        setBms((bmJ.data ?? []).map((b: any) => ({
            ...b, source_type: 'api',
            source_endpoint: '/me/businesses|client_businesses', last_sync_at: now,
        })));
        setAccounts((acctJ.data ?? []).map((a: any) => ({
            id: a.id, name: a.name, currency: a.currency, account_status: a.account_status,
            amount_spent: a.amount_spent, spend_cap: a.spend_cap, balance: a.balance,
            disable_reason: a.disable_reason, timezone_name: a.timezone_name,
            business_id: a.business?.id ?? null,
            source_type: 'api', source_endpoint: '/me/adaccounts', last_sync_at: now,
        })));
    }, [tenantId, connId]);
    useEffect(() => { load(); }, [load]);

    const accessScore = useMemo(() => bms ? accessRiskScore(bms) : null, [bms]);

    const bmRows = useMemo(() => {
        if (!bms || !accounts) return null;
        return bms.map(bm => {
            const controlled = accounts.filter(a => a.business_id === bm.id);
            const totalSpent = controlled.reduce((s, a) => s + toCents(a.amount_spent), 0);
            const totalCap = controlled.reduce((s, a) => s + toCents(a.spend_cap), 0);
            const totalBalance = controlled.reduce((s, a) => s + toCents(a.balance), 0);
            const frozen = controlled.filter(a => a.account_status !== 1).length;
            const atRisk = controlled.filter(a => {
                const u = capUtilizationPct(a.amount_spent, a.spend_cap);
                return u !== null && u >= 80;
            }).length;
            const currency = controlled[0]?.currency ?? 'USD';
            return { bm, controlled, totalSpent, totalCap, totalBalance, frozen, atRisk, currency };
        });
    }, [bms, accounts]);

    const orphanAccounts = useMemo(() => {
        if (!accounts) return [];
        return accounts.filter(a => !a.business_id);
    }, [accounts]);

    if (!tenantId) return <div className="card"><h2>Falta tenant</h2><p className="muted">Abre desde <Link href="/panel">inicio</Link>.</p></div>;

    return (
        <>
            <header className="row-between" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 26, marginBottom: 4 }}>💼 BM Hub — Gobernanza</h1>
                    <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                        Business Managers, verificación, control de cuentas y exposición financiera.
                    </p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

            {err && <div className="alert alert-error" style={{ marginBottom: 12 }}>Error: {err}</div>}

            {conns && conns.length > 1 && (
                <div className="card" style={{ marginBottom: 12 }}>
                    <div className="field" style={{ marginBottom: 0, maxWidth: 320 }}>
                        <label className="label">Conexión Meta</label>
                        <select value={connId} onChange={e => setConnId(e.target.value)}>
                            {conns.map(c => <option key={c.id} value={c.id}>{c.display_name ?? c.id.slice(0, 8)}</option>)}
                        </select>
                    </div>
                </div>
            )}

            {bms === null && !err && <p className="muted">Cargando…</p>}

            {bms && accessScore && bmRows && (
                <>
                    {/* KPIs globales */}
                    <div className="row" style={{ gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                        <ScoreCard score={accessScore} />
                        <MiniStat label="BMs totales" value={bms.length} />
                        <MiniStat label="Propios (owner)" value={bms.filter(b => b.role === 'owner').length} />
                        <MiniStat label="Clientes (client)" value={bms.filter(b => b.role === 'client').length} />
                        <MiniStat label="Cuentas huérfanas" value={orphanAccounts.length}
                                  tone={orphanAccounts.length > 0 ? 'warn' : 'ok'}
                                  hint="Sin BM asociado" />
                    </div>

                    {/* BM grid */}
                    <div className="col" style={{ gap: 10 }}>
                        {bmRows.map(row => (
                            <div key={row.bm.id} className="card" style={{ marginBottom: 0 }}>
                                <div className="row-between" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                                    <div style={{ flex: '1 1 260px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                            <strong style={{ fontSize: 16 }}>{row.bm.name}</strong>
                                            <span className={`pill ${row.bm.role === 'owner' ? 'pill-success' : 'pill-muted'}`} style={{ fontSize: 10 }}>
                                                {row.bm.role === 'owner' ? 'propio' : 'cliente'}
                                            </span>
                                            {row.bm.verification_status && row.bm.verification_status !== 'not_verified' ? (
                                                <span className="pill pill-success" style={{ fontSize: 10 }}>✓ {row.bm.verification_status}</span>
                                            ) : (
                                                <span className="pill pill-warn" style={{ fontSize: 10 }}>sin verificar</span>
                                            )}
                                        </div>
                                        <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                                            ID {row.bm.id} · {row.controlled.length} cuentas · fuente /me/businesses
                                        </div>
                                    </div>
                                    <a href={`https://business.facebook.com/settings/info?business_id=${row.bm.id}`}
                                       target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Abrir en Meta ↗</a>
                                </div>

                                {/* Exposure financiera */}
                                <div className="row" style={{ gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                    <MiniStat label="Gasto total" value={fmtMoneyCents(row.totalSpent, row.currency)} />
                                    <MiniStat label="Spend cap total"
                                              value={row.totalCap > 0 ? fmtMoneyCents(row.totalCap, row.currency) : 'Sin cap'} />
                                    <MiniStat label="Balance agregado" value={fmtMoneyCents(row.totalBalance, row.currency)} />
                                    <MiniStat label="Cuentas bloqueadas" value={row.frozen}
                                              tone={row.frozen > 0 ? 'danger' : 'ok'} />
                                    <MiniStat label="Cuentas cerca de cap" value={row.atRisk}
                                              tone={row.atRisk > 0 ? 'warn' : 'ok'} />
                                </div>
                            </div>
                        ))}
                        {bmRows.length === 0 && (
                            <div className="card"><p className="muted" style={{ margin: 0 }}>Sin Business Managers detectados en esta conexión.</p></div>
                        )}
                    </div>

                    {/* Orphans */}
                    {orphanAccounts.length > 0 && (
                        <div className="card" style={{ marginTop: 12, borderLeft: '3px solid #f59e0b' }}>
                            <h3 style={{ marginTop: 0, fontSize: 15 }}>⚠ Cuentas sin BM asociado</h3>
                            <p className="muted" style={{ fontSize: 12 }}>
                                Estas cuentas no están bajo gobernanza de un Business Manager. Migrarlas reduce riesgo de pérdida de acceso.
                            </p>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                                {orphanAccounts.map(a => (
                                    <li key={a.id}>{a.name} <span className="muted" style={{ fontSize: 11 }}>({a.id})</span></li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Unsupported placeholder */}
                    <div className="card" style={{ marginTop: 12, borderLeft: '3px solid #64748b' }}>
                        <h3 style={{ marginTop: 0, fontSize: 14 }}>Pendiente de scopes extra</h3>
                        <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                            Usuarios humanos, system users, admins ocultos y permisos efectivos requieren
                            <code> business_users </code>/<code> system_users </code>del Graph Business API
                            (scope <code>business_management</code>). Fuente marcada como <strong>unsupported</strong>.
                        </p>
                    </div>
                </>
            )}
        </>
    );
}

function ScoreCard({ score }: { score: { score: number; label: string; factors: { label: string; value: number; weight: number; key: string }[]; explanation: string } }) {
    const color = score.score >= 75 ? '#22c55e' : score.score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="card" title={score.explanation}
             style={{ flex: '1 1 240px', minWidth: 220, marginBottom: 0, borderLeft: `3px solid ${color}` }}>
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase' }}>{score.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color, marginTop: 4 }}>{score.score}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                {score.factors.map(f => `${f.label} ${Math.round(f.value)}`).join(' · ')}
            </div>
        </div>
    );
}

function MiniStat({ label, value, tone, hint }: {
    label: string; value: string | number; tone?: 'ok' | 'warn' | 'danger'; hint?: string;
}) {
    const color = tone === 'danger' ? '#ef4444' : tone === 'warn' ? '#f59e0b' : undefined;
    return (
        <div style={{
            flex: '1 1 140px', minWidth: 130,
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)',
        }}>
            <div className="muted" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: color ?? 'var(--text)', marginTop: 2 }}>{value}</div>
            {hint && <div className="muted" style={{ fontSize: 10 }}>{hint}</div>}
        </div>
    );
}

export default function BmPage() {
    return <Suspense><BmContent /></Suspense>;
}
