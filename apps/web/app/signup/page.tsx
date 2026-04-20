'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function SignupPage() {
    const router = useRouter();
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
                emailRedirectTo: `${window.location.origin}/panel`,
            },
        });
        setLoading(false);
        if (error) { setErr(error.message); return; }
        setSent(true);
    }

    if (sent) return (
        <main className="shell" style={{ maxWidth: 420 }}>
            <div className="card">
                <h2 style={{ color: '#10B981', marginTop: 0 }}>Revisa tu correo</h2>
                <p>Te enviamos un enlace de confirmación a <strong>{email}</strong>.</p>
                <p className="muted">Una vez confirmado podrás entrar en DivinAds.</p>
            </div>
        </main>
    );

    return (
        <main className="shell" style={{ maxWidth: 420 }}>
            <div className="card">
                <h2 style={{ marginTop: 0, color: '#6B21A8' }}>Crear cuenta</h2>
                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input type="text" required placeholder="Nombre completo" value={name}
                           onChange={e => setName(e.target.value)}
                           style={{ padding: 10, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    <input type="email" required placeholder="Correo" value={email}
                           onChange={e => setEmail(e.target.value)}
                           style={{ padding: 10, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    <input type="password" required minLength={8} placeholder="Contraseña (mín. 8 caracteres)"
                           value={password} onChange={e => setPassword(e.target.value)}
                           style={{ padding: 10, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                    {err && <div style={{ color: '#DC2626', fontSize: 13 }}>{err}</div>}
                    <button className="btn btn-primary" disabled={loading}>
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
