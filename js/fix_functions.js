/**
 * FIX FUNCTIONS - Funciones básicas para evitar errores
 * Archivo simple sin compresión
 */

// Función getLocalStorage simple
if (typeof getLocalStorage === 'undefined') {
    window.getLocalStorage = function(key) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof localStorage === 'undefined') {
                    resolve(null);
                    return;
                }
                const value = localStorage.getItem(key);
                if (value === null) {
                    resolve(null);
                } else {
                    try {
                        resolve(JSON.parse(value));
                    } catch (parseError) {
                        console.warn('Error parsing localStorage value:', parseError);
                        resolve(value); // Devolver valor sin parsear si falla JSON.parse
                    }
                }
            } catch (error) {
                console.warn('Error en getLocalStorage:', error);
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
                if (typeof localStorage === 'undefined') {
                    console.warn('localStorage no disponible');
                    resolve(false);
                    return;
                }
                localStorage.setItem(key, JSON.stringify(value));
                resolve(true);
            } catch (error) {
                console.warn('Error en setLocalStorage:', error);
                resolve(false);
            }
        });
    };
}

// Función fetch2 simple
if (typeof fetch2 === 'undefined') {
    window.fetch2 = async function(url, options = {}) {
        try {
            if (typeof fetch === 'undefined') {
                throw new Error('fetch no disponible');
            }
            
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
            console.warn('Error en fetch2:', error);
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

// FIX FUNCTIONS cargado - Funciones básicas disponibles 