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
    const state   = req.nextUrl.searchParams.get('state');
    const next    = req.nextUrl.searchParams.get('next') ?? '/panel';
    const errParam = req.nextUrl.searchParams.get('error');
    const errDesc  = req.nextUrl.searchParams.get('error_description');

    // Guard: if this callback received a Meta/Facebook OAuth response (has
    // `state` param in our signed format `base64url.hmac`) it means
    // FB_REDIRECT_URI was misconfigured to hit this route. Forward the whole
    // query to the correct Meta callback instead of clobbering the session.
    if (state && state.includes('.')) {
        const forward = new URL('/api/meta/callback', req.url);
        req.nextUrl.searchParams.forEach((v, k) => forward.searchParams.set(k, v));
        return NextResponse.redirect(forward);
    }

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
        // If the user already has a valid session, don't clobber it — just go next.
        const { data: { user } } = await supa.auth.getUser();
        if (user) return res;
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('error', error.message);
        return NextResponse.redirect(url);
    }

    // Sesión establecida — cookies httpOnly ya seteadas por setAll()
    return res;
}
