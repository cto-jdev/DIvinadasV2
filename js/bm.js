// Ocultar mensajes de AG Grid Enterprise License
console.error = function(){};
console.warn = function(){};

const columnDefs = [{
    resizable: false,
    headerCheckboxSelection: true,
    headerCheckboxSelectionCurrentPageOnly: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    maxWidth: 40,
    pinned: "left",
    suppressMovable: true,
    lockPosition: "left"
  }, {
    field: "status",
    headerName: "Estado",
    filter: "agSetColumnFilter", 
    cellRenderer: p5 => {
      let vLS = "";
      if (p5.data.status === "BM_XANHVO") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">BM VERDE FALSO</strong></a>";
      }
      if (p5.data.status === "BM_KHANG") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-info\">BM RESISTENTE XMDT</strong></a>";
      }
      if (p5.data.status === "BM_KHANG_3DONG") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-info\">BM RESISTENTE 3 LÍNEAS</strong></a>";
      }
      if (p5.data.status === "DIE_DK") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-secondary rounded-circle me-2\"></span><strong class=\"text-secondary\">MUERTO EN RESISTENCIA</strong></a>";
      }
      if (p5.data.status === "LIVE") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">ACTIVO</strong></a>";
      }
      if (p5.data.status === "DIE") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">MUERTO XMDT</strong></a>";
      }
      if (p5.data.status === "DIE_CAPTCHA") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">MUERTO CAPTCHA</strong></a>";
      }
      if (p5.data.status === "DIE_3DONG") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">MUERTO 3 LÍNEAS</strong></a>";
      }
      if (p5.data.status === "DIE_VV") {
        vLS = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">MUERTO PERMANENTE</strong></a>";
      }
      return vLS;
    }
  }, {
    field: "name",
    headerName: "Cuenta",
    minWidth: 250,
    cellRenderer: p6 => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <span class=\"avatar-letter\" data-letter=\"" + p6.data.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                    <a href=\"https://business.facebook.com/settings/?business_id=" + p6.data.bmId + "\" target=\"_BLANK\" class=\"ps-3 flex-grow-1 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + p6.data.name + "</strong>\n                        <span>" + p6.data.bmId + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "id",
    hide: true
  }, {
    field: "bmId",
    headerName: "ID BM"
  }, {
    field: "process",
    headerName: "Proceso",
    cellRenderer: p7 => {
      if (p7.data.process === "RUNNING") {
        return "<span class=\"badge text-bg-warning\" style=\"font-size: 10px\">EN PROCESO</span>";
      }
      if (p7.data.process === "FINISHED") {
        return "<span class=\"badge text-bg-success\" style=\"font-size: 10px\">FINALIZADO</span>";
      }
    }
  }, {
    field: "message",
    minWidth: 300,
    headerName: "Mensaje"
  }, {
    field: "bmType",
    headerName: "Tipo BM"
  }, {
    field: "role",
    headerName: "Rol"
  }, {
    field: "type",
    headerName: "BM"
  }, {
    field: "adAccount",
    headerName: "Cant. Cuentas"
  }, {
    field: "bmPage",
    headerName: "Cant. Pages"
  }, {
    field: "instaAccount", 
    headerName: "Cant. IG"
  }, {
    field: "adminAccount",
    headerName: "Cant. Admin"
  }, {
    field: "limit",
    headerName: "Límite",
    cellRenderer: p8 => {
      p8.data.limit = p8.data.limit || "";
      return "<span class=\"currency\" data-value=\"" + p8.data.limit.toString().replaceAll(",", "") + "\" data-currency=\"" + p8.data.currency + "\">" + p8.data.limit + "</span>";
    }
  }, {
    field: "currency",
    headerName: "Moneda"
  }, {
    field: "dieDate",
    headerName: "Fecha Muerte"
  }];

