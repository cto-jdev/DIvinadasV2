import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = cookies();
    const supa = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                    cs.forEach(({ name, value, options }) => {
                        try { cookieStore.set({ name, value, ...options }); } catch { /* RSC */ }
                    });
                },
            },
        },
    );
    const { data: { user } } = await supa.auth.getUser();
    if (!user) redirect('/login?next=/panel');

    return (
        <>
            <nav className="topnav">
                <div className="topnav-inner">
                    <Link href="/panel" className="brand">DivinAds</Link>
                    <Link href="/panel">Inicio</Link>
                    <Link href="/panel/connections">Conexiones Meta</Link>
                    <Link href="/panel/team">Equipo</Link>
                    <span style={{ flex: 1 }} />
                    <Link href="/logout" className="muted">Salir</Link>
                </div>
            </nav>
            <main className="shell fade-in">{children}</main>
        </>
    );
}
