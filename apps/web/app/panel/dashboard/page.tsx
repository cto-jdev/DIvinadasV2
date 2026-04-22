'use client';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type Conn = { id: string; display_name: string | null; email: string | null; status: string };
type Bm = { id: string; name: string; role: 'owner' | 'client' };
type AdAccount = {
    id: string; name: string; account_status: number; currency: string;
    amount_spent?: string; disable_reason?: number; source?: 'owned' | 'client';
};
type Page = {
    id: string; name: string; category?: string; fan_count?: number;
    followers_count?: number; verification_status?: string; link?: string;
    instagram_business_account?: { id: string; username: string };
};

type Status = 'loading' | 'ready' | 'reconnect' | 'no_conns' | 'error';

function DashboardContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');

    const [conns, setConns] = useState<Conn[] | null>(null);
    const [connId, setConnId] = useState<string>('');
    const [bms, setBms] = useState<Bm[] | null>(null);
    const [accounts, setAccounts] = useState<AdAccount[] | null>(null);
    const [pages, setPages] = useState<Page[] | null>(null);
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
        setBms(null); setAccounts(null); setPages(null);

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

        if (!bmRes.ok)    { setErr(bmJ.message ?? `BM ${bmRes.status}`); setStatus('error'); return; }
        if (!acctRes.ok)  { setErr(acctJ.message ?? `ADS ${acctRes.status}`); setStatus('error'); return; }

        setBms(bmJ.data ?? []);
        setAccounts(acctJ.data ?? []);
        setPages(pagesRes.ok ? (pagesJ.data ?? []) : []);
        setStatus('ready');
    }, [tenantId, connId]);

    useEffect(() => { if (connId) loadAll(); }, [connId, loadAll]);

    const kpis = useMemo(() => {
        const totalBms = bms?.length ?? 0;
        const totalAcct = accounts?.length ?? 0;
        const activeAcct = accounts?.filter(a => a.account_status === 1).length ?? 0;
        const disabledAcct = accounts?.filter(a => a.account_status === 2 || a.account_status === 3).length ?? 0;
        const totalPages = pages?.length ?? 0;
        const igLinked = pages?.filter(p => !!p.instagram_business_account).length ?? 0;
        const risks =
            (accounts?.filter(a => a.disable_reason && a.disable_reason !== 0).length ?? 0) +
            (accounts?.filter(a => a.account_status === 2).length ?? 0);
        return { totalBms, totalAcct, activeAcct, disabledAcct, totalPages, igLinked, risks };
    }, [bms, accounts, pages]);

    if (!tenantId) return (
        <div className="card">
            <h2>Falta tenant</h2>
            <p className="muted">Abre un workspace desde <Link href="/panel">inicio</Link>.</p>
        </div>
    );

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>🏠 Dashboard Principal</h1>
                    <p className="muted" style={{ margin: 0 }}>
                        Consolidador holístico: BMs, cuentas publicitarias, páginas y riesgos de compliance.
                    </p>
                </div>
                <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-ghost btn-sm">
                    Gestionar conexiones →
                </Link>
            </header>

            {conns && conns.length > 1 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
                        <div className="field" style={{ marginBottom: 0, flex: '1 1 260px' }}>
                            <label className="label">Cuenta Meta activa</label>
                            <select value={connId} onChange={e => setConnId(e.target.value)}>
                                {conns.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.display_name ?? c.email ?? c.id.slice(0, 8)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={loadAll}>↻ Refrescar</button>
                    </div>
                </div>
            )}

            {status === 'no_conns' && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>◇</div>
                    <h3>Sin conexiones Meta</h3>
                    <p className="muted">Conecta tu primera cuenta de Meta para ver el dashboard.</p>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-primary">
                        + Conectar cuenta Meta
                    </Link>
                </div>
            )}

            {status === 'reconnect' && (
                <div className="card" style={{ padding: 32, borderLeft: '4px solid var(--warn, #f59e0b)' }}>
                    <h3 style={{ marginTop: 0 }}>⚠ Reconecta tu cuenta de Meta</h3>
                    <p>
                        La conexión existe pero el token de acceso no está disponible
                        (posiblemente el guardado falló durante el callback). Reconecta para restaurar
                        el acceso al Graph API.
                    </p>
                    <Link href={`/panel/connections?tenant=${tenantId}`} className="btn btn-primary">
                        Ir a Conexiones Meta
                    </Link>
                </div>
            )}

            {status === 'error' && err && (
                <div className="alert alert-error" style={{ marginBottom: 16 }}>Error: {err}</div>
            )}

            {status === 'loading' && conns && conns.length > 0 && (
                <p className="muted">Cargando datos del Graph API…</p>
            )}

            {status === 'ready' && (
                <>
                    <div className="row" style={{ gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                        <Kpi icon="💼" label="Business Managers" value={kpis.totalBms} accent="var(--accent, #A855F7)" />
                        <Kpi icon="📊" label="AdAccounts" value={kpis.totalAcct}
                             hint={`${kpis.activeAcct} activas · ${kpis.disabledAcct} bloqueadas`} />
                        <Kpi icon="📄" label="Páginas / Fanpages" value={kpis.totalPages}
                             hint={`${kpis.igLinked} con Instagram`} />
                        <Kpi icon="🛡" label="Riesgos" value={kpis.risks}
                             accent={kpis.risks > 0 ? 'var(--danger, #ef4444)' : undefined}
                             hint={kpis.risks > 0 ? 'Requieren atención' : 'Sin alertas'} />
                    </div>

                    <section style={{ marginTop: 8 }}>
                        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Módulos</h2>
                        <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
                            <ModuleCard
                                icon="📊" title="ADS" desc="Gestor de cuentas publicitarias: límites, balance, métodos de pago."
                                href={`/panel/ads?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard
                                icon="💼" title="BM Hub" desc="Business Managers, verificaciones, hidden admins, invitaciones."
                                href={`/panel/bm?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard
                                icon="📄" title="Pages" desc="Fanpages: feedback score, calidad, links rotos, IG enlazado."
                                href={`/panel/pages?tenant=${tenantId}&conn=${connId}`} />
                            <ModuleCard
                                icon="🧬" title="Clonner" desc="Clona anuncios: A/B de copy, creatividades, audiencias."
                                href={`/panel/clonner?tenant=${tenantId}&conn=${connId}`} soon />
                            <ModuleCard
                                icon="🤖" title="Claude Copilot" desc="IA agentic integrada: analiza tu panel y Graph API."
                                href={`/panel/copilot?tenant=${tenantId}&conn=${connId}`} soon />
                        </div>
                    </section>
                </>
            )}
        </>
    );
}

function Kpi({ icon, label, value, hint, accent }: {
    icon: string; label: string; value: number | string; hint?: string; accent?: string;
}) {
    return (
        <div className="card" style={{ flex: '1 1 180px', minWidth: 180, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: accent ?? 'var(--text)', marginTop: 6 }}>{value}</div>
            {hint && <div className="muted" style={{ fontSize: 12 }}>{hint}</div>}
        </div>
    );
}

function ModuleCard({ icon, title, desc, href, soon }: {
    icon: string; title: string; desc: string; href: string; soon?: boolean;
}) {
    const content = (
        <div className="card" style={{
            flex: '1 1 240px', minWidth: 240, marginBottom: 0,
            opacity: soon ? 0.72 : 1, cursor: soon ? 'default' : 'pointer',
            transition: 'transform .12s',
        }}>
            <div className="row-between" style={{ alignItems: 'flex-start' }}>
                <div style={{ fontSize: 28 }}>{icon}</div>
                {soon && <span className="pill pill-muted" style={{ fontSize: 10 }}>Próximamente</span>}
            </div>
            <h3 style={{ margin: '10px 0 4px' }}>{title}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>{desc}</p>
        </div>
    );
    if (soon) return <div style={{ flex: '1 1 240px' }}>{content}</div>;
    return <Link href={href} style={{ textDecoration: 'none', flex: '1 1 240px' }}>{content}</Link>;
}

export default function DashboardPage() {
    return <Suspense><DashboardContent /></Suspense>;
}
