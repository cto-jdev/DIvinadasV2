/**
 * Next.js middleware — protege /panel/* requiriendo sesión Supabase.
 * Si no hay sesión, redirige a /login.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const config = {
    matcher: ['/panel/:path*'],
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
