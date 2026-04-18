/**
 * server.js — DivinAds Local Server
 * ====================================
 * Servidor Express con proxy real a Facebook API.
 * Permite conexiones reales a Meta Graph API/Business Manager
 * usando las cookies de sesión del usuario.
 */

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const https   = require('https');
const http    = require('http');
const fs      = require('fs');
const zlib    = require('zlib');
const { URL } = require('url');

const app  = express();
const PORT = process.env.PORT || 8080;

// ─── Almacén de sesiones de Facebook (persistido en sesiones.json) ───
// Clave: uid del usuario, Valor: { cookie, uid, dtsg, accessToken, ... }
const fbSessions = new Map();
const SESSIONS_PATH = path.join(__dirname, 'sessions.json');

// Cargar sesiones previas al iniciar (superviven reinicios del servidor)
(function loadPersistedSessions() {
    try {
        if (fs.existsSync(SESSIONS_PATH)) {
            const raw = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf8'));
            for (const [uid, session] of Object.entries(raw)) {
                fbSessions.set(uid, session);
            }
            console.log(`📦 [Sessions] ${fbSessions.size} sesión(es) cargadas desde disco.`);
        }
    } catch (e) {
        console.warn('[Sessions] No se pudieron cargar sesiones previas:', e.message);
    }
})();

function persistSessions() {
    try {
        const data = {};
        for (const [uid, session] of fbSessions.entries()) {
            data[uid] = session;
        }
        fs.writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2));
    } catch (e) {
        console.warn('[Sessions] Error guardando sesiones en disco:', e.message);
    }
}

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// ─── Rutas de páginas ─────────────────────────────────────────
const pages = ['bm', 'ads', 'page', 'setting', 'phoi', 'clone',
               'viewBm', 'viewAds', 'viewPage', 'pixel', 'advantage', 'attribution', 'fb-connect'];
pages.forEach(p => {
    app.get(`/${p}.html`, (req, res) => res.sendFile(path.join(__dirname, `${p}.html`)));
});
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ─────────────────────────────────────────────────────────────
// FUNCIÓN CORE: Proxy Fetch real a Facebook
// Realiza peticiones HTTP reales con SEGUIMIENTO DE REDIRECTS
// Facebook siempre redirige (302) las URLs iniciales
// ─────────────────────────────────────────────────────────────
function fetchFacebook(targetUrl, options = {}, cookieStr = '', maxRedirects = 5) {
    return new Promise(async (resolve, reject) => {
        let currentUrl = targetUrl;
        let redirectCount = 0;

        while (redirectCount <= maxRedirects) {
            try {
                const result = await _singleFetch(currentUrl, options, cookieStr);

                // ¿Es un redirect?
                if ([301, 302, 303, 307, 308].includes(result.status) && result.headers?.location) {
                    redirectCount++;
                    const location = result.headers.location;
                    // Resolver URL relativa
                    currentUrl = location.startsWith('http')
                        ? location
                        : new URL(location, currentUrl).toString();
                    console.log(`  ↪ [Redirect ${redirectCount}/${maxRedirects}] → ${currentUrl.substring(0, 100)}...`);

                    // 303 cambia método a GET
                    if (result.status === 303) {
                        options = { ...options, method: 'GET', body: undefined };
                    }
                    continue;
                }

                // No es redirect — devolver resultado
                resolve(result);
                return;

            } catch (err) {
                reject(err);
                return;
            }
        }
        reject(new Error(`Demasiados redirects (${maxRedirects}) para: ${targetUrl}`));
    });
}

