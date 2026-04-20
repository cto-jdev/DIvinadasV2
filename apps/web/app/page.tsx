import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="shell">
            <div className="card">
                <h1 style={{ color: '#6B21A8', marginTop: 0 }}>DivinAds</h1>
                <p className="muted">Gestión de Meta Business Managers para agencias.</p>
                <div className="row" style={{ marginTop: 16 }}>
                    <Link className="btn btn-primary" href="/login">Entrar</Link>
                    <Link className="btn btn-ghost" href="/signup">Crear cuenta</Link>
                </div>
            </div>
        </main>
    );
}
