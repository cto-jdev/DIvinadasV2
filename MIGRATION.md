# DivinAds — Guía de Migración a OAuth / Marketing API

Documento operativo: qué archivos se eliminan, qué archivos se crean, qué
archivos se modifican, y en qué orden ejecutar el swap.

---

## 1. Archivos a ELIMINAR

Ninguno de estos se borra hasta que la Fase 1 (OAuth) esté probada end-to-end.
Mientras tanto quedan en el repo pero **ya no son cargados por `manifest.oauth.json`**.

### 1.1 Capa de scraping / bypass (Facebook)
Archivos que implementan extracción de tokens, bypass de checkpoints, captcha
automatizado, 2FA automatizado y cookie manipulation. Todos se eliminan.

```
js/content.js                        (scraping EAAG/EAAB desde outerHTML)
js/libs1.js                          (FB class con cookie splits y bypass)
js/libs2.js                          (Business Manager scraping)
js/libs3.js                          (OTP / phone / email flows)
js/libs4.js                          (runBm, UFAC captcha, encrypted_context)
js/libs5_clean.js                    (helpers adicionales de scraping)
js/modules/facebook-utils.js         (consolidación de helpers de cookies)
js/fix_functions.js                  (parches sobre los libs)
js/scripts-fix.js                    (parches sobre scripts.js)
js/copilot-mock.js                   (mocks del scraping)
js/mock-extension.js                 (mocks del scraping)
js/test.js                           (tests sobre el scraping)
js/tkqc.js                           (¿testeo? — verificar contenido)
js/via.js                            (flujos vía cookies)
js/bops.js                           (verificar, puede ser UI)
fb-connect.html                      (captura de cookies via injection)
js/fb-connect.js                     (lógica de captura)
sessions.json                        (storage de cookies capturadas)
```

### 1.2 Documentación obsoleta de la fase de deobfuscación

```
PHASE1_SECURITY_CHANGES.md
PHASE2_DEOBFUSCATION_MAPPING.md
PHASE2_PROGRESS.md
PHASE2_REFACTORING_COMPLETE.md
PHASE2_SESSION2_PROGRESS.md
```

---

## 2. Archivos a CREAR

```
.env                                 (local, NO commitear)
.env.example                         ✅ creado
.gitignore                           ✅ creado
SETUP.md                             ✅ creado
MIGRATION.md                         ✅ este documento
manifest.oauth.json                  ✅ creado (swap a manifest.json al final)

server/
  oauth.js                           (flujo OAuth2 código → token)
  fb-client.js                       (wrapper Graph/Marketing API)
  token-store.js                     (persistencia encriptada de tokens)
  routes/
    bm.js                            (/api/bm/*)
    ads.js                           (/api/ads/*)
    pages.js                         (/api/pages/*)
    insights.js                      (/api/insights/*)
    pixel.js                         (/api/pixel/*)
    attribution.js                   (/api/attribution/*)

connect.html                         (reemplaza fb-connect.html)
js/connect.js                        (reemplaza js/fb-connect.js)
```

---

## 3. Archivos a MODIFICAR (solo la capa de datos, UI intacta)

Para cada uno, el cambio es: reemplazar llamadas a `fb.post()`, `fb.run()`,
`fetchFacebook()`, `fb.graph()` por `fetch('/api/...')`.

```
js/scripts.js                        (quitar inyección de tokens scrapeados)
js/bm.js                             (→ /api/bm/*)
js/ads.js                            (→ /api/ads/*)
js/page.js                           (→ /api/pages/*)
js/clone.js                          (solo cambia fuente de datos)
js/phoi.js                           (solo cambia fuente de datos)
js/setting.js                        (→ /api/me, /api/disconnect)
js/popup.js                          (→ /api/me)
js/popup-launcher.js                 (→ /api/me)
js/sidebar.js                        (mostrar lista de cuentas conectadas)
js/dashboard-analytics.js            (→ /api/insights)
js/pixel-health.js                   (→ /api/pixel)
js/attribution.js                    (→ /api/attribution)
js/advantage.js                      (→ /api/ads/:actId/advantage)
js/setting-ui.js                     (UI de gestión de cuentas conectadas)
js/card-manager.js                   (read-only + deep-link a Ads Manager)
js/card-assignment.js                (read-only + deep-link a Ads Manager)
background.js                        (solo proxy a localhost, sin cookies)

index.html, bm.html, ads.html, page.html, setting.html,
clone.html, phoi.html, pixel.html, advantage.html, attribution.html
                                     (quitar <script> de libs1-5, content, fb-connect)

server.js                            (montar rutas nuevas)
package.json                         (añadir dotenv, axios)
manifest.json                        (swap desde manifest.oauth.json)
```

---

## 4. Orden de ejecución

### Etapa A — Setup (sin romper nada)
1. ✅ Crear `.env.example`, `.gitignore`, `SETUP.md`, `MIGRATION.md`, `manifest.oauth.json`
2. Tú completas en paralelo los pasos de `SETUP.md` en developers.facebook.com
3. `npm install dotenv axios`
4. Crear carpeta `server/` y los 3 archivos core (`token-store.js`, `fb-client.js`, `oauth.js`)

### Etapa B — Autenticación (la extensión vieja sigue funcionando)
5. Montar endpoints `/api/oauth/start`, `/api/oauth/callback`, `/api/me`, `/api/disconnect` en `server.js`
6. Crear `connect.html` + `js/connect.js`
7. **Prueba:** conectar una cuenta de test, verificar que `tokens.json` se crea con el long-lived token

