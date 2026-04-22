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
import type { BmSnapshot, AdAccountSnapshot, BmUsersSnapshot } from '@/lib/domain/types';
import { toCents, capUtilizationPct } from '@/lib/domain/budget';
import { accessRiskScore } from '@/lib/domain/scoring';
import { ScoreCard } from '@/components/dashboard/primitives';

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
    const [bmUsers, setBmUsers] = useState<Record<string, BmUsersSnapshot>>({});
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
        setErr(null); setBms(null); setAccounts(null); setBmUsers({});
        const qs = `tenant_id=${tenantId}&connection_id=${connId}`;
        const [bmR, acctR] = await Promise.all([
            apiFetch(`/api/web/graph/bm/list?${qs}`),
            apiFetch(`/api/web/graph/adaccounts/list?${qs}`),
        ]);
        const [bmJ, acctJ] = await Promise.all([bmR.json().catch(() => ({})), acctR.json().catch(() => ({}))]);
        if (!bmR.ok) { setErr(bmJ.message ?? `BM ${bmR.status}`); return; }
        const now = new Date().toISOString();
        const bmList: BmSnapshot[] = (bmJ.data ?? []).map((b: any) => ({
            ...b, source_type: 'api',
            source_endpoint: '/me/businesses|client_businesses', last_sync_at: now,
        }));
        setBms(bmList);
        setAccounts((acctJ.data ?? []).map((a: any) => ({
            id: a.id, name: a.name, currency: a.currency, account_status: a.account_status,
            amount_spent: a.amount_spent, spend_cap: a.spend_cap, balance: a.balance,
            disable_reason: a.disable_reason, timezone_name: a.timezone_name,
            business_id: a.business?.id ?? null,
            source_type: 'api', source_endpoint: '/me/adaccounts', last_sync_at: now,
        })));

        // Fetch BM users in parallel (best-effort — may require extra scope).
        await Promise.all(bmList.map(async bm => {
            const r = await apiFetch(`/api/web/graph/bm/users?${qs}&bm_id=${bm.id}`);
            if (!r.ok) return;
            const j = await r.json().catch(() => null);
            if (!j?.data) return;
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
        }));
    }, [tenantId, connId]);
    useEffect(() => { load(); }, [load]);

    const accessScore = useMemo(() => {
        if (!bms) return null;
        return accessRiskScore(bms, Object.keys(bmUsers).length > 0 ? bmUsers : undefined);
    }, [bms, bmUsers]);

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

                                {/* Users & Governance */}
                                <BmUsersPanel users={bmUsers[row.bm.id]} />
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

                    {/* Scope notice */}
                    {bmRows.length > 0 && Object.values(bmUsers).every(u => u.scope_missing) && (
                        <div className="card" style={{ marginTop: 12, borderLeft: '3px solid var(--warning)' }}>
                            <h3 style={{ marginTop: 0, fontSize: 14 }}>⚠ Scope <code>business_management</code> faltante</h3>
                            <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                                El Graph rechazó la lectura de <code>business_users</code>/<code>system_users</code>.
                                Reconecta con el scope <code>business_management</code> para habilitar el bus-factor y detección de admins.
                            </p>
                        </div>
                    )}
                </>
            )}
        </>
    );
}

function BmUsersPanel({ users }: { users?: BmUsersSnapshot }) {
    if (!users) return (
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--muted)' }}>
            <span className="skeleton" style={{ width: 180, height: 10 }} /> cargando usuarios…
        </div>
    );
    if (users.scope_missing) {
        return (
            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--warning)' }}>
                ⚠ Sin acceso a usuarios (requiere scope <code>business_management</code>).
            </div>
        );
    }
    const busFactor = users.humans.length;
    const busWarn = busFactor <= 1;
    return (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <span className={`pill ${busWarn ? 'pill-danger' : busFactor <= 5 ? 'pill-success' : 'pill-warn'}`} style={{ fontSize: 10 }}>
                    Bus factor: {busFactor} humano{busFactor === 1 ? '' : 's'}
                </span>
                <span className="pill pill-muted" style={{ fontSize: 10 }}>
                    {users.system.length} system user{users.system.length === 1 ? '' : 's'}
                </span>
                {users.pending.length > 0 && (
                    <span className="pill pill-warn" style={{ fontSize: 10 }}>
                        {users.pending.length} pendiente{users.pending.length === 1 ? '' : 's'}
                    </span>
                )}
            </div>
            {busWarn && (
                <div style={{ fontSize: 10, color: 'var(--warning)', marginTop: 6 }}>
                    ⚠ Riesgo: {busFactor === 0 ? 'sin admins humanos registrados' : 'un solo admin humano — single point of failure'}.
                </div>
            )}
            {users.humans.length > 0 && (
                <details style={{ marginTop: 6 }}>
                    <summary style={{ cursor: 'pointer', fontSize: 11, color: 'var(--text-dim)' }}>
                        Ver {users.humans.length} usuario{users.humans.length === 1 ? '' : 's'}
                    </summary>
                    <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: 11 }}>
                        {users.humans.map(u => (
                            <li key={u.id} style={{ marginBottom: 2 }}>
                                <strong>{u.name ?? u.email ?? u.id}</strong>
                                {u.role && <span className="muted"> · {u.role}</span>}
                            </li>
                        ))}
                    </ul>
                </details>
            )}
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
