# Plan de Migración V1→V2 — DivinAds

> Estado: V2 completada y commitada en rama `feat/migration-v2-saas`.
> Este documento describe el plan ejecutado y los pasos pendientes de despliegue.

---

## Resumen de fases

| Fase | Descripción | Estado |
|---|---|---|
| 0 | Auditoría + bootstrap monorrepo | ✅ Completa |
| 1 | Supabase: esquema, RLS, RPCs | ✅ Completa |
| 2 | Panel web: auth, UI base | ✅ Completa |
| 3 | OAuth Meta server-side | ✅ Completa |
| 4 | Extensión MV3 thin client | ✅ Completa |
| 5 | Endpoints Graph API proxy | ✅ Completa |
| 6 | Cron jobs + hardening seguridad | ✅ Completa |
| 7 | Licencias + Hotmart webhook | ✅ Completa |
| 8 | Docs + checklist despliegue | ✅ Completa |
| 9 | **Despliegue staging** | 🔲 Pendiente |
| 10 | **Despliegue producción** | 🔲 Pendiente |
| 11 | Chrome Web Store | 🔲 Pendiente |
| 12 | Meta App Review | 🔲 Pendiente |

---

## Fase 0 — Auditoría y Bootstrap

**Objetivo:** Entender V1, eliminar riesgos, crear base V2.

**Ejecutado:**
- Eliminación de todos los archivos V1 (HTML plano, servidor Node Express, secretos embebidos)
- Creación de monorrepo pnpm + Turborepo
- Estructura `apps/web`, `apps/extension`, `packages/types`, `supabase/`, `docs/`
- `.gitignore`, `pnpm-workspace.yaml`, `turbo.json`

---

## Fase 1 — Supabase: Esquema, RLS, RPCs

**Ejecutado:**
- `0001_init.sql`: 11 tablas, trigger auto-profile, índices
- `0002_rls_policies.sql`: helper functions SECURITY DEFINER, políticas por tabla
- `0003_rpc_store_meta_token.sql`: cifrado pgcrypto vía Vault
- `0004_hardening.sql`: audit append-only, revoked_jtis, get_install_context
- `0005_replace_stripe_with_hotmart.sql`: columnas Hotmart en licenses

---

## Fase 2 — Panel Web

