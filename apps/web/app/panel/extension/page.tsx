'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ExtensionPairPage() {
    const sp = useSearchParams();
    const tenantId = sp.get('tenant');
    const [code, setCode] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function generate() {
        if (!tenantId) { setErr('Falta ?tenant'); return; }
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
            <h2 style={{ color: '#6B21A8' }}>Conectar la extensión Chrome</h2>
            <div className="card">
                <ol>
                    <li>Instala la extensión DivinAds en Chrome (Chrome Web Store).</li>
                    <li>Haz clic en el ícono y selecciona <em>Conectar con mi cuenta</em>.</li>
                    <li>Pulsa el botón de abajo para generar un código de 6 dígitos.</li>
                    <li>Ingrésalo en la extensión antes de 5 minutos.</li>
                </ol>

                {!code && (
                    <button className="btn btn-primary" onClick={generate} disabled={loading}>
                        {loading ? 'Generando…' : 'Generar código de pareo'}
                    </button>
                )}

                {code && (
                    <>
                        <div className="code">{code}</div>
                        <p className="muted" style={{ textAlign: 'center' }}>
                            Vence: {expiresAt && new Date(expiresAt).toLocaleTimeString()}
                        </p>
                        <button className="btn btn-ghost" onClick={generate}>Generar otro</button>
                    </>
                )}

                {err && <div style={{ color: '#DC2626', marginTop: 12 }}>{err}</div>}
            </div>
        </>
    );
}
