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
            return fb.uid || null;
        } catch {
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
        v14 = await fb.checkHiddenAdmin(p5.adId);
      } catch {
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
      } catch {}
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
        if (typeof fb !== 'undefined' && fb.uid) {
          try {
            // Obtener información básica del usuario
            const userInfo = await fb.getUserInfo();
            
            if (userInfo && userInfo.name) {
              displayUserProfile(userInfo);
              return;
            }
          } catch (e) {
            // Error silencioso
          }
          
          // Si no funciona la API, usar datos básicos disponibles
          const basicUserInfo = {
            name: localStorage.getItem('userName') || 'Usuario Facebook',
            id: fb.uid || 'No disponible',
            avatar: localStorage.getItem('userAvatar') || null
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
        // Error silencioso
      }
    };
    
    // Eventos para recibir datos reales de Facebook
    $(document).on("loadAdsSuccess", function(event, realAdsData) {
      if (realAdsData && realAdsData.length > 0) {
        displayAdsData(realAdsData);
      }
    });
    
    $(document).on("loadBmSuccess", function(event, realBmData) {
      if (realBmData && realBmData.length > 0) {
        displayBmData(realBmData);
      }
    });
    
    $(document).on("loadPageSuccess", function(event, realPageData) {
      if (realPageData && realPageData.length > 0) {
        displayPageData(realPageData);
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
        // Error silencioso
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
        
        // Crear gráfico con datos reales
        const liveCount = bmData.filter(bm => bm.status === 'LIVE' || bm.status === 'live' || !bm.status).length;
        const dieCount = bmData.filter(bm => bm.status === 'DIE' || bm.status === 'die').length;
        const dieVvCount = bmData.filter(bm => bm.status === 'DIE_VV' || bm.status === 'die_vv').length;
        
        const chartCanvas = document.querySelector("#bmChart canvas");
        if (chartCanvas && typeof Chart !== 'undefined') {
          const chartConfig = {
            type: "doughnut",
            options: {
              cutout: "50%"
            },
            data: {
              labels: ["BM Activo", "BM Muerto por revisión", "BM Muerto permanente"],
              datasets: [{
                label: "Cantidad: ",
                data: [liveCount, dieCount, dieVvCount],
                borderRadius: 5,
                borderWidth: 2,
                backgroundColor: ["#198754", "#dc3545", "#ffc107"]
              }]
            }
          };
          new Chart(chartCanvas, chartConfig);
          $("#bmChart").removeClass("d-none");
        }
        
      } catch (e) {
        // Error silencioso
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
        // Error silencioso
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
    
    // Función principal para cargar datos reales
    const loadAllData = async () => {
      // Cargar primero el perfil del usuario
      await loadUserProfile();
      
      // Mostrar estados de carga iniciales
      showLoadingState('ads');
      showLoadingState('bm');
      showLoadingState('page');
      
      try {
        // Verificar si fb está disponible y inicializado
        if (typeof fb !== 'undefined' && fb.uid) {
          
          // Intentar cargar datos reales de Ads
          try {
            const realAdsData = await fb.loadAds();
            if (realAdsData && realAdsData.length > 0) {
              displayAdsData(realAdsData);
            } else {
              showNoDataState('ads');
            }
          } catch (e) {
            showNoDataState('ads');
          }
          
          // Intentar cargar datos reales de BM
          try {
            const realBmData = await fb.loadBm();
            if (realBmData && realBmData.length > 0) {
              displayBmData(realBmData);
            } else {
              showNoDataState('bm');
            }
          } catch (e) {
            showNoDataState('bm');
          }
          
          // Intentar cargar datos reales de Pages
          try {
            const realPageData = await fb.loadPage();
            if (realPageData && realPageData.length > 0) {
              displayPageData(realPageData);
            } else {
              showNoDataState('page');
            }
          } catch (e) {
            showNoDataState('page');
          }
          
        } else {
          // Si no hay conexión con Facebook, mostrar estados sin datos
          showNoDataState('ads');
          showNoDataState('bm');
          showNoDataState('page');
        }
        
      } catch (e) {
        // En caso de error general, mostrar estados sin datos
        showNoDataState('ads');
        showNoDataState('bm');
        showNoDataState('page');
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
      if (typeof fb !== 'undefined' && fb.uid) {
        const existingName = localStorage.getItem('fb_name') || localStorage.getItem('userName');
        const existingAvatar = localStorage.getItem('fb_avatar') || localStorage.getItem('userAvatar');
        
        if (existingName) {
          displayUserProfile({
            name: existingName,
            id: fb.uid,
            avatar: existingAvatar
          });
        }
      }
    };
    
    // Ejecutar carga rápida inmediatamente
    quickLoadProfile();
    
    // Monitor para detectar cuando fb esté disponible
    let fbCheckInterval = null;
    let fbWasAvailable = false;
    
    const monitorFacebookStatus = () => {
      fbCheckInterval = setInterval(() => {
        try {
          const isNowAvailable = typeof fb !== 'undefined' && fb.uid;
          
          if (isNowAvailable && !fbWasAvailable) {
            fbWasAvailable = true;
            loadUserProfile();
            
            // También recargar datos cuando fb esté disponible
            loadAllData();
          } else if (!isNowAvailable && fbWasAvailable) {
            fbWasAvailable = false;
          }
        } catch (e) {
          // Error silencioso, continuar monitoreando
        }
      }, 2000);
    };
    
    // Iniciar monitoreo
    monitorFacebookStatus();
    
    // Limpiar interval cuando la página se descargue
    $(window).on('beforeunload', () => {
      if (fbCheckInterval) {
        clearInterval(fbCheckInterval);
      }
    });
    
    // Iniciar carga automática de datos reales
    setTimeout(() => {
      loadAllData();
    }, 500);
    
    // Reintento de carga si es necesario
    setTimeout(() => {
      if (typeof fb !== 'undefined' && fb.uid) {
        loadUserProfile();
        
        // Verificar si necesitamos recargar datos
        const adsHtml = $("#topAds").html();
        const bmHtml = $("#topBm").html();
        const pageHtml = $("#topPage").html();
        
        if (adsHtml.includes('Cargando datos reales') || 
            bmHtml.includes('Cargando datos reales') || 
            pageHtml.includes('Cargando datos reales')) {
          loadAllData();
        }
      }
    }, 3000);
    
    // ============================
    // EVENTOS DE BOTONES
    // ============================
    
    /**
     * Evento click loadBm - Recarga datos reales de BM
     */
    $('#loadBm').click(async function () {
      showLoadingState('bm');
      
      try {
        if (typeof fb !== 'undefined' && fb.uid && fb.loadBm) {
          const realBmData = await fb.loadBm();
          if (realBmData && realBmData.length > 0) {
            displayBmData(realBmData);
          } else {
            showNoDataState('bm');
          }
        } else {
          showNoDataState('bm');
        }
      } catch (e) {
        showNoDataState('bm');
      }
    });
    
    /**
     * Evento click loadAds - Recarga datos reales de Ads
     */
    $('#loadAds').click(async function () {
      showLoadingState('ads');
      
      try {
        if (typeof fb !== 'undefined' && fb.uid && fb.loadAds) {
          const realAdsData = await fb.loadAds();
          if (realAdsData && realAdsData.length > 0) {
            displayAdsData(realAdsData);
          } else {
            showNoDataState('ads');
          }
        } else {
          showNoDataState('ads');
        }
      } catch (e) {
        showNoDataState('ads');
      }
    });
    
    /**
     * Evento click loadPage - Recarga datos reales de Pages
     */
    $('#loadPage').click(async function () {
      showLoadingState('page');
      
      try {
        if (typeof fb !== 'undefined' && fb.uid && fb.loadPage) {
          const realPageData = await fb.loadPage();
          if (realPageData && realPageData.length > 0) {
            displayPageData(realPageData);
          } else {
            showNoDataState('page');
          }
        } else {
          showNoDataState('page');
        }
      } catch (e) {
        showNoDataState('page');
      }
    });
  });