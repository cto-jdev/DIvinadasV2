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
    p42.forEach(p43 => {
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