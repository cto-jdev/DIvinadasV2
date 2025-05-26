/**
 * Evento ready principal
 * Descripción: Inicializa la vista de cuentas, BM y páginas, actualiza los datos y gráficos, y gestiona la selección de cuentas Ads.
 */
$(document).ready(async function () {
    await window.fbReady;
    let v12;
    
    // Función para obtener UID real del usuario
    const getUserId = () => {
        try {
            return window.fb?.uid || null;
        } catch (error) {
            console.warn('Error obteniendo UID:', error);
            return null;
        }
    };
    
    const vF4 = async p5 => {
      $("#adName").text(p5.account);
      $("#adId").text(p5.adId);
      $("#adImage").html("<span style=\"width:40px;height:40px;font-size:18px\" class=\"avatar-letter\" data-letter=\"" + p5.account.substring(0, 1).toUpperCase() + "\"></span>");
      let vLS = "";
      if (p5.status == 101) {
        vLS = "<span class=\"badge text-bg-success\">Cerrado</span>";
      }
      if (p5.status == 999) {
        vLS = "<span class=\"badge text-bg-info\">En espera</span>";
      }
      if (p5.status == 1 || p5.status == 100) {
        vLS = "<span class=\"badge text-bg-success\">Activo</span>";
      }
      if (p5.status == 2) {
        vLS = "<span class=\"badge text-bg-danger\">Deshabilitado</span>";
      }
      if (p5.status == 3) {
        vLS = "<span class=\"badge text-bg-warning\">Pago pendiente</span>";
      }
      if (p5.status == 4) {
        vLS = "<span class=\"badge text-bg-warning\">Apelando 3 líneas</span>";
      }
      if (p5.status == 5) {
        vLS = "<span class=\"badge text-bg-danger\">Muerto 3 líneas</span>";
      }
      if (p5.status == 6) {
        vLS = "<span class=\"badge text-bg-warning\">Muerto por revisión</span>";
      }
      if (p5.status == 7) {
        vLS = "<span class=\"badge text-bg-warning\">Muerto permanente</span>";
      }
      const v13 = p5.currency.split("-")[0];
      let v14 = [];
      try {
        if (typeof window.fb !== 'undefined' && window.fb && typeof window.fb.checkHiddenAdmin === 'function') {
          v14 = await window.fb.checkHiddenAdmin(p5.adId);
        }
      } catch (error) {
        console.warn('Error verificando admin oculto:', error);
        v14 = [];
      }
      $("#t8").text(v14.length);
      $("#t1").html(vLS);
      $("#t2").html(p5.limit + " " + v13);
      $("#t3").html(p5.remain + " " + v13);
      $("#t4").html(p5.spend + " " + v13);
      $("#t5").html(p5.balance + " " + v13);
      $("#t6").html(p5.createdTime);
      $("#t7").html(p5.nextBillDate);
      $("#t9").html(p5.type);
      $("#t10").html(p5.timezone);
      let vLS2 = "";
      try {
        vLS2 = JSON.parse(p5.payment)[0];
        if (vLS2.credential.card_association) {
          vLS2 = vLS2.credential.card_association + " - " + vLS2.credential.last_four_digits || "";
        }
      } catch {}
      $("#t11").html(vLS2);
      $("#t12").html(p5.role);
    };
    
    setInterval(async () => {
      if ($("body").hasClass("setting-loaded")) {
        saveSetting();
      }
    }, 2000);
    
    const vSetInterval = setInterval(async () => {
      try {
        await vF5();
      } catch (error) {
        console.warn('Error en intervalo de verificación:', error);
      }
    }, 5000);
    
    const vF5 = () => {
      return new Promise(async (p6, p7) => {
        try {
          const v15 = await checkUser();
          if (v15.success) {
            // Actualizar información de balance/saldo real
            $("#balanceTitle").text("Saldo de cuenta");
            const realBalance = v15.balance || v15.data?.balance || '$0.00';
            $("#balanceValue").html(`<strong class="fs-2">${realBalance}</strong>`);
            $("#balanceIcon").html(`<i class="ri-wallet-line fs-3" style="color: #ff6384"></i>`);
            
            clearInterval(vSetInterval);
            p6();
          } else {
            // Si no hay datos reales, mostrar estado sin conexión
            $("#balanceValue").html(`<span class="text-muted">Sin conexión</span>`);
            p7();
          }
        } catch (e) {
          p7();
        }
      });
    };
    
    try {
      await vF5();
    } catch {}
    
    // ============================
    // SISTEMA DE CARGA DE DATOS REALES
    // ============================
    
    // Función para cargar información real del usuario
    const loadUserProfile = async () => {
      try {
        // Intentar obtener datos reales del usuario de Facebook
        if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
          try {
            // Obtener información básica del usuario
            if (typeof window.fb.getUserInfo === 'function') {
              const userInfo = await window.fb.getUserInfo();
              
              if (userInfo && userInfo.name) {
                displayUserProfile(userInfo);
                return;
              }
            }
          } catch (e) {
            console.warn('Error obteniendo información del usuario:', e);
          }
          
          // Si no funciona la API, usar datos básicos disponibles
          const basicUserInfo = {
            name: localStorage.getItem('userName') || window.fb.userInfo?.name || 'Usuario Facebook',
            id: window.fb.uid || 'No disponible',
            avatar: localStorage.getItem('userAvatar') || window.fb.userInfo?.picture?.data?.url || null
          };
          
          displayUserProfile(basicUserInfo);
          
        } else {
          // Información mínima cuando no hay sesión
          const defaultUserInfo = {
            name: 'Usuario',
            id: 'No conectado',
            avatar: null
          };
          displayUserProfile(defaultUserInfo);
        }
        
      } catch (e) {
        // Mostrar información mínima en caso de error
        displayUserProfile({
          name: 'Usuario',
          id: 'No disponible',
          avatar: null
        });
      }
    };
    
    // Función para mostrar la información del usuario en la interfaz
    const displayUserProfile = (userInfo) => {
      try {
        // Ocultar skeletons
        $('#userAvatarSkeleton').addClass('d-none');
        $('#userNameSkeleton').addClass('d-none');
        $('#userIdSkeleton').addClass('d-none');
        
        // Mostrar avatar
        if (userInfo.avatar) {
          $('#userAvatar').attr('src', userInfo.avatar).removeClass('d-none');
        } else {
          // Si no hay avatar, mostrar avatar por defecto o inicial
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
    
    // Eventos para recibir datos reales de Facebook
    $(document).on("loadAdsSuccess", function(event, realAdsData) {
      if (realAdsData && realAdsData.length > 0) {
        localStorage.setItem('dashboard_ads_data', JSON.stringify(realAdsData));
        displayAdsData(realAdsData);
      } else {
        showNoDataState('ads');
      }
    });
    
    $(document).on("loadBmSuccess", function(event, realBmData) {
      if (realBmData && realBmData.length > 0) {
        localStorage.setItem('dashboard_bm_data', JSON.stringify(realBmData));
        displayBmData(realBmData);
      } else {
        showNoDataState('bm');
      }
    });
    
    $(document).on("loadPageSuccess", function(event, realPageData) {
      if (realPageData && realPageData.length > 0) {
        localStorage.setItem('dashboard_pages_data', JSON.stringify(realPageData));
        displayPageData(realPageData);
      } else {
        showNoDataState('page');
      }
    });
    
    // Eventos adicionales para otros tipos de datos BM
    $(document).on("loadBmSuccess3", function(event, realBmData) {
      if (realBmData && realBmData.length > 0) {
        localStorage.setItem('dashboard_bm_data', JSON.stringify(realBmData));
        displayBmData(realBmData);
      }
    });
    
    $(document).on("loadBmSuccess2", function(event, realBmData) {
      if (realBmData && realBmData.length > 0) {
        localStorage.setItem('dashboard_bm_data', JSON.stringify(realBmData));
        displayBmData(realBmData);
      }
    });
    
    // Eventos para datos guardados
    $(document).on("loadSavedAds", function(event, savedAdsData) {
      if (savedAdsData && savedAdsData.length > 0) {
        displayAdsData(savedAdsData);
      }
    });
    
    $(document).on("loadSavedBm", function(event, savedBmData) {
      if (savedBmData && savedBmData.length > 0) {
        displayBmData(savedBmData);
      }
    });
    
    $(document).on("loadSavedPage", function(event, savedPageData) {
      if (savedPageData && savedPageData.length > 0) {
        displayPageData(savedPageData);
      }
    });
    
    // Función para mostrar datos de Ads reales
    const displayAdsData = (adsData) => {
      try {
        $("#countAds").text(adsData.length);
        
        let vLS3 = "";
        adsData.sort((a, b) => {
          const spendA = parseInt((a.spend || '0').toString().replace(/,/g, ''));
          const spendB = parseInt((b.spend || '0').toString().replace(/,/g, ''));
          return spendB - spendA;
        }).slice(0, 4).forEach(ad => {
          const displaySpend = ad.spend || '0';
          const currency = ad.currency ? ad.currency.split('-')[0] : '$';
          vLS3 += `
                        <div class="border-bottom opacity-50"></div>
                        <a href="https://business.facebook.com/billing_hub/payment_settings/?asset_id=${ad.adId}" target="_BLANK" class="text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link">
                            <div class="d-flex align-items-center" style="width: calc(100% - 60px);">
                                <span class="avatar-letter" data-letter="${(ad.account || ad.name || 'A').replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase()}"></span>
                                <div class="d-flex flex-column ps-3" style="line-height: initial; width: calc(100% - 30px)">
                                    <strong class="text-truncate pe-1" style="font-size: 14px; margin-bottom: 3px">${ad.account || ad.name || 'Cuenta sin nombre'}</strong>
                                    <span>${ad.adId || ad.id}</span>
                                </div>
                            </div>
                            <div class="text-end">
                                <strong style="margin-bottom: 3px" class="d-block">Gasto total</strong>
                                <span class="badge text-bg-success">${currency}${displaySpend}</span>
                            </div>
                        </a>
                    `;
        });
        $("#topAds").html(vLS3);
        
        // Configurar select2 para datos reales
        if (typeof $.fn.select2 !== 'undefined') {
          $("#adSelect select").select2({
            data: adsData.map(ad => ({
              id: ad.adId || ad.id,
              text: ad.account || ad.name || 'Cuenta sin nombre',
              adId: ad.adId || ad.id
            })),
            templateSelection: function (data) {
              return $(`
                            <div class="d-flex align-items-center">
                                <span class="avatar-letter" data-letter="${data.text.substring(0, 1).toUpperCase()}"></span>
                                <div class="d-flex flex-column ps-2 text-black text-decoration-none" style="line-height: initial; width: calc(100% - 30px)">
                                    <strong class="text-truncate pe-1" style="font-size: 13px; margin-bottom: 3px">${data.text}</strong>
                                    <span style="font-size: 13px;">${data.id}</span>
                                </div>
                            </div>
                        `);
            },
            templateResult: function (data) {
              return $(`
                            <div class="d-flex align-items-center">
                                <span class="avatar-letter" data-letter="${data.text.substring(0, 1).toUpperCase()}"></span>
                                <div class="d-flex flex-column ps-2 text-black text-decoration-none" style="line-height: initial; width: calc(100% - 30px)">
                                    <strong class="text-truncate pe-1" style="font-size: 13px; margin-bottom: 3px">${data.text}</strong>
                                    <span style="font-size: 13px;">${data.id}</span>
                                </div>
                            </div>
                        `);
            }
          });
          
          $("#adSelect select").on("select2:select", function (e) {
            const selectedAd = adsData.find(ad => (ad.adId || ad.id) === e.params.data.id);
            if (selectedAd) {
              vF4(selectedAd);
            }
          });
          
          // Mostrar el primer elemento por defecto
          if (adsData[0]) {
            try {
              vF4(adsData[0]);
            } catch {}
          }
        }
        
        $("#adData").removeClass("d-none");
        
      } catch (e) {
        console.warn('Error en displayAdsData:', e);
      }
    };
    
    // Función para mostrar datos de BM reales
    const displayBmData = (bmData) => {
      try {
        $("#countBm").text(bmData.length);
        
        let vLS4 = "";
        bmData.slice(0, 4).forEach(bm => {
          const bmType = bm.bmType || bm.type || (bm.limit ? `BM${bm.limit}` : 'BM');
          vLS4 += `
                        <div class="border-bottom opacity-50"></div>
                        <a href="https://business.facebook.com/settings/?business_id=${bm.bmId || bm.id}" target="_BLANK" class="text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link">
                            <div class="d-flex align-items-center" style="width: calc(100% - 50px);">
                                <span class="avatar-letter" data-letter="${(bm.name || 'B').replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase()}"></span>
                                <div class="d-flex flex-column ps-3" style="line-height: initial; width: calc(100% - 30px)">
                                    <strong class="text-truncate pe-1" style="font-size: 14px; margin-bottom: 3px">${bm.name || 'Business Manager'}</strong>
                                    <span>${bm.bmId || bm.id}</span>
                                </div>
                            </div>
                            <div class="text-end">
                                <strong style="margin-bottom: 3px" class="d-block">Tipo de BM</strong>
                                <span class="badge text-bg-success">${bmType.split(' - ')[0]}</span>
                            </div>
                        </a>
                    `;
        });
        $("#topBm").html(vLS4);
        
        // Crear gráfico con datos reales de forma estable
        const liveCount = bmData.filter(bm => bm.status === 'LIVE' || bm.status === 'live' || !bm.status).length;
        const dieCount = bmData.filter(bm => bm.status === 'DIE' || bm.status === 'die').length;
        const dieVvCount = bmData.filter(bm => bm.status === 'DIE_VV' || bm.status === 'die_vv').length;
        
        // Solo crear gráfico si hay datos válidos
        if (liveCount > 0 || dieCount > 0 || dieVvCount > 0) {
          const chartCanvas = document.querySelector("#bmChart canvas");
          if (chartCanvas && typeof Chart !== 'undefined') {
            // Limpiar gráfico anterior si existe
            const existingChart = Chart.getChart(chartCanvas);
            if (existingChart) {
              existingChart.destroy();
            }
            
            const chartConfig = {
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
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed * 100) / total).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      }
                    }
                  }
                },
                animation: {
                  animateRotate: true,
                  animateScale: true,
                  duration: 1000,
                  easing: 'easeInOutQuart'
                }
              },
              data: {
                labels: ["BM Activo", "BM Muerto por revisión", "BM Muerto permanente"],
                datasets: [{
                  label: "Cantidad: ",
                  data: [liveCount, dieCount, dieVvCount],
                  borderRadius: 8,
                  borderWidth: 3,
                  backgroundColor: ["#198754", "#dc3545", "#ffc107"],
                  borderColor: ["#ffffff", "#ffffff", "#ffffff"],
                  hoverBackgroundColor: ["#157347", "#bb2d3b", "#ffca2c"],
                  hoverBorderWidth: 4
                }]
              }
            };
            
            new Chart(chartCanvas, chartConfig);
            $("#bmChart").removeClass("d-none");
          }
        } else {
          // Si no hay datos, ocultar el gráfico
          $("#bmChart").addClass("d-none");
        }
        
      } catch (e) {
        console.warn('Error en displayBmData:', e);
      }
    };
    
    // Función para mostrar datos de Pages reales
    const displayPageData = (pageData) => {
      try {
        $("#countPage").text(pageData.length || 0);
        
        let vLS5 = "";
        pageData.sort((a, b) => {
          const likesA = parseInt((a.likes || a.like || a.followers_count || '0').toString().replace(/,/g, ''));
          const likesB = parseInt((b.likes || b.like || b.followers_count || '0').toString().replace(/,/g, ''));
          return likesB - likesA;
        }).slice(0, 4).forEach(page => {
          const likes = page.likes || page.like || page.followers_count || '0';
          vLS5 += `
                        <div class="border-bottom opacity-50"></div>
                        <a href="https://www.facebook.com/profile.php?id=${page.pageId || page.id}" target="_BLANK" class="text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link">
                            <div class="d-flex align-items-center" style="width: calc(100% - 60px);">
                                <span class="avatar-letter" data-letter="${(page.name || 'P').replace(/[^a-zA-Z0-9]/g, '').substring(0, 1).toUpperCase()}"></span>
                                <div class="d-flex flex-column ps-3" style="line-height: initial; width: calc(100% - 30px)">
                                    <strong class="text-truncate pe-1" style="font-size: 14px; margin-bottom: 3px">${page.name || 'Página sin nombre'}</strong>
                                    <span>${page.pageId || page.id}</span>
                                </div>
                            </div>
                            <div class="text-end">
                                <strong style="margin-bottom: 3px" class="d-block">Me gusta</strong>
                                <span class="badge text-bg-success">${likes}</span>
                            </div>
                        </a>
                    `;
        });
        $("#topPage").html(vLS5);
        
      } catch (e) {
        console.warn('Error en displayPageData:', e);
      }
    };
    
    // Función para mostrar estado de carga
    const showLoadingState = (section) => {
      const loadingHtml = `
        <div class="p-3 border-top text-center">
          <div class="d-flex align-items-center justify-content-center">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <span class="text-muted">Cargando datos reales...</span>
          </div>
        </div>
      `;
      
      switch(section) {
        case 'ads':
          $("#topAds").html(loadingHtml);
          break;
        case 'bm':
          $("#topBm").html(loadingHtml);
          break;
        case 'page':
          $("#topPage").html(loadingHtml);
          break;
      }
    };

    // Función para mostrar estado sin datos
    const showNoDataState = (section) => {
      const noDataHtml = `
        <div class="p-3 border-top text-center">
          <div class="text-muted">
            <i class="ri-information-line fs-4 mb-2 d-block"></i>
            <p class="mb-0">No hay datos disponibles</p>
            <small>Conecta tu cuenta de Facebook para ver información real</small>
          </div>
        </div>
      `;
      
      switch(section) {
        case 'ads':
          $("#topAds").html(noDataHtml);
          break;
        case 'bm':
          $("#topBm").html(noDataHtml);
          break;
        case 'page':
          $("#topPage").html(noDataHtml);
          break;
      }
    };
    

    
    // Función para cargar datos reales desde localStorage
    const loadStoredData = () => {
      try {
        // Intentar cargar datos reales guardados
        const storedAds = localStorage.getItem('dashboard_ads_data');
        const storedBm = localStorage.getItem('dashboard_bm_data');
        const storedPages = localStorage.getItem('dashboard_pages_data');
        
        if (storedAds) {
          const adsData = JSON.parse(storedAds);
          displayAdsData(adsData);
        }
        
        if (storedBm) {
          const bmData = JSON.parse(storedBm);
          displayBmData(bmData);
        }
        
        if (storedPages) {
          const pagesData = JSON.parse(storedPages);
          displayPageData(pagesData);
        }
        
        return {
          hasAds: !!storedAds,
          hasBm: !!storedBm,
          hasPages: !!storedPages
        };
      } catch (e) {
        return { hasAds: false, hasBm: false, hasPages: false };
      }
    };
    

    
    // Función principal para cargar solo datos reales
    const loadAllData = async () => {
      // Cargar primero el perfil del usuario
      await loadUserProfile();
      
      // Intentar cargar datos guardados primero
      const stored = loadStoredData();
      
      // Solo mostrar estados de carga si no hay datos previos
      const hasAdsData = stored.hasAds || ($("#countAds").text() !== "0" && $("#countAds").text() !== "");
      const hasBmData = stored.hasBm || ($("#countBm").text() !== "0" && $("#countBm").text() !== "");
      const hasPageData = stored.hasPages || ($("#countPage").text() !== "0" && $("#countPage").text() !== "");
      
      if (!hasAdsData) showLoadingState('ads');
      if (!hasBmData) showLoadingState('bm');
      if (!hasPageData) showLoadingState('page');
      
      try {
        // Verificar si fb está disponible y inicializado
        if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
          
          // Intentar cargar datos reales de Ads
          if (!hasAdsData) {
            try {
              if (typeof window.fb.loadAds === 'function') {
                await window.fb.loadAds();
                // Los datos se manejan a través de eventos
              } else {
                setTimeout(() => showNoDataState('ads'), 2000);
              }
            } catch (e) {
              setTimeout(() => showNoDataState('ads'), 2000);
            }
          }
          
          // Intentar cargar datos reales de BM
          if (!hasBmData) {
            try {
              if (typeof window.fb.loadBm === 'function') {
                await window.fb.loadBm();
                // Los datos se manejan a través de eventos
              } else {
                setTimeout(() => showNoDataState('bm'), 2000);
              }
            } catch (e) {
              setTimeout(() => showNoDataState('bm'), 2000);
            }
          }
          
          // Intentar cargar datos reales de Pages
          if (!hasPageData) {
            try {
              if (typeof window.fb.loadPage === 'function') {
                await window.fb.loadPage();
                // Los datos se manejan a través de eventos
              } else {
                setTimeout(() => showNoDataState('page'), 2000);
              }
            } catch (e) {
              setTimeout(() => showNoDataState('page'), 2000);
            }
          }
          
        } else {
          // Si no hay conexión con Facebook, mostrar estados sin datos
          setTimeout(() => {
            if (!hasAdsData) showNoDataState('ads');
            if (!hasBmData) showNoDataState('bm');
            if (!hasPageData) showNoDataState('page');
          }, 3000);
        }
        
      } catch (e) {
        // En caso de error general, mostrar estados sin datos
        setTimeout(() => {
          if (!hasAdsData) showNoDataState('ads');
          if (!hasBmData) showNoDataState('bm');
          if (!hasPageData) showNoDataState('page');
        }, 3000);
      }
    };

    
    // Eventos para actualizar perfil cuando cambie información
    $(document).on("userInfoChanged", function(event, userInfo) {
      displayUserProfile(userInfo);
    });
    
    // Evento para recargar perfil cuando se cambie de cuenta
    $(document).on("accountSwitched", function() {
      setTimeout(() => {
        loadUserProfile();
      }, 500);
    });
    
    // Cargar perfil inmediatamente cuando esté disponible
    const quickLoadProfile = async () => {
      // Intentar usar datos ya disponibles en localStorage o variables globales
      if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
        const existingName = localStorage.getItem('fb_name') || localStorage.getItem('userName') || window.fb.userInfo?.name;
        const existingAvatar = localStorage.getItem('fb_avatar') || localStorage.getItem('userAvatar') || window.fb.userInfo?.picture?.data?.url;
        
        if (existingName) {
          displayUserProfile({
            name: existingName,
            id: window.fb.uid,
            avatar: existingAvatar
          });
        }
      }
    };
    
    // Ejecutar carga rápida inmediatamente
    quickLoadProfile();
    
    // Monitor para detectar cuando fb esté disponible de forma estable
    let fbCheckInterval = null;
    let fbWasAvailable = false;
    let lastDataLoadTime = 0;
    
    const monitorFacebookStatus = () => {
      fbCheckInterval = setInterval(() => {
        try {
          const isNowAvailable = typeof window.fb !== 'undefined' && window.fb && window.fb.uid;
          const currentTime = Date.now();
          
          if (isNowAvailable && !fbWasAvailable) {
            fbWasAvailable = true;
            loadUserProfile();
            
            // Solo recargar datos si han pasado al menos 10 segundos desde la última carga
            if (currentTime - lastDataLoadTime > 10000) {
              lastDataLoadTime = currentTime;
              
              // Verificar si realmente necesitamos cargar datos
              const hasAnyData = $("#countAds").text() !== "0" || $("#countBm").text() !== "0" || $("#countPage").text() !== "0";
              
              if (!hasAnyData) {
                loadAllData();
              }
            }
          } else if (!isNowAvailable && fbWasAvailable) {
            fbWasAvailable = false;
          }
        } catch (e) {
          // Error silencioso, continuar monitoreando
        }
      }, 5000); // Aumentar intervalo para ser menos agresivo
    };
    
    // Iniciar monitoreo
    monitorFacebookStatus();
    
    // Limpiar interval cuando la página se descargue
    $(window).on('beforeunload', () => {
      if (fbCheckInterval) {
        clearInterval(fbCheckInterval);
      }
    });
    
    // Limpiar cualquier dato de muestra que pueda existir
    const clearSampleData = () => {
      try {
        // Solo limpiar si los datos parecen ser de muestra
        const storedAds = localStorage.getItem('dashboard_ads_data');
        const storedBm = localStorage.getItem('dashboard_bm_data');
        const storedPages = localStorage.getItem('dashboard_pages_data');
        
        if (storedAds) {
          const adsData = JSON.parse(storedAds);
          // Verificar si son datos de muestra (por ID conocido)
          if (adsData.some(ad => ad.adId === '1234567890123456' || ad.adId === '2345678901234567')) {
            localStorage.removeItem('dashboard_ads_data');
          }
        }
        
        if (storedBm) {
          const bmData = JSON.parse(storedBm);
          // Verificar si son datos de muestra
          if (bmData.some(bm => bm.bmId === '297391731418010916' || bm.name === 'BM Cuentas Publicitarias')) {
            localStorage.removeItem('dashboard_bm_data');
          }
        }
        
        if (storedPages) {
          const pagesData = JSON.parse(storedPages);
          // Verificar si son datos de muestra
          if (pagesData.some(page => page.pageId === '123456789012345' || page.name === 'Página Principal Marketing')) {
            localStorage.removeItem('dashboard_pages_data');
          }
        }
      } catch (e) {
        // Error silencioso
      }
    };
    
    // Limpiar datos de muestra al iniciar
    clearSampleData();
    
    // Iniciar carga automática de datos reales únicamente
    setTimeout(() => {
      loadAllData();
      lastDataLoadTime = Date.now();
    }, 500);
    
    // Reintento de carga solo si es realmente necesario
    setTimeout(() => {
      if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
        loadUserProfile();
        
        // Solo verificar si hay estados de carga activos
        const adsHtml = $("#topAds").html();
        const bmHtml = $("#topBm").html();
        const pageHtml = $("#topPage").html();
        
        const isStillLoading = (adsHtml && adsHtml.includes('Cargando datos reales')) || 
                              (bmHtml && bmHtml.includes('Cargando datos reales')) || 
                              (pageHtml && pageHtml.includes('Cargando datos reales'));
        
        if (isStillLoading) {
          // Solo recargar las secciones que están cargando
          if (adsHtml && adsHtml.includes('Cargando datos reales')) {
            showNoDataState('ads');
          }
          if (bmHtml && bmHtml.includes('Cargando datos reales')) {
            showNoDataState('bm');
          }
          if (pageHtml && pageHtml.includes('Cargando datos reales')) {
            showNoDataState('page');
          }
        }
      }
    }, 5000);
    
    // ============================
    // EVENTOS DE BOTONES
    // ============================
    
    /**
     * Evento click loadBm - Recarga datos reales de BM de forma estable
     */
    $(document).on('click', '#loadBm', async function () {
      const $button = $(this);
      $button.prop('disabled', true);
      
      showLoadingState('bm');
      
      try {
        if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
          // Limpiar datos anteriores
          localStorage.removeItem('dashboard_bm_data');
          
          if (typeof window.fb.loadBm === 'function') {
            await window.fb.loadBm();
            // Los datos se manejan a través de eventos
          } else {
            setTimeout(() => showNoDataState('bm'), 2000);
          }
        } else {
          setTimeout(() => showNoDataState('bm'), 2000);
        }
      } catch (e) {
        setTimeout(() => showNoDataState('bm'), 2000);
      } finally {
        setTimeout(() => $button.prop('disabled', false), 3000);
      }
    });
    
    /**
     * Evento click loadAds - Recarga datos reales de Ads de forma estable
     */
    $(document).on('click', '#loadAds', async function () {
      const $button = $(this);
      $button.prop('disabled', true);
      
      showLoadingState('ads');
      
      try {
        if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
          // Limpiar datos anteriores
          localStorage.removeItem('dashboard_ads_data');
          
          if (typeof window.fb.loadAds === 'function') {
            await window.fb.loadAds();
            // Los datos se manejan a través de eventos
          } else {
            setTimeout(() => showNoDataState('ads'), 2000);
          }
        } else {
          setTimeout(() => showNoDataState('ads'), 2000);
        }
      } catch (e) {
        setTimeout(() => showNoDataState('ads'), 2000);
      } finally {
        setTimeout(() => $button.prop('disabled', false), 3000);
      }
    });
    
    /**
     * Evento click loadPage - Recarga datos reales de Pages de forma estable
     */
    $(document).on('click', '#loadPage', async function () {
      const $button = $(this);
      $button.prop('disabled', true);
      
      showLoadingState('page');
      
      try {
        if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
          // Limpiar datos anteriores
          localStorage.removeItem('dashboard_pages_data');
          
          if (typeof window.fb.loadPage === 'function') {
            await window.fb.loadPage();
            // Los datos se manejan a través de eventos
          } else {
            setTimeout(() => showNoDataState('page'), 2000);
          }
        } else {
          setTimeout(() => showNoDataState('page'), 2000);
        }
      } catch (e) {
        setTimeout(() => showNoDataState('page'), 2000);
      } finally {
        setTimeout(() => $button.prop('disabled', false), 3000);
      }
    });
  });