/**
 * background.js — DivinAds Service Worker (Manifest V3, OAuth build)
 * ==================================================================
 * Versión post-migración: sin scraping, sin cookies, sin DTSG.
 * Toda la comunicación con Meta pasa por el servidor Node en
 * http://localhost:8080 que usa Marketing API oficial.
 *
 * El service worker solo:
 *   - Registra el lifecycle MV3.
 *   - Responde a pings de la UI para verificar conectividad al backend.
 */

'use strict';

const API_BASE = 'http://localhost:8080';

self.addEventListener('install', () => {
    console.log('[DivinAds SW] instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[DivinAds SW] activo');
    event.waitUntil(self.clients.claim());
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'health') {
        fetch(`${API_BASE}/api/health`)
            .then(r => r.json())
            .then(data => sendResponse({ ok: true, data }))
            .catch(err => sendResponse({ ok: false, error: err.message }));
        return true; // async response
    }
    if (msg && msg.type === 'open-connect') {
        chrome.tabs.create({ url: chrome.runtime.getURL('connect.html') });
        sendResponse({ ok: true });
        return false;
    }
});
