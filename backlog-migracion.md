# Backlog Técnico — DivinAds V2

> Estado actual: fases 0-8 completadas. Pendiente: despliegue y publicación.
> Prioridad: C=Crítico, A=Alto, M=Medio, B=Bajo

---

## Fase 0 — Auditoría y Bootstrap

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F0-01 | Auditar aplicación V1: secretos, arquitectura, riesgos | Auditoría | C | ✅ | Mapa de secretos documentado |
| F0-02 | Eliminar archivos V1 del repositorio | Cleanup | C | ✅ | `git status` sin archivos V1 |
| F0-03 | Bootstrap monorrepo pnpm + Turborepo | Infra | C | ✅ | `pnpm install` sin errores |
| F0-04 | Crear estructura apps/web, apps/extension, packages/types | Infra | C | ✅ | Árbol de carpetas confirmado |

---

## Fase 1 — Base de Datos Supabase

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F1-01 | Migration 0001: 11 tablas + trigger auto-profile | SQL | C | ✅ | `SELECT count(*) FROM pg_tables` ≥13 |
| F1-02 | Migration 0002: RLS + helper functions | SQL | C | ✅ | 0 tablas sin RLS |
| F1-03 | Migration 0003: store_meta_token RPC + cifrado Vault | SQL | C | ✅ | RPC ejecuta sin error |
| F1-04 | Migration 0004: hardening audit_logs + revoked_jtis | SQL | C | ✅ | UPDATE/DELETE audit_logs → denegado |
| F1-05 | Migration 0005: stripe→hotmart en licenses | SQL | C | ✅ | Columnas renombradas |
| F1-06 | **Ejecutar migraciones en Supabase staging** | Ops | C | 🔲 | SQL Editor sin errores |
| F1-07 | **Configurar Vault key en Supabase** | Ops | C | 🔲 | `store_meta_token` funciona |
| F1-08 | **Configurar Auth providers (Email + Google)** | Ops | C | 🔲 | Login completo funciona |

---

## Fase 2 — Panel Web

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F2-01 | Login/signup/logout con Supabase Auth | Feature | C | ✅ | Sesión cookie httpOnly |
| F2-02 | Google OAuth via Supabase | Feature | A | ✅ | Redirect a /panel tras login |
| F2-03 | /panel: listado de tenants del usuario | Feature | C | ✅ | Muestra tenants del usuario |
| F2-04 | /panel/connections: conectar/revocar Meta | Feature | C | ✅ | Conexión visible tras OAuth |
| F2-05 | /panel/extension: pairing code UI | Feature | C | ✅ | Código generado, extensión conecta |
| F2-06 | /panel/team: gestión miembros | Feature | A | ✅ | CRUD roles funciona |
| F2-07 | /panel/license: estado plan | Feature | A | ✅ | Muestra plan + módulos |
| F2-08 | /privacy y /terms | Legal | C | ✅ | Accesibles en producción |
| F2-09 | Security headers (CSP + HSTS) | Seguridad | C | ✅ | curl -I verifica headers |
| F2-10 | Middleware: refresco sesión + rutas protegidas | Infra | C | ✅ | /panel sin sesión → /login |

---

## Fase 3 — OAuth Meta

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F3-01 | /api/meta/start: state HMAC, oauth_transactions | Backend | C | ✅ | Redirect a Facebook |
| F3-02 | /api/meta/callback: validar state, exchange token, cifrar | Backend | C | ✅ | Token en meta_tokens (bytea) |
| F3-03 | /api/meta/connections: listado | Backend | A | ✅ | Respuesta JSON correcta |
| F3-04 | /api/meta/revoke: revocación completa | Backend | A | ✅ | status=revoked en DB |
| F3-05 | /api/meta/refresh: token largo plazo | Backend | A | ✅ | token_updated_at actualizado |
| F3-06 | **Configurar Facebook App (staging/producción)** | Ops | C | 🔲 | Redirect URI aceptada por FB |

---

## Fase 4 — Extensión MV3

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F4-01 | manifest.json MV3 con permisos mínimos | Config | C | ✅ | Chrome carga sin errores |
| F4-02 | background.js: service worker + heartbeat | Backend | C | ✅ | Alarmas registradas |
| F4-03 | popup.html/js: UI pairing + estado | Frontend | C | ✅ | Conecta con código 6 dígitos |
| F4-04 | options.html/js: sesión + revocar | Frontend | A | ✅ | Revocación funciona |
| F4-05 | scripts/build.js: inject API_BASE + PNGs | Build | C | ✅ | dist/ generado sin errores |
| F4-06 | scripts/gen-icons.js: PNGs 16/48/128px | Build | A | ✅ | PNGs PNG-spec-valid |
| F4-07 | scripts/zip.js: empaquetado Web Store | Build | A | ✅ | ZIP generado |
| F4-08 | **Build producción con URL real** | Ops | C | 🔲 | `DIVINADS_API_BASE=https://app.divinads.com node scripts/build.js` |
| F4-09 | **Subir a Chrome Web Store** | Ops | C | 🔲 | Extensión en revisión |

---

