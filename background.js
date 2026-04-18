/**
 * background.js — DivinAds Service Worker (Manifest V3)
 * =====================================================
 * Maneja toda la comunicación entre la UI de la extensión y Facebook.
 * Actúa como proxy para peticiones de red, cookies y storage.
 */

'use strict';

// ─── Lifecycle del Service Worker ─────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[DivinAds SW] Instalado correctamente.');
  self.skipWaiting(); // Activar inmediatamente sin esperar
});

self.addEventListener('activate', (event) => {
  console.log('[DivinAds SW] Activado y listo.');
  event.waitUntil(self.clients.claim()); // Tomar control de todas las páginas
});

// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN E INICIO
// ─────────────────────────────────────────────────────────────
const FB_DOMAINS = [
  'https://www.facebook.com',
  'https://business.facebook.com',
  'https://adsmanager.facebook.com',
  'https://graph.facebook.com',
  'https://upload.facebook.com'
];

const APP_VERSION = '1.0.0';

// NOTA: chrome.action.onClicked no se registra aquí porque el manifest
// define "default_popup" — ambos son mutuamente excluyentes en Chrome MV3.
// El popup.html (mostrado al hacer clic en el ícono) maneja la apertura del dashboard.

// ─────────────────────────────────────────────────────────────
// LISTENER PRINCIPAL DE MENSAJES
// ─────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender).then(sendResponse).catch(err => {
    console.error('[DivinAds BG] Error:', err);
    sendResponse({ error: err.message || 'Unknown error' });
  });
  return true; // Indica respuesta asíncrona
});

// También acepta mensajes externos desde páginas web autorizadas
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  // Verificar que el origen sea válido
  if (!isValidOrigin(sender.url)) {
    sendResponse({ error: 'Origen no autorizado' });
    return;
  }
  handleMessage(message, sender).then(sendResponse).catch(err => {
    sendResponse({ error: err.message || 'Unknown error' });
  });
  return true;
});

function isValidOrigin(url) {
  if (!url) return false;
  const allowed = [
    chrome.runtime.getURL(''),
    'http://localhost:8080',
    'http://localhost:3000',
    'file://'
  ];
  return allowed.some(origin => url.startsWith(origin));
}

// ─────────────────────────────────────────────────────────────
// DISPATCHER DE MENSAJES
// ─────────────────────────────────────────────────────────────
async function handleMessage(message, sender) {
  const { type } = message;

  switch (type) {

    case 'checkUser':
      return await checkFacebookUser();

    case 'getVersion':
      return { version: APP_VERSION };

    case 'getVersionTxt':
      return `v${APP_VERSION}`;

    case 'fetch':
      return await proxyFetch(message.url, message.options || {});

    case 'getCookie':
      return await getFacebookCookies();

    case 'setCookie':
      return await setFacebookCookies(message.cookie);

    case 'emptyCookie':
      return await clearFacebookCookies(message.domain || 'facebook.com');

    case 'newTab':
      return await openNewTab(message.url);

    case 'getLocalStorage':
      return await getFromStorage(message.name);

    case 'setLocalStorage':
      return await saveToStorage(message.key, message.data);

    case 'removeLocalStorage':
      return await removeFromStorage(message.name);

    case 'getAllLocalStore':
      return await getAllFromStorage();

    case 'clearLocalStorage':
      return await clearAllStorage();

    case 'reloadExtension':
      chrome.runtime.reload();
      return { success: true };

    case 'getBase64':
      return await fetchBase64(message.url);

    case 'uploadImage':
      return await uploadImageToFacebook(message.imageData, message.enrollmentId, message.userData);

    default:
      console.warn('[DivinAds BG] Tipo de mensaje desconocido:', type);
      return { error: `Tipo desconocido: ${type}` };
  }
}

// ─────────────────────────────────────────────────────────────
// FUNCIONES DE FACEBOOK
// ─────────────────────────────────────────────────────────────


/**
 * Obtiene datos del usuario actual de Facebook vía cookies activas.
 * Prioridad: (1) fb_tokens del storage (inyectado por content.js),
 *            (2) fetch directo a facebook.com para extraer DTSG.
 */
