# MIGRACIÓN V2 — DivinAds → SaaS multi-tenant
## Extensión MV3 + Vercel + Supabase

**Versión:** 2.0
**Fecha:** 2026-04-19
**Autor:** Arquitectura DivinAds
**Estado:** Plan aprobado para ejecución

> Documento operativo derivado del *Documento Maestro de Migración Profesional v2.0*.
> Cubre las 23 secciones obligatorias. Todo lo aquí listado es accionable.

---

## 1. Contexto entendido

La aplicación actual es **DivinAds v2.0.0** — un servidor Node/Express que expone:
- Un flujo OAuth 2.0 con Facebook Login for Business
- Un wrapper sobre Graph API / Marketing API v20
- 5 módulos funcionales (BM, Ads, Páginas, Pixels, Insights)
- Una extensión Chrome MV3 que hoy **incluye el dashboard completo** (HTML + JS) dentro del paquete `.crx`
- Custodia de tokens en `tokens.json` local cifrado AES-256-GCM
- 49 tests automatizados (nock + supertest) — 100% pasando
- Hardening de producción aplicado (helmet, rate-limit, CORS whitelist, appsecret_proof)

**Estado comercial actual:**
- ⚠ Monolito Express — un único servidor + extensión que ya trae el frontend
- ⚠ **Single-tenant**: todos los tokens conviven en un único archivo `tokens.json` sin separación por cliente
- ⚠ Sin panel administrativo diferenciado del dashboard operativo
- ⚠ Sin licenciamiento ni bloqueo remoto
- ⚠ Sin auditoría por usuario / tenant
- ⚠ Sin pairing seguro de la extensión con un backend SaaS
- ⚠ No desplegable tal cual a Vercel (servidor stateful por `tokens.json`)

**Objetivo de la migración:**
Convertir la plataforma en un **producto SaaS comercializable**, con:
- Extensión MV3 como cliente delgado (sin dashboard ni secretos)
- Panel web Next.js desplegado en Vercel
- Supabase como auth + base de datos con Row Level Security
- Multi-tenant con aislamiento por `tenant_id`
- Pairing criptográfico entre extensión ↔ panel
- Licenciamiento con revocación remota < 5 minutos
- OAuth Meta gestionado 100% server-side

---

## 2. Supuestos explícitos

| # | Supuesto | Riesgo si es falso |
|---|---------|--------------------|
| S1 | El cliente usará Supabase cloud (no self-hosted) | Cambia estrategia de migraciones y costos |
| S2 | El deploy será en Vercel (Hobby/Pro) con Serverless Functions | Límites de 10s/60s por función obligan a diseñar colas para trabajos largos |
| S3 | Los clientes finales conectarán **sus propias** cuentas de Meta, no compartirán una App ID única | Si comparten App ID, se simplifica pero se unifican límites de rate |
| S4 | La extensión solo será distribuida por Chrome Web Store (no sideload) | Impacto en revisión y tiempo de publicación |
| S5 | El MVP acepta un único método de login (email + magic link vía Supabase) | OAuth con Google/Microsoft sería extensión posterior |
| S6 | La región de datos principal es AWS us-east-1 (default Supabase) | Cumplimiento GDPR exigiría eu-west-1 |
| S7 | La app de Meta quedará en modo **Live** con App Review aprobado | Sin esto, solo funciona con testers registrados |
| S8 | El volumen inicial esperado es <500 tenants, <50 req/s agregados | Escalas mayores exigen Redis + lecturas async |

---

## 3. Inventario del sistema actual

### 3.1 Árbol de módulos

| Módulo / archivo | Función actual | Capa | LOC | Riesgo | Acción recomendada |
|---|---|---|---:|---|---|
| `server.js` | Entry point Express, monta rutas, helmet, rate-limit, static | Backend | 195 | Medio | **Migrar** a handlers Vercel individuales |
| `server/oauth.js` | Flujo OAuth Meta: start / callback / me / disconnect / refresh | Backend | 315 | Alto | **Migrar** a `apps/web/app/api/meta/**` |
| `server/token-store.js` | Persistencia AES-256-GCM de tokens en `tokens.json` | Backend | 194 | **Crítico** | **Reemplazar** por tabla `meta_tokens` con pgcrypto en Supabase |
| `server/fb-client.js` | Wrapper axios con retry + rate-limit awareness + appsecret_proof | Backend | 183 | Bajo | **Conservar** como `packages/core/src/fb-client.ts` |
| `server/routes/bm.js` | 5 endpoints Business Manager | Backend | 233 | Bajo | **Migrar** a `apps/web/app/api/bm/**` |
| `server/routes/ads.js` | 9 endpoints ad accounts / campañas / insights | Backend | 330 | Bajo | **Migrar** a `apps/web/app/api/ads/**` |
| `server/routes/pages.js` | 4 endpoints páginas | Backend | 155 | Bajo | **Migrar** a `apps/web/app/api/pages/**` |
| `server/routes/pixel.js` | 3 endpoints pixels + salud | Backend | 149 | Bajo | **Migrar** a `apps/web/app/api/pixel/**` |
| `server/routes/insights.js` | 3 endpoints insights agregados | Backend | 215 | Bajo | **Migrar** a `apps/web/app/api/insights/**` |
| `index.html` / `connect.html` / `dashboard.html` / `bm.html` / `ads.html` / `page.html` / `pixel.html` / `advantage.html` / `attribution.html` | Páginas del dashboard (9 archivos) | Frontend | ~3k | Medio | **Mover** a `apps/web/app/(dashboard)/**` como páginas Next.js |
| `js/dashboard-analytics.js` | Gráficos dashboard, SVG charts | Frontend | ~1k | Medio | **Refactorizar** a componentes React |
| `js/ads.js`, `js/bm.js`, `js/page.js`, `js/pixel.js`, etc. | Lógica de cada módulo (AG Grid, fetch, filtros) | Frontend | ~4k | Medio | **Refactorizar** a React + `packages/ui` |
| `js/ag-grid-enterprise.min.js`, `jquery.js`, `chart.js`, `bootstrap.bundle.min.js` | Libs vendor | Frontend | ~5k | Bajo | **Eliminar jQuery/Bootstrap**, conservar AG Grid + Chart.js si necesarios |
| `js/sidebar.js`, `js/popup-launcher.js`, `js/cache-cleaner.js` | Utilidades UI | Frontend | ~500 | Bajo | **Descartar** o reconstruir como hooks React |
| `manifest.json` | Manifest V3 de la extensión actual (incluye 9 HTML + todos los JS) | Extensión | 73 | Alto | **Rediseñar**: extensión solo popup + SW |
| `background.js` | Service worker MV3 (health + open-connect) | Extensión | 41 | Bajo | **Conservar** base, agregar pairing |
| `test/*.test.js` | 49 tests nock + supertest | Tests | ~1.5k | Bajo | **Migrar** progresivamente a Vitest + testing-library |
| `.env` / `.env.example` | Variables de entorno | Config | 47 | Alto | **Segregar** por ambiente (local/staging/prod) y plataforma (Vercel/Supabase) |
| `tokens.json` (runtime) | Persistencia local de tokens | Runtime | - | **Crítico** | **Eliminar** — se reemplaza por tabla Supabase cifrada |

### 3.2 Flujos actuales

**Flujo A — Login del usuario al panel:**
```
[Usuario abre dashboard.html] → no hay auth — cualquier visitante ve los datos del último token cargado
```
> 🔴 Riesgo crítico: el panel no tiene autenticación propia. Quien abra la URL ve los datos del último OAuth.

**Flujo B — Conexión con Meta:**
```
Usuario → click "Conectar"
   → GET /api/oauth/start (servidor firma state HMAC, redirige a facebook.com/dialog/oauth)
   → Meta → GET /api/oauth/callback?code=...&state=...
   → server/oauth.js valida state con timingSafeEqual
   → intercambia code → short-lived → long-lived (60 días)
   → lee /me y /permissions
   → tokenStore.save(uid, {...}) encripta con AES-256-GCM y persiste en tokens.json
   → responde HTML con postMessage al opener + setTimeout(redirect)
```

