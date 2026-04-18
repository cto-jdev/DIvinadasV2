/**
 * server/routes/pages.js
 * ======================
 * Endpoints de páginas de Facebook.
 *
 *   GET /api/pages?uid=<fb_user_id>        Lista páginas administradas
 *   GET /api/pages/:pageId                 Detalle de página
 *   GET /api/pages/:pageId/insights        Insights (fan_adds, reach, ...)
 *   GET /api/pages/:pageId/posts           Posts recientes
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

function mapPageToRow(p) {
    let status = 'UNVERIFIED';
    switch (p.verification_status) {
        case 'blue_verified':
        case 'gray_verified':
            status = 'VERIFIED'; break;
        case 'not_verified':
            status = 'UNVERIFIED'; break;
        case 'pending':
            status = 'PENDING'; break;
    }

    return {
        id:         p.id,
        name:       p.name,
        category:   p.category || '',
        fan_count:  p.fan_count ?? 0,
        status,
        verification_status: p.verification_status,
        picture:    p.picture?.data?.url || '',
        link:       p.link || `https://www.facebook.com/${p.id}`,
        about:      p.about || '',
        tasks:      p.tasks || []  // permisos concedidos a este usuario sobre la página
    };
}

// ─── GET /api/pages ───────────────────────────────────────────
router.get('/', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'category', 'fan_count',
            'verification_status', 'picture.width(80).height(80)',
            'link', 'about', 'tasks'
        ].join(',');

        // /me/accounts lista las páginas que el usuario administra
        const list = await fb.paginate('/me/accounts', {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 10);

        res.json({
            count: list.length,
            rows: list.map(mapPageToRow)
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/pages/:pageId ───────────────────────────────────
router.get('/:pageId', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'category', 'fan_count', 'followers_count',
            'verification_status', 'picture.width(200).height(200)',
            'link', 'about', 'description', 'website',
            'phone', 'emails', 'location', 'created_time'
        ].join(',');

        const data = await fb.get(`/${req.params.pageId}`, {
            accessToken: creds.token,
            params: { fields }
        });

        res.json(data);
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/pages/:pageId/insights ──────────────────────────
router.get('/:pageId/insights', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const metric = req.query.metric ||
            'page_fan_adds,page_fan_removes,page_impressions,page_post_engagements';
        const period = req.query.period || 'day';

        const data = await fb.get(`/${req.params.pageId}/insights`, {
            accessToken: creds.token,
            params: { metric, period }
        });

        res.json(data);
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/pages/:pageId/posts ─────────────────────────────
router.get('/:pageId/posts', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'message', 'created_time', 'permalink_url',
            'full_picture', 'reactions.summary(true)', 'comments.summary(true)',
            'shares'
        ].join(',');

        const list = await fb.paginate(`/${req.params.pageId}/posts`, {
            accessToken: creds.token,
            params: { fields, limit: 25 }
        }, 5);

        res.json({ count: list.length, rows: list });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