async function checkFacebookUser() {
  try {
    // ── 1. Recolectar cookies del navegador ─────────────────────
    const domains = ['.facebook.com', 'facebook.com', 'www.facebook.com'];
    let allCookies = [];
    for (const domain of domains) {
      const cookies = await chrome.cookies.getAll({ domain });
      allCookies = allCookies.concat(cookies);
    }
    const cookieMap = new Map();
    allCookies.forEach(c => {
      if (!cookieMap.has(c.name) || c.value) cookieMap.set(c.name, c);
    });

    const cUser = cookieMap.get('c_user');
    const xs    = cookieMap.get('xs');

    if (!cUser || !cUser.value) {
      console.warn('[DivinAds BG] No se encontró c_user en cookies.');
      return { error: 'No hay sesión activa en Facebook.' };
    }

    const uid = cUser.value;
    const cookieStr = Array.from(cookieMap.values()).map(c => `${c.name}=${c.value}`).join('; ');

    // ── 2. Leer todos los tokens guardados por content.js ────────
    let dtsg = '', lsd = '', name = `Usuario ${uid}`;
    let accessToken = '', tokenEAAG = '', tokenEAAB = '';
    try {
      const stored = await chrome.storage.local.get([
        'fb_tokens', 'accessToken', 'dtsg',
        'fb_token_eaag', 'fb_token_eaab'
      ]);

      // Core tokens (uid, dtsg, lsd, name)
      const cached = stored.fb_tokens;
      if (cached && cached.uid === uid) {
        dtsg = cached.dtsg || '';
        lsd  = cached.lsd  || '';
        name = cached.name || name;
      }

      // DTSG guardado directamente por content.js (más fresco que fb_tokens)
      if (!dtsg && stored.dtsg) {
        dtsg = stored.dtsg;
      }

      // Token EAAG (Business Manager / Graph API)
      tokenEAAG = stored.fb_token_eaag || '';

      // Token EAAB (Ads Manager)
      tokenEAAB = stored.fb_token_eaab || '';

      // accessToken principal guardado por content.js
      accessToken = stored.accessToken || tokenEAAG || tokenEAAB || '';

      console.log('[DivinAds BG] Tokens leídos del storage —',
        `DTSG:${dtsg ? '✓' : '✗'} EAAG:${tokenEAAG ? '✓' : '✗'} EAAB:${tokenEAAB ? '✓' : '✗'}`);
    } catch (e) {
      console.warn('[DivinAds BG] Error leyendo storage:', e.message);
    }

    // ── 3. Fallback: fetch DTSG si content.js no lo encontró ──
    if (!dtsg) {
      console.log('[DivinAds BG] DTSG no disponible, intentando fetch...');
      try {
        const details = await fetchFacebookUserDetails(cookieStr);
        dtsg = details.dtsg || '';
        lsd  = details.lsd  || lsd;
        if (dtsg) {
          await chrome.storage.local.set({ dtsg, fb_tokens: { uid, dtsg, lsd, name } });
          console.log('[DivinAds BG] DTSG obtenido via fetch y cacheado.');
        }
      } catch (e) {
        console.warn('[DivinAds BG] fetchFacebookUserDetails falló:', e.message);
      }
    }

    return {
      uid,
      name,
      avatar: '',
      dtsg,
      lsd,
      accessToken,
      tokenEAAG,
      tokenEAAB,
      cookies: cookieStr,
      hasSession: !!(cUser && xs)
    };

  } catch (err) {
    console.error('[DivinAds BG] checkFacebookUser error:', err);
    return { error: err.message };
  }
}

/**
 * Obtiene datos completos del usuario (nombre, dtsg) — llamada separada más lenta.
 * Usar solo cuando se necesiten estos datos, no en el checkUser inicial.
 */
async function fetchFacebookUserDetails(cookieStr) {
  let dtsg = '', lsd = '', userName = '', userAvatar = '';

  try {
    const profileRes = await proxyFetch('https://www.facebook.com/', {
      headers: { 'Cookie': cookieStr }
    });
    if (profileRes && profileRes.text) {
      const html = profileRes.text || '';
      const dtsgMatch = html.match(/"DTSGInitialData"[^}]*"token"\s*:\s*"([^"]+)"/);
      const lsdMatch  = html.match(/"LSD"\s*,\s*\[\s*\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"/);
      dtsg = dtsgMatch ? dtsgMatch[1] : '';
      lsd  = lsdMatch  ? lsdMatch[1]  : '';
    }
  } catch (e) {
    console.warn('[DivinAds BG] No se pudo obtener dtsg:', e.message);
  }

  return { dtsg, lsd, userName, userAvatar };
}


/**
 * Realiza una petición fetch como proxy (evita CORS).
 */
