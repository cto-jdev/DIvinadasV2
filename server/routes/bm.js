/**
 * server/routes/bm.js
 * ===================
 * Endpoints de Business Manager.
 *
 *   GET  /api/bm?uid=<fb_user_id>     Lista BMs del usuario conectado
 *   GET  /api/bm/:bmId                Detalle de un BM
 *   GET  /api/bm/:bmId/ads            Ad accounts del BM (owned + client)
 *   GET  /api/bm/:bmId/pages          Páginas del BM (owned + client)
 *   GET  /api/bm/:bmId/users          Usuarios/admins del BM
 *
 * Nota: los estados operativos custom del UI legacy (BM_XANHVO, BM_KHANG,
 * DIE_VV, etc.) no existen en Graph API. Esta ruta devuelve un `status`
 * derivado de `verification_status` de Graph, que es el único dato real.
 */

'use strict';

const express = require('express');
const tokenStore = require('../token-store');
const fb = require('../fb-client');

const router = express.Router();

// ─── Helpers ──────────────────────────────────────────────────
function getTokenOrFail(req, res) {
    const uid = req.query.uid || req.headers['x-divinads-uid'];
    if (!uid) {
        res.status(400).json({ error: 'Falta uid (query ?uid= o header X-DivinAds-Uid)' });
        return null;
    }
    const token = tokenStore.getToken(uid);
    if (!token) {
        res.status(401).json({ error: 'Cuenta no conectada o token expirado', uid });
        return null;
    }
    return { uid, token };
}

/**
 * Traduce datos de /me/businesses a la shape que espera el AG Grid del UI.
 * - status: legitima (derivada de verification_status), NO estados operativos.
 */
function mapBusinessToRow(b, role) {
    const ownedAds   = b.owned_ad_accounts?.summary?.total_count ?? (b.owned_ad_accounts?.data?.length ?? 0);
    const clientAds  = b.client_ad_accounts?.summary?.total_count ?? (b.client_ad_accounts?.data?.length ?? 0);
    const ownedPages = b.owned_pages?.summary?.total_count ?? (b.owned_pages?.data?.length ?? 0);
    const clientPages= b.client_pages?.summary?.total_count ?? (b.client_pages?.data?.length ?? 0);
    const ownedInsta = b.owned_instagram_accounts?.summary?.total_count ?? 0;

    let status = 'UNKNOWN';
    switch (b.verification_status) {
        case 'verified':         status = 'LIVE'; break;
        case 'pending':          status = 'PENDING_VERIFICATION'; break;
        case 'not_verified':     status = 'UNVERIFIED'; break;
        case 'revoked':          status = 'REVOKED'; break;
        default:                 status = 'UNKNOWN';
    }

    return {
        id:           b.id,              // AG Grid row id
        bmId:         b.id,
        name:         b.name,
        bmType:       b.vertical || '',
        role:         role || (b.permitted_roles?.[0] ?? ''),
        type:         b.primary_page?.name || '',
        adAccount:    ownedAds + clientAds,
        bmPage:       ownedPages + clientPages,
        instaAccount: ownedInsta,
        adminAccount: 0,                 // se rellena con /api/bm/:id/users si se pide
        limit:        '',                // se rellena con /api/bm/:id (extended_credits)
        process:      '',
        pixelCount:   0,
        message:      '',
        status,
        verification_status: b.verification_status,
        created_time: b.created_time,
        // campos brutos por si el UI los necesita
        _raw: {
            primary_page: b.primary_page || null
        }
    };
}

// ─── GET /api/bm — lista BMs del usuario ──────────────────────
router.get('/', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        // Pedimos counts en summary para no tener que paginar listas completas
        const fields = [
            'id', 'name', 'verification_status', 'vertical', 'created_time',
            'primary_page{id,name}',
            'permitted_roles',
            'owned_ad_accounts.limit(0).summary(true)',
            'client_ad_accounts.limit(0).summary(true)',
            'owned_pages.limit(0).summary(true)',
            'client_pages.limit(0).summary(true)',
            'owned_instagram_accounts.limit(0).summary(true)'
        ].join(',');

        const list = await fb.paginate('/me/businesses', {
            accessToken: creds.token,
            params: { fields, limit: 100 }
        }, 10);

        const rows = list.map(b => mapBusinessToRow(b));
        res.json({ count: rows.length, rows });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/bm/:bmId — detalle ──────────────────────────────
router.get('/:bmId', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const fields = [
            'id', 'name', 'verification_status', 'vertical', 'created_time',
            'primary_page{id,name}', 'permitted_roles', 'timezone_id',
            'extended_credits{id,credit_available,currency,owner_business{id,name}}'
        ].join(',');

        const data = await fb.get(`/${req.params.bmId}`, {
            accessToken: creds.token,
            params: { fields }
        });

        res.json(data);
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/bm/:bmId/ads — ad accounts del BM ───────────────
router.get('/:bmId/ads', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const adFields = [
            'account_id', 'name', 'account_status', 'disable_reason',
            'balance', 'amount_spent', 'currency', 'spend_cap',
            'adtrust_dsl', 'age', 'funding_source',
            'business', 'timezone_name'
        ].join(',');

        const [owned, client] = await Promise.all([
            fb.paginate(`/${req.params.bmId}/owned_ad_accounts`, {
                accessToken: creds.token,
                params: { fields: adFields, limit: 100 }
            }, 20),
            fb.paginate(`/${req.params.bmId}/client_ad_accounts`, {
                accessToken: creds.token,
                params: { fields: adFields, limit: 100 }
            }, 20)
        ]);

        res.json({
            owned: owned,
            client: client,
            count: owned.length + client.length
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/bm/:bmId/pages — páginas del BM ─────────────────
router.get('/:bmId/pages', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const pageFields = [
            'id', 'name', 'category', 'fan_count',
            'verification_status', 'picture.width(80).height(80)'
        ].join(',');

        const [owned, client] = await Promise.all([
            fb.paginate(`/${req.params.bmId}/owned_pages`, {
                accessToken: creds.token,
                params: { fields: pageFields, limit: 100 }
            }, 20),
            fb.paginate(`/${req.params.bmId}/client_pages`, {
                accessToken: creds.token,
                params: { fields: pageFields, limit: 100 }
            }, 20)
        ]);

        res.json({
            owned: owned,
            client: client,
            count: owned.length + client.length
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/bm/:bmId/users — usuarios del BM ────────────────
router.get('/:bmId/users', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    try {
        const userFields = ['id', 'name', 'email', 'role', 'title'].join(',');

        const [businessUsers, systemUsers] = await Promise.all([
            fb.paginate(`/${req.params.bmId}/business_users`, {
                accessToken: creds.token,
                params: { fields: userFields, limit: 100 }
            }, 10),
            fb.paginate(`/${req.params.bmId}/system_users`, {
                accessToken: creds.token,
                params: { fields: userFields, limit: 100 }
            }, 10).catch(() => [])  // system_users requiere permiso extra, ignorable
        ]);

        res.json({
            business_users: businessUsers,
            system_users: systemUsers,
            count: businessUsers.length + systemUsers.length
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
