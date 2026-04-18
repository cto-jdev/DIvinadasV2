/**
 * js/connect.js
 * =============
 * Lógica del flujo "Conectar con Facebook" (OAuth2).
 *
 * Flujo:
 *  1. Al cargar, GET /api/me → pinta las cuentas ya conectadas.
 *  2. Click en "Conectar cuenta" → abre ventana emergente a /api/oauth/start.
 *  3. Escucha postMessage del callback OAuth para refrescar la lista.
 *  4. Click en "Desconectar" → POST /api/disconnect/:uid → refresca lista.
 *
 * La extensión y el servidor local corren en el mismo origen (localhost:8080)
 * cuando se arranca con `npm run start:oauth`, así que fetch() funciona sin CORS.
 */

'use strict';

const API_BASE = 'http://localhost:8080';

const $btnConnect    = document.getElementById('btn-connect');
const $connectedSect = document.getElementById('connected-section');
const $accountsList  = document.getElementById('accounts-list');

// ─── Render ───────────────────────────────────────────────────
function renderAccounts(accounts) {
    if (!accounts || accounts.length === 0) {
        $connectedSect.style.display = 'none';
        return;
    }
    $connectedSect.style.display = 'block';
    $accountsList.innerHTML = accounts.map(a => {
        const picUrl   = a.picture || 'img/favicon.png';
        const name     = escapeHtml(a.user_name || 'Usuario');
        const email    = escapeHtml(a.email || '');
        const expiresDays = a.expires_in_days;
        const expiryText = expiresDays !== null
            ? (expiresDays > 7
                ? `Expira en ${expiresDays} días`
                : `<span style="color:#f59e0b">Expira en ${expiresDays} días</span>`)
            : 'Sin expiración conocida';
        return `
            <div class="account-item" data-uid="${escapeHtml(a.uid)}">
                <img src="${escapeHtml(picUrl)}" alt="">
                <div class="account-meta">
                    <strong>${name}</strong>
                    <small>${email}</small>
                    <small style="display:block;">${expiryText}</small>
                </div>
                <button class="btn-disconnect" data-action="disconnect"
                        data-uid="${escapeHtml(a.uid)}">
                    Desconectar
                </button>
            </div>`;
    }).join('');
}

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ─── API calls ────────────────────────────────────────────────
async function loadAccounts() {
    try {
        const res = await fetch(`${API_BASE}/api/me`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        renderAccounts(data.accounts || []);
    } catch (err) {
        console.error('[connect] No se pudieron cargar las cuentas:', err);
        $connectedSect.style.display = 'block';
        $accountsList.innerHTML = `
            <div class="text-danger" style="font-size:13px;">
                No se pudo conectar con el servidor en ${API_BASE}.
                Asegúrate de arrancarlo con <code>npm run start:oauth</code>.
            </div>`;
    }
}

async function disconnect(uid) {
    if (!confirm('¿Desconectar esta cuenta? Se revocarán los permisos en Facebook.')) {
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/api/disconnect/${encodeURIComponent(uid)}`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await loadAccounts();
    } catch (err) {
        alert('Error al desconectar: ' + err.message);
    }
}

function openOAuthPopup() {
    const returnTo = encodeURIComponent(location.href);
    const url = `${API_BASE}/api/oauth/start?return_to=${returnTo}`;
    const w = 600, h = 700;
    const left = (screen.width - w) / 2;
    const top  = (screen.height - h) / 2;
    window.open(
        url,
        'divinads-oauth',
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
}

// ─── Wiring ───────────────────────────────────────────────────
$btnConnect.addEventListener('click', (e) => {
    e.preventDefault();
    openOAuthPopup();
});

$accountsList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action="disconnect"]');
    if (btn) {
        disconnect(btn.dataset.uid);
    }
});

// Escucha el postMessage del callback OAuth cuando se cierra la ventana emergente
window.addEventListener('message', (ev) => {
    if (ev.data?.source === 'divinads-oauth') {
        if (ev.data.ok) {
            // Pequeño delay para dar tiempo al token-store a persistir
            setTimeout(loadAccounts, 500);
        } else {
            console.warn('[connect] OAuth falló:', ev.data);
        }
    }
});

// Boot
loadAccounts();