async function proxyFetch(url, options = {}) {
  try {
    const fetchOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      credentials: 'include'
    };

    if (options.body) {
      fetchOptions.body = options.body;
    }

    // Agregar headers de Facebook si es una petición a FB
    if (url && url.includes('facebook.com')) {
      fetchOptions.headers['Accept'] = 'application/json, text/plain, */*';
      fetchOptions.headers['Accept-Language'] = 'es-ES,es;q=0.9,en;q=0.8';
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    // Intentar parsear como JSON
    let jsonData;
    try {
      // Remover prefijo de seguridad de Facebook si existe
      const cleanText = responseText.replace(/^for\s*\(;;\);/, '').trim();
      jsonData = JSON.parse(cleanText);
    } catch {
      jsonData = responseText;
    }

    return {
      status: response.status,
      json: jsonData,
      text: responseText,
      ok: response.ok,
      url: response.url,
      redirected: response.redirected,
      headers: Object.fromEntries(response.headers.entries())
    };

  } catch (err) {
    console.error('[DivinAds BG] proxyFetch error:', url, err.message);
    return { error: err.message, status: 0 };
  }
}

/**
 * Obtiene todas las cookies de Facebook como string.
 */
async function getFacebookCookies() {
  try {
    const domains = ['.facebook.com', 'facebook.com', 'www.facebook.com'];
    let result = [];
    for (const domain of domains) {
      const cookies = await chrome.cookies.getAll({ domain });
      result = result.concat(cookies);
    }
    // De-duplicar
    const unique = Array.from(new Map(result.map(c => [c.name, c])).values());
    return unique.map(c => `${c.name}=${c.value}`).join('; ');
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Establece cookies en el dominio de Facebook.
 */
async function setFacebookCookies(cookieString) {
  if (!cookieString || typeof cookieString !== 'string') {
    return { success: false, error: 'Cookie string inválido' };
  }

  try {
    const pairs = cookieString.split(';').map(c => c.trim());
    const results = [];

    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx < 0) continue;
      const name = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();

      if (!name) continue;

      try {
        await chrome.cookies.set({
          url: 'https://www.facebook.com',
          domain: '.facebook.com',
          name,
          value,
          secure: true,
          sameSite: 'no_restriction'
        });
        results.push({ name, success: true });
      } catch (e) {
        results.push({ name, success: false, error: e.message });
      }
    }

    return { success: true, results };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Limpia todas las cookies del dominio especificado.
 */
async function clearFacebookCookies(domain = 'facebook.com') {
  try {
    const cookies = await chrome.cookies.getAll({ domain });
    for (const cookie of cookies) {
      const protocol = cookie.secure ? 'https://' : 'http://';
      const cookieUrl = `${protocol}${cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain}${cookie.path}`;
      await chrome.cookies.remove({ url: cookieUrl, name: cookie.name });
    }
    return { success: true, count: cookies.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Abre una nueva pestaña con la URL dada.
 */
async function openNewTab(url) {
  try {
    const tab = await chrome.tabs.create({ url });
    return { success: true, tabId: tab.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// FUNCIONES DE STORAGE (chrome.storage.local — persistente)
// ─────────────────────────────────────────────────────────────

async function getFromStorage(key) {
  try {
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
  } catch (err) {
    return null;
  }
}

async function saveToStorage(key, data) {
  try {
    await chrome.storage.local.set({ [key]: data });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function removeFromStorage(key) {
  try {
    await chrome.storage.local.remove(key);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getAllFromStorage() {
  try {
    return await chrome.storage.local.get(null);
  } catch (err) {
    return {};
  }
}

async function clearAllStorage() {
  try {
    await chrome.storage.local.clear();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// UTILIDADES DE IMAGEN
// ─────────────────────────────────────────────────────────────

async function fetchBase64(url) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const type = response.headers.get('content-type') || 'image/jpeg';
    const base64 = btoa(binary);
    return `data:${type};base64,${base64}`;
  } catch (err) {
    console.error('[DivinAds BG] fetchBase64 error:', err.message);
    return null;
  }
}

async function uploadImageToFacebook(imageDataUrl, enrollmentId, userData) {
  try {
    if (!imageDataUrl || !imageDataUrl.startsWith('data:')) {
      return { success: false, error: 'Datos de imagen inválidos' };
    }

    // Convertir dataURL a blob
    const base64Data = imageDataUrl.split(',')[1];
    const byteChars = atob(base64Data);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArr[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArr], { type: 'image/png' });

    const formData = new FormData();
    formData.append('file', blob, 'document.png');
    formData.append('upload_type', 'identity_document');

    const response = await fetch('https://upload.facebook.com/ajax/mercury/upload.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    const text = await response.text();
    const clean = text.replace(/^for\s*\(;;\);/, '');
    let data;
    try { data = JSON.parse(clean); } catch { data = {}; }

    if (data?.payload?.h) {
      return { success: true, handle: data.payload.h };
    }

    return { success: false, error: 'No se obtuvo handle de Facebook', raw: text.substring(0, 200) };

  } catch (err) {
    console.error('[DivinAds BG] uploadImage error:', err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// EVENTOS DE CICLO DE VIDA
// ─────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log(`[DivinAds] Extensión instalada. Razón: ${reason}`);
  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }
});
