/**
 * mock-extension.js  — DivinAds v2.0
 * ================================================
 * BRIDGE: Web App ↔ Facebook Real
 * ================================================
 * En modo WEB LOCAL (no extensión):
 *   - Si hay sesión de FB activa en el server → usa /api/fb-fetch (REAL)
 *   - Si no hay sesión → datos demo para visualización
 *
 * En modo EXTENSIÓN real (Chrome/Edge cargada):
 *   - Este archivo no tiene efecto (chrome.runtime ya existe)
 * ================================================
 */

// ──────────────────────────────────────────────────────────────────
// 0. ¿Estamos en modo extensión real? Si sí, no hacer nada.
//    Detectamos: chrome-extension:// URL, chrome.runtime.id válido,
//    o si chrome.runtime.sendMessage es nativo (no mock anterior)
// ──────────────────────────────────────────────────────────────────
const _isExtensionContext = (function() {
  // URL de extensión — definitivamente estamos dentro de la extensión
  if (typeof location !== 'undefined' && location.protocol === 'chrome-extension:') return true;
  if (typeof location !== 'undefined' && location.protocol === 'moz-extension:') return true;
  // chrome.runtime.id existe y sendMessage es función nativa (no la nuestra)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id
      && typeof chrome.runtime.sendMessage === 'function'
      && !chrome.runtime.sendMessage.__divinads_mock__) return true;
  return false;
})();

