'use client';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ExtensionPairContent() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [code, setCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function generate() {
        if (!tenantId) { setErr('Falta ?tenant en la URL'); return; }
        setLoading(true); setErr(null);
        const r = await fetch('/api/extension/pair/create', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tenant_id: tenantId }),
        });
        setLoading(false);
        const j = await r.json();
        if (!r.ok) { setErr(j.message ?? j.error); return; }
        setCode(j.code); setExpiresAt(j.expires_at);
    }

    return (
        <>
            <header style={{ marginBottom: 20 }}>
                <h1 className="text-grad" style={{ fontSize: 32, marginBottom: 4 }}>Extensión Chrome</h1>
                <p className="muted" style={{ margin: 0 }}>
                    Enlaza tu navegador al tenant mediante un código temporal de 6 dígitos.
                </p>
            </header>

            <div className="card">
                <h3>Pasos</h3>
                <ol style={{ color: 'var(--text-dim)', lineHeight: 1.8, paddingLeft: 20 }}>
                    <li>Instala <strong style={{ color: 'var(--text)' }}>DivinAds</strong> desde la Chrome Web Store.</li>
                    <li>Haz clic en el ícono y selecciona <em>Conectar con mi cuenta</em>.</li>
                    <li>Genera un código a continuación.</li>
                    <li>Ingrésalo en la extensión antes de <strong style={{ color: 'var(--text)' }}>5 minutos</strong>.</li>
                </ol>

                {!code && (
                    <button className="btn btn-primary" onClick={generate} disabled={loading}>
                        {loading ? 'Generando…' : 'Generar código de pareo'}
                    </button>
                )}

                {code && (
                    <div className="fade-in" style={{ marginTop: 12 }}>
                        <div className="code pulse">{code}</div>
                        <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
                            Vence: {expiresAt && new Date(expiresAt).toLocaleTimeString()}
                        </p>
                        <div className="row" style={{ justifyContent: 'center', marginTop: 8 }}>
                            <button className="btn btn-ghost btn-sm" onClick={generate}>Generar otro</button>
                        </div>
                    </div>
                )}

                {err && <div className="alert alert-error" style={{ marginTop: 12 }}>{err}</div>}
            </div>
        </>
    );
}

export default function ExtensionPairPage() {
    return <Suspense><ExtensionPairContent /></Suspense>;
}