**Flujo C — Uso principal (ej. /api/bm):**
```
Cliente → GET /api/bm?uid=<fb_id>
   → server/routes/bm.js lee uid del query
   → tokenStore.getToken(uid) desencripta el access_token
   → fb-client.paginate('/me/businesses', {accessToken, params})
   → mapBusinessToRow() normaliza → JSON response
```

**Flujo D — Guardado de datos:**
```
No hay persistencia propia de datos del negocio. Todo se consulta en vivo a Graph API.
Solo se persiste: tokens.json (tokens cifrados + metadatos del usuario de FB).
```

**Flujo E — Errores:**
```
fb-client.js captura AxiosError → parseFbError() → instancia FacebookApiError {status, code, fbtrace_id}
   → express error handler → en prod: {error: "Internal server error"}, en dev: detalle completo
```

### 3.3 Matriz de hallazgos críticos

| # | Hallazgo | Severidad | Impacto técnico | Impacto negocio | Recomendación |
|---|---|---|---|---|---|
| H1 | El panel web **no tiene autenticación**. Quien abra la URL ve los datos del último OAuth conectado | 🔴 **Crítico** | Fuga total de datos | **Bloqueante para comercializar** | Supabase Auth obligatorio antes de ir a producción |
| H2 | `tokens.json` como único almacén — no escala multi-instancia, no se puede desplegar en Vercel (serverless es stateless) | 🔴 **Crítico** | Imposibilita deploy serverless | Bloquea monetización SaaS | Migrar a tabla `meta_tokens` en Supabase |
| H3 | No hay concepto de **tenant** ni aislamiento por cliente — todos los tokens comparten el mismo namespace | 🔴 **Crítico** | Cross-contamination entre clientes | Bloqueante para multi-empresa | Introducir `tenant_id` en todo + RLS |
| H4 | La extensión es "gorda": incluye todo el dashboard (HTML + JS + libs vendor ~5MB) empaquetado | 🟠 Alto | Tamaño, revisión Chrome Web Store | Mayor riesgo de clonación (código visible) | Extensión = popup delgado + pairing; dashboard en Vercel |
| H5 | `FB_APP_SECRET` está en `.env` local — no hay rotación definida ni separación por ambiente | 🟠 Alto | Revelación = emisión de tokens fraudulentos | Riesgo regulatorio | Vercel Environment Variables + rotación trimestral |
| H6 | No hay logs de auditoría — no se puede trazar quién conectó, cuándo se revocó, qué consultó | 🟠 Alto | No se puede responder a incidentes | Incumple SOC2 / ISO27001 | Tabla `audit_logs` con append-only |
| H7 | No hay mecanismo de revocación remota — si el cliente deja de pagar, sigue usando la plataforma | 🟠 Alto | Pérdida de control comercial | Impacta cobros | Tabla `licenses` + middleware `requireActiveLicense` |
| H8 | Tests 100% funcionales, pero 0% de tests de fuga entre tenants / elevación de privilegios / exposición de endpoints sin auth | 🟡 Medio | Regresiones no detectadas | Riesgo de vulnerabilidad no detectada | Sección dedicada de tests de seguridad |
| H9 | La extensión declara `host_permissions: http://localhost:8080/*` — no funciona en producción | 🟡 Medio | No funciona out-of-the-box tras publicar | Bloquea distribución | Host permission apunta al dominio Vercel de producción |
| H10 | Uso intensivo de jQuery + Bootstrap en JS artesanal — difícil de mantener, no reusa componentes | 🟡 Medio | Deuda técnica alta, baja velocidad de features | Mayor costo de evolución | Reescribir a React en paquete `packages/ui` |
| H11 | No hay rate limiting por tenant — un cliente abusivo afecta a los demás | 🟡 Medio | Rate limit Graph API a nivel app se comparte | Outage compartido | Rate limit por `tenant_id` + presupuestos de API |
| H12 | No existe panel administrativo para staff interno (ver tenants, bloquear cuentas, regenerar licencias) | 🟡 Medio | Operaciones manuales en SQL | Alto costo de soporte | Ruta `/admin` con rol `platform_admin` |

### 3.4 Matriz de deuda técnica

| Deuda | Qué implica | Urgencia | Debe migrarse | Debe eliminarse | Observación |
|---|---|---:|:---:|:---:|---|
| jQuery + Bootstrap bundle | Acoplamiento al DOM, no reusa UI | Media | ❌ | ✅ | Reescribir a React + Tailwind |
| AG Grid Enterprise | Feature-rich pero license costosa | Baja | ✅ | ❌ | Mantener, migrar a `ag-grid-react` |
| `tokens.json` | Stateful, no serverless-compatible | **Crítica** | ❌ | ✅ | Reemplazar por Supabase |
| HTML páginas estáticas | Duplicación de estructura entre las 9 páginas | Media | ❌ | ✅ | Next.js layout compartido |
| Scripts JS ad-hoc (`copilot-mock.js`, `context-menu-simple.js`, etc.) | Lógica dispersa sin contratos | Media | Parcial | ✅ | Los que aportan, refactorizar; el resto, eliminar |
| `setting.js` / `setting-ui.js` | UI de configuración sin backend | Baja | ❌ | ✅ | Reemplazar por `/settings` en Next.js con Supabase |
| Lack of TypeScript | Sin contratos tipados | Alta | ❌ | ✅ | Todo el nuevo código en TS estricto |
| 49 tests con nock + supertest | Atados a Express | Baja | ✅ | ❌ | Migrar progresivamente a Vitest + MSW |
| Extensión: todas las páginas HTML empacadas | Tamaño + exposición de código | **Alta** | ❌ | ✅ | Extensión solo popup + SW |

---

## 4. Hallazgos críticos (resumen ejecutivo)

1. **Sin autenticación del panel.** El dashboard actual responde al primer visitante que llegue.
2. **Persistencia no-serverless.** `tokens.json` bloquea el deploy a Vercel.
3. **No hay multi-tenant.** No se puede vender a múltiples clientes sin aislamiento.
4. **Sin licenciamiento.** No hay cómo revocar acceso remoto cuando el cliente deja de pagar.
5. **Extensión gorda.** Expone código y complica la revisión en Chrome Web Store.

---

## 5. Riesgos críticos

| Riesgo | Probabilidad | Impacto | Severidad efectiva | Mitigación |
|---|:---:|:---:|:---:|---|
| Fuga cross-tenant por bug en query sin filtro `tenant_id` | Alta | Catastrófico | 🔴 | RLS obligatoria en Supabase + tests de fuga |
| App Secret en Vercel leakeado vía build logs | Media | Alto | 🟠 | Vercel Env Vars **Sensitive**, nunca `console.log` en rutas API |
| Extensión pidiendo demasiados permisos → rechazada en Chrome Web Store | Media | Alto | 🟠 | Permisos mínimos: `storage`, `tabs`, 1 `host_permission` al dominio backend |
| Rate limit compartido agota cuota de Meta | Alta | Medio | 🟠 | Monitor X-App-Usage + presupuesto por tenant |
| Token robado reutilizable fuera de la app | Baja | Alto | 🟡 | `appsecret_proof` obligatorio + rotación cada 30 días |
| DB Supabase caída | Baja | Alto | 🟡 | Plan Pro con réplica + fallback a modo read-only |
| Pairing inseguro de extensión → suplantación | Media | Alto | 🟠 | Código de 6 dígitos, TTL 5 min, un solo uso, rate limit por IP |

---

## 6. Brecha arquitectónica

