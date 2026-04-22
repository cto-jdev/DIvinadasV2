'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

const ERROR_MESSAGES: Record<string, string> = {
    missing_code:         'Enlace inválido. Solicita uno nuevo.',
    access_denied:        'Acceso denegado por Google.',
    expired_token:        'El enlace expiró. Solicita uno nuevo.',
    invalid_credentials:  'Correo o contraseña incorrectos.',
    email_not_confirmed:  'Confirma tu correo antes de entrar.',
};

function LoginContent() {
    const router = useRouter();
    const sp = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const e = sp.get('error');
        if (e) setErr(ERROR_MESSAGES[e] ?? sp.get('error_description') ?? e);
    }, [sp]);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const supa = getSupabaseBrowser();
        const { error } = await supa.auth.signInWithPassword({ email, password });
        if (error) { setLoading(false); setErr(ERROR_MESSAGES[error.code ?? ''] ?? error.message); return; }
        // Force cookie flush before navigating — without this the browser may
        // race with the server-side middleware reading the auth cookie.
        const { data: { session } } = await supa.auth.getSession();
        setLoading(false);
        if (!session) { setErr('No se pudo establecer la sesión. Reintenta.'); return; }
        const next = sp.get('next') ?? '/panel';
        // Full reload ensures middleware and RSC see the freshly-set cookies.
        window.location.assign(next);
    }

    async function loginWithGoogle() {
        const supa = getSupabaseBrowser();
        await supa.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/api/auth/callback` },
        });
    }

    return (
        <main className="shell-narrow fade-in">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Link href="/" className="brand" style={{ fontSize: 22 }}>DivinAds</Link>
            </div>
            <div className="card card-glow">
                <h2 style={{ marginTop: 0 }} className="text-grad">Entrar</h2>
                <p className="muted" style={{ marginTop: 0 }}>
                    ¿Sin cuenta? <Link href="/signup">Crear cuenta</Link>
                </p>

                <form onSubmit={submit} className="col" style={{ gap: 14, marginTop: 8 }}>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Correo</label>
                        <input type="email" required value={email}
                               onChange={e => setEmail(e.target.value)}
                               placeholder="tu@email.com" autoComplete="email" />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Contraseña</label>
                        <input type="password" required value={password}
                               onChange={e => setPassword(e.target.value)}
                               placeholder="••••••••" autoComplete="current-password" />
                    </div>
                    {err && <div className="alert alert-error">{err}</div>}
                    <button className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>

                <hr className="divider" />

                <button className="btn btn-ghost btn-block" onClick={loginWithGoogle} type="button">
                    <span style={{ fontSize: 16 }}>G</span> Continuar con Google
                </button>
            </div>
        </main>
    );
}

export default function LoginPage() {
    return <Suspense><LoginContent /></Suspense>;
}
