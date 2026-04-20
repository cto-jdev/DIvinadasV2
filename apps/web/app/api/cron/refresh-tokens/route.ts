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

    // Conexiones activas con token que expira pronto
    const { data: connections, error } = await supa
        .from('meta_connections')
        .select('id, tenant_id, meta_user_id')
        .eq('status', 'active')
        .in('id',
            supa
                .from('meta_tokens')
                .select('connection_id')
                .lt('expires_at', threshold)
                .is('expires_at', null) // null = no se sabe cuándo vence, renovar igual
        );

    if (error) {
        return NextResponse.json({ error: 'db_error', message: error.message }, { status: 500 });
    }

    // También incluir tokens sin fecha de expiración conocida
    const { data: noExpiry } = await supa
        .from('meta_connections')
        .select('id, tenant_id, meta_user_id')
        .eq('status', 'active')
        .in('id',
            supa
                .from('meta_tokens')
                .select('connection_id')
                .is('expires_at', null)
        );

    const all = [...(connections ?? []), ...(noExpiry ?? [])];
    const unique = [...new Map(all.map(c => [c.id, c])).values()];

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
            if (r.ok) results.refreshed++;
            else results.failed++;
        } catch {
            results.failed++;
        }
    }

    await supa.from('audit_logs').insert({
        action: 'cron.refresh_tokens',
        metadata: { ...results, total: unique.length },
    });

    return NextResponse.json({ ok: true, ...results, total: unique.length });
}
