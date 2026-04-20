/**
 * Auth helpers para handlers Next.js App Router.
 *
 *  - getUserFromRequest(req): resuelve el usuario Supabase desde cookies.
 *  - getInstallFromJwt(req):  valida el JWT de la extensión y devuelve
 *                             { tenant_id, user_id, install_id }.
 */
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { createServerClient } from '@supabase/ssr';

export async function getUserFromRequest(req: NextRequest) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const cookieStore = req.cookies;

    const supa = createServerClient(url, key, {
        cookies: {
            getAll: () => cookieStore.getAll().map(c => ({ name: c.name, value: c.value })),
            setAll: () => { /* read-only in API handler */ },
        },
    });

    const { data: { user } } = await supa.auth.getUser();
    return user;
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
