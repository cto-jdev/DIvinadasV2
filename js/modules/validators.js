/**
 * MÓDULO DE VALIDADORES - Validación de seguridad para entrada de datos
 * FASE 1 SECURITY: Prevenir inyecciones y datos malformados
 */

const Validators = (() => {
  return {
    /**
     * Validar que un ID de extensión sea válido
     * @param {string} extId - ID a validar
     * @param {Array} allowedIds - Lista blanca de IDs permitidos
     * @returns {boolean}
     */
    isValidExtensionId: (extId, allowedIds = []) => {
      if (!extId || typeof extId !== 'string') return false;
      if (allowedIds.length === 0) return false; // Requiere lista blanca
      return allowedIds.includes(extId.trim());
    },

    /**
     * Validar ID de usuario de Facebook (debe ser numérico)
     * @param {string} fbUid - ID a validar
     * @returns {boolean}
     */
    isValidFacebookUID: (fbUid) => {
      if (!fbUid) return false;
      return /^\d{1,20}$/.test(fbUid.toString().trim());
    },

    /**
     * Validar token DTSG de Facebook (alfanumérico, sin espacios)
     * @param {string} dtsg - Token a validar
     * @returns {boolean}
     */
    isValidFacebookDTSG: (dtsg) => {
      if (!dtsg) return false;
      // DTSG típicamente es alfanumérico, entre 40-200 caracteres
      return /^[a-zA-Z0-9]{40,200}$/.test(dtsg.toString().trim());
    },

    /**
     * Validar URL para fetch (prevenir SSRF)
     * @param {string} url - URL a validar
     * @param {Array} allowedDomains - Dominios permitidos (opcional)
     * @returns {boolean}
     */
    isValidFetchURL: (url, allowedDomains = ['facebook.com', 'business.facebook.com']) => {
      try {
        const urlObj = new URL(url);
        // Asegurar HTTPS
        if (urlObj.protocol !== 'https:') {
          console.warn('⚠️ Fetch URL debe usar HTTPS');
          return false;
        }
        // Validar dominio si se proporciona lista blanca
        if (allowedDomains.length > 0) {
          const domain = urlObj.hostname;
          const isAllowed = allowedDomains.some(allowed =>
            domain === allowed || domain.endsWith('.' + allowed)
          );
          if (!isAllowed) {
            console.warn(`⚠️ Dominio no permitido: ${domain}`);
            return false;
          }
        }
        return true;
      } catch (e) {
        console.warn('⚠️ URL inválida:', e);
        return false;
      }
    },

    /**
     * Sanitizar string para prevenir XSS
     * @param {string} str - String a sanitizar
     * @returns {string}
     */
    sanitizeString: (str) => {
      if (typeof str !== 'string') return '';
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    },

    /**
     * Validar respuesta de extensión Chrome
     * @param {any} response - Respuesta a validar
     * @returns {boolean}
     */
    isValidChromeResponse: (response) => {
      if (!response || typeof response !== 'object') {
        console.warn('⚠️ Respuesta de extensión inválida');
        return false;
      }
      return true;
    },

    /**
     * Validar credenciales antes de almacenarlas
     * @param {object} credentials - Objeto con credenciales
     * @returns {boolean}
     */
    validateCredentials: (credentials) => {
      if (!credentials || typeof credentials !== 'object') return false;

      const { uid, dtsg, accessToken } = credentials;

      // Al menos uid y dtsg deben ser válidos
      if (!this.isValidFacebookUID(uid)) {
        console.warn('⚠️ Facebook UID inválido');
        return false;
      }

      if (dtsg && !this.isValidFacebookDTSG(dtsg)) {
        console.warn('⚠️ Facebook DTSG inválido');
        return false;
      }

      return true;
    }
  };
})();

// Exportar para Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validators;
}
