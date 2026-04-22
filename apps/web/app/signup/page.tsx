'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const supa = getSupabaseBrowser();
        const { error } = await supa.auth.signUp({
            email, password,
            options: {
                data: { full_name: name },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/panel`,
            },
        });
        setLoading(false);
        if (error) { setErr(error.message); return; }
        setSent(true);
    }

    if (sent) return (
        <main className="shell-narrow fade-in">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Link href="/" className="brand" style={{ fontSize: 22 }}>DivinAds</Link>
            </div>
            <div className="card card-glow">
                <div className="pill pill-success" style={{ marginBottom: 12 }}>✓ Cuenta creada</div>
                <h2 style={{ marginTop: 0 }}>Revisa tu correo</h2>
                <p>Te enviamos un enlace de confirmación a <strong style={{ color: 'var(--text)' }}>{email}</strong>.</p>
                <p className="muted">Una vez confirmado podrás entrar en DivinAds.</p>
                <Link className="btn btn-ghost btn-block" href="/login" style={{ marginTop: 12 }}>
                    Volver a inicio de sesión
                </Link>
            </div>
        </main>
    );

    return (
        <main className="shell-narrow fade-in">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Link href="/" className="brand" style={{ fontSize: 22 }}>DivinAds</Link>
            </div>
            <div className="card card-glow">
                <h2 style={{ marginTop: 0 }} className="text-grad">Crear cuenta</h2>
                <p className="muted" style={{ marginTop: 0 }}>
                    Empieza gratis — sin tarjeta de crédito.
                </p>

                <form onSubmit={submit} className="col" style={{ gap: 14, marginTop: 8 }}>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Nombre completo</label>
                        <input type="text" required value={name}
                               onChange={e => setName(e.target.value)}
                               placeholder="Juan Pérez" autoComplete="name" />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Correo</label>
                        <input type="email" required value={email}
                               onChange={e => setEmail(e.target.value)}
                               placeholder="tu@email.com" autoComplete="email" />
                    </div>
                    <div className="field" style={{ marginBottom: 0 }}>
                        <label className="label">Contraseña</label>
                        <input type="password" required minLength={8} value={password}
                               onChange={e => setPassword(e.target.value)}
                               placeholder="Mín. 8 caracteres" autoComplete="new-password" />
                    </div>
                    {err && <div className="alert alert-error">{err}</div>}
                    <button className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Creando cuenta…' : 'Crear cuenta'}
                    </button>
                </form>

                <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
                    ¿Ya tienes cuenta? <Link href="/login">Entrar</Link>
                </p>
            </div>
        </main>
    );
}
