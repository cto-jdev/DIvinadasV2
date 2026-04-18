/**
 * server/oauth.js
 * ===============
 * Flujo OAuth2 de Facebook Login for Business.
 *
 *   1. GET  /api/oauth/start     → redirige al consent screen de Meta
 *   2. GET  /api/oauth/callback  → recibe `code`, lo intercambia por token
 *                                  de corta duración, lo upgrade a long-lived
 *                                  (60 días), guarda en token-store y cierra
 *                                  la pestaña con un postMessage a la extensión.
 *   3. GET  /api/me              → lista cuentas conectadas (sin exponer token)
 *   4. POST /api/disconnect/:uid → revoca permisos en FB y borra del store
 *   5. POST /api/refresh/:uid    → fuerza refresh del long-lived token
 *
 * Seguridad:
 *  - `state` se firma con HMAC-SHA256 usando OAUTH_STATE_SECRET (anti-CSRF).
 *  - El App Secret nunca sale del servidor.
 *  - Los tokens se cifran en reposo en tokens.json.
 */

'use strict';

const axios = require('axios');
const crypto = require('crypto');
const tokenStore = require('./token-store');
const fb = require('./fb-client');

const APP_ID = process.env.FB_APP_ID;
const APP_SECRET = process.env.FB_APP_SECRET;
const REDIRECT_URI = process.env.FB_REDIRECT_URI;
const API_VERSION = process.env.FB_API_VERSION || 'v20.0';
const SCOPES = (process.env.FB_OAUTH_SCOPES || 'public_profile,email').split(',').map(s => s.trim());
const STATE_SECRET = process.env.OAUTH_STATE_SECRET || 'dev-secret-change-me';

function assertConfigured() {
    const missing = [];
    if (!APP_ID) missing.push('FB_APP_ID');
    if (!APP_SECRET) missing.push('FB_APP_SECRET');
    if (!REDIRECT_URI) missing.push('FB_REDIRECT_URI');
    if (missing.length) {
        throw new Error(`[oauth] Variables de entorno faltantes: ${missing.join(', ')}. Revisa tu .env`);
    }
}

// ─── state anti-CSRF firmado ──────────────────────────────────
function signState(nonce) {
    const hmac = crypto.createHmac('sha256', STATE_SECRET).update(nonce).digest('hex');
    return `${nonce}.${hmac}`;
}

function verifyState(state) {
    if (!state || typeof state !== 'string') return false;
    const [nonce, sig] = state.split('.');
    if (!nonce || !sig) return false;
    const expected = crypto.createHmac('sha256', STATE_SECRET).update(nonce).digest('hex');
    try {
        return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    } catch { return false; }
}

// ─── Handlers de rutas ────────────────────────────────────────

/**
 * GET /api/oauth/start
 * Redirige al consent screen. Opcionalmente recibe ?return_to= para
 * volver a la URL correcta de la extensión tras el callback.
 */
