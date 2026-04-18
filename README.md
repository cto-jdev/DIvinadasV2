# DivinAds — Guía de Instalación y Uso

**DivinAds** es una herramienta profesional de escritorio para gestionar tu cuenta de Facebook Business Manager, Anuncios y Páginas de forma eficiente, con inteligencia artificial integrada.

---

## ¿Qué necesitas para usarlo?

| Requisito | Detalle |
|-----------|---------|
| Sistema operativo | Windows 10 / 11 |
| Node.js | Versión 18 o superior |
| Navegador | Google Chrome o Microsoft Edge |
| Cuenta Facebook | Con acceso a Business Manager |

---

## Instalación (solo la primera vez)

### Paso 1 — Instalar Node.js

1. Ve a [https://nodejs.org](https://nodejs.org)
2. Descarga la versión **LTS** (botón verde grande)
3. Instala normalmente, deja todas las opciones por defecto
4. Al terminar, reinicia tu computador

### Paso 2 — Instalar dependencias de DivinAds

1. Abre la carpeta **app** de DivinAds
2. Haz clic en la barra de dirección del explorador y escribe `cmd`, presiona Enter
3. En la ventana negra que se abre, escribe:
   ```
   npm install
   ```
4. Espera a que termine (verás un mensaje de éxito)

---

## Cómo iniciar DivinAds

### Cada vez que quieras usar la aplicación:

1. Abre la carpeta **app** de DivinAds
2. Haz clic en la barra de dirección y escribe `cmd`
3. Escribe el siguiente comando y presiona Enter:
   ```
   npm start
   ```
4. Verás un mensaje como este:
   ```
   🚀 DIVINADS SERVER — CONEXIÓN REAL A META
   📍 URL: http://localhost:8080
   ```
5. **No cierres esa ventana negra** — es el motor de DivinAds

### Abrir la aplicación en tu navegador

Una vez iniciado el servidor, abre tu navegador (Chrome o Edge) y ve a:

```
http://localhost:8080
```

---

## Conectar tu cuenta de Facebook

> ⚠️ **Importante:** Debes tener sesión iniciada en Facebook en el mismo navegador.

### Paso 1 — Ve a la pantalla de conexión

En tu navegador, abre:
```
http://localhost:8080/fb-connect.html
```

### Paso 2 — Obtén tu cookie de Facebook

1. Abre **[facebook.com](https://facebook.com)** en una nueva pestaña (asegúrate de estar conectado)
2. Presiona **F12** en el teclado — se abrirán las Herramientas de Desarrollo
3. Haz clic en la pestaña **Aplicación** (o "Application" si está en inglés)
4. En el panel izquierdo, busca y haz clic en: **Almacenamiento → Cookies → https://www.facebook.com**
5. Busca estos valores en la lista:

| Cookie | Qué buscar |
|--------|------------|
| `c_user` | Tu ID de usuario de Facebook |
| `xs` | Token de sesión |
| `datr` | Identificador del dispositivo |
| `fr` | Token de seguimiento |

6. Copia el **Valor** de cada una y arma el texto así:
   ```
   c_user=1234567890; xs=AbCdEf:GhIjKl; datr=XXXXXXXX; fr=YYYYYYYY
   ```

### Paso 3 — Pega y conecta

1. Pega el texto en el campo **"Cookie de Sesión de Facebook"**
2. Haz clic en **"Conectar con Facebook"**
3. Verás el mensaje: ✅ **Conectado — [Tu nombre]**
4. La aplicación te llevará automáticamente al panel principal

---

## Módulos disponibles

| Módulo | URL | Descripción |
|--------|-----|-------------|
| **Inicio** | `/index.html` | Panel principal con resumen |
| **BM** | `/bm.html` | Gestión de Business Managers |
| **Ads** | `/ads.html` | Gestión de Cuentas de Anuncios |
| **Páginas** | `/page.html` | Gestión de Páginas de Facebook |
| **Clonar** | `/clone.html` | Herramienta de clonación |
| **Configuración** | `/setting.html` | Ajustes generales |
| **Conectar FB** | `/fb-connect.html` | Conectar cuenta de Facebook |

---

## Uso básico — Panel de BM (Business Manager)

1. Ve a `http://localhost:8080/bm.html`
2. La tabla carga automáticamente tus Business Managers
3. Selecciona filas haciendo clic en ellas
4. Usa los controles del panel derecho para:
   - Compartir con BM socio
   - Obtener ID BM
   - Crear Píxeles
   - Gestionar administradores

---

## Uso básico — Panel de Anuncios

1. Ve a `http://localhost:8080/ads.html`
2. Verás tus cuentas publicitarias (activas, deshabilitadas, etc.)
3. Selecciona cuentas y usa el panel derecho para:
   - Agregar tarjetas
   - Compartir BM
   - Cambiar nombre / información

---

## Copilot de IA (Claude AI)

El panel lateral derecho en cada módulo tiene un **asistente de IA** que puede:
- Analizar el estado de tus cuentas
- Sugerir acciones correctivas
- Responder preguntas sobre la gestión de BM

**Para activarlo con IA real:**
1. Crea un archivo `.env` en la carpeta `app`
2. Agrega tu clave de API de Anthropic:
   ```
   CLAUDE_API_KEY=sk-ant-tu-clave-aqui
   ```
3. Reinicia el servidor (`Ctrl+C` y luego `npm start`)

> Sin clave API, el Copilot funciona en modo demo con respuestas pre-configuradas.

---

## Solución de problemas frecuentes

### El servidor no inicia / "Puerto en uso"
```
Ctrl+C  (para detener el proceso anterior)
npm start
```
Si sigue fallando, reinicia el computador.

### La aplicación no carga mis datos reales
1. Verifica que el servidor esté corriendo (ventana negra abierta)
2. Ve a `http://localhost:8080/fb-connect.html`
3. Verifica que el estado diga "✅ Conectado"
4. Si dice "Sin sesión", vuelve a conectar tu cookie de Facebook

### La cookie de Facebook expiró
Las cookies de Facebook expiran cada cierto tiempo. Si los datos dejan de cargar:
1. Ve a `http://localhost:8080/fb-connect.html`
2. Repite el proceso de obtener y pegar la cookie
3. Haz clic en "Conectar"

### El navegador dice "No se puede acceder"
Asegúrate de que `npm start` esté corriendo y dirígete a:
```
http://localhost:8080
```
> **Nota:** No uses `https://`, solo `http://` con `localhost`.

---

## Detener DivinAds

Cuando termines de usar la aplicación:
1. Ve a la ventana negra del servidor
2. Presiona **Ctrl + C**
3. Confirma con **S** si te lo pide

---

## Notas de seguridad

- 🔒 Tu cookie de Facebook **nunca sale de tu computador** — se procesa solo en tu servidor local
- 🔒 No compartas la carpeta de DivinAds en red sin antes revisar la configuración de seguridad
- 🔒 La cookie es equivalente a tu contraseña — no la compartas con nadie

---

## Soporte

¿Problemas? Contacta al equipo de DivinAds:
- 💬 WhatsApp: [Enlace de soporte](https://chat.whatsapp.com/HsKE3vczj7E1Y6gGcBqVkT)

---

*DivinAds v2.0 — Gestión Profesional de Facebook Business Manager*
