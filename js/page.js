/**
 * js/page.oauth.js
 * ================
 * Módulo Páginas — versión OAuth.
 * Consume /api/pages?uid=... del servidor local.
 */

'use strict';

const API_BASE = 'http://localhost:8080';

const $select     = document.getElementById('account-select');
const $btnRefresh = document.getElementById('btn-refresh');
const $count      = document.getElementById('count');
const $gridDiv    = document.getElementById('pages-grid');
const $emptyState = document.getElementById('empty-state');

let gridApi = null;

const STATUS_LABEL = {
    VERIFIED:   'Verificada',
    UNVERIFIED: 'Sin verificar',
    PENDING:    'Pendiente'
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
        headerName: '',
        maxWidth: 60,
        cellRenderer: p => p.data.picture
            ? `<img class="page-thumb" src="${escapeHtml(p.data.picture)}" alt="">`
            : `<div class="page-thumb" style="background:#334155;"></div>`
    },
    {
        field: 'name',
        headerName: 'Página',
        minWidth: 220,
        cellRenderer: p => `
            <div>
                <a href="${escapeHtml(p.data.link || '#')}" target="_blank"
                   style="color:#e2e8f0; text-decoration:none;">
                    <strong>${escapeHtml(p.data.name || '')}</strong>
                </a>
                <div style="font-size:11px;color:#94a3b8;">
                    ${escapeHtml(p.data.category || '')}
                </div>
            </div>`
    },
    { field: 'id', headerName: 'ID', hide: true },
    {
        field: 'status',
        headerName: 'Estado',
        cellRenderer: p => {
            const s = p.value || 'UNVERIFIED';
            return `<span class="status-pill status-${s}">
                <span class="status-dot"></span>${STATUS_LABEL[s] || s}
            </span>`;
        }
    },
    {
        field: 'fan_count',
        headerName: 'Fans',
        type: 'numericColumn',
        valueFormatter: p => p.value != null ? p.value.toLocaleString() : ''
    },
    {
        field: 'tasks',
        headerName: 'Permisos',
        valueFormatter: p => Array.isArray(p.value) ? p.value.join(', ') : ''
    }
];

const gridOptions = {
    columnDefs,
    rowData: [],
    rowHeight: 50,
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    defaultColDef: { flex: 1, minWidth: 100, sortable: true, resizable: true, filter: true },
    localeText: { noRowsToShow: 'Sin páginas administradas' },
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

async function loadAccounts() {
    try {
        const data = await fetchJson(`${API_BASE}/api/me`);
        const accounts = data.accounts || [];
        $select.innerHTML = '<option value="">Selecciona una cuenta…</option>' +
            accounts.map(a => `
                <option value="${escapeHtml(a.uid)}">
                    ${escapeHtml(a.user_name || a.uid)}${a.email ? ' · ' + escapeHtml(a.email) : ''}
                </option>
            `).join('');

        if (accounts.length === 0) {
            $emptyState.style.display = 'block';
            $gridDiv.style.display = 'none';
            return;
        }

        $emptyState.style.display = 'none';
        $gridDiv.style.display = '';
        const saved = localStorage.getItem('divinads.selectedUid');
        const uid = saved && accounts.find(a => a.uid === saved) ? saved : accounts[0].uid;
        $select.value = uid;
        await loadPages(uid);
    } catch (err) {
        console.error('[page.oauth] loadAccounts:', err);
        $emptyState.style.display = 'block';
        $emptyState.querySelector('h5').textContent = 'Servidor no disponible';
        $emptyState.querySelector('p').innerHTML =
            `No se pudo conectar a <code>${API_BASE}</code>. ` +
            `Arranca con <code>npm run start:oauth</code>.`;
        $gridDiv.style.display = 'none';
    }
}

async function loadPages(uid) {
    if (!uid) {
        gridApi?.setRowData([]);
        $count.textContent = '0';
        return;
    }
    localStorage.setItem('divinads.selectedUid', uid);
    gridApi?.showLoadingOverlay();
    try {
        const data = await fetchJson(`${API_BASE}/api/pages?uid=${encodeURIComponent(uid)}`);
        gridApi?.setRowData(data.rows || []);
        $count.textContent = String(data.count || 0);
    } catch (err) {
        console.error('[page.oauth] loadPages:', err);
        gridApi?.setRowData([]);
        $count.textContent = '0';
        alert('Error cargando páginas: ' + err.message);
    } finally {
        gridApi?.hideOverlay();
    }
}

$select.addEventListener('change', e => loadPages(e.target.value));
$btnRefresh.addEventListener('click', () => loadPages($select.value));

new agGrid.Grid($gridDiv, gridOptions);
gridApi = gridOptions.api;
loadAccounts();
