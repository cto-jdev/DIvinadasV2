/**
 * attribution.js
 * DivinAds v2.0 — Attribution & Measurement Center
 */
(function() {
  'use strict';
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function renderAttributionChart() {
    const ctx = document.getElementById('attributionChart');
    if (!ctx || typeof Chart === 'undefined') return;

    const labels = [];
    const clickData = [], engageData = [], viewData = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }));
      clickData.push(rand(20, 45));
      engageData.push(rand(5, 18));
      viewData.push(rand(2, 8));
    }

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Click-through (7d)', data: clickData, backgroundColor: '#38bdf8', borderRadius: 4, borderSkipped: false },
          { label: 'Engage-through (1d)', data: engageData, backgroundColor: '#c084fc', borderRadius: 4, borderSkipped: false },
          { label: 'View-through (1d)', data: viewData, backgroundColor: 'rgba(148,163,184,0.5)', borderRadius: 4, borderSkipped: false }
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
          x: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: { stacked: true, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } }
        }
      }
    });
  }

  function renderViewsChart() {
    const ctx = document.getElementById('viewsVsImpressions');
    if (!ctx || typeof Chart === 'undefined') return;

    const labels = [];
    const viewsData = [], impressionsData = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }));
      const imp = rand(15000, 35000);
      viewsData.push(Math.round(imp * (0.7 + Math.random() * 0.2)));
      impressionsData.push(imp);
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Views (v22)', data: viewsData, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2 },
          { label: 'Impressions (legacy)', data: impressionsData, borderColor: '#64748b', borderDash: [5,5], tension: 0.4, pointRadius: 0, borderWidth: 1.5 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true, font: { size: 10 } } },
          tooltip: { backgroundColor: 'rgba(10,10,15,0.9)', titleColor: '#fff', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, cornerRadius: 10 }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 9 }, maxRotation: 45 } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: v => (v/1000).toFixed(0)+'k' } }
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { renderAttributionChart(); renderViewsChart(); }, 300);
  });
})();
