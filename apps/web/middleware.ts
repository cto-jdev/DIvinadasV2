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

const MAX_BODY_BYTES = 1 * 1024 * 1024; // 1 MB

export async function middleware(req: NextRequest) {
    // Reject oversized POST/PUT bodies before they reach route handlers.
    // Guards against memory exhaustion from malicious large payloads.
    if (req.method === 'POST' || req.method === 'PUT') {
        const cl = req.headers.get('content-length');
        if (cl && parseInt(cl, 10) > MAX_BODY_BYTES) {
            return NextResponse.json({ error: 'payload_too_large' }, { status: 413 });
        }
    }

    // API routes don't need session checks — return early
    if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    const res = NextResponse.next();

    // Si Supabase no está configurado, no podemos validar sesión. Dejamos
    // pasar para que al menos la app arranque y las páginas públicas rindan.
    // (El usuario verá la UI de /panel pero sin datos — esperado en staging.)
    const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supaKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supaUrl || !supaKey) return res;

    const supa = createServerClient(
        supaUrl,
        supaKey,
        {
            cookies: {
                getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs: { name: string; value: string; options?: Record<string, unknown> }[]) => {
                    cs.forEach(({ name, value, options }) => {
                        res.cookies.set({ name, value, ...options });
                    });
                },
            },
        },
    );

    const { data: { user } } = await supa.auth.getUser();
    if (!user) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('next', req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }
    return res;
}
