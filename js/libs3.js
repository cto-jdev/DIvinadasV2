/**
 * getCurrentUser
 * Descripción: Obtiene el usuario actual desde localStorage y lo retorna.
 * Retorna: Promise<Object> (usuario actual)
 */
function getCurrentUser() {
    return new Promise(async (p286, p287) => {
      try {
        const v359 = await getLocalStorage("uid");
        const v360 = await getLocalStorage("dataClone");
        const v361 = v360.filter(p288 => p288.uid === v359)[0];
        p286(v361);
      } catch (e60) {
        p287(e60);
      }
    });
  }
/**
 * getBase64ImageFromUrl
 * Descripción: Convierte una imagen obtenida por URL a formato base64.
 * Parámetros: p289 (string URL de la imagen)
 * Retorna: Promise<string> (base64 de la imagen)
 */
async function getBase64ImageFromUrl(p289) {
    const v362 = await fetch(p289);
    const v363 = await v362.blob();
    return new Promise((p290, p291) => {
      const v364 = new FileReader();
      v364.addEventListener("load", function () {
        p290(v364.result);
      }, false);
      v364.onerror = () => {
        return p291(this);
      };
      v364.readAsDataURL(v363);
    });
  }
  let rates = false;
  /**
   * Evento ready principal
   * Descripción: Inicializa la aplicación, verifica actualizaciones, estado de sesión y carga datos de usuario y calidad de cuenta.
   */
  $(document).ready(async function () {
    const v365 = $("#app").attr("data");
    const v366 = await getLocalStorage("folded");
    if (!v366) {
      $("body").removeClass("folded");
    }
    if (v365 !== "setting") {
      const v367 = await fetch("https://divinads.com/wp-json/divinads/v1/updates", {
        cache: "no-cache"
      });
      rates = await (await fetch("../rates.json")).json();
      const v368 = await v367.json();
      
      // Usar directamente los elementos web ya que es todo lo que tenemos
      const v369 = v368.filter(p292 => p292.type === "web");
      const v370 = await getVersion();
      
      // Verificar que tenemos datos antes de acceder
      if (v369.length > 0) {
        const v371 = v369[0].version;
        const v372 = v369[0].note;
        const v376 = await getLocalStorage("ver");
        
        if (v376 !== v371) {
          await setLocalStorage("ver", v371);
          $(".appVersion").html("<span class=\"mb-0 text-decoration-none badge text-bg-light\">v" + v371 + "</span>");
          Swal.fire({
            icon: "success",
            title: "Actualización exitosa v" + v371,
            text: "¿Qué hay de nuevo en esta versión?",
            confirmButtonText: "Continuar",
            input: "textarea",
            inputValue: v372.replaceAll("<br>", "\r\n"),
            allowOutsideClick: false,
            inputAttributes: {
              rows: 7,
              disabled: true
            }
          });
        }
      }
      let v377 = false;
      const vF11 = async () => {
        const v378 = await fb.checkLive();
        if (v378 !== "success") {
          if (v378 === "not_login") {
            $(document).trigger("notLogged");
          }
          if (v378 === "282") {
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
            }).then(async p294 => {
              if (p294.isConfirmed) {
                await emptyCookie();
                location.reload();
              }
            });
          }
          if (v378 === "956") {
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
            }).then(async p295 => {
              if (p295.isConfirmed) {
                await emptyCookie();
                location.reload();
              }
            });
          }
          $("#pageLoading").addClass("d-none");
          $("#gridLoading").addClass("d-none");
          $("body").addClass("data-loaded");
          try {
            clearInterval(v377);
          } catch (e61) {
            console.log(e61);
          }
        }
      };
      v377 = setInterval(async () => {
        await vF11();
      }, 5000);
      await vF11();
      if (v365 === "via") {
        let vLS8 = "";
        v368.forEach(p296 => {
          vLS8 += "\n                        <div class=\"d-flex\">\n                            <div class=\"me-3 pt-2\">\n                                <span class=\"badge text-bg-success\">v" + p296.version + "</span>\n                                <small class=\"d-block mt-2 text-nowrap\">" + p296.date.split("T")[0] + "</small>\n                            </div>\n                            <div class=\"alert alert-light w-100\" role=\"alert\">" + p296.note + "</div>\n                        </div>\n                    ";
        });
        $("#versions").html(vLS8);
      }
      const vF12 = async () => {
        await fb.init();
        let vLS9 = "";
        let vLS10 = "";
        try {
          const v379 = await fb.getAccountQuality();
          vLS10 = "<a href=\"https://www.facebook.com/business-support-home/" + fb.uid + "\" target=\"_BLANK\" class=\"text-decoration-none badge text-bg-" + v379.color + " mb-1\" style=\"font-size: 12px;\">" + v379.status + "</a>";
          $("#quality").html(vLS10);
          if (vLS10.status === "XMDT Checkpoint") {
            vLS9 = "<button id=\"xmdt\" type=\"button\" class=\"position-absolute end-0 btn btn-success btn-sm\"><i class=\"ri-shield-check-line me-1\"></i>Apelar</button>";
          }
          if (vLS10.status === "HCQC 902 Rechazado - Volver a XMDT 273" || vLS10.status === "Apelando 902" || vLS10.status === "Restricción 902 XMDT" || vLS10.status === "HCQC 902 Pendiente") {
            vLS9 = "<button id=\"k902\" type=\"button\" class=\"position-absolute end-0 btn btn-success btn-sm\"><i class=\"ri-shield-check-line me-1\"></i>Apelar 902</button>";
          }
        } catch (e62) {
          console.log(e62);
        }
        $("#userInfo").html("\n                    <div class=\"dropdown\">\n                        <div data-bs-toggle=\"dropdown\" data-bs-auto-close=\"outside\" style=\"cursor: pointer\">\n                            <span class=\"d-flex justify-content-between align-items-center border-start ms-3 ps-3\" style=\"width:calc(350px - 1rem);\">\n                                <span class=\"d-flex flex-column\">\n                                    <span class=\"position-relative\">\n                                        " + vLS9 + "\n                                        <span class=\"d-flex align-items-center flex-wrap\">\n                                            <span class=\"rounded-circle overflow-hidden\" style=\"width: 33px;\">\n                                                <img id=\"fbAvatar\" class=\"w-100 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                            </span>\n                                            <span class=\"ps-2\" style=\"width: calc(100% - 33px)\">\n                                                <span class=\"d-block mb-0 fw-bold text-truncate\" style=\"width: 200px;\">" + fb.userInfo.name + "</span>\n                                                <small class=\"d-block\">" + fb.uid + "</small>\n                                            </span>\n                                        </span>\n                                    </span>\n                                </span>\n                                <i class=\"ri-arrow-down-s-fill fs-5 m-0\" style=\"color: #666\"></i>\n                            </span>\n                        </div>\n                        <div class=\"dropdown-menu dropdown-menu-end overflow-hidden p-0 shadow\" style=\"width:calc(350px - 3rem);\">\n                            <div class=\"p-2\" style=\"background: #f0ecf4\">\n                                <div class=\"d-flex align-items-center justify-content-center\">\n                                    <div class=\"rounded-circle overflow-hidden shadow bg-white\" style=\"width: 70px; margin-bottom: -35px;\">\n                                        <img class=\"w-100 p-1 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                    </div>\n                                </div>\n                            </div>\n                            <div class=\"p-3 mt-4\">\n                                <div class=\"d-flex flex-column align-items-center\">\n                                    <span class=\"fw-bold fs-5\">" + fb.userInfo.name + "</span>\n                                    <span class=\"mb-2\">" + fb.uid + "</span>\n                                    " + vLS10 + "\n                                </div>\n                            </div>\n                            <ul class=\"p-3 m-0 border-top list-unstyled\">\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-mail-line me-2\"></i> Email: " + fb.userInfo.email + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-calendar-line me-2\"></i> Fecha de nacimiento: " + fb.userInfo.birthday + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-group-line me-2\"></i> Amigos: " + fb.userInfo.friends + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-men-line me-2\"></i> Género: " + (fb.userInfo.gender === "male" ? "Masculino" : "Femenino") + "\n                                    </span>\n                                </li>\n                            </ul>\n                            <ul class=\"border-top p-3 m-0 list-unstyled\">\n                                <li>\n                                    <a href=\"#\" id=\"switch\" class=\"text-decoration-none py-1 d-block fw-medium text-black\">\n                                        <i class=\"ri-repeat-line me-2\"></i> Cambiar cuenta\n                                    </a>\n                                </li>\n                                <li>\n                                    <a href=\"#\" id=\"logout\" class=\"text-decoration-none py-1 d-block fw-medium text-black\">\n                                        <i class=\"ri-logout-box-r-line me-2\"></i> Cerrar sesión\n                                    </a>\n                                </li>\n                            </ul>\n                        </div>\n                    </div>\n                ");
        if (v365 === "via") {
          $("#viaInfo").html("\n                        <div class=\"card border-0 rounded-4 shadow-sm mb-4 p-4\" style=\"background: #013b3b \">\n                            <div class=\"d-flex align-items-center justify-content-between\">\n                                <div class=\"d-flex align-items-center\">\n                                    <div class=\"rounded-circle overflow-hidden shadow bg-white\" style=\"width: 70px;\">\n                                        <img class=\"w-100 p-1 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                    </div>\n                                    <div class=\"ms-3\">\n                                        <span class=\"text-white fs-4 fw-medium d-block mb-0\">" + fb.userInfo.name + "</span>\n                                        <span class=\"text-white d-block\"><i class=\"ri-user-line\"></i> " + fb.uid + "</span>\n                                        <span class=\"text-white\"><i class=\"ri-mail-line\"></i> " + fb.userInfo.email + "</span>\n                                    </div>\n                                </div>\n                                <div class=\"rounded-4 p-3\" style=\"background-color: #ffffff1c; width: 500px;\">\n                                    <div class=\"row flex-grow-1\">\n                                        <div class=\"col-4 border-end\" style=\"border-color: #ffffff1c !important;\">\n                                            <div class=\"d-flex flex-wrap align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-calendar-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div style=\"width: calc(100% - 30px);\">\n                                                    <div class=\"ms-3\">\n                                                        <strong class=\"d-block text-white text-truncate\">" + fb.userInfo.birthday + "</strong>\n                                                        <span class=\"text-white-50 fw-medium\">Fecha de nacimiento</span>\n                                                    </div>\n                                                </div>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-4 border-end\" style=\"border-color: #ffffff1c !important;\">\n                                            <div class=\"d-flex align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-user-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div class=\"ms-3\">\n                                                    <strong class=\"d-block text-white\">" + fb.userInfo.friends + "</strong>\n                                                    <span class=\"text-white-50 fw-medium\">Amigos</span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-4\">\n                                            <div class=\"d-flex align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-men-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div class=\"ms-3\">\n                                                    <strong class=\"d-block text-white\">" + (fb.userInfo.gender === "male" ? "Masculino" : "Femenino") + "</strong>\n                                                    <span class=\"text-white-50 fw-medium\">Género</span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    ");
        }
        try {
          if (v365 === "bm") {
            const v380 = await getLocalStorage("loadBm");
            const v381 = await getLocalStorage("dataBm_" + fb.uid);
            if (v380) {
              await removeLocalStorage("loadBm");
              await removeLocalStorage("dataBm_" + fb.uid);
              await fb.loadBm();
            } else if (v381) {
              await fb.loadBm();
            } else {
              Swal.fire({
                title: "Sin datos",
                text: "Por favor haz clic en el botón para cargar la información",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Cargar datos",
                cancelButtonText: "Cancelar"
              }).then(async p297 => {
                if (p297.isConfirmed) {
                  try {
                    await runCheckKey();
                    await setLocalStorage("loadBm", true);
                    location.reload();
                  } catch {}
                }
              });
            }
          }
          if (v365 === "page") {
            const v382 = await getLocalStorage("loadPage");
            const v383 = await getLocalStorage("dataPage_" + fb.uid);
            if (v382) {
              await removeLocalStorage("loadPage");
              await removeLocalStorage("dataPage_" + fb.uid);
              await fb.loadPage();
            } else if (v383) {
              await fb.loadPage();
            } else {
              Swal.fire({
                title: "No data",
                text: "Please click on the load data button to display the information",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Load data",
                cancelButtonText: "Cancel"
              }).then(async p298 => {
                if (p298.isConfirmed) {
                  try {
                    await runCheckKey();
                    await setLocalStorage("loadPage", true);
                    location.reload();
                  } catch {}
                }
              });
            }
          }
          if (v365 === "ads") {
            const v384 = await getLocalStorage("loadAds");
            const v385 = await getLocalStorage("dataAds_" + fb.uid);
            if (v384) {
              await removeLocalStorage("loadAds");
              await removeLocalStorage("dataAds_" + fb.uid);
              await fb.loadAds();
            } else if (v385) {
              await fb.loadAds();
            } else {
              Swal.fire({
                title: "No data",
                text: "Please click on the load data button to display the information",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Load data",
                cancelButtonText: "Cancel"
              }).then(async p299 => {
                if (p299.isConfirmed) {
                  try {
                    await runCheckKey();
                    await setLocalStorage("loadAds", true);
                    location.reload();
                  } catch {}
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
      vF12();
    }
  });
  function resolveCaptcha(p301, p302, p303) {
    return new Promise(async (p304, p305) => {
      try {
        const v390 = p301.general.captchaServiceKey.value;
        if (p301.general.captchaService.value === "1stcaptcha") {
          p304(await resolveCaptcha1st(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "2captcha") {
          p304(await resolve2Captcha(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "capmonster") {
          p304(await resolveCaptchaCapMonster(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "ezcaptcha") {
          p304(await resolveCaptchaEz(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "omocaptcha.com") {
          p304(await resolveCaptchaOmo(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "anticaptcha") {
          p304(await resolveCaptchaAntiCaptcha(v390, p302, p303));
        }
      } catch (e63) {
        p305(e63);
      }
    });
  }
  function resolveCaptchaImage(p306, p307) {
    return new Promise(async (p308, p309) => {
      try {
        const v391 = p306.general.captchaServiceKey.value;
        if (p306.general.captchaService.value === "omocaptcha.com") {
          p308(await resolveCaptchaOmoImage(v391, p307));
        }
        if (p306.general.captchaService.value === "anticaptcha") {
          p308(await resolveCaptchaAntiCaptchaImage(v391, p307));
        }
        if (p306.general.captchaService.value === "2captcha") {
          p308(await resolveCaptcha2CaptchaImage(v391, p307));
        }
      } catch (e64) {
        p309(e64);
      }
    });
  }
  function resolveCaptchaAntiCaptchaImage(p310, p311) {
    return new Promise(async (p312, p313) => {
      try {
        const vO41 = {
          apikey: p310,
          img: p311,
          type: 6
        };
        const v392 = await fetch2("https://anticaptcha.top/api/captcha", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO41)
        });
        const v393 = v392.json;
        if (v393.success) {
          p312(v393.captcha);
        } else {
          p313(v393.message);
        }
      } catch (e65) {
        p313("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptcha1st(p314, p315, p316) {
    return new Promise(async (p317, p318) => {
      try {
        const v394 = await fetch2("https://api.1stcaptcha.com/recaptchav2_enterprise?apikey=" + p314 + "&sitekey=" + p315 + "&siteurl=" + p316);
        const v395 = v394.json;
        if (v395.Code === 0) {
          const v396 = +v395.TaskId;
          let v397;
          for (let vLN025 = 0; vLN025 < 10; vLN025++) {
            try {
              const v398 = await fetch2("https://api.1stcaptcha.com/getresult?apikey=" + p314 + "&taskid=" + v396);
              const v399 = v398.json;
              if (v399.Status === "SUCCESS") {
                v397 = v399.Data.Token;
                break;
              } else if (v399.Status === "ERROR") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v397) {
            p317(v397);
          } else {
            p318("No se pudo resolver el captcha");
          }
        } else {
          p318(v395.Message);
        }
      } catch (e66) {
        p318("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaOmo(p319, p320, p321) {
    return new Promise(async (p322, p323) => {
      try {
        const vO43 = {
          api_token: p319,
          data: {
            type_job_id: "2"
          }
        };
        const v400 = await fetch2("https://omocaptcha.com/api/createJob", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO43)
        });
        const v401 = v400.json;
        if (v401.success) {
          const v402 = v401.job_id;
          let v403;
          for (let vLN026 = 0; vLN026 < 10; vLN026++) {
            try {
              const vO45 = {
                api_token: p319,
                job_id: v402
              };
              const v404 = await fetch2("https://omocaptcha.com/api/getJobResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO45)
              });
              const v405 = v404.json;
              if (v405.status === "success") {
                v403 = v405.result;
                break;
              } else if (v405.Status === "fail") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v403) {
            p322(v403);
          } else {
            p323("No se pudo resolver el captcha");
          }
        } else {
          p323(v401.message);
        }
      } catch (e67) {
        p323("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaOmoImage(p324, p325) {
    return new Promise(async (p326, p327) => {
      try {
        const vO46 = {
          type_job_id: "30",
          image_base64: p325
        };
        const vO47 = {
          api_token: p324,
          data: vO46
        };
        const v406 = await fetch2("https://omocaptcha.com/api/createJob", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO47)
        });
        const v407 = v406.json;
        if (v407.success) {
          const v408 = v407.job_id;
          let v409;
          for (let vLN027 = 0; vLN027 < 10; vLN027++) {
            try {
              const vO48 = {
                api_token: p324,
                job_id: v408
              };
              const v410 = await fetch2("https://omocaptcha.com/api/getJobResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO48)
              });
              const v411 = v410.json;
              if (v411.status === "success") {
                v409 = v411.result;
                break;
              } else if (v411.Status === "fail") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v409) {
            p326(v409);
          } else {
            p327("No se pudo resolver el captcha");
          }
        } else {
          p327(v407.message);
        }
      } catch (e68) {
        p327("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptcha2CaptchaImage(p328, p329) {
    return new Promise(async (p330, p331) => {
      try {
        const v412 = await fetch2("https://api.2captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p328,
            task: {
              type: "ImageToTextTask",
              body: p329
            }
          })
        });
        const v413 = v412.json;
        if (v413.taskId) {
          const v414 = +v413.taskId;
          let v415;
          for (let vLN028 = 0; vLN028 < 30; vLN028++) {
            try {
              const vO50 = {
                clientKey: p328,
                taskId: v414
              };
              const v416 = await fetch2("https://api.2captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO50)
              });
              const v417 = v416.json;
              if (v417.status === "ready") {
                v415 = v417.solution.text;
                break;
              } else if (v417.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v415) {
            p330(v415);
          } else {
            p331("No se pudo resolver el captcha");
          }
        } else {
          p331(v413.Message);
        }
      } catch (e69) {
        console.log(e69);
        p331("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaCapMonster(p332, p333, p334) {
    return new Promise(async (p335, p336) => {
      try {
        const v418 = await fetch2("https://api.capmonster.cloud/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p332,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: p334,
              websiteKey: p333
            }
          })
        });
        const v419 = v418.json;
        if (v419.taskId) {
          const v420 = +v419.taskId;
          let v421;
          for (let vLN029 = 0; vLN029 < 10; vLN029++) {
            try {
              const vO51 = {
                clientKey: p332,
                taskId: v420
              };
              const v422 = await fetch2("https://api.capmonster.cloud/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO51)
              });
              const v423 = v422.json;
              if (v423.status === "ready") {
                v421 = v423.solution.gRecaptchaResponse;
                break;
              } else if (v423.errorCode != 0 && v423.status !== "processing") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v421) {
            p335(v421);
          } else {
            p336("No se pudo resolver el captcha");
          }
        } else {
          p336(v419.Message);
        }
      } catch (e70) {
        p336("No se pudo resolver el captcha");
      }
    });
  }
  function resolve2Captcha(p337, p338, p339) {
    return new Promise(async (p340, p341) => {
      try {
        const v424 = await fetch2("https://api.2captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p337,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: p339,
              websiteKey: p338
            }
          })
        });
        const v425 = v424.json;
        if (v425.taskId) {
          const v426 = +v425.taskId;
          let v427;
          for (let vLN030 = 0; vLN030 < 30; vLN030++) {
            try {
              const vO52 = {
                clientKey: p337,
                taskId: v426
              };
              const v428 = await fetch2("https://api.2captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO52)
              });
              const v429 = v428.json;
              if (v429.status === "ready") {
                v427 = v429.solution.gRecaptchaResponse;
                break;
              } else if (v429.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v427) {
            p340(v427);
          } else {
            p341("No se pudo resolver el captcha");
          }
        } else {
          p341(v425.Message);
        }
      } catch (e71) {
        console.log(e71);
        p341("No se pudo resolver el captcha");
      }
    });
  }
  function resolveCaptchaEz(p342, p343, p344) {
    return new Promise(async (p345, p346) => {
      try {
        const v430 = await fetch2("https://api.ez-captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p342,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: p344,
              websiteKey: p343
            }
          })
        });
        const v431 = v430.json;
        if (v431.taskId) {
          const v432 = v431.taskId;
          let v433;
          for (let vLN031 = 0; vLN031 < 10; vLN031++) {
            try {
              const vO54 = {
                clientKey: p342,
                taskId: v432
              };
              const v434 = await fetch2("https://api.ez-captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO54)
              });
              const v435 = v434.json;
              console.log(v435);
              if (v435.status === "ready") {
                v433 = v435.solution.gRecaptchaResponse;
                break;
              } else if (v435.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v433) {
            p345(v433);
          } else {
            p346("No se pudo resolver el captcha");
          }
        } else {
          p346(v431.Message);
        }
      } catch (e72) {
        console.log(e72);
        p346("No se pudo resolver el captcha");
      }
    });
  }
  function getPhone(p347, p348, p349 = "facebook") {
    return new Promise(async (p350, p351) => {
      let vLS11 = "";
      for (let vLN032 = 0; vLN032 < 99; vLN032++) {
        try {
          if (p347 === "chothuesimcode") {
            vLS11 = await getPhoneChoThueSimCode(p348, p349);
          }
          if (p347 === "viotp") {
            vLS11 = await getPhoneViOtp(p348, p349);
          }
          if (p347 === "xotp") {
            vLS11 = await getPhoneXotp(p348, p349);
          }
          if (p347 === "otponline") {
            vLS11 = await getPhoneOtpOnline(p348, p349);
          }
          if (p347 === "sim24") {
            vLS11 = await getPhoneSim24(p348, p349);
          }
          if (p347 === "233io9") {
            vLS11 = await getPhone233(p348, p349);
          }
          if (p347 === "simotp") {
            vLS11 = await getPhoneSimOtp(p348, p349);
          }
          if (p347 === "codesim") {
            vLS11 = await getPhoneCodeSim(p348, p349);
          }
          if (p347 === "template") {
            code = await getPhoneTemplate(id);
          }
          break;
        } catch (e73) {
          console.log(e73);
        }
      }
      if (vLS11) {
        p350(vLS11);
      } else {
        p351();
      }
    });
  }
  function getPhoneCode(p352, p353, p354) {
    return new Promise(async (p355, p356) => {
      try {
        const v436 = await saveSetting();
        const v437 = (await v436.general.getCodeNumber?.value) || 10;
        const vLN50 = 50;
        let vLS12 = "";
        if (p352 === "chothuesimcode") {
          vLS12 = await getPhoneCodeChoThueSimCode(p353, p354, v437, vLN50);
        }
        if (p352 === "viotp") {
          vLS12 = await getPhoneCodeViOtp(p353, p354, v437, vLN50);
        }
        if (p352 === "xotp") {
          vLS12 = await getPhoneCodeXotp(p353, p354, v437, vLN50);
        }
        if (p352 === "otponline") {
          vLS12 = await getPhoneCodeOnlineOtp(p353, p354, v437, vLN50);
        }
        if (p352 === "sim24") {
          vLS12 = await getPhoneCodeSim24(p353, p354, v437, vLN50);
        }
        if (p352 === "233io9") {
          vLS12 = await getPhoneCode233(p353, p354, v437, vLN50);
        }
        if (p352 === "simotp") {
          vLS12 = await getPhoneCodeSimOtp(p353, p354, v437, vLN50);
        }
        if (p352 === "codesim") {
          vLS12 = await getPhoneCodeCodeSim(p353, p354, v437, vLN50);
        }
        if (p352 === "template") {
          vLS12 = await getPhoneCodeTemplate(p354, v437, vLN50);
        }
        if (vLS12) {
          p355(vLS12);
        } else {
          p356();
        }
      } catch (e74) {
        p356(e74);
      }
    });
  }
  function getObjPath(p357, p358, p359) {
    if (typeof p358 == "string") {
      return getObjPath(p357, p358.split("."), p359);
    } else if (p358.length == 1 && p359 !== undefined) {
      return p357[p358[0]] = p359;
    } else if (p358.length == 0) {
      return p357;
    } else {
      return getObjPath(p357[p358[0]], p358.slice(1), p359);
    }
  }
  function getPhoneTemplate() {
    return new Promise(async (p360, p361) => {
      try {
        const v438 = await saveSetting();
        const v439 = v438.general.customPhone.value;
        const v440 = (await getLocalStorage("serviceData")) || [];
        const v441 = await v440.filter(p362 => p362.id == v439)[0];
        const v442 = await fetch2(v441.apiGetPhone);
        const v443 = v442.json;
        const vGetObjPath = getObjPath(v443, v441.phoneValue);
        const vGetObjPath2 = getObjPath(v443, v441.idValue);
        const v444 = v441.phonePrefix ?? "";
        if (vGetObjPath && vGetObjPath2) {
          if (v441.phoneDelay) {
            await delayTime(v441.phoneDelay * 100);
          }
          p360({
            number: v444 + vGetObjPath,
            id: vGetObjPath2
          });
        } else {
          p361("No se pudo obtener el número de teléfono");
        }
      } catch (e75) {
        console.log(e75);
        p361("No se pudo obtener el número de teléfono");
      }
    });
  }
  function getPhoneCodeTemplate(p363, p364, p365) {
    return new Promise(async (p366, p367) => {
      try {
        const v445 = await saveSetting();
        const v446 = v445.general.customPhone.value;
        const v447 = (await getLocalStorage("serviceData")) || [];
        const v448 = await v447.filter(p368 => p368.id == v446)[0];
        let v449 = false;
        for (let vLN033 = 0; vLN033 < p364; vLN033++) {
          await delayTime(p365 * 100);
          try {
            const v450 = await fetch2(v448.apiGetCode.replace("{id}", p363));
            const v451 = v450.json;
            v449 = getObjPath(v451, v448.codeValue).match(/\d+/)[0];
            if (v449 && v449 != "00000") {
              p366(v449);
              break;
            }
          } catch (e76) {}
        }
        if (!v449) {
          p367();
        }
      } catch (e77) {
        console.log(e77);
        p367();
      }
    });
  }
  function getPhoneCodeSim(p369, p370 = "facebook") {
    return new Promise(async (p371, p372) => {
      try {
        const v452 = await fetch2("https://apisim.codesim.net/sim/get_sim?service_id=1&api_key=" + p369);
        const v453 = v452.json;
        if (v453.status === 200) {
          const vO55 = {
            number: v453.data.phone,
            id: v453.data.otpId
          };
          p371(vO55);
        } else {
          p372(v453.message);
        }
      } catch (e78) {
        p372("No se pudo obtener el número de teléfono");
      }
    });
  }
  function getPhoneCodeCodeSim(p373, p374, p375, p376) {
    return new Promise(async (p377, p378) => {
      try {
        let v454 = null;
        for (let vLN034 = 0; vLN034 < p375; vLN034++) {
          await delayTime(p376 * 100);
          const v455 = await fetch2("https://apisim.codesim.net/otp/get_otp_by_phone_api_key?otp_id=" + p374 + "&api_key=" + p373);
          const v456 = v455.json;
          if (v456.status === 200) {
            v454 = v456.data.code;
            if (v454) {
              p377(v454);
              break;
            }
          }
        }
        if (!v454) {
          p378();
        }
      } catch (e79) {
        p378(e79);
      }
    });
  }
  function getPhoneSimOtp(p379, p380 = "facebook") {
    return new Promise(async (p381, p382) => {
      let vLN15 = 15;
      if (p380 === "instagram") {
        vLN15 = 29;
      }
      try {
        const vO56 = {
          service: vLN15
        };
        const v457 = await fetch2("https://simotp.net/api/v1/order", {
          method: "POST",
          headers: {
            Authorization: "OTP " + p379,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(vO56)
        });
        const v458 = v457.json;
        if (v458.data) {
          p381({
            number: "84" + v458.data.phoneNumber,
            id: v458.data.id
          });
        } else {
          p382(v458.error.message);
        }
      } catch (e80) {
        p382("No se pudo obtener el número de teléfono");
      }
    });
  }
  function getPhoneCodeSimOtp(p383, p384, p385, p386) {
    return new Promise(async (p387, p388) => {
      const vF13 = p389 => {
        let v459 = p389.match(/\b\d{6}\b/);
        return v459 && v459[0];
      };
      try {
        let v460 = null;
        for (let vLN035 = 0; vLN035 < p385; vLN035++) {
          await delayTime(p386 * 100);
          const v461 = await fetch2("https://simotp.net/api/v1/order/" + p384, {
            headers: {
              Authorization: "OTP " + p383
            }
          });
          const v462 = v461.json;
          if (v462.data) {
            v460 = vF13(v462.data.content);
            if (v460) {
              p387(v460);
              break;
            }
          }
        }
        if (!v460) {
          p388();
        }
      } catch (e81) {
        p388(e81);
      }
    });
  }
  function getPhone233(p390, p391 = "facebook") {
    return new Promise(async (p392, p393) => {
      let vLN9 = 9;
      if (p391 === "instagram") {
        vLN9 = 15;
      }
      try {
        const v463 = await fetch2("https://api.233io9.info/api/dangkysim?api_key=" + p390 + "&appId=" + vLN9);
        const v464 = v463.json;
        if (v464.ResponseCode == 200) {
          p392({
            number: "84" + v464.Result.number,
            id: v464.Result.id
          });
        } else {
          p393(v464.Msg);
        }
      } catch (e82) {
        p393(e82);
      }
    });
  }
  function getPhoneCode233(p394, p395, p396, p397) {
    return new Promise(async (p398, p399) => {
      try {
        let v465 = null;
        for (let vLN036 = 0; vLN036 < p396; vLN036++) {
          await delayTime(p397 * 100);
          const v466 = await fetch2("https://api.233io9.info/api/layotpByID?api_key=" + p394 + "&id=" + p395);
          const v467 = v466.json;
          if (v467.ResponseCode == 200) {
            v465 = v467.Result[0].otp;
            p398(v465);
            break;
          }
        }
        if (!v465) {
          p399();
        }
      } catch (e83) {
        p399(e83);
      }
    });
  }
  function getPhoneSim24(p400, p401 = "facebook") {
    return new Promise(async (p402, p403) => {
      try {
        const v468 = await fetch2("https://sim24.cc/api?action=number&service=" + p401 + "&apikey=" + p400);
        const v469 = v468.json;
        if (v469.ResponseCode == 0) {
          const vO57 = {
            number: v469.Result.number,
            id: v469.Result.id
          };
          p402(vO57);
        } else {
          p403();
        }
      } catch (e84) {
        p403(e84);
      }
    });
  }
  function getPhoneCodeSim24(p404, p405, p406, p407) {
    return new Promise(async (p408, p409) => {
      try {
        let v470 = null;
        for (let vLN037 = 0; vLN037 < p406; vLN037++) {
          await delayTime(p407 * 100);
          const v471 = await fetch2("https://sim24.cc/api?action=code&id=" + p405 + "&apikey=" + p404);
          const v472 = v471.json;
          if (v472.ResponseCode == 0) {
            v470 = v472.Result.otp;
            break;
          }
        }
        if (v470) {
          p408(v470);
        } else {
          p409();
        }
      } catch (e85) {
        p409(e85);
      }
    });
  }
  function getPhoneChoThueSimCode(p410, p411) {
    return new Promise(async (p412, p413) => {
      try {
        const v473 = await getLocalStorage("setting");
        const v474 = v473.general.carrier.value;
        let vLS1001 = "1001";
        let vLS13 = "";
        if (p411 === "instagram") {
          vLS1001 = "1010";
          vLS13 = "84";
        }
        const v475 = await fetch2("https://chaycodeso3.com/api?act=number&apik=" + p410 + "&appId=" + vLS1001 + "&carrier=" + v474);
        const v476 = v475.json;
        if (v476.ResponseCode == 0) {
          const vO58 = {
            number: vLS13 + v476.Result.Number,
            id: v476.Result.Id
          };
          p412(vO58);
        } else {
          p413();
        }
      } catch (e86) {
        p413(e86);
      }
    });
  }
  function getPhoneCodeChoThueSimCode(p414, p415, p416, p417) {
    return new Promise(async (p418, p419) => {
      try {
        let v477 = null;
        for (let vLN038 = 0; vLN038 < p416; vLN038++) {
          await delayTime(p417 * 100);
          const v478 = await fetch2("https://chaycodeso3.com/api?act=code&apik=" + p414 + "&id=" + p415);
          const v479 = v478.json;
          if (v479.ResponseCode == 0) {
            v477 = v479.Result.Code;
            break;
          }
        }
        if (v477) {
          p418(v477);
        } else {
          await fetch2("https://chaycodeso3.com/api?act=expired&apik=" + p414 + "&id=" + p415);
          p419();
        }
      } catch (e87) {
        p419(e87);
      }
    });
  }
  function getPhoneOtpOnline(p420) {
    return new Promise(async (p421, p422) => {
      try {
        const v480 = await fetch2("https://api.server-otponline.xyz/api/public/user/sim/buy/v2?appId=34&apiKey=" + p420);
        const v481 = v480.json;
        if (v481.isSuccessed) {
          const vO59 = {
            number: v481.resultObj.value.number,
            id: v481.resultObj.value.id
          };
          p421(vO59);
        } else {
          p422(v481.message);
        }
      } catch (e88) {
        p422(e88);
      }
    });
  }
  function getPhoneCodeOnlineOtp(p423, p424, p425, p426) {
    return new Promise(async (p427, p428) => {
      try {
        let v482 = null;
        for (let vLN039 = 0; vLN039 < p425; vLN039++) {
          await delayTime(p426 * 100);
          const v483 = await fetch2("https://api.server-otponline.xyz/api/public/user/sim/v2?orderId=" + p424 + "&apiKey=" + p423);
          const v484 = v483.json;
          if (v484.isSuccessed && v484.resultObj.status == "2") {
            v482 = v484.resultObj.code;
            break;
          }
          if (v484.resultObj.status == "3" || v484.resultObj.status == "4") {
            break;
          }
        }
        if (v482) {
          p427(v482);
        } else {
          p428();
        }
      } catch (e89) {
        p428(e89);
      }
    });
  }
  function getPhoneViOtp(p429, p430 = "facebook") {
    return new Promise(async (p431, p432) => {
      let vLN7 = 7;
      if (p430 === "microsoft") {
        vLN7 = 5;
      }
      if (p430 === "instagram") {
        vLN7 = 36;
      }
      try {
        const v485 = await fetch2("https://api.viotp.com/request/getv2?token=" + p429 + "&serviceId=" + vLN7);
        const v486 = v485.json;
        if (v486.success) {
          const vO60 = {
            number: v486.data.phone_number,
            id: v486.data.request_id
          };
          p431(vO60);
        } else {
          p432(v486.message);
        }
      } catch (e90) {
        p432(e90);
      }
    });
  }
  function getPhoneCodeViOtp(p433, p434, p435, p436) {
    return new Promise(async (p437, p438) => {
      try {
        let v487 = null;
        for (let vLN040 = 0; vLN040 < p435; vLN040++) {
          await delayTime(p436 * 100);
          const v488 = await fetch2("https://api.viotp.com/session/getv2?requestId=" + p434 + "&token=" + p433);
          const v489 = v488.json;
          if (v489.success) {
            if (v489.data.Code !== null) {
              v487 = v489.data.Code;
              p437(v487);
            }
          } else {
            p438(v489.message);
          }
        }
        if (!v487) {
          p438();
        }
      } catch (e91) {
        p438(e91);
      }
    });
  }
  function getPhoneXotp(p439, p440 = "facebook") {
    return new Promise(async (p441, p442) => {
      try {
        const v490 = await fetch2("https://xotp.pro/api/v1/create-request?apikey=" + p439 + "&service=" + p440);
        const v491 = v490.json;
        if (!v491.error) {
          const vO61 = {
            number: v491.phone,
            id: v491.id
          };
          p441(vO61);
        } else {
          p442(v491.error);
        }
      } catch (e92) {
        p442(e92);
      }
    });
  }
  function getPhoneCodeXotp(p443, p444, p445, p446) {
    return new Promise(async (p447, p448) => {
      try {
        let v492 = null;
        for (let vLN041 = 0; vLN041 < p446; vLN041++) {
          await delayTime(p446 * 100);
          const v493 = await fetch2("https://xotp.pro/api/v1/get-request?apikey=" + p443 + "&id=" + p444);
          const v494 = v493.json;
          if (v494.code) {
            v492 = v494.code;
            break;
          }
        }
        if (v492) {
          p447(v492);
        } else {
          await fetch2("https://xotp.pro/api/v1/cancel-request?apikey=" + p443 + "&id=" + p444);
          p448();
        }
      } catch (e93) {
        p448(e93);
      }
    });
  }
  function getBase64Image(p449) {
    return fetch2(p449).then(p450 => p450.blob()).then(p451 => new Promise(p452 => {
      let v495 = new FileReader();
      v495.onload = function () {
        p452(this.result);
      };
      v495.readAsDataURL(p451);
    }));
  }
  function makeid(p453) {
    let vLS14 = "";
    const vLSAbcdefghijklmnopqrst = "abcdefghijklmnopqrstuvwxyz0123456789";
    const v496 = vLSAbcdefghijklmnopqrst.length;
    let vLN042 = 0;
    while (vLN042 < p453) {
      vLS14 += vLSAbcdefghijklmnopqrst.charAt(Math.floor(Math.random() * v496));
      vLN042 += 1;
    }
    return vLS14;
  }
  function getNewEmail() {
    return new Promise(async (p454, p455) => {
      try {
        const v497 = await saveSetting();
        const vO63 = {
          type: v497.general.emailService.value
        };
        const v498 = await fetch2("https://app.toolfb.vn/getEmail", {
          headers: {
            "content-type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO63)
        });
        const v499 = v498.json;
        if (v499.success) {
          p454(v499);
        } else {
          p455();
        }
      } catch {
        p455();
      }
    });
  }
  function getEmailInbox(p456, p457) {
    return new Promise(async (p458, p459) => {
      try {
        const v500 = await saveSetting();
        const vO64 = {
          type: v500.general.emailService.value,
          id: p456,
          email: p457
        };
        const v501 = await fetch2("https://app.toolfb.vn/getEmailInbox", {
          headers: {
            "content-type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO64)
        });
        const v502 = v501.json;
        if (v502.success) {
          p458(v502.inbox);
        } else {
          p459();
        }
      } catch {
        p459();
      }
    });
  }
  function randomNumberRange(p460, p461) {
    return Math.floor(Math.random() * (p461 - p460) + p460);
  }
  function checkLive(p462) {
    return new Promise(async (p463, p464) => {
      try {
        const v503 = await fetch2("https://graph2.facebook.com/v3.3/" + p462 + "/picture?redirect=0");
        const v504 = v503.json;
        if (v504.data.width && v504.data.height) {
          p463(v504.data.url);
        } else {
          p464();
        }
      } catch {
        p464();
      }
    });
  }
  function runVia(p465, p466) {
    return new Promise(async (p467, p468) => {
      if (p465.via.getLinkXmdt.value) {
        p466({
          action: "message",
          msg: "Obteniendo link XMDT..."
        });
        try {
          const v505 = await fb.getLinkAn();
          p466({
            action: "message",
            msg: "https://www.facebook.com/checkpoint/1501092823525282/" + v505
          });
        } catch {
          p466({
            action: "message",
            msg: "Error al obtener el link XMDT"
          });
        }
      }
      p467();
    });
  }