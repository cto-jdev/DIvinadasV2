// Filtrar solo mensajes específicos de AG Grid Enterprise License
const originalError = console.error;
const originalWarn = console.warn;

console.error = function(...args) {
  const message = args.join(' ');
  // Filtrar mensajes de licencia de AG Grid
  if (message.includes('*') && 
      (message.includes('License Key Not Found') || 
       message.includes('AG Grid Enterprise') || 
       message.includes('license') ||
       message.includes('****'))) {
    return; // No mostrar estos mensajes
  }
  originalError.apply(console, args);
};

console.warn = function(...args) {
  const message = args.join(' ');
  // Filtrar mensajes de licencia de AG Grid
  if (message.includes('*') && 
      (message.includes('License Key Not Found') || 
       message.includes('AG Grid Enterprise') || 
       message.includes('license') ||
       message.includes('****'))) {
    return; // No mostrar estos mensajes
  }
  originalWarn.apply(console, args);
};

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
      let v27 = "";
      if (p5.data.status === "BM_XANHVO") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">BM XANH VỎ</strong></a>";
      }
      if (p5.data.status === "BM_KHANG") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-info\">BM RESISTENTE VeryID</strong></a>";
      }
      if (p5.data.status === "BM_KHANG_3DONG") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-info\">BM RESISTENTE 3 LÍNEAS</strong></a>";
      }
      if (p5.data.status === "DIE_DK") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-secondary rounded-circle me-2\"></span><strong class=\"text-secondary\">DIE EN PROCESO</strong></a>";
      }
      if (p5.data.status === "LIVE") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">LIVE</strong></a>";
      }
      if (p5.data.status === "DIE") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">DIE VeryID</strong></a>";
      }
      if (p5.data.status === "DIE_3DONG") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">DIE 3 LÍNEAS</strong></a>";
      }
      if (p5.data.status === "DIE_VV") {
        v27 = "<a target=\"_BLANK\" href=\"https://business.facebook.com/business-support-home/" + p5.data.bmId + "\" class=\"text-decoration-none d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">DIE PERMANENTE</strong></a>";
      }
      return v27;
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
    headerName: "No de Cuentas"
  }, {
    field: "bmPage",
    headerName: "No de Paginas"
  }, {
    field: "instaAccount",
    headerName: "No de Instagram"
  }, {
    field: "adminAccount",
    headerName: "No de Admin"
  }, {
    field: "limit",
    headerName: "Límite"
  }, {
    field: "process",
    headerName: "Proceso"
  }, {
    field: "pixelCount",
    headerName: "Píxeles"
  }, {
    field: "message",
    minWidth: 200,
    headerName: "Mensaje"
  }];

const accountGrid = {
    rowHeight: 50,
    rowSelection: "multiple",
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
    getRowId: function (p7) {
      return p7.data.id;
    },
    onFirstDataRendered: function (p8) {
      countStatus(p8, 0);
    },
    onRangeSelectionChanged: function (p9) {
      const v30 = p9.api.getCellRanges();
      if (v30.length) {
        let v31 = 0;
        if (v30[0].startRow.rowIndex < v30[0].endRow.rowIndex) {
          v31 = v30[0].endRow.rowIndex - (v30[0].startRow.rowIndex - 1);
        } else {
          v31 = v30[0].startRow.rowIndex - (v30[0].endRow.rowIndex - 1);
        }
        $("#boiden").text(v31);
      } else {
        $("#boiden").text(0);
      }
    },
    onSelectionChanged: function (p10) {
      const v32 = p10.api.getSelectedRows();
      $("#dachon").text(v32.length);
    },
    onRowDataUpdated: function (p11) {
      $("#tong").text(p11.api.getDisplayedRowCount());
    },
    onFilterChanged: function (p12) {
      $("#tong").text(p12.api.getDisplayedRowCount());
    },
    rowClassRules: {
      running: function (p13) {
        return p13.data.status === "RUNNING";
      },
      finished: function (p14) {
        return p14.data.status === "FINISHED";
      }
    },
    onBodyScroll: function (p15) {
      scrolling = true;
    },
    onBodyScrollEnd: function (p16) {
      scrolling = false;
    }
  };

// Variable global para mapeo de BM (SOLO UNA VEZ)
const bmMap = [];

