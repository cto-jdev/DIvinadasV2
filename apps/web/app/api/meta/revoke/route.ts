/**
 * POST /api/meta/revoke
 * Revoca una conexión Meta: llama al Graph /permissions para deautorizar,
 * borra meta_tokens y marca meta_connections.status = 'revoked'.
 * Requiere rol admin/owner del tenant.
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

const Body = z.object({ connection_id: z.string().uuid() });
const FB_API = process.env.FB_API_VERSION || 'v20.0';

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'validation_error' }, { status: 400 });

    const supa = getSupabaseService();

    const { data: conn } = await supa.from('meta_connections')
        .select('id, tenant_id')
        .eq('id', parsed.data.connection_id).maybeSingle();
    if (!conn) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const { data: mem } = await supa.from('tenant_members')
        .select('role').eq('tenant_id', conn.tenant_id).eq('user_id', user.id).maybeSingle();
    if (!mem || !['owner', 'admin'].includes(mem.role)) {
        return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    // Obtener token para deautorizar upstream (best-effort; no falla la revocación si Meta no responde)
    const { data: tokenPlain } = await supa.rpc('get_meta_token', { p_connection_id: conn.id });
    if (tokenPlain) {
        try {
            const proof = crypto.createHmac('sha256', process.env.FB_APP_SECRET!).update(tokenPlain).digest('hex');
            const url = new URL(`https://graph.facebook.com/${FB_API}/me/permissions`);
            url.searchParams.set('access_token', tokenPlain);
            url.searchParams.set('appsecret_proof', proof);
            await fetch(url, { method: 'DELETE' });
        } catch { /* best-effort */ }
    }

    const { error } = await supa.rpc('revoke_meta_connection', {
        p_connection_id: conn.id,
        p_actor: user.id,
    });
    if (error) return NextResponse.json({ error: 'internal_error', message: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
}
