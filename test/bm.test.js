/**
 * test/bm.test.js — rutas /api/bm
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
const UID = 'test-user-bm';

before(() => {
    tokenStore.save(UID, {
        access_token: 'fake-token-bm',
        expires_in: 5184000,
        scope: 'ads_read,business_management'
    });
});

after(() => {
    tokenStore.remove(UID);
    cleanupTokensFile();
    nock.cleanAll();
});

beforeEach(() => {
    nock.cleanAll();
});

test('GET /api/bm sin uid → 400', async () => {
    const res = await request(app).get('/api/bm');
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /uid/i);
});

test('GET /api/bm con uid inválido → 401', async () => {
    const res = await request(app).get('/api/bm?uid=nope');
    assert.strictEqual(res.status, 401);
});

test('GET /api/bm devuelve filas mapeadas', async () => {
    nock(GRAPH)
        .get('/me/businesses')
        .query(true)
        .reply(200, {
            data: [{
                id: 'bm_1',
                name: 'Acme BM',
                verification_status: 'verified',
                vertical: 'ECOMMERCE',
                created_time: '2024-01-01T00:00:00+0000',
                primary_page: { id: 'p1', name: 'Acme Page' },
                permitted_roles: ['ADMIN'],
                owned_ad_accounts: { summary: { total_count: 3 }, data: [] },
                client_ad_accounts: { summary: { total_count: 2 }, data: [] },
                owned_pages: { summary: { total_count: 1 }, data: [] },
                client_pages: { summary: { total_count: 0 }, data: [] },
                owned_instagram_accounts: { summary: { total_count: 1 } }
            }]
        });

    const res = await request(app).get(`/api/bm?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.rows[0].bmId, 'bm_1');
    assert.strictEqual(res.body.rows[0].status, 'LIVE');
    assert.strictEqual(res.body.rows[0].adAccount, 5);
    assert.strictEqual(res.body.rows[0].bmPage, 1);
    assert.strictEqual(res.body.rows[0].instaAccount, 1);
});

test('GET /api/bm/:bmId devuelve detalle', async () => {
    nock(GRAPH)
        .get('/bm_42')
        .query(true)
        .reply(200, { id: 'bm_42', name: 'Detalle', verification_status: 'pending' });

    const res = await request(app).get(`/api/bm/bm_42?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, 'bm_42');
});

test('GET /api/bm/:bmId/ads combina owned + client', async () => {
    nock(GRAPH)
        .get('/bm_1/owned_ad_accounts').query(true)
        .reply(200, { data: [{ account_id: '1', name: 'A' }] })
        .get('/bm_1/client_ad_accounts').query(true)
        .reply(200, { data: [{ account_id: '2', name: 'B' }, { account_id: '3', name: 'C' }] });

    const res = await request(app).get(`/api/bm/bm_1/ads?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 3);
    assert.strictEqual(res.body.owned.length, 1);
    assert.strictEqual(res.body.client.length, 2);
});

test('GET /api/bm/:bmId/pages combina owned + client', async () => {
    nock(GRAPH)
        .get('/bm_1/owned_pages').query(true).reply(200, { data: [{ id: 'p1', name: 'P1' }] })
        .get('/bm_1/client_pages').query(true).reply(200, { data: [] });

    const res = await request(app).get(`/api/bm/bm_1/pages?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 1);
});

test('GET /api/bm/:bmId/users tolera fallo en system_users', async () => {
    nock(GRAPH)
        .get('/bm_1/business_users').query(true)
        .reply(200, { data: [{ id: 'u1', name: 'Admin', role: 'ADMIN' }] })
        .get('/bm_1/system_users').query(true)
        .reply(403, { error: { message: 'No permission', code: 200 } });

    const res = await request(app).get(`/api/bm/bm_1/users?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.business_users.length, 1);
    assert.deepStrictEqual(res.body.system_users, []);
});

test('GET /api/bm propaga error de FB', async () => {
    nock(GRAPH)
        .get('/me/businesses').query(true)
        .reply(400, { error: { message: 'Invalid OAuth token', code: 190, fbtrace_id: 'abc' } });

    const res = await request(app).get(`/api/bm?uid=${UID}`);
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /Invalid OAuth token/);
    assert.strictEqual(res.body.code, 190);
});
