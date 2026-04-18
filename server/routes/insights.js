/**
 * server/routes/insights.js
 * =========================
 * Insights agregados multi-cuenta para el dashboard.
 *
 *   GET /api/insights/summary?uid=<fb_user_id>&date_preset=last_30d
 *       → KPIs agregados sobre TODAS las ad accounts del usuario
 *
 *   GET /api/insights/by-account?uid=<fb_user_id>&date_preset=last_30d
 *       → Desglose por ad account (para gráfico de barras)
 *
 *   GET /api/insights/time-series?uid=<fb_user_id>&date_preset=last_30d
 *       → Serie temporal diaria agregada (para chart de línea)
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

async function listAdAccounts(token) {
    const list = await fb.paginate('/me/adaccounts', {
        accessToken: token,
        params: { fields: 'id,name,currency,account_status', limit: 100 }
    }, 20);
    // Solo cuentas activas
    return list.filter(a => a.account_status === 1);
}

function sumNumeric(items, field) {
    return items.reduce((acc, x) => acc + (Number(x[field]) || 0), 0);
}

function avgNumeric(items, field) {
    const valid = items.filter(x => x[field] != null && !isNaN(Number(x[field])));
    if (!valid.length) return 0;
    return sumNumeric(valid, field) / valid.length;
}

// ─── GET /api/insights/summary ────────────────────────────────
router.get('/summary', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    const datePreset = req.query.date_preset || 'last_30d';

    try {
        const accounts = await listAdAccounts(creds.token);
        if (!accounts.length) {
            return res.json({
                account_count: 0,
                totals: { spend: 0, impressions: 0, clicks: 0, reach: 0 },
                averages: { ctr: 0, cpc: 0, cpm: 0 }
            });
        }

        // Pedimos insights de cada cuenta en paralelo
        const results = await Promise.all(accounts.map(async (acc) => {
            try {
                const data = await fb.get(`/${acc.id}/insights`, {
                    accessToken: creds.token,
                    params: {
                        fields: 'impressions,clicks,spend,reach,ctr,cpc,cpm',
                        date_preset: datePreset,
                        level: 'account'
                    }
                });
                const row = (data.data && data.data[0]) || {};
                return {
                    account_id: acc.id,
                    account_name: acc.name,
                    currency: acc.currency,
                    ...row
                };
            } catch (e) {
                console.warn(`[insights] ${acc.id}:`, e.message);
                return { account_id: acc.id, account_name: acc.name, currency: acc.currency };
            }
        }));

        const totals = {
            spend:       sumNumeric(results, 'spend'),
            impressions: sumNumeric(results, 'impressions'),
            clicks:      sumNumeric(results, 'clicks'),
            reach:       sumNumeric(results, 'reach')
        };

        const averages = {
            ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
            cpc: totals.clicks      > 0 ? (totals.spend / totals.clicks)           : 0,
            cpm: totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0
        };

        res.json({
            account_count: accounts.length,
            date_preset: datePreset,
            totals,
            averages
        });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/insights/by-account ─────────────────────────────
router.get('/by-account', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    const datePreset = req.query.date_preset || 'last_30d';

    try {
        const accounts = await listAdAccounts(creds.token);
        const rows = await Promise.all(accounts.map(async (acc) => {
            try {
                const data = await fb.get(`/${acc.id}/insights`, {
                    accessToken: creds.token,
                    params: {
                        fields: 'impressions,clicks,spend,reach',
                        date_preset: datePreset,
                        level: 'account'
                    }
                });
                const row = (data.data && data.data[0]) || {};
                return {
                    account_id: acc.id,
                    account_name: acc.name,
                    currency: acc.currency,
                    spend:       Number(row.spend) || 0,
                    impressions: Number(row.impressions) || 0,
                    clicks:      Number(row.clicks) || 0,
                    reach:       Number(row.reach) || 0
                };
            } catch {
                return {
                    account_id: acc.id, account_name: acc.name,
                    currency: acc.currency, spend: 0, impressions: 0, clicks: 0, reach: 0
                };
            }
        }));

        // Ordenar por gasto descendente
        rows.sort((a, b) => b.spend - a.spend);

        res.json({ rows });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/insights/time-series ────────────────────────────
router.get('/time-series', async (req, res, next) => {
    const creds = getTokenOrFail(req, res);
    if (!creds) return;

    const datePreset = req.query.date_preset || 'last_30d';

    try {
        const accounts = await listAdAccounts(creds.token);
        // Consulta con time_increment=1 = diario
        const buckets = new Map(); // date_start → { spend, impressions, clicks }

        await Promise.all(accounts.map(async (acc) => {
            try {
                const list = await fb.paginate(`/${acc.id}/insights`, {
                    accessToken: creds.token,
                    params: {
                        fields: 'impressions,clicks,spend,date_start,date_stop',
                        date_preset: datePreset,
                        level: 'account',
                        time_increment: 1
                    }
                }, 10);
                for (const row of list) {
                    const key = row.date_start;
                    if (!buckets.has(key)) {
                        buckets.set(key, { date: key, spend: 0, impressions: 0, clicks: 0 });
                    }
                    const b = buckets.get(key);
                    b.spend       += Number(row.spend) || 0;
                    b.impressions += Number(row.impressions) || 0;
                    b.clicks      += Number(row.clicks) || 0;
                }
            } catch (e) {
                console.warn(`[insights time-series] ${acc.id}:`, e.message);
            }
        }));

        const series = Array.from(buckets.values())
            .sort((a, b) => a.date.localeCompare(b.date));

        res.json({ series });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
