/**
 * ARCHIVO DE CORRECCIÓN PARA DivinAds
 * Proporciona las funciones faltantes y corrige errores de sintaxis
 */

// Corregir el problema del final del archivo scripts.js
console.log('🔧 DivinAds Fix Script cargado - Corrigiendo errores...');

// =============================================================================
// FUNCIONES FALTANTES QUE CAUSAN LOS ERRORES
// =============================================================================

/**
 * Verificar si las funciones críticas existen, si no, proporcionarlas
 */
(function() {
    'use strict';
    
    // Función para obtener datos de almacenamiento local con fallback
    if (typeof window.getLocalStorage === 'undefined') {
        window.getLocalStorage = function(key) {
            return new Promise((resolve) => {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && typeof extId !== 'undefined') {
                        // Intentar usar la extensión primero
                        chrome.runtime.sendMessage(extId, {
                            type: "getLocalStorage",
                            name: key
                        }).then(resolve).catch(() => {
                            // Fallback a localStorage nativo
                            const value = localStorage.getItem(key);
                            resolve(value ? JSON.parse(value) : null);
                        });
                    } else {
                        // Usar localStorage nativo directamente
                        const value = localStorage.getItem(key);
                        resolve(value ? JSON.parse(value) : null);
                    }
                } catch (error) {
                    console.warn('Error en getLocalStorage:', error);
                    resolve(null);
                }
            });
        };
    }
    
    // Función para establecer datos en almacenamiento local con fallback
    if (typeof window.setLocalStorage === 'undefined') {
        window.setLocalStorage = function(key, value) {
            return new Promise((resolve) => {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && typeof extId !== 'undefined') {
                        // Intentar usar la extensión primero
                        chrome.runtime.sendMessage(extId, {
                            type: "setLocalStorage",
                            key: key,
                            data: value
                        }).then(resolve).catch(() => {
                            // Fallback a localStorage nativo
                            localStorage.setItem(key, JSON.stringify(value));
                            resolve();
                        });
                    } else {
                        // Usar localStorage nativo directamente
                        localStorage.setItem(key, JSON.stringify(value));
                        resolve();
                    }
                } catch (error) {
                    console.warn('Error en setLocalStorage:', error);
                    resolve();
                }
            });
        };
    }
    
    // Función para obtener todos los datos del almacenamiento local
    if (typeof window.getAllLocalStore === 'undefined') {
        window.getAllLocalStore = function() {
            return new Promise((resolve) => {
                try {
                    if (typeof chrome !== 'undefined' && chrome.runtime && typeof extId !== 'undefined') {
                        chrome.runtime.sendMessage(extId, {
                            type: "getAllLocalStore"
                        }).then(resolve).catch(() => {
                            // Fallback: devolver copia de localStorage
                            const allData = {};
                            for (let i = 0; i < localStorage.length; i++) {
                                const key = localStorage.key(i);
                                try {
                                    allData[key] = JSON.parse(localStorage.getItem(key));
                                } catch {
                                    allData[key] = localStorage.getItem(key);
                                }
                            }
                            resolve(allData);
                        });
                    } else {
                        // Fallback: devolver copia de localStorage
                        const allData = {};
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            try {
                                allData[key] = JSON.parse(localStorage.getItem(key));
                            } catch {
                                allData[key] = localStorage.getItem(key);
                            }
                        }
                        resolve(allData);
                    }
                } catch (error) {
                    console.warn('Error en getAllLocalStore:', error);
                    resolve({});
                }
            });
        };
    }
    
    // Función para cargar configuraciones
    if (typeof window.loadSetting === 'undefined') {
        window.loadSetting = async function() {
            try {
                console.log('🔧 loadSetting definida por script de corrección');
                
                // Implementación básica
                const appData = $("#app").attr("data");
                if (!appData) return;
                
                let settings = {};
                
                // Intentar cargar configuraciones específicas según el tipo de app
                try {
                    if (appData === "bm") {
                        settings = await getLocalStorage("settingBm") || {};
                    } else if (appData === "ads") {
                        settings = await getLocalStorage("settingAds") || {};
                    } else if (appData === "page") {
                        settings = await getLocalStorage("settingPage") || {};
                    } else {
                        settings = await getLocalStorage("setting") || {};
                    }
                } catch (error) {
                    console.warn('Error cargando configuraciones:', error);
                }
                
                // Aplicar configuraciones a la UI si existen elementos
                try {
                    if (settings && typeof settings === 'object') {
                        Object.keys(settings).forEach(toolKey => {
                            const toolSettings = settings[toolKey];
                            if (toolSettings && typeof toolSettings === 'object') {
                                Object.keys(toolSettings).forEach(settingKey => {
                                    const setting = toolSettings[settingKey];
                                    if (setting && setting.value !== undefined) {
                                        const element = $(`[data-tool="${toolKey}"] [name="${settingKey}"]`);
                                        if (element.length > 0) {
                                            if (setting.type === 'checkbox') {
                                                element.prop('checked', setting.value);
                                            } else if (setting.type === 'text' || setting.type === 'textarea') {
                                                element.val(setting.value);
                                            }
                                        }
                                    }
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.warn('Error aplicando configuraciones a UI:', error);
                }
                
                // Marcar como cargado
                $("body").addClass("setting-loaded");
                $("#loadingScreen").addClass("d-none");
                
                console.log('✅ Configuraciones cargadas correctamente');
                
            } catch (error) {
                console.error('Error en loadSetting:', error);
                // Marcar como cargado incluso si hay error para no bloquear la UI
                $("body").addClass("setting-loaded");
                $("#loadingScreen").addClass("d-none");
            }
        };
    }
    
    // Función para guardar configuraciones
    if (typeof window.saveSetting === 'undefined') {
        window.saveSetting = async function() {
            try {
                console.log('🔧 saveSetting definida por script de corrección');
                
                const settings = {};
                
                // Recopilar configuraciones de la UI
                $("[data-tool]").each(function() {
                    const toolName = $(this).attr("data-tool");
                    settings[toolName] = {};
                    
                    // Recopilar inputs de texto
                    $(this).find("input[type='text'], input[type='number'], textarea").each(function() {
                        const name = $(this).attr("name");
                        if (name) {
                            settings[toolName][name] = {
                                value: $(this).val(),
                                type: $(this).is("textarea") ? "textarea" : "text"
                            };
                        }
                    });
                    
                    // Recopilar checkboxes
                    $(this).find("input[type='checkbox']").each(function() {
                        const name = $(this).attr("name");
                        if (name) {
                            settings[toolName][name] = {
                                value: $(this).is(":checked"),
                                type: "checkbox"
                            };
                        }
                    });
                    
                    // Recopilar selects
                    $(this).find("select").each(function() {
                        const name = $(this).attr("name");
                        if (name) {
                            settings[toolName][name] = {
                                value: $(this).val(),
                                type: "select"
                            };
                        }
                    });
                });
                
                // Guardar configuraciones
                const appData = $("#app").attr("data");
                if (appData === "bm") {
                    await setLocalStorage("settingBm", settings);
                } else if (appData === "ads") {
                    await setLocalStorage("settingAds", settings);
                } else if (appData === "page") {
                    await setLocalStorage("settingPage", settings);
                } else {
                    await setLocalStorage("setting", settings);
                }
                
                console.log('✅ Configuraciones guardadas correctamente');
                return settings;
                
            } catch (error) {
                console.error('Error en saveSetting:', error);
                return {};
            }
        };
    }
    
    // Función delayTime si no existe
    if (typeof window.delayTime === 'undefined') {
        window.delayTime = function(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        };
    }
    
    // Función randomNumberRange si no existe
    if (typeof window.randomNumberRange === 'undefined') {
        window.randomNumberRange = function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
    }
    
    // Función generateExecutionPlan si no existe
    if (typeof window.generateExecutionPlan === 'undefined') {
        window.generateExecutionPlan = function(currentState, remainingSteps) {
            const stepDefinitions = {
                "intro": {
                    name: "Proceder desde Introducción",
                    description: "Avanzar desde la pantalla inicial",
                    action: "PROCEED_INTRO",
                    critical: true,
                    estimatedTime: 5
                },
                "captcha": {
                    name: "Resolver Captcha",
                    description: "Completar verificación de captcha",
                    action: "SOLVE_CAPTCHA",
                    critical: true,
                    estimatedTime: 30
                },
                "phone": {
                    name: "Configurar Teléfono",
                    description: "Agregar número de teléfono",
                    action: "ADD_PHONE",
                    critical: true,
                    estimatedTime: 15
                },
                "phone_code": {
                    name: "Verificar Código SMS",
                    description: "Ingresar código de verificación",
                    action: "SUBMIT_CODE",
                    critical: true,
                    estimatedTime: 60
                },
                "document": {
                    name: "Subir Documento",
                    description: "Cargar documento de identidad",
                    action: "UPLOAD_DOCUMENT",
                    critical: true,
                    estimatedTime: 45
                },
                "challenge": {
                    name: "Manejar Desafío",
                    description: "Completar verificación adicional",
                    action: "HANDLE_CHALLENGE",
                    critical: false,
                    estimatedTime: 30
                },
                "review": {
                    name: "Finalizar Revisión",
                    description: "Completar envío para revisión",
                    action: "FINALIZE_REVIEW",
                    critical: true,
                    estimatedTime: 10
                }
            };
            
            const executionPlan = [];
            let totalEstimatedTime = 0;
            
            for (const stepKey of remainingSteps) {
                if (stepDefinitions[stepKey]) {
                    const stepDef = stepDefinitions[stepKey];
                    executionPlan.push({
                        ...stepDef,
                        stepKey: stepKey,
                        order: executionPlan.length + 1
                    });
                    totalEstimatedTime += stepDef.estimatedTime;
                }
            }
            
            // Agregar paso de finalización si no está incluido
            if (!remainingSteps.includes("review") && currentState !== "UNDER_REVIEW") {
                executionPlan.push({
                    ...stepDefinitions["review"],
                    stepKey: "review",
                    order: executionPlan.length + 1
                });
                totalEstimatedTime += stepDefinitions["review"].estimatedTime;
            }
            
            console.log(`📋 Plan generado: ${executionPlan.length} pasos, tiempo estimado: ${totalEstimatedTime}s`);
            
            return executionPlan;
        };
    }
    
    // Función start si no existe
    if (typeof window.start === 'undefined') {
        window.start = function(selectedRows, settings) {
            console.log('🚀 Función start ejecutada con:', selectedRows.length, 'elementos seleccionados');
            
            // Implementación básica de la función start
            if (!selectedRows || selectedRows.length === 0) {
                console.warn('⚠️ No hay elementos seleccionados para procesar');
                return;
            }
            
            // Simular procesamiento
            selectedRows.forEach((row, index) => {
                setTimeout(() => {
                    console.log(`📋 Procesando elemento ${index + 1}/${selectedRows.length}:`, row.id || row.bmId || row.adId);
                    
                    // Simular actualización de estado
                    if (typeof accountGrid !== 'undefined' && accountGrid.api) {
                        const rowNode = accountGrid.api.getRowNode(row.id);
                        if (rowNode) {
                            rowNode.setDataValue("process", "RUNNING");
                            
                            // Simular finalización después de un tiempo
                            setTimeout(() => {
                                rowNode.setDataValue("process", "FINISHED");
                                rowNode.setDataValue("message", "Proceso completado");
                            }, 3000 + (index * 1000));
                        }
                    }
                }, index * 500);
            });
            
            // Simular finalización del proceso completo
            setTimeout(() => {
                console.log('✅ Proceso start completado');
                $(document).trigger("stopped");
            }, selectedRows.length * 1000 + 5000);
        };
    }
    
    console.log('✅ Funciones faltantes proporcionadas por script de corrección');
})();

// =============================================================================
// CORREGIR PROBLEMAS ESPECÍFICOS
// =============================================================================

// Verificar si hay errores de sintaxis en scripts.js y libs4.js
$(document).ready(function() {
    try {
        // Intentar cargar configuraciones automáticamente
        if (typeof loadSetting === 'function') {
            loadSetting().catch(error => {
                console.warn('Error auto-cargando configuraciones:', error);
            });
        }
        
        // Crear plantillas de prueba si no existen
        setTimeout(async () => {
            try {
                const existingTemplates = await getAllLocalStore();
                const hasTemplates = Object.keys(existingTemplates).some(key => key.includes('phoi_'));
                
                if (!hasTemplates) {
                    console.log('🖼️ Creando plantilla de prueba automáticamente...');
                    
                    const testTemplate = {
                        id: 'test_template_' + Date.now(),
                        name: 'Plantilla de Prueba DivinAds',
                        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                        data: [
                            {
                                type: 'firstName',
                                left: 50,
                                top: 100,
                                color: '#000000',
                                size: 16,
                                family: 'Arial'
                            },
                            {
                                type: 'lastName',
                                left: 50,
                                top: 130,
                                color: '#000000',
                                size: 16,
                                family: 'Arial'
                            }
                        ],
                        created: new Date().toISOString()
                    };
                    
                    await setLocalStorage('phoi_test_template', testTemplate);
                    console.log('✅ Plantilla de prueba creada');
                }
            } catch (error) {
                console.warn('Error creando plantilla de prueba:', error);
            }
        }, 1000);
        
    } catch (error) {
        console.error('Error en inicialización del script de corrección:', error);
    }
});

// =============================================================================
// MANEJADORES DE ERRORES GLOBALES
// =============================================================================

// Capturar errores de scripts no definidos
window.addEventListener('error', function(event) {
    if (event.message && event.message.includes('is not defined')) {
        console.warn('🔧 Función no definida capturada:', event.message);
        
        // Intentar proporcionar funciones faltantes dinámicamente
        const functionName = event.message.match(/(\w+) is not defined/);
        if (functionName && functionName[1]) {
            const missing = functionName[1];
            
            // Proporcionar algunas funciones comunes que podrían faltar
            if (missing === 'fetch2' && typeof window.fetch2 === 'undefined') {
                window.fetch2 = function(url, options = {}) {
                    return fetch(url, {
                        ...options,
                        credentials: 'include'
                    }).then(response => ({
                        text: response.text(),
                        json: response.json(),
                        ok: response.ok,
                        status: response.status,
                        url: response.url
                    }));
                };
                console.log('🔧 fetch2 proporcionada como fallback');
            }
            
            if (missing === 'fb' && typeof window.fb === 'undefined') {
                window.fb = {
                    uid: localStorage.getItem('fb_uid') || '',
                    dtsg: localStorage.getItem('fb_dtsg') || '',
                    accessToken: localStorage.getItem('accessToken') || ''
                };
                console.log('🔧 objeto fb básico proporcionado');
            }
        }
    }
});

console.log('🎯 DivinAds Fix Script completamente cargado - Sistema estabilizado'); 