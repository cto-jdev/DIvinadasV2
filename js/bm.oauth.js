/**
 * js/bm.oauth.js
 * ==============
 * Módulo Business Manager — versión OAuth.
 * Consume /api/bm?uid=... del servidor local.
 * No hace scraping, no usa cookies, no usa libs1-5.
 */

'use strict';

const API_BASE = 'http://localhost:8080';

const $select      = document.getElementById('account-select');
const $btnRefresh  = document.getElementById('btn-refresh');
const $count       = document.getElementById('count');
const $gridDiv     = document.getElementById('bm-grid');
const $emptyState  = document.getElementById('empty-state');

let gridApi = null;

// ─── Column defs del grid ─────────────────────────────────────
const STATUS_LABEL = {
    LIVE: 'Verificado',
    PENDING_VERIFICATION: 'Verificación pendiente',
    UNVERIFIED: 'Sin verificar',
    REVOKED: 'Revocado',
    UNKNOWN: 'Desconocido'
};

const columnDefs = [
    {
        headerCheckboxSelection: true,
        checkboxSelection: true,
        maxWidth: 40,
        pinned: 'left',
        suppressMovable: true,
        lockPosition: 'left'
    },
    {
        field: 'status',
        headerName: 'Estado',
        cellRenderer: p => {
            const s = p.value || 'UNKNOWN';
            const label = STATUS_LABEL[s] || s;
            return `<span class="status-pill status-${s}">
                <span class="status-dot"></span>${label}
            </span>`;
        }
    },
    {
        field: 'name',
        headerName: 'Nombre',
        minWidth: 220,
        cellRenderer: p => {
            const letter = (p.data.name || '?').replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase();
            return `<div>
                <strong>${escapeHtml(p.data.name || '')}</strong>
                <div style="font-size:11px;color:#94a3b8;">${escapeHtml(p.data.bmId || '')}</div>
            </div>`;
        }
    },
    { field: 'bmId',         headerName: 'ID BM', hide: true },
    { field: 'bmType',       headerName: 'Vertical' },
    { field: 'role',         headerName: 'Rol' },
    { field: 'adAccount',    headerName: 'Cuentas Ad', type: 'numericColumn' },
    { field: 'bmPage',       headerName: 'Páginas',    type: 'numericColumn' },
    { field: 'instaAccount', headerName: 'Instagram',  type: 'numericColumn' },
    { field: 'adminAccount', headerName: 'Admins',     type: 'numericColumn' },
    {
        field: 'created_time',
        headerName: 'Creado',
        valueFormatter: p => p.value ? new Date(p.value).toLocaleDateString() : ''
    }
];

const gridOptions = {
    columnDefs,
    rowData: [],
    rowHeight: 50,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    defaultColDef: { flex: 1, minWidth: 100, sortable: true, resizable: true, filter: true },
    localeText: { noRowsToShow: 'Sin Business Managers que mostrar' },
    getRowId: p => p.data.id
};

// ─── Utilidades ───────────────────────────────────────────────
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

// ─── Flujo principal ──────────────────────────────────────────
async function initGrid() {
    new agGrid.Grid($gridDiv, gridOptions);
    gridApi = gridOptions.api;
}

async function loadAccounts() {
    try {
        const data = await fetchJson(`${API_BASE}/api/me`);
        const accounts = data.accounts || [];
        $select.innerHTML = '<option value="">Selecciona una cuenta…</option>' +
            accounts.map(a => `
                <option value="${escapeHtml(a.uid)}">
                    ${escapeHtml(a.user_name || a.uid)} ${a.email ? '· ' + escapeHtml(a.email) : ''}
                </option>
            `).join('');

        if (accounts.length === 0) {
            $emptyState.style.display = 'block';
            $gridDiv.style.display = 'none';
            return;
        }

        $emptyState.style.display = 'none';
        $gridDiv.style.display = '';

        // Seleccionar la primera automáticamente
        const saved = localStorage.getItem('divinads.selectedUid');
        const uid = saved && accounts.find(a => a.uid === saved) ? saved : accounts[0].uid;
        $select.value = uid;
        await loadBms(uid);
    } catch (err) {
        console.error('[bm.oauth] loadAccounts:', err);
        $emptyState.style.display = 'block';
        $emptyState.querySelector('h5').textContent = 'Servidor no disponible';
        $emptyState.querySelector('p').innerHTML =
            `No se pudo conectar a <code>${API_BASE}</code>. ` +
            `Arranca con <code>npm run start:oauth</code>.`;
        $gridDiv.style.display = 'none';
    }
}

async function loadBms(uid) {
    if (!uid) {
        gridApi?.setRowData([]);
        $count.textContent = '0';
        return;
    }
    localStorage.setItem('divinads.selectedUid', uid);

    gridApi?.showLoadingOverlay();
    try {
        const data = await fetchJson(`${API_BASE}/api/bm?uid=${encodeURIComponent(uid)}`);
        gridApi?.setRowData(data.rows || []);
        $count.textContent = String(data.count || 0);
    } catch (err) {
        console.error('[bm.oauth] loadBms:', err);
        gridApi?.setRowData([]);
        $count.textContent = '0';
        alert('Error cargando Business Managers: ' + err.message);
    } finally {
        gridApi?.hideOverlay();
    }
}

// ─── Wiring ───────────────────────────────────────────────────
$select.addEventListener('change', e => loadBms(e.target.value));
$btnRefresh.addEventListener('click', () => loadBms($select.value));

// Boot
initGrid().then(loadAccounts);
