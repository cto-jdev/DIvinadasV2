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
    field: "status",
    headerName: "Estado",
    filter: "agSetColumnFilter",
    cellRenderer: p => {
      let v = "";
      if (p.data.status == 101) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-secondary rounded-circle me-2\"></span><strong class=\"text-info\">Cerrada</strong></span>";
      }
      if (p.data.status == 999) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-secondary\">En espera</strong></span>";
      }
      if (p.data.status == 1 || p.data.status == 100) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">Activo</strong></span>";
      }
      if (p.data.status == 2) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Deshabilitado</strong></span>";
      }
      if (p.data.status == 3) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">Necesita pago</strong></span>";
      }
      if (p.data.status == 4) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">En disputa 3 líneas</strong></span>";
      }
      if (p.data.status == 5) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Muerto 3 líneas</strong></span>";
      }
      if (p.data.status == 6) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Muerto VeryID</strong></span>";
      }
      if (p.data.status == 7) {
        v = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Muerto permanentemente</strong></span>";
      }
      return v;
    }
  }, {
    field: "account",
    headerName: "Cuenta",
    minWidth: 250,
    cellRenderer: p2 => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <span class=\"avatar-letter\" data-letter=\"" + p2.data.account.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                    <a href=\"https://business.facebook.com/billing_hub/payment_settings/?asset_id=" + p2.data.adId + "\" target=\"_BLANK\" class=\"ps-3 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + p2.data.account + "</strong>\n                        <span>" + p2.data.adId + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "id",
    hide: true
  }, {
    field: "adId",
    headerName: "ID Cuenta"
  }, {
    field: "process",
    headerName: "Proceso"
  }, {
    field: "message",
    headerName: "Mensaje"
  }, {
    field: "balance",
    headerName: "Saldo"
  }, {
    field: "threshold",
    headerName: "Umbral"
  }, {
    field: "remain",
    headerName: "Umbral restante"
  }, {
    field: "limit",
    headerName: "Límite"
  }, {
    field: "spend",
    headerName: "Gasto total"
  }, {
    field: "currency",
    headerName: "Moneda"
  }, {
    field: "adminNumber",
    headerName: "Número de admin"
  }, {
    field: "role",
    headerName: "Rol de propiedad"
  }, {
    field: "payment",
    headerName: "Pago",
    minWidth: 200,
    cellRenderer: p3 => {
      let v2 = "";
      if (p3.data.payment) {
        const v3 = JSON.parse(p3.data.payment);
        if (v3.length > 0) {
          const v4 = v3.map(p4 => {
            if (p4.credential.__typename === "AdsToken") {
              p4.img = "../img/credit.svg";
              p4.credential.last_four_digits = 1007;
            }
            if (p4.credential.__typename === "PaymentPaypalBillingAgreement") {
              p4.img = "../img/paypal.svg";
              p4.credential.last_four_digits = "PayPal";
            }
            if (p4.credential.__typename === "DirectDebit") {
              p4.img = "../img/direct.svg";
            }
            if (p4.credential.card_association === "AMERICANEXPRESS") {
              p4.img = "../img/amex.svg";
            }
            if (p4.credential.card_association === "VISA") {
              p4.img = "../img/visa.svg";
            }
            if (p4.credential.card_association === "MASTERCARD") {
              p4.img = "../img/mastercard.svg";
            }
            return p4;
          });
          let v5 = v4.filter(p5 => p5.is_primary)[0];
          if (!v5) {
            v5 = v4[0];
          }
          v2 = "<div class=\"accountPayments\" style=\"line-height: initial;\">";
          let v6 = "";
          if (v5.usability === "USABLE") {
            v6 = "<span class=\"badge rounded-pill text-bg-success\">Activo</span>";
          }
          if (v5.usability === "PENDING_VERIFICATION" || v5.usability === "UNVERIFIED_OR_PENDING_AUTH") {
            v6 = "<span class=\"badge rounded-pill text-bg-warning\">Verificación pendiente</span>";
          }
          if (v5.usability === "ADS_PAYMENTS_RESTRICTED" || v5.usability === "UNVERIFIABLE") {
            v6 = "<span class=\"badge rounded-pill text-bg-danger\">Restringido</span>";
          }
          v2 += "\n                        <div class=\"d-flex align-items-center\">\n                            <img src=\"" + v5.img + "\" class=\"me-2\"><strong>" + v5.credential.last_four_digits + "</strong><span class=\"mx-1\">&#8226;</span><span>" + v6 + "</span>\n                        </div>\n\n                    ";
          if (v4.length > 1) {
            v2 += "\n                            <strong class=\"more text-primary d-block\" style=\"margin-top: 2px\">" + (v4.length - 1) + " Más tarjetas...</strong>\n                            <div class=\"subMenu d-none\">\n                        ";
            v4.forEach(p6 => {
              let v7 = "";
              let v8 = "";
              if (!p6.credential.email) {
                v7 = "<small>Fecha de expiración: " + p6.credential.expiry_month + "/" + p6.credential.expiry_year + "</small>";
              } else {
                v7 = "<small>" + p6.credential.email + "</small>";
              }
              if (p6.usability === "USABLE") {
                v8 = "<span class=\"badge rounded-pill text-bg-success\">Activo</span>";
              }
              if (p6.usability === "PENDING_VERIFICATION" || p6.usability === "UNVERIFIED_OR_PENDING_AUTH") {
                v8 = "<span class=\"badge rounded-pill text-bg-warning\">Verificación pendiente</span>";
              }
              if (p6.usability === "ADS_PAYMENTS_RESTRICTED" || p6.usability === "UNVERIFIABLE") {
                v8 = "<span class=\"badge rounded-pill text-bg-danger\">Restringido</span>";
              }
              if (p6.credential.__typename === "AdsToken") {
                v7 = "";
              }
              v2 += "\n                                <div class=\"cardItem d-flex align-items-center\">\n                                    <img src=\"" + p6.img + "\" height=\"20\" class=\"me-3\"> \n                                    <div>\n                                        <span class=\"d-block\"><strong>" + p6.credential.last_four_digits + "</strong> &#8226; " + v8 + "</span>\n                                        " + v7 + "\n                                    </div>\n                                </div>\n                            ";
            });
            v2 += "</div>";
          }
          v2 += "</div>";
        }
      }
      return v2;
    }
  }, {
    field: "nextBillDate",
    headerName: "Fecha de la próxima factura"
  }, {
    field: "nextBillDay",
    headerName: "Días hasta el próximo pago"
  }, {
    field: "country",
    headerName: "País"
  }, {
    field: "reason",
    headerName: "Razón del bloqueo"
  }, {
    field: "createdTime",
    headerName: "Fecha de creación"
  }, {
    field: "type",
    headerName: "Tipo"
  }, {
    field: "bm",
    headerName: "BM"
  }, {
    field: "timezone",
    headerName: "Zona horaria"
  }, {
    field: "pixel",
    headerName: "Píxeles",
    minWidth: 200,
    cellRenderer: p => {
      let v = "";
      if (p.data.pixel && Array.isArray(p.data.pixel) && p.data.pixel.length > 0) {
        v = "<div class=\"accountPixels\" style=\"line-height: initial;\">";
        
        // Mostrar el primer píxel
        const firstPixel = p.data.pixel[0];
        v += `
          <div class="d-flex align-items-center">
            <i class="ri-radar-line me-2 text-primary"></i>
            <div>
              <strong>${firstPixel.name || 'Sin nombre'}</strong>
              <small class="d-block text-muted">${firstPixel.id}</small>
            </div>
          </div>
        `;
        
        // Si hay más píxeles, mostrar contador
        if (p.data.pixel.length > 1) {
          v += `
            <strong class="more text-primary d-block" style="margin-top: 2px">
              ${p.data.pixel.length - 1} Píxeles más...
            </strong>
            <div class="subMenu d-none">
          `;
          
          p.data.pixel.forEach(pixel => {
            v += `
              <div class="pixelItem d-flex align-items-center mb-2">
                <i class="ri-radar-line me-2 text-primary"></i>
                <div>
                  <span class="d-block"><strong>${pixel.name || 'Sin nombre'}</strong></span>
                  <small class="text-muted">${pixel.id}</small>
                </div>
              </div>
            `;
          });
          
          v += "</div>";
        }
        
        v += "</div>";
      } else {
        v = "<span class=\"text-muted\"><i class=\"ri-radar-line me-1\"></i>Sin píxeles</span>";
      }
      return v;
    }
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
    /**
     * getRowId
     * Descripción: Retorna el identificador único de una fila para agGrid.
     * Parámetros: p7 (objeto con propiedad data)
     * Retorna: id de la fila
     */
    getRowId: function (p7) {
      return p7.data.id;
    },
    /**
     * onFirstDataRendered
     * Descripción: Llama a countStatus cuando los datos se renderizan por primera vez en la grilla.
     * Parámetros: p8 (evento de agGrid)
     */
    onFirstDataRendered: function (p8) {
      countStatus(p8, 0);
    },
    /**
     * onRangeSelectionChanged
     * Descripción: Actualiza el contador de filas seleccionadas en un rango.
     * Parámetros: p9 (evento de selección de rango de agGrid)
     */
    onRangeSelectionChanged: function (p9) {
      const v9 = p9.api.getCellRanges();
      if (v9.length) {
        let v10 = 0;
        if (v9[0].startRow.rowIndex < v9[0].endRow.rowIndex) {
          v10 = v9[0].endRow.rowIndex - (v9[0].startRow.rowIndex - 1);
        } else {
          v10 = v9[0].startRow.rowIndex - (v9[0].endRow.rowIndex - 1);
        }
        $("#boiden").text(v10);
      } else {
        $("#boiden").text(0);
      }
    },
    /**
     * onSelectionChanged
     * Descripción: Actualiza el contador de filas seleccionadas.
     * Parámetros: p10 (evento de selección de agGrid)
     */
    onSelectionChanged: function (p10) {
      const v11 = p10.api.getSelectedRows();
      $("#dachon").text(v11.length);
    },
    /**
     * onRowDataUpdated
     * Descripción: Actualiza el contador total de filas mostradas en la grilla.
     * Parámetros: p11 (evento de actualización de datos de agGrid)
     */
    onRowDataUpdated: function (p11) {
      $("#tong").text(p11.api.getDisplayedRowCount());
    },
    /**
     * onFilterChanged
     * Descripción: Actualiza el contador total de filas mostradas tras aplicar un filtro.
     * Parámetros: p12 (evento de filtrado de agGrid)
     */
    onFilterChanged: function (p12) {
      $("#tong").text(p12.api.getDisplayedRowCount());
    },
    rowClassRules: {
      /**
       * running
       * Descripción: Devuelve true si el estado de la fila es "RUNNING" para aplicar una clase CSS.
       * Parámetros: p13 (objeto con propiedad data)
       */
      running: function (p13) {
        return p13.data.status === "RUNNING";
      },
      /**
       * finished
       * Descripción: Devuelve true si el estado de la fila es "FINISHED" para aplicar una clase CSS.
       * Parámetros: p14 (objeto con propiedad data)
       */
      finished: function (p14) {
        return p14.data.status === "FINISHED";
      }
    },
    /**
     * onBodyScroll
     * Descripción: Marca la variable global 'scrolling' como true cuando se detecta scroll en la tabla.
     * Parámetros: p15 (evento de scroll)
     */
    onBodyScroll: function (p15) {
      scrolling = true;
    },
    /**
     * onBodyScrollEnd
     * Descripción: Marca la variable global 'scrolling' como false cuando termina el scroll en la tabla.
     * Parámetros: p16 (evento de fin de scroll)
     */
    onBodyScrollEnd: function (p16) {
      scrolling = false;
    }
  };
  const cardColumns = [{
    resizable: false,
    headerCheckboxSelection: true,
    headerCheckboxSelectionCurrentPageOnly: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    maxWidth: 40,
    suppressMovable: true
  }, {
    field: "id",
    headerName: "#",
    width: 40,
    minWidth: 40,
    suppressMovable: true
  }, {
    field: "cardName",
    headerName: "Nombre en la tarjeta"
  }, {
    field: "cardNumber",
    headerName: "Número de tarjeta"
  }, {
    field: "expDate",
    headerName: "Fecha de expiración"
  }, {
    field: "expMonth",
    hide: true
  }, {
    field: "expYear",
    hide: true
  }, {
    field: "cardCsv",
    headerName: "CCV"
  }, {
    field: "count",
    headerName: "Veces usado"
  }];
  const v12 = {
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
      sortable: true
    },
    columnDefs: cardColumns,
    rowData: [],
    localeText: {
      noRowsToShow: ""
    }
  };
  const cardGrid = v12;
  /**
   * Evento ready principal
   * Descripción: Inicializa la grilla de cuentas y tarjetas, carga datos desde localStorage, configura eventos y sincronización periódica.
   */
  $(document).ready(async function () {
    const v13 = document.querySelector("#accounts");
    try {
      const v14 = document.querySelector("#cards");
      if (v14) {
        new agGrid.Grid(v14, cardGrid);
      }
    } catch (error) {
      console.warn('Error inicializando grilla de tarjetas:', error);
    }
    new agGrid.Grid(v13, accountGrid);
    const v15 = JSON.parse(localStorage.getItem("stateAds")) || [];
    const v16 = {
      state: v15,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(v16);
    const v17 = new URL(location.href);
    const v18 = v17.searchParams.get("id");
    if (v18) {
      const v19 = await getLocalStorage("dataAds_" + v18);
      $("#count").text(v19.length);
      accountGrid.api.setRowData(v19);
    } else {
            $(document).on("mouseover", "div[col-id=\"payment\"], div[col-id=\"hiddenAdmins\"], div[col-id=\"pixel\"]", function () {        if ($(this).find(".more").length > 0 && $(".moreCard").length === 0) {          const v20 = $(this).find(".more").offset();          const v21 = parseInt($(this).find(".more").attr("offset")) || 2;          const v22 = $(this).find(".subMenu").html();                    // Mejorar el posicionamiento para evitar superposición          let topPosition = v20.top + v21;          let leftPosition = v20.left - 10;                    // Obtener dimensiones de la ventana          const windowHeight = $(window).height();          const windowWidth = $(window).width();          const cardEstimatedHeight = 200; // Altura estimada de la tarjeta          const cardEstimatedWidth = 350; // Ancho estimado de la tarjeta                    // Ajustar posición vertical si se sale de la pantalla por abajo          if (topPosition + cardEstimatedHeight > windowHeight) {            topPosition = v20.top - cardEstimatedHeight - 10;          }                    // Ajustar posición horizontal si se sale de la pantalla por la derecha          if (leftPosition + cardEstimatedWidth > windowWidth) {            leftPosition = windowWidth - cardEstimatedWidth - 20;          }                    // Asegurar que no se salga por la izquierda          if (leftPosition < 10) {            leftPosition = 10;          }                    // Asegurar que no se salga por arriba          if (topPosition < 10) {            topPosition = 10;          }                    $("body").append("\n                    <div class=\"moreCard shadow rounded p-3\" style=\"top: " + topPosition + "px; left: " + leftPosition + "px\">" + v22 + "</div>\n                ");        }      });      $(document).on("mouseleave", "div[col-id=\"payment\"], div[col-id=\"hiddenAdmins\"], div[col-id=\"pixel\"]", function () {        $(".moreCard").remove();      });
      setInterval(async () => {
        if ($("body").hasClass("setting-loaded")) {
          saveSetting();
        }
        if ($("body").hasClass("data-loaded")) {
          const v23 = [];
          accountGrid.api.forEachNode(function (p17) {
            v23.push(p17.data);
          });
          if (v23.length > 0) {
            localStorage.setItem("dataAds", JSON.stringify(v23));
            await setLocalStorage("dataAds_" + fb.uid, v23);
          }
          const v24 = accountGrid.columnApi.getColumnState();
          localStorage.setItem("stateAds", JSON.stringify(v24));
        }
      }, 2000);
    }
  });
  /**
   * Evento loadSavedAds
   * Descripción: Carga anuncios guardados y los muestra en la grilla.
   */
  $(document).on("loadSavedAds", function (p18, p19) {
    p19 = p19.map(p20 => {
      p20.process = "";
      return p20;
    });
    accountGrid.api.setRowData(p19);
  });
  const adsMap = [];
  /**
   * Evento loadAdsSuccess
   * Descripción: Procesa y muestra anuncios tras una carga exitosa, asignando IDs y mapeando anuncios.
   */
  $(document).on("loadAdsSuccess", function (p21, p22) {
    let v25 = 1;
    p22 = p22.map(p23 => {
      const v26 = {
        id: v25,
        adId: p23.adId
      };
      adsMap.push(v26);
      p23.id = v25;
      v25++;
      return p23;
    });
    accountGrid.api.setRowData(p22);
  });
  /**
   * Evento loadAdsSuccess2
   * Descripción: Actualiza datos específicos de un anuncio (país, pago, estado) en la grilla.
   */
  $(document).on("loadAdsSuccess2", function (p24, p25) {
    const v27 = adsMap.filter(p26 => p26.adId == p25.id)[0].id;
    accountGrid.api.getRowNode(v27).setDataValue("country", p25.country);
    accountGrid.api.getRowNode(v27).setDataValue("payment", p25.payment);
    if (p25.status) {
      accountGrid.api.getRowNode(v27).setDataValue("status", p25.status);
    }
  });
  /**
   * Evento input linkShareBm
   * Descripción: Actualiza el contador de enlaces de BM compartidos al cambiar el input.
   */
  $("[name=\"linkShareBm\"]").on("input", function () {
    const v28 = $("[name=\"linkShareBm\"]").val().split(/\r?\n|\r|\n/g).filter(p27 => p27);
    $("#linkShareBmCount").text(v28.length);
  });
  /**
   * Evento updateShareBmLink
   * Descripción: Añade un nuevo enlace de BM compartido y actualiza el contador.
   */
  $(document).on("updateShareBmLink", function (p28, p29) {
    const v29 = $("[name=\"linkShareBm\"]").val().split(/\r?\n|\r|\n/g).filter(p30 => p30);
    v29.push(p29.link);
    $("[name=\"linkShareBm\"]").val(v29.join("\r\n"));
    $("#linkShareBmCount").text(v29.length);
  });
  /**
   * Evento updateAdsName
   * Descripción: Actualiza el nombre de la cuenta de un anuncio en la grilla.
   */
  $(document).on("updateAdsName", function (p31, p32) {
    accountGrid.api.getRowNode(parseInt(p32.id)).setDataValue("account", p32.name);
  });
  /**
   * Evento updateAdInfo
   * Descripción: Actualiza información adicional de un anuncio (zona horaria, moneda, país) en la grilla.
   */
  $(document).on("updateAdInfo", function (p33, p34) {
    if (p34.timezone) {
      accountGrid.api.getRowNode(parseInt(p34.id)).setDataValue("timezone", p34.timezone);
    }
    if (p34.currency) {
      accountGrid.api.getRowNode(parseInt(p34.id)).setDataValue("currency", p34.currency);
    }
    if (p34.country) {
      accountGrid.api.getRowNode(parseInt(p34.id)).setDataValue("country", p34.country);
    }
  });

  /**
   * Evento updatePixels
   * Descripción: Actualiza los píxeles asociados a una cuenta en la grilla.
   */
  $(document).on("updatePixels", function (p35, p36) {
    if (p36.pixels && p36.accountId) {
      // Buscar la fila por adId
      let targetRowNode = null;
      accountGrid.api.forEachNode(function(node) {
        if (node.data.adId === p36.accountId) {
          targetRowNode = node;
        }
      });
      
      if (targetRowNode) {
        targetRowNode.setDataValue("pixel", p36.pixels);
      }
    }
  });

  /**
   * Función para conectar píxeles desde la tabla
   * Descripción: Abre el modal de conectar píxeles con la cuenta seleccionada
   */
  function connectPixelsFromTable(accountId) {
    // Activar el switch de conectar píxeles
    const connectPixelsSwitch = document.querySelector('input[name="connectPixels"]');
    if (connectPixelsSwitch && !connectPixelsSwitch.checked) {
      connectPixelsSwitch.click();
    }
    
    // Seleccionar la cuenta en la tabla
    accountGrid.api.forEachNode(function(node) {
      if (node.data.adId === accountId) {
        node.setSelected(true);
      } else {
        node.setSelected(false);
      }
    });
    
    // Mostrar mensaje informativo
    console.log(`🎯 Cuenta ${accountId} seleccionada para conectar píxeles`);
    
    // Scroll hacia la sección de conectar píxeles
    const connectPixelsSection = document.getElementById('connectPixelsSetting');
    if (connectPixelsSection) {
      connectPixelsSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Menú contextual para píxeles
   * Descripción: Maneja el clic derecho en la columna de píxeles
   */
  $(document).on("contextmenu", "div[col-id=\"pixel\"]", function (e) {
    e.preventDefault();
    
    const rowData = accountGrid.api.getDisplayedRowAtIndex($(this).parent().attr('row-index'));
    if (!rowData) return;
    
    const accountId = rowData.data.adId;
    const accountName = rowData.data.account;
    
    // Crear menú contextual
    const contextMenu = `
      <div class="context-menu-pixels shadow rounded" style="position: fixed; top: ${e.pageY}px; left: ${e.pageX}px; z-index: 9999; background: white; border: 1px solid #ddd; min-width: 200px;">
        <div class="p-2">
          <div class="fw-bold mb-2 text-primary">
            <i class="ri-radar-line me-1"></i>Gestión de Píxeles
          </div>
          <div class="small text-muted mb-2">${accountName} (${accountId})</div>
          <hr class="my-2">
          <div class="context-menu-item p-2 hover-bg-light cursor-pointer" onclick="connectPixelsFromTable('${accountId}')">
            <i class="ri-link me-2 text-success"></i>Conectar Píxeles
          </div>
          <div class="context-menu-item p-2 hover-bg-light cursor-pointer" onclick="refreshAccountPixels('${accountId}')">
            <i class="ri-refresh-line me-2 text-info"></i>Actualizar Píxeles
          </div>
        </div>
      </div>
    `;
    
    // Remover menús existentes
    $('.context-menu-pixels').remove();
    
    // Agregar nuevo menú
    $('body').append(contextMenu);
    
    // Remover menú al hacer clic fuera
    $(document).one('click', function() {
      $('.context-menu-pixels').remove();
    });
  });

  /**
   * Función para actualizar píxeles de una cuenta específica
   */
  async function refreshAccountPixels(accountId) {
    try {
      console.log(`🔄 Actualizando píxeles para cuenta ${accountId}...`);
      
      // Aquí puedes llamar a la función que obtiene los píxeles de la cuenta
      // Por ejemplo, usando la API de Facebook
      const pixels = await getAccountPixels(accountId);
      
      // Actualizar la tabla
      $(document).trigger("updatePixels", {
        accountId: accountId,
        pixels: pixels
      });
      
      console.log(`✅ Píxeles actualizados para cuenta ${accountId}`);
    } catch (error) {
      console.error(`❌ Error actualizando píxeles para cuenta ${accountId}:`, error);
    }
  }

  /**
   * Función auxiliar para obtener píxeles de una cuenta
   */
  async function getAccountPixels(accountId) {
    try {
      const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      const token = fb.accessToken || getEAAGToken();
      
      if (!token) {
        throw new Error('No se encontró token de acceso');
      }
      
      const response = await fetch2(`https://graph.facebook.com/v17.0/${formattedId}/adspixels?fields=id,name&access_token=${token}`);
      
      if (response && response.json && response.json.data) {
        return response.json.data.map(pixel => ({
          id: pixel.id,
          name: pixel.name
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error obteniendo píxeles:', error);
      return [];
    }
  }

  /**
   * Función para cargar píxeles de todas las cuentas
   */
  async function loadAllAccountPixels() {
    try {
      console.log('🔄 Cargando píxeles de todas las cuentas...');
      
      const accounts = [];
      accountGrid.api.forEachNode(function(node) {
        accounts.push(node.data);
      });
      
      let loadedCount = 0;
      const promises = accounts.map(async (account) => {
        try {
          const pixels = await getAccountPixels(account.adId);
          if (pixels.length > 0) {
            $(document).trigger("updatePixels", {
              accountId: account.adId,
              pixels: pixels
            });
            loadedCount++;
          }
        } catch (error) {
          console.log(`⚠️ Error cargando píxeles para ${account.adId}:`, error.message);
        }
      });
      
      await Promise.all(promises);
      console.log(`✅ Píxeles cargados para ${loadedCount} cuentas`);
      
      // Mostrar notificación
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'Píxeles Cargados',
          text: `Se cargaron píxeles para ${loadedCount} cuentas`,
          timer: 3000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('❌ Error cargando píxeles:', error);
    }
  }

  // Hacer las funciones globales para que puedan ser llamadas desde el HTML
  window.connectPixelsFromTable = connectPixelsFromTable;
  window.refreshAccountPixels = refreshAccountPixels;
  window.loadAllAccountPixels = loadAllAccountPixels;
  /**
   * pasteCard
   * Descripción: Lee tarjetas desde el portapapeles, las guarda en localStorage y recarga la grilla de tarjetas.
   * Retorna: false
   */
  async function pasteCard() {
    const v30 = (await navigator.clipboard.readText()) ?? "";
    if (v30.length > 0) {
      accountGrid.api.clearRangeSelection();
      const v31 = v30.split(/\r?\n|\r|\n/g);
      for (let v32 = 0; v32 < v31.length; v32++) {
        let v33 = v31[v32];
        const v34 = v33.split("|");
        if (v34.length > 2) {
          localStorage.setItem("card_" + v34[1], JSON.stringify({
            cardName: v34[0],
            cardNumber: v34[1],
            expMonth: v34[2].split("/")[0],
            expYear: v34[2].split("/")[1],
            expDate: v34[2],
            cardCsv: v34[3],
            count: 0
          }));
        }
      }
      loadCards();
    }
    return false;
  }
  /**
   * Evento show.bs.modal cardModal
   * Descripción: Configura el menú contextual para pegar o eliminar tarjetas al mostrar el modal.
   */
  $("#cardModal").on("show.bs.modal", function (p35) {
    loadCards();
    const v35 = [{
      text: "Paste",
      onclick: p36 => {
        pasteCard();
      }
    }, {
      text: "Delete",
      onclick: p37 => {
        cardGrid.api.forEachNodeAfterFilterAndSort(p38 => {
          if (p38.selected) {
            localStorage.removeItem("card_" + p38.data.cardNumber);
          }
        });
        loadCards();
      }
    }];
    const v36 = new ContextMenu(document.getElementById("cards"), v35);
    v36.install();
  });
  /**
   * loadCards
   * Descripción: Carga todas las tarjetas almacenadas en localStorage y las muestra en la grilla de tarjetas.
   */
  function loadCards() {
    const v37 = {
      ...localStorage
    };
    const vV37 = v37;
    let v38 = 1;
    const v39 = Object.keys(vV37).filter(p39 => p39.includes("card_")).map(p40 => {
      return {
        id: v38++,
        ...JSON.parse(vV37[p40])
      };
    });
    cardGrid.api.setRowData(v39);
    $("#cardCount").text(v39.length);
  }
  /**
   * countStatus
   * Descripción: Cuenta la cantidad de anuncios por cada estado y actualiza los contadores en la interfaz.
   * Parámetros: p41 (objeto agGrid), p42 (no usado)
   */
  function countStatus(p41, p42) {
    let v40 = 0;
    let v41 = 0;
    let v42 = 0;
    let v43 = 0;
    let v44 = 0;
    let v45 = 0;
    let v46 = 0;
    let v47 = 0;
    let v48 = 0;
    p41.api.forEachNode(p43 => {
      if (p43.data.status == 1) {
        v40++;
      }
      if (p43.data.status == 2) {
        v41++;
      }
      if (p43.data.status == 3) {
        v42++;
      }
      if (p43.data.status == 4) {
        v43++;
      }
      if (p43.data.status == 5) {
        v44++;
      }
      if (p43.data.status == 6) {
        v45++;
      }
      if (p43.data.status == 7) {
        v46++;
      }
      if (p43.data.status == 101) {
        v47++;
      }
      if (p43.data.status == 999) {
        v48++;
      }
    });
    $(".status1Count").text(v40);
    $(".status2Count").text(v41);
    $(".status3Count").text(v42);
    $(".status4Count").text(v43);
    $(".status5Count").text(v44);
    $(".status6Count").text(v45);
    $(".status7Count").text(v46);
    $(".status101Count").text(v47);
    $(".status999Count").text(v48);
  }