const accountGrid = {
    rowHeight: 50,
    rowSelection: "multiple",
    suppressColumnVirtualisation: true,
    suppressRowVirtualisation: true,
    suppressContextMenu: true,
    suppressMovableColumns: false,
    suppressDragLeaveHidesColumns: true,
    rowMultiSelectWithClick: true,
    suppressRowClickSelection: true,
    enableRangeSelection: true,
    defaultColDef: {
      flex: 1,
      suppressMenu: true,
      minWidth: 100,
      resizable: true,
      sortable: true,
      lockPinned: true
    },
    columnDefs: columnDefs,
    rowData: [],
    localeText: {
      noRowsToShow: ""
    },
    excelStyles: [{
      id: "bmId",
      numberFormat: {
        format: "0"
      }
    }],
    getRowId: function (p9) {
      return p9.data.id;
    },
    onFirstDataRendered: function (p10) {
      countStatus(p10, 0);
    },
    onRangeSelectionChanged: function (p11) {
      const v12 = p11.api.getCellRanges();
      if (v12.length) {
        let vLN02 = 0;
        if (v12[0].startRow.rowIndex < v12[0].endRow.rowIndex) {
          vLN02 = v12[0].endRow.rowIndex - (v12[0].startRow.rowIndex - 1);
        } else {
          vLN02 = v12[0].startRow.rowIndex - (v12[0].endRow.rowIndex - 1);
        }
        $("#boiden").text(vLN02);
      } else {
        $("#boiden").text(0);
      }
    },
    onSelectionChanged: function (p12) {
      const v13 = p12.api.getSelectedRows();
      $("#dachon").text(v13.length);
    },
    onRowDataUpdated: function (p13) {
      $("#tong").text(p13.api.getDisplayedRowCount());
    },
    onFilterChanged: function (p14) {
      $("#tong").text(p14.api.getDisplayedRowCount());
    },
    rowClassRules: {
      running: function (p15) {
        return p15.data.status === "RUNNING";
      },
      finished: function (p16) {
        return p16.data.status === "FINISHED";
      }
    },
    noRowsOverlayComponent: class CustomNoRowsOverlay {
      eGui;
      init(p17) {
        this.eGui = document.createElement("div");
        this.refresh(p17);
      }
      getGui() {
        return this.eGui;
      }
      refresh(p18) {
        this.eGui.innerHTML = "<img width=\"300\" src=\"../img/no_data.png\">";
      }
    }
  };

