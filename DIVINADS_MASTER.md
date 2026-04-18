# DIVINADS — Documento Maestro 
**Versión de Plataforma:** 2.0 (Producción / Extensión + Servidor Proxy)
**Fecha:** 2026

---

## 1. ¿Qué es DivinAds?
DivinAds es una suite profesional de tipo "Agentic Marketing" diseñada para agilizar y administrar masivamente ecosistemas de Facebook Business. Es una herramienta poderosa para **Media Buyers, Agencias, y Gestores de Tráfico** que sufren con la arquitectura lenta e intrincada del Business Manager de Facebook nativo.

DivinAds consolida decenas de tableros de información (Ad Accounts, Páginas, Límites Diarios de Gasto, Calidad de Fanpages) en una única interfaz Glassmorphism ultarrápida. Adicionalmente, cuenta con Copilot IA (Claude / OpenAI) pre-instalado capaz de tomar acciones sobre el DOM y Graph API en favor del usuario.

## 2. Arquitectura de Modo Dual (Extensión Inteligente)
A diferencia de aplicaciones SaaS web tradicionales que sufren severos problemas de Cors y baneos al interactuar con Meta, **DivinAds es híbrida**.

### 🧩 Modo 1: Extensión Nativa del Navegador (La ideal)
DivinAds puede ser montada como una extensión (Unpacked) en Chrome o Edge.
- **Ventaja:** Corre nativamente dentro de la sesión de tu navegador. Nuestro `content.js` extrae el DTSG Token y la data en el fondo al visitar facebook.com de forma desapercibida, entregándosela a `background.js`. Cero riesgo de bloqueos.
- **Acceso:** Al dar clic en el ícono de DivinAds en tu barra de extensiones, te abre automáticamente una nueva pestaña con tu Dashbard Web, local y totalmente conectado.

### 💻 Modo 2: Servidor Node Local App (Para demostraciones / Sandbox)
Puede ser lanzado vía servidor proxy local para evitar tener que instalar extensiones.
- **Comando:** `npm start`
- **Proxy Node HTTP:** Accedes en `http://localhost:8080`.
- Desde aquí, el servidor usa `fetchFacebook` para realizar puentes de autenticación. Debes suministrarle tu Cookie de FB de tu otra pestaña. Node procesará redirecciones (301, 302, 307) para suplantar la Graph API limpiamente.
- **Seguridad:** Ninguna Cookie se transfiere a un servidor tercero fuera de tu equipo, ni a bases de datos de terceros. Todo se cifra en tu propia red.

---

## 3. Guía de Módulos Centrales

### 🏠 Dashboard Principal (Inicio)
Consolidador holístico (`index.html`). Muestra métricas vitales: Total de BMs (Business Managers), cuentas de AdAds (activas, bloqueadas, appeals), número de Fanpages, y riesgos de compliance. 

### 🧬 Clonner (Clonación de Anuncios)
Permite extraer identificadores (Ad IDs, Campaign IDs) y con un solo clic generar réplicas configuradas automáticamente para pruebas A/B de Copy, creatividades y Audiencias segmentadas rápidamente en Graph API.

### 📊 ADS (Gestor de Cuentas de Anuncios)
Módulo enfocado en AdAccounts (`ads.html`). Reúne información monetaria crítica sin tener que navegar pestaña por pestaña en Fb:
- *Remaining Limit, Daily Spend Limit, Current Balance (Billing).*
- Acceso a Tarjetas Vinculadas ocultas y métodos de pago de riesgo.

### 💼 BM (Business Manager Hub)
Ficha donde controlas tus entidades legales en Meta (`bm.html`). Administra invitaciones, revisiones pendientes, verifica status legal e identifica "hidden admins" (administradores invisibles bloqueantes) en un BM que podrían traer sanciones preventivas.

### 📄 Pages (Páginas Creadas y Compradas)
Rastreador (`page.html`). Verifica rápidamente el "Feedback Score", la calidad (Verde/Amarilla/Roja), penalizaciones activas de visibilidad, links rotos de la página de Facebook principal y cuentas de Instagram enlazadas.

### 🤖 Claude Copilot IA Integrado
Ubicado como barra lateral retractil. Actúa bajo el patrón de **Agentic UI**. Tiene conocimiento del árbol del DOM y puede leer el contenido del panel que el usuario tiene abierto. Mediante Webhooks y API local, puedes decirle "*Claude, analiza mis Ads activos y dime cual tiene problemas de facturación*" y este usará la capa de DivinAds y la Graph API para ejecutar todo.

---

## 4. Instalación de Modos Híbridos

### Paso A) Despliegue como Extensión Chrome/Edge
1. Abre tu navegador basado en Chromium. Ingresa `chrome://extensions/`.
2. Activa el modo **"Desarrollador"** en la esquina superior derecha.
3. Haz clic en el botón **"Cargar sin empaquetar"** (Load Unpacked).
4. Selecciona la carpeta precisa de este proyecto (aquella que contiene el archivo `manifest.json`).
5. Se agregará un Ícono en tu barra de herramientas. Fija el icono.
6. Da clic en él para lanzar todo el sistema libremente.

### Paso B) Deploy local para testing API / Proxying
1. Abre tu terminal en la ruta principal del proyecto local.
2. Asegúrate de tener los paquetes instalados: `npm install express cors axios form-data`.
3. Corre el comando principal de inicio: `npm start`.
4. El servidor Node.js comenzará a levantar procesos en `localhost:8080`.
5. Si falta autenticación mandatoria, serás redirigido a la ficha `/fb-connect.html`.
6. En FB, Copia por consola las Cookies y añadelas para el Proxy local.

**(Fin de Documento de Componentes Core)**
