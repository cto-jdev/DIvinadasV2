/**
 * test/oauth.test.js — flujo OAuth (/api/oauth/start, callback, me, disconnect, refresh)
 */
'use strict';

require('./_setup');
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const nock = require('nock');
const request = require('supertest');
const { buildApp, GRAPH, cleanupTokensFile } = require('./_setup');

const app = buildApp();
const tokenStore = require('../server/token-store');

after(() => {
    cleanupTokensFile();
    nock.cleanAll();
});

beforeEach(() => nock.cleanAll());

test('GET /api/oauth/start redirige a Facebook', async () => {
    const res = await request(app).get('/api/oauth/start');
    assert.strictEqual(res.status, 302);
    assert.match(res.headers.location, /^https:\/\/www\.facebook\.com\/v20\.0\/dialog\/oauth/);
    assert.match(res.headers.location, /client_id=test-app-id/);
    assert.match(res.headers.location, /state=/);
});

test('GET /api/oauth/callback con state inválido → 400', async () => {
    const res = await request(app).get('/api/oauth/callback?code=xxx&state=bad.sig');
    assert.strictEqual(res.status, 400);
    assert.match(res.text, /Estado inválido/);
});

test('GET /api/oauth/callback con error FB → 400', async () => {
    const res = await request(app)
        .get('/api/oauth/callback?error=access_denied&error_description=User%20denied');
    assert.strictEqual(res.status, 400);
    assert.match(res.text, /Conexión cancelada/);
});

test('GET /api/oauth/callback flujo completo persiste token', async () => {
    // 1. Generamos un state válido imitando signState
    const crypto = require('crypto');
    const secret = process.env.OAUTH_STATE_SECRET;
    const payload = Buffer.from(JSON.stringify({ n: 'nonce123', r: '' })).toString('base64url');
    const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const state = `${payload}.${hmac}`;

    // 2. Mocks de los 4 hits a Graph
    nock('https://graph.facebook.com')
        .get('/v20.0/oauth/access_token')
        .query(q => q.code === 'auth-code' && !q.grant_type)
        .reply(200, { access_token: 'short-token', token_type: 'bearer' });

    nock('https://graph.facebook.com')
        .get('/v20.0/oauth/access_token')
        .query(q => q.grant_type === 'fb_exchange_token')
        .reply(200, { access_token: 'long-token', expires_in: 5184000 });

    nock(GRAPH)
        .get('/me').query(true)
        .reply(200, { id: 'fb_user_999', name: 'Test User', email: 't@x.com',
                      picture: { data: { url: 'https://img/me.jpg' } } });

    nock(GRAPH)
        .get('/fb_user_999/permissions').query(true)
        .reply(200, { data: [
            { permission: 'ads_read', status: 'granted' },
            { permission: 'email', status: 'granted' }
        ]});

    const res = await request(app)
        .get(`/api/oauth/callback?code=auth-code&state=${encodeURIComponent(state)}`);
    assert.strictEqual(res.status, 200);
    assert.match(res.text, /Cuenta conectada/);

    const meta = tokenStore.getMeta('fb_user_999');
    assert.ok(meta, 'token debería persistir');
    assert.strictEqual(meta.user_name, 'Test User');
    assert.strictEqual(meta.scope, 'ads_read,email');

    tokenStore.remove('fb_user_999');
});

test('GET /api/me lista cuentas conectadas (sin tokens)', async () => {
    tokenStore.save('u_list_1', { access_token: 'tk1', expires_in: 5184000, user_name: 'User1' });

    const res = await request(app).get('/api/me');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.accounts));
    const found = res.body.accounts.find(a => a.uid === 'u_list_1');
    assert.ok(found);
    assert.strictEqual(found.user_name, 'User1');
    assert.ok(!('access_token' in found), 'no debe exponer access_token');

    tokenStore.remove('u_list_1');
});

test('POST /api/disconnect/:uid revoca y borra', async () => {
    tokenStore.save('u_disc', { access_token: 'tk', expires_in: 5184000 });

    nock(GRAPH).delete('/u_disc/permissions').query(true).reply(200, { success: true });

    const res = await request(app).post('/api/disconnect/u_disc');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(tokenStore.getMeta('u_disc'), null);
});

test('POST /api/disconnect/:uid inexistente → 404', async () => {
    const res = await request(app).post('/api/disconnect/no-existe');
    assert.strictEqual(res.status, 404);
});

test('POST /api/refresh/:uid renueva token', async () => {
    tokenStore.save('u_ref', { access_token: 'old', expires_in: 5184000 });

    nock('https://graph.facebook.com')
        .get('/v20.0/oauth/access_token')
        .query(q => q.grant_type === 'fb_exchange_token')
        .reply(200, { access_token: 'new-long-token', expires_in: 5184000 });

    const res = await request(app).post('/api/refresh/u_ref');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.ok, true);
    assert.strictEqual(res.body.expires_in, 5184000);

    tokenStore.remove('u_ref');
});