// Evento ready principal
$(document).ready(async function () {
    const v33 = document.querySelector("#accounts");
    new agGrid.Grid(v33, accountGrid);
    const v34 = JSON.parse(localStorage.getItem("stateBm")) || [];
    const v35 = {
      state: v34,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(v35);
    const v36 = new URL(location.href);
    const v37 = v36.searchParams.get("id");
    if (v37) {
      const v38 = await getLocalStorage("dataBm_" + v37);
      $("#count").text(v38.length);
      accountGrid.api.setRowData(v38);
    } else {
      setInterval(async () => {
        if ($("body").hasClass("setting-loaded")) {
          saveSetting();
        }
        if ($("body").hasClass("data-loaded")) {
          const v39 = [];
          accountGrid.api.forEachNode(function (p17) {
            v39.push(p17.data);
          });
          if (v39.length > 0) {
            localStorage.setItem("dataBm", JSON.stringify(v39));
            await setLocalStorage("dataBm_" + fb.uid, v39);
          }
          const v40 = accountGrid.columnApi.getColumnState();
          localStorage.setItem("stateBm", JSON.stringify(v40));
        }
      }, 2000);
    }
  });

// Función para contar estados
function countStatus(p74, p75) {
    let v74 = 0;
    let v75 = 0;
    let v76 = 0;
    let v77 = 0;
    let v78 = 0;
    let v79 = 0;
    let v80 = 0;
    p74.api.forEachNode(p76 => {
      if (p75 > 0) {
        if (p76.data.status === "LIVE" && p76.data.uid == p75) {
          v74++;
        }
        if (p76.data.status === "DIE" && p76.data.uid == p75) {
          v75++;
        }
        if (p76.data.status === "DIE_VV" && p76.data.uid == p75) {
          v76++;
        }
        if (p76.data.status === "DIE_DK" && p76.data.uid == p75) {
          v79++;
        }
        if (p76.data.status === "BM_KHANG" && p76.data.uid == p75) {
          v80++;
        }
        if (p76.data.status === "BM_KHANG_3DONG" && p76.data.uid == p75) {
          v78++;
        }
        if (p76.data.status === "DIE_3DONG" && p76.data.uid == p75) {
          v77++;
        }
      } else {
        if (p76.data.status === "LIVE") {
          v74++;
        }
        if (p76.data.status === "DIE") {
          v75++;
        }
        if (p76.data.status === "DIE_VV") {
          v76++;
        }
        if (p76.data.status === "DIE_DK") {
          v79++;
        }
        if (p76.data.status === "BM_KHANG") {
          v80++;
        }
        if (p76.data.status === "BM_KHANG_3DONG") {
          v78++;
        }
        if (p76.data.status === "DIE_3DONG") {
          v77++;
        }
      }
    });
    $(".status1Count").text(v74);
    $(".status2Count").text(v75);
    $(".status3Count").text(v76);
    $(".status4Count").text(v77);
    $(".status5Count").text(v78);
    $(".status101Count").text(v79);
    $(".status999Count").text(v80);
}

// Eventos básicos para cargar datos
$(document).on("loadSavedBm", function (p29, p30) {
    p30 = p30.map(p31 => {
      p31.process = "";
      return p31;
    });
    accountGrid.api.setRowData(p30);
});

$(document).on("loadBmSuccess", function (p35, p36) {
    let v56 = 1;
    p36 = p36.map(p37 => {
      const v57 = {
        id: v56,
        bmId: p37.id
      };
      bmMap.push(v57);
      p37 = {
        id: v56,
        status: p37.type,
        bmId: p37.id,
        name: p37.name,
        avatar: p37.avatar
      };
      v56++;
      return p37;
    });
    accountGrid.api.setRowData(p36);
});

$(document).on("loadBmSuccess4", function (p38, p39) {
    for (let v58 = 0; v58 < p39.length; v58++) {
      const v59 = bmMap.filter(p40 => p40.bmId == p39[v58].businessID)[0].id;
      accountGrid.api.getRowNode(v59).setDataValue("bmPage", p39[v58].pageNumber);
    }
});

$(document).on("loadBmSuccess2", function (p41, p42) {
    p42.forEach(async (p43) => {
      const v60 = bmMap.filter(p44 => p44.bmId == p43.id)[0].id;
      let v61 = "";
      let v62 = p43.permitted_roles[0];
      if (p43.sharing_eligibility_status === "enabled") {
        v61 = "BM350";
      }
      if (p43.sharing_eligibility_status === "disabled_due_to_trust_tier") {
        v61 = "BM50";
      }
      if (p43.owned_ad_accounts?.data.length) {
        const v63 = p43.owned_ad_accounts?.data.filter(p45 => p45.account_status == 1);
        const v64 = p43.owned_ad_accounts?.data.filter(p46 => p46.account_status != 1);
        accountGrid.api.getRowNode(v60).setDataValue("adAccount", "Total: " + p43.owned_ad_accounts.summary.total_count + " - " + (v63.length ? "Live: " + v63.length + " - " : "") + (v64.length ? "Die: " + v64.length : ""));
        const v65 = p43.owned_ad_accounts?.data[0].adtrust_dsl;
        const v66 = p43.owned_ad_accounts?.data[0].currency;
        accountGrid.api.getRowNode(v60).setDataValue("limit", v65 + " " + v66);
      } else {
        accountGrid.api.getRowNode(v60).setDataValue("adAccount", 0);
      }
      if (p43.business_users?.data.length) {
        accountGrid.api.getRowNode(v60).setDataValue("adminAccount", p43.business_users?.data.length);
      } else {
        accountGrid.api.getRowNode(v60).setDataValue("adminAccount", 0);
      }
      accountGrid.api.getRowNode(v60).setDataValue("type", v61);
      accountGrid.api.getRowNode(v60).setDataValue("role", v62);
      
      // Cargar número de píxeles para este BM (con delay para evitar sobrecarga)
      setTimeout(async () => {
        try {
          await loadPixelCountForBM(p43.id, v60);
        } catch (error) {
          console.warn(`Error cargando píxeles para BM ${p43.id}:`, error);
        }
      }, Math.random() * 2000 + 1000); // Delay aleatorio entre 1-3 segundos
    });
});

$(document).on("loadInstaSuccess", function (p47, p48) {
    const v67 = bmMap.filter(p49 => p49.bmId == p48.id)[0].id;
    accountGrid.api.getRowNode(v67).setDataValue("instaAccount", p48.count);
});

$(document).on("loadLimitSuccess", function (p50, p51) {
    const v68 = bmMap.filter(p52 => p52.bmId == p51.id)[0].id;
    accountGrid.api.getRowNode(v68).setDataValue("bmType", p51.type);
});

$(document).on("loadQtvSuccess", function (p53, p54) {
    const v69 = bmMap.filter(p55 => p55.bmId == p54.id)[0].id;
    accountGrid.api.getRowNode(v69).setDataValue("adminAccount", p54.count);
});

$(document).on("updateListBm", function (p56, p57) {
    $("[name=\"listIdBm\"]").val(p57.join("\r\n"));
    $("#getBmIdCount").text(p57.length);
});

$(document).on("updateBackupLink", function (p58, p59) {
    const v70 = $("[name=\"linkDaNhan\"]").val().split(/\r?\n|\r|\n/g).filter(p60 => p60);
    v70.push(p59.link);
    $("[name=\"linkDaNhan\"]").val(v70.join("\r\n"));
    $("#backupLinkCount1").text(v70.length);
});

$(document).on("updateLinkAll", function (p61, p62) {
    const v71 = $("[name=\"backupLink\"]").val().split(/\r?\n|\r|\n/g).filter(p63 => p63 && !p62.includes(p63));
    $("#backupLinkCount").text(v71.length);
    $("[name=\"backupLink\"]").val(v71.join("\r\n"));
});

$(document).on("updateLinkError", function (p64, p65) {
    const v72 = $("[name=\"backupLinkError\"]").val().split(/\r?\n|\r|\n/g).filter(p66 => p66);
    p65.forEach(p67 => {
      v72.push(p67);
    });
    $("#backupLinkErrorCount").text(v72.length);
    $("[name=\"backupLinkError\"]").val(v72.join("\r\n"));
});

$(document).on("updateLinkSuccess", function (p68, p69) {
    const v73 = $("[name=\"backupLinkSuccess\"]").val().split(/\r?\n|\r|\n/g).filter(p70 => p70);
    p69.forEach(p71 => {
      v73.push(p71);
    });
    $("#backupLinkSuccessCount").text(v73.length);
    $("[name=\"backupLinkSuccess\"]").val(v73.join("\r\n"));
});

$(document).on("updateBmName", function (p72, p73) {
    accountGrid.api.getRowNode(parseInt(p73.id)).setDataValue("name", p73.name);
});

$(document).on("loadPixelSuccess", function (event, data) {
    try {
        console.log(`📊 Píxeles cargados exitosamente para BM ${data.id}: ${data.count} (método: ${data.method || 'unknown'})`);
        
        // Actualizar grilla usando bmMap si está disponible
        if (typeof bmMap !== 'undefined' && bmMap.length > 0) {
            const bmMapEntry = bmMap.filter(bm => bm.bmId == data.id);
            if (bmMapEntry.length > 0 && typeof accountGrid !== 'undefined' && accountGrid.api) {
                const rowNode = accountGrid.api.getRowNode(bmMapEntry[0].id);
                if (rowNode) {
                    rowNode.setDataValue("pixelCount", data.count);
                    console.log(`🔄 Grilla actualizada para BM ${data.id} usando bmMap`);
                } else {
                    console.warn(`⚠️ No se encontró rowNode para ID ${bmMapEntry[0].id}`);
                }
            }
        } else {
            // Fallback: buscar directamente en la grilla
            if (typeof accountGrid !== 'undefined' && accountGrid.api) {
                let targetRowNode = null;
                accountGrid.api.forEachNode(node => {
                    if (node.data && node.data.bmId === data.id) {
                        targetRowNode = node;
                    }
                });
                
                if (targetRowNode) {
                    targetRowNode.setDataValue("pixelCount", data.count);
                    console.log(`🔄 Grilla actualizada para BM ${data.id} usando búsqueda directa`);
                } else {
                    console.warn(`⚠️ No se encontró rowNode para BM ${data.id}`);
                }
            }
        }
        
        // Limpiar cache expirado automáticamente cada cierto tiempo
        if (Math.random() < 0.1) { // 10% probabilidad de limpieza automática
            cleanExpiredPixelCache();
        }
        
    } catch (error) {
        console.error('❌ Error en callback loadPixelSuccess:', error);
    }
});

// Evento para actualizar mensajes de progreso en la columna del BM
$(document).on("updateBmMessage", function (event, data) {
    const bmRowData = bmMap.filter(bm => bm.bmId == data.bmId);
    if (bmRowData.length > 0) {
        accountGrid.api.getRowNode(bmRowData[0].id).setDataValue("message", data.message);
    }
});

// Evento para actualizar píxeles en tiempo real
$(document).on("updateBmPixelCount", function (event, data) {
    const bmRowData = bmMap.filter(bm => bm.bmId == data.bmId);
    if (bmRowData.length > 0) {
        accountGrid.api.getRowNode(bmRowData[0].id).setDataValue("pixelCount", data.count);
    }
});

$("body").on("click", ".phoiItem", function () {
    const v41 = $(this).attr("data-file");
    $(".phoiItem").removeClass("active");
    $(this).addClass("active");
    $("[name=\"phoiId\"]").val(v41);
    $("#phoiControl").removeClass("d-none").addClass("d-flex");
});

$("#editPhoi").click(function () {
    const v42 = $(".phoiItem.active").attr("data-file");
    window.open("phoi.html?id=" + v42, "_blank").focus();
});

$("#deletePhoi").click(function () {
    Swal.fire({
      title: "¿Estás seguro de que quieres eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    }).then(p18 => {
      if (p18.isConfirmed) {
        const v44 = $(".phoiItem.active").attr("data-file");
        const v45 = $("[name=\"phoiId\"]").val();
        if (v45 === v44) {
          $("[name=\"phoiId\"]").val("");
        }
        localStorage.removeItem(v44);
        loadPhoi();
      }
    });
});

$("#phoiModal").on("show.bs.modal", async function (p19) {
    loadPhoi();
});

function loadPhoi() {
    const v46 = Object.keys(localStorage).filter(p20 => p20.includes("phoi_")).map(p21 => {
      return {
        id: p21,
        ...JSON.parse(localStorage[p21])
      };
    });
    const v47 = $("[name=\"phoiId\"]").val();
    if (v47) {
      $("#phoiControl").removeClass("d-none").addClass("d-flex");
    } else {
      $("#phoiControl").addClass("d-none");
    }
    $("#phoiList").html("");
    let v48 = "<div class=\"row\">";
    v46.forEach((p22, p23) => {
      v48 += "\n            <div class=\"col-3 mb-3\">\n                <div class=\"phoiItem " + (p22.id === v47 ? "active" : "") + " d-block p-3 border rounded\" data-file=\"" + p22.id + "\">\n                    <i class=\"ri-checkbox-circle-fill fs-4 text-success\"></i>\n                    <div class=\"ratio ratio-4x3\">\n                        <img class=\"object-fit-contain w-100 h-100\" src=\"" + p22.src + "\">\n                    </div>\n                    <div class=\"d-flex\">\n                        <span class=\"fw-medium\">" + p22.name + "</span>\n                    </div>\n                </div>\n            </div>\n        ";
    });
    v48 += "</div>";
    $("#phoiList").html(v48);
}

$("[name=\"backUpEmail\"]").on("input", function () {
    const v49 = $("[name=\"backUpEmail\"]").val().split(/\r?\n|\r|\n/g).filter(p24 => p24);
    $("#backupEmailCount").text(v49.length);
});

$("[name=\"linkDaNhan\"]").on("input", function () {
    const v50 = $("[name=\"linkDaNhan\"]").val().split(/\r?\n|\r|\n/g).filter(p25 => p25);
    $("#backupLinkCount1").text(v50.length);
});

$("[name=\"backupLink\"]").on("input", function () {
    const v51 = $("[name=\"backupLink\"]").val().split(/\r?\n|\r|\n/g).filter(p26 => p26);
    $("#backupLinkCount").text(v51.length);
});

$("[name=\"backupLinkSuccess\"]").on("input", function () {
    const v52 = $("[name=\"backupLinkSuccess\"]").val().split(/\r?\n|\r|\n/g).filter(p27 => p27);
    $("#backupLinkSuccessCount").text(v52.length);
});

$("[name=\"backupLinkError\"]").on("input", function () {
    const v53 = $("[name=\"backupLinkError\"]").val().split(/\r?\n|\r|\n/g).filter(p28 => p28);
    $("#backupLinkErrorCount").text(v53.length);
});

/**
 * Botón para recargar el número de píxeles
 */
$("#reloadPixelCounts").click(async function() {
    const button = $(this);
    const originalText = button.html();
    
    // Limpiar cache antes de la recarga
    clearPixelCache();
    
    try {
        // Deshabilitar botón y mostrar loading
        button.prop('disabled', true);
        button.html('<i class="ri-loader-4-line me-1 spinner-border spinner-border-sm"></i>Cargando...');
        
        // Obtener todos los BMs visibles en la tabla
        const allBMs = [];
        accountGrid.api.forEachNodeAfterFilterAndSort(node => {
            if (node.data && node.data.bmId) {
                allBMs.push({
                    bmId: node.data.bmId,
                    rowId: node.data.id,
                    name: node.data.name || `BM-${node.data.bmId.substring(0, 8)}`
                });
            }
        });
        
        if (allBMs.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay Business Managers para procesar',
                confirmButtonText: 'Cerrar'
            });
            return;
        }
        
        // Preguntar por modo de procesamiento
        const modeResult = await Swal.fire({
            title: '🚀 Modo de procesamiento',
            html: `
                <div style="text-align: left; margin: 20px 0;">
                    <p><strong>Seleccione el modo de procesamiento:</strong></p>
                    <div style="margin: 15px 0;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="processMode" value="parallel" checked>
                            <span><strong>🏃‍♂️ Paralelo</strong> - Más rápido (recomendado)</span>
                        </label>
                        <small style="color: #666; margin-left: 24px;">Procesa múltiples BMs simultáneamente</small>
                    </div>
                    <div style="margin: 15px 0;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="processMode" value="sequential">
                            <span><strong>🚶‍♂️ Secuencial</strong> - Más seguro</span>
                        </label>
                        <small style="color: #666; margin-left: 24px;">Procesa un BM a la vez</small>
                    </div>
                </div>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 15px;">
                    <small>📊 ${allBMs.length} Business Managers detectados</small>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Comenzar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const selectedMode = document.querySelector('input[name="processMode"]:checked');
                return selectedMode ? selectedMode.value : 'parallel';
            }
        });
        
        if (!modeResult.isConfirmed) {
            return;
        }
        
        const isParallel = modeResult.value === 'parallel';
        console.log(`🚀 Iniciando recarga de píxeles para ${allBMs.length} BMs (modo: ${isParallel ? 'paralelo' : 'secuencial'})`);
        
        // Mostrar progreso mejorado
        const progressSwal = Swal.fire({
            title: '🔄 Cargando píxeles',
            html: `
                <div style="text-align: left;">
                    <div>📋 Modo: ${isParallel ? 'Paralelo 🏃‍♂️' : 'Secuencial 🚶‍♂️'}</div>
                    <div>📊 Progreso: 0/${allBMs.length}</div>
                    <div>🎯 Píxeles encontrados: 0</div>
                    <div>💾 Cache: ${pixelCache.size} entradas</div>
                </div>
            `,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        let processed = 0;
        let totalPixels = 0;
        let errors = 0;
        const startTime = Date.now();
        
        if (isParallel) {
            // Procesamiento en paralelo con lotes de 5 BMs
            const batchSize = 5;
            const batches = [];
            
            for (let i = 0; i < allBMs.length; i += batchSize) {
                batches.push(allBMs.slice(i, i + batchSize));
            }
            
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
                const batch = batches[batchIndex];
                
                progressSwal.update({
                    html: `
                        <div style="text-align: left;">
                            <div>📋 Modo: Paralelo 🏃‍♂️ (Lote ${batchIndex + 1}/${batches.length})</div>
                            <div>📊 Progreso: ${processed}/${allBMs.length}</div>
                            <div>🎯 Píxeles: ${totalPixels}</div>
                            ${errors > 0 ? `<div style="color: #dc3545;">❌ Errores: ${errors}</div>` : ''}
                            <div>💾 Cache: ${pixelCache.size} entradas</div>
                            <div style="font-size: 0.8em; color: #666; margin-top: 10px;">
                                Procesando: ${batch.map(bm => bm.name.substring(0, 15)).join(', ')}
                            </div>
                        </div>
                    `
                });
                
                // Procesar lote en paralelo
                const batchPromises = batch.map(async (bm) => {
                    try {
                        const pixelCount = await loadPixelCountForBM(bm.bmId, bm.rowId);
                        return { success: true, bm, pixelCount };
                    } catch (error) {
                        console.error(`Error procesando BM ${bm.bmId}:`, error);
                        return { success: false, bm, error: error.message };
                    }
                });
                
                const batchResults = await Promise.allSettled(batchPromises);
                
                // Procesar resultados del lote
                for (const result of batchResults) {
                    if (result.status === 'fulfilled' && result.value.success) {
                        totalPixels += result.value.pixelCount;
                    } else {
                        errors++;
                    }
                    processed++;
                }
                
                // Delay entre lotes para evitar sobrecargar
                if (batchIndex < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        } else {
            // Procesamiento secuencial mejorado
            for (const bm of allBMs) {
                try {
                    progressSwal.update({
                        html: `
                            <div style="text-align: left;">
                                <div>📋 Modo: Secuencial 🚶‍♂️</div>
                                <div>📊 Progreso: ${processed}/${allBMs.length}</div>
                                <div>🎯 Píxeles: ${totalPixels}</div>
                                ${errors > 0 ? `<div style="color: #dc3545;">❌ Errores: ${errors}</div>` : ''}
                                <div>💾 Cache: ${pixelCache.size} entradas</div>
                                <div style="font-size: 0.8em; color: #666; margin-top: 10px;">
                                    Actual: ${bm.name}
                                </div>
                            </div>
                        `
                    });
                    
                    const pixelCount = await loadPixelCountForBM(bm.bmId, bm.rowId);
                    totalPixels += pixelCount;
                    processed++;
                    
                    // Delay adaptativo basado en el resultado
                    const delay = pixelCount > 0 ? 1200 : 800; // Menos delay si no encontró píxeles
                    if (processed < allBMs.length) {
                        await new Promise(resolve => setTimeout(resolve, delay));
                    }
                    
                } catch (error) {
                    console.error(`Error procesando BM ${bm.bmId}:`, error);
                    errors++;
                    processed++;
                }
            }
        }
        
        progressSwal.close();
        
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        
        // Mostrar resultado final mejorado
        Swal.fire({
            icon: errors === 0 ? 'success' : 'warning',
            title: errors === 0 ? '🎉 ¡Píxeles actualizados!' : '⚠️ ¡Completado con errores!',
            html: `
                <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                    <h6>📊 Estadísticas del proceso:</h6>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        <div><strong>✅ Procesados:</strong> ${processed}/${allBMs.length}</div>
                        <div><strong>🎯 Píxeles encontrados:</strong> ${totalPixels}</div>
                        ${errors > 0 ? `<div style="color: #dc3545;"><strong>❌ Errores:</strong> ${errors}</div>` : ''}
                        <div><strong>⏱️ Duración:</strong> ${duration}s</div>
                        <div><strong>🏃‍♂️ Modo:</strong> ${isParallel ? 'Paralelo' : 'Secuencial'}</div>
                        <div><strong>💾 Cache:</strong> ${pixelCache.size} entradas guardadas</div>
                    </div>
                    <div style="font-size: 0.85em; color: #666;">
                        💡 <strong>Optimizaciones aplicadas:</strong><br>
                        • Cache inteligente (TTL: 5 min)<br>
                        • Validación mejorada de píxeles<br>
                        • Retry automático con backoff<br>
                        • Detección múltiple de patrones<br>
                        ${isParallel ? '• Procesamiento en paralelo' : '• Procesamiento secuencial seguro'}
                    </div>
                </div>
            `,
            confirmButtonText: 'Cerrar',
            width: '600px'
        });
        
    } catch (error) {
        console.error('Error recargando píxeles:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error crítico',
            text: 'Ocurrió un error inesperado al recargar los píxeles: ' + error.message,
            confirmButtonText: 'Cerrar'
        });
    } finally {
        // Restaurar botón
        button.prop('disabled', false);
        button.html(originalText);
    }
});

/**
 * createPixelForBM
 * Descripción: Crea píxeles de Facebook para un Business Manager específico
 * Parámetros: bmId (string), pixelName (string), quantity (number), options (object)
 * Retorna: Promise<object>
 */
async function createPixelForBM(bmId, pixelName, quantity = 1, options = {}) {
    try {
        const {
            enableAutomaticMatching = true,
            enableFirstPartyCookies = true
        } = options;

        const results = {
            success: [],
            errors: []
        };

        for (let i = 0; i < quantity; i++) {
            try {
                // Generar nombre único para el píxel
                const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
                const finalPixelName = `${pixelName}_${randomSuffix}`;

                // Simular creación de píxel usando Facebook Marketing API
                const pixelData = {
                    name: finalPixelName,
                    business_id: bmId,
                    automatic_matching_fields: enableAutomaticMatching ? ['em', 'ph', 'fn', 'ln'] : [],
                    first_party_cookie_status: enableFirstPartyCookies ? 'FIRST_PARTY_COOKIE_ENABLED' : 'FIRST_PARTY_COOKIE_DISABLED'
                };

                // Llamada real a la API de Facebook
                const response = await createRealPixel(pixelData);
                
                if (response.success) {
                    results.success.push({
                        bmId: bmId,
                        pixelId: response.pixelId,
                        pixelName: finalPixelName,
                        message: `Píxel creado exitosamente: ${finalPixelName} (ID: ${response.pixelId})`
                    });
                    
                    // Actualizar el contador de píxeles en la tabla después de crear uno nuevo
                    setTimeout(async () => {
                        try {
                            const bmRowData = bmMap.filter(bm => bm.bmId == bmId);
                            if (bmRowData.length > 0) {
                                await loadPixelCountForBM(bmId, bmRowData[0].id);
                            }
                        } catch (error) {
                            console.warn('Error actualizando contador de píxeles:', error);
                        }
                    }, 2000); // Delay para que Facebook procese el píxel
                } else {
                    results.errors.push({
                        bmId: bmId,
                        pixelName: finalPixelName,
                        error: response.error || 'Error desconocido al crear píxel'
                    });
                }

                // Delay entre creaciones para evitar rate limiting (más realista)
                if (i < quantity - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2500 + Math.random() * 1000));
                }

            } catch (error) {
                results.errors.push({
                    bmId: bmId,
                    pixelName: `${pixelName}_${i + 1}`,
                    error: error.message || 'Error inesperado al crear píxel'
                });
            }
        }

        return results;

    } catch (error) {
        console.error('Error en createPixelForBM:', error);
        return {
            success: [],
            errors: [{
                bmId: bmId,
                error: error.message || 'Error crítico en la función de creación de píxeles'
            }]
        };
    }
}

/**
 * FacebookPixelCreator
 * Descripción: Clase para crear píxeles reales de Facebook usando la API nativa
 */
class FacebookPixelCreator {
    constructor(businessId) {
        this.business_id = businessId;
        this.user_id = this.getUserId();
        this.fb_dtsg = this.getFbDtsg();
        this.lsd = this.getLsd();
        this.access_token = this.getAccessToken();

        if (!this.business_id) throw new Error('No se pudo obtener el ID del negocio');
        if (!this.user_id) throw new Error('No se pudo obtener el ID de usuario');
        if (!this.fb_dtsg) throw new Error('No se pudo obtener el token DTSG');
    }

    getUserId() {
        try {
            return document.cookie.match(/c_user=(\d+)/)?.[1] || 
                   (typeof require !== 'undefined' ? require('CurrentUserInitialData')?.USER_ID : null) ||
                   fb?.uid;
        } catch (e) {
            return fb?.uid || null;
        }
    }

    getFbDtsg() {
        try {
            return document.querySelector('[name="fb_dtsg"]')?.value ||
                   (typeof require !== 'undefined' ? require('DTSGInitialData')?.token : null) ||
                   document.querySelector('input[name="fb_dtsg"]')?.value ||
                   fb?.dtsg;
        } catch (e) {
            return fb?.dtsg || null;
        }
    }

    getLsd() {
        try {
            return document.querySelector('[name="lsd"]')?.value ||
                   (typeof require !== 'undefined' ? require('LSD')?.token : null) ||
                   `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } catch (e) {
            return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
    }

    getAccessToken() {
        try {
            return (typeof require !== 'undefined' ? require('WebApiApplication')?.getAccessToken() : null) ||
                   document.querySelector('input[name="accessToken"]')?.value;
        } catch (e) {
            console.warn('No se pudo obtener access token:', e);
            return null;
        }
    }

    async createPixel(pixelName) {
        try {
            console.log(`🚀 Creando píxel real: ${pixelName} para BM: ${this.business_id}`);
            
            // Verificar que fetch2 esté disponible
            if (typeof fetch2 !== 'function') {
                throw new Error('fetch2 no está disponible. Asegúrate de que la extensión esté cargada.');
            }
            
            // Primero aceptamos los términos si es necesario (usando fetch2 para evitar CORS)
            try {
                await fetch2(`https://business.facebook.com/pixels/accept_tos/?business_id=${this.business_id}&__a=1`, {
                    method: 'POST',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                    body: `__user=${this.user_id}&fb_dtsg=${encodeURIComponent(this.fb_dtsg)}`
                });
            } catch (e) {
                console.warn('Error aceptando términos (puede ser normal):', e);
            }

            // Crear el píxel usando el endpoint directo (usando fetch2 para evitar CORS)
            const response = await fetch2('https://business.facebook.com/events_manager/dataset/create/', {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                },
                body: `business_id=${this.business_id}&is_crm=false&name=${encodeURIComponent(pixelName)}&__user=${this.user_id}&fb_dtsg=${encodeURIComponent(this.fb_dtsg)}&__a=1`
            });

            // fetch2 devuelve un objeto con propiedades text y json
            const text = typeof response.text === 'string' ? response.text : JSON.stringify(response.json || response);
            console.log('📊 Respuesta de Facebook:', text.substring(0, 200) + '...');

            let data;
            try {
                // Si response.json ya existe, usarlo directamente
                if (response.json && typeof response.json === 'object') {
                    data = response.json;
                } else {
                    // Limpiar la respuesta de Facebook y parsear
                    const cleanText = text.replace(/^for \(;;\);/, '');
                    data = JSON.parse(cleanText);
                }
                
                // Nuevo formato de respuesta
                if (data.payload?.id) {
                    console.log(`✅ Píxel creado exitosamente: ${pixelName} (ID: ${data.payload.id})`);
                    return {
                        success: true,
                        pixelId: data.payload.id,
                        name: pixelName,
                        data: data
                    };
                }
                
                // Formato anterior por compatibilidad
                if (data.jsmods?.require) {
                    const pixelData = data.jsmods.require.find(r => r[0] === 'PixelConfirmationDialog.react');
                    if (pixelData) {
                        const pixelId = pixelData[3][0]?.pixel_id;
                        if (pixelId) {
                            console.log(`✅ Píxel creado exitosamente: ${pixelName} (ID: ${pixelId})`);
                            return {
                                success: true,
                                pixelId: pixelId,
                                name: pixelName,
                                data: data
                            };
                        }
                    }
                }

                // Buscar cualquier ID en la respuesta
                const idMatch = text.match(/"id":"(\d{15,})"/);
                if (idMatch) {
                    const pixelId = idMatch[1];
                    console.log(`✅ Píxel creado (ID encontrado por regex): ${pixelName} (ID: ${pixelId})`);
                    return {
                        success: true,
                        pixelId: pixelId,
                        name: pixelName,
                        data: data
                    };
                }

                // Si hay error específico
                if (data.error) {
                    throw new Error(data.errorDescription || data.error.message || 'Error desconocido de Facebook');
                }

                throw new Error('No se pudo obtener el ID del píxel de la respuesta');
                
            } catch (parseError) {
                console.error('❌ Error parseando respuesta:', parseError);
                console.log('📄 Respuesta completa:', text);
                console.log('📄 Respuesta objeto:', response);
                
                // Intentar extraer información útil del error
                if (response && !response.ok) {
                    throw new Error(`Error HTTP ${response.status}: ${response.statusText || 'Error de Facebook'}`);
                }
                
                throw new Error(`Error procesando respuesta de Facebook: ${parseError.message}`);
            }
            
        } catch (error) {
            console.error(`❌ Error creando píxel ${pixelName}:`, error);
            return {
                success: false,
                error: error.message,
                name: pixelName
            };
        }
    }
}

// Cache global para píxeles con TTL de 5 minutos
const pixelCache = new Map();
const PIXEL_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * clearPixelCache
 * Descripción: Limpia el cache de píxeles
 */
function clearPixelCache() {
    pixelCache.clear();
    console.log('🧹 Cache de píxeles limpiado');
}

/**
 * getPixelCacheStats
 * Descripción: Obtiene estadísticas del cache de píxeles
 * Retorna: object
 */
function getPixelCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalPixels = 0;
    
    for (const [bmId, data] of pixelCache.entries()) {
        if ((now - data.timestamp) < PIXEL_CACHE_TTL) {
            validEntries++;
            totalPixels += data.count;
        } else {
            expiredEntries++;
        }
    }
    
    return {
        total: pixelCache.size,
        valid: validEntries,
        expired: expiredEntries,
        totalPixels: totalPixels,
        ttlMinutes: Math.round(PIXEL_CACHE_TTL / 60000)
    };
}

