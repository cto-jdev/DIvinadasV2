/**
 * test/pixel.test.js — rutas /api/pixel
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
const UID = 'test-user-pixel';

before(() => {
    tokenStore.save(UID, {
        access_token: 'fake-token-pixel',
        expires_in: 5184000,
        scope: 'ads_read'
    });
});

after(() => {
    tokenStore.remove(UID);
    cleanupTokensFile();
    nock.cleanAll();
});

beforeEach(() => nock.cleanAll());

test('GET /api/pixel sin act_id → 400', async () => {
    const res = await request(app).get(`/api/pixel?uid=${UID}`);
    assert.strictEqual(res.status, 400);
    assert.match(res.body.error, /act_id/);
});

test('GET /api/pixel calcula health', async () => {
    const recentFire = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const oldFire = new Date(Date.now() - 10 * 86400 * 1000).toISOString();

    nock(GRAPH)
        .get('/act_100/adspixels').query(true)
        .reply(200, {
            data: [
                { id: 'px1', name: 'Active Pixel', last_fired_time: recentFire },
                { id: 'px2', name: 'Stale Pixel', last_fired_time: oldFire },
                { id: 'px3', name: 'Never Fired' }
            ]
        });

    const res = await request(app).get(`/api/pixel?uid=${UID}&act_id=act_100`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 3);
    assert.strictEqual(res.body.rows[0].health, 'HEALTHY');
    assert.strictEqual(res.body.rows[1].health, 'INACTIVE');
    assert.strictEqual(res.body.rows[2].health, 'INACTIVE');
});

test('GET /api/pixel/:pixelId detalle', async () => {
    nock(GRAPH)
        .get('/px1').query(true)
        .reply(200, { id: 'px1', name: 'Main', last_fired_time: new Date().toISOString() });

    const res = await request(app).get(`/api/pixel/px1?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, 'px1');
    assert.strictEqual(res.body.health, 'HEALTHY');
});

test('GET /api/pixel/:pixelId/stats', async () => {
    nock(GRAPH)
        .get('/px1/stats').query(true)
        .reply(200, { data: [{ event: 'Purchase', count: 42 }] });

    const res = await request(app).get(`/api/pixel/px1/stats?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data[0].count, 42);
});
