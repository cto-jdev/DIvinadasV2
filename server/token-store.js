/**
 * server/token-store.js
 * =====================
 * Almacén persistente de tokens OAuth de Facebook.
 *
 * Estructura en disco (tokens.json):
 * {
 *   "<fb_user_id>": {
 *     "access_token": "<encrypted>",
 *     "expires_at":   1740000000000,    // epoch ms
 *     "scope":        "ads_read,ads_management,...",
 *     "user_name":    "Juan Pérez",
 *     "email":        "juan@example.com",
 *     "picture":      "https://...",
 *     "connected_at": 1734000000000,
 *     "last_refreshed": 1734000000000
 *   }
 * }
 *
 * Los access_token se cifran en reposo con AES-256-GCM usando
 * TOKEN_ENCRYPTION_KEY del .env. Sin la clave, un atacante que
 * robe tokens.json no puede usar los tokens.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOKENS_PATH = process.env.TOKENS_PATH || path.join(__dirname, '..', 'tokens.json');
const ALGO = 'aes-256-gcm';

function getKey() {
    const hex = process.env.TOKEN_ENCRYPTION_KEY;
    if (!hex || hex.length < 64) {
        throw new Error(
            '[token-store] TOKEN_ENCRYPTION_KEY no definido o inválido. ' +
            'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
        );
    }
    return Buffer.from(hex.slice(0, 64), 'hex');
}

function encrypt(plaintext) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Formato: iv:tag:ciphertext (todo en hex)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('hex')}`;
}

function decrypt(payload) {
    const [ivHex, tagHex, ctHex] = payload.split(':');
    if (!ivHex || !tagHex || !ctHex) {
        throw new Error('[token-store] Formato de token cifrado inválido');
    }
    const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    const dec = Buffer.concat([decipher.update(Buffer.from(ctHex, 'hex')), decipher.final()]);
    return dec.toString('utf8');
}

// ─── Estado en memoria ────────────────────────────────────────
let tokens = {};

function load() {
    try {
        if (fs.existsSync(TOKENS_PATH)) {
            tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
            console.log(`[token-store] ${Object.keys(tokens).length} token(s) cargados.`);
        } else {
            tokens = {};
        }
    } catch (err) {
        console.error('[token-store] Error cargando tokens.json:', err.message);
        tokens = {};
    }
}

function persist() {
    try {
        fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2), 'utf8');
    } catch (err) {
        console.error('[token-store] Error persistiendo tokens.json:', err.message);
    }
}

// ─── API pública ──────────────────────────────────────────────

/**
 * Guarda o actualiza un token para un usuario.
 * @param {string} uid          - Facebook user ID
 * @param {object} data         - { access_token, expires_in, scope, user_name, email, picture }
 */
function save(uid, data) {
    const now = Date.now();
    const existing = tokens[uid] || {};
    tokens[uid] = {
        access_token: encrypt(data.access_token),
        expires_at: data.expires_in ? now + (data.expires_in * 1000) : null,
        scope: data.scope || existing.scope || '',
        user_name: data.user_name || existing.user_name || '',
        email: data.email || existing.email || '',
        picture: data.picture || existing.picture || '',
        connected_at: existing.connected_at || now,
        last_refreshed: now
    };
    persist();
    return tokens[uid];
}

/**
 * Devuelve los metadatos del usuario (SIN el token desencriptado).
 * Útil para listar cuentas conectadas al frontend sin exponer el token.
 */
function getMeta(uid) {
    const t = tokens[uid];
    if (!t) return null;
    return {
        uid,
        user_name: t.user_name,
        email: t.email,
        picture: t.picture,
        scope: t.scope,
        connected_at: t.connected_at,
        last_refreshed: t.last_refreshed,
        expires_at: t.expires_at,
        expires_in_days: t.expires_at
            ? Math.max(0, Math.round((t.expires_at - Date.now()) / 86400000))
            : null
    };
}

/**
 * Devuelve el access_token desencriptado. SOLO úsalo server-side
 * para llamar a Graph API. NUNCA lo envíes al frontend.
 */
function getToken(uid) {
    const t = tokens[uid];
    if (!t) return null;
    if (t.expires_at && t.expires_at < Date.now()) {
        console.warn(`[token-store] Token de ${uid} expirado.`);
        return null;
    }
    try {
        return decrypt(t.access_token);
    } catch (err) {
        console.error(`[token-store] No se pudo desencriptar token de ${uid}:`, err.message);
        return null;
    }
}

function list() {
    return Object.keys(tokens).map(getMeta);
}

function remove(uid) {
    if (tokens[uid]) {
        delete tokens[uid];
        persist();
        return true;
    }
    return false;
}

function has(uid) {
    return !!tokens[uid];
}

/**
 * Devuelve tokens que expiran en menos de N días (para cron de refresh).
 */
function expiringWithinDays(days) {
    const threshold = Date.now() + (days * 86400000);
    return Object.keys(tokens).filter(uid => {
        const t = tokens[uid];
        return t.expires_at && t.expires_at < threshold;
    });
}

// ─── Init ─────────────────────────────────────────────────────
load();

module.exports = {
    save,
    getMeta,
    getToken,
    list,
    remove,
    has,
    expiringWithinDays
};
