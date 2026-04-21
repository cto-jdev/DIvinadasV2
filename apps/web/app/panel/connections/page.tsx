'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type Conn = {
    id: string;
    display_name: string | null;
    email: string | null;
    picture_url: string | null;
    status: string;
    connected_at: string;
};

function ConnectionsContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [conns, setConns] = useState<Conn[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    async function load() {
        if (!tenantId) return;
        const r = await fetch(`/api/meta/connections?tenant_id=${tenantId}`);
        const j = await r.json();
        if (!r.ok) { setErr(j.error ?? 'error'); return; }
        setConns(j.data);
    }

    useEffect(() => { load(); }, [tenantId]);

    async function connectMeta() {
        const r = await fetch('/api/meta/start', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tenant_id: tenantId }),
        });
        const j = await r.json();
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

    if (!tenantId) return <p>Falta parámetro ?tenant=</p>;

    return (
        <>
            <div className="row-between">
                <h2 style={{ color: '#6B21A8' }}>Conexiones de Meta</h2>
                <button className="btn btn-primary" onClick={connectMeta}>+ Conectar cuenta Meta</button>
            </div>
            {err && <div style={{ color: '#DC2626' }}>Error: {err}</div>}
            {conns === null && <p className="muted">Cargando…</p>}
            {conns?.length === 0 && (
                <div className="card">
                    <p className="muted">Aún no hay ninguna cuenta conectada.</p>
                </div>
            )}
            {conns?.map(c => (
                <div key={c.id} className="card row-between">
                    <div className="row">
                        {c.picture_url && <img src={c.picture_url} width={48} height={48} style={{ borderRadius: 24 }} alt="" />}
                        <div>
                            <strong>{c.display_name ?? 'Usuario Meta'}</strong>
                            <div className="muted">{c.email ?? '—'}</div>
                            <div className="muted">
                                Estado: {c.status} · Conectado {new Date(c.connected_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-danger" onClick={() => revoke(c.id)}>Revocar</button>
                </div>
            ))}
        </>
    );
}

export default function ConnectionsPage() {
    return <Suspense><ConnectionsContent /></Suspense>;
}
