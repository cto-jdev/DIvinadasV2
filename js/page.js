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
      if (p5.data.status === 1) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">HCVV</strong></span>";
      }
      if (p5.data.status === 2) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">Necesita Apelación</strong></span>";
      }
      if (p5.data.status === 3) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-info\">En Apelación</strong></span>";
      }
      if (p5.data.status === 4) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">Activo</strong></span>";
      }
      if (p5.data.status === 5) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-primary rounded-circle me-2\"></span><strong class=\"text-primary\">XMDT</strong></span>";
      }
      if (p5.data.status === 6) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-secondary rounded-circle me-2\"></span><strong class=\"text-secondary\">Página en Apelación</strong></span>";
      }
      return vLS;
    }
  }, {
    field: "name",
    headerName: "Nombre",
    minWidth: 250,
    cellRenderer: p6 => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <img src=\"" + p6.data.avatar + "\" height=\"30\" class=\"rounded-circle\">\n                    <a href=\"https://www.facebook.com/profile.php?id=" + p6.data.pageId + "\" target=\"_BLANK\" class=\"ps-3 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + p6.data.name + "</strong>\n                        <span>" + p6.data.pageId + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "id",
    hide: true
  }, {
    field: "pageId",
    headerName: "ID de Página"
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
    field: "pageId2",
    hide: true
  }, {
    field: "role",
    headerName: "Rol"
  }, {
    field: "bm",
    headerName: "BM"
  }, {
    field: "createdDate",
    headerName: "Fecha de Creación"
  }, {
    field: "like",
    headerName: "Me gusta"
  }, {
    field: "follow",
    headerName: "Seguidores"
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
     * Parámetros: p8 (objeto con propiedad data)
     * Retorna: id de la fila
     */
    getRowId: function (p8) {
      return p8.data.id;
    },
    /**
     * onFirstDataRendered
     * Descripción: Llama a countStatus cuando los datos se renderizan por primera vez en la grilla.
     * Parámetros: p9 (evento de agGrid)
     */
    onFirstDataRendered: function (p9) {
      countStatus(p9, 0);
    },
    /**
     * onRangeSelectionChanged
     * Descripción: Actualiza el contador de filas seleccionadas en un rango.
     * Parámetros: p10 (evento de selección de rango de agGrid)
     */
    onRangeSelectionChanged: function (p10) {
      const v12 = p10.api.getCellRanges();
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
    /**
     * onSelectionChanged
     * Descripción: Actualiza el contador de filas seleccionadas.
     * Parámetros: p11 (evento de selección de agGrid)
     */
    onSelectionChanged: function (p11) {
      const v13 = p11.api.getSelectedRows();
      $("#dachon").text(v13.length);
    },
    /**
     * onRowDataUpdated
     * Descripción: Actualiza el contador total de filas mostradas en la grilla.
     * Parámetros: p12 (evento de actualización de datos de agGrid)
     */
    onRowDataUpdated: function (p12) {
      $("#tong").text(p12.api.getDisplayedRowCount());
    },
    /**
     * onFilterChanged
     * Descripción: Actualiza el contador total de filas mostradas tras aplicar un filtro.
     * Parámetros: p13 (evento de filtrado de agGrid)
     */
    onFilterChanged: function (p13) {
      $("#tong").text(p13.api.getDisplayedRowCount());
    },
    rowClassRules: {
      /**
       * running
       * Descripción: Devuelve true si el estado de la fila es "RUNNING" para aplicar una clase CSS.
       * Parámetros: p14 (objeto con propiedad data)
       */
      running: function (p14) {
        return p14.data.status === "RUNNING";
      },
      /**
       * finished
       * Descripción: Devuelve true si el estado de la fila es "FINISHED" para aplicar una clase CSS.
       * Parámetros: p15 (objeto con propiedad data)
       */
      finished: function (p15) {
        return p15.data.status === "FINISHED";
      }
    },
    /**
     * onBodyScroll
     * Descripción: Marca la variable global 'scrolling' como true cuando se detecta scroll en la tabla.
     * Parámetros: p16 (evento de scroll)
     */
    onBodyScroll: function (p16) {
      scrolling = true;
    },
    /**
     * onBodyScrollEnd
     * Descripción: Marca la variable global 'scrolling' como false cuando termina el scroll en la tabla.
     * Parámetros: p17 (evento de fin de scroll)
     */
    onBodyScrollEnd: function (p17) {
      scrolling = false;
    },
    /**
     * noRowsOverlayComponent
     * Descripción: Componente personalizado para mostrar cuando no hay filas en la grilla.
     */
    noRowsOverlayComponent: class CustomNoRowsOverlay {
      eGui;
      /**
       * init
       * Descripción: Inicializa el componente de overlay sin filas.
       * Parámetros: p18 (parámetros de agGrid)
       */
      init(p18) {
        this.eGui = document.createElement("div");
        this.refresh(p18);
      }
      /**
       * getGui
       * Descripción: Retorna el elemento HTML del overlay.
       */
      getGui() {
        return this.eGui;
      }
      /**
       * refresh
       * Descripción: Refresca el contenido del overlay.
       * Parámetros: p19 (parámetros de agGrid)
       */
      refresh(p19) {
        this.eGui.innerHTML = "<img width=\"300\" src=\"../img/no_data.png\">";
      }
    }
  };
  /**
   * Evento ready principal
   * Descripción: Inicializa la grilla de páginas, carga datos desde localStorage y configura eventos.
   */
  $(document).ready(async function () {
    const v14 = document.querySelector("#accounts");
    new agGrid.Grid(v14, accountGrid);
    const v15 = (await getLocalStorage("statePage")) || [];
    const vO13 = {
      state: v15,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(vO13);
    const v16 = new URL(location.href);
    const v17 = v16.searchParams.get("id");
    if (v17) {
      const v18 = await getLocalStorage("dataPage_" + v17);
      $("#count").text(v18.length);
      accountGrid.api.setRowData(v18);
    } else {
      // setInterval(async () => {
      //   if ($("body").hasClass("setting-loaded")) {
      //     saveSetting();
      //   }
      //   if ($("body").hasClass("data-loaded")) {
      //     // ... guarda datos de la tabla ...
      //   }
      // }, 2000);
    }
  });
  /**
   * Evento loadSavedPage
   * Descripción: Carga páginas guardadas y las muestra en la grilla.
   */
  $(document).on("loadSavedPage", function (p21, p22) {
    p22 = p22.map(p23 => {
      p23.process = "";
      return p23;
    });
    accountGrid.api.setRowData(p22);
  });
  const pageMap = [];
  /**
   * Evento loadPageSuccess
   * Descripción: Procesa y muestra páginas tras una carga exitosa, asignando IDs y mapeando páginas.
   */
  $(document).on("loadPageSuccess", function (p24, p25) {
    let vLN1 = 1;
    p25 = p25.map(p26 => {
      const vO14 = {
        id: vLN1,
        pageId: p26.id
      };
      pageMap.push(vO14);
      p26 = {
        id: vLN1,
        name: p26.name,
        createdDate: moment(p26.page_created_time).format("DD/MM/YYYY"),
        like: p26.likes,
        pageId: p26.id,
        pageId2: p26.additional_profile_id,
        follow: p26.followers_count,
        role: p26.perms.includes("ADMINISTER") ? "ADMIN" : "NORMAL",
        bm: p26.business?.id || "",
        avatar: "http://graph.facebook.com/" + p26.id + "/picture"
      };
      vLN1++;
      return p26;
    });
    accountGrid.api.setRowData(p25);
  });
  /**
   * Evento updatePageStatus
   * Descripción: Actualiza el estado de una página específica en la grilla.
   */
  $(document).on("updatePageStatus", function (p27, p28) {
    const v20 = pageMap.filter(p29 => p29.pageId == p28.id)[0].id;
    console.log(v20);
    accountGrid.api.getRowNode(v20).setDataValue("status", p28.status);
  });
  /**
   * countStatus
   * Descripción: Cuenta la cantidad de páginas por cada estado y actualiza los contadores en la interfaz.
   * Parámetros: p30 (objeto agGrid), p31 (no usado)
   */
  function countStatus(p30, p31) {
    let vLN03 = 0;
    let vLN04 = 0;
    let vLN05 = 0;
    let vLN06 = 0;
    let vLN07 = 0;
    let vLN08 = 0;
    p30.api.forEachNode(p32 => {
      if (p32.data.status === 1) {
        vLN03++;
      }
      if (p32.data.status === 2) {
        vLN04++;
      }
      if (p32.data.status === 3) {
        vLN05++;
      }
      if (p32.data.status === 4) {
        vLN06++;
      }
      if (p32.data.status === 5) {
        vLN07++;
      }
      if (p32.data.status === 6) {
        vLN08++;
      }
    });
    $(".status1Count").text(vLN03);
    $(".status2Count").text(vLN04);
    $(".status3Count").text(vLN05);
    $(".status4Count").text(vLN06);
    $(".status5Count").text(vLN07);
    $(".status6Count").text(vLN08);
  }