/**
 * cleanExpiredPixelCache
 * Descripción: Limpia las entradas expiradas del cache
 */
function cleanExpiredPixelCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [bmId, data] of pixelCache.entries()) {
        if ((now - data.timestamp) >= PIXEL_CACHE_TTL) {
            pixelCache.delete(bmId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Cache limpiado: ${cleaned} entradas expiradas eliminadas`);
    }
    
    return cleaned;
}

// Task scheduler para limpieza automática del cache cada 10 minutos
setInterval(() => {
    const cleaned = cleanExpiredPixelCache();
    if (cleaned > 0) {
        console.log(`🔄 Limpieza automática del cache completada: ${cleaned} entradas eliminadas`);
    }
}, 10 * 60 * 1000); // 10 minutos

// Funciones globales para debugging y utilidades (disponibles en window)
window.DivinAdsPixelUtils = {
    // Cache management
    clearCache: clearPixelCache,
    getCacheStats: getPixelCacheStats,
    cleanExpired: cleanExpiredPixelCache,
    
    // Pixel counting
    getPixelCount: getPixelCountForBM,
    loadPixelCount: loadPixelCountForBM,
    
    // Debug functions
    debugBM: function(bmId) {
        console.log(`🔍 Debugging BM: ${bmId}`);
        const cached = getCachedPixelCount(bmId);
        console.log(`💾 Cache:`, cached !== null ? `${cached} píxeles` : 'No encontrado');
        
        return loadPixelCountForBM(bmId, null).then(count => {
            console.log(`🎯 Resultado final: ${count} píxeles`);
            return count;
        });
    },
    
    showCacheStats: function() {
        const stats = getPixelCacheStats();
        console.table(stats);
        console.log(`📊 Cache Stats:`, stats);
        return stats;
    },
    
    testPixelDetection: function(bmId) {
        console.log(`🧪 Probando todos los métodos de detección para BM: ${bmId}`);
        
        const methods = [
            { name: 'Principal', fn: () => getPixelCountForBM(bmId) },
            { name: 'GraphQL', fn: () => getPixelCountViaGraphQL(bmId) },
            { name: 'Acceso Directo', fn: () => getPixelCountDirectAccess(bmId) },
            { name: 'Extensión', fn: () => getPixelCountViaExtension(bmId) }
        ];
        
        return Promise.all(
            methods.map(async method => {
                try {
                    const result = await method.fn();
                    console.log(`✅ ${method.name}: ${result} píxeles`);
                    return { method: method.name, result, success: true };
                } catch (error) {
                    console.error(`❌ ${method.name}: ${error.message}`);
                    return { method: method.name, error: error.message, success: false };
                }
            })
        ).then(results => {
            console.table(results);
            return results;
        });
    }
};

// Log de inicialización
console.log('🚀 DivinAds Pixel System Mejorado - Inicializado');
console.log('💡 Funciones disponibles en window.DivinAdsPixelUtils:');
console.log('   - clearCache(): Limpiar cache');
console.log('   - getCacheStats(): Ver estadísticas del cache');
console.log('   - debugBM(bmId): Debug de un BM específico');
console.log('   - testPixelDetection(bmId): Probar todos los métodos');

/**
 * getCachedPixelCount
 * Descripción: Obtiene el conteo de píxeles del cache si está disponible y válido
 * Parámetros: businessId (string)
 * Retorna: number|null
 */
function getCachedPixelCount(businessId) {
    const cached = pixelCache.get(businessId);
    if (cached && (Date.now() - cached.timestamp) < PIXEL_CACHE_TTL) {
        console.log(`💾 Cache hit para BM ${businessId}: ${cached.count} píxeles`);
        return cached.count;
    }
    return null;
}

/**
 * setCachedPixelCount
 * Descripción: Almacena el conteo de píxeles en cache
 * Parámetros: businessId (string), count (number)
 */
function setCachedPixelCount(businessId, count) {
    pixelCache.set(businessId, {
        count: count,
        timestamp: Date.now()
    });
}

/**
 * validatePixelData
 * Descripción: Valida y filtra datos de píxeles para evitar duplicados y falsos positivos
 * Parámetros: pixelData (array), method (string)
 * Retorna: object
 */
function validatePixelData(pixelData, method = 'unknown') {
    if (!Array.isArray(pixelData)) {
        return { count: 0, pixels: [], method };
    }
    
    // Filtros mejorados para píxeles reales
    const validPixels = pixelData.filter(pixel => {
        if (typeof pixel === 'string') {
            // Para nombres de píxeles
            return pixel.length >= 3 && 
                   !pixel.match(/^(XL|[0-9]+[A-Z]?|Overview|Details|Manual|Code|Is|limit|setup|on|manually|only|code|details|via|status|tab|in|to|events|audiences|users|performance|create|new|add|install|configure|verify|test|debug|help|info|settings|privacy|terms|policy|facebook|meta|pixel|google|android|ios|windows|mac|linux|chrome|firefox|safari|edge|opera|browser|device|mobile|tablet|desktop|laptop|pc|app|web|site|page|domain|url|link|button|click|view|visit)$/i) &&
                   pixel.match(/^[A-Z][A-Z0-9_\-\s]{2,}$/i);
        } else if (typeof pixel === 'object' && pixel.id) {
            // Para objetos con ID
            return pixel.id.match(/^\d{15,}$/) && pixel.id.length >= 15 && pixel.id.length <= 20;
        }
        return false;
    });
    
    // Deduplicar píxeles únicos
    const uniquePixels = [...new Set(validPixels.map(p => 
        typeof p === 'string' ? p.trim() : p.id
    ))];
    
    return {
        count: uniquePixels.length,
        pixels: uniquePixels,
        method: method,
        filteredOut: pixelData.length - validPixels.length
    };
}

/**
 * getEAAGToken
 * Descripción: Obtiene token EAAG del HTML de la página
 * Retorna: string|null
 */
function getEAAGToken() {
    try {
        const htmlContent = document.documentElement.outerHTML;
        const tokenMatch = htmlContent.match(/EAAG[a-zA-Z0-9]{50,}/);
        return tokenMatch ? tokenMatch[0] : null;
    } catch (error) {
        console.error('Error obteniendo token EAAG:', error);
        return null;
    }
}

/**
 * getPixelCountForBM
 * Descripción: Obtiene el número de píxeles de un Business Manager usando Graph API (CORREGIDO)
 * Parámetros: businessId (string)
 * Retorna: Promise<number>
 */
async function getPixelCountForBM(businessId) {
    try {
        console.log(`📊 Obteniendo píxeles para BM: ${businessId}`);
        
        // Verificar cache primero
        const cachedCount = getCachedPixelCount(businessId);
        if (cachedCount !== null) {
            console.log(`💾 Usando count desde cache: ${cachedCount} píxeles`);
            return cachedCount;
        }
        
        // Verificar que fetch2 esté disponible
        if (typeof fetch2 !== 'function') {
            throw new Error('fetch2 no está disponible');
        }
        
        // Obtener el mejor token disponible
        let token = fb?.accessToken || fb?.token;
        
        // Intentar obtener token EAAG si no lo tenemos
        if (!token || !token.startsWith('EAAG')) {
            const eaagToken = getEAAGToken();
            if (eaagToken) {
                token = eaagToken;
                console.log(`🔑 Usando token EAAG para conteo: ${token.substring(0, 20)}...`);
            }
        }
        
        if (!token) {
            console.log('❌ No se encontró token de acceso');
            return 0;
        }
        
        console.log(`🏢 Consultando píxeles para BM: ${businessId}`);
        console.log(`🔑 Token: ${token.substring(0, 20)}...`);
        
        // MÉTODO 1: Graph API v19.0 directo al BM (EL PRINCIPAL)
        try {
            const bmPixelsUrl = `https://graph.facebook.com/v19.0/${businessId}/adspixels?fields=id,name&access_token=${token}`;
            console.log(`📡 Consultando v19.0: ${bmPixelsUrl}`);
            
            const bmPixelsResponse = await fetch2(bmPixelsUrl);
            const bmPixelsData = bmPixelsResponse.json;
            
            console.log(`📊 Respuesta v19.0:`, bmPixelsData);
            console.log(`🔍 DEBUG v19.0: status=${bmPixelsResponse.status}, data exists=${!!bmPixelsData.data}, is array=${Array.isArray(bmPixelsData.data)}, length=${bmPixelsData.data?.length}`);
            
            // CORREGIDO: fetch2 no tiene .ok, verificar por status y ausencia de error
            if (bmPixelsData && bmPixelsData.data && Array.isArray(bmPixelsData.data) && !bmPixelsData.error) {
                const pixelCount = bmPixelsData.data.length;
                console.log(`✅ ÉXITO v19.0: Encontrados ${pixelCount} píxeles REALES`);
                console.log(`📋 IDs reales:`, bmPixelsData.data.map(p => p.id));
                
                // Guardar en cache
                setCachedPixelCount(businessId, pixelCount);
                return pixelCount;
            } else if (bmPixelsData.error) {
                console.log(`⚠️ Error v19.0: ${bmPixelsData.error.message}`);
            } else {
                console.log(`⚠️ v19.0: Condición no cumplida - data=${!!bmPixelsData.data}, isArray=${Array.isArray(bmPixelsData.data)}, error=${!!bmPixelsData.error}`);
            }
        } catch (error) {
            console.log(`⚠️ Error v19.0: ${error.message}`);
        }
        
        // MÉTODO 2: Graph API v18.0 como fallback (CORREGIDO)
        try {
            const fallbackUrl = `https://graph.facebook.com/v18.0/${businessId}/adspixels?fields=id,name&access_token=${token}`;
            console.log(`📡 Consultando v18.0: ${fallbackUrl}`);
            
            const fallbackResponse = await fetch2(fallbackUrl);
            const fallbackData = fallbackResponse.json;
            
            console.log(`📊 Respuesta v18.0:`, fallbackData);
            console.log(`🔍 DEBUG v18.0: status=${fallbackResponse.status}, data exists=${!!fallbackData.data}, is array=${Array.isArray(fallbackData.data)}, length=${fallbackData.data?.length}`);
            
            // CORREGIDO: verificar por data y ausencia de error
            if (fallbackData && fallbackData.data && Array.isArray(fallbackData.data) && !fallbackData.error) {
                const pixelCount = fallbackData.data.length;
                console.log(`✅ ÉXITO v18.0: Encontrados ${pixelCount} píxeles REALES`);
                console.log(`📋 IDs reales:`, fallbackData.data.map(p => p.id));
                
                // Guardar en cache
                setCachedPixelCount(businessId, pixelCount);
                return pixelCount;
            } else if (fallbackData.error) {
                console.log(`⚠️ Error v18.0: ${fallbackData.error.message}`);
            } else {
                console.log(`⚠️ v18.0: Condición no cumplida - data=${!!fallbackData.data}, isArray=${Array.isArray(fallbackData.data)}, error=${!!fallbackData.error}`);
            }
        } catch (error) {
            console.log(`⚠️ Error v18.0: ${error.message}`);
        }
        
        // MÉTODO 3: Graph API v14.0 como último fallback (CORREGIDO)
        try {
            const v14Url = `https://graph.facebook.com/v14.0/${businessId}/adspixels?fields=id,name&access_token=${token}`;
            console.log(`📡 Consultando v14.0: ${v14Url}`);
            
            const v14Response = await fetch2(v14Url);
            const v14Data = v14Response.json;
            
            console.log(`📊 Respuesta v14.0:`, v14Data);
            console.log(`🔍 DEBUG v14.0: status=${v14Response.status}, data exists=${!!v14Data.data}, is array=${Array.isArray(v14Data.data)}, length=${v14Data.data?.length}`);
            
            // CORREGIDO: verificar por data y ausencia de error
            if (v14Data && v14Data.data && Array.isArray(v14Data.data) && !v14Data.error) {
                const pixelCount = v14Data.data.length;
                console.log(`✅ ÉXITO v14.0: Encontrados ${pixelCount} píxeles REALES`);
                console.log(`📋 IDs reales:`, v14Data.data.map(p => p.id));
                
                // Guardar en cache
                setCachedPixelCount(businessId, pixelCount);
                return pixelCount;
            } else if (v14Data.error) {
                console.log(`⚠️ Error v14.0: ${v14Data.error.message}`);
            } else {
                console.log(`⚠️ v14.0: Condición no cumplida - data=${!!v14Data.data}, isArray=${Array.isArray(v14Data.data)}, error=${!!v14Data.error}`);
            }
        } catch (error) {
            console.log(`⚠️ Error v14.0: ${error.message}`);
        }
        
        // MÉTODO 4: Obtener píxeles del usuario y filtrar por BM (CORREGIDO)
        try {
            console.log(`🔄 Intentando método /me/adspixels filtrado por BM...`);
            const userPixelsUrl = `https://graph.facebook.com/v19.0/me/adspixels?fields=id,name,owner_business&access_token=${token}`;
            console.log(`📡 Consultando: ${userPixelsUrl}`);
            
            const userPixelsResponse = await fetch2(userPixelsUrl);
            const userPixelsData = userPixelsResponse.json;
            
            console.log(`📊 Respuesta /me/adspixels:`, userPixelsData);
            
            // CORREGIDO: verificar por data y ausencia de error
            if (userPixelsData && userPixelsData.data && Array.isArray(userPixelsData.data) && !userPixelsData.error) {
                const filteredPixels = userPixelsData.data.filter(pixel => {
                    const hasOwnerBusiness = pixel.owner_business && pixel.owner_business.id === businessId;
                    console.log(`🔍 Píxel ${pixel.id}: owner_business=${pixel.owner_business?.id}, match=${hasOwnerBusiness}`);
                    return hasOwnerBusiness;
                });
                
                const pixelCount = filteredPixels.length;
                console.log(`✅ ÉXITO /me/adspixels: Encontrados ${pixelCount} píxeles filtrados por BM`);
                console.log(`📋 IDs filtrados:`, filteredPixels.map(p => p.id));
                
                if (pixelCount > 0) {
                    // Guardar en cache
                    setCachedPixelCount(businessId, pixelCount);
                    return pixelCount;
                }
            } else if (userPixelsData.error) {
                console.log(`⚠️ Error /me/adspixels: ${userPixelsData.error.message}`);
            }
        } catch (error) {
            console.log(`⚠️ Error /me/adspixels: ${error.message}`);
        }
        
        // Si llegamos aquí, no se encontraron píxeles
        console.log(`❌ No se encontraron píxeles en BM ${businessId} usando Graph API`);
        console.log(`💡 NOTA: Los datos pueden estar llegando correctamente pero fetch2 no tiene .ok`);
        console.log(`🔧 Solución aplicada: Verificar por data y ausencia de error en lugar de response.ok`);
        
        return 0;
        
    } catch (error) {
        console.error(`❌ Error obteniendo píxeles para BM ${businessId}:`, error);
        return 0;
    }
}

