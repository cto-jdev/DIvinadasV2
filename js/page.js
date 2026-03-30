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
       * FASE 1 SECURITY FIX: Usar createElement en lugar de innerHTML
       */
      refresh(p19) {
        // FASE 1 FIX: Evitar innerHTML inseguro
        this.eGui.innerHTML = ''; // Limpiar primero
        const img = document.createElement('img');
        img.width = 300;
        img.src = '../img/no_data.png';
        img.alt = 'No data available';
        this.eGui.appendChild(img);
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

// =============================================================================
// SISTEMA DE GESTIÓN DE COMENTARIOS - DIVINADS
// =============================================================================

/**
 * Inicialización del Sistema de Gestión de Comentarios
 * Descripción: Inicializa el sistema integrado con DivinAds
 */
$(document).ready(function() {
    console.log('💼 Sistema de Gestión de Comentarios - DivinAds iniciado');

    // Variables para el procesamiento
    let commentProcessing = false;
    let totalPagesProcessed = 0;
    let totalCommentsProcessed = 0;
    let totalErrors = 0;

    // =============================================================================
    // INTEGRACIÓN CON EL SISTEMA DIVINADS
    // =============================================================================

    // Mostrar/ocultar filtros específicos según el tipo seleccionado
    $('#commentType').on('change', function() {
        const selectedType = $(this).val();
        const filterContainer = $('#commentFilterContainer');
        
        if (selectedType === 'contains' || selectedType === 'user') {
            filterContainer.removeClass('d-none');
            const placeholder = selectedType === 'contains' ? 
                'Palabras clave a buscar (una por línea)\nEjemplo:\nspam\nofensivo\nmal comentario' :
                'IDs de usuario (uno por línea)\nEjemplo:\n123456789\n987654321';
            filterContainer.find('textarea').attr('placeholder', placeholder);
        } else {
            filterContainer.addClass('d-none');
        }
    });

    /**
     * getDivinAdsToken
     * Descripción: Obtiene token usando el sistema DivinAds existente
     * Retorna: Promise<string|null>
     */
    async function getDivinAdsToken() {
        try {
            console.log('🔍 Obteniendo token usando sistema DivinAds...');
            
            // Método 1: Desde localStorage (sistema principal DivinAds)
            let token = await getLocalStorage('accessToken');
            if (!token) {
                token = await getLocalStorage('manualAccessToken');
            }
            
            if (token && (token.startsWith('EAAG') || token.startsWith('EAA'))) {
                console.log('✅ Token encontrado en localStorage DivinAds');
                return token;
            }
            
            // Método 2: Desde variable global fb (usado en todo el sistema)
            if (typeof fb !== 'undefined' && fb.accessToken) {
                console.log('✅ Token encontrado en fb.accessToken');
                return fb.accessToken;
            }
            
            if (typeof fb !== 'undefined' && fb.token) {
                console.log('✅ Token encontrado en fb.token');
                return fb.token;
            }
            
            // Método 3: Usando función getEAAGToken() si existe (del sistema BM)
            if (typeof getEAAGToken === 'function') {
                const eaagToken = getEAAGToken();
                if (eaagToken) {
                    console.log('✅ Token EAAG extraído del HTML');
                    return eaagToken;
                }
            }
            
            // Método 4: Buscar token EAAG en el HTML manualmente (igual que getEAAGToken)
            try {
                const htmlContent = document.documentElement.outerHTML;
                const tokenMatch = htmlContent.match(/EAAG[a-zA-Z0-9]{50,}/);
                if (tokenMatch && tokenMatch[0]) {
                    console.log('✅ Token EAAG encontrado en HTML');
                    return tokenMatch[0];
                }
            } catch (e) {
                console.warn('⚠️ Error buscando en HTML:', e);
            }
            
            // Método 5: Intentar obtener usando instancia FB si está disponible
            if (typeof FB !== 'undefined' && FB.prototype && FB.prototype.getAccessToken) {
                try {
                    const fbInstance = new FB();
                    const tokenData = await fbInstance.getAccessToken();
                    if (tokenData && tokenData.accessToken) {
                        console.log('✅ Token obtenido de instancia FB');
                        return tokenData.accessToken;
                    }
                } catch (e) {
                    console.warn('⚠️ Error con instancia FB:', e);
                }
            }
            
            // Método 6: Buscar en DOM - input accessToken
            const tokenInput = document.querySelector('input[name="accessToken"]');
            if (tokenInput && tokenInput.value && tokenInput.value.startsWith('EAAG')) {
                console.log('✅ Token encontrado en input del DOM');
                return tokenInput.value;
            }
            
            // Método 7: Verificar si hay instancia de FB ya inicializada globalmente
            if (typeof window.fb !== 'undefined' && window.fb && typeof window.fb.getAccessToken === 'function') {
                try {
                    const tokenData = await window.fb.getAccessToken();
                    if (tokenData && tokenData.accessToken) {
                        console.log('✅ Token obtenido de instancia global FB');
                        return tokenData.accessToken;
                    }
                } catch (e) {
                    console.warn('⚠️ Error con instancia global FB:', e);
                }
            }
            
            console.warn('❌ No se pudo obtener token del sistema DivinAds');
            return null;
            
        } catch (error) {
            console.error('❌ Error obteniendo token DivinAds:', error);
            return null;
        }
    }

    /**
     * getSelectedPages
     * Descripción: Obtiene páginas seleccionadas de la tabla con IDs reales de Facebook
     * Retorna: Array<Object>
     */
    function getSelectedPages() {
        try {
            console.log('📋 Obteniendo páginas seleccionadas...');
            
            // Intentar obtener de la tabla ag-grid
            if (typeof accountGrid !== "undefined" && accountGrid.api) {
                const selectedRows = accountGrid.api.getSelectedRows();
                console.log(`📊 ag-grid encontró ${selectedRows.length} filas seleccionadas:`, selectedRows);
                
                if (selectedRows.length > 0) {
                    // Mapear los datos para obtener los IDs reales de Facebook
                    const mappedRows = selectedRows.map(row => {
                        // Buscar el ID real de Facebook en diferentes campos posibles
                        const facebookId = row.pageId || row.facebook_id || row.fb_id || row.real_id || 
                                         row.page_id || row.fbId || row.facebookId || row.socialId || 
                                         row.externalId || row.platformId;
                        
                        const realName = row.name || row.pageName || row.page_name || row.title;
                        
                        console.log('🔍 Datos de fila:', {
                            original: row,
                            facebookId: facebookId,
                            realName: realName,
                            allFields: Object.keys(row)
                        });
                        
                        return {
                            ...row,
                            id: facebookId || row.id, // Usar ID de Facebook si existe, sino el original
                            name: realName,
                            originalId: row.id, // Mantener ID original para referencia
                            hasFacebookId: !!facebookId
                        };
                    });
                    
                    // Validar que las filas tengan datos válidos
                    const validRows = mappedRows.filter(row => {
                        const hasId = row.id;
                        const hasName = row.name;
                        if (!hasId || !hasName) {
                            console.warn('⚠️ Fila con datos incompletos:', row);
                            return false;
                        }
                        
                        // Verificar si tenemos un ID de Facebook real
                        if (!row.hasFacebookId && String(row.id).length < 10) {
                            console.warn(`⚠️ Posible ID interno detectado para "${row.name}": ${row.id}. Buscando ID real...`);
                        }
                        
                        return true;
                    });
                    
                    console.log(`✅ ${validRows.length} filas válidas de ${selectedRows.length} seleccionadas`);
                    return validRows;
                }
            } else {
                console.warn('⚠️ accountGrid no disponible, probando método alternativo...');
            }
            
            // Fallback: buscar filas seleccionadas en la tabla manualmente
            const selectedRows = [];
            const selectedElements = $('#accounts .ag-row-selected');
            
            console.log(`🔍 Método fallback: encontrados ${selectedElements.length} elementos seleccionados`);
            
            selectedElements.each(function() {
                const rowData = $(this).data('row') || {};
                const cellText = $(this).find('.ag-cell').text();
                
                console.log('🔍 Elemento seleccionado:', {
                    rowData: rowData,
                    cellText: cellText,
                    element: this
                });
                
                // Buscar ID de Facebook en los datos
                const facebookId = rowData.pageId || rowData.facebook_id || rowData.fb_id;
                
                if (rowData.id || rowData.pageId || facebookId) {
                    selectedRows.push({
                        ...rowData,
                        id: facebookId || rowData.pageId || rowData.id,
                        originalId: rowData.id,
                        hasFacebookId: !!facebookId
                    });
                } else {
                    // Intentar extraer datos de las celdas visibles
                    const cells = $(this).find('.ag-cell');
                    if (cells.length > 0) {
                        const extractedData = {
                            id: cells.eq(0).text() || 'unknown',
                            name: cells.eq(1).text() || 'Sin nombre',
                            originalId: cells.eq(0).text(),
                            hasFacebookId: false
                        };
                        console.log('📤 Datos extraídos de celdas:', extractedData);
                        selectedRows.push(extractedData);
                    }
                }
            });
            
            console.log(`📊 Método fallback retorna ${selectedRows.length} filas:`, selectedRows);
            return selectedRows;
            
        } catch (error) {
            console.error('❌ Error obteniendo páginas seleccionadas:', error);
            return [];
        }
    }

    /**
     * shouldProcessComment
     * Descripción: Filtra comentarios según criterios configurados
     * Parámetros: comment (objeto), filters (objeto)
     * Retorna: boolean
     */
    function shouldProcessComment(comment, filters) {
        const commentType = $('#commentType').val();
        const commentFilters = $('textarea[name="commentFilters"]').val().split('\n').filter(f => f.trim());
        const includeReplies = $('#includeReplies').is(':checked');
        
        // Filtro por fecha (comentarios recientes)
        if (commentType === 'recent') {
            const commentDate = new Date(comment.created_time);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            if (commentDate < sevenDaysAgo) return false;
        }
        
        // Filtro por contenido (palabras específicas)
        if (commentType === 'contains' && commentFilters.length > 0) {
            const message = comment.message ? comment.message.toLowerCase() : '';
            const hasKeyword = commentFilters.some(keyword => 
                message.includes(keyword.trim().toLowerCase())
            );
            if (!hasKeyword) return false;
        }
        
        // Filtro por usuario específico
        if (commentType === 'user' && commentFilters.length > 0) {
            const userId = comment.from ? comment.from.id : '';
            if (!commentFilters.includes(userId)) return false;
        }
        
        // Filtro básico de spam (palabras comunes de spam)
        if (commentType === 'spam') {
            const message = comment.message ? comment.message.toLowerCase() : '';
            const spamKeywords = ['spam', 'bot', 'fake', 'scam', 'virus', 'hack', 'oferta', 'gratis', 'click aqui'];
            const isSpam = spamKeywords.some(keyword => message.includes(keyword));
            if (!isSpam) return false;
        }
        
        return true;
    }

    /**
     * processPageComments
     * Descripción: Procesa comentarios de una página específica
     * Parámetros: pageData (objeto), token (string)
     * Retorna: Promise<Object>
     */
    async function processPageComments(pageData, token) {
        const pageId = pageData.id || pageData.pageId;
        const pageName = pageData.name || pageData.pageName || `Página ${pageId}`;
        const pageToken = pageData.access_token || token;
        const action = $('#commentAction').val();
        const limit = parseInt($('input[name="commentLimit"]').val()) || 100;
        const delay = parseFloat($('input[name="commentDelay"]').val()) * 1000 || 1000;
        const includeReplies = $('#includeReplies').is(':checked');
        
        let processedCount = 0;
        let errorCount = 0;
        
        updateCommentProgress(totalPagesProcessed, totalPagesProcessed + 1, `Procesando ${pageName}...`);
        
        try {
            // Validar ID de página
            if (!pageId || pageId === '1' || pageId === 'undefined') {
                throw new Error(`ID de página inválido: ${pageId}`);
            }
            
            // Validación adicional: verificar que sea un ID numérico válido de Facebook
            if (!/^\d{10,}$/.test(String(pageId))) {
                throw new Error(`Formato de ID inválido: ${pageId}. Los IDs de páginas de Facebook deben ser números de al menos 10 dígitos.`);
            }
            
            // Validar nombres placeholder
            const invalidNames = ['no usar', 'ejemplo', 'test', 'placeholder', 'demo'];
            if (invalidNames.some(invalid => String(pageName).toLowerCase().includes(invalid))) {
                throw new Error(`Página placeholder detectada: "${pageName}". Selecciona páginas reales de Facebook.`);
            }
            
            console.log(`📋 Procesando página: ${pageName} (ID: ${pageId})`);
            
            // Obtener posts de la página con comentarios usando fetch2
            const fieldsQuery = includeReplies ? 
                'comments{id,message,created_time,from,comments{id,message,created_time,from}}' :
                'comments{id,message,created_time,from}';
            
            const apiUrl = `https://graph.facebook.com/v17.0/${pageId}/feed?fields=${fieldsQuery}&access_token=${pageToken}&limit=${limit}`;
            console.log(`📡 Consultando API: ${apiUrl.substring(0, 100)}...`);
            
            // Usar fetch2 del sistema DivinAds para evitar CORS
            const response = await fetch2(apiUrl);
            
            if (!response || !response.json) {
                throw new Error('Respuesta inválida del servidor');
            }
            
            const data = response.json;
            console.log(`📊 Respuesta de API:`, data);
            
            if (data.error) {
                // Mensajes de error más específicos
                let errorMessage = data.error.message;
                if (data.error.code === 100) {
                    errorMessage = `Página inaccesible: "${pageName}" (ID: ${pageId}). Puede ser que no exista, no tengas permisos, o sea una página de ejemplo.`;
                } else if (data.error.code === 190) {
                    errorMessage = `Token de acceso inválido o expirado.`;
                } else if (data.error.code === 10) {
                    errorMessage = `Permisos insuficientes para acceder a la página "${pageName}".`;
                }
                throw new Error(`${errorMessage} (Código: ${data.error.code})`);
            }
            
            if (!data.data || data.data.length === 0) {
                addCommentResult(`Sin posts encontrados en ${pageName}`, 'success');
                return { processedCount: 0, errorCount: 0 };
            }
            
            console.log(`📝 Encontrados ${data.data.length} posts en ${pageName}`);
            
            // Procesar cada post
            for (const post of data.data) {
                if (post.comments && post.comments.data) {
                    console.log(`📄 Post ${post.id}: ${post.comments.data.length} comentarios`);
                    
                    // Procesar comentarios principales
                    for (const comment of post.comments.data) {
                        if (shouldProcessComment(comment, {})) {
                            try {
                                const result = await processIndividualComment(comment, pageToken, action, pageName);
                                if (result.success) {
                                    processedCount++;
                                    totalCommentsProcessed++;
                                } else {
                                    errorCount++;
                                    totalErrors++;
                                }
                            } catch (commentError) {
                                errorCount++;
                                totalErrors++;
                                addCommentResult(`Error en comentario: ${commentError.message}`, 'error');
                            }
                            
                            // Delay entre operaciones
                            await new Promise(resolve => setTimeout(resolve, delay));
                        }
                        
                        // Procesar respuestas si están incluidas
                        if (includeReplies && comment.comments && comment.comments.data) {
                            for (const reply of comment.comments.data) {
                                if (shouldProcessComment(reply, {})) {
                                    try {
                                        const result = await processIndividualComment(reply, pageToken, action, pageName);
                                        if (result.success) {
                                            processedCount++;
                                            totalCommentsProcessed++;
                                        } else {
                                            errorCount++;
                                            totalErrors++;
                                        }
                                    } catch (replyError) {
                                        errorCount++;
                                        totalErrors++;
                                        addCommentResult(`Error en respuesta: ${replyError.message}`, 'error');
                                    }
                                    
                                    await new Promise(resolve => setTimeout(resolve, delay));
                                }
                            }
                        }
                    }
                }
            }
            
            addCommentResult(`${pageName}: ${processedCount} comentarios procesados`, 'success');
            return { processedCount, errorCount };
            
        } catch (error) {
            console.error(`❌ Error procesando ${pageName}:`, error);
            addCommentResult(`Error en ${pageName}: ${error.message}`, 'error');
            return { processedCount: 0, errorCount: 1 };
        }
    }

    /**
     * processIndividualComment
     * Descripción: Procesa un comentario individual según la acción configurada
     * Parámetros: comment (objeto), pageToken (string), action (string), pageName (string)
     * Retorna: Promise<Object>
     */
    async function processIndividualComment(comment, pageToken, action, pageName) {
        try {
            let success = false;
            let message = '';
            
            // Validar ID del comentario
            if (!comment.id) {
                throw new Error('ID de comentario inválido');
            }
            
            switch (action) {
                case 'delete':
                    // Usar fetch2 para eliminar comentario
                    const deleteUrl = `https://graph.facebook.com/v17.0/${comment.id}?access_token=${pageToken}`;
                    const deleteResponse = await fetch2(deleteUrl, {
                        method: 'DELETE'
                    });
                    
                    success = deleteResponse && deleteResponse.json && !deleteResponse.json.error;
                    message = success ? 'Eliminado' : 'Error eliminando';
                    break;
                    
                case 'hide':
                    // Usar fetch2 para ocultar comentario
                    const hideUrl = `https://graph.facebook.com/v17.0/${comment.id}?access_token=${pageToken}`;
                    const hideResponse = await fetch2(hideUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'is_hidden=true'
                    });
                    
                    success = hideResponse && hideResponse.json && !hideResponse.json.error;
                    message = success ? 'Ocultado' : 'Error ocultando';
                    break;
                    
                case 'count':
                    success = true;
                    message = 'Contado';
                    break;
                    
                case 'export':
                    const commentData = {
                        id: comment.id,
                        message: comment.message || '',
                        author: comment.from?.name || 'Usuario desconocido',
                        authorId: comment.from?.id || '',
                        date: comment.created_time,
                        page: pageName
                    };
                    addCommentResult(`${pageName}: "${commentData.message}" - ${commentData.author} (${commentData.date})`, 'success');
                    success = true;
                    message = 'Exportado';
                    break;
            }
            
            return { success, message };
        } catch (error) {
            console.error(`❌ Error procesando comentario individual:`, error);
            return { success: false, message: error.message };
        }
    }

    /**
     * updateCommentProgress
     * Descripción: Actualiza la barra de progreso de comentarios
     * Parámetros: current (number), total (number), message (string)
     */
    function updateCommentProgress(current, total, message) {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        $('#commentProgressBar').css('width', percentage + '%');
        $('#commentProgressText').text(message);
        $('#commentProgressArea').show();
    }

    /**
     * addCommentResult
     * Descripción: Agrega resultado de procesamiento a las áreas de resultados
     * Parámetros: message (string), type (string)
     */
    function addCommentResult(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const targetArea = type === 'error' ? '#commentErrorResults' : '#commentSuccessResults';
        const countArea = type === 'error' ? '#commentErrorCount' : '#commentSuccessCount';
        
        $(targetArea).val($(targetArea).val() + `[${timestamp}] ${message}\n`);
        $(targetArea).scrollTop($(targetArea)[0].scrollHeight);
        
        // Actualizar contador
        const currentCount = parseInt($(countArea).text()) || 0;
        $(countArea).text(currentCount + 1);
        
        $('#commentResultsArea').show();
    }

    /**
     * processCommentsMain
     * Descripción: Función principal de procesamiento integrada con DivinAds
     * Retorna: Promise<boolean>
     */
    async function processCommentsMain() {
        if (!$('input[name="commentManagement"]').is(':checked')) {
            return false; // No procesar si no está habilitado
        }
        
        if (commentProcessing) {
            console.log('⚠️ Procesamiento de comentarios ya en curso');
            return false;
        }
        
        commentProcessing = true;
        totalPagesProcessed = 0;
        totalCommentsProcessed = 0;
        totalErrors = 0;
        
        try {
            // Obtener token del sistema DivinAds
            const token = await getDivinAdsToken();
            
            if (!token) {
                throw new Error('No se pudo obtener el token de acceso del sistema DivinAds');
            }
            
            // Obtener páginas seleccionadas
            const selectedPages = getSelectedPages();
            if (selectedPages.length === 0) {
                throw new Error('No hay páginas seleccionadas en la tabla principal');
            }
            
            // Validar páginas seleccionadas
            const validPages = [];
            for (const page of selectedPages) {
                const pageId = page.id || page.pageId;
                const pageName = page.name || page.pageName || `Página ${pageId}`;
                
                console.log('🔍 DEBUG - Analizando página:', {
                    page: page,
                    pageId: pageId,
                    pageName: pageName,
                    originalId: page.originalId,
                    hasFacebookId: page.hasFacebookId,
                    allKeys: Object.keys(page)
                });
                
                // Lista de IDs y nombres inválidos/placeholder
                const invalidIds = ['1', '0', 'undefined', 'null', '', null, undefined];
                const invalidNames = ['no usar', 'ejemplo', 'test', 'placeholder', 'demo', 'sin nombre'];
                
                // Validar ID básico
                if (!pageId || invalidIds.includes(String(pageId).toLowerCase())) {
                    addCommentResult(`⚠️ Página saltada por ID inválido: "${pageName}" (ID: ${pageId})`, 'error');
                    totalErrors++;
                    continue;
                }
                
                // Validar nombre (páginas placeholder)
                if (invalidNames.some(invalid => String(pageName).toLowerCase().includes(invalid))) {
                    addCommentResult(`⚠️ Página saltada (placeholder): "${pageName}" (ID: ${pageId})`, 'error');
                    totalErrors++;
                    continue;
                }
                
                // Validación de formato más flexible para debugging
                const isShortId = String(pageId).length < 10;
                const isNumericId = /^\d+$/.test(String(pageId));
                
                if (isShortId && isNumericId) {
                    // Es probable que sea un ID interno, pero vamos a permitirlo temporalmente con advertencia
                    addCommentResult(`⚠️ ADVERTENCIA: "${pageName}" usa ID interno (${pageId}). Puede fallar. Buscando ID real de Facebook...`, 'info');
                    console.warn(`🔍 ID posiblemente interno detectado:`, {
                        name: pageName,
                        id: pageId,
                        page: page
                    });
                    
                    // Buscar en otros campos posibles el ID real
                    const possibleRealId = page.facebookPageId || page.fbPageId || page.pageIdFb || 
                                         page.facebook_page_id || page.fb_page_id || page.social_id ||
                                         page.external_page_id || page.real_page_id;
                    
                    if (possibleRealId && String(possibleRealId).length >= 10) {
                        console.log(`✅ ID real encontrado para ${pageName}: ${possibleRealId}`);
                        addCommentResult(`✅ ID real encontrado para "${pageName}": ${possibleRealId}`, 'success');
                        page.id = possibleRealId; // Usar el ID real
                        pageId = possibleRealId;
                    }
                }
                
                // Permitir la página para procesamiento (temporalmente)
                validPages.push({
                    ...page,
                    id: pageId,
                    name: pageName,
                    isInternalId: isShortId && isNumericId
                });
                
                console.log(`✅ Página agregada: ${pageName} (ID: ${pageId}${isShortId ? ' - POSIBLE INTERNO' : ' - VÁLIDO'})`);
            }
            
            if (validPages.length === 0) {
                const errorMsg = selectedPages.length > 0 ? 
                    'Todas las páginas seleccionadas son inválidas o placeholder. Selecciona páginas reales de Facebook.' :
                    'No hay páginas seleccionadas en la tabla principal.';
                throw new Error(errorMsg);
            }
            
            // Mostrar resumen de IDs detectados
            const internalIds = validPages.filter(p => p.isInternalId);
            const realIds = validPages.filter(p => !p.isInternalId);
            
            addCommentResult(`📊 RESUMEN: ${realIds.length} IDs reales, ${internalIds.length} IDs internos detectados`, 'info');
            
            if (internalIds.length > 0) {
                addCommentResult(`⚠️ Las páginas con IDs internos pueden fallar. Por favor revisa los logs para encontrar los IDs reales.`, 'info');
            }
            
            const action = $('#commentAction').val();
            const confirmEach = $('#confirmEach').is(':checked');
            
            addCommentResult(`Iniciando procesamiento de ${validPages.length} páginas válidas (${selectedPages.length - validPages.length} saltadas)`, 'info');
            addCommentResult(`Acción: ${action}`, 'info');
            addCommentResult(`Token detectado: ${token.substring(0, 20)}...`, 'info');
            
            // Mostrar páginas válidas
            validPages.forEach((page, index) => {
                addCommentResult(`${index + 1}. ${page.name} (ID: ${page.id})`, 'info');
            });
            
            // Confirmar procesamiento masivo si es eliminación y no es por página
            if (!confirmEach && (action === 'delete' || action === 'hide')) {
                const confirmation = await Swal.fire({
                    title: '⚠️ Confirmar Acción Masiva',
                    html: `
                        <p>¿${action === 'delete' ? 'Eliminar' : 'Ocultar'} comentarios de <strong>${validPages.length} páginas</strong>?</p>
                        <p class="text-danger">Esta acción ${action === 'delete' ? 'no se puede deshacer' : 'ocultará los comentarios'}.</p>
                        <div class="text-start mt-3">
                            <strong>Páginas a procesar:</strong>
                            <ul class="small">
                                ${validPages.slice(0, 5).map(p => `<li>${p.name} (${p.id})</li>`).join('')}
                                ${validPages.length > 5 ? `<li>... y ${validPages.length - 5} más</li>` : ''}
                            </ul>
                        </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: action === 'delete' ? '#dc3545' : '#fd7e14',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'Sí, continuar',
                    cancelButtonText: 'Cancelar'
                });
                
                if (!confirmation.isConfirmed) {
                    commentProcessing = false;
                    return false;
                }
            }
            
            // Procesar cada página válida
            for (let i = 0; i < validPages.length; i++) {
                const page = validPages[i];
                
                // Confirmar página individual si está habilitado
                if (confirmEach) {
                    const confirm = await Swal.fire({
                        title: `Procesar página ${i + 1}/${validPages.length}`,
                        text: `${page.name} (ID: ${page.id})`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Procesar',
                        cancelButtonText: 'Saltar'
                    });
                    
                    if (!confirm.isConfirmed) {
                        addCommentResult(`Saltada: ${page.name}`, 'info');
                        continue;
                    }
                }
                
                try {
                    await processPageComments(page, token);
                    totalPagesProcessed++;
                } catch (pageError) {
                    addCommentResult(`Error en página ${page.name}: ${pageError.message}`, 'error');
                    totalErrors++;
                }
                
                updateCommentProgress(i + 1, validPages.length, `Completadas ${i + 1}/${validPages.length} páginas`);
            }
            
            // Resumen final
            updateCommentProgress(validPages.length, validPages.length, 'Proceso completado');
            addCommentResult(`RESUMEN: ${totalPagesProcessed} páginas, ${totalCommentsProcessed} comentarios, ${totalErrors} errores`, 'info');
            
            Swal.fire({
                title: '✅ Proceso Completado',
                html: `
                    <p><strong>Páginas procesadas:</strong> ${totalPagesProcessed}</p>
                    <p><strong>Comentarios procesados:</strong> ${totalCommentsProcessed}</p>
                    <p><strong>Errores:</strong> ${totalErrors}</p>
                `,
                icon: 'success'
            });
            
            return true;
            
        } catch (error) {
            addCommentResult(`Error general: ${error.message}`, 'error');
            
            Swal.fire({
                title: '❌ Error',
                text: error.message,
                icon: 'error'
            });
            
            return false;
        } finally {
            commentProcessing = false;
        }
    }

    // =============================================================================
    // INTEGRACIÓN CON EL BOTÓN PRINCIPAL "INICIAR"
    // =============================================================================

    // Hook al botón principal de inicio
    const originalStartHandler = $('#start').attr('onclick') || $('#start').data('click-handler');
    
    $('#start').off('click').on('click', async function() {
        // Si la gestión de comentarios está habilitada, procesarla
        if ($('input[name="commentManagement"]').is(':checked')) {
            console.log('🔄 Iniciando gestión de comentarios...');
            await processCommentsMain();
            return;
        }
        
        // Si no, ejecutar el handler original
        if (originalStartHandler && typeof window[originalStartHandler] === 'function') {
            window[originalStartHandler]();
        } else if (window.startPageProcess && typeof window.startPageProcess === 'function') {
            window.startPageProcess();
        } else {
            console.log('🔄 Ejecutando proceso estándar de páginas...');
            // Intentar ejecutar función estándar si existe
            if (typeof window.start === 'function') {
                window.start();
            }
        }
    });

    // =============================================================================
    // EVENT HANDLERS PARA CONFIGURACIÓN DE TOKEN
    // =============================================================================

    /**
     * Event Handler: Mostrar información del token actual
     */
    $('#configureTokenBtn').on('click', async function() {
        const token = await getDivinAdsToken();
        
        if (token) {
            Swal.fire({
                title: '🔑 Token de Acceso Detectado',
                html: `
                    <div class="text-start">
                        <p><strong>✅ Token encontrado en el sistema DivinAds:</strong></p>
                        <p><code style="font-size: 0.9em; word-break: break-all;">${token.substring(0, 50)}...</code></p>
                        <hr>
                        <small class="text-muted">
                            <strong>Información:</strong><br>
                            • El token se obtuvo automáticamente del sistema DivinAds<br>
                            • Se usa el mismo token que para otras funciones del sistema<br>
                            • No es necesario configurar nada manualmente
                        </small>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Entendido'
            });
        } else {
            Swal.fire({
                title: '⚠️ Token No Detectado',
                html: `
                    <div class="text-start">
                        <p><strong>No se pudo detectar el token de acceso.</strong></p>
                        <p>Esto puede deberse a:</p>
                        <ul>
                            <li>No hay sesión activa en Facebook Business</li>
                            <li>El token no está en localStorage</li>
                            <li>La instancia FB no está inicializada</li>
                        </ul>
                        <hr>
                        <p><strong>Soluciones:</strong></p>
                        <ol>
                            <li>Ir a la página de inicio y hacer login</li>
                            <li>Verificar que el sistema DivinAds esté funcionando</li>
                            <li>Intentar usar otra funcionalidad primero</li>
                        </ol>
                    </div>
                `,
                icon: 'warning',
                confirmButtonText: 'Entendido'
            });
        }
    });

    /**
     * Event Handler: Limpiar datos del sistema
     */
    $('#clearTokenBtn').on('click', async function() {
        const confirmation = await Swal.fire({
            title: '⚠️ Confirmar Limpieza',
            html: `
                <p>¿Estás seguro de que quieres limpiar los datos del sistema?</p>
                <p class="text-warning">Esto limpiará:</p>
                <ul class="text-start">
                    <li>Cache de conteo de comentarios</li>
                    <li>Resultados de procesamiento</li>
                    <li>Progreso actual</li>
                </ul>
                <p class="text-info small">No se afectarán los tokens del sistema DivinAds</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar'
        });
        
        if (confirmation.isConfirmed) {
            try {
                // Limpiar resultados de la interfaz
                $('#commentSuccessResults').val('');
                $('#commentErrorResults').val('');
                $('#commentSuccessCount').text('0');
                $('#commentErrorCount').text('0');
                $('#commentProgressArea').hide();
                $('#commentResultsArea').hide();
                
                // Resetear variables de procesamiento
                totalPagesProcessed = 0;
                totalCommentsProcessed = 0;
                totalErrors = 0;
                commentProcessing = false;
                
                console.log('🗑️ Sistema de comentarios limpiado');
                
                Swal.fire({
                    title: '✅ Sistema Limpiado',
                    text: 'Se han limpiado los datos de procesamiento de comentarios.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    title: '❌ Error',
                    text: 'No se pudo limpiar completamente: ' + error.message,
                    icon: 'error'
                });
            }
        }
    });

    console.log('✅ Gestión de Comentarios integrada correctamente con DivinAds');
});