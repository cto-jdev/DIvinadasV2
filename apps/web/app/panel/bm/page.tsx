'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type Bm = { id: string; name: string; role: 'owner' | 'client'; verification_status?: string };

function BmContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connId = sp.get('conn');
    const [bms, setBms] = useState<Bm[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!tenantId || !connId) return;
            const r = await apiFetch(`/api/web/graph/bm/list?tenant_id=${tenantId}&connection_id=${connId}`);
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setErr(j.message ?? j.error ?? `HTTP ${r.status}`); return; }
            setBms(j.data);
        })();
    }, [tenantId, connId]);

    if (!tenantId || !connId) return (
        <div className="card"><h2>Faltan parámetros</h2>
            <p className="muted">Abre BM Hub desde el <Link href="/panel">dashboard</Link>.</p></div>
    );

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 28, marginBottom: 4 }}>💼 Business Manager Hub</h1>
                    <p className="muted" style={{ margin: 0 }}>
                        Entidades legales en Meta: status de verificación, rol, invitaciones.
                    </p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

            {err && <div className="alert alert-error">Error: {err}</div>}
            {bms === null && !err && <p className="muted">Cargando BMs…</p>}
            {bms?.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p className="muted">No se detectaron Business Managers en esta conexión.</p>
                </div>
            )}

            <div className="col" style={{ gap: 12 }}>
                {bms?.map(bm => (
                    <div key={bm.id} className="card row-between" style={{ marginBottom: 0 }}>
                        <div>
                            <strong style={{ color: 'var(--text)' }}>{bm.name}</strong>
                            <div className="muted" style={{ fontSize: 12 }}>
                                BM ID: {bm.id} · rol: {bm.role === 'owner' ? 'propio' : 'cliente'}
                            </div>
                            <div className="row" style={{ gap: 6, marginTop: 6 }}>
                                <span className={`pill ${bm.role === 'owner' ? 'pill-success' : 'pill-muted'}`}>{bm.role}</span>
                                {bm.verification_status && (
                                    <span className="pill pill-muted">verificación: {bm.verification_status}</span>
                                )}
                            </div>
                        </div>
                        <a href={`https://business.facebook.com/settings/info?business_id=${bm.id}`}
                           target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                            Abrir en Meta ↗
                        </a>
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: 20, borderLeft: '4px solid #A855F7' }}>
                <h4 style={{ marginTop: 0 }}>Próximo incremento</h4>
                <p className="muted" style={{ margin: 0 }}>
                    Detección de hidden admins, invitaciones pendientes y alertas de compliance —
                    requiere extensión de scopes y endpoints adicionales del Graph Business API.
                </p>
            </div>
        </>
    );
}

export default function BmPage() {
    return <Suspense><BmContent /></Suspense>;
}
