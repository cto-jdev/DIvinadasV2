/**
 * Auth helpers para handlers Next.js App Router.
 *
 *  - getUserFromRequest(req): resuelve el usuario Supabase desde cookies.
 *  - getInstallFromJwt(req):  valida el JWT de la extensión y devuelve
 *                             { tenant_id, user_id, install_id }.
 */
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

/**
 * Resolve the Supabase user for an API request. Prefers the
 * Authorization: Bearer <access_token> header (stateless, token-based,
 * same pattern as Meta/Facebook Graph, Stripe, etc). Falls back to
 * session cookies for requests that don't carry the header (legacy SSR).
 */
export async function getUserFromRequest(req?: NextRequest) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    const authHeader = req?.headers.get('authorization') ?? '';
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const supa = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
            const { data, error } = await supa.auth.getUser(token);
            if (!error && data?.user) return data.user;
        } catch {
            // fall through to cookie fallback
        }
    }

    try {
        const cookieStore = cookies();
        const supa = createServerClient(url, key, {
            cookies: {
                getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
                setAll: () => { /* route handlers can't write cookies */ },
            },
        });
        const { data, error } = await supa.auth.getUser();
        if (error) return null;
        return data?.user ?? null;
    } catch {
        return null;
    }
}

export async function getInstallFromJwt(req: NextRequest) {
    const h = req.headers.get('authorization') ?? '';
    if (!h.startsWith('Bearer ')) return null;
    const token = h.slice(7);
    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.JWT_SECRET!),
        );
        return {
            tenant_id:  payload.tid as string,
            user_id:    payload.uid as string,
            install_id: payload.iid as string,
            jti:        payload.jti as string,
        };
    } catch {
        return null;
    }
}
