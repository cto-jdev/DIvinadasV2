/**
 * popup-launcher.js — Script externo para popup.html
 * Separado del HTML para cumplir con la CSP "script-src 'self'"
 */

'use strict';

const dot   = document.getElementById('statusDot');
const text  = document.getElementById('statusText');
const sub   = document.getElementById('statusSub');
const verEl = document.getElementById('ver');

// ── Botones ───────────────────────────────────────────────────
document.getElementById('btnDashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    window.close();
});

document.getElementById('btnConnect').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('fb-connect.html') });
    window.close();
});

// ── Inicialización ────────────────────────────────────────────
async function init() {
    // Versión
    try {
        const stored = await chrome.storage.local.get('ver');
        verEl.textContent = 'v' + (stored.ver || '1.0.0');
    } catch (e) {}

    // Verificar sesión de Facebook directamente desde cookies
    // (más rápido que esperar al SW que puede hacer fetch externo)
    try {
        const cookies = await chrome.cookies.getAll({ domain: 'facebook.com' });
        const cUser = cookies.find(c => c.name === 'c_user');

        if (cUser && cUser.value) {
            // Sesión detectada directo por cookie
            dot.className = 'status-dot connected';
            text.textContent = '✅ Facebook conectado';
            sub.textContent  = `uid: ${cUser.value}`;
        } else {
            dot.className = 'status-dot disconnected';
            text.textContent = '⚪ Sin sesión de Facebook';
            sub.textContent  = 'Inicia sesión en Facebook primero';
        }
    } catch (cookieErr) {
        // Cookie API falló — intentar via background como fallback
        try {
            const response = await new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error('Timeout')), 5000);
                chrome.runtime.sendMessage({ type: 'checkUser' }, (res) => {
                    clearTimeout(timer);
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(res);
                    }
                });
            });

            if (response && response.uid && !response.error) {
                dot.className = 'status-dot connected';
                text.textContent = '✅ Facebook conectado';
                sub.textContent  = `uid: ${response.uid}`;
            } else {
                dot.className = 'status-dot disconnected';
                text.textContent = '⚪ Sin sesión de Facebook';
                sub.textContent  = 'Usa "Conectar Facebook" para iniciar';
            }
        } catch (e) {
            dot.className = 'status-dot disconnected';
            text.textContent = '⚠️ Error al verificar';
            sub.textContent  = e.message;
        }
    }
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
