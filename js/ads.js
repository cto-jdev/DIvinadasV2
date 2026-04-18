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
    cellRenderer: params => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <span class=\"avatar-letter\" data-letter=\"" + params.data.account.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                    <a href=\"https://business.facebook.com/billing_hub/payment_settings/?asset_id=" + params.data.adId + "\" target=\"_BLANK\" class=\"ps-3 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + params.data.account + "</strong>\n                        <span>" + params.data.adId + "</span>\n                    </a>\n                </div>\n            ";
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
    cellRenderer: params => {
      let paymentHtml = "";
      if (params.data.payment) {
        const paymentList = JSON.parse(params.data.payment);
        if (paymentList.length > 0) {
          const enrichedList = paymentList.map(paymentItem => {
            if (paymentItem.credential.__typename === "AdsToken") {
              paymentItem.img = "../img/credit.svg";
              paymentItem.credential.last_four_digits = 1007;
            }
            if (paymentItem.credential.__typename === "PaymentPaypalBillingAgreement") {
              paymentItem.img = "../img/paypal.svg";
              paymentItem.credential.last_four_digits = "PayPal";
            }
            if (paymentItem.credential.__typename === "DirectDebit") {
              paymentItem.img = "../img/direct.svg";
            }
            if (paymentItem.credential.card_association === "AMERICANEXPRESS") {
              paymentItem.img = "../img/amex.svg";
            }
            if (paymentItem.credential.card_association === "VISA") {
              paymentItem.img = "../img/visa.svg";
            }
            if (paymentItem.credential.card_association === "MASTERCARD") {
              paymentItem.img = "../img/mastercard.svg";
            }
            return paymentItem;
          });
          let primaryItem = enrichedList.filter(item => item.is_primary)[0];
          if (!primaryItem) {
            primaryItem = enrichedList.length > 0 ? enrichedList[0] : null;
          }
          if (!primaryItem) {
            paymentHtml = "";
            return;
          }
          paymentHtml = "<div class=\"accountPayments\" style=\"line-height: initial;\">";
          let primaryBadgeHtml = "";
          if (primaryItem.usability === "USABLE") {
            primaryBadgeHtml = "<span class=\"badge rounded-pill text-bg-success\">Activo</span>";
          }
          if (primaryItem.usability === "PENDING_VERIFICATION" || primaryItem.usability === "UNVERIFIED_OR_PENDING_AUTH") {
            primaryBadgeHtml = "<span class=\"badge rounded-pill text-bg-warning\">Verificación pendiente</span>";
          }
          if (primaryItem.usability === "ADS_PAYMENTS_RESTRICTED" || primaryItem.usability === "UNVERIFIABLE") {
            primaryBadgeHtml = "<span class=\"badge rounded-pill text-bg-danger\">Restringido</span>";
          }
          paymentHtml += "\n                        <div class=\"d-flex align-items-center\">\n                            <img src=\"" + primaryItem.img + "\" class=\"me-2\"><strong>" + primaryItem.credential.last_four_digits + "</strong><span class=\"mx-1\">&#8226;</span><span>" + primaryBadgeHtml + "</span>\n                        </div>\n\n                    ";
          if (enrichedList.length > 1) {
            paymentHtml += "\n                            <strong class=\"more text-primary d-block\" style=\"margin-top: 2px\">" + (enrichedList.length - 1) + " Más tarjetas...</strong>\n                            <div class=\"subMenu d-none\">\n                        ";
            enrichedList.forEach(item => {
              let itemDetail = "";
              let itemBadgeHtml = "";
              if (!item.credential.email) {
                itemDetail = "<small>Fecha de expiración: " + item.credential.expiry_month + "/" + item.credential.expiry_year + "</small>";
              } else {
                itemDetail = "<small>" + item.credential.email + "</small>";
              }
              if (item.usability === "USABLE") {
                itemBadgeHtml = "<span class=\"badge rounded-pill text-bg-success\">Activo</span>";
              }
              if (item.usability === "PENDING_VERIFICATION" || item.usability === "UNVERIFIED_OR_PENDING_AUTH") {
                itemBadgeHtml = "<span class=\"badge rounded-pill text-bg-warning\">Verificación pendiente</span>";
              }
              if (item.usability === "ADS_PAYMENTS_RESTRICTED" || item.usability === "UNVERIFIABLE") {
                itemBadgeHtml = "<span class=\"badge rounded-pill text-bg-danger\">Restringido</span>";
              }
              if (item.credential.__typename === "AdsToken") {
                itemDetail = "";
              }
              paymentHtml += "\n                                <div class=\"cardItem d-flex align-items-center\">\n                                    <img src=\"" + item.img + "\" height=\"20\" class=\"me-3\"> \n                                    <div>\n                                        <span class=\"d-block\"><strong>" + item.credential.last_four_digits + "</strong> &#8226; " + itemBadgeHtml + "</span>\n                                        " + itemDetail + "\n                                    </div>\n                                </div>\n                            ";
            });
            paymentHtml += "</div>";
          }
          paymentHtml += "</div>";
        }
      }
      return paymentHtml;
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
    getRowId: function (params) {
      return params.data.id;
    },
    onFirstDataRendered: function (event) {
      countStatus(event, 0);
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
    const gridContainer = document.querySelector("#accounts");
    try {
      const cardsContainer = document.querySelector("#cards");
      if (cardsContainer) {
        new agGrid.Grid(cardsContainer, cardGrid);
      }
    } catch (error) {
      console.warn('Error inicializando grilla de tarjetas:', error);
    }
    new agGrid.Grid(gridContainer, accountGrid);
    const savedColumnState = JSON.parse(localStorage.getItem("stateAds")) || [];
    const columnStateConfig = {
      state: savedColumnState,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(columnStateConfig);
    const pageUrl = new URL(location.href);
    const urlUserId = pageUrl.searchParams.get("id");
    if (urlUserId) {
      const savedData = (await getLocalStorage("dataAds_" + urlUserId)) || [];
      $("#count").text(savedData.length);
      accountGrid.api.setRowData(savedData);
    } else {
            $(document).on("mouseover", "div[col-id=\"payment\"], div[col-id=\"hiddenAdmins\"], div[col-id=\"pixel\"]", function () {        if ($(this).find(".more").length > 0 && $(".moreCard").length === 0) {          const moreOffset = $(this).find(".more").offset();          const offsetVal = parseInt($(this).find(".more").attr("offset")) || 2;          const subMenuHtml = $(this).find(".subMenu").html();                    let topPosition = moreOffset.top + offsetVal;          let leftPosition = moreOffset.left - 10;                    const windowHeight = $(window).height();          const windowWidth = $(window).width();          const cardEstimatedHeight = 200;          const cardEstimatedWidth = 350;                    if (topPosition + cardEstimatedHeight > windowHeight) {            topPosition = moreOffset.top - cardEstimatedHeight - 10;          }                    if (leftPosition + cardEstimatedWidth > windowWidth) {            leftPosition = windowWidth - cardEstimatedWidth - 20;          }                    if (leftPosition < 10) {            leftPosition = 10;          }                    if (topPosition < 10) {            topPosition = 10;          }                    $("body").append("\n                    <div class=\"moreCard shadow rounded p-3\" style=\"top: " + topPosition + "px; left: " + leftPosition + "px\">" + subMenuHtml + "</div>\n                ");        }      });      $(document).on("mouseleave", "div[col-id=\"payment\"], div[col-id=\"hiddenAdmins\"], div[col-id=\"pixel\"]", function () {        $(".moreCard").remove();      });
      setInterval(async () => {
        if ($("body").hasClass("setting-loaded")) {
          saveSetting();
        }
        if ($("body").hasClass("data-loaded")) {
          const rowDataArray = [];
          accountGrid.api.forEachNode(function (node) {
            rowDataArray.push(node.data);
          });
          if (rowDataArray.length > 0 && fb.uid) {
            localStorage.setItem("dataAds", JSON.stringify(rowDataArray));
            await setLocalStorage("dataAds_" + fb.uid, rowDataArray);
          }
          const currentColumnState = accountGrid.columnApi.getColumnState();
          localStorage.setItem("stateAds", JSON.stringify(currentColumnState));
        }
      }, 2000);
    }
  });
  /**
   * Evento loadSavedAds
   * Descripción: Carga anuncios guardados y los muestra en la grilla.
   */
  $(document).on("loadSavedAds", function (event, adsList) {
    adsList = adsList.map(ad => {
      ad.process = "";
      return ad;
    });
    accountGrid.api.setRowData(adsList);
  });
  const adsMap = [];
  /**
   * Evento loadAdsSuccess
   * Descripción: Procesa y muestra anuncios tras una carga exitosa, asignando IDs y mapeando anuncios.
   */
  $(document).on("loadAdsSuccess", function (event, adsData) {
    let rowIndex = 1;
    adsData = adsData.map(ad => {
      const mapEntry = {
        id: rowIndex,
        adId: ad.adId
      };
      adsMap.push(mapEntry);
      ad.id = rowIndex;
      rowIndex++;
      return ad;
    });
    accountGrid.api.setRowData(adsData);
  });
  /**
   * Evento loadAdsSuccess2
   * Descripción: Actualiza datos específicos de un anuncio (país, pago, estado) en la grilla.
   */
  $(document).on("loadAdsSuccess2", function (event, adDetail) {
    const adsMapEntry = adsMap.filter(entry => entry.adId == adDetail.id)[0];
    if (!adsMapEntry) return;
    const rowId = adsMapEntry.id;
    accountGrid.api.getRowNode(rowId).setDataValue("country", adDetail.country);
    accountGrid.api.getRowNode(rowId).setDataValue("payment", adDetail.payment);
    if (adDetail.status) {
      accountGrid.api.getRowNode(rowId).setDataValue("status", adDetail.status);
    }
  });
  /**
   * Evento input linkShareBm
   * Descripción: Actualiza el contador de enlaces de BM compartidos al cambiar el input.
   */
  $("[name=\"linkShareBm\"]").on("input", function () {
    const shareLinks = $("[name=\"linkShareBm\"]").val().split(/\r?\n|\r|\n/g).filter(line => line);
    $("#linkShareBmCount").text(shareLinks.length);
  });
  /**
   * Evento updateShareBmLink
   * Descripción: Añade un nuevo enlace de BM compartido y actualiza el contador.
   */
  $(document).on("updateShareBmLink", function (event, linkData) {
    const shareLinks = $("[name=\"linkShareBm\"]").val().split(/\r?\n|\r|\n/g).filter(line => line);
    shareLinks.push(linkData.link);
    $("[name=\"linkShareBm\"]").val(shareLinks.join("\r\n"));
    $("#linkShareBmCount").text(shareLinks.length);
  });
  /**
   * Evento updateAdsName
   * Descripción: Actualiza el nombre de la cuenta de un anuncio en la grilla.
   */
  $(document).on("updateAdsName", function (event, nameData) {
    accountGrid.api.getRowNode(parseInt(nameData.id)).setDataValue("account", nameData.name);
  });
  /**
   * Evento updateAdInfo
   * Descripción: Actualiza información adicional de un anuncio (zona horaria, moneda, país) en la grilla.
   */
  $(document).on("updateAdInfo", function (event, adInfo) {
    if (adInfo.timezone) {
      accountGrid.api.getRowNode(parseInt(adInfo.id)).setDataValue("timezone", adInfo.timezone);
    }
    if (adInfo.currency) {
      accountGrid.api.getRowNode(parseInt(adInfo.id)).setDataValue("currency", adInfo.currency);
    }
    if (adInfo.country) {
      accountGrid.api.getRowNode(parseInt(adInfo.id)).setDataValue("country", adInfo.country);
    }
  });

  /**
   * Evento updatePixels
   * Descripción: Actualiza los píxeles asociados a una cuenta en la grilla.
   */
  $(document).on("updatePixels", function (event, pixelData) {
    if (pixelData.pixels && pixelData.accountId) {
      let targetRowNode = null;
      accountGrid.api.forEachNode(function(node) {
        if (node.data.adId === pixelData.accountId) {
          targetRowNode = node;
        }
      });
      if (targetRowNode) {
        targetRowNode.setDataValue("pixel", pixelData.pixels);
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
    let v30 = "";
    try {
      v30 = (await navigator.clipboard.readText()) ?? "";
    } catch (clipErr) {
      console.warn('[DivinAds] Clipboard no disponible:', clipErr.message);
      return false;
    }
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
  $("#cardModal").on("show.bs.modal", function (event) {
    loadCards();
    const menuActions = [{
      text: "Paste",
      onclick: clickEvent => {
        pasteCard();
      }
    }, {
      text: "Delete",
      onclick: clickEvent => {
        cardGrid.api.forEachNodeAfterFilterAndSort(node => {
          if (node.selected) {
            localStorage.removeItem("card_" + node.data.cardNumber);
          }
        });
        loadCards();
      }
    }];
    const contextMenuInstance = new ContextMenu(document.getElementById("cards"), menuActions);
    contextMenuInstance.install();
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