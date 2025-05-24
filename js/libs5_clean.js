/**
 * LIBS5 CLEAN - GESTIÓN DE PÍXELES DE FACEBOOK
 * Versión mejorada con UI visual y selección múltiple
 * CÓDIGO LIMPIO - NO COMPRIMIR BAJO NINGUNA CIRCUNSTANCIA
 */

// Función para obtener Business Managers con estado visual
async function getBusinessManagers() {
    try {
        console.log('🔍 Cargando Business Managers...');
        
        if (!fetch2 || !fb) {
            console.error('❌ fetch2 o fb no disponibles');
            return [];
        }
        
        const token = fb.accessToken || fb.token;
        if (!token) {
            console.error('❌ No hay token de Facebook');
            return [];
        }
        
        const url = `https://graph.facebook.com/v14.0/me/businesses?fields=id,name,verification_status,permitted_tasks&limit=99999&access_token=${token}`;
        const response = await fetch2(url);
        const data = response.json;
        
        console.log('📊 Respuesta Business Managers:', data);
        
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
            console.log('✅ Business Managers encontrados:', businessManagers.length);
            return businessManagers;
        }
        
        return [];
        
    } catch (error) {
        console.error("❌ Error obteniendo Business Managers:", error);
        return [];
    }
}

// Función para obtener píxeles con formato mejorado
async function getPixelsByBM() {
    try {
        console.log('🔍 Buscando píxeles disponibles...');
        
        const token = fb.accessToken || fb.token;
        if (!token) return [];
        
        const allPixels = new Map();
        const url = `https://graph.facebook.com/v14.0/me/adaccounts?fields=id,name&limit=50&access_token=${token}`;
        const response = await fetch2(url);
        const data = response.json;
        
        console.log('🔧 Cuentas encontradas:', data);
        
        if (data && data.data && Array.isArray(data.data)) {
            for (const account of data.data) {
                try {
                    const pixelUrl = `https://graph.facebook.com/v14.0/${account.id}/adspixels?fields=id,name&access_token=${token}`;
                    const pixelResponse = await fetch2(pixelUrl);
                    const pixelData = pixelResponse.json;
                    
                    if (pixelData && pixelData.data && Array.isArray(pixelData.data)) {
                        pixelData.data.forEach(pixel => {
                            if (!allPixels.has(pixel.id)) {
                                allPixels.set(pixel.id, {
                                    id: pixel.id,
                                    name: pixel.name || `Píxel ${pixel.id}`,
                                    displayName: `${pixel.name || `Píxel ${pixel.id}`} (ID: ${pixel.id})`,
                                    status: 'ACTIVE'
                                });
                            }
                        });
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (err) {
                    console.error(`Error con cuenta ${account.id}:`, err);
                }
            }
        }
        
        const pixels = Array.from(allPixels.values());
        console.log('✅ Píxeles encontrados:', pixels.length);
        return pixels;
        
    } catch (error) {
        console.error("❌ Error obteniendo píxeles:", error);
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
        
        console.log('👤 Usuario actual:', data);
        return data;
    } catch (error) {
        console.error('❌ Error verificando permisos:', error);
        return null;
    }
}

// Función mejorada para conectar píxel con manejo de errores específicos
async function connectPixelToAccount(pixelId, accountId, progressCallback) {
    try {
        const token = fb.accessToken || fb.token;
        const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
        const cleanAccountId = formattedId.replace('act_', '');
        
        if (progressCallback) {
            progressCallback(`🔄 Conectando píxel ${pixelId} a ${formattedId}`);
        }
        
        // Método 1: Verificar si el píxel ya está conectado
        const checkUrl = `https://graph.facebook.com/v14.0/${formattedId}/adspixels?fields=id,name&access_token=${token}`;
        const checkResponse = await fetch2(checkUrl);
        const checkData = checkResponse.json;
        
        if (checkData && checkData.data && Array.isArray(checkData.data)) {
            const existingPixel = checkData.data.find(p => p.id === pixelId);
            if (existingPixel) {
                if (progressCallback) {
                    progressCallback(`✅ Píxel ya conectado a ${formattedId}`);
                }
                return true;
            }
        }
        
        // Método 2: Intentar asignar píxel directamente
        const assignUrl = `https://graph.facebook.com/v14.0/${formattedId}/adspixels?access_token=${token}`;
        const assignResponse = await fetch2(assignUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                pixel_id: pixelId 
            })
        });
        
        const assignData = assignResponse.json;
        console.log(`Respuesta asignación directa para ${formattedId}:`, assignData);
        
        if (assignResponse.ok && (assignData.success || assignData.id)) {
            if (progressCallback) {
                progressCallback(`✅ Píxel asignado a ${formattedId}`);
            }
            return true;
        }
        
        // Método 3: Intentar compartir píxel
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
        console.log(`Respuesta compartir píxel para ${formattedId}:`, shareData);
        
        if (shareResponse.ok && (shareData.success || shareData.id)) {
            if (progressCallback) {
                progressCallback(`✅ Píxel compartido a ${formattedId}`);
            }
            return true;
        }
        
        // Análisis de errores específicos
        const errorMessage = assignData.error?.message || shareData.error?.message || 'Error desconocido';
        
        if (errorMessage.includes('business admin') || errorMessage.includes('only business admin')) {
            if (progressCallback) {
                progressCallback(`⚠️ ${formattedId}: Se requieren permisos de administrador de business`);
            }
        } else if (errorMessage.includes('permissions') || errorMessage.includes('access')) {
            if (progressCallback) {
                progressCallback(`⚠️ ${formattedId}: Permisos insuficientes - ${errorMessage}`);
            }
        } else {
            if (progressCallback) {
                progressCallback(`❌ Error en ${formattedId}: ${errorMessage}`);
            }
        }
        
        return false;
        
    } catch (error) {
        console.error("❌ Error conectando píxel:", error);
        if (progressCallback) {
            progressCallback(`❌ Error técnico: ${error.message}`);
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
        console.log('🔄 Cargando Business Managers...');
        
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
        console.error("❌ Error:", error);
        if (statusText) statusText.textContent = '❌ Error cargando';
    } finally {
        if (loadBtn) loadBtn.disabled = false;
    }
}

