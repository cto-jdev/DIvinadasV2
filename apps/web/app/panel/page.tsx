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
            <h2 style={{ color: '#6B21A8' }}>Bienvenido</h2>
            <p className="muted">Sesión: {user?.email}</p>

            <div className="card">
                <div className="row-between">
                    <h3 style={{ margin: 0 }}>Tus espacios de trabajo</h3>
                    <Link href="/panel/new-tenant" className="btn btn-ghost">+ Nuevo tenant</Link>
                </div>
                {tenants.length === 0 && <p className="muted">Aún no perteneces a ningún tenant.</p>}
                {tenants.map((t: any) => (
                    <div key={t.tenants.id} className="row-between" style={{ padding: '12px 0', borderTop: '1px solid #E5E7EB' }}>
                        <div>
                            <strong>{t.tenants.display_name}</strong>
                            <div className="muted">@{t.tenants.slug} · rol {t.role}</div>
                        </div>
                        <Link className="btn btn-primary"
                              href={`/panel/connections?tenant=${t.tenants.id}`}>Abrir</Link>
                    </div>
                ))}
            </div>
        </>
    );
}
