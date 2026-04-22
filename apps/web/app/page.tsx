import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="shell">
            <section className="fade-in" style={{ padding: '80px 0 40px', textAlign: 'center' }}>
                <div className="pill" style={{ marginBottom: 24 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: '#10B981' }} />
                    v2.0 · Producción
                </div>
                <h1 className="text-grad" style={{ maxWidth: 820, margin: '0 auto 18px' }}>
                    La suite definitiva para gestionar Meta Business Managers
                </h1>
                <p style={{ maxWidth: 620, margin: '0 auto 36px', fontSize: 18 }}>
                    Gestión multi-tenant para agencias. Conecta cuentas de Meta, administra equipos,
                    analiza cuentas publicitarias y controla todo desde un único panel.
                </p>
                <div className="row" style={{ justifyContent: 'center' }}>
                    <Link className="btn btn-primary" href="/signup">Crear cuenta gratuita</Link>
                    <Link className="btn btn-ghost" href="/login">Entrar</Link>
                </div>
            </section>

            <section className="grid-2" style={{ marginTop: 40 }}>
                <FeatureCard
                    icon="◆"
                    title="Multi-tenant seguro"
                    text="Aísla cada cliente con RLS a nivel de base de datos. Roles owner, admin y member." />
                <FeatureCard
                    icon="◇"
                    title="OAuth con Meta"
                    text="Long-lived tokens con refresh automático. appsecret_proof activado por defecto." />
                <FeatureCard
                    icon="◈"
                    title="Workspaces aislados"
                    text="Cada cliente vive en su propio espacio con datos separados y roles definidos." />
                <FeatureCard
                    icon="◉"
                    title="Licencias flexibles"
                    text="Planes Trial, Starter, Pro y Enterprise. Activación inmediata tras la compra." />
            </section>

            <footer className="muted" style={{ textAlign: 'center', padding: '60px 0 20px' }}>
                <Link href="/terms">Términos</Link> · <Link href="/privacy">Privacidad</Link>
            </footer>
        </main>
    );
}

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
    return (
        <div className="card card-glow fade-in">
            <div style={{ fontSize: 28, color: 'var(--primary-hi)', marginBottom: 10 }}>{icon}</div>
            <h3 style={{ color: 'var(--text)' }}>{title}</h3>
            <p style={{ margin: 0 }}>{text}</p>
        </div>
    );
}