// Evento ready principal
$(document).ready(async function () {
    console.log("🔄 [BM.JS] Inicializando página BM...");
    
    const v14 = document.querySelector("#accounts");
    new agGrid.Grid(v14, accountGrid);
    const v15 = (await getLocalStorage("stateBm")) || [];
    const vO18 = {
      state: v15,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(vO18);
    const v16 = new URL(location.href);
    const v17 = v16.searchParams.get("id");
    if (v17) {
      const v18 = await getLocalStorage("dataBm_" + v17);
      $("#count").text(v18.length);
      accountGrid.api.setRowData(v18);
    } else {
      setInterval(async () => {
        if ($("body").hasClass("setting-loaded")) {
          saveSetting();
        }
        if ($("body").hasClass("data-loaded")) {
          const vA2 = [];
          accountGrid.api.forEachNode(function (p19) {
            vA2.push(p19.data);
          });
          if (vA2.length > 0) {
            await setLocalStorage("dataBm_" + fb.uid, vA2);
          }
          const v19 = accountGrid.columnApi.getColumnState();
          await setLocalStorage("stateBm", v19);
        }
      }, 2000);
    }
    
    console.log("✅ [BM.JS] Página BM inicializada correctamente");
  });

// Función para contar estados
function countStatus(p76, p77) {
    let vLN04 = 0;
    let vLN05 = 0;
    let vLN06 = 0;
    let vLN07 = 0;
    let vLN08 = 0;
    let vLN09 = 0;
    let vLN010 = 0;
    p76.api.forEachNode(p78 => {
      if (p77 > 0) {
        if (p78.data.status === "LIVE" && p78.data.uid == p77) {
          vLN04++;
        }
        if (p78.data.status === "DIE" && p78.data.uid == p77) {
          vLN05++;
        }
        if (p78.data.status === "DIE_VV" && p78.data.uid == p77) {
          vLN06++;
        }
        if (p78.data.status === "DIE_DK" && p78.data.uid == p77) {
          vLN09++;
        }
        if (p78.data.status === "BM_KHANG" && p78.data.uid == p77) {
          vLN010++;
        }
        if (p78.data.status === "BM_KHANG_3DONG" && p78.data.uid == p77) {
          vLN08++;
        }
        if (p78.data.status === "DIE_3DONG" && p78.data.uid == p77) {
          vLN07++;
        }
      } else {
        if (p78.data.status === "LIVE") {
          vLN04++;
        }
        if (p78.data.status === "DIE") {
          vLN05++;
        }
        if (p78.data.status === "DIE_VV") {
          vLN06++;
        }
        if (p78.data.status === "DIE_DK") {
          vLN09++;
        }
        if (p78.data.status === "BM_KHANG") {
          vLN010++;
        }
        if (p78.data.status === "BM_KHANG_3DONG") {
          vLN08++;
        }
        if (p78.data.status === "DIE_3DONG") {
          vLN07++;
        }
      }
    });
    $(".status1Count").text(vLN04);
    $(".status2Count").text(vLN05);
    $(".status3Count").text(vLN06);
    $(".status4Count").text(vLN07);
    $(".status5Count").text(vLN08);
    $(".status101Count").text(vLN09);
    $(".status999Count").text(vLN010);
}

// Eventos básicos para cargar datos
$(document).on("loadSavedBm", function (p31, p32) {
    p32 = p32.map(p33 => {
      p33.process = "";
      return p33;
    });
    accountGrid.api.setRowData(p32);
});

const bmMap = [];

$(document).on("loadBmSuccess", function (p37, p38) {
    let vLN12 = 1;
    p38 = p38.map(p39 => {
      const vO22 = {
        id: vLN12,
        bmId: p39.id
      };
      bmMap.push(vO22);
      p39 = {
        id: vLN12,
        status: p39.type,
        bmId: p39.id,
        name: p39.name,
        avatar: p39.avatar,
        dieDate: p39.dieDate
      };
      vLN12++;
      return p39;
    });
    accountGrid.api.setRowData(p38);
});

// Variable global para controlar la cancelación del proceso
let pixelProcessCancelled = false;

/**
 * FUNCIONALIDAD DE PÍXELES DE FACEBOOK
 * Utiliza la Facebook Marketing API v22.0
 */

/**
 * createPixelsForSelectedBMs
 * Descripción: Crea píxeles de Facebook para los Business Managers seleccionados
 */
async function createPixelsForSelectedBMs() {
    console.log("🚀 [PIXEL] Iniciando función createPixelsForSelectedBMs...");
    
    const selectedRows = accountGrid.api.getSelectedRows();
    const pixelName = $('[name="pixelName"]').val().trim();
    const pixelQuantity = parseInt($('[name="pixelQuantity"]').val()) || 1; // Campo de cantidad
    const enableAutomaticMatching = $('[name="enableAutomaticMatching"]').is(':checked');
    const enableFirstPartyCookies = $('[name="enableFirstPartyCookies"]').is(':checked');

    console.log("📊 [PIXEL] Datos del formulario:", {
        selectedRows: selectedRows.length,
        pixelName: pixelName,
        pixelQuantity: pixelQuantity,
        enableAutomaticMatching: enableAutomaticMatching,
        enableFirstPartyCookies: enableFirstPartyCookies
    });

    // Validaciones
    if (selectedRows.length === 0) {
        console.warn("⚠️ [PIXEL] No hay Business Managers seleccionados");
        Swal.fire({
            title: '⚠️ Error de Selección',
            text: 'Por favor selecciona al menos un Business Manager de la tabla.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (!pixelName) {
        console.warn("⚠️ [PIXEL] Nombre del píxel vacío");
        Swal.fire({
            title: '⚠️ Nombre Requerido',
            text: 'Por favor ingresa un nombre para el píxel.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    if (pixelQuantity < 1 || pixelQuantity > 10) {
        console.warn("⚠️ [PIXEL] Cantidad inválida");
        Swal.fire({
            title: '⚠️ Cantidad Inválida',
            text: 'La cantidad debe ser entre 1 y 10 píxeles.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    // Verificar que tenemos access token
    console.log("🔑 [PIXEL] Verificando access token...");
    console.log("🔑 [PIXEL] fb object:", typeof fb !== 'undefined' ? fb : "UNDEFINED");
    
    if (typeof fb === 'undefined' || !fb.accessToken2) {
        console.error("❌ [PIXEL] No se encontró access token de Facebook");
        Swal.fire({
            title: '⚠️ Token Requerido',
            text: 'No se encontró access token de Facebook. Por favor inicia sesión primero.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return;
    }

    console.log("✅ [PIXEL] Access token encontrado:", fb.accessToken2.substring(0, 20) + "...");

    // CAMBIAR BOTÓN A DETENER Y MOSTRAR ALERTA DE PROCESANDO
    $('#start').addClass('d-none');
    $('#stop').removeClass('d-none');
    
    // Resetear variable de cancelación
    pixelProcessCancelled = false;
    
    // Mostrar alerta de procesando
    Swal.fire({
        title: '🔄 Procesando Píxeles',
        html: `
            <div class="text-start">
                <p><strong>📊 Creando píxeles de Facebook...</strong></p>
                <hr>
                <p>📋 <strong>Business Managers:</strong> ${selectedRows.length}</p>
                <p>🎯 <strong>Píxeles por BM:</strong> ${pixelQuantity}</p>
                <p>📈 <strong>Total a crear:</strong> ${selectedRows.length * pixelQuantity}</p>
                <hr>
                <p><small>🔍 Revisa el progreso en la columna "Mensaje" de la tabla</small></p>
            </div>
        `,
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        willOpen: () => {
            Swal.showLoading();
        }
    });

    // Inicializar tabla con proceso
    selectedRows.forEach(bm => {
        updateBMMessage(bm.id, `🔄 Preparando creación de ${pixelQuantity} píxel(es)...`);
    });

    let successCount = 0;
    let errorCount = 0;
    let successfulBMIds = []; // Solo IDs de BM exitosos

    // Procesar cada Business Manager seleccionado
    console.log("🔄 [PIXEL] Iniciando procesamiento de BMs...");
    
    for (let i = 0; i < selectedRows.length; i++) {
        // Verificar si el proceso fue cancelado
        if (pixelProcessCancelled) {
            console.log("🛑 [PIXEL] Proceso cancelado por el usuario");
            updateBMMessage(selectedRows[i].id, `🛑 CANCELADO: Proceso detenido por el usuario`);
            break;
        }
        
        const bm = selectedRows[i];
        const bmId = bm.bmId;
        const bmName = bm.name || 'Sin nombre';
        
        console.log(`📍 [PIXEL] Procesando BM ${i + 1}/${selectedRows.length}:`, {
            bmId: bmId,
            bmName: bmName
        });
        
        updateBMMessage(bm.id, `📍 [${i + 1}/${selectedRows.length}] Procesando ${pixelQuantity} píxel(es) para ${bmName}...`);
        
        let bmSuccessCount = 0;
        let bmErrorCount = 0;
        
        // Crear múltiples píxeles para este BM
        for (let j = 0; j < pixelQuantity; j++) {
            // Verificar si el proceso fue cancelado
            if (pixelProcessCancelled) {
                console.log("🛑 [PIXEL] Proceso cancelado durante la creación de píxeles");
                updateBMMessage(bm.id, `🛑 CANCELADO: Proceso detenido durante creación de píxel ${j + 1}/${pixelQuantity}`);
                break;
            }
            
            try {
                // Generar nombre único con formato: nombre_{6_dígitos_aleatorios}
                const randomDigits = Math.floor(Math.random() * 900000) + 100000; // 100000-999999 (6 dígitos)
                const finalPixelName = `${pixelName}_${randomDigits}`;

                updateBMMessage(bm.id, `   🔄 Creando píxel ${j + 1}/${pixelQuantity}: "${finalPixelName}"...`);
                console.log(`🔄 [PIXEL] Llamando createPixelViaBMAPI para píxel ${j + 1}:`, {
                    bmId: bmId,
                    finalPixelName: finalPixelName
                });

                // Llamada a la API de Facebook
                const result = await createPixelViaBMAPI(bmId, finalPixelName, enableAutomaticMatching, enableFirstPartyCookies);
                
                console.log(`📊 [PIXEL] Resultado de createPixelViaBMAPI:`, result);
                
                if (result.success) {
                    bmSuccessCount++;
                    updateBMMessage(bm.id, `   ✅ Píxel ${j + 1}/${pixelQuantity} creado! ID: ${result.pixelId}`);
                } else {
                    throw new Error(result.error || 'Error desconocido en la API de Facebook');
                }

            } catch (error) {
                console.error(`❌ [PIXEL] Error creando píxel ${j + 1} para BM ${bmId}:`, error);
                bmErrorCount++;
                updateBMMessage(bm.id, `   ❌ Error píxel ${j + 1}/${pixelQuantity}: ${error.message}`);
            }

            // Delay entre píxeles para evitar rate limiting
            if (j < pixelQuantity - 1) {
                if (!pixelProcessCancelled) {
                    updateBMMessage(bm.id, `   ⏳ Esperando 1 segundo antes del siguiente píxel...`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        // Si se canceló durante la creación de píxeles, salir del bucle principal
        if (pixelProcessCancelled) {
            break;
        }
        
        // Resumen para este BM
        if (bmSuccessCount > 0) {
            successCount += bmSuccessCount;
            successfulBMIds.push(bmId); // Solo agregar ID si hubo éxito
            updateBMMessage(bm.id, `✅ COMPLETADO: ${bmSuccessCount}/${pixelQuantity} píxeles creados exitosamente`);
        } else {
            errorCount += bmErrorCount;
            updateBMMessage(bm.id, `❌ FALLIDO: 0/${pixelQuantity} píxeles creados - Todos con errores`);
        }

        // Delay entre BMs para evitar rate limiting
        if (i < selectedRows.length - 1) {
            if (!pixelProcessCancelled) {
                updateBMMessage(bm.id, `⏳ Esperando antes del siguiente BM...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    // PROCESO FINALIZADO - CAMBIAR BOTÓN A FINALIZAR
    $('#stop').addClass('d-none');
    $('#start').removeClass('d-none');
    
    if (pixelProcessCancelled) {
        // Si fue cancelado
        $('#start i').removeClass('ri-play-fill').addClass('ri-close-fill');
        $('#start i').css('background-color', '#f44336');
        $('#start').html('<i class="ri-close-fill" style="background-color: #f44336;"></i> Cancelado');
    } else {
        // Si finalizó exitosamente
        $('#start i').removeClass('ri-play-fill').addClass('ri-check-fill');
        $('#start i').css('background-color', '#4caf50');
        $('#start').html('<i class="ri-check-fill" style="background-color: #4caf50;"></i> Finalizado');
    }
    
    // Cerrar alerta de procesando
    Swal.close();

    // Mostrar resultados finales
    console.log("🎉 [PIXEL] Proceso completado:", {
        successCount: successCount,
        errorCount: errorCount,
        total: selectedRows.length * pixelQuantity,
        successfulBMIds: successfulBMIds
    });

    // Actualizar resultados en la interfaz
    $('#pixelResults').show();
    $('#pixelSuccessCount').text(successCount);
    $('#pixelErrorCount').text(errorCount);
    
    // Solo mostrar IDs de BM exitosos
    $('[name="pixelSuccessResults"]').val(successfulBMIds.join('\n'));
    $('[name="pixelErrorResults"]').val(`${errorCount} errores en total. Ver detalles en la columna Mensaje de la tabla.`);

    // Resetear botón después de 3 segundos
    setTimeout(() => {
        $('#start i').removeClass('ri-check-fill ri-close-fill').addClass('ri-play-fill');
        $('#start').html('<i class="ri-play-fill" style="background-color: #4caf50;"></i> Iniciar');
        
        // Resetear también el botón stop
        $('#stop').prop('disabled', false);
        $('#stop').html('<i class="ri-stop-fill" style="background-color: #f44336;"></i> Detener');
    }, 3000);
}

/**
 * updateBMMessage
 * Descripción: Actualiza la columna "Mensaje" de un BM específico en la tabla
 */
function updateBMMessage(bmRowId, message) {
    console.log(`📝 [TABLE] Actualizando mensaje para BM ID ${bmRowId}: ${message}`);
    
    try {
        const rowNode = accountGrid.api.getRowNode(bmRowId);
        if (rowNode) {
            rowNode.setDataValue("message", message);
            console.log(`✅ [TABLE] Mensaje actualizado para BM ID ${bmRowId}`);
        } else {
            console.warn(`⚠️ [TABLE] No se encontró fila para BM ID ${bmRowId}`);
        }
    } catch (error) {
        console.error(`❌ [TABLE] Error actualizando mensaje para BM ID ${bmRowId}:`, error);
    }
}

/**
 * createPixelViaBMAPI
 * Descripción: Crea un píxel usando la Facebook Marketing API a nivel de Business Manager
 */
async function createPixelViaBMAPI(bmId, pixelName, enableAutomaticMatching, enableFirstPartyCookies) {
    console.log("🔄 [API] Iniciando createPixelViaBMAPI...", {
        bmId: bmId,
        pixelName: pixelName,
        enableAutomaticMatching: enableAutomaticMatching,
        enableFirstPartyCookies: enableFirstPartyCookies
    });
    
    try {
        // Preparar datos para la API en formato string (como en el resto del código)
        let bodyString = "name=" + encodeURIComponent(pixelName) + "&access_token=" + fb.accessToken2;

        // Configuración avanzada opcional
        if (enableAutomaticMatching) {
            bodyString += "&enable_automatic_matching=true";
            bodyString += "&automatic_matching_fields=" + encodeURIComponent('["em","fn","ln","ph","ge","zp","ct","st","country"]');
        }

        if (enableFirstPartyCookies) {
            bodyString += "&first_party_cookie_status=" + encodeURIComponent('FIRST_PARTY_COOKIE_ENABLED');
        }

        // Endpoint correcto para Business Manager
        const apiUrl = `https://graph.facebook.com/v14.0/${bmId}/adspixels`;
        
        // ALTERNATIVA: Si no funciona, podríamos probar con ad account específico
        // const apiUrl = `https://graph.facebook.com/v14.0/act_{AD_ACCOUNT_ID}/adspixels`;
        
        console.log(`🔄 [API] Llamando a API: ${apiUrl}`);
        console.log(`📝 [API] Body string enviado:`, bodyString);
        
        // Realizar la llamada a la API usando fetch2 (sistema de extensión)
        // fetch2 devuelve {url, json, text}
        const response = await fetch2(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: bodyString
        });
        
        console.log(`📊 [API] Respuesta completa de fetch2:`, response);
        
        // Extraer los datos JSON de la respuesta de fetch2
        const responseData = response.json || response;
        
        console.log(`📊 [API] Datos JSON extraídos:`, responseData);
        console.log(`📊 [API] Text completo de respuesta:`, response.text);

        // Verificar si la respuesta contiene un ID de píxel (éxito)
        if (responseData && responseData.id) {
            console.log(`✅ [API] Píxel creado exitosamente:`, responseData.id);
            return {
                success: true,
                pixelId: responseData.id,
                data: responseData
            };
        } 
        // Verificar si hay un error de Facebook API
        else if (responseData && responseData.error) {
            const error = responseData.error;
            console.error(`❌ [API] Error de Facebook API:`, error);
            
            let errorMessage = 'Error en la API de Facebook';
            
            switch (error.code) {
                case 190:
                    errorMessage = 'Token de acceso inválido o expirado';
                    break;
                case 200:
                    errorMessage = 'Permisos insuficientes para este Business Manager';
                    break;
                case 100:
                    if (error.message.includes('name is required')) {
                        errorMessage = 'Error en el formato de datos - parámetro name no reconocido por Facebook';
                    } else {
                        errorMessage = `Parámetro inválido: ${error.error_user_msg || error.message}`;
                    }
                    break;
                case 80004:
                    errorMessage = 'Ya existe un píxel para este Business Manager';
                    break;
                case 10:
                    errorMessage = 'No tienes permisos para crear píxeles en este Business Manager';
                    break;
                default:
                    errorMessage = error.message || error.error_user_msg || `Error ${error.code}: ${error.type || 'Error desconocido'}`;
            }
            
            console.error(`❌ [API] Error procesado:`, errorMessage);
            throw new Error(errorMessage);
        }
        // Respuesta inesperada
        else {
            console.error(`❌ [API] Respuesta inesperada:`, responseData);
            console.error(`❌ [API] Respuesta completa:`, response);
            throw new Error('Respuesta inesperada de Facebook API - no contiene ID ni error');
        }

    } catch (error) {
        console.error('❌ [API] Error en createPixelViaBMAPI:', error);
        
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * addProgressMessage
 * Descripción: Añade un mensaje al área de progreso
 */
function addProgressMessage(message, type = 'info') {
    console.log(`📝 [PROGRESS] ${type.toUpperCase()}: ${message}`);
    
    const timestamp = new Date().toLocaleTimeString();
    const typeClass = {
        'info': 'text-info',
        'success': 'text-success',
        'error': 'text-danger',
        'warning': 'text-warning'
    }[type] || 'text-info';

    const messageHtml = `<div class="${typeClass} mb-1"><small class="text-muted">[${timestamp}]</small> ${message}</div>`;
    
    // Asegurar que el contenedor existe
    if ($('#pixelProgressMessages').length === 0) {
        console.warn('⚠️ [PROGRESS] Contenedor de mensajes no encontrado');
        return;
    }
    
    $('#pixelProgressMessages').append(messageHtml);
    
    // Auto scroll al final
    const progressContainer = document.getElementById('pixelProgressMessages');
    if (progressContainer) {
        progressContainer.scrollTop = progressContainer.scrollHeight;
    }
}

/**
 * Eventos para la funcionalidad de crear píxeles
 */
$(document).ready(function() {
    console.log("🔧 [EVENTS] Configurando eventos de píxeles...");
    
    // Evento cuando se inicia el proceso (botón start con createPixel activo)
    $(document).on('click', '#start', function() {
        console.log("🎯 [EVENTS] Click en botón #start");
        
        const createPixelChecked = $('[name="createPixel"]').is(':checked');
        console.log("🎯 [EVENTS] createPixel checkbox:", createPixelChecked);
        
        if (createPixelChecked) {
            console.log("🚀 [EVENTS] Iniciando creación de píxeles...");
            createPixelsForSelectedBMs();
        } else {
            console.log("ℹ️ [EVENTS] createPixel no está activado");
        }
    });

    // Evento cuando se detiene el proceso (botón stop)
    $(document).on('click', '#stop', function() {
        console.log("🛑 [EVENTS] Click en botón #stop - Cancelando proceso...");
        
        pixelProcessCancelled = true;
        
        // Cambiar botón inmediatamente para feedback visual
        $('#stop').prop('disabled', true);
        $('#stop').html('<i class="ri-stop-fill" style="background-color: #f44336;"></i> Cancelando...');
        
        Swal.fire({
            title: '🛑 Cancelando Proceso',
            text: 'El proceso se detendrá después del píxel actual...',
            icon: 'warning',
            timer: 2000,
            showConfirmButton: false
        });
        
        console.log("🛑 [EVENTS] Variable pixelProcessCancelled establecida en true");
    });

    // Evento para validar formulario de píxeles
    $('[name="pixelName"]').on('input', function() {
        const pixelName = $(this).val().trim();
        console.log("📝 [EVENTS] Input pixelName:", pixelName);
        
        if (pixelName.length > 50) {
            $(this).addClass('is-invalid');
            $(this).siblings('.form-text').text('El nombre debe tener menos de 50 caracteres');
        } else {
            $(this).removeClass('is-invalid');
            $(this).siblings('.form-text').text('El nombre será seguido por el nombre del BM si se crean múltiples píxeles');
        }
    });

    // Evento para limpiar resultados cuando se cierra la sección
    $('[name="createPixel"]').on('change', function() {
        const isChecked = $(this).is(':checked');
        console.log("🔄 [EVENTS] createPixel toggle:", isChecked);
        
        if (!isChecked) {
            $('#pixelProgressArea').hide();
            $('#pixelResults').hide();
            $('#pixelProgressMessages').html('');
        } else {
            // Inicializar área de progreso cuando se activa
            $('#pixelProgressMessages').html('');
            addProgressMessage('📝 Funcionalidad de crear píxeles activada. Selecciona Business Managers y haz clic en "Iniciar".', 'info');
        }
    });
    
    console.log("✅ [EVENTS] Eventos de píxeles configurados correctamente");
});

console.log("✅ [BM.JS] Archivo cargado correctamente con funcionalidad de píxeles"); 