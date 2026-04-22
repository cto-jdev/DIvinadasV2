'use client';
/**
 * Token-based API client. Attaches the current Supabase access_token
 * as `Authorization: Bearer ...` to every request, so the server does
 * not depend on cookies. Same pattern as Meta/Stripe/etc.
 *
 * On 401, tries to refresh the session once before failing.
 */
import { getSupabaseBrowser } from './supabase-browser';

async function getAccessToken(): Promise<string | null> {
    const supa = getSupabaseBrowser();
    const { data: { session } } = await supa.auth.getSession();
    return session?.access_token ?? null;
}

async function refreshToken(): Promise<string | null> {
    const supa = getSupabaseBrowser();
    const { data } = await supa.auth.refreshSession();
    return data.session?.access_token ?? null;
}

export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    let token = await getAccessToken();
    const headers = new Headers(init.headers);
    if (token) headers.set('authorization', `Bearer ${token}`);
    if (init.body && !headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }

    let res = await fetch(input, { ...init, headers, credentials: 'same-origin' });

    if (res.status === 401) {
        token = await refreshToken();
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
            res = await fetch(input, { ...init, headers, credentials: 'same-origin' });
        }
    }
    return res;
}

export async function apiJson<T = unknown>(input: string, init: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
    const res = await apiFetch(input, init);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        return { ok: false, status: res.status, data: null, error: (data as any)?.error ?? `http_${res.status}` };
    }
    return { ok: true, status: res.status, data: data as T };
}