if (_isExtensionContext) {
  console.log('✅ Extensión real detectada — mock-extension.js inactivo');
} else {

// ──────────────────────────────────────────────────────────────────
// 1. VERIFICAR SESIÓN REAL DE FACEBOOK EN EL SERVIDOR
// ──────────────────────────────────────────────────────────────────
let _fbSession = null; // { uid, accessToken, dtsg, hasMana‌gement }
let _fbSessionChecked = false;

async function checkServerFbSession() {
  if (_fbSessionChecked) return _fbSession;
  try {
    const r = await fetch('/api/fb-session');
    const data = await r.json();
    if (data.sessions && data.sessions.length > 0) {
      _fbSession = data.sessions[0];
      console.log(`🔗 [Bridge] Sesión real de Facebook: uid=${_fbSession.uid} | token=${_fbSession.hasToken ? 'OK' : 'NO'}`);
    } else {
      console.warn('⚠️ [Bridge] Sin sesión real de Facebook → modo demo');
      _fbSession = null;
    }
  } catch (e) {
    console.warn('⚠️ [Bridge] Servidor no disponible, usando demo:', e.message);
    _fbSession = null;
  }
  _fbSessionChecked = true;
  return _fbSession;
}

// ──────────────────────────────────────────────────────────────────
// 2. PROXY FETCH REAL → /api/fb-fetch
//    Reemplaza el fetch2 mock con peticiones reales al servidor
// ──────────────────────────────────────────────────────────────────
async function realFetch(url, options = {}) {
  const session = await checkServerFbSession();
  if (!session) {
    // Sin sesión → fallback a mock
    return mockFetchResponse(url, options);
  }

  try {
    const response = await fetch('/api/fb-fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: session.uid, url, options }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (errData.code === 'NO_FACEBOOK_SESSION') {
        _fbSession = null;
        return mockFetchResponse(url, options);
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

    // Actualizar tokens de sesión si vienen en la respuesta
    if (result.fbSession) {
      if (result.fbSession.accessToken) _fbSession.accessToken = result.fbSession.accessToken;
      if (result.fbSession.dtsg)        _fbSession.dtsg        = result.fbSession.dtsg;
    }

    return result;
  } catch (err) {
    console.warn('[Bridge] fetch real falló, usando mock:', err.message, '→', url.substring(0, 80));
    return mockFetchResponse(url, options);
  }
}

// ──────────────────────────────────────────────────────────────────
// 3. MOCK DEL OBJETO chrome.runtime
//    chrome.runtime.sendMessage → redirige al handler
// ──────────────────────────────────────────────────────────────────
window.chrome = window.chrome || {};
window.chrome.runtime = {
  sendMessage: function(extId, message, callback) {
    const responsePromise = mockHandleMessage(message);
    if (typeof callback === 'function') {
      // fetch2 usa callback — resolver la Promise y llamar el callback
      responsePromise
        .then(res  => callback(res  || {}))
        .catch(err => callback({ error: err?.message || String(err) }));
      // Retornar Promise también para fetch2 async path (se ignorará por being settled)
      return responsePromise;
    }
        return responsePromise;
    },
    lastError: null
};
window.chrome.runtime.sendMessage.__divinads_mock__ = true;

// ──────────────────────────────────────────────────────────────────
// 4. HANDLER PRINCIPAL DE MENSAJES (ahora async para fetch real)
// ──────────────────────────────────────────────────────────────────
async function mockHandleMessage(message) {
  const type = message && message.type;

  switch (type) {

    case 'checkUser': {
      const session = await checkServerFbSession();
      if (session && session.uid) {
        // Obtener nombre real si hay token
        let name = 'Usuario Facebook';
        try {
          const meRes = await fetch('/api/fb-me?uid=' + session.uid);
          const meData = await meRes.json();
          if (meData.name) name = meData.name;
        } catch {}
        return {
          uid: session.uid,
          name,
          avatar: '',
          dtsg: _fbSession?.dtsg || '',
          lsd: ''
        };
      }
      // Demo
      return {
        uid: '100000000000001',
        name: 'Demo DivinAds (sin cookie)',
        avatar: '',
        dtsg: 'demo_dtsg',
        lsd: 'demo_lsd'
      };
    }

    case 'getVersion':
      return { version: '2.0.0-web' };

    case 'getVersionTxt':
      return 'v2.0.0-WEB';

    case 'fetch': {
      // PETICIÓN FETCH — usa el proxy real si hay sesión
      return await realFetch(message.url, message.options || {});
    }

    case 'getCookie': {
      // No podemos devolver cookies reales desde JS por seguridad;
      // el server las maneja directamente
      return 'c_user=; xs=; datr=; fr=';
    }

    case 'setCookie':
      return { success: true };

    case 'emptyCookie':
      return { success: true };

    case 'newTab':
      window.open(message.url, '_blank');
      return { success: true };

    case 'getLocalStorage':
      try {
        const val = localStorage.getItem(message.name);
        return val ? JSON.parse(val) : null;
      } catch { return null; }

    case 'setLocalStorage':
      try {
        localStorage.setItem(message.key || message.name, JSON.stringify(message.data));
        return { success: true };
      } catch { return { success: false }; }

    case 'removeLocalStorage':
      try {
        localStorage.removeItem(message.name);
        return { success: true };
      } catch { return { success: false }; }

    case 'getAllLocalStore':
      try {
        const all = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          try { all[k] = JSON.parse(localStorage.getItem(k)); } catch { all[k] = localStorage.getItem(k); }
        }
        return all;
      } catch { return {}; }

    case 'clearLocalStorage':
      localStorage.clear();
      return { success: true };

    case 'reloadExtension':
      return { success: true };

    case 'getBase64':
      return null;

    case 'uploadImage':
      return { success: true, handle: 'handle_' + Date.now() };

    default:
      console.warn('[Bridge] Tipo no reconocido:', type, message);
      return null;
  }
}

// ──────────────────────────────────────────────────────────────────
// 5. DATOS DEMO (solo cuando no hay sesión real de Facebook)
// ──────────────────────────────────────────────────────────────────
function mockFetchResponse(url, options) {
  const u = url || '';

  if (u.includes('/me?') || u.includes('/fb-me')) {
    return { status: 200, ok: true, json: { id: '100000000000001', name: 'Demo Usuario', email: 'demo@divinads.com' } };
  }
  if (u.includes('/me/businesses') || u.includes('/businesses')) {
    return {
      status: 200, ok: true,
      json: { data: [
        { id: '400000000000001', name: 'BM Demo Alpha', verification_status: 'verified' },
        { id: '400000000000002', name: 'BM Demo Beta', verification_status: 'not_verified' }
      ]}
    };
  }
  if (u.includes('/adaccounts') || u.includes('act_')) {
    return {
      status: 200, ok: true,
      json: { data: [
        { id: 'act_500000001', account_id: '500000001', name: 'Cuenta Demo Ads #1', account_status: 1, currency: 'USD', balance: '145000', insights: { data: [{ spend: '4230.50' }] } },
        { id: 'act_500000002', account_id: '500000002', name: 'Cuenta Demo Ads #2', account_status: 1, currency: 'USD', balance: '25000', insights: { data: [{ spend: '890.00' }] } }
      ], paging: {} }
    };
  }
  if (u.includes('/accounts') || u.includes('/pages')) {
    return {
      status: 200, ok: true,
      json: { data: [
        { id: '600000000000001', name: 'Fanpage Demo A', fan_count: 55000, tasks: ['ADVERTISE'] },
        { id: '600000000000002', name: 'Tienda Demo Online', fan_count: 12050, tasks: ['MODERATE', 'ADVERTISE'] }
      ], paging: {} }
    };
  }
  if (u.includes('facebook.com/billing') || u.includes('adsmanager')) {
    return { status: 200, ok: true, text: '', json: {} };
  }
  return { status: 200, ok: true, json: { data: [], success: true }, text: '' };
}

// ──────────────────────────────────────────────────────────────────
// 6. FLAGS Y URL PATCH para scripts.js
// ──────────────────────────────────────────────────────────────────
window.__MOCK_MODE__ = true;

(function() {
  const url = new URL(location.href);
  if (!url.searchParams.get('extId')) {
    url.searchParams.set('extId', 'divinads-web-bridge');
    history.replaceState(null, '', url.toString());
  }
})();

window.__checkExtensionOverride__ = true;

// ──────────────────────────────────────────────────────────────────
// 7. FUNCIÓN checkUser global (usada por scripts.js)
// ──────────────────────────────────────────────────────────────────
window.checkUser = async function() {
  const session = await checkServerFbSession();
  if (session && session.uid) {
    let name = 'Usuario Facebook';
    try {
      const r = await fetch('/api/fb-me?uid=' + session.uid);
      const d = await r.json();
      if (d.name) name = d.name;
    } catch {}
    return { uid: session.uid, name, avatar: '', dtsg: _fbSession?.dtsg || '' };
  }
  return { uid: '100000000000001', name: 'Demo (sin cookie)', avatar: '', dtsg: '' };
};

// ──────────────────────────────────────────────────────────────────
// 8. INICIALIZACIÓN: Banner + Datos reales o demo
// ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async function() {

  // Verificar sesión real primero
  const session = await checkServerFbSession();
  const isRealMode = session && session.hasToken;

  // Actualizar flag global de modo real/demo
  window.__MOCK_MODE__ = !isRealMode;

  // ── Banner de estado ──────────────────────────
  const banner = document.createElement('div');
  banner.id = 'connection-banner';

  if (isRealMode) {
    banner.innerHTML = `🔗 <strong>CONECTADO A FACEBOOK REAL</strong> — uid: ${session.uid} &nbsp;|&nbsp; <a href="javascript:void(0)" onclick="document.getElementById('connection-banner').remove()" style="color:#fff;text-decoration:underline">Cerrar</a>`;
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#1b5e20;color:white;text-align:center;padding:6px 12px;font-size:13px;z-index:99999;font-family:monospace';
    document.body.appendChild(banner);
    // Auto-ocultar banner de conexión exitosa después de 5s
    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 5000);
  } else {
    // Solo mostrar banner demo en modo proxy sin sesión (nunca en modo extensión real)
    banner.innerHTML = `🎭 <strong>MODO DEMO</strong> — Sin sesión Facebook activa &nbsp;|&nbsp; <a href="/fb-connect.html" style="color:#FFE082;text-decoration:underline">Conectar Facebook</a> &nbsp;|&nbsp; <a href="javascript:void(0)" onclick="document.getElementById('connection-banner').remove()" style="color:#fff;text-decoration:underline">Cerrar</a>`;
    banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#bf360c;color:white;text-align:center;padding:6px 12px;font-size:13px;z-index:99999;font-family:monospace';
    document.body.appendChild(banner);
  }

  // ── Si hay sesión real, el fb.loadAds/loadBm/loadPage
  //    harán peticiones reales via fetch2 → realFetch → /api/fb-fetch
  //    Solo inyectamos demo data si estamos en modo demo
  // ──────────────────────────────────────────────────
  if (!isRealMode) {
    injectDemoData();
  }
});


