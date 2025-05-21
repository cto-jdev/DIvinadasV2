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
  $(document).ready(async function () {
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
  });
  $("body").on("click", ".phoiItem", function () {
    const v20 = $(this).attr("data-file");
    $(".phoiItem").removeClass("active");
    $(this).addClass("active");
    $("[name=\"phoiId\"]").val(v20);
    $("#phoiControl").removeClass("d-none").addClass("d-flex");
  });
  $("#editPhoi").click(function () {
    const v21 = $(".phoiItem.active").attr("data-file");
    window.open("/phoi?id=" + v21, "_blank").focus();
  });
  $("#deletePhoi").click(function () {
    Swal.fire({
      title: "¿Estás seguro que deseas eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning", 
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    }).then(async p20 => {
      if (p20.isConfirmed) {
        const v22 = $(".phoiItem.active").attr("data-file");
        const v23 = $("[name=\"phoiId\"]").val();
        if (v23 === v22) {
          $("[name=\"phoiId\"]").val("");
        }
        await removeLocalStorage(v22);
        loadPhoi();
      }
    });
  });
  $("#phoiModal").on("show.bs.modal", async function (p21) {
    loadPhoi();
  });
  async function loadPhoi() {
    const v24 = await getAllLocalStore();
    const v25 = Object.keys(v24).filter(p22 => p22.includes("phoi_")).map(p23 => {
      const vO20 = {
        id: p23,
        ...v24[p23]
      };
      return vO20;
    });
    const v26 = $("[name=\"phoiId\"]").val();
    if (v26) {
      $("#phoiControl").removeClass("d-none").addClass("d-flex");
    } else {
      $("#phoiControl").addClass("d-none");
    }
    $("#phoiList").html("");
    let vLSdivClassrow = "<div class=\"row\">";
    v25.forEach((p24, p25) => {
      vLSdivClassrow += "\n            <div class=\"col-3 mb-3\">\n                <div class=\"phoiItem " + (p24.id === v26 ? "active" : "") + " d-block p-3 border rounded\" data-file=\"" + p24.id + "\">\n                    <i class=\"ri-checkbox-circle-fill fs-4 text-success\"></i>\n                    <div class=\"ratio ratio-4x3\">\n                        <img class=\"object-fit-contain w-100 h-100\" src=\"" + p24.src + "\">\n                    </div>\n                    <div class=\"d-flex\">\n                        <span class=\"fw-medium\">" + p24.name + "</span>\n                    </div>\n                </div>\n            </div>\n        ";
    });
    vLSdivClassrow += "</div>";
    $("#phoiList").html(vLSdivClassrow);
  }
  $("[name=\"backUpEmail\"]").on("input", function () {
    const v27 = $("[name=\"backUpEmail\"]").val().split(/\r?\n|\r|\n/g).filter(p26 => p26);
    $("#backupEmailCount").text(v27.length);
  });
  $("[name=\"linkDaNhan\"]").on("input", function () {
    const v28 = $("[name=\"linkDaNhan\"]").val().split(/\r?\n|\r|\n/g).filter(p27 => p27);
    $("#backupLinkCount1").text(v28.length);
  });
  $("[name=\"backupLink\"]").on("input", function () {
    const v29 = $("[name=\"backupLink\"]").val().split(/\r?\n|\r|\n/g).filter(p28 => p28);
    $("#backupLinkCount").text(v29.length);
  });
  $("[name=\"backupLinkSuccess\"]").on("input", function () {
    const v30 = $("[name=\"backupLinkSuccess\"]").val().split(/\r?\n|\r|\n/g).filter(p29 => p29);
    $("#backupLinkSuccessCount").text(v30.length);
  });
  $("[name=\"backupLinkError\"]").on("input", function () {
    const v31 = $("[name=\"backupLinkError\"]").val().split(/\r?\n|\r|\n/g).filter(p30 => p30);
    $("#backupLinkErrorCount").text(v31.length);
  });
  $(document).on("loadSavedBm", function (p31, p32) {
    p32 = p32.map(p33 => {
      p33.process = "";
      return p33;
    });
    accountGrid.api.setRowData(p32);
  });
  const bmMap = [];
  $(document).on("loadBmSuccess3", function (p34, p35) {
    let vLN1 = 1;
    p35 = p35.map(p36 => {
      const vO21 = {
        id: vLN1,
        bmId: p36.id
      };
      bmMap.push(vO21);
      p36 = {
        id: vLN1,
        status: p36.allow_page_management_in_www ? "LIVE" : "DIE",
        bmId: p36.id,
        name: p36.name,
        avatar: "img/avatar.jpg"
      };
      vLN1++;
      return p36;
    });
    accountGrid.api.setRowData(p35);
  });
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
  $(document).on("loadBmSuccess4", function (p40, p41) {
    for (let vLN03 = 0; vLN03 < p41.length; vLN03++) {
      const v32 = bmMap.filter(p42 => p42.bmId == p41[vLN03].businessID)[0].id;
      accountGrid.api.getRowNode(v32).setDataValue("bmPage", p41[vLN03].pageNumber);
    }
  });
  $(document).on("loadBmSuccess2", function (p43, p44) {
    p44.forEach(p45 => {
      const v33 = bmMap.filter(p46 => p46.bmId == p45.id)[0].id;
      let vLS2 = "";
      let v34 = p45.permitted_roles[0];
      if (p45.sharing_eligibility_status === "enabled") {
        vLS2 = "BM350";
      }
      if (p45.sharing_eligibility_status === "disabled_due_to_trust_tier") {
        vLS2 = "BM50";
      }
      if (p45.owned_ad_accounts?.data.length) {
        const v35 = p45.owned_ad_accounts?.data.filter(p47 => p47.account_status == 1);
        const v36 = p45.owned_ad_accounts?.data.filter(p48 => p48.account_status != 1);
        accountGrid.api.getRowNode(v33).setDataValue("adAccount", "Total: " + p45.owned_ad_accounts.summary.total_count + " - " + (v35.length ? "Activas: " + v35.length + " - " : "") + (v36.length ? "Muertas: " + v36.length : ""));
        const v37 = p45.owned_ad_accounts?.data[0].adtrust_dsl;
        const v38 = p45.owned_ad_accounts?.data[0].currency;
        accountGrid.api.getRowNode(v33).setDataValue("limit", v37);
        accountGrid.api.getRowNode(v33).setDataValue("currency", v38);
      } else {
        accountGrid.api.getRowNode(v33).setDataValue("adAccount", 0);
      }
      if (p45.business_users?.data.length) {
        accountGrid.api.getRowNode(v33).setDataValue("adminAccount", p45.business_users?.data.length);
      } else {
        accountGrid.api.getRowNode(v33).setDataValue("adminAccount", 0);
      }
      accountGrid.api.getRowNode(v33).setDataValue("type", vLS2);
      accountGrid.api.getRowNode(v33).setDataValue("role", v34);
    });
    accountGrid.api.refreshCells({
      force: true
    });
  });
  $(document).on("loadInstaSuccess", function (p49, p50) {
    const v39 = bmMap.filter(p51 => p51.bmId == p50.id)[0].id;
    accountGrid.api.getRowNode(v39).setDataValue("instaAccount", p50.count);
  });
  $(document).on("loadLimitSuccess", function (p52, p53) {
    const v40 = bmMap.filter(p54 => p54.bmId == p53.id)[0].id;
    accountGrid.api.getRowNode(v40).setDataValue("bmType", p53.type);
  });
  $(document).on("loadQtvSuccess", function (p55, p56) {
    const v41 = bmMap.filter(p57 => p57.bmId == p56.id)[0].id;
    accountGrid.api.getRowNode(v41).setDataValue("adminAccount", p56.count);
  });
  $(document).on("updateListBm", function (p58, p59) {
    $("[name=\"listIdBm\"]").val(p59.join("\r\n"));
    $("#getBmIdCount").text(p59.length);
  });
  $(document).on("updateBackupLink", function (p60, p61) {
    const v42 = $("[name=\"linkDaNhan\"]").val().split(/\r?\n|\r|\n/g).filter(p62 => p62);
    v42.push(p61.link);
    $("[name=\"linkDaNhan\"]").val(v42.join("\r\n"));
    $("#backupLinkCount1").text(v42.length);
  });
  $(document).on("updateLinkAll", function (p63, p64) {
    const v43 = $("[name=\"backupLink\"]").val().split(/\r?\n|\r|\n/g).filter(p65 => p65 && !p64.includes(p65));
    $("#backupLinkCount").text(v43.length);
    $("[name=\"backupLink\"]").val(v43.join("\r\n"));
  });
  $(document).on("updateLinkError", function (p66, p67) {
    const v44 = $("[name=\"backupLinkError\"]").val().split(/\r?\n|\r|\n/g).filter(p68 => p68);
    p67.forEach(p69 => {
      v44.push(p69);
    });
    $("#backupLinkErrorCount").text(v44.length);
    $("[name=\"backupLinkError\"]").val(v44.join("\r\n"));
  });
  $(document).on("updateLinkSuccess", function (p70, p71) {
    const v45 = $("[name=\"backupLinkSuccess\"]").val().split(/\r?\n|\r|\n/g).filter(p72 => p72);
    p71.forEach(p73 => {
      v45.push(p73);
    });
    $("#backupLinkSuccessCount").text(v45.length);
    $("[name=\"backupLinkSuccess\"]").val(v45.join("\r\n"));
  });
  $(document).on("updateBmName", function (p74, p75) {
    accountGrid.api.getRowNode(parseInt(p75.id)).setDataValue("name", p75.name);
  });
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