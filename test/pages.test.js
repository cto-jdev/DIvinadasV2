/**
 * test/pages.test.js — rutas /api/pages
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
const UID = 'test-user-pages';

before(() => {
    tokenStore.save(UID, {
        access_token: 'fake-token-pages',
        expires_in: 5184000,
        scope: 'pages_read_engagement'
    });
});

after(() => {
    tokenStore.remove(UID);
    cleanupTokensFile();
    nock.cleanAll();
});

beforeEach(() => nock.cleanAll());

test('GET /api/pages mapea verification_status', async () => {
    nock(GRAPH)
        .get('/me/accounts').query(true)
        .reply(200, {
            data: [
                { id: 'p1', name: 'Azul', category: 'Brand', fan_count: 1000,
                  verification_status: 'blue_verified',
                  picture: { data: { url: 'https://img/p1.jpg' } } },
                { id: 'p2', name: 'No verif', verification_status: 'not_verified' }
            ]
        });

    const res = await request(app).get(`/api/pages?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 2);
    assert.strictEqual(res.body.rows[0].status, 'VERIFIED');
    assert.strictEqual(res.body.rows[0].picture, 'https://img/p1.jpg');
    assert.strictEqual(res.body.rows[1].status, 'UNVERIFIED');
});

test('GET /api/pages/:pageId detalle', async () => {
    nock(GRAPH).get('/p1').query(true)
        .reply(200, { id: 'p1', name: 'Acme', fan_count: 500 });

    const res = await request(app).get(`/api/pages/p1?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, 'p1');
});

test('GET /api/pages/:pageId/insights', async () => {
    nock(GRAPH)
        .get('/p1/insights')
        .query(q => q.metric && q.period === 'day')
        .reply(200, { data: [{ name: 'page_fan_adds', values: [] }] });

    const res = await request(app).get(`/api/pages/p1/insights?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
});

test('GET /api/pages/:pageId/posts', async () => {
    nock(GRAPH)
        .get('/p1/posts').query(true)
        .reply(200, { data: [{ id: 'post1', message: 'Hola', created_time: '2026-04-10T00:00:00+0000' }] });

    const res = await request(app).get(`/api/pages/p1/posts?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.rows[0].id, 'post1');
});
