/**
 * server/fb-client.js
 * ===================
 * Wrapper sobre Graph API / Marketing API de Facebook.
 *
 * - Usa axios con timeout y retry exponencial para errores transitorios.
 * - Respeta X-Business-Use-Case-Usage y X-App-Usage para rate limiting.
 * - Parsea errores de Facebook y los mapea a Error con campos útiles.
 *
 * Docs:
 *  - https://developers.facebook.com/docs/graph-api/overview
 *  - https://developers.facebook.com/docs/graph-api/overview/rate-limiting
 */

'use strict';

const axios = require('axios');

const API_VERSION = process.env.FB_API_VERSION || 'v20.0';
const BASE_URL = `https://graph.facebook.com/${API_VERSION}`;
const DEFAULT_TIMEOUT = 30000;
const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 1000;

// ─── Error tipado ─────────────────────────────────────────────
class FacebookApiError extends Error {
    constructor(message, { status, code, subcode, fbtrace_id, type, is_transient } = {}) {
        super(message);
        this.name = 'FacebookApiError';
        this.status = status;
        this.code = code;
        this.subcode = subcode;
        this.fbtrace_id = fbtrace_id;
        this.type = type;
        this.is_transient = !!is_transient;
    }
}

function parseFbError(err) {
    const data = err.response?.data?.error;
    if (!data) {
        return new FacebookApiError(err.message || 'Unknown FB error', {
            status: err.response?.status
        });
    }
    return new FacebookApiError(data.message, {
        status: err.response?.status,
        code: data.code,
        subcode: data.error_subcode,
        fbtrace_id: data.fbtrace_id,
        type: data.type,
        is_transient: data.is_transient
    });
}

// ─── Rate limit awareness ─────────────────────────────────────
function logRateLimit(response) {
    const buc = response.headers['x-business-use-case-usage'];
    const appUsage = response.headers['x-app-usage'];
    if (!buc && !appUsage) return;
    try {
        if (appUsage) {
            const usage = JSON.parse(appUsage);
            if (usage.call_count >= 90 || usage.total_time >= 90 || usage.total_cputime >= 90) {
                console.warn('[fb-client] ⚠️  Rate limit cerca del tope:', usage);
            }
        }
    } catch (_) { /* no parse */ }
}

// ─── Retry con backoff exponencial ────────────────────────────
function shouldRetry(err, attempt) {
    if (attempt >= MAX_RETRIES) return false;
    if (!err.response) return true; // error de red
    const status = err.response.status;
    if (status === 429) return true; // rate limit
    if (status >= 500 && status < 600) return true; // servidor FB
    const fbCode = err.response.data?.error?.code;
    // Códigos transitorios conocidos de Facebook:
    if ([1, 2, 4, 17, 32, 341, 613].includes(fbCode)) return true;
    return false;
}

async function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Request core ─────────────────────────────────────────────
async function request(method, endpoint, { accessToken, params, data, headers } = {}) {
    if (!accessToken) {
        throw new FacebookApiError('accessToken requerido', { status: 401, code: 190 });
    }

    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const finalParams = { access_token: accessToken, ...(params || {}) };

    // appsecret_proof: HMAC-SHA256(access_token, APP_SECRET). Meta lo valida
    // cuando la app tiene "Require App Secret" activado. Lo añadimos si está
    // el secret disponible — previene uso del token desde otra app.
    if (process.env.FB_APP_SECRET && !finalParams.appsecret_proof) {
        finalParams.appsecret_proof = appSecretProof(accessToken, process.env.FB_APP_SECRET);
    }

    let attempt = 0;
    while (true) {
        try {
            const res = await axios({
                method,
                url,
                params: finalParams,
                data,
                headers,
                timeout: DEFAULT_TIMEOUT,
                validateStatus: s => s >= 200 && s < 300
            });
            logRateLimit(res);
            return res.data;
        } catch (err) {
            if (shouldRetry(err, attempt)) {
                const backoff = RETRY_BACKOFF_MS * Math.pow(2, attempt);
                console.warn(`[fb-client] retry ${attempt + 1}/${MAX_RETRIES} en ${backoff}ms: ${err.message}`);
                await sleep(backoff);
                attempt++;
                continue;
            }
            throw parseFbError(err);
        }
    }
}

// ─── Helpers de alto nivel ────────────────────────────────────

function get(endpoint, opts = {}) {
    return request('GET', endpoint, opts);
}

function post(endpoint, opts = {}) {
    return request('POST', endpoint, opts);
}

function del(endpoint, opts = {}) {
    return request('DELETE', endpoint, opts);
}

/**
 * Pagina un endpoint que devuelve { data: [...], paging: { next: '...' } }
 * hasta agotar o llegar a maxPages.
 */
async function paginate(endpoint, opts = {}, maxPages = 10) {
    const results = [];
    let url = endpoint;
    let firstCall = true;
    for (let page = 0; page < maxPages; page++) {
        const res = firstCall
            ? await get(url, opts)
            : await get(url, { accessToken: opts.accessToken });
        firstCall = false;
        if (Array.isArray(res.data)) results.push(...res.data);
        if (!res.paging?.next) break;
        url = res.paging.next;
    }
    return results;
}

/**
 * Genera el appsecret_proof requerido por Meta para llamadas server-side
 * cuando se marca la app como "Require App Secret" (recomendado).
 */
function appSecretProof(accessToken, appSecret) {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex');
}

module.exports = {
    BASE_URL,
    API_VERSION,
    get,
    post,
    delete: del,
    paginate,
    appSecretProof,
    FacebookApiError
};
