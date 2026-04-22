'use client';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { CopilotProvider, useCopilot } from '@/components/copilot/context';
import { CopilotSidebar } from '@/components/copilot/sidebar';

type NavItem = { href: string; label: string; icon: string; exact?: boolean };

const NAV: NavItem[] = [
    { href: '/panel',             label: 'Inicio',      icon: '◉', exact: true },
    { href: '/panel/dashboard',   label: 'Dashboard',   icon: '▦' },
    { href: '/panel/ads',         label: 'ADS',         icon: '◈' },
    { href: '/panel/campaigns',   label: 'Campañas',    icon: '◆' },
    { href: '/panel/bm',          label: 'BM',          icon: '⬢' },
    { href: '/panel/pages',       label: 'Páginas',     icon: '◨' },
    { href: '/panel/clonner',     label: 'Clonner',     icon: '⎘' },
    { href: '/panel/connections', label: 'Conexiones',  icon: '⚯' },
    { href: '/panel/team',        label: 'Equipo',      icon: '◌' },
    { href: '/panel/settings',    label: 'Ajustes',     icon: '⚙' },
];

const TENANT_KEY = 'divinads.tenantId';
const CONN_KEY = 'divinads.connId';

function useWorkspaceQuery(): string {
    const sp = useSearchParams();
    const [tenant, setTenant] = useState<string>('');
    const [conn, setConn] = useState<string>('');

    useEffect(() => {
        const urlTenant = sp.get('tenant');
        const urlConn = sp.get('conn');
        if (typeof window === 'undefined') return;
        const stored = window.sessionStorage.getItem(TENANT_KEY) ?? window.localStorage.getItem(TENANT_KEY);
        const storedConn = window.sessionStorage.getItem(CONN_KEY) ?? window.localStorage.getItem(CONN_KEY);
        const t = urlTenant ?? stored ?? '';
        const c = urlConn ?? storedConn ?? '';
        if (t) {
            window.sessionStorage.setItem(TENANT_KEY, t);
            window.localStorage.setItem(TENANT_KEY, t);
        }
        if (c) {
            window.sessionStorage.setItem(CONN_KEY, c);
            window.localStorage.setItem(CONN_KEY, c);
        }
        setTenant(t); setConn(c);
    }, [sp]);

    if (!tenant) return '';
    const params = new URLSearchParams();
    params.set('tenant', tenant);
    if (conn) params.set('conn', conn);
    return `?${params.toString()}`;
}

function PanelLayoutInner({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();
    const [ready, setReady] = useState(false);

    // If URL lacks tenant but storage has one, hydrate URL so pages see it.
    useEffect(() => {
        if (pathname === '/panel') return;
        if (sp.get('tenant')) return;
        if (typeof window === 'undefined') return;
        const t = window.sessionStorage.getItem(TENANT_KEY) ?? window.localStorage.getItem(TENANT_KEY);
        if (!t) return;
        const c = window.sessionStorage.getItem(CONN_KEY) ?? window.localStorage.getItem(CONN_KEY);
        const params = new URLSearchParams(sp.toString());
        params.set('tenant', t);
        if (c && !params.get('conn')) params.set('conn', c);
        router.replace(`${pathname}?${params.toString()}`);
    }, [pathname, sp, router]);

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
    const wsQuery = useWorkspaceQuery();
    const [navOpen, setNavOpen] = useState(false);
    const withWs = (href: string) => {
        if (href === '/logout') return href;
        return `${href}${wsQuery}`;
    };

    useEffect(() => { setNavOpen(false); }, [pathname]);
    useEffect(() => {
        if (!navOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false); };
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKey);
        };
    }, [navOpen]);

    const activeLabel = NAV.find(n => n.exact ? pathname === n.href : pathname.startsWith(n.href))?.label ?? 'Panel';

    return (
        <div className={`app-frame ${open ? '' : 'copilot-closed'} ${navOpen ? 'nav-drawer-open' : ''}`}>
            <button
                className="nav-backdrop"
                aria-label="Cerrar menú"
                onClick={() => setNavOpen(false)}
                tabIndex={navOpen ? 0 : -1}
            />
            <aside className="app-side-left" aria-label="Módulos">
                <Link href={withWs('/panel')} className="nav-brand">
                    <span className="nav-brand-mark">✦</span>
                    <span className="nav-brand-text">DivinAds</span>
                </Link>
                <nav className="nav-list">
                    {NAV.map(item => {
                        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link key={item.href} href={withWs(item.href)} className={`nav-item ${active ? 'active' : ''}`}>
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
            <main className="app-main fade-in">
                <div className="mobile-topbar">
                    <button
                        className="mobile-nav-trigger"
                        aria-label="Abrir menú"
                        aria-expanded={navOpen}
                        onClick={() => setNavOpen(v => !v)}
                    >
                        <span /><span /><span />
                    </button>
                    <div className="mobile-topbar-title">
                        <span className="nav-brand-mark" style={{ fontSize: 16 }}>✦</span>
                        <span>{activeLabel}</span>
                    </div>
                </div>
                {children}
            </main>
            <CopilotSidebar />
        </div>
    );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={<main className="shell"><p className="muted">Cargando…</p></main>}>
            <PanelLayoutInner>{children}</PanelLayoutInner>
        </Suspense>
    );
}