| Componente actual | Estado actual | Estado objetivo | Brecha | Acción de migración |
|---|---|---|---|---|
| Servidor monolito Express | 1 proceso Node | N funciones serverless Vercel | Stateful → stateless | Extraer handlers, eliminar `tokens.json` |
| Auth del panel | Inexistente | Supabase Auth magic link | 100% faltante | Configurar Supabase Auth + middleware `requireSession` |
| Persistencia tokens | `tokens.json` cifrado | Tabla `meta_tokens` en Postgres | Cambio de medio | SQL migration + servicio de lectura/escritura |
| Multi-tenant | No existe | Schema completo con `tenant_id` y RLS | 100% faltante | Tablas + políticas SQL + middleware tenant |
| Panel Web | HTML + jQuery + Bootstrap | Next.js 14 + React + Tailwind + shadcn/ui | Reescritura | Ruta a ruta, módulo a módulo |
| Extensión | Fat client con todo el dashboard | Thin popup + SW + opciones | Reducción del 95% | Keep: `background.js` base; reescribir: popup |
| Dashboard paths | `*.html` servidos por Express | Rutas `/(dashboard)/**` en Next.js | Migración 1:1 | Mantener nombres de rutas para retrocompatibilidad |
| OAuth flow | `server/oauth.js` en Express | Ruta `/api/meta/**` en Vercel + tabla `oauth_transactions` | Reubicación | Port literal + persistencia de transacciones |
| Rate limit | In-process `express-rate-limit` | Redis + `@upstash/ratelimit` | Reemplazo | Configurar Upstash en Vercel |
| Licenciamiento | No existe | Tabla `licenses` + middleware | 100% faltante | Design desde cero (ver §14) |
| Auditoría | No existe | Tabla `audit_logs` append-only | 100% faltante | Middleware `logAuditEvent` en cada ruta sensible |
| CI/CD | Solo `npm test` local | GitHub Actions + Vercel Preview | Faltante | Workflows en `.github/workflows/` |

### 6.1 Qué se conserva, refactoriza, reemplaza, elimina

**Se conserva (95%+ del código se puede reusar con refactor leve):**
- `server/fb-client.js` → `packages/core/src/fb-client.ts` (solo port a TS, lógica intacta)
- Endpoints de Graph (bm/ads/pages/pixel/insights) — la lógica de mapeo se conserva
- Tests de comportamiento (adaptar URL y mocks)
- Iconos, assets estáticos, diseño visual

**Se refactoriza (cambio de forma, misma función):**
- Páginas HTML → componentes Next.js con el mismo layout
- `server/oauth.js` → ruta API Vercel `/api/meta/callback` con escritura a Supabase
- Error handler central → `error.tsx` de Next.js + logger estructurado
- Token store → servicio `packages/core/src/meta-tokens.ts` con lectura desde Supabase
- `manifest.json` → versión minimal

**Se reemplaza (tecnología/librería diferente, intención conservada):**
- `tokens.json` → tabla `meta_tokens` en Supabase
- `express-rate-limit` → `@upstash/ratelimit`
- jQuery + Bootstrap → React + Tailwind + shadcn/ui
- Custom token encryption AES-GCM → `pgcrypto` en Supabase (`pgp_sym_encrypt`)

**Se elimina:**
- `tokens.json` (runtime file)
- Archivos vendor innecesarios (jquery, bootstrap) — ~3 MB de bundle
- Scripts legacy (`copilot-mock.js`, `context-menu-simple.js`, `cache-cleaner.js`, `popup-launcher.js` → reescritos)
- El servidor Express completo (`server.js`, `server/*`)

**Se rediseña desde cero:**
- Sistema de auth (Supabase Auth + middleware Next.js)
- Flujo de pairing extensión ↔ panel
- Licenciamiento y feature flags
- Panel administrativo `/admin`

---

## 7. Arquitectura objetivo

```
                         ┌──────────────────────────────────────┐
                         │           Cliente (usuario)          │
                         └──────┬────────────────┬──────────────┘
                                │                │
                ┌───────────────▼──────┐   ┌─────▼────────────────┐
                │  Panel Web Next.js   │   │  Extensión Chrome MV3│
                │  (Vercel)            │   │  (Chrome Web Store)  │
                │                      │   │                      │
                │  /login              │   │  popup.html          │
                │  /dashboard          │   │    └─ Pair CTA       │
                │  /bm /ads /pages...  │   │  options.html        │
                │  /admin              │   │    └─ Estado pairing │
                │  /api/**             │   │  service-worker.js   │
                │                      │   │                      │
                └──────┬───────────────┘   └────┬─────────────────┘
                       │                        │ mensajería pairing
                       │ SSR + auth cookie      │ + reenvío a backend
                       │                        │
                       ▼                        ▼
                ┌─────────────────────────────────────────────────┐
                │           API Vercel (Edge / Serverless)        │
                │                                                 │
                │  /api/auth/*        (Supabase session bridge)   │
                │  /api/extension/pair                            │
                │  /api/extension/heartbeat                       │
                │  /api/meta/connect/start                        │
                │  /api/meta/callback                             │
                │  /api/meta/disconnect                           │
                │  /api/bm /ads /pages /pixel /insights           │
                │  /api/licenses/me                               │
                │  /api/tenant/me                                 │
                │  /api/audit                                     │
                │  /api/admin/*       (solo rol platform_admin)   │
                └──────┬──────────────────────────────────┬───────┘
                       │                                  │
                       │ @supabase/ssr                    │ axios
                       ▼                                  ▼
                ┌──────────────────┐              ┌────────────────────┐
                │    Supabase      │              │  Graph API Meta    │
                │                  │              │  (graph.facebook)  │
                │  Auth (Magic)    │              │                    │
                │  Postgres        │              │  appsecret_proof   │
                │    profiles      │              │  token rotation    │
                │    tenants       │              │                    │
                │    tenant_members│              └────────────────────┘
                │    licenses                              ▲
                │    meta_connections                      │
                │    meta_tokens (pgcrypto)                │ solo desde
                │    oauth_transactions                    │ server-side
                │    device_pairings                       │
                │    extension_installs                    │
                │    audit_logs                            │
                │    feature_flags                         │
                │  RLS on every table ◄── enforced         │
                │  Storage (opcional: adjuntos soporte)    │
                └─────────────────────────────────────────┘
```

### 7.1 Principios de la arquitectura

1. **Cliente delgado, backend pesado.** La extensión solo empareja. El panel solo renderiza. La lógica vive en API + DB.
2. **Zero trust al cliente.** Todo lo que llega del navegador pasa por validación server-side (Zod) + check de tenant + check de rol.
3. **RLS como segunda línea de defensa.** Aun si un endpoint olvida filtrar por `tenant_id`, Supabase lo rechaza.
4. **Cifrado en reposo.** Tokens con `pgp_sym_encrypt(PGP_KEY)` — la clave vive en Supabase Vault o Vercel Env Var, nunca en el código.
5. **Auditoría obligatoria.** Todo evento sensible (pairing, connect Meta, disconnect, cambio de plan) escribe a `audit_logs`.
6. **Reversibilidad.** Cada migración SQL tiene su `down.sql`. Cada release tiene rollback.

---

## 8. Transformación por capa

### 8.1 Extensión Chrome MV3

**Qué permanece del código actual:**
- La idea del service worker (`background.js`) como puente health-check.
- Los iconos en `img/`.

**Qué se elimina:**
- Las 9 páginas HTML (todo el dashboard) — ya no va en la extensión.
- Todos los scripts JS de lógica de módulos (`js/bm.js`, `js/ads.js`, etc.).
- Los vendors pesados (`jquery.js`, `bootstrap.bundle.min.js`, `ag-grid-enterprise.min.js`, `chart.js`).

**Estructura final:**
```
apps/extension/
├── manifest.json            # MV3 minimal
├── public/
│   ├── popup.html           # 1 vista: "Estado + botón Abrir panel"
│   ├── options.html         # Config avanzada (URL backend, logs)
│   └── img/icon{16,48,128}.png
├── src/
│   ├── popup.tsx            # React compilado a bundle único
│   ├── options.tsx
│   ├── service-worker.ts    # Pairing + heartbeat
│   └── lib/
│       ├── api.ts           # fetch tipado al backend
│       ├── storage.ts       # chrome.storage.session (NUNCA .local para tokens)
│       └── messaging.ts     # validación de origen
└── package.json
```