function injectDemoData() {
  // Reintenta cada 1.5s hasta que tong exista y sea 0
  const interval = setInterval(() => {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const tong = document.getElementById('tong');

    if (!tong || tong.innerText !== '0') return; // esperar al DOM real

    if (['ads', 'viewAds'].includes(currentPage)) {
      clearInterval(interval);
      const mockAds = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        adId: 'act_' + (500000 + i * 111111),
        account: ['Campaña LATAM Principal', 'Account Advantage+ Alpha', 'BM Retargeting Regional',
          'Campaña E-commerce Global', 'Cuenta Prospecting #5', 'Ad Account H.E.C',
          'Campaña Retargeting 7d', 'Account Lookalike 2%', 'BM Escala Masiva',
          'Cuenta Conversiones Directas', 'Account Video Views', 'Campaña Lead Gen'][i],
        status: [1, 1, 1, 1, 2, 1, 1, 3, 1, 1, 2, 1][i],
        balance: '$' + (Math.random() * 100).toFixed(2),
        threshold: '$' + (250 + Math.random() * 750).toFixed(2),
        spend: (Math.random() * 5000).toFixed(2),
        currency: 'USD',
        timezone: 'America/New_York',
        country: 'US',
        payment: 'Visa - 4242',
        pixel: '234567890'
      }));
      if (typeof $ !== 'undefined') {
        $(document).trigger('loadAdsSuccess', [mockAds]);
      }

    } else if (['bm', 'viewBm'].includes(currentPage)) {
      clearInterval(interval);
      const mockBm = [
        { id: 1, bmId: '400111222333444', name: 'BM DivinAds Alpha [LIVE]', status: 'LIVE', bmType: 'BM5', limit: '250', adAccount: 4, bmPage: 3, instaAccount: 2, adminAccount: 2, pixelCount: 1 },
        { id: 2, bmId: '400222333444555', name: 'BM Beta [LIVE]', status: 'LIVE', bmType: 'BM5', limit: '250', adAccount: 2, bmPage: 1, instaAccount: 1, adminAccount: 1, pixelCount: 0 },
        { id: 3, bmId: '400333444555666', name: 'BM Gamma [DIE VV]', status: 'DIE_VV', bmType: 'BM2', limit: '50', adAccount: 1, bmPage: 1, instaAccount: 0, adminAccount: 1, pixelCount: 0 },
        { id: 4, bmId: '400444555666777', name: 'BM Delta [DIE]', status: 'DIE', bmType: 'BM5', limit: '250', adAccount: 3, bmPage: 2, instaAccount: 1, adminAccount: 2, pixelCount: 1 },
        { id: 5, bmId: '400555666777888', name: 'BM Epsilon [LIVE]', status: 'LIVE', bmType: 'BM5', limit: '250', adAccount: 5, bmPage: 4, instaAccount: 3, adminAccount: 3, pixelCount: 2 }
      ];
      if (typeof $ !== 'undefined') {
        $(document).trigger('loadBmSuccess', [mockBm]);
      }

    } else if (['page', 'viewPage'].includes(currentPage)) {
      clearInterval(interval);
      const mockPages = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        pageId: '600' + (1000000 + i * 111111),
        name: ['Fanpage Comercial A', 'Tienda Online CO', 'Marca Personal B', 'E-commerce Global',
          'News & Media Page', 'Local Business C', 'Brand Influencer', 'Community Page'][i],
        status: 1,
        followers: [55000, 12050, 8300, 45000, 92000, 3400, 28000, 16700][i],
        quality: ['Green', 'Green', 'Yellow', 'Green', 'Green', 'Red', 'Green', 'Yellow'][i],
        admins: [2, 1, 3, 2, 4, 1, 2, 2][i]
      }));
      if (typeof $ !== 'undefined') {
        $(document).trigger('loadPageSuccess', [mockPages]);
      }
    }
  }, 1500);

  // Timeout total de 15s para evitar intervalos infinitos
  setTimeout(() => clearInterval(interval), 15000);
}

} // fin del bloque principal (no extensión real)
