/**
 * MÓDULO DE UTILIDADES FACEBOOK
 * FASE 2: Consolidación de funciones duplicadas
 * Extraído de: libs1.js, libs2.js, libs3.js, libs4.js, libs5.js
 */

const FacebookUtils = (() => {
  /**
   * Obtener información del usuario actual de Facebook
   * Consolidado de: getCurrentUser en múltiples libs
   */
  const getCurrentUser = async () => {
    try {
      // Obtener UID del usuario actual
      const uid = CryptoModule.getSecureCredential('fb_uid');
      if (!uid) {
        throw new Error('User not authenticated');
      }

      // Obtener información del usuario desde localStorage
      const userInfo = await getLocalStorage(`userInfo_${uid}`);

      if (!userInfo) {
        console.warn('⚠️ No cached user info found');
        return null;
      }

      return {
        id: uid,
        ...userInfo
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  /**
   * Convertir URL de imagen a Base64
   * Consolidado de: getBase64ImageFromUrl en múltiples libs
   */
  const getBase64ImageFromUrl = async (imageUrl, canvas = null) => {
    try {
      // Validar URL
      if (!Validators.isValidFetchURL(imageUrl)) {
        throw new Error('Invalid image URL');
      }

      // Usar canvas si se proporciona
      if (canvas) {
        const context = canvas.getContext('2d');
        const image = new Image();

        image.crossOrigin = 'anonymous';
        image.onload = function () {
          context.drawImage(image, 0, 0);
        };

        image.src = imageUrl;
        return canvas.toDataURL('image/png', 0.9);
      }

      // Alternativa: usar fetch
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  /**
   * Obtener cookie específico
   */
  const getCookie = async (name = null) => {
    try {
      // Si se proporciona nombre, buscar cookie específico
      if (name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [cookieName, cookieValue] = cookie.trim().split('=');
          if (cookieName === name) {
            return decodeURIComponent(cookieValue);
          }
        }
        return null;
      }

      // Si no, retornar todos los cookies
      return document.cookie;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  };

  /**
   * Extraer usuario ID de cookies
   */
  const getUserIdFromCookie = async () => {
    try {
      const cookieData = await getCookie();
      if (!cookieData || !cookieData.includes('c_user=')) {
        return null;
      }

      const userId = cookieData.split('c_user=')[1].split(';')[0];

      // Validar que sea un número
      if (!Validators.isValidFacebookUID(userId)) {
        return null;
      }

      return userId;
    } catch (error) {
      console.error('Error extracting user ID from cookie:', error);
      return null;
    }
  };

  /**
   * Parsear respuesta de HTML para extraer tokens
   */
  const extractTokensFromHTML = (html, tokenType = 'accessToken') => {
    try {
      const patterns = {
        accessToken: /(?<="accessToken":")[^"]*/g,
        token: /(?<="token":")[^"]*/g,
        dtsg: /(?<="__a":")[^"]*/g
      };

      const pattern = patterns[tokenType] || patterns.token;
      const matches = html.match(pattern);

      if (!matches || matches.length === 0) {
        return null;
      }

      // Filtrar por patrón específico
      if (tokenType === 'accessToken') {
        return matches.find(m => m.includes('EAAG')) || null;
      } else if (tokenType === 'token') {
        return matches.find(m => m.startsWith('NA')) || null;
      }

      return matches[0];
    } catch (error) {
      console.error(`Error extracting ${tokenType}:`, error);
      return null;
    }
  };

  /**
   * Delay/Sleep promise
   */
  const delay = (milliseconds) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), milliseconds);
    });
  };

  return {
    getCurrentUser,
    getBase64ImageFromUrl,
    getCookie,
    getUserIdFromCookie,
    extractTokensFromHTML,
    delay
  };
})();

// Exportar para Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FacebookUtils;
}