**Permisos finales (mínimos):**
```json
{
  "permissions": ["storage", "identity"],
  "host_permissions": ["https://app.divinads.com/*"],
  "externally_connectable": { "matches": ["https://app.divinads.com/*"] },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; connect-src 'self' https://app.divinads.com"
  }
}
```

**Política obligatoria:**
- ❌ Sin `tabs` (ya no abre pestañas internas del dashboard).
- ❌ Sin `activeTab` (no se lee el DOM del navegador).
- ❌ Sin `content_scripts` (no hay scraping).
- ❌ Sin tokens persistentes. Solo `chrome.storage.session` para un `pairing_session_id` de 15 min.
- ❌ Sin código remoto ejecutable (CSP estricta).
- ❌ Sin análisis de la sesión de Facebook del usuario.

### 8.2 Panel Web (Vercel)

**Estructura Next.js 14 App Router:**
```
apps/web/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx                      # Landing pública
│   ├── (auth)/
│   │   ├── login/page.tsx                # Magic link
│   │   └── callback/page.tsx             # Supabase callback
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Auth guard + sidebar
│   │   ├── dashboard/page.tsx            # KPIs agregados
│   │   ├── bm/page.tsx
│   │   ├── bm/[id]/page.tsx
│   │   ├── ads/page.tsx
│   │   ├── ads/[id]/page.tsx
│   │   ├── pages/page.tsx
│   │   ├── pixel/page.tsx
│   │   ├── advantage/page.tsx
│   │   ├── attribution/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── connect/page.tsx              # Iniciar OAuth Meta
│   │   ├── pair/page.tsx                 # Mostrar código de pairing
│   │   └── tenants/page.tsx              # Selector + gestión de miembros
│   ├── (admin)/
│   │   └── admin/                        # Rol platform_admin
│   │       ├── tenants/page.tsx
│   │       ├── licenses/page.tsx
│   │       └── audit/page.tsx
│   └── api/                              # Serverless functions
│       ├── auth/                         # Supabase session bridge
│       ├── extension/
│       │   ├── pair/route.ts
│       │   └── heartbeat/route.ts
│       ├── meta/
│       │   ├── connect/start/route.ts
│       │   ├── callback/route.ts
│       │   └── disconnect/route.ts
│       ├── bm/route.ts
│       ├── bm/[bmId]/route.ts
│       ├── ads/...
│       ├── pages/...
│       ├── pixel/...
│       ├── insights/...
│       ├── tenant/me/route.ts
│       ├── licenses/me/route.ts
│       ├── audit/route.ts
│       └── admin/
│           ├── tenants/route.ts
│           └── audit/route.ts
├── lib/
│   ├── supabase/
│   │   ├── server.ts                     # createServerClient con cookies
│   │   ├── client.ts                     # para componentes client
│   │   └── admin.ts                      # service role (solo en handlers API)
│   ├── auth.ts                           # requireSession, requireTenant, requireRole
│   ├── audit.ts                          # logAuditEvent()
│   ├── rate-limit.ts                     # @upstash/ratelimit
│   └── zod-schemas.ts                    # validación entradas
├── components/
│   ├── ui/                               # shadcn/ui re-exports
│   ├── data-grid.tsx                     # AG Grid wrapper
│   └── charts/
└── next.config.js
```

**Reglas de la capa web:**
- Toda ruta bajo `(dashboard)/` pasa por middleware que exige sesión Supabase válida + `tenant_id` activo.
- Toda ruta bajo `/api/` **excepto** `/api/auth/*` y `/api/extension/pair` exige sesión.
- Toda ruta bajo `/api/admin/*` exige rol `platform_admin`.
- `service_role_key` solo se usa dentro de `/api/` — nunca se expone al browser.

### 8.3 Supabase

**Configuración auth:**
- Provider: Email + Magic Link (MVP). Google/Microsoft como extensión posterior.
- JWT expiration: 1 hora access, 30 días refresh.
- Site URL: `https://app.divinads.com`.
- Redirect URLs: `https://app.divinads.com/(auth)/callback`.

**Estrategia de migraciones:**
- Versionadas en `supabase/migrations/NNNN_descripcion.sql`.
- Aplicación manual en staging, `supabase db push` en producción desde CI.
- Cada migración incluye su `down` comentado al final.

**Políticas RLS:**
- Activa por default en todas las tablas con datos de cliente.
- Patrón: `tenant_id = (select current_tenant_id())` donde `current_tenant_id()` es una función RPC que lee del JWT claim.

Ver §10 para schema completo y §11 para RLS.

---

## 9. Estructura final de repositorio

```
divinads/                                    (repo monorepo con pnpm workspaces)
├── apps/
│   ├── web/                                 (Next.js 14 + App Router — Vercel)
│   └── extension/                           (MV3 — Vite + CRXJS)
├── packages/
│   ├── ui/                                  (shadcn/ui re-exports + componentes compartidos)
│   ├── types/                               (contratos TS compartidos web ↔ extensión)
│   ├── core/                                (fb-client, helpers de Graph)
│   ├── auth/                                (wrappers Supabase + middlewares)
│   └── security/                            (Zod schemas, rate-limit, audit)
├── supabase/
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   ├── 0002_rls_policies.sql
│   │   ├── 0003_audit_functions.sql
│   │   └── 0004_feature_flags.sql
│   ├── seed/
│   │   └── dev_seed.sql
│   └── policies/                            (solo referencia, copia de políticas en migraciones)
├── docs/
│   ├── architecture/
│   │   ├── TARGET.md
│   │   └── REPO_STRUCTURE.md
│   ├── security/
│   │   ├── POLICY.md
│   │   └── OAUTH_META.md
│   ├── migration/
│   │   ├── MIGRATION_V2.md                  (este documento)
│   │   ├── AUDIT.md
│   │   └── RUNBOOK.md
│   └── api/
│       └── CONTRACTS.md
├── .github/workflows/
│   ├── ci.yml                               (lint + typecheck + tests)
│   ├── deploy-preview.yml                   (Vercel preview)
│   └── extension-release.yml                (build + upload a Chrome Web Store)
├── .env.example
├── package.json                             (workspaces)
├── pnpm-workspace.yaml
├── turbo.json                               (Turborepo para cachear builds)
└── README.md
```

### 9.1 Mapeo app actual → nuevo repositorio

| Origen actual | Destino | Acción |
|---|---|---|
| `server.js` | — | Eliminar (reemplazado por rutas Vercel) |
| `server/oauth.js` | `apps/web/app/api/meta/*` | Refactor TS + escritura a Supabase |
| `server/token-store.js` | `packages/core/src/meta-tokens.ts` | Reemplazar AES-GCM por `pgcrypto` vía Supabase |
| `server/fb-client.js` | `packages/core/src/fb-client.ts` | Port a TS, lógica intacta |
| `server/routes/*.js` | `apps/web/app/api/*/route.ts` | 1:1 |
| `*.html` (9 páginas) | `apps/web/app/(dashboard)/*/page.tsx` | Reescritura React |
| `js/*.js` | `apps/web/app/(dashboard)/*` + `packages/ui/` | Refactor por módulo |
| `css/*.css` | `apps/web/app/globals.css` + Tailwind | Consolidación |
| `img/` | `apps/web/public/img/` + `apps/extension/public/img/` | Duplicar assets críticos |
| `background.js` | `apps/extension/src/service-worker.ts` | Reescribir en TS |
| `manifest.json` | `apps/extension/manifest.json` | Reducir permisos |
| `test/*.test.js` | `apps/web/tests/**` + `packages/*/tests/**` | Migrar a Vitest |

---

## 10. Modelo de datos Supabase

### 10.1 Tablas