/**
 * getPixelCountViaExtension
 * Descripción: Obtiene píxeles usando Graph API v18.0 como extensión (CORREGIDO)
 * Parámetros: businessId (string)
 * Retorna: Promise<number>
 */
async function getPixelCountViaExtension(businessId) {
    try {
        console.log(`🔧 Obteniendo píxeles via extensión para BM: ${businessId}`);
        
        // Obtener el mejor token disponible
        let token = fb?.accessToken || fb?.token;
        
        // Intentar obtener token EAAG si no lo tenemos
        if (!token || !token.startsWith('EAAG')) {
            const eaagToken = getEAAGToken();
            if (eaagToken) {
                token = eaagToken;
                console.log(`🔑 Usando token EAAG para extensión: ${token.substring(0, 20)}...`);
            }
        }
        
        if (!token) {
            console.log('❌ No se encontró token de acceso para extensión');
            return 0;
        }
        
        // Usar Graph API v18.0 como método de extensión
        const extensionApiUrl = `https://graph.facebook.com/v18.0/${businessId}/adspixels?fields=id,name&access_token=${token}`;
        console.log(`📡 Extensión consultando: ${extensionApiUrl}`);
        
        const response = await fetch2(extensionApiUrl);
        const data = response.json;
        
        console.log(`📊 Respuesta extensión:`, data);
        
        // CORREGIDO: verificar por data y ausencia de error
        if (data && data.data && Array.isArray(data.data) && !data.error) {
            const pixelCount = data.data.length;
            console.log(`✅ Extensión ÉXITO: encontrados ${pixelCount} píxeles`);
            console.log(`📋 IDs extensión:`, data.data.map(p => p.id));
            return pixelCount;
        } else if (data.error) {
            console.log(`⚠️ Error extensión: ${data.error.message}`);
        } else {
            console.log(`⚠️ Extensión: Condición no cumplida - data=${!!data.data}, isArray=${Array.isArray(data.data)}, error=${!!data.error}`);
        }
        
        return 0;
        
    } catch (error) {
        console.error('Error en getPixelCountViaExtension:', error);
        return 0;
    }
}

