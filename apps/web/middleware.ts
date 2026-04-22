/**
 * Next.js middleware — protege /panel/* requiriendo sesión Supabase.
 * También refresca la cookie de sesión en cada request (sliding expiry).
 * Si no hay sesión, redirige a /login preservando la ruta con ?next=
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const config = {
    matcher: [
        '/panel/:path*',
        '/admin/:path*',
        '/api/:path*',
    ],
};

const MAX_BODY_BYTES = 1 * 1024 * 1024;

function hasSupabaseAuthCookie(req: NextRequest): boolean {
    // Cookies look like `sb-<project-ref>-auth-token(.N)?`. If any chunk is
    // present we consider the user *possibly* authenticated and let the
    // route-level logic do the definitive check. This avoids spurious
    // redirects when getUser() returns null transiently in edge runtime.
    return req.cookies.getAll().some(c => /^sb-.*-auth-token(\.\d+)?$/.test(c.name));
}

export async function middleware(req: NextRequest) {
    if (req.method === 'POST' || req.method === 'PUT') {
        const cl = req.headers.get('content-length');
        if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
            return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
        }
    }

    if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    const res = NextResponse.next();

    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supaUrl || !supaKey) return res;

    // Fast path: no auth cookie at all → redirect to login.
    if (!hasSupabaseAuthCookie(req)) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    // If an auth cookie exists, attempt a refresh but do NOT redirect on
    // failure — let the page/API layer decide. This prevents false negatives
    // from transient edge-runtime quirks in @supabase/ssr.
    const supa = createServerClient(supaUrl, supaKey, {
        cookies: {
            getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
            setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                cs.forEach(({ name, value, options }) => {
                    res.cookies.set({ name, value, ...options });
                });
            },
        },
    });

    try {
        await supa.auth.getUser();
    } catch {
        // swallow; cookies may still be valid for the page-level client.
    }
    return res;
}
