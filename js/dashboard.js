/**
 * js/dashboard.oauth.js
 * =====================
 * Dashboard consolidado.
 * Consume /api/insights/summary, /api/insights/by-account, /api/insights/time-series
 *
 * Sin dependencias de chart.js — renderiza un SVG simple para el time series.
 */

'use strict';

const API_BASE = 'http://localhost:8080';

const $accountSelect = document.getElementById('account-select');
const $rangeSelect   = document.getElementById('range-select');
const $kpis          = document.getElementById('kpis');
const $byAccount     = document.getElementById('by-account');
const $timeSeries    = document.getElementById('time-series');

// ─── Helpers ──────────────────────────────────────────────────
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

function fmtMoney(amount, currency = 'USD') {
    try {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency', currency, maximumFractionDigits: 2
        }).format(amount || 0);
    } catch {
        return `${amount || 0} ${currency}`;
    }
}

function fmtNum(n) {
    if (n == null) return '0';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(Math.round(n));
}

function fmtPct(n) {
    return (n || 0).toFixed(2) + '%';
}

// ─── Renders ──────────────────────────────────────────────────
function renderKpis(summary) {
    if (summary.account_count === 0) {
        $kpis.innerHTML = `
            <div class="kpi-card" style="grid-column:1/-1;text-align:center;">
                <div class="kpi-label">Sin cuentas activas</div>
                <div class="kpi-sub">Conecta una cuenta para ver métricas.</div>
            </div>`;
        return;
    }
    const t = summary.totals, a = summary.averages;
    $kpis.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-label">Gasto total</div>
            <div class="kpi-value">${fmtMoney(t.spend)}</div>
            <div class="kpi-sub">${summary.account_count} cuenta(s)</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Impresiones</div>
            <div class="kpi-value">${fmtNum(t.impressions)}</div>
            <div class="kpi-sub">CPM: ${fmtMoney(a.cpm)}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Clics</div>
            <div class="kpi-value">${fmtNum(t.clicks)}</div>
            <div class="kpi-sub">CTR: ${fmtPct(a.ctr)} · CPC: ${fmtMoney(a.cpc)}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">Alcance</div>
            <div class="kpi-value">${fmtNum(t.reach)}</div>
            <div class="kpi-sub">${summary.date_preset}</div>
        </div>`;
}

function renderByAccount(rows) {
    if (!rows || rows.length === 0) {
        $byAccount.innerHTML = '<div class="empty">Sin datos para el rango.</div>';
        return;
    }
    const max = Math.max(...rows.map(r => r.spend)) || 1;
    $byAccount.innerHTML = rows.map(r => {
        const pct = (r.spend / max) * 100;
        return `
            <div class="bar-row">
                <div class="bar-label" title="${escapeHtml(r.account_name)}">
                    ${escapeHtml(r.account_name)}
                </div>
                <div class="bar-track">
                    <div class="bar-fill" style="width:${pct.toFixed(1)}%"></div>
                    <div class="bar-value">${fmtMoney(r.spend, r.currency)}</div>
                </div>
            </div>`;
    }).join('');
}

function renderTimeSeries(series) {
    if (!series || series.length === 0) {
        $timeSeries.innerHTML = '<div class="empty">Sin datos diarios.</div>';
        return;
    }
    const w = 900, h = 260, padL = 40, padR = 10, padT = 20, padB = 30;
    const maxSpend = Math.max(...series.map(s => s.spend), 1);
    const xStep = (w - padL - padR) / Math.max(series.length - 1, 1);

    const pts = series.map((s, i) => {
        const x = padL + i * xStep;
        const y = padT + (h - padT - padB) * (1 - s.spend / maxSpend);
        return { x, y, s };
    });

    const path = pts.map((p, i) =>
        (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)
    ).join(' ');

    const areaPath = path +
        ` L ${pts[pts.length - 1].x.toFixed(1)},${(h - padB).toFixed(1)}` +
        ` L ${pts[0].x.toFixed(1)},${(h - padB).toFixed(1)} Z`;

    const xLabels = pts.filter((_, i) =>
        i === 0 || i === pts.length - 1 || i % Math.ceil(pts.length / 6) === 0
    );

    $timeSeries.innerHTML = `
        <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:100%;display:block;">
            <defs>
                <linearGradient id="gradFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.5"/>
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}"
                  stroke="rgba(255,255,255,0.1)"/>
            <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}"
                  stroke="rgba(255,255,255,0.1)"/>
            <text x="${padL - 5}" y="${padT + 5}" fill="#94a3b8" font-size="10" text-anchor="end">
                ${fmtMoney(maxSpend)}
            </text>
            <text x="${padL - 5}" y="${h - padB + 3}" fill="#94a3b8" font-size="10" text-anchor="end">0</text>
            <path d="${areaPath}" fill="url(#gradFill)"/>
            <path d="${path}" fill="none" stroke="#3b82f6" stroke-width="2"/>
            ${pts.map(p => `
                <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3"
                        fill="#3b82f6" stroke="#0f172a" stroke-width="1">
                    <title>${p.s.date} — ${fmtMoney(p.s.spend)}</title>
                </circle>
            `).join('')}
            ${xLabels.map(p => `
                <text x="${p.x.toFixed(1)}" y="${h - padB + 15}"
                      fill="#94a3b8" font-size="10" text-anchor="middle">
                    ${p.s.date.slice(5)}
                </text>
            `).join('')}
        </svg>`;
}

// ─── Flujo principal ──────────────────────────────────────────
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
            $kpis.innerHTML = `
                <div class="kpi-card" style="grid-column:1/-1;text-align:center;">
                    <div class="kpi-label">Sin cuenta conectada</div>
                    <div class="kpi-sub">Conecta tu cuenta en <a href="connect.html">Cuentas</a>.</div>
                </div>`;
            $byAccount.innerHTML = '';
            $timeSeries.innerHTML = '';
            return;
        }

        const saved = localStorage.getItem('divinads.selectedUid');
        const uid = saved && accounts.find(a => a.uid === saved) ? saved : accounts[0].uid;
        $accountSelect.value = uid;
        await loadAll(uid, $rangeSelect.value);
    } catch (err) {
        console.error('[dashboard.oauth] loadAccounts:', err);
        $kpis.innerHTML = `
            <div class="kpi-card" style="grid-column:1/-1;text-align:center;">
                <div class="kpi-label">Servidor no disponible</div>
                <div class="kpi-sub">
                    No se pudo conectar a <code>${API_BASE}</code>.
                    Arranca con <code>npm run start:oauth</code>.
                </div>
            </div>`;
    }
}

async function loadAll(uid, range) {
    if (!uid) return;
    localStorage.setItem('divinads.selectedUid', uid);

    $kpis.innerHTML = '<div class="loading">Cargando métricas…</div>';
    $byAccount.innerHTML = '<div class="loading">Cargando…</div>';
    $timeSeries.innerHTML = '<div class="loading">Cargando…</div>';

    const q = `uid=${encodeURIComponent(uid)}&date_preset=${encodeURIComponent(range)}`;

    try {
        // Las tres peticiones en paralelo
        const [summary, byAcc, ts] = await Promise.all([
            fetchJson(`${API_BASE}/api/insights/summary?${q}`),
            fetchJson(`${API_BASE}/api/insights/by-account?${q}`),
            fetchJson(`${API_BASE}/api/insights/time-series?${q}`)
        ]);
        renderKpis(summary);
        renderByAccount(byAcc.rows);
        renderTimeSeries(ts.series);
    } catch (err) {
        console.error('[dashboard.oauth] loadAll:', err);
        $kpis.innerHTML = `
            <div class="kpi-card" style="grid-column:1/-1;text-align:center;">
                <div class="kpi-label">Error</div>
                <div class="kpi-sub">${escapeHtml(err.message)}</div>
            </div>`;
    }
}

$accountSelect.addEventListener('change', e => loadAll(e.target.value, $rangeSelect.value));
$rangeSelect.addEventListener('change', e => loadAll($accountSelect.value, e.target.value));

loadAccounts();
