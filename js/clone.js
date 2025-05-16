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
    headerName: "Trạng thái",
    filter: "agSetColumnFilter",
    cellRenderer: p5 => {
      let vLS = "";
      if (p5.data.status === 0) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-success rounded-circle me-2\"></span><strong class=\"text-success\">LIVE</strong></span>";
      }
      if (p5.data.status === 1) {
        vLS = "<span class=\"d-flex align-items-center\"><span style=\"width: 7px; height: 7px\" class=\"d-flex bg-danger rounded-circle me-2\"></span><strong class=\"text-danger\">DIE</strong></span>";
      }
      return vLS;
    }
  }, {
    field: "name",
    headerName: "Tài khoản",
    minWidth: 250,
    cellRenderer: p6 => {
      return "\n                <div class=\"d-flex align-items-center\">\n                    <img class=\"rounded-circle\" src=\"" + (p6.data.avatar ? p6.data.avatar : "../img/avatar.jpg") + "\" height=\"30\">\n                    <a href=\"https://facebook.com/profile.php?id=" + p6.data.uid + "\" target=\"_BLANK\" class=\"ps-3 flex-grow-1 d-flex flex-column text-black text-decoration-none\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + (p6.data.name ? p6.data.name : "Unknown") + "</strong>\n                        <span>" + p6.data.uid + "</span>\n                    </a>\n                </div>\n            ";
    }
  }, {
    field: "account",
    headerName: "Account"
  }, {
    field: "uid",
    headerName: "UID",
    suppressFiltersToolPanel: true
  }, {
    field: "password",
    headerName: "Mật khẩu",
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
    headerName: "Email Password",
    suppressFiltersToolPanel: true
  }, {
    field: "recoverEmail",
    headerName: "Email khôi phục",
    suppressFiltersToolPanel: true
  }, {
    field: "cookie",
    headerName: "Cookie"
  }, {
    field: "bm",
    headerName: "BM",
    cellRenderer: p7 => {
      let vLS2 = "";
      if (p7.data.bm && p7.data.bm != 0) {
        vLS2 = "\n                    <button type=\"button\" data-type=\"viewBm\" data-id=\"" + p7.data.uid + "\" class=\"viewDataButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-briefcase-line me-1\"></i><strong>BM: <span class=\"count\">" + p7.data.bm + "</span></strong></button>\n                ";
      }
      return vLS2;
    }
  }, {
    field: "tkqc",
    headerName: "TKQC",
    cellRenderer: p8 => {
      let vLS3 = "";
      if (p8.data.tkqc && p8.data.tkqc != 0) {
        vLS3 = "\n                    <button type=\"button\" data-type=\"viewAds\" data-id=\"" + p8.data.uid + "\" class=\"viewDataButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-megaphone-line me-1\"></i><strong>TKQC: <span class=\"count\">" + p8.data.tkqc + "</span></strong></button>\n                ";
      }
      return vLS3;
    }
  }, {
    field: "page",
    headerName: "Page",
    cellRenderer: p9 => {
      let vLS4 = "";
      if (p9.data.page && p9.data.page != 0) {
        vLS4 = "\n                    <button type=\"button\" data-type=\"viewPage\" data-id=\"" + p9.data.uid + "\" class=\"viewDataButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-flag-line me-1\"></i><strong>Page: <span class=\"count\">" + p9.data.page + "</span></strong></button>\n                ";
      }
      return vLS4;
    }
  }, {
    field: "dob",
    headerName: "Ngày sinh"
  }, {
    field: "gender",
    headerName: "Giới tính",
    cellRenderer: p10 => {
      let vLS5 = "";
      if (p10.data.gender === "male") {
        vLS5 = "Nam";
      } else if (p10.data.gender === "female") {
        vLS5 = "Nữ";
      }
      return vLS5;
    }
  }, {
    field: "friends",
    headerName: "Bạn bè"
  }, {
    field: "action",
    headerName: "Hành động",
    minWidth: 200,
    cellRenderer: p11 => {
      let vLS6 = "";
      if (p11.data.action === "active") {
        vLS6 = "\n                    <button type=\"button\" class=\"btn btn-success btn-sm p-0 px-2\"><i class=\"ri-checkbox-blank-circle-fill me-1\"></i>Đang hoạt động</button>\n                    <button type=\"button\" id=\"logoutBtn\" class=\"ms-1 btn bg-dark-subtle btn-sm p-0 px-1\"><i class=\"ri-logout-box-r-line\"></i>\n                    </button>\n                ";
      } else {
        vLS6 = "\n                    <button type=\"button\" data-id=\"" + p11.data.id + "\" class=\"loginButton btn btn-secondary btn-sm p-0 px-2\"><i class=\"ri-lock-line me-1\"></i>Đăng nhập</button>\n                ";
      }
      return vLS6;
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
    getRowId: function (p12) {
      return p12.data.id;
    },
    onFirstDataRendered: function (p13) {
      countStatus(p13);
    },
    onRangeSelectionChanged: function (p14) {
      const v12 = p14.api.getCellRanges();
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
    onSelectionChanged: function (p15) {
      const v13 = p15.api.getSelectedRows();
      $("#dachon").text(v13.length);
    },
    onRowDataUpdated: function (p16) {
      $("#tong").text(p16.api.getDisplayedRowCount());
    },
    onFilterChanged: function (p17) {
      $("#tong").text(p17.api.getDisplayedRowCount());
    },
    rowClassRules: {
      running: function (p18) {
        return p18.data.status === "RUNNING";
      },
      finished: function (p19) {
        return p19.data.status === "FINISHED";
      }
    },
    onBodyScroll: function (p20) {
      scrolling = true;
    },
    onBodyScrollEnd: function (p21) {
      scrolling = false;
    }
  };
  $("#accounts").on("contextmenu", function (p22) {
    p22.preventDefault();
    const vParseInt = parseInt($("#contextMenu > ul").outerHeight());
    const vParseInt2 = parseInt($("body").outerHeight());
    if (p22.pageY + vParseInt > vParseInt2) {
      $("#contextMenu").addClass("open").css({
        top: p22.pageY - vParseInt + "px",
        left: p22.pageX + "px"
      });
    } else {
      $("#contextMenu").addClass("open").css({
        top: p22.pageY + "px",
        left: p22.pageX + "px"
      });
    }
  });
  $(document).click(() => {
    $("#contextMenu").removeClass("open").css({
      top: "-999px",
      left: "-999px"
    });
  });
  $(document).ready(async function () {
    const v14 = document.querySelector("#accounts");
    new agGrid.Grid(v14, accountGrid);
    const v15 = (await getLocalStorage("stateClone")) || [];
    const vO15 = {
      state: v15,
      applyOrder: true
    };
    accountGrid.columnApi.applyColumnState(vO15);
    for (let vLN03 = 0; vLN03 < 9999999; vLN03++) {
      try {
        if ($("body").hasClass("data-loaded")) {
          const vA2 = [];
          const v16 = (await getLocalStorage("dataClone")) || [];
          for (let vLN04 = 0; vLN04 < v16.length; vLN04++) {
            const v17 = v16[vLN04];
            v17.action = false;
            const v18 = await getCookie();
            let vLS7 = "";
            try {
              vLS7 = v18.split("c_user=")[1].split(";")[0];
            } catch {}
            const v19 = await getLocalStorage("userInfo_" + v17.uid);
            const v20 = (await getLocalStorage("dataAds_" + v17.uid)) || "";
            const v21 = (await getLocalStorage("dataBm_" + v17.uid)) || "";
            const v22 = (await getLocalStorage("dataPage_" + v17.uid)) || "";
            v17.tkqc = v20.length;
            v17.bm = v21.length;
            v17.page = v22.length;
            if (v17.uid === vLS7) {
              v17.action = "active";
            }
            if (v19 && v17.uid === v19.id) {
              v17.dob = v19.birthday;
              v17.gender = v19.gender;
              v17.friends = v19.friends;
              v17.name = v19.name;
              v17.avatar = v19.picture.data.url;
            }
            vA2.push(v17);
          }
          accountGrid.api.setRowData(vA2);
          accountGrid.columnApi.autoSizeColumns(["name", "action", "bm", "tkqc", "page"]);
          break;
        }
      } catch (e2) {
        console.log(e2);
      }
      await delayTime(500);
    }
    setInterval(async () => {
      if ($("body").hasClass("setting-loaded")) {
        saveSetting();
      }
      if ($("body").hasClass("data-loaded")) {
        const vA3 = [];
        accountGrid.api.forEachNode(function (p23) {
          vA3.push(p23.data);
        });
        if (vA3.length > 0) {
          await setLocalStorage("dataClone", vA3);
        }
        const v23 = accountGrid.columnApi.getColumnState();
        await setLocalStorage("stateClone", v23);
      }
    }, 2000);
  });
  function countStatus(p24) {
    let vLN05 = 0;
    let vLN06 = 0;
    p24.api.forEachNode(p25 => {
      if (p25.data.status === 0) {
        vLN05++;
      }
      if (p25.data.status === 1) {
        vLN06++;
      }
    });
    $(".status0Count").text(vLN05);
    $(".status1Count").text(vLN06);
  }
  $(document).on("click", ".viewDataButton", function () {
    const v24 = $(this).attr("data-type");
    const v25 = $(this).attr("data-title");
    const v26 = $(this).find(".count").text();
    const v27 = $(this).attr("data-id");
    $("#viewDataModal iframe").attr("src", v24 + "?id=" + v27);
    $("#viewDataModal").modal("show");
  });
  $("#deleteSelect").click(function () {
    Swal.fire({
      title: "Bạn có chắc muốn xóa",
      text: "Hành động này không thể hoàn tác",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy"
    }).then(async p26 => {
      if (p26.isConfirmed) {
        const vGetSelectedRows = getSelectedRows();
        const v28 = accountGrid.api.getRenderedNodes();
        if (vGetSelectedRows.length === v28.length) {
          await removeLocalStorage("dataClone");
          await clearLocalStorage();
        }
        for (let vLN07 = 0; vLN07 < vGetSelectedRows.length; vLN07++) {
          const v29 = vGetSelectedRows[vLN07];
          await removeLocalStorage("dataAds_" + v29.uid);
          await removeLocalStorage("dataBm_" + v29.uid);
          await removeLocalStorage("dataPage_" + v29.uid);
          await removeLocalStorage("userInfo_" + v29.uid);
        }
        const vO17 = {
          remove: vGetSelectedRows
        };
        accountGrid.api.applyTransaction(vO17);
      }
    });
  });
  $("#importClone").click(function () {
    Swal.fire({
      title: "Import Data",
      html: "\n            <div class=\"p-1\">\n                <textarea id=\"viaData\" class=\"form-control mb-3\" rows=\"10\" placeholder=\"Nhập danh sách Clone\"></textarea>\n            </div>\n        ",
      showCancelButton: true,
      cancelButtonText: "Hủy",
      confirmButtonText: "Import",
      confirmButtonColor: "#4267B2",
      showLoaderOnConfirm: true,
      width: 600,
      preConfirm: async p27 => {
        const v30 = $("#viaData").val();
        if (v30) {
          pasteData(v30);
        } else {
          Swal.showValidationMessage("Xin vui lòng nhập danh sách Clone");
        }
        return true;
      }
    });
  });
  function pasteData(p28) {
    if (p28.length > 0) {
      accountGrid.api.clearRangeSelection();
      const v31 = p28.split(/\r?\n|\r|\n/g);
      const vA4 = [];
      const vA5 = [];
      const vA6 = [];
      let vLN08 = 0;
      accountGrid.api.forEachNode(p29 => {
        vA4.push(p29.data);
        vLN08++;
      });
      for (let vLN09 = 0; vLN09 < v31.length; vLN09++) {
        let v32 = v31[vLN09];
        if (v32.includes("c_user") && !v32.includes("|")) {
          const v33 = v32.split(";").filter(p30 => {
            return p30.includes("c_user");
          }).map(p31 => {
            return p31.trim().replace("c_user=", "");
          });
          v32 = v33[0] + "||||" + v32;
        }
        if (v32.includes("csrftoken") && !v32.includes("|")) {
          v32 = "|||" + v32;
        }
        const v34 = v32.split("|");
        if (v34.length > 1) {
          let vLS8 = "";
          let vLS9 = "";
          let vLS10 = "";
          let vLS11 = "";
          let vLS12 = "";
          let vLS13 = "";
          let vLS14 = "";
          let v35 = v34.findIndex(p32 => {
            return p32.includes("c_user=");
          });
          let v36 = v34.findIndex(p33 => {
            return p33.match(/@outlook|@hotmail|@gmail|@yahoo/g);
          });
          let v37 = v34.findIndex(p34 => {
            return p34.match(/@getnada.com|@abyssmail.com|@dropjar.com|@getairmail.com|@givmail.com|@inboxbear.com|@robot-mail.com|@tafmail.com|@vomoto.com|fviainboxes.com|fviadropinbox.com|fviamail.work|dropinboxes.com/g);
          });
          const v38 = v34.findIndex(p35 => {
            return p35.replace(/\s/g, "").length === 32 && !p35.includes("@");
          });
          if (v38 !== -1) {
            vLS14 = v34[v38];
          }
          const v39 = v34.findIndex(p36 => {
            return p36.startsWith("EAA");
          });
          if (v35 !== -1) {
            vLS8 = v34[v35];
          }
          if (v36 !== -1) {
            vLS10 = v34[v36 + 1];
            vLS9 = v34[v36];
          }
          if (v37 !== -1) {
            vLS11 = v34[v37];
          }
          if (v39 !== -1) {
            vLS12 = v34[v39];
          }
          if (vLS9 && vLS10) {
            vLS13 = vLS9 + "|" + vLS10;
          }
          const vO18 = {
            id: vLN08,
            account: v32,
            uid: v34[0],
            password: v34[1],
            twofa: vLS14,
            oldEmail: vLS13,
            token: vLS12,
            cookie: vLS8,
            email: vLS9,
            passMail: vLS10,
            recoverEmail: vLS11
          };
          const vVO18 = vO18;
          const v40 = vA4.filter(p37 => {
            return p37.uid === v34[0];
          });
          if (v40[0]) {
            vA6.push(vVO18);
          } else {
            vA5.push(vVO18);
          }
        }
        vLN08++;
      }
      if (vA6.length) {
        Swal.fire({
          width: 700,
          icon: "warning",
          input: "textarea",
          title: "Cảnh báo",
          text: "Những dữ liệu sau đã tồn tại, bạn có chắc vẫn muốn thêm vào?",
          inputValue: vA6.map(p38 => {
            return p38.account;
          }).join("\r\n"),
          showCancelButton: true,
          allowOutsideClick: false,
          confirmButtonText: "Vẫn thêm",
          cancelButtonText: "Bỏ qua",
          inputAttributes: {
            rows: 10,
            style: "height: inherit!important"
          }
        }).then(p39 => {
          if (p39.isConfirmed) {
            const v41 = vA5.length ? vA5.concat(vA6) : vA6;
            accountGrid.api.setRowData(vA4.concat(v41));
          } else if (vA5.length) {
            accountGrid.api.setRowData(vA4.concat(vA5));
          }
        });
      } else if (vA5.length) {
        accountGrid.api.setRowData(vA4.concat(vA5));
      }
    }
  }
  $("#pasteData").click(async function () {
    const v42 = (await navigator.clipboard.readText()) ?? "";
    pasteData(v42);
  });
  $("#selectRange").click(async function () {
    const v43 = accountGrid.api.getCellRanges();
    let v44;
    let v45;
    if (v43[0].startRow.rowIndex < v43[0].endRow.rowIndex) {
      v44 = v43[0].startRow.rowIndex;
      v45 = v43[0].endRow.rowIndex;
    } else {
      v45 = v43[0].startRow.rowIndex;
      v44 = v43[0].endRow.rowIndex;
    }
    const vA7 = [];
    accountGrid.api.deselectAll();
    accountGrid.api.forEachNode(function (p40) {
      if (p40.rowIndex >= v44 && p40.rowIndex <= v45) {
        p40.setSelected(true);
      }
    });
  });
  $("#checkLive").click(async function () {
    const v46 = Swal.fire({
      title: "Đang check live tài khoản",
      html: "<span id=\"checkProgress\">Xin vui lòng đợi...</span>",
      showDenyButton: true,
      denyButtonText: "Stop",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      preDeny: () => {
        $(document).trigger("stop");
      }
    });
    const v47 = accountGrid.api.getSelectedRows();
    let v48 = false;
    for (let vLN010 = 0; vLN010 < v47.length; vLN010++) {
      if (v48) {
        break;
      }
      const v49 = v47[vLN010];
      try {
        await checkLive(v49.uid);
        accountGrid.api.getRowNode(v49.id).setDataValue("status", 0);
      } catch {
        accountGrid.api.getRowNode(v49.id).setDataValue("status", 1);
      }
    }
    $(document).on("stop", function (p41) {
      v48 = true;
    });
    v46.close();
  });