/**
 * content.js — DivinAds Content Script
 * =====================================
 * Inyectado por la extensión en páginas de Facebook.
 * Lee directamente el outerHTML de la página (no inyecta <script> — el CSP de FB lo bloquea).
 *
 * Tokens que extrae:
 *   EAAG  — token de Business Manager (business.facebook.com)
 *   EAAB  — token de Ads Manager      (adsmanager.facebook.com / facebook.com/adsmanager)
 *   DTSG  — token anti-CSRF           (cualquier página FB logueada)
 *   LSD   — token de sesión leve
 *   UID   — ID numérico del usuario
 *
 * Dónde se guardan (chrome.storage.local):
 *   "accessToken"  → EAAG (prioridad 1)  → usado por FB.init() directamente
 *   "accessToken2" → EAAB                → usado por FB.getAccessToken2()
 *   "dtsg"         → DTSG                → usado por FB.init() directamente
 *   "fb_tokens"    → { uid, dtsg, lsd, name } → usado por background.checkFacebookUser()
 *   "fb_token_eaag"→ EAAG backup
 *   "fb_token_eaab"→ EAAB backup
 */

'use strict';

(function () {
  const url = window.location.href;

  // ── Detectar contexto de página ───────────────────────────────
  const isAdsManager = url.includes('adsmanager.facebook.com') ||
                       url.includes('facebook.com/adsmanager') ||
                       url.includes('facebook.com/ads/manager');

  const isBusinessManager = url.includes('business.facebook.com');

  // ── Helper: primer match de un array de patrones ──────────────
  function extract(html, patterns) {
    for (const p of patterns) {
      const m = html.match(p);
      if (m && m[1]) return m[1];
    }
    return '';
  }

  // ── Guardar en chrome.storage.local vía background ───────────
  function save(key, data) {
    try {
      chrome.runtime.sendMessage({ type: 'setLocalStorage', key, data });
    } catch (e) {
      // extensión recargada — silenciar
    }
  }

  // ── Extracción principal ──────────────────────────────────────
  function run() {
    // Leer todo el HTML de la página (incluye <head> con JSON embebido de FB)
    const html = document.documentElement.outerHTML;

    // ── EAAG — Business Manager / Graph API token ──────────────
    // Presente en business.facebook.com y algunas páginas de FB general
    const eaagMatches = html.match(/EAAG[a-zA-Z0-9]{50,}/g);
    const eaag = eaagMatches ? eaagMatches[0] : '';

    // ── EAAB — Ads Manager token ───────────────────────────────
    // Presente en adsmanager.facebook.com y facebook.com/adsmanager
    const eaabMatches = html.match(/EAAB[a-zA-Z0-9]{50,}/g);
    const eaab = eaabMatches ? eaabMatches[0] : '';

    // ── EAA* genérico (fallback si no hubo EAAG ni EAAB) ──────
    const eaaGeneric = (!eaag && !eaab)
      ? (html.match(/"accessToken"\s*:\s*"(EAA[^"]{20,})"/)?.[1] ||
         html.match(/window\.__accessToken\s*=\s*"([^"]+)"/)?.[1] || '')
      : '';

    // ── Core tokens (todos los contextos FB) ───────────────────
    const dtsg = extract(html, [
      /\["DTSGInitData",\[\],\{"token":"([^"]+)"/,
      /"DTSGInitialData"[^}]*"token"\s*:\s*"([^"]+)"/,
      /\{"name":"fb_dtsg","value":"([^"]+)"/,
      /"dtsg":\{"token":"([^"]+)"/,
      /name="fb_dtsg"\s+value="([^"]+)"/,
    ]);

    const lsd = extract(html, [
      /"LSD"\s*,\s*\[\s*\]\s*,\s*\{\s*"token"\s*:\s*"([^"]+)"/,
    ]);

    const uid = extract(html, [
      /"USER_ID"\s*:\s*"(\d+)"/,
      /"userID"\s*:\s*"(\d+)"/,
      /c_user=(\d+)/,
    ]);

    const name = extract(html, [
      /"NAME"\s*:\s*"([^"]+)"/,
      /"name"\s*:\s*"([^"]+)"[^}]*"__typename"\s*:\s*"User"/,
      /"shortName"\s*:\s*"([^"]+)"/,
    ]);

    // ── Guardar tokens en storage ─────────────────────────────
    //
    // "accessToken" key → FB.init() lo lee primero (evita el fetch a billing_hub)
    // Prioridad: EAAG > EAAB > EAA genérico
    const primaryToken = eaag || eaab || eaaGeneric;
    if (primaryToken) {
      save('accessToken', primaryToken);
    }

    // "accessToken2" key → usado por getAccessToken2()
    // Si estamos en adsmanager, EAAB es el token nativo de esa página
    if (isAdsManager && eaab) {
      save('accessToken2', eaab);
    } else if (eaab) {
      save('accessToken2', eaab);
    }

    // "dtsg" key → FB.init() lo lee primero (evita fetch)
    if (dtsg) {
      save('dtsg', dtsg);
    }

    // "fb_tokens" key → background.checkFacebookUser() lo lee para el UID
    if (uid) {
      save('fb_tokens', { uid, dtsg, lsd, name });
    }

    // Backups separados para diagnóstico y acceso directo
    if (eaag) save('fb_token_eaag', eaag);
    if (eaab) save('fb_token_eaab', eaab);

    // ── Log de diagnóstico ────────────────────────────────────
    if (primaryToken || uid || dtsg) {
      console.log(
        `[DivinAds] Tokens extraídos en ${isAdsManager ? 'AdsManager' : isBusinessManager ? 'BusinessManager' : 'Facebook'} —`,
        `UID: ${uid || '✗'},`,
        `DTSG: ${dtsg ? '✓' : '✗'},`,
        `EAAG: ${eaag ? eaag.slice(0, 12) + '…' : '✗'},`,
        `EAAB: ${eaab ? eaab.slice(0, 12) + '…' : '✗'}`
      );
    }
  }

  // ── Ejecución ─────────────────────────────────────────────────
  // 1. Inmediato (document_idle — DOM ya disponible)
  run();

  // 2. Retry en 3 s — FB carga muchos datos vía JS asíncrono
  setTimeout(run, 3000);

  // 3. Retry en 8 s — para páginas con carga muy lenta (adsmanager)
  if (isAdsManager || isBusinessManager) {
    setTimeout(run, 8000);
  }
})();
