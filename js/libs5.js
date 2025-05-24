/**
 * LIBS5.JS - GESTIÓN DE PÍXELES DE FACEBOOK
 * Función principal: Conectar píxeles a cuentas publicitarias
 * Faiders Altamir - Scalesoft | scale.com.co
 */

/**
 * Obtiene la lista de Business Managers
 */
async function getBusinessManagers() {
    try {
        console.log('🔍 Cargando Business Managers...');
        
        if (typeof fetch2 === 'undefined' || typeof fb === 'undefined') {
            console.error('❌ fetch2 o fb no disponibles');
            return [];
        }
        
        const accessToken = fb.accessToken || fb.token;
        if (!accessToken) {
            console.error('❌ No hay token de Facebook');
            return [];
        }
        
        const response = await fetch2(`https://graph.facebook.com/v14.0/me/businesses?limit=99999&access_token=${accessToken}`);
        const data = response.json;
        
        console.log('📊 Respuesta Business Managers:', data);
        
        if (data && data.data && data.data.length > 0) {
            const businessManagers = data.data.map(bm => ({
                id: bm.id,
                name: bm.name || `BM ${bm.id}`
            }));
            console.log('✅ Business Managers encontrados:', businessManagers.length);
            return businessManagers;
        }
        
        console.log('⚠️ No se encontraron Business Managers');
        return [];
        
    } catch (error) {
        console.error("❌ Error obteniendo Business Managers:", error);
        return [];
    }
}

/**
 * Obtiene píxeles buscando en todas las cuentas disponibles
 */
