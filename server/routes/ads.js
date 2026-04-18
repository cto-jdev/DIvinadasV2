/**
 * server/routes/ads.js
 * ====================
 * Endpoints de Ad Accounts / Campañas / Insights vía Marketing API.
 *
 *   GET /api/ads?uid=<fb_user_id>              Lista ad accounts del usuario
 *   GET /api/ads/:actId                        Detalle de ad account
 *   GET /api/ads/:actId/campaigns              Campañas
 *   GET /api/ads/:actId/adsets?campaign_id=X   Ad sets
 *   GET /api/ads/:actId/ads?adset_id=X         Ads individuales
 *   GET /api/ads/:actId/insights?date_preset=last_30d
 *   GET /api/ads/:actId/payment-methods        Métodos de pago (read-only)
 *
 * Docs:
 *  - https://developers.facebook.com/docs/marketing-api/reference/ad-account/
 */

'use strict';

const express = require('express');
const tokenStore = require('../token-store');
const fb = require('../fb-client');

const router = express.Router();

function getTokenOrFail(req, res) {
    const uid = req.query.uid || req.headers['x-divinads-uid'];
    if (!uid) {
        res.status(400).json({ error: 'Falta uid' });
        return null;
    }
    const token = tokenStore.getToken(uid);
    if (!token) {
        res.status(401).json({ error: 'Cuenta no conectada o token expirado', uid });
        return null;
    }
    return { uid, token };
}

// ACCOUNT_STATUS de Marketing API:
// 1=ACTIVE, 2=DISABLED, 3=UNSETTLED, 7=PENDING_RISK_REVIEW,
// 8=PENDING_SETTLEMENT, 9=IN_GRACE_PERIOD, 100=PENDING_CLOSURE,
// 101=CLOSED, 201=ANY_ACTIVE, 202=ANY_CLOSED
const ACCOUNT_STATUS_LABEL = {
    1: 'ACTIVE',
    2: 'DISABLED',
    3: 'UNSETTLED',
    7: 'PENDING_RISK_REVIEW',
    8: 'PENDING_SETTLEMENT',
    9: 'IN_GRACE_PERIOD',
    100: 'PENDING_CLOSURE',
    101: 'CLOSED'
};

function mapAdAccountToRow(a) {
    return {
        id:         a.id,                              // "act_123..."
        account_id: a.account_id,                      // "123..."
        name:       a.name,
        status:     ACCOUNT_STATUS_LABEL[a.account_status] || String(a.account_status || ''),
        status_code: a.account_status,
        disable_reason: a.disable_reason ?? null,
        balance:    a.balance != null ? Number(a.balance) / 100 : 0,  // en unidades de moneda
        spent:      a.amount_spent != null ? Number(a.amount_spent) / 100 : 0,
        spend_cap:  a.spend_cap != null ? Number(a.spend_cap) / 100 : 0,
        currency:   a.currency || '',
        adtrust_dsl: a.adtrust_dsl ?? null,
        age:        a.age ?? null,
        funding_source: a.funding_source || '',
        business:   a.business ? { id: a.business.id, name: a.business.name } : null,
        timezone:   a.timezone_name || '',
        created_time: a.created_time || null
    };
}

