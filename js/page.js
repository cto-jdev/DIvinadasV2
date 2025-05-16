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
    headerName: "Trạng thái",
    filter: "agSetColumnFilter",
    cellRenderer: p5 => {
      let vLS = "";
      if (p5.data.status === 1) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">HCVV</strong></span>";
      }
      if (p5.data.status === 2) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">Cần kháng</strong></span>";
      }
      if (p5.data.status === 3) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-info\">Đang kháng</strong></span>";
      }
      if (p5.data.status === 4) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">Live</strong></span>";
      }
      if (p5.data.status === 5) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-primary rounded-circle me-2\"></span><strong class=\"text-primary\">XMDT</strong></span>";
      }
      if (p5.data.status === 6) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-secondary rounded-circle me-2\"></span><strong class=\"text-secondary\">Page kháng</strong></span>";
      }
      return vLS;
    }
  }, {
    field: "name",
    headerName: "Tên",
    minWidth: 250,
    cellRenderer: p6 => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <img src=\"" + p6.data.avatar + "\" height=\"30\" class=\"rounded-circle\">\n                    <a href=\"https://www.facebook.com/profile.php?id=" + p6.data.pageId + "\" target=\"_BLANK\" class=\"ps-3 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + p6.data.name + "</strong>\n                        <span>" + p6.data.pageId + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "id",
    hide: true
  }, {
    field: "pageId",
    headerName: "Page ID"
  }, {
    field: "process",
    headerName: "Process",
    cellRenderer: p7 => {
      if (p7.data.process === "RUNNING") {
        return "<span class=\"badge text-bg-warning\" style=\"font-size: 10px\">RUNNING</span>";
      }
      if (p7.data.process === "FINISHED") {
        return "<span class=\"badge text-bg-success\" style=\"font-size: 10px\">FINISHED</span>";
      }
    }
  }, {
    field: "message",
    minWidth: 300,
    headerName: "Message"
  }, {
    field: "pageId2",
    hide: true
  }, {
    field: "role",
    headerName: "Quyền"
  }, {
    field: "bm",
    headerName: "BM"
  }, {
    field: "createdDate",
    headerName: "Ngày tạo"
  }, {
    field: "like",
    headerName: "Like"
  }, {
    field: "follow",
    headerName: "Follow"
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
    getRowId: function (p8) {
      return p8.data.id;
    },
    onFirstDataRendered: function (p9) {
      countStatus(p9, 0);
    },
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
    onSelectionChanged: function (p11) {
      const v13 = p11.api.getSelectedRows();
      $("#dachon").text(v13.length);
    },
    onRowDataUpdated: function (p12) {
      $("#tong").text(p12.api.getDisplayedRowCount());
    },
    onFilterChanged: function (p13) {
      $("#tong").text(p13.api.getDisplayedRowCount());
    },
    rowClassRules: {
      running: function (p14) {
        return p14.data.status === "RUNNING";
      },
      finished: function (p15) {
        return p15.data.status === "FINISHED";
      }
    },
    onBodyScroll: function (p16) {
      scrolling = true;
    },
    onBodyScrollEnd: function (p17) {
      scrolling = false;
    },
    noRowsOverlayComponent: class CustomNoRowsOverlay {
      eGui;
      init(p18) {
        this.eGui = document.createElement("div");
        this.refresh(p18);
      }
      getGui() {
        return this.eGui;
      }
      refresh(p19) {
        this.eGui.innerHTML = "<img width=\"300\" src=\"../img/no_data.png\">";
      }
    }
  };
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
      setInterval(async () => {
        if ($("body").hasClass("setting-loaded")) {
          saveSetting();
        }
        if ($("body").hasClass("data-loaded")) {
          const vA2 = [];
          accountGrid.api.forEachNode(function (p20) {
            vA2.push(p20.data);
          });
          if (vA2.length > 0) {
            await setLocalStorage("dataPage_" + fb.uid, vA2);
          }
          const v19 = accountGrid.columnApi.getColumnState();
          await setLocalStorage("statePage", v19);
        }
      }, 2000);
    }
  });
  $(document).on("loadSavedPage", function (p21, p22) {
    p22 = p22.map(p23 => {
      p23.process = "";
      return p23;
    });
    accountGrid.api.setRowData(p22);
  });
  const pageMap = [];
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
  $(document).on("updatePageStatus", function (p27, p28) {
    const v20 = pageMap.filter(p29 => p29.pageId == p28.id)[0].id;
    console.log(v20);
    accountGrid.api.getRowNode(v20).setDataValue("status", p28.status);
  });
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