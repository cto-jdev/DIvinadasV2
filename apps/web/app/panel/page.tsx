'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

type Tenant = {
    tenant_id: string;
    slug: string;
    display_name: string;
    status: string;
    role: string;
};

export default function PanelHome() {
    const [tenants, setTenants] = useState<Tenant[] | null>(null);
    const [email, setEmail] = useState<string>('');
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const supa = getSupabaseBrowser();
            const { data: { user } } = await supa.auth.getUser();
            setEmail(user?.email ?? '');

            const r = await apiFetch('/api/tenant/me');
            const j = await r.json().catch(() => ({}));
            if (!r.ok) { setErr(j.error ?? `HTTP ${r.status}`); setTenants([]); return; }
            setTenants((j.data ?? []).filter((t: Tenant) => t.status !== 'deleted'));
        })();
    }, []);

    return (
        <>
            <header style={{ marginBottom: 24 }}>
                <h1 className="text-grad" style={{ fontSize: 36, marginBottom: 6 }}>Bienvenido</h1>
                <p className="muted" style={{ margin: 0 }}>Sesión: {email}</p>
            </header>

            {err && <div className="alert alert-error">Error: {err}</div>}

            <div className="card">
                <div className="row-between" style={{ marginBottom: 8 }}>
                    <div>
                        <h3 style={{ margin: 0 }}>Tus espacios de trabajo</h3>
                        <p className="muted" style={{ margin: '4px 0 0' }}>
                            Cada tenant es un workspace independiente con sus propias conexiones de Meta y equipo.
                        </p>
                    </div>
                    <Link href="/panel/new-tenant" className="btn btn-primary">+ Nuevo tenant</Link>
                </div>

                {tenants === null && !err && <p className="muted" style={{ marginTop: 16 }}>Cargando…</p>}

                {tenants?.length === 0 && (
                    <div className="alert" style={{ marginTop: 18, textAlign: 'center', padding: 24 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>◇</div>
                        <p style={{ margin: '0 0 12px', color: 'var(--text)' }}>
                            Aún no perteneces a ningún tenant.
                        </p>
                        <p className="muted" style={{ margin: 0 }}>
                            Crea tu primer espacio de trabajo para conectar una cuenta de Meta.
                        </p>
                    </div>
                )}

                {tenants && tenants.length > 0 && (
                    <div className="col" style={{ marginTop: 18, gap: 0 }}>
                        {tenants.map(t => (
                            <div key={t.tenant_id} className="row-between"
                                 style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>{t.display_name}</strong>
                                    <div className="muted">@{t.slug} · rol <span className="pill pill-muted" style={{ padding: '2px 8px' }}>{t.role}</span></div>
                                </div>
                                <Link className="btn btn-ghost btn-sm"
                                      href={`/panel/connections?tenant=${t.tenant_id}`}>Abrir →</Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
