# packages/types — Contratos compartidos DivinAds

Schemas Zod compartidos entre `apps/web` (Next.js) y `apps/extension` (Chrome MV3).
Fuente única de verdad para todos los tipos de dominio y contratos API.

## Uso

```typescript
// En apps/web o apps/extension:
import { PairingRedeemInput, parseOrThrow } from '@divinads/types';

const body = parseOrThrow(PairingRedeemInput, await req.json());
```

## Schemas disponibles

| Schema | Descripción |
|---|---|
| `TenantSchema` | Tenant (empresa/agencia) |
| `LicenseSchema` | Plan comercial del tenant |
| `MetaConnectionSchema` | Conexión Meta activa |
| `OAuthStartInput/Output` | Inicio flujo OAuth Meta |
| `OAuthCallbackQuery` | Parámetros callback Meta |
| `PairingCreateInput/Output` | Creación código pairing |
| `PairingRedeemInput/Output` | Canje código → JWT |
| `ExtHeaderSchema` | Header Authorization: Bearer |
| `BmListInput/Output` | Listado Business Managers |
| `AdAccountsInput/Output` | Listado Ad Accounts |
| `ApiError` | Error estándar de la API |
| `ApiErrorCode` | Enum de códigos de error |

## Tipos primitivos

```typescript
export const Uuid   = z.string().uuid();
export const Email  = z.string().email();
export const IsoDt  = z.string().datetime({ offset: true });
export const Plan   = z.enum(['trial', 'starter', 'pro', 'enterprise']);
export const Role   = z.enum(['owner', 'admin', 'operator', 'viewer']);
```

## Helper

```typescript
parseOrThrow<T>(schema: ZodType<T>, input: unknown): T
// Lanza Error con code='validation_error' e issues si falla
```
