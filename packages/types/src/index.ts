/**
 * @divinads/types — Contratos compartidos entre apps/web (Next.js) y
 * apps/extension (Chrome MV3).
 *
 * Fuente de verdad: docs/migration/MIGRATION_V2.md §15 (Endpoints Vercel).
 * Todos los schemas están en Zod para validar en ambos extremos.
 */
import { z } from 'zod';

// =====================================================================
// Primitivos
// =====================================================================
export const Uuid   = z.string().uuid();
export const Email  = z.string().email();
export const IsoDt  = z.string().datetime({ offset: true });
export const Plan   = z.enum(['trial', 'starter', 'pro', 'enterprise']);
export const Role   = z.enum(['owner', 'admin', 'operator', 'viewer']);

// =====================================================================
// Dominio
// =====================================================================
export const TenantSchema = z.object({
    id: Uuid,
    slug: z.string().min(3).max(64),
    display_name: z.string().min(1).max(120),
    owner_id: Uuid,
    status: z.enum(['active', 'suspended', 'deleted']),
    created_at: IsoDt,
    updated_at: IsoDt,
});
export type Tenant = z.infer<typeof TenantSchema>;

export const LicenseSchema = z.object({
    id: Uuid,
    tenant_id: Uuid,
    plan: Plan,
    status: z.enum(['active', 'past_due', 'canceled', 'expired']),
    seats: z.number().int().min(1),
    trial_ends_at: IsoDt.nullable(),
    current_period_ends_at: IsoDt.nullable(),
});
export type License = z.infer<typeof LicenseSchema>;

export const MetaConnectionSchema = z.object({
    id: Uuid,
    tenant_id: Uuid,
    meta_user_id: z.string(),
    display_name: z.string().nullable(),
    email: Email.nullable(),
    picture_url: z.string().url().nullable(),
    status: z.enum(['active', 'revoked', 'expired', 'error']),
    connected_at: IsoDt,
    last_refreshed_at: IsoDt.nullable(),
});
export type MetaConnection = z.infer<typeof MetaConnectionSchema>;

// =====================================================================
// OAuth Meta (server-side)
// =====================================================================
export const OAuthStartInput = z.object({
    tenant_id: Uuid,
    return_to: z.string().url().optional(),
});
export const OAuthStartOutput = z.object({
    redirect_url: z.string().url(),
    state: z.string(),
    expires_at: IsoDt,
});

export const OAuthCallbackQuery = z.object({
    code: z.string().min(1),
    state: z.string().min(1),
});

// =====================================================================
// Pairing extensión ↔ panel
// =====================================================================
export const PairingCreateInput = z.object({
    tenant_id: Uuid,
});
export const PairingCreateOutput = z.object({
    code: z.string().regex(/^\d{6}$/),     // 6 dígitos mostrados al usuario
    expires_at: IsoDt,                      // +5 min
});

export const PairingRedeemInput = z.object({
    code: z.string().regex(/^\d{6}$/),
    label: z.string().max(120).optional(),
    user_agent: z.string().max(500).optional(),
});
export const PairingRedeemOutput = z.object({
    session_token: z.string(),              // JWT opaco para la extensión
    tenant_id: Uuid,
    install_id: Uuid,
    expires_at: IsoDt,
});

// =====================================================================
// Extension runtime (todas las llamadas requieren session_token)
// =====================================================================
export const ExtHeaderSchema = z.object({
    authorization: z.string().regex(/^Bearer .+/),
});

export const BmListInput = z.object({
    connection_id: Uuid,
});
export const BmListItem = z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().nullable(),
    verification_status: z.string().nullable(),
});
export const BmListOutput = z.object({
    data: z.array(BmListItem),
});

export const AdAccountsInput = z.object({
    connection_id: Uuid,
    bm_id: z.string().optional(),
});
export const AdAccountItem = z.object({
    id: z.string(),
    name: z.string(),
    account_status: z.number().int(),
    currency: z.string(),
    business: z.object({ id: z.string(), name: z.string() }).nullable(),
});
export const AdAccountsOutput = z.object({
    data: z.array(AdAccountItem),
});

// =====================================================================
// Errores estándar
// =====================================================================
export const ApiErrorCode = z.enum([
    'unauthorized',
    'forbidden',
    'not_found',
    'validation_error',
    'rate_limited',
    'license_inactive',
    'meta_error',
    'internal_error',
]);
export type ApiErrorCode = z.infer<typeof ApiErrorCode>;

export const ApiError = z.object({
    error: ApiErrorCode,
    message: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
    request_id: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiError>;

// =====================================================================
// Helper: parseo estricto para handlers
// =====================================================================
export function parseOrThrow<T>(schema: z.ZodType<T>, input: unknown): T {
    const r = schema.safeParse(input);
    if (!r.success) {
        throw Object.assign(new Error('validation_error'), {
            code: 'validation_error' as const,
            issues: r.error.issues,
        });
    }
    return r.data;
}