function _singleFetch(targetUrl, options = {}, cookieStr = '') {
    return new Promise((resolve, reject) => {
        try {
            const parsedUrl = new URL(targetUrl);
            const httpModule = parsedUrl.protocol === 'https:' ? https : http;

            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/json,*/*;q=0.9',
                'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                'Cache-Control': 'no-cache',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Upgrade-Insecure-Requests': '1',
            };

            if (cookieStr) headers['Cookie'] = cookieStr;
            if (options.headers) Object.assign(headers, options.headers);

            const bodyData = options.body ? Buffer.from(options.body, 'utf8') : null;
            if (bodyData) {
                headers['Content-Length'] = bodyData.length;
                if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }

            const reqOpts = {
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname + parsedUrl.search,
                method: (options.method || 'GET').toUpperCase(),
                headers,
                rejectUnauthorized: false,
                timeout: 30000
            };

            const fbReq = httpModule.request(reqOpts, (fbRes) => {
                // Para redirects, no descomprimir el body — solo devolver headers
                if ([301, 302, 303, 307, 308].includes(fbRes.statusCode)) {
                    // Consumir el stream para evitar memory leak
                    fbRes.resume();
                    resolve({
                        status: fbRes.statusCode,
                        ok: false,
                        url: targetUrl,
                        text: '',
                        json: null,
                        headers: fbRes.headers
                    });
                    return;
                }

                const encoding = fbRes.headers['content-encoding'];
                let stream = fbRes;
                if (encoding === 'gzip')         stream = fbRes.pipe(zlib.createGunzip());
                else if (encoding === 'deflate') stream = fbRes.pipe(zlib.createInflate());
                else if (encoding === 'br')      stream = fbRes.pipe(zlib.createBrotliDecompress());

                const chunks = [];
                stream.on('data', c => chunks.push(c));
                stream.on('end', () => {
                    const text = Buffer.concat(chunks).toString('utf8');
                    let jsonData = null;
                    try {
                        const clean = text.replace(/^for\s*\(;;\);/, '').trim();
                        jsonData = JSON.parse(clean);
                    } catch { /* not JSON */ }

                    resolve({
                        status: fbRes.statusCode,
                        ok: fbRes.statusCode >= 200 && fbRes.statusCode < 400,
                        url: targetUrl,
                        text,
                        json: jsonData,
                        headers: fbRes.headers
                    });
                });
                stream.on('error', reject);
            });

            fbReq.on('error', reject);
            fbReq.on('timeout', () => { fbReq.destroy(); reject(new Error('Timeout')); });
            if (bodyData) fbReq.write(bodyData);
            fbReq.end();

        } catch (err) {
            reject(err);
        }
    });
}


