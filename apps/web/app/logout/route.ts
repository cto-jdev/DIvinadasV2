/**
 * GET /logout — Cierra sesión Supabase y redirige a /login.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const res = NextResponse.redirect(new URL('/login', req.url));

    const supa = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => req.cookies.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: (cs) => {
                    cs.forEach(({ name, value, options }) => res.cookies.set({ name, value, ...options }));
                },
            },
        },
    );

    await supa.auth.signOut();
    return res;
}
