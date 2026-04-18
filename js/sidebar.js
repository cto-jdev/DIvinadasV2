/**
 * sidebar.js
 * DivinAds v2.0 — Sidebar Navigation Component
 * Se inyecta automáticamente en todas las páginas
 */

(function() {
  'use strict';

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const navItems = [
    { section: 'Principal' },
    { id: 'dashboard', label: 'Dashboard',      icon: 'ri-dashboard-line',     href: 'index.html',       badge: null },
    { section: 'Gestión Meta' },
    { id: 'ads',       label: 'Cuentas ADS',    icon: 'ri-megaphone-line',     href: 'ads.html',         badge: '12',  badgeType: '' },
    { id: 'bm',        label: 'Business Manager',icon: 'ri-briefcase-line',    href: 'bm.html',          badge: '5',   badgeType: '' },
    { id: 'pages',     label: 'Páginas',         icon: 'ri-flag-line',          href: 'page.html',        badge: '8',   badgeType: '' },
    { id: 'clones',    label: 'Clones',          icon: 'ri-file-copy-line',     href: 'clone.html',       badge: null },
    { id: 'phoi',      label: 'Plantillas',      icon: 'ri-image-line',         href: 'phoi.html',        badge: null },
    { section: 'Inteligencia' },
    { id: 'advantage', label: 'Advantage+',      icon: 'ri-robot-line',         href: 'advantage.html',   badge: 'AI',  badgeType: 'success' },
    { id: 'pixel',     label: 'Pixel & CAPI',    icon: 'ri-radar-line',         href: 'pixel.html',       badge: null },
    { id: 'attribution',label: 'Atribución',     icon: 'ri-pie-chart-line',     href: 'attribution.html', badge: null },
  ];

  function isActive(href) {
    if (href === 'index.html' && (currentPage === '' || currentPage === 'index.html')) return true;
    return currentPage === href;
  }

  function buildSidebar() {
    const collapsed = localStorage.getItem('sidebar_collapsed') === 'true';

    let html = `<nav class="sidebar ${collapsed ? 'collapsed' : ''}" id="mainSidebar">`;

    // Logo
    html += `
      <div class="sidebar-logo">
        <img src="img/favicon.png" alt="D">
        <span class="logo-text">DivinAds</span>
      </div>
      <div class="sidebar-toggle" id="sidebarToggle" title="Colapsar">
        <i class="ri-arrow-left-s-line"></i>
      </div>
    `;

    // Nav
    html += '<div class="sidebar-nav">';
    navItems.forEach(item => {
      if (item.section) {
        html += `<div class="sidebar-section-title">${item.section}</div>`;
        return;
      }
      const active = isActive(item.href) ? 'active' : '';
      const badge = item.badge ? `<span class="sidebar-badge ${item.badgeType || ''}">${item.badge}</span>` : '';
      html += `
        <a href="${item.href}" class="sidebar-item ${active}" data-tooltip="${item.label}">
          <i class="${item.icon}"></i>
          <span class="item-text">${item.label}</span>
          ${badge}
        </a>
      `;
    });
    html += '</div>';

    // Footer
    html += `
      <div class="sidebar-footer">
        <a href="javascript:;" class="sidebar-item" data-tooltip="Configuración" data-bs-toggle="modal" data-bs-target="#settingModal" onclick="if(typeof bootstrap!=='undefined'){var m=document.getElementById('settingModal');if(m)new bootstrap.Modal(m).show();}">
          <i class="ri-settings-3-line"></i>
          <span class="item-text">Configuración</span>
        </a>
        <div class="sidebar-user">
          <div class="sidebar-user-avatar" id="sidebarAvatar">U</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name" id="sidebarUserName">Usuario</div>
            <div class="sidebar-user-role">Admin • Local</div>
          </div>
        </div>
      </div>
    `;

    html += '</nav>';
    return html;
  }

  function injectSidebar() {
    // Don't inject in iframe pages (setting.html loaded as iframe, viewAds, viewBm, viewPage)
    const skipPages = ['setting.html', 'viewAds.html', 'viewBm.html', 'viewPage.html', 'popup.html'];
    if (skipPages.includes(currentPage)) return;
    if (window.self !== window.top) return; // inside iframe

    // Insert sidebar at start of body
    document.body.insertAdjacentHTML('afterbegin', buildSidebar());

    // Remove old header-top navigation
    const oldHeader = document.getElementById('header');
    if (oldHeader) {
      oldHeader.style.display = 'none';
    }

    // Wrap existing content in main-with-sidebar
    const app = document.getElementById('app');
    if (app) {
      app.classList.add('main-with-sidebar', 'd-flex', 'flex-column', 'vh-100', 'h-100');
    }

    // Toggle handler
    const toggleBtn = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('mainSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebar_collapsed', isCollapsed);
        toggleBtn.querySelector('i').className = isCollapsed
          ? 'ri-arrow-right-s-line'
          : 'ri-arrow-left-s-line';
      });

      // Set correct icon on load
      if (sidebar.classList.contains('collapsed')) {
        toggleBtn.querySelector('i').className = 'ri-arrow-right-s-line';
      }
    }

    // Update user info when available
    setTimeout(() => {
      const userName = document.getElementById('userName');
      const sidebarName = document.getElementById('sidebarUserName');
      const sidebarAvatar = document.getElementById('sidebarAvatar');
      if (userName && userName.textContent && sidebarName) {
        sidebarName.textContent = userName.textContent;
        if (sidebarAvatar) {
          sidebarAvatar.textContent = userName.textContent.charAt(0).toUpperCase();
        }
      }
    }, 2000);
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSidebar);
  } else {
    injectSidebar();
  }
})();
