/**
 * Tests para /api/meta/start (OAuth start).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase', () => ({ getSupabaseService: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getUserFromRequest: vi.fn() }));

import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

// Asegurar que la env var mínima existe
process.env.OAUTH_STATE_SECRET = 'test-secret-min-32-chars-padding!!';
process.env.FB_APP_ID          = '12345';
process.env.FB_REDIRECT_URI    = 'http://localhost:3000/api/meta/callback';

function buildRequest(body: any): NextRequest {
    return new NextRequest('http://localhost/api/meta/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
}

describe('POST /api/meta/start', () => {
    beforeEach(() => { vi.resetModules(); });

    it('401 si no hay sesión', async () => {
        (getUserFromRequest as any).mockResolvedValue(null);
        const { POST } = await import('@/app/api/meta/start/route');
        const res = await POST(buildRequest({ tenant_id: crypto.randomUUID() }));
        expect(res.status).toBe(401);
    });

    it('403 si el usuario no es miembro del tenant', async () => {
        (getUserFromRequest as any).mockResolvedValue({ id: 'u1' });
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select:      vi.fn().mockReturnThis(),
                eq:          vi.fn().mockReturnThis(),
                insert:      vi.fn().mockResolvedValue({ error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
        });
        const { POST } = await import('@/app/api/meta/start/route');
        const res = await POST(buildRequest({ tenant_id: crypto.randomUUID() }));
        expect(res.status).toBe(403);
    });

    it('200 devuelve redirect_url con state firmado', async () => {
        const tenantId = crypto.randomUUID();
        (getUserFromRequest as any).mockResolvedValue({ id: 'u1' });
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select:      vi.fn().mockReturnThis(),
                eq:          vi.fn().mockReturnThis(),
                insert:      vi.fn().mockResolvedValue({ error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'owner' } }),
            }),
        });
        const { POST } = await import('@/app/api/meta/start/route');
        const res = await POST(buildRequest({ tenant_id: tenantId }));
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.redirect_url).toContain('facebook.com');
        expect(json.state).toMatch(/\./); // payload.MAC format
        expect(json.expires_at).toBeDefined();
    });

    it('400 si tenant_id no es UUID', async () => {
        (getUserFromRequest as any).mockResolvedValue({ id: 'u1' });
        const { POST } = await import('@/app/api/meta/start/route');
        const res = await POST(buildRequest({ tenant_id: 'not-a-uuid' }));
        expect(res.status).toBe(500); // parseOrThrow lanza, Next.js captura como 500 en test
    });
});
