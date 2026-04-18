/**
 * pixel-health.js
 * DivinAds v2.0 — Pixel & Conversions API Health Monitor
 */
(function() {
  'use strict';
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const eventTypes = [
    { name: 'PageView',          browser: 4521, capi: 3180, emq: 7.8 },
    { name: 'ViewContent',       browser: 1823, capi: 1645, emq: 8.5 },
    { name: 'AddToCart',         browser: 892,  capi: 810,  emq: 8.9 },
    { name: 'InitiateCheckout',  browser: 341,  capi: 328,  emq: 9.1 },
    { name: 'Purchase',          browser: 187,  capi: 185,  emq: 9.5 },
    { name: 'Lead',              browser: 256,  capi: 198,  emq: 7.4 },
    { name: 'CompleteRegistration', browser: 89, capi: 72,  emq: 6.8 },
    { name: 'Search',            browser: 672,  capi: 420,  emq: 6.2 },
  ];

  const eventColors = {
    'PageView': '#64748b', 'ViewContent': '#38bdf8', 'AddToCart': '#fb923c',
    'InitiateCheckout': '#a78bfa', 'Purchase': '#4ade80', 'Lead': '#f472b6',
    'CompleteRegistration': '#fbbf24', 'Search': '#6ee7b7'
  };

  function renderEventsTable() {
    const tbody = document.getElementById('eventsBody');
    if (!tbody) return;
    tbody.innerHTML = eventTypes.map(e => {
      const coverage = Math.round((e.capi / e.browser) * 100);
      const covColor = coverage >= 90 ? '#4ade80' : coverage >= 70 ? '#fb923c' : '#ef4444';
      const emqColor = e.emq >= 8 ? '#4ade80' : e.emq >= 6 ? '#fb923c' : '#ef4444';
      return `
        <tr>
          <td class="fw-medium text-white">${e.name}</td>
          <td>${e.browser.toLocaleString()}</td>
          <td>${e.capi.toLocaleString()}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="glass-progress flex-grow-1" style="width:60px"><div class="glass-progress-bar anim-progress" style="width:${coverage}%;background:${covColor}"></div></div>
              <span style="color:${covColor};font-size:12px;font-weight:600">${coverage}%</span>
            </div>
          </td>
          <td style="color:${emqColor};font-weight:600">${e.emq}/10</td>
        </tr>
      `;
    }).join('');
  }

  function renderDonut() {
    const ctx = document.getElementById('eventsDonut');
    if (!ctx || typeof Chart === 'undefined') return;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: eventTypes.map(e => e.name),
        datasets: [{
          data: eventTypes.map(e => e.browser),
          backgroundColor: eventTypes.map(e => eventColors[e.name]),
          borderWidth: 0, spacing: 3, borderRadius: 4
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'right', labels: { color: '#94a3b8', usePointStyle: true, font: { size: 10 }, padding: 8 } }
        }
      }
    });
  }

  // Live event stream simulation
  let streaming = true;
  const sources = ['Browser Pixel', 'CAPI Server'];
  const actions = ['PageView', 'ViewContent', 'AddToCart', 'Purchase', 'Lead', 'InitiateCheckout', 'Search'];

  function addStreamEvent() {
    if (!streaming) return;
    const container = document.getElementById('eventStream');
    if (!container) return;

    const action = actions[rand(0, actions.length - 1)];
    const source = sources[rand(0, 1)];
    const sourceColor = source === 'CAPI Server' ? '#c084fc' : '#38bdf8';
    const id = 'evt_' + Math.random().toString(36).substr(2, 8);
    const now = new Date().toLocaleTimeString('es-CO');

    const eventHTML = `
      <div class="d-flex align-items-center gap-3 py-2 border-bottom border-light border-opacity-5 anim-fade-in-up" style="font-size:12px">
        <span class="text-muted" style="min-width:65px">${now}</span>
        <span class="fw-medium text-white" style="min-width:100px">${action}</span>
        <span style="color:${sourceColor};min-width:90px">${source}</span>
        <code class="text-muted" style="font-size:10px">${id}</code>
        <span class="ms-auto"><span class="status-pill active" style="font-size:10px">OK</span></span>
      </div>
    `;

    container.insertAdjacentHTML('afterbegin', eventHTML);

    // Keep only last 30 events
    while (container.children.length > 30) {
      container.removeChild(container.lastChild);
    }

    // Increment counter
    const counter = document.getElementById('eventCount');
    if (counter) {
      const current = parseInt(counter.textContent.replace(/,/g, '')) || 1247;
      counter.textContent = (current + 1).toLocaleString();
    }
  }

  // Pause button
  function initPauseBtn() {
    const btn = document.getElementById('pauseStream');
    if (!btn) return;
    btn.addEventListener('click', () => {
      streaming = !streaming;
      btn.innerHTML = streaming ? '<i class="ri-pause-line"></i>' : '<i class="ri-play-line"></i>';
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      renderEventsTable();
      renderDonut();
      initPauseBtn();
      // Start streaming events every 3 seconds
      setInterval(addStreamEvent, 3000);
      addStreamEvent(); // first one immediately
    }, 300);
  });
})();