// ─────────────────────────────────────────────────────────────
// POST /api/fb-session — Guardar cookie de Facebook del usuario
// Body: { cookie: "c_user=...; xs=...; ..." }
// La cookie se obtiene de: F12 → Application → Cookies → facebook.com
// ─────────────────────────────────────────────────────────────
app.post('/api/fb-session', async (req, res) => {
    const { cookie } = req.body;
    if (!cookie || typeof cookie !== 'string' || !cookie.includes('c_user=')) {
        return res.status(400).json({
            error: 'Cookie de Facebook requerida. Incluye al menos c_user= en la cookie.',
            instructions: 'Ve a facebook.com → F12 → Aplicación → Cookies → facebook.com → copia todas las cookies'
        });
    }

    try {
        const uidMatch = cookie.match(/c_user=(\d+)/);
        if (!uidMatch) return res.status(400).json({ error: 'Cookie inválida: falta c_user' });
        const uid = uidMatch[1];

        console.log(`🔑 [FB Session] Iniciando sesión para uid: ${uid}...`);

        // Obtener dtsg y accessToken reales
        let dtsg = '';
        let accessToken = '';
        let userName = '';

        // Helper: intentar múltiples regex patterns para buscar un valor en HTML
        function extractFromHtml(text, patterns) {
            for (const p of patterns) {
                const m = text.match(p);
                if (m && m[1]) return m[1];
            }
            return '';
        }

        const DTSG_PATTERNS = [
            /\["DTSGInitData",\[\],\{"token":"([^"]+)"/,
            /"DTSGInitialData"[^}]*"token"\s*:\s*"([^"]+)"/,
            /{"name":"fb_dtsg","value":"([^"]+)"/,
            /fb_dtsg['"]\s*(?:value|content)\s*=\s*['"]([^'"]+)['"]/,
            /"dtsg":\{"token":"([^"]+)"/,
            /name="fb_dtsg"\s+value="([^"]+)"/,
        ];
        const TOKEN_PATTERNS = [
            /"accessToken"\s*:\s*"(EAA[^"]+)"/,
            /window\.__accessToken\s*=\s*"([^"]+)"/,
            /"access_token"\s*:\s*"(EAA[^"]+)"/,
        ];
        const NAME_PATTERNS = [
            /"NAME"\s*:\s*"([^"]+)"/,
            /"user":\{[^}]*"name":"([^"]+)"/,
            /"shortName"\s*:\s*"([^"]+)"/,
        ];

        // ── 1. FUENTE PRINCIPAL: www.facebook.com/ (siempre más confiable)
        console.log('  📡 [1/3] Obteniendo datos de www.facebook.com/...');
        try {
            const mainRes = await fetchFacebook('https://www.facebook.com/', { method: 'GET' }, cookie);
            if (mainRes.text && mainRes.text.length > 1000) {
                console.log(`  ✓ Facebook respondió con ${mainRes.text.length} bytes (status: ${mainRes.status})`);
                dtsg = extractFromHtml(mainRes.text, DTSG_PATTERNS);
                userName = extractFromHtml(mainRes.text, NAME_PATTERNS);
                if (dtsg) console.log(`  ✓ dtsg extraído: ${dtsg.substring(0, 20)}...`);
                if (userName) console.log(`  ✓ userName: ${userName}`);
            } else {
                console.warn(`  ⚠ Facebook respondió con muy poco contenido (${mainRes.text?.length || 0} bytes, status: ${mainRes.status})`);
            }
        } catch (e) {
            console.warn('  ⚠ www.facebook.com falló:', e.message);
        }

        // ── 2. FUENTE SECUNDARIA: business.facebook.com (para accessToken)
        if (!accessToken) {
            console.log('  📡 [2/3] Intentando business.facebook.com/...');
            try {
                const bizRes = await fetchFacebook(
                    'https://business.facebook.com/content_management/',
                    { method: 'GET' }, cookie
                );
                if (bizRes.text && bizRes.text.length > 1000) {
                    console.log(`  ✓ Business FB respondió con ${bizRes.text.length} bytes`);
                    if (!dtsg)  dtsg = extractFromHtml(bizRes.text, DTSG_PATTERNS);
                    accessToken = extractFromHtml(bizRes.text, TOKEN_PATTERNS);
                    if (!userName) userName = extractFromHtml(bizRes.text, NAME_PATTERNS);
                    if (accessToken) console.log(`  ✓ accessToken: ${accessToken.substring(0, 20)}...`);
                }
            } catch (e) {
                console.warn('  ⚠ business.facebook.com falló:', e.message);
            }
        }

        // ── 3. FALLBACK: adsmanager (último recurso para accessToken)
        if (!accessToken) {
            console.log('  📡 [3/3] Intentando adsmanager.facebook.com/...');
            try {
                const amsRes = await fetchFacebook(
                    'https://adsmanager.facebook.com/adsmanager/manage/campaigns',
                    { method: 'GET' }, cookie
                );
                if (amsRes.text && amsRes.text.length > 1000) {
                    console.log(`  ✓ Adsmanager respondió con ${amsRes.text.length} bytes`);
                    if (!dtsg) dtsg = extractFromHtml(amsRes.text, DTSG_PATTERNS);
                    accessToken = extractFromHtml(amsRes.text, TOKEN_PATTERNS);
                    if (!userName) userName = extractFromHtml(amsRes.text, NAME_PATTERNS);
                }
            } catch (e) {
                console.warn('  ⚠ adsmanager falló:', e.message);
            }
        }

        const session = { cookie, uid, dtsg, accessToken, userName, createdAt: Date.now() };
        fbSessions.set(uid, session);
        persistSessions(); // 💾 Guardar en disco para sobrevivir reinicios

        console.log(`✅ [FB Session] uid:${uid} | user:${userName} | token:${accessToken ? 'OK' : 'NO'} | dtsg:${dtsg ? 'OK' : 'NO'}`);

        res.json({
            success: true,
            uid,
            userName: userName || 'Desconocido',
            hasAccessToken: !!accessToken,
            hasDtsg: !!dtsg,
            message: accessToken
                ? `✅ Sesión real de Facebook establecida para ${userName || uid}`
                : `⚠️ Cookie guardada para ${uid} pero no se pudo obtener accessToken. Asegúrate de estar logueado en Business Manager.`
        });

    } catch (err) {
        console.error('[FB Session]', err.message);
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/fb-session — Consultar sesiones activas
// ─────────────────────────────────────────────────────────────
app.get('/api/fb-session', (req, res) => {
    const uid = req.query.uid;
    if (uid) {
        const s = fbSessions.get(uid);
        return res.json(s ? {
            found: true, uid: s.uid, userName: s.userName,
            hasToken: !!s.accessToken, hasDtsg: !!s.dtsg
        } : { found: false });
    }
    const list = Array.from(fbSessions.values()).map(s => ({
        uid: s.uid, userName: s.userName,
        hasToken: !!s.accessToken,
        age: Math.round((Date.now() - s.createdAt) / 60000) + 'm'
    }));
    res.json({ sessions: list, total: list.length });
});

// ─────────────────────────────────────────────────────────────
// DELETE /api/fb-session — Cerrar sesión
// ─────────────────────────────────────────────────────────────
app.delete('/api/fb-session', (req, res) => {
    const { uid } = req.body;
    if (uid) {
        fbSessions.delete(uid);
        persistSessions();
        return res.json({ success: true });
    }
    fbSessions.clear();
    persistSessions();
    res.json({ success: true, message: 'Todas las sesiones cerradas' });
});

// ─────────────────────────────────────────────────────────────
// POST /api/fb-fetch — Proxy fetch real a Facebook
// Body: { uid?, url, options: { method, headers, body } }
// ─────────────────────────────────────────────────────────────
app.post('/api/fb-fetch', async (req, res) => {
    const { uid, url: targetUrl, options = {} } = req.body;

    if (!targetUrl) return res.status(400).json({ error: 'url requerida' });

    // Buscar sesión
    let session = null;
    if (uid) {
        session = fbSessions.get(String(uid));
    }
    if (!session && fbSessions.size > 0) {
        session = Array.from(fbSessions.values())[0]; // usar la única disponible
    }

    if (!session) {
        return res.status(401).json({
            error: 'SIN_SESION',
            message: 'No hay sesión de Facebook activa. Ve a Configuración y pega tu cookie de Facebook.',
            code: 'NO_FACEBOOK_SESSION'
        });
    }

    try {
        const result = await fetchFacebook(targetUrl, options, session.cookie);
        // Inyectar accessToken y dtsg en la respuesta para que el cliente los use
        result.fbSession = {
            uid: session.uid,
            accessToken: session.accessToken,
            dtsg: session.dtsg
        };
        res.json(result);
    } catch (err) {
        console.error('[FB Fetch]', err.message, '→', targetUrl.substring(0, 80));
        res.status(500).json({ error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/fb-me — Datos del usuario autenticado (Graph API real)
// ─────────────────────────────────────────────────────────────
app.get('/api/fb-me', async (req, res) => {
    const uid = req.query.uid;
    const session = uid ? fbSessions.get(uid) : Array.from(fbSessions.values())[0];

    if (!session) {
        return res.status(401).json({ error: 'Sin sesión activa' });
    }

    if (!session.accessToken) {
        return res.json({
            id: session.uid,
            name: session.userName || 'Usuario Facebook',
            sessionMode: 'cookie-only',
            warning: 'accessToken no disponible — funcionalidad limitada'
        });
    }

    try {
        const graphRes = await fetchFacebook(
            `https://graph.facebook.com/v22.0/me?fields=id,name,email,picture&access_token=${session.accessToken}`,
            { method: 'GET' },
            session.cookie
        );
        res.json(graphRes.json || { id: session.uid, name: session.userName });
    } catch (err) {
        res.json({ id: session.uid, name: session.userName, error: err.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/phoi — Generación de imagen (template editor)
// ─────────────────────────────────────────────────────────────
app.post('/phoi', (req, res) => {
    try {
        const template = req.body.template;
        if (template && template.src) {
            const base64Data = template.src.split(',')[1];
            res.send(base64Data);
        } else {
            res.send('ERROR');
        }
    } catch (e) {
        res.send('ERROR');
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/status — Estado del servidor
// ─────────────────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        message: 'DivinAds Dashboard Server operativo',
        port: PORT,
        timestamp: new Date().toISOString(),
        fbSessions: fbSessions.size,
        hasRealConnection: fbSessions.size > 0,
        mode: fbSessions.size > 0 ? 'REAL — Conectado a Facebook' : 'DEMO — Sin sesión real de Facebook'
    });
});

// ─────────────────────────────────────────────────────────────
// GET /api/templates — Plantillas desde data.json
// ─────────────────────────────────────────────────────────────
app.get('/api/templates', (req, res) => {
    try {
        const dataPath = path.join(__dirname, 'data.json');
        if (fs.existsSync(dataPath)) {
            const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
            res.json({ success: true, templates: data.templates || data || [] });
        } else {
            res.json({ success: true, templates: [] });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/ai — Proxy Claude AI Copilot
// ─────────────────────────────────────────────────────────────
app.post('/api/ai', async (req, res) => {
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '';
    const { message, context, page } = req.body;
    if (!message) return res.status(400).json({ error: 'message requerido' });

    if (!CLAUDE_API_KEY) {
        return res.json({ reply: generateLocalAIReply(message, page), mode: 'local' });
    }

    try {
        const systemPrompt = `Eres el Copilot de DivinAds, asistente experto en Facebook Business Manager, Meta Ads y Advantage+.
Módulo actual: "${page || 'dashboard'}". Responde en español, máximo 3 oraciones, con emojis.
Contexto: ${JSON.stringify(context || {})}`;

        const payload = JSON.stringify({
            model: 'claude-3-5-sonnet-20241022', // Modelo Claude estable y disponible
            max_tokens: 300,
            system: systemPrompt,
            messages: [{ role: 'user', content: message }]
        });

        const payloadBuf = Buffer.from(payload);
        const reqOpts = {
            hostname: 'api.anthropic.com',
            path: '/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01',
                'Content-Length': payloadBuf.length
            }
        };

        const apiReq = https.request(reqOpts, (apiRes) => {
            let data = '';
            apiRes.on('data', c => data += c);
            apiRes.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const reply = parsed?.content?.[0]?.text || 'Sin respuesta.';
                    res.json({ reply, mode: 'claude' });
                } catch {
                    res.json({ reply: generateLocalAIReply(message, page), mode: 'local-fallback' });
                }
            });
        });
        apiReq.on('error', () => res.json({ reply: generateLocalAIReply(message, page), mode: 'local-fallback' }));
        apiReq.write(payloadBuf);
        apiReq.end();
    } catch {
        res.json({ reply: generateLocalAIReply(message, page), mode: 'local-fallback' });
    }
});

function generateLocalAIReply(message, page) {
    const t = (message || '').toLowerCase();
    if (t.includes('ban') || t.includes('restringi')) return '🛡️ Para apelar restricciones Meta, documenta el cumplimiento con Policy 4.2. Puedo preparar el borrador de apelación.';
    if (t.includes('clonar')) return '🔄 Clonación lista. Las Custom Audiences no se copian por restricciones de privacidad Meta 2026.';
    if (t.includes('pixel') || t.includes('capi')) return '🎯 Verifica EMQ Score >7/10. Eventos Purchase y Lead deben tener cobertura CAPI >90%.';
    if (t.includes('campaña') || t.includes('advantage')) return '🤖 Advantage+ Automation Unification es el estándar 2026. Mínimo 50 conv/semana para salir de Learning.';
    if (t.includes('presupuesto')) return '💰 Asigna 70% a campañas con ROAS >3x histórico y 30% a prospecting sin restricciones de audiencia.';
    return '🤖 Copilot DivinAds listo. Puedo ayudarte con BM, Ads, Pixels/CAPI o atribución Meta 2026.';
}

// ─────────────────────────────────────────────────────────────
// API Configuración (persistencia en config.json)
// ─────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, 'config.json');
app.get('/api/config', (req, res) => {
    try {
        if (fs.existsSync(CONFIG_PATH)) {
            res.json({ success: true, config: JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')) });
        } else {
            res.json({ success: true, config: {} });
        }
    } catch { res.json({ success: true, config: {} }); }
});

app.post('/api/config', (req, res) => {
    try {
        let existing = {};
        if (fs.existsSync(CONFIG_PATH)) existing = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        const merged = { ...existing, ...req.body };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(merged, null, 2));
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ─────────────────────────────────────────────────────────────
// 404 handler (debe ser el último)
// ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
});


// ─────────────────────────────────────────────────────────────
// Inicio del servidor (con manejo de puerto ocupado)
// ─────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
    console.log(`
🚀 ========================================
   DIVINADS SERVER — CONEXIÓN REAL A META
==========================================
📍 URL: http://localhost:${PORT}
📋 BM:     http://localhost:${PORT}/bm.html
📊 Ads:    http://localhost:${PORT}/ads.html
📄 Páginas:http://localhost:${PORT}/page.html
🔗 Conectar Facebook: http://localhost:${PORT}/fb-connect.html
⚙️  Config: http://localhost:${PORT}/setting.html

🔑 PARA CONECTAR A FACEBOOK REAL:
   Abre: http://localhost:${PORT}/fb-connect.html
   Pega tu cookie de Facebook y presiona Conectar.
==========================================
`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        const fallback = Number(PORT) + 1;
        console.warn(`\n⚠️  Puerto ${PORT} en uso. Intentando puerto ${fallback}...`);
        server.close();
        app.listen(fallback, () => {
            console.log(`✅ Servidor corriendo en http://localhost:${fallback}`);
            console.log(`   (Puerto alternativo — el original ${PORT} estaba ocupado)`);
        });
    } else {
        console.error('❌ Error del servidor:', err.message);
        process.exit(1);
    }
});

process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Promesa rechazada:', reason?.message || reason);
});