import Link from 'next/link';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
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
