/**
 * Tests de integración para /api/extension/pair/create y /redeem.
 * Usa mocks de Supabase y jose para no necesitar BD ni JWT real.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase', () => ({ getSupabaseService: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getUserFromRequest: vi.fn() }));
vi.mock('@/lib/ratelimit', () => ({
    rateLimit: vi.fn().mockResolvedValue({ success: true, remaining: 9 }),
}));

import { getUserFromRequest } from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';

function buildRequest(path: string, body: any, method = 'POST'): NextRequest {
    return new NextRequest(`http://localhost${path}`, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    });
}

// ─────────────────────────────────────────────────
// PAIR CREATE
// ─────────────────────────────────────────────────
describe('POST /api/extension/pair/create', () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it('401 si no hay usuario autenticado', async () => {
        (getUserFromRequest as any).mockResolvedValue(null);
        const { POST } = await import('@/app/api/extension/pair/create/route');
        const req = buildRequest('/api/extension/pair/create', { tenant_id: crypto.randomUUID() });
        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('403 si el usuario no es miembro del tenant', async () => {
        (getUserFromRequest as any).mockResolvedValue({ id: 'user-1' });
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnThis(),
                eq:     vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null }),
            }),
        });
        const { POST } = await import('@/app/api/extension/pair/create/route');
        const req = buildRequest('/api/extension/pair/create', { tenant_id: crypto.randomUUID() });
        const res = await POST(req);
        expect(res.status).toBe(403);
    });

    it('200 y devuelve código de 6 dígitos para miembro válido', async () => {
        const tenantId = crypto.randomUUID();
        (getUserFromRequest as any).mockResolvedValue({ id: 'user-1' });
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select:      vi.fn().mockReturnThis(),
                eq:          vi.fn().mockReturnThis(),
                insert:      vi.fn().mockResolvedValue({ error: null }),
                maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'admin' } }),
            }),
        });
        const { POST } = await import('@/app/api/extension/pair/create/route');
        const req = buildRequest('/api/extension/pair/create', { tenant_id: tenantId });
        const res = await POST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.code).toMatch(/^\d{6}$/);
        expect(json.expires_at).toBeDefined();
    });
});

// ─────────────────────────────────────────────────
// PAIR REDEEM
// ─────────────────────────────────────────────────
describe('POST /api/extension/pair/redeem', () => {
    beforeEach(() => vi.resetModules());

    it('404 si el código no existe', async () => {
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select:      vi.fn().mockReturnThis(),
                eq:          vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
        });
        const { POST } = await import('@/app/api/extension/pair/redeem/route');
        const req = buildRequest('/api/extension/pair/redeem', { code: '000000' });
        const res = await POST(req);
        expect(res.status).toBe(404);
    });

    it('409 si el código ya fue consumido', async () => {
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select:      vi.fn().mockReturnThis(),
                eq:          vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                        id: crypto.randomUUID(), tenant_id: crypto.randomUUID(),
                        user_id: crypto.randomUUID(),
                        expires_at: new Date(Date.now() + 60000).toISOString(),
                        consumed_at: new Date().toISOString(),
                    },
                    error: null,
                }),
            }),
        });
        const { POST } = await import('@/app/api/extension/pair/redeem/route');
        const req = buildRequest('/api/extension/pair/redeem', { code: '123456' });
        const res = await POST(req);
        expect(res.status).toBe(409);
    });

    it('410 si el código expiró', async () => {
        (getSupabaseService as any).mockReturnValue({
            from: vi.fn().mockReturnValue({
                select:      vi.fn().mockReturnThis(),
                eq:          vi.fn().mockReturnThis(),
                maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                        id: crypto.randomUUID(), tenant_id: crypto.randomUUID(),
                        user_id: crypto.randomUUID(),
                        expires_at: new Date(Date.now() - 1000).toISOString(),
                        consumed_at: null,
                    },
                    error: null,
                }),
            }),
        });
        const { POST } = await import('@/app/api/extension/pair/redeem/route');
        const req = buildRequest('/api/extension/pair/redeem', { code: '654321' });
        const res = await POST(req);
        expect(res.status).toBe(410);
    });
});