/**
 * getPixelCountViaGraphQL
 * Descripción: Obtiene píxeles usando Graph API directo (CORREGIDO)
 * Parámetros: businessId (string)
 * Retorna: Promise<number>
 */
async function getPixelCountViaGraphQL(businessId) {
    try {
        console.log(`🔍 Intentando Graph API directo para BM: ${businessId}`);
        
        // Obtener el mejor token disponible
        let token = fb?.accessToken || fb?.token;
        
        // Intentar obtener token EAAG si no lo tenemos
        if (!token || !token.startsWith('EAAG')) {
            const eaagToken = getEAAGToken();
            if (eaagToken) {
                token = eaagToken;
                console.log(`🔑 Usando token EAAG para GraphQL: ${token.substring(0, 20)}...`);
            }
        }
        
        if (!token) {
            console.log('❌ No se encontró token de acceso para GraphQL');
            return 0;
        }
        
        // Usar Graph API v19.0 directamente
        const graphApiUrl = `https://graph.facebook.com/v19.0/${businessId}/adspixels?fields=id,name&access_token=${token}`;
        console.log(`📡 GraphQL consultando: ${graphApiUrl}`);
        
        const response = await fetch2(graphApiUrl);
        const data = response.json;
        
        console.log(`📊 Respuesta GraphQL:`, data);
        
        // CORREGIDO: verificar por data y ausencia de error
        if (data && data.data && Array.isArray(data.data) && !data.error) {
            const pixelCount = data.data.length;
            console.log(`✅ GraphQL ÉXITO: encontrados ${pixelCount} píxeles`);
            console.log(`📋 IDs GraphQL:`, data.data.map(p => p.id));
            return pixelCount;
        } else if (data.error) {
            console.log(`⚠️ Error GraphQL: ${data.error.message}`);
        } else {
            console.log(`⚠️ GraphQL: Condición no cumplida - data=${!!data.data}, isArray=${Array.isArray(data.data)}, error=${!!data.error}`);
        }
        
        return 0;
        
    } catch (error) {
        console.error('❌ Error en GraphQL:', error);
        return 0;
    }
}

