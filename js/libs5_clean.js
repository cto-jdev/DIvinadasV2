/**
 * LIBS5 CLEAN - GESTIÓN DE PÍXELES DE FACEBOOK
 * Versión mejorada con UI visual y selección múltiple
 * CÓDIGO LIMPIO - NO COMPRIMIR BAJO NINGUNA CIRCUNSTANCIA
 */

// Función para obtener Business Managers con estado visual
async function getBusinessManagers() {
    try {
        if (!fetch2 || !fb) {
            return [];
        }
        
        const token = fb.accessToken || fb.token;
        if (!token) {
            return [];
        }
        
        const url = `https://graph.facebook.com/v14.0/me/businesses?fields=id,name,verification_status,permitted_tasks&limit=99999&access_token=${token}`;
        const response = await fetch2(url);
        const data = response.json;
        
        if (data && data.data && data.data.length > 0) {
            const businessManagers = data.data.map(bm => {
                // Determinar estado del BM
                let status = 'active';
                let statusColor = '#28a745'; // verde por defecto
                
                if (bm.verification_status === 'pending' || bm.verification_status === 'restricted') {
                    status = 'restricted';
                    statusColor = '#dc3545'; // rojo
                } else if (bm.verification_status === 'verified' || !bm.verification_status) {
                    status = 'active';
                    statusColor = '#28a745'; // verde
                }
                
                return {
                    id: bm.id,
                    name: bm.name || `BM ${bm.id}`,
                    status: status,
                    statusColor: statusColor,
                    verification_status: bm.verification_status || 'unknown'
                };
            });
            return businessManagers;
        }
        
        return [];
        
    } catch (error) {
        return [];
    }
}

