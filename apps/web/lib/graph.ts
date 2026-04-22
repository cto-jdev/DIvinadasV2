/**
 * Cliente del Graph API de Meta — usado solo en el backend.
 * Firma cada request con appsecret_proof y centraliza manejo de errores.
 */
import crypto from 'node:crypto';

const FB_API = process.env.FB_API_VERSION || 'v20.0';

export class GraphError extends Error {
    constructor(
        public status: number,
        public fbCode: number | null,
        public fbMessage: string,
    ) {
        super(`graph_error ${status}: ${fbMessage}`);
    }
}

function appsecretProof(token: string): string {
    return crypto.createHmac('sha256', process.env.FB_APP_SECRET!).update(token).digest('hex');
}

export async function graphGet<T = unknown>(
    path: string,
    accessToken: string,
    params: Record<string, string> = {},
): Promise<T> {
    const url = new URL(`https://graph.facebook.com/${FB_API}${path}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('appsecret_proof', appsecretProof(accessToken));

    const res = await fetch(url, { headers: { accept: 'application/json' } });
    if (!res.ok) {
        const body = await res.json().catch(() => ({} as any));
        throw new GraphError(res.status, body?.error?.code ?? null, body?.error?.message ?? 'unknown');
    }
    return res.json() as Promise<T>;
}

export async function graphPost<T = unknown>(
    path: string,
    accessToken: string,
    body: Record<string, string | number | boolean | undefined | null> = {},
): Promise<T> {
    const url = new URL(`https://graph.facebook.com/${FB_API}${path}`);
    const form = new URLSearchParams();
    form.set('access_token', accessToken);
    form.set('appsecret_proof', appsecretProof(accessToken));
    for (const [k, v] of Object.entries(body)) {
        if (v === undefined || v === null) continue;
        form.set(k, String(v));
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
        body: form.toString(),
    });
    if (!res.ok) {
        const b = await res.json().catch(() => ({} as any));
        throw new GraphError(res.status, b?.error?.code ?? null, b?.error?.message ?? 'unknown');
    }
    return res.json() as Promise<T>;
}

export async function graphDelete<T = unknown>(
    path: string,
    accessToken: string,
): Promise<T> {
    const url = new URL(`https://graph.facebook.com/${FB_API}${path}`);
    url.searchParams.set('access_token', accessToken);
    url.searchParams.set('appsecret_proof', appsecretProof(accessToken));
    const res = await fetch(url, { method: 'DELETE', headers: { accept: 'application/json' } });
    if (!res.ok) {
        const b = await res.json().catch(() => ({} as any));
        throw new GraphError(res.status, b?.error?.code ?? null, b?.error?.message ?? 'unknown');
    }
    return res.json() as Promise<T>;
}

export async function getTokenForConnection(
    supa: any,
    connectionId: string,
): Promise<string> {
    const { data, error } = await supa.rpc('get_meta_token', { p_connection_id: connectionId });
    if (error || !data) throw new GraphError(401, null, 'token_unavailable');
    return data as string;
}
