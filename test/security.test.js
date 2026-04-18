/**
 * test/security.test.js — Hardening: helmet, rate-limit, static block, error handler
 */
'use strict';

require('./_setup');
const { test, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const path = require('path');

// El server completo (con helmet, static block, etc.) se monta al requerir server.js.
// _setup.js ya fija las env vars antes de cargar módulos del server.
const app = require('../server.js');
const { cleanupTokensFile } = require('./_setup');

after(() => cleanupTokensFile());

test('Helmet: X-Content-Type-Options nosniff', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
});

test('Helmet: X-Frame-Options (anti-clickjacking)', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.headers['x-frame-options'], 'falta X-Frame-Options');
});

test('Helmet: Content-Security-Policy presente', async () => {
    const res = await request(app).get('/api/health');
    assert.ok(res.headers['content-security-policy'], 'falta CSP');
    assert.match(res.headers['content-security-policy'], /default-src 'self'/);
});

test('Static block: .env no es accesible', async () => {
    const res = await request(app).get('/.env');
    assert.strictEqual(res.status, 404);
});

test('Static block: tokens.json no es accesible', async () => {
    const res = await request(app).get('/tokens.json');
    assert.strictEqual(res.status, 404);
});

test('Static block: package.json no es accesible', async () => {
    const res = await request(app).get('/package.json');
    assert.strictEqual(res.status, 404);
});

test('Static block: server/oauth.js no es accesible', async () => {
    const res = await request(app).get('/server/oauth.js');
    assert.strictEqual(res.status, 404);
});

test('Static block: test/_setup.js no es accesible', async () => {
    const res = await request(app).get('/test/_setup.js');
    assert.strictEqual(res.status, 404);
});

test('Static OK: /index.html accesible', async () => {
    const res = await request(app).get('/index.html');
    assert.strictEqual(res.status, 200);
    assert.match(res.headers['content-type'], /html/);
});

test('404 JSON para rutas API inexistentes', async () => {
    const res = await request(app).get('/api/no-existe');
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Not found');
});

test('Body limit 100kb (payload grande es rechazado)', async () => {
    const big = 'x'.repeat(200 * 1024); // 200 kb
    const res = await request(app)
        .post('/api/disconnect/test-uid')
        .set('Content-Type', 'application/json')
        .send(`{"data":"${big}"}`);
    // Express responde 413 Payload Too Large cuando excede limit
    assert.ok(res.status === 413 || res.status === 400,
        `esperaba 413/400, recibí ${res.status}`);
});

test('Health check responde sin rate-limit', async () => {
    // 10 requests rápidas al health no deberían bloquearse
    for (let i = 0; i < 10; i++) {
        const res = await request(app).get('/api/health');
        assert.strictEqual(res.status, 200);
    }
});
