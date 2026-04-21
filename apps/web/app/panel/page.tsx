import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseService } from '@/lib/supabase';

async function getTenants(userId: string) {
    const supa = getSupabaseService();
    const { data } = await supa.from('tenant_members')
        .select('role, tenants(id, slug, display_name)')
        .eq('user_id', userId);
    return data ?? [];
}

export default async function PanelHome() {
    const cookieStore = cookies();
    const supa = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: () => {},
            },
        },
    );
    const { data: { user } } = await supa.auth.getUser();
    const tenants = user ? await getTenants(user.id) : [];

    return (
        <>
            <header style={{ marginBottom: 24 }}>
                <h1 className="text-grad" style={{ fontSize: 36, marginBottom: 6 }}>Bienvenido</h1>
                <p className="muted" style={{ margin: 0 }}>Sesión: {user?.email}</p>
            </header>

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

                {tenants.length === 0 ? (
                    <div className="alert" style={{ marginTop: 18, textAlign: 'center', padding: 24 }}>
                        <div style={{ fontSize: 32, marginBottom: 8 }}>◇</div>
                        <p style={{ margin: '0 0 12px', color: 'var(--text)' }}>
                            Aún no perteneces a ningún tenant.
                        </p>
                        <p className="muted" style={{ margin: 0 }}>
                            Crea tu primer espacio de trabajo para conectar una cuenta de Meta.
                        </p>
                    </div>
                ) : (
                    <div className="col" style={{ marginTop: 18, gap: 0 }}>
                        {tenants.map((t: any) => (
                            <div key={t.tenants.id} className="row-between"
                                 style={{ padding: '16px 0', borderTop: '1px solid var(--border)' }}>
                                <div>
                                    <strong style={{ color: 'var(--text)' }}>{t.tenants.display_name}</strong>
                                    <div className="muted">@{t.tenants.slug} · rol <span className="pill pill-muted" style={{ padding: '2px 8px' }}>{t.role}</span></div>
                                </div>
                                <Link className="btn btn-ghost btn-sm"
                                      href={`/panel/connections?tenant=${t.tenants.id}`}>Abrir →</Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
