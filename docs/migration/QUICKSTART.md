# DivinAds V2 — Guía rápida de arranque

> Para el equipo técnico encargado de ejecutar la migración.
> Tiempo estimado primera vez: 2–3 horas.

---

## Prerrequisitos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 20.x LTS |
| pnpm | 9.x |
| Git | 2.x |
| Cuenta Supabase | Plan Free o superior |
| Cuenta Vercel | Plan Hobby o superior |
| App Facebook Developer | Creada en https://developers.facebook.com |

---

## Paso 1 — Clonar y preparar el monorepo

```bash
git clone <repositorio>
cd app
git checkout feat/migration-v2-saas
pnpm install
```

---

## Paso 2 — Crear el proyecto Supabase

1. https://supabase.com → New Project.
2. Guardar: **URL**, **anon key** y **service_role key**.
3. SQL Editor → ejecutar en orden:
   ```
   supabase/migrations/0001_init.sql
   supabase/migrations/0002_rls_policies.sql
   supabase/migrations/0003_rpc_store_meta_token.sql
   ```
4. Vault → New Secret:
   - **Name**: `meta_token_encryption_key`
   - **Value**: `$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")`
5. Auth → Providers → Email: activar (ya activo por defecto).
6. Auth → Providers → Google: configurar con las credenciales de Google Cloud.
7. Auth → URL Configuration → Site URL: `https://app.divinads.com`

---

## Paso 3 — Configurar variables de entorno

```bash
cp .env.example.v2 apps/web/.env.local
```

Editar `.env.local` y rellenar todos los valores con los obtenidos en el paso anterior.

Generar secretos:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Ejecutar 3 veces: para OAUTH_STATE_SECRET, JWT_SECRET, CRON_SECRET
```

---

## Paso 4 — Probar localmente

```bash
cd apps/web
pnpm dev
# Abrir http://localhost:3000
```

Flujo a verificar:
1. Crear cuenta en `/login` → `/signup` (o crear desde Supabase Auth → Studio).
2. Crear tenant en `/panel`.
3. Conectar cuenta Meta desde `/panel/connections`.
4. Generar código de pareo en `/panel/extension`.
5. Cargar la extensión (`apps/extension/`) en `chrome://extensions` → Load unpacked.
6. Ingresar el código en el popup de la extensión.

---

## Paso 5 — Desplegar en Vercel

```bash
cd apps/web
npx vercel link      # seleccionar o crear proyecto
npx vercel env add   # agregar cada variable (o usar el dashboard)
npx vercel deploy --prod
```

Configurar en Vercel Dashboard → Settings → Environment Variables todas las vars de `.env.example.v2`.

---

## Paso 6 — Configurar la app de Facebook

1. Facebook Developer → tu app → Configuración básica:
   - Agregar plataforma Web con URL: `https://app.divinads.com`
2. Facebook Login for Business → Configuración:
   - Valid OAuth Redirect URIs: `https://app.divinads.com/api/meta/callback`
3. Agregar los permisos del `.env.example.v2` → `FB_OAUTH_SCOPES`.
4. App Review: solicitar permisos de producción (ver MIGRATION_V2.md §22 riesgo R1).

---

## Paso 7 — Verificación final (checklist)

- [ ] Las 3 migraciones SQL aplicadas sin errores.
- [ ] Vault key `meta_token_encryption_key` registrada.
- [ ] Login email funciona en producción.
- [ ] Flujo OAuth Meta completo (start → callback → conexión visible en panel).
- [ ] Código de pareo 6 dígitos funciona en la extensión.
- [ ] La extensión llama `/api/graph/bm/list` y recibe datos.
- [ ] `audit_logs` registra acciones.
- [ ] 0 errores en Vercel Logs.
- [ ] Rate limiting activo (Upstash dashboard muestra requests).

---

## Soporte

Ver `docs/runbook/OPERATIONS.md` para operación continua, rotación de secretos e incidentes.
