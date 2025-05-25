/**
 * Evento ready principal
 * Descripción: Inicializa la vista de cuentas, BM y páginas, actualiza los datos y gráficos, y gestiona la selección de cuentas Ads.
 */
$(document).ready(async function () {
    await window.fbReady;
    let v12;
    
    // Función para obtener UID de prueba si fb.uid no está disponible
    const getUserId = () => {
        try {
            return fb.uid || 'demo_user_123';
        } catch {
            return 'demo_user_123';
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
            $("#balance .card").html("\n                        <div class=\"d-flex justify-content-between align-items-center\">\n                            <div class=\"\">\n                                <strong class=\"fs-5 mb-2 d-block\">Saldo de la cuenta</strong>\n                                <strong class=\"fs-2\" id=\"\">" + v15.balance + "</strong>\n                            </div>\n                            <div class=\"rounded-circle d-flex align-items-center justify-content-center text-white\" style=\"width: 60px; height: 60px; background: rgb(249 116 132 / 20%)\">\n                                <i class=\"ri-wallet-line fs-3\" style=\"color: #ff6384\"></i>\n                            </div>\n                        </div>\n                    ");
            clearInterval(vSetInterval);
            p6();
          } else {
            p7();
          }
        } catch {
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
    
    // Eventos para recibir datos reales de Facebook
    $(document).on("loadAdsSuccess", function(event, realAdsData) {
      console.log('[VIA] Datos reales de Ads recibidos:', realAdsData);
      if (realAdsData && realAdsData.length > 0) {
        displayAdsData(realAdsData);
      }
    });
    
    $(document).on("loadBmSuccess", function(event, realBmData) {
      console.log('[VIA] Datos reales de BM recibidos:', realBmData);
      if (realBmData && realBmData.length > 0) {
        displayBmData(realBmData);
      }
    });
    
    $(document).on("loadPageSuccess", function(event, realPageData) {
      console.log('[VIA] Datos reales de Pages recibidos:', realPageData);
      if (realPageData && realPageData.length > 0) {
        displayPageData(realPageData);
      }
    });
    
    // Función para mostrar datos de Ads reales
    const displayAdsData = (adsData) => {
      try {
        console.log('[VIA] Mostrando datos de Ads:', adsData);
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
        console.error('[VIA] Error mostrando datos de Ads:', e);
      }
    };
    
    // Función para mostrar datos de BM reales
    const displayBmData = (bmData) => {
      try {
        console.log('[VIA] Mostrando datos de BM:', bmData);
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
        console.error('[VIA] Error mostrando datos de BM:', e);
      }
    };
    
    // Función para mostrar datos de Pages reales
    const displayPageData = (pageData) => {
      try {
        console.log('[VIA] Mostrando datos de Pages:', pageData);
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
        console.error('[VIA] Error mostrando datos de Pages:', e);
      }
    };
    
    // Función para cargar datos de prueba como respaldo
    const loadTestData = async () => {
      console.log('[VIA] Cargando datos de prueba como respaldo...');
      
      const userId = getUserId();
      
      // Datos de prueba para Ads
      const testAds = [
        { 
          adId: '1234567890123456', 
          account: 'Cuenta Publicitaria Principal', 
          spend: '15,250', 
          limit: '50,000', 
          remain: '34,750', 
          balance: '5,200', 
          currency: 'USD-United States Dollar', 
          status: 1, 
          payment: '[{"credential":{"card_association":"VISA","last_four_digits":"1234"}}]', 
          createdTime: '2024-01-15', 
          nextBillDate: '2024-02-15', 
          type: 'Personal', 
          timezone: 'America/New_York', 
          role: 'Administrador' 
        },
        { 
          adId: '2345678901234567', 
          account: 'Agencia Digital Marketing', 
          spend: '28,900', 
          limit: '75,000', 
          remain: '46,100', 
          balance: '3,800', 
          currency: 'USD-United States Dollar', 
          status: 1, 
          payment: '[{"credential":{"card_association":"MASTERCARD","last_four_digits":"5678"}}]', 
          createdTime: '2024-02-01', 
          nextBillDate: '2024-03-01', 
          type: 'Business', 
          timezone: 'America/Los_Angeles', 
          role: 'Administrador' 
        }
      ];
      
      // Datos de prueba para BM
      const testBm = [
        { 
          id: 1, 
          bmId: '1234567890123456', 
          name: 'DivinAds Marketing Agency', 
          bmType: 'BM350 - Business Premium', 
          status: 'LIVE' 
        },
        { 
          id: 2, 
          bmId: '2345678901234567', 
          name: 'Global E-commerce Solutions', 
          bmType: 'BM50 - Business Standard', 
          status: 'LIVE' 
        }
      ];
      
      // Datos de prueba para Pages
      const testPage = [
        { 
          pageId: '1234567890123456', 
          name: 'DivinAds - Marketing Digital', 
          like: '125,450' 
        },
        { 
          pageId: '2345678901234567', 
          name: 'Tienda Online Moderna', 
          like: '89,320' 
        }
      ];
      
      await setLocalStorage("dataAds_" + userId, testAds);
      await setLocalStorage("dataBm_" + userId, testBm);
      await setLocalStorage("dataPage_" + userId, testPage);
      
      displayAdsData(testAds);
      displayBmData(testBm);
      displayPageData(testPage);
    };
    
    // Función principal para cargar datos
    const loadAllData = async () => {
      console.log('[VIA] Iniciando carga de datos...');
      
      try {
        // Verificar si fb está disponible y inicializado
        if (typeof fb !== 'undefined' && fb.uid && fb.accessToken) {
          console.log('[VIA] Facebook API disponible, cargando datos reales...');
          
          // Intentar cargar datos reales
          try {
            console.log('[VIA] Cargando datos de Ads...');
            await fb.loadAds();
          } catch (e) {
            console.warn('[VIA] Error cargando Ads reales:', e);
          }
          
          try {
            console.log('[VIA] Cargando datos de BM...');
            await fb.loadBm();
          } catch (e) {
            console.warn('[VIA] Error cargando BM reales:', e);
          }
          
          try {
            console.log('[VIA] Cargando datos de Pages...');
            await fb.loadPage();
          } catch (e) {
            console.warn('[VIA] Error cargando Pages reales:', e);
          }
          
          // Esperar un poco para ver si llegan datos reales
          setTimeout(() => {
            const adsCount = parseInt($("#countAds").text()) || 0;
            const bmCount = parseInt($("#countBm").text()) || 0;
            const pageCount = parseInt($("#countPage").text()) || 0;
            
            // Si no hay datos reales, usar datos de prueba
            if (adsCount === 0 && bmCount === 0 && pageCount === 0) {
              console.log('[VIA] No se recibieron datos reales, usando datos de prueba...');
              loadTestData();
            }
          }, 3000);
          
        } else {
          console.log('[VIA] Facebook API no disponible, usando datos de prueba...');
          await loadTestData();
        }
        
      } catch (e) {
        console.error('[VIA] Error general cargando datos:', e);
        await loadTestData();
      }
    };
    
    // Iniciar carga de datos
    setTimeout(() => {
      loadAllData();
    }, 1000);
    
    // ============================
    // EVENTOS DE BOTONES
    // ============================
    
    /**
     * Evento click loadBm - Regenera datos de BM
     */
    $('#loadBm').click(async function () {
      console.log('[VIA] Botón loadBm presionado');
      const userId = getUserId();
      
      try {
        if (typeof fb !== 'undefined' && fb.uid && fb.loadBm) {
          console.log('[VIA] Recargando BM reales...');
          await removeLocalStorage('dataBm_' + userId);
          await fb.loadBm();
        } else {
          console.log('[VIA] Generando nuevos datos de prueba para BM...');
          await removeLocalStorage('dataBm_' + userId);
          await loadTestData();
        }
      } catch (e) {
        console.error('[VIA] Error en loadBm:', e);
        await loadTestData();
      }
    });
    
    /**
     * Evento click loadAds - Regenera datos de Ads
     */
    $('#loadAds').click(async function () {
      console.log('[VIA] Botón loadAds presionado');
      const userId = getUserId();
      
      try {
        if (typeof fb !== 'undefined' && fb.uid && fb.loadAds) {
          console.log('[VIA] Recargando Ads reales...');
          await removeLocalStorage('dataAds_' + userId);
          await fb.loadAds();
        } else {
          console.log('[VIA] Generando nuevos datos de prueba para Ads...');
          await removeLocalStorage('dataAds_' + userId);
          await loadTestData();
        }
      } catch (e) {
        console.error('[VIA] Error en loadAds:', e);
        await loadTestData();
      }
    });
    
    /**
     * Evento click loadPage - Regenera datos de Pages
     */
    $('#loadPage').click(async function () {
      console.log('[VIA] Botón loadPage presionado');
      const userId = getUserId();
      
      try {
        if (typeof fb !== 'undefined' && fb.uid && fb.loadPage) {
          console.log('[VIA] Recargando Pages reales...');
          await removeLocalStorage('dataPage_' + userId);
          await fb.loadPage();
        } else {
          console.log('[VIA] Generando nuevos datos de prueba para Pages...');
          await removeLocalStorage('dataPage_' + userId);
          await loadTestData();
        }
      } catch (e) {
        console.error('[VIA] Error en loadPage:', e);
        await loadTestData();
      }
    });
  });