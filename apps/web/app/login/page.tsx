'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null); setLoading(true);
        const supa = getSupabaseBrowser();
        const { error } = await supa.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) { setErr(error.message); return; }
        router.replace('/panel');
    }

    async function loginWithGoogle() {
        const supa = getSupabaseBrowser();
        await supa.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/panel` },
        });
    }

    return (
        <main className="shell" style={{ maxWidth: 420 }}>
            <div className="card">
                <h2 style={{ marginTop: 0, color: '#6B21A8' }}>Entrar a DivinAds</h2>
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