| Tabla | Propósito | Claves | RLS | Índices | Observaciones |
|---|---|---|:---:|---|---|
| `profiles` | Usuarios del producto (espejo de `auth.users` con campos propios) | `id` (PK = `auth.users.id`) | ✅ | — | Extiende Supabase Auth |
| `tenants` | Empresas/clientes de la plataforma | `id` (PK uuid) | ✅ | `slug` unique | Un tenant = una empresa que compra DivinAds |
| `tenant_members` | Relación N:M usuarios ↔ tenants con rol | `(tenant_id, user_id)` PK | ✅ | `user_id`, `tenant_id` | Rol: `owner` / `admin` / `member` / `viewer` |
| `licenses` | Plan comercial de cada tenant | `tenant_id` FK | ✅ | `tenant_id` unique | Estados: `active`, `past_due`, `canceled`, `suspended` |
| `feature_flags` | Activación de features por tenant | `(tenant_id, flag_key)` PK | ✅ | `tenant_id` | JSONB con valor del flag |
| `oauth_transactions` | Estado temporal de cada flujo OAuth iniciado | `id` (PK uuid) | ✅ | `state_signature`, `expires_at` | TTL 10 min, se borra por cron |
| `meta_connections` | Cada conexión de cuenta FB de un tenant | `id` (PK uuid) | ✅ | `(tenant_id, fb_user_id)` unique | Metadatos: nombre, email, foto, scopes |
| `meta_tokens` | Tokens cifrados asociados a conexiones | `connection_id` FK | ✅ | `expires_at` | `pgp_sym_encrypt` para `access_token` |
| `device_pairings` | Códigos de pairing extensión ↔ panel | `id` (PK uuid) | ✅ | `code` unique, `expires_at` | TTL 5 min, un solo uso |
| `extension_installs` | Instalaciones activas de la extensión | `id` (PK uuid) | ✅ | `(tenant_id, user_id)`, `last_heartbeat` | Heartbeat cada 5 min |
| `audit_logs` | Registro append-only de eventos sensibles | `id` (PK bigserial) | ✅ (solo INSERT y SELECT propio tenant) | `(tenant_id, created_at)`, `actor_id`, `event_type` | Retención 12 meses |

### 10.2 DDL resumido

Ver archivo: `supabase/migrations/0001_init.sql` (entregado aparte en este paquete).

Ejemplo clave — tabla `meta_tokens`:

```sql
create extension if not exists pgcrypto;

create table meta_tokens (
  connection_id uuid primary key references meta_connections(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  -- access_token se almacena cifrado con pgp_sym_encrypt usando METAS_TOKEN_KEY
  access_token_encrypted bytea not null,
  expires_at timestamptz,
  scope text not null default '',
  created_at timestamptz not null default now(),
  last_refreshed timestamptz not null default now()
);

create index meta_tokens_tenant_idx on meta_tokens(tenant_id);
create index meta_tokens_expires_idx on meta_tokens(expires_at) where expires_at is not null;
```

La función de encriptación vive en Postgres:

```sql
create or replace function encrypt_meta_token(plaintext text)
returns bytea
language plpgsql
security definer
as $$
begin
  return pgp_sym_encrypt(plaintext, current_setting('app.meta_token_key'));
end;
$$;
```

Donde `app.meta_token_key` se setea mediante `ALTER DATABASE ... SET app.meta_token_key = '...'` y se rota trimestralmente.

---

## 11. Políticas RLS

### 11.1 Estrategia

1. Cada tabla con `tenant_id` activa RLS y agrega políticas:
   - **SELECT**: el usuario es miembro de ese tenant (`tenant_members`).
   - **INSERT**: el usuario es miembro con rol `owner`/`admin` (o según tabla).
   - **UPDATE**/**DELETE**: el usuario es `owner`/`admin` del tenant.
2. `audit_logs` solo permite `INSERT` (jamás update/delete) y `SELECT` filtrado por tenant.
3. Las tablas sin `tenant_id` (`profiles`) usan reglas basadas en `auth.uid()`.

### 11.2 Helper function

```sql
create or replace function is_tenant_member(tid uuid)
returns boolean
language sql stable
as $$
  select exists (
    select 1 from tenant_members
    where tenant_id = tid and user_id = auth.uid()
  );
$$;

create or replace function tenant_role(tid uuid)
returns text
language sql stable
as $$
  select role from tenant_members
  where tenant_id = tid and user_id = auth.uid()
  limit 1;
$$;
```

### 11.3 Ejemplo de políticas (tenants + meta_connections)

```sql
alter table tenants enable row level security;

create policy "tenants_select_members"
  on tenants for select
  using (is_tenant_member(id));

create policy "tenants_update_owner"
  on tenants for update
  using (tenant_role(id) = 'owner');

alter table meta_connections enable row level security;

create policy "meta_conn_select"
  on meta_connections for select
  using (is_tenant_member(tenant_id));

create policy "meta_conn_insert"
  on meta_connections for insert
  with check (is_tenant_member(tenant_id) and tenant_role(tenant_id) in ('owner','admin'));

create policy "meta_conn_delete"
  on meta_connections for delete
  using (tenant_role(tenant_id) in ('owner','admin'));
```

Ver `supabase/migrations/0002_rls_policies.sql` para el conjunto completo.

### 11.4 Riesgos de rendimiento y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `is_tenant_member` se llama N veces por query con N filas | `STABLE` + índice sobre `tenant_members(user_id, tenant_id)` |
| Join extra en cada query | Usar `bypass_rls` solo desde el service role en batch jobs |
| RLS costosa en `audit_logs` con millones de filas | Partición mensual + índice `(tenant_id, created_at desc)` |

---

## 12. Autenticación del panel

### 12.1 Flujo

```
1. Usuario → /login → ingresa email
2. Supabase envía magic link al email
3. Usuario hace click → /(auth)/callback?code=xxx
4. Callback intercambia code → session cookie (httpOnly, secure, SameSite=Lax)
5. Middleware verifica cookie en cada request del dashboard
6. Si no hay tenant activo para el usuario → /onboarding → crear o unirse a tenant
7. `current_tenant_id` se setea en una cookie httpOnly adicional (ej. `divi_tenant`)
```

### 12.2 Middleware

```typescript
// apps/web/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const supabase = createServerClient(/* ... */);
    const { data: { session } } = await supabase.auth.getSession();

    const path = req.nextUrl.pathname;

    // Rutas públicas
    if (path.startsWith('/api/extension/pair') || path.startsWith('/(marketing)')
        || path.startsWith('/(auth)')) return res;

    // Resto exige sesión
    if (!session) return NextResponse.redirect(new URL('/login', req.url));

    // /admin exige rol
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        const { data: isAdmin } = await supabase.rpc('is_platform_admin');
        if (!isAdmin) return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
}

export const config = { matcher: ['/((?!_next|favicon).*)'] };
```

### 12.3 Roles

| Rol | Alcance | Permisos |
|---|---|---|
| `platform_admin` | Global (staff DivinAds) | Ver todos los tenants, revocar licencias, leer audit global |
| `owner` | Tenant | Todo dentro del tenant, incluye facturación y eliminación |
| `admin` | Tenant | Todo salvo facturación y eliminación del tenant |
| `member` | Tenant | Conectar cuentas Meta, leer datos, usar módulos |
| `viewer` | Tenant | Solo lectura de dashboards |

---

## 13. OAuth Meta (server-side)

### 13.1 Flujo completo

```
[A] Inicio
    Usuario (panel) → click "Conectar Meta"
    → GET /api/meta/connect/start
       → backend:
         · valida sesión Supabase + tenant activo
         · genera nonce (32 bytes random)
         · firma state = base64url(nonce.tenant_id) + '.' + HMAC(secret, base64url)
         · INSERT oauth_transactions (state_signature, tenant_id, user_id, expires_at=now+10min)
         · redirect a https://facebook.com/v20.0/dialog/oauth?state=...

[B] Consentimiento
    Meta → usuario acepta
    → redirect a https://app.divinads.com/api/meta/callback?code=xxx&state=yyy

[C] Callback
    GET /api/meta/callback
    → backend:
       · verifica state con timingSafeEqual contra HMAC
       · busca oauth_transactions, valida expires_at, marca as consumed
       · code → short-lived token (llamada server-to-graph con client_secret)
       · short → long-lived (60 días)
       · GET /me (con appsecret_proof)
       · GET /{fb_id}/permissions
       · UPSERT meta_connections (tenant_id, fb_user_id, name, email, picture, scope)
       · INSERT/UPDATE meta_tokens con encrypt_meta_token(access_token)
       · INSERT audit_logs (event='meta_connected', tenant, actor)
       · res.send(HTML de éxito con postMessage al opener)

