# DivinAds V2 — Runbook de Operación

> Documento para el equipo técnico. Actualizar después de cada incidente.

---

## 1. Arranque local (desarrollo)

```bash
# 1. Clonar y preparar dependencias
git clone <repo> && cd app
pnpm install          # instala todos los workspaces

# 2. Variables de entorno
cp .env.example.v2 apps/web/.env.local
# Rellenar todos los campos (ver sección Configuración)

# 3. Base de datos: aplicar migraciones en tu proyecto Supabase dev
npx supabase db push   # o pegar los SQL manualmente en Studio

# 4. Registrar la clave de cifrado en Vault (1 vez)
#    En Supabase Studio → Database → Vault → Add Secret:
#    name:  meta_token_encryption_key
#    value: (openssl rand -base64 32)

# 5. Seed de desarrollo (opcional)
#    Crear un usuario en Supabase Auth → Studio → Authentication → Users
#    Copiar su UUID al archivo supabase/seed/dev_seed.sql (\set dev_user '...')
psql $DATABASE_URL -f supabase/seed/dev_seed.sql

# 6. Iniciar el panel web
cd apps/web && pnpm dev     # http://localhost:3000

# 7. Cargar la extensión en Chrome
#    chrome://extensions → Developer mode → Load unpacked → apps/extension/
```

---

## 2. Despliegue en producción (Vercel + Supabase)

### 2.1 Supabase — primera vez

1. Crear proyecto en https://supabase.com
2. Ir a **SQL Editor** → ejecutar en orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls_policies.sql`
   - `supabase/migrations/0003_rpc_store_meta_token.sql`
3. **Vault** → Añadir secreto `meta_token_encryption_key` (valor: `openssl rand -base64 32`)
4. **Authentication → Providers** → Activar Google y configurar Client ID/Secret
5. **Authentication → URL Configuration** → añadir `https://app.divinads.com` como Allowed Origin

### 2.2 Vercel — primera vez

```bash
cd apps/web
npx vercel link          # enlazar con proyecto Vercel
npx vercel env pull      # o configurar manualmente en dashboard

# Configurar todas las vars de .env.example.v2 en:
# Vercel Dashboard → Project → Settings → Environment Variables
# Marcar cada una como: Production / Preview / Development según aplique

npx vercel deploy --prod
```

### 2.3 Extensión Chrome — publicación

```bash
cd apps/extension
# 1. Revisar manifest.json: version, name, description
# 2. Comprimir: zip -r divinads-extension-v2.zip . --exclude='*.DS_Store'
# 3. Subir a Chrome Web Store Developer Dashboard
# 4. Completar listado: capturas, descripción, política de privacidad
# 5. Enviar a revisión (1-3 días hábiles)
```

---

## 3. Rotación de secretos

| Secreto | Cuándo rotar | Procedimiento |
|---|---|---|
| `OAUTH_STATE_SECRET` | Cada 6 meses o si se compromete | 1) Generar nuevo valor. 2) Actualizar en Vercel. 3) Deploy. Las transacciones en vuelo fallarán (reanudan al reiniciar el OAuth). |
| `JWT_SECRET` | Cada 6 meses o si se compromete | 1) Generar nuevo. 2) Actualizar Vercel. 3) Deploy. **Todos los installs se desconectan.** Notificar usuarios por email. |
| `meta_token_encryption_key` | Solo si se compromete | 1) Generar nueva clave en Vault. 2) Ejecutar script de re-cifrado (ver §4). 3) Eliminar clave antigua del Vault. |
| `FB_APP_SECRET` | Al comprometerse | 1) Regenerar en Meta Developer. 2) Actualizar Vercel. 3) Re-rotar `OAUTH_STATE_SECRET` también. |

---

## 4. Re-cifrado de tokens (vault key rotation)

```sql
-- Ejecutar en Supabase SQL Editor con service_role
-- 1. Descifrar con clave antigua
-- 2. Cifrar con clave nueva
-- 3. Eliminar clave antigua del Vault

DO $$
DECLARE
    old_key text := 'CLAVE_ANTERIOR';
    new_key text := 'CLAVE_NUEVA';
    r record;
BEGIN
    FOR r IN SELECT connection_id FROM meta_tokens LOOP
        UPDATE meta_tokens
        SET access_token_enc = pgp_sym_encrypt(
            pgp_sym_decrypt(access_token_enc, old_key),
            new_key
        )
        WHERE connection_id = r.connection_id;
    END LOOP;
END $$;
```

---

## 5. Renovación masiva de tokens Meta (cron)

Configurar en Vercel Cron Jobs (`vercel.json`):

```json
{
  "crons": [{
    "path": "/api/cron/refresh-tokens",
    "schedule": "0 3 * * *"
  }]
}
```

El endpoint `POST /api/meta/refresh` acepta `X-Cron-Secret` en lugar de sesión de usuario.
Iterar sobre todas las conexiones activas con `expires_at < now() + 10 days`.

---

## 6. Monitoreo y alertas

| Métrica | Umbral de alerta | Acción |
|---|---|---|
| 5xx en `/api/graph/*` | >5% en 5 min | Revisar logs Vercel + estado Graph API Meta |
| Tokens próximos a expirar | `expires_at < now() + 7d` | Alarma en background.js extensión + email |
| Rate limit hits | >100 en 1 min | Revisar Upstash dashboard + posible abuso |
| Supabase DB size | >80% del plan | Archivar `audit_logs` > 90 días |
| Extension_installs sin last_seen >30d | — | Revocar automáticamente (cron) |

---

## 7. Backup y retención

- **Supabase**: activar Point-in-Time Recovery (PITR) en plan Pro.
- **audit_logs**: retener 90 días en tabla principal; archivar a Supabase Storage comprimido.
- **meta_tokens**: no hacer backup en texto plano. El backup de Supabase incluye la tabla cifrada.
- **extension_installs**: purgar registros con `revoked_at > 90 days` mensualmente.

---

## 8. Gestión de incidentes

### Token Meta inválido / revocado por el usuario en Facebook

1. El endpoint `/api/graph/*` retorna `meta_error` con `code: 190`.
2. Actualizar `meta_connections.status = 'expired'`.
3. Notificar al tenant (email + badge en panel).
4. Usuario reconecta desde `/panel/connections`.

### Extension desconectada (JWT expirado / revocado)

1. La extensión recibe `401 unauthorized`.
2. El popup muestra pantalla de pareo.
3. El usuario genera nuevo código en el panel y lo ingresa.

### Compromiso de clave JWT_SECRET

1. Actualizar `JWT_SECRET` en Vercel → deploy.
2. Todos los session_tokens existentes quedan inválidos.
3. En `extension_installs`: marcar todos como `revoked_at = now()`.
4. Notificar a todos los usuarios: "Reconecta la extensión".

---

## 9. Contactos y escalación

| Rol | Responsabilidad | Contacto |
|---|---|---|
| DevOps / Backend | Vercel, Supabase, secretos | — |
| Meta Developer | App Review, permisos, webhooks | developers.facebook.com |
| Soporte cliente | UAT, reportes de bugs | Panel → Soporte |
