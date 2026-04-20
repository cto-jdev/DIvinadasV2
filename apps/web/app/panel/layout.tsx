import Link from 'next/link';

export default function PanelLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <nav style={{
                borderBottom: '1px solid #E5E7EB', padding: '12px 24px',
                display: 'flex', gap: 16, alignItems: 'center', background: '#FFF',
            }}>
                <strong style={{ color: '#6B21A8' }}>DivinAds</strong>
                <Link href="/panel">Inicio</Link>
                <Link href="/panel/connections">Conexiones Meta</Link>
                <Link href="/panel/extension">Extensión</Link>
                <Link href="/panel/team">Equipo</Link>
                <span style={{ flex: 1 }} />
                <Link href="/logout" className="muted">Salir</Link>
            </nav>
            <main className="shell">{children}</main>
        </div>
    );
}
