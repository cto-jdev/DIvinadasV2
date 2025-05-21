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
    headerName: "Trạng thái",
    filter: "agSetColumnFilter",
    cellRenderer: p5 => {
      let vLS = "";
      if (p5.data.status == 101) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-secondary rounded-circle me-2\"></span><strong class=\"text-info\">Đóng</strong></span>";
      }
      if (p5.data.status == 999) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-info rounded-circle me-2\"></span><strong class=\"text-secondary\">Hold</strong></span>";
      }
      if (p5.data.status == 1 || p5.data.status == 100) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">Hoạt động</strong></span>";
      }
      if (p5.data.status == 2) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Vô hiệu hóa</strong></span>";
      }
      if (p5.data.status == 3) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">Cần thanh toán</strong></span>";
      }
      if (p5.data.status == 4) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-warning rounded-circle me-2\"></span><strong class=\"text-warning\">Đang kháng 3 dòng</strong></span>";
      }
      if (p5.data.status == 5) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Die 3 dòng</strong></span>";
      }
      if (p5.data.status == 6) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Die XMDT</strong></span>";
      }
      if (p5.data.status == 7) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">Die vĩnh viễn</strong></span>";
      }
      return vLS;
    }
  }, {
    field: "account",
    headerName: "Tài khoản",
    minWidth: 250,
    cellRenderer: p6 => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <span class=\"avatar-letter\" data-letter=\"" + p6.data.account.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                    <a href=\"https://business.facebook.com/billing_hub/payment_settings/?asset_id=" + p6.data.adId + "\" target=\"_BLANK\" class=\"ps-3 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + p6.data.account + "</strong>\n                        <span>" + p6.data.adId + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "id",
    hide: true
  }, {
    field: "adId",
    headerName: "ID TKQC"
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
    headerName: "Message",
    minWidth: 300
  }, {
    field: "balance",
    headerName: "Số dư",
    cellRenderer: p8 => {
      return "<span class=\"currency\" data-value=\"" + p8.data.balance.toString().replaceAll(",", "") + "\" data-currency=\"" + p8.data.currency.split("-")[0] + "\">" + p8.data.balance + "</span>";
    }
  }, {
    field: "threshold",
    headerName: "Ngưỡng",
    cellRenderer: p9 => {
      return "<span class=\"currency\" data-value=\"" + p9.data.threshold.toString().replaceAll(",", "") + "\" data-currency=\"" + p9.data.currency.split("-")[0] + "\">" + p9.data.threshold + "</span>";
    }
  }, {
    field: "remain",
    headerName: "Ngưỡng còn lại",
    cellRenderer: p10 => {
      return "<span class=\"currency\" data-value=\"" + p10.data.remain.toString().replaceAll(",", "") + "\" data-currency=\"" + p10.data.currency.split("-")[0] + "\">" + p10.data.remain + "</span>";
    }
  }, {
    field: "limit",
    headerName: "Limit",
    cellRenderer: p11 => {
      return "<span class=\"currency\" data-value=\"" + p11.data.limit.toString().replaceAll(",", "") + "\" data-currency=\"" + p11.data.currency.split("-")[0] + "\">" + p11.data.limit + "</span>";
    }
  }, {
    field: "spend",
    headerName: "Tổng tiêu"
  }, {
    field: "currency",
    headerName: "Tiền tệ"
  }, {
    field: "adminNumber",
    headerName: "SL Admin"
  }, {
    field: "role",
    headerName: "Quyền sở hữu"
  }, {
    field: "payment",
    headerName: "Thanh toán",
    minWidth: 200,
    cellRenderer: p12 => {
      let vLS2 = "";
      if (p12.data.payment) {
        const v12 = JSON.parse(p12.data.payment);
        if (v12.length > 0) {
          const v13 = v12.map(p13 => {
            if (p13.credential.__typename === "AdsToken") {
              p13.img = "../img/credit.svg";
              p13.credential.last_four_digits = 1007;
            }
            if (p13.credential.__typename === "PaymentPaypalBillingAgreement") {
              p13.img = "../img/paypal.svg";
              p13.credential.last_four_digits = "PayPal";
            }
            if (p13.credential.__typename === "DirectDebit") {
              p13.img = "../img/direct.svg";
            }
            if (p13.credential.card_association === "AMERICANEXPRESS") {
              p13.img = "../img/amex.svg";
            }
            if (p13.credential.card_association === "VISA") {
              p13.img = "../img/visa.svg";
            }
            if (p13.credential.card_association === "MASTERCARD") {
              p13.img = "../img/mastercard.svg";
            }
            return p13;
          });
          let v14 = v13.filter(p14 => p14.is_primary)[0];
          if (!v14) {
            v14 = v13[0];
          }
          vLS2 = "<div class=\"accountPayments\" style=\"line-height: initial;\">";
          let vLS3 = "";
          if (v14.usability === "USABLE") {
            vLS3 = "<span class=\"badge rounded-pill text-bg-success\">Hoạt động</span>";
          }
          if (v14.usability === "PENDING_VERIFICATION" || v14.usability === "UNVERIFIED_OR_PENDING_AUTH") {
            vLS3 = "<span class=\"badge rounded-pill text-bg-warning\">Xác minh</span>";
          }
          if (v14.usability === "ADS_PAYMENTS_RESTRICTED" || v14.usability === "UNVERIFIABLE") {
            vLS3 = "<span class=\"badge rounded-pill text-bg-danger\">Hạn chế</span>";
          }
          vLS2 += "\n                        <div class=\"d-flex align-items-center\">\n                            <img src=\"" + v14.img + "\" class=\"me-2\"><strong>" + v14.credential.last_four_digits + "</strong><span class=\"mx-1\">&#8226;</span><span>" + vLS3 + "</span>\n                        </div>\n\n                    ";
          if (v13.length > 1) {
            vLS2 += "\n                            <strong class=\"more text-primary d-block\" style=\"margin-top: 2px\">" + (v13.length - 1) + " thẻ khác...</strong>\n                            <div class=\"subMenu d-none\">\n                        ";
            v13.forEach(p15 => {
              let vLS4 = "";
              let vLS5 = "";
              if (!p15.credential.email) {
                vLS4 = "<small>Ngày hết hạn: " + p15.credential.expiry_month + "/" + p15.credential.expiry_year + "</small>";
              } else {
                vLS4 = "<small>" + p15.credential.email + "</small>";
              }
              if (p15.usability === "USABLE") {
                vLS5 = "<span class=\"badge rounded-pill text-bg-success\">Hoạt động</span>";
              }
              if (p15.usability === "PENDING_VERIFICATION" || p15.usability === "UNVERIFIED_OR_PENDING_AUTH") {
                vLS5 = "<span class=\"badge rounded-pill text-bg-warning\">Xác minh</span>";
              }
              if (p15.usability === "ADS_PAYMENTS_RESTRICTED" || p15.usability === "UNVERIFIABLE") {
                vLS5 = "<span class=\"badge rounded-pill text-bg-danger\">Hạn chế</span>";
              }
              if (p15.credential.__typename === "AdsToken") {
                vLS4 = "";
              }
              vLS2 += "\n                                <div class=\"cardItem d-flex align-items-center\">\n                                    <img src=\"" + p15.img + "\" height=\"20\" class=\"me-3\"> \n                                    <div>\n                                        <span class=\"d-block\"><strong>" + p15.credential.last_four_digits + "</strong> &#8226; " + vLS5 + "</span>\n                                        " + vLS4 + "\n                                    </div>\n                                </div>\n                            ";
            });
            vLS2 += "</div>";
          }
          vLS2 += "</div>";
        }
      }
      return vLS2;
    }
  }, {
    field: "nextBillDate",
    headerName: "Ngày lập hóa đơn"
  }, {
    field: "nextBillDay",
    headerName: "Số ngày đến hạn TT"
  }, {
    field: "country",
    headerName: "Quốc gia"
  }, {
    field: "reason",
    headerName: "Lý do khóa"
  }, {
    field: "createdTime",
    headerName: "Ngày tạo"
  }, {
    field: "type",
    headerName: "Loại"
  }, {
    field: "bm",
    headerName: "BM"
  }, {
    field: "timezone",
    headerName: "Múi giờ"
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
    getRowId: function (p16) {
      return p16.data.id;
    },
    onFirstDataRendered: function (p17) {
      countStatus(p17, 0);
    },
    onRangeSelectionChanged: function (p18) {
      const v15 = p18.api.getCellRanges();
      if (v15.length) {
        let vLN02 = 0;
        if (v15[0].startRow.rowIndex < v15[0].endRow.rowIndex) {
          vLN02 = v15[0].endRow.rowIndex - (v15[0].startRow.rowIndex - 1);
        } else {
          vLN02 = v15[0].startRow.rowIndex - (v15[0].endRow.rowIndex - 1);
        }
        $("#boiden").text(vLN02);
      } else {
        $("#boiden").text(0);
      }
    },
    onSelectionChanged: function (p19) {
      const v16 = p19.api.getSelectedRows();
      $("#dachon").text(v16.length);
    },
    onRowDataUpdated: function (p20) {
      $("#tong").text(p20.api.getDisplayedRowCount());
    },
    onFilterChanged: function (p21) {
      $("#tong").text(p21.api.getDisplayedRowCount());
    },
    rowClassRules: {
      running: function (p22) {
        return p22.data.status === "RUNNING";
      },
      finished: function (p23) {
        return p23.data.status === "FINISHED";
      }
    },
    onBodyScroll: function (p24) {
      scrolling = true;
    },
    onBodyScrollEnd: function (p25) {
      scrolling = false;
    },
    noRowsOverlayComponent: class CustomNoRowsOverlay {
      eGui;
      init(p26) {
        this.eGui = document.createElement("div");
        this.refresh(p26);
      }
      getGui() {
        return this.eGui;
      }
      refresh(p27) {
        this.eGui.innerHTML = "<img width=\"300\" src=\"../img/no_data.png\">";
      }
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
    headerName: "Tên trên thẻ"
  }, {
    field: "cardNumber",
    headerName: "Số thẻ"
  }, {
    field: "expDate",
    headerName: "Ngày hết hạn"
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
    headerName: "Lượt dùng"
  }];
  const vO30 = {
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
      sortable: true
    },
    columnDefs: cardColumns,
    rowData: [],
    localeText: {
      noRowsToShow: ""
    }
  };
  const cardGrid = vO30;
  $(document).ready(async function () {
    const v17 = document.querySelector("#accounts");
    try {
      const v18 = document.querySelector("#cards");
      new agGrid.Grid(v18, cardGrid);
    } catch {}
    new agGrid.Grid(v17, accountGrid);
    const v19 = (await getLocalStorage("stateAds")) || [];
    const vO31 = {
      state: v19,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(vO31);
    const v20 = new URL(location.href);
    const v21 = v20.searchParams.get("id");
    if (v21) {
      const v22 = await getLocalStorage("dataAds_" + v21);
      $("#count").text(v22.length);
      accountGrid.api.setRowData(v22);
    } else {
      $(document).on("mouseover", "div[col-id=\"payment\"], div[col-id=\"hiddenAdmins\"]", function () {
        if ($(this).find(".more").length > 0 && $(".moreCard").length === 0) {
          const v23 = $(this).find(".more").offset();
          const v24 = parseInt($(this).find(".more").attr("offset")) || 2;
          const v25 = $(this).find(".subMenu").html();
          $("body").append("\n                    <div class=\"moreCard shadow rounded p-3\" style=\"top: " + (v23.top + v24) + "px; left: " + (v23.left - 10) + "px\">" + v25 + "</div>\n                ");
        }
      });
      $(document).on("mouseleave", "div[col-id=\"payment\"], div[col-id=\"hiddenAdmins\"]", function () {
        $(".moreCard").remove();
      });
      setInterval(async () => {
        if ($("body").hasClass("setting-loaded")) {
          saveSetting();
        }
        if ($("body").hasClass("data-loaded")) {
          const vA2 = [];
          accountGrid.api.forEachNode(function (p28) {
            vA2.push(p28.data);
          });
          if (vA2.length > 0) {
            await setLocalStorage("dataAds_" + fb.uid, vA2);
          }
          const v26 = accountGrid.columnApi.getColumnState();
          await setLocalStorage("stateAds", v26);
        }
      }, 2000);
    }
  });
  $(document).on("loadSavedAds", function (p29, p30) {
    p30 = p30.map(p31 => {
      p31.process = "";
      return p31;
    });
    accountGrid.api.setRowData(p30);
  });
  const adsMap = [];
  $(document).on("loadAdsSuccess", function (p32, p33) {
    let vLN1 = 1;
    p33 = p33.map(p34 => {
      const vO32 = {
        id: vLN1,
        adId: p34.adId
      };
      adsMap.push(vO32);
      p34.id = vLN1;
      vLN1++;
      return p34;
    });
    accountGrid.api.setRowData(p33);
  });
  $(document).on("loadAdsSuccess2", function (p35, p36) {
    const v27 = adsMap.filter(p37 => p37.adId == p36.id)[0].id;
    accountGrid.api.getRowNode(v27).setDataValue("country", p36.country);
    accountGrid.api.getRowNode(v27).setDataValue("payment", p36.payment);
    if (p36.status) {
      accountGrid.api.getRowNode(v27).setDataValue("status", p36.status);
    }
  });
  $("[name=\"linkShareBm\"]").on("input", function () {
    const v28 = $("[name=\"linkShareBm\"]").val().split(/\r?\n|\r|\n/g).filter(p38 => p38);
    $("#linkShareBmCount").text(v28.length);
  });
  $(document).on("updateShareBmLink", function (p39, p40) {
    const v29 = $("[name=\"linkShareBm\"]").val().split(/\r?\n|\r|\n/g).filter(p41 => p41);
    v29.push(p40.link);
    $("[name=\"linkShareBm\"]").val(v29.join("\r\n"));
    $("#linkShareBmCount").text(v29.length);
  });
  $(document).on("updateAdsName", function (p42, p43) {
    accountGrid.api.getRowNode(parseInt(p43.id)).setDataValue("account", p43.name);
  });
  $(document).on("updateAdInfo", function (p44, p45) {
    if (p45.timezone) {
      accountGrid.api.getRowNode(parseInt(p45.id)).setDataValue("timezone", p45.timezone);
    }
    if (p45.currency) {
      accountGrid.api.getRowNode(parseInt(p45.id)).setDataValue("currency", p45.currency);
    }
    if (p45.country) {
      accountGrid.api.getRowNode(parseInt(p45.id)).setDataValue("country", p45.country);
    }
  });
  async function pasteCard() {
    const v30 = (await navigator.clipboard.readText()) ?? "";
    if (v30.length > 0) {
      accountGrid.api.clearRangeSelection();
      const v31 = v30.split(/\r?\n|\r|\n/g);
      for (let vLN03 = 0; vLN03 < v31.length; vLN03++) {
        let v32 = v31[vLN03];
        const v33 = v32.split("|");
        if (v33.length > 2) {
          await setLocalStorage("card_" + v33[1], {
            cardName: v33[0],
            cardNumber: v33[1],
            expMonth: v33[2].split("/")[0],
            expYear: v33[2].split("/")[1],
            expDate: v33[2],
            cardCsv: v33[3],
            count: 0
          });
        }
      }
      loadCards();
    }
    return false;
  }
  $("#cardModal").on("show.bs.modal", function (p46) {
    loadCards();
    const vA3 = [{
      text: "Paste",
      onclick: p47 => {
        pasteCard();
      }
    }, {
      text: "Delete",
      onclick: p48 => {
        cardGrid.api.forEachNodeAfterFilterAndSort(p49 => {
          if (p49.selected) {
            removeLocalStorage("card_" + p49.data.cardNumber);
          }
        });
        loadCards();
      }
    }];
    const v34 = new ContextMenu(document.getElementById("cards"), vA3);
    v34.install();
  });
  function loadCards() {
    const vO33 = {
      ...localStorage
    };
    const vVO33 = vO33;
    let vLN12 = 1;
    const v35 = Object.keys(vVO33).filter(p50 => p50.includes("card_")).map(p51 => {
      return {
        id: vLN12++,
        ...JSON.parse(vVO33[p51])
      };
    });
    cardGrid.api.setRowData(v35);
    $("#cardCount").text(v35.length);
  }
  function countStatus(p52, p53) {
    let vLN04 = 0;
    let vLN05 = 0;
    let vLN06 = 0;
    let vLN07 = 0;
    let vLN08 = 0;
    let vLN09 = 0;
    let vLN010 = 0;
    let vLN011 = 0;
    let vLN012 = 0;
    p52.api.forEachNode(p54 => {
      if (p54.data.status == 1) {
        vLN04++;
      }
      if (p54.data.status == 2) {
        vLN05++;
      }
      if (p54.data.status == 3) {
        vLN06++;
      }
      if (p54.data.status == 4) {
        vLN07++;
      }
      if (p54.data.status == 5) {
        vLN08++;
      }
      if (p54.data.status == 6) {
        vLN09++;
      }
      if (p54.data.status == 7) {
        vLN010++;
      }
      if (p54.data.status == 101) {
        vLN011++;
      }
      if (p54.data.status == 999) {
        vLN012++;
      }
    });
    $(".status1Count").text(vLN04);
    $(".status2Count").text(vLN05);
    $(".status3Count").text(vLN06);
    $(".status4Count").text(vLN07);
    $(".status5Count").text(vLN08);
    $(".status6Count").text(vLN09);
    $(".status7Count").text(vLN010);
    $(".status101Count").text(vLN011);
    $(".status999Count").text(vLN012);
  }