async function getPixelsByBM(bmId) {
    try {
        console.log('🔍 Buscando píxeles disponibles...');
        
        const accessToken = fb.accessToken || fb.token;
        if (!accessToken) {
            console.error('❌ No hay token disponible');
            return [];
        }
        
        const allPixels = new Map();
        
        // Buscar en todas las cuentas publicitarias del usuario
        console.log('📊 Buscando en todas las cuentas publicitarias...');
        const allAccountsResponse = await fetch2(`https://graph.facebook.com/v14.0/me/adaccounts?fields=id,name&limit=50&access_token=${accessToken}`);
        const allAccountsData = allAccountsResponse.json;
        
        console.log('🔧 Cuentas publicitarias encontradas:', allAccountsData);
        
        if (allAccountsData && allAccountsData.data && Array.isArray(allAccountsData.data)) {
            console.log(`📋 Consultando píxeles en ${allAccountsData.data.length} cuentas...`);
            
            for (const account of allAccountsData.data) {
                try {
                    console.log(`🔍 Consultando píxeles de: ${account.id}`);
                    
                    const pixelsResponse = await fetch2(`https://graph.facebook.com/v14.0/${account.id}/adspixels?fields=id,name&access_token=${accessToken}`);
                    const pixelsData = pixelsResponse.json;
                    
                    console.log(`📊 Píxeles en ${account.id}:`, pixelsData);
                    
                    if (pixelsData && pixelsData.data && Array.isArray(pixelsData.data) && pixelsData.data.length > 0) {
                        pixelsData.data.forEach(pixel => {
                            if (!allPixels.has(pixel.id)) {
                                allPixels.set(pixel.id, {
                                    id: pixel.id,
                                    name: pixel.name || `Píxel ${pixel.id}`,
                                    status: 'ACTIVE',
                                    fromAccount: account.id,
                                    accountName: account.name
                                });
                                console.log(`✅ Píxel encontrado: ${pixel.name} (${pixel.id}) de cuenta ${account.id}`);
                            }
                        });
                    }
                    
                    // Delay corto para evitar rate limiting
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (accountError) {
                    console.error(`❌ Error consultando cuenta ${account.id}:`, accountError);
                }
            }
        }
        
        const pixels = Array.from(allPixels.values());
        console.log('✅ Total píxeles únicos encontrados:', pixels.length);
        
        if (pixels.length > 0) {
            console.log('📋 Lista de píxeles:', pixels);
        } else {
            console.log('⚠️ No se encontraron píxeles en ninguna cuenta');
        }
        
        return pixels;
        
    } catch (error) {
        console.error("❌ Error obteniendo píxeles:", error);
        return [];
    }
}

/**
 * Obtiene las cuentas seleccionadas de la tabla principal
 */
function getSelectedAccountsFromTable() {
    if (typeof getSelectedRows === 'function') {
        const selectedRows = getSelectedRows();
        return selectedRows.map(row => ({
            id: row.adId || row.id,
            name: row.name || `Cuenta ${row.adId || row.id}`
        }));
    }
    return [];
}

/**
 * Conecta un píxel a una cuenta publicitaria
 */
async function connectPixelToAccount(pixelId, accountId, progressCallback = null) {
    try {
        if (progressCallback) {
            progressCallback(`Conectando píxel ${pixelId} a cuenta ${accountId}`);
        }
        
        const accessToken = fb.accessToken || fb.token;
        const response = await fetch2(`https://graph.facebook.com/${accountId}/adspixels?access_token=${accessToken}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pixel_id: pixelId
            })
        });
        
        const data = response.json;
        
        if (response.ok && data.success) {
            if (progressCallback) {
                progressCallback(`✅ Píxel conectado exitosamente a ${accountId}`);
            }
            return true;
        } else {
            if (progressCallback) {
                progressCallback(`❌ Error conectando píxel a ${accountId}: ${data.error?.message || 'Error desconocido'}`);
            }
            return false;
        }
        
    } catch (error) {
        console.error("Error conectando píxel:", error);
        if (progressCallback) {
            progressCallback(`❌ Error conectando píxel a ${accountId}: ${error.message}`);
        }
        return false;
    }
}

/**
 * Carga Business Managers manualmente
 */
async function loadBusinessManagersManually() {
    const loadBtn = document.querySelector('#loadBMsButton');
    const statusDiv = document.querySelector('#bmLoadingStatus');
    const statusText = document.querySelector('#bmStatusText');
    const bmSelect = document.querySelector('select[name="businessManager"]');
    
    try {
        console.log('🔄 Carga manual de Business Managers iniciada');
        
        if (loadBtn) loadBtn.disabled = true;
        if (statusDiv) statusDiv.style.display = 'block';
        if (statusText) statusText.textContent = 'Cargando Business Managers...';
        
        const pixelSelect = document.querySelector('select[name="pixel"]');
        if (pixelSelect) {
            pixelSelect.innerHTML = '<option value="">Selecciona un BM primero...</option>';
        }
        
        const businessManagers = await getBusinessManagers();
        console.log('📊 Business Managers cargados:', businessManagers);
        
        if (bmSelect) {
            bmSelect.innerHTML = '<option value="">Seleccionar BM...</option>';
            
            if (businessManagers.length > 0) {
                businessManagers.forEach(bm => {
                    const option = document.createElement('option');
                    option.value = bm.id;
                    option.textContent = bm.name;
                    bmSelect.appendChild(option);
                });
                
                if (statusText) statusText.textContent = `✅ ${businessManagers.length} Business Managers cargados`;
            } else {
                bmSelect.innerHTML = '<option value="">No se encontraron BMs</option>';
                if (statusText) statusText.textContent = '⚠️ No se encontraron Business Managers';
            }
        }
        
        setTimeout(() => {
            if (statusDiv) statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error("Error cargando BMs manualmente:", error);
        if (statusText) statusText.textContent = '❌ Error cargando Business Managers';
        if (bmSelect) {
            bmSelect.innerHTML = '<option value="">Error - Intenta de nuevo</option>';
        }
    } finally {
        if (loadBtn) loadBtn.disabled = false;
    }
}

/**
 * Carga píxeles manualmente
 */
async function loadPixelsManually() {
    const bmSelect = document.querySelector('select[name="businessManager"]');
    const loadBtn = document.querySelector('#loadPixelsButton');
    const statusDiv = document.querySelector('#pixelLoadingStatus');
    const statusText = document.querySelector('#pixelStatusText');
    const pixelSelect = document.querySelector('select[name="pixel"]');
    
    try {
        console.log('🔄 Carga manual de píxeles iniciada');
        
        if (loadBtn) loadBtn.disabled = true;
        if (statusDiv) statusDiv.style.display = 'block';
        if (statusText) statusText.textContent = 'Buscando píxeles...';
        
        const pixels = await getPixelsByBM('all');
        console.log('📊 Píxeles cargados manualmente:', pixels);
        
        if (pixelSelect) {
            pixelSelect.innerHTML = '<option value="">Seleccionar Píxel...</option>';
            
            if (pixels.length > 0) {
                pixels.forEach(pixel => {
                    const option = document.createElement('option');
                    option.value = pixel.id;
                    option.textContent = `${pixel.name} (${pixel.status})`;
                    pixelSelect.appendChild(option);
                });
                
                if (statusText) statusText.textContent = `✅ ${pixels.length} píxeles encontrados`;
            } else {
                pixelSelect.innerHTML = '<option value="">No se encontraron píxeles</option>';
                if (statusText) statusText.textContent = '⚠️ No se encontraron píxeles';
            }
        }
        
        setTimeout(() => {
            if (statusDiv) statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error("Error cargando píxeles manualmente:", error);
        if (statusText) statusText.textContent = '❌ Error cargando píxeles';
        if (pixelSelect) {
            pixelSelect.innerHTML = '<option value="">Error - Intenta de nuevo</option>';
        }
    } finally {
        if (loadBtn) loadBtn.disabled = false;
    }
}

/**
 * Verifica si la función de píxeles está lista
 */
function isPixelFunctionReady() {
    const pixelSwitch = document.querySelector('input[name="connectPixels"]');
    const pixelSelect = document.querySelector('select[name="pixel"]');
    const selectedAccounts = getSelectedAccountsFromTable();
    
    if (!pixelSwitch || !pixelSwitch.checked) {
        return false;
    }
    
    if (!pixelSelect || !pixelSelect.value) {
        return false;
    }
    
    if (selectedAccounts.length === 0) {
        return false;
    }
    
    return true;
}

/**
 * Ejecuta la función de píxeles
 */
async function executePixelFunction() {
    if (!isPixelFunctionReady()) {
        console.log('⚠️ Función de píxeles no está lista');
        return false;
    }
    
    const pixelSelect = document.querySelector('select[name="pixel"]');
    const selectedPixel = pixelSelect.value;
    
    const selectedAccounts = getSelectedAccountsFromTable();
    const accountIds = selectedAccounts.map(account => account.id);
    
    const limitInput = document.querySelector('input[name="limit"]');
    const delayInput = document.querySelector('input[name="delay"]');
    
    const settings = {
        limit: parseInt(limitInput?.value) || 2,
        delay: parseInt(delayInput?.value) * 1000 || 2000
    };
    
    const progressArea = document.querySelector('#pixelProgressArea');
    const progressMessages = document.querySelector('#pixelProgressMessages');
    
    if (progressArea) {
        progressArea.style.display = 'block';
    }
    
    if (progressMessages) {
        progressMessages.innerHTML = '';
    }
    
    const progressCallback = (message) => {
        console.log(`[PIXELS] ${message}`);
        if (progressMessages) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'alert alert-info py-1 px-2 mb-1 small';
            messageDiv.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
            progressMessages.appendChild(messageDiv);
            progressMessages.scrollTop = progressMessages.scrollHeight;
        }
    };
    
    try {
        progressCallback(`🚀 Iniciando conexión de píxel ${selectedPixel} a ${accountIds.length} cuentas`);
        
        let success = 0;
        let failed = 0;
        
        for (let i = 0; i < accountIds.length; i++) {
            const accountId = accountIds[i];
            progressCallback(`[${i + 1}/${accountIds.length}] Procesando cuenta: ${accountId}`);
            
            const result = await connectPixelToAccount(selectedPixel, accountId, progressCallback);
            
            if (result) {
                success++;
            } else {
                failed++;
            }
            
            if (i < accountIds.length - 1) {
                await new Promise(resolve => setTimeout(resolve, settings.delay));
            }
        }
        
        progressCallback(`🎯 RESUMEN FINAL: ${success}/${accountIds.length} conexiones exitosas`);
        
        if (failed > 0) {
            progressCallback(`⚠️ ${failed} conexiones fallaron`);
        }
        
        return true;
        
    } catch (error) {
        console.error("Error en proceso de píxeles:", error);
        progressCallback(`❌ Error general: ${error.message}`);
        return false;
    }
}

/**
 * Crea el botón de cargar píxeles
 */
function createPixelLoadButton() {
    const pixelSelect = document.querySelector('select[name="pixel"]');
    if (!pixelSelect) return;
    
    const pixelLabel = pixelSelect.closest('.mb-3')?.querySelector('label.form-label');
    if (!pixelLabel) return;
    
    if (document.querySelector('#loadPixelsButton')) return;
    
    pixelLabel.classList.add('d-flex', 'justify-content-between', 'align-items-center');
    
    const labelText = pixelLabel.textContent.trim();
    pixelLabel.innerHTML = '';
    
    const textSpan = document.createElement('span');
    textSpan.textContent = labelText;
    pixelLabel.appendChild(textSpan);
    
    const loadPixelsButton = document.createElement('button');
    loadPixelsButton.type = 'button';
    loadPixelsButton.className = 'btn btn-sm btn-outline-success';
    loadPixelsButton.id = 'loadPixelsButton';
    loadPixelsButton.innerHTML = '<i class="ri-refresh-line me-1"></i>Cargar Píxeles';
    loadPixelsButton.onclick = loadPixelsManually;
    
    pixelLabel.appendChild(loadPixelsButton);
    
    const statusDiv = document.createElement('div');
    statusDiv.id = 'pixelLoadingStatus';
    statusDiv.className = 'small text-muted mt-1';
    statusDiv.style.display = 'none';
    statusDiv.innerHTML = '<i class="ri-loader-2-line spinner-grow spinner-grow-sm me-1"></i><span id="pixelStatusText">Cargando píxeles...</span>';
    
    pixelSelect.parentNode.insertBefore(statusDiv, pixelSelect.nextSibling);
    
    console.log('✅ Botón de cargar píxeles creado');
}

/**
 * Inicializa la interfaz de píxeles
 */
function initializePixelUI() {
    console.log('🔧 Inicializando UI de píxeles...');
    createPixelLoadButton();
}

// Registro de funciones globales
window.loadBusinessManagersManually = loadBusinessManagersManually;
window.loadPixelsManually = loadPixelsManually;
window.isPixelFunctionReady = isPixelFunctionReady;
window.executePixelFunction = executePixelFunction;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializePixelUI();
});

console.log('📊 LIBS5.JS - Gestión de Píxeles cargado exitosamente | scale.com.co'); 