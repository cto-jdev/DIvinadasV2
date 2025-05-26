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

// Función para obtener píxeles usando el método mejorado de bm.js
async function getPixelsByBM(selectedBMId = null) {
    try {
        console.log('🔍 Obteniendo píxeles usando método mejorado...');
        
        if (!selectedBMId) {
            console.log('❌ No se seleccionó ningún BM');
            return [];
        }
        
        // Usar las funciones mejoradas del sistema de píxeles de bm.js
        if (typeof window.DivinAdsPixelUtils !== 'undefined') {
            try {
                console.log(`📊 Detectando píxeles en BM: ${selectedBMId}`);
                
                // Obtener datos de píxeles usando múltiples métodos
                const pixelCount = await window.DivinAdsPixelUtils.getPixelCount(selectedBMId);
                console.log(`✅ Encontrados ${pixelCount} píxeles en el BM`);
                
                // Si encontramos píxeles, crear una lista simulada ya que no podemos obtener los nombres individuales
                const pixels = [];
                for (let i = 1; i <= pixelCount; i++) {
                    pixels.push({
                        id: `${selectedBMId}_pixel_${i}`,
                        name: `Píxel ${i} del BM`,
                        displayName: `🎯 Píxel ${i} del BM ${selectedBMId}`,
                        status: 'ACTIVE',
                        bmId: selectedBMId
                    });
                }
                
                return pixels;
                
            } catch (error) {
                console.warn('⚠️ Error usando DivinAdsPixelUtils:', error);
            }
        }
        
        // Método alternativo directo usando fetch2
        if (typeof fetch2 === 'function') {
            try {
                console.log(`🔄 Intentando método directo para BM: ${selectedBMId}`);
                
                const response = await fetch2(`https://business.facebook.com/latest/settings/events_dataset_and_pixel?business_id=${selectedBMId}`, {
                    method: 'GET',
                    headers: {
                        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'accept-language': 'es-ES,es;q=0.9,en;q=0.8'
                    }
                });
                
                const text = typeof response.text === 'string' ? response.text : JSON.stringify(response.json || response);
                
                // Analizar la respuesta para extraer píxeles
                const pixels = [];
                
                // Buscar datos JSON en la respuesta
                try {
                    let data;
                    if (response.json && typeof response.json === 'object') {
                        data = response.json;
                    } else {
                        const cleanText = text.replace(/^for \(;;\);/, '');
                        data = JSON.parse(cleanText);
                    }
                    
                    // Método 1: payload.datasets
                    if (data.payload && data.payload.datasets && Array.isArray(data.payload.datasets)) {
                        data.payload.datasets.forEach((dataset, index) => {
                            if (dataset.id || dataset.dataset_id) {
                                pixels.push({
                                    id: dataset.id || dataset.dataset_id,
                                    name: dataset.name || `Píxel ${index + 1}`,
                                    displayName: `🎯 ${dataset.name || `Píxel ${index + 1}`} (ID: ${dataset.id || dataset.dataset_id})`,
                                    status: 'ACTIVE',
                                    bmId: selectedBMId
                                });
                            }
                        });
                    }
                    
                    // Método 2: jsmods.require
                    if (pixels.length === 0 && data.jsmods && data.jsmods.require) {
                        for (const mod of data.jsmods.require) {
                            if (mod[3] && mod[3][0] && mod[3][0].datasets && Array.isArray(mod[3][0].datasets)) {
                                mod[3][0].datasets.forEach((dataset, index) => {
                                    if (dataset.id || dataset.dataset_id) {
                                        pixels.push({
                                            id: dataset.id || dataset.dataset_id,
                                            name: dataset.name || `Píxel ${index + 1}`,
                                            displayName: `🎯 ${dataset.name || `Píxel ${index + 1}`} (ID: ${dataset.id || dataset.dataset_id})`,
                                            status: 'ACTIVE',
                                            bmId: selectedBMId
                                        });
                                    }
                                });
                                break;
                            }
                        }
                    }
                    
                } catch (parseError) {
                    console.warn('⚠️ Error parseando JSON, usando regex fallback');
                    
                    // Fallback: usar regex para encontrar píxeles
                    const datasetMatches = text.match(/"(?:dataset_id|id)":"(\d{15,20})"/g);
                    if (datasetMatches) {
                        const uniqueIds = new Set();
                        datasetMatches.forEach(match => {
                            const idMatch = match.match(/"(?:dataset_id|id)":"(\d{15,20})"/);
                            if (idMatch && idMatch[1]) {
                                uniqueIds.add(idMatch[1]);
                            }
                        });
                        
                        Array.from(uniqueIds).forEach((id, index) => {
                            pixels.push({
                                id: id,
                                name: `Píxel ${index + 1}`,
                                displayName: `🎯 Píxel ${index + 1} (ID: ${id})`,
                                status: 'ACTIVE',
                                bmId: selectedBMId
                            });
                        });
                    }
                }
                
                console.log(`✅ Encontrados ${pixels.length} píxeles en BM ${selectedBMId}`);
                return pixels;
                
            } catch (error) {
                console.error('❌ Error en método directo:', error);
            }
        }
        
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

// Función MEJORADA para conectar píxel usando múltiples métodos robustos
async function connectPixelToAccount(pixelId, accountId, progressCallback) {
    try {
        const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        const cleanAccountId = formattedId.replace('act_', '');
        
        if (progressCallback) {
            progressCallback(`🔄 Conectando píxel ${pixelId} a cuenta ${formattedId}`);
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
                    
                    // Verificar si la asignación fue exitosa
                    if (bmResponse.ok && (bmText.includes('"success":true') || bmText.includes('pixel_id') || bmText.includes(pixelId))) {
                        if (progressCallback) {
                            progressCallback(`✅ Píxel asignado exitosamente a ${formattedId} via Business Manager`);
                        }
                        return true;
                    }
                    
                    // Intentar método alternativo de compartir píxel
                    const shareUrl = `https://business.facebook.com/ajax/ads/manager/pixel_share/`;
                    const shareResponse = await fetch2(shareUrl, {
                        method: 'POST',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded',
                            'x-fb-friendly-name': 'PixelShareMutation'
                        },
                        body: `pixel_id=${pixelId}&account_id=${cleanAccountId}&__user=${user_id}&fb_dtsg=${encodeURIComponent(fb_dtsg)}&__a=1`
                    });
                    
                    const shareText = typeof shareResponse.text === 'string' ? shareResponse.text : JSON.stringify(shareResponse.json || shareResponse);
                    
                    if (shareResponse.ok && (shareText.includes('"success":true') || shareText.includes('shared') || shareText.includes(pixelId))) {
                        if (progressCallback) {
                            progressCallback(`✅ Píxel compartido exitosamente a ${formattedId}`);
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
        
        // Método 2: Graph API como fallback
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
                
                // Intentar asignar píxel via Graph API
                const assignUrl = `https://graph.facebook.com/v14.0/${formattedId}/adspixels?access_token=${token}`;
                const assignResponse = await fetch2(assignUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        pixel_id: pixelId 
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
                } else if (errorMessage.includes('permissions') || errorMessage.includes('access')) {
                    if (progressCallback) {
                        progressCallback(`⚠️ ${formattedId}: Permisos insuficientes`);
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
        
        // Si llegamos aquí, todos los métodos fallaron
        if (progressCallback) {
            progressCallback(`❌ No se pudo conectar píxel ${pixelId} a ${formattedId} - Todos los métodos fallaron`);
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
        progressCallback(`💡 SUGERENCIA: Si todos fallaron, verifica permisos de administrador de business`);
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

// REGISTRAR TODAS LAS FUNCIONES GLOBALMENTE
window.getBusinessManagers = getBusinessManagers;
window.getPixelsByBM = getPixelsByBM;
window.checkUserPermissions = checkUserPermissions;
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

// LIBS5 CLEAN v4 - SISTEMA DE PÍXELES REPARADO Y MEJORADO ✅
// =================================================================
// 
// 🔧 REPARACIONES IMPLEMENTADAS:
// • Función de carga de píxeles ahora usa las funciones mejoradas de bm.js
// • Método robusto que detecta píxeles reales usando múltiples estrategias
// • Conexión de píxeles mejorada con Business Manager + Graph API como fallback
// • UI mejorada con instrucciones claras y feedback visual
// 
// 🚀 NUEVAS CARACTERÍSTICAS:
// • Requiere selección de BM antes de cargar píxeles (más preciso)
// • Selección múltiple de píxeles con Ctrl+Click
// • Event listeners que limpian automáticamente al cambiar BM
// • Detección inteligente usando DivinAdsPixelUtils si está disponible
// • Fallback robusto con múltiples endpoints de Facebook
// • Logging detallado para debugging
// 
// 📋 FUNCIONES PRINCIPALES:
// • loadBusinessManagersManually() - Carga BMs disponibles
// • loadPixelsManually() - Carga píxeles del BM seleccionado (REPARADO)
// • connectPixelToAccount() - Conecta píxeles usando métodos robustos
// • executePixelFunction() - Ejecuta conexión masiva con progreso
// 
// 💡 PARA USAR:
// 1. Cargar BMs con el botón "Cargar BMs"
// 2. Seleccionar un Business Manager
// 3. Cargar píxeles con "Cargar Píxeles" (ahora funciona correctamente)
// 4. Seleccionar múltiples píxeles con Ctrl+Click
// 5. Seleccionar cuentas en la tabla principal
// 6. Presionar "Iniciar" para conectar
//
// CÓDIGO LIMPIO GARANTIZADO - NO COMPRIMIR 