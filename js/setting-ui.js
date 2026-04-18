// js/setting-ui.js - DivinAds v2.0
// Migrado desde setting.html para cumplir con CSP de MV3

// ── Facebook Connection UI ──────────────────────────────
async function checkFbStatus() {
    const spinner = document.getElementById('fbStatusSpinner');
    const text    = document.getElementById('fbStatusText');
    if (spinner) spinner.classList.remove('d-none');
    try {
        // Usar sendMessage a la extensión para obtener la sesión centralizada
        const d = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: 'checkUser' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.warn('[DivinAds Setting] Error al consultar extensión:', chrome.runtime.lastError);
                    resolve({ error: 'Extensión no responde' });
                } else {
                    resolve(response || { sessions: [] });
                }
            });
        });

        if (spinner) spinner.classList.add('d-none');
        if (d.sessions && d.sessions.length > 0) {
            const s = d.sessions[0];
            if (text) text.innerHTML = `
                <span class="badge bg-success me-2">🔗 Conectado</span>
                <strong class="text-white">${s.userName || s.uid}</strong>
                <span class="text-muted ms-2">uid: ${s.uid}</span>
                <span class="badge ${s.hasToken ? 'bg-success' : 'bg-warning'} ms-2">
                    Token ${s.hasToken ? '✓' : '— solo cookie'}
                </span>`;
        } else {
            if (text) text.innerHTML = '<span class="badge bg-secondary me-2">⚠️ Sin conexión</span><span class="text-muted">No hay sesión de Facebook activa. Conecta tu cookie abajo.</span>';
        }
        loadSessions();
    } catch(e) {
        if (spinner) spinner.classList.add('d-none');
        if (text) text.innerHTML = '<span class="badge bg-danger me-2">❌ Error local</span><span class="text-muted">' + e.message + '</span>';
    }
}

async function connectFacebook() {
    const cookie = document.getElementById('fbCookieInput').value.trim();
    if (!cookie) {
        showConnectResult('error', 'Pega tu cookie de Facebook primero.');
        return;
    }
    if (!cookie.includes('c_user=')) {
        showConnectResult('error', 'La cookie debe incluir c_user=. Sigue las instrucciones arriba.');
        return;
    }
    const btn = document.getElementById('btnConnectFb');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>Conectando...';
    try {
        // Enviar cookie a la extensión para validación y persistencia
        chrome.runtime.sendMessage({ type: 'getFacebookCookies', cookie }, (response) => {
            btn.disabled = false;
            btn.innerHTML = '<i class="ri-facebook-circle-fill me-2"></i>Conectar con Facebook';
            
            if (response && response.success) {
                showConnectResult('success', `✅ ${response.message || 'Conectado con éxito'}`);
                document.getElementById('fbCookieInput').value = '';
                checkFbStatus();
                // Notificar al Dashboard principal si está abierto
                setTimeout(() => {
                    if (window.parent && window.parent.location) {
                       window.parent.location.reload();
                    } else {
                       location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showConnectResult('error', '❌ ' + (response?.error || 'Error al conectar'));
            }
        });
    } catch(e) {
        btn.disabled = false;
        btn.innerHTML = '<i class="ri-facebook-circle-fill me-2"></i>Conectar con Facebook';
        showConnectResult('error', '❌ Error de comunicación: ' + e.message);
    }
}

async function disconnectFacebook() {
    try {
        chrome.runtime.sendMessage({ type: 'clearFacebookCookies' }, (response) => {
            showConnectResult('warning', '⚠️ Todas las sesiones desconectadas.');
            checkFbStatus();
        });
    } catch(e) {
        showConnectResult('error', e.message);
    }
}

async function loadSessions() {
    const container = document.getElementById('fbSessionsList');
    if (!container) return;
    try {
        chrome.runtime.sendMessage({ type: 'checkUser' }, (d) => {
            if (!d || !d.sessions || d.sessions.length === 0) {
                container.innerHTML = '<p class="text-muted" style="font-size:13px">No hay sesiones activas.</p>';
                return;
            }
            container.innerHTML = d.sessions.map(s => `
                <div class="d-flex align-items-center justify-content-between p-3 mb-2 rounded" style="background:rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.08)">
                    <div>
                        <strong class="text-white d-block">${s.userName || 'Usuario'}</strong>
                        <small class="text-muted">uid: ${s.uid} | Token: ${s.hasToken ? '✓ disponible' : '✗ no encontrado'} | Hace: ${s.age || 'reciente'}</small>
                    </div>
                    <span class="badge bg-success">Activo</span>
                </div>`).join('');
        });
    } catch(e) {
        container.innerHTML = '<p class="text-danger" style="font-size:13px">Error cargando sesiones: ' + e.message + '</p>';
    }
}

function showConnectResult(type, msg) {
    const el = document.getElementById('connectResult');
    if (!el) return;
    const colors = { success: 'success', error: 'danger', warning: 'warning' };
    el.className = `mt-3 alert alert-${colors[type] || 'info'}`;
    el.textContent = msg;
    el.classList.remove('d-none');
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DivinAds Setting] Inicializando UI...');
    setTimeout(checkFbStatus, 500);

    // Guardar ajustes generales
    const saveBtn = document.getElementById('saveSetting');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const aiKey = document.getElementById('aiServiceKey')?.value;
            const aiService = document.getElementById('aiService')?.value;
            
            chrome.runtime.sendMessage({ 
                type: 'saveToStorage', 
                key: 'divinads_settings', 
                data: { aiKey, aiService, updatedAt: new Date().toISOString() } 
            }, (res) => {
                alert('Ajustes guardados correctamente.');
            });
        });
    }
});

// Exponer funciones necesarias para los botones definidos en HTML original
window.checkFbStatus = checkFbStatus;
window.connectFacebook = connectFacebook;
window.disconnectFacebook = disconnectFacebook;