/**
 * getPixelCountDirectAccess
 * Descripción: Obtiene píxeles usando Graph API v14.0 como acceso directo (CORREGIDO)
 * Parámetros: businessId (string)
 * Retorna: Promise<number>
 */
async function getPixelCountDirectAccess(businessId) {
    try {
        console.log(`🎯 Acceso directo a píxeles para BM: ${businessId}`);
        
        // Obtener el mejor token disponible
        let token = fb?.accessToken || fb?.token;
        
        // Intentar obtener token EAAG si no lo tenemos
        if (!token || !token.startsWith('EAAG')) {
            const eaagToken = getEAAGToken();
            if (eaagToken) {
                token = eaagToken;
                console.log(`🔑 Usando token EAAG para acceso directo: ${token.substring(0, 20)}...`);
            }
        }
        
        if (!token) {
            console.log('❌ No se encontró token de acceso para acceso directo');
            return 0;
        }
        
        // Usar Graph API v14.0 como acceso directo
        const directApiUrl = `https://graph.facebook.com/v14.0/${businessId}/adspixels?fields=id,name&access_token=${token}`;
        console.log(`📡 Acceso directo consultando: ${directApiUrl}`);
        
        const response = await fetch2(directApiUrl);
        const data = response.json;
        
        console.log(`📊 Respuesta acceso directo:`, data);
        
        // CORREGIDO: verificar por data y ausencia de error
        if (data && data.data && Array.isArray(data.data) && !data.error) {
            const pixelCount = data.data.length;
            console.log(`✅ Acceso directo ÉXITO: encontrados ${pixelCount} píxeles`);
            console.log(`📋 IDs acceso directo:`, data.data.map(p => p.id));
            return pixelCount;
        } else if (data.error) {
            console.log(`⚠️ Error acceso directo: ${data.error.message}`);
        } else {
            console.log(`⚠️ Acceso directo: Condición no cumplida - data=${!!data.data}, isArray=${Array.isArray(data.data)}, error=${!!data.error}`);
        }
        
        return 0;
        
    } catch (error) {
        console.error('❌ Error en acceso directo:', error);
        return 0;
    }
}

