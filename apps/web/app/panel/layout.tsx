'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { CopilotProvider, useCopilot } from '@/components/copilot/context';
import { CopilotSidebar } from '@/components/copilot/sidebar';

type NavItem = { href: string; label: string; icon: string; exact?: boolean };

const NAV: NavItem[] = [
    { href: '/panel',             label: 'Inicio',      icon: '◉', exact: true },
    { href: '/panel/dashboard',   label: 'Dashboard',   icon: '▦' },
    { href: '/panel/ads',         label: 'ADS',         icon: '◈' },
    { href: '/panel/bm',          label: 'BM',          icon: '⬢' },
    { href: '/panel/pages',       label: 'Páginas',     icon: '◨' },
    { href: '/panel/clonner',     label: 'Clonner',     icon: '⎘' },
    { href: '/panel/connections', label: 'Conexiones',  icon: '⚯' },
    { href: '/panel/team',        label: 'Equipo',      icon: '◌' },
];

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
        <CopilotProvider>
            <Shell pathname={pathname}>{children}</Shell>
        </CopilotProvider>
    );
}

function Shell({ pathname, children }: { pathname: string; children: React.ReactNode }) {
    const { open } = useCopilot();
    return (
        <div className={`app-frame ${open ? '' : 'copilot-closed'}`}>
            <aside className="app-side-left" aria-label="Módulos">
                <Link href="/panel" className="nav-brand">
                    <span className="nav-brand-mark">✦</span>
                    <span className="nav-brand-text">DivinAds</span>
                </Link>
                <nav className="nav-list">
                    {NAV.map(item => {
                        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={item.href} className={`nav-item ${active ? 'active' : ''}`}>
                                <span className="nav-item-icon">{item.icon}</span>
                                <span className="nav-item-label">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="nav-foot">
                    <Link href="/logout" className="nav-item subtle">
                        <span className="nav-item-icon">⏻</span>
                        <span className="nav-item-label">Salir</span>
                    </Link>
                </div>
            </aside>
            <main className="app-main fade-in">{children}</main>
            <CopilotSidebar />
        </div>
    );
}
