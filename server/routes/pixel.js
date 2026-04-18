/**
 * server/routes/pixel.js
 * ======================
 * Endpoints de Facebook Pixels / Conversions API.
 *
 *   GET /api/pixel?uid=<fb_user_id>&act_id=act_123   Lista pixels del ad account
 *   GET /api/pixel/:pixelId?uid=<fb_user_id>         Detalle del pixel
 *   GET /api/pixel/:pixelId/stats?uid=<fb_user_id>   Eventos recibidos (health check)
 *
 * Docs:
 *  - https://developers.facebook.com/docs/marketing-api/reference/ads-pixel/
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

function mapPixelToRow(p) {
    const lastFired = p.last_fired_time ? new Date(p.last_fired_time) : null;
    const hoursSinceFire = lastFired
        ? Math.round((Date.now() - lastFired.getTime()) / 3600000)
        : null;

    let health = 'UNKNOWN';
    if (hoursSinceFire === null) {
        health = 'INACTIVE';
    } else if (hoursSinceFire < 24) {
        health = 'HEALTHY';
    } else if (hoursSinceFire < 168) { // 7 días
        health = 'WARNING';
    } else {
        health = 'INACTIVE';
    }

    return {
        id: p.id,
        name: p.name,
        code: p.code || '',
        last_fired_time: p.last_fired_time || null,
        hours_since_fire: hoursSinceFire,
        creation_time: p.creation_time || null,
        data_use_setting: p.data_use_setting || '',
        automatic_matching_fields: p.automatic_matching_fields || [],
        health,
        owner_ad_account: p.owner_ad_account
            ? { id: p.owner_ad_account.id, name: p.owner_ad_account.name }
            : null,
        owner_business: p.owner_business
            ? { id: p.owner_business.id, name: p.owner_business.name }
            : null
    };
}

// ─── GET /api/pixel ───────────────────────────────────────────
router.get('/', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    const actId = req.query.act_id;
    if (!actId) {
        return res.status(400).json({ error: 'Falta act_id (ej. act_1234567890)' });
    }

    try {
        const fields = [
            'id', 'name', 'code', 'last_fired_time', 'creation_time',
            'data_use_setting', 'automatic_matching_fields',
            'owner_ad_account{id,name}', 'owner_business{id,name}'
        ].join(',');

        const list = await fb.paginate(`/${actId}/adspixels`, {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 10);

        res.json({
            count: list.length,
            rows: list.map(mapPixelToRow)
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/pixel/:pixelId ──────────────────────────────────
router.get('/:pixelId', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'code', 'last_fired_time', 'creation_time',
            'data_use_setting', 'automatic_matching_fields',
            'owner_ad_account{id,name}', 'owner_business{id,name}',
            'is_unavailable', 'enable_automatic_matching'
        ].join(',');

        const data = await fb.get(`/${req.params.pixelId}`, {
            accessToken: creds.token,
            params: { fields }
        });

        res.json(mapPixelToRow(data));
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/pixel/:pixelId/stats ────────────────────────────
router.get('/:pixelId/stats', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        // stats trae los eventos recibidos por agregación
        const data = await fb.get(`/${req.params.pixelId}/stats`, {
            accessToken: creds.token,
            params: {
                aggregation: req.query.aggregation || 'event',
                start_time: req.query.start_time || undefined,
                end_time: req.query.end_time || undefined
            }
        });

        res.json(data);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
