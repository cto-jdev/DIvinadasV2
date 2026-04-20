/**
 * POST /api/meta/refresh  { connection_id }
 * Renueva el long-lived token de Meta antes de que expire (fb_exchange_token).
 * Ejecutable por admin del tenant o por cron (con header X-Cron-Secret).
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const Body = z.object({ connection_id: z.string().uuid() });
const FB_API = process.env.FB_API_VERSION || 'v20.0';

async function isAuthorized(req: NextRequest): Promise<{ ok: boolean; userId: string | null }> {
    const cron = req.headers.get('x-cron-secret');
    if (cron && cron === process.env.CRON_SECRET) return { ok: true, userId: null };
    const user = await getUserFromRequest(req);
    return { ok: !!user, userId: user?.id ?? null };
}

export async function POST(req: NextRequest) {
    const auth = await isAuthorized(req);
    if (!auth.ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const supa = getSupabaseService();
    const { data: conn } = await supa.from('meta_connections')
        .select('id, tenant_id').eq('id', parsed.data.connection_id).maybeSingle();
    if (!conn) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    if (auth.userId) {
        const { data: mem } = await supa.from('tenant_members')
            .select('role').eq('tenant_id', conn.tenant_id).eq('user_id', auth.userId).maybeSingle();
        if (!mem || !['owner', 'admin'].includes(mem.role)) {
            return NextResponse.json({ error: 'forbidden' }, { status: 403 });
        }
    }

    const { data: current } = await supa.rpc('get_meta_token', { p_connection_id: conn.id });
    if (!current) return NextResponse.json({ error: 'no_token' }, { status: 400 });

    // Intercambio fb_exchange_token
    const url = new URL(`https://graph.facebook.com/${FB_API}/oauth/access_token`);
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', process.env.FB_APP_ID!);
    url.searchParams.set('client_secret', process.env.FB_APP_SECRET!);
    url.searchParams.set('fb_exchange_token', current);

    const res = await fetch(url);
    if (!res.ok) {
        await supa.from('meta_connections').update({ status: 'expired' }).eq('id', conn.id);
        return NextResponse.json({ error: 'meta_error', status: res.status }, { status: 502 });
    }
    const j = await res.json() as { access_token: string; expires_in?: number };

    const expiresAt = j.expires_in
        ? new Date(Date.now() + j.expires_in * 1000).toISOString()
        : null;

    const { data: connRow } = await supa.from('meta_connections').select('meta_user_id').eq('id', conn.id).single();
    const { error: storeErr } = await supa.rpc('store_meta_token', {
        p_connection_id: conn.id,
        p_access_token: j.access_token,
        p_scopes: [],
        p_expires_at: expiresAt,
    });
    if (storeErr) return NextResponse.json({ error: 'internal_error', message: storeErr.message }, { status: 500 });

    await supa.from('meta_connections')
        .update({ last_refreshed_at: new Date().toISOString(), status: 'active' })
        .eq('id', conn.id);

    return NextResponse.json({ ok: true, meta_user_id: connRow?.meta_user_id, expires_at: expiresAt });
}
