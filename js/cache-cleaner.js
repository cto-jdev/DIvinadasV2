/**
 * DivinAds - Script de Limpieza Automática de Cache
 * Elimina automáticamente cache, localStorage, cookies y referencias
 * a dominios problemáticos como toolfb.vn, dashboard.toolfb.vn, etc.
 * 
 * Versión: 1.0.0
 * Autor: DivinAds Team
 */

(function() {
    'use strict';
    
    console.log('🧹 DivinAds - Iniciando limpieza automática de cache...');
    
    // Lista de dominios y URLs problemáticas a limpiar
    const problematicDomains = [
        'toolfb.vn',
        'dashboard.toolfb.vn',
        'fbtoll.vn',
        'via902',
        'toolfb',
        'fbtoll'
    ];
    
    // Función para limpiar localStorage
    function cleanLocalStorage() {
        try {
            const keys = Object.keys(localStorage);
            let cleaned = 0;
            
            keys.forEach(key => {
                const value = localStorage.getItem(key);
                if (value) {
                    // Buscar referencias a dominios problemáticos
                    problematicDomains.forEach(domain => {
                        if (value.includes(domain)) {
                            localStorage.removeItem(key);
                            console.log(`🗑️ Eliminado de localStorage: ${key} (contenía ${domain})`);
                            cleaned++;
                        }
                    });
                }
            });
            
            // Limpiar keys específicas que pueden causar problemas
            const specificKeys = [
                'redirectUrl', 'lastUrl', 'cachedUrl', 'baseUrl', 
                'apiUrl', 'serverUrl', 'toolUrl', 'dashboardUrl',
                'fb_url', 'tool_url', 'cached_endpoint', 'last_domain',
                'previous_url', 'backup_url', 'fallback_url'
            ];
            
            specificKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    const value = localStorage.getItem(key);
                    if (value && problematicDomains.some(domain => value.includes(domain))) {
                        localStorage.removeItem(key);
                        console.log(`🗑️ Eliminado key específica: ${key}`);
                        cleaned++;
                    }
                }
            });
            
            if (cleaned > 0) {
                console.log(`✅ Limpiados ${cleaned} elementos de localStorage`);
            }
            
        } catch (error) {
            console.warn('Error limpiando localStorage:', error);
        }
    }
    
    // Función para limpiar sessionStorage
    function cleanSessionStorage() {
        try {
            const keys = Object.keys(sessionStorage);
            let cleaned = 0;
            
            keys.forEach(key => {
                const value = sessionStorage.getItem(key);
                if (value) {
                    problematicDomains.forEach(domain => {
                        if (value.includes(domain)) {
                            sessionStorage.removeItem(key);
                            console.log(`🗑️ Eliminado de sessionStorage: ${key}`);
                            cleaned++;
                        }
                    });
                }
            });
            
            if (cleaned > 0) {
                console.log(`✅ Limpiados ${cleaned} elementos de sessionStorage`);
            }
        } catch (error) {
            console.warn('Error limpiando sessionStorage:', error);
        }
    }
    
    // Función para limpiar cookies problemáticas
    function cleanProblematicCookies() {
        try {
            const cookies = document.cookie.split(';');
            let cleaned = 0;
            
            cookies.forEach(cookie => {
                const eqPos = cookie.indexOf('=');
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                const value = eqPos > -1 ? cookie.substr(eqPos + 1) : '';
                
                // Verificar si la cookie contiene dominios problemáticos
                let shouldDelete = false;
                
                problematicDomains.forEach(domain => {
                    if (value.includes(domain) || name.includes(domain)) {
                        shouldDelete = true;
                    }
                });
                
                if (shouldDelete) {
                    // Eliminar cookie para diferentes paths y dominios
                    const domains = ['', '.divinads.com', '.app.divinads.com'];
                    const paths = ['/', '/dashboard', '/app'];
                    
                    domains.forEach(domain => {
                        paths.forEach(path => {
                            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain}`;
                        });
                    });
                    
                    console.log(`🗑️ Eliminada cookie: ${name}`);
                    cleaned++;
                }
            });
            
            if (cleaned > 0) {
                console.log(`✅ Limpiadas ${cleaned} cookies problemáticas`);
            }
        } catch (error) {
            console.warn('Error limpiando cookies:', error);
        }
    }
    
    // Función para verificar URL actual y redireccionar si es necesario
    function checkCurrentUrl() {
        const currentUrl = window.location.href;
        const currentHost = window.location.hostname;
        
        // Si estamos en un dominio problemático, redireccionar
        problematicDomains.forEach(domain => {
            if (currentUrl.includes(domain) || currentHost.includes(domain)) {
                console.log('🚨 Detectado dominio problemático, redirigiendo a DivinAds...');
                // Redireccionar a la URL correcta
                window.location.replace('https://app.divinads.com/');
                return;
            }
        });
    }
    
    // Función para limpiar cache del service worker
    function cleanServiceWorkerCache() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                registrations.forEach(function(registration) {
                    // Solo eliminar service workers de dominios problemáticos
                    if (registration.scope) {
                        problematicDomains.forEach(domain => {
                            if (registration.scope.includes(domain)) {
                                registration.unregister().then(function() {
                                    console.log('🗑️ Service Worker problemático eliminado');
                                });
                            }
                        });
                    }
                });
            });
        }
        
        if ('caches' in window) {
            caches.keys().then(function(cacheNames) {
                return Promise.all(
                    cacheNames.map(function(cacheName) {
                        // Eliminar caches que contengan dominios problemáticos
                        problematicDomains.forEach(domain => {
                            if (cacheName.includes(domain)) {
                                caches.delete(cacheName).then(function() {
                                    console.log(`🗑️ Cache eliminado: ${cacheName}`);
                                });
                            }
                        });
                    })
                );
            });
        }
    }
    
    // Función para limpiar IndexedDB problemático
    function cleanIndexedDB() {
        if ('indexedDB' in window) {
            try {
                // Esta es una implementación básica, ya que IndexedDB es más complejo
                const deleteRequest = indexedDB.deleteDatabase('toolfb');
                deleteRequest.onsuccess = function() {
                    console.log('🗑️ IndexedDB problemático eliminado');
                };
            } catch (error) {
                console.warn('Error limpiando IndexedDB:', error);
            }
        }
    }
    
    // Función principal de limpieza
    function performCleanup() {
        console.log('🧹 Ejecutando limpieza completa de cache...');
        
        // Verificar URL actual primero
        checkCurrentUrl();
        
        // Limpiar diferentes tipos de storage
        cleanLocalStorage();
        cleanSessionStorage();
        cleanProblematicCookies();
        cleanServiceWorkerCache();
        cleanIndexedDB();
        
        // Establecer flag de limpieza
        try {
            localStorage.setItem('cache_cleaned_date', new Date().toISOString());
            localStorage.setItem('divinads_clean_version', '1.0.0');
            localStorage.setItem('divinads_last_cleanup_url', window.location.href);
        } catch (error) {
            console.warn('No se pudo establecer flag de limpieza:', error);
        }
        
        console.log('✅ Limpieza automática completada exitosamente');
    }
    
    // Verificar si necesitamos limpiar
    function shouldClean() {
        try {
            const lastClean = localStorage.getItem('cache_cleaned_date');
            if (!lastClean) return true;
            
            const lastCleanDate = new Date(lastClean);
            const now = new Date();
            const diffHours = (now - lastCleanDate) / (1000 * 60 * 60);
            
            // Limpiar cada 12 horas para mayor seguridad
            return diffHours > 12;
        } catch (error) {
            return true; // Si hay error, mejor limpiar
        }
    }
    
    // Función para detectar si hay problemas de cache
    function detectCacheProblems() {
        // Verificar referrer problemático
        if (document.referrer) {
            for (const domain of problematicDomains) {
                if (document.referrer.includes(domain)) {
                    console.log('🚨 Detectada navegación desde dominio problemático:', document.referrer);
                    return true;
                }
            }
        }
        
        // Verificar localStorage problemático
        try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
                const value = localStorage.getItem(key);
                if (value) {
                    for (const domain of problematicDomains) {
                        if (value.includes(domain)) {
                            console.log('🚨 Detectado contenido problemático en localStorage');
                            return true;
                        }
                    }
                }
            }
        } catch (error) {
            // Ignorar errores de acceso a localStorage
        }
        
        return false;
    }
    
    // Ejecutar limpieza inmediata si hay problemas críticos
    if (detectCacheProblems()) {
        console.log('🚨 Problemas detectados - Ejecutando limpieza inmediata');
        performCleanup();
    }
    
    // Ejecutar limpieza al cargar la página si es necesario
    document.addEventListener('DOMContentLoaded', function() {
        // Siempre verificar URL actual
        checkCurrentUrl();
        
        // Limpiar si es necesario
        if (shouldClean() || detectCacheProblems()) {
            performCleanup();
        }
    });
    
    // También ejecutar verificación inmediata
    if (shouldClean()) {
        setTimeout(performCleanup, 100); // Pequeño delay para asegurar que DOM esté listo
    }
    
    // Exportar función para uso manual si es necesario
    window.DivinAdsCleanCache = performCleanup;
    
    console.log('🛡️ Sistema de limpieza automática de cache activado');
    
})(); 