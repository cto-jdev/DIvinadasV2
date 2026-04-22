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
export type AuthResolution = {
    user: { id: string; email?: string } | null;
    source: 'bearer' | 'cookie' | 'none';
    diag?: string;
};

export async function resolveUser(req?: NextRequest): Promise<AuthResolution> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { user: null, source: 'none', diag: 'missing_env' };

    const authHeader = req?.headers.get('authorization') ?? '';
    if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            const supa = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
            const { data, error } = await supa.auth.getUser(token);
            if (data?.user) return { user: data.user, source: 'bearer' };
            return { user: null, source: 'none', diag: `bearer_rejected: ${error?.message ?? 'no user'}` };
        } catch (e) {
            return { user: null, source: 'none', diag: `bearer_throw: ${e instanceof Error ? e.message : 'unknown'}` };
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
        if (data?.user) return { user: data.user, source: 'cookie' };
        return { user: null, source: 'none', diag: `cookie_rejected: ${error?.message ?? 'no user'}` };
    } catch (e) {
        return { user: null, source: 'none', diag: `cookie_throw: ${e instanceof Error ? e.message : 'unknown'}` };
    }
}

export async function getUserFromRequest(req?: NextRequest) {
    const r = await resolveUser(req);
    return r.user;
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
