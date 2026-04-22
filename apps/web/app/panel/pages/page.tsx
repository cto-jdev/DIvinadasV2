'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api-client';

type Page = {
    id: string; name: string; category?: string;
    fan_count?: number; followers_count?: number;
    verification_status?: string; link?: string;
    picture?: { data?: { url?: string } };
    is_published?: boolean;
    instagram_business_account?: { id: string; username: string };
};

function PagesContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const connId = sp.get('conn');
    const [pages, setPages] = useState<Page[] | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            if (!tenantId || !connId) return;
            const r = await apiFetch(`/api/web/graph/pages/list?tenant_id=${tenantId}&connection_id=${connId}`);
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setErr(j.message ?? j.error ?? `HTTP ${r.status}`); return; }
            setPages(j.data);
        })();
    }, [tenantId, connId]);

    if (!tenantId || !connId) return (
        <div className="card"><h2>Faltan parámetros</h2>
            <p className="muted">Abre Pages desde el <Link href="/panel">dashboard</Link>.</p></div>
    );

    return (
        <>
            <header className="row-between" style={{ marginBottom: 20 }}>
                <div>
                    <h1 className="text-grad" style={{ fontSize: 28, marginBottom: 4 }}>📄 Pages — Fanpages</h1>
                    <p className="muted" style={{ margin: 0 }}>Páginas accesibles, vínculos con Instagram y verificación.</p>
                </div>
                <Link href={`/panel/dashboard?tenant=${tenantId}`} className="btn btn-ghost btn-sm">← Dashboard</Link>
            </header>

            {err && <div className="alert alert-error">Error: {err}</div>}
            {pages === null && !err && <p className="muted">Cargando páginas…</p>}
            {pages?.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p className="muted">No hay páginas accesibles con los scopes actuales.</p>
                </div>
            )}

            <div className="col" style={{ gap: 12 }}>
                {pages?.map(p => (
                    <div key={p.id} className="card row-between" style={{ marginBottom: 0 }}>
                        <div className="row" style={{ gap: 12 }}>
                            {p.picture?.data?.url
                                ? <img src={p.picture.data.url} width={48} height={48}
                                       style={{ borderRadius: 10, border: '1px solid var(--border-hi)' }} alt="" />
                                : <div style={{ width: 48, height: 48, borderRadius: 10, background: 'linear-gradient(135deg,#A855F7,#7E22CE)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700 }}>
                                    {p.name.slice(0, 1).toUpperCase()}</div>}
                            <div>
                                <strong style={{ color: 'var(--text)' }}>{p.name}</strong>
                                <div className="muted" style={{ fontSize: 12 }}>
                                    {p.category ?? '—'} · FB ID: {p.id}
                                </div>
                                <div className="row" style={{ gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                    {typeof p.followers_count === 'number' && (
                                        <span className="pill pill-muted">
                                            {new Intl.NumberFormat('es').format(p.followers_count)} seguidores
                                        </span>
                                    )}
                                    {p.is_published === false && <span className="pill pill-warn">oculta</span>}
                                    {p.verification_status && p.verification_status !== 'not_verified' && (
                                        <span className="pill pill-success">✓ {p.verification_status}</span>
                                    )}
                                    {p.instagram_business_account && (
                                        <span className="pill pill-success">IG: @{p.instagram_business_account.username}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {p.link && (
                            <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                                Abrir ↗
                            </a>
                        )}
                    </div>
                ))}
            </div>

            <div className="card" style={{ marginTop: 20, borderLeft: '4px solid #A855F7' }}>
                <h4 style={{ marginTop: 0 }}>Próximo incremento</h4>
                <p className="muted" style={{ margin: 0 }}>
                    Feedback Score (Verde/Amarilla/Roja), penalizaciones activas y detección de links rotos —
                    requiere <code>pages_read_user_content</code> y endpoint <code>/&lt;page&gt;/feedback_score</code>.
                </p>
            </div>
        </>
    );
}

export default function PagesPage() {
    return <Suspense><PagesContent /></Suspense>;
}