// Función para obtener píxeles - VERSIÓN RESTAURADA SIMPLE Y FUNCIONAL
async function getPixelsByBM(selectedBMId = null) {
    try {
        if (!selectedBMId) {
            return [];
        }
        
        if (!fetch2 || !fb) {
            return [];
        }
        
        const token = fb.accessToken || fb.token;
        if (!token) {
            return [];
        }
        
        console.log(`🔍 Obteniendo píxeles para BM: ${selectedBMId}`);
        
        // Obtener el mejor token disponible
        let bestToken = token;
        const eaagToken = getEAAGToken();
        if (eaagToken && eaagToken.length > 50) {
            bestToken = eaagToken;
            console.log(`🔑 Usando token EAAG`);
        }
        
        // Método 1: Tu endpoint exacto que funciona
        try {
            const url = `https://graph.facebook.com/v19.0/${selectedBMId}/adspixels?name=MiPixelNuevo&access_token=${bestToken}`;
            console.log(`📡 Método 1 - Tu endpoint exacto`);
            console.log(`🔗 URL: ${url.substring(0, 120)}...`);
            
            const response = await fetch2(url);
            const data = response.json;
            
            console.log(`📊 Método 1 - Status: ${response.status}, OK: ${response.ok}`);
            console.log(`📊 Método 1 - Data completa:`, JSON.stringify(data, null, 2));
            console.log(`📊 Método 1 - Tiene data.data: ${!!data.data}`);
            console.log(`📊 Método 1 - Es array: ${Array.isArray(data.data)}`);
            console.log(`📊 Método 1 - Longitud: ${data.data?.length || 0}`);
            
            // fetch2 no devuelve response.ok, verificar directamente los datos
            if (data && data.data && Array.isArray(data.data)) {
                if (data.data.length > 0) {
                    const pixels = data.data.map((pixel, index) => ({
                        id: pixel.id,
                        name: pixel.name || `Píxel ${index + 1}`,
                        displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                        status: 'ACTIVE',
                        bmId: selectedBMId
                    }));
                    
                    console.log(`✅ Método 1 exitoso: ${pixels.length} píxeles`);
                    return pixels;
                } else {
                    console.log(`⚠️ Método 1: Array vacío - BM sin píxeles`);
                }
            } else if (data && data.error) {
                console.log(`❌ Método 1 error:`, data.error);
            } else {
                console.log(`❌ Método 1: Respuesta inválida`);
            }
        } catch (e) {
            console.log(`⚠️ Método 1 falló: ${e.message}`);
        }
        
        // Método 2: Graph API estándar
        try {
            const url = `https://graph.facebook.com/v19.0/${selectedBMId}/adspixels?fields=id,name&access_token=${bestToken}`;
            console.log(`📡 Método 2 - Graph API estándar`);
            
            const response = await fetch2(url);
            const data = response.json;
            
            console.log(`📊 Método 2 - Status: ${response.status}, OK: ${response.ok}`);
            console.log(`📊 Método 2 - Data:`, JSON.stringify(data, null, 2));
            
            // fetch2 no devuelve response.ok, verificar directamente los datos
            if (data && data.data && Array.isArray(data.data)) {
                if (data.data.length > 0) {
                    const pixels = data.data.map((pixel, index) => ({
                        id: pixel.id,
                        name: pixel.name || `Píxel ${index + 1}`,
                        displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                        status: 'ACTIVE',
                        bmId: selectedBMId
                    }));
                    
                    console.log(`✅ Método 2 exitoso: ${pixels.length} píxeles`);
                    return pixels;
                } else {
                    console.log(`⚠️ Método 2: Array vacío - BM sin píxeles`);
                }
            } else if (data && data.error) {
                console.log(`❌ Método 2 error:`, data.error);
            }
        } catch (e) {
            console.log(`⚠️ Método 2 falló: ${e.message}`);
        }
        
        // Método 3: Todos los píxeles del usuario
        try {
            const url = `https://graph.facebook.com/v19.0/me/adspixels?fields=id,name,owner_business&access_token=${bestToken}`;
            console.log(`📡 Método 3 - Todos los píxeles del usuario`);
            
            const response = await fetch2(url);
            const data = response.json;
            
            console.log(`📊 Método 3 - Status: ${response.status}, OK: ${response.ok}`);
            console.log(`📊 Método 3 - Data:`, JSON.stringify(data, null, 2));
            
            // fetch2 no devuelve response.ok, verificar directamente los datos
            if (data && data.data && Array.isArray(data.data)) {
                console.log(`📊 Total píxeles del usuario: ${data.data.length}`);
                
                if (data.data.length > 0) {
                    // Mostrar todos los píxeles disponibles
                    console.log(`📋 TODOS los píxeles disponibles:`);
                    data.data.forEach((pixel, index) => {
                        console.log(`  ${index + 1}. ${pixel.name || 'Sin nombre'} (${pixel.id}) - BM: ${pixel.owner_business?.id || 'Sin BM'}`);
                    });
                    
                    // Filtrar por BM específico
                    const bmPixels = data.data.filter(pixel => 
                        pixel.owner_business && pixel.owner_business.id === selectedBMId
                    );
                    
                    if (bmPixels.length > 0) {
                        const pixels = bmPixels.map((pixel, index) => ({
                            id: pixel.id,
                            name: pixel.name || `Píxel ${index + 1}`,
                            displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                            status: 'ACTIVE',
                            bmId: selectedBMId
                        }));
                        
                        console.log(`✅ Método 3 exitoso: ${pixels.length} píxeles filtrados para BM ${selectedBMId}`);
                        return pixels;
                    } else {
                        console.log(`⚠️ Método 3: No hay píxeles específicos para BM ${selectedBMId}`);
                        
                        // Retornar todos los píxeles disponibles
                        const allPixels = data.data.map((pixel, index) => ({
                            id: pixel.id,
                            name: pixel.name || `Píxel ${index + 1}`,
                            displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id}) - BM: ${pixel.owner_business?.id || 'Sin BM'}`,
                            status: 'ACTIVE',
                            bmId: pixel.owner_business?.id || selectedBMId
                        }));
                        
                        console.log(`✅ Método 3 alternativo: Retornando ${allPixels.length} píxeles totales`);
                        return allPixels;
                    }
                } else {
                    console.log(`⚠️ Método 3: Usuario sin píxeles`);
                }
            } else if (data && data.error) {
                console.log(`❌ Método 3 error:`, data.error);
            }
        } catch (e) {
            console.log(`⚠️ Método 3 falló: ${e.message}`);
        }
        
        // Método 4: Detección HTML
        try {
            console.log(`📡 Método 4 - Detección HTML`);
            
            const response = await fetch2(`https://business.facebook.com/latest/settings/events_dataset_and_pixel?business_id=${selectedBMId}`, {
                method: 'GET',
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'accept-language': 'es-ES,es;q=0.9,en;q=0.8'
                }
            });
            
            const text = typeof response.text === 'string' ? response.text : JSON.stringify(response.json || response);
            
            if (text && text.length > 1000) {
                const pixelPatterns = [
                    /"dataset_id":"(\d{15,20})"/g,
                    /"id":"(\d{15,20})"/g,
                    /"pixel_id":"(\d{15,20})"/g,
                    /pixel[_\s]*id["\s]*[:=]["\s]*(\d{15,20})/gi
                ];
                
                const foundPixels = new Set();
                
                pixelPatterns.forEach(pattern => {
                    let match;
                    while ((match = pattern.exec(text)) !== null) {
                        const pixelId = match[1];
                        if (pixelId && pixelId.length >= 15) {
                            foundPixels.add(pixelId);
                        }
                    }
                });
                
                if (foundPixels.size > 0) {
                    const pixels = Array.from(foundPixels).map((pixelId, index) => ({
                        id: pixelId,
                        name: `Píxel ${index + 1}`,
                        displayName: `🎯 Píxel ${index + 1} (ID: ${pixelId})`,
                        status: 'ACTIVE',
                        bmId: selectedBMId
                    }));
                    
                    console.log(`✅ Método 4 exitoso: ${pixels.length} píxeles desde HTML`);
                    console.log(`📋 IDs encontrados:`, Array.from(foundPixels));
                    return pixels;
                }
            }
        } catch (e) {
            console.log(`⚠️ Método 4 falló: ${e.message}`);
        }
        
        // Si llegamos aquí, verificar si el BM existe
        try {
            console.log(`🔍 Verificando si el BM ${selectedBMId} existe...`);
            const bmUrl = `https://graph.facebook.com/v19.0/${selectedBMId}?fields=id,name,verification_status&access_token=${bestToken}`;
            const bmResponse = await fetch2(bmUrl);
            const bmData = bmResponse.json;
            
            console.log(`📊 Verificación BM - Status: ${bmResponse.status}, OK: ${bmResponse.ok}`);
            console.log(`📊 Verificación BM - Data:`, JSON.stringify(bmData, null, 2));
            
            // fetch2 no devuelve response.ok, verificar directamente los datos
            if (bmData && bmData.id) {
                console.log(`✅ BM existe: ${bmData.name || bmData.id}`);
                console.log(`📊 Status BM: ${bmData.verification_status || 'Desconocido'}`);
                console.log(`⚠️ El BM existe pero no tiene píxeles o no tienes permisos para verlos`);
            } else {
                console.log(`❌ BM no existe o sin acceso`);
                if (bmData && bmData.error) {
                    console.log(`❌ Error específico:`, bmData.error);
                }
            }
        } catch (e) {
            console.log(`❌ Error verificando BM: ${e.message}`);
        }
        
        console.log(`❌ No se encontraron píxeles en BM ${selectedBMId} con ningún método`);
        return [];
        
    } catch (error) {
        console.error('❌ Error obteniendo píxeles:', error);
        return [];
    }
}

// Función para verificar permisos de usuario
async function checkUserPermissions() {
    try {
        const token = fb.accessToken || fb.token;
        const url = `https://graph.facebook.com/v14.0/me?fields=id,name&access_token=${token}`;
        const response = await fetch2(url);
        const data = response.json;
        
        return data;
    } catch (error) {
        return null;
    }
}

// Función NUEVA para verificar permisos específicos de píxel y cuenta
async function checkPixelAndAccountPermissions(pixelId, accountId) {
    try {
        const token = fb.accessToken || fb.token;
        const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        
        const results = {
            pixelAccess: false,
            accountAccess: false,
            canManagePixel: false,
            canManageAccount: false
        };
        
        // Verificar acceso al píxel
        try {
            const pixelUrl = `https://graph.facebook.com/v14.0/${pixelId}?fields=id,name,owner_business&access_token=${token}`;
            const pixelResponse = await fetch2(pixelUrl);
            const pixelData = pixelResponse.json;
            
            if (pixelResponse.ok && pixelData.id) {
                results.pixelAccess = true;
                // Si podemos obtener owner_business, tenemos permisos de gestión
                if (pixelData.owner_business) {
                    results.canManagePixel = true;
                }
            }
        } catch (e) {
            // Sin acceso al píxel
        }
        
        // Verificar acceso a la cuenta
        try {
            const accountUrl = `https://graph.facebook.com/v14.0/${formattedId}?fields=id,name,account_status&access_token=${token}`;
            const accountResponse = await fetch2(accountUrl);
            const accountData = accountResponse.json;
            
            if (accountResponse.ok && accountData.id) {
                results.accountAccess = true;
                // Si podemos obtener account_status, tenemos permisos de gestión
                if (accountData.account_status !== undefined) {
                    results.canManageAccount = true;
                }
            }
        } catch (e) {
            // Sin acceso a la cuenta
        }
        
        return results;
        
    } catch (error) {
        return {
            pixelAccess: false,
            accountAccess: false,
            canManagePixel: false,
            canManageAccount: false
        };
    }
}

// Función MEJORADA para obtener token EAAG del HTML (basada en tu código funcional)
function getEAAGToken() {
    try {
        const v = document.documentElement.outerHTML;
        const v2 = v.match(/EAAG[a-zA-Z0-9]{50,}/);
        const v3 = v2 ? v2[0] : null;
        
        if (v3) {
            console.log("Token EAAG encontrado:", v3.substring(0, 10) + "...");
        } else {
            console.log("Token EAAG no encontrado en el HTML");
            
            // Intentar obtener de otras fuentes
            try {
                // Buscar en variables globales de Facebook
                if (typeof require !== 'undefined') {
                    const dtsgData = require("DTSGInitialData");
                    if (dtsgData && dtsgData.token && dtsgData.token.startsWith('EAAG')) {
                        console.log("Token EAAG encontrado en DTSGInitialData");
                        return dtsgData.token;
                    }
                }
                
                // Buscar en el objeto fb global
                if (typeof fb !== 'undefined' && fb.accessToken && fb.accessToken.startsWith('EAAG')) {
                    console.log("Token EAAG encontrado en fb.accessToken");
                    return fb.accessToken;
                }
                
                // Buscar en localStorage
                const storedToken = localStorage.getItem('fb_access_token');
                if (storedToken && storedToken.startsWith('EAAG')) {
                    console.log("Token EAAG encontrado en localStorage");
                    return storedToken;
                }
                
            } catch (e) {
                console.warn("Error buscando token en fuentes alternativas:", e);
            }
        }
        
        return v3;
    } catch (error) {
        console.error('Error obteniendo token EAAG:', error);
        return null;
    }
}

// Función NUEVA para intentar obtener permisos elevados
async function requestElevatedPermissions(progressCallback) {
    try {
        if (progressCallback) {
            progressCallback(`🔐 Intentando obtener permisos elevados...`);
        }
        
        // Primer intento: obtener token EAAG del HTML
        const eaagToken = getEAAGToken();
        if (eaagToken) {
            if (progressCallback) {
                progressCallback(`✅ Token EAAG encontrado: ${eaagToken.substring(0, 10)}...`);
            }
            
            // Actualizar tokens globales
            if (fb.accessToken) fb.accessToken = eaagToken;
            if (fb.token) fb.token = eaagToken;
            
            return true;
        }
        
        // Segundo intento: método original
        const token = fb.accessToken || fb.token;
        
        const extendedToken = await fetch2(`https://graph.facebook.com/v14.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${fb.appId || '124024574287414'}&fb_exchange_token=${token}`, {
            method: 'GET'
        });
        
        if (extendedToken.ok) {
            const tokenData = extendedToken.json;
            if (tokenData.access_token && tokenData.access_token !== token) {
                // Actualizar token en la sesión
                if (fb.accessToken) fb.accessToken = tokenData.access_token;
                if (fb.token) fb.token = tokenData.access_token;
                
                if (progressCallback) {
                    progressCallback(`✅ Token extendido obtenido - reintentando conexión...`);
                }
                return true;
            }
        }
        
        return false;
        
    } catch (error) {
        if (progressCallback) {
            progressCallback(`❌ No se pudieron obtener permisos elevados: ${error.message}`);
        }
        return false;
    }
}

// Función CORREGIDA para conectar píxel usando el método que SÍ funciona
async function connectPixelToAccount(pixelId, accountId, progressCallback) {
    try {
        const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        const cleanAccountId = formattedId.replace('act_', '');
        
        // Verificar que el account_id sea válido
        if (!cleanAccountId || cleanAccountId.length < 10) {
            if (progressCallback) {
                progressCallback(`❌ Account ID inválido: ${cleanAccountId}`);
            }
            return false;
        }
        
        if (progressCallback) {
            progressCallback(`🔄 Conectando píxel ${pixelId} a cuenta ${formattedId}`);
        }
        
        // MÉTODO PRINCIPAL: Usar shared_accounts (BASADO EN TU CÓDIGO FUNCIONAL)
        try {
            if (progressCallback) {
                progressCallback(`   🔄 Usando método shared_accounts (MÉTODO PRINCIPAL)`);
            }
            
            // Obtener token EAAG directamente como en tu código
            let accessToken = getEAAGToken();
            
            if (!accessToken) {
                // Fallback a tokens de fb
                accessToken = fb?.accessToken || fb?.token;
                if (progressCallback) {
                    progressCallback(`   ⚠️ Token EAAG no encontrado, usando token FB`);
                }
            } else {
                if (progressCallback) {
                    progressCallback(`   🔑 Token EAAG encontrado: ${accessToken.substring(0, 10)}...`);
                }
            }
            
            if (accessToken) {
                // Usar exactamente la misma URL que tu código funcional
                const sharedAccountsUrl = `https://graph.facebook.com/v17.0/${pixelId}/shared_accounts`;
                
                // Obtener el business_id correcto del BM seleccionado
                const bmSelect = document.querySelector('select[name="businessManager"]');
                const selectedBMId = bmSelect ? bmSelect.value : null;
                
                if (!selectedBMId) {
                    if (progressCallback) {
                        progressCallback(`   ❌ No se ha seleccionado un Business Manager`);
                    }
                    return false;
                }
                
                // Usar exactamente los mismos parámetros que tu código funcional
                const params = {
                    access_token: accessToken,
                    business: selectedBMId,  // Business Manager ID directo (sin fallback)
                    account_id: cleanAccountId
                };
                
                // Debug: Verificar que los parámetros estén correctos
                if (progressCallback) {
                    progressCallback(`   🔍 DEBUG - Parámetros enviados:`);
                    progressCallback(`     • access_token: ${accessToken.substring(0, 20)}...`);
                    progressCallback(`     • business: ${selectedBMId}`);
                    progressCallback(`     • account_id: ${cleanAccountId}`);
                    progressCallback(`     • account_id length: ${cleanAccountId.length}`);
                    progressCallback(`     • account_id type: ${typeof cleanAccountId}`);
                }
                
                if (progressCallback) {
                    progressCallback(`   📡 Enviando solicitud a shared_accounts...`);
                    progressCallback(`   📊 Parámetros: BM=${selectedBMId}, Account=${cleanAccountId}`);
                }
                
                // Usar fetch2 directamente para evitar problemas de CORS
                if (progressCallback) {
                    progressCallback(`   🔄 Enviando petición con fetch2 (evita CORS)...`);
                }
                
                // Convertir parámetros a string manualmente para fetch2
                const bodyString = Object.keys(params)
                    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                    .join('&');
                
                if (progressCallback) {
                    progressCallback(`   📊 Body string: ${bodyString}`);
                }
                
                const sharedResponse = await fetch2(sharedAccountsUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: bodyString
                });
                
                const responseData = sharedResponse.json;
                const response = { ok: !responseData.error }; // Simular response.ok para fetch2
                
                if (progressCallback) {
                    progressCallback(`   📊 Respuesta: ${JSON.stringify(responseData).substring(0, 100)}...`);
                }
                
                // Verificar éxito usando la misma lógica que tu código funcional
                if (!responseData.error) {
                    if (progressCallback) {
                        progressCallback(`✅ ${formattedId}: Píxel conectado exitosamente via shared_accounts`);
                    }
                    return true;
                } else {
                    if (progressCallback) {
                        progressCallback(`   ⚠️ Error en shared_accounts: ${responseData.error.message}`);
                    }
                    
                    // Si el error indica que ya está conectado, considerarlo éxito
                    if (responseData.error.message.includes('already') || 
                        responseData.error.message.includes('exists') ||
                        responseData.error.message.includes('duplicate')) {
                        if (progressCallback) {
                            progressCallback(`✅ ${formattedId}: Píxel ya estaba conectado`);
                        }
                        return true;
                    }
                    
                    // Si el error indica permisos, intentar con otros BMs
                    if (responseData.error.message.includes('does not exist') || 
                        responseData.error.message.includes('missing permissions') ||
                        responseData.error.message.includes('permission')) {
                        
                        if (progressCallback) {
                            progressCallback(`   🔍 Intentando con otros Business Managers...`);
                        }
                        
                        try {
                            // Obtener lista de todos los BMs
                            const allBMs = await getBusinessManagers();
                            
                            for (const bm of allBMs) {
                                if (bm.id === selectedBMId) continue; // Ya lo intentamos
                                
                                const alternativeParams = {
                                    access_token: accessToken,
                                    account_id: cleanAccountId,
                                    business: bm.id
                                };
                                
                                try {
                                    const altBodyString = Object.keys(alternativeParams)
                                        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(alternativeParams[key])}`)
                                        .join('&');
                                    
                                    const altResponse = await fetch2(sharedAccountsUrl, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                            'Accept': 'application/json'
                                        },
                                        credentials: 'include',
                                        body: altBodyString
                                    });
                                    
                                    const altData = altResponse.json;
                                    
                                    if (!altData.error) {
                                        if (progressCallback) {
                                            progressCallback(`✅ ${formattedId}: Píxel conectado via shared_accounts (BM: ${bm.name})`);
                                        }
                                        return true;
                                    } else if (altData.error && (altData.error.message.includes('already') || altData.error.message.includes('exists'))) {
                                        if (progressCallback) {
                                            progressCallback(`✅ ${formattedId}: Píxel ya estaba conectado (BM: ${bm.name})`);
                                        }
                                        return true;
                                    }
                                } catch (altError) {
                                    // Continuar con el siguiente BM
                                    continue;
                                }
                            }
                        } catch (bmSearchError) {
                            if (progressCallback) {
                                progressCallback(`   ⚠️ Error buscando en otros BMs: ${bmSearchError.message}`);
                            }
                        }
                    }
                }
            } else {
                if (progressCallback) {
                    progressCallback(`   ❌ No se pudo obtener token de acceso`);
                }
            }
            
        } catch (sharedError) {
            if (progressCallback) {
                progressCallback(`   ⚠️ Método shared_accounts falló: ${sharedError.message}`);
            }
        }
        
        // MÉTODO FALLBACK: Verificar si ya está conectado
        try {
            if (progressCallback) {
                progressCallback(`   🔍 Verificando si el píxel ya está conectado...`);
            }
            
            const token = fb?.accessToken || fb?.token || getEAAGToken();
            if (token) {
                const checkUrl = `https://graph.facebook.com/v17.0/${formattedId}/adspixels?fields=id&access_token=${token}`;
                
                // Usar fetch2 directamente para evitar CORS
                const checkResponse2 = await fetch2(checkUrl);
                const checkData2 = checkResponse2.json;
                
                if (checkData2 && checkData2.data && Array.isArray(checkData2.data)) {
                    const existingPixel = checkData2.data.find(p => p.id === pixelId);
                    if (existingPixel) {
                        if (progressCallback) {
                            progressCallback(`✅ ${formattedId}: Píxel ya estaba conectado (verificado)`);
                        }
                        return true;
                    }
                }
            }
        } catch (checkError) {
            // Ignorar errores de verificación
        }
        
        // Si llegamos aquí, todos los métodos fallaron
        if (progressCallback) {
            progressCallback(`❌ No se pudo conectar píxel ${pixelId} a ${formattedId}`);
            progressCallback(`💡 SUGERENCIAS:`);
            progressCallback(`   • Verifica que tengas permisos de administrador en el Business Manager`);
            progressCallback(`   • Asegúrate de que el píxel pertenezca al Business Manager seleccionado`);
            progressCallback(`   • Intenta conectar manualmente desde Facebook Business Manager`);
            progressCallback(`🔗 ENLACE DIRECTO: https://business.facebook.com/events_manager2/list/pixel/${pixelId}`);
        }
        
        return false;
        
    } catch (error) {
        if (progressCallback) {
            progressCallback(`❌ Error técnico conectando píxel: ${error.message}`);
        }
        return false;
    }
}

// Función principal para cargar BMs con UI mejorada
async function loadBusinessManagersManually() {
    const loadBtn = document.querySelector('#loadBMsButton');
    const statusDiv = document.querySelector('#bmLoadingStatus');
    const statusText = document.querySelector('#bmStatusText');
    const bmSelect = document.querySelector('select[name="businessManager"]');
    
    try {
        if (loadBtn) loadBtn.disabled = true;
        if (statusDiv) statusDiv.style.display = 'block';
        if (statusText) statusText.textContent = 'Cargando...';
        
        const businessManagers = await getBusinessManagers();
        
        if (bmSelect) {
            bmSelect.innerHTML = '<option value="">Seleccionar BM...</option>';
            
            businessManagers.forEach(bm => {
                const option = document.createElement('option');
                option.value = bm.id;
                
                // Crear el texto con círculo de estado + nombre en negrita + ID
                const statusCircle = '●'; // círculo sólido
                const displayText = `${statusCircle} ${bm.name} (ID: ${bm.id})`;
                option.textContent = displayText;
                
                // Aplicar color al círculo
                option.style.color = bm.statusColor;
                option.style.fontWeight = 'bold';
                
                bmSelect.appendChild(option);
            });
            
            if (statusText) {
                statusText.textContent = `✅ ${businessManagers.length} BMs cargados`;
            }
        }
        
        setTimeout(() => {
            if (statusDiv) statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        if (statusText) statusText.textContent = '❌ Error cargando';
    } finally {
        if (loadBtn) loadBtn.disabled = false;
    }
}

// Función para cargar píxeles con multi-select MEJORADA
async function loadPixelsManually() {
    const loadBtn = document.querySelector('#loadPixelsButton');
    const statusDiv = document.querySelector('#pixelLoadingStatus');
    const statusText = document.querySelector('#pixelStatusText');
    let pixelSelect = document.querySelector('select[name="pixel"]');
    const bmSelect = document.querySelector('select[name="businessManager"]');
    
    try {
        if (loadBtn) loadBtn.disabled = true;
        if (statusDiv) statusDiv.style.display = 'block';
        if (statusText) statusText.textContent = 'Validando selección...';
        
        // Verificar que se haya seleccionado un BM
        if (!bmSelect || !bmSelect.value) {
            if (statusText) statusText.textContent = '⚠️ Primero selecciona un Business Manager';
            setTimeout(() => {
                if (statusDiv) statusDiv.style.display = 'none';
            }, 3000);
            return;
        }
        
        const selectedBMId = bmSelect.value;
        console.log(`🎯 Cargando píxeles para BM: ${selectedBMId}`);
        
        if (statusText) statusText.textContent = `🔍 Buscando píxeles en BM ${selectedBMId}...`;
        
        const pixels = await getPixelsByBM(selectedBMId);
        
        if (pixelSelect) {
            // Convertir a multi-select si no lo es
            if (!pixelSelect.multiple) {
                pixelSelect.multiple = true;
                pixelSelect.size = Math.min(Math.max(pixels.length + 1, 3), 8); // Entre 3 y 8 líneas visibles
                pixelSelect.style.height = 'auto';
                pixelSelect.style.minHeight = '80px';
            }
            
            if (pixels.length > 0) {
                pixelSelect.innerHTML = '<option value="" disabled style="background-color: #f8f9fa; font-style: italic;">📌 Seleccionar Píxeles (Ctrl+Click para múltiples)...</option>';
                
                pixels.forEach((pixel, index) => {
                    const option = document.createElement('option');
                    option.value = pixel.id;
                    option.textContent = pixel.displayName;
                    option.style.padding = '8px';
                    option.style.borderBottom = '1px solid #eee';
                    option.title = `Píxel ID: ${pixel.id} | BM: ${selectedBMId}`;
                    pixelSelect.appendChild(option);
                });
                
                if (statusText) {
                    statusText.innerHTML = `✅ <strong>${pixels.length}</strong> píxeles encontrados en BM <strong>${selectedBMId}</strong>`;
                    statusText.style.color = '#28a745';
                }
                
                // Mostrar área de progreso
                const progressArea = document.querySelector('#pixelProgressArea');
                if (progressArea) {
                    progressArea.style.display = 'block';
                    const progressMessages = document.querySelector('#pixelProgressMessages');
                    if (progressMessages) {
                        progressMessages.innerHTML = `
                            <div class="alert alert-success py-2 mb-2" style="font-size: 0.9em;">
                                <i class="ri-check-circle-line me-2"></i>
                                <strong>¡Píxeles cargados exitosamente!</strong>
                            </div>
                            <div class="alert alert-info py-2 mb-2" style="font-size: 0.85em;">
                                <i class="ri-information-line me-2"></i>
                                <strong>Instrucciones:</strong><br>
                                • Mantén presionado <kbd>Ctrl</kbd> y haz clic para seleccionar múltiples píxeles<br>
                                • Selecciona las cuentas publicitarias en la tabla principal<br>
                                • Presiona el botón "Iniciar" para conectar los píxeles seleccionados
                            </div>
                            <div class="small text-muted">
                                📊 BM: ${selectedBMId} | 🎯 Píxeles disponibles: ${pixels.length}
                            </div>
                        `;
                    }
                }
                
            } else {
                pixelSelect.innerHTML = '<option value="" disabled style="color: #dc3545;">❌ No se encontraron píxeles en este BM</option>';
                
                if (statusText) {
                    statusText.innerHTML = `⚠️ No se encontraron píxeles en BM <strong>${selectedBMId}</strong>`;
                    statusText.style.color = '#ffc107';
                }
                
                // Mostrar sugerencias
                const progressArea = document.querySelector('#pixelProgressArea');
                if (progressArea) {
                    progressArea.style.display = 'block';
                    const progressMessages = document.querySelector('#pixelProgressMessages');
                    if (progressMessages) {
                        progressMessages.innerHTML = `
                            <div class="alert alert-warning py-2 mb-2" style="font-size: 0.9em;">
                                <i class="ri-alert-line me-2"></i>
                                <strong>No se encontraron píxeles</strong>
                            </div>
                            <div class="alert alert-info py-2 mb-2" style="font-size: 0.85em;">
                                <i class="ri-lightbulb-line me-2"></i>
                                <strong>Posibles soluciones:</strong><br>
                                • Verifica que el BM tenga píxeles creados<br>
                                • Asegúrate de tener permisos de acceso al BM<br>
                                • Prueba con otro Business Manager<br>
                                • Contacta al administrador del BM si es necesario
                            </div>
                        `;
                    }
                }
            }
        }
        
        setTimeout(() => {
            if (statusDiv) statusDiv.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('❌ Error cargando píxeles:', error);
        if (statusText) {
            statusText.textContent = '❌ Error cargando píxeles';
            statusText.style.color = '#dc3545';
        }
        
        if (pixelSelect) {
            pixelSelect.innerHTML = '<option value="" disabled style="color: #dc3545;">❌ Error cargando píxeles</option>';
        }
        
    } finally {
        if (loadBtn) loadBtn.disabled = false;
    }
}

// Función mejorada para verificar si está listo con multi-select
function isPixelFunctionReady() {
    const pixelSwitch = document.querySelector('input[name="connectPixels"]');
    const pixelSelect = document.querySelector('select[name="pixel"]');
    
    if (!pixelSwitch || !pixelSwitch.checked || !pixelSelect) {
        return false;
    }
    
    // Verificar si hay píxeles seleccionados (para multi-select)
    const selectedOptions = Array.from(pixelSelect.selectedOptions);
    return selectedOptions.length > 0 && selectedOptions.some(option => option.value !== "");
}

// Función mejorada para ejecutar conexión con múltiples píxeles
async function executePixelFunction() {
    if (!isPixelFunctionReady()) {
        return false;
    }
    
    const pixelSelect = document.querySelector('select[name="pixel"]');
    const selectedOptions = Array.from(pixelSelect.selectedOptions);
    const selectedPixels = selectedOptions
        .map(option => option.value)
        .filter(value => value !== "");
    
    // Obtener cuentas seleccionadas
    const selectedRows = (typeof getSelectedRows === 'function') ? getSelectedRows() : [];
    const accountIds = selectedRows.map(row => row.adId || row.id);
    
    if (accountIds.length === 0) {
        return false;
    }
    
    const progressMessages = document.querySelector('#pixelProgressMessages');
    if (progressMessages) progressMessages.innerHTML = '';
    
    const progressCallback = (message) => {
        if (progressMessages) {
            const div = document.createElement('div');
            div.className = 'alert alert-info py-1 px-2 mb-1 small';
            div.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
            progressMessages.appendChild(div);
            progressMessages.scrollTop = progressMessages.scrollHeight;
        }
    };
    
    // Verificar permisos del usuario actual
    progressCallback('🔍 Verificando permisos del usuario...');
    const userInfo = await checkUserPermissions();
    if (userInfo) {
        progressCallback(`👤 Usuario: ${userInfo.name} (${userInfo.id})`);
    }
    
    progressCallback(`🎯 Iniciando conexión de ${selectedPixels.length} píxeles a ${accountIds.length} cuentas`);
    progressCallback(`📌 Píxeles seleccionados: ${selectedPixels.join(', ')}`);
    
    let totalSuccess = 0;
    let totalFailed = 0;
    
    // Procesar cada píxel
    for (let pixelIndex = 0; pixelIndex < selectedPixels.length; pixelIndex++) {
        const pixelId = selectedPixels[pixelIndex];
        progressCallback(`\n🔹 PROCESANDO PÍXEL ${pixelIndex + 1}/${selectedPixels.length}: ${pixelId}`);
        
        let pixelSuccess = 0;
        let pixelFailed = 0;
        
        // Procesar cada cuenta para este píxel
        for (let i = 0; i < accountIds.length; i++) {
            const accountId = accountIds[i];
            progressCallback(`   [${i + 1}/${accountIds.length}] Cuenta: ${accountId}`);
            
            const result = await connectPixelToAccount(pixelId, accountId, 
                (msg) => progressCallback(`   ${msg}`));
            
            if (result) {
                pixelSuccess++;
                totalSuccess++;
            } else {
                pixelFailed++;
                totalFailed++;
            }
            
            // Pausa entre requests
            if (i < accountIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        progressCallback(`🔹 Píxel ${pixelId}: ${pixelSuccess} exitosas, ${pixelFailed} fallidas`);
        
        // Pausa entre píxeles
        if (pixelIndex < selectedPixels.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Resumen final
    progressCallback(`\n🎯 RESUMEN FINAL:`);
    progressCallback(`✅ Total exitosas: ${totalSuccess}`);
    progressCallback(`❌ Total fallidas: ${totalFailed}`);
    progressCallback(`📊 Píxeles procesados: ${selectedPixels.length}`);
    progressCallback(`📊 Cuentas procesadas: ${accountIds.length}`);
    progressCallback(`📊 Total operaciones: ${selectedPixels.length * accountIds.length}`);
    
    if (totalFailed > 0 && totalSuccess === 0) {
        progressCallback(`\n💡 SUGERENCIAS PARA RESOLVER PROBLEMAS:`);
        progressCallback(`🔸 Si error "Permissions": El usuario debe ser administrador del píxel Y de la cuenta`);
        progressCallback(`🔸 Si recibe HTML: Problema de autenticación - recargar página`);
        progressCallback(`🔸 Si "Missing parameters": Actualizar la página y reintentar`);
        progressCallback(`🔸 SOLUCIÓN ALTERNATIVA: Ir manualmente a Facebook Business Manager:`);
        progressCallback(`   1. business.facebook.com > Configuración de eventos`);
        progressCallback(`   2. Seleccionar píxel > Asignar partner`);
        progressCallback(`   3. Agregar cuentas publicitarias manualmente`);
        progressCallback(`🔸 OTRA ALTERNATIVA: Usar Facebook Ads Manager:`);
        progressCallback(`   1. ads.facebook.com > Administrador de eventos`);
        progressCallback(`   2. Configurar píxel > Cuentas publicitarias`);
    }
    
    return totalSuccess > 0;
}

// Función para crear botón de cargar píxeles
function addPixelButton() {
    setTimeout(() => {
        const pixelSelect = document.querySelector('select[name="pixel"]');
        if (!pixelSelect) return;
        
        const pixelLabel = pixelSelect.closest('.mb-3')?.querySelector('label.form-label');
        if (!pixelLabel || document.querySelector('#loadPixelsButton')) return;
        
        pixelLabel.style.display = 'flex';
        pixelLabel.style.justifyContent = 'space-between';
        pixelLabel.style.alignItems = 'center';
        
        const btnHTML = '<button type="button" class="btn btn-sm btn-outline-success" id="loadPixelsButton" onclick="loadPixelsManually()"><i class="ri-refresh-line me-1"></i>Cargar Píxeles</button>';
        pixelLabel.innerHTML = pixelLabel.textContent + btnHTML;
    }, 200);
}

// Función para configurar event listeners
function setupPixelEventListeners() {
    // Event listener para cambio de BM que automáticamente limpia la selección de píxeles
    const bmSelect = document.querySelector('select[name="businessManager"]');
    const pixelSelect = document.querySelector('select[name="pixel"]');
    
    if (bmSelect && pixelSelect) {
        bmSelect.addEventListener('change', function() {
            // Limpiar selección de píxeles cuando cambie el BM
            pixelSelect.innerHTML = '<option value="">Haz clic en "Cargar Píxeles" para obtener los píxeles del BM seleccionado...</option>';
            pixelSelect.multiple = false;
            pixelSelect.size = 1;
            pixelSelect.style.height = 'auto';
            pixelSelect.style.minHeight = 'auto';
            
            // Ocultar área de progreso
            const progressArea = document.querySelector('#pixelProgressArea');
            if (progressArea) {
                progressArea.style.display = 'none';
            }
            
            // Limpiar status
            const statusDiv = document.querySelector('#pixelLoadingStatus');
            if (statusDiv) {
                statusDiv.style.display = 'none';
            }
            
            console.log(`🔄 BM cambiado a: ${this.value}. Píxeles limpiados.`);
        });
    }
}

// Función para depurar específicamente la detección de píxeles
async function debugPixelDetection(bmId) {
    try {
        console.log('\n🔍 DEBUG: ANÁLISIS DETALLADO DE DETECCIÓN DE PÍXELES');
        console.log('='.repeat(60));
        console.log(`🏢 Analizando BM: ${bmId}`);
        
        const response = await fetch2(`https://business.facebook.com/latest/settings/events_dataset_and_pixel?business_id=${bmId}`, {
            method: 'GET',
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'accept-language': 'es-ES,es;q=0.9,en;q=0.8'
            }
        });
        
        const text = typeof response.text === 'string' ? response.text : JSON.stringify(response.json || response);
        
        console.log(`📄 Longitud del texto recibido: ${text.length} caracteres`);
        console.log(`📊 Status de respuesta: ${response.status}`);
        
        // Buscar todos los números largos sin filtros
        const allNumbers = text.match(/\d{15,20}/g) || [];
        console.log(`🔢 Total números de 15-20 dígitos encontrados: ${allNumbers.length}`);
        console.log(`📋 Primeros 20 números:`, allNumbers.slice(0, 20));
        
        // Buscar patrones específicos
        const patterns = {
            'dataset_id': text.match(/"dataset_id":"(\d{15,20})"/g) || [],
            'id en JSON': text.match(/"id":"(\d{15,20})"/g) || [],
            'pixel_id': text.match(/"pixel_id":"(\d{15,20})"/g) || [],
            'pixelId': text.match(/"pixelId":"(\d{15,20})"/g) || [],
            'números sueltos': text.match(/\b\d{15,20}\b/g) || []
        };
        
        Object.entries(patterns).forEach(([name, matches]) => {
            console.log(`🔍 Patrón "${name}": ${matches.length} coincidencias`);
            if (matches.length > 0 && matches.length < 10) {
                console.log(`   Ejemplos:`, matches.slice(0, 5));
            }
        });
        
        // Intentar detectar si es JSON válido
        try {
            const cleanText = text.replace(/^for \(;;\);/, '');
            const data = JSON.parse(cleanText);
            console.log('✅ Respuesta es JSON válido');
            
            if (data.payload) {
                console.log('📦 Encontrado payload');
                if (data.payload.datasets) {
                    console.log(`🎯 Datasets en payload: ${data.payload.datasets.length}`);
                }
            }
            
            if (data.jsmods) {
                console.log('📦 Encontrado jsmods');
            }
            
        } catch (e) {
            console.log('❌ No es JSON válido o tiene formato especial');
        }
        
        console.log('\n💡 Para ejecutar: debugPixelDetection("BM_ID")');
        
    } catch (error) {
        console.error('❌ Error en debug de píxeles:', error);
    }
}

// Función para depurar Business Managers y sus píxeles
async function debugBusinessManagers() {
    try {
        console.log('\n🔍 DEBUG: ANÁLISIS COMPLETO DE BUSINESS MANAGERS');
        console.log('='.repeat(60));
        
        const businessManagers = await getBusinessManagers();
        console.log(`\n📊 Total BMs encontrados: ${businessManagers.length}`);
        
        for (const bm of businessManagers) {
            console.log(`\n🏢 BM: ${bm.name} (ID: ${bm.id})`);
            console.log(`   Status: ${bm.status} | Color: ${bm.statusColor}`);
            
            // Intentar obtener píxeles de este BM
            const pixels = await getPixelsByBM(bm.id);
            console.log(`   📊 Píxeles encontrados: ${pixels.length}`);
            
            if (pixels.length > 0) {
                pixels.forEach((pixel, index) => {
                    console.log(`     ${index + 1}. ${pixel.name} (ID: ${pixel.id})`);
                });
            } else {
                console.log('     ❌ Sin píxeles detectados');
                
                // Verificar acceso directo via Graph API
                const token = fb?.accessToken || fb?.token;
                if (token) {
                    try {
                        const bmUrl = `https://graph.facebook.com/v14.0/${bm.id}?fields=id,name&access_token=${token}`;
                        const bmResponse = await fetch2(bmUrl);
                        console.log(`     🔍 Acceso al BM via Graph API: ${bmResponse.ok ? '✅ SÍ' : '❌ NO'}`);
                        
                        if (bmResponse.ok) {
                            const pixelUrl = `https://graph.facebook.com/v14.0/${bm.id}/adspixels?fields=id,name&access_token=${token}`;
                            const pixelResponse = await fetch2(pixelUrl);
                            const pixelData = pixelResponse.json;
                            console.log(`     🎯 Píxeles via Graph API: ${pixelData && pixelData.data ? pixelData.data.length : 0}`);
                        }
                    } catch (e) {
                        console.log(`     ⚠️ Error verificando acceso: ${e.message}`);
                    }
                }
            }
        }
        
        console.log('\n💡 Para ejecutar este debug: debugBusinessManagers()');
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
    }
}

// Función para generar reporte completo de permisos
async function generatePermissionsReport() {
    try {
        const pixelSelect = document.querySelector('select[name="pixel"]');
        const selectedRows = (typeof getSelectedRows === 'function') ? getSelectedRows() : [];
        
        if (!pixelSelect || selectedRows.length === 0) {
            console.log('❌ Selecciona píxeles y cuentas primero');
            return;
        }
        
        const selectedPixels = Array.from(pixelSelect.selectedOptions)
            .map(option => option.value)
            .filter(value => value !== "");
        const accountIds = selectedRows.map(row => row.adId || row.id);
        
        console.log('\n📊 REPORTE DE PERMISOS DETALLADO');
        console.log('='.repeat(50));
        
        for (const pixelId of selectedPixels) {
            console.log(`\n🎯 PÍXEL: ${pixelId}`);
            for (const accountId of accountIds) {
                const permissions = await checkPixelAndAccountPermissions(pixelId, accountId);
                console.log(`  📁 Cuenta ${accountId}:`);
                console.log(`    • Acceso píxel: ${permissions.pixelAccess ? '✅ SÍ' : '❌ NO'}`);
                console.log(`    • Gestión píxel: ${permissions.canManagePixel ? '✅ SÍ' : '❌ NO'}`);
                console.log(`    • Acceso cuenta: ${permissions.accountAccess ? '✅ SÍ' : '❌ NO'}`);
                console.log(`    • Gestión cuenta: ${permissions.canManageAccount ? '✅ SÍ' : '❌ NO'}`);
                
                const canConnect = permissions.pixelAccess && permissions.accountAccess && 
                                 (permissions.canManagePixel || permissions.canManageAccount);
                console.log(`    • Puede conectar: ${canConnect ? '✅ PROBABLE' : '❌ UNLIKELY'}`);
            }
        }
        
        console.log('\n💡 Para ejecutar este reporte: generatePermissionsReport()');
        
    } catch (error) {
        console.error('❌ Error generando reporte:', error);
    }
}

// Función NUEVA para probar detección de píxeles paso a paso
async function testPixelDetection(bmId = null) {
    try {
        console.log('\n🔍 PRUEBA COMPLETA DE DETECCIÓN DE PÍXELES');
        console.log('='.repeat(60));
        
        // Obtener BM ID si no se proporciona
        if (!bmId) {
            const bmSelect = document.querySelector('select[name="businessManager"]');
            bmId = bmSelect ? bmSelect.value : null;
            if (!bmId) {
                console.log('❌ No se especificó BM ID. Selecciona un BM en la interfaz o usa: testPixelDetection("BM_ID")');
                return;
            }
        }
        
        console.log(`🏢 Probando BM: ${bmId}`);
        
        // Verificar tokens disponibles
        console.log('\n🔑 VERIFICANDO TOKENS:');
        const fbToken = fb?.accessToken || fb?.token;
        const eaagToken = getEAAGToken();
        
        console.log(`📊 Token FB: ${fbToken ? fbToken.substring(0, 20) + '...' : 'NO DISPONIBLE'}`);
        console.log(`📊 Token EAAG: ${eaagToken ? eaagToken.substring(0, 20) + '...' : 'NO ENCONTRADO'}`);
        
        // Probar función principal
        console.log('\n🧪 PROBANDO FUNCIÓN PRINCIPAL:');
        const pixels = await getPixelsByBM(bmId);
        console.log(`📊 Resultado: ${pixels.length} píxeles encontrados`);
        
        if (pixels.length > 0) {
            console.log('✅ ÉXITO - Píxeles encontrados:');
            pixels.forEach((pixel, index) => {
                console.log(`   ${index + 1}. ${pixel.name} (ID: ${pixel.id})`);
            });
        } else {
            console.log('❌ NO SE ENCONTRARON PÍXELES');
            
            // Diagnóstico adicional
            console.log('\n🔍 DIAGNÓSTICO ADICIONAL:');
            
            // Verificar acceso al BM
            const token = eaagToken || fbToken;
            if (token) {
                try {
                    const bmUrl = `https://graph.facebook.com/v19.0/${bmId}?fields=id,name,verification_status&access_token=${token}`;
                    const bmResponse = await fetch2(bmUrl);
                    const bmData = bmResponse.json;
                    
                    console.log(`📊 Acceso al BM: ${bmResponse.ok ? '✅ SÍ' : '❌ NO'}`);
                    if (bmResponse.ok) {
                        console.log(`📊 Nombre BM: ${bmData.name || 'Sin nombre'}`);
                        console.log(`📊 Status: ${bmData.verification_status || 'Desconocido'}`);
                    } else {
                        console.log(`📊 Error BM:`, bmData);
                    }
                } catch (e) {
                    console.log(`❌ Error verificando BM: ${e.message}`);
                }
                
                // Probar endpoint directo de píxeles
                try {
                    console.log('\n🎯 PROBANDO ENDPOINT DIRECTO:');
                    const directUrl = `https://graph.facebook.com/v19.0/${bmId}/adspixels?fields=id,name,owner_business&access_token=${token}`;
                    const directResponse = await fetch2(directUrl);
                    const directData = directResponse.json;
                    
                    console.log(`📊 Respuesta directa:`, directData);
                    
                    if (directData && directData.data) {
                        console.log(`📊 Píxeles en respuesta directa: ${directData.data.length}`);
                    }
                } catch (e) {
                    console.log(`❌ Error endpoint directo: ${e.message}`);
                }
            }
        }
        
        console.log('\n💡 Para ejecutar: testPixelDetection("BM_ID")');
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
    }
}

// Función NUEVA para probar el endpoint exacto que me mostraste
async function testGraphAPIPixels(bmId, token = null) {
    try {
        console.log('\n🧪 PRUEBA DEL ENDPOINT GRAPH API EXACTO');
        console.log('='.repeat(50));
        
        // Usar el token proporcionado o intentar obtener uno
        let accessToken = token;
        if (!accessToken) {
            accessToken = fb?.accessToken || fb?.token;
            
            // Intentar obtener token EAAG si no lo tenemos
            if (!accessToken || !accessToken.startsWith('EAAG')) {
                const eaagToken = getEAAGToken();
                if (eaagToken) {
                    accessToken = eaagToken;
                    console.log(`🔑 Usando token EAAG encontrado: ${accessToken.substring(0, 20)}...`);
                }
            }
        }
        
        if (!accessToken) {
            console.log('❌ No se encontró token de acceso');
            return;
        }
        
        if (!bmId) {
            const bmSelect = document.querySelector('select[name="businessManager"]');
            bmId = bmSelect ? bmSelect.value : null;
            if (!bmId) {
                console.log('❌ No se especificó BM ID. Uso: testGraphAPIPixels("BM_ID", "TOKEN_OPCIONAL")');
                return;
            }
        }
        
        console.log(`🏢 Probando BM: ${bmId}`);
        console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);
        
        // Probar EXACTAMENTE como tu ejemplo (SIN el parámetro name que puede estar causando problemas)
        const url = `https://graph.facebook.com/v19.0/${bmId}/adspixels?fields=id,name&access_token=${accessToken}`;
        console.log(`📡 URL: ${url}`);
        
        const response = await fetch2(url);
        const data = response.json;
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📊 OK: ${response.ok}`);
        console.log(`📊 Respuesta completa:`, data);
        
        if (response.ok && data.data && Array.isArray(data.data)) {
            console.log(`✅ ÉXITO: Encontrados ${data.data.length} píxeles`);
            console.log(`📋 IDs de píxeles:`, data.data.map(p => p.id));
            
            // Mostrar cada píxel
            data.data.forEach((pixel, index) => {
                console.log(`  ${index + 1}. ID: ${pixel.id} | Nombre: ${pixel.name || 'Sin nombre'}`);
            });
            
            if (data.paging) {
                console.log(`📄 Paginación disponible:`, data.paging);
            }
            
            return data.data;
        } else if (data.error) {
            console.error(`❌ Error Graph API:`, data.error);
            console.log(`💡 Mensaje: ${data.error.message}`);
            console.log(`💡 Código: ${data.error.code}`);
            console.log(`💡 Tipo: ${data.error.type}`);
        } else {
            console.log('⚠️ Respuesta inesperada');
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return null;
    }
}

// Función para debug específico del problema actual
async function debugCurrentIssue(bmId = "817343379608815") {
    try {
        console.log('\n🚨 DEBUG DEL PROBLEMA ACTUAL');
        console.log('='.repeat(50));
        
        // Obtener token actual
        let token = fb?.accessToken || fb?.token;
        if (!token || !token.startsWith('EAAG')) {
            const eaagToken = getEAAGToken();
            if (eaagToken) {
                token = eaagToken;
            }
        }
        
        console.log(`🏢 BM: ${bmId}`);
        console.log(`🔑 Token: ${token.substring(0, 20)}...`);
        
        // Probar exactamente como el código principal
        const url = `https://graph.facebook.com/v19.0/${bmId}/adspixels?fields=id,name&access_token=${token}`;
        console.log(`📡 URL: ${url}`);
        
        const response = await fetch2(url);
        const data = response.json;
        
        console.log(`📊 Response Status: ${response.status}`);
        console.log(`📊 Response OK: ${response.ok}`);
        console.log(`📊 Response Type: ${typeof response}`);
        console.log(`📊 Data Type: ${typeof data}`);
        console.log(`📊 Data:`, data);
        console.log(`📊 Data.data exists: ${!!data.data}`);
        console.log(`📊 Data.data type: ${typeof data.data}`);
        console.log(`📊 Data.data is array: ${Array.isArray(data.data)}`);
        console.log(`📊 Data.data length: ${data.data?.length}`);
        
        if (data.data && Array.isArray(data.data)) {
            console.log(`📋 Píxeles encontrados:`);
            data.data.forEach((pixel, index) => {
                console.log(`  ${index + 1}. ID: ${pixel.id} | Name: ${pixel.name || 'Sin nombre'}`);
            });
        }
        
        // Probar la condición exacta del código
        const condition = response.ok && data.data && Array.isArray(data.data);
        console.log(`🔍 Condición completa: ${condition}`);
        console.log(`   response.ok: ${response.ok}`);
        console.log(`   data.data: ${!!data.data}`);
        console.log(`   Array.isArray(data.data): ${Array.isArray(data.data)}`);
        
        if (condition) {
            console.log(`✅ LA CONDICIÓN SE CUMPLE - DEBERÍA RETORNAR PÍXELES`);
            
            // Simular el mapeo
            const graphPixels = data.data.map((pixel, index) => ({
                id: pixel.id,
                name: pixel.name || `Píxel ${index + 1}`,
                displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                status: 'ACTIVE',
                bmId: bmId
            }));
            
            console.log(`📋 Píxeles mapeados:`, graphPixels);
            return graphPixels;
        } else {
            console.log(`❌ LA CONDICIÓN NO SE CUMPLE`);
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
        return null;
    }
}

// Función para probar con el token exacto que me mostraste
async function testWithYourToken(bmId = "554559557747087") {
    try {
        console.log('\n🧪 PRUEBA CON TOKEN ESPECÍFICO');
        console.log('='.repeat(50));
        
        // Usar el token que me mostraste en tu ejemplo
        const yourToken = "EAAGNO4a7r2wBOZBi2vyoclOpMrbWGUnCanoiwdEcNkcGOm0a3oK5e1RJtZAxPfqSb7tHUQcy2QlNjXPOM7bzZCXujqr96g3CqtVptHa5VzR3eMvHAip6GZCuRKiFZArrYn7xmZC4JGOZBGSa8OYIF9Fj5yZCXk2L4r92hHL0ubWH2lpbmUE97rukoJCk9XLIRQZDZD";
        
        console.log(`🏢 Probando BM: ${bmId}`);
        console.log(`🔑 Token específico: ${yourToken.substring(0, 20)}...`);
        
        // Usar exactamente el mismo endpoint que me mostraste
        const url = `https://graph.facebook.com/v19.0/${bmId}/adspixels?name=MiPixelNuevo&access_token=${yourToken}`;
        console.log(`📡 URL exacta: ${url}`);
        
        const response = await fetch2(url);
        const data = response.json;
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📊 OK: ${response.ok}`);
        console.log(`📊 Respuesta completa:`, data);
        
        if (response.ok && data.data && Array.isArray(data.data)) {
            console.log(`✅ ÉXITO: Encontrados ${data.data.length} píxeles`);
            console.log(`📋 IDs esperados:`, data.data.map(p => p.id));
            
            // Verificar si coinciden con los IDs que me mostraste
            const expectedIds = [
                "1007073837987160", "668934689318101", "1423782085710968",
                "1207586150807733", "689851163634548", "671580985743307",
                "722313246960208", "564398453056506", "664574579807618",
                "1155643693267712", "1223967292473273"
            ];
            
            console.log(`🔍 Comparando con IDs esperados...`);
            const foundIds = data.data.map(p => p.id);
            const matches = expectedIds.filter(id => foundIds.includes(id));
            const missing = expectedIds.filter(id => !foundIds.includes(id));
            
            console.log(`✅ IDs que coinciden (${matches.length}):`, matches);
            console.log(`❌ IDs faltantes (${missing.length}):`, missing);
            
            return data.data;
        } else if (data.error) {
            console.error(`❌ Error Graph API:`, data.error);
            console.log(`💡 Mensaje: ${data.error.message}`);
            console.log(`💡 Código: ${data.error.code}`);
            console.log(`💡 Tipo: ${data.error.type}`);
        } else {
            console.log('⚠️ Respuesta inesperada');
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return null;
    }
}

// Función NUEVA para probar con BM que tiene píxeles
async function testWithWorkingBM() {
    try {
        console.log('\n🧪 PROBANDO CON BM QUE SÍ TIENE PÍXELES');
        console.log('='.repeat(60));
        
        // Probar con el BM que sabemos que tiene píxeles
        const workingBM = "2330406580664254";
        console.log(`🏢 Probando BM que funciona: ${workingBM}`);
        
        const result = await getPixelsByBM(workingBM);
        console.log(`📊 Resultado final: ${result.length} píxeles encontrados`);
        
        if (result.length > 0) {
            console.log(`✅ ÉXITO - Píxeles encontrados:`);
            result.forEach((pixel, index) => {
                console.log(`   ${index + 1}. ${pixel.name} (${pixel.id})`);
            });
        } else {
            console.log(`❌ No se encontraron píxeles`);
        }
        
        return result;
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return null;
    }
}

// Función NUEVA para probar con tu endpoint exacto
async function testYourExactEndpoint(bmId = "2330406580664254") {
    try {
        console.log('\n🧪 PROBANDO TU ENDPOINT EXACTO');
        console.log('='.repeat(50));
        
        // Obtener el mejor token disponible
        let token = fb?.accessToken || fb?.token;
        const eaagToken = getEAAGToken();
        if (eaagToken) {
            token = eaagToken;
            console.log(`🔑 Usando token EAAG: ${token.substring(0, 20)}...`);
        }
        
        if (!token) {
            console.log('❌ No se encontró token de acceso');
            return;
        }
        
        console.log(`🏢 Probando BM: ${bmId}`);
        
        // Usar exactamente tu URL que funciona
        const url = `https://graph.facebook.com/v19.0/${bmId}/adspixels?name=MiPixelNuevo&access_token=${token}`;
        console.log(`📡 URL exacta: ${url}`);
        
        const response = await fetch2(url);
        const data = response.json;
        
        console.log(`📊 Status: ${response.status}`);
        console.log(`📊 OK: ${response.ok}`);
        console.log(`📊 Respuesta completa:`, data);
        
        if (response.ok && data && data.data && Array.isArray(data.data)) {
            console.log(`✅ ÉXITO: Encontrados ${data.data.length} píxeles`);
            
            if (data.data.length > 0) {
                console.log(`📋 Píxeles encontrados:`);
                data.data.forEach((pixel, index) => {
                    console.log(`  ${index + 1}. ID: ${pixel.id} | Nombre: ${pixel.name || 'Sin nombre'}`);
                });
                
                // Probar si la función principal funciona ahora
                console.log('\n🔄 Probando función principal con este BM...');
                const mainResult = await getPixelsByBM(bmId);
                console.log(`📊 Resultado función principal: ${mainResult.length} píxeles`);
                
                return data.data;
            } else {
                console.log(`⚠️ Respuesta exitosa pero array vacío`);
            }
        } else if (data && data.error) {
            console.error(`❌ Error Graph API:`, data.error);
            console.log(`💡 Mensaje: ${data.error.message}`);
            console.log(`💡 Código: ${data.error.code}`);
        } else {
            console.log('⚠️ Respuesta inesperada');
        }
        
        return null;
        
    } catch (error) {
        console.error('❌ Error en prueba:', error);
        return null;
    }
}

// Función para probar múltiples versiones de Graph API
async function testMultipleGraphAPIVersions(bmId, token = null) {
    try {
        console.log('\n🧪 PRUEBA DE MÚLTIPLES VERSIONES DE GRAPH API');
        console.log('='.repeat(60));
        
        const versions = ['v19.0', 'v18.0', 'v17.0', 'v16.0', 'v15.0', 'v14.0'];
        
        // Usar el token proporcionado o intentar obtener uno
        let accessToken = token;
        if (!accessToken) {
            accessToken = fb?.accessToken || fb?.token;
            
            // Intentar obtener token EAAG si no lo tenemos
            if (!accessToken || !accessToken.startsWith('EAAG')) {
                const eaagToken = getEAAGToken();
                if (eaagToken) {
                    accessToken = eaagToken;
                }
            }
        }
        
        if (!accessToken) {
            console.log('❌ No se encontró token de acceso');
            return;
        }
        
        if (!bmId) {
            const bmSelect = document.querySelector('select[name="businessManager"]');
            bmId = bmSelect ? bmSelect.value : null;
            if (!bmId) {
                console.log('❌ No se especificó BM ID. Uso: testMultipleGraphAPIVersions("BM_ID", "TOKEN_OPCIONAL")');
                return;
            }
        }
        
        console.log(`🏢 Probando BM: ${bmId}`);
        console.log(`🔑 Token: ${accessToken.substring(0, 20)}...`);
        
        for (const version of versions) {
            console.log(`\n📡 Probando ${version}:`);
            
            const url = `https://graph.facebook.com/${version}/${bmId}/adspixels?fields=id,name&access_token=${accessToken}`;
            
            try {
                const response = await fetch2(url);
                const data = response.json;
                
                if (response.ok && data.data && Array.isArray(data.data)) {
                    console.log(`  ✅ ${version}: ${data.data.length} píxeles encontrados`);
                    if (data.data.length > 0) {
                        console.log(`     IDs: ${data.data.map(p => p.id).join(', ')}`);
                    }
                } else if (data.error) {
                    console.log(`  ❌ ${version}: ${data.error.message}`);
                } else {
                    console.log(`  ⚠️ ${version}: Respuesta inesperada`);
                }
                
            } catch (error) {
                console.log(`  ❌ ${version}: Error de conexión - ${error.message}`);
            }
            
            // Pausa entre requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n💡 Para ejecutar: testMultipleGraphAPIVersions("BM_ID", "TOKEN_OPCIONAL")');
        
    } catch (error) {
        console.error('❌ Error en prueba múltiple:', error);
    }
}

// REGISTRAR TODAS LAS FUNCIONES GLOBALMENTE
window.getBusinessManagers = getBusinessManagers;
window.getPixelsByBM = getPixelsByBM;
window.checkUserPermissions = checkUserPermissions;
window.checkPixelAndAccountPermissions = checkPixelAndAccountPermissions;
window.getEAAGToken = getEAAGToken;
window.requestElevatedPermissions = requestElevatedPermissions;
window.debugPixelDetection = debugPixelDetection;
window.debugBusinessManagers = debugBusinessManagers;
window.generatePermissionsReport = generatePermissionsReport;
window.testPixelDetection = testPixelDetection;
window.testGraphAPIPixels = testGraphAPIPixels;
window.testWithWorkingBM = testWithWorkingBM;
window.testYourExactEndpoint = testYourExactEndpoint;
window.debugCurrentIssue = debugCurrentIssue;
window.testWithYourToken = testWithYourToken;
window.testMultipleGraphAPIVersions = testMultipleGraphAPIVersions;
window.connectPixelToAccount = connectPixelToAccount;
// Función de debugging para probar conexión de píxeles (basada en tu código funcional)
async function testPixelConnection(pixelId, accountId, businessId) {
    console.log('\n🧪 TEST DE CONEXIÓN DE PÍXELES');
    console.log('='.repeat(50));
    console.log(`🎯 Píxel ID: ${pixelId}`);
    console.log(`📊 Account ID: ${accountId}`);
    console.log(`🏢 Business ID: ${businessId}`);
    
    try {
        // Obtener token EAAG
        const eaagToken = getEAAGToken();
        console.log(`🔑 Token EAAG: ${eaagToken ? eaagToken.substring(0, 10) + '...' : 'NO ENCONTRADO'}`);
        
        if (!eaagToken) {
            console.log('❌ No se puede continuar sin token EAAG');
            return false;
        }
        
        // Preparar parámetros exactamente como tu código funcional
        const cleanAccountId = accountId.replace(/^act_/, '').replace(/\D/g, '');
        const sharedAccountsUrl = `https://graph.facebook.com/v17.0/${pixelId}/shared_accounts`;
        
        const params = {
            access_token: eaagToken,
            business: businessId,
            account_id: cleanAccountId
        };
        
        console.log(`📡 URL: ${sharedAccountsUrl}`);
        console.log(`📊 Parámetros:`, params);
        
        // Realizar la petición
        const response = await fetch(sharedAccountsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: new URLSearchParams(params)
        });
        
        const responseData = await response.json();
        
        console.log(`📈 Status: ${response.status}`);
        console.log(`📋 Respuesta completa:`, responseData);
        
        if (!responseData.error) {
            console.log('✅ ÉXITO: Píxel conectado correctamente');
            return true;
        } else {
            console.log(`❌ ERROR: ${responseData.error.message}`);
            
            if (responseData.error.message.includes('already') || responseData.error.message.includes('exists')) {
                console.log('✅ NOTA: El píxel ya estaba conectado');
                return true;
            }
            
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error);
        return false;
    }
}

// Función para probar múltiples conexiones
async function testMultiplePixelConnections(pixelIds, accountIds, businessId) {
    console.log('\n🧪 TEST MASIVO DE CONEXIONES');
    console.log('='.repeat(50));
    
    const results = [];
    
    for (const pixelId of pixelIds) {
        for (const accountId of accountIds) {
            console.log(`\n🔄 Probando: Píxel ${pixelId} → Cuenta ${accountId}`);
            const result = await testPixelConnection(pixelId, accountId, businessId);
            
            results.push({
                pixelId,
                accountId,
                success: result
            });
            
            // Pausa entre requests para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log('\n📊 RESUMEN DE RESULTADOS:');
    const successful = results.filter(r => r.success).length;
    const total = results.length;
    console.log(`✅ Exitosas: ${successful}/${total}`);
    console.log(`❌ Fallidas: ${total - successful}/${total}`);
    
    return results;
}

window.loadBusinessManagersManually = loadBusinessManagersManually;
window.loadPixelsManually = loadPixelsManually;
window.testPixelConnection = testPixelConnection;
window.testMultiplePixelConnections = testMultiplePixelConnections;
window.isPixelFunctionReady = isPixelFunctionReady;
window.executePixelFunction = executePixelFunction;
window.addPixelButton = addPixelButton;
window.setupPixelEventListeners = setupPixelEventListeners;

// Función de debugging específica para el problema actual
async function debugSharedAccountsRequest(pixelId = "942559264557282", accountId = "1368434687609518", businessId = "817343379608815") {
    console.log('\n🧪 DEBUG ESPECÍFICO: SHARED_ACCOUNTS REQUEST');
    console.log('='.repeat(60));
    
    try {
        // Obtener token EAAG
        const accessToken = getEAAGToken();
        console.log(`🔑 Token EAAG: ${accessToken ? accessToken.substring(0, 20) + '...' : 'NO ENCONTRADO'}`);
        
        if (!accessToken) {
            console.log('❌ No se puede continuar sin token EAAG');
            return;
        }
        
        // Preparar parámetros exactamente como en el código
        const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        const cleanAccountId = formattedId.replace('act_', '');
        
        console.log(`📊 Account ID original: ${accountId}`);
        console.log(`📊 Formatted ID: ${formattedId}`);
        console.log(`📊 Clean Account ID: ${cleanAccountId}`);
        console.log(`📊 Business ID: ${businessId}`);
        console.log(`📊 Píxel ID: ${pixelId}`);
        
        const sharedAccountsUrl = `https://graph.facebook.com/v17.0/${pixelId}/shared_accounts`;
        
        const params = {
            access_token: accessToken,
            business: businessId,
            account_id: cleanAccountId
        };
        
        console.log(`📡 URL: ${sharedAccountsUrl}`);
        console.log(`📊 Parámetros completos:`, params);
        console.log(`📊 URLSearchParams:`, new URLSearchParams(params).toString());
        
                 // Probar con fetch2 directamente
         try {
             console.log('\n🔄 Probando con fetch2...');
             
             const bodyString = Object.keys(params)
                 .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                 .join('&');
             
             console.log(`📊 Body string: ${bodyString}`);
             
             const response = await fetch2(sharedAccountsUrl, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/x-www-form-urlencoded',
                     'Accept': 'application/json'
                 },
                 credentials: 'include',
                 body: bodyString
             });
            
            console.log(`📈 Status: ${response.status}`);
            console.log(`📋 Respuesta completa:`, response.json);
            
            if (!response.json.error) {
                console.log('✅ ÉXITO: Píxel conectado correctamente');
            } else {
                console.log(`❌ ERROR: ${response.json.error.message}`);
                console.log(`📊 Error completo:`, response.json.error);
            }
            
        } catch (error) {
            console.error('❌ Error en fetch2:', error);
        }
        
        // Probar variaciones de parámetros
        console.log('\n🔄 Probando variaciones de parámetros...');
        
        // Variación 1: Sin business
        const params1 = {
            access_token: accessToken,
            account_id: cleanAccountId
        };
        
        console.log('\n📊 Variación 1 (sin business):');
        console.log('Parámetros:', params1);
        
                 try {
             const bodyString1 = Object.keys(params1)
                 .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params1[key])}`)
                 .join('&');
             
             const response1 = await fetch2(sharedAccountsUrl, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/x-www-form-urlencoded',
                     'Accept': 'application/json'
                 },
                 credentials: 'include',
                 body: bodyString1
             });
             
             console.log(`📈 Status: ${response1.status}`);
             console.log(`📋 Respuesta:`, response1.json);
             
             if (!response1.json.error) {
                 console.log('✅ ÉXITO Variación 1: Píxel conectado');
             } else {
                 console.log(`❌ ERROR Variación 1: ${response1.json.error.message}`);
             }
         } catch (error) {
             console.error('❌ Error variación 1:', error);
         }
         
         // Variación 2: Con act_ prefix
         const params2 = {
             access_token: accessToken,
             business: businessId,
             account_id: formattedId  // Con act_
         };
         
         console.log('\n📊 Variación 2 (con act_):');
         console.log('Parámetros:', params2);
         
         try {
             const bodyString2 = Object.keys(params2)
                 .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params2[key])}`)
                 .join('&');
             
             const response2 = await fetch2(sharedAccountsUrl, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/x-www-form-urlencoded',
                     'Accept': 'application/json'
                 },
                 credentials: 'include',
                 body: bodyString2
             });
             
             console.log(`📈 Status: ${response2.status}`);
             console.log(`📋 Respuesta:`, response2.json);
             
             if (!response2.json.error) {
                 console.log('✅ ÉXITO Variación 2: Píxel conectado');
             } else {
                 console.log(`❌ ERROR Variación 2: ${response2.json.error.message}`);
             }
         } catch (error) {
             console.error('❌ Error variación 2:', error);
         }
        
        console.log('\n💡 Para ejecutar: debugSharedAccountsRequest("PIXEL_ID", "ACCOUNT_ID", "BUSINESS_ID")');
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
    }
}

window.debugSharedAccountsRequest = debugSharedAccountsRequest;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    addPixelButton();
    setupPixelEventListeners();
});

window.addEventListener('load', () => {
    addPixelButton();
    setupPixelEventListeners();
});

// LIBS5 CLEAN v9 - SISTEMA DE PÍXELES COMPLETAMENTE LIMPIO ✅✅✅✅
// ====================================================================
// 
// 🔧 REPARACIONES CRÍTICAS v9 IMPLEMENTADAS:
// • ELIMINADOS COMPLETAMENTE: Todos los métodos que generaban píxeles falsos
// • SOLO GRAPH API: Únicamente usa endpoints oficiales de Facebook
// • MÚLTIPLES VERSIONES: Prueba v19.0, v18.0, v14.0 automáticamente
// • TOKEN EAAG: Extracción automática para máximos permisos
// • FUNCIÓN DE PRUEBA: testWithYourToken() con el token exacto del ejemplo
// • DEBUGGING AVANZADO: Logs detallados para identificar problemas
// 
// 🛠️ MÉTODOS DE DETECCIÓN DE PÍXELES (SOLO GRAPH API):
// 1. ★ Graph API v19.0 - MÉTODO PRINCIPAL ★
// 2. Graph API v18.0 - Fallback automático
// 3. Graph API v14.0 - Fallback final
// 4. Graph API /me/adspixels - Píxeles del usuario filtrados por BM
// 5. ❌ ELIMINADOS: Regex, DivinAdsPixelUtils, métodos HTML
// 
// 🛠️ MÉTODOS DE CONEXIÓN IMPLEMENTADOS (9 TOTAL):
// 1. Verificación previa - Comprobar si ya está conectado
// 2. Business Manager - Endpoint de asignación (con detección HTML)
// 3. Business Manager - Endpoint de vinculación de cuenta
// 4. Business Manager - Controlador de asignación directa  
// 5. Ads Manager - Endpoint específico de píxeles
// 6. GraphQL - Mutación directa con doc_id específico
// 7. Graph API - Con shared_accounts como fallback de permisos
// 8. ★ SHARED_ACCOUNTS - MÉTODO PRINCIPAL CON TOKEN EAAG ★
// 9. Facebook directo - Sin Business Manager para casos extremos
// 
// 🚀 MEJORAS CLAVE v9:
// • CÓDIGO LIMPIO: Eliminados TODOS los métodos que generaban píxeles falsos
// • SOLO GRAPH API: 100% endpoints oficiales de Facebook
// • MÚLTIPLES FALLBACKS: v19.0 → v18.0 → v14.0 → /me/adspixels
// • TOKEN EAAG: Extracción automática del HTML para máximos permisos
// • DEBUGGING COMPLETO: Logs detallados de cada intento y error
// • FUNCIÓN DE PRUEBA: testWithYourToken() para verificar funcionamiento
// 
// 📋 FUNCIONES PRINCIPALES:
// • getEAAGToken() - Extrae token EAAG del HTML de Facebook
// • getPixelsByBM() - USA GRAPH API v19.0 PARA PÍXELES REALES
// • testGraphAPIPixels() - Prueba el endpoint exacto que funciona
// • testMultipleGraphAPIVersions() - Prueba múltiples versiones
// • connectPixelToAccount() - 9 MÉTODOS CON SHARED_ACCOUNTS PRINCIPAL
// • executePixelFunction() - Ejecuta conexión usando método optimizado
// 
// 🧪 FUNCIONES DE DEBUG NUEVAS:
// • testGraphAPIPixels(bmId, token) - Prueba endpoint exacto
// • testWithYourToken(bmId) - Prueba con el token del ejemplo
// • testMultipleGraphAPIVersions(bmId, token) - Prueba múltiples versiones
// • debugPixelDetection(bmId) - Debug detallado de detección
// • generatePermissionsReport() - Reporte completo de permisos
// 
// 💡 PARA USAR:
// 1. Cargar BMs con el botón "Cargar BMs"
// 2. Seleccionar un Business Manager
// 3. Cargar píxeles con "Cargar Píxeles" (ahora con Graph API v19.0 REAL)
// 4. Seleccionar múltiples píxeles REALES con Ctrl+Click
// 5. Seleccionar cuentas en la tabla principal
// 6. Presionar "Iniciar" para conectar (usa shared_accounts automáticamente)
//
// 🎯 MÉTODO SHARED_ACCOUNTS: El mismo que funciona en tu archivo original
// 🔑 TOKEN EAAG: Extraído automáticamente para máximos permisos
// 🏆 PÍXELES REALES: Graph API v19.0 devuelve IDs reales como tu ejemplo
// 📊 EJEMPLO RESPUESTA: {"data":[{"id":"1007073837987160"},{"id":"668934689318101"}]}
// CÓDIGO LIMPIO GARANTIZADO - NO COMPRIMIR 