/**
 * js/ads.oauth.js
 * ===============
 * Módulo Ads — versión OAuth / Marketing API.
 * Consume /api/ads?uid=... del servidor local.
 */

'use strict';

const API_BASE = 'http://localhost:8080';

const $select     = document.getElementById('account-select');
const $btnRefresh = document.getElementById('btn-refresh');
const $count      = document.getElementById('count');
const $gridDiv    = document.getElementById('ads-grid');
const $emptyState = document.getElementById('empty-state');

let gridApi = null;

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
            return `<span class="status-pill status-${s}">
                <span class="status-dot"></span>${s}
            </span>`;
        }
    },
    {
        field: 'name',
        headerName: 'Cuenta',
        minWidth: 220,
        cellRenderer: p => `
            <div>
                <strong>${escapeHtml(p.data.name || '')}</strong>
                <div style="font-size:11px;color:#94a3b8;">${escapeHtml(p.data.account_id || '')}</div>
            </div>`
    },
    { field: 'account_id', headerName: 'ID', hide: true },
    {
        field: 'balance',
        headerName: 'Balance',
        type: 'numericColumn',
        valueFormatter: p => formatMoney(p.value, p.data.currency)
    },
    {
        field: 'spent',
        headerName: 'Gastado',
        type: 'numericColumn',
        valueFormatter: p => formatMoney(p.value, p.data.currency)
    },
    {
        field: 'spend_cap',
        headerName: 'Límite',
        type: 'numericColumn',
        valueFormatter: p => p.value ? formatMoney(p.value, p.data.currency) : '—'
    },
    { field: 'currency', headerName: 'Moneda', maxWidth: 90 },
    { field: 'timezone', headerName: 'Zona horaria' },
    {
        field: 'business',
        headerName: 'Business Manager',
        valueFormatter: p => p.value ? p.value.name : '—'
    },
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
    localeText: { noRowsToShow: 'Sin cuentas de anuncios' },
    getRowId: p => p.data.id
};

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function formatMoney(amount, currency) {
    if (amount == null) return '';
    try {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 2
        }).format(amount);
    } catch {
        return `${amount} ${currency || ''}`;
    }
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
        await loadAds(uid);
    } catch (err) {
        console.error('[ads.oauth] loadAccounts:', err);
        $emptyState.style.display = 'block';
        $emptyState.querySelector('h5').textContent = 'Servidor no disponible';
        $emptyState.querySelector('p').innerHTML =
            `No se pudo conectar a <code>${API_BASE}</code>. ` +
            `Arranca con <code>npm run start:oauth</code>.`;
        $gridDiv.style.display = 'none';
    }
}

async function loadAds(uid) {
    if (!uid) {
        gridApi?.setRowData([]);
        $count.textContent = '0';
        return;
    }
    localStorage.setItem('divinads.selectedUid', uid);
    gridApi?.showLoadingOverlay();
    try {
        const data = await fetchJson(`${API_BASE}/api/ads?uid=${encodeURIComponent(uid)}`);
        gridApi?.setRowData(data.rows || []);
        $count.textContent = String(data.count || 0);
    } catch (err) {
        console.error('[ads.oauth] loadAds:', err);
        gridApi?.setRowData([]);
        $count.textContent = '0';
        alert('Error cargando Ads: ' + err.message);
    } finally {
        gridApi?.hideOverlay();
    }
}

$select.addEventListener('change', e => loadAds(e.target.value));
$btnRefresh.addEventListener('click', () => loadAds($select.value));

new agGrid.Grid($gridDiv, gridOptions);
gridApi = gridOptions.api;
loadAccounts();