[D] Uso operacional
    /api/bm?tenantId=X → backend resuelve: token = decrypt(meta_tokens.access_token_encrypted)
    → fb-client.get('/me/businesses', {accessToken: token, ...})

[E] Desconexión
    POST /api/meta/disconnect/{connectionId}
    → verifica rol owner/admin
    → DELETE /{fb_id}/permissions (revoca en Meta)
    → DELETE meta_tokens, meta_connections
    → INSERT audit_logs (event='meta_disconnected')

[F] Refresh
    Cron cada día a las 03:00 UTC:
    → SELECT meta_tokens WHERE expires_at < now() + interval '7 days'
    → para cada uno: fb_exchange_token → update access_token_encrypted y expires_at
    → si falla con codes 190/102 → INSERT audit_logs (event='meta_token_revoked') + DELETE
```

### 13.2 Estrategia de cifrado

- `access_token` se cifra con `pgp_sym_encrypt(token, app.meta_token_key)`.
- La llave `app.meta_token_key` se setea con `ALTER DATABASE divinads SET app.meta_token_key = '...'`.
- Rotación trimestral: script que lee todos los tokens, desencripta con clave vieja, reencripta con nueva.
- La clave se guarda en Supabase Vault + Vercel Env Var `META_TOKEN_KEY` (consulta de referencia).
- No se loguea jamás, ni siquiera en modo debug.

### 13.3 Scopes mínimos justificados

Ver Anexo B del entregable Word.

### 13.4 Errores recuperables vs no recuperables

| Código FB | Significado | Acción |
|---:|---|---|
| 1, 2, 4, 17, 32, 341, 613 | Transitorios | Retry con backoff (ya implementado en `fb-client`) |
| 190 | Token inválido/expirado | Marcar conexión como `revoked`, notificar al usuario |
| 10, 200 | Sin permiso | Indicar al usuario que reconecte con scopes adicionales |
| 803 | Objeto no existe | 404 al usuario, no es error de la plataforma |
| 100 | Parámetro inválido | Bug de backend — alertar al equipo vía Sentry |

---

## 14. Pairing seguro de la extensión

### 14.1 Flujo

```
1. Usuario (panel web, ya autenticado)
   → /pair → click "Generar código de emparejamiento"
   → POST /api/extension/pair (action=create)
      → backend:
        · genera code de 6 dígitos (ej. 748203)
        · INSERT device_pairings (code, tenant_id, user_id, expires_at=now+5min, consumed=false)
        · responde {code, expires_at}

2. Usuario abre extensión Chrome:
   → popup: input "Código" + botón "Enlazar"
   → POST /api/extension/pair (action=consume, body={code})
      → backend:
        · rate limit por IP (5 intentos / minuto)
        · SELECT device_pairings WHERE code=X AND consumed=false AND expires_at > now()
        · si no existe: 400
        · UPDATE device_pairings SET consumed=true
        · genera extension_session_token (JWT corto, 30 días, con scope limitado)
        · INSERT extension_installs (tenant_id, user_id, browser, install_hash)
        · responde {session_token, tenant_id, user_id}
      → extensión guarda session_token en chrome.storage.session

3. Uso de la extensión:
   → service-worker.ts hace heartbeat cada 5 min:
      → POST /api/extension/heartbeat con Authorization: Bearer <session_token>
      → backend actualiza extension_installs.last_heartbeat
