# apps/extension — DivinAds Chrome Extension MV3

Extensión Chrome Manifest V3 — cliente delgado.
Sin secretos, sin tokens Meta, sin lógica de negocio crítica.
Todas las operaciones pasan por el backend en `app.divinads.com`.

## Desarrollo

```bash
# Generar iconos (solo primera vez):
node scripts/gen-icons.js

# Build de desarrollo (API local o staging):
DIVINADS_API_BASE=https://tu-preview.vercel.app node scripts/build.js

# Cargar en Chrome:
# chrome://extensions → Activar "Modo desarrollador" → "Cargar descomprimida" → dist/
```

## Build de producción

```bash
DIVINADS_API_BASE=https://app.divinads.com node scripts/build.js
node scripts/zip.js
# Genera: divinads-extension-v2.0.0.zip
```

## Estructura

```
apps/extension/
├── background.js      # Service Worker: sesión, apiFetch, heartbeat, alarmas
├── popup.html/js      # UI: pairing + estado conectado
├── options.html/js    # UI: info sesión + revocar
├── manifest.json      # MV3: permisos mínimos
├── icons/             # PNGs 16/48/128px (generados por gen-icons.js)
└── scripts/
    ├── build.js       # Inyecta API_BASE → dist/
    ├── gen-icons.js   # Genera PNGs sin dependencias
    └── zip.js         # Empaqueta dist/ para Web Store
```

## Flujo de pairing

1. Usuario abre `/panel/extension?tenant=<id>` en el panel web
2. Clic en "Generar código" → código 6 dígitos (TTL 5 min)
3. Abre popup de la extensión → ingresa código → "Conectar"
4. `background.js` llama `POST /api/extension/pair/redeem`
5. Backend valida código, crea `extension_installs`, emite JWT 90 días
6. JWT se guarda en `chrome.storage.local` como `session.token`
7. Heartbeat cada 30 min verifica que la sesión sigue activa

## Seguridad

- `chrome.storage.local` contiene solo el JWT opaco (no tokens Meta, no secretos)
- `host_permissions`: solo `https://app.divinads.com/*`
- CSP: `connect-src https://app.divinads.com`
- Sin `unsafe-inline`, sin `eval`
