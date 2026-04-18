/**
 * server.oauth.js
 * ===============
 * Entry point del servidor DivinAds basado en OAuth2 + Marketing API oficial.
 *
 * Durante la migración convive con `server.js` (scraping legacy).
 * Al finalizar la Etapa D del MIGRATION.md, este archivo se renombra a
 * `server.js` y el viejo se elimina.
 *
 * Arranque:   node server.oauth.js
 * Dev:        nodemon server.oauth.js
 *
 * Requiere:  .env con FB_APP_ID, FB_APP_SECRET, FB_REDIRECT_URI,
 *            OAUTH_STATE_SECRET, TOKEN_ENCRYPTION_KEY.
 */

'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const oauth = require('./server/oauth');

const app = express();
const PORT = process.env.PORT || 8080;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(__dirname));

// ─── Páginas HTML ─────────────────────────────────────────────
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

// ─── Rutas OAuth ──────────────────────────────────────────────
app.get('/api/oauth/start', oauth.start);
app.get('/api/oauth/callback', oauth.callback);
app.get('/api/me', oauth.me);
app.post('/api/disconnect/:uid', oauth.disconnect);
app.post('/api/refresh/:uid', oauth.refresh);

// ─── Rutas de Graph API ───────────────────────────────────────
app.use('/api/bm',        require('./server/routes/bm'));
app.use('/api/ads',       require('./server/routes/ads'));
app.use('/api/pages',     require('./server/routes/pages'));
app.use('/api/pixel',     require('./server/routes/pixel'));
app.use('/api/insights',  require('./server/routes/insights'));

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        version: require('./package.json').version,
        api: process.env.FB_API_VERSION || 'v20.0',
        configured: !!(process.env.FB_APP_ID && process.env.FB_APP_SECRET)
    });
});

// ─── Error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[server] unhandled:', err);
    res.status(500).json({
        error: err.message || 'Internal server error',
        code: err.code,
        fbtrace_id: err.fbtrace_id
    });
});

// ─── Arranque ─────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  DivinAds OAuth server — escuchando en :${PORT}`);
    console.log(`  Graph API: ${process.env.FB_API_VERSION || 'v20.0'}`);
    console.log(`  App ID:    ${process.env.FB_APP_ID ? '✓ configurado' : '✗ FALTA (revisa .env)'}`);
    console.log(`  App Secret:${process.env.FB_APP_SECRET ? ' ✓ configurado' : ' ✗ FALTA'}`);
    console.log(`  Redirect:  ${process.env.FB_REDIRECT_URI || '(no configurado)'}`);
    console.log('═══════════════════════════════════════════════════════');
    if (!process.env.FB_APP_ID || !process.env.FB_APP_SECRET) {
        console.warn('⚠️  Falta configuración OAuth. Revisa SETUP.md y .env.example');
    }
});