/**
 * retryWithBackoff
 * Descripción: Ejecuta una función con retry automático y backoff exponencial
 * Parámetros: fn (function), maxRetries (number), baseDelay (number)
 * Retorna: Promise<any>
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            if (result !== null && result !== undefined && result !== 0) {
                return result;
            }
            // Si devuelve 0, continuar con el siguiente intento
            lastError = new Error(`Intento ${attempt} devolvió 0 píxeles`);
        } catch (error) {
            lastError = error;
            console.warn(`🔄 Intento ${attempt}/${maxRetries} falló:`, error.message);
            
            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                console.log(`⏱️ Esperando ${Math.round(delay)}ms antes del próximo intento...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError;
}

/**
 * loadPixelCountForBM
 * Descripción: Carga el número de píxeles para un BM específico con retry automático y métodos mejorados
 * Parámetros: businessId (string), bmRowId (number)
 * Retorna: Promise<number>
 */
async function loadPixelCountForBM(businessId, bmRowId) {
    try {
        console.log(`🚀 Iniciando carga de píxeles para BM: ${businessId}`);
        let pixelCount = 0;
        let successMethod = 'none';
        
        // Verificar cache primero
        const cachedCount = getCachedPixelCount(businessId);
        if (cachedCount !== null) {
            console.log(`💾 Usando count desde cache: ${cachedCount} píxeles`);
            pixelCount = cachedCount;
            successMethod = 'cache';
        } else {
            // Definir métodos en orden de preferencia
            const methods = [
                {
                    name: 'principal',
                    fn: () => getPixelCountForBM(businessId),
                    retries: 2
                },
                {
                    name: 'graphql',
                    fn: () => getPixelCountViaGraphQL(businessId),
                    retries: 2
                },
                {
                    name: 'acceso_directo',
                    fn: () => getPixelCountDirectAccess(businessId),
                    retries: 1
                },
                {
                    name: 'extension',
                    fn: () => getPixelCountViaExtension(businessId),
                    retries: 1
                }
            ];
            
            // Probar cada método hasta encontrar píxeles
            for (const method of methods) {
                if (pixelCount > 0) break;
                
                try {
                    console.log(`🔍 Probando método: ${method.name}`);
                    const result = await retryWithBackoff(method.fn, method.retries, 1500);
                    
                    if (result && result > 0) {
                        pixelCount = result;
                        successMethod = method.name;
                        console.log(`✅ Método ${method.name} exitoso: ${pixelCount} píxeles`);
                        
                        // Guardar en cache solo si encontramos píxeles
                        setCachedPixelCount(businessId, pixelCount);
                        break;
                    }
                } catch (error) {
                    console.warn(`⚠️ Método ${method.name} falló completamente:`, error.message);
                    continue;
                }
            }
        }
        
        // Validar el resultado final
        if (pixelCount < 0) {
            pixelCount = 0;
        }
        
        // Actualizar la grilla con el número de píxeles
        if (bmRowId !== null && bmRowId !== undefined && typeof accountGrid !== 'undefined') {
            try {
                const rowNode = accountGrid.api.getRowNode(bmRowId);
                if (rowNode) {
                    rowNode.setDataValue("pixelCount", pixelCount);
                    console.log(`📋 Grilla actualizada para BM ${businessId}: ${pixelCount} píxeles`);
                }
            } catch (gridError) {
                console.warn(`⚠️ Error actualizando grilla:`, gridError.message);
            }
        }
        
        // Disparar evento para notificar que se cargaron los píxeles
        try {
            $(document).trigger("loadPixelSuccess", { 
                id: businessId, 
                count: pixelCount, 
                method: successMethod,
                timestamp: Date.now()
            });
        } catch (eventError) {
            console.warn(`⚠️ Error disparando evento:`, eventError.message);
        }
        
        // Log del resultado final
        if (pixelCount > 0) {
            console.log(`🎯 BM ${businessId}: ${pixelCount} píxeles detectados usando ${successMethod}`);
        } else {
            console.log(`ℹ️ BM ${businessId}: No se encontraron píxeles usando ningún método`);
        }
        
        return pixelCount;
        
    } catch (error) {
        console.error(`❌ Error crítico cargando píxeles para BM ${businessId}:`, error);
        
        // En caso de error, mostrar 0 y actualizar grilla
        if (bmRowId !== null && bmRowId !== undefined && typeof accountGrid !== 'undefined') {
            try {
                const rowNode = accountGrid.api.getRowNode(bmRowId);
                if (rowNode) {
                    rowNode.setDataValue("pixelCount", 0);
                }
            } catch (gridError) {
                console.warn(`⚠️ Error actualizando grilla en catch:`, gridError.message);
            }
        }
        
        return 0;
    }
}

/**
 * createPixelViaExtension
 * Descripción: Crea un píxel usando la extensión de Chrome directamente
 * Parámetros: pixelData (object)
 * Retorna: Promise<object>
 */
