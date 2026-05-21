# DivinAds V2 — Documentación Técnica Integral

> Documento de referencia exhaustivo de la aplicación, pensado para ser consumido por agentes IA (Claude, GPT, etc.) que necesiten entender, modificar o auditar el sistema sin contexto previo.

---

## 1. Visión del producto

**DivinAds** es una plataforma SaaS multi-tenant para agencias de marketing digital que gestionan múltiples cuentas publicitarias de **Meta (Facebook/Instagram) Business Manager**. Combina:

- **Panel web** (Next.js 14) — dashboards, CRUD de campañas/posts, copiloto IA.
- **Extensión Chrome MV3** — sesión persistente del operador en su navegador, emparejada al panel mediante código de 6 dígitos.
- **Backend Supabase** (Postgres + Auth) con RLS estricto, tokens de Meta cifrados en reposo (`pgp_sym_encrypt` + Vault).
- **Copiloto IA** (Anthropic Claude) que analiza el contexto del módulo activo y da recomendaciones explicables.

**Modelo comercial:** licencias mensuales/anuales (Trial / Starter / Pro / Enterprise) facturadas vía **Hotmart** (webhook).

**Pitch interno:** *"Una sola pantalla para ver salud financiera, riesgo de acceso y pacing de cada cuenta Meta del cliente, con un copiloto que prioriza qué arreglar primero."*

---

## 2. Arquitectura general

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USUARIO (Agencia)                            │
└─────────────────────────────────────────────────────────────────────┘
        │                                              │
        │ Browser                                      │ Chrome MV3
        ▼                                              ▼
┌──────────────────────┐                  ┌──────────────────────────┐
│  Panel Web (Next.js) │                  │ Extensión DivinAds       │
│  - SSR + Client      │  pair (6 dig.)   │  - background SW         │
│  - Supabase Auth     │◄────────────────►│  - popup / options       │
│  - Tailwind-less CSS │                  │  - JWT session a heartbeat│
└──────────┬───────────┘                  └────────────┬─────────────┘
           │ Bearer token                              │ JWT firmado
           ▼                                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│        Next.js API Routes (Route Handlers, runtime=nodejs)          │
│  /api/auth · /api/meta · /api/web/graph · /api/copilot · /cron      │
│  /api/extension · /api/webhooks/hotmart · /api/team · /api/tenant   │
└─────────┬─────────────────────────────┬──────────────┬──────────────┘
          │                             │              │
          ▼                             ▼              ▼
   ┌────────────┐               ┌──────────────┐  ┌─────────────┐
   │  Supabase  │               │  Meta Graph  │  │  Anthropic  │
   │  Postgres  │               │  API v20.0   │  │  Claude API │
   │  + Auth    │               │  (HMAC proof)│  │             │
   │  + Vault   │               └──────────────┘  └─────────────┘
   │  + RLS     │
   └────────────┘
          ▲
          │ (cron)
   ┌──────┴──────┐
   │ Vercel Cron │
   │ refresh-tk  │
   │ purge-expir.│
   └─────────────┘
