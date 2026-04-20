# Arquitectura Objetivo — DivinAds V2

## Resumen

DivinAds V2 opera bajo un modelo SaaS multi-tenant con tres capas desacopladas:
extensión Chrome MV3 como cliente delgado, backend serverless en Vercel (Next.js)
y base de datos / autenticación en Supabase.

---

## Diagrama de capas

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE (Extensión Chrome MV3)                                  │
│  ─ popup.html / popup.js                                         │
│  ─ options.html / options.js                                     │
│  ─ background.js (Service Worker)                                │
│  ─ chrome.storage.local (solo session_token JWT opaco)           │
│  ─ SIN secretos de Meta, SIN tokens de acceso de larga vida      │
└──────────────────────────┬──────────────────────────────────────┘
                           │  HTTPS / Bearer JWT
┌──────────────────────────▼──────────────────────────────────────┐
│  BACKEND (Vercel — Next.js 14 App Router)                        │
│  ─ /api/meta/*         OAuth Meta server-side                    │
│  ─ /api/extension/*    pairing, heartbeat, sesión                │
│  ─ /api/graph/*        proxy Graph API con appsecret_proof       │
│  ─ /api/licenses/*     estado de licencia                        │
│  ─ /api/team/*         gestión de miembros                       │
│  ─ /api/cron/*         refresh tokens, purge expirados           │
│  ─ /api/webhooks/hotmart  activación/cancelación de planes       │
│  ─ /panel/*            interfaz web (SSR + client components)    │
│  ─ middleware.ts        refresco cookie sesión Supabase           │
└──────────────────────────┬──────────────────────────────────────┘
                           │  Supabase JS client (service_role)
┌──────────────────────────▼──────────────────────────────────────┐
│  BASE DE DATOS (Supabase — Postgres + Auth + Vault)              │
│  ─ Auth (email + Google OAuth)                                   │
│  ─ RLS activo en todas las tablas expuestas al cliente           │
│  ─ pgcrypto Vault: clave de cifrado de tokens Meta               │
│  ─ SECURITY DEFINER RPCs: store_meta_token, get_install_context  │
│  ─ audit_logs: append-only, sin UPDATE/DELETE para roles         │
│  ─ revoked_jtis: lista negra de sesiones de extensión            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Principios de diseño

| Principio | Implementación |
|---|---|
| Mínimo privilegio | Extensión solo puede llamar `/api/graph/*` y `/api/extension/*` |
| Secretos en servidor | FB_APP_SECRET, JWT_SECRET, Vault key: solo en Vercel env vars |
| Aislamiento multi-tenant | Toda tabla usa `tenant_id`; RLS bloquea acceso cruzado |
| Auditoría completa | `audit_logs` append-only con RLS restrictivo |
| Revocación granular | Por instalación (JTI), por conexión Meta, por licencia |
| Resiliencia | Rate limiting (Upstash), cron refresh, heartbeat cada 30 min |

---

## Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Panel web | Next.js App Router | ^14.2 |
| Estilos | CSS variables puro | — |
| Despliegue web | Vercel serverless | — |
| Extensión | Chrome MV3 JS puro | — |
| Base de datos | Supabase Postgres | — |
| Auth | Supabase Auth (email + Google) | — |
| Cifrado tokens | pgcrypto (AES-256 GCM) | — |
| Rate limiting | Upstash Redis sliding window | — |
| Contratos tipo | Zod | ^3.23 |
| Auth JWT extensión | jose (HS256) | ^5.9 |
| Pagos | Hotmart (webhooks) | v2.0 |
| Tests | Vitest | ^1.6 |
| Monorrepo | pnpm workspaces + Turborepo | — |

---

## Modelo multi-tenant

```
auth.users (Supabase)
    └─► profiles (1:1)
    └─► tenant_members (N:M)
            └─► tenants
                    └─► licenses (1:1)
                    └─► meta_connections (1:N)
                            └─► meta_tokens (1:1, cifrado)
                    └─► extension_installs (1:N)
                    └─► device_pairings (1:N, TTL 5min)
                    └─► audit_logs (append-only)
```

---

## Flujos principales

### 1. Login usuario
```
/signup o /login → Supabase Auth → /api/auth/callback → cookie httpOnly → /panel
```

### 2. Conexión Meta
```
/panel/connections → POST /api/meta/start → FB OAuth → GET /api/meta/callback
    → store_meta_token RPC (cifra con Vault) → meta_connections activa
```

### 3. Pairing extensión
```
/panel/extension → POST /api/extension/pair/create → código 6 dígitos
    → usuario ingresa en popup → POST /api/extension/pair/redeem
    → JWT HS256 (90d) → chrome.storage.local (session_token opaco)
    → heartbeat POST /api/extension/heartbeat cada 30min
```

### 4. Activación de licencia (Hotmart)
```
Hotmart webhook POST /api/webhooks/hotmart
    → verificar x-hotmart-hottok (timingSafeEqual)
    → lookup tenant por buyer.email
    → upsert licenses (plan, status, hotmart_subscription_code)
    → audit_logs.license.activated
```

---

## Seguridad: KPIs objetivo

| KPI | Estado |
|---|---|
| 0 secretos Meta en extensión | ✓ |
| 0 tokens sensibles en chrome.storage | ✓ (solo JWT opaco) |
| 100% tablas con RLS | ✓ |
| 100% acciones sensibles auditadas | ✓ |
| 100% conexiones Meta gestionadas server-side | ✓ |
| 100% aislamiento multi-tenant | ✓ |
| Revocación < 5 min | ✓ (vía heartbeat 30min) |
| Licencias revocables remotamente | ✓ (Hotmart webhook) |
