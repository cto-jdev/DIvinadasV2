/**
 * GET /api/cron/purge-expired
 * Invocado por Vercel Cron cada domingo a las 04:00 UTC.
 * Purga:
 *   - oauth_transactions expiradas y consumidas
 *   - device_pairings expirados y consumidos
 *   - extension_installs revocados hace > 90 días
 *   - audit_logs con > 90 días (mueve count a metadata del log de purga)
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
    const ago90 = new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString();
    const now   = new Date().toISOString();

    const [r1, r2, r3, r4] = await Promise.all([
        // oauth_transactions expiradas
        supa.from('oauth_transactions').delete()
            .lt('expires_at', now).not('consumed_at', 'is', null)
            .select('id', { count: 'exact', head: true }),

        // device_pairings expirados/consumidos
        supa.from('device_pairings').delete()
            .lt('expires_at', now)
            .select('id', { count: 'exact', head: true }),

        // extension_installs revocados > 90d
        supa.from('extension_installs').delete()
            .lt('revoked_at', ago90)
            .select('id', { count: 'exact', head: true }),

        // audit_logs > 90d
        supa.from('audit_logs').delete()
            .lt('created_at', ago90)
            .select('id', { count: 'exact', head: true }),
    ]);

    const stats = {
        oauth_transactions_purged:  r1.count ?? 0,
        device_pairings_purged:     r2.count ?? 0,
        extension_installs_purged:  r3.count ?? 0,
        audit_logs_purged:          r4.count ?? 0,
    };

    await supa.from('audit_logs').insert({
        action: 'cron.purge_expired',
        metadata: stats,
    });

    return NextResponse.json({ ok: true, ...stats });
}
