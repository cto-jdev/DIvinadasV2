/**
 * GET /api/cron/refresh-tokens
 * Invocado por Vercel Cron a las 03:00 UTC cada día.
 * Renueva todos los tokens Meta que expiren en ≤ 10 días.
 *
 * Seguridad: requiere header X-Cron-Secret === process.env.CRON_SECRET
 */
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const secret = req.headers.get('x-cron-secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const supa = getSupabaseService();
    const threshold = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString();

    // 1) Tokens con fecha de expiración próxima (expires_at < threshold)
    const { data: expSoon, error: e1 } = await supa
        .from('meta_tokens')
        .select('connection_id')
        .lt('expires_at', threshold)
        .not('expires_at', 'is', null);

    // 2) Tokens sin fecha de expiración conocida (renovar siempre)
    const { data: noExpiry, error: e2 } = await supa
        .from('meta_tokens')
        .select('connection_id')
        .is('expires_at', null);

    if (e1 || e2) {
        const msg = e1?.message ?? e2?.message;
        return NextResponse.json({ error: 'db_error', message: msg }, { status: 500 });
    }

    const uniqueIds = [
        ...new Set([
            ...(expSoon  ?? []).map(t => t.connection_id),
            ...(noExpiry ?? []).map(t => t.connection_id),
        ]),
    ].filter(Boolean);

    if (uniqueIds.length === 0) {
        return NextResponse.json({ ok: true, refreshed: 0, failed: 0, skipped: 0, total: 0 });
    }

    const { data: connections, error } = await supa
        .from('meta_connections')
        .select('id, tenant_id, meta_user_id')
        .eq('status', 'active')
        .in('id', uniqueIds);

    if (error) {
        return NextResponse.json({ error: 'db_error', message: error.message }, { status: 500 });
    }

    const unique = connections ?? [];

    const results = { refreshed: 0, failed: 0, skipped: 0 };

    for (const conn of unique) {
        try {
            const r = await fetch(
                `${req.nextUrl.origin}/api/meta/refresh`,
                {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/json',
                        'x-cron-secret': process.env.CRON_SECRET!,
                    },
                    body: JSON.stringify({ connection_id: conn.id }),
                },
            );
            if (r.ok) {
                results.refreshed++;
            } else {
                const body = await r.json().catch(() => ({}));
                console.error('[cron/refresh-tokens] failed', conn.id, r.status, body);
                results.failed++;
            }
        } catch (err) {
            console.error('[cron/refresh-tokens] fetch error', conn.id, err);
            results.failed++;
        }
    }

    await supa.from('audit_logs').insert({
        action: 'cron.refresh_tokens',
        metadata: { ...results, total: unique.length },
    });

    return NextResponse.json({ ok: true, ...results, total: unique.length });
}