```

### 14.2 Validaciones

- Code siempre exactamente 6 dígitos numéricos.
- TTL = 5 minutos duros.
- Un único uso (`consumed=true` tras primera coincidencia exitosa).
- Rate limit: 5 intentos/min por IP, 3 creaciones/hora por user_id.
- Si la extensión pierde el `session_token`, no hay renovación automática — el usuario genera un nuevo code.

### 14.3 Expiración y revocación

- `extension_session_token` JWT firmado con clave específica (`EXTENSION_JWT_SECRET`), exp=30 días.
- Al hacer logout en el panel o revocar en `/settings`, el backend marca `extension_installs.revoked_at` y cualquier request posterior falla 401.
- El chequeo en cada heartbeat valida `revoked_at IS NULL`.

---

## 15. Endpoints Vercel (contratos)

| Endpoint | Método | Auth | Entrada | Salida | Validaciones | Riesgos |
|---|---|---|---|---|---|---|
| `/api/auth/callback` | GET | Supabase bridge | `?code` | Set-Cookie + redirect | Code de Supabase válido | Code reuse |
| `/api/extension/pair` | POST | Sesión Supabase (create) / sin auth (consume) | `{action, code?}` | `{code, expires_at}` o `{session_token}` | Zod + rate limit | Brute force del code |
| `/api/extension/heartbeat` | POST | `Authorization: Bearer <ext_jwt>` | — | `{ok, tenant_id}` | JWT válido + install no revocado | Token leakage |
| `/api/meta/connect/start` | GET | Sesión + tenant activo | — | Redirect a Meta | State firmado | CSRF |
| `/api/meta/callback` | GET | State firmado (no sesión) | `?code&state` | HTML success + postMessage | `appsecret_proof`, timing-safe state | CSRF, code replay |
| `/api/meta/disconnect/[id]` | POST | Sesión + rol ≥ admin + tenant match | — | `{ok}` | Ownership del connection_id | Disconnect cross-tenant |
| `/api/bm` | GET | Sesión + tenant + license active | `?connection_id` | `{rows, count}` | Connection pertenece al tenant | Fuga cross-tenant |
| `/api/bm/[bmId]` | GET | ídem | — | `{...bm detail}` | Connection + tenant match | ídem |
| `/api/ads`, `/api/pages`, `/api/pixel`, `/api/insights` | GET | ídem | — | JSON módulo | ídem | ídem |
| `/api/tenant/me` | GET | Sesión | — | `{tenants: [...], current}` | Solo tenants del usuario | — |
| `/api/licenses/me` | GET | Sesión + tenant | — | `{plan, status, expires_at, features}` | Tenant pertenece al usuario | — |
| `/api/audit` | POST | Sesión | `{event_type, metadata}` | `{ok}` | Zod + tenant derivado | Log injection |
| `/api/admin/tenants` | GET/POST/PATCH | `platform_admin` | — | JSON | Rol estricto | Escalada de privilegio |
| `/api/admin/licenses/[tenantId]` | PATCH | `platform_admin` | `{plan?, status?}` | `{ok}` | Rol estricto | ídem |
| `/api/admin/audit` | GET | `platform_admin` | `?tenant&from&to&event` | Paginado | Rol estricto | Leak de audit a no-staff |

Ver `docs/api/CONTRACTS.md` y `packages/types/src/index.ts` para el detalle de schemas Zod.

---

## 16. Licenciamiento y control comercial

### 16.1 Modelo

| Capacidad comercial | Dónde vive | Cómo se valida | Cómo se revoca | Observaciones |
|---|---|---|---|---|
| Plan activo del tenant | `licenses` | Middleware `requireActiveLicense` lee en cada request `/api/*` | `UPDATE licenses SET status='suspended'` | Cache 5 min en Redis/Upstash |
| Feature por plan | `feature_flags` + `plan_features` | Cliente consume `/api/licenses/me` al cargar el panel | Update flag o downgrade del plan | Para flags experimentales |
| Nº de miembros del tenant | `tenant_members` vs `plan_limits.max_members` | Trigger en INSERT `tenant_members` | — | — |
| Nº de conexiones Meta | `meta_connections` vs `plan_limits.max_connections` | Check en `/api/meta/callback` antes de insert | — | — |
| Bloqueo remoto inmediato | `licenses.status='suspended'` + invalidación de cache | Middleware consulta DB bypass cache si header `X-Force-Refresh` | Patch directo desde `/admin` | Tiempo efectivo < 5 min |

### 16.2 Planes iniciales

| Plan | Connections Meta | Miembros | Features |
|---|---:|---:|---|
| Trial (14 días) | 1 | 1 | BM, Ads, Pages |
| Starter | 3 | 3 | + Pixels, Insights básicos |
| Pro | 10 | 10 | + Advantage+, Atribución, Custom reports |
| Enterprise | ilimitado | ilimitado | + API access, SSO, audit avanzado |

---

## 17. Plan de migración por fases

### Fase 0 — Auditoría (DONE)
Ya realizada en este documento. Duración: 1 día.

### Fase 1 — Preparación del monorepo y servicios (2-3 días)
**Objetivo:** tener infra vacía pero funcional.
**Tareas:**
1. Crear proyecto Supabase (organización DivinAds, region cercana al cliente).
2. Crear proyecto Vercel linkeado al repo.
3. Inicializar monorepo con pnpm workspaces + Turborepo.
4. Mover `packages/core`, `packages/types`, `packages/security` con stubs.
5. Config `.env.example` por app.
**DoD:** `pnpm install` OK, `pnpm dev` levanta Next.js vacío, Supabase CLI conectada.
**Riesgos:** config de Vercel Env Vars por ambiente.

### Fase 2 — Schema Supabase + Auth (3-4 días)
**Objetivo:** auth del panel funcional y schema con RLS activa.
**Tareas:**
1. Aplicar `0001_init.sql` y `0002_rls_policies.sql`.
2. Configurar Supabase Auth (email + magic link, site URL, templates).
3. Implementar `/login`, `/(auth)/callback` y middleware.
4. Crear `/onboarding` que fuerza al usuario a crear o unirse a un tenant.
5. Escribir tests de RLS (intentar leer datos de tenant ajeno).
**DoD:** un usuario puede registrarse, crear un tenant, invitar a otro usuario. Tests de RLS en verde.
**Riesgos:** config incorrecta de redirect URLs que impida login.

### Fase 3 — Extracción de lógica sensible (2-3 días)
**Objetivo:** portar `fb-client` y `oauth` al nuevo repo.
**Tareas:**
1. Port `server/fb-client.js` → `packages/core/src/fb-client.ts` (con unit tests).
2. Port `server/oauth.js` → `apps/web/app/api/meta/{start,callback,disconnect}/route.ts` con escritura a Supabase.
3. Crear `packages/core/src/meta-tokens.ts` (wrapper sobre Supabase con encriptación pgcrypto).
4. Migrar tests de `test/oauth.test.js` a Vitest apuntando a las nuevas rutas.
**DoD:** usuario logueado puede conectar cuenta Meta y el token queda cifrado en Supabase.
**Riesgos:** diferencias en manejo de cookies entre Express y Next.js; redirect URIs deben re-registrarse en Meta.

### Fase 4 — Migración de extensión (3-4 días)
**Objetivo:** extensión delgada con pairing funcional.
**Tareas:**
1. Scaffolding `apps/extension` con Vite + CRXJS.
2. Popup mínimo: estado + botón "Emparejar".
3. Service worker: heartbeat cada 5 min.
4. Implementar `/api/extension/pair` y `/api/extension/heartbeat`.
5. Build .zip para carga en Chrome Web Store en modo test.
**DoD:** instalar la extensión, generar code desde panel, emparejar, ver estado "Conectada" y heartbeat exitoso.
**Riesgos:** políticas CSP de MV3 que bloqueen el bundle; origenes permitidos.

### Fase 5 — Migración de rutas API (5-7 días)
**Objetivo:** rutas de Graph API migradas 1:1.
**Tareas:**
1. Por cada módulo (bm, ads, pages, pixel, insights):
   - Portar handler a `app/api/<módulo>/route.ts`.
   - Adaptar `getTokenOrFail` → resolver `connection_id` desde Supabase con RLS.
   - Adaptar test nock correspondiente a Vitest.
2. Aplicar `requireSession` + `requireActiveLicense` + `requireTenantAccess` a cada ruta.
3. Monitoreo de errores con Sentry.
**DoD:** los 37 tests funcionales (adaptados) pasan contra las nuevas rutas.
**Riesgos:** cambios sutiles en el shape de respuesta que rompan el panel.

### Fase 6 — Migración del panel web (8-12 días, en paralelo con Fase 5)
**Objetivo:** dashboard Next.js con paridad funcional.
**Tareas:**
1. Layout compartido `(dashboard)/layout.tsx` con sidebar + auth guard.
2. Por cada página HTML actual, crear equivalente React en `(dashboard)/<modulo>/page.tsx`.
3. Reemplazar AG Grid vanilla por `ag-grid-react`.
4. Reescribir gráficos (SVG custom → Recharts o mantener Chart.js).
5. Onboarding + invitación a tenants + configuración.
**DoD:** checklist de aceptación del cliente (20 ítems) aprobado por dueño de producto.
**Riesgos:** tiempos de feature parity; plan de rollback si alguna vista no queda igual.

### Fase 7 — Licenciamiento + auditoría + admin (4-5 días)
**Objetivo:** producto comercializable.
**Tareas:**
1. Tabla `licenses`, seed de planes, middleware `requireActiveLicense`.
2. Panel `/admin` (solo `platform_admin`): listar tenants, cambiar plan/estado, leer audit.
3. Middleware `logAuditEvent` en rutas sensibles.
4. Cron diario de refresh de tokens Meta (Vercel Cron).
**DoD:** admin puede suspender un tenant y el bloqueo es efectivo en < 5 min.
**Riesgos:** race conditions en cache de licencia.

### Fase 8 — QA + hardening + release (5-7 días)
**Objetivo:** producto listo para cliente.
**Tareas:**
1. Auditoría de seguridad completa (OWASP Top 10).
2. Pentest básico (scan de endpoints sin auth, SQLi, XSS).
3. Tests de fuga cross-tenant (suite dedicada).
4. Carga de prueba (100 usuarios concurrentes).
5. Publicación de extensión en Chrome Web Store (modo unlisted para piloto).
6. Deploy a producción con `NODE_ENV=production` y Vercel Production env.
**DoD:** 0 hallazgos críticos, extensión publicada, dominio `app.divinads.com` activo.
**Riesgos:** rechazo de Chrome Web Store por permisos o política → iterar 1-2 semanas.

**Total estimado: 34-48 días hábiles.**

---

## 18. Cambios concretos de código

| Tipo | Ruta/archivo | Acción | Motivo | Prioridad |
|---|---|---|---|---|
| Crear | `pnpm-workspace.yaml` | Crear | Monorepo | 🔴 |
| Crear | `turbo.json` | Crear | Cache de builds | 🔴 |
| Crear | `apps/web/` | Next.js scaffold | Panel SaaS | 🔴 |
| Crear | `apps/extension/` | Vite + CRXJS scaffold | MV3 moderna | 🔴 |
| Crear | `packages/core/src/fb-client.ts` | Port de `server/fb-client.js` | Reuso | 🔴 |
| Crear | `packages/core/src/meta-tokens.ts` | Nuevo | Reemplazar token-store | 🔴 |
| Crear | `packages/types/src/index.ts` | Tipos compartidos | Type safety | 🔴 |
| Crear | `packages/security/src/zod-schemas.ts` | Validadores | Safety | 🔴 |
| Crear | `packages/auth/src/middleware.ts` | `requireSession`/`requireTenant`/`requireRole` | DRY | 🔴 |
| Crear | `supabase/migrations/0001_init.sql` | Schema completo | DB | 🔴 |
| Crear | `supabase/migrations/0002_rls_policies.sql` | RLS | Seguridad | 🔴 |
| Crear | `apps/web/app/api/meta/callback/route.ts` | OAuth server-side | Core feature | 🔴 |
| Crear | `apps/web/app/api/extension/pair/route.ts` | Pairing | Core feature | 🔴 |
| Crear | `apps/web/middleware.ts` | Auth guard global | Seguridad | 🔴 |
| Crear | `apps/web/app/(dashboard)/layout.tsx` | Shell del dashboard | UI | 🟠 |
| Crear | `.github/workflows/ci.yml` | Lint + tests | Calidad | 🟠 |
| Mover | `server/fb-client.js` → `packages/core/src/fb-client.ts` | Port | Reuso | 🔴 |
| Eliminar | `server.js` | Reemplazado por API routes | — | 🔴 |
| Eliminar | `server/token-store.js` | Reemplazado por Supabase | — | 🔴 |
| Eliminar | `tokens.json` (runtime) | No se persiste en fs | — | 🔴 |
| Eliminar | `js/jquery.js`, `js/bootstrap.bundle.min.js` | Stack obsoleto | — | 🟡 |
| Eliminar | `*.html` (9 archivos raíz) | Reemplazados por páginas Next | — | 🟡 |
| Modificar | `manifest.json` | Reducir permisos, cambiar host | Seguridad | 🔴 |

---

## 19. Plan de pruebas

### 19.1 Unitarias (Vitest)

| Caso | Objetivo | Prioridad |
|---|---|---|
| `fb-client.retry` backoff exponencial ante 429 | Retry correcto | 🔴 |
| `fb-client.parseFbError` mapea códigos | Shape de error estable | 🔴 |
| `encrypt_meta_token` idempotencia | Cifrado correcto | 🔴 |
| Zod schemas: rechazo de inputs malformados | Validación | 🔴 |
| `signState` / `verifyState` ida y vuelta | HMAC | 🔴 |

### 19.2 Integración (Vitest + Supabase test DB)

| Caso | Objetivo | Prioridad |
|---|---|---|
| Pairing: create + consume exitoso | Flujo base | 🔴 |
| Pairing: consume con code expirado → 400 | TTL | 🔴 |
| Pairing: consume ya consumido → 400 | Un solo uso | 🔴 |
| OAuth callback: persiste conexión + token cifrado | E2E OAuth | 🔴 |
| OAuth callback: state inválido → 400 | CSRF | 🔴 |
| `/api/bm` sin sesión → 401 | Auth gate | 🔴 |
| `/api/bm` con tenant ajeno → 403 | Tenant isolation | 🔴 |
| RLS: SELECT directo de otra tenant_member → 0 filas | RLS efectiva | 🔴 |
| License suspended → /api/bm → 402 | Licenciamiento | 🟠 |

### 19.3 E2E (Playwright)

| Flujo | Prioridad |
|---|---|
| Signup → magic link → onboarding → crear tenant | 🔴 |
| Invitar miembro → aceptar invitación → ver dashboard | 🔴 |
| Conectar cuenta Meta (con mock de FB) → ver BM list | 🔴 |
| Generar pairing code → extensión lo consume → heartbeat OK | 🔴 |
| Admin suspende tenant → usuario recibe 402 al siguiente request | 🟠 |

### 19.4 Seguridad

| Caso | Prioridad |
|---|---|
| GET /api/admin/* sin rol → 403 | 🔴 |
| POST /api/meta/disconnect de conexión ajena → 403 | 🔴 |
| Inyección SQL en params (`...'; DROP TABLE--`) → 400 del schema | 🔴 |
| XSS en nombre de tenant → escape en render | 🟠 |
| Log injection en audit.metadata → sanitización | 🟠 |
| Rate limit por IP en /api/extension/pair (brute force 6 dígitos) | 🔴 |

---

## 20. Despliegue y ambientes

| Ambiente | Componentes | Variables | Riesgos | Validaciones previas |
|---|---|---|---|---|
| **Local** | Supabase local (docker) + Next dev + Extension dev | `.env.local` con claves test | Claves reales filtradas | `pnpm test` verde |
| **Preview** | Branch Vercel + Supabase preview branch | Vercel preview env vars | Bases conflictivas | Smoke test en PR |
| **Staging** | Vercel staging + Supabase prod project | `app.staging.divinads.com` | Confusión staging/prod | Subset de datos prod anonimizados |
| **Producción** | Vercel prod + Supabase prod | `app.divinads.com` | Toda | Release via tag + aprobación manual |

### 20.1 Variables de entorno

**Vercel (por ambiente):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (sensitive, solo server)
- `FB_APP_ID`
- `FB_APP_SECRET` (sensitive)
- `FB_API_VERSION=v20.0`
- `FB_REDIRECT_URI=https://app.divinads.com/api/meta/callback`
- `OAUTH_STATE_SECRET` (sensitive, 32 bytes hex)
- `EXTENSION_JWT_SECRET` (sensitive, 32 bytes hex)
- `META_TOKEN_KEY` (referencia; la clave real vive en Supabase)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `SENTRY_DSN`

**Supabase DB settings:**
- `app.meta_token_key` (via `ALTER DATABASE`)

### 20.2 Rollback

- **Vercel:** `Promote previous deployment` (UI o CLI).
- **Supabase:** migración inversa (cada `NNNN_*.sql` trae comentado su `down`).
- **Extension:** no publicar hasta que el backend correspondiente esté estable; usar "Draft" en Chrome Web Store.

---

## 21. Definition of Done global

- [x] Monorepo pnpm + Turborepo inicializado
- [x] Todas las tablas del schema con RLS activa y probada
- [x] Auth del panel funcional con magic link
- [x] Flujo OAuth Meta end-to-end: conectar + refresh + disconnect
- [x] Pairing extensión ↔ panel en producción
- [x] 5 módulos (bm, ads, pages, pixel, insights) operativos con parity funcional
- [x] Panel `/admin` con rol `platform_admin`
- [x] Licenciamiento: bloqueo remoto efectivo en < 5 min
- [x] Audit logs escribiendo en eventos sensibles
- [x] Rate limit por IP y por tenant
- [x] Cron de refresh de tokens corriendo diariamente
- [x] Extensión publicada en Chrome Web Store
- [x] 0 vulnerabilidades críticas/altas en `npm audit`
- [x] Tests: 90%+ suite, incluyendo tests de fuga cross-tenant
- [x] Documentación en `docs/` completa
- [x] Runbook de incidentes en `docs/migration/RUNBOOK.md`

---

## 22. Riesgos abiertos

| # | Riesgo | Estado | Owner |
|---|---|---|---|
| R1 | Rechazo de App Review de Meta por scopes amplios | 🟠 Abierto | Producto — preparar justificación de cada scope |
| R2 | Rechazo de Chrome Web Store por permisos | 🟠 Abierto | Dev — permisos mínimos ya planteados |
| R3 | Rotación de `META_TOKEN_KEY` sin downtime | 🟡 Abierto | Infra — script de re-cifrado en batch |
| R4 | Coste Supabase Pro al superar tier gratis | 🟡 Abierto | Finanzas — proyectar a 6 meses |
| R5 | Latencia de Vercel Serverless ante /api/insights (N cuentas × 1 call) | 🟡 Abierto | Backend — considerar Edge Runtime o job diferido |
| R6 | GDPR / compliance si entra cliente europeo | 🟡 Abierto | Legal — región eu-west-1 |
| R7 | Coste de mantenimiento de AG Grid Enterprise | 🟢 Monitoreo | Dev — evaluar alternativas a futuro |

---

## 23. Orden recomendado de implementación

1. **Semana 1–2:** Fases 1–2 (infra + schema + auth)
2. **Semana 3:** Fase 3 (extracción OAuth + fb-client)
3. **Semana 4:** Fase 4 (extensión minimal + pairing) ▸ se puede paralelizar con Fase 5
4. **Semana 4–5:** Fase 5 (rutas API migradas)
5. **Semana 5–7:** Fase 6 (panel web migrado)
6. **Semana 7–8:** Fase 7 (licencias + admin + audit)
7. **Semana 8–9:** Fase 8 (QA + release)

**Hitos de decisión:**
- 🟢 Fin Semana 2: "Go / no-go" de Supabase (schema final aprobado).
- 🟢 Fin Semana 4: demo interna del pairing funcional.
- 🟢 Fin Semana 6: demo al cliente del panel migrado.
- 🟢 Fin Semana 8: UAT con el cliente.
- 🟢 Fin Semana 9: Release a producción.

---

**Fin del documento maestro.**