// Función para cargar píxeles con multi-select
async function loadPixelsManually() {
    const loadBtn = document.querySelector('#loadPixelsButton');
    const statusDiv = document.querySelector('#pixelLoadingStatus');
    const statusText = document.querySelector('#pixelStatusText');
    let pixelSelect = document.querySelector('select[name="pixel"]');
    
    try {
        if (loadBtn) loadBtn.disabled = true;
        if (statusDiv) statusDiv.style.display = 'block';
        if (statusText) statusText.textContent = 'Buscando píxeles...';
        
        const pixels = await getPixelsByBM();
        
        if (pixelSelect) {
            // Convertir a multi-select si no lo es
            if (!pixelSelect.multiple) {
                pixelSelect.multiple = true;
                pixelSelect.size = Math.min(pixels.length + 1, 8); // Máximo 8 líneas visibles
                pixelSelect.style.height = 'auto';
            }
            
            pixelSelect.innerHTML = '<option value="" disabled>Seleccionar Píxeles (puedes elegir varios)...</option>';
            
            pixels.forEach(pixel => {
                const option = document.createElement('option');
                option.value = pixel.id;
                option.textContent = pixel.displayName;
                option.style.padding = '5px';
                pixelSelect.appendChild(option);
            });
            
            if (statusText) {
                statusText.textContent = `✅ ${pixels.length} píxeles encontrados`;
            }
        }
        
        setTimeout(() => {
            if (statusDiv) statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error("❌ Error:", error);
        if (statusText) statusText.textContent = '❌ Error';
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
        console.log('⚠️ Función de píxeles no está lista');
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
        console.log('⚠️ No hay cuentas seleccionadas en la tabla');
        return false;
    }
    
    const progressMessages = document.querySelector('#pixelProgressMessages');
    if (progressMessages) progressMessages.innerHTML = '';
    
    const progressCallback = (message) => {
        console.log(`[PIXELS] ${message}`);
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
        
        console.log('✅ Botón de cargar píxeles agregado');
    }, 200);
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

// Inicializar
document.addEventListener('DOMContentLoaded', addPixelButton);
window.addEventListener('load', addPixelButton);

console.log('📊 LIBS5 CLEAN v3 cargado exitosamente - CÓDIGO LIMPIO GARANTIZADO');
console.log('🎨 Nuevas características: UI visual mejorada + selección múltiple de píxeles');
console.log('🔧 Funciones disponibles: gestión completa con estado visual y multi-select'); 