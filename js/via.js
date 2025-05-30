/**
 * SISTEMA DE DASHBOARD DIVINADS - VERSIÓN ESTABLE
 * Descripción: Sistema robusto para cargar y mostrar datos reales de Facebook de manera automática y confiable
 * Versión: 2.0 - Estable y Optimizada
 */

$(document).ready(async function () {
    // ============================
    // CONFIGURACIÓN Y VARIABLES GLOBALES
    // ============================
    
    let isInitialized = false;
    let retryCount = 0;
    const MAX_RETRIES = 5;
    const RETRY_DELAY = 3000;
    let dataLoadPromises = {};
    
    // Estado de carga para evitar duplicados
    let loadingStates = {
        user: false,
        ads: false,
        bm: false,
        pages: false
    };
    
    // Cache de datos para evitar recargas innecesarias
    let dataCache = {
        lastUpdate: 0,
        user: null,
        ads: null,
        bm: null,
        pages: null
    };
    
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
    
    console.log('🚀 DivinAds Dashboard - Sistema Estable Iniciado');
    
    // ============================
    // FUNCIONES DE UTILIDAD
    // ============================
    
    /**
     * Función para verificar si los datos están en cache y son válidos
     */
    const isCacheValid = (type) => {
        const now = Date.now();
        const hasValidCache = dataCache[type] && (now - dataCache.lastUpdate) < CACHE_DURATION;
        
        // Si el cache es válido pero es un array vacío, considerarlo válido solo por un tiempo corto
        if (hasValidCache && Array.isArray(dataCache[type]) && dataCache[type].length === 0) {
            // Para arrays vacíos, usar un cache más corto (2 minutos)
            return (now - dataCache.lastUpdate) < (2 * 60 * 1000);
        }
        
        return hasValidCache;
    };
    
    /**
     * Función para guardar datos en cache
     */
    const saveToCache = (type, data) => {
        dataCache[type] = data;
        dataCache.lastUpdate = Date.now();
        
        // También guardar en localStorage para persistencia
        try {
            localStorage.setItem(`dashboard_${type}_data`, JSON.stringify(data));
            localStorage.setItem(`dashboard_${type}_timestamp`, Date.now().toString());
        } catch (e) {
            console.warn(`Error guardando ${type} en localStorage:`, e);
        }
    };
    
    /**
     * Función para cargar datos desde localStorage
     */
    const loadFromStorage = (type) => {
        try {
            const data = localStorage.getItem(`dashboard_${type}_data`);
            const timestamp = localStorage.getItem(`dashboard_${type}_timestamp`);
            
            if (data && timestamp) {
                const parsedData = JSON.parse(data);
                const age = Date.now() - parseInt(timestamp);
                
                // Para arrays vacíos, usar cache más corto (2 minutos)
                const maxAge = (Array.isArray(parsedData) && parsedData.length === 0) 
                    ? (2 * 60 * 1000) 
                    : CACHE_DURATION;
                
                if (age < maxAge) {
                    return parsedData;
                }
            }
        } catch (e) {
            console.warn(`Error cargando ${type} desde localStorage:`, e);
        }
        return null;
    };
    
    /**
     * Función para esperar a que Facebook esté disponible
     */
    const waitForFacebook = () => {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 30; // 30 segundos máximo
            
            const checkFb = () => {
                attempts++;
                
                if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
                    console.log('✅ Facebook SDK disponible');
                    resolve(window.fb);
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Timeout esperando Facebook SDK');
                    reject(new Error('Facebook SDK no disponible'));
                } else {
                    setTimeout(checkFb, 1000);
                }
            };
            
            checkFb();
        });
    };
    
    /**
     * Función para mostrar estado de carga
     */
    const showLoadingState = (section, message = 'Cargando datos reales...') => {
        const loadingHtml = `
            <div class="p-3 border-top text-center">
                <div class="d-flex align-items-center justify-content-center">
                    <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <span class="text-muted">${message}</span>
                </div>
            </div>
        `;
        
        $(`#top${section.charAt(0).toUpperCase() + section.slice(1)}`).html(loadingHtml);
    };
    
    /**
     * Función para mostrar estado sin datos
     */
    const showNoDataState = (section) => {
        let message = '';
        let icon = '';
        let description = '';
        
        switch(section) {
            case 'ads':
                icon = 'ri-advertisement-line';
                message = 'No hay cuentas publicitarias';
                description = 'Este perfil no tiene cuentas publicitarias asociadas';
                break;
            case 'bm':
                icon = 'ri-building-line';
                message = 'No hay Business Managers';
                description = 'Este perfil no tiene Business Managers asociados';
                break;
            case 'page':
                icon = 'ri-pages-line';
                message = 'No hay páginas';
                description = 'Este perfil no tiene páginas de Facebook asociadas';
                break;
            default:
                icon = 'ri-information-line';
                message = 'No hay datos disponibles';
                description = 'No se encontró información para mostrar';
        }
        
        const noDataHtml = `
            <div class="p-3 border-top text-center">
                <div class="text-muted">
                    <i class="${icon} fs-4 mb-2 d-block"></i>
                    <p class="mb-1 fw-medium">${message}</p>
                    <small>${description}</small>
                </div>
            </div>
        `;
        
        $(`#top${section.charAt(0).toUpperCase() + section.slice(1)}`).html(noDataHtml);
    };
    
    /**
     * Función para mostrar estado de error
     */
    const showErrorState = (section, error = 'Error al cargar datos') => {
        const errorHtml = `
            <div class="p-3 border-top text-center">
                <div class="text-danger">
                    <i class="ri-error-warning-line fs-4 mb-2 d-block"></i>
                    <p class="mb-0">${error}</p>
                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="window.location.reload()">
                        <i class="ri-refresh-line me-1"></i>Reintentar
                    </button>
                </div>
            </div>
        `;
        
        $(`#top${section.charAt(0).toUpperCase() + section.slice(1)}`).html(errorHtml);
    };
    
    // ============================
    // FUNCIONES DE CARGA DE DATOS
    // ============================
    
    /**
     * Cargar información del usuario de manera estable
     */
    const loadUserProfile = async () => {
        if (loadingStates.user) return;
        loadingStates.user = true;
        
        try {
            // Verificar cache primero
            if (isCacheValid('user')) {
                displayUserProfile(dataCache.user);
                return;
            }
            
            // Intentar cargar desde localStorage
            const storedUser = loadFromStorage('user');
            if (storedUser) {
                displayUserProfile(storedUser);
                dataCache.user = storedUser;
                return;
            }
            
            // Esperar a que Facebook esté disponible
            const fb = await waitForFacebook();
            
            let userInfo = null;
            
            // Intentar obtener información completa del usuario
            if (typeof fb.getUserInfo === 'function') {
                try {
                    userInfo = await fb.getUserInfo();
                } catch (e) {
                    console.warn('Error obteniendo getUserInfo:', e);
                }
            }
            
            // Si no funciona, usar información básica disponible
            if (!userInfo || !userInfo.name) {
                userInfo = {
                    name: fb.userInfo?.name || localStorage.getItem('userName') || 'Usuario Facebook',
                    id: fb.uid || 'No disponible',
                    avatar: fb.userInfo?.picture?.data?.url || localStorage.getItem('userAvatar') || null
                };
            }
            
            // Guardar en cache y mostrar
            saveToCache('user', userInfo);
            displayUserProfile(userInfo);
            
        } catch (error) {
            console.warn('Error cargando perfil de usuario:', error);
            
            // Mostrar información mínima
            const fallbackUser = {
                name: 'Usuario',
                id: 'No conectado',
                avatar: null
            };
            displayUserProfile(fallbackUser);
            
        } finally {
            loadingStates.user = false;
        }
    };
    
    /**
     * Mostrar información del usuario en la interfaz
     */
    const displayUserProfile = (userInfo) => {
        try {
            // Ocultar skeletons
            $('#userAvatarSkeleton, #userNameSkeleton, #userIdSkeleton').addClass('d-none');
            
            // Mostrar avatar
            if (userInfo.avatar) {
                $('#userAvatar').attr('src', userInfo.avatar).removeClass('d-none');
            } else {
                const initial = userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U';
                $('#userAvatarContainer').html(`
                    <div class="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold" 
                         style="width: 33px; height: 33px; background: linear-gradient(45deg, #4267B2, #1877F2); font-size: 14px;">
                        ${initial}
                    </div>
                `);
            }
            
            // Mostrar nombre y ID
            $('#userName').text(userInfo.name || 'Usuario').removeClass('d-none');
            $('#userId').text(userInfo.id || 'No disponible').removeClass('d-none');
            
        } catch (e) {
            console.warn('Error en displayUserProfile:', e);
        }
    };
    
    /**
     * Cargar datos de Ads de manera estable
     */
    const loadAdsData = async () => {
        if (loadingStates.ads) return;
        loadingStates.ads = true;
        
        try {
            // Verificar cache primero
            if (isCacheValid('ads')) {
                displayAdsData(dataCache.ads);
                return;
            }
            
            // Intentar cargar desde localStorage
            const storedAds = loadFromStorage('ads');
            if (storedAds && storedAds.length > 0) {
                displayAdsData(storedAds);
                dataCache.ads = storedAds;
                return;
            }
            
            showLoadingState('ads');
            
            // Esperar a que Facebook esté disponible
            const fb = await waitForFacebook();
            
            if (typeof fb.loadAds === 'function') {
                // Crear promesa para manejar el evento con timeout más corto
                const adsPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        // En lugar de rechazar, resolver con array vacío
                        console.log('⏰ Timeout cargando cuentas publicitarias - probablemente no hay cuentas disponibles');
                        resolve([]);
                    }, 15000); // Reducido de 30s a 15s
                    
                    const handleAdsSuccess = (event, adsData) => {
                        clearTimeout(timeout);
                        $(document).off("loadAdsSuccess", handleAdsSuccess);
                        $(document).off("loadSavedAds", handleAdsSuccess);
                        resolve(adsData || []);
                    };
                    
                    // También escuchar eventos de error o "no data"
                    const handleAdsError = (event) => {
                        clearTimeout(timeout);
                        $(document).off("loadAdsSuccess", handleAdsSuccess);
                        $(document).off("loadSavedAds", handleAdsSuccess);
                        $(document).off("loadAdsError", handleAdsError);
                        $(document).off("loadAdsEmpty", handleAdsError);
                        console.log('💰 No se encontraron cuentas publicitarias en este perfil');
                        resolve([]);
                    };
                    
                    $(document).on("loadAdsSuccess", handleAdsSuccess);
                    $(document).on("loadSavedAds", handleAdsSuccess);
                    $(document).on("loadAdsError", handleAdsError);
                    $(document).on("loadAdsEmpty", handleAdsError);
                });
                
                // Iniciar carga
                await fb.loadAds();
                
                // Esperar resultado
                const adsData = await adsPromise;
                
                if (adsData && adsData.length > 0) {
                    saveToCache('ads', adsData);
                    displayAdsData(adsData);
                } else {
                    // Guardar array vacío en cache para evitar recargas innecesarias
                    saveToCache('ads', []);
                    showNoDataState('ads');
                }
            } else {
                showNoDataState('ads');
            }
            
        } catch (error) {
            console.log('💰 No se pudieron cargar las cuentas publicitarias:', error.message);
            // En lugar de mostrar error, mostrar estado sin datos
            showNoDataState('ads');
        } finally {
            loadingStates.ads = false;
        }
    };
    
    /**
     * Cargar datos de BM de manera estable
     */
    const loadBmData = async () => {
        if (loadingStates.bm) return;
        loadingStates.bm = true;
        
        try {
            // Verificar cache primero
            if (isCacheValid('bm')) {
                displayBmData(dataCache.bm);
                return;
            }
            
            // Intentar cargar desde localStorage
            const storedBm = loadFromStorage('bm');
            if (storedBm && storedBm.length > 0) {
                displayBmData(storedBm);
                dataCache.bm = storedBm;
                return;
            }
            
            showLoadingState('bm');
            
            // Esperar a que Facebook esté disponible
            const fb = await waitForFacebook();
            
            if (typeof fb.loadBm === 'function') {
                // Crear promesa para manejar los eventos con timeout más corto
                const bmPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        // En lugar de rechazar, resolver con array vacío
                        console.log('⏰ Timeout cargando Business Managers - probablemente no hay BM disponibles');
                        resolve([]);
                    }, 15000); // Reducido de 30s a 15s
                    
                    const handleBmSuccess = (event, bmData) => {
                        clearTimeout(timeout);
                        $(document).off("loadBmSuccess", handleBmSuccess);
                        $(document).off("loadBmSuccess2", handleBmSuccess);
                        $(document).off("loadBmSuccess3", handleBmSuccess);
                        $(document).off("loadSavedBm", handleBmSuccess);
                        resolve(bmData || []);
                    };
                    
                    // También escuchar eventos de error o "no data"
                    const handleBmError = (event) => {
                        clearTimeout(timeout);
                        $(document).off("loadBmSuccess", handleBmSuccess);
                        $(document).off("loadBmSuccess2", handleBmSuccess);
                        $(document).off("loadBmSuccess3", handleBmSuccess);
                        $(document).off("loadSavedBm", handleBmSuccess);
                        $(document).off("loadBmError", handleBmError);
                        $(document).off("loadBmEmpty", handleBmError);
                        console.log('🏢 No se encontraron Business Managers en este perfil');
                        resolve([]);
                    };
                    
                    $(document).on("loadBmSuccess", handleBmSuccess);
                    $(document).on("loadBmSuccess2", handleBmSuccess);
                    $(document).on("loadBmSuccess3", handleBmSuccess);
                    $(document).on("loadSavedBm", handleBmSuccess);
                    $(document).on("loadBmError", handleBmError);
                    $(document).on("loadBmEmpty", handleBmError);
                });
                
                // Iniciar carga
                await fb.loadBm();
                
                // Esperar resultado
                const bmData = await bmPromise;
                
                if (bmData && bmData.length > 0) {
                    saveToCache('bm', bmData);
                    displayBmData(bmData);
                } else {
                    // Guardar array vacío en cache para evitar recargas innecesarias
                    saveToCache('bm', []);
                    showNoDataState('bm');
                }
            } else {
                showNoDataState('bm');
            }
            
        } catch (error) {
            console.log('🏢 No se pudieron cargar los Business Managers:', error.message);
            // En lugar de mostrar error, mostrar estado sin datos
            showNoDataState('bm');
        } finally {
            loadingStates.bm = false;
        }
    };
    
    /**
     * Cargar datos de Pages de manera estable
     */
    const loadPagesData = async () => {
        if (loadingStates.pages) return;
        loadingStates.pages = true;
        
        try {
            // Verificar cache primero
            if (isCacheValid('pages')) {
                displayPageData(dataCache.pages);
                return;
            }
            
            // Intentar cargar desde localStorage
            const storedPages = loadFromStorage('pages');
            if (storedPages && storedPages.length > 0) {
                displayPageData(storedPages);
                dataCache.pages = storedPages;
                return;
            }
            
            showLoadingState('page');
            
            // Esperar a que Facebook esté disponible
            const fb = await waitForFacebook();
            
            if (typeof fb.loadPage === 'function') {
                // Crear promesa para manejar el evento con timeout más corto
                const pagesPromise = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        // En lugar de rechazar, resolver con array vacío
                        console.log('⏰ Timeout cargando páginas - probablemente no hay páginas disponibles');
                        resolve([]);
                    }, 15000); // Reducido de 30s a 15s
                    
                    const handlePagesSuccess = (event, pagesData) => {
                        clearTimeout(timeout);
                        $(document).off("loadPageSuccess", handlePagesSuccess);
                        $(document).off("loadSavedPage", handlePagesSuccess);
                        resolve(pagesData || []);
                    };
                    
                    // También escuchar eventos de error o "no data"
                    const handlePagesError = (event) => {
                        clearTimeout(timeout);
                        $(document).off("loadPageSuccess", handlePagesSuccess);
                        $(document).off("loadSavedPage", handlePagesSuccess);
                        $(document).off("loadPageError", handlePagesError);
                        $(document).off("loadPageEmpty", handlePagesError);
                        console.log('📄 No se encontraron páginas en este perfil');
                        resolve([]);
                    };
                    
                    $(document).on("loadPageSuccess", handlePagesSuccess);
                    $(document).on("loadSavedPage", handlePagesSuccess);
                    $(document).on("loadPageError", handlePagesError);
                    $(document).on("loadPageEmpty", handlePagesError);
                });
                
                // Iniciar carga
                await fb.loadPage();
                
                // Esperar resultado
                const pagesData = await pagesPromise;
                
                if (pagesData && pagesData.length > 0) {
                    saveToCache('pages', pagesData);
                    displayPageData(pagesData);
                } else {
                    // Guardar array vacío en cache para evitar recargas innecesarias
                    saveToCache('pages', []);
                    showNoDataState('page');
                }
            } else {
                showNoDataState('page');
            }
            
        } catch (error) {
            console.log('📄 No se pudieron cargar las páginas:', error.message);
            // En lugar de mostrar error, mostrar estado sin datos
            showNoDataState('page');
        } finally {
            loadingStates.pages = false;
        }
    };
    
    // ============================
    // FUNCIONES DE VISUALIZACIÓN
    // ============================
    
    /**
     * Mostrar datos de Ads en la interfaz
     */
    const displayAdsData = (adsData) => {
        try {
            $("#countAds").text(adsData.length);
            
            let adsHtml = "";
            adsData.sort((a, b) => {
                const spendA = parseInt((a.spend || '0').toString().replace(/,/g, ''));
                const spendB = parseInt((b.spend || '0').toString().replace(/,/g, ''));
                return spendB - spendA;
            }).slice(0, 4).forEach(ad => {
                const displaySpend = ad.spend || '0';
                const currency = ad.currency ? ad.currency.split('-')[0] : '$';
                const accountName = ad.account || ad.name || 'Cuenta sin nombre';
                const accountId = ad.adId || ad.id;
                
                adsHtml += `
                    <div class="border-bottom opacity-50"></div>
                    <a href="https://business.facebook.com/billing_hub/payment_settings/?asset_id=${accountId}" target="_blank" class="text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link">
                        <div class="d-flex align-items-center" style="width: calc(100% - 60px);">
                            <span class="avatar-letter" data-letter="${accountName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase()}"></span>
                            <div class="d-flex flex-column ps-3" style="line-height: initial; width: calc(100% - 30px)">
                                <strong class="text-truncate pe-1" style="font-size: 14px; margin-bottom: 3px">${accountName}</strong>
                                <span>${accountId}</span>
                            </div>
                        </div>
                        <div class="text-end">
                            <strong style="margin-bottom: 3px" class="d-block">Gasto total</strong>
                            <span class="badge text-bg-success">${currency}${displaySpend}</span>
                        </div>
                    </a>
                `;
            });
            
            $("#topAds").html(adsHtml);
            
            // Configurar select para detalles de ads si existe
            if (typeof $.fn.select2 !== 'undefined' && $("#adSelect select").length) {
                $("#adSelect select").select2({
                    data: adsData.map(ad => ({
                        id: ad.adId || ad.id,
                        text: ad.account || ad.name || 'Cuenta sin nombre'
                    }))
                });
                
                $("#adSelect select").on("select2:select", function (e) {
                    const selectedAd = adsData.find(ad => (ad.adId || ad.id) === e.params.data.id);
                    if (selectedAd) {
                        displayAdDetails(selectedAd);
                    }
                });
                
                // Mostrar el primer elemento por defecto
                if (adsData[0]) {
                    displayAdDetails(adsData[0]);
                }
                
                $("#adData").removeClass("d-none");
            }
            
        } catch (e) {
            console.warn('Error en displayAdsData:', e);
        }
    };
    
    /**
     * Mostrar detalles de una cuenta publicitaria específica
     */
    const displayAdDetails = async (adData) => {
        try {
            $("#adName").text(adData.account || adData.name);
            $("#adId").text(adData.adId || adData.id);
            $("#adImage").html(`<span style="width:40px;height:40px;font-size:18px" class="avatar-letter" data-letter="${(adData.account || adData.name || 'A').substring(0, 1).toUpperCase()}"></span>`);
            
            // Determinar estado
            let statusBadge = "";
            switch(adData.status) {
                case 101:
                    statusBadge = '<span class="badge text-bg-success">Cerrado</span>';
                    break;
                case 999:
                    statusBadge = '<span class="badge text-bg-info">En espera</span>';
                    break;
                case 1:
                case 100:
                    statusBadge = '<span class="badge text-bg-success">Activo</span>';
                    break;
                case 2:
                    statusBadge = '<span class="badge text-bg-danger">Deshabilitado</span>';
                    break;
                case 3:
                    statusBadge = '<span class="badge text-bg-warning">Pago pendiente</span>';
                    break;
                default:
                    statusBadge = '<span class="badge text-bg-secondary">Desconocido</span>';
            }
            
            const currency = adData.currency ? adData.currency.split("-")[0] : "$";
            
            // Verificar administradores ocultos
            let hiddenAdmins = [];
            try {
                if (typeof window.fb !== 'undefined' && window.fb && typeof window.fb.checkHiddenAdmin === 'function') {
                    hiddenAdmins = await window.fb.checkHiddenAdmin(adData.adId || adData.id);
                }
            } catch (error) {
                console.warn('Error verificando admin oculto:', error);
            }
            
            // Actualizar campos
            $("#t1").html(statusBadge);
            $("#t2").html((adData.limit || '0') + " " + currency);
            $("#t3").html((adData.remain || '0') + " " + currency);
            $("#t4").html((adData.spend || '0') + " " + currency);
            $("#t5").html((adData.balance || '0') + " " + currency);
            $("#t6").html(adData.createdTime || 'N/A');
            $("#t7").html(adData.nextBillDate || 'N/A');
            $("#t8").text(hiddenAdmins.length);
            $("#t9").html(adData.type || 'N/A');
            $("#t10").html(adData.timezone || 'N/A');
            $("#t12").html(adData.role || 'N/A');
            
            // Información de tarjeta de pago
            let cardInfo = "";
            try {
                if (adData.payment) {
                    const paymentData = JSON.parse(adData.payment)[0];
                    if (paymentData && paymentData.credential && paymentData.credential.card_association) {
                        cardInfo = paymentData.credential.card_association + " - " + (paymentData.credential.last_four_digits || "");
                    }
                }
            } catch (e) {
                cardInfo = "No disponible";
            }
            $("#t11").html(cardInfo);
            
        } catch (e) {
            console.warn('Error en displayAdDetails:', e);
        }
    };
    
    /**
     * Mostrar datos de BM en la interfaz
     */
    const displayBmData = (bmData) => {
        try {
            $("#countBm").text(bmData.length);
            
            let bmHtml = "";
            bmData.slice(0, 4).forEach(bm => {
                const bmType = bm.bmType || bm.type || (bm.limit ? `BM${bm.limit}` : 'BM');
                const bmName = bm.name || 'Business Manager';
                const bmId = bm.bmId || bm.id;
                
                bmHtml += `
                    <div class="border-bottom opacity-50"></div>
                    <a href="https://business.facebook.com/settings/?business_id=${bmId}" target="_blank" class="text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link">
                        <div class="d-flex align-items-center" style="width: calc(100% - 50px);">
                            <span class="avatar-letter" data-letter="${bmName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase()}"></span>
                            <div class="d-flex flex-column ps-3" style="line-height: initial; width: calc(100% - 30px)">
                                <strong class="text-truncate pe-1" style="font-size: 14px; margin-bottom: 3px">${bmName}</strong>
                                <span>${bmId}</span>
                            </div>
                        </div>
                        <div class="text-end">
                            <strong style="margin-bottom: 3px" class="d-block">Tipo de BM</strong>
                            <span class="badge text-bg-success">${bmType.split(' - ')[0]}</span>
                        </div>
                    </a>
                `;
            });
            
            $("#topBm").html(bmHtml);
            
            // Crear gráfico de estadísticas BM
            createBmChart(bmData);
            
        } catch (e) {
            console.warn('Error en displayBmData:', e);
        }
    };
    
    /**
     * Crear gráfico de estadísticas de BM
     */
    const createBmChart = (bmData) => {
        try {
            const liveCount = bmData.filter(bm => bm.status === 'LIVE' || bm.status === 'live' || !bm.status).length;
            const dieCount = bmData.filter(bm => bm.status === 'DIE' || bm.status === 'die').length;
            const dieVvCount = bmData.filter(bm => bm.status === 'DIE_VV' || bm.status === 'die_vv').length;
            
            if (liveCount > 0 || dieCount > 0 || dieVvCount > 0) {
                const chartCanvas = document.querySelector("#bmChart canvas");
                if (chartCanvas && typeof Chart !== 'undefined') {
                    // Limpiar gráfico anterior
                    const existingChart = Chart.getChart(chartCanvas);
                    if (existingChart) {
                        existingChart.destroy();
                    }
                    
                    new Chart(chartCanvas, {
                        type: "doughnut",
                        options: {
                            cutout: "50%",
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 15,
                                        usePointStyle: true,
                                        font: { size: 12 }
                                    }
                                }
                            }
                        },
                        data: {
                            labels: ["BM Activo", "BM Muerto por revisión", "BM Muerto permanente"],
                            datasets: [{
                                data: [liveCount, dieCount, dieVvCount],
                                backgroundColor: ["#198754", "#dc3545", "#ffc107"],
                                borderColor: ["#ffffff", "#ffffff", "#ffffff"],
                                borderWidth: 3
                            }]
                        }
                    });
                    
                    $("#bmChart").removeClass("d-none");
                }
            }
        } catch (e) {
            console.warn('Error creando gráfico BM:', e);
        }
    };
    
    /**
     * Mostrar datos de Pages en la interfaz
     */
    const displayPageData = (pageData) => {
        try {
            $("#countPage").text(pageData.length || 0);
            
            let pageHtml = "";
            pageData.sort((a, b) => {
                const likesA = parseInt((a.likes || a.like || a.followers_count || '0').toString().replace(/,/g, ''));
                const likesB = parseInt((b.likes || b.like || b.followers_count || '0').toString().replace(/,/g, ''));
                return likesB - likesA;
            }).slice(0, 4).forEach(page => {
                const likes = page.likes || page.like || page.followers_count || '0';
                const pageName = page.name || 'Página sin nombre';
                const pageId = page.pageId || page.id;
                
                pageHtml += `
                    <div class="border-bottom opacity-50"></div>
                    <a href="https://www.facebook.com/profile.php?id=${pageId}" target="_blank" class="text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link">
                        <div class="d-flex align-items-center" style="width: calc(100% - 60px);">
                            <span class="avatar-letter" data-letter="${pageName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase()}"></span>
                            <div class="d-flex flex-column ps-3" style="line-height: initial; width: calc(100% - 30px)">
                                <strong class="text-truncate pe-1" style="font-size: 14px; margin-bottom: 3px">${pageName}</strong>
                                <span>${pageId}</span>
                            </div>
                        </div>
                        <div class="text-end">
                            <strong style="margin-bottom: 3px" class="d-block">Me gusta</strong>
                            <span class="badge text-bg-success">${likes}</span>
                        </div>
                    </a>
                `;
            });
            
            $("#topPage").html(pageHtml);
            
        } catch (e) {
            console.warn('Error en displayPageData:', e);
        }
    };
    
    // ============================
    // FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
    // ============================
    
    /**
     * Función principal para inicializar el dashboard de manera estable
     */
    const initializeDashboard = async () => {
        if (isInitialized) return;
        isInitialized = true;
        
        console.log('🔄 Inicializando Dashboard DivinAds...');
        
        try {
            // 1. Cargar perfil de usuario inmediatamente
            await loadUserProfile();
            
            // 2. Cargar datos desde cache/localStorage si están disponibles
            const cachedAds = loadFromStorage('ads');
            const cachedBm = loadFromStorage('bm');
            const cachedPages = loadFromStorage('pages');
            
            if (cachedAds && cachedAds.length > 0) {
                displayAdsData(cachedAds);
                dataCache.ads = cachedAds;
            }
            
            if (cachedBm && cachedBm.length > 0) {
                displayBmData(cachedBm);
                dataCache.bm = cachedBm;
            }
            
            if (cachedPages && cachedPages.length > 0) {
                displayPageData(cachedPages);
                dataCache.pages = cachedPages;
            }
            
            // 3. Cargar datos frescos en paralelo
            const loadPromises = [];
            
            if (!cachedAds || cachedAds.length === 0) {
                loadPromises.push(loadAdsData());
            }
            
            if (!cachedBm || cachedBm.length === 0) {
                loadPromises.push(loadBmData());
            }
            
            if (!cachedPages || cachedPages.length === 0) {
                loadPromises.push(loadPagesData());
            }
            
            // Ejecutar cargas en paralelo
            if (loadPromises.length > 0) {
                await Promise.allSettled(loadPromises);
            }
            
            console.log('✅ Dashboard inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
            
            // Reintentar si no hemos alcanzado el máximo
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                console.log(`🔄 Reintentando inicialización (${retryCount}/${MAX_RETRIES})...`);
                
                setTimeout(() => {
                    isInitialized = false;
                    initializeDashboard();
                }, RETRY_DELAY);
            }
        }
    };
    
    // ============================
    // EVENTOS Y LISTENERS
    // ============================
    
    // Eventos para recibir datos de Facebook
    $(document).on("loadAdsSuccess loadSavedAds", function(event, adsData) {
        if (adsData && adsData.length > 0) {
            saveToCache('ads', adsData);
            displayAdsData(adsData);
        }
    });
    
    $(document).on("loadBmSuccess loadBmSuccess2 loadBmSuccess3 loadSavedBm", function(event, bmData) {
        if (bmData && bmData.length > 0) {
            saveToCache('bm', bmData);
            displayBmData(bmData);
        }
    });
    
    $(document).on("loadPageSuccess loadSavedPage", function(event, pageData) {
        if (pageData && pageData.length > 0) {
            saveToCache('pages', pageData);
            displayPageData(pageData);
        }
    });
    
    // Botones de recarga manual
    $(document).on('click', '#loadAds', async function() {
        const $button = $(this);
        $button.prop('disabled', true);
        
        try {
            // Limpiar cache
            localStorage.removeItem('dashboard_ads_data');
            dataCache.ads = null;
            loadingStates.ads = false;
            
            await loadAdsData();
        } finally {
            setTimeout(() => $button.prop('disabled', false), 3000);
        }
    });
    
    $(document).on('click', '#loadBm', async function() {
        const $button = $(this);
        $button.prop('disabled', true);
        
        try {
            // Limpiar cache
            localStorage.removeItem('dashboard_bm_data');
            dataCache.bm = null;
            loadingStates.bm = false;
            
            await loadBmData();
        } finally {
            setTimeout(() => $button.prop('disabled', false), 3000);
        }
    });
    
    $(document).on('click', '#loadPage', async function() {
        const $button = $(this);
        $button.prop('disabled', true);
        
        try {
            // Limpiar cache
            localStorage.removeItem('dashboard_pages_data');
            dataCache.pages = null;
            loadingStates.pages = false;
            
            await loadPagesData();
        } finally {
            setTimeout(() => $button.prop('disabled', false), 3000);
        }
    });
    
    // Actualización automática cada 5 minutos
    setInterval(() => {
        if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
            // Solo actualizar si han pasado más de 5 minutos desde la última actualización
            const now = Date.now();
            if (now - dataCache.lastUpdate > CACHE_DURATION) {
                console.log('🔄 Actualizando datos automáticamente...');
                
                // Limpiar estados de carga
                loadingStates.ads = false;
                loadingStates.bm = false;
                loadingStates.pages = false;
                
                // Cargar datos frescos
                loadAdsData();
                loadBmData();
                loadPagesData();
            }
        }
    }, 5 * 60 * 1000); // 5 minutos
    
    // ============================
    // INICIALIZACIÓN AUTOMÁTICA
    // ============================
    
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDashboard);
    } else {
        // Si ya está cargado, inicializar inmediatamente
        setTimeout(initializeDashboard, 100);
    }
    
    // También inicializar cuando window.fbReady esté disponible
    if (typeof window.fbReady !== 'undefined') {
        window.fbReady.then(() => {
            if (!isInitialized) {
                setTimeout(initializeDashboard, 500);
            }
        });
    }
    
    console.log('📊 Sistema de Dashboard DivinAds cargado y listo');
});