```

**Decisiones arquitectónicas clave:**
- **Auth Bearer-first.** Todas las peticiones API llevan `Authorization: Bearer <supabase_jwt>`. El middleware no fuerza auth; cada layout/route valida por su cuenta (patrón Stripe/Meta).
- **Tokens Meta nunca llegan al cliente.** Se descifran solo en backend mediante RPC `get_meta_token` (SECURITY DEFINER, grant exclusivo a `service_role`).
- **`appsecret_proof`** HMAC-SHA256 en cada llamada a Graph (mitiga token leakage).
- **Idempotencia de webhooks** (Hotmart) con tabla `webhook_events`.
- **Workspace state** en `sessionStorage`+`localStorage` (`divinads.tenantId`, `divinads.connId`) + sincronización con URL query — sobrevive navegación y refresh.

---

## 3. Monorepo

```
divinads/                            packageManager: pnpm@10.7.0, node 24.x
├── apps/
│   ├── web/                         Next.js 14 App Router (panel + API)
│   └── extension/                   Chrome MV3 (background SW + popup + options)
├── packages/
│   ├── auth/                        helpers compartidos de auth
│   ├── core/                        utilidades de dominio compartidas
│   ├── security/                    HMAC, JWT, crypto helpers
│   ├── types/                       tipos TS compartidos (workspace:*)
│   └── ui/                          (reservado) componentes UI compartibles
├── supabase/
│   ├── migrations/                  7 migraciones SQL versionadas
│   └── seed/                        fixtures
├── docs/                            specs, planes, ADRs
├── tools/                           scripts de build/CI
├── turbo.json                       pipeline turborepo
├── pnpm-workspace.yaml
└── package.json                     scripts raíz (dev/build/lint/typecheck/test)
```

**Tooling:** turborepo, pnpm, TypeScript 5.5, Vitest, ESLint (next/core-web-vitals).

---

## 4. Stack técnico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | Next.js App Router + React 18 | 14.2 / 18.3 |
| Lenguaje | TypeScript | 5.5 |
| Estilos | CSS custom global (`apps/web/app/globals.css`) — sin Tailwind, glassmorphism, design tokens vía `--vars` | — |
| Auth | Supabase Auth (email/pwd + OAuth Google) | @supabase/ssr 0.5 |
| DB | Postgres 15 (Supabase) | — |
| Validación | Zod | 3.23 |
| Rate limit | Upstash Redis (no-op si falta env) | @upstash/ratelimit 2 |
| JWT | jose | 5.9 |
| IA | Anthropic Messages API | `2023-06-01` |
| Extensión | Chrome MV3 (service_worker module) | manifest 3 |
| Pagos | Hotmart Webhooks | — |
| Tests | Vitest | 1.6 |
| Build orquestación | Turborepo | 2.3 |
| Deploy | Vercel (web), CWS (extensión), Supabase (DB) | — |

---

## 5. Modelo de datos (Postgres)

Migraciones en `supabase/migrations/00**.sql`.

### Tablas globales (sin `tenant_id`)
- **`profiles`** — extiende `auth.users` 1:1. Campos: email (citext), full_name, avatar_url, locale, `is_platform_admin`.
- **`feature_flags`** — registro global de módulos disponibles. `default_enabled` controla activación.
- **`audit_logs_global`** — auditoría a nivel plataforma.
- **`licenses_plans`** — definición de planes comerciales.

### Tablas multi-tenant (todas con `tenant_id`)
| Tabla | Propósito |
|---|---|
| `tenants` | 1 fila por agencia/cliente. `settings jsonb` guarda IA + sistema. |
| `tenant_members` | Membresías; rol ∈ `owner / admin / operator / viewer`. PK compuesta. |
| `tenant_feature_flags` | Overrides por tenant sobre `feature_flags`. |
| `licenses` | 1 a 1 con tenant. `plan ∈ trial/starter/pro/enterprise`, `status`, fechas. |
| `oauth_transactions` | State firmado HMAC + PKCE para flujos OAuth Meta (TTL 10 min). |
| `meta_connections` | 1 fila por cuenta FB conectada al tenant. Único por `(tenant_id, meta_user_id)`. |
| `meta_tokens` | Token cifrado (`bytea`, pgp_sym_encrypt) + scopes + expiry. Lectura solo vía RPC. |
| `device_pairings` | Códigos 6 dígitos hasheados (sha256) para emparejar extensión. TTL 5 min, single-use. |
| `extension_installs` | Sesiones persistentes de la extensión Chrome. JWT hash, label, UA, `last_seen_at`. |
| `audit_logs` | Trazabilidad por tenant: action, resource, metadata jsonb, IP, UA. |
| `webhook_events` | Idempotencia de Hotmart (event_id único). |

### Triggers
- `tg_set_updated_at` — aplica a `profiles`, `tenants`, `licenses`.
- `tg_handle_new_user` — al crear `auth.users` inserta automáticamente en `profiles`.

### RPCs
- **`get_meta_token(uuid) → text`** — SECURITY DEFINER. Descifra token via Vault key `meta_token_encryption_key`. Inserta audit log. Granted solo a `service_role`.
- **`store_meta_token`** (0003) — guarda token cifrado tras OAuth callback.
- **`redeem_pair_atomic`** (0006) — canje atómico de código de pairing → install.

### Row Level Security (RLS)
- Habilitado en **todas** las tablas de tenant.
- Política base: `tenant_id` debe estar en los tenants donde el `auth.uid()` es miembro.
- `meta_tokens` — RLS bloquea SELECT total; solo accesible vía RPC.
- Service role bypassa RLS (usado por API routes).

---

## 6. Mapa de rutas (Next.js App Router)

### 6.1 Páginas (panel + público)
| Ruta | Descripción |
|---|---|
| `/` | Landing / home pública |
| `/login`, `/signup` | Supabase Auth UI |
| `/logout` | Cierre de sesión |
| `/terms`, `/privacy` | Legales |
| `/auth/callback` | OAuth callback Supabase |
| `/panel` | Home interno (selector de tenant/conexión) |
| `/panel/dashboard` | Dashboard 3 columnas con scoring explicable |
| `/panel/ads` | Cuentas publicitarias + AdSets |
| `/panel/campaigns` | **CRUD Campañas + Posts** |
| `/panel/bm` | Business Managers (usuarios, system users, partners) |
| `/panel/pages` | Páginas FB + pixels |
| `/panel/clonner` | Clonador de campañas (scaffold) |
| `/panel/connections` | Cuentas Meta conectadas (OAuth) |
| `/panel/team` | Miembros del tenant + roles |
| `/panel/settings` | **Ajustes IA (Anthropic) + Sistema** |
| `/panel/extension` | Emparejar extensión (genera código) |
| `/panel/license` | Plan actual + módulos habilitados |
| `/panel/new-tenant` | Onboarding: crear primer tenant |

### 6.2 API routes (Route Handlers, `runtime = nodejs`, `dynamic = force-dynamic`)

#### Auth & tenant
| Método · Ruta | Función |
|---|---|
| `POST /api/auth/callback` | Bridge Supabase OAuth |
| `GET /api/tenant/me` | Tenant actual del usuario |
| `POST /api/tenant/create` | Crear tenant (asigna owner) |
| `GET /api/team/members?tenant_id` | Listar miembros |
| `DELETE /api/team/members` | Eliminar miembro |
| `PATCH /api/team/role` | Cambiar rol |

#### Meta OAuth + conexiones
| Ruta | Función |
|---|---|
| `GET /api/meta/start?tenant_id` | Inicia flujo OAuth (state firmado + PKCE) |
| `GET /api/meta/callback` | Canje code→token, cifra y persiste |
| `POST /api/meta/refresh` | Renueva long-lived token |
| `POST /api/meta/revoke` | Revoca conexión |
| `GET /api/meta/connections?tenant_id` | Lista conexiones del tenant |

#### Graph (legacy `/api/graph/*` — consumido por la extensión vía JWT)
- `GET /api/graph/bm/list`, `adaccounts/list`, `pages/list`, `pixels/list`, `insights`.

#### Graph (web `/api/web/graph/*` — consumido por el panel vía Bearer)
| Ruta | Función |
|---|---|
| `GET /api/web/graph/bm/list` | BMs accesibles |
| `GET /api/web/graph/bm/users` | Usuarios + system users de un BM |
| `GET /api/web/graph/adaccounts/list` | Cuentas publicitarias |
| `GET /api/web/graph/adsets/list` | AdSets de una campaña |
| `GET /api/web/graph/campaigns/list` | Campañas + insights |
| `POST /api/web/graph/campaigns/create` | Crear (6 objetivos OUTCOME_*) |
| `POST /api/web/graph/campaigns/update` | Editar (status/budget/bid) |
| `POST /api/web/graph/campaigns/delete` | Soft delete (default) / hard (`hard=true`) |
| `GET /api/web/graph/pages/list` | Páginas del usuario |
| `GET /api/web/graph/pages/posts` | Posts publicados de una página |
| `POST /api/web/graph/pages/posts` | Publicar (message + link opcional) |
| `DELETE /api/web/graph/pages/posts` | Eliminar post |
| `GET /api/web/graph/insights` | Insights agregados |

#### Settings + Copilot IA
| Ruta | Función |
|---|---|
| `GET /api/web/settings?tenant_id` | Lee settings (API key enmascarada) |
| `POST /api/web/settings` | Patch parcial de `tenants.settings` (ai+system) |
| `POST /api/web/settings/test-ai` | Ping a Anthropic con latencia (no persiste) |
| `POST /api/copilot/analyze` | Análisis IA con contexto del scope. Resuelve key per-tenant → env → fallback reglas |

#### Extensión Chrome
| Ruta | Función |
|---|---|
| `POST /api/extension/pair/create` | Genera código 6 dígitos (panel) |
| `POST /api/extension/pair/redeem` | Canjea código → JWT (extensión) |
| `POST /api/extension/heartbeat` | Keep-alive sesión |

#### Pagos & operaciones
| Ruta | Función |
|---|---|
| `POST /api/webhooks/hotmart` | Webhook firmado, idempotente |
| `GET /api/licenses/me` | Plan + módulos activos |
| `GET /api/cron/refresh-tokens` | Renueva tokens Meta próximos a expirar (Vercel Cron) |
| `GET /api/cron/purge-expired` | Limpia oauth_transactions/pairings vencidos |
| `GET /api/health` | Healthcheck |

---

## 7. Capa de dominio (`apps/web/lib/`)

### `graph.ts` — cliente Meta
- `GraphError` con `status`, `fbCode`, `fbMessage`.
- `appsecretProof(token)` — HMAC-SHA256 con `FB_APP_SECRET`.
- `graphGet`, `graphPost` (form-url-encoded), `graphDelete`.
- `getTokenForConnection(supa, connection_id)` — invoca RPC `get_meta_token`.
- Versión configurable: `FB_API_VERSION` (default `v20.0`).

### `auth.ts` — resolución de identidad
- `resolveUser(req)` — preferencia Bearer header → fallback cookie SSR.
- `getInstallFromJwt(req)` — valida JWT firmado de la extensión (jose).
- Devuelve `{ user, source: 'bearer'|'cookie'|'none', diag? }`.

### `web-graph-auth.ts`
Gate compartido para rutas `/api/web/graph/*`: valida Bearer + membresía tenant + ownership de la `meta_connection`.

### `ext-auth.ts`
Gate equivalente para rutas `/api/extension/*` y `/api/graph/*` legacy.

### `license.ts`
- `requireActiveLicense(tenantId)` — bloquea con 402 si no hay licencia activa o expiró.
- `tenantHasFlag(tenantId, key)` — chequea flag global + override por tenant.
- Matriz `PLAN_MODULES`: trial → bm+ads; starter → +pages+pixel; pro → +advantage+attribution; enterprise → `*`.

### `ratelimit.ts`
- Upstash sliding window. No-op si faltan envs (dev).
- Prefix `divinads`; ventanas `1 m` / `10 m` / `1 h`.

### `supabase.ts` / `supabase-browser.ts`
- Service client (Node) y browser client (RLS-aware).
- `getSupabaseService()` — service_role, bypassa RLS.
- `getSupabaseBrowser()` — `@supabase/ssr`, usado por cliente.

### `api-client.ts` (client-side)
`apiFetch` añade `Authorization: Bearer`, refresca sesión en 401 y reintenta una vez. `apiJson<T>` wrapper tipado.

### `domain/`
- `types.ts` — snapshots normalizados (AdAccountSnapshot, CampaignSnapshot, PageSnapshot, BmSnapshot, BmUsersSnapshot, AdSetSnapshot, Score, ScoreFactor, PacingState).
- `budget.ts` — funciones puras: `toCents`, `remainingCapCents`, `capUtilizationPct`, `classifyPacing`, `expectedSpendToDate`.
- `scoring.ts` — motor de scoring **explicable**: cada `Score` (0–100) incluye los `factors` con weight+value para renderizar "por qué" en hover. Scorers: `billingHealthScore`, `accessRiskScore`, `campaignPacingScore`, `pageReadinessScore`.

---

## 8. Módulos del panel (UX detallada)

### 8.1 Layout (`apps/web/app/panel/layout.tsx`)
- 3 columnas: nav izquierda (232px) · main · copiloto derecha (360px).
- Estado: `useWorkspaceQuery` hidrata URL con `tenant`+`conn` desde sessionStorage si falta → previene pérdida de contexto al navegar.
- Auth gate cliente: lee sesión Supabase, redirige a `/login?next=...` si no hay.
- Responsive (3 breakpoints):
  - **≥1201px** → layout completo.
  - **901–1200px** → nav colapsado a iconos; copiloto como drawer lateral deslizante.
  - **≤900px** → nav off-canvas con backdrop; topbar sticky con hamburger animado; copiloto como **bottom-sheet 88vh** con FAB circular morado.
- Tap targets ≥40px en touch; inputs 16px (evita zoom iOS); ESC + scroll-lock en drawer.

### 8.2 Dashboard
3 columnas internas: KPIs/scores · Top recomendaciones · Sparklines/donut gauges (SVG inline en `components/dashboard/primitives.tsx`).

### 8.3 ADS
- Tabs: Cuentas / AdSets.
- Tabla con cuentas + estado + balance + cap + spend. Click → vista de adsets con pulse gauges en tiempo real.

### 8.4 Campañas
- Selector AdAccount / Page.
- Stats: total / active / paused / spend.
- Tabla con name, status pill, objective, budget (daily o lifetime), spend, bid_strategy, acciones (pause/play, edit, delete con confirm).
- **Modales**: Create / Edit / CreatePost.
- Crear: 6 objetivos `OUTCOME_*`, presupuesto (daily o lifetime, no ambos), status (default PAUSED), bid_strategy.
- Tab Posts: lista con thumbnail, reactions/comments/shares, permalink, delete.

### 8.5 BM
Lista de Business Managers, usuarios humanos + system users, partners, accesos.

### 8.6 Páginas
Páginas FB conectadas, readiness para ads, pixels asociados.

### 8.7 Clonner
(scaffold) — clonar campañas entre cuentas.

### 8.8 Conexiones
Tabla de `meta_connections` con estado, último refresh, botones Reconectar / Revocar. Botón "Conectar nueva cuenta Meta" lanza OAuth.

### 8.9 Equipo
Miembros del tenant, avatar generado por inicial, selector de rol, eliminar (excepto owner).

### 8.10 Ajustes (`/panel/settings`)
**Tab IA:**
- Estado: badge `✓ Key configurada` / `ⓘ env` / `✗ Sin key` (modo reglas).
- Input password con key enmascarada (`sk-ant-…abcd`).
- Selector de modelo: Opus 4.7 / Sonnet 4.6 / Haiku 4.5.
- Botón Probar conexión → llama Anthropic, muestra latencia ms.
- Botón Eliminar key (con confirm).

**Tab Sistema:**
- Timezone (8 zonas), Moneda (8 ISO), Locale (es/en/pt).
- Objetivo por defecto al crear campaña (6 OUTCOME_*).
- Email para notificaciones.

Persiste en `tenants.settings` JSONB. Toast 3.5s.

### 8.11 Extensión
Página para generar código de 6 dígitos visible 5 min con QR + copy-to-clipboard.

### 8.12 Licencia
Plan actual, módulos habilitados, link a checkout Hotmart.

---

## 9. Copiloto IA

### Frontend (`components/copilot/`)
- `context.tsx` — React Context `CopilotProvider` con scope global mutable.
- `sidebar.tsx` — chat con quick prompts (4 atajos: Analiza presupuesto, Riesgos de acceso, Optimizaciones, Resumen ejecutivo).
- Cada página del panel hace `useRegisterCopilotScope({ module, summary, top_decisions, scores })` para que el copiloto sepa de qué hablar.

### Backend (`/api/copilot/analyze`)
1. Valida Bearer.
2. Lee `tenant_id` del body.
3. **Resolución de API key (prioridad descendente):**
   - `tenants.settings.ai.api_key` (per-tenant, si user es miembro)
   - `process.env.ANTHROPIC_API_KEY`
   - Sin key → fallback rule-based (`fallbackAnswer`).
4. **Modelo:** `tenants.settings.ai.model` → `ANTHROPIC_MODEL` env → `claude-sonnet-4-6`.
5. System prompt: rol "copiloto IA de DivinAds", responde en español, bullets cortos, prioriza riesgos críticos primero, no inventa datos.
6. Payload Anthropic: max_tokens 800, scope JSON serializado.
7. Respuesta: `{ answer, source: 'anthropic' | 'rule-based' | 'rule-based-fallback' }`.

### Fallback rule-based
Inspecciona `scope.summary` para señales: accounts_frozen, accounts_near_cap, campaigns_accelerating/underpaced/wasteful, pages_ready ratio. Listar top 3 `decisions`. Sugiere configurar key.

---

## 10. Extensión Chrome MV3 (`apps/extension/`)

```
apps/extension/
├── manifest.json          MV3, externally_connectable a app.divinads.com
├── background.js          Service worker module
├── popup.html / popup.js  UI flotante
├── options.html/.js       Página de opciones
├── icons/                 16/48/128
└── scripts/build.js+zip.js
```

**Flujo de pairing:**
1. Usuario en panel → `/panel/extension` → POST `/api/extension/pair/create` → recibe código 6 dig.
2. Usuario abre popup extensión → ingresa código → extensión hace POST `/api/extension/pair/redeem` con el código.
3. Servidor valida hash + TTL atómicamente (RPC `redeem_pair_atomic`) → emite JWT firmado con `tenant_id`, `user_id`, `install_id` → crea fila en `extension_installs`.
4. Extensión guarda JWT en `chrome.storage`. Lo envía en `Authorization: Bearer` a `/api/extension/heartbeat` (alarm cada N min) y a `/api/graph/*`.

**Permisos:** `storage`, `alarms`. Host: solo `https://app.divinads.com/*`.

**CSP estricta:** `script-src 'self'; connect-src 'self' https://app.divinads.com; object-src 'none'`.

---

## 11. Estilos (`apps/web/app/globals.css`)

- **Sin Tailwind** — CSS global con design tokens en `:root`.
- **Tema oscuro fijo** con `color-scheme: dark`.
- **Glassmorphism** vía `backdrop-filter: blur(...) saturate(140%)`.
- **Variables:** `--primary` (#A855F7 morado), `--primary-hi`, `--surface`, `--text`, `--text-dim`, `--muted`, `--border`, `--border-hi`, `--ease`, `--radius`, `--shadow-md`.
- Gradientes: brand text `linear-gradient(135deg, #F5F5FA 0%, #C084FC 100%)`.
- **Components stylesheet:** `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.card`, `.card-glow` (gradient border via mask), `.pill`, `.chip`, `.dtable`, `.fresh-dot` (status), `.modal-card`, `.tab-bar`, `.alert`.
- **Selects:** `appearance:none` + chevron SVG morado inline + `<option>` con `bg #1a1125` / `color #F5F3FF` (fix dropdown legible cross-browser).

---

## 12. Seguridad

- **Tokens Meta:** cifrados con `pgp_sym_encrypt`, clave en **Supabase Vault**, lectura solo por RPC `SECURITY DEFINER` granted a `service_role`. RLS bloquea SELECT directo.
- **appsecret_proof** en cada request al Graph API.
- **OAuth state** firmado HMAC + PKCE, TTL 10 min.
- **Pairing codes** sha256-hashed, TTL 5 min, single-use vía RPC atómica.
- **JWT extensión** firmado con secret server-side (jose).
- **Rate limit** Upstash en endpoints sensibles.
- **Middleware** rechaza POST/PUT > 1 MiB con 413.
- **Webhook Hotmart** firmado (HMAC) + idempotencia por `event_id` en `webhook_events`.
- **Audit logs** por tenant + globales. Cada acción crítica deja rastro (`meta.token.read`, `bm.list`, `campaign.delete`, etc.).
- **RLS estricta** en todas las tablas multi-tenant.
- **CSP** en extensión.

---

## 13. Variables de entorno

| Variable | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-only) |
| `FB_APP_ID`, `FB_APP_SECRET` | App Meta |
| `FB_API_VERSION` | default `v20.0` |
| `FB_REDIRECT_URI` | callback OAuth |
| `EXT_JWT_SECRET` | firma JWT extensión |
| `OAUTH_STATE_SECRET` | HMAC de state |
| `META_TOKEN_VAULT_KEY` | nombre de la secret en Vault (`meta_token_encryption_key`) |
| `ANTHROPIC_API_KEY` | (opcional) fallback global del copiloto |
| `ANTHROPIC_MODEL` | (opcional) default `claude-sonnet-4-6` |
| `UPSTASH_REDIS_REST_URL` / `..._TOKEN` | Rate limit (opcional en dev) |
| `HOTMART_HOTTOK` / `HOTMART_BASIC` | Validación webhook |
| `CRON_SECRET` | Bearer para Vercel Cron |

---

## 14. Flujos críticos end-to-end

### 14.1 Signup → primer login
1. `/signup` → Supabase Auth (email/pwd o Google).
2. Trigger SQL `tg_handle_new_user` crea profile.
3. Redirect a `/panel/new-tenant` → POST `/api/tenant/create` → crea tenant + membership owner + licencia trial.
4. Redirect a `/panel`.

### 14.2 Conectar cuenta Meta
1. `/panel/connections` → "Conectar nueva".
2. GET `/api/meta/start?tenant_id` → genera oauth_transaction → 302 a `facebook.com/dialog/oauth`.
3. Usuario aprueba → FB redirige a `/api/meta/callback?code=...&state=...`.
4. Backend valida state, canjea code→long-lived token, cifra con Vault key, persiste en `meta_tokens`, crea `meta_connections`.
5. 302 a `/panel/connections`.

### 14.3 Crear campaña
1. `/panel/campaigns` → modal Create → submit.
2. POST `/api/web/graph/campaigns/create` con `{tenant_id, connection_id, ad_account_id, name, objective, status, daily_budget_cents | lifetime_budget_cents, bid_strategy}`.
3. Backend: gate web-graph-auth → RPC get_meta_token → `graphPost('/act_{id}/campaigns', ...)` con form-encoded + appsecret_proof.
4. Responde `{ ok, id }`. Frontend recarga lista, toast verde.

### 14.4 Copiloto con IA real
1. Usuario configura key en `/panel/settings` tab IA.
2. POST `/api/web/settings/test-ai` → ping de 32 tokens → muestra latencia.
3. Save → POST `/api/web/settings` con `patch.ai.api_key`.
4. En cualquier módulo, copiloto envía `tenant_id` en `/api/copilot/analyze`.
5. Backend resuelve key per-tenant → Anthropic responde → bubble en sidebar.

### 14.5 Pairing extensión
1. `/panel/extension` → POST `/api/extension/pair/create` → muestra código `483-921`.
2. Extensión popup → ingresar código → POST `/api/extension/pair/redeem`.
3. Backend RPC atómica → JWT firmado.
4. Extensión guarda JWT → heartbeat cada N min.

### 14.6 Renovación de tokens (cron)
- Vercel Cron diario → GET `/api/cron/refresh-tokens` con `Authorization: Bearer $CRON_SECRET`.
- Itera conexiones con `expires_at < now() + 7d` → llama `/oauth/access_token` long-lived → re-cifra → `last_refreshed_at = now()`.

### 14.7 Pago Hotmart
1. Cliente compra → Hotmart envía POST `/api/webhooks/hotmart`.
2. Validación HMAC + idempotencia (`webhook_events.event_id`).
3. Actualiza `licenses.status`, `plan`, `current_period_ends_at`.
4. Audit log.

---

## 15. Convenciones de código

- **TypeScript strict.** `pnpm typecheck` debe pasar siempre.
- **Validación Zod** en todos los bodies POST/PATCH/DELETE.
- **Error envelope** consistente:
  - `{ error: 'validation_error', issues }` (400)
  - `{ error: 'unauthorized' }` (401)
  - `{ error: 'forbidden' }` (403)
  - `{ error: 'not_found', reason? }` (404)
  - `{ error: 'license_inactive', reason }` (402)
  - `{ error: 'meta_error', code, message }` (502)
  - `{ error: 'internal_error' }` (500)
- **Comentarios JSDoc** en cabecera de cada route describiendo método, body y propósito.
- **Naming:** `snake_case` en DB y bodies de API; `camelCase` en TS.
- **Soft delete first** en operaciones destructivas (`status=DELETED`) salvo `hard=true`.
- **`force-dynamic` + `runtime=nodejs`** en todas las routes con secretos/DB.
- **Sin Tailwind, sin libs UI externas** — todo CSS custom.
- **No emojis en código** salvo iconos UI explícitos.

---

## 16. Testing

- Framework: **Vitest** (`pnpm test` o `pnpm test:watch`).
- Suites existentes: `apps/web/__tests__/api/oauth.test.ts`, `pair.test.ts`.
- Patrón: `beforeEach(() => { vi.resetModules(); })` envuelto en bloque para no devolver el `VitestUtils`.
- Mocks de Supabase y fetch con `vi.fn()`.

---

## 17. Deploy

| Componente | Plataforma | Notas |
|---|---|---|
| Web | **Vercel** | `vercel.json` define cron jobs; Node 24.x. |
| DB | **Supabase** | Migraciones aplicadas vía `supabase db push`. |
| Extensión | **Chrome Web Store** | `pnpm ext:zip` produce el ZIP firmable. |
| Redis | **Upstash** | REST + global edge. |

CI: GitHub Actions (lint + typecheck + test en cada PR).

Variables sensibles solo en Vercel/Supabase secrets — nunca en repo.

---

## 18. Estado actual (mayo 2026)

### Implementado
- Auth Supabase + multi-tenant con RLS.
- OAuth Meta completo (start/callback/refresh/revoke) con tokens cifrados.
- Extensión MV3 con pairing por código.
- Módulos: Dashboard, ADS, **Campañas (CRUD completo + Posts)**, BM, Páginas, Conexiones, Equipo, **Ajustes (IA + Sistema)**, Extensión, Licencia.
- Scoring explicable + sparklines/gauges SVG inline.
- Copiloto IA con resolución per-tenant + fallback rule-based.
- Webhook Hotmart con idempotencia.
- Responsive completo (mobile drawer + bottom-sheet copilot).
- Dropdown selects con UI dark consistente cross-browser.

### Scaffold / pendiente expansión
- `/panel/clonner` — clonar campañas entre cuentas.
- CRUD AdSets / Ads (jerarquía profunda).
- Módulos `advantage.module` y `attribution.module` (flags creados, UI no).
- Invitar miembros por email (botón placeholder en Equipo).

---

## 19. Glosario

| Término | Significado |
|---|---|
| **Tenant** | Una agencia/cliente con sus propios miembros, conexiones, licencia. |
| **Connection** | Cuenta personal de Facebook conectada a un tenant vía OAuth. |
| **BM** | Business Manager — contenedor empresarial de Meta con ad accounts, pages, pixels. |
| **AdAccount** | Cuenta publicitaria (`act_<id>`). Tiene balance, spend_cap, currency. |
| **AdSet** | Grupo de anuncios dentro de una campaña (targeting + budget + schedule). |
| **OUTCOME_*** | Objetivos ODAX 2024+ de Meta: SALES, LEADS, ENGAGEMENT, AWARENESS, TRAFFIC, APP_PROMOTION. |
| **Pacing** | Ratio gasto real / gasto esperado al momento del día. Estados: under / on / over / accelerating. |
| **Spend cap** | Tope total que la cuenta no puede superar. |
| **Page token** | Token específico de una página FB (obtenido de `/{page_id}?fields=access_token`). |
| **Scope** | Contexto JSON serializado que cada módulo registra para el copiloto IA. |
| **Score** | Métrica 0–100 con factores explicables (weight + value). |
| **System user** | Usuario no humano del BM, usado para automatizaciones. |
| **Bus-factor** | Riesgo de que un solo admin tenga acceso (=1 es crítico). |

---

## 20. Referencias internas

- `DIVINADS_MASTER.md` — visión maestra del producto.
- `backlog-migracion.md` — backlog de migración V1 → V2.
- `docs/` — specs y ADRs.
- `CLAUDE.md` — reglas para agentes IA contribuyendo al repo.

---

*Documento generado para análisis IA. Última actualización: 2026-05-21.*
