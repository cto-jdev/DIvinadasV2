/**
 * getCurrentUser
 * Descripción: Obtiene el usuario actual desde localStorage y lo retorna.
 * Retorna: Promise<Object> (usuario actual)
 */
function getCurrentUser() {
    return new Promise(async (resolve, reject) => {
      try {
        const uid = await getLocalStorage("uid");
        const cloneData = (await getLocalStorage("dataClone")) || [];
        const currentUser = cloneData.filter(user => user.uid === uid)[0];
        resolve(currentUser);
      } catch (err) {
        reject(err);
      }
    });
  }
/**
 * getBase64ImageFromUrl
 * Descripción: Convierte una imagen obtenida por URL a formato base64.
 * Parámetros: imageUrl (string URL de la imagen)
 * Retorna: Promise<string> (base64 de la imagen)
 */
async function getBase64ImageFromUrl(imageUrl) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);
      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    });
  }
  let rates = false;
  /**
   * Evento ready principal
   * Descripción: Inicializa la aplicación, verifica actualizaciones, estado de sesión y carga datos de usuario y calidad de cuenta.
   */
  $(document).ready(async function () {
    const appPage = $("#app").attr("data");
    const isFolded = await getLocalStorage("folded");
    if (!isFolded) {
      $("body").removeClass("folded");
    }
    if (appPage !== "setting") {
      let updatesJson = [];
      let webUpdates = [];
      try {
        const updatesResponse = await fetch("https://divinads.com/wp-json/divinads/v1/updates", {
          cache: "no-cache"
        });
        updatesJson = await updatesResponse.json();
        webUpdates = updatesJson.filter(update => update.type === "web");
      } catch (fetchErr) {
        console.warn('[DivinAds] No se pudo obtener actualizaciones:', fetchErr.message);
      }
      try {
        rates = await (await fetch("../rates.json")).json();
      } catch (ratesErr) {
        console.warn('[DivinAds] No se pudo cargar rates.json:', ratesErr.message);
      }
      const currentVersion = await getVersion();

      // Verificar que tenemos datos antes de acceder
      if (webUpdates.length > 0) {
        const latestVersion = webUpdates[0].version;
        const releaseNotes = webUpdates[0].note;
        const storedVersion = await getLocalStorage("ver");
        
        if (storedVersion !== latestVersion) {
          await setLocalStorage("ver", latestVersion);
          $(".appVersion").html("<span class=\"mb-0 text-decoration-none badge text-bg-light\">v" + latestVersion + "</span>");
          Swal.fire({
            icon: "success",
            title: "Actualización exitosa v" + latestVersion,
            text: "¿Qué hay de nuevo en esta versión?",
            confirmButtonText: "Continuar",
            input: "textarea",
            inputValue: releaseNotes.replaceAll("<br>", "\r\n"),
            allowOutsideClick: false,
            inputAttributes: {
              rows: 7,
              disabled: true
            }
          });
        }
      }
      let sessionInitialized = false;
      const checkSession = async () => {
        const liveStatus = await fb.checkLive();
        if (liveStatus !== "success") {
          if (liveStatus === "not_login") {
            $(document).trigger("notLogged");
          }
          if (liveStatus === "282") {
            $(document).trigger("282");
            Swal.fire({
              icon: "error",
              title: "Checkpoint 282",
              text: "La cuenta ha sido checkpoint",
              confirmButtonText: "Cerrar sesión",
              confirmButtonColor: "#dc3545",
              cancelButtonText: "Cancelar",
              showCancelButton: true,
              allowOutsideClick: false
            }).then(async result => {
              if (result.isConfirmed) {
                await emptyCookie();
                location.reload();
              }
            });
          }
          if (liveStatus === "956") {
            $(document).trigger("956");
            Swal.fire({
              icon: "error",
              title: "Checkpoint 956",
              text: "La cuenta ha sido checkpoint",
              confirmButtonText: "Cerrar sesión",
              confirmButtonColor: "#dc3545",
              cancelButtonText: "Cancelar",
              showCancelButton: true,
              allowOutsideClick: false
            }).then(async result => {
              if (result.isConfirmed) {
                await emptyCookie();
                location.reload();
              }
            });
          }
          $("#pageLoading").addClass("d-none");
          $("#gridLoading").addClass("d-none");
          $("body").addClass("data-loaded");
          try {
            clearInterval(sessionIntervalId);
          } catch (err) {
            console.log(err);
          }
        }
      };
      sessionIntervalId = setInterval(async () => {
        await checkSession();
      }, 5000);
      await checkSession();
      if (appPage === "via") {
        let versionChangelogHtml = "";
        updatesJson.forEach(update => {
          versionChangelogHtml += "\n                        <div class=\"d-flex\">\n                            <div class=\"me-3 pt-2\">\n                                <span class=\"badge text-bg-success\">v" + update.version + "</span>\n                                <small class=\"d-block mt-2 text-nowrap\">" + update.date.split("T")[0] + "</small>\n                            </div>\n                            <div class=\"alert alert-light w-100\" role=\"alert\">" + update.note + "</div>\n                        </div>\n                    ";
        });
        $("#versions").html(versionChangelogHtml);
      }
      const initUserSession = async () => {
        await fb.init();
        let appealButtonHtml = "";
        let qualityBadgeHtml = "";
        try {
          const accountQuality = await fb.getAccountQuality();
          qualityBadgeHtml = "<a href=\"https://www.facebook.com/business-support-home/" + fb.uid + "\" target=\"_BLANK\" class=\"text-decoration-none badge text-bg-" + accountQuality.color + " mb-1\" style=\"font-size: 12px;\">" + accountQuality.status + "</a>";
          $("#quality").html(qualityBadgeHtml);
          if (qualityBadgeHtml.status === "XMDT Checkpoint") {
            appealButtonHtml = "<button id=\"xmdt\" type=\"button\" class=\"position-absolute end-0 btn btn-success btn-sm\"><i class=\"ri-shield-check-line me-1\"></i>Apelar</button>";
          }
          if (qualityBadgeHtml.status === "HCQC 902 Rechazado - Volver a XMDT 273" || qualityBadgeHtml.status === "Apelando 902" || qualityBadgeHtml.status === "Restricción 902 XMDT" || qualityBadgeHtml.status === "HCQC 902 Pendiente") {
            appealButtonHtml = "<button id=\"k902\" type=\"button\" class=\"position-absolute end-0 btn btn-success btn-sm\"><i class=\"ri-shield-check-line me-1\"></i>Apelar 902</button>";
          }
        } catch (err) {
          console.log(err);
        }
        $("#userInfo").html("\n                    <div class=\"dropdown\">\n                        <div data-bs-toggle=\"dropdown\" data-bs-auto-close=\"outside\" style=\"cursor: pointer\">\n                            <span class=\"d-flex justify-content-between align-items-center border-start ms-3 ps-3\" style=\"width:calc(350px - 1rem);\">\n                                <span class=\"d-flex flex-column\">\n                                    <span class=\"position-relative\">\n                                        " + appealButtonHtml + "\n                                        <span class=\"d-flex align-items-center flex-wrap\">\n                                            <span class=\"rounded-circle overflow-hidden\" style=\"width: 33px;\">\n                                                <img id=\"fbAvatar\" class=\"w-100 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                            </span>\n                                            <span class=\"ps-2\" style=\"width: calc(100% - 33px)\">\n                                                <span class=\"d-block mb-0 fw-bold text-truncate\" style=\"width: 200px;\">" + fb.userInfo.name + "</span>\n                                                <small class=\"d-block\">" + fb.uid + "</small>\n                                            </span>\n                                        </span>\n                                    </span>\n                                </span>\n                                <i class=\"ri-arrow-down-s-fill fs-5 m-0\" style=\"color: #666\"></i>\n                            </span>\n                        </div>\n                        <div class=\"dropdown-menu dropdown-menu-end overflow-hidden p-0 shadow\" style=\"width:calc(350px - 3rem);\">\n                            <div class=\"p-2\" style=\"background: #f0ecf4\">\n                                <div class=\"d-flex align-items-center justify-content-center\">\n                                    <div class=\"rounded-circle overflow-hidden shadow bg-white\" style=\"width: 70px; margin-bottom: -35px;\">\n                                        <img class=\"w-100 p-1 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                    </div>\n                                </div>\n                            </div>\n                            <div class=\"p-3 mt-4\">\n                                <div class=\"d-flex flex-column align-items-center\">\n                                    <span class=\"fw-bold fs-5\">" + fb.userInfo.name + "</span>\n                                    <span class=\"mb-2\">" + fb.uid + "</span>\n                                    " + qualityBadgeHtml + "\n                                </div>\n                            </div>\n                            <ul class=\"p-3 m-0 border-top list-unstyled\">\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-mail-line me-2\"></i> Email: " + fb.userInfo.email + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-calendar-line me-2\"></i> Fecha de nacimiento: " + fb.userInfo.birthday + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-group-line me-2\"></i> Amigos: " + fb.userInfo.friends + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-men-line me-2\"></i> Género: " + (fb.userInfo.gender === "male" ? "Masculino" : "Femenino") + "\n                                    </span>\n                                </li>\n                            </ul>\n                            <ul class=\"border-top p-3 m-0 list-unstyled\">\n                                <li>\n                                    <a href=\"#\" id=\"switch\" class=\"text-decoration-none py-1 d-block fw-medium text-black\">\n                                        <i class=\"ri-repeat-line me-2\"></i> Cambiar cuenta\n                                    </a>\n                                </li>\n                                <li>\n                                    <a href=\"#\" id=\"logout\" class=\"text-decoration-none py-1 d-block fw-medium text-black\">\n                                        <i class=\"ri-logout-box-r-line me-2\"></i> Cerrar sesión\n                                    </a>\n                                </li>\n                            </ul>\n                        </div>\n                    </div>\n                ");
        if (appPage === "via") {
          $("#viaInfo").html("\n                        <div class=\"card border-0 rounded-4 shadow-sm mb-4 p-4\" style=\"background: #013b3b \">\n                            <div class=\"d-flex align-items-center justify-content-between\">\n                                <div class=\"d-flex align-items-center\">\n                                    <div class=\"rounded-circle overflow-hidden shadow bg-white\" style=\"width: 70px;\">\n                                        <img class=\"w-100 p-1 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                    </div>\n                                    <div class=\"ms-3\">\n                                        <span class=\"text-white fs-4 fw-medium d-block mb-0\">" + fb.userInfo.name + "</span>\n                                        <span class=\"text-white d-block\"><i class=\"ri-user-line\"></i> " + fb.uid + "</span>\n                                        <span class=\"text-white\"><i class=\"ri-mail-line\"></i> " + fb.userInfo.email + "</span>\n                                    </div>\n                                </div>\n                                <div class=\"rounded-4 p-3\" style=\"background-color: #ffffff1c; width: 500px;\">\n                                    <div class=\"row flex-grow-1\">\n                                        <div class=\"col-4 border-end\" style=\"border-color: #ffffff1c !important;\">\n                                            <div class=\"d-flex flex-wrap align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-calendar-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div style=\"width: calc(100% - 30px);\">\n                                                    <div class=\"ms-3\">\n                                                        <strong class=\"d-block text-white text-truncate\">" + fb.userInfo.birthday + "</strong>\n                                                        <span class=\"text-white-50 fw-medium\">Fecha de nacimiento</span>\n                                                    </div>\n                                                </div>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-4 border-end\" style=\"border-color: #ffffff1c !important;\">\n                                            <div class=\"d-flex align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-user-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div class=\"ms-3\">\n                                                    <strong class=\"d-block text-white\">" + fb.userInfo.friends + "</strong>\n                                                    <span class=\"text-white-50 fw-medium\">Amigos</span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-4\">\n                                            <div class=\"d-flex align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-men-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div class=\"ms-3\">\n                                                    <strong class=\"d-block text-white\">" + (fb.userInfo.gender === "male" ? "Masculino" : "Femenino") + "</strong>\n                                                    <span class=\"text-white-50 fw-medium\">Género</span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    ");
        }
        try {
          if (appPage === "bm") {
            const shouldLoadBm = await getLocalStorage("loadBm");
            const cachedBmData = await getLocalStorage("dataBm_" + fb.uid);
            if (shouldLoadBm) {
              await removeLocalStorage("loadBm");
              await removeLocalStorage("dataBm_" + fb.uid);
              await fb.loadBm();
            } else if (cachedBmData) {
              await fb.loadBm();
            } else {
              Swal.fire({
                title: "Sin datos",
                text: "Por favor haz clic en el botón para cargar la información",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Cargar datos",
                cancelButtonText: "Cancelar"
              }).then(async result => {
                if (result.isConfirmed) {
                  try {
                    // Verificar que fb esté disponible antes de cargar
                    if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
                      await setLocalStorage("loadBm", true);
                      // Mostrar indicador de carga
                      Swal.fire({
                        title: 'Cargando datos...',
                        text: 'Por favor espera mientras se cargan los datos de BM',
                        icon: 'info',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      
                      // Cargar datos directamente sin recargar la página
                      await window.fb.loadBm();
                      
                      // Cerrar el modal de carga después de un breve delay
                      setTimeout(() => {
                        Swal.close();
                      }, 1000);
                    } else {
                      // Si fb no está disponible, recargar la página
                      await setLocalStorage("loadBm", true);
                      location.reload();
                    }
                  } catch (e) {
                    console.error('Error loading BM data:', e);
                    // En caso de error, recargar la página como fallback
                    await setLocalStorage("loadBm", true);
                    location.reload();
                  }
                }
              });
            }
          }
          if (appPage === "page") {
            const shouldLoadPage = await getLocalStorage("loadPage");
            const cachedPageData = await getLocalStorage("dataPage_" + fb.uid);
            if (shouldLoadPage) {
              await removeLocalStorage("loadPage");
              await removeLocalStorage("dataPage_" + fb.uid);
              await fb.loadPage();
            } else if (cachedPageData) {
              await fb.loadPage();
            } else {
              Swal.fire({
                title: "No data",
                text: "Please click on the load data button to display the information",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Load data",
                cancelButtonText: "Cancel"
              }).then(async result => {
                if (result.isConfirmed) {
                  try {
                    if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
                      await setLocalStorage("loadPage", true);
                      Swal.fire({
                        title: 'Loading data...',
                        text: 'Please wait while Page data is being loaded',
                        icon: 'info',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      await window.fb.loadPage();
                      setTimeout(() => {
                        Swal.close();
                      }, 1000);
                    } else {
                      await setLocalStorage("loadPage", true);
                      location.reload();
                    }
                  } catch (e) {
                    console.error('Error loading Page data:', e);
                    await setLocalStorage("loadPage", true);
                    location.reload();
                  }
                }
              });
            }
          }
          if (appPage === "ads") {
            const shouldLoadAds = await getLocalStorage("loadAds");
            const cachedAdsData = await getLocalStorage("dataAds_" + fb.uid);
            if (shouldLoadAds) {
              await removeLocalStorage("loadAds");
              await removeLocalStorage("dataAds_" + fb.uid);
              await fb.loadAds();
            } else if (cachedAdsData) {
              await fb.loadAds();
            } else {
              Swal.fire({
                title: "No data",
                text: "Please click on the load data button to display the information",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Load data",
                cancelButtonText: "Cancel"
              }).then(async swalResult => {
                if (swalResult.isConfirmed) {
                  try {
                    // Verificar que fb esté disponible antes de cargar
                    if (typeof window.fb !== 'undefined' && window.fb && window.fb.uid) {
                      await setLocalStorage("loadAds", true);
                      // Mostrar indicador de carga
                      Swal.fire({
                        title: 'Loading data...',
                        text: 'Please wait while Ads data is being loaded',
                        icon: 'info',
                        allowOutsideClick: false,
                        showConfirmButton: false,
                        didOpen: () => {
                          Swal.showLoading();
                        }
                      });
                      
                      // Cargar datos directamente sin recargar la página
                      await window.fb.loadAds();
                      
                      // Cerrar el modal de carga después de un breve delay
                      setTimeout(() => {
                        Swal.close();
                      }, 1000);
                    } else {
                      // Si fb no está disponible, recargar la página
                      await setLocalStorage("loadAds", true);
                      location.reload();
                    }
                  } catch (e) {
                    console.error('Error loading Ads data:', e);
                    // En caso de error, recargar la página como fallback
                    await setLocalStorage("loadAds", true);
                    location.reload();
                  }
                }
              });
            }
          }
        } catch {}
        $("#gridLoading").addClass("d-none");
        $("body").addClass("data-loaded");
        if ($("#app").attr("data") !== "popup") {
          loadSetting();
        }
      };
      initUserSession();
    }
  });
  function resolveCaptcha(settings, siteKey, siteUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const apiKey = settings.general.captchaServiceKey.value;
        if (settings.general.captchaService.value === "1stcaptcha") {
          resolve(await resolveCaptcha1st(apiKey, siteKey, siteUrl));
        }
        if (settings.general.captchaService.value === "2captcha") {
          resolve(await resolve2Captcha(apiKey, siteKey, siteUrl));
        }
        if (settings.general.captchaService.value === "capmonster") {
          resolve(await resolveCaptchaCapMonster(apiKey, siteKey, siteUrl));
        }
        if (settings.general.captchaService.value === "ezcaptcha") {
          resolve(await resolveCaptchaEz(apiKey, siteKey, siteUrl));
        }
        if (settings.general.captchaService.value === "omocaptcha.com") {
          resolve(await resolveCaptchaOmo(apiKey, siteKey, siteUrl));
        }
        if (settings.general.captchaService.value === "anticaptcha") {
          resolve(await resolveCaptchaAntiCaptcha(apiKey, siteKey, siteUrl));
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function resolveCaptchaImage(settings, imageBase64) {
    return new Promise(async (resolve, reject) => {
      try {
        // Validar que settings tenga la estructura correcta
        if (!settings || !settings.general || !settings.general.captchaServiceKey || !settings.general.captchaService) {
          Swal.fire({
            icon: 'warning',
            title: '⚙️ Configuración de Captcha Requerida',
            html: `
              <div class="text-start">
                <p><strong>El servicio de captcha no está configurado.</strong></p>
                <p>Para usar la función de apelación BM, necesitas:</p>
                <ol>
                  <li>Ir a <a href="setting.html" target="_blank" class="text-primary">Configuración</a></li>
                  <li>Seleccionar un servicio de captcha</li>
                  <li>Introducir tu API Key</li>
                </ol>
                <div class="alert alert-info mt-3">
                  <strong>Servicios disponibles:</strong><br>
                  • omocaptcha.com<br>
                  • anticaptcha<br>
                  • 2captcha
                </div>
              </div>
            `,
            confirmButtonText: 'Ir a Configuración',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            cancelButtonColor: '#6c757d'
          }).then((result) => {
            if (result.isConfirmed) {
              window.open('setting.html', '_blank');
            }
          });
          throw new Error("Configuración de captcha no válida. Por favor, configura el servicio de captcha en la configuración general.");
        }
        
        const apiKey = settings.general.captchaServiceKey.value;
        const captchaService = settings.general.captchaService.value;
        
        if (!apiKey) {
          Swal.fire({
            icon: 'error',
            title: 'API Key Requerida',
            text: 'Por favor, introduce tu API Key del servicio de captcha en la configuración.',
            confirmButtonText: 'Ir a Configuración'
          }).then(() => {
            window.open('setting.html', '_blank');
          });
          throw new Error("API Key del servicio de captcha no configurada.");
        }
        
        if (!captchaService) {
          Swal.fire({
            icon: 'error',
            title: 'Servicio de Captcha Requerido',
            text: 'Por favor, selecciona un servicio de captcha en la configuración.',
            confirmButtonText: 'Ir a Configuración'
          }).then(() => {
            window.open('setting.html', '_blank');
          });
          throw new Error("Servicio de captcha no seleccionado.");
        }
        
        if (captchaService === "omocaptcha.com") {
          resolve(await resolveCaptchaOmoImage(apiKey, imageBase64));
        } else if (captchaService === "anticaptcha") {
          resolve(await resolveCaptchaAntiCaptchaImage(apiKey, imageBase64));
        } else if (captchaService === "2captcha") {
          resolve(await resolveCaptcha2CaptchaImage(apiKey, imageBase64));
        } else {
          throw new Error("Servicio de captcha no soportado: " + captchaService);
        }
      } catch (err) {
        console.error("Error en resolveCaptchaImage:", err);
        reject(err);
      }
    });
  }
  function resolveCaptchaAntiCaptchaImage(apiKey, imageBase64) {
    return new Promise(async (resolve, reject) => {
      try {
        const requestBody = {
          apikey: apiKey,
          img: imageBase64,
          type: 6
        };
        const response = await fetch2("https://anticaptcha.top/api/captcha", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(requestBody)
        });
        const result = response.json;
        if (result.success) {
          resolve(result.captcha);
        } else {
          reject(result.message);
        }
      } catch (err) {
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptcha1st(apiKey, siteKey, siteUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const createTaskResponse = await fetch2("https://api.1stcaptcha.com/recaptchav2_enterprise?apikey=" + apiKey + "&sitekey=" + siteKey + "&siteurl=" + siteUrl);
        const createTaskJson = createTaskResponse.json;
        if (createTaskJson.Code === 0) {
          const taskId = +createTaskJson.TaskId;
          let captchaToken;
          for (let attempt = 0; attempt < 10; attempt++) {
            try {
              const resultResponse = await fetch2("https://api.1stcaptcha.com/getresult?apikey=" + apiKey + "&taskid=" + taskId);
              const resultJson = resultResponse.json;
              if (resultJson.Status === "SUCCESS") {
                captchaToken = resultJson.Data.Token;
                break;
              } else if (resultJson.Status === "ERROR") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaToken) {
            resolve(captchaToken);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createTaskJson.Message);
        }
      } catch (err) {
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaOmo(apiKey, siteKey, siteUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const createJobBody = {
          api_token: apiKey,
          data: {
            type_job_id: "2"
          }
        };
        const createJobResponse = await fetch2("https://omocaptcha.com/api/createJob", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(createJobBody)
        });
        const createJobJson = createJobResponse.json;
        if (createJobJson.success) {
          const jobId = createJobJson.job_id;
          let captchaToken;
          for (let attempt = 0; attempt < 10; attempt++) {
            try {
              const getResultBody = {
                api_token: apiKey,
                job_id: jobId
              };
              const resultResponse = await fetch2("https://omocaptcha.com/api/getJobResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(getResultBody)
              });
              const resultJson = resultResponse.json;
              if (resultJson.status === "success") {
                captchaToken = resultJson.result;
                break;
              } else if (resultJson.Status === "fail") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaToken) {
            resolve(captchaToken);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createJobJson.message);
        }
      } catch (err) {
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaOmoImage(apiKey, imageBase64) {
    return new Promise(async (resolve, reject) => {
      try {
        const jobData = {
          type_job_id: "30",
          image_base64: imageBase64
        };
        const createJobBody = {
          api_token: apiKey,
          data: jobData
        };
        const createJobResponse = await fetch2("https://omocaptcha.com/api/createJob", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(createJobBody)
        });
        const createJobJson = createJobResponse.json;
        if (createJobJson.success) {
          const jobId = createJobJson.job_id;
          let captchaText;
          for (let attempt = 0; attempt < 10; attempt++) {
            try {
              const getResultBody = {
                api_token: apiKey,
                job_id: jobId
              };
              const resultResponse = await fetch2("https://omocaptcha.com/api/getJobResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(getResultBody)
              });
              const resultJson = resultResponse.json;
              if (resultJson.status === "success") {
                captchaText = resultJson.result;
                break;
              } else if (resultJson.Status === "fail") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaText) {
            resolve(captchaText);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createJobJson.message);
        }
      } catch (err) {
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptcha2CaptchaImage(apiKey, imageBase64) {
    return new Promise(async (resolve, reject) => {
      try {
        const createTaskResponse = await fetch2("https://api.2captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: apiKey,
            task: {
              type: "ImageToTextTask",
              body: imageBase64
            }
          })
        });
        const createTaskJson = createTaskResponse.json;
        if (createTaskJson.taskId) {
          const taskId = +createTaskJson.taskId;
          let captchaText;
          for (let attempt = 0; attempt < 30; attempt++) {
            try {
              const getResultBody = {
                clientKey: apiKey,
                taskId: taskId
              };
              const resultResponse = await fetch2("https://api.2captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(getResultBody)
              });
              const resultJson = resultResponse.json;
              if (resultJson.status === "ready") {
                captchaText = resultJson.solution.text;
                break;
              } else if (resultJson.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaText) {
            resolve(captchaText);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createTaskJson.Message);
        }
      } catch (err) {
        console.log(err);
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaCapMonster(apiKey, siteKey, siteUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const createTaskResponse = await fetch2("https://api.capmonster.cloud/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: apiKey,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: siteUrl,
              websiteKey: siteKey
            }
          })
        });
        const createTaskJson = createTaskResponse.json;
        if (createTaskJson.taskId) {
          const taskId = +createTaskJson.taskId;
          let captchaToken;
          for (let attempt = 0; attempt < 10; attempt++) {
            try {
              const getResultBody = {
                clientKey: apiKey,
                taskId: taskId
              };
              const resultResponse = await fetch2("https://api.capmonster.cloud/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(getResultBody)
              });
              const resultJson = resultResponse.json;
              if (resultJson.status === "ready") {
                captchaToken = resultJson.solution.gRecaptchaResponse;
                break;
              } else if (resultJson.errorCode != 0 && resultJson.status !== "processing") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaToken) {
            resolve(captchaToken);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createTaskJson.Message);
        }
      } catch (err) {
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolve2Captcha(apiKey, siteKey, siteUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const createTaskResponse = await fetch2("https://api.2captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: apiKey,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: siteUrl,
              websiteKey: siteKey
            }
          })
        });
        const createTaskJson = createTaskResponse.json;
        if (createTaskJson.taskId) {
          const taskId = +createTaskJson.taskId;
          let captchaToken;
          for (let attempt = 0; attempt < 30; attempt++) {
            try {
              const getResultBody = {
                clientKey: apiKey,
                taskId: taskId
              };
              const resultResponse = await fetch2("https://api.2captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(getResultBody)
              });
              const resultJson = resultResponse.json;
              if (resultJson.status === "ready") {
                captchaToken = resultJson.solution.gRecaptchaResponse;
                break;
              } else if (resultJson.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaToken) {
            resolve(captchaToken);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createTaskJson.Message);
        }
      } catch (err) {
        console.log(err);
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaEz(apiKey, siteKey, siteUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        const createTaskResponse = await fetch2("https://api.ez-captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: apiKey,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: siteUrl,
              websiteKey: siteKey
            }
          })
        });
        const createTaskJson = createTaskResponse.json;
        if (createTaskJson.taskId) {
          const taskId = createTaskJson.taskId;
          let captchaToken;
          for (let attempt = 0; attempt < 10; attempt++) {
            try {
              const getResultBody = {
                clientKey: apiKey,
                taskId: taskId
              };
              const resultResponse = await fetch2("https://api.ez-captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(getResultBody)
              });
              const resultJson = resultResponse.json;
              console.log(resultJson);
              if (resultJson.status === "ready") {
                captchaToken = resultJson.solution.gRecaptchaResponse;
                break;
              } else if (resultJson.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (captchaToken) {
            resolve(captchaToken);
          } else {
            reject("No se pudo resolver el captcha");
          }
        } else {
          reject(createTaskJson.Message);
        }
      } catch (err) {
        console.log(err);
        reject("No se pudo resolver el captcha");
      }
    });
  }
  function getPhone(phoneService, apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🔍 [getPhone] Iniciando obtención de número`);
        console.log(`📋 Servicio: ${phoneService}, API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'No definida'}, App: ${app}`);
        
        // Validar parámetros
        if (!phoneService || phoneService === "none") {
          throw new Error("Servicio de teléfono no seleccionado");
        }
        
        if (!apiKey) {
          throw new Error("API Key no proporcionada");
        }
        
        let result = null;
        
        try {
          console.log(`🚀 Llamando al servicio ${phoneService}...`);
          
          if (phoneService === "chothuesimcode") {
            result = await getPhoneChoThueSimCode(apiKey, app);
          } else if (phoneService === "viotp") {
            result = await getPhoneViOtp(apiKey, app);
          } else if (phoneService === "xotp") {
            result = await getPhoneXotp(apiKey, app);
          } else if (phoneService === "otponline") {
            result = await getPhoneOtpOnline(apiKey, app);
          } else if (phoneService === "sim24") {
            result = await getPhoneSim24(apiKey, app);
          } else if (phoneService === "233io9") {
            result = await getPhone233(apiKey, app);
          } else if (phoneService === "simotp") {
            result = await getPhoneSimOtp(apiKey, app);
          } else if (phoneService === "codesim") {
            result = await getPhoneCodeSim(apiKey, app);
          } else if (phoneService === "template") {
            result = await getPhoneTemplate();
          } else {
            throw new Error(`Servicio no soportado: ${phoneService}`);
          }
          
          if (result && result.number && result.id) {
            console.log(`✅ [getPhone] Número obtenido exitosamente`);
            console.log(`📞 Número: ${result.number}, ID: ${result.id}`);
            resolve(result);
          } else {
            throw new Error("Respuesta inválida del servicio (sin número o ID)");
          }
          
        } catch (serviceError) {
          console.error(`❌ [getPhone] Error del servicio ${phoneService}:`, serviceError);
          throw serviceError;
        }
        
      } catch (error) {
        console.error(`❌ [getPhone] Error general:`, error);
        reject(error);
      }
    });
  }
  function getPhoneCode(phoneService, apiKey, phoneId) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🔍 [getPhoneCode] Iniciando obtención de código`);
        console.log(`📋 Servicio: ${phoneService}, API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'No definida'}, ID: ${phoneId}`);
        
        if (!phoneService || phoneService === "none") {
          throw new Error("Servicio de teléfono no seleccionado");
        }
        
        if (!apiKey) {
          throw new Error("API Key no proporcionada");
        }
        
        if (!phoneId) {
          throw new Error("ID de número no válido");
        }
        
        const settings = await saveSetting();
        const maxAttempts = (settings.general && settings.general.getCodeNumber && settings.general.getCodeNumber.value) || 10;
        const waitPerAttemptMs = 10; // 10s (reducido de 50 para mayor eficiencia)
        
        console.log(`⏱️ Configuración: ${maxAttempts} intentos, ${waitPerAttemptMs}s de espera entre intentos`);
        
        let result = null;
        
        try {
          console.log(`🚀 Obteniendo código del servicio ${phoneService}...`);
          
          if (phoneService === "chothuesimcode") {
            result = await getPhoneCodeChoThueSimCode(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "viotp") {
            result = await getPhoneCodeViOtp(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "xotp") {
            result = await getPhoneCodeXotp(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "otponline") {
            result = await getPhoneCodeOnlineOtp(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "sim24") {
            result = await getPhoneCodeSim24(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "233io9") {
            result = await getPhoneCode233(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "simotp") {
            result = await getPhoneCodeSimOtp(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "codesim") {
            result = await getPhoneCodeCodeSim(apiKey, phoneId, maxAttempts, waitPerAttemptMs);
          } else if (phoneService === "template") {
            result = await getPhoneCodeTemplate(phoneId, maxAttempts, waitPerAttemptMs);
          } else {
            throw new Error(`Servicio no soportado: ${phoneService}`);
          }
          
          if (result) {
            console.log(`✅ [getPhoneCode] Código obtenido exitosamente: ${result}`);
            resolve(result);
          } else {
            throw new Error("No se pudo obtener el código de verificación");
          }
          
        } catch (serviceError) {
          console.error(`❌ [getPhoneCode] Error del servicio ${phoneService}:`, serviceError);
          throw serviceError;
        }
        
      } catch (error) {
        console.error(`❌ [getPhoneCode] Error general:`, error);
        reject(error);
      }
    });
  }
  function getObjPath(obj, path, value) {
    if (typeof path == "string") {
      return getObjPath(obj, path.split("."), value);
    } else if (path.length == 1 && value !== undefined) {
      return obj[path[0]] = value;
    } else if (path.length == 0) {
      return obj;
    } else {
      return getObjPath(obj[path[0]], path.slice(1), value);
    }
  }
  function getPhoneTemplate() {
    return new Promise(async (resolve, reject) => {
      try {
        const settings = await saveSetting();
        const customPhoneId = settings.general.customPhone.value;
        const serviceDataList = (await getLocalStorage("serviceData")) || [];
        const serviceEntry = await serviceDataList.filter(item => item.id == customPhoneId)[0];
        const apiResponse = await fetch2(serviceEntry.apiGetPhone);
        const responseJson = apiResponse.json;
        const phoneValue = getObjPath(responseJson, serviceEntry.phoneValue);
        const idValue = getObjPath(responseJson, serviceEntry.idValue);
        const phonePrefix = serviceEntry.phonePrefix ?? "";
        if (phoneValue && idValue) {
          if (serviceEntry.phoneDelay) {
            await delayTime(serviceEntry.phoneDelay * 100);
          }
          resolve({
            number: phonePrefix + phoneValue,
            id: idValue
          });
        } else {
          reject("No se pudo obtener el número de teléfono");
        }
      } catch (err) {
        console.log(err);
        reject("No se pudo obtener el número de teléfono");
      }
    });
  }
  function getPhoneCodeTemplate(phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        const settings = await saveSetting();
        const customPhoneId = settings.general.customPhone.value;
        const serviceDataList = (await getLocalStorage("serviceData")) || [];
        const serviceEntry = await serviceDataList.filter(item => item.id == customPhoneId)[0];
        let otpCode = false;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          try {
            const apiResponse = await fetch2(serviceEntry.apiGetCode.replace("{id}", phoneId));
            const responseJson = apiResponse.json;
            otpCode = getObjPath(responseJson, serviceEntry.codeValue).match(/\d+/)[0];
            if (otpCode && otpCode != "00000") {
              resolve(otpCode);
              break;
            }
          } catch (err) {}
        }
        if (!otpCode) {
          reject();
        }
      } catch (err) {
        console.log(err);
        reject();
      }
    });
  }
  function getPhoneCodeSim(apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch2("https://apisim.codesim.net/sim/get_sim?service_id=1&api_key=" + apiKey);
        const responseJson = response.json;
        if (responseJson.status === 200) {
          const phoneData = {
            number: responseJson.data.phone,
            id: responseJson.data.otpId
          };
          resolve(phoneData);
        } else {
          reject(responseJson.message);
        }
      } catch (err) {
        reject("No se pudo obtener el número de teléfono");
      }
    });
  }
  function getPhoneCodeCodeSim(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://apisim.codesim.net/otp/get_otp_by_phone_api_key?otp_id=" + phoneId + "&api_key=" + apiKey);
          const responseJson = response.json;
          if (responseJson.status === 200) {
            otpCode = responseJson.data.code;
            if (otpCode) {
              resolve(otpCode);
              break;
            }
          }
        }
        if (!otpCode) {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneSimOtp(apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      let serviceId = 15;
      if (app === "instagram") {
        serviceId = 29;
      }
      try {
        const requestBody = {
          service: serviceId
        };
        const response = await fetch2("https://simotp.net/api/v1/order", {
          method: "POST",
          headers: {
            Authorization: "OTP " + apiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        });
        const responseJson = response.json;
        if (responseJson.data) {
          resolve({
            number: "84" + responseJson.data.phoneNumber,
            id: responseJson.data.id
          });
        } else {
          reject(responseJson.error.message);
        }
      } catch (err) {
        reject("No se pudo obtener el número de teléfono");
      }
    });
  }
  function getPhoneCodeSimOtp(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      const extractCode = smsContent => {
        let match = smsContent.match(/\b\d{6}\b/);
        return match && match[0];
      };
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://simotp.net/api/v1/order/" + phoneId, {
            headers: {
              Authorization: "OTP " + apiKey
            }
          });
          const responseJson = response.json;
          if (responseJson.data) {
            otpCode = extractCode(responseJson.data.content);
            if (otpCode) {
              resolve(otpCode);
              break;
            }
          }
        }
        if (!otpCode) {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhone233(apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      let appId = 9;
      if (app === "instagram") {
        appId = 15;
      }
      try {
        const response = await fetch2("https://api.233io9.info/api/dangkysim?api_key=" + apiKey + "&appId=" + appId);
        const responseJson = response.json;
        if (responseJson.ResponseCode == 200) {
          resolve({
            number: "84" + responseJson.Result.number,
            id: responseJson.Result.id
          });
        } else {
          reject(responseJson.Msg);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneCode233(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://api.233io9.info/api/layotpByID?api_key=" + apiKey + "&id=" + phoneId);
          const responseJson = response.json;
          if (responseJson.ResponseCode == 200) {
            otpCode = responseJson.Result[0].otp;
            resolve(otpCode);
            break;
          }
        }
        if (!otpCode) {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneSim24(apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🔍 [getPhoneSim24] Iniciando obtención de número`);
        console.log(`📋 Parámetros: API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'No definida'}, Servicio: ${app}`);
        
        const apiUrl = `https://sim24.cc/api?action=number&service=${app}&apikey=${apiKey}`;
        console.log(`🌐 [getPhoneSim24] Llamando API: ${apiUrl.replace(apiKey, apiKey.substring(0, 5) + '...')}`);
        
        const response = await fetch2(apiUrl);
        const responseJson = response.json;
        
        console.log(`📋 [getPhoneSim24] Respuesta del servidor:`, responseJson);
        
        if (responseJson && responseJson.ResponseCode !== undefined) {
          if (responseJson.ResponseCode == 0) {
            if (responseJson.Result && responseJson.Result.number && responseJson.Result.id) {
              const phoneData = {
                number: responseJson.Result.number,
                id: responseJson.Result.id
              };
              console.log(`✅ [getPhoneSim24] Número obtenido exitosamente: ${phoneData.number}, ID: ${phoneData.id}`);
              resolve(phoneData);
            } else {
              const errorMsg = `ResponseCode 0 pero datos inválidos en Result: ${JSON.stringify(responseJson.Result)}`;
              console.log(`❌ [getPhoneSim24] ${errorMsg}`);
              reject(new Error(errorMsg));
            }
          } else {
            const errorMsg = `Error del servidor - ResponseCode: ${responseJson.ResponseCode}`;
            console.log(`❌ [getPhoneSim24] ${errorMsg}`);
            if (responseJson.Message) {
              console.log(`📝 [getPhoneSim24] Mensaje del servidor: ${responseJson.Message}`);
            }
            reject(new Error(`${errorMsg}${responseJson.Message ? ': ' + responseJson.Message : ''}`));
          }
        } else {
          const errorMsg = `Respuesta inválida del servidor (sin ResponseCode): ${JSON.stringify(responseJson)}`;
          console.log(`❌ [getPhoneSim24] ${errorMsg}`);
          reject(new Error(errorMsg));
        }
      } catch (err) {
        console.error(`❌ [getPhoneSim24] Error general:`, err);
        reject(err);
      }
    });
  }
  function getPhoneCodeSim24(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(`🔍 [getPhoneCodeSim24] Iniciando obtención de código para ID: ${phoneId}`);
        console.log(`📋 Parámetros: API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'No definida'}, Intentos: ${maxAttempts}, Delay: ${waitMs}s`);
        
        let otpCode = null;
        let lastResponse = null;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          console.log(`🔄 [getPhoneCodeSim24] Intento ${attempt + 1}/${maxAttempts}...`);
          
          if (attempt > 0) {
            console.log(`⏳ Esperando ${waitMs} segundos antes del siguiente intento...`);
            await delayTime(waitMs * 1000);
          }
          
          try {
            const apiUrl = `https://sim24.cc/api?action=code&id=${phoneId}&apikey=${apiKey}`;
            console.log(`🌐 [getPhoneCodeSim24] Llamando API: ${apiUrl.replace(apiKey, apiKey.substring(0, 5) + '...')}`);
            
            const response = await fetch2(apiUrl);
            const responseJson = response.json;
            lastResponse = responseJson;
            
            console.log(`📋 [getPhoneCodeSim24] Respuesta del servidor:`, responseJson);
            
            if (responseJson && responseJson.ResponseCode !== undefined) {
              if (responseJson.ResponseCode == 0) {
                if (responseJson.Result && responseJson.Result.otp) {
                  otpCode = responseJson.Result.otp;
                  console.log(`✅ [getPhoneCodeSim24] Código obtenido exitosamente: ${otpCode}`);
                  break;
                } else {
                  console.log(`⚠️ [getPhoneCodeSim24] ResponseCode 0 pero sin OTP en Result:`, responseJson.Result);
                }
              } else {
                let errorDescription = '';
                switch(responseJson.ResponseCode) {
                  case 1: errorDescription = 'No hay código disponible aún (esperando SMS)'; break;
                  case 2: errorDescription = 'Número expirado o cancelado'; break;
                  case 3: errorDescription = 'Error de API o parámetros inválidos'; break;
                  case 4: errorDescription = 'Número ya usado o no válido'; break;
                  case 5: errorDescription = 'Saldo insuficiente'; break;
                  default: errorDescription = 'Error desconocido';
                }
                
                console.log(`❌ [getPhoneCodeSim24] Error del servidor - ResponseCode: ${responseJson.ResponseCode} (${errorDescription})`);
                if (responseJson.Message) {
                  console.log(`📝 [getPhoneCodeSim24] Mensaje del servidor: ${responseJson.Message}`);
                }
                
                if (responseJson.ResponseCode == 2 || responseJson.ResponseCode == 3 || responseJson.ResponseCode == 4 || responseJson.ResponseCode == 5) {
                  console.log(`🛑 [getPhoneCodeSim24] Código de error terminal (${errorDescription}), deteniendo intentos`);
                  break;
                }
                
                if (responseJson.ResponseCode == 1) {
                  console.log(`⏳ [getPhoneCodeSim24] Continuando intentos... (${errorDescription})`);
                }
              }
            } else {
              console.log(`❌ [getPhoneCodeSim24] Respuesta inválida del servidor (sin ResponseCode):`, responseJson);
            }
            
          } catch (requestError) {
            console.error(`❌ [getPhoneCodeSim24] Error en solicitud HTTP:`, requestError);
            lastResponse = { error: requestError.message };
          }
        }
        
        if (otpCode) {
          console.log(`🎉 [getPhoneCodeSim24] Proceso completado exitosamente con código: ${otpCode}`);
          resolve(otpCode);
        } else {
          const errorMsg = `No se pudo obtener código después de ${maxAttempts} intentos. Última respuesta: ${JSON.stringify(lastResponse)}`;
          console.log(`❌ [getPhoneCodeSim24] ${errorMsg}`);
          reject(new Error(errorMsg));
        }
      } catch (err) {
        console.error(`❌ [getPhoneCodeSim24] Error general:`, err);
        reject(err);
      }
    });
  }
  function getPhoneChoThueSimCode(apiKey, app) {
    return new Promise(async (resolve, reject) => {
      try {
        const settings = await getLocalStorage("setting");
        const carrier = settings.general.carrier.value;
        let appId = "1001";
        let phonePrefix = "";
        if (app === "instagram") {
          appId = "1010";
          phonePrefix = "84";
        }
        const response = await fetch2("https://chaycodeso3.com/api?act=number&apik=" + apiKey + "&appId=" + appId + "&carrier=" + carrier);
        const responseJson = response.json;
        if (responseJson.ResponseCode == 0) {
          const phoneData = {
            number: phonePrefix + responseJson.Result.Number,
            id: responseJson.Result.Id
          };
          resolve(phoneData);
        } else {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneCodeChoThueSimCode(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://chaycodeso3.com/api?act=code&apik=" + apiKey + "&id=" + phoneId);
          const responseJson = response.json;
          if (responseJson.ResponseCode == 0) {
            otpCode = responseJson.Result.Code;
            break;
          }
        }
        if (otpCode) {
          resolve(otpCode);
        } else {
          await fetch2("https://chaycodeso3.com/api?act=expired&apik=" + apiKey + "&id=" + phoneId);
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneOtpOnline(apiKey) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch2("https://api.server-otponline.xyz/api/public/user/sim/buy/v2?appId=34&apiKey=" + apiKey);
        const responseJson = response.json;
        if (responseJson.isSuccessed) {
          const phoneData = {
            number: responseJson.resultObj.value.number,
            id: responseJson.resultObj.value.id
          };
          resolve(phoneData);
        } else {
          reject(responseJson.message);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneCodeOnlineOtp(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://api.server-otponline.xyz/api/public/user/sim/v2?orderId=" + phoneId + "&apiKey=" + apiKey);
          const responseJson = response.json;
          if (responseJson.isSuccessed && responseJson.resultObj.status == "2") {
            otpCode = responseJson.resultObj.code;
            break;
          }
          if (responseJson.resultObj.status == "3" || responseJson.resultObj.status == "4") {
            break;
          }
        }
        if (otpCode) {
          resolve(otpCode);
        } else {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneViOtp(apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      let serviceId = 7;
      if (app === "microsoft") {
        serviceId = 5;
      }
      if (app === "instagram") {
        serviceId = 36;
      }
      try {
        const response = await fetch2("https://api.viotp.com/request/getv2?token=" + apiKey + "&serviceId=" + serviceId);
        const responseJson = response.json;
        if (responseJson.success) {
          const phoneData = {
            number: responseJson.data.phone_number,
            id: responseJson.data.request_id
          };
          resolve(phoneData);
        } else {
          reject(responseJson.message);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneCodeViOtp(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://api.viotp.com/session/getv2?requestId=" + phoneId + "&token=" + apiKey);
          const responseJson = response.json;
          if (responseJson.success) {
            if (responseJson.data.Code !== null) {
              otpCode = responseJson.data.Code;
              resolve(otpCode);
            }
          } else {
            reject(responseJson.message);
          }
        }
        if (!otpCode) {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneXotp(apiKey, app = "facebook") {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch2("https://xotp.pro/api/v1/create-request?apikey=" + apiKey + "&service=" + app);
        const responseJson = response.json;
        if (!responseJson.error) {
          const phoneData = {
            number: responseJson.phone,
            id: responseJson.id
          };
          resolve(phoneData);
        } else {
          reject(responseJson.error);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getPhoneCodeXotp(apiKey, phoneId, maxAttempts, waitMs) {
    return new Promise(async (resolve, reject) => {
      try {
        let otpCode = null;
        for (let attempt = 0; attempt < waitMs; attempt++) {
          await delayTime(waitMs * 100);
          const response = await fetch2("https://xotp.pro/api/v1/get-request?apikey=" + apiKey + "&id=" + phoneId);
          const responseJson = response.json;
          if (responseJson.code) {
            otpCode = responseJson.code;
            break;
          }
        }
        if (otpCode) {
          resolve(otpCode);
        } else {
          await fetch2("https://xotp.pro/api/v1/cancel-request?apikey=" + apiKey + "&id=" + phoneId);
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  function getBase64Image(url) {
    return fetch2(url).then(response => response.blob()).then(blob => new Promise(resolve => {
      let reader = new FileReader();
      reader.onload = function () {
        resolve(this.result);
      };
      reader.readAsDataURL(blob);
    }));
  }
  function makeid(length) {
    let result = "";
    const charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    const charsetLength = charset.length;
    let i = 0;
    while (i < length) {
      result += charset.charAt(Math.floor(Math.random() * charsetLength));
      i += 1;
    }
    return result;
  }
  function getNewEmail() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch2("https://mailicioso.com/api/v2/email", {
          headers: {
            "content-type": "application/json"
          },
          method: "POST"
        });
        const responseJson = response.json;
        
        if (responseJson.status === "success" && responseJson.data && responseJson.data.email) {
          const emailData = {
            success: true,
            id: responseJson.data.email.split("@")[0],
            email: responseJson.data.email,
            expires_at: responseJson.data.expires_at,
            messages_endpoint: responseJson.data.messages_endpoint
          };
          console.log("✅ Nuevo email temporal creado:", emailData.email);
          resolve(emailData);
        } else {
          console.error("❌ Error al crear email temporal:", responseJson);
          reject("No se pudo crear email temporal");
        }
      } catch (error) {
        console.error("❌ Error en getNewEmail:", error);
        reject("Error de conexión al crear email");
      }
    });
  }
  function getEmailInbox(emailId, emailAddress) {
    return new Promise(async (resolve, reject) => {
      try {
        const encodedEmail = encodeURIComponent(emailAddress);
        const response = await fetch2(`https://mailicioso.com/api/v2/messages/${encodedEmail}`, {
          method: "GET"
        });
        const responseJson = response.json;
        
        if (responseJson.status === "success" && responseJson.data && responseJson.data.messages) {
          const transformedMessages = responseJson.data.messages.map(msg => ({
            id: msg.id,
            email: msg.from_email,
            from: msg.from,
            subject: msg.subject,
            content: msg.content,
            receivedAt: msg.receivedAt,
            is_seen: msg.is_seen,
            attachments: msg.attachments || []
          }));
          
          console.log(`📧 Encontrados ${transformedMessages.length} mensajes para ${emailAddress}`);
          resolve(transformedMessages);
        } else if (responseJson.status === "success" && responseJson.data && responseJson.data.messages.length === 0) {
          console.log(`📧 No hay mensajes para ${emailAddress}`);
          resolve([]);
        } else {
          console.error("❌ Error al obtener inbox:", responseJson);
          reject("No se pudieron obtener los mensajes");
        }
      } catch (error) {
        console.error("❌ Error en getEmailInbox:", error);
        reject("Error de conexión al obtener mensajes");
      }
    });
  }
  function deleteEmail(emailAddress) {
    return new Promise(async (resolve, reject) => {
      try {
        const encodedEmail = encodeURIComponent(emailAddress);
        const response = await fetch2(`https://mailicioso.com/api/v2/email/${encodedEmail}`, {
          method: "DELETE"
        });
        const result = response.json;
        
        if (result.status === "success") {
          console.log("✅ Email eliminado:", emailAddress);
          resolve(true);
        } else {
          console.warn("⚠️ No se pudo eliminar email:", result);
          reject("No se pudo eliminar el email");
        }
      } catch (error) {
        console.error("❌ Error al eliminar email:", error);
        reject("Error de conexión al eliminar email");
      }
    });
  }

  function randomNumberRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  function checkLive(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch2("https://graph2.facebook.com/v3.3/" + userId + "/picture?redirect=0");
        const responseJson = response.json;
        if (responseJson.data.width && responseJson.data.height) {
          resolve(responseJson.data.url);
        } else {
          reject();
        }
      } catch {
        reject();
      }
    });
  }
  function runVia(settings, progressCallback) {
    return new Promise(async (resolve, reject) => {
      if (settings.via.getLinkXmdt.value) {
        progressCallback({
          action: "message",
          msg: "Obteniendo link XMDT..."
        });
        try {
          const linkAn = await fb.getLinkAn();
          progressCallback({
            action: "message",
            msg: "https://www.facebook.com/checkpoint/1501092823525282/" + linkAn
          });
        } catch {
          progressCallback({
            action: "message",
            msg: "Error al obtener el link XMDT"
          });
        }
      }
      resolve();
    });
  }

// =============================================================================
// SISTEMA DE UTILIDADES DE DEBUGGING PARA TELÉFONOS
// =============================================================================

/**
 * DivinAdsPhoneUtils - Sistema de debugging para servicios de teléfono
 * Descripción: Conjunto de utilidades para debuggear y monitorear servicios de teléfono
 */
window.DivinAdsPhoneUtils = {
  
  /**
   * Muestra el estado actual del sistema de teléfonos
   */
  showSystemStatus: async function() {
    try {
      console.log('📱 ===== ESTADO DEL SISTEMA DE TELÉFONOS =====');
      
      const settings = await saveSetting();
      const phoneService = settings.general?.phoneService?.value || 'none';
      const phoneServiceKey = settings.general?.phoneServiceKey?.value || '';
      const getPhoneAttempts = settings.general?.getPhoneNumber?.value || 6;
      const getCodeAttempts = settings.general?.getCodeNumber?.value || 10;
      const delayBetweenAttempts = settings.general?.delay?.value || 1;
      
      console.log('🔧 Configuración:');
      console.log(`   • Servicio: ${phoneService}`);
      console.log(`   • API Key: ${phoneServiceKey ? phoneServiceKey.substring(0, 10) + '...' : 'No configurada'}`);
      console.log(`   • Intentos obtener número: ${getPhoneAttempts}`);
      console.log(`   • Intentos obtener código: ${getCodeAttempts}`);
      console.log(`   • Delay entre intentos: ${delayBetweenAttempts}s`);
      
      // Verificar servicios soportados
      const supportedServices = [
        'chothuesimcode', 'viotp', 'xotp', 'otponline', 
        'sim24', '233io9', 'simotp', 'codesim', 'template'
      ];
      
      console.log('📋 Servicios soportados:', supportedServices);
      console.log(`✅ Servicio actual válido: ${supportedServices.includes(phoneService)}`);
      
      // Estado de rate limiting (si existe)
      const smsRateLimit = localStorage.getItem('sms_rate_limit_active');
      if (smsRateLimit) {
        console.log('🚫 Rate limit SMS activo desde:', new Date(smsRateLimit));
      } else {
        console.log('✅ Sin rate limit SMS activo');
      }
      
      console.log('==============================================');
      
      return {
        phoneService,
        hasApiKey: !!phoneServiceKey,
        getPhoneAttempts,
        getCodeAttempts,
        delayBetweenAttempts,
        isServiceSupported: supportedServices.includes(phoneService),
        smsRateLimited: !!smsRateLimit
      };
      
    } catch (error) {
      console.error('❌ Error al mostrar estado del sistema:', error);
      return null;
    }
  },
  
  /**
   * Prueba de conectividad básica con el servicio
   */
  testServiceConnectivity: async function(service = null, apiKey = null) {
    try {
      const settings = await saveSetting();
      const phoneService = service || settings.general?.phoneService?.value;
      const phoneServiceKey = apiKey || settings.general?.phoneServiceKey?.value;
      
      if (!phoneService || phoneService === 'none') {
        throw new Error('No hay servicio configurado');
      }
      
      if (!phoneServiceKey) {
        throw new Error('No hay API Key configurada');
      }
      
      console.log(`🔍 Probando conectividad con ${phoneService}...`);
      
      const result = await getPhone(phoneService, phoneServiceKey);
      
      if (result && result.number && result.id) {
        console.log('✅ Conectividad exitosa');
        console.log(`📞 Número de prueba: ${result.number}`);
        console.log(`🆔 ID: ${result.id}`);
        return { success: true, result };
      } else {
        console.log('❌ Conectividad fallida - respuesta inválida');
        return { success: false, error: 'Respuesta inválida' };
      }
      
    } catch (error) {
      console.error(`❌ Error de conectividad: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Prueba completa del flujo de teléfono (número + código)
   */
  testFullPhoneFlow: async function(service = null, apiKey = null) {
    try {
      console.log('🧪 Iniciando prueba completa del flujo de teléfono...');
      
      const settings = await saveSetting();
      const phoneService = service || settings.general?.phoneService?.value;
      const phoneServiceKey = apiKey || settings.general?.phoneServiceKey?.value;
      
      // Paso 1: Obtener número
      console.log('📱 Paso 1: Obteniendo número...');
      const phoneResult = await getPhone(phoneService, phoneServiceKey);
      
      if (!phoneResult || !phoneResult.number || !phoneResult.id) {
        throw new Error('No se pudo obtener número válido');
      }
      
      console.log(`✅ Número obtenido: ${phoneResult.number}`);
      console.log(`🆔 ID: ${phoneResult.id}`);
      
      // Paso 2: Esperar un poco
      console.log('⏳ Esperando 10 segundos antes de intentar obtener código...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Paso 3: Intentar obtener código
      console.log('🔢 Paso 2: Intentando obtener código...');
      try {
        const codeResult = await getPhoneCode(phoneService, phoneServiceKey, phoneResult.id);
        
        if (codeResult) {
          console.log(`✅ Código obtenido: ${codeResult}`);
          console.log('🎉 Flujo completo exitoso!');
          return { 
            success: true, 
            phone: phoneResult.number, 
            id: phoneResult.id, 
            code: codeResult 
          };
        } else {
          console.log('⚠️ No se obtuvo código (puede ser normal)');
          return { 
            success: true, 
            phone: phoneResult.number, 
            id: phoneResult.id, 
            code: null,
            warning: 'Código no disponible'
          };
        }
        
      } catch (codeError) {
        console.warn(`⚠️ Error al obtener código: ${codeError.message}`);
        return { 
          success: true, 
          phone: phoneResult.number, 
          id: phoneResult.id, 
          code: null,
          codeError: codeError.message
        };
      }
      
    } catch (error) {
      console.error(`❌ Error en flujo completo: ${error.message}`);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Marca rate limit de SMS
   */
  markSmsRateLimit: function() {
    const timestamp = new Date().toISOString();
    localStorage.setItem('sms_rate_limit_active', timestamp);
    console.log('🚫 Rate limit SMS marcado:', timestamp);
  },
  
  /**
   * Verifica si hay rate limit activo
   */
  checkSmsRateLimit: function() {
    const rateLimitTime = localStorage.getItem('sms_rate_limit_active');
    if (!rateLimitTime) return false;
    
    const limitTime = new Date(rateLimitTime);
    const now = new Date();
    const hoursElapsed = (now - limitTime) / (1000 * 60 * 60);
    
    const isActive = hoursElapsed < 24;
    console.log(`🔍 Rate limit SMS: ${isActive ? 'ACTIVO' : 'INACTIVO'} (${hoursElapsed.toFixed(1)}h)`);
    
    return isActive;
  },
  
  /**
   * Limpia rate limit de SMS
   */
  clearSmsRateLimit: function() {
    localStorage.removeItem('sms_rate_limit_active');
    console.log('✅ Rate limit SMS limpiado');
  },
  
  /**
   * Lista todos los servicios disponibles
   */
  listAvailableServices: function() {
    const services = {
      'chothuesimcode': { name: 'yuenanka.com', features: ['phone', 'code'] },
      'viotp': { name: 'viotp.com', features: ['phone', 'code'] },
      'xotp': { name: 'xotp.pro', features: ['phone', 'code'] },
      'otponline': { name: 'app.server-otponline.xyz', features: ['phone', 'code'] },
      'sim24': { name: 'sim24.cc', features: ['phone', 'code'] },
      '233io9': { name: 'api.233io9.info', features: ['phone', 'code'] },
      'simotp': { name: 'simig.net', features: ['phone', 'code'] },
      'codesim': { name: 'codesim.net', features: ['phone', 'code'] },
      'template': { name: 'Personalizado', features: ['phone', 'code', 'custom'] }
    };
    
    console.log('📋 Servicios de teléfono disponibles:');
    Object.entries(services).forEach(([key, info]) => {
      console.log(`   • ${key}: ${info.name} (${info.features.join(', ')})`);
    });
    
    return services;
  },
  
  /**
   * Ejecuta diagnóstico completo
   */
  runFullDiagnostic: async function() {
    console.log('🔧 ===== DIAGNÓSTICO COMPLETO DEL SISTEMA DE TELÉFONOS =====');
    
    // 1. Estado del sistema
    const systemStatus = await this.showSystemStatus();
    
    // 2. Rate limit check
    const rateLimited = this.checkSmsRateLimit();
    
    // 3. Servicios disponibles
    this.listAvailableServices();
    
    // 4. Prueba de conectividad si está configurado
    if (systemStatus && systemStatus.isServiceSupported && systemStatus.hasApiKey) {
      console.log('🧪 Ejecutando prueba de conectividad...');
      const connectivityTest = await this.testServiceConnectivity();
      
      if (connectivityTest.success) {
        console.log('✅ Diagnóstico: Sistema funcionando correctamente');
      } else {
        console.log('❌ Diagnóstico: Problemas detectados');
        console.log('💡 Sugerencias:');
        console.log('   • Verifica tu API Key');
        console.log('   • Confirma que tienes saldo suficiente');
        console.log('   • Prueba con otro servicio');
      }
    } else {
      console.log('⚠️ Sistema no completamente configurado');
    }
    
    console.log('=======================================================');
    
    return {
      systemStatus,
      rateLimited,
      configured: systemStatus?.isServiceSupported && systemStatus?.hasApiKey
    };
  },
  
  /**
   * Funciones específicas para rate limit de SMS
   */
  smsRateLimit: {
    /**
     * Obtiene información detallada del rate limit activo
     */
    getInfo: function() {
      const rateLimitTime = localStorage.getItem('sms_rate_limit_active');
      if (!rateLimitTime) {
        return {
          active: false,
          message: '✅ No hay rate limit de SMS activo'
        };
      }
      
      const limitTime = new Date(rateLimitTime);
      const now = new Date();
      const hoursElapsed = (now - limitTime) / (1000 * 60 * 60);
      const hoursRemaining = Math.max(0, 24 - hoursElapsed);
      
      return {
        active: hoursElapsed < 24,
        activatedAt: limitTime,
        hoursElapsed: hoursElapsed,
        hoursRemaining: hoursRemaining,
        message: hoursElapsed < 24 
          ? `🚫 Rate limit activo. Quedan ${hoursRemaining.toFixed(1)} horas`
          : '✅ Rate limit expirado (puede ser removido)'
      };
    },
    
    /**
     * Muestra estado detallado del rate limit
     */
    showStatus: function() {
      const info = this.getInfo();
      console.log('📱 ===== ESTADO DEL RATE LIMIT DE SMS =====');
      console.log(`Estado: ${info.message}`);
      
      if (info.active) {
        console.log(`📅 Activado: ${info.activatedAt.toLocaleString()}`);
        console.log(`⏱️ Tiempo transcurrido: ${info.hoursElapsed.toFixed(1)} horas`);
        console.log(`⏰ Tiempo restante: ${info.hoursRemaining.toFixed(1)} horas`);
        console.log('💡 Usa DivinAdsPhoneUtils.smsRateLimit.forceRemove() para eliminar (no recomendado)');
      }
      
      console.log('==========================================');
      return info;
    },
    
    /**
     * Remueve forzadamente el rate limit (no recomendado)
     */
    forceRemove: function() {
      const info = this.getInfo();
      if (!info.active) {
        console.log('✅ No hay rate limit activo para remover');
        return false;
      }
      
      console.warn('⚠️ ADVERTENCIA: Removiendo rate limit forzadamente');
      console.warn('⚠️ Esto puede resultar en desperdicio de números de teléfono');
      console.warn(`⚠️ Rate limit tenía ${info.hoursRemaining.toFixed(1)} horas restantes`);
      
      localStorage.removeItem('sms_rate_limit_active');
      console.log('✅ Rate limit removido');
      
      return true;
    },
    
    /**
     * Establece un rate limit manualmente
     */
    setManual: function(hoursFromNow = 24) {
      const now = new Date();
      const rateTime = new Date(now.getTime() - ((24 - hoursFromNow) * 60 * 60 * 1000));
      
      localStorage.setItem('sms_rate_limit_active', rateTime.toISOString());
      console.log(`🚫 Rate limit establecido manualmente`);
      console.log(`⏰ Expirará en: ${hoursFromNow} horas`);
      
      return this.getInfo();
    }
  },
  
  /**
   * Herramientas de emergencia
   */
  emergency: {
    /**
     * Reinicia completamente el sistema de teléfonos
     */
    resetSystem: function() {
      console.log('🚨 ===== REINICIO DE EMERGENCIA DEL SISTEMA =====');
      
      // Limpiar rate limits
      localStorage.removeItem('sms_rate_limit_active');
      console.log('✅ Rate limit de SMS removido');
      
      // Mostrar estado final
      console.log('🔍 Estado final del sistema:');
      window.DivinAdsPhoneUtils.showSystemStatus();
      
      console.log('===============================================');
      console.log('⚠️ IMPORTANTE: Este reinicio no garantiza que Facebook acepte números');
      console.log('⚠️ Si Facebook sigue rechazando, espera al menos 24 horas');
    },
    
    /**
     * Información sobre qué hacer en caso de problemas
     */
    help: function() {
      console.log('🆘 ===== AYUDA DE EMERGENCIA =====');
      console.log('');
      console.log('🚫 Si Facebook rechaza números:');
      console.log('   1. Verifica: DivinAdsPhoneUtils.smsRateLimit.showStatus()');
      console.log('   2. Si hay rate limit activo, espera 24 horas');
      console.log('   3. Usa otra cuenta de Facebook si tienes');
      console.log('');
      console.log('📱 Si sim24 no funciona:');
      console.log('   1. Verifica: DivinAdsPhoneUtils.testServiceConnectivity()');
      console.log('   2. Revisa tu saldo en sim24.cc');
      console.log('   3. Cambia a otro servicio');
      console.log('');
      console.log('🔧 Comandos útiles:');
      console.log('   • DivinAdsPhoneUtils.smsRateLimit.showStatus()');
      console.log('   • DivinAdsPhoneUtils.emergency.resetSystem()');
      console.log('   • DivinAdsPhoneUtils.runFullDiagnostic()');
      console.log('');
      console.log('================================');
    }
  }
};

console.log('📱 DivinAdsPhoneUtils cargado. Usa window.DivinAdsPhoneUtils.showSystemStatus() para ver el estado.');
console.log('💡 Otros comandos útiles:');
console.log('   • DivinAdsPhoneUtils.testServiceConnectivity() - Prueba conectividad');
console.log('   • DivinAdsPhoneUtils.testFullPhoneFlow() - Prueba flujo completo');
console.log('   • DivinAdsPhoneUtils.runFullDiagnostic() - Diagnóstico completo');
console.log('   • DivinAdsPhoneUtils.checkSmsRateLimit() - Verificar rate limit');
console.log('   • DivinAdsPhoneUtils.smsRateLimit.showStatus() - Estado detallado del rate limit');
console.log('   • DivinAdsPhoneUtils.smsRateLimit.forceRemove() - Remover rate limit (no recomendado)');
console.log('   • DivinAdsPhoneUtils.emergency.help() - Ayuda de emergencia');
console.log('   • DivinAdsPhoneUtils.emergency.resetSystem() - Reinicio de emergencia');