'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const ERROR_MESSAGES: Record<string, string> = {
    missing_code:         'Enlace inválido. Solicita uno nuevo.',
    access_denied:        'Acceso denegado por Google.',
    expired_token:        'El enlace expiró. Solicita uno nuevo.',
    invalid_credentials:  'Correo o contraseña incorrectos.',
};

export default function LoginPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Mostrar errores provenientes del callback OAuth
    useEffect(() => {
        const e = sp.get('error');
        if (e) setErr(ERROR_MESSAGES[e] ?? sp.get('error_description') ?? e);
    }, []);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const supa = getSupabaseBrowser();
        const { error } = await supa.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) { setErr(ERROR_MESSAGES[error.code ?? ''] ?? error.message); return; }
        const next = sp.get('next') ?? '/panel';
        router.replace(next);
    }

    async function loginWithGoogle() {
        const supa = getSupabaseBrowser();
        await supa.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/api/auth/callback` },
        });
    }

    return (
        <main className="shell" style={{ maxWidth: 420 }}>
            <div className="card">
                <h2 style={{ marginTop: 0, color: '#6B21A8' }}>Entrar a DivinAds</h2>
                {!err && sp.get('error') === null && (
                    <p className="muted" style={{ marginTop: 0 }}>
                        ¿Sin cuenta? <Link href="/signup">Crear cuenta gratuita</Link>
                    </p>
                )}
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input type="email" required placeholder="Correo" value={email}
                           onChange={e => setEmail(e.target.value)}
                           style={{ padding: 10, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    <input type="password" required placeholder="Contraseña" value={password}
                           onChange={e => setPassword(e.target.value)}
                           style={{ padding: 10, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    {err && <div style={{ color: '#DC2626', fontSize: 13 }}>{err}</div>}
                    <button className="btn btn-primary" disabled={loading}>
                        {loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>
                <hr style={{ margin: '20px 0', border: 0, borderTop: '1px solid #E5E7EB' }} />
                <button className="btn btn-ghost" onClick={loginWithGoogle} style={{ width: '100%' }}>
                    Continuar con Google
                </button>
            </div>
        </main>
    );
}
