'use strict';

const PANEL_URL = 'https://app.divinads.com/panel';

function send(msg) {
    return new Promise((res, rej) =>
        chrome.runtime.sendMessage(msg, r =>
            chrome.runtime.lastError ? rej(chrome.runtime.lastError) : res(r)));
}

async function init() {
    const r = await send({ type: 'GET_STATUS' });
    const info = document.getElementById('session-info');
    const btn  = document.getElementById('btn-disconnect');

    if (r.state === 'connected') {
        info.textContent = `Conectado · Install ID: ${r.install_id?.slice(0, 12)}… · Tenant: ${r.tenant_id?.slice(0, 8)}…`;
        btn.style.display = 'inline-block';
    } else {
        info.textContent = 'No conectado. Usa el popup de la extensión para emparejar.';
    }

    // Cargar label guardado
    const { label } = await chrome.storage.local.get('label');
    if (label) document.getElementById('label-input').value = label;
}

document.getElementById('btn-disconnect').addEventListener('click', async () => {
    if (!confirm('¿Desconectar esta instalación?')) return;
    await send({ type: 'DISCONNECT' });
    window.location.reload();
});

document.getElementById('btn-save').addEventListener('click', async () => {
    const label = document.getElementById('label-input').value.trim();
    await chrome.storage.local.set({ label });
    document.getElementById('status').textContent = 'Guardado.';
    setTimeout(() => { document.getElementById('status').textContent = ''; }, 2000);
});

document.getElementById('btn-panel').addEventListener('click', () => {
    chrome.tabs.create({ url: PANEL_URL });
});

init();
