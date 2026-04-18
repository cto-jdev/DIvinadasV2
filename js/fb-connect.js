/**
 * fb-connect.js — Lógica de conexión de Facebook
 * Archivo externo requerido por CSP "script-src 'self'"
 */

'use strict';

const API = 'http://localhost:8080';
const isExtensionMode = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

// ── checkStatus ────────────────────────────────────────────────
async function checkStatus() {
    const box   = document.getElementById('statusBox');
    const dot   = document.getElementById('statusDot');
    const title = document.getElementById('statusTitle');
    const sub   = document.getElementById('statusSub');

    if (isExtensionMode) {
        // == MODO EXTENSIÓN — detectar cookie directo (rápido) ==
        document.getElementById('proxyInputArea').style.display = 'none';
        document.getElementById('extensionPromptArea').style.display = 'block';

        box.className = 'status-box disconnected';
        dot.className = 'status-dot gray';
        title.textContent = '⏳ Verificando sesión de Facebook...';
        sub.textContent   = '';

        try {
            // Método rápido: leer cookies mediante domain wildcard global
            const cookies = await chrome.cookies.getAll({ domain: 'facebook.com' });
            const cUser   = cookies.find(c => c.name === 'c_user');
            const xs      = cookies.find(c => c.name === 'xs');

            if (cUser && cUser.value) {
                box.className = 'status-box connected';
                dot.className = 'status-dot green';
                title.textContent = '✅ Sesión de Facebook Detectada';
                sub.textContent   = `uid: ${cUser.value} | Sesión activa — Redirigiendo...`;

                // Guardar uid en storage para el resto de la app
                await chrome.storage.local.set({ fbUid: cUser.value });

                // Redirigir al dashboard
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);

            } else {
                box.className = 'status-box disconnected';
                dot.className = 'status-dot gray';
                title.textContent = '⚪ No estás logueado en Facebook';
                sub.textContent   = '→ Inicia sesión en Facebook con el botón de abajo y vuelve aquí';
            }

        } catch (e) {
            // Fallback: intentar via background message
            try {
                const user = await sendMessageToBackground({ type: 'checkUser' }, 6000);
                if (user && user.uid && !user.error) {
                    box.className = 'status-box connected';
                    dot.className = 'status-dot green';
                    title.textContent = '✅ Sesión de Facebook Detectada';
                    sub.textContent   = `uid: ${user.uid} | Redirigiendo...`;
                    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
                } else {
                    box.className = 'status-box disconnected';
                    dot.className = 'status-dot gray';
                    title.textContent = '⚪ Sin sesión activa en Facebook';
                    sub.textContent   = user && user.error ? user.error : '→ Usa el botón de abajo';
                }
            } catch (bgErr) {
                box.className = 'status-box error';
                dot.className = 'status-dot red';
                title.textContent = '❌ Error de extensión';
                sub.textContent   = bgErr.message;
            }
        }

    } else {
        // == MODO PROXY (LocalNode) ==
        document.getElementById('proxyInputArea').style.display = 'block';
        document.getElementById('extensionPromptArea').style.display = 'none';

        try {
            const r = await fetch(`${API}/api/fb-session`);
            const d = await r.json();

            if (d.sessions && d.sessions.length > 0) {
                const s = d.sessions[0];
                box.className = 'status-box connected';
                dot.className = 'status-dot green';
                title.textContent = `✅ Conectado — ${s.userName || 'Usuario Facebook'}`;
                sub.textContent   = `uid: ${s.uid} | Token: ${s.hasToken ? '✓ disponible' : '⚠ solo cookie'} | Hace ${s.age}`;
                renderSessions(d.sessions);
                setTimeout(() => { window.location.href = 'index.html'; }, 1500);
            } else {
                box.className = 'status-box disconnected';
                dot.className = 'status-dot gray';
                title.textContent = '⚪ Sin sesión activa';
                sub.textContent   = 'Pega tu cookie de Facebook abajo y presiona Conectar';
                document.getElementById('sessionsList').style.display = 'none';
            }
        } catch (e) {
            box.className = 'status-box error';
            dot.className = 'status-dot red';
            title.textContent = '❌ Servidor no disponible';
            sub.textContent   = 'Asegúrate de que npm start esté corriendo en la carpeta app';
        }
    }
}

