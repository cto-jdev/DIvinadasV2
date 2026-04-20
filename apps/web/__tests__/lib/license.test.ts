/**
 * Tests unitarios para lib/license.ts (requireActiveLicense + tenantHasFlag).
 * Usa mocks de Supabase — no requiere BD real.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock getSupabaseService antes del import del módulo bajo test
vi.mock('@/lib/supabase', () => ({
    getSupabaseService: vi.fn(),
}));

import { requireActiveLicense, tenantHasFlag } from '@/lib/license';
import { getSupabaseService } from '@/lib/supabase';

const mockFrom = (data: any, error: any = null) => ({
    from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq:     vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    }),
});

describe('requireActiveLicense', () => {
    it('devuelve ok=false cuando no hay licencia', async () => {
        (getSupabaseService as any).mockReturnValue(mockFrom(null));
        const r = await requireActiveLicense('tenant-1');
        expect(r.ok).toBe(false);
        expect((r as any).body.reason).toBe('no_license');
    });

    it('devuelve ok=false cuando status=canceled', async () => {
        (getSupabaseService as any).mockReturnValue(
            mockFrom({ plan: 'starter', status: 'canceled', trial_ends_at: null, current_period_ends_at: null })
        );
        const r = await requireActiveLicense('tenant-1');
        expect(r.ok).toBe(false);
        expect((r as any).body.reason).toBe('canceled');
    });

    it('devuelve ok=false cuando trial expiró', async () => {
        const pastDate = new Date(Date.now() - 1000).toISOString();
        (getSupabaseService as any).mockReturnValue(
            mockFrom({ plan: 'trial', status: 'active', trial_ends_at: pastDate, current_period_ends_at: null })
        );
        const r = await requireActiveLicense('tenant-1');
        expect(r.ok).toBe(false);
        expect((r as any).body.reason).toBe('expired');
    });

    it('devuelve ok=true con plan pro activo', async () => {
        const futureDate = new Date(Date.now() + 86400_000 * 30).toISOString();
        (getSupabaseService as any).mockReturnValue(
            mockFrom({ plan: 'pro', status: 'active', trial_ends_at: null, current_period_ends_at: futureDate })
        );
        const r = await requireActiveLicense('tenant-1');
        expect(r.ok).toBe(true);
        expect((r as any).plan).toBe('pro');
    });
});

describe('tenantHasFlag', () => {
    it('retorna true si el tenant tiene override enabled', async () => {
        const supa = {
            from: vi.fn()
                .mockReturnValueOnce({ // tenant_feature_flags
                    select: vi.fn().mockReturnThis(),
                    eq: vi.fn().mockReturnThis(),
                    maybeSingle: vi.fn().mockResolvedValue({ data: { enabled: true } }),
                }),
        };
        (getSupabaseService as any).mockReturnValue(supa);
        const ok = await tenantHasFlag('t1', 'ads.module');
        expect(ok).toBe(true);
    });

    it('retorna false si el plan no incluye el módulo', async () => {
        const makeChain = (data: any) => ({
            select: vi.fn().mockReturnThis(),
            eq:     vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data }),
        });
        const supa = {
            from: vi.fn()
                .mockReturnValueOnce(makeChain(null))              // tenant_feature_flags: no override
                .mockReturnValueOnce(makeChain({ plan: 'trial' })) // licenses: trial
                .mockReturnValueOnce(makeChain({ default_enabled: false })), // feature_flags
        };
        (getSupabaseService as any).mockReturnValue(supa);
        const ok = await tenantHasFlag('t1', 'advantage.module');
        expect(ok).toBe(false);
    });

    it('enterprise tiene todos los módulos (*)', async () => {
        const makeChain = (data: any) => ({
            select: vi.fn().mockReturnThis(),
            eq:     vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data }),
        });
        const supa = {
            from: vi.fn()
                .mockReturnValueOnce(makeChain(null))                     // no override
                .mockReturnValueOnce(makeChain({ plan: 'enterprise' })),  // enterprise
        };
        (getSupabaseService as any).mockReturnValue(supa);
        const ok = await tenantHasFlag('t1', 'advantage.module');
        expect(ok).toBe(true);
    });
});
