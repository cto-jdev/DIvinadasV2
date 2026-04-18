/**
 * test/insights.test.js — rutas /api/insights
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
const UID = 'test-user-ins';

before(() => {
    tokenStore.save(UID, {
        access_token: 'fake-token-ins',
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

function mockAccounts() {
    nock(GRAPH)
        .get('/me/adaccounts').query(true)
        .reply(200, {
            data: [
                { id: 'act_1', name: 'A', currency: 'USD', account_status: 1 },
                { id: 'act_2', name: 'B', currency: 'USD', account_status: 1 },
                { id: 'act_3', name: 'C-disabled', currency: 'USD', account_status: 2 }
            ]
        });
}

test('GET /api/insights/summary agrega totales', async () => {
    mockAccounts();
    nock(GRAPH)
        .get('/act_1/insights').query(true)
        .reply(200, { data: [{ impressions: '1000', clicks: '50', spend: '25', reach: '800' }] })
        .get('/act_2/insights').query(true)
        .reply(200, { data: [{ impressions: '500', clicks: '10', spend: '5', reach: '400' }] });

    const res = await request(app).get(`/api/insights/summary?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.account_count, 2);  // act_3 excluida
    assert.strictEqual(res.body.totals.spend, 30);
    assert.strictEqual(res.body.totals.impressions, 1500);
    assert.strictEqual(res.body.totals.clicks, 60);
    // ctr = 60/1500 * 100 = 4
    assert.strictEqual(res.body.averages.ctr, 4);
});

test('GET /api/insights/summary sin cuentas activas', async () => {
    nock(GRAPH)
        .get('/me/adaccounts').query(true)
        .reply(200, { data: [{ id: 'act_x', account_status: 2 }] });

    const res = await request(app).get(`/api/insights/summary?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.account_count, 0);
    assert.strictEqual(res.body.totals.spend, 0);
});

test('GET /api/insights/by-account ordena por spend desc', async () => {
    mockAccounts();
    nock(GRAPH)
        .get('/act_1/insights').query(true)
        .reply(200, { data: [{ spend: '10', impressions: '100', clicks: '5', reach: '80' }] })
        .get('/act_2/insights').query(true)
        .reply(200, { data: [{ spend: '50', impressions: '500', clicks: '20', reach: '400' }] });

    const res = await request(app).get(`/api/insights/by-account?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.rows.length, 2);
    assert.strictEqual(res.body.rows[0].account_id, 'act_2');  // spend mayor primero
    assert.strictEqual(res.body.rows[0].spend, 50);
});

test('GET /api/insights/time-series agrega por día', async () => {
    mockAccounts();
    nock(GRAPH)
        .get('/act_1/insights').query(true)
        .reply(200, { data: [
            { date_start: '2026-04-10', spend: '10', impressions: '100', clicks: '5' },
            { date_start: '2026-04-11', spend: '20', impressions: '200', clicks: '10' }
        ]})
        .get('/act_2/insights').query(true)
        .reply(200, { data: [
            { date_start: '2026-04-10', spend: '5', impressions: '50', clicks: '2' }
        ]});

    const res = await request(app).get(`/api/insights/time-series?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.series.length, 2);
    assert.strictEqual(res.body.series[0].date, '2026-04-10');
    assert.strictEqual(res.body.series[0].spend, 15);    // act_1 (10) + act_2 (5)
    assert.strictEqual(res.body.series[1].date, '2026-04-11');
    assert.strictEqual(res.body.series[1].spend, 20);
});
