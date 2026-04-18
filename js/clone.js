// Filtrar mensajes de licencia de AG Grid Enterprise
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
    field: "id",
    headerName: "#",
    hide: true
  }, {
    field: "status",
    headerName: "Estado",
    filter: "agSetColumnFilter",
    cellRenderer: params => {
      let statusHtml = "";
      if (params.data.status === 0) {
        statusHtml = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">LIVE</strong></span>";
      }
      if (params.data.status === 1) {
        statusHtml = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">DIE</strong></span>";
      }
      return statusHtml;
    }
  }, {
    field: "name",
    headerName: "Cuenta",
    minWidth: 250,
    cellRenderer: params => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <img class=\"rounded-circle\" src=\"" + (params.data.avatar ? params.data.avatar : "../img/avatar.jpg") + "\" height=\"30\">\n                    <a href=\"https://facebook.com/profile.php?id=" + params.data.uid + "\" target=\"_BLANK\" class=\"ps-3 flex-grow-1 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + (params.data.name ? params.data.name : "Unknown") + "</strong>\n                        <span>" + params.data.uid + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "account",
    headerName: "Cuenta"
  }, {
    field: "uid",
    headerName: "UID",
    suppressFiltersToolPanel: true
  }, {
    field: "password",
    headerName: "Contraseña",
    suppressFiltersToolPanel: true
  }, {
    field: "twofa",
    headerName: "2FA",
    suppressFiltersToolPanel: true
  }, {
    field: "email",
    headerName: "Email",
    suppressFiltersToolPanel: true
  }, {
    field: "passMail",
    headerName: "Contraseña Email",
    suppressFiltersToolPanel: true
  }, {
    field: "recoverEmail",
    headerName: "Email de recuperación",
    suppressFiltersToolPanel: true
  }, {
    field: "cookie",
    headerName: "Cookie"
  }, {
    field: "bm",
    headerName: "BM",
    cellRenderer: params => {
      let bmHtml = "";
      if (params.data.bm && params.data.bm != 0) {
        bmHtml = "\n                    <button type=\"button\" data-type=\"viewBm\" data-id=\"" + params.data.uid + "\" class=\"viewDataButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-briefcase-line me-1\"></i><strong>BM: <span class=\"count\">" + params.data.bm + "</span></strong></button>\n                ";
      }
      return bmHtml;
    }
  }, {
    field: "tkqc",
    headerName: "Cuenta Ads",
    cellRenderer: params => {
      let tkqcHtml = "";
      if (params.data.tkqc && params.data.tkqc != 0) {
        tkqcHtml = "\n                    <button type=\"button\" data-type=\"viewAds\" data-id=\"" + params.data.uid + "\" class=\"viewDataButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-megaphone-line me-1\"></i><strong>Cuenta Ads: <span class=\"count\">" + params.data.tkqc + "</span></strong></button>\n                ";
      }
      return tkqcHtml;
    }
  }, {
    field: "page",
    headerName: "Página",
    cellRenderer: params => {
      let pageHtml = "";
      if (params.data.page && params.data.page != 0) {
        pageHtml = "\n                    <button type=\"button\" data-type=\"viewPage\" data-id=\"" + params.data.uid + "\" class=\"viewDataButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-flag-line me-1\"></i><strong>Página: <span class=\"count\">" + params.data.page + "</span></strong></button>\n                ";
      }
      return pageHtml;
    }
  }, {
    field: "dob",
    headerName: "Fecha de nacimiento"
  }, {
    field: "gender",
    headerName: "Género",
    cellRenderer: params => {
      let genderHtml = "";
      if (params.data.gender === "male") {
        genderHtml = "Hombre";
      } else if (params.data.gender === "female") {
        genderHtml = "Mujer";
      }
      return genderHtml;
    }
  }, {
    field: "friends",
    headerName: "Amigos"
  }, {
    field: "action",
    headerName: "Acción",
    minWidth: 200,
    cellRenderer: params => {
      let actionHtml = "";
      if (params.data.action === "active") {
        actionHtml = "\n                    <button type=\"button\" class=\"btn btn-success btn-sm p-0 px-2\"><i class=\"ri-checkbox-blank-circle-fill me-1\"></i>Activo</button>\n                    <button type=\"button\" id=\"logoutBtn\" class=\"ms-1 btn bg-dark-subtle btn-sm p-0 px-1\"><i class=\"ri-logout-box-r-line\"></i>\n                    </button>\n                ";
      } else {
        actionHtml = "\n                    <button type=\"button\" data-id=\"" + params.data.id + "\" class=\"loginButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-lock-line me-1\"></i>Iniciar sesión</button>\n                ";
      }
      return actionHtml;
    }
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
    /**
     * getRowId
     * Descripción: Retorna el identificador único de una fila para agGrid.
     * Parámetros: p12 (objeto con propiedad data)
     * Retorna: id de la fila
     */
    getRowId: function (params) {
      return params.data.id;
    },
    onFirstDataRendered: function (event) {
      countStatus(event);
    },
    onRangeSelectionChanged: function (event) {
      const cellRanges = event.api.getCellRanges();
      if (cellRanges.length) {
        let rangeCount = 0;
        if (cellRanges[0].startRow.rowIndex < cellRanges[0].endRow.rowIndex) {
          rangeCount = cellRanges[0].endRow.rowIndex - (cellRanges[0].startRow.rowIndex - 1);
        } else {
          rangeCount = cellRanges[0].startRow.rowIndex - (cellRanges[0].endRow.rowIndex - 1);
        }
        $("#boiden").text(rangeCount);
      } else {
        $("#boiden").text(0);
      }
    },
    onSelectionChanged: function (event) {
      const selectedRows = event.api.getSelectedRows();
      $("#dachon").text(selectedRows.length);
    },
    onRowDataUpdated: function (event) {
      $("#tong").text(event.api.getDisplayedRowCount());
    },
    onFilterChanged: function (event) {
      $("#tong").text(event.api.getDisplayedRowCount());
    },
    rowClassRules: {
      running: function (params) {
        return params.data.status === "RUNNING";
      },
      finished: function (params) {
        return params.data.status === "FINISHED";
      }
    },
    onBodyScroll: function (event) {
      scrolling = true;
    },
    onBodyScrollEnd: function (event) {
      scrolling = false;
    }
  };
  $("#accounts").on("contextmenu", function (event) {
    event.preventDefault();
    const menuHeight = parseInt($("#contextMenu > ul").outerHeight());
    const bodyHeight = parseInt($("body").outerHeight());
    if (event.pageY + menuHeight > bodyHeight) {
      $("#contextMenu").addClass("open").css({
        top: event.pageY - menuHeight + "px",
        left: event.pageX + "px"
      });
    } else {
      $("#contextMenu").addClass("open").css({
        top: event.pageY + "px",
        left: event.pageX + "px"
      });
    }
  });
  $(document).click(() => {
    $("#contextMenu").removeClass("open").css({
      top: "-999px",
      left: "-999px"
    });
  });
  /**
   * Evento ready principal
   * Descripción: Inicializa la grilla de clones, carga datos desde localStorage, configura eventos y sincronización periódica.
   */
  $(document).ready(async function () {
    const gridContainer = document.querySelector("#accounts");
    new agGrid.Grid(gridContainer, accountGrid);
    const savedColumnState = (await getLocalStorage("stateClone")) || [];
    const columnStateConfig = {
      state: savedColumnState,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(columnStateConfig);
    const maxWaitMs = 30000;
    const pollMs = 500;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      try {
        if ($("body").hasClass("data-loaded")) {
          const rowDataArray = [];
          const cloneList = (await getLocalStorage("dataClone")) || [];
          for (let i = 0; i < cloneList.length; i++) {
            const clone = cloneList[i];
            clone.action = false;
            const cookie = await getCookie();
            let currentUserId = "";
            try {
              const cUserMatch = cookie.match(/c_user=([^;]+)/);
              currentUserId = cUserMatch ? cUserMatch[1] : "";
            } catch {}
            const userInfo = await getLocalStorage("userInfo_" + clone.uid);
            const adsData = (await getLocalStorage("dataAds_" + clone.uid)) || [];
            const bmData = (await getLocalStorage("dataBm_" + clone.uid)) || [];
            const pageData = (await getLocalStorage("dataPage_" + clone.uid)) || [];
            clone.tkqc = Array.isArray(adsData) ? adsData.length : 0;
            clone.bm = Array.isArray(bmData) ? bmData.length : 0;
            clone.page = Array.isArray(pageData) ? pageData.length : 0;
            if (clone.uid === currentUserId) {
              clone.action = "active";
            }
            if (userInfo && clone.uid === userInfo.id) {
              clone.dob = userInfo.birthday;
              clone.gender = userInfo.gender;
              clone.friends = userInfo.friends;
              clone.name = userInfo.name;
              clone.avatar = userInfo.picture?.data?.url || "";
            }
            rowDataArray.push(clone);
          }
          accountGrid.api.setRowData(rowDataArray);
          accountGrid.columnApi.autoSizeColumns(["name", "action", "bm", "tkqc", "page"]);
          break;
        }
      } catch (err) {
        console.log(err);
      }
      await delayTime(pollMs);
    }
    setInterval(async () => {
      if ($("body").hasClass("setting-loaded")) {
        saveSetting();
      }
      if ($("body").hasClass("data-loaded")) {
        const allNodes = [];
        accountGrid.api.forEachNode(function (node) {
          allNodes.push(node.data);
        });
        if (allNodes.length > 0) {
          await setLocalStorage("dataClone", allNodes);
        }
        const currentColumnState = accountGrid.columnApi.getColumnState();
        await setLocalStorage("stateClone", currentColumnState);
      }
    }, 2000);
  });
  /**
   * countStatus
   * Descripción: Cuenta la cantidad de clones por cada estado y actualiza los contadores en la interfaz.
   * Parámetros: p24 (objeto agGrid)
   */
  function countStatus(gridEvent) {
    let liveCount = 0;
    let dieCount = 0;
    gridEvent.api.forEachNode(node => {
      if (node.data.status === 0) {
        liveCount++;
      }
      if (node.data.status === 1) {
        dieCount++;
      }
    });
    $(".status0Count").text(liveCount);
    $(".status1Count").text(dieCount);
  }
  /**
   * Evento click viewDataButton
   * Descripción: Muestra un modal con los datos detallados del clon seleccionado.
   */
  $(document).on("click", ".viewDataButton", function () {
    const v24 = $(this).attr("data-type");
    const v25 = $(this).attr("data-title");
    const v26 = $(this).find(".count").text();
    const v27 = $(this).attr("data-id");
    $("#viewDataModal iframe").attr("src", v24 + "?id=" + v27);
    $("#viewDataModal").modal("show");
  });
  /**
   * Evento click deleteSelect
   * Descripción: Elimina los clones seleccionados y sus datos asociados tras confirmación.
   */
  $("#deleteSelect").click(function () {
    Swal.fire({
      title: "¿Estás seguro que deseas eliminar?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar"
    }).then(async result => {
      if (result.isConfirmed) {
        const selectedRows = getSelectedRows();
        const renderedNodes = accountGrid.api.getRenderedNodes();
        if (selectedRows.length === renderedNodes.length) {
          await removeLocalStorage("dataClone");
          await clearLocalStorage();
        }
        for (let i = 0; i < selectedRows.length; i++) {
          const row = selectedRows[i];
          await removeLocalStorage("dataAds_" + row.uid);
          await removeLocalStorage("dataBm_" + row.uid);
          await removeLocalStorage("dataPage_" + row.uid);
          await removeLocalStorage("userInfo_" + row.uid);
        }
        const transaction = {
          remove: selectedRows
        };
        accountGrid.api.applyTransaction(transaction);
      }
    });
  });
  /**
   * Evento click importClone
   * Descripción: Muestra un modal para importar una lista de clones y los agrega a la grilla.
   */
  $("#importClone").click(function () {
    Swal.fire({
      title: "Importar Data",
      html: "\n            <div class=\"p-1\">\n                <textarea id=\"viaData\" class=\"form-control mb-3\" rows=\"10\" placeholder=\"Ingresa la lista de Clones\"></textarea>\n            </div>\n        ",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Importar",
      confirmButtonColor: "#4267B2",
      showLoaderOnConfirm: true,
      width: 600,
      preConfirm: async p27 => {
        const v30 = $("#viaData").val();
        if (v30) {
          pasteData(v30);
        } else {
          Swal.showValidationMessage("Por favor ingresa la lista de Clones");
        }
        return true;
      }
    });
  });
  /**
   * pasteData
   * Descripción: Procesa y agrega datos de clones desde un texto pegado o importado.
   * Parámetros: p28 (string con datos de clones)
   */
  function pasteData(rawData) {
    if (rawData.length > 0) {
      accountGrid.api.clearRangeSelection();
      const lines = rawData.split(/\r?\n|\r|\n/g);
      const existingRows = [];
      const newRows = [];
      const duplicateRows = [];
      let nextId = 0;
      accountGrid.api.forEachNode(node => {
        existingRows.push(node.data);
        nextId++;
      });
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        let line = lines[lineIndex];
        if (line.includes("c_user") && !line.includes("|")) {
          const cUserParts = line.split(";").filter(part => {
            return part.includes("c_user");
          }).map(part => {
            return part.trim().replace("c_user=", "");
          });
          line = cUserParts[0] + "||||" + line;
        }
        if (line.includes("csrftoken") && !line.includes("|")) {
          line = "|||" + line;
        }
        const fields = line.split("|");
        if (fields.length > 1) {
          let cookieField = "";
          let emailField = "";
          let emailPassField = "";
          let recoverEmailField = "";
          let tokenField = "";
          let twoFaField = "";
          let emailComboField = "";
          let cookieIdx = fields.findIndex(part => {
            return part.includes("c_user=");
          });
          let mailIdx = fields.findIndex(part => {
            return part.match(/@outlook|@hotmail|@gmail|@yahoo/g);
          });
          let tempMailIdx = fields.findIndex(part => {
            return part.match(/@getnada.com|@abyssmail.com|@dropjar.com|@getairmail.com|@givmail.com|@inboxbear.com|@robot-mail.com|@tafmail.com|@vomoto.com|fviainboxes.com|fviadropinbox.com|fviamail.work|dropinboxes.com/g);
          });
          const twoFaIdx = fields.findIndex(part => {
            return part.replace(/\s/g, "").length === 32 && !part.includes("@");
          });
          if (twoFaIdx !== -1) {
            twoFaField = fields[twoFaIdx];
          }
          const tokenIdx = fields.findIndex(part => {
            return part.startsWith("EAA");
          });
          if (cookieIdx !== -1) {
            cookieField = fields[cookieIdx];
          }
          if (mailIdx !== -1) {
            emailPassField = fields[mailIdx + 1];
            emailField = fields[mailIdx];
          }
          if (tempMailIdx !== -1) {
            recoverEmailField = fields[tempMailIdx];
          }
          if (tokenIdx !== -1) {
            tokenField = fields[tokenIdx];
          }
          if (emailField && emailPassField) {
            emailComboField = emailField + "|" + emailPassField;
          }
          const cloneEntry = {
            id: nextId,
            account: line,
            uid: fields[0],
            password: fields[1],
            twofa: twoFaField,
            oldEmail: emailComboField,
            token: tokenField,
            cookie: cookieField,
            email: emailField,
            passMail: emailPassField,
            recoverEmail: recoverEmailField
          };
          const cloneEntryCopy = cloneEntry;
          const matched = existingRows.filter(row => {
            return row.uid === fields[0];
          });
          if (matched[0]) {
            duplicateRows.push(cloneEntryCopy);
          } else {
            newRows.push(cloneEntryCopy);
          }
        }
        nextId++;
      }
      if (duplicateRows.length) {
        Swal.fire({
          width: 700,
          icon: "warning",
          input: "textarea",
          title: "Advertencia",
          text: "Los siguientes datos ya existen, ¿estás seguro que deseas agregarlos?",
          inputValue: duplicateRows.map(row => {
            return row.account;
          }).join("\r\n"),
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: "Agregar igual",
          cancelButtonText: "Omitir",
          inputAttributes: {
            rows: 10,
            style: "height: inherit!important"
          }
        }).then(result => {
          if (result.isConfirmed) {
            const combined = newRows.length ? newRows.concat(duplicateRows) : duplicateRows;
            accountGrid.api.setRowData(existingRows.concat(combined));
          } else if (newRows.length) {
            accountGrid.api.setRowData(existingRows.concat(newRows));
          }
        });
      } else if (newRows.length) {
        accountGrid.api.setRowData(existingRows.concat(newRows));
      }
    }
  }
  /**
   * Evento click pasteData
   * Descripción: Pega datos de clones desde el portapapeles y los agrega a la grilla.
   */
  $("#pasteData").click(async function () {
    const v42 = (await navigator.clipboard.readText()) ?? "";
    pasteData(v42);
  });
  /**
   * Evento click selectRange
   * Descripción: Selecciona un rango de filas en la grilla de clones.
   */
  $("#selectRange").click(async function () {
    const cellRanges = accountGrid.api.getCellRanges();
    let startRow;
    let endRow;
    if (cellRanges[0].startRow.rowIndex < cellRanges[0].endRow.rowIndex) {
      startRow = cellRanges[0].startRow.rowIndex;
      endRow = cellRanges[0].endRow.rowIndex;
    } else {
      endRow = cellRanges[0].startRow.rowIndex;
      startRow = cellRanges[0].endRow.rowIndex;
    }
    accountGrid.api.deselectAll();
    accountGrid.api.forEachNode(function (node) {
      if (node.rowIndex >= startRow && node.rowIndex <= endRow) {
        node.setSelected(true);
      }
    });
  });
  /**
   * Evento click checkLive
   * Descripción: Verifica el estado de las cuentas seleccionadas y actualiza su estado en la grilla.
   */
  $("#checkLive").click(async function () {
    const swalPromise = Swal.fire({
      title: "Verificando estado de las cuentas",
      html: "<span id=\"checkProgress\">Por favor espera...</span>",
      showDenyButton: true,
      denyButtonText: "Detener",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      preDeny: () => {
        $(document).trigger("stop");
      }
    });
    const selectedRows = accountGrid.api.getSelectedRows();
    let stopped = false;
    for (let i = 0; i < selectedRows.length; i++) {
      if (stopped) {
        break;
      }
      const row = selectedRows[i];
      try {
        await checkLive(row.uid);
        accountGrid.api.getRowNode(row.id).setDataValue("status", 0);
      } catch {
        accountGrid.api.getRowNode(row.id).setDataValue("status", 1);
      }
    }
    $(document).on("stop", function (event) {
      stopped = true;
    });
    swalPromise.close();
  });