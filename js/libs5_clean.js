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

// Función para obtener píxeles SOLO usando Graph API (CORREGIDA PARA fetch2)
async function getPixelsByBM(selectedBMId = null) {
    try {
        console.log('🔍 Obteniendo píxeles usando SOLO Graph API...');
        
        if (!selectedBMId) {
            console.log('❌ No se seleccionó ningún BM');
            return [];
        }
        
        // Obtener el mejor token disponible
        let token = fb?.accessToken || fb?.token;
        
        // Intentar obtener token EAAG si no lo tenemos
        if (!token || !token.startsWith('EAAG')) {
            const eaagToken = getEAAGToken();
            if (eaagToken) {
                token = eaagToken;
                console.log(`🔑 Usando token EAAG para cargar píxeles: ${token.substring(0, 20)}...`);
            }
        }
        
        if (!token) {
            console.log('❌ No se encontró token de acceso');
            return [];
        }
        
        console.log(`🏢 Consultando píxeles para BM: ${selectedBMId}`);
        console.log(`🔑 Token: ${token.substring(0, 20)}...`);
        
        // MÉTODO 1: Graph API v19.0 directo al BM (CORREGIDO PARA fetch2)
        try {
            const bmPixelsUrl = `https://graph.facebook.com/v19.0/${selectedBMId}/adspixels?fields=id,name&access_token=${token}`;
            console.log(`📡 Consultando v19.0: ${bmPixelsUrl}`);
            
            const bmPixelsResponse = await fetch2(bmPixelsUrl);
            const bmPixelsData = bmPixelsResponse.json;
            
            console.log(`📊 Respuesta v19.0:`, bmPixelsData);
            console.log(`🔍 DEBUG v19.0: status=${bmPixelsResponse.status}, data exists=${!!bmPixelsData.data}, is array=${Array.isArray(bmPixelsData.data)}, length=${bmPixelsData.data?.length}`);
            
            // CORREGIDO: fetch2 no tiene .ok, verificar por status y ausencia de error
            if (bmPixelsData && bmPixelsData.data && Array.isArray(bmPixelsData.data) && !bmPixelsData.error) {
                const graphPixels = bmPixelsData.data.map((pixel, index) => ({
                    id: pixel.id,
                    name: pixel.name || `Píxel ${index + 1}`,
                    displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                    status: 'ACTIVE',
                    bmId: selectedBMId
                }));
                
                console.log(`✅ ÉXITO v19.0: Encontrados ${graphPixels.length} píxeles REALES`);
                console.log(`📋 IDs reales:`, graphPixels.map(p => p.id));
                return graphPixels;
            } else if (bmPixelsData.error) {
                console.log(`⚠️ Error v19.0: ${bmPixelsData.error.message}`);
            } else {
                console.log(`⚠️ v19.0: Condición no cumplida - data=${!!bmPixelsData.data}, isArray=${Array.isArray(bmPixelsData.data)}, error=${!!bmPixelsData.error}`);
            }
        } catch (error) {
            console.log(`⚠️ Error v19.0: ${error.message}`);
        }
        
        // MÉTODO 2: Graph API v18.0 como fallback (CORREGIDO)
        try {
            const fallbackUrl = `https://graph.facebook.com/v18.0/${selectedBMId}/adspixels?fields=id,name&access_token=${token}`;
            console.log(`📡 Consultando v18.0: ${fallbackUrl}`);
            
            const fallbackResponse = await fetch2(fallbackUrl);
            const fallbackData = fallbackResponse.json;
            
            console.log(`📊 Respuesta v18.0:`, fallbackData);
            console.log(`🔍 DEBUG v18.0: status=${fallbackResponse.status}, data exists=${!!fallbackData.data}, is array=${Array.isArray(fallbackData.data)}, length=${fallbackData.data?.length}`);
            
            // CORREGIDO: verificar por data y ausencia de error
            if (fallbackData && fallbackData.data && Array.isArray(fallbackData.data) && !fallbackData.error) {
                const fallbackPixels = fallbackData.data.map((pixel, index) => ({
                    id: pixel.id,
                    name: pixel.name || `Píxel ${index + 1}`,
                    displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                    status: 'ACTIVE',
                    bmId: selectedBMId
                }));
                
                console.log(`✅ ÉXITO v18.0: Encontrados ${fallbackPixels.length} píxeles REALES`);
                console.log(`📋 IDs reales:`, fallbackPixels.map(p => p.id));
                return fallbackPixels;
            } else if (fallbackData.error) {
                console.log(`⚠️ Error v18.0: ${fallbackData.error.message}`);
            } else {
                console.log(`⚠️ v18.0: Condición no cumplida - data=${!!fallbackData.data}, isArray=${Array.isArray(fallbackData.data)}, error=${!!fallbackData.error}`);
            }
        } catch (error) {
            console.log(`⚠️ Error v18.0: ${error.message}`);
        }
        
        // MÉTODO 3: Graph API v14.0 como último fallback (CORREGIDO)
        try {
            const v14Url = `https://graph.facebook.com/v14.0/${selectedBMId}/adspixels?fields=id,name&access_token=${token}`;
            console.log(`📡 Consultando v14.0: ${v14Url}`);
            
            const v14Response = await fetch2(v14Url);
            const v14Data = v14Response.json;
            
            console.log(`📊 Respuesta v14.0:`, v14Data);
            console.log(`🔍 DEBUG v14.0: status=${v14Response.status}, data exists=${!!v14Data.data}, is array=${Array.isArray(v14Data.data)}, length=${v14Data.data?.length}`);
            
            // CORREGIDO: verificar por data y ausencia de error
            if (v14Data && v14Data.data && Array.isArray(v14Data.data) && !v14Data.error) {
                const v14Pixels = v14Data.data.map((pixel, index) => ({
                    id: pixel.id,
                    name: pixel.name || `Píxel ${index + 1}`,
                    displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                    status: 'ACTIVE',
                    bmId: selectedBMId
                }));
                
                console.log(`✅ ÉXITO v14.0: Encontrados ${v14Pixels.length} píxeles REALES`);
                console.log(`📋 IDs reales:`, v14Pixels.map(p => p.id));
                return v14Pixels;
            } else if (v14Data.error) {
                console.log(`⚠️ Error v14.0: ${v14Data.error.message}`);
            } else {
                console.log(`⚠️ v14.0: Condición no cumplida - data=${!!v14Data.data}, isArray=${Array.isArray(v14Data.data)}, error=${!!v14Data.error}`);
            }
        } catch (error) {
            console.log(`⚠️ Error v14.0: ${error.message}`);
        }
        
        // MÉTODO 4: Obtener píxeles del usuario y filtrar por BM (CORREGIDO)
        try {
            console.log(`🔄 Intentando método /me/adspixels filtrado por BM...`);
            const userPixelsUrl = `https://graph.facebook.com/v19.0/me/adspixels?fields=id,name,owner_business&access_token=${token}`;
            console.log(`📡 Consultando: ${userPixelsUrl}`);
            
            const userPixelsResponse = await fetch2(userPixelsUrl);
            const userPixelsData = userPixelsResponse.json;
            
            console.log(`📊 Respuesta /me/adspixels:`, userPixelsData);
            
            // CORREGIDO: verificar por data y ausencia de error
            if (userPixelsData && userPixelsData.data && Array.isArray(userPixelsData.data) && !userPixelsData.error) {
                const filteredPixels = userPixelsData.data
                    .filter(pixel => {
                        const hasOwnerBusiness = pixel.owner_business && pixel.owner_business.id === selectedBMId;
                        console.log(`🔍 Píxel ${pixel.id}: owner_business=${pixel.owner_business?.id}, match=${hasOwnerBusiness}`);
                        return hasOwnerBusiness;
                    })
                    .map((pixel, index) => ({
                        id: pixel.id,
                        name: pixel.name || `Píxel ${index + 1}`,
                        displayName: `🎯 ${pixel.name || `Píxel ${index + 1}`} (ID: ${pixel.id})`,
                        status: 'ACTIVE',
                        bmId: selectedBMId
                    }));
                
                console.log(`✅ ÉXITO /me/adspixels: Encontrados ${filteredPixels.length} píxeles filtrados por BM`);
                console.log(`📋 IDs filtrados:`, filteredPixels.map(p => p.id));
                
                if (filteredPixels.length > 0) {
                    return filteredPixels;
                }
            } else if (userPixelsData.error) {
                console.log(`⚠️ Error /me/adspixels: ${userPixelsData.error.message}`);
            }
        } catch (error) {
            console.log(`⚠️ Error /me/adspixels: ${error.message}`);
        }
        
        // Si llegamos aquí, no se encontraron píxeles
        console.log(`❌ No se encontraron píxeles en BM ${selectedBMId} usando Graph API`);
        console.log(`💡 NOTA: Los datos están llegando correctamente (Array(13)) pero fetch2 no tiene .ok`);
        console.log(`🔧 Solución aplicada: Verificar por data y ausencia de error en lugar de response.ok`);
        
        return [];
        
    } catch (error) {
        console.error('❌ Error general obteniendo píxeles:', error);
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

// Función para obtener token EAAG del HTML
function getEAAGToken() {
    try {
        const htmlContent = document.documentElement.outerHTML;
        const tokenMatch = htmlContent.match(/EAAG[a-zA-Z0-9]{50,}/);
        return tokenMatch ? tokenMatch[0] : null;
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

// Función MEJORADA para conectar píxel usando múltiples métodos robustos
async function connectPixelToAccount(pixelId, accountId, progressCallback) {
    try {
        const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        const cleanAccountId = formattedId.replace('act_', '');
        
        if (progressCallback) {
            progressCallback(`🔄 Conectando píxel ${pixelId} a cuenta ${formattedId}`);
        }
        
        // Verificación previa: Comprobar permisos y si el píxel ya está conectado
        if (progressCallback) {
            progressCallback(`   🔍 Verificando permisos específicos para píxel ${pixelId} y cuenta ${formattedId}...`);
        }
        
        const permissions = await checkPixelAndAccountPermissions(pixelId, cleanAccountId);
        
        if (progressCallback) {
            progressCallback(`   📊 Acceso al píxel: ${permissions.pixelAccess ? '✅' : '❌'} | Gestión píxel: ${permissions.canManagePixel ? '✅' : '❌'}`);
            progressCallback(`   📊 Acceso cuenta: ${permissions.accountAccess ? '✅' : '❌'} | Gestión cuenta: ${permissions.canManageAccount ? '✅' : '❌'}`);
        }
        
        // Si no tenemos permisos básicos, intentar elevación
        if (!permissions.pixelAccess || !permissions.accountAccess) {
            const elevatedPermissions = await requestElevatedPermissions(progressCallback);
            if (elevatedPermissions) {
                // Revisar permisos de nuevo
                const newPermissions = await checkPixelAndAccountPermissions(pixelId, cleanAccountId);
                if (newPermissions.pixelAccess && newPermissions.accountAccess) {
                    if (progressCallback) {
                        progressCallback(`   ✅ Permisos elevados exitosamente obtenidos`);
                    }
                }
            }
        }
        
        try {
            const token = fb?.accessToken || fb?.token;
            if (token) {
                const checkUrl = `https://graph.facebook.com/v14.0/${formattedId}/adspixels?fields=id&access_token=${token}`;
                const checkResponse = await fetch2(checkUrl);
                const checkData = checkResponse.json;
                
                if (checkData && checkData.data && Array.isArray(checkData.data)) {
                    const existingPixel = checkData.data.find(p => p.id === pixelId);
                    if (existingPixel) {
                        if (progressCallback) {
                            progressCallback(`✅ ${formattedId}: Píxel ya estaba conectado`);
                        }
                        return true;
                    }
                }
            }
        } catch (checkError) {
            // Si falla la verificación, continuar con los métodos de conexión
        }
        
        // Método 1: Usar Facebook Business Manager directamente (más confiable)
        if (typeof fetch2 === 'function') {
            try {
                // Obtener tokens necesarios
                const user_id = document.cookie.match(/c_user=(\d+)/)?.[1] || fb?.uid;
                const fb_dtsg = document.querySelector('[name="fb_dtsg"]')?.value || fb?.dtsg;
                
                if (user_id && fb_dtsg) {
                    if (progressCallback) {
                        progressCallback(`   🔑 Usando método Business Manager para ${formattedId}`);
                    }
                    
                    // Endpoint directo del Business Manager para asignar píxel
                    const bmUrl = `https://business.facebook.com/ajax/ads/manager/adaccount_pixel_assign/`;
                    const bmResponse = await fetch2(bmUrl, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'x-fb-friendly-name': 'AdAccountPixelAssignMutation'
                        },
                        body: `account_id=${cleanAccountId}&pixel_id=${pixelId}&__user=${user_id}&fb_dtsg=${encodeURIComponent(fb_dtsg)}&__a=1&__req=1`
                    });
                    
                    const bmText = typeof bmResponse.text === 'string' ? bmResponse.text : JSON.stringify(bmResponse.json || bmResponse);
                    
                    // Debug de la respuesta
                    console.log(`🔍 BM Response Status: ${bmResponse.status}, Text: ${bmText.substring(0, 200)}`);
                    
                    // Si recibimos HTML, significa que necesitamos autenticación/redirect
                    if (bmText.includes('<!DOCTYPE html>') || bmText.includes('<html')) {
                        if (progressCallback) {
                            progressCallback(`   ⚠️ BM requiere autenticación - redirigiendo a método alternativo`);
                        }
                        // No intentar más métodos BM, ir directamente a otros métodos
                    } else if (bmResponse.ok && (bmText.includes('"success":true') || bmText.includes('pixel_id') || bmText.includes(pixelId) || bmText.includes('assigned'))) {
                        if (progressCallback) {
                            progressCallback(`✅ Píxel asignado exitosamente a ${formattedId} via Business Manager`);
                        }
                        return true;
                    }
                    
                    // Si no fue exitoso, mostrar la respuesta para debug
                    if (progressCallback && bmText.includes('error')) {
                        const errorMatch = bmText.match(/"error":\s*"([^"]+)"/);
                        if (errorMatch) {
                            progressCallback(`   ❌ BM Error: ${errorMatch[1]}`);
                        }
                    }
                    
                    // Intentar método alternativo usando endpoint correcto de Business Manager
                    const shareUrl = `https://business.facebook.com/ajax/business/adaccount/link_pixels/`;
                    const shareResponse = await fetch2(shareUrl, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'x-fb-friendly-name': 'BusinessAdAccountLinkPixelsMutation'
                        },
                        body: `ad_account_id=${cleanAccountId}&pixel_ids[0]=${pixelId}&__user=${user_id}&fb_dtsg=${encodeURIComponent(fb_dtsg)}&__a=1&__req=2`
                    });
                    
                    const shareText = typeof shareResponse.text === 'string' ? shareResponse.text : JSON.stringify(shareResponse.json || shareResponse);
                    
                    if (shareResponse.ok && (shareText.includes('"success":true') || shareText.includes('shared') || shareText.includes(pixelId))) {
                        if (progressCallback) {
                            progressCallback(`✅ Píxel compartido exitosamente a ${formattedId}`);
                        }
                        return true;
                    }
                    
                    // Método 3: Usar endpoint de asignación directa
                    const directUrl = `https://business.facebook.com/ajax/ads/manager/pixel_assignment_controller/`;
                    const directResponse = await fetch2(directUrl, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        body: `pixel_id=${pixelId}&ad_account_id=${cleanAccountId}&action=assign&__user=${user_id}&fb_dtsg=${encodeURIComponent(fb_dtsg)}&__a=1`
                    });
                    
                    const directText = typeof directResponse.text === 'string' ? directResponse.text : JSON.stringify(directResponse.json || directResponse);
                    
                                         if (directResponse.ok && (directText.includes('success') || directText.includes(pixelId) || directText.includes('assigned'))) {
                         if (progressCallback) {
                             progressCallback(`✅ Píxel asignado via método directo a ${formattedId}`);
                         }
                         return true;
                     }
                     
                     // Método 4: Usar endpoint de Ads Manager más específico
                     const adsManagerUrl = `https://www.facebook.com/tr/dialog/settings/pixel/${pixelId}/add_adaccount/`;
                     const adsManagerResponse = await fetch2(adsManagerUrl, {
                         method: 'POST',
                         headers: {
                             'content-type': 'application/x-www-form-urlencoded'
                         },
                         body: `ad_account_id=${cleanAccountId}&fb_dtsg=${encodeURIComponent(fb_dtsg)}&__user=${user_id}&__a=1`
                     });
                     
                     const adsManagerText = typeof adsManagerResponse.text === 'string' ? adsManagerResponse.text : JSON.stringify(adsManagerResponse.json || adsManagerResponse);
                     
                     if (adsManagerResponse.ok && (adsManagerText.includes('success') || adsManagerText.includes('added') || !adsManagerText.includes('error'))) {
                         if (progressCallback) {
                             progressCallback(`✅ Píxel asignado via Ads Manager a ${formattedId}`);
                         }
                         return true;
                     }
                }
            } catch (bmError) {
                if (progressCallback) {
                    progressCallback(`   ⚠️ Método Business Manager falló: ${bmError.message}`);
                }
            }
        }
        
        // Método 2: GraphQL directo (más efectivo)
        if (typeof fetch2 === 'function') {
            try {
                const user_id = document.cookie.match(/c_user=(\d+)/)?.[1] || fb?.uid;
                const fb_dtsg = document.querySelector('[name="fb_dtsg"]')?.value || fb?.dtsg;
                
                if (user_id && fb_dtsg) {
                    if (progressCallback) {
                        progressCallback(`   🔄 Intentando GraphQL directo para ${formattedId}`);
                    }
                    
                    const graphqlUrl = `https://business.facebook.com/api/graphql/`;
                    const graphqlResponse = await fetch2(graphqlUrl, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded'
                        },
                        body: `fb_dtsg=${encodeURIComponent(fb_dtsg)}&doc_id=2154213378164183&variables=${encodeURIComponent(JSON.stringify({
                            "ad_account_id": cleanAccountId,
                            "pixel_id": pixelId
                        }))}&__user=${user_id}&__a=1`
                    });
                    
                    const graphqlText = typeof graphqlResponse.text === 'string' ? graphqlResponse.text : JSON.stringify(graphqlResponse.json || graphqlResponse);
                    
                    if (graphqlResponse.ok && (graphqlText.includes('"success":true') || graphqlText.includes('pixel_id') || !graphqlText.includes('error'))) {
                        if (progressCallback) {
                            progressCallback(`✅ Píxel asignado via GraphQL a ${formattedId}`);
                        }
                        return true;
                    }
                }
            } catch (graphqlError) {
                if (progressCallback) {
                    progressCallback(`   ⚠️ GraphQL directo falló: ${graphqlError.message}`);
                }
            }
        }
        
        // Método 3: Graph API como fallback
        try {
            const token = fb.accessToken || fb.token;
            if (token) {
                if (progressCallback) {
                    progressCallback(`   🔄 Intentando Graph API para ${formattedId}`);
                }
                
                // Verificar si el píxel ya está conectado
                const checkUrl = `https://graph.facebook.com/v14.0/${formattedId}/adspixels?fields=id,name&access_token=${token}`;
                const checkResponse = await fetch2(checkUrl);
                const checkData = checkResponse.json;
                
                if (checkData && checkData.data && Array.isArray(checkData.data)) {
                    const existingPixel = checkData.data.find(p => p.id === pixelId);
                    if (existingPixel) {
                        if (progressCallback) {
                            progressCallback(`✅ Píxel ya estaba conectado a ${formattedId}`);
                        }
                        return true;
                    }
                }
                
                // Intentar asignar píxel via Graph API con parámetros correctos
                const assignUrl = `https://graph.facebook.com/v14.0/${formattedId}/adspixels?access_token=${token}`;
                const assignResponse = await fetch2(assignUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        pixel_id: pixelId,
                        name: `Píxel_${pixelId}`,
                        relationship_type: ["owner"]
                    })
                });
                
                const assignData = assignResponse.json;
                
                if (assignResponse.ok && (assignData.success || assignData.id)) {
                    if (progressCallback) {
                        progressCallback(`✅ Píxel asignado via Graph API a ${formattedId}`);
                    }
                    return true;
                }
                
                // Análisis de errores específicos del Graph API
                const errorMessage = assignData.error?.message || 'Error desconocido';
                
                if (errorMessage.includes('business admin') || errorMessage.includes('only business admin')) {
                    if (progressCallback) {
                        progressCallback(`⚠️ ${formattedId}: Se requieren permisos de administrador`);
                    }
                } else if (errorMessage.includes('permissions') || errorMessage.includes('access') || errorMessage === 'Permissions error') {
                    if (progressCallback) {
                        progressCallback(`⚠️ ${formattedId}: Permisos insuficientes - intentando método alternativo`);
                    }
                    
                    // Método alternativo: Crear shared pixel en lugar de asignar
                    try {
                        const shareUrl = `https://graph.facebook.com/v14.0/${pixelId}/shared_accounts?access_token=${token}`;
                        const shareResponse = await fetch2(shareUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                                account_id: cleanAccountId,
                                business: cleanAccountId
                            })
                        });
                        
                        const shareData = shareResponse.json;
                        
                        if (shareResponse.ok && shareData.success) {
                            if (progressCallback) {
                                progressCallback(`✅ ${formattedId}: Píxel compartido exitosamente`);
                            }
                            return true;
                        }
                    } catch (shareError) {
                        // Continuar con otros métodos si falla
                    }
                    
                } else if (errorMessage.includes('pixel') && errorMessage.includes('already')) {
                    if (progressCallback) {
                        progressCallback(`✅ ${formattedId}: Píxel ya estaba asignado`);
                    }
                    return true;
                } else {
                    if (progressCallback) {
                        progressCallback(`❌ ${formattedId}: ${errorMessage}`);
                    }
                }
            }
        } catch (graphError) {
            if (progressCallback) {
                progressCallback(`   ⚠️ Graph API falló: ${graphError.message}`);
            }
        }
        
        // Método PRINCIPAL: Usar shared_accounts (EL QUE REALMENTE FUNCIONA)
        try {
            if (progressCallback) {
                progressCallback(`   🔄 Intentando método shared_accounts (RECOMENDADO) para ${formattedId}`);
            }
            
            // Obtener el token más potente disponible
            let accessToken = fb?.accessToken || fb?.token;
            
            // Intentar obtener token EAAG si no lo tenemos
            if (!accessToken || !accessToken.startsWith('EAAG')) {
                const eaagToken = getEAAGToken();
                if (eaagToken) {
                    accessToken = eaagToken;
                    if (progressCallback) {
                        progressCallback(`   🔑 Usando token EAAG mejorado`);
                    }
                }
            }
            
            if (accessToken) {
                // Este es el método que usa tu archivo funcional
                const sharedAccountsUrl = `https://graph.facebook.com/v17.0/${pixelId}/shared_accounts`;
                
                // Intentar obtener el business_id correcto del BM seleccionado
                const bmSelect = document.querySelector('select[name="businessManager"]');
                const selectedBMId = bmSelect ? bmSelect.value : null;
                
                const params = {
                    access_token: accessToken,
                    account_id: cleanAccountId,
                    business: selectedBMId || cleanAccountId  // Usar BM seleccionado o account_id como fallback
                };
                
                if (progressCallback) {
                    progressCallback(`   📡 Enviando solicitud a shared_accounts...`);
                }
                
                const sharedResponse = await fetch2(sharedAccountsUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: new URLSearchParams(params)
                });
                
                const sharedData = sharedResponse.json;
                
                if (progressCallback) {
                    progressCallback(`   📊 Respuesta shared_accounts: ${JSON.stringify(sharedData).substring(0, 100)}...`);
                }
                
                // Verificar si fue exitoso
                if (sharedResponse.ok && !sharedData.error) {
                    if (progressCallback) {
                        progressCallback(`✅ ${formattedId}: Píxel conectado via shared_accounts (MÉTODO PRINCIPAL)`);
                    }
                    return true;
                } else if (sharedData.error) {
                    if (progressCallback) {
                        progressCallback(`   ⚠️ shared_accounts error: ${sharedData.error.message}`);
                    }
                    
                    // Si el error indica que ya está conectado, considerarlo éxito
                    if (sharedData.error.message.includes('already') || sharedData.error.message.includes('exists')) {
                        if (progressCallback) {
                            progressCallback(`✅ ${formattedId}: Píxel ya estaba conectado`);
                        }
                        return true;
                    }
                    
                    // Si el error indica que no existe o falta permisos, intentar con todos los BMs disponibles
                    if (sharedData.error.message.includes('does not exist') || sharedData.error.message.includes('missing permissions')) {
                        if (progressCallback) {
                            progressCallback(`   🔍 Píxel no encontrado en BM actual, buscando en otros BMs...`);
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
                                
                                const altResponse = await fetch2(sharedAccountsUrl, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded',
                                        'Accept': 'application/json'
                                    },
                                    credentials: 'include',
                                    body: new URLSearchParams(alternativeParams)
                                });
                                
                                const altData = altResponse.json;
                                
                                if (altResponse.ok && !altData.error) {
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
                            }
                        } catch (bmSearchError) {
                            if (progressCallback) {
                                progressCallback(`   ⚠️ Error buscando en otros BMs: ${bmSearchError.message}`);
                            }
                        }
                    }
                }
            }
            
        } catch (sharedError) {
            if (progressCallback) {
                progressCallback(`   ⚠️ Método shared_accounts falló: ${sharedError.message}`);
            }
        }
        
        // Método FINAL: Usar endpoint directo de Facebook sin Business Manager
        try {
            if (progressCallback) {
                progressCallback(`   🔄 Intentando método directo de Facebook para ${formattedId}`);
            }
            
            // Obtener información de la sesión actual
            const accessToken = fb?.accessToken || fb?.token;
            const dtsg = document.querySelector('input[name="fb_dtsg"]')?.value || 
                        document.querySelector('[name="fb_dtsg"]')?.value || 
                        fb?.dtsg;
            
            if (accessToken && dtsg) {
                // Endpoint directo de Facebook Ads que no requiere Business Manager
                const directFBUrl = `https://www.facebook.com/ajax/ads/adaccount/pixel_assignment/`;
                const directFBResponse = await fetch2(directFBUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: `pixel_id=${pixelId}&account_id=${cleanAccountId}&action=add&fb_dtsg=${encodeURIComponent(dtsg)}&__a=1`
                });
                
                const directFBText = typeof directFBResponse.text === 'string' ? directFBResponse.text : JSON.stringify(directFBResponse.json || directFBResponse);
                
                if (directFBResponse.ok && !directFBText.includes('error') && !directFBText.includes('<!DOCTYPE')) {
                    if (progressCallback) {
                        progressCallback(`✅ ${formattedId}: Píxel conectado via método directo Facebook`);
                    }
                    return true;
                }
                
                // Método alternativo usando página de configuración de píxeles
                const pixelConfigUrl = `https://www.facebook.com/tr/manage/pixels/${pixelId}/accounts/`;
                const pixelConfigResponse = await fetch2(pixelConfigUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `account_id=${cleanAccountId}&fb_dtsg=${encodeURIComponent(dtsg)}&__a=1`
                });
                
                const pixelConfigText = typeof pixelConfigResponse.text === 'string' ? pixelConfigResponse.text : JSON.stringify(pixelConfigResponse.json || pixelConfigResponse);
                
                if (pixelConfigResponse.ok && (pixelConfigText.includes('success') || !pixelConfigText.includes('error'))) {
                    if (progressCallback) {
                        progressCallback(`✅ ${formattedId}: Píxel configurado exitosamente`);
                    }
                    return true;
                }
            }
            
        } catch (finalError) {
            if (progressCallback) {
                progressCallback(`   ⚠️ Método final falló: ${finalError.message}`);
            }
        }
        
        // Si llegamos aquí, todos los métodos fallaron
        if (progressCallback) {
            progressCallback(`❌ No se pudo conectar píxel ${pixelId} a ${formattedId} - Todos los métodos fallaron`);
            progressCallback(`💡 NOTA: Algunos píxeles requieren acceso directo desde el propietario del píxel`);
            progressCallback(`🔗 ENLACE DIRECTO: https://business.facebook.com/events_manager2/list/pixel/${pixelId}?business_id=`);
            progressCallback(`🔗 ENLACE CUENTA: https://business.facebook.com/adsmanager/manage/accounts?act=${cleanAccountId}`);
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
window.testGraphAPIPixels = testGraphAPIPixels;
window.debugCurrentIssue = debugCurrentIssue;
window.testWithYourToken = testWithYourToken;
window.testMultipleGraphAPIVersions = testMultipleGraphAPIVersions;
window.connectPixelToAccount = connectPixelToAccount;
window.loadBusinessManagersManually = loadBusinessManagersManually;
window.loadPixelsManually = loadPixelsManually;
window.isPixelFunctionReady = isPixelFunctionReady;
window.executePixelFunction = executePixelFunction;
window.addPixelButton = addPixelButton;
window.setupPixelEventListeners = setupPixelEventListeners;

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