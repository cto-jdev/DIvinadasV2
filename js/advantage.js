/**
 * advantage.js
 * DivinAds v2.0 — Advantage+ Intelligence Module
 */
(function() {
  'use strict';
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const rf = (min, max) => +(Math.random() * (max - min) + min).toFixed(2);

  const campaigns = [
    { name: 'Advantage+ Shopping - LATAM', obj: 'Ventas', status: 'active', label: 'Activa', budget: 120, spend: 98, results: 84, cpa: 1.17, roas: 4.2, ctr: 3.8 },
    { name: 'Lead Gen - México DF', obj: 'Leads', status: 'learning', label: 'Aprendizaje', budget: 80, spend: 45, results: 23, cpa: 1.96, roas: 2.8, ctr: 2.4 },
    { name: 'Retargeting ViewContent 7d', obj: 'Conversiones', status: 'active', label: 'Activa', budget: 50, spend: 48, results: 62, cpa: 0.77, roas: 5.1, ctr: 5.2 },
    { name: 'Prospecting Lookalike 2%', obj: 'Ventas', status: 'limited', label: 'Learning Limited', budget: 200, spend: 180, results: 31, cpa: 5.81, roas: 1.4, ctr: 1.1 },
    { name: 'Brand Awareness Colombia', obj: 'Alcance', status: 'active', label: 'Activa', budget: 30, spend: 28, results: 15200, cpa: 0.002, roas: 0, ctr: 0.8 },
    { name: 'App Installs - Android', obj: 'Instalaciones', status: 'paused', label: 'Pausada', budget: 60, spend: 0, results: 0, cpa: 0, roas: 0, ctr: 0 },
    { name: 'Advantage+ Catalog Sales', obj: 'Ventas Catálogo', status: 'active', label: 'Activa', budget: 150, spend: 132, results: 98, cpa: 1.35, roas: 3.8, ctr: 4.1 },
    { name: 'Threads Ads - Global', obj: 'App Installs', status: 'learning', label: 'Aprendizaje', budget: 40, spend: 12, results: 8, cpa: 1.50, roas: 1.9, ctr: 1.6 },
  ];

  // Render campaign table
  function renderTable() {
    const tbody = document.getElementById('campaignBody');
    if (!tbody) return;
    tbody.innerHTML = campaigns.map(c => `
      <tr>
        <td class="fw-medium text-white">${c.name}</td>
        <td><span class="text-muted" style="font-size:12px">${c.obj}</span></td>
        <td><span class="status-pill ${c.status}">${c.label}</span></td>
        <td>$${c.budget}/día</td>
        <td>$${c.spend}</td>
        <td>${c.results.toLocaleString()}</td>
        <td>$${c.cpa.toFixed(2)}</td>
        <td class="${c.roas >= 2 ? 'text-success' : c.roas >= 1 ? 'text-warning' : 'text-danger'} fw-bold">${c.roas > 0 ? c.roas + 'x' : '—'}</td>
        <td>${c.ctr}%</td>
      </tr>
    `).join('');
  }

  // Render learning phases
  function renderLearning() {
    const container = document.getElementById('learningPhases');
    if (!container) return;

    const phases = [
      { name: 'Advantage+ Shopping', phase: 'Activa', progress: 100, color: '#4ade80' },
      { name: 'Lead Gen México', phase: 'Aprendiendo (68%)', progress: 68, color: '#38bdf8' },
      { name: 'Prospecting Lookalike', phase: 'Learning Limited', progress: 45, color: '#fb923c' },
      { name: 'Catalog Sales', phase: 'Activa', progress: 100, color: '#4ade80' },
      { name: 'Threads Ads', phase: 'Aprendiendo (22%)', progress: 22, color: '#38bdf8' },
      { name: 'Retargeting 7d', phase: 'Activa', progress: 100, color: '#4ade80' },
    ];

    container.innerHTML = phases.map(p => `
      <div class="mb-3">
        <div class="d-flex justify-content-between mb-1">
          <span class="text-white" style="font-size:12px;font-weight:500">${p.name}</span>
          <span style="font-size:11px;color:${p.color}">${p.phase}</span>
        </div>
        <div class="glass-progress">
          <div class="glass-progress-bar anim-progress" style="width:${p.progress}%;background:${p.color}"></div>
        </div>
      </div>
    `).join('');
  }

  // Render chart
  function renderChart() {
    const ctx = document.getElementById('advantageChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const labels = [];
    const spendData = [];
    const convData = [];
    const roasData = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }));
      const s = rand(300, 600);
      const c = rand(20, 80);
      spendData.push(s);
      convData.push(c);
      roasData.push(rf(1.5, 5.0));
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Gasto ($)', data: spendData, borderColor: '#f472b6', backgroundColor: 'rgba(244,114,182,0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y' },
          { label: 'Conversiones', data: convData, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y' },
          { label: 'ROAS (x)', data: roasData, borderColor: '#38bdf8', borderDash: [5,5], tension: 0.4, pointRadius: 0, borderWidth: 2, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 } } },
          tooltip: { backgroundColor: 'rgba(10,10,15,0.9)', titleColor: '#fff', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 10 }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: { position: 'left', grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
          y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#38bdf8', font: { size: 10 }, callback: v => v + 'x' } }
        }
      }
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { renderTable(); renderLearning(); renderChart(); }, 200);
  });
})();
