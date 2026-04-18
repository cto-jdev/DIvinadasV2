/**
 * dashboard-analytics.js
 * DivinAds v2.0 — Motor de Analítica con datos simulados
 */

(function() {
  'use strict';

  // ─── Utilidades ───
  function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randFloat(min, max) { return +(Math.random() * (max - min) + min).toFixed(2); }

  function countUp(el, target, duration = 1200) {
    const start = 0;
    const startTime = performance.now();
    const isDecimal = String(target).includes('.') || target < 100;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (target - start) * eased;

      if (isDecimal) {
        el.textContent = current.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        el.textContent = Math.round(current).toLocaleString('en-US');
      }

      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ─── Generate 30-day Data ───
  function generate30DayData() {
    const data = [];
    let spend = rand(800, 1200);
    let revenue = spend * randFloat(1.5, 3.0);

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      spend += rand(-100, 150);
      if (spend < 200) spend = 200;
      revenue = spend * randFloat(1.2, 3.5);

      data.push({
        date: date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }),
        spend: Math.round(spend),
        revenue: Math.round(revenue),
        ctr: randFloat(1.2, 4.5),
        cpm: randFloat(3.5, 12.0),
        conversions: rand(5, 45)
      });
    }
    return data;
  }

  // ─── Mock Campaign Data ───
  function generateCampaigns() {
    const names = [
      'Advantage+ Shopping - LATAM',
      'Conversiones Lead Gen - MX',
      'Retargeting Viewers 7d',
      'Prospecting - Lookalike 2%',
      'Brand Awareness - CO'
    ];
    const statuses = ['active', 'learning', 'limited', 'active', 'paused'];
    const statusLabels = ['Activa', 'Aprendizaje', 'Learning Limited', 'Activa', 'Pausada'];

    return names.map((name, i) => ({
      name,
      status: statuses[i],
      statusLabel: statusLabels[i],
      budget: rand(20, 150),
      spend: rand(10, 120),
      results: rand(3, 80),
      cpa: randFloat(2.5, 25.0),
      roas: randFloat(0.8, 5.5),
      ctr: randFloat(0.8, 4.2)
    }));
  }

  // ─── Render Dashboard ───
  function renderDashboard() {
    const container = document.getElementById('viaPanel');
    if (!container) return;

    const data30d = generate30DayData();
    const totalSpend = data30d.reduce((s, d) => s + d.spend, 0);
    const totalRevenue = data30d.reduce((s, d) => s + d.revenue, 0);
    const avgRoas = (totalRevenue / totalSpend).toFixed(2);
    const totalConversions = data30d.reduce((s, d) => s + d.conversions, 0);
    const campaigns = generateCampaigns();

    container.innerHTML = `
      <div class="container-fluid py-3">
        <!-- KPIs Row -->
        <div class="row g-3 mb-4">
          ${renderKPI('Saldo Disponible', '$2,450.00', '+12.5%', 'positive', 'ri-wallet-line', '#c084fc', 'rgba(192,132,252,0.15)', 1)}
          ${renderKPI('Business Managers', '5', '+2', 'positive', 'ri-briefcase-line', '#38bdf8', 'rgba(56,189,248,0.15)', 2)}
          ${renderKPI('Cuentas ADS', '12', '3 activas', 'positive', 'ri-megaphone-line', '#fb923c', 'rgba(251,146,60,0.15)', 3)}
          ${renderKPI('Páginas', '8', '5 live', 'positive', 'ri-flag-line', '#4ade80', 'rgba(74,222,128,0.15)', 4)}
          ${renderKPI('Gasto 30d', '$' + totalSpend.toLocaleString(), '-8.3%', 'negative', 'ri-money-dollar-circle-line', '#f472b6', 'rgba(244,114,182,0.15)', 5)}
          ${renderKPI('ROAS Estimado', avgRoas + 'x', '+0.4x', 'positive', 'ri-line-chart-line', '#a78bfa', 'rgba(167,139,250,0.15)', 6)}
        </div>

        <!-- Charts Row -->
        <div class="row g-3 mb-4">
          <div class="col-lg-8">
            <div class="chart-container anim-fade-in-up anim-delay-3" style="min-height:320px; display:flex; flex-direction:column;">
              <div class="chart-title">Gasto vs Revenue (30 días)</div>
              <div class="chart-subtitle">Tendencia de inversión publicitaria y retorno</div>
              <div class="chart-actions">
                <button class="chart-action-btn" title="Descargar CSV" onclick="window.divinAnalytics && window.divinAnalytics.exportCSV()"><i class="ri-download-line"></i></button>
                <button class="chart-action-btn" title="Pantalla completa"><i class="ri-fullscreen-line"></i></button>
              </div>
              <div style="position: relative; height: 240px; width: 100%; margin-top: 15px;">
                <canvas id="spendRevenueChart"></canvas>
              </div>
            </div>
          </div>
          <div class="col-lg-4">
            <div class="chart-container anim-fade-in-up anim-delay-4" style="min-height:320px; display:flex; flex-direction:column;">
              <div class="chart-title">Distribución de Cuentas</div>
              <div class="chart-subtitle">Estado actual por categoría</div>
              <div style="position: relative; height: 230px; width: 100%; margin-top: 15px;">
                <canvas id="accountsDonut"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Tables Row -->
        <div class="row g-3 mb-4">
          <div class="col-lg-7">
            <div class="chart-container anim-fade-in-up anim-delay-5 p-0" style="max-height:340px; overflow:hidden;">
              <div class="p-3 pb-0">
                <div class="chart-title">Top Campañas Advantage+</div>
                <div class="chart-subtitle mb-3">Rendimiento en tiempo real</div>
              </div>
              <div style="overflow-y:auto; max-height:260px;">
                <table class="glass-table">
                  <thead><tr>
                    <th>Campaña</th>
                    <th>Estado</th>
                    <th>Gasto</th>
                    <th>CPA</th>
                    <th>ROAS</th>
                  </tr></thead>
                  <tbody>
                    ${campaigns.map(c => `
                      <tr>
                        <td class="fw-medium text-white">${c.name}</td>
                        <td><span class="status-pill ${c.status}">${c.statusLabel}</span></td>
                        <td>$${c.spend}</td>
                        <td>$${c.cpa}</td>
                        <td class="${c.roas >= 2 ? 'text-success' : c.roas >= 1 ? 'text-warning' : 'text-danger'} fw-bold">${c.roas}x</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-lg-5">
            <div class="chart-container anim-fade-in-up anim-delay-6 p-0" style="max-height:340px; overflow:hidden;">
              <div class="p-3 pb-0">
                <div class="chart-title d-flex align-items-center gap-2">
                  <span class="dot-live"></span> Alertas Compliance Meta
                </div>
                <div class="chart-subtitle mb-2">Monitoreo proactivo de políticas</div>
              </div>
              <div class="px-3 pb-3" style="overflow-y:auto; max-height:250px;">
                ${renderAlerts()}
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions + Activity -->
        <div class="row g-3">
          <div class="col-lg-5">
            <div class="chart-container anim-fade-in-up p-3">
              <div class="chart-title mb-3">Acciones Rápidas</div>
              <div class="row g-2">
                <div class="col-4">
                  <a href="clone.html" class="quick-action">
                    <i class="ri-file-copy-line" style="color:#38bdf8"></i>
                    <span>Clonar Cuenta</span>
                  </a>
                </div>
                <div class="col-4">
                  <a href="advantage.html" class="quick-action">
                    <i class="ri-robot-line" style="color:#4ade80"></i>
                    <span>Advantage+</span>
                  </a>
                </div>
                <div class="col-4">
                  <a href="pixel.html" class="quick-action">
                    <i class="ri-radar-line" style="color:#c084fc"></i>
                    <span>Pixel Health</span>
                  </a>
                </div>
                <div class="col-4">
                  <a href="ads.html" class="quick-action">
                    <i class="ri-megaphone-line" style="color:#fb923c"></i>
                    <span>Ver ADS</span>
                  </a>
                </div>
                <div class="col-4">
                  <a href="attribution.html" class="quick-action">
                    <i class="ri-pie-chart-line" style="color:#f472b6"></i>
                    <span>Atribución</span>
                  </a>
                </div>
                <div class="col-4">
                  <a href="phoi.html" class="quick-action">
                    <i class="ri-image-line" style="color:#a78bfa"></i>
                    <span>Plantillas</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-7">
            <div class="chart-container anim-fade-in-up p-0" style="max-height:260px; overflow:hidden;">
              <div class="p-3 pb-0">
                <div class="chart-title">Actividad Reciente</div>
                <div class="chart-subtitle mb-2">Últimas operaciones realizadas</div>
              </div>
              <div class="px-3 pb-3" style="overflow-y:auto; max-height:190px;">
                <ul class="glass-timeline">
                  ${renderTimeline()}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Charts
    setTimeout(() => {
      renderSpendRevenueChart(data30d);
      renderDonutChart();
      animateKPIs();
    }, 100);
  }

  function renderKPI(label, value, change, changeType, icon, color, bgColor, delay) {
    return `
      <div class="col-xxl-3 col-xl-4 col-lg-4 col-md-6 col-12">
        <div class="glass-stat hover-lift anim-fade-in-up anim-delay-${delay}">
          <div class="stat-glow" style="background:radial-gradient(circle,${bgColor},transparent 70%)"></div>
          <div class="d-flex justify-content-between align-items-start position-relative z-1">
            <div style="min-width: 0; padding-right: 15px; flex-grow: 1;">
              <div class="stat-label text-truncate" title="${label}">${label}</div>
              <div class="stat-value text-truncate" title="${value}" data-target="${value}">${value}</div>
              <div class="stat-change ${changeType}">
                <i class="ri-arrow-${changeType === 'positive' ? 'up' : 'down'}-s-fill"></i>
                ${change}
              </div>
            </div>
            <div class="stat-icon" style="background:${bgColor}; color:${color}">
              <i class="${icon}"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAlerts() {
    const alerts = [
      { type: 'success', icon: 'ri-check-line', text: 'H.E.C. test aprobado — Todas las audiencias cumplen políticas de Meta.' },
      { type: 'info',    icon: 'ri-information-line', text: 'Migración de Impressions → Views completada en Graph API v22.' },
      { type: 'warning', icon: 'ri-alert-line', text: '"Advantage+ Shopping" legacy será deprecado el 19 May 2026. Migrar a Automation Unification.' },
      { type: 'info',    icon: 'ri-refresh-line', text: 'Engage-through Attribution activo. Nuevas conversiones por interacción social contabilizadas.' },
      { type: 'success', icon: 'ri-shield-check-line', text: 'Event Match Quality (EMQ): 8.2/10 — Excelente cobertura de señales CAPI.' }
    ];
    return alerts.map(a => `
      <div class="glass-alert glass-alert-${a.type} mb-2">
        <i class="${a.icon} me-2"></i>${a.text}
      </div>
    `).join('');
  }

  function renderTimeline() {
    const events = [
      { color: '#4ade80', text: 'Campaña "Retargeting Viewers" optimizada por Advantage+', time: 'Hace 12 min' },
      { color: '#38bdf8', text: 'BM ACT_283847 sincronizado — 3 nuevas cuentas detectadas', time: 'Hace 45 min' },
      { color: '#fb923c', text: 'Pixel event "Purchase" deduplicado via CAPI', time: 'Hace 1h' },
      { color: '#c084fc', text: 'Clone de Ad Account completado con éxito', time: 'Hace 2h' },
      { color: '#f472b6', text: 'Reporte de atribución 7d exportado a CSV', time: 'Hace 3h' },
    ];
    return events.map(e => `
      <li class="glass-timeline-item">
        <div class="glass-timeline-dot" style="background:${e.color}; box-shadow:0 0 8px ${e.color}"></div>
        <div class="flex-grow-1">
          <div class="text-white" style="font-size:13px">${e.text}</div>
          <div class="glass-timeline-time">${e.time}</div>
        </div>
      </li>
    `).join('');
  }

  // ─── Chart.js Renderers ───
  function renderSpendRevenueChart(data) {
    const ctx = document.getElementById('spendRevenueChart');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [
          {
            label: 'Revenue',
            data: data.map(d => d.revenue),
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74,222,128,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2
          },
          {
            label: 'Gasto',
            data: data.map(d => d.spend),
            borderColor: '#f472b6',
            backgroundColor: 'rgba(244,114,182,0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 } }
          },
          tooltip: {
            backgroundColor: 'rgba(10,10,15,0.9)',
            titleColor: '#fff',
            bodyColor: '#94a3b8',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            cornerRadius: 10,
            padding: 12
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: v => '$' + v } }
        }
      }
    });
  }

  function renderDonutChart() {
    const ctx = document.getElementById('accountsDonut');
    if (!ctx || typeof Chart === 'undefined') return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Activas', 'Deshabilitadas', 'En Apelación', 'Learning', 'Pausadas'],
        datasets: [{
          data: [8, 3, 2, 4, 1],
          backgroundColor: ['#4ade80', '#ef4444', '#fb923c', '#38bdf8', '#64748b'],
          borderWidth: 0,
          spacing: 3,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', usePointStyle: true, font: { size: 11 }, padding: 12 }
          }
        }
      }
    });
  }

  function animateKPIs() {
    document.querySelectorAll('.stat-value').forEach(el => {
      el.classList.add('anim-number-pop');
    });
  }

  // ─── CSV Export ───
  window.divinAnalytics = {
    exportCSV: function() {
      alert('📊 Función de exportación CSV disponible en versión conectada. Datos simulados no exportables.');
    }
  };

  // ─── Init ───
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(renderDashboard, 300));
    } else {
      setTimeout(renderDashboard, 300);
    }
  }
})();