## Fase 5 — Graph API Proxy

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F5-01 | /api/graph/bm/list | Backend | C | ✅ | Retorna BMs reales |
| F5-02 | /api/graph/adaccounts/list | Backend | C | ✅ | Retorna ad accounts |
| F5-03 | /api/graph/pages/list | Backend | A | ✅ | Sin access_token en respuesta |
| F5-04 | /api/graph/pixels/list | Backend | A | ✅ | Retorna píxeles |
| F5-05 | /api/graph/insights | Backend | A | ✅ | Métricas con cursor |
| F5-06 | lib/graph.ts: appsecret_proof automático | Lib | C | ✅ | Todas las llamadas con proof |

---

## Fase 6 — Cron + Hardening

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F6-01 | /api/cron/refresh-tokens | Backend | C | ✅ | Refresca tokens <10d |
| F6-02 | /api/cron/purge-expired | Backend | A | ✅ | Purga >90d |
| F6-03 | Rate-limit 5/IP/min en pair/redeem | Seguridad | C | ✅ | 6to intento → 429 |
| F6-04 | JTI revocation + heartbeat | Seguridad | C | ✅ | Sesión revocada → cleared |
| F6-05 | Audit logs append-only | Seguridad | C | ✅ | RLS deny UPDATE/DELETE |
| F6-06 | CSP + HSTS en next.config.js | Seguridad | C | ✅ | curl -I confirma headers |

---

## Fase 7 — Licencias + Hotmart

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F7-01 | /api/licenses/me | Backend | C | ✅ | Retorna plan + módulos |
| F7-02 | /api/webhooks/hotmart | Backend | C | ✅ | HOTTOK validado |
| F7-03 | lib/license.ts: requireActiveLicense | Lib | C | ✅ | Bloquea endpoints sin licencia |
| F7-04 | **Configurar webhook Hotmart** | Ops | C | 🔲 | URL + HOTTOK configurados |
| F7-05 | **Configurar HOTMART_PLAN_MAP** | Ops | A | 🔲 | Nombres de planes mapeados |

---

## Fase 8 — Docs

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F8-01 | DEPLOY_CHECKLIST.md | Docs | C | ✅ | Cubre fases 0-7 |
| F8-02 | OPERATIONS.md (runbook) | Docs | A | ✅ | Rotación de secretos documentada |
| F8-03 | arquitectura-objetivo.md | Docs | A | ✅ | Diagrama de capas |
| F8-04 | api-contracts.md | Docs | A | ✅ | Todos los endpoints documentados |
| F8-05 | riesgos-y-hallazgos.md | Docs | A | ✅ | Hallazgos + deuda técnica |
| F8-06 | plan-migracion.md | Docs | A | ✅ | Fases y DoD |
| F8-07 | backlog-migracion.md (este archivo) | Docs | A | ✅ | Backlog ejecutable |

---

## Fase 9-12 — Despliegue y Publicación

| ID | Tarea | Tipo | Prioridad | Estado | DoD |
|---|---|---|---|---|---|
| F9-01 | Crear proyecto Supabase staging | Ops | C | 🔲 | URL + keys disponibles |
| F9-02 | Ejecutar 5 migraciones SQL staging | Ops | C | 🔲 | count tables ≥13 |
| F9-03 | Generar secretos (OAUTH/JWT/CRON) | Ops | C | 🔲 | 3 valores en gestor contraseñas |
| F9-04 | Configurar variables en Vercel (10 vars) | Ops | C | 🔲 | Deploy sin errores de env |
| F9-05 | Deploy staging + health check | Ops | C | 🔲 | /api/health → ok |
| F9-06 | Ejecutar test suite staging (checklist §4) | QA | C | 🔲 | Auth + OAuth + pairing ok |
| F10-01 | Configurar dominio app.divinads.com | Ops | C | 🔲 | DNS propagado |
| F10-02 | Deploy producción | Ops | C | 🔲 | /api/health producción → ok |
| F10-03 | Facebook App modo Live | Ops | C | 🔲 | OAuth funciona en producción |
| F11-01 | Build extensión producción + ZIP | Build | C | 🔲 | ZIP sin SVGs |
| F11-02 | Subir extensión Chrome Web Store | Ops | C | 🔲 | En revisión |
| F12-01 | Solicitar permisos Meta App Review | Ops | A | 🔲 | Permisos aprobados |

---

## Backlog post-V2 (siguiente iteración)

| ID | Tarea | Tipo | Prioridad |
|---|---|---|---|
| V3-01 | E2E tests con Playwright (auth + OAuth + pairing) | Testing | A |
| V3-02 | Monitoreo de errores con Sentry | Ops | A |
| V3-03 | Paginación cursor en Graph API proxy | Feature | M |
| V3-04 | Admin panel (platform admin): gestión tenants, licencias | Feature | M |
| V3-05 | Email transaccional: notificación expiración licencia | Feature | M |
| V3-06 | Tabla `plans` en DB (desacoplar módulos hardcodeados) | Refactor | B |
| V3-07 | Actualizar iconos extensión a logo oficial de marca | Diseño | B |
| V3-08 | Rate-limit adicional en /api/meta/start | Seguridad | M |