// ─── GET /api/ads ─────────────────────────────────────────────
router.get('/', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'account_id', 'name', 'account_status', 'disable_reason',
            'balance', 'amount_spent', 'currency', 'spend_cap',
            'adtrust_dsl', 'age', 'funding_source',
            'business{id,name}', 'timezone_name', 'created_time'
        ].join(',');

        const list = await fb.paginate('/me/adaccounts', {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 20);

        res.json({
            count: list.length,
            rows: list.map(mapAdAccountToRow)
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId ──────────────────────────────────────
router.get('/:actId', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'account_id', 'name', 'account_status', 'disable_reason',
            'balance', 'amount_spent', 'currency', 'spend_cap',
            'adtrust_dsl', 'age', 'funding_source_details', 'all_payment_methods',
            'business{id,name}', 'timezone_name', 'created_time',
            'users{id,name,role}'
        ].join(',');

        const data = await fb.get(`/${req.params.actId}`, {
            accessToken: creds.token,
            params: { fields }
        });

        res.json(data);
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/campaigns ────────────────────────────
router.get('/:actId/campaigns', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'status', 'effective_status', 'objective',
            'buying_type', 'daily_budget', 'lifetime_budget',
            'start_time', 'stop_time', 'created_time', 'updated_time'
        ].join(',');

        const list = await fb.paginate(`/${req.params.actId}/campaigns`, {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 20);

        res.json({ count: list.length, rows: list });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/adsets ───────────────────────────────
router.get('/:actId/adsets', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'campaign_id', 'status', 'effective_status',
            'daily_budget', 'lifetime_budget', 'targeting',
            'start_time', 'end_time', 'created_time'
        ].join(',');
        const params = { fields, limit: 100 };
        if (req.query.campaign_id) params['filtering'] = JSON.stringify([{
            field: 'campaign.id', operator: 'EQUAL', value: req.query.campaign_id
        }]);

        const list = await fb.paginate(`/${req.params.actId}/adsets`, {
            accessToken: creds.token,
            params
        }, 20);

        res.json({ count: list.length, rows: list });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/ads ──────────────────────────────────
router.get('/:actId/ads', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'adset_id', 'campaign_id', 'status',
            'effective_status', 'creative{id,name,thumbnail_url}',
            'created_time'
        ].join(',');
        const params = { fields, limit: 100 };
        if (req.query.adset_id) params['filtering'] = JSON.stringify([{
            field: 'adset.id', operator: 'EQUAL', value: req.query.adset_id
        }]);

        const list = await fb.paginate(`/${req.params.actId}/ads`, {
            accessToken: creds.token,
            params
        }, 20);

        res.json({ count: list.length, rows: list });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/insights ─────────────────────────────
router.get('/:actId/insights', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const datePreset = req.query.date_preset || 'last_30d';
        const level      = req.query.level || 'account';
        const fields = [
            'impressions', 'clicks', 'spend', 'reach', 'frequency',
            'ctr', 'cpc', 'cpm', 'cpp', 'actions', 'cost_per_action_type',
            'date_start', 'date_stop'
        ].join(',');

        const list = await fb.paginate(`/${req.params.actId}/insights`, {
            accessToken: creds.token,
            params: { fields, date_preset: datePreset, level, limit: 100 }
        }, 10);

        res.json({ rows: list });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/advantage ────────────────────────────
// Lista campañas del ad account indicando cuáles usan Advantage+ / audience expansion.
router.get('/:actId/advantage', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'status', 'effective_status', 'objective',
            'smart_promotion_type',
            'is_skadnetwork_attribution',
            'special_ad_categories',
            'adsets{id,name,targeting{targeting_automation}}'
        ].join(',');

        const list = await fb.paginate(`/${req.params.actId}/campaigns`, {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 20);

        const rows = list.map(c => ({
            id: c.id,
            name: c.name,
            status: c.status,
            effective_status: c.effective_status,
            objective: c.objective,
            is_advantage: c.smart_promotion_type === 'AUTOMATED_SHOPPING_ADS'
                       || c.smart_promotion_type === 'SMART_APP_PROMOTION',
            smart_promotion_type: c.smart_promotion_type || null,
            is_skadnetwork: !!c.is_skadnetwork_attribution,
            special_ad_categories: c.special_ad_categories || [],
            adset_count: c.adsets?.data?.length || 0
        }));

        res.json({
            count: rows.length,
            advantage_count: rows.filter(r => r.is_advantage).length,
            rows
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/attribution ──────────────────────────
// Devuelve la configuración de attribution windows por adset del ad account.
router.get('/:actId/attribution', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'campaign_id',
            'attribution_spec',
            'optimization_goal',
            'bid_strategy'
        ].join(',');

        const list = await fb.paginate(`/${req.params.actId}/adsets`, {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 20);

        const rows = list.map(a => ({
            id: a.id,
            name: a.name,
            campaign_id: a.campaign_id,
            optimization_goal: a.optimization_goal,
            bid_strategy: a.bid_strategy,
            attribution: Array.isArray(a.attribution_spec)
                ? a.attribution_spec.map(s => `${s.event_type}/${s.window_days}d`).join(', ')
                : '',
            attribution_raw: a.attribution_spec || null
        }));

        res.json({ count: rows.length, rows });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/ads/:actId/payment-methods ──────────────────────
router.get('/:actId/payment-methods', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const data = await fb.get(`/${req.params.actId}`, {
            accessToken: creds.token,
            params: { fields: 'funding_source_details,all_payment_methods' }
        });
        res.json({
            funding_source_details: data.funding_source_details || null,
            payment_methods: data.all_payment_methods || []
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
