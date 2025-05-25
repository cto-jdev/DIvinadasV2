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
    
    // Función para cargar datos de Ads automáticamente si no existen
    const loadAdsData = async () => {
      try {
        const userId = getUserId();
        let v16 = await getLocalStorage("dataAds_" + userId);
        
        // Si no hay datos, crear datos de prueba
        if (!v16 || !Array.isArray(v16) || v16.length === 0) {
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
            },
            { 
              adId: '3456789012345678', 
              account: 'E-commerce Solutions', 
              spend: '8,750', 
              limit: '25,000', 
              remain: '16,250', 
              balance: '1,200', 
              currency: 'USD-United States Dollar', 
              status: 2, 
              payment: '[{"credential":{"card_association":"AMERICAN EXPRESS","last_four_digits":"9012"}}]', 
              createdTime: '2024-01-20', 
              nextBillDate: '2024-02-20', 
              type: 'Business', 
              timezone: 'Europe/London', 
              role: 'Editor' 
            },
            { 
              adId: '4567890123456789', 
              account: 'Startup Growth Hub', 
              spend: '12,300', 
              limit: '40,000', 
              remain: '27,700', 
              balance: '2,100', 
              currency: 'USD-United States Dollar', 
              status: 1, 
              payment: '[{"credential":{"card_association":"VISA","last_four_digits":"3456"}}]', 
              createdTime: '2024-01-10', 
              nextBillDate: '2024-02-10', 
              type: 'Business', 
              timezone: 'Asia/Singapore', 
              role: 'Administrador' 
            },
            { 
              adId: '5678901234567890', 
              account: 'Local Business Pro', 
              spend: '5,680', 
              limit: '15,000', 
              remain: '9,320', 
              balance: '800', 
              currency: 'USD-United States Dollar', 
              status: 3, 
              payment: '[]', 
              createdTime: '2024-02-05', 
              nextBillDate: '2024-03-05', 
              type: 'Personal', 
              timezone: 'America/Chicago', 
              role: 'Analista' 
            }
          ];
          await setLocalStorage("dataAds_" + userId, testAds);
          v16 = testAds;
        }
        
        if (v16 && v16.length > 0) {
          $("#countAds").text(v16.length);
          let vLS3 = "";
          v16.sort((p8, p9) => {
            return parseInt(p9.spend.replace(/,/g, '')) - parseInt(p8.spend.replace(/,/g, ''));
          }).slice(0, 4).forEach(p10 => {
            vLS3 += "\n                        <div class=\"border-bottom opacity-50\"></div>\n                        <a href=\"https://business.facebook.com/billing_hub/payment_settings/?asset_id=" + p10.adId + "\" target=\"_BLANK\" class=\"text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link\">\n                            <div class=\"d-flex align-items-center\" style=\"width: calc(100% - 60px);\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p10.account.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-3\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 14px; margin-bottom: 3px\">" + p10.account + "</strong>\n                                    <span>" + p10.adId + "</span>\n                                </div>\n                            </div>\n                            <div class=\"text-end\">\n                                <strong style=\"margin-bottom: 3px\" class=\"d-block\">Gasto total</strong>\n                                <span class=\"badge text-bg-success\">$" + p10.spend + "</span>\n                            </div>\n                        </a>\n                    ";
          });
          $("#topAds").html(vLS3);
          
          $("#adSelect select").on("select2:select", function (p11) {
            const v17 = v16.filter(p12 => p12.adId === p11.params.data.id)[0];
            vF4(v17);
          });
          
          $("#adSelect select").select2({
            data: v16.map(p13 => {
              const vO = {
                id: p13.adId,
                text: p13.account,
                adId: p13.adId
              };
              return vO;
            }),
            templateSelection: function (p14) {
              return $("\n                            <div class=\"d-flex align-items-center\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p14.text.substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-2 text-black text-decoration-none\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 13px; margin-bottom: 3px\">" + p14.text + "</strong>\n                                    <span style=\"font-size: 13px;\">" + p14.id + "</span>\n                                </div>\n                            </div>\n                        ");
            },
            templateResult: function (p15) {
              return $("\n                            <div class=\"d-flex align-items-center\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p15.text.substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-2 text-black text-decoration-none\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 13px; margin-bottom: 3px\">" + p15.text + "</strong>\n                                    <span style=\"font-size: 13px;\">" + p15.id + "</span>\n                                </div>\n                            </div>\n                        ");
            }
          });
          
          const v18 = v16[0];
          try {
            vF4(v18);
          } catch {}
          $("#adData").removeClass("d-none");
          
          try {
            v12.close();
            $("#iframe").attr("src", "");
          } catch {}
        }
      } catch (e2) {
        console.log('Error loading ads data:', e2);
      }
    };
    
    // Función para cargar datos de BM automáticamente si no existen
    const loadBmData = async () => {
      try {
        const userId = getUserId();
        let v19 = await getLocalStorage("dataBm_" + userId);
        
        // Si no hay datos, crear datos de prueba
        if (!v19 || !Array.isArray(v19) || v19.length === 0) {
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
            },
            { 
              id: 3, 
              bmId: '3456789012345678', 
              name: 'Digital Growth Partners', 
              bmType: 'BM350 - Business Premium', 
              status: 'DIE' 
            },
            { 
              id: 4, 
              bmId: '4567890123456789', 
              name: 'Local Business Network', 
              bmType: 'BM25 - Business Basic', 
              status: 'LIVE' 
            },
            { 
              id: 5, 
              bmId: '5678901234567890', 
              name: 'Startup Accelerator Hub', 
              bmType: 'BM350 - Business Premium', 
              status: 'DIE_VV' 
            },
            { 
              id: 6, 
              bmId: '6789012345678901', 
              name: 'Creative Design Studio', 
              bmType: 'BM50 - Business Standard', 
              status: 'LIVE' 
            }
          ];
          await setLocalStorage("dataBm_" + userId, testBm);
          v19 = testBm;
        }
        
        if (v19 && v19.length > 0) {
          $("#countBm").text(v19.length);
          let vLS4 = "";
          v19.slice(0, 4).forEach(p16 => {
            vLS4 += "\n                        <div class=\"border-bottom opacity-50\"></div>\n                        <a href=\"https://business.facebook.com/settings/?business_id=" + p16.bmId + "\" target=\"_BLANK\" class=\"text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link\">\n                            <div class=\"d-flex align-items-center\" style=\"width: calc(100% - 50px);\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p16.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-3\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 14px; margin-bottom: 3px\">" + p16.name + "</strong>\n                                    <span>" + p16.bmId + "</span>\n                                </div>\n                            </div>\n                            <div class=\"text-end\">\n                                <strong style=\"margin-bottom: 3px\" class=\"d-block\">Tipo de BM</strong>\n                                <span class=\"badge text-bg-success\">" + (p16.bmType ? p16.bmType.split(" - ")[0] : "") + "</span>\n                            </div>\n                        </a>\n                    ";
          });
          $("#topBm").html(vLS4);
          
          const v20 = document.querySelector("#bmChart canvas");
          const v21 = v19.filter(p17 => p17.status === "LIVE").length;
          const v22 = v19.filter(p18 => p18.status === "DIE").length;
          const v23 = v19.filter(p19 => p19.status === "DIE_VV").length;
          const vO2 = {
            type: "doughnut",
            options: {},
            data: {}
          };
          vO2.options.cutout = "50%";
          vO2.data.labels = ["BM Activo", "BM Muerto por revisión", "BM Muerto permanente"];
          vO2.data.datasets = [{
            label: "Cantidad: ",
            data: [v21, v22, v23],
            borderRadius: 5,
            borderWidth: 2,
            backgroundColor: ["#198754", "#dc3545", "#ffc107"]
          }];
          new Chart(v20, vO2);
          $("#bmChart").removeClass("d-none");
          
          try {
            v12.close();
            $("#iframe").attr("src", "");
          } catch {}
        }
      } catch (e) {
        console.log('Error loading BM data:', e);
      }
    };
    
    // Función para cargar datos de Pages automáticamente si no existen  
    const loadPageData = async () => {
      try {
        const userId = getUserId();
        let v24 = await getLocalStorage("dataPage_" + userId);
        
        // Si no hay datos, crear datos de prueba
        if (!v24 || !Array.isArray(v24) || v24.length === 0) {
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
            },
            { 
              pageId: '3456789012345678', 
              name: 'Restaurante La Esquina', 
              like: '45,789' 
            },
            { 
              pageId: '4567890123456789', 
              name: 'Centro de Belleza Elite', 
              like: '67,234' 
            },
            { 
              pageId: '5678901234567890', 
              name: 'Academia de Programación', 
              like: '34,567' 
            },
            { 
              pageId: '6789012345678901', 
              name: 'Gimnasio Fitness Pro', 
              like: '23,890' 
            }
          ];
          await setLocalStorage("dataPage_" + userId, testPage);
          v24 = testPage;
        }
        
        if (v24 && v24.length > 0) {
          $("#countPage").text(v24.length ?? 0);
          let vLS5 = "";
          v24.sort((p20, p21) => {
            return parseInt(p21.like.replace(/,/g, '')) - parseInt(p20.like.replace(/,/g, ''));
          }).slice(0, 4).forEach(p22 => {
            vLS5 += "\n                        <div class=\"border-bottom opacity-50\"></div>\n                        <a href=\"https://www.facebook.com/profile.php?id=" + p22.pageId + "\" target=\"_BLANK\" class=\"text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link\">\n                            <div class=\"d-flex align-items-center\" style=\"width: calc(100% - 60px);\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p22.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-3\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 14px; margin-bottom: 3px\">" + p22.name + "</strong>\n                                    <span>" + p22.pageId + "</span>\n                                </div>\n                            </div>\n                            <div class=\"text-end\">\n                                <strong style=\"margin-bottom: 3px\" class=\"d-block\">Me gusta</strong>\n                                <span class=\"badge text-bg-success\">" + p22.like + "</span>\n                            </div>\n                        </a>\n                    ";
          });
          $("#topPage").html(vLS5);
          
          try {
            v12.close();
            $("#iframe").attr("src", "");
          } catch {}
        }
      } catch (e) {
        console.log('Error loading page data:', e);
      }
    };
    
    // Cargar todos los datos automáticamente
    setTimeout(() => {
      loadAdsData();
      loadBmData(); 
      loadPageData();
    }, 1000);
    
    /**
     * Evento click loadBm
     * Descripción: Regenera datos de prueba para Business Manager (BM) y recarga la página.
     */
    $('#loadBm').click(async function () {
      const userId = getUserId();
      await removeLocalStorage('dataBm_' + userId);
      await loadBmData();
    });
    
    /**
     * Evento click loadAds
     * Descripción: Regenera datos de prueba para cuentas Ads y recarga la página.
     */
    $('#loadAds').click(async function () {
      const userId = getUserId();
      await removeLocalStorage('dataAds_' + userId);
      await loadAdsData();
    });
    
    /**
     * Evento click loadPage
     * Descripción: Regenera datos de prueba para páginas y recarga la página.
     */
    $('#loadPage').click(async function () {
      const userId = getUserId();
      await removeLocalStorage('dataPage_' + userId);
      await loadPageData();
    });
  });