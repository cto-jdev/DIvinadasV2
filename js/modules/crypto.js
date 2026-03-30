/**
 * MÓDULO DE CRIPTOGRAFÍA - Encriptación simple para credenciales
 * Usa Base64 + XOR con clave derivada del navegador como protección básica
 * NOTA: Para producción con datos críticos, usar libsodium.js o TweetNaCl.js
 */

const CryptoModule = (() => {
  // Clave derivada del user agent para ofuscación básica
  const getEncryptionKey = () => {
    const ua = navigator.userAgent;
    return btoa(ua).substring(0, 32);
  };

  const xorEncrypt = (text, key) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  };

  const xorDecrypt = (encrypted, key) => {
    try {
      const text = atob(encrypted);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (e) {
      console.error('Error decrypting credential:', e);
      return null;
    }
  };

  return {
    /**
     * Almacenar credencial encriptada en sessionStorage (expira al cerrar tab)
     */
    setSecureCredential: (key, value) => {
      try {
        const encKey = getEncryptionKey();
        const encrypted = xorEncrypt(value, encKey);
        sessionStorage.setItem(`secure_${key}`, encrypted);
        return true;
      } catch (e) {
        console.error('Error setting secure credential:', e);
        return false;
      }
    },

    /**
     * Recuperar credencial desencriptada desde sessionStorage
     */
    getSecureCredential: (key) => {
      try {
        const encrypted = sessionStorage.getItem(`secure_${key}`);
        if (!encrypted) return null;

        const encKey = getEncryptionKey();
        return xorDecrypt(encrypted, encKey);
      } catch (e) {
        console.error('Error getting secure credential:', e);
        return null;
      }
    },

    /**
     * Eliminar credencial de sessionStorage
     */
    removeSecureCredential: (key) => {
      try {
        sessionStorage.removeItem(`secure_${key}`);
        return true;
      } catch (e) {
        console.error('Error removing secure credential:', e);
        return false;
      }
    },

    /**
     * Limpiar TODAS las credenciales al cerrar sesión
     */
    clearAllCredentials: () => {
      try {
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('secure_')) {
            sessionStorage.removeItem(key);
          }
        });
        return true;
      } catch (e) {
        console.error('Error clearing credentials:', e);
        return false;
      }
    }
  };
})();

// Exportar para Node.js si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoModule;
}