function start(req, res) {
    try {
        assertConfigured();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

    const nonce = crypto.randomBytes(16).toString('hex');
    const returnTo = req.query.return_to || '';
    // Guardamos return_to dentro del state (codificado) para recuperarlo en callback.
    const payload = Buffer.from(JSON.stringify({ n: nonce, r: returnTo })).toString('base64url');
    const state = signState(payload);

    const url = new URL(`https://www.facebook.com/${API_VERSION}/dialog/oauth`);
    url.searchParams.set('client_id', APP_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('state', state);
    url.searchParams.set('scope', SCOPES.join(','));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('auth_type', 'rerequest'); // permite re-pedir permisos denegados

    res.redirect(url.toString());
}

/**
 * GET /api/oauth/callback
 * Intercambia `code` → short-lived → long-lived, guarda el token,
 * devuelve una página HTML que notifica a la ventana opener y se cierra.
 */
async function callback(req, res) {
    try {
        assertConfigured();
    } catch (err) {
        return res.status(500).send(`<pre>${err.message}</pre>`);
    }

    const { code, state, error, error_description } = req.query;

    if (error) {
        return res.status(400).send(renderResultPage({
            ok: false,
            title: 'Conexión cancelada',
            message: error_description || error
        }));
    }

    if (!verifyState(state)) {
        return res.status(400).send(renderResultPage({
            ok: false,
            title: 'Estado inválido',
            message: 'El parámetro state no pasó la verificación (posible CSRF).'
        }));
    }

    let returnTo = '';
    try {
        const payload = JSON.parse(Buffer.from(state.split('.')[0], 'base64url').toString());
        returnTo = payload.r || '';
    } catch { /* ignore */ }

    try {
        // 1. code → short-lived token
        const shortResp = await axios.get(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`, {
            params: {
                client_id: APP_ID,
                client_secret: APP_SECRET,
                redirect_uri: REDIRECT_URI,
                code
            },
            timeout: 30000
        });
        const shortToken = shortResp.data.access_token;

        // 2. short → long-lived (60 días)
        const longResp = await axios.get(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: APP_ID,
                client_secret: APP_SECRET,
                fb_exchange_token: shortToken
            },
            timeout: 30000
        });
        const longToken = longResp.data.access_token;
        const expiresIn = longResp.data.expires_in; // segundos

        // 3. Obtener datos del usuario para guardar metadatos
        const me = await fb.get('/me', {
            accessToken: longToken,
            params: { fields: 'id,name,email,picture.width(200).height(200)' }
        });

        // 4. Obtener scopes concedidos (no los solicitados)
        const permissions = await fb.get(`/${me.id}/permissions`, { accessToken: longToken });
        const grantedScopes = (permissions.data || [])
            .filter(p => p.status === 'granted')
            .map(p => p.permission)
            .join(',');

        // 5. Persistir
        tokenStore.save(me.id, {
            access_token: longToken,
            expires_in: expiresIn,
            scope: grantedScopes,
            user_name: me.name,
            email: me.email || '',
            picture: me.picture?.data?.url || ''
        });

        // 6. Devolver HTML que avisa a la extensión y se cierra
        return res.send(renderResultPage({
            ok: true,
            title: '¡Cuenta conectada!',
            message: `${me.name} se conectó correctamente.`,
            uid: me.id,
            returnTo
        }));
    } catch (err) {
        console.error('[oauth] callback error:', err.response?.data || err.message);
        const fbMsg = err.response?.data?.error?.message || err.message;
        return res.status(500).send(renderResultPage({
            ok: false,
            title: 'Error al conectar',
            message: fbMsg
        }));
    }
}

/**
 * GET /api/me
 * Lista cuentas conectadas (metadatos, sin exponer tokens).
 */
function me(req, res) {
    res.json({ accounts: tokenStore.list() });
}

/**
 * POST /api/disconnect/:uid
 * Revoca permisos en FB y borra del store local.
 */
async function disconnect(req, res) {
    const { uid } = req.params;
    const token = tokenStore.getToken(uid);
    if (!token) {
        return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    try {
        await fb.delete(`/${uid}/permissions`, { accessToken: token });
    } catch (err) {
        // Si el token ya está revocado en FB, igual borramos local
        console.warn('[oauth] disconnect error (continuando):', err.message);
    }
    tokenStore.remove(uid);
    res.json({ ok: true, uid });
}

/**
 * POST /api/refresh/:uid
 * Fuerza refresh del long-lived token (se puede automatizar con cron).
 */
async function refresh(req, res) {
    const { uid } = req.params;
    const token = tokenStore.getToken(uid);
    if (!token) {
        return res.status(404).json({ error: 'Cuenta no encontrada' });
    }
    try {
        const resp = await axios.get(`https://graph.facebook.com/${API_VERSION}/oauth/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: APP_ID,
                client_secret: APP_SECRET,
                fb_exchange_token: token
            },
            timeout: 30000
        });
        tokenStore.save(uid, {
            access_token: resp.data.access_token,
            expires_in: resp.data.expires_in
        });
        res.json({ ok: true, expires_in: resp.data.expires_in });
    } catch (err) {
        const fbMsg = err.response?.data?.error?.message || err.message;
        res.status(500).json({ error: fbMsg });
    }
}

// ─── HTML de resultado post-callback ──────────────────────────
function renderResultPage({ ok, title, message, uid, returnTo }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
  .card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 40px; max-width: 420px; text-align: center; }
  h1 { margin: 0 0 16px; font-size: 22px; color: ${ok ? '#10b981' : '#ef4444'}; }
  p { margin: 0 0 20px; color: #cbd5e1; }
  .hint { font-size: 13px; color: #94a3b8; }
  .spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.2);
             border-top-color: #10b981; border-radius: 50%; margin: 0 auto;
             animation: spin 1s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
</style>
</head>
<body>
<div class="card">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
  ${ok ? '<div class="spinner"></div><p class="hint">Esta ventana se cerrará automáticamente…</p>' : '<p class="hint">Puedes cerrar esta ventana.</p>'}
</div>
<script>
  const result = ${JSON.stringify({ ok, uid: uid || null, returnTo: returnTo || '' })};
  try {
    if (window.opener) {
      window.opener.postMessage({ source: 'divinads-oauth', ...result }, '*');
    }
  } catch(e) {}
  if (result.ok) {
    setTimeout(() => {
      if (result.returnTo) { window.location.href = result.returnTo; }
      else { window.close(); }
    }, 1500);
  }
</script>
</body>
</html>`;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = {
    start,
    callback,
    me,
    disconnect,
    refresh
};
