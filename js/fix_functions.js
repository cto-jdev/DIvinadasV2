/**
 * FIX FUNCTIONS - Funciones básicas para evitar errores
 * Archivo simple sin compresión
 */

// Función getLocalStorage simple
if (typeof getLocalStorage === 'undefined') {
    window.getLocalStorage = function(key) {
        return new Promise((resolve, reject) => {
            try {
                const value = localStorage.getItem(key);
                resolve(value ? JSON.parse(value) : null);
            } catch (error) {
                resolve(null);
            }
        });
    };
}

// Función setLocalStorage simple
if (typeof setLocalStorage === 'undefined') {
    window.setLocalStorage = function(key, value) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                resolve(true);
            } catch (error) {
                resolve(false);
            }
        });
    };
}

// Función fetch2 simple
if (typeof fetch2 === 'undefined') {
    window.fetch2 = async function(url, options = {}) {
        try {
            const response = await fetch(url, options);
            const text = await response.text();
            
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                json = { error: 'Invalid JSON response', text: text };
            }
            
            return {
                ok: response.ok,
                status: response.status,
                json: json,
                text: text
            };
        } catch (error) {
            return {
                ok: false,
                status: 0,
                json: { error: error.message },
                text: ''
            };
        }
    };
}

// Objeto fb básico
if (typeof fb === 'undefined') {
    window.fb = {
        accessToken: null,
        token: null,
        uid: null,
        dtsg: null
    };
}

console.log('🔧 FIX FUNCTIONS cargado - Funciones básicas disponibles'); 