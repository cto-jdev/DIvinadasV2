'use client';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Conn = {
    id: string;
    display_name: string | null;
    email: string | null;
    picture_url: string | null;
    status: string;
    connected_at: string;
};

function statusPill(status: string) {
    if (status === 'active')  return <span className="pill pill-success">● activa</span>;
    if (status === 'expired') return <span className="pill pill-danger">● expirada</span>;
    return <span className="pill pill-muted">● {status}</span>;
}

function ConnectionsContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [conns, setConns] = useState<Conn[] | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    const load = useCallback(async () => {
        if (!tenantId) return;
        const r = await fetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json();
        if (!r.ok) { setErr(j.error ?? 'error'); return; }
        setConns(j.data);
    }, [tenantId]);

    useEffect(() => { load(); }, [load]);

    async function connectMeta() {
        setConnecting(true);
        const r = await fetch('/api/meta/start', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tenant_id: tenantId }),
        });
        const j = await r.json();
        setConnecting(false);
        if (!r.ok) { alert(j.message ?? j.error); return; }
        window.location.href = j.redirect_url;
    }

    async function revoke(id: string) {
        if (!confirm('¿Revocar esta conexión?')) return;
        const r = await fetch('/api/meta/revoke', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ connection_id: id }),
        });
        if (r.ok) load();
        else alert('Error al revocar');
    }

    if (!tenantId) return (
        <div className="card">
            <h2>Falta tenant</h2>
            <p className="muted">Selecciona un workspace desde <Link href="/panel">inicio</Link>.</p>
        </div>
    );

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>Conexiones de Meta</h1>
                    <p className="muted" style={{ margin: 0 }}>
                        Autoriza cuentas de Facebook/Meta para gestionar Business Managers y cuentas publicitarias.
                    </p>
                </div>
                <button className="btn btn-primary" onClick={connectMeta} disabled={connecting}>
                    {connecting ? 'Redirigiendo…' : '+ Conectar cuenta Meta'}
                </button>
            </header>

            {err && <div className="alert alert-error">Error: {err}</div>}
            {conns === null && !err && <p className="muted">Cargando…</p>}

            {conns?.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>◇</div>
                    <h3>Ninguna cuenta conectada</h3>
                    <p className="muted">Conecta tu primera cuenta de Meta para empezar.</p>
                </div>
            )}

            <div className="col" style={{ gap: 12 }}>
                {conns?.map(c => (
                    <div key={c.id} className="card row-between" style={{ marginBottom: 0 }}>
                        <div className="row">
                            {c.picture_url
                                ? <img src={c.picture_url} width={48} height={48}
                                       style={{ borderRadius: 24, border: '1px solid var(--border-hi)' }} alt="" />
                                : <div style={{
                                    width: 48, height: 48, borderRadius: 24,
                                    background: 'linear-gradient(135deg, #A855F7, #7E22CE)',
                                    display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700,
                                  }}>{(c.display_name ?? 'M').slice(0,1).toUpperCase()}</div>}
                            <div>
                                <strong style={{ color: 'var(--text)' }}>{c.display_name ?? 'Usuario Meta'}</strong>
                                <div className="muted">{c.email ?? '—'}</div>
                                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                                    {statusPill(c.status)}
                                    <span className="muted" style={{ fontSize: 12 }}>
                                        Desde {new Date(c.connected_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => revoke(c.id)}>Revocar</button>
                    </div>
                ))}
            </div>
        </>
    );
}

export default function ConnectionsPage() {
    return <Suspense><ConnectionsContent /></Suspense>;
}