async function createPixelViaExtension(pixelData) {
    try {
        console.log(`🔧 Intentando crear píxel via extensión: ${pixelData.name}`);
        
        // Usar la extensión para ejecutar código en la página de Facebook
        const result = await chrome.runtime.sendMessage(extId, {
            type: "executeScript",
            code: `
                (async function() {
                    try {
                        // Obtener tokens de la página actual
                        const business_id = '${pixelData.business_id}';
                        const pixelName = '${pixelData.name}';
                        const user_id = document.cookie.match(/c_user=(\\d+)/)?.[1] || require('CurrentUserInitialData').USER_ID;
                        const fb_dtsg = document.querySelector('[name="fb_dtsg"]')?.value || require('DTSGInitialData').token;
                        
                        if (!user_id || !fb_dtsg) {
                            throw new Error('No se pudieron obtener los tokens necesarios');
                        }
                        
                        // Crear el píxel
                        const response = await fetch('https://business.facebook.com/events_manager/dataset/create/', {
                            method: 'POST',
                            credentials: 'include',
                            headers: {
                                'content-type': 'application/x-www-form-urlencoded'
                            },
                            body: 'business_id=' + business_id + '&is_crm=false&name=' + encodeURIComponent(pixelName) + '&__user=' + user_id + '&fb_dtsg=' + encodeURIComponent(fb_dtsg) + '&__a=1'
                        });
                        
                        const text = await response.text();
                        const cleanText = text.replace(/^for \\(;;\\);/, '');
                        const data = JSON.parse(cleanText);
                        
                        if (data.payload?.id) {
                            return { success: true, pixelId: data.payload.id, name: pixelName };
                        }
                        
                        const idMatch = text.match(/"id":"(\\d{15,})"/);
                        if (idMatch) {
                            return { success: true, pixelId: idMatch[1], name: pixelName };
                        }
                        
                        throw new Error('No se pudo obtener el ID del píxel');
                        
                    } catch (error) {
                        return { success: false, error: error.message };
                    }
                })();
            `
        });
        
        return result;
        
    } catch (error) {
        console.error('Error en createPixelViaExtension:', error);
        return {
            success: false,
            error: error.message || 'Error crítico en extensión'
        };
    }
}

/**
 * createRealPixel
 * Descripción: Crea un píxel real de Facebook usando la API nativa
 * Parámetros: pixelData (object)
 * Retorna: Promise<object>
 */
async function createRealPixel(pixelData) {
    try {
        // Intentar primero con la clase FacebookPixelCreator
        const creator = new FacebookPixelCreator(pixelData.business_id);
        const result = await creator.createPixel(pixelData.name);
        
        if (result.success) {
            return {
                success: true,
                pixelId: result.pixelId,
                name: result.name
            };
        } else {
            return {
                success: false,
                error: result.error || 'Error desconocido al crear píxel'
            };
        }
    } catch (error) {
        console.error('Error en createRealPixel:', error);
        console.log('🔄 Intentando método alternativo via extensión...');
        
        // Si falla, intentar con el método alternativo
        try {
            return await createPixelViaExtension(pixelData);
        } catch (fallbackError) {
            console.error('Error en método alternativo:', fallbackError);
            return {
                success: false,
                error: `Error principal: ${error.message}. Error alternativo: ${fallbackError.message}`
            };
        }
    }
}

/**
 * handleCreatePixelProcess
 * Descripción: Maneja el proceso completo de creación de píxeles para los BM seleccionados
 */
async function handleCreatePixelProcess() {
    try {
        // Obtener configuración del formulario
        const pixelName = $('[name="pixelName"]').val().trim();
        const pixelQuantity = parseInt($('[name="pixelQuantity"]').val()) || 1;
        const enableAutomaticMatching = $('[name="enableAutomaticMatching"]').is(':checked');
        const enableFirstPartyCookies = $('[name="enableFirstPartyCookies"]').is(':checked');

        // Validaciones
        if (!pixelName) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor ingrese un nombre para el píxel'
            });
            return;
        }

        // Verificar que estemos en el contexto correcto
        if (typeof fetch2 !== 'function' && typeof chrome === 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Extensión requerida',
                html: 'Para crear píxeles reales necesitas:<br>1. Tener la extensión DivinAds instalada<br>2. Estar en una pestaña de Facebook Business Manager<br>3. Haber iniciado sesión en Facebook',
                confirmButtonText: 'Entendido'
            });
            return;
        }

        if (pixelQuantity < 1 || pixelQuantity > 10) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cantidad de píxeles debe estar entre 1 y 10'
            });
            return;
        }

        // Obtener BM seleccionados
        const selectedBMs = accountGrid.api.getSelectedRows();
        
        if (selectedBMs.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'Por favor seleccione al menos un Business Manager'
            });
            return;
        }

        // Mostrar área de progreso
        $('#pixelProgressArea').show();
        $('#pixelResults').hide();
        $('#pixelProgressMessages').html(`
            <div class="text-info">🚀 Iniciando proceso de creación de píxeles REALES de Facebook...</div>
            <div class="text-muted" style="font-size: 0.9em; margin-top: 5px;">
                ℹ️ Los píxeles se crearán usando la API oficial de Facebook Business Manager
            </div>
        `);

        const allSuccessResults = [];
        const allErrorResults = [];

        // Procesar cada BM seleccionado
        for (let i = 0; i < selectedBMs.length; i++) {
            const bm = selectedBMs[i];
            
            // Actualizar progreso
            const progressMsg = `<div class="text-primary">📋 Procesando BM ${i + 1}/${selectedBMs.length}: ${bm.name} (${bm.bmId})</div>`;
            $('#pixelProgressMessages').append(progressMsg);
            $('#pixelProgressMessages').scrollTop($('#pixelProgressMessages')[0].scrollHeight);

            try {
                // Crear píxeles para este BM
                const results = await createPixelForBM(bm.bmId, pixelName, pixelQuantity, {
                    enableAutomaticMatching,
                    enableFirstPartyCookies
                });

                // Agregar resultados
                allSuccessResults.push(...results.success);
                allErrorResults.push(...results.errors);

                // Mostrar resultados de este BM
                if (results.success.length > 0) {
                    const successMsg = `<div class="text-success">✅ ${results.success.length} píxel(es) REAL(es) creado(s) exitosamente para ${bm.name}</div>`;
                    $('#pixelProgressMessages').append(successMsg);
                    
                    // Mostrar IDs de píxeles creados
                    results.success.forEach(pixel => {
                        const pixelMsg = `<div class="text-success" style="margin-left: 20px; font-size: 0.9em;">🎯 ${pixel.pixelName} → ID: ${pixel.pixelId}</div>`;
                        $('#pixelProgressMessages').append(pixelMsg);
                    });
                }

                if (results.errors.length > 0) {
                    const errorMsg = `<div class="text-danger">❌ ${results.errors.length} error(es) en ${bm.name}</div>`;
                    $('#pixelProgressMessages').append(errorMsg);
                    
                    // Mostrar detalles de errores
                    results.errors.forEach(error => {
                        const errorDetailMsg = `<div class="text-danger" style="margin-left: 20px; font-size: 0.9em;">⚠️ ${error.pixelName || error.bmId}: ${error.error}</div>`;
                        $('#pixelProgressMessages').append(errorDetailMsg);
                    });
                }

            } catch (error) {
                const errorMsg = `<div class="text-danger">✗ Error crítico en ${bm.name}: ${error.message}</div>`;
                $('#pixelProgressMessages').append(errorMsg);
                allErrorResults.push({
                    bmId: bm.bmId,
                    bmName: bm.name,
                    error: error.message
                });
            }

            $('#pixelProgressMessages').scrollTop($('#pixelProgressMessages')[0].scrollHeight);

            // Delay entre BMs para evitar rate limiting (más conservador)
            if (i < selectedBMs.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 4000 + Math.random() * 2000));
            }
        }

        // Mostrar resultados finales
        $('#pixelProgressMessages').append('<div class="text-info mt-2"><strong>🏁 Proceso de creación de píxeles REALES completado</strong></div>');
        
        // Actualizar contadores y áreas de resultados
        $('#pixelSuccessCount').text(allSuccessResults.length);
        $('#pixelErrorCount').text(allErrorResults.length);

        // Formatear resultados para mostrar en textareas
        const successText = allSuccessResults.map(result => 
            `BM: ${result.bmId} | Píxel: ${result.pixelName} | ID: ${result.pixelId}`
        ).join('\n');

        const errorText = allErrorResults.map(error => 
            `BM: ${error.bmId} | Error: ${error.error}`
        ).join('\n');

        $('[name="pixelSuccessResults"]').val(successText);
        $('[name="pixelErrorResults"]').val(errorText);

        $('#pixelResults').show();

        // Mostrar notificación final
        if (allSuccessResults.length > 0 && allErrorResults.length === 0) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: `Se crearon ${allSuccessResults.length} píxel(es) exitosamente`
            });
        } else if (allSuccessResults.length > 0 && allErrorResults.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Proceso completado con errores',
                text: `${allSuccessResults.length} píxel(es) creado(s), ${allErrorResults.length} error(es)`
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo crear ningún píxel. Revise los errores.'
            });
        }

    } catch (error) {
        console.error('Error en handleCreatePixelProcess:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error crítico',
            text: 'Ocurrió un error inesperado durante el proceso'
        });
    }
}