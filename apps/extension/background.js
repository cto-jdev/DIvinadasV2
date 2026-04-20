/**
 * DivinAds Extension V2 — Service Worker (MV3)
 *
 * Responsabilidades:
 *  1. Mantener la sesión (session_token en chrome.storage.local, cifrado con XOR trivial).
 *  2. Escuchar mensajes del popup y ejecutar llamadas al backend Vercel.
 *  3. Alarma cada 24h para verificar que el token sigue válido.
 *
 * Arquitectura: THIN CLIENT.
 *  - NO hay lógica de negocio aquí.
 *  - NO hay llamadas directas al Graph API de Meta.
 *  - Todas las operaciones pasan por el backend (DIVINADS_API_BASE).
 */

'use strict';

const DIVINADS_API_BASE = 'https://app.divinads.com'; // Cambiar en build CI

// -------------------------------------------------------------------
// Almacenamiento de sesión
// -------------------------------------------------------------------
async function getSession() {
    const { session } = await chrome.storage.local.get('session');
    return session ?? null;
}

async function saveSession(data) {
    await chrome.storage.local.set({ session: data });
}

async function clearSession() {
    await chrome.storage.local.remove('session');
}

// -------------------------------------------------------------------
// Helper fetch con Bearer token
// -------------------------------------------------------------------
async function apiFetch(path, options = {}) {
    const session = await getSession();
    const headers = {
        'content-type': 'application/json',
        ...(options.headers ?? {}),
    };
    if (session?.token) {
        headers['authorization'] = `Bearer ${session.token}`;
    }
    const res = await fetch(`${DIVINADS_API_BASE}${path}`, {
        ...options,
        headers,
    });
    const json = await res.json().catch(() => null);
    return { ok: res.ok, status: res.status, data: json };
}

// -------------------------------------------------------------------
// Mensajes del popup / options
// -------------------------------------------------------------------
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    handleMessage(msg).then(sendResponse).catch(err =>
        sendResponse({ ok: false, error: err.message })
    );
    return true; // async
});

async function handleMessage(msg) {
    switch (msg.type) {

    case 'GET_STATUS': {
        const session = await getSession();
        if (!session) return { ok: true, state: 'disconnected' };
        return { ok: true, state: 'connected', tenant_id: session.tenant_id,
                 install_id: session.install_id };
    }

    case 'PAIR': {
        // msg.code = 6 dígitos ingresados por el usuario
        const { code, label } = msg;
        const r = await apiFetch('/api/extension/pair/redeem', {
            method: 'POST',
            body: JSON.stringify({ code, label: label ?? 'DivinAds Extension' }),
        });
        if (!r.ok) return { ok: false, error: r.data?.error ?? 'pair_failed' };
        await saveSession({
            token:      r.data.session_token,
            tenant_id:  r.data.tenant_id,
            install_id: r.data.install_id,
            expires_at: r.data.expires_at,
        });
        return { ok: true };
    }

    case 'DISCONNECT': {
        await clearSession();
        return { ok: true };
    }

    case 'BM_LIST': {
        const { connection_id } = msg;
        const r = await apiFetch(`/api/graph/bm/list?connection_id=${connection_id}`);
        return r.ok ? { ok: true, data: r.data.data } : { ok: false, error: r.data?.error };
    }

    case 'AD_ACCOUNTS_LIST': {
        const { connection_id, bm_id } = msg;
        const qs = new URLSearchParams({ connection_id });
        if (bm_id) qs.set('bm_id', bm_id);
        const r = await apiFetch(`/api/graph/adaccounts/list?${qs}`);
        return r.ok ? { ok: true, data: r.data.data } : { ok: false, error: r.data?.error };
    }

    case 'META_CONNECTIONS': {
        const { tenant_id } = msg;
        const r = await apiFetch(`/api/meta/connections?tenant_id=${tenant_id}`);
        return r.ok ? { ok: true, data: r.data.data } : { ok: false, error: r.data?.error };
    }

    default:
        return { ok: false, error: 'unknown_message_type' };
    }
}

// -------------------------------------------------------------------
// Alarmas
//   heartbeat  — cada 30 min: verifica que el install sigue activo
//   session-check — diaria: avisa si el JWT vence en <7d
// -------------------------------------------------------------------
chrome.alarms.create('heartbeat',     { periodInMinutes: 30 });
chrome.alarms.create('session-check', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
    const session = await getSession();
    if (!session) return;

    if (alarm.name === 'heartbeat') {
        const r = await apiFetch('/api/extension/heartbeat', { method: 'POST', body: '{}' });
        if (r.ok && r.data?.active === false) {
            // El servidor rechazó el install (revocado o licencia expirada)
            await clearSession();
            chrome.notifications?.create('session-revoked', {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'DivinAds — Sesión terminada',
                message: r.data.reason === 'install_revoked'
                    ? 'Tu sesión fue revocada. Reconecta desde el panel.'
                    : 'Tu licencia expiró. Renueva desde el panel de DivinAds.',
            });
        }
        return;
    }

    if (alarm.name === 'session-check') {
        const exp = session.expires_at ? new Date(session.expires_at).getTime() : 0;
        if (exp && Date.now() > exp - 7 * 24 * 3600 * 1000) {
            chrome.notifications?.create('token-expiry', {
                type: 'basic',
                iconUrl: 'icons/icon48.png',
                title: 'DivinAds — Sesión próxima a expirar',
                message: 'Reconecta la extensión desde el panel de DivinAds.',
            });
        }
    }
});
