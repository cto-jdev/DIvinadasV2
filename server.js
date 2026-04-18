/**
 * server.js — DivinAds (OAuth2 + Marketing API)
 * =============================================
 * Servidor Node.js que:
 *   - Sirve el dashboard estático (HTML + assets)
 *   - Maneja el flujo OAuth2 de Facebook Login for Business
 *   - Proxy seguro a Graph API / Marketing API (tokens server-side)
 *
 * Arranque:   npm start
 * Dev:        npm run dev
 * Tests:      npm test
 *
 * Requiere .env con:
 *   FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI,
 *   OAUTH_STATE_SECRET, TOKEN_ENCRYPTION_KEY
 * Opcional:   CORS_ORIGIN (whitelist en prod, default: localhost)
 *             NODE_ENV=production   (activa hardening completo)
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const oauth = require('./server/oauth');

const app = express();
const PORT = process.env.PORT || 8080;
const IS_PROD = process.env.NODE_ENV === 'production';

// Express confía en X-Forwarded-For cuando hay un proxy (nginx, Heroku, etc.)
// Necesario para que express-rate-limit use la IP real del cliente.
app.set('trust proxy', 1);

// ─── Seguridad: Helmet ────────────────────────────────────────
// Headers HTTP hardening (HSTS, X-Content-Type-Options, frameguard, etc.)
// CSP ajustada para permitir los CDN que usa el dashboard (bootstrap, chart, jQuery)
// y conexiones al mismo host + Meta.
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            'default-src': ["'self'"],
            // El dashboard incluye libs locales + estilos inline de Bootstrap
            'script-src':  ["'self'", "'unsafe-inline'"],
            'style-src':   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
            'font-src':    ["'self'", 'https://fonts.gstatic.com', 'data:'],
            'img-src':     ["'self'", 'data:', 'https:'],
            // Permitimos llamadas a nuestra propia API y a graph.facebook.com
            'connect-src': ["'self'", 'https://graph.facebook.com'],
            'frame-src':   ["'self'", 'https://www.facebook.com']
        }
    },
    // HSTS solo en producción (en dev localhost no tiene HTTPS)
    hsts: IS_PROD ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    // Permite que el popup OAuth de Facebook se comunique con nosotros
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' }
}));

// ─── CORS ─────────────────────────────────────────────────────
// En prod, exige CORS_ORIGIN explícito. En dev, acepta localhost.
const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : (IS_PROD ? false : true); // dev: refleja origen; prod: cerrado si no hay whitelist

app.use(cors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'X-DivinAds-Uid']
}));

// ─── Body parsers ─────────────────────────────────────────────
// Limite reducido a 100kb: nuestra API solo recibe queries/JSON pequeños.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ─── Rate limiters ────────────────────────────────────────────
// OAuth endpoints: más estrictos (inicio/callback son sensibles a abuso).
const oauthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 min
    max: 30,                    // 30 req por IP por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes OAuth. Intenta de nuevo en unos minutos.' }
});

// API general: límite más alto pero igual protege contra scraping.
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,        // 1 min
    max: 120,                   // 120 req por IP por minuto
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Rate limit excedido. Reduce la frecuencia de llamadas.' }
});

// ─── Bloqueo de archivos sensibles (antes del static) ─────────
// express.static(__dirname) expondría TODO el root. Filtramos primero.
const BLOCKED = /(^\/?|\/)(\.env|\.git|server\/|test\/|node_modules\/|tokens\.json|sessions\.json|package(-lock)?\.json|\.claude\/|memory\/|MIGRATION\.md|SETUP\.md)/i;
app.use((req, res, next) => {
    if (BLOCKED.test(req.path)) {
        return res.status(404).end();
    }
    next();
});

// ─── Static assets (HTML + css + js + img + fonts) ────────────
app.use(express.static(__dirname, {
    index: false,
    dotfiles: 'deny',            // bloquea cualquier .archivo aunque escape el regex
    extensions: ['html']
}));

// ─── Páginas HTML whitelisted ─────────────────────────────────
const pages = [
    'index', 'connect', 'dashboard', 'bm', 'ads', 'page',
    'pixel', 'advantage', 'attribution'
];
pages.forEach(p => {
    app.get(`/${p}.html`, (req, res) => {
        res.sendFile(path.join(__dirname, `${p}.html`));
    });
});
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// ─── Health check (sin rate limit, público) ───────────────────
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        version: require('./package.json').version,
        api: process.env.FB_API_VERSION || 'v20.0',
        env: IS_PROD ? 'production' : 'development',
        configured: !!(process.env.FB_APP_ID && process.env.FB_APP_SECRET)
    });
});

// ─── Rutas OAuth (rate-limited) ───────────────────────────────
app.get('/api/oauth/start',     oauthLimiter, oauth.start);
app.get('/api/oauth/callback',  oauthLimiter, oauth.callback);
app.get('/api/me',              apiLimiter,   oauth.me);
app.post('/api/disconnect/:uid', apiLimiter,   oauth.disconnect);
app.post('/api/refresh/:uid',    apiLimiter,   oauth.refresh);

// ─── Rutas Graph API (rate-limited) ───────────────────────────
app.use('/api/bm',       apiLimiter, require('./server/routes/bm'));
app.use('/api/ads',      apiLimiter, require('./server/routes/ads'));
app.use('/api/pages',    apiLimiter, require('./server/routes/pages'));
app.use('/api/pixel',    apiLimiter, require('./server/routes/pixel'));
app.use('/api/insights', apiLimiter, require('./server/routes/insights'));

// ─── Error handler (genérico en prod, detallado en dev) ───────
app.use((err, req, res, _next) => {
    // Log completo server-side siempre
    console.error('[server] unhandled:', err.stack || err.message);

    const status = err.status || 500;
    const payload = IS_PROD
        ? { error: status >= 500 ? 'Internal server error' : err.message }
        : { error: err.message, code: err.code, fbtrace_id: err.fbtrace_id };

    res.status(status).json(payload);
});

// ─── 404 catch-all ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: 'Not found', path: req.path });
});

// ─── Arranque (solo si se ejecuta directo, no en tests) ───────
if (require.main === module) {
    app.listen(PORT, () => {
        console.log('═══════════════════════════════════════════════════════');
        console.log(`  DivinAds OAuth server — escuchando en :${PORT}`);
        console.log(`  Entorno:    ${IS_PROD ? 'PRODUCTION' : 'development'}`);
        console.log(`  Graph API:  ${process.env.FB_API_VERSION || 'v20.0'}`);
        console.log(`  App ID:     ${process.env.FB_APP_ID ? '✓ configurado' : '✗ FALTA (revisa .env)'}`);
        console.log(`  App Secret: ${process.env.FB_APP_SECRET ? '✓ configurado' : '✗ FALTA'}`);
        console.log(`  Redirect:   ${process.env.FB_REDIRECT_URI || '(no configurado)'}`);
        console.log(`  CORS:       ${IS_PROD ? (process.env.CORS_ORIGIN || 'CLOSED (falta CORS_ORIGIN)') : 'dev (open)'}`);
        console.log('═══════════════════════════════════════════════════════');
        if (!process.env.FB_APP_ID || !process.env.FB_APP_SECRET) {
            console.warn('⚠️  Falta configuración OAuth. Revisa SETUP.md y .env.example');
        }
        if (IS_PROD && !process.env.CORS_ORIGIN) {
            console.warn('⚠️  NODE_ENV=production pero CORS_ORIGIN vacío → CORS cerrado');
        }
    });
}

module.exports = app;
