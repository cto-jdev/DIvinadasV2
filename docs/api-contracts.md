# Contratos API — DivinAds V2

> Fuente de verdad: `packages/types/src/index.ts` (schemas Zod)
> Todos los endpoints están en `apps/web/app/api/`

---

## Autenticación

| Tipo | Mecanismo | Usado por |
|---|---|---|
| Sesión panel web | Cookie `sb-*` httpOnly (Supabase SSR) | Rutas `/panel/*`, endpoints web |
| Sesión extensión | Header `Authorization: Bearer <JWT>` | Endpoints `/api/extension/*`, `/api/graph/*` |
| Cron jobs | Header `x-cron-secret: <CRON_SECRET>` | `/api/cron/*` |
| Hotmart webhook | Header `x-hotmart-hottok: <HOTTOK>` | `/api/webhooks/hotmart` |

---

## Endpoints

### Auth

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/auth/callback` | GET | — | Intercambia code Supabase OAuth, sets cookie, redirige |

**Query params callback:** `code` (requerido), `next` (opcional redirect)
**Errores:** `missing_code`, `access_denied`, `expired_token`

---

### Meta OAuth

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/meta/start` | POST | Cookie | Inicia flujo OAuth, crea oauth_transactions |
| `/api/meta/callback` | GET | — | Recibe code+state, intercambia token, guarda conexión |
| `/api/meta/connections` | GET | Cookie | Lista conexiones activas del tenant |
| `/api/meta/revoke` | POST | Cookie (admin) | Revoca conexión Meta (DB + Graph API) |
| `/api/meta/refresh` | POST | Cookie o Cron | Refresca token de larga vida |

**POST /api/meta/start — body:**
```json
{ "tenant_id": "uuid", "return_to": "url-opcional" }
```
**Respuesta:**
```json
{ "redirect_url": "https://facebook.com/...", "state": "...", "expires_at": "iso8601" }
```

**GET /api/meta/connections — query:**
```
?tenant_id=uuid
```
**Respuesta:**
```json
{ "data": [ MetaConnection ] }
```

---

### Graph API (proxy)

Todos requieren `Authorization: Bearer <JWT>` y `connection_id` como query param.
appsecret_proof se agrega automáticamente en el servidor.

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/graph/bm/list` | GET | Business Managers del usuario |
| `/api/graph/adaccounts/list` | GET | Cuentas publicitarias (por BM o /me) |
| `/api/graph/pages/list` | GET | Páginas de Facebook |
| `/api/graph/pixels/list` | GET | Pixels (por BM o /me) |
| `/api/graph/insights` | GET | Métricas de campaña/adset/ad |

**GET /api/graph/insights — query params:**
```
connection_id, object_id, level (campaign|adset|ad), date_preset, breakdowns, after (cursor)
```

---

### Extensión

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/extension/pair/create` | POST | Cookie | Genera código 6 dígitos (TTL 5min) |
| `/api/extension/pair/redeem` | POST | — | Canjea código → JWT 90d (rate-limit 5/IP/min) |
| `/api/extension/heartbeat` | POST | Bearer | Verifica sesión, retorna estado de licencia |

**POST /api/extension/pair/redeem — body:**
```json
{ "code": "123456", "label": "Mi Chrome", "user_agent": "..." }
```
**Respuesta:**
```json
{
  "session_token": "eyJ...",
  "tenant_id": "uuid",
  "install_id": "uuid",
  "expires_at": "iso8601"
}
```

**POST /api/extension/heartbeat — respuesta:**
```json
{ "active": true, "plan": "pro" }
// o: { "active": false, "reason": "install_revoked" | "license_expired" }
```

---

### Licencias

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/licenses/me` | GET | Cookie o Bearer | Estado de licencia del tenant |

**Respuesta:**
```json
{
  "tenant_id": "uuid",
  "plan": "pro",
  "status": "active",
  "seats": 5,
  "ends_at": "iso8601",
  "days_remaining": 28,
  "modules": ["bm.module", "ads.module", "pages.module", "pixel.module", "advantage.module", "attribution.module"],
  "has_subscription": true
}
```

---

### Equipo

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/team/members` | GET | Cookie | Lista miembros del tenant |
| `/api/team/members` | DELETE | Cookie (admin) | Elimina miembro |
| `/api/team/role` | PATCH | Cookie (admin) | Cambia rol de miembro |

---

### Tenant

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/tenant/me` | GET | Cookie | Todos los tenants + roles + licencia del usuario |

---

### Cron

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/cron/refresh-tokens` | GET | x-cron-secret | Refresca tokens expirando en ≤10 días |
| `/api/cron/purge-expired` | GET | x-cron-secret | Purga registros expirados >90 días |

**Respuestas cron:**
```json
// refresh-tokens
{ "ok": true, "refreshed": 3, "failed": 0, "total": 3 }
// purge-expired
{ "ok": true, "oauth_tx": 0, "pairings": 2, "installs": 1, "audit_logs": 450 }
```

---

### Webhooks

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/webhooks/hotmart` | POST | x-hotmart-hottok | Eventos de pago Hotmart |

**Eventos manejados:**
- `PURCHASE_APPROVED` / `PURCHASE_COMPLETE` → activa licencia
- `PURCHASE_CANCELED` / `PURCHASE_REFUNDED` → cancela
- `PURCHASE_EXPIRED` → expira
- `SUBSCRIPTION_CANCELLATION` → cancela suscripción recurrente

---

### Salud

| Endpoint | Método | Auth | Descripción |
|---|---|---|---|
| `/api/health` | GET | — | Verifica conectividad DB |

```json
{ "status": "ok", "db": "connected", "latency_ms": 42, "version": "2.0.0", "env": "production" }
```

---

## Errores estándar

```json
{ "error": "<código>", "message": "descripción legible", "details": {} }
```

| Código | HTTP | Descripción |
|---|---|---|
| `unauthorized` | 401 | Sin credenciales o expiradas |
| `forbidden` | 403 | Sin permisos para el recurso |
| `not_found` | 404 | Recurso no existe |
| `validation_error` | 400 | Payload inválido (Zod) |
| `rate_limited` | 429 | Exceso de solicitudes (`Retry-After` header) |
| `license_inactive` | 403 | Plan inactivo o expirado |
| `meta_error` | 502 | Error en Graph API de Meta |
| `internal_error` | 500 | Error interno del servidor |

---

## Módulos por plan

| Plan | Módulos disponibles |
|---|---|
| `trial` | bm.module, ads.module |
| `starter` | + pages.module, pixel.module |
| `pro` | + advantage.module, attribution.module |
| `enterprise` | todos |
