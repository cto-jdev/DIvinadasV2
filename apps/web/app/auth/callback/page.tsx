'use client';
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseBrowser } from '@/lib/supabase-browser';

function Inner() {
    const router = useRouter();
    const sp = useSearchParams();

    useEffect(() => {
        (async () => {
            const supa = getSupabaseBrowser();
            const code = sp.get('code');
            const next = sp.get('next') ?? '/panel';

            if (code) {
                const { error } = await supa.auth.exchangeCodeForSession(code);
                if (error) {
                    router.replace(`/login?error=${encodeURIComponent(error.message)}`);
                    return;
                }
            }

            const { data: { session } } = await supa.auth.getSession();
            if (session) router.replace(next);
            else router.replace('/login?error=no_session');
        })();
    }, [router, sp]);

    return <main className="shell"><p className="muted">Procesando…</p></main>;
}

export default function AuthCallback() {
    return <Suspense><Inner /></Suspense>;
}
