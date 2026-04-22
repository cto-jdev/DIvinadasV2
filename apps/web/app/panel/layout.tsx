'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const supa = getSupabaseBrowser();
        let cancelled = false;

        (async () => {
            const { data: { session } } = await supa.auth.getSession();
            if (cancelled) return;
            if (!session) {
                router.replace(`/login?next=${encodeURIComponent(pathname)}`);
                return;
            }
            setReady(true);
        })();

        const { data: sub } = supa.auth.onAuthStateChange((_ev, session) => {
            if (!session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
        });

        return () => { cancelled = true; sub.subscription.unsubscribe(); };
    }, [router, pathname]);

    if (!ready) {
        return <main className="shell"><p className="muted">Cargando…</p></main>;
    }

    return (
        <>
            <nav className="topnav">
                <div className="topnav-inner">
                    <Link href="/panel" className="brand">DivinAds</Link>
                    <Link href="/panel">Inicio</Link>
                    <Link href="/panel/dashboard">Dashboard</Link>
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