// ── Helper: sendMessage con Promise ───────────────────────────
function sendMessageToBackground(msg, timeoutMs) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout del service worker')), timeoutMs || 6000);
        try {
            chrome.runtime.sendMessage(msg, (response) => {
                clearTimeout(timer);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        } catch (err) {
            clearTimeout(timer);
            reject(err);
        }
    });
}

// ── Conectar Facebook (modo proxy) ────────────────────────────
async function connectFacebook() {
    if (isExtensionMode) return;
    const cookie = document.getElementById('cookieInput').value.trim();
    const btn    = document.getElementById('btnConnectProxy');

    if (!cookie) {
        showResult('error', '⚠️ Pega tu cookie de Facebook primero.');
        return;
    }
    if (!cookie.includes('c_user=')) {
        showResult('error', '❌ La cookie debe incluir c_user=XXX. Sigue los pasos de arriba.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner-sm"></div> Conectando con Facebook...';

    try {
        const r = await fetch(`${API}/api/fb-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cookie })
        });
        const d = await r.json();

        if (d.success) {
            document.getElementById('cookieInput').value = '';
            showResult('success', d.message);
            await checkStatus();
        } else {
            showResult('error', '❌ ' + (d.error || 'Error al conectar. Revisa que la cookie sea válida.'));
        }
    } catch (e) {
        showResult('error', '❌ No se pudo conectar al servidor en localhost:8080. ¿Está corriendo npm start?');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ri-facebook-circle-fill"></i> Conectar Proxy con Facebook';
    }
}

// ── Desconectar sesiones (modo proxy) ─────────────────────────
async function disconnectAll() {
    if (isExtensionMode) return;
    try {
        await fetch(`${API}/api/fb-session`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        showResult('warning', '⚠️ Todas las sesiones fueron desconectadas.');
        await checkStatus();
    } catch (e) {
        showResult('error', 'Error: ' + e.message);
    }
}

// ── Render sesiones proxy ─────────────────────────────────────
function renderSessions(sessions) {
    const list = document.getElementById('sessionsList');
    const cont = document.getElementById('sessionsContainer');
    if (!sessions || sessions.length === 0) { list.style.display = 'none'; return; }
    cont.innerHTML = sessions.map(s => `
        <div class="session-item">
            <div>
                <div class="session-name">${s.userName || 'Usuario Facebook'}</div>
                <div class="session-meta">
                    uid: ${s.uid} &nbsp;·&nbsp;
                    Token: ${s.hasToken ? '✓ disponible' : '⚠ solo cookie'} &nbsp;·&nbsp;
                    Hace ${s.age}
                </div>
            </div>
            <span class="badge-active">Activo</span>
        </div>
    `).join('');
    list.style.display = 'block';
}

// ── Mostrar resultado ─────────────────────────────────────────
function showResult(type, msg) {
    const box = document.getElementById('resultBox');
    box.className = `result-box ${type}`;
    box.textContent = msg;
    box.style.display = 'block';
    setTimeout(() => { if (box.className.includes('success')) box.style.display = 'none'; }, 4000);
}

// ── Botón abrir Facebook (extensión) ─────────────────────────
function openFacebook() {
    if (isExtensionMode) {
        chrome.tabs.create({ url: 'https://www.facebook.com/' });
    } else {
        window.open('https://www.facebook.com/', '_blank');
    }
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    checkStatus();
    setInterval(checkStatus, 30000);

    const cookieInput = document.getElementById('cookieInput');
    if (cookieInput) {
        cookieInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') connectFacebook();
        });
    }

    // Botones Modo Proxy
    const btnConnectProxy = document.getElementById('btnConnectProxy');
    if (btnConnectProxy) btnConnectProxy.addEventListener('click', connectFacebook);

    const btnDisconnectAll = document.getElementById('btnDisconnectAll');
    if (btnDisconnectAll) btnDisconnectAll.addEventListener('click', disconnectAll);

    // Botones Modo Extensión
    const btnOpenFacebook = document.getElementById('btnOpenFacebook');
    if (btnOpenFacebook) btnOpenFacebook.addEventListener('click', openFacebook);

    const btnReloadDashboard = document.getElementById('btnReloadDashboard');
    if (btnReloadDashboard) btnReloadDashboard.addEventListener('click', () => {
        location.href = 'index.html';
    });
});
