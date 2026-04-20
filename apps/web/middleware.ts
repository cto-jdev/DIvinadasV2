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
        /*
         * Excluir archivos estáticos y rutas de auth para evitar loops.
         * El patrón negativo no está disponible en todos los entornos de Edge,
         * así que se lista explícitamente lo que SÍ se protege.
         */
    ],
};

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supa = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs) => {
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
