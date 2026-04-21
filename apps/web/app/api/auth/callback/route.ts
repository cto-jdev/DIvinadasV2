/**
 * GET /api/auth/callback
 * Callback de Supabase Auth para:
 *   - Magic link (email OTP)
 *   - OAuth providers (Google)
 *
 * Supabase redirige aquí con ?code=XXX o con error=XXX.
 * Canjea el code → sesión httpOnly → redirige al panel o a /login.
 *
 * IMPORTANTE: Esta ruta debe registrarse en Supabase Dashboard como
 *   Site URL: https://app.divinads.com
 *   Allowed Redirect URLs: https://app.divinads.com/api/auth/callback
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const code    = req.nextUrl.searchParams.get('code');
    const next    = req.nextUrl.searchParams.get('next') ?? '/panel';
    const errParam = req.nextUrl.searchParams.get('error');
    const errDesc  = req.nextUrl.searchParams.get('error_description');

    // Supabase devolvió error (usuario denegó, link expirado, etc.)
    if (errParam) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', errParam);
        url.searchParams.set('error_description', errDesc ?? '');
        return NextResponse.redirect(url);
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
    }

    const res = NextResponse.redirect(new URL(next, req.url));

    const supa = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                    cs.forEach(({ name, value, options }) =>
                        res.cookies.set({ name, value, ...options })
                    );
                },
            },
        },
    );

    const { error } = await supa.auth.exchangeCodeForSession(code);

    if (error) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', error.message);
        return NextResponse.redirect(url);
    }

    // Sesión establecida — cookies httpOnly ya seteadas por setAll()
    return res;
}
