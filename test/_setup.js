/**
 * test/_setup.js
 * Shared bootstrap for all test files.
 *
 * - Sets env vars BEFORE any server module is required
 *   (they are read at module-load time).
 * - Redirects tokens.json to a per-pid tmp file so real tokens
 *   are never touched.
 * - Exports a buildApp() that mounts the same routes as server.js
 *   but without .listen() — safe for supertest.
 */
'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');

// ─── Env defaults ──────────────────────────────────────────────
// 64 hex chars = 32 bytes for AES-256-GCM key
process.env.TOKEN_ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'a'.repeat(64);
process.env.FB_API_VERSION       = process.env.FB_API_VERSION       || 'v20.0';
process.env.FB_APP_ID            = process.env.FB_APP_ID            || 'test-app-id';
process.env.FB_APP_SECRET        = process.env.FB_APP_SECRET        || 'test-app-secret';
process.env.FB_REDIRECT_URI      = process.env.FB_REDIRECT_URI      || 'http://localhost:8080/api/oauth/callback';
process.env.OAUTH_STATE_SECRET   = process.env.OAUTH_STATE_SECRET   || 'test-state-secret';
process.env.FB_OAUTH_SCOPES      = process.env.FB_OAUTH_SCOPES      || 'public_profile,email,ads_read';

// Isolate tokens.json to a tmp file per test run
const TOKENS_PATH = path.join(os.tmpdir(), `divinads-test-tokens-${process.pid}.json`);
process.env.TOKENS_PATH = TOKENS_PATH;

const GRAPH = `https://graph.facebook.com/${process.env.FB_API_VERSION}`;

function buildApp() {
    const express = require('express');
    const oauth = require('../server/oauth');
    const app = express();
    app.use(express.json());
    // OAuth / auth
    app.get('/api/oauth/start',     oauth.start);
    app.get('/api/oauth/callback',  oauth.callback);
    app.get('/api/me',              oauth.me);
    app.post('/api/disconnect/:uid', oauth.disconnect);
    app.post('/api/refresh/:uid',    oauth.refresh);
    // Graph API routes
    app.use('/api/bm',       require('../server/routes/bm'));
    app.use('/api/ads',      require('../server/routes/ads'));
    app.use('/api/pages',    require('../server/routes/pages'));
    app.use('/api/pixel',    require('../server/routes/pixel'));
    app.use('/api/insights', require('../server/routes/insights'));
    // Error handler mirroring server.js
    app.use((err, req, res, _next) => {
        res.status(err.status || 500).json({
            error: err.message,
            code: err.code,
            fbtrace_id: err.fbtrace_id
        });
    });
    return app;
}

function cleanupTokensFile() {
    try { fs.unlinkSync(TOKENS_PATH); } catch (_) { /* ignore */ }
}

module.exports = { buildApp, GRAPH, TOKENS_PATH, cleanupTokensFile };
