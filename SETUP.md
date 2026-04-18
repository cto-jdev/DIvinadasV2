# DivinAds — Setup de Meta for Developers

Esta guía describe **todo lo que tú (no el código) tienes que hacer** en
[developers.facebook.com](https://developers.facebook.com) antes de que
el servidor pueda autenticar a los usuarios contra Graph API / Marketing API.

> **Tiempo estimado:** 30–60 min para el setup técnico + días/semanas esperando App Review de Meta.

---

## 1. Crear la app en Meta for Developers

1. Ve a https://developers.facebook.com/apps/ y pulsa **Create App**.
2. Tipo de app: **Business** (no "Consumer", no "Gaming").
3. Nombre de la app: `DivinAds` (o el que prefieras). Email de contacto: el del administrador.
4. Business Account: asocia la app al Business Manager desde el que operarás.

Al final tendrás:

- **App ID** (público) → va en `.env` como `FB_APP_ID`
- **App Secret** (privado, NUNCA lo expongas al frontend) → `.env` como `FB_APP_SECRET`

Settings → Basic → añade:
- App Domains: `localhost` (dev) + tu dominio de prod
- Privacy Policy URL, Terms of Service URL, Icon 1024x1024 (requeridos por App Review)
- Category: `Business and Pages`

---

## 2. Activar productos en la app

En el panel izquierdo, **Add Product** y activa los tres:

### 2.1 Facebook Login for Business
Settings → Valid OAuth Redirect URIs. Añade **exactamente**:

```
http://localhost:8080/api/oauth/callback
```

Y tu URL de producción cuando la tengas. Guarda.

En la misma sección, activa:
- ✅ Client OAuth Login
- ✅ Web OAuth Login
- ❌ Force Web OAuth Reauthentication (opcional, solo si quieres forzar re-login)
- ❌ Embedded Browser OAuth Login
- Login with the JavaScript SDK: **OFF** (no lo usamos)

### 2.2 Marketing API
Add Product → Marketing API → Set Up. Sin configuración adicional en este paso.

### 2.3 Business Management API
Se activa implícitamente al pedir el permiso `business_management`. Verifica que
aparezca en **App Review → Permissions and Features**.

---

## 3. Permisos a solicitar (Scopes)

Meta exige justificar cada permiso en App Review. Estos son los mínimos para que
DivinAds funcione:

| Permiso                     | Por qué lo necesitamos                                           |
|-----------------------------|------------------------------------------------------------------|
| `public_profile`            | Mostrar nombre/avatar del usuario conectado (automático).        |
| `email`                     | Identificar cuentas entre sesiones.                              |
| `ads_management`            | Crear/editar/pausar campañas, ad sets y ads.                     |
| `ads_read`                  | Leer datos de campañas, insights, métricas.                      |
| `business_management`       | Listar Business Managers, owned/client ad accounts y pages.      |
| `pages_show_list`           | Listar las páginas que administra el usuario.                    |
| `pages_read_engagement`     | Leer insights, posts, métricas de páginas.                       |
| `pages_manage_metadata`     | Editar datos básicos de la página (si el UI lo hace).            |
| `read_insights`             | Leer insights a nivel de página / ad account.                    |

**No pedir** `pages_manage_ads`, `pages_manage_posts`, `instagram_basic`, etc. salvo
que el UI lo use — Meta rechaza permisos no justificados.

---

## 4. Modos de la app

Meta separa la app en dos modos:

### Development Mode (por defecto)
- Solo los **admins / developers / testers** de la app pueden otorgar permisos.
- Perfecto para desarrollar y probar.
- Añade tus usuarios de prueba en **Roles → Roles → Add Testers**.
- No requiere App Review para estos usuarios.

### Live Mode
- Cualquier usuario de Facebook puede conectarse.
- **Requiere App Review aprobada para cada permiso avanzado** (`ads_management`,
  `business_management`, etc.).

Flujo recomendado:
1. Desarrolla en Development Mode con usuarios de prueba.
2. Cuando funcione end-to-end, envía a App Review.
3. Al aprobar, pasa a Live.

---

## 5. App Review

Para cada permiso avanzado tienes que enviar:

1. **Screencast en video** mostrando el flujo end-to-end desde la perspectiva de
   un usuario real: conecta → concede permiso → usa la funcionalidad que requiere
   ese permiso.
2. **Justificación escrita** (en inglés): qué hace DivinAds, por qué necesita
   ese permiso específico, qué pasa si no lo tiene.
3. **Instrucciones de testeo**: credenciales de usuario de prueba, URL donde
   Meta puede probar, pasos exactos.
4. **Platform requirements**:
   - Data Use Checkup anual completado
   - Data Protection Assessment si manejas datos de muchos usuarios
   - Business Verification si pides permisos de negocio (`business_management`)

App Review suele tardar **3–10 días hábiles** por envío. Prepara todo bien a la
primera — los rechazos duelen.

---

## 6. Business Verification

Obligatorio para `business_management` y `ads_management` en Live Mode.

Settings → Business Verification. Necesitarás:
- Documento legal de la empresa (escritura, RUC/NIT/CIF)
- Factura de servicios pública a nombre de la empresa
- Dirección registrada y teléfono

Puede tardar **1–4 semanas**. Arranca esto en paralelo al desarrollo.

---

## 7. Rellenar `.env` local

Cuando tengas App ID y App Secret:

```bash
cp .env.example .env
```

Edita `.env` y completa:

```
FB_APP_ID=123456789012345
FB_APP_SECRET=abc123...
FB_REDIRECT_URI=http://localhost:8080/api/oauth/callback
OAUTH_STATE_SECRET=<genera con node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
TOKEN_ENCRYPTION_KEY=<genera otro random de 32 bytes>
```

---

## 8. Checklist antes de pedir App Review

- [ ] App creada en Meta for Developers tipo Business
- [ ] Facebook Login for Business + Marketing API productos activos
- [ ] Redirect URI de dev registrada
- [ ] Privacy Policy + Terms of Service publicadas en dominio accesible
- [ ] App Icon 1024x1024 subido
- [ ] Business Verification iniciada
- [ ] Usuarios de prueba añadidos en Roles
- [ ] `.env` local funcionando, conexión end-to-end probada en Development Mode
- [ ] Screencast grabado por cada permiso
- [ ] Justificación escrita por cada permiso (en inglés)
- [ ] Data Use Checkup completado

---

## 9. Recursos de referencia

- Graph API Reference: https://developers.facebook.com/docs/graph-api/reference
- Marketing API: https://developers.facebook.com/docs/marketing-apis
- Facebook Login for Business: https://developers.facebook.com/docs/facebook-login/facebook-login-for-business
- Access Tokens: https://developers.facebook.com/docs/facebook-login/guides/access-tokens
- Permissions Reference: https://developers.facebook.com/docs/permissions/reference
- Rate Limiting: https://developers.facebook.com/docs/graph-api/overview/rate-limiting

---

## 10. Qué NO hacer

- ❌ Poner `FB_APP_SECRET` en ningún archivo del frontend / extensión.
- ❌ Commitear `.env` al repo.
- ❌ Usar tokens de corta duración (2h) en el servidor — intercambiar siempre a long-lived (60 días).
- ❌ Pedir más permisos de los que usas. Meta rechaza App Review.
- ❌ Almacenar cookies de sesión de Facebook. No las necesitamos y son un riesgo legal.
