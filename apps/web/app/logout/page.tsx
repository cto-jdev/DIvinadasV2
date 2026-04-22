'use client';
import { useEffect } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

export default function Logout() {
    useEffect(() => {
        (async () => {
            try { await getSupabaseBrowser().auth.signOut(); } catch { /* ignore */ }
            window.location.replace('/login');
        })();
    }, []);
    return <main className="shell"><p className="muted">Cerrando sesión…</p></main>;
}
