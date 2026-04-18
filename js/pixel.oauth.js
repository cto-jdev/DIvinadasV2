/**
 * js/pixel.oauth.js
 * =================
 * Health check de Facebook Pixels.
 * Consume /api/pixel?uid=...&act_id=...
 */

'use strict';

const API_BASE = 'http://localhost:8080';

const $accountSelect = document.getElementById('account-select');
const $actSelect     = document.getElementById('act-select');
const $btnRefresh    = document.getElementById('btn-refresh');
const $count         = document.getElementById('count');
const $gridDiv       = document.getElementById('pixel-grid');
const $emptyState    = document.getElementById('empty-state');
const $emptyTitle    = document.getElementById('empty-title');
const $emptyMsg      = document.getElementById('empty-msg');

let gridApi = null;

const HEALTH_LABEL = {
    HEALTHY:  'Activo',
    WARNING:  'Sin actividad reciente',
    INACTIVE: 'Inactivo',
    UNKNOWN:  'Desconocido'
};

const columnDefs = [
    {
        field: 'health',
        headerName: 'Estado',
        cellRenderer: p => {
            const s = p.value || 'UNKNOWN';
            return `<span class="health-pill health-${s}">
                <span class="health-dot"></span>${HEALTH_LABEL[s] || s}
            </span>`;
        }
    },
    {
        field: 'name',
        headerName: 'Pixel',
        minWidth: 220,
        cellRenderer: p => `
            <div>
                <strong>${escapeHtml(p.data.name || '')}</strong>
                <div style="font-size:11px;color:#94a3b8;">${escapeHtml(p.data.id || '')}</div>
            </div>`
    },
    {
        field: 'last_fired_time',
        headerName: 'Último evento',
        valueFormatter: p => p.value ? new Date(p.value).toLocaleString() : '—'
    },
    {
        field: 'hours_since_fire',
        headerName: 'Horas desde',
        type: 'numericColumn',
        valueFormatter: p => p.value == null ? '—'
            : p.value < 1 ? 'hace menos de 1h'
            : p.value < 48 ? `${p.value}h`
            : `${Math.round(p.value / 24)}d`
    },
    {
        field: 'owner_ad_account',
        headerName: 'Ad account',
        valueFormatter: p => p.value ? p.value.name : '—'
    },
    {
        field: 'creation_time',
        headerName: 'Creado',
        valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString() : ''
    }
];

const gridOptions = {
    columnDefs,
    rowData: [],
    rowHeight: 50,
    defaultColDef: { flex: 1, minWidth: 100, sortable: true, resizable: true, filter: true },
    localeText: { noRowsToShow: 'Sin pixels en esta cuenta' },
    getRowId: p => p.data.id
};

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

function showEmpty(title, msg) {
    $emptyState.style.display = 'block';
    $gridDiv.style.display = 'none';
    $emptyTitle.textContent = title;
    $emptyMsg.innerHTML = msg;
}
function hideEmpty() {
    $emptyState.style.display = 'none';
    $gridDiv.style.display = '';
}

async function loadAccounts() {
    try {
        const data = await fetchJson(`${API_BASE}/api/me`);
        const accounts = data.accounts || [];
        $accountSelect.innerHTML = '<option value="">Cuenta…</option>' +
            accounts.map(a => `
                <option value="${escapeHtml(a.uid)}">
                    ${escapeHtml(a.user_name || a.uid)}
                </option>
            `).join('');

        if (accounts.length === 0) {
            showEmpty('Sin cuenta conectada',
                'Conecta tu cuenta en <a href="connect.html">Cuentas</a>.');
            return;
        }

        const saved = localStorage.getItem('divinads.selectedUid');
        const uid = saved && accounts.find(a => a.uid === saved) ? saved : accounts[0].uid;
        $accountSelect.value = uid;
        await loadAdAccounts(uid);
    } catch (err) {
        console.error('[pixel.oauth] loadAccounts:', err);
        showEmpty('Servidor no disponible',
            `No se pudo conectar a <code>${API_BASE}</code>. Arranca con <code>npm run start:oauth</code>.`);
    }
}

async function loadAdAccounts(uid) {
    if (!uid) return;
    localStorage.setItem('divinads.selectedUid', uid);
    try {
        const data = await fetchJson(`${API_BASE}/api/ads?uid=${encodeURIComponent(uid)}`);
        const rows = data.rows || [];
        $actSelect.innerHTML = '<option value="">Ad account…</option>' +
            rows.map(a => `
                <option value="${escapeHtml(a.id)}">
                    ${escapeHtml(a.name || a.account_id)}
                </option>
            `).join('');

        if (rows.length === 0) {
            showEmpty('Sin ad accounts', 'Esta cuenta no tiene ad accounts accesibles.');
            return;
        }

        const savedAct = localStorage.getItem('divinads.selectedActId');
        const actId = savedAct && rows.find(r => r.id === savedAct) ? savedAct : rows[0].id;
        $actSelect.value = actId;
        await loadPixels(uid, actId);
    } catch (err) {
        console.error('[pixel.oauth] loadAdAccounts:', err);
        showEmpty('Error', err.message);
    }
}

async function loadPixels(uid, actId) {
    if (!uid || !actId) return;
    localStorage.setItem('divinads.selectedActId', actId);
    hideEmpty();
    gridApi?.showLoadingOverlay();
    try {
        const data = await fetchJson(
            `${API_BASE}/api/pixel?uid=${encodeURIComponent(uid)}&act_id=${encodeURIComponent(actId)}`
        );
        gridApi?.setRowData(data.rows || []);
        $count.textContent = String(data.count || 0);
    } catch (err) {
        console.error('[pixel.oauth] loadPixels:', err);
        gridApi?.setRowData([]);
        $count.textContent = '0';
        showEmpty('Error cargando pixels', err.message);
    } finally {
        gridApi?.hideOverlay();
    }
}

$accountSelect.addEventListener('change', e => loadAdAccounts(e.target.value));
$actSelect.addEventListener('change', e => {
    loadPixels($accountSelect.value, e.target.value);
});
$btnRefresh.addEventListener('click', () => {
    loadPixels($accountSelect.value, $actSelect.value);
});

new agGrid.Grid($gridDiv, gridOptions);
gridApi = gridOptions.api;
loadAccounts();
