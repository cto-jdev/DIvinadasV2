# DivinAds V2 — Checklist de Despliegue
> Ejecutar en orden. Marcar cada ítem antes de pasar al siguiente.
> Tiempo estimado: 3–4 horas primera vez.

---

## FASE 0 — Prerrequisitos

- [ ] Node.js ≥ 20 instalado (`node -v`)
- [ ] pnpm ≥ 9 instalado (`pnpm -v`)
- [ ] Cuenta Supabase creada (https://supabase.com)
- [ ] Cuenta Vercel creada y CLI instalada (`npm i -g vercel`)
- [ ] App Facebook Developer activa (https://developers.facebook.com)
- [ ] Cuenta Google Cloud con OAuth 2.0 configurada (para login Google)
- [ ] Cuenta Upstash Redis (https://upstash.com) — plan Free es suficiente

---

## FASE 1 — Supabase (base de datos)

### 1.1 Crear proyecto
- [ ] Supabase → New Project → elegir región (eu-west-1 para GDPR o us-east-1)
- [ ] Guardar: **Project URL**, **anon key**, **service_role key**

### 1.2 Ejecutar migraciones (en orden)
```sql
-- En Supabase Studio → SQL Editor, pegar y ejecutar cada archivo:
```
- [ ] `supabase/migrations/0001_init.sql`
- [ ] `supabase/migrations/0002_rls_policies.sql`
- [ ] `supabase/migrations/0003_rpc_store_meta_token.sql`
- [ ] `supabase/migrations/0004_hardening.sql`

**Verificar sin errores:** `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';` → debe retornar ≥ 13

### 1.3 Vault — clave de cifrado
- [ ] Supabase Studio → Database → Vault → **New Secret**
  - Name: `meta_token_encryption_key`
  - Value: ejecutar en terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- [ ] **Guardar el valor en un gestor de contraseñas (no en el repo)**

### 1.4 Auth providers
- [ ] Auth → Providers → **Email**: activado (por defecto)
- [ ] Auth → Providers → **Google**:
  - Client ID y Secret: obtener de Google Cloud Console → APIs → Credenciales → OAuth 2.0
  - Authorized redirect URI en Google: `https://<project>.supabase.co/auth/v1/callback`
- [ ] Auth → URL Configuration:
  - **Site URL**: `https://app.divinads.com` (staging: `https://divinads-preview.vercel.app`)
  - **Redirect URLs**: `https://app.divinads.com/api/auth/callback`

### 1.5 Verificación Supabase
```sql
-- Verificar RLS activa en todas las tablas:
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
-- Debe retornar 0 filas
```
- [ ] RLS activo en todas las tablas (0 filas sin RLS)
- [ ] `SELECT public.is_jti_revoked('test')` retorna `false` sin error
- [ ] `SELECT public.is_tenant_member('00000000-0000-0000-0000-000000000000'::uuid)` retorna `false`

---

## FASE 2 — Variables de entorno

### 2.1 Generar secretos
```bash
# Ejecutar 3 veces — guardar cada valor en gestor de contraseñas:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# 1. OAUTH_STATE_SECRET
# 2. JWT_SECRET
# 3. CRON_SECRET
```
- [ ] OAUTH_STATE_SECRET generado y guardado
- [ ] JWT_SECRET generado y guardado
- [ ] CRON_SECRET generado y guardado

### 2.2 Facebook Developer App
- [ ] developers.facebook.com → tu app → Configuración básica → Agregar plataforma Web
  - URL: `https://app.divinads.com`
- [ ] Facebook Login for Business → Configuración:
  - Valid OAuth Redirect URIs: `https://app.divinads.com/api/meta/callback`
- [ ] Copiar **App ID** y **App Secret**
- [ ] Activar modo **Live** (o mantener Development para staging)

### 2.3 Upstash Redis
- [ ] Upstash → New Database → región US-East-1 o EU-West-1
- [ ] Copiar **REST URL** y **REST Token**

### 2.4 Crear `.env.local` para desarrollo
```bash
cp .env.example.v2 apps/web/.env.local
# Editar con todos los valores obtenidos arriba
```
- [ ] Todos los campos de `.env.example.v2` completados

---

## FASE 3 — Vercel

### 3.1 Linkear proyecto
```bash
cd apps/web
npx vercel link
# Seleccionar o crear proyecto en Vercel
```
- [ ] Proyecto Vercel creado y linkeado

### 3.2 Configurar variables en Vercel Dashboard
Ir a **Vercel → Project → Settings → Environment Variables** y agregar cada una (marcar como **Sensitive**):

| Variable | Entorno |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | All |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | All |
| SUPABASE_SERVICE_ROLE_KEY | All (Sensitive) |
| FB_APP_ID | All |
| FB_APP_SECRET | All (Sensitive) |
| FB_API_VERSION | All |
| FB_REDIRECT_URI | Production / Preview |
| FB_OAUTH_SCOPES | All |
| OAUTH_STATE_SECRET | All (Sensitive) |
| JWT_SECRET | All (Sensitive) |
| CRON_SECRET | All (Sensitive) |
| UPSTASH_REDIS_REST_URL | All |
| UPSTASH_REDIS_REST_TOKEN | All (Sensitive) |

- [ ] Todas las variables configuradas en Vercel

### 3.3 Deploy staging (Preview)
```bash
cd apps/web
npx vercel deploy
# Obtener URL de preview: https://divinads-xxx.vercel.app
```
- [ ] Deploy staging exitoso sin errores de build

### 3.4 Actualizar Supabase con URL de staging
- [ ] Auth → URL Configuration → Redirect URLs: añadir `https://divinads-xxx.vercel.app/api/auth/callback`

---

## FASE 4 — Pruebas de staging

### 4.1 Health check
```bash
curl https://divinads-xxx.vercel.app/api/health
# Esperado: {"status":"ok","db":"connected","latency_ms":<N>}
```
- [ ] Health check retorna `status: ok`

### 4.2 Flujo de autenticación
- [ ] Abrir `https://divinads-xxx.vercel.app/signup` → crear cuenta con email
- [ ] Verificar email recibido con enlace de confirmación
- [ ] Confirmar email → redirige a `/panel`
- [ ] `/panel` muestra "Tus espacios de trabajo" (vacío)
- [ ] Login con Google funciona y redirige a `/panel`

### 4.3 Flujo OAuth Meta
- [ ] En `/panel`, crear un tenant nuevo
- [ ] Ir a `/panel/connections?tenant=<id>`
- [ ] Clic en "Conectar cuenta Meta" → redirige a Facebook
- [ ] Autorizar en Facebook → callback exitoso → conexión visible en la lista
- [ ] Verificar en Supabase Studio: fila en `meta_connections` con status=active
- [ ] Verificar en `meta_tokens`: fila con `access_token_enc` (debe ser bytea, no texto plano)

### 4.4 Pairing extensión
- [ ] Cargar `apps/extension/dist/` en Chrome (`chrome://extensions` → Load unpacked)
  - Primero ejecutar: `cd apps/extension && node scripts/build.js`
- [ ] En panel → `/panel/extension?tenant=<id>` → generar código de 6 dígitos
- [ ] En popup de la extensión → ingresar código → "Conectar"
- [ ] Popup muestra estado "Conectado"
- [ ] Verificar en Supabase: fila en `extension_installs` con `last_seen_at` actualizado

### 4.5 Graph API proxy
Con la extensión conectada, abrir popup → (las llamadas se hacen internamente):
- [ ] `GET /api/graph/bm/list?connection_id=<id>` retorna lista de BMs
- [ ] `GET /api/graph/adaccounts/list?connection_id=<id>` retorna cuentas
- [ ] `GET /api/health` desde la extensión → ok

### 4.6 Seguridad
```bash
# Verificar headers de seguridad:
curl -I https://divinads-xxx.vercel.app | grep -E "X-Frame|Content-Security|X-Content|Strict-Trans"
```
- [ ] `X-Frame-Options: DENY` presente
- [ ] `Content-Security-Policy` presente
- [ ] `X-Content-Type-Options: nosniff` presente
- [ ] En producción: `Strict-Transport-Security` presente

```bash
# Verificar rate-limit en pairing:
for i in {1..6}; do
  curl -s -o /dev/null -w "%{http_code}\n" -X POST https://divinads-xxx.vercel.app/api/extension/pair/redeem \
    -H "Content-Type: application/json" -d '{"code":"000000"}'
done
# Los primeros 5 deben retornar 404 (código no existe), el 6to → 429
```
- [ ] Rate limit activo (429 después del 5to intento)

### 4.7 Cron jobs (manual)
```bash
curl -H "x-cron-secret: $CRON_SECRET" https://divinads-xxx.vercel.app/api/cron/refresh-tokens
# Esperado: {"ok":true,"refreshed":0,"failed":0,"total":0}

curl -H "x-cron-secret: $CRON_SECRET" https://divinads-xxx.vercel.app/api/cron/purge-expired
# Esperado: {"ok":true,...}
```
- [ ] Cron refresh-tokens responde ok
- [ ] Cron purge-expired responde ok
- [ ] Sin `x-cron-secret` → 401

---

## FASE 5 — Despliegue producción

### 5.1 Dominio personalizado
- [ ] Vercel → Project → Settings → Domains → añadir `app.divinads.com`
- [ ] Configurar DNS: CNAME `app.divinads.com` → `cname.vercel-dns.com`
- [ ] Esperar propagación (5-30 min)

### 5.2 Actualizar todas las URLs a producción
- [ ] Supabase Auth → Site URL: `https://app.divinads.com`
- [ ] Supabase Auth → Redirect URLs: `https://app.divinads.com/api/auth/callback`
- [ ] Facebook App → Valid OAuth Redirect URIs: `https://app.divinads.com/api/meta/callback`
- [ ] Vercel env var `FB_REDIRECT_URI`: `https://app.divinads.com/api/meta/callback`
- [ ] Extension `manifest.json`: `host_permissions` con URL de producción (ya está)

### 5.3 Deploy producción
```bash
cd apps/web
npx vercel deploy --prod
```
- [ ] Deploy producción exitoso

### 5.4 Verificación final producción
- [ ] `https://app.divinads.com/api/health` → `{"status":"ok"}`
- [ ] Login completo en producción
- [ ] OAuth Meta en producción (con app en modo Live)
- [ ] Pairing extensión en producción (con URL de prod en manifest)

---

## FASE 6 — Chrome Web Store (publicación)

### 6.1 Preparar build de producción
```bash
cd apps/extension
DIVINADS_API_BASE=https://app.divinads.com node scripts/build.js
node scripts/zip.js
# Genera: divinads-extension-v2.0.0.zip
```
- [ ] Build de producción generado (sin SVG placeholder, con PNGs reales 16/48/128px)

### 6.2 Subir a Chrome Web Store
- [ ] https://chrome.google.com/webstore/devconsole → Nueva extensión
- [ ] Subir `divinads-extension-v2.0.0.zip`
- [ ] Completar listing:
  - [ ] Descripción en inglés y español
  - [ ] Capturas de pantalla (1280x800 o 640x400)
  - [ ] Ícono 128x128 PNG
  - [ ] URL de política de privacidad
  - [ ] Justificación de permisos (storage: guardar sesión; alarms: heartbeat)
- [ ] Enviar a revisión (1-3 días hábiles)

---

## FASE 7 — Meta App Review

### 7.1 Preparar documentación
- [ ] Screencast del flujo OAuth completo (connect → use)
- [ ] Política de privacidad publicada en `https://app.divinads.com/privacy`
- [ ] Terms of Service en `https://app.divinads.com/terms`
- [ ] Business Verification completada (si aplica)

### 7.2 Solicitar permisos
- [ ] `ads_management` — justificación: gestión de campañas
- [ ] `ads_read` — justificación: lectura de métricas
- [ ] `business_management` — justificación: acceso a BMs
- [ ] `pages_show_list` + `pages_read_engagement` — justificación: gestión de páginas
- [ ] `read_insights` — justificación: análisis de rendimiento

---

## CHECKLIST DE SEGURIDAD FINAL

- [ ] 0 secretos en el repositorio (`git grep -r "FB_APP_SECRET\|JWT_SECRET"` → 0 resultados)
- [ ] `meta_tokens.access_token_enc` es bytea en producción (no texto plano)
- [ ] RLS activo en todas las tablas (verificar con query §1.5)
- [ ] Vault key registrada y funcional (probar con `SELECT public.store_meta_token(...)`)
- [ ] Rate limit activo en Upstash (verificar dashboard)
- [ ] CRON_SECRET no es predecible (mínimo 32 bytes hex)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` marcada como Sensitive en Vercel
- [ ] `FB_APP_SECRET` marcada como Sensitive en Vercel
- [ ] Headers de seguridad verificados (curl -I)
- [ ] Health check monitoreado (UptimeRobot / Better Uptime)

---

## CONTACTOS DE EMERGENCIA

| Sistema | URL | Credenciales |
|---|---|---|
| Supabase Dashboard | https://supabase.com/dashboard | Admin email |
| Vercel Dashboard | https://vercel.com/dashboard | Admin email |
| Facebook Developer | https://developers.facebook.com | App owner |
| Upstash | https://console.upstash.com | Admin email |
| Chrome Web Store | https://chrome.google.com/webstore/devconsole | Publisher account |
