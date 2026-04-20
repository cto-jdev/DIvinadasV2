/**
 * GET /api/health
 * Health check público para Vercel, uptime monitors y load balancers.
 * Verifica conectividad con Supabase DB.
 * NO expone datos sensibles.
 */
import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function GET() {
    const start = Date.now();

    try {
        const supa = getSupabaseService();
        // Query liviana para confirmar conectividad DB
        const { error } = await supa.from('feature_flags').select('key').limit(1);

        if (error) {
            return NextResponse.json({
                status: 'degraded',
                db: 'error',
                error: error.message,
                latency_ms: Date.now() - start,
            }, { status: 503 });
        }

        return NextResponse.json({
            status: 'ok',
            db: 'connected',
            latency_ms: Date.now() - start,
            version: process.env.npm_package_version ?? '2.0.0',
            env: process.env.NODE_ENV,
        });
    } catch (e: any) {
        return NextResponse.json({
            status: 'error',
            error: e.message,
            latency_ms: Date.now() - start,
        }, { status: 503 });
    }
}
