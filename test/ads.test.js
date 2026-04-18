/**
 * test/ads.test.js — rutas /api/ads
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
const UID = 'test-user-ads';

before(() => {
    tokenStore.save(UID, {
        access_token: 'fake-token-ads',
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

test('GET /api/ads lista y mapea ad accounts', async () => {
    nock(GRAPH)
        .get('/me/adaccounts').query(true)
        .reply(200, {
            data: [{
                id: 'act_100', account_id: '100', name: 'Cuenta X',
                account_status: 1, balance: '1234', amount_spent: '5678',
                spend_cap: '0', currency: 'USD',
                business: { id: 'b1', name: 'Acme' },
                timezone_name: 'America/Bogota'
            }, {
                id: 'act_101', account_id: '101', name: 'Disabled Y',
                account_status: 2, disable_reason: 1
            }]
        });

    const res = await request(app).get(`/api/ads?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 2);
    assert.strictEqual(res.body.rows[0].status, 'ACTIVE');
    assert.strictEqual(res.body.rows[0].balance, 12.34);
    assert.strictEqual(res.body.rows[0].spent, 56.78);
    assert.strictEqual(res.body.rows[1].status, 'DISABLED');
});

test('GET /api/ads/:actId devuelve detalle', async () => {
    nock(GRAPH)
        .get('/act_100').query(true)
        .reply(200, { id: 'act_100', name: 'Cuenta X', currency: 'USD' });

    const res = await request(app).get(`/api/ads/act_100?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.id, 'act_100');
});

test('GET /api/ads/:actId/campaigns', async () => {
    nock(GRAPH)
        .get('/act_100/campaigns').query(true)
        .reply(200, { data: [{ id: 'c1', name: 'Camp 1', status: 'ACTIVE' }] });

    const res = await request(app).get(`/api/ads/act_100/campaigns?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.count, 1);
    assert.strictEqual(res.body.rows[0].id, 'c1');
});

test('GET /api/ads/:actId/adsets filtra por campaign_id', async () => {
    nock(GRAPH)
        .get('/act_100/adsets')
        .query(q => q.filtering && q.filtering.includes('campaign.id'))
        .reply(200, { data: [{ id: 'as1', name: 'AdSet 1', campaign_id: 'c1' }] });

    const res = await request(app).get(`/api/ads/act_100/adsets?uid=${UID}&campaign_id=c1`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.rows[0].campaign_id, 'c1');
});

test('GET /api/ads/:actId/ads filtra por adset_id', async () => {
    nock(GRAPH)
        .get('/act_100/ads')
        .query(q => q.filtering && q.filtering.includes('adset.id'))
        .reply(200, { data: [{ id: 'ad1', name: 'Ad 1', adset_id: 'as1' }] });

    const res = await request(app).get(`/api/ads/act_100/ads?uid=${UID}&adset_id=as1`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.rows[0].id, 'ad1');
});

test('GET /api/ads/:actId/insights con date_preset por defecto', async () => {
    nock(GRAPH)
        .get('/act_100/insights')
        .query(q => q.date_preset === 'last_30d')
        .reply(200, { data: [{ impressions: '1000', clicks: '50', spend: '25.00' }] });

    const res = await request(app).get(`/api/ads/act_100/insights?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.rows[0].clicks, '50');
});

test('GET /api/ads/:actId/advantage marca is_advantage', async () => {
    nock(GRAPH)
        .get('/act_100/campaigns').query(true)
        .reply(200, {
            data: [
                { id: 'c1', name: 'Normal', smart_promotion_type: null },
                { id: 'c2', name: 'Adv+', smart_promotion_type: 'AUTOMATED_SHOPPING_ADS' }
            ]
        });

    const res = await request(app).get(`/api/ads/act_100/advantage?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.advantage_count, 1);
    assert.strictEqual(res.body.rows[1].is_advantage, true);
});

test('GET /api/ads/:actId/attribution formatea spec', async () => {
    nock(GRAPH)
        .get('/act_100/adsets').query(true)
        .reply(200, {
            data: [{
                id: 'as1', name: 'AS1', campaign_id: 'c1',
                attribution_spec: [
                    { event_type: 'CLICK_THROUGH', window_days: 7 },
                    { event_type: 'VIEW_THROUGH', window_days: 1 }
                ],
                optimization_goal: 'OFFSITE_CONVERSIONS'
            }]
        });

    const res = await request(app).get(`/api/ads/act_100/attribution?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.rows[0].attribution, 'CLICK_THROUGH/7d, VIEW_THROUGH/1d');
});

test('GET /api/ads/:actId/payment-methods', async () => {
    nock(GRAPH)
        .get('/act_100').query(true)
        .reply(200, {
            funding_source_details: { display_string: 'Visa ****1234' },
            all_payment_methods: { pm_credit_card: [] }
        });

    const res = await request(app).get(`/api/ads/act_100/payment-methods?uid=${UID}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.funding_source_details.display_string, 'Visa ****1234');
});
