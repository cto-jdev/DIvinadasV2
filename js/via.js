$(document).ready(async function () {
    await window.fbReady;
    let v12;
    const vF4 = async p5 => {
      $("#adName").text(p5.account);
      $("#adId").text(p5.adId);
      $("#adImage").html("<span style=\"width:40px;height:40px;font-size:18px\" class=\"avatar-letter\" data-letter=\"" + p5.account.substring(0, 1).toUpperCase() + "\"></span>");
      let vLS = "";
      if (p5.status == 101) {
        vLS = "<span class=\"badge text-bg-success\">Đóng</span>";
      }
      if (p5.status == 999) {
        vLS = "<span class=\"badge text-bg-info\">Hold</span>";
      }
      if (p5.status == 1 || p5.status == 100) {
        vLS = "<span class=\"badge text-bg-success\">Hoạt động</span>";
      }
      if (p5.status == 2) {
        vLS = "<span class=\"badge text-bg-danger\">Vô hiệu hóa</span>";
      }
      if (p5.status == 3) {
        vLS = "<span class=\"badge text-bg-warning\">Cần thanh toán</span>";
      }
      if (p5.status == 4) {
        vLS = "<span class=\"badge text-bg-warning\">Đang kháng 3 dòng</span>";
      }
      if (p5.status == 5) {
        vLS = "<span class=\"badge text-bg-danger\">Die 3 dòng</span>";
      }
      if (p5.status == 6) {
        vLS = "<span class=\"badge text-bg-warning\">Die XMDT</span>";
      }
      if (p5.status == 7) {
        vLS = "<span class=\"badge text-bg-warning\">Die vĩnh viễn</span>";
      }
      const v13 = p5.currency.split("-")[0];
      const v14 = await fb.checkHiddenAdmin(p5.adId);
      $("#t8").text(v14.length);
      $("#t1").html(vLS);
      $("#t2").html(p5.limit + " " + v13);
      $("#t3").html(p5.remain + " " + v13);
      $("#t4").html(p5.spend + " " + v13);
      $("#t5").html(p5.balance + " " + v13);
      $("#t6").html(p5.createdTime);
      $("#t7").html(p5.nextBillDate);
      $("#t9").html(p5.type);
      $("#t10").html(p5.timezone);
      let vLS2 = "";
      try {
        vLS2 = JSON.parse(p5.payment)[0];
        if (vLS2.credential.card_association) {
          vLS2 = vLS2.credential.card_association + " - " + vLS2.credential.last_four_digits || "";
        }
      } catch {}
      $("#t11").html(vLS2);
      $("#t12").html(p5.role);
    };
    setInterval(async () => {
      if ($("body").hasClass("setting-loaded")) {
        saveSetting();
      }
    }, 2000);
    const vSetInterval = setInterval(async () => {
      try {
        await vF5();
      } catch {}
    }, 5000);
    const vF5 = () => {
      return new Promise(async (p6, p7) => {
        try {
          const v15 = await checkUser();
          if (v15.success) {
            $("#balance .card").html("\n                        <div class=\"d-flex justify-content-between align-items-center\">\n                            <div class=\"\">\n                                <strong class=\"fs-5 mb-2 d-block\">Số dư tài khoản</strong>\n                                <strong class=\"fs-2\" id=\"\">" + v15.balance + "</strong>\n                            </div>\n                            <div class=\"rounded-circle d-flex align-items-center justify-content-center text-white\" style=\"width: 60px; height: 60px; background: rgb(249 116 132 / 20%)\">\n                                <i class=\"ri-wallet-line fs-3\" style=\"color: #ff6384\"></i>\n                            </div>\n                        </div>\n                    ");
            clearInterval(vSetInterval);
            p6();
          } else {
            p7();
          }
        } catch {
          p7();
        }
      });
    };
    try {
      await vF5();
    } catch {}
    const vSetInterval2 = setInterval(async () => {
      try {
        const v16 = await getLocalStorage("dataAds_" + fb.uid);
        if (v16[0]) {
          $("#countAds").text(v16.length);
          clearInterval(vSetInterval2);
          let vLS3 = "";
          v16.sort((p8, p9) => {
            return parseInt(p9.spend) - parseInt(p8.spend);
          }).slice(0, 4).forEach(p10 => {
            vLS3 += "\n                        <div class=\"border-bottom opacity-50\"></div>\n                        <a href=\"https://business.facebook.com/billing_hub/payment_settings/?asset_id=" + p10.adId + "\" target=\"_BLANK\" class=\"text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link\">\n                            <div class=\"d-flex align-items-center\" style=\"width: calc(100% - 60px);\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p10.account.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-3\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 14px; margin-bottom: 3px\">" + p10.account + "</strong>\n                                    <span>" + p10.adId + "</span>\n                                </div>\n                            </div>\n                            <div class=\"text-end\">\n                                <strong style=\"margin-bottom: 3px\" class=\"d-block\">Tổng tiêu</strong>\n                                <span class=\"badge text-bg-success\">" + p10.spend + "</span>\n                            </div>\n                        </a>\n                    ";
          });
          $("#topAds").html(vLS3);
          $("#adSelect select").on("select2:select", function (p11) {
            const v17 = v16.filter(p12 => p12.adId === p11.params.data.id)[0];
            vF4(v17);
          });
          $("#adSelect select").select2({
            data: v16.map(p13 => {
              const vO = {
                id: p13.adId,
                text: p13.account,
                adId: p13.adId
              };
              return vO;
            }),
            templateSelection: function (p14) {
              return $("\n                            <div class=\"d-flex align-items-center\">\n                                <span class=\"avatar-letter\" data-letter=\"H\"></span>\n                                <div class=\"d-flex flex-column ps-2 text-black text-decoration-none\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 13px; margin-bottom: 3px\">" + p14.text + "</strong>\n                                    <span style=\"font-size: 13px;\">" + p14.id + "</span>\n                                </div>\n                            </div>\n                        ");
            },
            templateResult: function (p15) {
              return $("\n                            <div class=\"d-flex align-items-center\">\n                                <span class=\"avatar-letter\" data-letter=\"H\"></span>\n                                <div class=\"d-flex flex-column ps-2 text-black text-decoration-none\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 13px; margin-bottom: 3px\">" + p15.text + "</strong>\n                                    <span style=\"font-size: 13px;\">" + p15.id + "</span>\n                                </div>\n                            </div>\n                        ");
            }
          });
          const v18 = v16[0];
          try {
            vF4(v18);
          } catch {}
          $("#adData").removeClass("d-none");
          try {
            v12.close();
            $("#iframe").attr("src", "");
          } catch {}
        }
      } catch (e2) {}
    }, 1000);
    const vSetInterval3 = setInterval(async () => {
      try {
        let v19 = await getLocalStorage("dataBm_" + fb.uid);
        if (v19[0]) {
          clearInterval(vSetInterval3);
          $("#countBm").text(v19.length);
          let vLS4 = "";
          v19.slice(0, 4).forEach(p16 => {
            vLS4 += "\n                        <div class=\"border-bottom opacity-50\"></div>\n                        <a href=\"https://business.facebook.com/settings/?business_id=" + p16.bmId + "\" target=\"_BLANK\" class=\"text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link\">\n                            <div class=\"d-flex align-items-center\" style=\"width: calc(100% - 50px);\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p16.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-3\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 14px; margin-bottom: 3px\">" + p16.name + "</strong>\n                                    <span>" + p16.bmId + "</span>\n                                </div>\n                            </div>\n                            <div class=\"text-end\">\n                                <strong style=\"margin-bottom: 3px\" class=\"d-block\">Loại BM</strong>\n                                <span class=\"badge text-bg-success\">" + (p16.bmType ? p16.bmType.split(" - ")[0] : "") + "</span>\n                            </div>\n                        </a>\n                    ";
          });
          $("#topBm").html(vLS4);
          const v20 = document.querySelector("#bmChart canvas");
          const v21 = v19.filter(p17 => p17.status === "LIVE").length;
          const v22 = v19.filter(p18 => p18.status === "DIE").length;
          const v23 = v19.filter(p19 => p19.status === "DIE_VV").length;
          const vO2 = {
            type: "doughnut",
            options: {},
            data: {}
          };
          vO2.options.cutout = "50%";
          vO2.data.labels = ["BM Live", "BM Die XMDT", "BM Die Vĩnh Viễn"];
          vO2.data.datasets = [{
            label: "Số lượng: ",
            data: [v21, v22, v23],
            borderRadius: 5,
            borderWidth: 2,
            backgroundColor: ["#198754", "#dc3545", "#ffc107"]
          }];
          new Chart(v20, vO2);
          $("#bmChart").removeClass("d-none");
          try {
            v12.close();
            $("#iframe").attr("src", "");
          } catch {}
        }
      } catch {}
    }, 1000);
    const vSetInterval4 = setInterval(async () => {
      try {
        const v24 = await getLocalStorage("dataPage_" + fb.uid);
        if (v24[0]) {
          clearInterval(vSetInterval4);
          $("#countPage").text(v24.length ?? 0);
          let vLS5 = "";
          v24.sort((p20, p21) => {
            return p21.like - p20.like;
          }).slice(0, 4).forEach(p22 => {
            vLS5 += "\n                        <div class=\"border-bottom opacity-50\"></div>\n                        <a href=\"https://www.facebook.com/profile.php?id=" + p22.pageId + "\" target=\"_BLANK\" class=\"text-decoration-none py-2 px-3 d-flex justify-content-between text-dark dark-link\">\n                            <div class=\"d-flex align-items-center\" style=\"width: calc(100% - 60px);\">\n                                <span class=\"avatar-letter\" data-letter=\"" + p22.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 1).toUpperCase() + "\"></span>\n                                <div class=\"d-flex flex-column ps-3\" style=\"line-height: initial; width: calc(100% - 30px)\">\n                                    <strong class=\"text-truncate pe-1\" style=\"font-size: 14px; margin-bottom: 3px\">" + p22.name + "</strong>\n                                    <span>" + p22.pageId + "</span>\n                                </div>\n                            </div>\n                            <div class=\"text-end\">\n                                <strong style=\"margin-bottom: 3px\" class=\"d-block\">Like</strong>\n                                <span class=\"badge text-bg-success\">" + p22.like + "</span>\n                            </div>\n                        </a>\n                    ";
          });
          $("#topPage").html(vLS5);
          try {
            v12.close();
            $("#iframe").attr("src", "");
          } catch {}
        }
      } catch {}
    }, 1000);
    $('#loadBm').click(async function () {
      // Datos de prueba para BM
      const testBm = [
        { id: 1, bmId: '123456789', name: 'BM Test 1', bmType: 'BM350', status: 'LIVE' },
        { id: 2, bmId: '987654321', name: 'BM Test 2', bmType: 'BM50', status: 'DIE' },
        { id: 3, bmId: '555555555', name: 'BM Test 3', bmType: 'BM350', status: 'DIE_VV' }
      ];
      await setLocalStorage('dataBm_' + fb.uid, testBm);
      location.reload();
    });
    $('#loadAds').click(async function () {
      // Datos de prueba para Ads
      const testAds = [
        { adId: 'ad1', account: 'Ad Account 1', spend: 1000, limit: 5000, remain: 4000, balance: 200, currency: 'VND', status: 1, payment: '[]', createdTime: '2024-01-01', nextBillDate: '2024-02-01', type: 'Type1', timezone: 'Asia/Ho_Chi_Minh', role: 'admin' },
        { adId: 'ad2', account: 'Ad Account 2', spend: 2000, limit: 6000, remain: 4000, balance: 300, currency: 'VND', status: 2, payment: '[]', createdTime: '2024-01-02', nextBillDate: '2024-02-02', type: 'Type2', timezone: 'Asia/Ho_Chi_Minh', role: 'user' }
      ];
      await setLocalStorage('dataAds_' + fb.uid, testAds);
      location.reload();
    });
    $('#loadPage').click(async function () {
      // Datos de prueba para Page
      const testPage = [
        { pageId: 'page1', name: 'Page 1', like: 100 },
        { pageId: 'page2', name: 'Page 2', like: 200 }
      ];
      await setLocalStorage('dataPage_' + fb.uid, testPage);
      location.reload();
    });
  });