### Etapa C — Reemplazo por módulo
Para cada uno de BM → Ads → Pages → Insights → Pixel → Attribution → Advantage:

8. Escribir la ruta `server/routes/X.js` que traduce Graph API → shape esperado por AG Grid
9. Modificar `js/X.js` (frontend) para llamar a `/api/X/*` en lugar de scraping
10. Probar en la extensión que el grid se pinta igual
11. Commit del módulo

### Etapa D — Limpieza final (ruptura intencional)
12. Swap `manifest.json` ← `manifest.oauth.json`
13. Quitar `<script src="js/libs*.js">` y `<script src="js/content.js">` de TODOS los HTML
14. Quitar `<script src="js/fb-connect.js">` de donde se referencie
15. Verificar con el navegador que no hay errores 404 ni referencias rotas
16. Eliminar físicamente los archivos listados en §1.1 (⚠️ punto de no retorno)
17. Borrar `sessions.json` si existe

### Etapa E — Testing y release
18. Tests unitarios con `nock` para cada ruta
19. Test de integración end-to-end con usuario de prueba de Meta
20. Pasar la app a Live Mode en developers.facebook.com (tras App Review aprobada)
21. Bump `"version": "2.0.0"` en manifest
22. Tag git `v2.0.0`, release

---

## 5. Matriz de mapeo UI ↔ API oficial

### Business Manager (`bm.js`)

| Columna en el grid          | Campo Graph API                                               |
|-----------------------------|---------------------------------------------------------------|
| `id`                        | `businesses.data[].id`                                        |
| `name`                      | `businesses.data[].name`                                      |
| `verification_status`       | `businesses.data[].verification_status`                       |
| `primary_page`              | `businesses.data[].primary_page.name`                         |
| `created_time`              | `businesses.data[].created_time`                              |
| `ad_accounts_count`         | `businesses.data[].owned_ad_accounts.summary.total_count`     |
| `pages_count`               | `businesses.data[].owned_pages.summary.total_count`           |
| `role`                      | `businesses.data[].permitted_roles[0]` (primer rol del usuario) |
| `trustLevel`                | `owned_ad_accounts.data[0].adtrust_dsl`                       |
| `currency`                  | `owned_ad_accounts.data[0].currency`                          |

### Ads (`ads.js`)

| Columna en el grid          | Campo Graph API                                               |
|-----------------------------|---------------------------------------------------------------|
| `account_id`                | `adaccounts.data[].account_id`                                |
| `name`                      | `adaccounts.data[].name`                                      |
| `status`                    | `adaccounts.data[].account_status` (mapear 1=active etc.)     |
| `balance`                   | `adaccounts.data[].balance`                                   |
| `spent`                     | `adaccounts.data[].amount_spent`                              |
| `currency`                  | `adaccounts.data[].currency`                                  |
| `payment` (cellRenderer)    | `adaccounts.data[].all_payment_methods` (estructura limpia)   |
| `admins`                    | `adaccounts.data[].users` (requiere permiso)                  |

### Pages (`page.js`)

| Columna en el grid          | Campo Graph API                                               |
|-----------------------------|---------------------------------------------------------------|
| `id`                        | `accounts.data[].id`                                          |
| `name`                      | `accounts.data[].name`                                        |
| `category`                  | `accounts.data[].category`                                    |
| `fan_count`                 | `accounts.data[].fan_count`                                   |
| `verification_status`       | `accounts.data[].verification_status`                         |
| `picture`                   | `accounts.data[].picture.data.url`                            |

> ⚠️ Los estados `HCVV`, `Necesita apelación`, `En apelación`, `VeryID`,
> `Página en apelación` del grid actual **no existen en Graph API**. Graph
> solo expone `verification_status` con valores `verified`, `not_verified`,
> `pending`. El UI se debe actualizar para reflejar solo estos tres estados.

---

## 6. Diferencias funcionales conocidas

Estas funciones del producto actual **no existen en la API oficial** y se
eliminan del UI:

| Funcionalidad actual                         | Motivo de eliminación                        |
|----------------------------------------------|----------------------------------------------|
| Estados operativos custom (HCVV, VeryID…)    | No hay campo en Graph API                    |
| Clone de cuentas / swap de cookies           | Por definición requiere manipulación de sesión |
| Generación automática de sello/avatar sobre plantilla para "verify" | No aplica en flujo oficial    |
| Resolución automática de 2FA / SMS           | Se hace por el usuario en el flujo OAuth     |
| Appeal/apelación automatizada                | Meta no expone API para esto                 |
| Gestión de tarjetas (añadir/quitar)          | PCI compliance — no hay API pública          |

Estas se sustituyen por:
- Estado real de Graph: `verification_status`, `account_status`, `disable_reason`
- Deep-links a Ads Manager oficial para operaciones que requieren UI de Meta
- Gestión de usuarios/roles vía `POST /{business}/business_users`

---

## 7. Rollback plan

Si en Etapa C (reemplazo por módulo) algo falla y el cliente necesita volver
a la versión previa:

1. `git checkout v1.x.x` restaura todo
2. Swap inverso de `manifest.json`
3. Cargar extensión en Chrome
4. (Los tokens OAuth ya obtenidos quedan guardados pero no se usan)

Después de Etapa D (limpieza física), el rollback requiere git, no hay otra vía.
Por eso Etapa D va al final y con la certeza de que Etapa C funciona.