**Ejecutado:**
- Next.js 14 App Router en `apps/web`
- Páginas: `/`, `/login`, `/signup`, `/logout`
- Panel: `/panel`, `/panel/connections`, `/panel/extension`, `/panel/team`, `/panel/license`
- Páginas legales: `/privacy`, `/terms`
- Middleware: refresco sesión + protección rutas
- CSS variables de diseño (--primary #6B21A8)

---

## Fase 3 — OAuth Meta Server-Side

**Ejecutado:**
- `POST /api/meta/start` — HMAC-SHA256 state, single-use, TTL 10min
- `GET /api/meta/callback` — timingSafeEqual, code exchange, long-lived token
- `store_meta_token` RPC — cifrado AES-256 GCM vía Vault
- `GET /api/meta/connections` — listado por tenant
- `POST /api/meta/revoke` — revocación Graph API + DB
- `POST /api/meta/refresh` — extensión larga vida

---

## Fase 4 — Extensión MV3 Thin Client

**Ejecutado:**
- `manifest.json` MV3: host_permissions, externally_connectable, CSP
- `background.js`: service worker, session storage, Bearer apiFetch
- `popup.html/js`: pairing UI, estado conectado/desconectado
- `options.html/js`: gestión sesión, revocar
- `scripts/build.js`: inyección API_BASE, copia a dist/
- `scripts/gen-icons.js`: iconos PNG 16/48/128px sin dependencias
- `scripts/zip.js`: empaquetado para Chrome Web Store

---

## Fase 5 — Graph API Proxy

**Ejecutado:**
- `GET /api/graph/bm/list` — Business Managers
- `GET /api/graph/adaccounts/list` — Ad Accounts (por BM o /me)
- `GET /api/graph/pages/list` — Páginas (sin access_token en respuesta)
- `GET /api/graph/pixels/list` — Pixels
- `GET /api/graph/insights` — Métricas con cursor
- `lib/graph.ts` — appsecret_proof automático, GraphError tipado

---

## Fase 6 — Cron Jobs + Hardening

**Ejecutado:**
- `GET /api/cron/refresh-tokens` — tokens expirando en ≤10d
- `GET /api/cron/purge-expired` — purge oauth_tx, pairings, installs, audit_logs >90d
- `vercel.json` cron: 03:00 UTC diario + 04:00 UTC domingos
- CSP completo en `next.config.js` (connect-src Supabase + Meta)
- HSTS solo en producción
- Rate-limit 5/IP/min en pairing redeem
- JTI revocation + heartbeat 30min

---

## Fase 7 — Licencias + Hotmart

**Ejecutado:**
- `GET /api/licenses/me` — estado plan + módulos + days_remaining
- `POST /api/webhooks/hotmart` — 5 eventos, HOTTOK timingSafeEqual
- `lib/license.ts` — requireActiveLicense, tenantHasFlag
- Migración 0005: hotmart_buyer_code, hotmart_subscription_code

---

## Fase 8 — Docs

**Ejecutado:**
- `docs/migration/MIGRATION_V2.md`
- `docs/migration/DEPLOY_CHECKLIST.md`
- `docs/migration/QUICKSTART.md`
- `docs/runbook/OPERATIONS.md`
- `docs/arquitectura-objetivo.md`
- `docs/api-contracts.md`
- `docs/riesgos-y-hallazgos.md`
- `docs/plan-migracion.md` (este archivo)
- `backlog-migracion.md`

---

## Fase 9 — Despliegue Staging (pendiente)

Ver `docs/migration/DEPLOY_CHECKLIST.md` §1–4.

**Pasos clave:**
1. Crear proyecto Supabase → ejecutar 5 migraciones SQL
2. Configurar Vault key (`meta_token_encryption_key`)
3. Generar secretos: `OAUTH_STATE_SECRET`, `JWT_SECRET`, `CRON_SECRET`
4. Configurar Facebook App (modo Development): redirect URI staging
5. Configurar Hotmart webhook: URL staging + HOTTOK
6. Upstash Redis: REST URL + REST Token
7. `npx vercel link` + configurar 10 env vars en Vercel dashboard
8. `npx vercel deploy` → verificar health check
9. Ejecutar tests de staging del checklist §4

---

## Fase 10 — Producción (pendiente)

Ver `docs/migration/DEPLOY_CHECKLIST.md` §5.

**Pasos clave:**
1. DNS: CNAME `app.divinads.com → cname.vercel-dns.com`
2. Actualizar Supabase Auth URLs a producción
3. Facebook App → modo Live
4. `npx vercel deploy --prod`
5. Hotmart webhook: URL producción

---

## Fase 11 — Chrome Web Store (pendiente)

1. `cd apps/extension && DIVINADS_API_BASE=https://app.divinads.com node scripts/build.js`
2. `node scripts/zip.js` → `divinads-extension-v2.0.0.zip`
3. Subir a Chrome Web Store Developer Console
4. Completar listing: capturas, descripción, ícono, política privacidad
5. Esperar revisión (1-3 días hábiles)

---

## Fase 12 — Meta App Review (pendiente)

Permisos a solicitar:
- `ads_management`, `ads_read`, `business_management`
- `pages_show_list`, `pages_read_engagement`, `read_insights`

Requisitos:
- Screencast del flujo OAuth completo
- `/privacy` y `/terms` publicadas en producción
- Business Verification si aplica

---

## Definition of Done por fase

| Fase | Criterio técnico | Criterio seguridad | Criterio negocio |
|---|---|---|---|
| Supabase | 5 migraciones sin error, RLS activo, 0 filas sin RLS | Vault key configurada, service_role no expuesta | DB accesible desde Vercel |
| Panel web | Signup + login + Google OAuth funcionan, /panel muestra tenants | httpOnly cookies, redirect /api/auth/callback | Usuario puede crear cuenta |
| OAuth Meta | Callback exitoso, conexión en meta_connections, token cifrado | state validado, token no en texto plano | Cuenta Meta vinculada |
| Extensión | Pairing funciona, heartbeat responde, BM/AdAccounts retornan datos | JWT rate-limited, JTI revocable, 0 secretos en chrome.storage | Extensión conectada y operativa |
| Cron | refresh-tokens y purge-expired responden ok, 401 sin secret | CRON_SECRET mínimo 32 bytes | Tokens no expiran en producción |
| Hotmart | PURCHASE_APPROVED activa licencia en DB | HOTTOK validado con timingSafeEqual | Compra activa suscripción |
| Producción | Health check ok, SSL A+, HSTS activo | 0 secretos en repo, headers de seguridad presentes | URL personalizada disponible |
