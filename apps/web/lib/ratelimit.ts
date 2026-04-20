/**
 * Rate limit con Upstash Redis (compatible con Vercel Edge/Node).
 * Si no hay credenciales configuradas (local dev), devuelve success=true
 * para no bloquear desarrollo.
 */
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;
function getRedis(): Redis | null {
    if (_redis) return _redis;
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const tok = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !tok) return null;
    _redis = new Redis({ url, token: tok });
    return _redis;
}

export async function rateLimit(
    key: string,
    max: number,
    window: '1 m' | '10 m' | '1 h',
): Promise<{ success: boolean; remaining: number }> {
    const redis = getRedis();
    if (!redis) return { success: true, remaining: max };
    const rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, window),
        analytics: false,
        prefix: 'divinads',
    });
    const r = await rl.limit(key);
    return { success: r.success, remaining: r.remaining };
}
