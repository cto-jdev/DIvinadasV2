'use strict';

const PANEL_URL = 'https://app.divinads.com/panel';

function send(msg) {
    return new Promise((res, rej) =>
        chrome.runtime.sendMessage(msg, r =>
            chrome.runtime.lastError ? rej(chrome.runtime.lastError) : res(r)));
}

function show(viewId) {
    ['view-connected', 'view-pair', 'view-loading'].forEach(id => {
        document.getElementById(id).style.display = id === viewId ? 'block' : 'none';
    });
}

async function init() {
    show('view-loading');
    const r = await send({ type: 'GET_STATUS' });
    if (r.state === 'connected') {
        document.getElementById('tenant-label').textContent = r.tenant_id?.slice(0, 8) + '…';
        show('view-connected');
    } else {
        show('view-pair');
    }
}

document.getElementById('btn-panel').addEventListener('click', () => {
    chrome.tabs.create({ url: PANEL_URL });
});

document.getElementById('btn-disconnect').addEventListener('click', async () => {
    if (!confirm('¿Desconectar esta instalación?')) return;
    await send({ type: 'DISCONNECT' });
    show('view-pair');
});

document.getElementById('btn-pair').addEventListener('click', async () => {
    const code = document.getElementById('code-input').value.trim();
    const errEl = document.getElementById('pair-err');
    errEl.textContent = '';
    if (!/^\d{6}$/.test(code)) {
        errEl.textContent = 'El código debe ser exactamente 6 dígitos.';
        return;
    }
    const btn = document.getElementById('btn-pair');
    btn.disabled = true; btn.textContent = 'Conectando…';
    const r = await send({ type: 'PAIR', code });
    btn.disabled = false; btn.textContent = 'Conectar';
    if (r.ok) {
        await init();
    } else {
        errEl.textContent = r.error === 'already_used'  ? 'Código ya usado. Genera uno nuevo en el panel.' :
                            r.error === 'expired'        ? 'Código expirado. Genera uno nuevo en el panel.' :
                            r.error === 'not_found'      ? 'Código incorrecto.' :
                            r.error === 'rate_limited'   ? 'Demasiados intentos. Espera unos minutos.' :
                            `Error: ${r.error}`;
    }
});

// Solo permite dígitos en el input
document.getElementById('code-input').addEventListener('input', function () {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
});

init();
