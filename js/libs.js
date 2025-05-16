function delayTime(p5) {
    return new Promise((p6, p7) => {
      setTimeout(() => {
        return p6();
      }, p5);
    });
  }
  class FB {
    constructor() {
      this.userInfo = false;
      this.accessToken = false;
      this.dtsg = false;
    }
    checkLive() {
      return new Promise(async (p8, p9) => {
        try {
          const v12 = await fetch2("https://facebook.com");
          const v13 = await getCookie();
          let vLN02 = 0;
          let vLN03 = 0;
          try {
            vLN02 = v13.split("c_user=")[1].split(";")[0] ?? 0;
            try {
              vLN03 = (await getLocalStorage("userInfo_" + fb.uid)).id ?? 0;
            } catch {}
          } catch (e2) {}
          if (v12.url.includes("login") || v12.url.includes("index.php?next") || vLN02 === 0) {
            p8("not_login");
          } else if (vLN02 !== 0 && vLN03 !== 0 && vLN02 != vLN03) {
            p8("new_login");
          } else if (v12.url.includes("/checkpoint/601051028565049")) {
            try {
              const v14 = await fetch2(v12.url);
              const v15 = v14.text;
              const v16 = v15.match(/(?<=\"token\":\")[^\"]*/g).filter(p10 => p10.startsWith("NA"))[0];
              const v17 = v15.match(/(?<=\"actorID\":\")[^\"]*/g)[0];
              await fetch2("https://www.facebook.com/api/graphql/", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + v17 + "&__user=" + v17 + "&__a=1&__req=f&__hs=20093.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1&__ccg=EXCELLENT&__rev=1019152241&__s=3r0i1l%3Adoygjs%3Arl8pzq&__hsi=7456304789546566464&__dyn=7xeUmwlEnwn8K2Wmh0no6u5U4e0yoW3q32360CEbo19oe8hw2nVE4W099w8G1Dz81s8hwnU2lwv89k2C1Fwc60D8vwRwlE-U2zxe2GewbS361qw8Xwn82Lw5XwSyES1Mw9m0Lo6-1Fw4mwr86C0No7S3m1TwLwHwea&__csr=iNP8qDzqVpK79p9bDmXDyd3F6mVGxF1h4yoKcwABwEx213yU8oK0G83zw5iwbW0IEa8W0D84C09gw5VxO0lO05988U01DqU1xE08mE&__comet_req=15&fb_dtsg=" + v16 + "&jazoest=25482&lsd=pzKOpDZ-eJ0rLdRdpFloMd&__spin_r=1019152241&__spin_b=trunk&__spin_t=1736056243&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBScrapingWarningMutation&variables=%7B%7D&server_timestamps=true&doc_id=6339492849481770",
                method: "POST"
              });
            } catch (e3) {
              console.log(e3);
            }
          } else if (v12.url.includes("/checkpoint/1501092823525282")) {
            p8("282");
          } else if (v12.url.includes("/checkpoint/828281030927956")) {
            p8("956");
          } else {
            p8("success");
          }
        } catch (e4) {
          console.log(e4);
          p8("error");
        }
      });
    }
    getAccessToken() {
      return new Promise(async (p11, p12) => {
        try {
          let v18 = false;
          try {
            v18 = await fetch2("https://business.facebook.com/billing_hub/payment_settings/?asset_id=4");
          } catch {
            v18 = await fetch2("https://business.facebook.com/billing_hub/payment_settings/");
          }
          const v19 = v18.text;
          if (v18.url.includes("login") || v18.url.includes("index.php?next")) {
            p11("not_login");
          } else if (v18.url.includes("/checkpoint/1501092823525282")) {
            p11("282");
          } else if (v18.url.includes("/checkpoint/828281030927956")) {
            p11("956");
          } else {
            const v20 = v19.match(/(?<=\"accessToken\":\")[^\"]*/g).filter(p13 => p13.includes("EAAG"));
            const v21 = v19.match(/(?<=\"token\":\")[^\"]*/g).filter(p14 => p14.startsWith("NA"));
            const v22 = v19.match(/(?<=\"async_get_token\":\")[^\"]*/g);
            if (v20[0] && v21[0]) {
              const vO = {
                accessToken: v20[0],
                dtsg: v21[0],
                dtsg2: v22[0]
              };
              p11(vO);
            } else {
              p12();
            }
          }
        } catch {
          p12();
        }
      });
    }
    getAccessToken2() {
      return new Promise(async (p15, p16) => {
        try {
          const v23 = await fetch2("https://adsmanager.facebook.com/adsmanager/manage/campaigns");
          let v24 = v23.text;
          try {
            let v25 = v24.match(/window.location\.replace\("(.+)"/);
            v25 = v25[1].replace(/\\/g, "");
            const v26 = await fetch2(v25);
            v24 = v26.text;
          } catch {}
          const v27 = v24.match(/window.__accessToken="(.*)";/);
          p15(v27[1]);
        } catch (e5) {
          p16(e5);
        }
      });
    }
    getFriends() {
      return new Promise(async (p17, p18) => {
        try {
          const v28 = await fetch2("https://graph.facebook.com/me?fields=friends&access_token=" + this.accessToken2);
          const v29 = v28.json;
          p17(v29.friends.summary.total_count);
        } catch (e6) {
          p18();
        }
      });
    }
    getUserInfo() {
      return new Promise(async (p19, p20) => {
        try {
          const v30 = await getCookie();
          const v31 = v30.split("c_user=")[1].split(";")[0];
          if (v31) {
            await setLocalStorage("uid", v31);
          }
          let v32 = await getLocalStorage("userInfo_" + v31);
          if (!v32) {
            const v33 = await fetch2("https://graph.facebook.com/me?fields=name,first_name,last_name,gender,email,picture.width(200).height(200),username,link,birthday&access_token=" + this.accessToken);
            const v34 = v33.json;
            v34.picture.data.url = await getBase64ImageFromUrl(v34.picture.data.url);
            try {
              v34.friends = await this.getFriends();
            } catch {}
            if (!v34.error) {
              await setLocalStorage("userInfo_" + v34.id, v34);
              v32 = v34;
            } else {
              p20();
            }
          }
          try {
            const v35 = (await getLocalStorage("dataClone")) || [];
            const v36 = v35.filter(p21 => p21.uid === v32.id);
            if (!v36[0] && v32.id) {
              let v37;
              if (v35.length === 0) {
                v37 = 0;
              } else {
                v37 = v35.length + 1;
              }
              const v38 = await getCookie();
              const vO2 = {
                id: v37,
                cookie: v38,
                status: 0,
                account: v38,
                uid: v32.id,
                dob: v32.birthday,
                gender: v32.gender,
                friends: v32.friends,
                name: v32.name,
                avatar: v32.picture.data.url
              };
              v35.push(vO2);
              await setLocalStorage("dataClone", v35);
            }
          } catch (e7) {
            console.log(e7);
          }
          p19(v32);
        } catch (e8) {
          p20(e8);
        }
      });
    }
    getDeactivedPage(p22) {
      return new Promise(async (p23, p24) => {
        try {
          const vA2 = [];
          const v39 = await fetch2("https://graph.facebook.com/v17.0/" + p22 + "/owned_pages?access_token=" + this.accessToken + "&__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=object:business/owned_pages&_reqSrc=PageResourceRequests.brands&fields=[\"id\",\"name\",\"is_deactivated\"]&locale=en_US&method=get&pretty=0&suppress_http_code=1&xref=f5a225ece5d79cbc4&_callFlowletID=0&limit=2000&_triggerFlowletID=2522");
          const v40 = v39.json;
          v40.data.filter(p25 => p25.is_deactivated).forEach(p26 => {
            vA2.push(p26);
          });
          let v41 = v40.paging.next;
          if (v41) {
            for (let vLN04 = 0; vLN04 < 9999; vLN04++) {
              await delayTime(1000);
              const v42 = await fetch2(v41);
              const v43 = v42.json;
              v43.data.filter(p27 => p27.is_deactivated).forEach(p28 => {
                vA2.push(p28);
              });
              if (v43.paging?.next) {
                v41 = v43.paging.next;
              } else {
                break;
              }
            }
          }
          p23(vA2);
        } catch (e9) {
          console.log(e9);
          p24(e9);
        }
      });
    }
    activePage(p29, p30) {
      return new Promise(async (p31, p32) => {
        try {
          const v44 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=5448&_triggerFlowletID=5448", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsg9bdh1pm0xfe%3APsg9bnzh3g1oh%3A0-Asg9bdhqo6bj6-RV%3D6%3AF%3D&__aaid=0&__bid=" + p29 + "&__user=" + this.uid + "&__a=1&__req=q&__hs=19911.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1014711278&__s=zznrqy%3Ajdhrrh%3Artstop&__hsi=7388897698519762088&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1Dxuq3mq1FxebzA3miidBxa7EiwnobES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G2mcwuE2Bz84a9DxW10wywWjxCU5-u2C2l0Fg6y3m2y1bxq1yxJxK48GU8EhAwGK2efK7UW1dx-q4VEhwwwj84-224U-dwKwHxa1ozFUK1gzo8EfEO32fxiFUd8bGwgUy1kx6bCyUhzUbVEHyU8U3yDwbm1LwqpbwCwiUWqU9Eco9U4S7ErwAwEwn9U1587u1rw&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25814&lsd=nxvK4ygqhhRa3PeznPK6_k&__spin_r=1014711278&__spin_b=trunk&__spin_t=1720361807&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBusinessPageDelegatePageReactivationNoticeBannerReactivateProfileMutation&variables=%7B%22profile_id%22%3Anull%2C%22delegate_page_id%22%3A%22" + p30 + "%22%7D&server_timestamps=true&doc_id=5931430166980261",
            method: "POST"
          });
          const v45 = v44.text;
          if (v45.includes("\"name\"")) {
            p31();
          } else {
            p32();
          }
        } catch {
          p32();
        }
      });
    }
    getBmPage() {
      return new Promise(async (p33, p34) => {
        try {
          const v46 = await fetch2("https://business.facebook.com/select");
          const v47 = v46.text;
          const v48 = JSON.parse(v47.split("requireLazy([\"TimeSliceImpl\",\"ServerJS\"],function(TimeSlice,ServerJS){var s=(new ServerJS());s.handle(")[1].split(");requireLazy([\"Run\"]")[0]);
          p33(v48.require[2][3][1].businesses);
        } catch (e10) {
          p34(e10);
        }
      });
    }
    getBm() {
      return new Promise(async (p35, p36) => {
        try {
          let vO3 = {};
          try {
            const v49 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1).limit(99999){adtrust_dsl,currency,account_status}&limit=30&access_token=" + this.accessToken);
            const v50 = v49.json;
            if (v50.data.length) {
              vO3 = v50;
            }
          } catch {
            const v51 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1).limit(100){adtrust_dsl,currency,account_status}&limit=30&access_token=" + this.accessToken);
            const v52 = v51.json;
            if (v52.data.length) {
              vO3 = v52;
            }
          }
          const vA3 = [];
          if (vO3.data) {
            vO3.data.forEach(p37 => {
              vA3.push(p37);
            });
            let v53 = vO3.paging.next;
            if (v53) {
              for (let vLN05 = 0; vLN05 < 9999; vLN05++) {
                const v54 = await fetch2(v53);
                const v55 = v54.json;
                v55.data.forEach(p38 => {
                  vA3.push(p38);
                });
                if (v55.paging?.next) {
                  v53 = v55.paging.next;
                } else {
                  break;
                }
              }
            }
            p35(vA3);
          } else {
            p36();
          }
        } catch {
          p36();
        }
      });
    }
    getBmStatus(p39 = true) {
      return new Promise(async (p40, p41) => {
        try {
          const v56 = await fetch2("https://business.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "fb_dtsg=" + this.dtsg + "&variables={}&doc_id=4941582179260904",
            method: "POST"
          });
          const v57 = v56.json;
          const v58 = v57.data.viewer.ad_businesses.nodes.map(p42 => {
            let vLS = "";
            let vLS2 = "";
            if (p42.advertising_restriction_info.status === "NOT_RESTRICTED" && !p42.advertising_restriction_info.is_restricted) {
              vLS = "LIVE";
              vLS2 = "Live";
            }
            if (p42.advertising_restriction_info.status === "VANILLA_RESTRICTED" && p42.advertising_restriction_info.is_restricted || p42.advertising_restriction_info.status === "APPEAL_INCOMPLETE") {
              if (p42.advertising_restriction_info.restriction_type === "ALE") {
                vLS = "DIE_3DONG";
                vLS2 = "Die 3 dòng";
              } else {
                vLS = "DIE";
                vLS2 = "Die";
              }
            }
            if (p42.advertising_restriction_info.restriction_type === "ALE" && p42.advertising_restriction_info.status === "APPEAL_TIMEOUT") {
              vLS = "DIE_3DONG";
              vLS2 = "Die 3 dòng";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_REJECTED_NO_RETRY" && p42.advertising_restriction_info.is_restricted) {
              vLS = "DIE_VV";
              vLS2 = "Die vĩnh viễn";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_REJECTED") {
              vLS = "DIE_VV";
              vLS2 = "Die vĩnh viễn";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_PENDING") {
              vLS = "DIE_DK";
              vLS2 = "Die đang kháng";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_ACCEPTED") {
              if (p42.advertising_restriction_info.restriction_type === "ALE") {
                vLS = "BM_KHANG_3DONG";
                vLS2 = "BM kháng 3 dòng";
              } else if (!p42.advertising_restriction_info.is_restricted) {
                vLS = "BM_KHANG";
                vLS2 = "BM kháng";
              } else {
                vLS = "BM_XANHVO";
                vLS2 = "BM xanh vỏ";
              }
            }
            const vO5 = {
              id: p42.id,
              type: vLS,
              name: p42.name,
              text: vLS2,
              status: p42.advertising_restriction_info.status,
              is_restricted: p42.advertising_restriction_info.is_restricted,
              restriction_type: p42.advertising_restriction_info.restriction_type,
              avatar: p42.profile_picture.uri
            };
            return vO5;
          });
          if (p39) {
            let vA4 = [];
            for (let vLN06 = 0; vLN06 < v58.length; vLN06++) {
              if (v58[vLN06].type === "DIE") {
                const vF3 = () => {
                  return new Promise(async (p43, p44) => {
                    try {
                      const v59 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        method: "POST",
                        body: "av=" + this.uid + "&__usid=6-Ts626y2arz8fg%3APs626xy1mafk6f%3A0-As626x5t9hdw-RV%3D6%3AF%3D&session_id=3f06e26e24310de8&__user=" + this.uid + "&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574318&__s=bgx31o%3A93y1un%3Aj1i0y0&__hsi=7315329750708113449&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8C221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25595&lsd=XBGCglH3K63SPddlSyNKgf&__aaid=0&__bid=745415083846542&__spin_r=1010574318&__spin_b=trunk&__spin_t=1703232934&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + v58[vLN06].id + "%22%7D&server_timestamps=true&doc_id=24196151083363204"
                      });
                      const v60 = v59.json;
                      const v61 = v60.data.assetOwnerData.advertising_restriction_info;
                      const v62 = v61.restriction_date;
                      if (v61.status === "VANILLA_RESTRICTED" && v61.is_restricted && v61.additional_parameters.ufac_state === "FAILED") {
                        v58[vLN06].type = "DIE_VV";
                        v58[vLN06].text = "Die vĩnh viễn";
                      }
                      if (v62 === "2025-01-26" || v62 === "2025-01-27" || v62 === "2025-01-28") {
                        v58[vLN06].type = "DIE_CAPTCHA";
                        v58[vLN06].text = "Die Captcha";
                        v58[vLN06].dieDate = v62;
                      }
                    } catch {}
                    p43();
                  });
                };
                vA4.push(vF3());
              }
            }
            await Promise.all(vA4);
          }
          p40(v58);
        } catch (e11) {
          p41();
        }
      });
    }
    updateBmEmail(p45, p46) {
      return new Promise(async (p47, p48) => {
        try {
          const v63 = await this.getMainBmAccounts(p45);
          const v64 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=4936&_triggerFlowletID=4932", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tskj0szsrnqcv%3APskj1vrgneeya%3A0-Askj0sz1xmluja-RV%3D6%3AF%3D&__aaid=0&__bid=" + p45 + "&__user=" + this.uid + "&__a=1&__req=j&__hs=19994.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1016895490&__s=o81toq%3Aaxxdno%3Av9875l&__hsi=7419702681638436524&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgEbUy742p046xO2O1VwBwXwEw-G2mcwuE2OwgECu1vwoEcE7O2l0Fwqo5W1bxq0D8gwNxq1izXx-ewt8jwGzEaE8o4-222SU5G4E5yexfwjESq1qwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cwNwDwjouwqo4e220hi7E5y1rwGw9q&__csr=g9_cykBWdbkhsAYSBPkRFitQJDvWZTiq9iHR49HZ44vRKhbFt_tWsTjFFKRjnqqVadaJtCnTR-W-iIx5h2qFuFaLqWKCAlah6HA_iXhbKql4GOtW9eR-DDoCh2enK9puUSurpBuGFBhepypXWGuVuUOl9BiznWDV5ybBKSl5WWJ4gG8BF4mEKvG8xCVHLLyenGA-Kimm5o-anJG44miqAKAaBm48KpAGWm-m48Wm8Vrz4m79UpK5VbWgGquq4bxBx9a68jwLwwgKWBG3S58iyVHxVk2m49EyE8Ulx6u365VqyokCxZ7yElyoK6QUf8nxvwTCwEG3u10wxwYxbwhpo1cbV9oqzQcgpG322C1Ixp0axw2rMljQsbz3G4wl04Zw1CS04wE0HO0dfwrU0NaE0jcwf2EcEpwBDkywda0umtk3S4pK00HSo0cDE1uE2Zabw0z9g8Jm0pO3KbzU1Hy6wKw1eG0f4ARpE0u5U0YBw8J08Khw2rVZwe60x80sUxi05Ny02mk6Q0O2xF6Dw960ciU5e0PA0wpErw288&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25474&lsd=uzpgvQzTYIVG48bw-8QIlT&__spin_r=1016895490&__spin_b=trunk&__spin_t=1727534151&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsUpdateBusinessUserInfoMutation&variables=%7B%22businessUserID%22%3A%22" + v63.id + "%22%2C%22firstName%22%3A%22" + encodeURIComponent(v63.first_name) + "%22%2C%22lastName%22%3A%22" + encodeURIComponent(v63.last_name) + "%22%2C%22email%22%3A%22" + encodeURIComponent(p46) + "%22%2C%22clearPendingEmail%22%3Anull%2C%22surface_params%22%3A%7B%22entry_point%22%3A%22BIZWEB_SETTINGS_BUSINESS_INFO_TAB%22%2C%22flow_source%22%3A%22BIZ_WEB%22%2C%22tab%22%3A%22business_info%22%7D%7D&server_timestamps=true&doc_id=8454950507853345",
            method: "POST"
          });
          const v65 = v64.json;
          if (v65.data.business_settings_update_business_user_personal_info.pending_email === p46) {
            p47();
          } else {
            p48();
          }
        } catch {
          p48();
        }
      });
    }
    getBmLimit(p49) {
      return new Promise(async (p50, p51) => {
        try {
          const v66 = await fetch2("https://business.facebook.com/business/adaccount/limits/?business_id=" + p49, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            referrer: "https://business.facebook.com",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "__a=1&fb_dtsg=" + this.dtsg + "&lsd=" + this.lsd,
            method: "POST"
          });
          let v67 = v66.text;
          v67 = JSON.parse(v67.replace("for (;;);", ""));
          if (v67.payload) {
            p50(v67.payload.adAccountLimit);
          } else if (v67.blockedAction) {
            p50(-1);
          } else {
            p51();
          }
        } catch (e12) {
          p51();
        }
      });
    }
    backUpBm(p52, p53, p54, p55) {
      return new Promise(async (p56, p57) => {
        try {
          let vLS3 = "";
          if (p54 === "admin") {
            vLS3 = "[\"DEFAULT\",\"MANAGE\",\"DEVELOPER\",\"EMPLOYEE\",\"ASSET_MANAGE\",\"ASSET_VIEW\",\"PEOPLE_MANAGE\",\"PEOPLE_VIEW\",\"PARTNERS_VIEW\",\"PARTNERS_MANAGE\",\"PROFILE_MANAGE\"]";
          }
          if (p54 === "other") {
            vLS3 = "[\"DEFAULT\",\"EMPLOYEE\"]";
          }
          p55("Đang gửi lời mới đến email: " + p53);
          const v68 = await fetch2("https://z-p3-graph.facebook.com/v3.0/" + p52 + "/business_users?access_token=" + this.accessToken + "&__cppo=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&brandId=" + p52 + "&email=" + encodeURIComponent(p53) + "&method=post&pretty=0&roles=" + vLS3 + "&suppress_http_code=1"
          });
          const v69 = v68.json;
          if (v69.id) {
            p56(v69.id);
          } else {
            p56();
          }
        } catch (e13) {
          console.log(e13);
          p57();
        }
      });
    }
    renameBm(p58, p59) {
      return new Promise(async (p60, p61) => {
        try {
          const v70 = await fetch2("https://z-p3-graph.facebook.com/v17.0/" + p58 + "?access_token=" + this.accessToken + "&__cppo=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F" + p58 + "&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F" + p58 + "&entry_point=business_manager_business_info&locale=vi_VN&method=post&name=" + encodeURIComponent(p59) + "&pretty=0&suppress_http_code=1&version=17.0&xref=f325d6c85530f9c"
          });
          const v71 = v70.json;
          if (v71.id) {
            p60();
          } else {
            p61();
          }
        } catch (e14) {
          console.log(e14);
          p61();
        }
      });
    }
    renameVia(p62, p63) {
      return new Promise(async (p64, p65) => {
        try {
          const v72 = await fetch2("https://graph.facebook.com/v17.0/" + p62 + "?access_token=" + this.accessToken + "&_flowletID=10926&_triggerFlowletID=10926", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness_user&_reqSrc=UserServerActions.brands&first_name=" + p63 + "&last_name=" + randomNumberRange(11111, 99999) + "&locale=vi_VN&method=post&personaId=" + p62 + "&pretty=0&suppress_http_code=1&xref=f17adcdcd4e2ca4ed",
            method: "POST"
          });
          const v73 = v72.json;
          if (v73.success) {
            p64();
          } else {
            p65();
          }
        } catch {
          p65();
        }
      });
    }
    getInsta(p66) {
      return new Promise(async (p67, p68) => {
        try {
          const v74 = await fetch2("https://graph.facebook.com/v17.0/" + p66 + "/owned_instagram_accounts?access_token=" + this.accessToken + "&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fowned_instagram_accounts&_reqSrc=BusinessConnectedOwnedInstagramAccountsStore.brands&date_format=U&fields=%5B%22id_v2%22%2C%22username%22%2C%22profile_pic%22%2C%22owner_business%22%2C%22is_professional%22%2C%22is_reauth_required_for_permissions%22%2C%22is_ig_app_message_toggle_enabled%22%2C%22is_mv4b_profile_locked%22%5D&limit=25&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f8a7bc4b52c89b1ad&_flowletID=2683&_triggerFlowletID=2683");
          const v75 = v74.json;
          p67(v75);
        } catch (e15) {
          p68(e15);
        }
      });
    }
    removeInsta(p69, p70) {
      return new Promise(async (p71, p72) => {
        try {
          const v76 = await this.getInsta(p69);
          let vLN07 = 0;
          const vA5 = [];
          p70("Đang xóa tài khoản IG");
          const vF4 = p73 => {
            return new Promise(async (p74, p75) => {
              try {
                const v77 = await fetch2("https://graph.facebook.com/v17.0/" + p69 + "/instagram_accounts?access_token=" + this.accessToken + "&_flowletID=5310&_triggerFlowletID=5310", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Finstagram_accounts&_reqSrc=InstagramAccountActions.brands&instagram_account=" + p73 + "&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f1408f332e8171391",
                  method: "POST"
                });
                const v78 = v77.json;
                if (v78.success) {
                  vLN07++;
                }
              } catch (e16) {
                console.log(e16);
              }
              p74();
            });
          };
          for (let vLN08 = 0; vLN08 < v76.data.length; vLN08++) {
            const v79 = v76.data[vLN08];
            vA5.push(vF4(v79.id_v2));
          }
          await Promise.all(vA5);
          p70("Xóa thành công " + vLN07 + "/" + v76.data.length + " tài khoản IG");
        } catch {}
        p71();
      });
    }
    renameAds(p76, p77, p78 = false) {
      return new Promise(async (p79, p80) => {
        try {
          if (p78) {
            try {
              await fetch2("https://business.facebook.com/api/graphql/?_flowletID=2182&_triggerFlowletID=2182", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + this.uid + "&__usid=6-Tsasi9v2r9bil%3APsasi9u1lu74br%3A0-Asasi9n1il9kfa-RV%3D6%3AF%3D&__aaid=" + p76 + "&__bid=" + p76 + "&__user=" + this.uid + "&__a=1&__req=14&__hs=19805.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012269162&__s=qijlev%3Aq1pucg%3A43coip&__hsi=7349458436577797102&__dyn=7xeUmxa3-Q5E9EdoK2abBAjwIBwCwpUnCG6UtyEgwjojyUW3qiidBxa7Eiws8rzobo-5Ejwl8gw8i9y8G6Ehwik1kwAwwwxwUwa62qq1eCyUbQ4u2SmGxBa2dmm11K6U8o7y78jCggwExm3G4UhwXwEwmoS0DU2qwgEhxWbwQwnHxC1zVoao9k2B12ewzwAwgk6U-3K5E7VxK48W2a4p8y26U8U-U98C2i48nwCAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W11wCz84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o721Qw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25369&lsd=ALHtLDNNnDi8qX8bQH8hT0&__spin_r=1012269162&__spin_b=trunk&__spin_t=1711179138&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&variables=%7B%22input%22%3A%7B%22business_id%22%3A%22" + p78 + "%22%2C%22payment_legacy_account_id%22%3A%22" + p76 + "%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=6600383160000030",
                method: "POST"
              });
            } catch (e17) {
              console.log(e17);
            }
          }
          const v80 = await fetch2("https://graph.facebook.com/v18.0/act_" + p76 + "?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "name=" + encodeURIComponent(p77),
            method: "POST"
          });
          const v81 = v80.json;
          if (v81.success) {
            p79();
          } else {
            p80();
          }
        } catch (e18) {
          console.log(e18);
          p80();
        }
      });
    }
    addAdmin(p81, p82) {
      return new Promise(async (p83, p84) => {
        try {
          const v82 = await fetch2("https://adsmanager-graph.facebook.com/v19.0/act_" + p81 + "/users?_reqName=adaccount%2Fusers&access_token=" + this.accessToken + "&method=post&__cppo=1&_callFlowletID=7348&_triggerFlowletID=7349", {
            headers: {
              accept: "*/*",
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__ad_account_id=" + p81 + "&__interactionsMetadata=%5B%5D&_callFlowletID=7348&_reqName=adaccount%2Fusers&_reqSrc=AdsPermissionDialogController&_sessionID=556dc890ec046797&_triggerFlowletID=7349&account_id=" + p81 + "&include_headers=false&locale=vi_VN&method=post&pretty=0&role=281423141961500&suppress_http_code=1&uid=" + p82 + "&xref=f4838500204229be7",
            method: "POST"
          });
          const v83 = await fetch2("https://adsmanager.facebook.com/ads/manage/settings/permissions/?action=add_user_confirm&_callFlowletID=9287&_triggerFlowletID=9281", {
            headers: {
              accept: "*/*",
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "jazoest=25520&fb_dtsg=" + this.dtsg + "&is_cm=1&act=" + p81 + "&was_success=1&error_code=&user_id=" + p82 + "&search_query=&add_user_permission=281423141961500&__usid=6-Tsjjz1o1pttdlc%3APsjk0aw25pkra%3A0-Asjjz1o19kla0-RV%3D6%3AF%3D&__aaid=" + p81 + "&__user=" + this.uid + "&__a=1&__req=1i&__hs=19975.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1016325924&__s=ipvh6d%3A1elzm6%3Awcjrck&__hsi=7412680376252426657&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF8pK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8kybKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAxK4U-dwMxeayEiwAgCmq6UCQubxu3ydDxG8wRyK4UoLzokGp5yrz8C9wGLg-9wFy9oCagixi48hyUix6cG228BCyKbwzxa10yUG1LDDV8sw8KmbwVzi1y4fz8coiGQU9EeVVUWrUlUym5UpU9oeUhxWUnposxx7KAfwxCwyDxm5V9UWaV-bxhem9xq2K9AwHxq5kiV89bx5e8wAAAVQEhyeucyEy68WaJ129ho&__csr=&__comet_req=25&lsd=o_cxfnmTRU9tXHvOIjv5ic&__spin_r=1016325924&__spin_b=trunk&__spin_t=1725899143&__jssesw=1",
            method: "POST"
          });
          p83();
        } catch (e19) {
          console.log(e19);
          p84();
        }
      });
    }
    changeInfoAds(p85, p86, p87, p88, p89) {
      return new Promise(async (p90, p91) => {
        if (p86) {
          try {
            await fetch2("https://business.facebook.com/api/graphql/?_flowletID=2182&_triggerFlowletID=2182", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsasi9v2r9bil%3APsasi9u1lu74br%3A0-Asasi9n1il9kfa-RV%3D6%3AF%3D&__aaid=" + p85 + "&__bid=" + p85 + "&__user=" + this.uid + "&__a=1&__req=14&__hs=19805.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012269162&__s=qijlev%3Aq1pucg%3A43coip&__hsi=7349458436577797102&__dyn=7xeUmxa3-Q5E9EdoK2abBAjwIBwCwpUnCG6UtyEgwjojyUW3qiidBxa7Eiws8rzobo-5Ejwl8gw8i9y8G6Ehwik1kwAwwwxwUwa62qq1eCyUbQ4u2SmGxBa2dmm11K6U8o7y78jCggwExm3G4UhwXwEwmoS0DU2qwgEhxWbwQwnHxC1zVoao9k2B12ewzwAwgk6U-3K5E7VxK48W2a4p8y26U8U-U98C2i48nwCAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W11wCz84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o721Qw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25369&lsd=ALHtLDNNnDi8qX8bQH8hT0&__spin_r=1012269162&__spin_b=trunk&__spin_t=1711179138&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingSelfGrantManageAdAccountMutation&variables=%7B%22input%22%3A%7B%22business_id%22%3A%22" + p86 + "%22%2C%22payment_legacy_account_id%22%3A%22" + p85 + "%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=6600383160000030",
              method: "POST"
            });
          } catch {}
        }
        try {
          const v84 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=7168", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Ts5rdw4ejkzb9%3APs5rdw3f9ktw3%3A0-As5rdsb1ltzmda-RV%3D6%3AF%3D&__user=" + this.uid + "&__a=1&__req=1n&__hs=19707.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010466044&__s=d06uwg%3A6ckp8m%3A85uy65&__hsi=7313164176971322218&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25234&lsd=bCvJhCyzXeg968-UrrpA6K&__aaid=" + p85 + "&__spin_r=1010466044&__spin_b=trunk&__spin_t=1702728722&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingAccountInformationUtilsUpdateAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22" + p85 + "%22%2C%22currency%22%3A%22" + p87 + "%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A25%2C%22logging_id%22%3A%222786824690%22%7D%2C%22tax%22%3A%7B%22business_address%22%3A%7B%22city%22%3A%22Toolfb.vn%22%2C%22country_code%22%3A%22" + p89 + "%22%2C%22state%22%3A%22Toolfb.vn%22%2C%22street1%22%3A%22Toolfb.vn%22%2C%22street2%22%3A%22Toolfb.vn%22%2C%22zip%22%3A%2299999%22%7D%2C%22business_name%22%3A%22Toolfb.vn%22%2C%22is_personal_use%22%3Afalse%2C%22second_tax_id%22%3A%22%22%2C%22tax_id%22%3A%22%22%2C%22tax_registration_status%22%3A%22%22%7D%2C%22timezone%22%3A%22" + p88 + "%22%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22BILLING_HUB%22%2C%22external_flow_id%22%3A%222389477848%22%2C%22target_name%22%3A%22BillingAccountInformationUtilsUpdateAccountMutation%22%2C%22user_session_id%22%3A%22upl_1702728726646_fb2b6a0c-5c7b-4cd7-8973-6809dd8c607b%22%2C%22wizard_config_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_screen_name%22%3A%22account_information_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702728726646_b7c07b3c-65d4-478d-8578-4d26107d8179%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%225%22%7D%7D&server_timestamps=true&doc_id=23988069674173253",
            method: "POST"
          });
          const v85 = v84.json;
          if (!v85.errors) {
            p90(v85);
          } else {
            p91();
          }
        } catch (e20) {
          console.log(e20);
          p91();
        }
      });
    }
    getMainBmAccounts(p92) {
      return new Promise(async (p93, p94) => {
        try {
          const v86 = await fetch2("https://business.facebook.com/settings/info?business_id=" + p92);
          const v87 = v86.text;
          let v88 = v87.match(/(?<=\"business_user_id\":\")[^\"]*/g);
          let v89 = v87.match(/(?<=\"first_name\":\")[^\"]*/g);
          let v90 = v87.match(/(?<=\"last_name\":\")[^\"]*/g);
          if (v88[0]) {
            const vO7 = {
              id: v88[0],
              first_name: v89[0],
              last_name: v90[0]
            };
            p93(vO7);
          } else {
            p94();
          }
        } catch (e21) {
          p94(e21);
        }
      });
    }
    getBmAccounts(p95) {
      return new Promise(async (p96, p97) => {
        try {
          try {
            const v91 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + this.uid + "&__usid=6-Tsp3s4f1p0knjh%3APsp3s511vi2414%3A0-Asp3s4fwu59j7-RV%3D6%3AF%3D&__aaid=0&__bid=" + p95 + "&__user=" + this.uid + "&__a=1&__req=d&__hs=20083.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1019078392&__s=6a6pj6%3Azibb7t%3Awwnadh&__hsi=7452712138881246882&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw5MypU5-0Bo7O2l0Fwqo5W1yw9O48comwkE-UbE7i4UaEW2G261fwwwJK1qxa1ozEjU4Wdwoo4S5ayocE15E-2-qaUK0gq0Lo6-3u36iU9E2cwNwDwjouwqo4e220hi7E5y1rwGwWwmU88&__csr=gR7OhcCDsmy_lhQQJsRW4kHOJvnrWblOHtAlvWkBV7kyvt5rivP-hcZGC8ARRpWH-KjuABACKLFJ6BSBl5joDlJpbCQ-FpfA-hQlrGhbJarAiAC-QbKttKDtahvavABGVpqABgHhAjkCayWLhk9DGWh-Ve_G8QqZ3AGuqrhpayaBhbBnDGGCJaeCAAp9kFS9KqUyFdeq4prQippbKeBAxCm8AgymS9VcOx64agKmrCWCHxDCGA58Km27Z1amXy9oJe7oG5oZ1pUCFUlzFV8O23x92UKbCyA12xeUc88UixGazEB0HK7GwCwKx2m3u8xO4o2GAz8kBwDDwso8U0xC0fXjjAhUZd01fd1q0y0b0K7QzN0ng5C5xlwmE4R01sO0gS0ku19wVx6aIHA81_xO0ezDxO0U82XwemU1yoaE4-0na5UlU4q2G49K0gQE028Ow0-Sc0HEb81ho0SS08rBu0pt08QE7101ie07O4oMW2W1NgfIEow1eq0f7Lt00ZOw5wg0Qb804FE6-04i40fNDw33k0bXwaq2GutwiQ0dbw810aG6U&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25752&lsd=" + this.lsd + "&__spin_r=1019078392&__spin_b=trunk&__spin_t=1735219764&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsPeopleTableListPaginationQuery&variables=%7B%22asset_types%22%3Anull%2C%22businessAccessType%22%3A%5B%5D%2C%22businessUserStatusType%22%3A%5B%5D%2C%22cursor%22%3Anull%2C%22first%22%3A13%2C%22isBulkUserRemovalEnabled%22%3Afalse%2C%22isUnifiedSettings%22%3Atrue%2C%22orderBy%22%3A%22MOST_RECENTLY_CREATED%22%2C%22permissions%22%3A%5B%5D%2C%22searchTerm%22%3Anull%2C%22id%22%3A%22" + p95 + "%22%7D&server_timestamps=true&doc_id=28428357753421675"
            });
            const v92 = v91.json;
            p96(v92.data.node.business_users_and_invitations.edges.filter(p98 => !p98.nameColumn.invited_email).map(p99 => p99.nameColumn));
          } catch {
            const v93 = await fetch2("https://graph.facebook.com/v17.0/" + p95 + "/business_users?access_token=" + this.accessToken + "&_reqName=object%3Abusiness%2Fbusiness_users&_reqSrc=BusinessConnectedConfirmedUsersStore.brands&date_format=U&fields=%5B%22email%22%2C%22expiry_time%22%2C%22first_name%22%2C%22finance_permission%22%2C%22developer_permission%22%2C%22ip_permission%22%2C%22partner_center_admin_permission%22%2C%22partner_center_analyst_permission%22%2C%22partner_center_education_permission%22%2C%22partner_center_marketing_permission%22%2C%22partner_center_operations_permission%22%2C%22last_name%22%2C%22manage_page_in_www%22%2C%22marked_for_removal%22%2C%22pending_email%22%2C%22role%22%2C%22two_fac_status%22%2C%22is_two_fac_blocked%22%2C%22is_trusted_approver%22%2C%22was_integrity_demoted%22%2C%22sso_migration_status%22%2C%22backing_user_type%22%2C%22business_role_request.fields(creation_source.fields(name)%2Ccreated_by.fields(name)%2Ccreated_time%2Cupdated_time)%22%2C%22transparency_info_seen_by%22%2C%22work_profile_pic%22%2C%22is_pending_integrity_review%22%2C%22is_ineligible_developer%22%2C%22last_active_time%22%2C%22permitted_business_account_task_ids%22%2C%22sensitive_action_reviews%22%2C%22name%22%5D&limit=9999&locale=en_GB&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f1ef8e0e120281148&_callFlowletID=0&_triggerFlowletID=1");
            const v94 = v93.json;
            p96(v94.data);
          }
        } catch (e22) {
          p97(e22);
        }
      });
    }
    downgradeRole(p100, p101) {
      return new Promise(async (p102, p103) => {
        try {
          const v95 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=11539&_triggerFlowletID=11539", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsasm111tcohsq%3APsasm0z1lqubxp%3A0-Asasjvisjl1bu-RV%3D6%3AF%3D&__aaid=0&__bid=" + p100 + "&__user=" + this.uid + "&__a=1&__req=11&__hs=19805.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012269933&__s=0qa5cy%3Aa01ig3%3Ahy5hkd&__hsi=7349479331121257233&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhe5UkBwCwpUnCG6UmCyEgwNxK4UKegdp98Sm4Euxa1txaczES2S2q4U5i486C6EC8yEScx60DUcEixWq3i2q5E6e2qq1eCyUbQUTwJBGEpiwzlBwRyXxK261UxO4VAcK2y5oeEjx63K2y3WE9oO1Wxu0zoO12ypUuwg88EeAUpK1vDwyCwBgak48W2e2i3mbgrzUeUmwoErorx2aK2a4p8y26U8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS2W2K4E5yeDyU52dCxK3WcwMzUkGu3i2WEdEO8wl8hyVEKu9zawLCyKbwzweau1Hwio6-4e1mAK2q1bzFHwCwNwDwjouxK2i2y1sDw9-1Qw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25471&lsd=e6ML1zklGHVeAjzT6hdE8_&__spin_r=1012269933&__spin_b=trunk&__spin_t=1711184003&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BusinessAccountPermissionTasksForUserModalMutation&variables=%7B%22businessUserID%22%3A%22" + p101 + "%22%2C%22business_account_task_ids%22%3A%5B%22926381894526285%22%5D%2C%22isUnifiedSettings%22%3Afalse%7D&server_timestamps=true&doc_id=7337443546298507",
            method: "POST"
          });
          const v96 = v95.json;
          if (!v96.errors) {
            p102();
          } else {
            p103();
          }
        } catch {
          p103();
        }
      });
    }
    upgradeRole(p104, p105) {
      return new Promise(async (p106, p107) => {
        try {
          const v97 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=3129", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsmxjub117xs4l%3APsmxjw7sgqyks%3A0-Asmxjub15hrye4-RV%3D6%3AF%3D&__aaid=0&__bid=" + p104 + "&__user=" + this.uid + "&__a=1&__req=s&__hs=20041.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1018195279&__s=e39j42%3Ax5tt51%3Af3d1fd&__hsi=7437036134981410251&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i2GU8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS1qxa1ozFUK1gzo8EfEO32fxiEf8bGwgUy1kx6bxa4o-2-qaUK2e0UFU2RwrUgU5qiU9E4KeCK2q5UpwDwjouxK2i2x0mVU1587u1rwGw9q227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25465&lsd=swInxA34gvK9OSwF57p5Lb&__spin_r=1018195279&__spin_b=trunk&__spin_t=1731569910&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BusinessAccountPermissionTasksForUserModalMutation&variables=%7B%22businessUserID%22%3A%22" + p105 + "%22%2C%22business_account_task_ids%22%3A%5B%22926381894526285%22%2C%22603931664885191%22%2C%221327662214465567%22%2C%22862159105082613%22%2C%226161001899617846786%22%2C%221633404653754086%22%2C%22967306614466178%22%2C%222848818871965443%22%2C%22245181923290198%22%2C%22388517145453246%22%5D%2C%22isUnifiedSettings%22%3Afalse%7D&server_timestamps=true&doc_id=7706501459456230",
            method: "POST"
          });
          const v98 = v97.json;
          if (!v98.errors) {
            p106();
          } else {
            p107();
          }
        } catch {
          p107();
        }
      });
    }
    removeAccount(p108, p109, p110) {
      return new Promise(async (p111, p112) => {
        try {
          const v99 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=4255", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsp3zazukdpi%3APsp3zay15biznw%3A0-Asp3z7rm1c7vw-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=q&__hs=20083.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=GOOD&__rev=1019078593&__s=h7tq5u%3A0xfovi%3Axmbuqq&__hsi=7452752022536676552&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw5MypU5-0Bo7O2l0Fwqo5W1yw9O48comwkE-UbE7i4UaEW2G261fwwwJK1qxa1ozEjU4Wdwoo4S5ayouxe0hqfwLCyKbw46wbS1LwTwNAK2q0z8co9U4S7E6C13www4kxW1owmUaEeE5K22&__csr=glgDFT5ELRkaOWNmx5aYHnRS-yRsGTp5n-B9uhR8DThmCDNfAjfqFy9dtmuG_HjTF8yVeW-DO__qlkldyti9pbCQ-mFfA-hQlkGAiXiCp4F9LJ2AVRSWtQF5YHLABGV4GGil2J6hdipWyWLhk8huHF7XAX-EzhHQeiFVFJ5AG8Gl4KluuGGqQEWqihABiDoCVHAKF2eq4qGZ4CmiXzFp8ydGm8AgymSVujcECu4agKmrCWCHxDCmA58Km27Z1amXy9oJe7oG5oZ1oMyFu5oWnAz88e4AbG8yVEF1i6EKq4XwMwzxa6EGeyk2KUuF5K6UbEgBwTy8sx60GF8O59o9VU762e08pw3-QQV4ufjg0jPgmw8w2MbxZ8Yg5Q1pxolo5G1dg0ncw4dw57wioeohyHaV20vUsw3EVUswe20KU3BK0oC2G1fw5Oxu5u16wGx2rw4da01X7w3qE0fJz0aW2O0km0dJw26Vnw6ng2da1Mg0kzw1Yx6cewKwsk3Xa680jCw3NXTg0fsE1o40d2O01aq1Lw14x03YpU0MR02-U2CwGDDo4J03iU20g2GxK&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25731&lsd=3lg94FqqYWrhBLOzqUqzlY&__spin_r=1019078593&__spin_b=trunk&__spin_t=1735229050&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=GetBusinessSensitiveActionEnumQuery&variables=%7B%22reviewParams%22%3A%7B%22action_type%22%3A%22BUSINESS_REMOVE_USER%22%2C%22business_id%22%3A%22" + p109 + "%22%2C%22remove_user_params%22%3A%7B%22target_user_id%22%3A%22" + p108 + "%22%7D%7D%2C%22roleRequestId%22%3A%22%22%2C%22isNotAddAdmin%22%3Atrue%7D&server_timestamps=true&doc_id=7112725228756755",
            method: "POST"
          });
          const v100 = v99.text;
          if (v100.includes("\"review_process\":\"NONE\"")) {
            const v101 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=4297", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsp3zuu16muqan%3APsp3zuu1y3hh81%3A0-Asp3z7rm1c7vw-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=u&__hs=20083.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=GOOD&__rev=1019078593&__s=jegcdv%3A6i9kbw%3As98h1x&__hsi=7452755096790988499&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw5MypU5-0Bo7O2l0Fwqo5W1yw9O48comwkE-UbE7i4UaEW2G261fwwwJK1qxa1ozEjU4Wdwoo4S5ayouxe0hqfwLCyKbw46wbS1LwTwNAK2q0z8co9U4S7E6C13www4kxW1owmUaEeE5K22&__csr=glgDFT5ELRkaOWNmx5aYHnRS-yRsGTp5n-B9uhR8DThmCDNfAjfqFy9dtmuG_HjTF8yVeW-DO__qlkldyti9pbCQ-mFfA-hQlkGAiXiCp4F9LJ2AVRSWtQF5YHLABGV4GGil2J6hdipWyWLhk8huHF7XAX-EzhHQeiFVFJ5AG8Gl4KluuGGqQEWqihABiDoCVHAKF2eq4qGZ4CmiXzFp8ydGm8AgymSVujcECu4agKmrCWCHxDCmA58Km27Z1amXy9oJe7oG5oZ1oMyFu5oWnAz88e4AbG8yVEF1i6EKq4XwMwzxa6EGeyk2KUuF5K6UbEgBwTy8sx60GF8O59o9VU762e08pw3-QQV4ufjg0jPgmw8w2MbxZ8Yg5Q1pxolo5G1dg0ncw4dw57wioeohyHaV20vUsw3EVUswe20KU3BK0oC2G1fw5Oxu5u16wGx2rw4da01X7w3qE0fJz0aW2O0km0dJw26Vnw6ng2da1Mg0kzw1Yx6cewKwsk3Xa680jCw3NXTg0fsE1o40d2O01aq1Lw14x03YpU0MR02-U2CwGDDo4J03iU20g2GxK&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25602&lsd=qst8LNj_XF01FbsYja7ruZ&__spin_r=1019078593&__spin_b=trunk&__spin_t=1735229766&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsRemoveBusinessUserMutation&variables=%7B%22businessID%22%3A%22" + p109 + "%22%2C%22businessUserID%22%3A%22" + p108 + "%22%7D&server_timestamps=true&doc_id=24401670346098526",
              method: "POST"
            });
            const v102 = v101.text;
            if (v102.includes("\"removed_business_user_id\":\"" + p108 + "\"")) {
              p111(true);
            } else {
              p111(false);
            }
          } else if (p110 && v100.includes("EMAIL_VERIFICATION")) {
            const v103 = await getNewEmail();
            const v104 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=14254", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsp5238al5avw%3APsp523617ulfhv%3A0-Asp51sr4mptu7-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=21&__hs=20084.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1019084625&__s=o7y020%3A72s3d7%3Ayv2miq&__hsi=7452967898814735127&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i2GU8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS1qxa1ozFUK1gzo8EfEO32fxiEf8bGwgUy1CyUix6fwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEg5Ku0hi1TwmUaEeE5K227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25388&lsd=tD-h8jfAcIJCp9QTA2mzVt&__spin_r=1019084625&__spin_b=trunk&__spin_t=1735279313&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=RequestBusinessRemoveUserReviewMutation&variables=%7B%22business_user_id%22%3A%22" + p108 + "%22%2C%22verification%22%3A%22EMAIL_VERIFICATION%22%7D&server_timestamps=true&doc_id=6588385494564438",
              method: "POST"
            });
            const v105 = v104.json.data.xfb_business_settings_request_business_remove_user_review.id;
            const v106 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=17812&_triggerFlowletID=17800", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsprjwxgxjbxt%3APsprkothunup6%3A0-Asprjldnfqxvs-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=30&__hs=20096.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=MODERATE&__rev=1019207539&__s=bwo10m%3A3ynzfz%3A8smij2&__hsi=7457479931389853262&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw4JwgECu1vw9m1YwBgao6C3m2y1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokG9wOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mwww&__csr=giMPbEIptgPcDmGskADjhbR9rZmHP8purlFR4FHOdYyQyRXmyrWaJKjiLQXV5mHJFOrKN2h5imnRRgDGBQjZaFExrJboDVD8sFidlKlbQV4-WH8JiF-DAJKBLmajADAKBHgjHoACiqcF2XyfAEGmXla-CHQVZ2F8XBFaJJ7CBChaGFrh9KaGrHABJ4nJ9d7DxSifFeqXhaGicyefF7Gu9CmHighQeyoDVeaGh7zQbz98S49oRbzFFk8Gay-UGiaG2IwyunVEnySeG22iUlz8a8C69UrVQ2yfg-8Biy8jGdwAzEhDDxuuiaAwCwMwjoOiUjxK1Iwwwi8b87mh03mU1rExehd5xS2h015Bw2uFc5iwlA1p1oze82Ud85S9y80gKw23jxq0KE8UME3BhExeqgw7i16G0bdw6qHw6Nw4KG0GpUgyoGm0xUrw6wghwDg5unxy0eXw0nio0hpw0iL981UFBo0j4Bw69Iw0Fu486501de0deg0hFghwDgaEF0r82ccmu5od80NW02iu9c06oE0jVg1880juBu08-w9S0biw2TE2AU0zkE3yg0Zt021Vk1igSvg1nk1DwWo0LG0g-3u&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25226&lsd=ZRF0ToV6zypnXO7gW8m6G6&__spin_r=1019207539&__spin_b=trunk&__spin_t=1736329852&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacBvTriggerRootQuery&variables=%7B%22input%22%3A%7B%22authenticatable_entity_id%22%3A%22" + v105 + "%22%2C%22xfac_config%22%3A%22XFAC_BUSINESS_VERIFICATION_STANDALONE_EMAIL%22%2C%22xfac_appeal_type%22%3A%22BUSINESS_VERIFICATION_STANDALONE_EMAIL%22%2C%22business_verification_design_system%22%3A%22GEODESIC%22%2C%22business_verification_ui_type%22%3A%22BUSINESS_MANAGER_COMET%22%2C%22trigger_event_type%22%3A%22XFAC_BV_ENTRY%22%2C%22nt_context%22%3Anull%2C%22trigger_session_id%22%3A%22e81e7065-6d6e-4a26-8984-3e8bc7df09dd%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8748278645220835",
              method: "POST"
            });
            const v107 = v106.json;
            const v108 = v107.data.ixt_xfac_bv_trigger.screen.view_model.serialized_state;
            v103.email = v107.data.ixt_xfac_bv_trigger.screen.view_model.content_renderer.advertiser_authenticity_email_challenge_screen.email_addresses[0];
            const v109 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=15580", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsprjwxgxjbxt%3APsprkothunup6%3A0-Asprjldnfqxvs-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=31&__hs=20096.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=MODERATE&__rev=1019207539&__s=rjlsyf%3A3ynzfz%3A8smij2&__hsi=7457479931389853262&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw4JwgECu1vw9m1YwBgao6C3m2y1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokG9wOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mwww&__csr=giMPbEIptgPcDmGskADjhbR9rZmHP8purlFR4FHOdYyQyRXmyrWaJKjiLQXV5mHJFOrKN2h5imnRRgDGBQjZaFExrJboDVD8sFidlKlbQV4-WH8JiF-DAJKBLmajADAKBHgjHoACiqcF2XyfAEGmXla-CHQVZ2F8XBFaJJ7CBChaGFrh9KaGrHABJ4nJ9d7DxSifFeqXhaGicyefF7Gu9CmHighQeyoDVeaGh7zQbz98S49oRbzFFk8Gay-UGiaG2IwyunVEnySeG22iUlz8a8C69UrVQ2yfg-8Biy8jGdwAzEhDDxuuiaAwCwMwjoOiUjxK1Iwwwi8b87mh03mU1rExehd5xS2h015Bw2uFc5iwlA1p1oze82Ud85S9y80gKw23jxq0KE8UME3BhExeqgw7i16G0bdw6qHw6Nw4KG0GpUgyoGm0xUrw6wghwDg5unxy0eXw0nio0hpw0iL981UFBo0j4Bw69Iw0Fu486501de0deg0hFghwDgaEF0r82ccmu5od80NW02iu9c06oE0jVg1880juBu08-w9S0biw2TE2AU0zkE3yg0Zt021Vk1igSvg1nk1DwWo0LG0g-3u&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25226&lsd=ZRF0ToV6zypnXO7gW8m6G6&__spin_r=1019207539&__spin_b=trunk&__spin_t=1736329852&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_email_challenge%22%3A%7B%22email_address%22%3A%22" + encodeURIComponent(v103.email) + "%22%2C%22org_id%22%3A%22" + v105 + "%22%2C%22serialized_state%22%3A%22" + v108 + "%22%2C%22website%22%3A%22%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8466997430071660",
              method: "POST"
            });
            const v110 = v109.json.data.ixt_screen_next.view_model.serialized_state;
            let v111 = false;
            for (let vLN09 = 0; vLN09 < 12; vLN09++) {
              try {
                const v112 = (await getEmailInbox(v103.id, v103.email)).filter(p113 => p113.email === "notification@facebookmail.com");
                if (v112[0]) {
                  v111 = v112[0].content.match(/([0-9]{6})/)[0];
                  break;
                }
              } catch {}
              await delayTime(2000);
            }
            if (v111) {
              const v113 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=16772", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + this.uid + "&__usid=6-Tsp5238al5avw%3APsp523617ulfhv%3A0-Asp51sr4mptu7-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=25&__hs=20084.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1019084625&__s=bh7b95%3A72s3d7%3Ayv2miq&__hsi=7452967898814735127&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i2GU8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS1qxa1ozFUK1gzo8EfEO32fxiEf8bGwgUy1CyUix6fwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEg5Ku0hi1TwmUaEeE5K227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25388&lsd=tD-h8jfAcIJCp9QTA2mzVt&__spin_r=1019084625&__spin_b=trunk&__spin_t=1735279313&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_enter_email_code%22%3A%7B%22check_id%22%3Anull%2C%22code%22%3A%22" + v111 + "%22%2C%22serialized_state%22%3A%22" + v110 + "%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8680151995437244",
                method: "POST"
              });
              const v114 = v113.json.data.ixt_screen_next.view_model.serialized_state;
              if (v114) {
                p111(true);
              } else {
                p111(false);
              }
            } else {
              p111(false);
            }
          } else {
            p111(false);
          }
        } catch (e23) {
          console.log(e23);
          p111(false);
        }
      });
    }
    removeAccount2(p114, p115) {
      return new Promise(async (p116, p117) => {
        try {
          const v115 = await fetch2("https://business.facebook.com/business/asset_onboarding/business_remove_admin/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "business_id=" + p115 + "&admin_id=" + p114 + "&session_id=2e942068-0721-40b7-a912-4f89f3a72b0e&event_source=PMD&__aaid=0&__bid=" + p115 + "&__user=" + this.uid + "&__a=1&__req=8&__hs=20010.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017311549&__s=n0exl1%3An9jvpp%3Af8agky&__hsi=7425567271958688187&__dyn=7xeUmF3EfXolwCwRyUbFp62-m2q3K2K5U4e1Fx-ewSxu68uxa0z8S2S0zU2EwBx60DU4m0nCq1eK2K8xN0CgC11x-7U7G78jxy1VwBwXwEwpU1eE4a4o5-0ha2l2Utg6y1uwiU7y3G48comwkE-3a0y83mwkE5G4E6u4U5W0HUkyE16Ec8-3qazo8U3ywbS1Lwqp8aE5G360NE1UU7u1rwGwbu&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25473&lsd=lAqaEcMivHToYG0Fq_qw4b&__spin_r=1017311549&__spin_b=trunk&__spin_t=1728899607&__jssesw=1"
          });
          const v116 = v115.text;
          if (v116.includes("error")) {
            p116(true);
          } else {
            p116(false);
          }
        } catch (e24) {
          console.log(e24);
          p116(false);
        }
      });
    }
    createAdAccount(p118, p119, p120, p121) {
      return new Promise(async (p122, p123) => {
        try {
          const v117 = await this.getMainBmAccounts(p118);
          const v118 = await fetch2("https://z-p3-graph.facebook.com/v17.0/" + p118 + "/adaccount?access_token=" + this.accessToken + "&__cppo=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccount&_reqSrc=AdAccountActions.brands&ad_account_created_from_bm_flag=true&currency=" + p119 + "&end_advertiser=" + p118 + "&invoicing_emails=%5B%5D&locale=vi_VN&media_agency=UNFOUND&method=post&name=" + encodeURIComponent(p121) + "&partner=UNFOUND&po_number=&pretty=0&suppress_http_code=1&timezone_id=" + p120 + "&xref=f240a980fd9969"
          });
          const v119 = v118.json;
          if (v119.account_id) {
            try {
              await fetch2("https://business.facebook.com/business/business_objects/update/permissions/", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                body: "asset_ids[0]=" + v119.account_id + "&asset_type=ad-account&business_id=" + p118 + "&roles[0]=151821535410699&roles[1]=610690166001223&roles[2]=864195700451909&roles[3]=186595505260379&user_ids[0]=" + v117.id + "&__user=" + this.uid + "&__a=1&__req=t&__hs=19662.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009606682&__s=2zimvz%3A8blg31%3A9mxlfz&__hsi=7296403044252789266&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o461twOxa7FEd89EmwoU9FE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WElUScwuEnw8ScwgECu7E422a3Fe6rwnVU8FE9k2B12ewi8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25484&lsd=M7V3k5fl_jTcOKm-KVKVe3&__aaid=0&__bid=" + p118 + "&__spin_r=1009606682&__spin_b=trunk&__spin_t=1698826216&__jssesw=1"
              });
            } catch {}
            p122(v119.account_id);
          } else {
            p123();
          }
        } catch (e25) {
          console.log(e25);
          p123();
        }
      });
    }
    createAdAccount2(p124, p125, p126, p127, p128) {
      return new Promise(async (p129, p130) => {
        try {
          const v120 = await fetch2("https://graph.facebook.com/v17.0/" + p124 + "/adaccount?access_token=" + this.accessToken + "&_callFlowletID=6343&_triggerFlowletID=6343", {
            headers: {
              accept: "*/*",
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccount&_reqSrc=AdAccountActions.brands&ad_account_created_from_bm_flag=true&currency=" + p125 + "&end_advertiser=" + p128 + "&invoicing_emails=%5B%5D&locale=vi_VN&media_agency=UNFOUND&method=post&name=" + p127 + "&partner=UNFOUND&po_number=&pretty=0&suppress_http_code=1&timezone_id=" + p126 + "&xref=f050d1e55a85bee6d",
            method: "POST"
          });
          const v121 = v120.json;
          if (v121.account_id) {
            p129();
          } else {
            p130();
          }
        } catch (e26) {
          console.log(e26);
          p130();
        }
      });
    }
    cancelPending(p131, p132) {
      return new Promise(async (p133, p134) => {
        try {
          const v122 = await fetch2("https://graph.facebook.com/v17.0/" + p131 + "/pending_users?access_token=" + this.accessToken + "&__cppo=1&_reqName=object%3Abusiness%2Fpending_users&_reqSrc=BusinessConnectedPendingUsersStore.brands&date_format=U&fields=%5B%22id%22%2C%22role%22%2C%22email%22%2C%22decrypted_email%22%2C%22invite_link%22%2C%22invited_user_type%22%2C%22status%22%2C%22permitted_business_account_task_ids%22%2C%22sensitive_action_reviews%22%5D&limit=9999&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f0e174657d4c29859&_flowletID=1&_triggerFlowletID=2");
          const v123 = v122.json;
          const v124 = v123.data.map(p135 => p135.id);
          if (v124.length > 0) {
            const v125 = v123.data.length;
            let vLN010 = 0;
            const vA6 = [];
            const vF5 = p136 => {
              return new Promise(async (p137, p138) => {
                try {
                  const v126 = await fetch2("https://graph.facebook.com/v17.0/" + p136 + "?access_token=" + this.accessToken + "&__cppo=1&_flowletID=2480&_triggerFlowletID=2480", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness_role_request&_reqSrc=UserServerActions.brands&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f0067a98f89047e57",
                    method: "POST",
                    mode: "cors"
                  });
                  const v127 = v126.json;
                  if (v127.success) {
                    vLN010++;
                  }
                } catch {}
                p137();
              });
            };
            p132("Đang hủy " + v125 + " lời mời");
            for (let vLN011 = 0; vLN011 < v124.length; vLN011++) {
              const v128 = v124[vLN011];
              vA6.push(vF5(v128));
            }
            await Promise.all(vA6);
            p132("Hủy thành công " + vLN010 + "/" + v125 + " lời mời");
            p133();
          } else {
            p132("Không có lời mời");
            p134();
          }
        } catch {
          p132("Hủy lời mời thất bại");
          p134();
        }
      });
    }
    outBm(p139) {
      return new Promise(async (p140, p141) => {
        try {
          const v129 = await fetch2("https://graph.facebook.com/v17.0/" + this.uid + "/businesses?access_token=" + this.accessToken + "&__cppo=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F" + this.uid + "%2Fbusinesses&_reqSrc=adsDaoGraphDataMutator&business=" + p139 + "&endpoint=%2F" + this.uid + "%2Fbusinesses&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&userID=" + this.uid + "&version=17.0&xref=f2e80f8533bb1f4"
          });
          const v130 = v129.json;
          if (v130.success) {
            p140();
          } else {
            p141();
          }
        } catch {
          p141();
        }
      });
    }
    getAdAccounts() {
      return new Promise(async (p142, p143) => {
        try {
          let vA7 = [];
          try {
            const v131 = await fetch2("https://graph.facebook.com/v14.0/me/adaccounts?limit=99999&fields=name,profile_picture,account_id,account_status,is_prepay_account,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},balance,owner,users{id,is_active,name,permissions,role,roles},insights.date_preset(maximum){spend},userpermissions.user(" + this.uid + "){role}&access_token=" + this.accessToken + "&summary=1&locale=en_US");
            vA7 = v131.json;
            vA7.data = vA7.data.filter(p144 => !p144.owner_business);
          } catch {
            const v132 = await fetch2("https://adsmanager-graph.facebook.com/v16.0/me/adaccounts?limit=99999&fields=name,profile_picture,account_id,account_status,owner_business,created_time,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},owner,insights.date_preset(maximum){spend},userpermissions.user(" + this.uid + "){role}&summary=1&access_token=" + this.accessToken + "&suppress_http_code=1&locale=en_US");
            vA7 = v132.json;
            const v133 = Math.ceil(vA7.data.length / 50);
            for (let vLN1 = 1; vLN1 <= v133; vLN1++) {
              const v134 = (vLN1 - 1) * 50;
              const v135 = vA7.data.slice(v134, vLN1 * 50);
              const vA8 = [];
              v135.forEach(p145 => {
                vA8.push({
                  id: p145.account_id,
                  relative_url: "/act_" + p145.account_id + "?fields=is_prepay_account,next_bill_date,balance,users{id,is_active,name,permissions,role,roles}",
                  method: "GET"
                });
              });
              const v136 = await fetch2("https://adsmanager-graph.facebook.com/v16.0?access_token=" + this.accessToken + "&suppress_http_code=1&locale=en_US", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "include_headers=false&batch=" + JSON.stringify(vA8),
                method: "POST"
              });
              const v137 = v136.json;
              for (let vLN012 = 0; vLN012 < v137.length; vLN012++) {
                if (v137[vLN012].code == 200) {
                  const v138 = JSON.parse(v137[vLN012].body);
                  const v139 = vA7.data.findIndex(p146 => p146.id === v138.id);
                  vA7.data[v139] = {
                    ...vA7.data[v139],
                    ...v138
                  };
                }
              }
            }
          }
          let vO11 = {};
          try {
            const v140 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?limit=99999&access_token=" + this.accessToken);
            const v141 = v140.json;
            if (v141.data.length) {
              vO11.data = v141.data;
            }
          } catch {
            vO11.data = [];
            const v142 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?limit=1000&access_token=" + this.accessToken);
            const v143 = v142.json;
            v143.data.forEach(p147 => {
              vO11.data.push(p147);
            });
            let v144 = v143.paging.next;
            if (v144) {
              for (let vLN013 = 0; vLN013 < 9999; vLN013++) {
                const v145 = await fetch2(v144);
                const v146 = v145.json;
                if (v146.data) {
                  v146.data.forEach(p148 => {
                    vO11.data.push(p148);
                  });
                }
                if (v146.paging.next) {
                  v144 = v146.paging.next;
                } else {
                  break;
                }
              }
            }
          }
          const v147 = vA7.data.map(p149 => p149.account_id);
          if (vO11.data) {
            const vF6 = (p150, p151) => {
              return new Promise(async (p152, p153) => {
                try {
                  const v148 = await fetch2("https://graph.facebook.com/v14.0/" + p150 + "/" + p151 + "?access_token=" + this.accessToken + "&pretty=1&fields=name%2Cprofile_picture%2Caccount_id%2Caccount_status%2Cis_prepay_account%2Cowner_business%2Ccreated_time%2Cnext_bill_date%2Ccurrency%2Cadtrust_dsl%2Ctimezone_name%2Ctimezone_offset_hours_utc%2Cdisable_reason%2Cadspaymentcycle%7Bthreshold_amount%7D%2Cbalance%2Cowner%2Cusers%7Bid%2Cis_active%2Cname%2Cpermissions%2Crole%2Croles%7D%2Cinsights.date_preset%28maximum%29%7Bspend%7D%2Cuserpermissions.user%28100029138032182%29%7Brole%7D&limit=50");
                  const v149 = v148.json;
                  v149.data.forEach(p154 => {
                    if (!v147.includes(p154.account_id)) {
                      vA7.data.push(p154);
                      v147.push(p154.account_id);
                    }
                  });
                  let v150 = v149.paging.next;
                  if (v150) {
                    for (let vLN014 = 0; vLN014 < 9999; vLN014++) {
                      const v151 = await fetch2(v150);
                      const v152 = v151.json;
                      if (v152.data) {
                        v152.data.forEach(p155 => {
                          if (!v147.includes(p155.account_id)) {
                            vA7.data.push(p155);
                            v147.push(p155.account_id);
                          }
                        });
                      }
                      if (v152.paging.next) {
                        v150 = v152.paging.next;
                      } else {
                        break;
                      }
                    }
                  }
                } catch {}
                p152();
              });
            };
            const vA9 = [];
            for (let vLN015 = 0; vLN015 < vO11.data.length; vLN015++) {
              const v153 = vO11.data[vLN015];
              vA9.push(vF6(v153.id, "owned_ad_accounts"));
              vA9.push(vF6(v153.id, "client_ad_accounts"));
            }
            await Promise.all(vA9);
          }
          if (vA7.data) {
            const vVO12 = {
              "0": "",
              "1": "ADS_INTEGRITY_POLICY",
              "2": "ADS_IP_REVIEW",
              "3": "RISK_PAYMENT",
              "4": "GRAY_ACCOUNT_SHUT_DOWN",
              "5": "ADS_AFC_REVIEW",
              "6": "BUSINESS_INTEGRITY_RAR",
              "7": "PERMANENT_CLOSE",
              "8": "UNUSED_RESELLER_ACCOUNT"
            };
            p142(vA7.data.map(p156 => {
              p156.limit = p156.adtrust_dsl;
              p156.prePay = p156.is_prepay_account ? "TT" : "TS";
              p156.threshold = p156.adspaymentcycle ? p156.adspaymentcycle.data[0].threshold_amount : "";
              p156.remain = p156.threshold - p156.balance;
              p156.spend = p156.insights ? p156.insights.data[0].spend : "0";
              p156.users = p156.users ? p156.users.data : [];
              const vMoment = moment(p156.next_bill_date);
              const vMoment2 = moment();
              const v154 = vMoment.diff(vMoment2, "days");
              const vA10 = ["EUR", "CHF", "BRL", "USD", "CNY", "MYR", "UAH", "QAR", "THB", "THB", "TRY", "GBP", "PHP", "INR"];
              if (vA10.includes(p156.currency)) {
                p156.balance = Number(p156.balance) / 100;
                p156.threshold = Number(p156.threshold) / 100;
                p156.remain = Number(p156.remain) / 100;
              }
              p156.limit = new Intl.NumberFormat("en-US").format(p156.limit).replace("NaN", "");
              p156.spend = new Intl.NumberFormat("en-US").format(p156.spend).replace("NaN", "");
              p156.remain = new Intl.NumberFormat("en-US").format(p156.remain).replace("NaN", "");
              p156.balance = new Intl.NumberFormat("en-US").format(p156.balance).replace("NaN", "");
              p156.threshold = new Intl.NumberFormat("en-US").format(p156.threshold).replace("NaN", "");
              if (!p156.cards) {
                p156.cards = [];
              }
              const v155 = p156.users.filter(p157 => p157.role === 1001);
              return {
                status: p156.account_status,
                type: p156.owner_business ? "Business" : "Cá nhân",
                reason: vVO12[p156.disable_reason],
                account: p156.name,
                adId: p156.account_id,
                limit: p156.limit,
                spend: p156.spend,
                remain: p156.remain,
                adminNumber: v155.length,
                nextBillDate: vMoment.format("DD/MM/YYYY"),
                nextBillDay: v154 < 0 ? 0 : v154,
                createdTime: moment(p156.created_time).format("DD/MM/YYYY"),
                timezone: p156.timezone_name,
                currency: p156.currency + "-" + p156.prePay,
                threshold: p156.threshold,
                role: p156.userpermissions?.data[0]?.role || "UNKNOWN",
                balance: p156.balance,
                bm: p156.owner_business ? p156.owner_business.id : null
              };
            }));
          } else {
            p143();
          }
        } catch (e27) {
          p143(e27);
        }
      });
    }
    checkHold(p158) {
      return new Promise(async (p159, p160) => {
        const vVO13 = {
          status: false,
          country: ""
        };
        try {
          const v156 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + this.uid + "&__usid=6-Ts51f1w1gfkvpj%3APs51f2gvheire%3A0-As51f1wdhal3d-RV%3D6%3AF%3D&__user=" + this.uid + "&__a=1&__req=8&__hs=19693.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010170946&__s=ew2ohe%3Afdtegc%3A7il5yk&__hsi=7307960693527437806&__dyn=7xe6Eiw_K5U5ObwyyVp6Eb9o6C2i5VGxK7oG484S7UW3qiidBxa7GzU721nzUmxe1Bw8W4Uqx619g5i2i221qwa62qq1eCBBwLghUbpqG6kE8Ro4uUfo7y78qggwExm3G4UhwXwEwlU-0DU2qwgEhxW10wv86eu1fgaohzE8U6q78-3K5E7VxK48W2a4p8y26UcXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYwGxe1uwciawaG13xC4oiyVV98OEdEGdwzweau0Jomwm8gU5qi2G1bzEG2q362u1IxK321VDx27o72&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25595&lsd=_WnEZ0cRpYEKpFXHPcY7Lg&__aaid=" + p158 + "&__spin_r=1010170946&__spin_b=trunk&__spin_t=1701517192&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingHubPaymentSettingsViewQuery&variables=%7B%22assetID%22%3A%22" + p158 + "%22%7D&server_timestamps=true&doc_id=6747949808592904"
          });
          const v157 = v156.text;
          const v158 = v157.match(/(?<=\"predicated_business_country_code\":\")[^\"]*/g);
          if (v158[0]) {
            vVO13.country = v158[0];
          }
          if (v157.includes("RETRY_FUNDS_HOLD")) {
            vVO13.status = true;
          } else {
            vVO13.status = false;
          }
        } catch {
          vVO13.status = false;
        }
        p159(vVO13);
      });
    }
    getCard(p161) {
      return new Promise(async (p162, p163) => {
        let vA11 = [];
        try {
          const v159 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "variables={\"paymentAccountID\":\"" + p161 + "\"}&doc_id=5746473718752934&__usid=6-Ts5btmh131oopb:Ps5bu98bb7oey:0-As5btmhrwegfg-RV=6:F=&__user=" + this.uid + "&__a=1&__req=s&__hs=19699.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010282616&__s=flj1ty:75294s:o83s9c&__hsi=7310049091311550655&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwvC6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25610&lsd=HExoeF2styyeq_LWWUo9db&__aaid=" + p161 + "&__spin_r=1010282616&__spin_b=trunk&__spin_t=1702003435&__jssesw=1"
          });
          const v160 = v159.json;
          vA11 = v160.data?.billable_account_by_payment_account?.billing_payment_account?.billing_payment_methods;
        } catch {}
        p162(vA11);
      });
    }
    addCard(p164, p165, p166) {
      return new Promise(async (p167, p168) => {
        const v161 = this.uid;
        const v162 = this.dtsg;
        console.log(v161, v162);
        try {
          const v163 = p165.cardNumber.toString().replaceAll(" ", "");
          const vParseInt = parseInt(p165.expMonth);
          const vParseInt2 = parseInt(p165.expYear);
          const v164 = v163.toString().substr(0, 6);
          const v165 = v163.toString().slice(-4);
          let v166 = false;
          if (p166 == 1) {
            v166 = await fetch2("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5755", {
              headers: {
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5n9f71tgu6bi%3APs5n9f71o4wo1d%3A0-As5n9es1ukf1sd-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=23&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010409196&__s=tsyyte%3Aca3toj%3Ap91ad2&__hsi=7312337759778035971&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg=" + v162 + "&jazoest=25632&lsd=8pbDxyOWVFHU8ZQqBPXwiA&__aaid=" + p164 + "&__spin_r=1010409196&__spin_b=trunk&__spin_t=1702536307&__jssesw=1&qpl_active_flow_ids=270206296&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A56%2C%22logging_id%22%3A%221695426641%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702536309339_5f530bbf-fed6-4f28-8d5c-48c42769f959%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702536309339_859290be-8180-4b68-a810-97e329d6ff00%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%2211%22%7D%7D&server_timestamps=true&doc_id=7203358526347017&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270206296%22%5D",
              method: "POST"
            });
          }
          if (p166 == 2) {
            v166 = await fetch2("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5602", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5nbs384tvjc%3APs5nbs31x3roaz%3A0-As5nbrg12abp26-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=2c&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010409196&__s=vva7lu%3Ai7twp6%3Ai6haj9&__hsi=7312350885137944044&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq3O11orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg=" + v162 + "&jazoest=25632&lsd=atclR6VUVMWqcQJ9vPCgdL&__aaid=" + p164 + "&__spin_r=1010409196&__spin_b=trunk&__spin_t=1702539363&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A36%2C%22logging_id%22%3A%222195093243%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702539365385_4aba71a2-a333-4dba-9816-d502aa296ad1%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702539445087_1069a84b-5462-4e7c-b503-964f5da85c9e%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }
          if (p166 == 3) {
            v166 = await fetch2("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=8308", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5ncpg15yixvw%3APs5ncpg19n5k27%3A0-As5nco9x6xrcn-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=2h&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010412528&__s=0oatf1%3A21wtco%3A7hru27&__hsi=7312356040330685281&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3Kq2imeGqFEkG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU8ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW5FQ4Vbz8ix2q9hUhzoizE-Hx6290BAggwwCzoO69UryFE4eaKFprzu6QUCZ0IXGECutk2dmm2adAyXzAbwxyU6O78jCgOVp8W9AylmnyUb8jz98eUS48C11xny-cyo725UiGm1ixWcgsxN6ypVoKcyV8W22m78eF8pK3m2DBCG4UK4EigK7kbAzE8Uqy43mbgOUGfgeEhAwJCxSegroG48gyHx2cAByV8y7rKfxefKaxWi2y2icxaq4VEhGcx22uexm4ofp8rxefzobK4UGaxa2h2pqK6UCQubxu3ydCgqw-yK4UoLzokGp5yrz8CVoaHQfwCz8ym9yA4Ekx24oKqbDypVawwy9pEHCAwzxa3m5EG1LDDV8swhU4embwVzi1y4fz8coiGQU9EeU-eC-5u8BwNU9oboS4ouK5Qq78ohXF3U8pE8FUlxuiueyK5okyEC8wVw&__comet_req=25&fb_dtsg=" + v162 + "&jazoest=25300&lsd=kQwoj2grbvdlOnXmuC9nTM&__aaid=" + p164 + "&__spin_r=1010412528&__spin_b=trunk&__spin_t=1702540563&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22US%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A60%2C%22logging_id%22%3A%224034760264%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702540566252_4f062482-d4e4-4c40-b8c5-c0d643d0e5b4%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702540566252_5d97ef95-3809-4231-a8b3-f487855c965d%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%2212%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }
          if (p166 == 4) {
            v166 = await fetch2("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3823", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5nduusqru6%3APs5nduu1s4ryxb%3A0-As5nduuzgap66-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=1o&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010413747&__s=a9ss2l%3Aptab0y%3Ae2tqc1&__hsi=7312362442079618026&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwYwgm6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&fb_dtsg=" + v162 + "&jazoest=25289&lsd=WCAAksbHDq9ktWk0fRV9iq&__aaid=" + p164 + "&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542054&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A45%2C%22logging_id%22%3A%223760170890%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542056078_4b48c676-8dff-447d-8576-be8eace3fa70%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542056078_63cbaee3-ff87-45c3-8093-96bbd0331e68%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%227%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }
          if (p166 == 5) {
            v166 = await fetch2("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3674", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5nebgytlglm%3APs5ned212v0lbj%3A0-As5nebgnh3ghe-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=1d&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010413747&__s=338clt%3Ahvf4zf%3Afrhk6f&__hsi=7312365256460775839&__dyn=7AgSXgWGgWEjgDBxmSudgf64ECbxGuml4AqxuUgBwCwXCwABzGCGq5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV0JyU6O78qgOVp8W9AylmnyUb8jz98eUS48C11xny-cyo725UiGm1ixWcgsxN6ypVoKcyV8W22m78eF8pK3m2DBCG4UK4EigK7oOiewzxG8gdoJ3byEZ0Wx6i2Sq7oV1JyEgx2aK48OimbAy8tKU-4U-UG7F8a898O4FEjCx6EO489UW5ohwZAxK4U-dwKUjyEG4E949BGUryrhUK5Ue8Sp1G3WaUjxy-dxiFAm9KcyrBwGLg-2qcy9oCagixi48hyVEKu9DAG228BCyKqi2e4EdomyE6-uvAxO17wgVoK3Cd868g-cwNxaHgaEeU-eC-5u8BwNU9oboS4ouK5Qq78ohXF3U8pE8FUlxuiueyK5okyEC8wVw&__comet_req=25&fb_dtsg=" + v162 + "&jazoest=25466&lsd=V93_40ILei7NAmQfSh_tls&__aaid=" + item.ad + "&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542709&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A41%2C%22logging_id%22%3A%223115641264%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542711187_368e9941-43bc-4e54-8a9a-78e0e48980fd%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542711187_088ec65b-5388-4d82-8e28-12533de0fff5%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }
          if (v166) {
            const v167 = v166.text;
            if (v167.includes("{\"credit_card\":{\"card_association\":\"")) {
              p167();
            } else {
              p168();
            }
          } else {
            p168();
          }
        } catch (e28) {
          p168(e28);
        }
      });
    }
    checkHiddenAdmin(p169, p170 = false) {
      return new Promise(async (p171, p172) => {
        try {
          let v168;
          if (p170) {
            v168 = await fetch2("https://business.facebook.com/ads/manager/account_settings/information/?act=" + p169 + "&pid=p1&business_id=" + p170 + "&page=account_settings&tab=account_information");
          } else {
            v168 = await fetch2("https://www.facebook.com/ads/manager/account_settings/information/?act=" + p169);
          }
          const v169 = v168.text;
          const v170 = v169.match(/\b(\d+)\,(name:null)\b/g);
          if (v170) {
            p171(v170.map(p173 => {
              return p173.replace(",name:null", "");
            }));
          } else {
            p171([]);
          }
        } catch (e29) {
          p172(e29);
        }
      });
    }
    getAdsUser(p174) {
      return new Promise(async (p175, p176) => {
        try {
          const v171 = await fetch2("https://graph.facebook.com/v16.0/act_" + p174 + "?access_token=" + this.accessToken + "&__cppo=1&__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=adaccount&fields=[\"users{id,is_active,name,permissions,role,roles}\"]&locale=en_US&method=get&pretty=0&suppress_http_code=1&xref=f3b1944e6a8b33c&_flowletID=1");
          const v172 = v171.json;
          p175(v172.users.data);
        } catch (e30) {
          p176();
        }
      });
    }
    removeAdsUser(p177, p178) {
      return new Promise(async (p179, p180) => {
        try {
          const v173 = await fetch2("https://graph.facebook.com/v14.0/act_" + p177 + "/users/" + p178 + "?method=DELETE&access_token=" + this.accessToken);
          const v174 = v173.json;
          if (v174.success) {
            p179();
          } else {
            p180();
          }
        } catch (e31) {
          console.log(e31);
          p180();
        }
      });
    }
    loadAds() {
      return new Promise(async (p181, p182) => {
        try {
          const v175 = (await getLocalStorage("dataAds_" + fb.uid)) || [];
          if (v175.length > 0) {
            $(document).trigger("loadSavedAds", [v175]);
          } else {
            const v176 = await this.getAdAccounts();
            $(document).trigger("loadAdsSuccess", [v176]);
            const vA12 = [];
            const vF7 = (p183, p184 = false) => {
              return new Promise(async (p185, p186) => {
                try {
                  const v177 = await this.checkHold(p183);
                  let vLS4 = "[]";
                  try {
                    const v178 = await this.getCard(p183);
                    vLS4 = JSON.stringify(v178.filter(p187 => p187.credential.__typename !== "StoredBalance")) || "[]";
                  } catch {}
                  let vLS5 = "";
                  if (v177.status) {
                    vLS5 = 999;
                  } else if (p184) {
                    const v179 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=1&_triggerFlowletID=2", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      body: "av=" + this.uid + "&__usid=6-Tse1ovt1j8u6wd%3APse1oxj1m4rr33%3A0-Ase1ovtochuga-RV%3D6%3AF%3D&session_id=144e97c8e5fc4969&__aaid=" + p183 + "&__bid=" + p184 + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19868.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1013767953&__s=qxxa8s%3Ax39hkh%3Apw4cw7&__hsi=7372940659475198570&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fz98W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyUhzawLCyKbwzweau0Jo6-1FAyo884KeCK2q362u1dxW6U98a85Ou0DU7i1TwUw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25134&lsd=nZD2aEOcch1tFKEE4sGoAT&__spin_r=1013767953&__spin_b=trunk&__spin_t=1716646518&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewQuery&variables=%7B%22assetOwnerId%22%3A%223365254127037950%22%2C%22assetId%22%3A%22" + p183 + "%22%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=6875615999208668",
                      method: "POST"
                    });
                    const v180 = v179.json;
                    const v181 = v180.data.adAccountData.advertising_restriction_info;
                    if (v181.ids_issue_type === "AD_ACCOUNT_ALR_DISABLE" && v181.status === "APPEAL_PENDING") {
                      vLS5 = 4;
                    }
                    if (v181.ids_issue_type === "AD_ACCOUNT_ALR_DISABLE" && v181.status === "VANILLA_RESTRICTED" || v181.ids_issue_type === "AD_ACCOUNT_ALR_DISABLE" && v181.status === "APPEAL_REJECTED") {
                      vLS5 = 5;
                    }
                    if (v181.ids_issue_type === "PREHARM_AD_ACCOUNT_BANHAMMER" && v181.status === "APPEAL_INCOMPLETE") {
                      vLS5 = 6;
                    }
                    if (v181.ids_issue_type === "PREHARM_AD_ACCOUNT_BANHAMMER" && v181.status === "APPEAL_REJECTED") {
                      vLS5 = 7;
                    }
                  }
                  const vO14 = {
                    id: p183,
                    status: vLS5,
                    country: v177.country,
                    payment: vLS4
                  };
                  $(document).trigger("loadAdsSuccess2", [vO14]);
                } catch (e32) {
                  console.log(e32);
                }
                p185();
              });
            };
            v176.forEach(p188 => {
              if (p188.bm) {
                vA12.push(vF7(p188.adId, p188.bm));
              } else {
                vA12.push(vF7(p188.adId));
              }
            });
            await Promise.all(vA12);
          }
          p181();
        } catch {}
      });
    }
    loadBm() {
      return new Promise(async (p189, p190) => {
        try {
          const v182 = (await getLocalStorage("dataBm_" + fb.uid)) || [];
          if (v182.length > 0) {
            $(document).trigger("loadSavedBm", [v182]);
          } else {
            const v183 = await this.getBm();
            try {
              const v184 = await this.getBmStatus();
              $(document).trigger("loadBmSuccess", [v184]);
            } catch (e33) {
              $(document).trigger("loadBmSuccess3", [v183]);
            }
            try {
              const v185 = await this.getBmPage();
              $(document).trigger("loadBmSuccess4", [v185]);
            } catch (e34) {
              console.log(e34);
            }
            $(document).trigger("loadBmSuccess2", [v183]);
            const vF8 = p191 => {
              return new Promise(async (p192, p193) => {
                try {
                  const v186 = await this.getBmLimit(p191.id);
                  $(document).trigger("loadLimitSuccess", [{
                    id: p191.id,
                    type: "BM" + v186 + " - " + moment(p191.created_time).format("DD/MM/YYYY"),
                    limit: v186
                  }]);
                } catch {}
                try {
                  const v187 = await this.getBmAccounts(p191.id);
                  const vO15 = {
                    id: p191.id,
                    count: v187.length
                  };
                  $(document).trigger("loadQtvSuccess", [vO15]);
                } catch {}
                try {
                  const v188 = await this.getInsta(p191.id);
                  const vO16 = {
                    id: p191.id,
                    count: v188.data.length
                  };
                  $(document).trigger("loadInstaSuccess", [vO16]);
                } catch {}
                p192();
              });
            };
            const vA13 = [];
            for (let vLN016 = 0; vLN016 < v183.length; vLN016++) {
              vA13.push(vF8(v183[vLN016]));
            }
            await Promise.all(vA13);
            $(document).trigger("saveData");
          }
          p189();
        } catch {
          p190();
        }
      });
    }
    getPage() {
      return new Promise(async (p194, p195) => {
        try {
          const v189 = await fetch2("https://graph.facebook.com/me/accounts?type=page&fields=id,additional_profile_id,birthday,name,likes,followers_count,is_published,page_created_time,business,perms&access_token=" + this.accessToken);
          const v190 = v189.json.data;
          p194(v190);
        } catch {
          p195();
        }
      });
    }
    switchPage(p196) {
      return new Promise(async (p197, p198) => {
        try {
          const v191 = await getCookie();
          await setCookie(v191 + "; i_user=" + p196);
          p197();
        } catch (e35) {
          p198(e35);
        }
      });
    }
    switchToMain() {
      return new Promise(async (p199, p200) => {
        try {
          const v192 = await getCookie();
          await setCookie(v192.split(";").filter(p201 => !p201.includes("i_user")).join(";"));
          p199();
        } catch (e36) {
          p200();
        }
      });
    }
    getPageData(p202) {
      return new Promise(async (p203, p204) => {
        try {
          const v193 = await fetch2("https://graph.facebook.com/" + this.uid + "/accounts?access_token=" + this.accessToken);
          const v194 = v193.json;
          const v195 = v194.data.filter(p205 => p205.id == p202)[0];
          const v196 = await fetch2("https://www.facebook.com/settings?tab=profile&section=name&view");
          const v197 = v196.text;
          const v198 = v197.match(/(?<=\"token\":\")[^\"]*/g).filter(p206 => p206.startsWith("NA"));
          if (v195.access_token && v198[0]) {
            const vO17 = {
              token: v195.access_token,
              dtsg: v198[0]
            };
            p203(vO17);
          } else {
            p204();
          }
        } catch (e37) {
          p204(e37);
        }
      });
    }
    renamePage(p207, p208, p209) {
      return new Promise(async (p210, p211) => {
        try {
          await fetch2("https://www.facebook.com/ajax/settings/account/name.php", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "cquick_token=" + p209.token + "&ctarget=https%3A%2F%2Fwww.facebook.com&cquick=jsc_c_1&jazoest=25374&fb_dtsg=" + p209.dtsg + "&save_password=" + encodeURIComponent(password) + "&pseudonymous_name=" + encodeURIComponent(p208) + "&__user=" + p207 + "&__a=1&__req=4&__hs=19695.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010180631&__s=%3Aut7rwf%3Akoqxot&__hsi=7308682028817560329&__dyn=7xu5Fo4OQ1PyUbAihwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3BwbC0LVE4W0y8460KEswIwuo5-2G1Qw5Mx61vwnE2PwOxS2218w5uwaO0OU3mwkE5G0zE5W0HUvw6ixy0gq0Lo6-1FwbO0NE1rE&__csr=&lsd=HsqF1vTumyjXb6g7r3sn5v&__spin_r=1010180631&__spin_b=trunk&__spin_t=1701685141"
          });
          const v199 = await fetch2("https://graph.facebook.com/" + p207 + "/?fields=name&access_token=" + accessToken);
          const v200 = v199.json;
          if (v200.name === p208) {
            p210();
          } else {
            p211();
          }
        } catch (e38) {
          p211();
        }
      });
    }
    sharePage(p212, p213, p214) {
      return new Promise(async (p215, p216) => {
        try {
          const v201 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + p212 + "&__user=" + p212 + "&__a=1&__req=g&__hs=19697.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1010231448&__s=zvjw9u%3Ajgblij%3Ah6vy63&__hsi=7309320928293449979&__dyn=7AzHxqUW13xt0mUyEqxemhwLBwopU98nwgUao4u5QdwSxucyUco5S3O2Saw8i2S1DwUx609vCxS320om78bbwto88422y11xmfz83WwtohwGxu782lwv89kbxS2218wc60D8vwRwlE-U2exi4UaEW2au1NxGm2SUbElxm3y3aexfxm16wUws9ovUy2a0SEuBwJCwLyESE2KwwwOg2cwMwrUdUcojxK2B0oobo8oC1Iwqo4e4UcEeEfE-VU&__csr=g9X10x5N7mJ5STnrASKHF4SZRtH88KheiqprWy9VqV8RaGhaKmryqhaAXHy8SjigzV5GXWB-F6i8CCAz9VFUrQGV8qKbV8KqeJ5AFa5ohmJ2e8xjG4A54t5GiqcDG7EjUmCyFoS48OcyoshkV8tXV8OummQayEhxq15xyu8z88Ehho8UjyUiwJxqdzEdZ12bKcwEzU4O3h3pEW5UrxS7UkBw9Sm2qaiy8qwHwDx64e8x-58fU9Ai4aw8K58K4E9axS8x2axW7Eao6K19Cwep0Gwko8Xw5-U0gmxei036q0Y80yu0UE0ajo020Gw0NTw3XU09Io3tw8-1jw4rw2-U2qo6K0fTo-2h020U0eBo1wS8xGyPwoQ1BU2wwby0Fo0FV016ulw5xF0ei0fLwrE6i0w9oB0Xw9m09GwcC08pw4H8it3o0vgw&__comet_req=1&fb_dtsg=" + p214.dtsg + "&jazoest=25639&lsd=O8kC1RCTsys6PG356SZQnQ&__aaid=0&__spin_r=1010231448&__spin_b=trunk&__spin_t=1701833896&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCoreAppAdminInviteMutation&variables=%7B%22input%22%3A%7B%22additional_profile_id%22%3A%22" + p212 + "%22%2C%22admin_id%22%3A%22" + p213 + "%22%2C%22admin_visibility%22%3A%22Unspecified%22%2C%22grant_full_control%22%3Atrue%2C%22actor_id%22%3A%22" + p212 + "%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=5707097792725637"
          });
          const v202 = v201.text;
          if (v202.includes("errors") && v202.includes("description")) {
            const v203 = JSON.parse(v202);
            return p216(v203.errors[0].description);
          }
          const v204 = v202.match(/(?<=\"profile_admin_invite_id\":\")[^\"]*/g);
          if (v204[0]) {
            p215(v204[0]);
          } else {
            p216();
          }
        } catch (e39) {
          console.log(e39);
          p216();
        }
      });
    }
    checkPage(p217) {
      return new Promise(async (p218, p219) => {
        let vLS6 = "";
        try {
          const v205 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%2C%22assetId%22%3A%22" + p217 + "%22%7D&server_timestamps=true&doc_id=6228297077225495",
            method: "POST"
          });
          const v206 = v205.json;
          if (v206.data.pageData.advertising_restriction_info.status === "APPEAL_REJECTED_NO_RETRY") {
            vLS6 = 1;
          }
          if (v206.data.pageData.advertising_restriction_info.status === "VANILLA_RESTRICTED") {
            vLS6 = 2;
          }
          if (v206.data.pageData.advertising_restriction_info.status === "APPEAL_PENDING") {
            vLS6 = 3;
          }
          if (v206.data.pageData.advertising_restriction_info.status === "NOT_RESTRICTED") {
            vLS6 = 4;
          }
          if (v206.data.pageData.advertising_restriction_info.restriction_type === "BI_IMPERSONATION") {
            vLS6 = 5;
          }
          if (!v206.data.pageData.advertising_restriction_info.is_restricted && v206.data.pageData.advertising_restriction_info.restriction_type === "ALE") {
            vLS6 = 6;
          }
        } catch {}
        p218(vLS6);
      });
    }
    loadPage() {
      return new Promise(async (p220, p221) => {
        try {
          const v207 = (await getLocalStorage("dataPage_" + fb.uid)) || [];
          if (v207.length > 0) {
            $(document).trigger("loadSavedPage", [v207]);
          } else {
            const v208 = await this.getPage();
            $(document).trigger("loadPageSuccess", [v208]);
            const vF9 = p222 => {
              return new Promise(async (p223, p224) => {
                try {
                  const v209 = await this.checkPage(p222.id);
                  const vO18 = {
                    id: p222.id,
                    status: v209
                  };
                  $(document).trigger("updatePageStatus", [vO18]);
                } catch (e40) {}
                p223();
              });
            };
            const vA14 = [];
            for (let vLN017 = 0; vLN017 < v208.length; vLN017++) {
              vA14.push(vF9(v208[vLN017]));
            }
            await Promise.all(vA14);
          }
          p220();
        } catch {
          p221();
        }
      });
    }
    loadGroup() {
      return new Promise(async (p225, p226) => {
        try {
          const v210 = (await getLocalStorage("dataGroup_" + fb.uid)) || [];
          if (v210.length > 0) {
            $(document).trigger("loadSavedGroup", [v210]);
          } else {
            const v211 = await this.getGroup();
            $(document).trigger("loadGroupSuccess", [v211]);
          }
          p225();
        } catch {
          p226();
        }
      });
    }
    getInvites() {
      return new Promise(async (p227, p228) => {
        let vA15 = [];
        try {
          const v212 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + this.uid + "&__aaid=0&__user=" + this.uid + "&__a=1&__req=1n&__hs=19809.HYP2%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1012346269&__s=hlz3t5%3Aqps39g%3Aphae8m&__hsi=7350991099154827576&__dyn=7AzHK4HwBgDx-5Q1ryaxG4Qih09y2O5U4e2CEf9UKbgS3qi7UK360CEboG4E762S1DwUx60xU8k1sw9u0LVEtwMw65xO321Rwwwg8a8462mcw8a1TwgEcEhwGxu782lwj8bU9kbxS210hU31wiE567Udo5qfK0zEkxe2Gexe5E5e7oqBwJK2W5olwUwOzEjUlDw-wQK2616DBx_xWcwoE2mBwFKq2-azo6O14wwwOg2cwMwhEkxebwHwNxe6Uak2-1vwxyo566k1FwgU4q3G3WfKufxa3m7E&__csr=gtgoR2fk4IQZjElbEttlNidNa5h6yN29bOhdvRqaJGBjNQJidZ8Fz9RFGpCkGKJlZ4iOFfFXjmt6GFaFHLt4ABQh4RF997pnjhpGAJER7l5qZCinDRgJkBVanABnh9uZmVppd4QXjLybXvK-KrApp5z8y9FenWRjyBznyFCrGVbGGAAVUTVUgyBhWyV8zxi4p9UqAzUmx2uczrpK-7RCKagCiW-hmcgC4otwNAxeUC4EfF9rUKu9zeexmlabADxycG32E8Qdxi8AwAKFUKUhwyxiu58y2a3y7UmUvg9pHh8lDwhUC5UaJ1ui4-9wLwOwQwKzBwEK8z8KdK5UyUqxO291i4orxuexTAwFxC225EhwtVFA5Egxe3xei8w8Si0jW9KEG4WwUG8h8K2B0Gx0iqaEE8Q3qESB6PRAGl4OQ8AbkJQwyEbonw8aewjA19UaU2MwYgSq9tt1DgCcwjo6q2a0z9rCwLxZx1wbW1owcK19wjA2y58lic3O227Udo6-0HUc8VyHCyFU56Ue-fyqhpU0Li06ro34w32UC1nDw18i8xm0MXwzwcW0fjU6J03dU0P201M8wr804X20H40kyCewh8iBG0rSQ5U5e1lwzg1Fk1awyxu0bdw7tw1Au0P83pw12a68K0LqUqw7hw189wdm0QU0jbw6dwKx61nwlo14Uy0dwg0WW0e5AG0dSo4Whyo3zw1Ni3Nw2041rxe5to2Xwd60mq8yEc8F1504Jziw1iu1Uw16au8w&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25312&lsd=EM5XT5VIDQF8uzBNd5t2fD&__spin_r=1012346269&__spin_b=trunk&__spin_t=1711535989&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PageCometLaunchpointInvitesRootQuery&variables=%7B%22id%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=7224925170868877"
          });
          const v213 = v212.json;
          vA15 = v213.data.user.profile_admin_invites.map(p229 => {
            const vO20 = {
              inviteId: p229.profile_admin_invite_id,
              pageId: p229.profile_admin_inviter.id
            };
            return vO20;
          });
        } catch (e41) {
          console.log(e41);
        }
        p227(vA15);
      });
    }
    acceptPage(p230) {
      return new Promise(async (p231, p232) => {
        try {
          const v214 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + this.uid + "&__aaid=0&__user=" + this.uid + "&__a=1&__req=1t&__hs=19809.HYP2%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1012346269&__s=58dfwt%3Aqps39g%3Ad4ou37&__hsi=7350991530179737815&__dyn=7AzHK4HwkEng5K8G6EjBAg2owIxu13wFwnUW3q2ibwNw9G2Saw8i2S1DwUx60GE3Qwb-q7oc81xoswMwto886C11wBz83WwgEcEhwGxu782lwv89kbxS2218wc61awkovwRwlE-U2exi4UaEW2G1jxS6FobrwKxm5o7G4-5pUfEe88o4Wm7-7EO0-poarCwLyES1Iwh888cA0z8c84q58jyUaUcojxK2B08-269wkopg6C13whEeE4WVU-4Edouw&__csr=gtgoR6itgmjRlEnTIrsKx3dOi8l4qTP8AL9kHvRqayGBjEnOH8T8K8Fd9paDDi8EBRVkLqjW-8m8ypWFADQiimXh8JetCmbDUCPoJ2HozHDHy-mdKaABx24payV8izXLHzobUS7ERwKBGaxqUozosyd2U9FpUO58mx27VEzKU89EWaAKq9zoC18xy68ym1rx62-5ob85a17zk1Txi7898fWxO1HAxS0B81dEiAwCwo88Ukw50w-w7bw5hw1jy0oG0ii1So88mwEwd2037a07j40XpU092U03g4g0TKQ5U5e1lwzg0yO04GU0p7wcO0So04va09Yw0pPk1rxe5to6m1lw2go0sXw3oU&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25593&lsd=DKpGY6WjRs4LdeRqjPDpX2&__spin_r=1012346269&__spin_b=trunk&__spin_t=1711536089&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCometAcceptOrDeclineAdminInviteMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22is_accept%22%3Atrue%2C%22profile_admin_invite_id%22%3A%22" + p230.inviteId + "%22%2C%22user_id%22%3A%22" + this.uid + "%22%7D%2C%22scale%22%3A1%2C%22__relay_internal__pv__VideoPlayerRelayReplaceDashManifestWithPlaylistrelayprovider%22%3Afalse%7D&server_timestamps=true&doc_id=25484830601161332"
          });
          const v215 = v214.json;
          if (v215.data.accept_or_decline_profile_plus_admin_invite.id === this.uid) {
            p231();
          } else {
            p232();
          }
        } catch (e42) {
          p232(e42);
        }
      });
    }
    getAccountQuality() {
      return new Promise(async (p233, p234) => {
        try {
          const v216 = await fetch2("https://www.facebook.com/api/graphql/?_flowletID=1&_triggerFlowletID=2", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsas5n6h0it5h%3APsas5n4jqrxdy%3A0-Asas5ms1bzoc6y-RV%3D6%3AF%3D&session_id=2791d1615dda0cb8&__aaid=0&__user=" + this.uid + "&__a=1&__req=1&__hs=19805.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012251909&__s=p9dz00%3A3ya0mx%3Aafup89&__hsi=7349388123137635674&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fx6ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAyo884KeCK2q362u1dxW6U98a85Ou0DU7i&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25334&lsd=" + this.lsd + "&__spin_r=1012251909&__spin_b=trunk&__spin_t=1711162767&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=7327539680662016",
            method: "POST"
          });
          const v217 = v216.json;
          if (!v217.errors) {
            let vLSNA = "N/A";
            let vLS7 = "";
            const v218 = v217.data.assetOwnerData.advertising_restriction_info.is_restricted;
            const v219 = v217.data.assetOwnerData.advertising_restriction_info.status;
            const v220 = v217.data.assetOwnerData.advertising_restriction_info.restriction_type;
            if (!v218) {
              if (v220 == "PREHARM" && v219 == "APPEAL_ACCEPTED") {
                vLSNA = "Tích Xanh XMDT";
                vLS7 = "success";
              }
              if (v220 == "ALE" && v219 == "APPEAL_ACCEPTED") {
                vLSNA = "Tích Xanh 902";
                vLS7 = "success";
              }
              if (v219 == "NOT_RESTRICTED") {
                vLSNA = "Live Ads - Không Sao Cả";
                vLS7 = "success";
              }
              if (v220 == "ADS_ACTOR_SCRIPTING") {
                vLSNA = "Tích xanh XMDT ẩn tích";
                vLS7 = "success";
              }
              if (v219 == "NOT_RESTRICTED" && v220 == "BUSINESS_INTEGRITY") {
                vLSNA = "Tích xanh 902 ẩn tích";
                vLS7 = "success";
              }
            } else {
              if (v219 == "VANILLA_RESTRICTED" && v220 == "BUSINESS_INTEGRITY") {
                vLSNA = "HCQC 902 XMDT";
                vLS7 = "danger";
              }
              if (v219 == "APPEAL_INCOMPLETE" && v220 == "BUSINESS_INTEGRITY") {
                vLSNA = "XMDT 902 CHƯA XONG";
                vLS7 = "danger";
              }
              if (v219 == "APPEAL_PENDING" && v220 == "BUSINESS_INTEGRITY") {
                vLSNA = "Đang Kháng 902";
                vLS7 = "danger";
              }
              if (v219 == "APPEAL_REJECTED" && v220 == "BUSINESS_INTEGRITY") {
                vLSNA = "HCQC 902 xịt - Xmdt lại 273";
                vLS7 = "danger";
              }
              if (v218 && v220 == "PREHARM") {
                if (v219 == "VANILLA_RESTRICTED") {
                  vLSNA = "Hạn Chế Quảng Cáo";
                  vLS7 = "danger";
                }
                if (v219 == "APPEAL_PENDING") {
                  vLSNA = "Đang kháng XMDT";
                  vLS7 = "danger";
                }
                if (v219 == "APPEAL_INCOMPLETE") {
                  vLSNA = "Xmdt Chưa Xong";
                  vLS7 = "danger";
                }
                if (v219 == "APPEAL_REJECTED_NO_RETRY" || v219 == "APPEAL_TIMEOUT" || v219 == "APPEAL_TIMEOUT") {
                  vLSNA = "XMDT Xịt - Xmdt lại 273";
                  vLS7 = "danger";
                }
              }
              if (v218 && v220 == "ALE") {
                if (v219 == "APPEAL_PENDING") {
                  vLSNA = "Đang Kháng 902";
                  vLS7 = "warning";
                }
                if (v219 == "APPEAL_REJECTED_NO_RETRY") {
                  vLSNA = "HCQC Vĩnh Viễn";
                  vLS7 = "danger";
                }
                const v221 = v217.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state;
                const v222 = v217.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_friction;
                const v223 = v217.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_ineligibility_reason;
                if (v219 == "VANILLA_RESTRICTED" && v221 == "FAILED" || v219 == "VANILLA_RESTRICTED" && v221 == "TIMEOUT") {
                  vLSNA = "HCQC 902 xịt - Xmdt lại 273";
                  vLS7 = "danger";
                }
                if (v219 == "VANILLA_RESTRICTED" && v221 == null && v222 == "UFAC") {
                  vLSNA = "HCQC 902 XMDT";
                  vLS7 = "danger";
                }
                if (v219 == "VANILLA_RESTRICTED" && v221 == null && v222 == null && v223 == "ENTITY_APPEAL_LIMIT_REACHED") {
                  vLSNA = "HCQC 902 xịt - Xmdt lại 273";
                  vLS7 = "danger";
                } else {
                  if (v219 == "VANILLA_RESTRICTED" && v221 == null && v222 == null) {
                    vLSNA = "HCQC 902 Chọn Dòng";
                    vLS7 = "danger";
                  }
                  if (v219 == "VANILLA_RESTRICTED" && v221 == "SUCCESS" && v222 == null) {
                    vLSNA = "HCQC 902 Chọn Dòng";
                    vLS7 = "danger";
                  }
                }
              }
              if (v218 && v220 == "ACE" || v220 === "GENERIC") {
                vLSNA = "XMDT Xịt - Xmdt lại 273";
                vLS7 = "danger";
              }
              if (v218 && v220 == "RISK_REVIEW" || v220 === "RISK_REVIEW_EMAIL_VERIFICATION") {
                vLSNA = "XMDT Checkpoint";
                vLS7 = "danger";
              }
              if (v220 == "ADS_ACTOR_SCRIPTING") {
                if (v219 == "APPEAL_REJECTED") {
                  vLSNA = "XMDT Xịt - Xmdt lại 273";
                  vLS7 = "danger";
                } else if (v219 == "APPEAL_PENDING") {
                  vLSNA = "Đang kháng XMDT";
                  vLS7 = "warning";
                } else if (v219 == "APPEAL_ACCEPTED") {
                  vLSNA = "Tích Xanh 902";
                  vLS7 = "success";
                } else if (v219 == "APPEAL_INCOMPLETE") {
                  vLSNA = "Xmdt Chưa Xong";
                  vLS7 = "danger";
                } else {
                  vLSNA = "Hạn Chế Quảng Cáo";
                  vLS7 = "danger";
                }
              }
            }
            const vO22 = {
              status: vLSNA,
              color: vLS7
            };
            p233(vO22);
          } else {
            p234(v217.errors[0].summary);
          }
        } catch (e43) {
          p234(e43);
        }
      });
    }
    getLinkAn() {
      return new Promise(async (p235, p236) => {
        try {
          const v224 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + this.uid + "&__usid=6-Ts626y2arz8fg%3APs626xy1mafk6f%3A0-As626x5t9hdw-RV%3D6%3AF%3D&session_id=3f06e26e24310de8&__user=" + this.uid + "&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574318&__s=bgx31o%3A93y1un%3Aj1i0y0&__hsi=7315329750708113449&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8C221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25595&lsd=XBGCglH3K63SPddlSyNKgf&__aaid=0&__bid=745415083846542&__spin_r=1010574318&__spin_b=trunk&__spin_t=1703232934&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=24196151083363204"
          });
          const v225 = v224.json;
          const v226 = v225.data.assetOwnerData.advertising_restriction_info.additional_parameters.paid_actor_root_appeal_container_id;
          const v227 = v225.data.assetOwnerData.advertising_restriction_info.additional_parameters.decision_id;
          const v228 = v225.data.assetOwnerData.advertising_restriction_info.additional_parameters.friction_decision_id;
          const v229 = v225.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id;
          if (v226) {
            const v230 = await fetch2("https://business.facebook.com/accountquality/ufac/?entity_id=" + this.uid + "&paid_actor_root_appeal_container_id=" + v226 + "&entity_type=3&_callFlowletID=2181&_triggerFlowletID=2181", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "__usid=6-Tsc6xu718a07sn%3APsc6xui6pgn2f%3A0-Asc6xtp1nh4rnc-RV%3D6%3AF%3D&session_id=15e5a69ec0978238&__aaid=0&__bid=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=u&__hs=19832.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1012906458&__s=9ubr7j%3Arv9koe%3Ads4ihh&__hsi=7359564425697670285&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhe5UkBwCwpUnCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo462mcwuEnw8ScwgECu7E422a3Fe6rwiolDwFwBgak48W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e0UFU2RwrU6CiVo884KeCK2q362u1dxW6U98a85Ou0DU7i1Tw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25352&lsd=MPaEvH-IKd3rimyUrjtr5C&__spin_r=1012906458&__spin_b=trunk&__spin_t=1713532122&__jssesw=1",
              method: "POST"
            });
            const v231 = JSON.parse(v230.text.replace("for (;;);", ""));
            const v232 = v231.payload.enrollment_id;
            p235(v232);
          } else if (v227) {
            const v233 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v227 + "&ids_issue_id=" + v229 + "&entity_type=5&entity_id=" + this.uid + "&_flowletID=9999", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__usid=6-Ts2rbmo1223bxs:Ps2rbmm1pafisj:0-As2rbmcwf48js-RV=6:F=&session_id=4d371069f94ed908&__user=" + this.uid + "&__a=1&__req=q&__hs=19649.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009336620&__s=vkojb0:tpoa7e:m367w6&__hsi=7291509895584633584&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25489&lsd=QTfKpPcJRl9RAFTWridNry&__aaid=0&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697686941"
            });
            const v234 = JSON.parse(v233.text.replace("for (;;);", ""));
            const v235 = v234.payload.enrollment_id;
            p235(v235);
          } else if (v228) {
            const v236 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v228 + "&ids_issue_id=" + v229 + "&entity_type=5&entity_id=" + this.uid + "&_flowletID=2169", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__usid=6-Ts32udfp2ieqb%3APs32udrqbzoxh%3A0-As32ud2p8mux0-RV%3D6%3AF%3D&session_id=2478ab408501cdea&__user=" + this.uid + "&__a=1&__req=u&__hs=19655.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=417qpb%3Alchip2%3Ayq4pb1&__hsi=7293818531390316856&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25548&lsd=A-HDfPRVoR7YG2zHwlCDBx&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224463"
            });
            const v237 = JSON.parse(v236.text.replace("for (;;);", ""));
            const v238 = v237.payload.enrollment_id;
            p235(v238);
          } else {
            p236();
          }
        } catch (e44) {
          console.log(e44);
          p236(e44);
        }
      });
    }
    getLinkXmdtAds(p237) {
      return new Promise(async (p238, p239) => {
        try {
          const v239 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "variables={\"paymentAccountID\":\"" + p237 + "\"}&doc_id=5746473718752934&__usid=6-Ts5btmh131oopb:Ps5bu98bb7oey:0-As5btmhrwegfg-RV=6:F=&__user=" + this.uid + "&__a=1&__req=s&__hs=19699.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010282616&__s=flj1ty:75294s:o83s9c&__hsi=7310049091311550655&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwvC6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25610&lsd=HExoeF2styyeq_LWWUo9db&__aaid=" + p237 + "&__spin_r=1010282616&__spin_b=trunk&__spin_t=1702003435&__jssesw=1"
          });
          const v240 = v239.json;
          const v241 = v240.data.billable_account_by_payment_account.id;
          const v242 = await fetch2("https://www.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=370", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsptewb4bad6z%3APsptfos1fajaid%3A0-Asptet91igfuw1-RV%3D6%3AF%3D&session_id=5d3404452e9bd1f&__aaid=0&__user=" + this.uid + "&__a=1&__req=14&__hs=20097.BP%3ADEFAULT.2.0.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1019227852&__s=0iltbe%3Advrmaz%3A103jkm&__hsi=7457852865934213148&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSAxam4Euxa1twKzobo9E6y4824yoyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC11wBz8188O12x67E421uxS1zDwFwBgak1EwRwEwiUmwvDxC48W2a4p8aHwzzXwKwjo9EjxyEtw9O222edwmEiwm8W4U5W0DU-58fU7m1LxW4o-3qazo8U3yDwbm1LwqpbBwwwiUWawCwNwDwr8rwjk1rDw4kwtU5K2G0yVHwwxS&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25406&lsd=ezom4RfqRqejfUWS5IqHv-&__spin_r=1019227852&__spin_b=trunk&__spin_t=1736416683&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useAccountQualityHubIssueQueryWrapperQuery&variables=%7B%22id%22%3A%22" + v241 + "%22%2C%22startTime%22%3Anull%7D&server_timestamps=true&doc_id=8742430529208614",
            method: "POST"
          });
          const v243 = v242.json;
          const v244 = v243.data.node.advertising_restriction_info.additional_parameters.paid_actor_root_appeal_container_id;
          const v245 = v243.data.node.advertising_restriction_info.ids_issue_ent_id;
          const v246 = v243.data.node.advertising_restriction_info.additional_parameters.decision_id;
          const v247 = v243.data.node.advertising_restriction_info.additional_parameters.friction_decision_id;
          if (v244) {
            const v248 = await fetch2("https://business.facebook.com/accountquality/ufac/?entity_id=" + p237 + "&paid_actor_root_appeal_container_id=" + v244 + "&entity_type=2&_callFlowletID=2181&_triggerFlowletID=2181", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "__usid=6-Tsc6xu718a07sn%3APsc6xui6pgn2f%3A0-Asc6xtp1nh4rnc-RV%3D6%3AF%3D&session_id=15e5a69ec0978238&__aaid=0&__bid=" + p237 + "&__user=" + this.uid + "&__a=1&__req=u&__hs=19832.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1012906458&__s=9ubr7j%3Arv9koe%3Ads4ihh&__hsi=7359564425697670285&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhe5UkBwCwpUnCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo462mcwuEnw8ScwgECu7E422a3Fe6rwiolDwFwBgak48W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e0UFU2RwrU6CiVo884KeCK2q362u1dxW6U98a85Ou0DU7i1Tw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25352&lsd=MPaEvH-IKd3rimyUrjtr5C&__spin_r=1012906458&__spin_b=trunk&__spin_t=1713532122&__jssesw=1",
              method: "POST"
            });
            const v249 = JSON.parse(v248.text.replace("for (;;);", ""));
            const v250 = v249.payload.enrollment_id;
            p238(v250);
          } else if (v246) {
            const v251 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v246 + "&ids_issue_id=" + v245 + "&entity_type=2&entity_id=" + p237 + "&_flowletID=9999", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__usid=6-Ts2rbmo1223bxs:Ps2rbmm1pafisj:0-As2rbmcwf48js-RV=6:F=&session_id=4d371069f94ed908&__user=" + this.uid + "&__a=1&__req=q&__hs=19649.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009336620&__s=vkojb0:tpoa7e:m367w6&__hsi=7291509895584633584&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25489&lsd=QTfKpPcJRl9RAFTWridNry&__aaid=0&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697686941"
            });
            const v252 = JSON.parse(v251.text.replace("for (;;);", ""));
            const v253 = v252.payload.enrollment_id;
            p238(v253);
          } else if (v247) {
            const v254 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v247 + "&ids_issue_id=" + v245 + "&entity_type=2&entity_id=" + p237 + "&_flowletID=2169", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__usid=6-Ts32udfp2ieqb%3APs32udrqbzoxh%3A0-As32ud2p8mux0-RV%3D6%3AF%3D&session_id=2478ab408501cdea&__user=" + this.uid + "&__a=1&__req=u&__hs=19655.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=417qpb%3Alchip2%3Ayq4pb1&__hsi=7293818531390316856&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25548&lsd=A-HDfPRVoR7YG2zHwlCDBx&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224463"
            });
            const v255 = JSON.parse(v254.text.replace("for (;;);", ""));
            const v256 = v255.payload.enrollment_id;
            p238(v256);
          } else {
            p239();
          }
        } catch (e45) {
          console.log(e45);
          p239(e45);
        }
      });
    }
    createBm(p240, p241) {
      return new Promise(async (p242, p243) => {
        let v257 = false;
        try {
          if (p240 === "350") {
            const v258 = await fetch2("https://business.facebook.com/api/graphql/", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + this.uid + "&__usid=6-Trf0mkxer7rg4%3APrf0mkv1xg9ie7%3A0-Arf0mkxurlzsp-RV%3D6%3AF%3D&__user=" + this.uid + "&__a=1&__dyn=7xeUmwkHgmwn8K2WnFwn84a2i5U4e1Fx-ewSyo9Euxa0z8S2S7o760Boe8hwem0nCq1ewcG0KEswaq1xwEwlU-0nSUS1vwnEfU7e2l0Fwwwi85W1ywnEfogwh85qfK6E28xe3C16wlo5a2W2K1HwywnEhwxwuUvwbW1fxW4UpwSyES0gq5o2DwiU8UdUco&__csr=&__req=s&__hs=19187.BP%3Abizweb_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1005843971&__s=xpxflz%3A1mkqgj%3Avof03o&__hsi=7120240829090214250&__comet_req=0&fb_dtsg=" + this.dtsg + "&jazoest=25414&lsd=8VpPvx4KH5-Ydq-I0JMQcK&__spin_r=1005843971&__spin_b=trunk&__spin_t=mftool&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBEGeoBMCreation_CreateBusinessMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%226%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22business_name%22%3A%22" + encodeURIComponent(p241) + "%22%7D%7D&server_timestamps=true&doc_id=5232196050177866"
            });
            const v259 = v258.text;
            if (v259.includes("{\"data\":{\"fbe_create_business\":{\"id\":\"")) {
              v257 = true;
            }
          }
          if (p240 === "50") {
            const v260 = await fetch2("https://business.facebook.com/api/graphql/", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "fb_dtsg=" + this.dtsg + "&variables={\"input\":{\"client_mutation_id\":\"4\",\"actor_id\":\"" + this.uid + "\",\"business_name\":\"" + encodeURIComponent(p241) + "\",\"user_first_name\":\"Tool\",\"user_last_name\":\"FB%20" + randomNumberRange(111111, 99999) + "\",\"user_email\":\"toolfb" + randomNumberRange(111111, 99999) + "@gmail.com\",\"creation_source\":\"MBS_BUSINESS_CREATION_PROMINENT_HOME_CARD\"}}&server_timestamps=true&doc_id=7183377418404152"
            });
            const v261 = v260.text;
            if (v261.includes("{\"data\":{\"bizkit_create_business\":{\"id\":\"")) {
              v257 = true;
            }
          }
          if (p240 === "over") {
            const v262 = await fetch2("https://business.facebook.com/business/create_account/?brand_name=" + encodeURIComponent(p241) + "&first_name=" + encodeURIComponent(p241) + "&last_name=FB%20" + randomNumberRange(111111, 99999) + "&email=toolfb" + randomNumberRange(111111, 99999) + "@gmail.com&timezone_id=132&business_category=OTHER", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__user=" + this.uid + "&__a=1&__dyn=7xeUmwkHg7ebwKBWo5O12wAxu13wqovzEdEc8uw9-dwJwCw4sxG4o2vwho1upE4W0OE2WxO0FE662y0umUS1vwnE2Pwk8884y1uwc63S482rwKxe0y83mwkE5G0zE5W0HUvw5rwSyES0gq0Lo6-1FwbO&__csr=&__req=1b&__hs=19300.BP:brands_pkg.2.0.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1006542795&__s=fx337t:hidf4p:qkhu11&__hsi=7162041770829218151&__comet_req=0&fb_dtsg=" + this.dtsg + "&jazoest=25796&lsd=7qUeMnkz4xy0phFCtNnkTI&__aaid=523818549297438&__spin_r=1006542795&__spin_b=trunk&__spin_t=1667542795&__jssesw=1"
            });
            const v263 = v262.text;
            if (v263.includes("\"payload\":\"https:")) {
              v257 = true;
            }
          }
        } catch (e46) {
          console.log(e46);
        }
        if (v257) {
          p242();
        } else {
          p243();
        }
      });
    }
    createPage(p244) {
      return new Promise(async (p245, p246) => {
        try {
          const v264 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=1v&__hs=19694.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010174206&__s=zgpvzb%3A8cqk4o%3A8gvuf9&__hsi=7308188588785296006&__dyn=7AzHK4HzE4e5Q1ryaxG4Vp62-m1xDwAxu13wFwhUngS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwg8a8465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwOzEjUlDw-wUwxwjFovUy2a1ywtUuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWw-zXDzU&__csr=gacagBmDE9hthJN4jQB6NT5Os_6Av7nR4IZft4RSAXAjeGOrRtmKmhHQkDWWVBhdeQhd9pumfJ2J4_gyfGymiKHKj-W8rDK-QicCy6mnh995zfZ1iiEHDWyt4JpaCAG2WehemGG8hECudmcxt5z8gBCByk9zEuDJ4hHhA48yh5WDwCxh6xe6uUGGz4EyEaoKuFUkCy9eaLCwywMUnhp9FQm3GA6VU8oix-q26kwhwVyo5Hy8oQi4obpV8cEgzFGwge3yexpzEtwm8gwNxa1RwCyVoS0PU8U1krwfm0he0A83EwbO0Eyw4sw8-16whqg31yaQ1aw8Si0gF0Yw28j06gwrU0Fa0nu020i030m0cZU0now0ac-08kDyo1j84Nk1koyeo1p80AC0h-04Z80uug0za08ew3pE5u2e2mnEM1yA1Rw2Co1vHw2sogw1hm4S13zEao0H603xC0ty4oiwiFE21w15W08nwn8EUeC5UPDw2zu16w&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25563&lsd=R1sWlP5eu_-q_qVd0jpuf1&__aaid=0&__spin_r=1010174206&__spin_b=trunk&__spin_t=1701570253&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AdditionalProfilePlusCreationMutation&variables=%7B%22input%22%3A%7B%22bio%22%3A%22%22%2C%22categories%22%3A%5B%222705%22%5D%2C%22creation_source%22%3A%22comet%22%2C%22name%22%3A%22" + encodeURIComponent(p244) + "%22%2C%22page_referrer%22%3A%22launch_point%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%223%22%7D%7D&server_timestamps=true&doc_id=5296879960418435"
          });
          const v265 = v264.text;
          if (v265.includes("\"page\":{\"id\":\"")) {
            const v266 = JSON.parse(v264);
            p245(v266.data.additional_profile_plus_create.page.id);
          } else {
            p246("cccc");
          }
        } catch (e47) {
          p246(e47);
        }
      });
    }
    getSiteKey(p247) {
      return new Promise(async (p248, p249) => {
        try {
          const v267 = await fetch2(p247);
          const v268 = v267.text;
          const v269 = new DOMParser();
          const v270 = v269.parseFromString(v268, "text/html");
          p248($(v270).find(".g-recaptcha").attr("data-sitekey"));
        } catch {
          p249();
        }
      });
    }
    khang902Api2(p250, p251 = "", p252 = {}) {
      return new Promise(async (p253, p254) => {
        const v271 = this.dtsg;
        const vLS5FnEglTcQSfqnuBkn03g = "5FnEglTcQSfqnuBkn03g";
        const v272 = this.accessToken;
        const vLS902 = "902";
        const v273 = this.uid;
        let vV273 = v273;
        let vLN5 = 5;
        if (p251) {
          vV273 = p251;
          vLN5 = 3;
        }
        try {
          const vA16 = ["policy", "unauthorized_use", "other"];
          const v274 = vA16[Math.floor(Math.random() * vA16.length)];
          const v275 = p252.bm.chooseLine.value === "random" ? v274 : p252.bm.chooseLine.value;
          const v276 = p252.bm.chooseLine.value === "other" ? encodeURIComponent(p252.bm.noiDungKhang.value) : encodeURIComponent("I think there was unauthorized use of my Facebook account.");
          const vVO25 = {
            policy: 1,
            unauthorized_use: 2,
            other: 3
          };
          const v277 = vVO25[v275];
          if (vLS902 !== "902" && vLS902 !== "902_line") {
            return p254("Không thể kháng 902");
          }
          const v278 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryOMix6XnzisxiE316"
            },
            method: "POST",
            body: "------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"fb_dtsg\"\r\n\r\n" + v271 + "\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"lsd\"\r\n\r\n" + vLS5FnEglTcQSfqnuBkn03g + "\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"variables\"\r\n\r\n{\"assetOwnerId\":\"" + vV273 + "\"}\r\n------WebKitFormBoundaryOMix6XnzisxiE316\r\nContent-Disposition:form-data;name=\"doc_id\"\r\n\r\n5816699831746699\r\n------WebKitFormBoundaryOMix6XnzisxiE316--\r\n"
          });
          const v279 = v278.json;
          const v280 = v279.data.assetOwnerData.advertising_restriction_info.ids_issue_ent_id;
          if (p252.bm.chooseLineOnly?.value || this.quality === "902_line") {
            p250("Đang chọn dòng");
            const v281 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=2423", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + v273 + "&__usid=6-Ts62bj38e5dcl%3APs62bqs19mjhs3%3A0-As62bhb1qhfddh-RV%3D6%3AF%3D&session_id=26399276ba0973c5&__user=" + v273 + "&__a=1&__req=w&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574604&__s=pyhonq%3Azkdiwa%3A6yn1u0&__hsi=7315356470129303763&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzweau0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg=" + v271 + "&jazoest=25180&lsd=5FnEglTcQSfqnuBkn03g8c&__aaid=0&__bid=212827131149567&__spin_r=1010574604&__spin_b=trunk&__spin_t=1703239154&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22" + v277 + "%22%2C%22actor_id%22%3A%22100050444678752%22%2C%22entity_id%22%3A%22" + vV273 + "%22%2C%22ids_issue_ent_id%22%3A%22" + v280 + "%22%2C%22appeal_comment%22%3A%22" + encodeURIComponent(v276) + "%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605"
            });
            const v282 = v281.text;
            if (v282.includes("\"success\":true")) {
              return p253();
            } else {
              return p254();
            }
          }
          const v283 = v279.data.assetOwnerData.advertising_restriction_info.additional_parameters.friction_decision_id;
          const v284 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v283 + "&ids_issue_id=" + v280 + "&entity_type=" + vLN5 + "&entity_id=" + vV273 + "&_flowletID=2169", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__usid=6-Ts32udfp2ieqb%3APs32udrqbzoxh%3A0-As32ud2p8mux0-RV%3D6%3AF%3D&session_id=2478ab408501cdea&__user=" + v273 + "&__a=1&__req=u&__hs=19655.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=417qpb%3Alchip2%3Ayq4pb1&__hsi=7293818531390316856&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg=" + v271 + "&jazoest=25548&lsd=A-HDfPRVoR7YG2zHwlCDBx&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224463"
          });
          const v285 = JSON.parse(v284.text.replace("for (;;);", ""));
          const v286 = v285.payload.enrollment_id;
          const vF10 = () => {
            return new Promise(async (p255, p256) => {
              try {
                const v287 = await fetch2("https://www.facebook.com/api/graphql/?_flowletID=2667", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  method: "POST",
                  body: "av=" + v273 + "&__usid=6-Ts32uok1y9xfvn:Ps32uol13ql4xy:0-As32unzppjifr-RV=6:F=&session_id=39a4ef7cb4471bc7&__user=" + v273 + "&__a=1&__req=v&__hs=19655.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=66oim1:rc1h95:79wmnc&__hsi=7293820200761279392&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm15wFx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg=" + v271 + "&jazoest=25374&lsd=gxYcaWGy-YhTSvBKDhInoq&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224851&__jssesw=247&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=UFACAppQuery&variables={\"enrollmentID\":" + v286 + ",\"scale\":1}&server_timestamps=true&doc_id=7089047377805579"
                });
                const v288 = v287.json;
                p255(v288.data.ufac_client.state);
              } catch {
                p256();
              }
            });
          };
          let v289 = await vF10();
          const v290 = v289.__typename === "UFACBotCaptchaState";
          if (v290) {
            p250("Đang giải captcha");
            const v291 = await fetch2("https://www.facebook.com/business-support-home/" + v273);
            const v292 = v291.text;
            const v293 = v289.captcha_persist_data;
            const v294 = v292.match(/(?<=\"consent_param\":\")[^\"]*/g)[0];
            const v295 = v292.match(/(?<=\"code\":\")[^\"]*/g)[0];
            const v296 = "https://www.fbsbx.com/captcha/recaptcha/iframe/?referer=https%253A%252F%252Fwww.facebook.com&locale=" + v295 + "&__cci=" + encodeURIComponent(v294);
            const v297 = await fb.getSiteKey(v296);
            let v298 = false;
            for (let vLN018 = 0; vLN018 < 3; vLN018++) {
              if (vLN018 > 0) {
                p250("Đang thử giải lại captcha");
              }
              try {
                const v299 = await resolveCaptcha(p252, v297, v296);
                const v300 = await fetch2("https://www.facebook.com/api/graphql/", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  method: "POST",
                  body: "av=" + v273 + "&__user=" + v273 + "&__a=1&__req=6&__hs=19608.HYP:comet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1008510432&__s=wixma6:3lwxjd:w1cvvj&__hsi=7276285233254120568&__dyn=7xeXxa2C2O5U5O8G6EjBWo2nDwAxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew65xO2OU7m0yE465o-cw5Mx62G3i0Bo7O2l0Fwqo31w9O7Udo5qfK0zEkxe2Gew9O22362W5olw8Xxm16wa-7U1boarCwLyESE6S0B40z8c86-1Fwmk1xwmo6O1Fw9O2y&__csr=gQNdJ-OCcBGBG8WB-F4GHHCjFZqAS8LKaAyqhVHBGAACJde48jiKqqqGy4bK8zmbxi5onGfgiw9Si1uBwJwFw9N2oaEW3m1pwKwr835wywaG0vK0u-ewCwbS01aPw0d9O05uo4Wcwp8cJAx6U21w1420kKdxCQ063U12U0QK0midgsw1mR00H9w5VxS9DAw0gCvw0Opw&__comet_req=15&fb_dtsg=" + v271 + "&jazoest=25277&lsd=" + vLS5FnEglTcQSfqnuBkn03g + "&__spin_r=1008510432&__spin_b=trunk&__spin_t=1694142174&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"2\",\"actor_id\":\"" + v273 + "\",\"action\":\"SUBMIT_BOT_CAPTCHA_RESPONSE\",\"bot_captcha_persist_data\":\"" + v293 + "\",\"bot_captcha_response\":\"" + v299 + "\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6495927930504828"
                });
                if (v300.text.includes("body_text")) {
                  v298 = true;
                  break;
                }
              } catch {}
            }
            if (v298) {
              v289 = await vF10();
              p250("Giải captcha thành công");
            } else {
              return p254("Giải captha thất bại");
            }
          }
          const v301 = v289.__typename === "UFACContactPointChallengeSubmitCodeState";
          if (v301) {
            p250("Đang gỡ số điện thoại cũ");
            const v302 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + v273 + "&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user=" + v273 + "&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"2\",\"actor_id\":\"" + v273 + "\",\"action\":\"UNSET_CONTACT_POINT\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
            });
            if (v302.text.includes("REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP")) {
              v289 = await vF10();
            } else {
              return p254("Không thể gỡ số điện thoại cũ");
            }
          }
          const v303 = v289.__typename === "UFACContactPointChallengeSetContactPointState";
          if (v303) {
            let v304 = false;
            for (let vLN019 = 0; vLN019 < 6; vLN019++) {
              let v305 = false;
              let v306 = false;
              let v307 = false;
              for (let vLN020 = 0; vLN020 < 6; vLN020++) {
                v289 = await vF10();
                const v308 = v289.__typename === "UFACContactPointChallengeSetContactPointState";
                if (v308) {
                  if (vLN020 > 0) {
                    p250("Đang thử lấy số điện thoại khác");
                  } else {
                    p250("Đang lấy số điện thoại");
                  }
                  try {
                    v305 = await getPhone(p252.general.phoneService.value, p252.general.phoneServiceKey.value);
                    p250("Đang thêm số điện thoại");
                    const v309 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=5799", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      method: "POST",
                      body: "av=" + v273 + "&__usid=6-Ts32vzy5lbbnm:Ps32w00w7ep8k:0-As32vzy8nfhuf-RV=6:F=&session_id=392d588c9fe08fb9&__user=" + v273 + "&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=v3r9g5:6bpvyp:rynm6b&__hsi=7293827532840545377&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25259&lsd=_m2P87owOD8j6w2xxN6rHw&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698226559&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"1\",\"actor_id\":\"" + v273 + "\",\"action\":\"SET_CONTACT_POINT\",\"contactpoint\":\"" + v305.number + "\",\"country_code\":\"VN\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
                    });
                    const v310 = v309.json;
                    if (!v310.errors) {
                      v306 = true;
                      break;
                    } else {
                      p250(v310.errors[0].summary);
                    }
                  } catch (e48) {
                    console.log(e48);
                  }
                } else {
                  return p254();
                }
              }
              if (v306 && v305) {
                v289 = await vF10();
                const v311 = v289.__typename === "UFACContactPointChallengeSubmitCodeState";
                if (v311) {
                  p250("Đang chờ mã kích hoạt");
                  try {
                    const v312 = await getPhoneCode(p252.general.phoneService.value, p252.general.phoneServiceKey.value, v305.id);
                    p250("Đang nhập mã kích hoạt");
                    const v313 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=6114", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      method: "POST",
                      body: "av=" + v273 + "&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user=" + v273 + "&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=bi5lni:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"1\",\"actor_id\":\"" + v273 + "\",\"action\":\"SUBMIT_CODE\",\"code\":\"" + v312 + "\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
                    });
                    const v314 = v313.text;
                    if (v314.includes("\"ufac_client\":{\"id\"")) {
                      p250("Thêm số điện thoại thành công");
                      v307 = true;
                    }
                    if (v314.includes("UFACOutroState")) {
                      v289.__typename = "UFACAwaitingReviewState";
                    }
                  } catch (e49) {
                    console.log(e49);
                  }
                  if (v307) {
                    v304 = true;
                    break;
                  } else {
                    p250("Đang gỡ số điện thoại cũ");
                    const v315 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=6844", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      method: "POST",
                      body: "av=" + v273 + "&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user=" + v273 + "&__a=1&__req=2e&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=hveynz:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"2\",\"actor_id\":\"" + v273 + "\",\"action\":\"UNSET_CONTACT_POINT\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
                    });
                    if (v315.text.includes("REVERIFY_PHONE_NUMBER_WITH_NEW_ADDED_PHONE_AND_WHATSAPP")) {
                      v289 = await vF10();
                    } else {
                      return p254("Không thể gỡ số điện thoại cũ");
                    }
                  }
                }
              }
            }
            if (v304) {
              try {
                v289 = await vF10();
              } catch {}
            } else {
              return p254();
            }
          }
          const v316 = v289.__typename === "UFACImageUploadChallengeState";
          if (v316) {
            p250("Đang tạo ảnh");
            const v317 = p252.bm.phoiId.value;
            const v318 = await getLocalStorage("userInfo_" + this.uid);
            const v319 = await getLocalStorage(v317);
            const vO27 = {
              firstName: v318.first_name,
              lastName: v318.last_name,
              fullName: v318.name,
              birthday: v318.birthday,
              gender: v318.gender
            };
            const vVO27 = vO27;
            const vO28 = {
              data: vVO27,
              template: v319
            };
            const v320 = await fetch2("https://app.toolfb.vn/phoi", {
              headers: {
                "content-type": "application/json"
              },
              method: "POST",
              body: JSON.stringify(vO28)
            });
            const v321 = await v320.blob();
            p250("Đang upload ảnh");
            let v322 = new XMLHttpRequest();
            v322.withCredentials = true;
            v322.open("POST", "https://rupload.facebook.com/checkpoint_1501092823525282_media_upload/a06d268a-bad7-49d7-b553-24d6f07c64ba?__usid=6-Tsc6xzrdp0tcu%3APsc78vt5c5znb%3A0-Asc78484bm17t-RV%3D6%3AF%3D&session_id=1f53971e4d475672&__aaid=0&__bid=" + p251 + "&__user=" + fb.uid + "&__a=1&__req=15&__hs=19832.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1012908546&__s=j9683f%3Abgcl6p%3Avjr471&__hsi=7359625851859447619&__dyn=7xeXxa4EaolJ28S2q3m8G2abBAjxu59o9EeEb8nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2SaAxq4U5i48swj8qyoyazoO4o2oCyE9UixWq3i2q5E884a2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOXwAxm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuyUd88EeAUpK19xmu2C2l0FggzE8U98doJ1Kfxa2y5E6a6TxC48G2q4p8y26U8U-UbE4S4oSq4VEhG7o4O1fwwxefzobElxm4E5yeDyUnwUzpErw-z8c8-5aDwQwKG13y85i4oKqbDyoOFEa9EHyU8U3xhU24wMwrU6CiVo88ak22eCK2q362u1dxW6U98a85Ou3u1Dxeu1owtU&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25676&lsd=6qUyi5kQucC-XaTIr34bGR&__spin_r=1012908546&__spin_b=trunk&__spin_t=1713546424&__jssesw=1&_callFlowletID=3740&_triggerFlowletID=2359");
            v322.setRequestHeader("accept", "*/*");
            v322.setRequestHeader("accept-language", "vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5");
            v322.setRequestHeader("offset", "0");
            v322.setRequestHeader("priority", "u=1, i");
            v322.setRequestHeader("x-entity-length", v320.headers.get("content-length"));
            v322.setRequestHeader("x-entity-name", "phoi.png");
            v322.setRequestHeader("x-entity-type", "image/png");
            v322.setRequestHeader("content-type", "application/x-www-form-urlencoded");
            v322.onload = async function () {
              const v323 = JSON.parse(v322.response);
              if (v323.h) {
                p250("Upload ảnh thành công");
                const v324 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  method: "POST",
                  body: "av=" + v273 + "&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user=" + v273 + "&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"1\",\"actor_id\":\"" + v273 + "\",\"action\":\"UPLOAD_IMAGE\",\"image_upload_handle\":\"" + v323.h + "\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
                });
                if (v324.text.includes("UFACAwaitingReviewState")) {
                  p250("Upload ảnh thành công");
                  v289 = await vF10();
                } else {
                  return p254("Không thể upload ảnh");
                }
              } else {
                return p254("Không thể upload ảnh");
              }
            };
            v322.send(v321);
            v289 = await getState();
          }
          const v325 = v289.__typename === "UFACAwaitingReviewState";
          if (v325) {
            p250("Đang chọn dòng");
            const v326 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=2423", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + v273 + "&__usid=6-Ts62bj38e5dcl%3APs62bqs19mjhs3%3A0-As62bhb1qhfddh-RV%3D6%3AF%3D&session_id=26399276ba0973c5&__user=" + v273 + "&__a=1&__req=w&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574604&__s=pyhonq%3Azkdiwa%3A6yn1u0&__hsi=7315356470129303763&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzweau0Jo6-4e1mAKm221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg=" + v271 + "&jazoest=25180&lsd=5FnEglTcQSfqnuBkn03g8c&__aaid=0&__bid=212827131149567&__spin_r=1010574604&__spin_b=trunk&__spin_t=1703239154&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useALEBanhammerAppealMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%22" + v277 + "%22%2C%22actor_id%22%3A%22100050444678752%22%2C%22entity_id%22%3A%22" + vV273 + "%22%2C%22ids_issue_ent_id%22%3A%22" + v280 + "%22%2C%22appeal_comment%22%3A%22" + encodeURIComponent(v276) + "%22%2C%22callsite%22%3A%22ACCOUNT_QUALITY%22%7D%7D&server_timestamps=true&doc_id=6816769481667605"
            });
            if (v326.text.includes("\"success\":true")) {
              p253();
            } else {
              p254();
            }
          }
        } catch (e50) {
          p254();
        }
      });
    }
    shareDoiTacBm(p257, p258, p259) {
      return new Promise(async (p260, p261) => {
        console.log(p257, p258, p259);
        try {
          const v327 = await fetch2("https://graph.facebook.com/v17.0/act_" + p258 + "/agencies?access_token=" + this.accessToken + "&_callFlowletID=21473&_triggerFlowletID=21459", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=adaccount%2Fagencies&_reqSrc=BrandAgencyActions.brands&accountId=" + p258 + "&acting_brand_id=" + p257 + "&business=" + p259 + "&locale=vi_VN&method=post&permitted_tasks=%5B%22ADVERTISE%22%2C%22ANALYZE%22%2C%22DRAFT%22%2C%22MANAGE%22%5D&pretty=0&suppress_http_code=1&xref=f7186d9b4189f5231",
            method: "POST"
          });
          const v328 = v327.json;
          if (v328.success) {
            p260();
          } else {
            p261();
          }
        } catch (e51) {
          console.log(e51);
          p261(e51);
        }
      });
    }
    getGroup() {
      return new Promise(async (p262, p263) => {
        try {
          let vA17 = [];
          const v329 = await fetch2("https://graph.facebook.com/v22.0/'+this.uid+'/groups?debug=all&fields=administrator%2Cname%2Cid%2Cmember_count%2Cprivacy%2Cpicture&limit=10&access_token=" + this.accessToken);
          const v330 = v329.json;
          v330.data.forEach(p264 => {
            vA17.push(p264);
          });
          if (v330.paging.next) {
            let v331 = v330.paging.next;
            for (let vLN021 = 0; vLN021 < 9999; vLN021++) {
              await delayTime(1000);
              const v332 = await fetch2(v331);
              const v333 = v332.json;
              v333.data.forEach(p265 => {
                vA17.push(p265);
              });
              if (v333.paging.next) {
                v331 = v333.paging.next;
              } else {
                break;
              }
            }
          }
          p262(vA17.map(p266 => {
            const vO31 = {
              groupId: p266.id,
              name: p266.name,
              avatar: p266.picture.data.url,
              role: p266.administrator ? "ADMIN" : "MEMBER",
              members: p266.member_count,
              status: p266.privacy
            };
            return vO31;
          }));
        } catch (e52) {
          p263(e52);
        }
      });
    }
    searchGroup(p267, p268, p269) {
      return new Promise(async (p270, p271) => {
        try {
          let vLN022 = 0;
          const vA18 = [];
          const v334 = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              accept: "*/*",
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__aaid=0&__user=" + this.uid + "&__a=1&__req=6f&__hs=20135.HYP%3Acomet_pkg.2.1...1&dpr=1&__ccg=EXCELLENT&__rev=1020156942&__s=9lelic%3A16clb1%3Alb0vmg&__hsi=7472025301829894075&__dyn=7xeXzWK1ixt0mUyEqxemh0noeEb8nwgUao4ubyQdwSwAyUco5S3O2Saw8i2S1DwUx60GE5O0BU2_CxS320qa2OU7m221Fwgo9oO0-E4a3a4oaEnxO0Bo7O2l2Utwqo31wiE567Udo5qfK0zEkxe2GewyDwkUe9obrwh8lwUwgojUlDw-wUwxwjFovUuz86a1TxW2-awLyESE2KwwwOg2cwMwhEkxebwHwKG4UrwFg2fwxyo566k1FwgUjwOwWzUfHDzUiBG2OUqwjVqwLwHwa211xq19wVw&__csr=gekYh3kcsaMN2Df3kYYr5mwH2IlkBbs8ivcBlOLsBqnRcgZtZb8B9iTiHncIkWlEDHsQGkDsGbOjq9ipeJfV5ldOqQBbnibIzFbmHnjhaABlQDAQmhcO8h5j8RQDBBhmQXBAipaQFFa-lrpaGjWBHmjFtyuqVayy4F4FF3uYEW8G9GdGnjVZ7BQKdyHh9miW4nVQm8KjijCCWgLmil4zWAjADVoWibGijz5i-F5UGVJ2UyhDKiAuhFGmiAFVGBUmykqUCiFKmucCBAFBK8GJ95GvxiazpQiqhurh9Vt2u9xm8FoBK5V8yjSqicF1fzppufy-q68sgGmmdCAyEZe8J2FoO32i2eahQaxB2lyopHwFyo9EmBRGhbzeqbBVoKmeh8Gm6UKaw_AUsxa9-bwyye1hUtwnEpwQwzzUy1nwBla4qo4x0HwjUf4by610GQiaoOq0SE9Hzy1ecgTwgo5a0xA9g3mDQG-1jx14xOawooPxyqETxCHggijUK4y0hAVoGJapwfR0ooK4E8E98DhWzVU8U3DU9EnU2IEK9HogwlooKbK0CUy1AwqE4yha263mmblyUgxmGm2itpIU5WEggKFaosK444XxO4XiTc0gi10w0wGy80mhyo18E4y9w1I-1cw2qU0Vu01UOw3580VG2-03Kp0UwbW15wfFa4A5sPG0Ko3fyk0DsZwedxCu0nWpk09kg4t6Dg11o5i1tg763q0tC0z4u0BmiiUEi12w7rwi8429xy1TwKwlU-0wpZw8y8xO9wey2J6wbJ0ro1Ro0MC0HQ09_g0hLy84i048pE0Fa0kl0p82DwLojK1Gg0glOw7Zw9SEK0_Q0D80pew6FwfJ0cy2J0tU0A-07Ey02WAqt2oTBDgG2q1lw21A588U3hCBi86YMBcpoXQEiglF0&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25564&lsd=OrfNVF3SWNkvM6lhAjXbWo&__spin_r=1020156942&__spin_b=trunk&__spin_t=1739716460&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=SearchCometResultsPaginatedResultsQuery&variables=%7B%22allow_streaming%22%3Afalse%2C%22args%22%3A%7B%22callsite%22%3A%22COMET_GLOBAL_SEARCH%22%2C%22config%22%3A%7B%22exact_match%22%3Afalse%2C%22high_confidence_config%22%3Anull%2C%22intercept_config%22%3Anull%2C%22sts_disambiguation%22%3Anull%2C%22watch_config%22%3Anull%7D%2C%22context%22%3A%7B%22bsid%22%3A%22b02d2974-5915-4d36-a5ff-cb21cac9e6fa%22%2C%22tsid%22%3A%220.0406180842980719%22%7D%2C%22experience%22%3A%7B%22client_defined_experiences%22%3A%5B%22ADS_PARALLEL_FETCH%22%5D%2C%22encoded_server_defined_params%22%3Anull%2C%22fbid%22%3Anull%2C%22type%22%3A%22GROUPS_TAB%22%7D%2C%22filters%22%3A%5B%5D%2C%22text%22%3A%22" + encodeURIComponent(p267) + "%22%7D%2C%22feedLocation%22%3A%22SEARCH%22%2C%22feedbackSource%22%3A23%2C%22fetch_filters%22%3Atrue%2C%22focusCommentID%22%3Anull%2C%22locale%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22search_results_page%22%2C%22scale%22%3A1%2C%22stream_initial_count%22%3A0%2C%22useDefaultActor%22%3Afalse%2C%22__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider%22%3Afalse%2C%22__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider%22%3Afalse%2C%22__relay_internal__pv__IsWorkUserrelayprovider%22%3Afalse%2C%22__relay_internal__pv__CometFeedStoryDynamicResolutionPhotoAttachmentRenderer_experimentWidthrelayprovider%22%3A600%2C%22__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider%22%3Afalse%2C%22__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider%22%3Afalse%2C%22__relay_internal__pv__IsMergQAPollsrelayprovider%22%3Afalse%2C%22__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider%22%3Afalse%2C%22__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider%22%3Afalse%2C%22__relay_internal__pv__CometUFIShareActionMigrationrelayprovider%22%3Atrue%2C%22__relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider%22%3Atrue%2C%22__relay_internal__pv__EventCometCardImage_prefetchEventImagerelayprovider%22%3Afalse%7D&server_timestamps=true&doc_id=8537102933057513",
            method: "POST"
          });
          const v335 = v334.json;
          v335.data.serpResponse.results.edges.forEach(p272 => {
            try {
              if (p272.rendering_strategy.view_model.ctas.primary[0].profile.viewer_join_state === "CAN_JOIN" && vLN022 < p268 && !this.groupMap.includes(p272.rendering_strategy.view_model.profile.id)) {
                this.groupMap.push(p272.rendering_strategy.view_model.profile.id);
                vA18.push({
                  name: p272.rendering_strategy.view_model.profile_name_with_possible_nickname,
                  question: p272.rendering_strategy.view_model.ctas.primary[0].profile.has_membership_questions ? "Có" : "Không",
                  groupId: p272.rendering_strategy.view_model.profile.id,
                  avatar: p272.rendering_strategy.view_model.profile.profile_picture.uri,
                  status: p272.rendering_strategy.view_model.primary_snippet_text_with_entities.text.split(" · ")[0],
                  members: p272.rendering_strategy.view_model.primary_snippet_text_with_entities.text.split(" · ")[1],
                  posts: p272.rendering_strategy.view_model.primary_snippet_text_with_entities.text.split(" · ")[2],
                  source: p267
                });
                vLN022++;
              }
            } catch (e53) {}
          });
          p269(vA18);
          if (v335.data.serpResponse.results.page_info.has_next_page && vLN022 < p268) {
            let v336 = v335.data.serpResponse.results.page_info.end_cursor;
            for (let vLN023 = 0; vLN023 < 9999; vLN023++) {
              await delayTime(1000);
              const v337 = await fetch2("https://www.facebook.com/api/graphql/", {
                headers: {
                  accept: "*/*",
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + this.uid + "&__aaid=0&__user=" + this.uid + "&__a=1&__req=6f&__hs=20135.HYP%3Acomet_pkg.2.1...1&dpr=1&__ccg=EXCELLENT&__rev=1020156942&__s=9lelic%3A16clb1%3Alb0vmg&__hsi=7472025301829894075&__dyn=7xeXzWK1ixt0mUyEqxemh0noeEb8nwgUao4ubyQdwSwAyUco5S3O2Saw8i2S1DwUx60GE5O0BU2_CxS320qa2OU7m221Fwgo9oO0-E4a3a4oaEnxO0Bo7O2l2Utwqo31wiE567Udo5qfK0zEkxe2GewyDwkUe9obrwh8lwUwgojUlDw-wUwxwjFovUuz86a1TxW2-awLyESE2KwwwOg2cwMwhEkxebwHwKG4UrwFg2fwxyo566k1FwgUjwOwWzUfHDzUiBG2OUqwjVqwLwHwa211xq19wVw&__csr=gekYh3kcsaMN2Df3kYYr5mwH2IlkBbs8ivcBlOLsBqnRcgZtZb8B9iTiHncIkWlEDHsQGkDsGbOjq9ipeJfV5ldOqQBbnibIzFbmHnjhaABlQDAQmhcO8h5j8RQDBBhmQXBAipaQFFa-lrpaGjWBHmjFtyuqVayy4F4FF3uYEW8G9GdGnjVZ7BQKdyHh9miW4nVQm8KjijCCWgLmil4zWAjADVoWibGijz5i-F5UGVJ2UyhDKiAuhFGmiAFVGBUmykqUCiFKmucCBAFBK8GJ95GvxiazpQiqhurh9Vt2u9xm8FoBK5V8yjSqicF1fzppufy-q68sgGmmdCAyEZe8J2FoO32i2eahQaxB2lyopHwFyo9EmBRGhbzeqbBVoKmeh8Gm6UKaw_AUsxa9-bwyye1hUtwnEpwQwzzUy1nwBla4qo4x0HwjUf4by610GQiaoOq0SE9Hzy1ecgTwgo5a0xA9g3mDQG-1jx14xOawooPxyqETxCHggijUK4y0hAVoGJapwfR0ooK4E8E98DhWzVU8U3DU9EnU2IEK9HogwlooKbK0CUy1AwqE4yha263mmblyUgxmGm2itpIU5WEggKFaosK444XxO4XiTc0gi10w0wGy80mhyo18E4y9w1I-1cw2qU0Vu01UOw3580VG2-03Kp0UwbW15wfFa4A5sPG0Ko3fyk0DsZwedxCu0nWpk09kg4t6Dg11o5i1tg763q0tC0z4u0BmiiUEi12w7rwi8429xy1TwKwlU-0wpZw8y8xO9wey2J6wbJ0ro1Ro0MC0HQ09_g0hLy84i048pE0Fa0kl0p82DwLojK1Gg0glOw7Zw9SEK0_Q0D80pew6FwfJ0cy2J0tU0A-07Ey02WAqt2oTBDgG2q1lw21A588U3hCBi86YMBcpoXQEiglF0&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25564&lsd=OrfNVF3SWNkvM6lhAjXbWo&__spin_r=1020156942&__spin_b=trunk&__spin_t=1739716460&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=SearchCometResultsPaginatedResultsQuery&variables=%7B%22allow_streaming%22%3Afalse%2C%22args%22%3A%7B%22callsite%22%3A%22COMET_GLOBAL_SEARCH%22%2C%22config%22%3A%7B%22exact_match%22%3Afalse%2C%22high_confidence_config%22%3Anull%2C%22intercept_config%22%3Anull%2C%22sts_disambiguation%22%3Anull%2C%22watch_config%22%3Anull%7D%2C%22context%22%3A%7B%22bsid%22%3A%22b02d2974-5915-4d36-a5ff-cb21cac9e6fa%22%2C%22tsid%22%3A%220.0406180842980719%22%7D%2C%22experience%22%3A%7B%22client_defined_experiences%22%3A%5B%22ADS_PARALLEL_FETCH%22%5D%2C%22encoded_server_defined_params%22%3Anull%2C%22fbid%22%3Anull%2C%22type%22%3A%22GROUPS_TAB%22%7D%2C%22filters%22%3A%5B%5D%2C%22text%22%3A%22" + encodeURIComponent(p267) + "s%22%7D%2C%22feedLocation%22%3A%22SEARCH%22%2C%22feedbackSource%22%3A23%2C%22fetch_filters%22%3Atrue%2C%22focusCommentID%22%3Anull%2C%22locale%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22search_results_page%22%2C%22scale%22%3A1%2C%22stream_initial_count%22%3A0%2C%22useDefaultActor%22%3Afalse%2C%22__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider%22%3Afalse%2C%22__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider%22%3Afalse%2C%22__relay_internal__pv__IsWorkUserrelayprovider%22%3Afalse%2C%22__relay_internal__pv__CometFeedStoryDynamicResolutionPhotoAttachmentRenderer_experimentWidthrelayprovider%22%3A600%2C%22__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider%22%3Afalse%2C%22__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider%22%3Afalse%2C%22__relay_internal__pv__IsMergQAPollsrelayprovider%22%3Afalse%2C%22__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider%22%3Afalse%2C%22__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider%22%3Afalse%2C%22__relay_internal__pv__CometUFIShareActionMigrationrelayprovider%22%3Atrue%2C%22__relay_internal__pv__StoriesArmadilloReplyEnabledrelayprovider%22%3Atrue%2C%22__relay_internal__pv__EventCometCardImage_prefetchEventImagerelayprovider%22%3Afalse%2C%22cursor%22%3A%22" + v336 + "%22%7D&server_timestamps=true&doc_id=8537102933057513",
                method: "POST"
              });
              const v338 = v337.json;
              const vA19 = [];
              v338.data.serpResponse.results.edges.forEach(p273 => {
                try {
                  if (p273.rendering_strategy.view_model.ctas.primary[0].profile.viewer_join_state === "CAN_JOIN" && vLN022 < p268 && !this.groupMap.includes(p273.rendering_strategy.view_model.profile.id)) {
                    this.groupMap.push(p273.rendering_strategy.view_model.profile.id);
                    vA19.push({
                      name: p273.rendering_strategy.view_model.profile_name_with_possible_nickname,
                      question: p273.rendering_strategy.view_model.ctas.primary[0].profile.has_membership_questions ? "Có" : "Không",
                      groupId: p273.rendering_strategy.view_model.profile.id,
                      avatar: p273.rendering_strategy.view_model.profile.profile_picture.uri,
                      status: p273.rendering_strategy.view_model.primary_snippet_text_with_entities.text.split(" · ")[0],
                      members: p273.rendering_strategy.view_model.primary_snippet_text_with_entities.text.split(" · ")[1],
                      posts: p273.rendering_strategy.view_model.primary_snippet_text_with_entities.text.split(" · ")[2],
                      source: p267
                    });
                    vLN022++;
                  }
                } catch (e54) {}
              });
              p269(vA19);
              if (vLN022 === p268) {
                break;
              }
              if (v338.data.serpResponse.results.page_info.has_next_page) {
                v336 = v338.data.serpResponse.results.page_info.end_cursor;
              } else {
                break;
              }
            }
          }
          p270(true);
        } catch (e55) {
          p271(e55);
        }
      });
    }
    searchByUid(p274, p275, p276) {
      return new Promise(async (p277, p278) => {
        try {
          const v339 = await fetch2("https://graph.facebook.com/graphql", {
            method: "POST",
            headers: {
              accept: "application/json, text/plain, */*",
              "content-type": "multipart/form-data; boundary=----WebKitFormBoundarydMoMY9fpXzuyAiLb"
            },
            body: "------WebKitFormBoundarydMoMY9fpXzuyAiLb\nContent-Disposition: form-data; name=\"q\"\n\nnodes(" + p274 + "){groups{nodes{id,name,viewer_post_status,visibility,group_member_profiles{count}}}}\n------WebKitFormBoundarydMoMY9fpXzuyAiLb\nContent-Disposition: form-data; name=\"access_token\"\n\n" + this.accessToken + "\n------WebKitFormBoundarydMoMY9fpXzuyAiLb--\n"
          });
          const v340 = v339.json;
          p276(v340[p274].groups.nodes.map(p279 => {
            return {
              name: p279.name,
              question: p279.viewer_post_status === "CAN_POST_AFTER_APPROVAL" ? "Có" : "Không",
              groupId: p279.id,
              avatar: "",
              status: p279.visibility === "OPEN" ? "Công khai" : "Riêng tư",
              members: p279.group_member_profiles.count,
              posts: "",
              source: p274
            };
          }).slice(0, p275));
          p277(true);
        } catch (e56) {
          p278(e56);
        }
      });
    }
    getLinkkhangBm(p280, p281) {
      return new Promise(async (p282, p283) => {
        let v341 = false;
        let v342 = false;
        try {
          p281("Đang lấy link kháng BM");
          const v343 = await fetch2("https://www.facebook.com/business-support-home/" + p280);
          const v344 = v343.text;
          if (v344.includes("idesEnforcementInstanceID")) {
            const v345 = v344.match(/(?<=\"idesEnforcementInstanceID\":\")[^\"]*/g)[0];
            const v346 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1661", {
              method: "POST",
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&session_id=17e613b789f86fcc&__aaid=0&__bid=" + p280 + "&__user=" + this.uid + "&__a=1&__req=j&__hs=20151.BP:DEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1020564878&__s=dr1ti4:103eex:hjfkpz&__hsi=7477848285631838275&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSxum4Euxa0z8S2S2q1Ex20zEyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC1Dw4WwgEhxW10wnEtwoVUao9k2B0q85W1bxq1-orx2ewyx6i2GU8U-UbE4S2q4UoG7o2swh8S1qxa1ozEjwnE2Lxi3-1RwrUux616yES2e0UFU2RwrU6CiU9E4KeyE9Eco9U6O6U4R0mVU1587u1rwc6227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25737&lsd=" + this.lsd + "&__spin_r=1020564878&__spin_b=trunk&__spin_t=1741072229&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBSHGAMEOpenXFACAppealActionMutation&variables={\"input\":{\"client_mutation_id\":\"2\",\"actor_id\":\"" + this.uid + "\",\"enforcement_instance\":\"" + v345 + "\"}}&server_timestamps=true&doc_id=8036119906495815"
            });
            const v347 = await v346.json;
            const v348 = v347.data.xfb_XFACGraphQLAppealManagerFetchOrCreateAppeal.xfac_appeal_id;
            const v349 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1420", {
              method: "POST",
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&session_id=1b39647eb945a644&__aaid=0&__bid=" + p280 + "&__user=" + this.uid + "&__a=1&__req=i&__hs=20151.BP:DEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1020564878&__s=g139k8:103eex:hwphka&__hsi=7477845871681707178&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSxum4Euxa0z8S2S2q1Ex20zEyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC1Dw4WwgEhxW10wnEtwoVUao9k2B0q85W1bxq1-orx2ewyx6i2GU8U-UbE4S2q4UoG7o2swh8S1qxa1ozEjwnE2Lxi3-1RwrUux616yES2e0UFU2RwrU6CiU9E4KeyE9Eco9U6O6U4R0mVU1587u1rwc6227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25762&lsd=" + this.lsd + "&__spin_r=1020564878&__spin_b=trunk&__spin_t=1741071667&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacActorAppealTriggerRootQuery&variables={\"input\":{\"trigger_event_type\":\"XFAC_ACTOR_APPEAL_ENTRY\",\"ufac_design_system\":\"GEODESIC\",\"xfac_id\":\"" + v348 + "\",\"nt_context\":null,\"trigger_session_id\":\"d289e01d-ffc9-43ef-905b-0ee4a5807fd5\"},\"scale\":1}&server_timestamps=true&doc_id=29439169672340596"
            });
            const v350 = v349.json.data.ixt_xfac_actor_appeal_trigger.screen.view_model.enrollment_id;
            if (v350) {
              p281(p280 + "|https://www.facebook.com/checkpoint/1501092823525282/" + v350);
              v341 = true;
              v342 = v350;
            }
          } else {
            const v351 = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + this.uid + "&__usid=6-Ts626y2arz8fg%3APs626xy1mafk6f%3A0-As626x5t9hdw-RV%3D6%3AF%3D&session_id=3f06e26e24310de8&__user=" + this.uid + "&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574318&__s=bgx31o%3A93y1un%3Aj1i0y0&__hsi=7315329750708113449&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8C221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25595&lsd=XBGCglH3K63SPddlSyNKgf&__aaid=0&__bid=745415083846542&__spin_r=1010574318&__spin_b=trunk&__spin_t=1703232934&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + p280 + "%22%7D&server_timestamps=true&doc_id=24196151083363204"
            });
            const v352 = await v351.json;
            const v353 = v352.data.assetOwnerData.advertising_restriction_info.additional_parameters.paid_actor_root_appeal_container_id;
            const v354 = v352.data.assetOwnerData.advertising_restriction_info.restriction_type;
            const v355 = await fetch2("https://business.facebook.com/accountquality/ufac/?entity_id=" + p280 + "&paid_actor_root_appeal_container_id=" + v353 + "&entity_type=3&_callFlowletID=2181&_triggerFlowletID=2181", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "__usid=6-Tsc6xu718a07sn%3APsc6xui6pgn2f%3A0-Asc6xtp1nh4rnc-RV%3D6%3AF%3D&session_id=15e5a69ec0978238&__aaid=0&__bid=" + p280 + "&__user=" + this.uid + "&__a=1&__req=u&__hs=19832.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1012906458&__s=9ubr7j%3Arv9koe%3Ads4ihh&__hsi=7359564425697670285&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhe5UkBwCwpUnCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo462mcwuEnw8ScwgECu7E422a3Fe6rwiolDwFwBgak48W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e0UFU2RwrU6CiVo884KeCK2q362u1dxW6U98a85Ou0DU7i1Tw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25352&lsd=MPaEvH-IKd3rimyUrjtr5C&__spin_r=1012906458&__spin_b=trunk&__spin_t=1713532122&__jssesw=1",
              method: "POST"
            });
            const v356 = JSON.parse(v355.text.replace("for (;;);", ""));
            const v357 = v356.payload.enrollment_id;
            if (v357) {
              p281(p280 + "|https://www.facebook.com/checkpoint/1501092823525282/" + v357 + "|Dạng Die : " + v354);
              v341 = true;
              v342 = v357;
            }
          }
        } catch (e57) {
          console.log(e57);
        }
        if (!v341) {
          p281("Lấy link kháng BM thất bại");
        }
        p282(v342);
      });
    }
    async init() {
      return new Promise(async (p284, p285) => {
        for (let vLN024 = 0; vLN024 < 3; vLN024++) {
          try {
            this.accessToken = await getLocalStorage("accessToken");
            this.accessToken2 = await getLocalStorage("accessToken2");
            this.dtsg = await getLocalStorage("dtsg");
            this.dtsg2 = await getLocalStorage("dtsg2");
            try {
              this.userInfo = await this.getUserInfo();
            } catch (e58) {
              this.accessToken = false;
              await removeLocalStorage("accessToken");
              await removeLocalStorage("accessToken2");
            }
            if (!this.accessToken || !this.dtsg) {
              const v358 = await this.getAccessToken();
              this.accessToken = v358.accessToken;
              this.accessToken2 = "";
              try {
                this.accessToken2 = await this.getAccessToken2();
              } catch {}
              this.userInfo = await this.getUserInfo();
              this.dtsg = v358.dtsg;
              this.dtsg2 = v358.dtsg2;
              await setLocalStorage("accessToken", this.accessToken);
              await setLocalStorage("accessToken2", this.accessToken2);
              await setLocalStorage("dtsg", this.dtsg);
              await setLocalStorage("dtsg2", this.dtsg2);
            }
            this.uid = this.userInfo.id;
            break;
          } catch (e59) {}
        }
        if (this.accessToken && this.dtsg && this.userInfo) {
          p284();
        } else {
          p285();
        }
      });
    }
  }
  const fb = new FB();
  function getCurrentUser() {
    return new Promise(async (p286, p287) => {
      try {
        const v359 = await getLocalStorage("uid");
        const v360 = await getLocalStorage("dataClone");
        const v361 = v360.filter(p288 => p288.uid === v359)[0];
        p286(v361);
      } catch (e60) {
        p287(e60);
      }
    });
  }
  async function getBase64ImageFromUrl(p289) {
    const v362 = await fetch(p289);
    const v363 = await v362.blob();
    return new Promise((p290, p291) => {
      const v364 = new FileReader();
      v364.addEventListener("load", function () {
        p290(v364.result);
      }, false);
      v364.onerror = () => {
        return p291(this);
      };
      v364.readAsDataURL(v363);
    });
  }
  let rates = false;
  $(document).ready(async function () {
    const v365 = $("#app").attr("data");
    const v366 = await getLocalStorage("folded");
    if (!v366) {
      $("body").removeClass("folded");
    }
    if (v365 !== "setting") {
      const v367 = await fetch("https://dashboard.toolfb.vn/update/versions.json", {
        cache: "no-cache"
      });
      rates = await (await fetch("../rates.json")).json();
      const v368 = await v367.json();
      const v369 = v368.filter(p292 => p292.type === "ext");
      const v370 = await getVersion();
      const v371 = v369[0].version;
      const v372 = v369[0].note;
      if (v371 === v370) {
        const v373 = v368.filter(p293 => p293.type === "web");
        const v374 = v373[0].version;
        const v375 = v373[0].note;
        const v376 = await getLocalStorage("ver");
        if (v376 !== v374) {
          await setLocalStorage("ver", v374);
          $(".appVersion").html("<span class=\"mb-0 text-decoration-none badge text-bg-light\">v" + v374 + "</span>");
          Swal.fire({
            icon: "success",
            title: "Update thành công v" + v374,
            text: "Có gì mới trong phiên bản này?",
            confirmButtonText: "Tiếp tục",
            input: "textarea",
            inputValue: v375.replaceAll("<br>", "\r\n"),
            allowOutsideClick: false,
            inputAttributes: {
              rows: 7,
              disabled: true
            }
          });
        }
        let v377 = false;
        const vF11 = async () => {
          const v378 = await fb.checkLive();
          if (v378 !== "success") {
            if (v378 === "not_login") {
              $(document).trigger("notLogged");
            }
            if (v378 === "282") {
              $(document).trigger("282");
              Swal.fire({
                icon: "error",
                title: "Checkpoint 282",
                text: "Tài khoản bị Checkpoint",
                confirmButtonText: "Đăng xuất",
                confirmButtonColor: "#dc3545",
                cancelButtonText: "Hủy",
                showCancelButton: true,
                allowOutsideClick: false
              }).then(async p294 => {
                if (p294.isConfirmed) {
                  await emptyCookie();
                  location.reload();
                }
              });
            }
            if (v378 === "956") {
              $(document).trigger("956");
              Swal.fire({
                icon: "error",
                title: "Checkpoint 956",
                text: "Tài khoản bị Checkpoint",
                confirmButtonText: "Đăng xuất",
                confirmButtonColor: "#dc3545",
                cancelButtonText: "Hủy",
                showCancelButton: true,
                allowOutsideClick: false
              }).then(async p295 => {
                if (p295.isConfirmed) {
                  await emptyCookie();
                  location.reload();
                }
              });
            }
            $("#pageLoading").addClass("d-none");
            $("#gridLoading").addClass("d-none");
            $("body").addClass("data-loaded");
            try {
              clearInterval(v377);
            } catch (e61) {
              console.log(e61);
            }
          }
        };
        v377 = setInterval(async () => {
          await vF11();
        }, 5000);
        await vF11();
        if (v365 === "via") {
          let vLS8 = "";
          v368.forEach(p296 => {
            vLS8 += "\n                        <div class=\"d-flex\">\n                            <div class=\"me-3 pt-2\">\n                                <span class=\"badge text-bg-success\">v" + p296.version + "</span>\n                                <small class=\"d-block mt-2 text-nowrap\">" + p296.date.split("T")[0] + "</small>\n                            </div>\n                            <div class=\"alert alert-light w-100\" role=\"alert\">" + p296.note + "</div>\n                        </div>\n                    ";
          });
          $("#versions").html(vLS8);
        }
        const vF12 = async () => {
          await fb.init();
          let vLS9 = "";
          let vLS10 = "";
          try {
            const v379 = await fb.getAccountQuality();
            vLS10 = "<a href=\"https://www.facebook.com/business-support-home/" + fb.uid + "\" target=\"_BLANK\" class=\"text-decoration-none badge text-bg-" + v379.color + " mb-1\" style=\"font-size: 12px;\">" + v379.status + "</a>";
            $("#quality").html(vLS10);
            if (vLS10.status === "XMDT Checkpoint") {
              vLS9 = "<button id=\"xmdt\" type=\"button\" class=\"position-absolute end-0 btn btn-success btn-sm\"><i class=\"ri-shield-check-line me-1\"></i>Kháng</button>";
            }
            if (vLS10.status === "HCQC 902 xịt - Xmdt lại 273" || vLS10.status === "Đang Kháng 902" || vLS10.status === "HCQC 902 XMDT" || vLS10.status === "HCQC 902 Chọn Dòng") {
              vLS9 = "<button id=\"k902\" type=\"button\" class=\"position-absolute end-0 btn btn-success btn-sm\"><i class=\"ri-shield-check-line me-1\"></i>Kháng 902</button>";
            }
          } catch (e62) {
            console.log(e62);
          }
          $("#userInfo").html("\n                    <div class=\"dropdown\">\n                        <div data-bs-toggle=\"dropdown\" data-bs-auto-close=\"outside\" style=\"cursor: pointer\">\n                            <span class=\"d-flex justify-content-between align-items-center border-start ms-3 ps-3\" style=\"width:calc(350px - 1rem);\">\n                                <span class=\"d-flex flex-column\">\n                                    <span class=\"position-relative\">\n                                        " + vLS9 + "\n                                        <span class=\"d-flex align-items-center flex-wrap\">\n                                            <span class=\"rounded-circle overflow-hidden\" style=\"width: 33px;\">\n                                                <img id=\"fbAvatar\" class=\"w-100 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                            </span>\n                                            <span class=\"ps-2\" style=\"width: calc(100% - 33px)\">\n                                                <span class=\"d-block mb-0 fw-bold text-truncate\" style=\"width: 200px;\">" + fb.userInfo.name + "</span>\n                                                <small class=\"d-block\">" + fb.uid + "</small>\n                                            </span>\n                                        </span>\n                                    </span>\n                                </span>\n                                <i class=\"ri-arrow-down-s-fill fs-5 m-0\" style=\"color: #666\"></i>\n                            </span>\n                        </div>\n                        <div class=\"dropdown-menu dropdown-menu-end overflow-hidden p-0 shadow\" style=\"width:calc(350px - 3rem);\">\n                            <div class=\"p-2\" style=\"background: #f0ecf4\">\n                                <div class=\"d-flex align-items-center justify-content-center\">\n                                    <div class=\"rounded-circle overflow-hidden shadow bg-white\" style=\"width: 70px; margin-bottom: -35px;\">\n                                        <img class=\"w-100 p-1 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                    </div>\n                                </div>\n                            </div>\n                            <div class=\"p-3 mt-4\">\n                                <div class=\"d-flex flex-column align-items-center\">\n                                    <span class=\"fw-bold fs-5\">" + fb.userInfo.name + "</span>\n                                    <span class=\"mb-2\">" + fb.uid + "</span>\n                                    " + vLS10 + "\n                                </div>\n                            </div>\n                            <ul class=\"p-3 m-0 border-top list-unstyled\">\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-mail-line me-2\"></i> Email: " + fb.userInfo.email + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-calendar-line me-2\"></i> Ngày sinh: " + fb.userInfo.birthday + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-group-line me-2\"></i> Bạn bè: " + fb.userInfo.friends + "\n                                    </span>\n                                </li>\n                                <li>\n                                    <span class=\"py-1 d-block fw-medium\">\n                                        <i class=\"ri-men-line me-2\"></i> Giới tính: " + (fb.userInfo.gender === "male" ? "Nam" : "Nữ") + "\n                                    </span>\n                                </li>\n                            </ul>\n                            <ul class=\"border-top p-3 m-0 list-unstyled\">\n                                <li>\n                                    <a href=\"#\" id=\"switch\" class=\"text-decoration-none py-1 d-block fw-medium text-black\">\n                                        <i class=\"ri-repeat-line me-2\"></i> Chuyển tài khoản\n                                    </a>\n                                </li>\n                                <li>\n                                    <a href=\"#\" id=\"logout\" class=\"text-decoration-none py-1 d-block fw-medium text-black\">\n                                        <i class=\"ri-logout-box-r-line me-2\"></i> Đăng xuất\n                                    </a>\n                                </li>\n                            </ul>\n                        </div>\n                    </div>\n                ");
          if (v365 === "via") {
            $("#viaInfo").html("\n                        <div class=\"card border-0 rounded-4 shadow-sm mb-4 p-4\" style=\"background: #3b61d3\">\n                            <div class=\"d-flex align-items-center justify-content-between\">\n                                <div class=\"d-flex align-items-center\">\n                                    <div class=\"rounded-circle overflow-hidden shadow bg-white\" style=\"width: 70px;\">\n                                        <img class=\"w-100 p-1 rounded-circle\" src=\"" + fb.userInfo.picture.data.url + "\">\n                                    </div>\n                                    <div class=\"ms-3\">\n                                        <span class=\"text-white fs-4 fw-medium d-block mb-0\">" + fb.userInfo.name + "</span>\n                                        <span class=\"text-white d-block\"><i class=\"ri-user-line\"></i> " + fb.uid + "</span>\n                                        <span class=\"text-white\"><i class=\"ri-mail-line\"></i> " + fb.userInfo.email + "</span>\n                                    </div>\n                                </div>\n                                <div class=\"rounded-4 p-3\" style=\"background-color: #ffffff1c; width: 500px;\">\n                                    <div class=\"row flex-grow-1\">\n                                        <div class=\"col-4 border-end\" style=\"border-color: #ffffff1c !important;\">\n                                            <div class=\"d-flex flex-wrap align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-calendar-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div style=\"width: calc(100% - 30px);\">\n                                                    <div class=\"ms-3\">\n                                                        <strong class=\"d-block text-white text-truncate\">" + fb.userInfo.birthday + "</strong>\n                                                        <span class=\"text-white-50 fw-medium\">Ngày sinh</span>\n                                                    </div>\n                                                </div>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-4 border-end\" style=\"border-color: #ffffff1c !important;\">\n                                            <div class=\"d-flex align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-user-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div class=\"ms-3\">\n                                                    <strong class=\"d-block text-white\">" + fb.userInfo.friends + "</strong>\n                                                    <span class=\"text-white-50 fw-medium\">Bạn bè</span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                        <div class=\"col-4\">\n                                            <div class=\"d-flex align-items-center\">\n                                                <div class=\"d-flex justify-content-center align-items-center rounded-circle\" style=\"width: 30px; height: 30px; background-color: #00000030;\">\n                                                    <i class=\"ri-men-line fs-5 text-white\"></i>\n                                                </div>\n                                                <div class=\"ms-3\">\n                                                    <strong class=\"d-block text-white\">" + (fb.userInfo.gender === "male" ? "Nam" : "Nữ") + "</strong>\n                                                    <span class=\"text-white-50 fw-medium\">Giới tính</span>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    ");
          }
          try {
            if (v365 === "bm") {
              const v380 = await getLocalStorage("loadBm");
              const v381 = await getLocalStorage("dataBm_" + fb.uid);
              if (v380) {
                await removeLocalStorage("loadBm");
                await removeLocalStorage("dataBm_" + fb.uid);
                await fb.loadBm();
              } else if (v381) {
                await fb.loadBm();
              } else {
                Swal.fire({
                  title: "Chưa có dữ liệu",
                  text: "Vui lòng bấm tải dữ liệu để hiển thị thông tin",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Tải dữ liệu",
                  cancelButtonText: "Hủy"
                }).then(async p297 => {
                  if (p297.isConfirmed) {
                    try {
                      await runCheckKey();
                      await setLocalStorage("loadBm", true);
                      location.reload();
                    } catch {}
                  }
                });
              }
            }
            if (v365 === "page") {
              const v382 = await getLocalStorage("loadPage");
              const v383 = await getLocalStorage("dataPage_" + fb.uid);
              if (v382) {
                await removeLocalStorage("loadPage");
                await removeLocalStorage("dataPage_" + fb.uid);
                await fb.loadPage();
              } else if (v383) {
                await fb.loadPage();
              } else {
                Swal.fire({
                  title: "Chưa có dữ liệu",
                  text: "Vui lòng bấm tải dữ liệu để hiển thị thông tin",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Tải dữ liệu",
                  cancelButtonText: "Hủy"
                }).then(async p298 => {
                  if (p298.isConfirmed) {
                    try {
                      await runCheckKey();
                      await setLocalStorage("loadPage", true);
                      location.reload();
                    } catch {}
                  }
                });
              }
            }
            if (v365 === "ads") {
              const v384 = await getLocalStorage("loadAds");
              const v385 = await getLocalStorage("dataAds_" + fb.uid);
              if (v384) {
                await removeLocalStorage("loadAds");
                await removeLocalStorage("dataAds_" + fb.uid);
                await fb.loadAds();
              } else if (v385) {
                await fb.loadAds();
              } else {
                Swal.fire({
                  title: "Chưa có dữ liệu",
                  text: "Vui lòng bấm tải dữ liệu để hiển thị thông tin",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Tải dữ liệu",
                  cancelButtonText: "Hủy"
                }).then(async p299 => {
                  if (p299.isConfirmed) {
                    try {
                      await runCheckKey();
                      await setLocalStorage("loadAds", true);
                      location.reload();
                    } catch {}
                  }
                });
              }
            }
            if (v365 === "group") {
              const v386 = await getLocalStorage("loadGroup");
              const v387 = await getLocalStorage("dataGroup_" + fb.uid);
              if (v386) {
                await removeLocalStorage("loadGroup");
                await removeLocalStorage("dataGroup_" + fb.uid);
                await fb.loadGroup();
              } else if (v387) {
                await fb.loadGroup();
              } else {
                Swal.fire({
                  title: "Chưa có dữ liệu",
                  text: "Vui lòng bấm tải dữ liệu để hiển thị thông tin",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Tải dữ liệu",
                  cancelButtonText: "Hủy"
                }).then(async p300 => {
                  if (p300.isConfirmed) {
                    try {
                      await runCheckKey();
                      await setLocalStorage("loadGroup", true);
                      location.reload();
                    } catch {}
                  }
                });
              }
            }
          } catch {}
          $("#gridLoading").addClass("d-none");
          $("body").addClass("data-loaded");
          if ($("#app").attr("data") !== "popup") {
            loadSetting();
          }
        };
        vF12();
      } else {
        const v388 = await saveSetting();
        const v389 = v388.general?.license?.value || "";
        Swal.fire({
          icon: "warning",
          title: "Bản cập nhật v" + v371,
          text: "Extension đã có phiên bản mới hơn, vui lòng cập nhật",
          confirmButtonText: "Download phiên bản " + v371,
          input: "textarea",
          inputValue: v372.replaceAll("<br>", "\r\n"),
          allowOutsideClick: false,
          inputAttributes: {
            rows: 7,
            disabled: true
          },
          preConfirm: () => {
            window.location.href = "https://dashboard.toolfb.vn/client/download/" + v389;
            return false;
          }
        });
      }
    }
  });
  function resolveCaptcha(p301, p302, p303) {
    return new Promise(async (p304, p305) => {
      try {
        const v390 = p301.general.captchaServiceKey.value;
        if (p301.general.captchaService.value === "1stcaptcha") {
          p304(await resolveCaptcha1st(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "2captcha") {
          p304(await resolve2Captcha(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "capmonster") {
          p304(await resolveCaptchaCapMonster(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "ezcaptcha") {
          p304(await resolveCaptchaEz(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "omocaptcha.com") {
          p304(await resolveCaptchaOmo(v390, p302, p303));
        }
        if (p301.general.captchaService.value === "anticaptcha") {
          p304(await resolveCaptchaAntiCaptcha(v390, p302, p303));
        }
      } catch (e63) {
        p305(e63);
      }
    });
  }
  function resolveCaptchaImage(p306, p307) {
    return new Promise(async (p308, p309) => {
      try {
        const v391 = p306.general.captchaServiceKey.value;
        if (p306.general.captchaService.value === "omocaptcha.com") {
          p308(await resolveCaptchaOmoImage(v391, p307));
        }
        if (p306.general.captchaService.value === "anticaptcha") {
          p308(await resolveCaptchaAntiCaptchaImage(v391, p307));
        }
        if (p306.general.captchaService.value === "2captcha") {
          p308(await resolveCaptcha2CaptchaImage(v391, p307));
        }
      } catch (e64) {
        p309(e64);
      }
    });
  }
  function resolveCaptchaAntiCaptchaImage(p310, p311) {
    return new Promise(async (p312, p313) => {
      try {
        const vO41 = {
          apikey: p310,
          img: p311,
          type: 6
        };
        const v392 = await fetch2("https://anticaptcha.top/api/captcha", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO41)
        });
        const v393 = v392.json;
        if (v393.success) {
          p312(v393.captcha);
        } else {
          p313(v393.message);
        }
      } catch (e65) {
        p313("Không thể giải captcha");
      }
    });
  }
  function resolveCaptcha1st(p314, p315, p316) {
    return new Promise(async (p317, p318) => {
      try {
        const v394 = await fetch2("https://api.1stcaptcha.com/recaptchav2_enterprise?apikey=" + p314 + "&sitekey=" + p315 + "&siteurl=" + p316);
        const v395 = v394.json;
        if (v395.Code === 0) {
          const v396 = +v395.TaskId;
          let v397;
          for (let vLN025 = 0; vLN025 < 10; vLN025++) {
            try {
              const v398 = await fetch2("https://api.1stcaptcha.com/getresult?apikey=" + p314 + "&taskid=" + v396);
              const v399 = v398.json;
              if (v399.Status === "SUCCESS") {
                v397 = v399.Data.Token;
                break;
              } else if (v399.Status === "ERROR") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v397) {
            p317(v397);
          } else {
            p318("Không thể giải captcha");
          }
        } else {
          p318(v395.Message);
        }
      } catch (e66) {
        p318("Không thể giải captcha");
      }
    });
  }
  function resolveCaptchaOmo(p319, p320, p321) {
    return new Promise(async (p322, p323) => {
      try {
        const vO43 = {
          api_token: p319,
          data: {
            type_job_id: "2"
          }
        };
        const v400 = await fetch2("https://omocaptcha.com/api/createJob", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO43)
        });
        const v401 = v400.json;
        if (v401.success) {
          const v402 = v401.job_id;
          let v403;
          for (let vLN026 = 0; vLN026 < 10; vLN026++) {
            try {
              const vO45 = {
                api_token: p319,
                job_id: v402
              };
              const v404 = await fetch2("https://omocaptcha.com/api/getJobResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO45)
              });
              const v405 = v404.json;
              if (v405.status === "success") {
                v403 = v405.result;
                break;
              } else if (v405.Status === "fail") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v403) {
            p322(v403);
          } else {
            p323("Không thể giải captcha");
          }
        } else {
          p323(v401.message);
        }
      } catch (e67) {
        p323("Không thể giải captcha");
      }
    });
  }
  function resolveCaptchaOmoImage(p324, p325) {
    return new Promise(async (p326, p327) => {
      try {
        const vO46 = {
          type_job_id: "30",
          image_base64: p325
        };
        const vO47 = {
          api_token: p324,
          data: vO46
        };
        const v406 = await fetch2("https://omocaptcha.com/api/createJob", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO47)
        });
        const v407 = v406.json;
        if (v407.success) {
          const v408 = v407.job_id;
          let v409;
          for (let vLN027 = 0; vLN027 < 10; vLN027++) {
            try {
              const vO48 = {
                api_token: p324,
                job_id: v408
              };
              const v410 = await fetch2("https://omocaptcha.com/api/getJobResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO48)
              });
              const v411 = v410.json;
              if (v411.status === "success") {
                v409 = v411.result;
                break;
              } else if (v411.Status === "fail") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v409) {
            p326(v409);
          } else {
            p327("Không thể giải captcha");
          }
        } else {
          p327(v407.message);
        }
      } catch (e68) {
        p327("Không thể giải captcha");
      }
    });
  }
  function resolveCaptcha2CaptchaImage(p328, p329) {
    return new Promise(async (p330, p331) => {
      try {
        const v412 = await fetch2("https://api.2captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p328,
            task: {
              type: "ImageToTextTask",
              body: p329
            }
          })
        });
        const v413 = v412.json;
        if (v413.taskId) {
          const v414 = +v413.taskId;
          let v415;
          for (let vLN028 = 0; vLN028 < 30; vLN028++) {
            try {
              const vO50 = {
                clientKey: p328,
                taskId: v414
              };
              const v416 = await fetch2("https://api.2captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO50)
              });
              const v417 = v416.json;
              if (v417.status === "ready") {
                v415 = v417.solution.text;
                break;
              } else if (v417.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v415) {
            p330(v415);
          } else {
            p331("Không thể giải captcha");
          }
        } else {
          p331(v413.Message);
        }
      } catch (e69) {
        console.log(e69);
        p331("Không thể giải captcha");
      }
    });
  }
  function resolveCaptchaCapMonster(p332, p333, p334) {
    return new Promise(async (p335, p336) => {
      try {
        const v418 = await fetch2("https://api.capmonster.cloud/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p332,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: p334,
              websiteKey: p333
            }
          })
        });
        const v419 = v418.json;
        if (v419.taskId) {
          const v420 = +v419.taskId;
          let v421;
          for (let vLN029 = 0; vLN029 < 10; vLN029++) {
            try {
              const vO51 = {
                clientKey: p332,
                taskId: v420
              };
              const v422 = await fetch2("https://api.capmonster.cloud/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO51)
              });
              const v423 = v422.json;
              if (v423.status === "ready") {
                v421 = v423.solution.gRecaptchaResponse;
                break;
              } else if (v423.errorCode != 0 && v423.status !== "processing") {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v421) {
            p335(v421);
          } else {
            p336("Không thể giải captcha");
          }
        } else {
          p336(v419.Message);
        }
      } catch (e70) {
        p336("Không thể giải captcha");
      }
    });
  }
  function resolve2Captcha(p337, p338, p339) {
    return new Promise(async (p340, p341) => {
      try {
        const v424 = await fetch2("https://api.2captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p337,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: p339,
              websiteKey: p338
            }
          })
        });
        const v425 = v424.json;
        if (v425.taskId) {
          const v426 = +v425.taskId;
          let v427;
          for (let vLN030 = 0; vLN030 < 30; vLN030++) {
            try {
              const vO52 = {
                clientKey: p337,
                taskId: v426
              };
              const v428 = await fetch2("https://api.2captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO52)
              });
              const v429 = v428.json;
              if (v429.status === "ready") {
                v427 = v429.solution.gRecaptchaResponse;
                break;
              } else if (v429.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v427) {
            p340(v427);
          } else {
            p341("Không thể giải captcha");
          }
        } else {
          p341(v425.Message);
        }
      } catch (e71) {
        console.log(e71);
        p341("Không thể giải captcha");
      }
    });
  }
  function resolveCaptchaEz(p342, p343, p344) {
    return new Promise(async (p345, p346) => {
      try {
        const v430 = await fetch2("https://api.ez-captcha.com/createTask", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          method: "POST",
          body: JSON.stringify({
            clientKey: p342,
            task: {
              type: "RecaptchaV2EnterpriseTaskProxyless",
              websiteURL: p344,
              websiteKey: p343
            }
          })
        });
        const v431 = v430.json;
        if (v431.taskId) {
          const v432 = v431.taskId;
          let v433;
          for (let vLN031 = 0; vLN031 < 10; vLN031++) {
            try {
              const vO54 = {
                clientKey: p342,
                taskId: v432
              };
              const v434 = await fetch2("https://api.ez-captcha.com/getTaskResult", {
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify(vO54)
              });
              const v435 = v434.json;
              console.log(v435);
              if (v435.status === "ready") {
                v433 = v435.solution.gRecaptchaResponse;
                break;
              } else if (v435.errorId != 0) {
                break;
              }
            } catch {}
            await delayTime(5000);
          }
          if (v433) {
            p345(v433);
          } else {
            p346("Không thể giải captcha");
          }
        } else {
          p346(v431.Message);
        }
      } catch (e72) {
        console.log(e72);
        p346("Không thể giải captcha");
      }
    });
  }
  function getPhone(p347, p348, p349 = "facebook") {
    return new Promise(async (p350, p351) => {
      let vLS11 = "";
      for (let vLN032 = 0; vLN032 < 99; vLN032++) {
        try {
          if (p347 === "chothuesimcode") {
            vLS11 = await getPhoneChoThueSimCode(p348, p349);
          }
          if (p347 === "viotp") {
            vLS11 = await getPhoneViOtp(p348, p349);
          }
          if (p347 === "xotp") {
            vLS11 = await getPhoneXotp(p348, p349);
          }
          if (p347 === "otponline") {
            vLS11 = await getPhoneOtpOnline(p348, p349);
          }
          if (p347 === "sim24") {
            vLS11 = await getPhoneSim24(p348, p349);
          }
          if (p347 === "233io9") {
            vLS11 = await getPhone233(p348, p349);
          }
          if (p347 === "simotp") {
            vLS11 = await getPhoneSimOtp(p348, p349);
          }
          if (p347 === "codesim") {
            vLS11 = await getPhoneCodeSim(p348, p349);
          }
          if (p347 === "template") {
            code = await getPhoneTemplate(id);
          }
          break;
        } catch (e73) {
          console.log(e73);
        }
      }
      if (vLS11) {
        p350(vLS11);
      } else {
        p351();
      }
    });
  }
  function getPhoneCode(p352, p353, p354) {
    return new Promise(async (p355, p356) => {
      try {
        const v436 = await saveSetting();
        const v437 = (await v436.general.getCodeNumber?.value) || 10;
        const vLN50 = 50;
        let vLS12 = "";
        if (p352 === "chothuesimcode") {
          vLS12 = await getPhoneCodeChoThueSimCode(p353, p354, v437, vLN50);
        }
        if (p352 === "viotp") {
          vLS12 = await getPhoneCodeViOtp(p353, p354, v437, vLN50);
        }
        if (p352 === "xotp") {
          vLS12 = await getPhoneCodeXotp(p353, p354, v437, vLN50);
        }
        if (p352 === "otponline") {
          vLS12 = await getPhoneCodeOnlineOtp(p353, p354, v437, vLN50);
        }
        if (p352 === "sim24") {
          vLS12 = await getPhoneCodeSim24(p353, p354, v437, vLN50);
        }
        if (p352 === "233io9") {
          vLS12 = await getPhoneCode233(p353, p354, v437, vLN50);
        }
        if (p352 === "simotp") {
          vLS12 = await getPhoneCodeSimOtp(p353, p354, v437, vLN50);
        }
        if (p352 === "codesim") {
          vLS12 = await getPhoneCodeCodeSim(p353, p354, v437, vLN50);
        }
        if (p352 === "template") {
          vLS12 = await getPhoneCodeTemplate(p354, v437, vLN50);
        }
        if (vLS12) {
          p355(vLS12);
        } else {
          p356();
        }
      } catch (e74) {
        p356(e74);
      }
    });
  }
  function getObjPath(p357, p358, p359) {
    if (typeof p358 == "string") {
      return getObjPath(p357, p358.split("."), p359);
    } else if (p358.length == 1 && p359 !== undefined) {
      return p357[p358[0]] = p359;
    } else if (p358.length == 0) {
      return p357;
    } else {
      return getObjPath(p357[p358[0]], p358.slice(1), p359);
    }
  }
  function getPhoneTemplate() {
    return new Promise(async (p360, p361) => {
      try {
        const v438 = await saveSetting();
        const v439 = v438.general.customPhone.value;
        const v440 = (await getLocalStorage("serviceData")) || [];
        const v441 = await v440.filter(p362 => p362.id == v439)[0];
        const v442 = await fetch2(v441.apiGetPhone);
        const v443 = v442.json;
        const vGetObjPath = getObjPath(v443, v441.phoneValue);
        const vGetObjPath2 = getObjPath(v443, v441.idValue);
        const v444 = v441.phonePrefix ?? "";
        if (vGetObjPath && vGetObjPath2) {
          if (v441.phoneDelay) {
            await delayTime(v441.phoneDelay * 100);
          }
          p360({
            number: v444 + vGetObjPath,
            id: vGetObjPath2
          });
        } else {
          p361("Không thể lấy số điện thoại");
        }
      } catch (e75) {
        console.log(e75);
        p361("Không thể lấy số điện thoại");
      }
    });
  }
  function getPhoneCodeTemplate(p363, p364, p365) {
    return new Promise(async (p366, p367) => {
      try {
        const v445 = await saveSetting();
        const v446 = v445.general.customPhone.value;
        const v447 = (await getLocalStorage("serviceData")) || [];
        const v448 = await v447.filter(p368 => p368.id == v446)[0];
        let v449 = false;
        for (let vLN033 = 0; vLN033 < p364; vLN033++) {
          await delayTime(p365 * 100);
          try {
            const v450 = await fetch2(v448.apiGetCode.replace("{id}", p363));
            const v451 = v450.json;
            v449 = getObjPath(v451, v448.codeValue).match(/\d+/)[0];
            if (v449 && v449 != "00000") {
              p366(v449);
              break;
            }
          } catch (e76) {}
        }
        if (!v449) {
          p367();
        }
      } catch (e77) {
        console.log(e77);
        p367();
      }
    });
  }
  function getPhoneCodeSim(p369, p370 = "facebook") {
    return new Promise(async (p371, p372) => {
      try {
        const v452 = await fetch2("https://apisim.codesim.net/sim/get_sim?service_id=1&api_key=" + p369);
        const v453 = v452.json;
        if (v453.status === 200) {
          const vO55 = {
            number: v453.data.phone,
            id: v453.data.otpId
          };
          p371(vO55);
        } else {
          p372(v453.message);
        }
      } catch (e78) {
        p372("Không thể lấy số điện thoại");
      }
    });
  }
  function getPhoneCodeCodeSim(p373, p374, p375, p376) {
    return new Promise(async (p377, p378) => {
      try {
        let v454 = null;
        for (let vLN034 = 0; vLN034 < p375; vLN034++) {
          await delayTime(p376 * 100);
          const v455 = await fetch2("https://apisim.codesim.net/otp/get_otp_by_phone_api_key?otp_id=" + p374 + "&api_key=" + p373);
          const v456 = v455.json;
          if (v456.status === 200) {
            v454 = v456.data.code;
            if (v454) {
              p377(v454);
              break;
            }
          }
        }
        if (!v454) {
          p378();
        }
      } catch (e79) {
        p378(e79);
      }
    });
  }
  function getPhoneSimOtp(p379, p380 = "facebook") {
    return new Promise(async (p381, p382) => {
      let vLN15 = 15;
      if (p380 === "instagram") {
        vLN15 = 29;
      }
      try {
        const vO56 = {
          service: vLN15
        };
        const v457 = await fetch2("https://simotp.net/api/v1/order", {
          method: "POST",
          headers: {
            Authorization: "OTP " + p379,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(vO56)
        });
        const v458 = v457.json;
        if (v458.data) {
          p381({
            number: "84" + v458.data.phoneNumber,
            id: v458.data.id
          });
        } else {
          p382(v458.error.message);
        }
      } catch (e80) {
        p382("Không thể lấy số điện thoại");
      }
    });
  }
  function getPhoneCodeSimOtp(p383, p384, p385, p386) {
    return new Promise(async (p387, p388) => {
      const vF13 = p389 => {
        let v459 = p389.match(/\b\d{6}\b/);
        return v459 && v459[0];
      };
      try {
        let v460 = null;
        for (let vLN035 = 0; vLN035 < p385; vLN035++) {
          await delayTime(p386 * 100);
          const v461 = await fetch2("https://simotp.net/api/v1/order/" + p384, {
            headers: {
              Authorization: "OTP " + p383
            }
          });
          const v462 = v461.json;
          if (v462.data) {
            v460 = vF13(v462.data.content);
            if (v460) {
              p387(v460);
              break;
            }
          }
        }
        if (!v460) {
          p388();
        }
      } catch (e81) {
        p388(e81);
      }
    });
  }
  function getPhone233(p390, p391 = "facebook") {
    return new Promise(async (p392, p393) => {
      let vLN9 = 9;
      if (p391 === "instagram") {
        vLN9 = 15;
      }
      try {
        const v463 = await fetch2("https://api.233io9.info/api/dangkysim?api_key=" + p390 + "&appId=" + vLN9);
        const v464 = v463.json;
        if (v464.ResponseCode == 200) {
          p392({
            number: "84" + v464.Result.number,
            id: v464.Result.id
          });
        } else {
          p393(v464.Msg);
        }
      } catch (e82) {
        p393(e82);
      }
    });
  }
  function getPhoneCode233(p394, p395, p396, p397) {
    return new Promise(async (p398, p399) => {
      try {
        let v465 = null;
        for (let vLN036 = 0; vLN036 < p396; vLN036++) {
          await delayTime(p397 * 100);
          const v466 = await fetch2("https://api.233io9.info/api/layotpByID?api_key=" + p394 + "&id=" + p395);
          const v467 = v466.json;
          if (v467.ResponseCode == 200) {
            v465 = v467.Result[0].otp;
            p398(v465);
            break;
          }
        }
        if (!v465) {
          p399();
        }
      } catch (e83) {
        p399(e83);
      }
    });
  }
  function getPhoneSim24(p400, p401 = "facebook") {
    return new Promise(async (p402, p403) => {
      try {
        const v468 = await fetch2("https://sim24.cc/api?action=number&service=" + p401 + "&apikey=" + p400);
        const v469 = v468.json;
        if (v469.ResponseCode == 0) {
          const vO57 = {
            number: v469.Result.number,
            id: v469.Result.id
          };
          p402(vO57);
        } else {
          p403();
        }
      } catch (e84) {
        p403(e84);
      }
    });
  }
  function getPhoneCodeSim24(p404, p405, p406, p407) {
    return new Promise(async (p408, p409) => {
      try {
        let v470 = null;
        for (let vLN037 = 0; vLN037 < p406; vLN037++) {
          await delayTime(p407 * 100);
          const v471 = await fetch2("https://sim24.cc/api?action=code&id=" + p405 + "&apikey=" + p404);
          const v472 = v471.json;
          if (v472.ResponseCode == 0) {
            v470 = v472.Result.otp;
            break;
          }
        }
        if (v470) {
          p408(v470);
        } else {
          p409();
        }
      } catch (e85) {
        p409(e85);
      }
    });
  }
  function getPhoneChoThueSimCode(p410, p411) {
    return new Promise(async (p412, p413) => {
      try {
        const v473 = await getLocalStorage("setting");
        const v474 = v473.general.carrier.value;
        let vLS1001 = "1001";
        let vLS13 = "";
        if (p411 === "instagram") {
          vLS1001 = "1010";
          vLS13 = "84";
        }
        const v475 = await fetch2("https://chaycodeso3.com/api?act=number&apik=" + p410 + "&appId=" + vLS1001 + "&carrier=" + v474);
        const v476 = v475.json;
        if (v476.ResponseCode == 0) {
          const vO58 = {
            number: vLS13 + v476.Result.Number,
            id: v476.Result.Id
          };
          p412(vO58);
        } else {
          p413();
        }
      } catch (e86) {
        p413(e86);
      }
    });
  }
  function getPhoneCodeChoThueSimCode(p414, p415, p416, p417) {
    return new Promise(async (p418, p419) => {
      try {
        let v477 = null;
        for (let vLN038 = 0; vLN038 < p416; vLN038++) {
          await delayTime(p417 * 100);
          const v478 = await fetch2("https://chaycodeso3.com/api?act=code&apik=" + p414 + "&id=" + p415);
          const v479 = v478.json;
          if (v479.ResponseCode == 0) {
            v477 = v479.Result.Code;
            break;
          }
        }
        if (v477) {
          p418(v477);
        } else {
          await fetch2("https://chaycodeso3.com/api?act=expired&apik=" + p414 + "&id=" + p415);
          p419();
        }
      } catch (e87) {
        p419(e87);
      }
    });
  }
  function getPhoneOtpOnline(p420) {
    return new Promise(async (p421, p422) => {
      try {
        const v480 = await fetch2("https://api.server-otponline.xyz/api/public/user/sim/buy/v2?appId=34&apiKey=" + p420);
        const v481 = v480.json;
        if (v481.isSuccessed) {
          const vO59 = {
            number: v481.resultObj.value.number,
            id: v481.resultObj.value.id
          };
          p421(vO59);
        } else {
          p422(v481.message);
        }
      } catch (e88) {
        p422(e88);
      }
    });
  }
  function getPhoneCodeOnlineOtp(p423, p424, p425, p426) {
    return new Promise(async (p427, p428) => {
      try {
        let v482 = null;
        for (let vLN039 = 0; vLN039 < p425; vLN039++) {
          await delayTime(p426 * 100);
          const v483 = await fetch2("https://api.server-otponline.xyz/api/public/user/sim/v2?orderId=" + p424 + "&apiKey=" + p423);
          const v484 = v483.json;
          if (v484.isSuccessed && v484.resultObj.status == "2") {
            v482 = v484.resultObj.code;
            break;
          }
          if (v484.resultObj.status == "3" || v484.resultObj.status == "4") {
            break;
          }
        }
        if (v482) {
          p427(v482);
        } else {
          p428();
        }
      } catch (e89) {
        p428(e89);
      }
    });
  }
  function getPhoneViOtp(p429, p430 = "facebook") {
    return new Promise(async (p431, p432) => {
      let vLN7 = 7;
      if (p430 === "microsoft") {
        vLN7 = 5;
      }
      if (p430 === "instagram") {
        vLN7 = 36;
      }
      try {
        const v485 = await fetch2("https://api.viotp.com/request/getv2?token=" + p429 + "&serviceId=" + vLN7);
        const v486 = v485.json;
        if (v486.success) {
          const vO60 = {
            number: v486.data.phone_number,
            id: v486.data.request_id
          };
          p431(vO60);
        } else {
          p432(v486.message);
        }
      } catch (e90) {
        p432(e90);
      }
    });
  }
  function getPhoneCodeViOtp(p433, p434, p435, p436) {
    return new Promise(async (p437, p438) => {
      try {
        let v487 = null;
        for (let vLN040 = 0; vLN040 < p435; vLN040++) {
          await delayTime(p436 * 100);
          const v488 = await fetch2("https://api.viotp.com/session/getv2?requestId=" + p434 + "&token=" + p433);
          const v489 = v488.json;
          if (v489.success) {
            if (v489.data.Code !== null) {
              v487 = v489.data.Code;
              p437(v487);
            }
          } else {
            p438(v489.message);
          }
        }
        if (!v487) {
          p438();
        }
      } catch (e91) {
        p438(e91);
      }
    });
  }
  function getPhoneXotp(p439, p440 = "facebook") {
    return new Promise(async (p441, p442) => {
      try {
        const v490 = await fetch2("https://xotp.pro/api/v1/create-request?apikey=" + p439 + "&service=" + p440);
        const v491 = v490.json;
        if (!v491.error) {
          const vO61 = {
            number: v491.phone,
            id: v491.id
          };
          p441(vO61);
        } else {
          p442(v491.error);
        }
      } catch (e92) {
        p442(e92);
      }
    });
  }
  function getPhoneCodeXotp(p443, p444, p445, p446) {
    return new Promise(async (p447, p448) => {
      try {
        let v492 = null;
        for (let vLN041 = 0; vLN041 < p446; vLN041++) {
          await delayTime(p446 * 100);
          const v493 = await fetch2("https://xotp.pro/api/v1/get-request?apikey=" + p443 + "&id=" + p444);
          const v494 = v493.json;
          if (v494.code) {
            v492 = v494.code;
            break;
          }
        }
        if (v492) {
          p447(v492);
        } else {
          await fetch2("https://xotp.pro/api/v1/cancel-request?apikey=" + p443 + "&id=" + p444);
          p448();
        }
      } catch (e93) {
        p448(e93);
      }
    });
  }
  function getBase64Image(p449) {
    return fetch2(p449).then(p450 => p450.blob()).then(p451 => new Promise(p452 => {
      let v495 = new FileReader();
      v495.onload = function () {
        p452(this.result);
      };
      v495.readAsDataURL(p451);
    }));
  }
  function makeid(p453) {
    let vLS14 = "";
    const vLSAbcdefghijklmnopqrst = "abcdefghijklmnopqrstuvwxyz0123456789";
    const v496 = vLSAbcdefghijklmnopqrst.length;
    let vLN042 = 0;
    while (vLN042 < p453) {
      vLS14 += vLSAbcdefghijklmnopqrst.charAt(Math.floor(Math.random() * v496));
      vLN042 += 1;
    }
    return vLS14;
  }
  function getNewEmail() {
    return new Promise(async (p454, p455) => {
      try {
        const v497 = await saveSetting();
        const vO63 = {
          type: v497.general.emailService.value
        };
        const v498 = await fetch2("https://app.toolfb.vn/getEmail", {
          headers: {
            "content-type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO63)
        });
        const v499 = v498.json;
        if (v499.success) {
          p454(v499);
        } else {
          p455();
        }
      } catch {
        p455();
      }
    });
  }
  function getEmailInbox(p456, p457) {
    return new Promise(async (p458, p459) => {
      try {
        const v500 = await saveSetting();
        const vO64 = {
          type: v500.general.emailService.value,
          id: p456,
          email: p457
        };
        const v501 = await fetch2("https://app.toolfb.vn/getEmailInbox", {
          headers: {
            "content-type": "application/json"
          },
          method: "POST",
          body: JSON.stringify(vO64)
        });
        const v502 = v501.json;
        if (v502.success) {
          p458(v502.inbox);
        } else {
          p459();
        }
      } catch {
        p459();
      }
    });
  }
  function randomNumberRange(p460, p461) {
    return Math.floor(Math.random() * (p461 - p460) + p460);
  }
  function checkLive(p462) {
    return new Promise(async (p463, p464) => {
      try {
        const v503 = await fetch2("https://graph2.facebook.com/v3.3/" + p462 + "/picture?redirect=0");
        const v504 = v503.json;
        if (v504.data.width && v504.data.height) {
          p463(v504.data.url);
        } else {
          p464();
        }
      } catch {
        p464();
      }
    });
  }
  function runVia(p465, p466) {
    return new Promise(async (p467, p468) => {
      if (p465.via.getLinkXmdt.value) {
        p466({
          action: "message",
          msg: "Đang lấy link XMDT..."
        });
        try {
          const v505 = await fb.getLinkAn();
          p466({
            action: "message",
            msg: "https://www.facebook.com/checkpoint/1501092823525282/" + v505
          });
        } catch {
          p466({
            action: "message",
            msg: "Lấy link XMDT thất bại"
          });
        }
      }
      p467();
    });
  }
  function runBm(p469, p470, p471) {
    return new Promise(async (p472, p473) => {
      try {
        if (p470.bm.backUpBm.value) {
          try {
            const v506 = p470.bm.backupBmRole.value;
            let vLS15 = "";
            if (p470.bm.backupBmMode.value === "mail") {
              const v507 = p470.bm.backUpEmail.value.split("\n").filter(p474 => p474).map(p475 => p475.trim());
              vLS15.email = v507[Math.floor(Math.random() * v507.length)].split("|")[0];
              const v508 = vLS15.email.split("@")[1].split("|")[0];
              vLS15.email = vLS15.email.split("@")[0] + "+" + randomNumberRange(1111111, 999) + "-" + p469.bmId + "@" + v508;
            } else {
              vLS15 = await getNewEmail();
            }
            p471("message", {
              message: "Đang backup BM"
            });
            const v509 = await fb.backUpBm(p469.bmId, vLS15.email, v506, p476 => {
              const vO67 = {
                message: p476
              };
              p471("message", vO67);
            });
            if (p470.bm.tutBackUpBmVery.value) {
              const v510 = await (await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=3251", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + fb.uid + "&__usid=6-Tsks7l51qspa42%3APsks8ds1thfd9m%3A0-Asks7awg66ikg-RV%3D6%3AF%3D&__aaid=0&__bid=" + p469.bmId + "&__user=" + fb.uid + "&__a=1&__req=i&__hs=19999.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017025556&__s=c6cqtg%3A9ny5zc%3Ax4vf3i&__hsi=7421542340437444584&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R046xO2O1VwBwXwEwgo9oO0iS12ypU5-0Bo7O2l0Fwqo5W1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cwNwDwjouwqo4e220hi7E5y1rwGw9q&__csr=gR2Y9di8gR8IAyFlR94EIh9q9W8uHshSAQJJkG99EZuymz7lrmFP9WUwFGHQCynWbXF4sgyOti9p-HJVyp2dkjydQh5UB98yiJenp6i-UzS8iHttrQgHZTlvRVGGumqSGF8CFKHiJkAQ9iAJeiuiayVbCVVZaGGi8y5V4ijhqCADyrhVe9oB3nUzDy4ilaBGXxl24uLJdyucVHAz8R4HDKm8UPCH-Ey9K-qmqimmlpda8iQbUhKl39UioKESiim5F8vpEpwOxq8AxefyWhqBxa5GyoW2mULgS78KdUb8txW13y42Gcholy8S7Hwwgco9ElwPCw_yo669xO5U66fzE3Iwo48gjK5Cmrw9Omi1Yw8y1fgjwvQ0tY2G2Ca41p0ljK8k9wlU0Aq04Do0HK0eHw3880BWE0E6U0jlwfS5PDGvwpU3ew7izO0hBwyw0bcC06480rfw4tG09tOw0xcyonDy44k3S0REaUaU5ScxS0rO05lU0Zy5WOo08f40v-3O0F419g2MBg0I4w3Hg0bpFU0P24UlU1HQ0wy0Pg92wpE0GB0ku0r61Fg3Jwe-&__comet_req=11&fb_dtsg=" + fb.dtsg + "&jazoest=25317&lsd=2nMgHREcO8gdlRTjtRgWHe&__spin_r=1017025556&__spin_b=trunk&__spin_t=1727962480&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=QueryPendingSensitiveActionReviewsQuery&variables=%7B%22reviewedEntId%22%3A%22" + v509 + "%22%7D&server_timestamps=true&doc_id=6904532806315218",
                method: "POST"
              })).text;
              if (v510.includes("EMAIL_VERIFICATION")) {
                const v511 = JSON.parse(v510);
                const v512 = v511.data.xfb_pending_sensitive_action_reviews.edges[0].node.id;
                const v513 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=3546&_triggerFlowletID=3536", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "av=" + fb.uid + "&__usid=6-Tsprfi5fefh5v%3APsprgzvh0fm8j%3A0-Asprfi519rbhrz-RV%3D6%3AF%3D&__aaid=0&__bid=617818212750919&__user=" + fb.uid + "&__a=1&__req=17&__hs=20096.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=MODERATE&__rev=1019207107&__s=ed84n2%3Axlxbxf%3A6kifp6&__hsi=7457459374196583445&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i2GU8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS1qxa1ozFUK1gzo8EfEO32fxiEf8bGwgUy1CyUix6fwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEg5Ku0hi1TwmUaE2mwwxS1Lw&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25314&lsd=yHaEtU0j0ipZn15v9HJPAZ&__spin_r=1019207107&__spin_b=trunk&__spin_t=1736325066&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacBvTriggerRootQuery&variables=%7B%22input%22%3A%7B%22authenticatable_entity_id%22%3A%22" + v512 + "%22%2C%22business_verification_design_system%22%3A%22GEODESIC%22%2C%22business_verification_ui_type%22%3A%22BUSINESS_MANAGER_COMET%22%2C%22trigger_event_type%22%3A%22XFAC_BV_COMPROMISE_SIGNALS_BASED_CHALLENGES_ENTRY%22%2C%22xfac_config%22%3A%22XFAC_AUTHENTICITY_COMPROMISE_SIGNALS_BASED_VERIFICATION%22%2C%22xfac_appeal_type%22%3A%22AUTHENTICITY_COMPROMISE_SIGNALS_BASED_VERIFICATION%22%2C%22nt_context%22%3Anull%2C%22trigger_session_id%22%3A%225b4155cb-855f-40dd-9c13-fb64bd3dc20d%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8748278645220835",
                  method: "POST"
                });
                const v514 = v513.json;
                let v515 = v514.data.ixt_xfac_bv_trigger.screen.view_model.serialized_state;
                const v516 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=4995&_triggerFlowletID=4991", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "av=" + fb.uid + "&__usid=6-Tsks7l51qspa42%3APsks8noocox52%3A0-Asks7awg66ikg-RV%3D6%3AF%3D&__aaid=0&__bid=" + p469.bmId + "&__user=" + fb.uid + "&__a=1&__req=x&__hs=19999.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017025556&__s=ky5jhe%3A9ny5zc%3Aouunwz&__hsi=7421543862026001980&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R046xO2O1VwBwXwEwgo9oO0iS12ypU5-0Bo7O2l0Fwqo5W1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mw&__csr=g8Hky4iib98G7Nab4imyuypqJNlF9HrlayiqfnEBENOXmKgWuKkgWGLisjWbQGh748IDkymXWLTC9A8RheWYN4nykAy9aQVtApbXALS8iHdRLh2FsZlTlCmFVpHqGAyqCWJkRiioBVbjHDAQubAKrDBZaGGQ8y5V4LHhlCADyrhV69rBiUx-FuXhQilnmHK9BBjAiHHXjoDgLCKiczkQKuVpRK8VG_F7DXLCBAV9uVi4QFJbgLx6VkcDGfoKESijKEyArmbAzCrQfAGq2x3FEyi4U-bF5GmqbxeGyozKfx1eULoPUoyUTz8vxS7Ekx-ey42Gcholy8S7Hxq9gco9ElwPCgfEC2i2y4UC78nwooKUWWJwd-1wgx1eUmppK7F9Ea84ymi1Yw8y1fgjwvQi880sU2G2Ca41p0kGeUxgC1nwam2e6Enw59w13Ak8gGu3S7A4o2jwcm1jwWwa209d0I3paxc5Mn5oC2A2Q0cww2nGw2wrw1dm1Bg2mxsVWDU6u0PE1QEYw4po8E05w60qYbgA5sMeolK041pU0iIw1Gm057oc80nvwoCEiglQ06eE11onGt0au22ew5YOw5HUYjam2t0G5hgGlwpQi480n0yonDy44k3S0OUG2K2K1tz8tw6Yw1lu0foxuIC07iU2qyU-q6Z1d0Vyk0rG3O0F419g2MBg0I4w3Hg0bpFU0P24UlU1uEd40wy0Pg92wpE0GB0ku0r63Oi4Ujg8ZGeixG9DyU7q2S0KpUiBU4yfo&__comet_req=11&fb_dtsg=" + fb.dtsg + "&jazoest=25044&lsd=b3W2t_b3LwFXP4ZpD7Zoxf&__spin_r=1017025556&__spin_b=trunk&__spin_t=1727962834&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_email_challenge%22%3A%7B%22email_address%22%3A%22" + vLS15.email + "%22%2C%22org_id%22%3A%22" + v512 + "%22%2C%22serialized_state%22%3A%22" + v515 + "%22%2C%22website%22%3A%22%22%7D%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8659559900749920",
                  method: "POST"
                });
                const v517 = v516.json;
                v515 = v517.data.ixt_screen_next.view_model.serialized_state;
                let v518 = false;
                for (let vLN043 = 0; vLN043 < 12; vLN043++) {
                  try {
                    const v519 = (await getEmailInbox(vLS15.id, vLS15.email)).filter(p477 => p477.email === "notification@facebookmail.com");
                    if (v519[0]) {
                      v518 = v519[0].content.match(/([0-9]{6})/)[0];
                      break;
                    }
                  } catch {}
                  await delayTime(2000);
                }
                if (v518) {
                  const v520 = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=5894&_triggerFlowletID=5890", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "av=" + fb.uid + "&__usid=6-Tsks9ku1odjn08%3APsks9ku1m32dt7%3A0-Asks7awg66ikg-RV%3D6%3AF%3D&__aaid=0&__bid=" + p469.bmId + "&__user=" + fb.uid + "&__a=1&__req=z&__hs=19999.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017025556&__s=rttzo6%3Asirrph%3A4msabx&__hsi=7421548998706757440&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R046xO2O1VwBwXwEwgo9oO0iS12ypU5-0Bo7O2l0Fwqo5W1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mw&__csr=g8Hky4iib98G7Nab4imyuypqJNlF9HrlayiqfnEBENOXmKgWuKkgWGLisjWbQGh748IDkymXWLTC9A8RheWYN4nykAy9aQVtApbXALS8iHdRLh2FsZlTlCmFVpHqGAyqCWJkRiioBVbjHDAQubAKrDBZaGGQ8y5V4LHhlCADyrhV69rBiUx-FuXhQilnmHK9BBjAiHHXjoDgLCKiczkQKuVpRK8VG_F7DXLCBAV9uVi4QFJbgLx6VkcDGfoKESijKEyArmbAzCrQfAGq2x3FEyi4U-bF5GmqbxeGyozKfx1eULoPUoyUTz8vxS7Ekx-ey42Gcholy8S7Hxq9gco9ElwPCgfEC2i2y4UC78nwooKUWWJwd-1wgx1eUmppK7F9Ea84ymi1Yw8y1fgjwvQi880sU2G2Ca41p0kGeUxgC1nwam2e6Enw59w13Ak8gGu3S7A4o2jwcm1jwWwa209d0I3paxc5Mn5oC2A2Q0cww2nGw2wrw1dm1Bg2mxsVWDU6u0PE1QEYw4po8E05w60qYbgA5sMeolK041pU0iIw1Gm057oc80nvwoCEiglQ06eE11onGt0au22ew5YOw5HUYjam2t0G5hgGlwpQi480n0yonDy44k3S0OUG2K2K1tz8tw6Yw1lu0foxuIC07iU2qyU-q6Z1d0Vyk0rG3O0F419g2MBg0I4w3Hg0bpFU0P24UlU1uEd40wy0Pg92wpE0GB0ku0r63Oi4Ujg8ZGeixG9DyU7q2S0KpUiBU4yfo&__comet_req=11&fb_dtsg=" + fb.dtsg + "&jazoest=25528&lsd=D_TAqIY04WCN508sRmcBVa&__spin_r=1017025556&__spin_b=trunk&__spin_t=1727964030&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_enter_email_code%22%3A%7B%22check_id%22%3Anull%2C%22code%22%3A%22" + v518 + "%22%2C%22serialized_state%22%3A%22" + v515 + "%22%7D%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22client_mutation_id%22%3A%225%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8659559900749920",
                    method: "POST"
                  });
                  const v521 = v520.text;
                }
              }
            }
            p471("message", {
              message: "Backup BM thành công"
            });
            if (p470.bm.backupBmMode.value === "link") {
              let v522 = false;
              p471("message", {
                message: "Đang chờ lấy link backup"
              });
              for (let vLN044 = 0; vLN044 < 12; vLN044++) {
                try {
                  const v523 = (await getEmailInbox(vLS15.id, vLS15.email)).filter(p478 => p478.email === "notification@facebookmail.com" || p478.email === "noreply@business.facebook.com");
                  if (v523[0]) {
                    const v524 = $.parseHTML(v523[0].content);
                    if ($(v524).find("a[href^=\"https://fb.me/\"]").length > 0) {
                      v522 = p469.bmId + "|" + $(v524).find("a[href^=\"https://fb.me/\"]").attr("href");
                      break;
                    }
                    if ($(v524).find("a[href^=\"https://www.facebook.com/aymt/offsite/\"]").length > 0) {
                      v522 = p469.bmId + "|" + $(v524).find("a[href^=\"https://www.facebook.com/aymt/offsite/\"]").attr("href");
                      break;
                    }
                  }
                } catch {}
                await delayTime(2000);
              }
              if (v522) {
                const vO71 = {
                  link: v522
                };
                p471("updateBackupLink", vO71);
                p471("message", {
                  message: "Lấy link backup thành công"
                });
              } else {
                p471("message", {
                  message: "Lấy link backup thất bại"
                });
              }
            }
          } catch (e94) {
            console.log(e94);
            p471("message", {
              message: "Backup BM thất bại"
            });
          }
        }
        if (p470.bm.cancelPending.value) {
          try {
            await fb.cancelPending(p469.bmId, p479 => {
              const vO73 = {
                message: p479
              };
              p471("message", vO73);
            });
          } catch {}
        }
        if (p470.bm.renameBm.value) {
          if (p470.bm.renameUser.value) {
            const v525 = p470.bm.newNameBm.value;
            if (p470.bm.renameUserMode.value === "viaCam") {
              try {
                p471("message", {
                  message: "Đang đổi tên VIA cầm"
                });
                const v526 = await fb.getMainBmAccounts(p469.bmId);
                await fb.renameVia(v526.id, v525);
                p471("message", {
                  message: "Đổi tên VIA cầm thành công"
                });
              } catch {
                p471("message", {
                  message: "Đổi tên VIA cầm thất bại"
                });
              }
            } else {
              let v527 = (await fb.getBmAccounts(p469.bmId)).map(p480 => p480.id);
              if (p470.bm.renameUserMode.value === "truViaCam") {
                const v528 = await fb.getMainBmAccounts(p469.bmId);
                v527 = v527.filter(p481 => p481 !== v528.id);
              }
              let vLN045 = 0;
              for (let vLN046 = 0; vLN046 < v527.length; vLN046++) {
                const v529 = v527[vLN046];
                p471("message", {
                  message: "[" + (vLN046 + 1) + "/" + v527.length + "] Đang đổi tên: " + v529
                });
                try {
                  await fb.renameVia(v529, v525);
                  vLN045++;
                } catch {}
              }
              p471("message", {
                message: "Đổi tên thành công " + vLN045 + "/" + v527.length
              });
            }
          } else {
            try {
              const v530 = p470.bm.newNameBm.value + " " + randomNumberRange(111111, 999999);
              p471("message", {
                message: "Đang đổi tên BM"
              });
              await fb.renameBm(p469.bmId, v530);
              const vO74 = {
                name: v530
              };
              p471("updateBmName", vO74);
              p471("message", {
                message: "Đổi tên BM thành công"
              });
            } catch (e95) {
              p471("message", {
                message: "Đổi tên BM thất bại"
              });
            }
          }
        }
        if (p470.bm.updateRole.value) {
          try {
            const v531 = await fb.getMainBmAccounts(p469.bmId);
            let v532 = await fb.getBmAccounts(p469.bmId);
            if (p470.bm.updateSelect.value === "all") {
              v532 = v532.filter(p482 => p482.id != v531.id).map(p483 => p483.id);
            }
            if (p470.bm.updateSelect.value === "name") {
              v532 = v532.filter(p484 => p484.name.toLowerCase().includes(p470.bm.updateName.value.toLowerCase())).map(p485 => p485.id);
            }
            if (p470.bm.updateSelect.value === "via") {
              v532 = [v531.id];
            }
            let vLN047 = 0;
            for (let vLN048 = 0; vLN048 < v532.length; vLN048++) {
              const v533 = v532[vLN048];
              try {
                if (p470.bm.updateMode.value === "nang") {
                  p471("message", {
                    message: "[" + (vLN048 + 1) + "/" + v532.length + "] Đang nâng quyền: " + v533
                  });
                  await fb.upgradeRole(p469.bmId, v533);
                } else {
                  p471("message", {
                    message: "[" + (vLN048 + 1) + "/" + v532.length + "] Đang hạ quyền: " + v533
                  });
                  await fb.downgradeRole(p469.bmId, v533);
                }
                vLN047++;
              } catch {}
            }
            if (p470.bm.updateMode.value === "nang") {
              p471("message", {
                message: "Nâng quyền thành công " + vLN047 + "/" + v532.length
              });
            } else {
              p471("message", {
                message: "Hạ quyền thành công " + vLN047 + "/" + v532.length
              });
            }
          } catch (e96) {
            console.log(e96);
          }
        }
        if (p470.bm.activePage.value) {
          try {
            let vLN049 = 0;
            p471("message", {
              message: "Đang lấy danh sách page"
            });
            const v534 = await fb.getDeactivedPage(p469.bmId);
            console.log(v534);
            for (let vLN050 = 0; vLN050 < v534.length; vLN050++) {
              const v535 = v534[vLN050];
              p471("message", {
                message: "[" + (vLN050 + 1) + "/" + v534.length + "] Đang kích hoạt lại page: " + v535.id
              });
              try {
                await fb.activePage(p469.bmId, v535.id);
                p471("message", {
                  message: "[" + (vLN050 + 1) + "/" + v534.length + "] Kích hoạt lại page thành công: " + v535.id
                });
                vLN049++;
              } catch (e97) {
                console.log(e97);
                p471("message", {
                  message: "[" + (vLN050 + 1) + "/" + v534.length + "] Kích hoạt lại page thất bại: " + v535.id
                });
              }
              await delayTime(2000);
            }
            p471("message", {
              message: "Kích hoạt thành công " + vLN049 + "/" + v534.length + " page"
            });
          } catch (e98) {
            p471("message", {
              message: "Lấy danh sách page thất bại"
            });
          }
        }
        if (p470.bm.khangBm.value) {
          const vF14 = (p486, p487, p488) => {
            return new Promise(async (p489, p490) => {
              try {
                p488("Đang kháng BM");
                const v536 = await fb.getLinkkhangBm(p469.bmId, () => {});
                const v537 = "https://www.facebook.com/checkpoint/1501092823525282/" + v536;
                let v538 = false;
                const vF15 = () => {
                  return new Promise(async (p491, p492) => {
                    try {
                      const v539 = await fetch2(v537);
                      p491(v539.text);
                    } catch {
                      p492();
                    }
                  });
                };
                v538 = await vF15();
                if (v538.includes("UFACContactPointChallengeSubmitCodeState")) {
                  p488("Đang gỡ số điện thoại cũ");
                  const v540 = await fetch2("https://www.facebook.com/api/graphql/", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=d&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=27dx24%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UNSET_CONTACT_POINT%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773"
                  });
                  if (v540.text.includes("UFACContactPointChallengeSetContactPointState")) {
                    v538 = await vF15();
                  } else {
                    p488("Không thể gỡ số điện thoại cũ");
                  }
                }
                if (v538.includes("UFACIntroState")) {
                  const v541 = await fetch2("https://www.facebook.com/api/graphql/", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=a&__hs=20199.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022065618&__s=judlfg%3A1iozd7%3Anjf81i&__hsi=7495651442669989320&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0Z82_CwjE1EEc87m1xwEwgo9oO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0Loco4i5o7G4-5o4q3y1Sx-0luawLyESE6S0B40z8c86-1Fwmk0KU6O1FwlU4i2y1iDzUiBG2OU6G8wLwHwea1ww&__csr=gUyWt9jsy4q24AQh9tFJbH8DnlPjqmWOlAjbtEnN2pApAGq_WBji8TsHKCmiGBByyi6Vdfh29TK9J4Z4maXDWQiJ96lyeqL-q9qgKmpafGmi5ER4y4UZ6zp9okjy9Gxv-VVbAizV9446qEC8Ay4tboizUlBVt1m9D-ii9Gq2abzazopyEK79GFqGp4DhmWyQ69-5o99FECcK9hpEozoCudxiaxu3mFVGxV0HGES4Fk6ob8C5ogDyE9RwxCBXCwDG48gxaibyozK69oOjyU4mUgxybwxCgsxu6Qm4oScwFzEB5DAyu5o8o9oqG3626EeocpEoAU9F9Uco8FojxOUpy-2l4w8Va48cocF88u48do8Ei-8gGbRBUW6E5uuiA1Jwk8hBgd862K5p40CU4K1xg29g1DE1C82Ug4CcU2eQ11g8818kQ0OEbElzy0m98dEbR9Whly4ScQ6obUmBQElxmK1sxh0tU2Qg6J7GiE8obE56iagbUsG1swuoC9wTDzU4e2S5o33zm5988HRa2qbxmfxm020a18whtdoGA0aXw1zS0qF03eS06pMGEbA325802nVw3hU1l3xG1ug626it00Gnw1cG68iwIxa0tm12wqo3Fg1xE0inwDx60qy6oCq3m0cGwhiw4Wwb-0_E1jo1vEzG0h60s12Cm2F04HzSq8gKzwSg1QDAa0uW04V82lwkESfAy8y1rCtyE1MU8UmQ2S7E1fUoxro6S8y5F5J2E8k1uCzEG178Ejkhib2w5G3O8yUix9a321ew5Pw0we8mtyVU3cKjw7bhU0zy2F0Lx60km05IA0blzNFAbA804lU1686m0xo0C4F8x01Ne0zrwBg1r8&__hblpi=01jy0tq07c80v4w2Ho0bvU14o0tdw1eG&__hblpn=01ku0su08kw6Qwso1vE2ywda0Po2WxW1mw41wb-0qi0gu0lq1ewlU0Um1PwjU36w2383wwzwNwxwaG16wdq4o4W0Xo2ywqU2GwxwuElK0iu1mwuoOq15wSw19i0Qo4q1HDwGVUbUlweK1py8eEkw5IwNw8C5UcWwa-3uaDwkouG58y0PEG3GUe8GewtE7t15wgo6a1iw3pU8J0iU22wnU3Oy-3S0yo2HwhE564oeU&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25683&lsd=8RXXshyeBwJKZAe04dI3a2&__spin_r=1022065618&__spin_b=trunk&__spin_t=1745217350&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22PROCEED%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                    method: "POST"
                  });
                  const v542 = v541.text;
                  if (v542.includes("UFACBotCaptchaState")) {
                    v538 = v542;
                  }
                }
                if (v538.includes("UFACBotCaptcha")) {
                  p488("Đang giải captcha");
                  const v543 = v538.match(/(?<=\"text_captcha_audio_url\":\")[^\"]*/g)[0].replace(/\\/g, "").split("https://www.facebook.com/captcha/tfbaudio/?captcha_persist_data=")[1].split("&")[0];
                  const v544 = v538.match(/(?<=\"text_captcha_image_url\":\")[^\"]*/g)[0].replace(/\\/g, "");
                  const v545 = await getBase64(v544);
                  let v546 = false;
                  for (let vLN051 = 0; vLN051 < 3; vLN051++) {
                    if (vLN051 > 0) {
                      p488("Đang thử giải lại captcha");
                    }
                    try {
                      const v547 = await resolveCaptchaImage(p487, v545);
                      const v548 = await fetch2("https://www.facebook.com/api/graphql/", {
                        headers: {
                          accept: "*/*",
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=4&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022100774&__s=96juog%3Ayen3l9%3Al4d5rd&__hsi=7496011361381773931&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gJH7mhgKkQp4jbOTkYjviSSH9Asl-CBFOfjeyjbEgFoyV4tr_JAGABFidaJWQHVptbCy4HhVk-GHFSCjGuhVeHhkejqGRzt2XCAWgTxd5wFAy8C9x-diqla4EK4GXGqEyAeQ9qUKbVo-V6bHBFyUPXzC5oGdDyAax2WzpUyEOmAt3FK5EPHAx64F8lyUlyk49U-qq8ADyUO78ydWxa7Vo88rDyoowZxCquiGBDwKDDAxqmUmx67USnxKEjF1a7Ewwa8CewMGFe48kzKiEcrwwwwyolDwyy8qxudG1hxum265pUjzWwRy8dE9ECEaEpy89oW2a3a6-7Q8DzUS6EvwBCwHBw8u22aJG10yHomx6co1vUC10xqUpw8i6kU4yUow6hg9Ub82qxW18g4rO0ywrofQECWwZg5m2l4sM1pEb64UaQ8yVE4y1_zUuwYwjEbFEb87WU2Ig5LwqU2c-u2249A0EUnxrwNwBwi8gwSgkKibK12BUF0DxNojKEGcjUXLwZwBx648boSEy2N96Dxa8jc3lacxq2u3emczaxym12wdq02jS04C2a4Utg1BE0rnwa60Z-06K-Ekxkb03WpQ1D8i5E07uy0cUwcC5oK96jU0dGU0Ry09sg1n83Jx6E4W7U3g8fwcK36QA9oW0-U7G4U7S0R84EOxd1r80bAw5Nw44w3eGzo4a08Rwboxp84u3uWBw9YU-0iq1Uwfm0PU4q1ExKHhy95elJ1b4p8e5tdaA2ny847yogwwiO0DG1IK0TE0hJVKq360qe0aOw248fpm02uG0iS0n20dAg41wv40EU1aEy0aWy8O0a8xy0i212w5ew17q0ZUz41p1re08Gw3Qja4Q068axd1ro&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25601&lsd=fhrywc0Uq8m42vB0Jc0V5i&__spin_r=1022100774&__spin_b=trunk&__spin_t=1745301150&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SUBMIT_BOT_CAPTCHA_RESPONSE%22%2C%22bot_captcha_persist_data%22%3A%22" + v543 + "%22%2C%22bot_captcha_response%22%3A%22" + v547 + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                        method: "POST"
                      });
                      if (v548.text.includes("UFACContactPointChallengeSetContactPointState")) {
                        v546 = true;
                        break;
                      }
                    } catch (e99) {
                      console.log(e99);
                    }
                  }
                  if (v546) {
                    v538 = await vF15();
                    p488("Giải captcha thành công");
                  } else {
                    p488("Giải captha thất bại");
                  }
                }
                if (v538.includes("UFACContactPointChallengeSetContactPointState")) {
                  let v549 = false;
                  const v550 = p487.general.getPhoneNumber.value || 6;
                  for (let vLN052 = 0; vLN052 < v550; vLN052++) {
                    let v551 = false;
                    let v552 = false;
                    let v553 = false;
                    for (let vLN053 = 0; vLN053 < 6; vLN053++) {
                      v538 = await vF15();
                      if (v538.includes("UFACContactPointChallengeSetContactPointState")) {
                        if (vLN053 > 0) {
                          p488("Đang thử lấy số điện thoại khác");
                        } else {
                          p488("Đang lấy số điện thoại");
                        }
                        try {
                          v551 = await getPhone(p487.general.phoneService.value, p487.general.phoneServiceKey.value);
                          p488("Đang thêm số điện thoại");
                          const v554 = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=6&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=byw56x%3Af6irfb%3Auy904n&__hsi=7496099718108186308&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBximl29k8LolyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EWq6GCxpa5F8S1NxyUO8hUyt6CzpEeeUrxW5oymECjVS4898kwTxmcCye8yryrgoCBypE5S264UkDAKqFErxa250IxGm10wpax7Xwzx6ayotz8vDwBwTyE7yFu0WAU29w8u0HqiiFf85qiOXBgem0QocQ1_81dweOap9Q9EEeVE2QBwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25514&lsd=_YYpny6NWhE3gCtXKXz8RT&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745321722&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SET_CONTACT_POINT%22%2C%22contactpoint%22%3A%22" + v551.number + "%22%2C%22country_code%22%3A%22VN%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                            method: "POST"
                          });
                          if (v554.text.includes("UFACContactPointChallengeSubmitCodeState")) {
                            v552 = true;
                            break;
                          } else {
                            p488("Thêm số điện thoại thất bại");
                          }
                        } catch (e100) {
                          console.log(e100);
                        }
                      } else {
                        break;
                      }
                    }
                    if (v552 && v551) {
                      v538 = await vF15();
                      if (v538.includes("UFACContactPointChallengeSubmitCodeState")) {
                        p488("Đang chờ mã kích hoạt");
                        try {
                          const v555 = await getPhoneCode(p487.general.phoneService.value, p487.general.phoneServiceKey.value, v551.id);
                          p488("Đang nhập mã kích hoạt");
                          const v556 = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=6&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=fgpkub%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SUBMIT_CODE%22%2C%22code%22%3A%22" + v555 + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                            method: "POST"
                          });
                          if (v556.text.includes("UFACImageUploadChallengeState")) {
                            p488("Thêm số điện thoại thành công");
                            v553 = true;
                          }
                        } catch (e101) {
                          console.log(e101);
                        }
                        if (v553) {
                          v549 = true;
                          break;
                        } else {
                          p488("Đang gỡ số điện thoại cũ");
                          const v557 = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            method: "POST",
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=d&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=27dx24%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UNSET_CONTACT_POINT%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773"
                          });
                          if (v557.text.includes("UFACContactPointChallengeSetContactPointState")) {
                            v538 = await vF15();
                          } else {
                            p488("Không thể gỡ số điện thoại cũ");
                          }
                        }
                      }
                    }
                  }
                  if (v549) {
                    v538 = await vF15();
                  }
                }
                if (v538.includes("UFACImageUploadChallengeState")) {
                  p488("Đang tạo ảnh");
                  const v558 = p487.bm.phoiId.value;
                  const v559 = await getLocalStorage("userInfo_" + fb.uid);
                  const v560 = await getLocalStorage(v558);
                  const vO80 = {
                    firstName: v559.first_name,
                    lastName: v559.last_name,
                    fullName: v559.name,
                    birthday: v559.birthday,
                    gender: v559.gender
                  };
                  const vVO80 = vO80;
                  p488("Đang upload ảnh");
                  const v561 = await uploadImage(vVO80, v560, p486, fb.uid, fb.dtsg);
                  if (v561.h) {
                    p488("Upload ảnh thành công");
                    const v562 = await fetch2("https://www.facebook.com/api/graphql/", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=7&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=mnqyan%3Atxdvnc%3Aij1cln&__hsi=7496117124745568398&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxehopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bS5oKEOeCGVoO5ER2WmiaDDULxm4-rxjG8CF39EhWUiy8abxGeCxGFEmixqidwWwSxy48x7y9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9CyE5a264UkDAKqFErxa250IxGm10wpax7Xwzx6ayotz8vDwBwTyE7yFu0WAU29w8u0HqiiFf85qiOXBgem0QocQ1_81dweOap9Q9EEeVE2QBwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25406&lsd=abKxXin_wrpqHu2P6BcjLF&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745325775&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UPLOAD_IMAGE%22%2C%22image_upload_handle%22%3A%22" + v561.h + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                      method: "POST"
                    });
                    if (v562.text.includes("UFACAwaitingReviewState")) {
                      p488("Upload ảnh thành công");
                      v538 = await vF15();
                    }
                  } else {
                    p488("Upload ảnh thất bại");
                  }
                }
                let v563 = false;
                if (v538.includes("UFACAwaitingReviewState")) {
                  v563 = true;
                }
                if (v563) {
                  p488("Kháng BM thành công");
                  p489();
                } else {
                  p488("Kháng BM thất bại");
                  p490();
                }
              } catch (e102) {
                p488("Kháng BM thất bại");
                p490(e102);
              }
            });
          };
          try {
            await vF14(p469.bmId, p470, p493 => {
              const vO81 = {
                message: p493
              };
              p471("message", vO81);
            });
          } catch (e103) {
            console.log(e103);
          }
        }
        if (p470.bm.getLinkkhangBm.value) {
          await fb.getLinkkhangBm(p469.bmId, p494 => {
            const vO82 = {
              message: p494
            };
            p471("message", vO82);
          });
        }
        if (p470.bm.createAdAccount.value) {
          const v564 = p470.bm.numberTkqc.value;
          let vLN054 = 0;
          for (let vLN055 = 0; vLN055 < v564; vLN055++) {
            try {
              p471("message", {
                message: "[" + (vLN055 + 1) + "/" + v564 + "] Đang tạo TKQC"
              });
              const v565 = p470.bm.nameTkqc.value + " " + randomNumberRange(111111, 999999);
              const v566 = p470.bm.timezone2.value;
              const v567 = p470.bm.currency.value;
              if (p470.bm.shareTkqc.value) {
                if (p470.bm.shareBmMode.value === "shareBm") {
                  await fb.createAdAccount2(p469.bmId, v567, v566, v565, p470.bm.shareTkqc.value);
                } else {
                  const v568 = await fb.createAdAccount(p469.bmId, v567, v566, v565);
                  try {
                    p471("message", {
                      message: "Đang share đối tác BM"
                    });
                    await fb.shareDoiTacBm(p469.bmId, v568, p470.bm.shareTkqc.value);
                    p471("message", {
                      message: "Share đối tác BM thành công"
                    });
                  } catch {
                    p471("message", {
                      message: "Share đối tác BM thất bại"
                    });
                  }
                }
              } else {
                await fb.createAdAccount(p469.bmId, v567, v566, v565);
              }
              vLN054++;
            } catch {}
          }
          p471("message", {
            message: "Tạo thành công " + vLN054 + "/" + v564 + " TKQC"
          });
        }
        if (p470.bm.outBm.value) {
          try {
            p471("message", {
              message: "Đang thoát BM"
            });
            await fb.outBm(p469.bmId);
            p471("message", {
              message: "Thoát BM thành công"
            });
          } catch (e104) {
            p471("message", {
              message: "Thoát BM thất bại"
            });
          }
        }
        if (p470.bm.removeQtv.value) {
          try {
            p471("message", {
              message: "Đang xóa QTV"
            });
            let vA20 = [];
            if (p470.bm.removeQtvMode.value === "all") {
              const v569 = await fb.getMainBmAccounts(p469.bmId);
              const v570 = (await fb.getBmAccounts(p469.bmId)).map(p495 => p495.id);
              vA20 = v570.filter(p496 => p496 !== v569.id);
            } else {
              vA20 = p470.bm.listIdAcc.value.split(/\r?\n|\r|\n/g).filter(p497 => p497);
            }
            let vA21 = [];
            if (p470.bm.tutRemoveQtv.value) {
              vA20.forEach(async p498 => {
                vA21.push(fb.removeAccount2(p498, p469.bmId));
              });
            } else {
              vA20.forEach(async p499 => {
                vA21.push(fb.removeAccount(p499, p469.bmId, p470.bm.tutRemoveQtvVerify.value));
              });
            }
            const v571 = await Promise.all(vA21);
            const v572 = v571.filter(p500 => p500);
            p471("message", {
              message: "Đã xóa " + v572.length + "/" + v571.length + " QTV"
            });
          } catch (e105) {
            console.log(e105);
            p471("message", {
              message: "Xóa QTV thất bại"
            });
          }
        }
        if (p470.bm.removeInsta.value) {
          try {
            await fb.removeInsta(p469.bmId, p501 => {
              const vO85 = {
                message: p501
              };
              p471("message", vO85);
            });
          } catch {}
        }
      } catch (e106) {
        console.log(e106);
      }
      const v573 = p470.general.delay.value * 100;
      await delayTime(v573);
      p472();
    });
  }
  function runAds(p502, p503, p504) {
    return new Promise(async (p505, p506) => {
      try {
        if (p503.ads.shareBm.value && p503.ads.idBm.value) {
          try {
            p504("message", {
              message: "Đang share đối tác BM"
            });
            await fb.shareDoiTacBm(p502.bm, p502.adId, p503.ads.idBm.value);
            p504("message", {
              message: "Share đối tác BM thành công"
            });
          } catch {
            p504("message", {
              message: "Share đối tác BM thất bại"
            });
          }
        }
        if (p503.ads.getLinkShareBm.value) {
          try {
            p504("message", {
              message: "Đang lấy link TK BM"
            });
            const v574 = await fetch2("https://business.facebook.com/business_share/genlink/?_callFlowletID=0&_triggerFlowletID=7839", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "asset_id=" + p502.adId + "&task_ids[0]=864195700451909&task_ids[1]=151821535410699&task_ids[2]=610690166001223&task_ids[3]=186595505260379&__usid=6-Tskqg1ja7p7fa%3APskqg221qqzm1d%3A0-Askqe1otiqocg-RV%3D6%3AF%3D&__aaid=0&__bid=" + p502.bm + "&__user=" + fb.uid + "&__a=1&__req=x&__hs=19998.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016986135&__s=zvaspj%3A4hmvwa%3A7nwfik&__hsi=7421184282451569743&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WE9oO1Wxu0zoO12ypUuwg88EeAUpK1vDwFwBgak1EwRwEwiUmwoErorx2aK2a4p8aHwzzXx-ewjoiz9EjCx6221cwjV8rxefzo5G4E5yeDyU52dwywxxOcwMzUkGu3i2WE4e8wpEK4EhzUbVEHyU8U3yDwbm1Lx3wlFbwCwiUWqU9EnxC2u1dxW6U98a85Ou0hi1TwmUaE2mw&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25463&lsd=zLv0FVqVetso47JGZQsVwe&__spin_r=1016986135&__spin_b=trunk&__spin_t=1727879113&__jssesw=1",
              method: "POST"
            });
            const v575 = JSON.parse(v574.text.replace("for (;;);", ""));
            const v576 = v575.payload.tokenlink;
            p504("message", {
              message: "Lấy link TK BM thành công"
            });
            p504("updateShareBmLink", {
              link: p502.account + "|" + p502.adId + "|" + v576
            });
          } catch (e107) {
            p504("message", {
              message: "Lấy link TK BM thất bại"
            });
          }
        }
        if (p503.ads.getLinkXmdtAds.value) {
          try {
            p504("message", {
              message: "Đang lấy link XMDT"
            });
            const v577 = await fb.getLinkXmdtAds(p502.adId);
            p504("message", {
              message: "https://www.facebook.com/checkpoint/1501092823525282/" + v577
            });
          } catch (e108) {
            p504("message", {
              message: "Lấy link XMDT thất bại"
            });
          }
        }
        if (p503.ads.addCard.value) {
          try {
            const vO89 = {
              ...localStorage
            };
            const vVO89 = vO89;
            const v578 = Object.keys(vVO89).filter(p507 => p507.includes("card_")).map(p508 => {
              return JSON.parse(vVO89[p508]);
            }).filter(p509 => p509.count < p503.ads.maxCard.value);
            if (v578.length > 0) {
              let vLN056 = 0;
              for (let vLN057 = 0; vLN057 < v578.length; vLN057++) {
                const v579 = v578[vLN057];
                try {
                  p504("message", {
                    message: "Đang add thẻ " + (vLN057 + 1) + "/" + v578.length
                  });
                  await fb.addCard(p502.adId, v579, p503.ads.addCardMode.value);
                  v579.count = v579.count + 1;
                  await setLocalStorage("card_" + v579.cardNumber, JSON.stringify(v579));
                } catch {}
                await delayTime(2000);
              }
              p504("message", {
                message: "Add thảnh công " + vLN056 + "/" + v578.length + " thẻ"
              });
            } else {
              Swal.fire({
                title: "Hết thẻ",
                icon: "error"
              });
            }
          } catch (e109) {
            console.log(e109);
          }
        }
        if (p503.ads.rename.value) {
          try {
            const v580 = p503.ads.newName.value + " " + randomNumberRange(111111, 999999);
            p504("message", {
              message: "Đang đổi tên TKQC"
            });
            await fb.renameAds(p502.adId, v580, p502.bm ?? false);
            const vO91 = {
              name: v580
            };
            p504("updateAdsName", vO91);
            p504("message", {
              message: "Đổi tên TKQC thành công"
            });
          } catch (e110) {
            p504("message", {
              message: "Đổi tên TKQC thất bại"
            });
          }
        }
        if (p503.ads.addAdmin.value) {
          const v581 = p503.ads.newAdminUid.value;
          await fb.addAdmin(p502.adId, v581);
        }
        if (p503.ads.changeInfo.value) {
          try {
            p504("message", {
              message: "Đang tiến hành đổi thông tin TKQC"
            });
            const v582 = await fb.changeInfoAds(p502.adId, p502.bm, p503.ads.currency.value, p503.ads.timezone.value, p503.ads.country.value);
            const v583 = v582.data.billable_account_update.billable_account.billing_payment_account.billable_account.timezone_info.timezone;
            const v584 = v582.data.billable_account_update.billable_account.billing_payment_account.billable_account.currency;
            const v585 = v582.data.billable_account_update.billable_account.billing_payment_account.billable_account.billable_account_tax_info.business_country_code;
            const vO92 = {
              timezone: v583,
              currency: v584,
              country: v585
            };
            p504("updateAdInfo", vO92);
            p504("message", {
              message: "Đổi thông tin TKQC thành công"
            });
          } catch {
            p504("message", {
              message: "Đổi thông tin TKQC thất bại"
            });
          }
        }
        if (p503.ads.removeAdmin.value) {
          if (p503.ads.removeHidden.value || p503.ads.removeAll.value) {
            try {
              p504("message", {
                message: "Đang check admin ẩn"
              });
              const v586 = await fb.checkHiddenAdmin(p502.adId);
              if (v586.length > 0) {
                let vLN058 = 0;
                p504("message", {
                  message: "Đang xóa " + v586.length + " admin ẩn"
                });
                for (let vLN059 = 0; vLN059 < v586.length; vLN059++) {
                  try {
                    const v587 = v586[vLN059];
                    await fb.removeAdsUser(p502.adId, v587);
                    vLN058++;
                  } catch {}
                  await delayTime(2000);
                }
                p504("message", {
                  message: "Đã xóa " + vLN058 + "/" + v586.length + " admin ẩn"
                });
              } else {
                p504("message", {
                  message: "Tài khoản không có admin ẩn"
                });
              }
            } catch (e111) {
              console.log(e111);
              p504("message", {
                message: "Check admin ẩn thất bại"
              });
            }
          }
          if (p503.ads.removeAll.value) {
            try {
              const v588 = (await fb.getAdsUser(p502.adId)).map(p510 => p510.id).filter(p511 => p511 != fb.uid);
              p504("message", {
                id: p502.id,
                message: "Đang xóa " + v588.length + " admin"
              });
              if (v588.length > 0) {
                let vLN060 = 0;
                for (let vLN061 = 0; vLN061 < v588.length; vLN061++) {
                  try {
                    const v589 = v588[vLN061];
                    await fb.removeAdsUser(p502.adId, v589);
                    vLN060++;
                  } catch {}
                  await delayTime(2000);
                }
                p504("message", {
                  message: "Đã xóa " + vLN060 + "/" + v588.length + " admin"
                });
              } else {
                p504("message", {
                  message: "Không có admin để xóa"
                });
              }
            } catch (e112) {
              console.log(e112);
              p504("message", {
                message: "Xóa admin thất bại"
              });
            }
          }
        }
        if (p503.ads.openAccount.value) {
          try {
            p504("message", {
              message: "Đang mở tài khoản đóng"
            });
            const v590 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_callFlowletID=18346&_triggerFlowletID=18346", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + fb.uid + "&__usid=6-Tsiihnw11hpto%3APsiihtk109469w%3A6-Asiihnj12ho3fs-RV%3D6%3AF%3D&__aaid=" + p502.adId + "&__user=" + fb.uid + "&__a=1&__req=3g&__hs=19955.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1015817109&__s=uycjpn%3A0qjxqj%3Agpf0dv&__hsi=7405163225546256284&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF9UhK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8tKU-4U-UG7F8a898vCxeq4qz8gwDzElx63Si6UjzUS324UGaxa2h2ppEryrhUK5Ue8Su6Ey3maUjxy-dxiFAm9KcyoC2GZ3UC2C8ByoF1a58gx6bxa4oOE88ymqaUF1d3Eiwg8KawrVV-i782bByUeoQwox3UO364GJe2q3KfzFLxny9onxDwBwXx67HxtBxO64uWg-26q2au5onADzEHDUK54VoC12ype2C5ElhbAwAK4kUy2iijDix68VUOay8cHg&__csr=&__comet_req=25&fb_dtsg=" + fb.dtsg + "&jazoest=25565&lsd=iSli2Z4VHvPLUDYdOtGjjY&__spin_r=1015817109&__spin_b=trunk&__spin_t=1724148920&__jssesw=1&qpl_active_flow_ids=270212559&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingReactivateAdAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22" + p502.adId + "%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A20%2C%22logging_id%22%3A%222010198813%22%7D%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22power_editor%22%2C%22external_flow_id%22%3A%22%22%2C%22target_name%22%3A%22BillingReactivateAdAccountMutation%22%2C%22user_session_id%22%3A%22upl_1724148923135_c91b3d7d-9636-4100-9fe7-67c777aebd47%22%2C%22wizard_config_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_screen_name%22%3A%22reactivate_ad_account_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1724148923135_a9b1bd0f-3165-46b6-869f-db73f57171f8%22%2C%22wizard_state_name%22%3A%22reactivate_ad_account_state_display%22%7D%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22client_mutation_id%22%3A%226%22%7D%7D&server_timestamps=true&doc_id=9984888131552276&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270212559%22%5D"
            });
            const v591 = v590.text;
            if (v591.includes("ADMARKET_ACCOUNT_STATUS_ACTIVE")) {
              p504("message", {
                message: "Đã mở tài khoản đóng"
              });
            } else {
              p504("message", {
                message: "Không thể mở tài khoản đóng"
              });
            }
          } catch (e113) {
            p504("message", {
              message: "Không thể mở tài khoản đóng"
            });
          }
        }
      } catch (e114) {
        console.log(e114);
      }
      const v592 = p503.general.delay.value * 100;
      await delayTime(v592);
      p505();
    });
  }
  function runPage(p512, p513, p514) {
    return new Promise(async (p515, p516) => {
      try {
        await fb.switchPage(p512.pageId2);
        const v593 = await fb.getPageData(p512.pageId);
        if (p513.page.renamePage.value) {
          try {
            const v594 = p513.page.newName.value + " " + randomNumberRange(111111, 999999);
            console.log(v594);
            p514("message", {
              message: "Đang đổi tên page"
            });
            await fb.renamePage(p512.pageId, v594);
            const vO97 = {
              name: v594
            };
            p514("updatePageName", vO97);
            p514("message", {
              message: "Đổi tên page thành công"
            });
          } catch (e115) {
            p514("message", {
              message: "Đổi tên page thất bại"
            });
          }
        }
        if (p513.page.sharePage.value) {
          try {
            const v595 = p513.page.targetId.value;
            p514("message", {
              message: "Đang share page"
            });
            const v596 = await fb.sharePage(p512.pageId2, v595, v593);
            console.log(v596);
            p514("message", {
              message: "Share page thành công"
            });
          } catch (e116) {
            p514("message", {
              message: "Share page thất bại"
            });
          }
        }
        await fb.switchToMain();
      } catch (e117) {
        console.log(e117);
      }
      const v597 = p513.general.delay.value * 100;
      await delayTime(v597);
      p515();
    });
  }
  function runTool(p517, p518, p519) {
    return new Promise(async (p520, p521) => {
      try {
        alert("ccc");
      } catch (e118) {
        p521(e118);
      }
    });
  }
  function start(p522, p523) {
    const v598 = $("#app").attr("data");
    let v599 = p523.general.limit.value;
    let vA22 = [];
    let v600 = false;
    const vF16 = async function (p524) {
      if (!vA22.includes(p524)) {
        const v601 = p522.findIndex(p525 => p525.id === p524);
        const v602 = p522[v601];
        $(document).trigger("running", [v602.id]);
        const vO100 = {
          id: v602.id,
          message: ""
        };
        $(document).trigger("message", [vO100]);
        p522[v601].process = "RUNNING";
        vA22.push(v602.id);
        try {
          if (v598 === "bm") {
            await runBm(v602, p523, (p526, p527) => {
              const vO101 = {
                id: v602.id,
                ...p527
              };
              $(document).trigger(p526, [vO101]);
            });
          } else if (v598 === "page") {
            await runPage(v602, p523, (p528, p529) => {
              const vO102 = {
                id: v602.id,
                ...p529
              };
              $(document).trigger(p528, [vO102]);
            });
          } else if (v598 === "tool") {
            await runTool(v602, p523, (p530, p531) => {
              const vO103 = {
                id: v602.id,
                ...p531
              };
              $(document).trigger(p530, [vO103]);
            });
          } else {
            await runAds(v602, p523, (p532, p533) => {
              const vO104 = {
                id: v602.id,
                ...p533
              };
              $(document).trigger(p532, [vO104]);
            });
          }
        } catch {}
        $(document).trigger("finished", [v602.id]);
        p522[v601].process = "FINISHED";
      }
    };
    let vSetInterval = setInterval(async () => {
      const v603 = p522.filter(p534 => {
        return p534.process == "RUNNING";
      });
      const v604 = p522.filter(p535 => {
        return p535.process !== "FINISHED" && p535.process !== "RUNNING";
      });
      const v605 = p522.filter(p536 => {
        return p536.process !== "FINISHED";
      });
      if (!v600) {
        if (v605.length > 0) {
          if (v603.length < v599) {
            if (v604.length > 0) {
              const v606 = v599 - v603.length;
              const v607 = v604.slice(0, v606);
              for (let vLN062 = 0; vLN062 < v607.length; vLN062++) {
                if (!v600) {
                  vF16(v607[vLN062].id);
                }
              }
            }
          }
        } else {
          clearInterval(vSetInterval);
          $(document).trigger("stopped");
        }
      } else if (v603.length === 0) {
        clearInterval(vSetInterval);
        $(document).trigger("stopped");
      }
    }, 500);
    $(document).on("stop", function (p537) {
      v600 = true;
    });
  }
  function nhanLink(p538) {
    return new Promise(async (p539, p540) => {
      const v608 = await saveSetting();
      console.log(v608);
      await fetch2("https://m.facebook.com/password/reauth/?next=https%3A%2F%2Fmbasic.facebook.com%2Fsecurity%2F2fac%2Fsettings%2F%3Fpaipv%3D0%26eav%3DAfZfmwJnXhbeLP6m-giW1oCoZD0faAw6x_1LxHqf1nvS-tew9Vl6iEkBMuwwPNYH7Zw&paipv=0&eav=AfbC-ToI9zgklrUncTH4S-pXjfy5d5SPf9ZLf_iWIHepbPFg8mMnmmsnW0Or3AkCflI", {
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "content-type": "application/x-www-form-urlencoded"
        },
        body: "fb_dtsg=" + fb.dtsg + "&jazoest=25494&encpass=#PWD_BROWSER:0:1111:" + v608.bm.nhanLinkPassword.value,
        method: "POST"
      });
      let v609 = false;
      const v610 = v608.general.limit.value;
      $(document).on("stop", function (p541) {
        v609 = true;
      });
      let vA23 = [];
      let vLN063 = 0;
      for (let vLN064 = 0; vLN064 < 999; vLN064++) {
        let v611 = p538.filter(p542 => !vA23.includes(p542));
        if (v611.length > 0 && !v609) {
          v611 = v611.slice(0, v610);
          const vA24 = [];
          const vA25 = [];
          const vA26 = [];
          for (let vLN065 = 0; vLN065 < v611.length; vLN065++) {
            if (!v609) {
              const vF17 = p543 => {
                return new Promise(async (p544, p545) => {
                  setTimeout(p544, 120000);
                  try {
                    let vLS16 = "";
                    vA23.push(v611[vLN065]);
                    if (!v611[vLN065].includes("|")) {
                      vLS16 = v611[vLN065];
                    } else {
                      vLS16 = v611[vLN065].split("|")[1];
                    }
                    $(document).trigger("checkProcess", ["<strong>[" + vA23.length + "/" + p538.length + "]</strong> Đang nhận link: <strong>" + vLS16 + "</strong>"]);
                    const v612 = await fetch2(vLS16);
                    const v613 = decodeURIComponent(v612.url).replace("https://business.facebook.com/business/loginpage/?next=", "");
                    if (v613.includes("https://business.facebook.com/invitation/?token=")) {
                      const v614 = new URL(v613).searchParams;
                      const v615 = v614.get("token");
                      const v616 = await fetch2("https://business.facebook.com/business/invitation/login/", {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        method: "POST",
                        body: "first_name=" + p543 + "&last_name=" + randomNumberRange(11111, 99999) + "&invitation_token=" + v615 + "&receive_marketing_messages=false&user_preferred_business_email&__user=" + fb.userInfo.id + "&__a=1&__req=2&__hs=19664.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009675755&__s=voml6w%3Aorwnqa%3A3cyaaa&__hsi=7297248857485608221&__dyn=7xeUmwkHgydwn8K2WnFwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3Bw5VCwjE3awbG78b87C1xwEwlU-0nS4o5-1uwbe2l0Fwwwi85W0_Ugw9KfwbK0RE5a1qwqU8E5W0HUvw5rwSxy0gq0Lo6-1FwbO0NE1rE&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25503&lsd=VjWEsSvVwDyPvLUmreGFgG&__spin_r=1009675755&__spin_b=trunk&__spin_t=1699023148&__jssesw=1"
                      });
                      const v617 = v616.text;
                      if (v617.includes("\"payload\":null") && !v617.includes("error")) {
                        vLN063++;
                        vA25.push(v611[vLN065]);
                      } else {
                        vA26.push(v611[vLN065]);
                      }
                    } else {
                      vA26.push(v611[vLN065]);
                    }
                  } catch (e119) {
                    console.log(e119);
                    vA26.push(v611[vLN065]);
                  }
                  p544();
                });
              };
              vA24.push(vF17(v608.bm.nhanLinkName.value));
            } else {
              break;
            }
          }
          await Promise.all(vA24);
          if (vA23.length > 0) {
            $(document).trigger("updateLinkAll", [vA23]);
          }
          if (vA26.length > 0) {
            $(document).trigger("updateLinkError", [vA26]);
          }
          if (vA25.length > 0) {
            $(document).trigger("updateLinkSuccess", [vA25]);
          }
        } else {
          break;
        }
      }
      $(document).trigger("checkProcess", ["Nhận thành công: <strong>" + vLN063 + "/" + p538.length + "</strong> link"]);
      await delayTime(3000);
      p539();
    });
  }
  function promiseLimit(p546, p547, p548) {
    return new Promise(async (p549, p550) => {
      const v618 = p547.length;
      const v619 = Math.ceil(v618 / p546);
      const vA27 = [];
      const vF18 = (p551, p552) => {
        return new Promise(async (p553, p554) => {
          try {
            const v620 = await fetch2("https://graph.facebook.com/" + p551 + "?access_token=" + fb.accessToken + "&_reqName=object:brand&_reqSrc=BrandResourceRequests.brands&date_format=U&fields=%5B%22allow_page_management_in_www,verification_status,name%22%5D");
            const v621 = v620.json;
            v621.linkStatus = "";
            try {
              const v622 = await saveSetting();
              if (v622.bm.checkLink.value) {
                const v623 = await fetch2(p552);
                const v624 = decodeURIComponent(v623.url).replace("https://business.facebook.com/business/loginpage/?next=", "");
                const v625 = new URL(v624).searchParams;
                const v626 = v625.get("token");
                const v627 = await fetch2("https://business.facebook.com/invitation/?token=" + v626 + "&chosen_account_type=1&biz_login_source=biz_unified_f3_fb_login_button");
                const v628 = v627.text;
                if (v628.includes("Sorry, this content isn't available right now")) {
                  v621.linkStatus = "Die";
                } else {
                  v621.linkStatus = "Live";
                }
              }
            } catch {}
            v621.link = p552;
            p553(v621);
          } catch {
            p554();
          }
        });
      };
      try {
        const v629 = await saveSetting();
        if (v629.bm.checkLink.value) {
          await fetch2("https://m.facebook.com/password/reauth/?next=https%3A%2F%2Fmbasic.facebook.com%2Fsecurity%2F2fac%2Fsettings%2F%3Fpaipv%3D0%26eav%3DAfZfmwJnXhbeLP6m-giW1oCoZD0faAw6x_1LxHqf1nvS-tew9Vl6iEkBMuwwPNYH7Zw&paipv=0&eav=AfbC-ToI9zgklrUncTH4S-pXjfy5d5SPf9ZLf_iWIHepbPFg8mMnmmsnW0Or3AkCflI", {
            headers: {
              accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "fb_dtsg=" + fb.dtsg + "&jazoest=25494&encpass=#PWD_BROWSER:0:1111:" + v629.bm.nhanLinkPassword.value,
            method: "POST"
          });
        }
      } catch {}
      for (let vLN066 = 0; vLN066 < v619; vLN066++) {
        try {
          const v630 = vLN066 * p546;
          const v631 = (vLN066 + 1) * p546;
          const v632 = p547.slice(v630, v631);
          const vA28 = [];
          for (let vLN067 = 0; vLN067 < v632.length; vLN067++) {
            vA28.push(vF18(v632[vLN067].id, v632[vLN067].link));
          }
          vA27.push(...(await Promise.all(vA28)));
        } catch {}
        await delayTime(p548 * 100);
      }
      p549(vA27);
    });
  }
  function getInfoBm(p555, p556, p557) {
    return new Promise(async (p558, p559) => {
      p558(await promiseLimit(p556, p555, p557));
    });
  }
  function getIdBm() {
    return new Promise(async (p560, p561) => {
      const v633 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?fields=id&limit=9999999&access_token=" + fb.accessToken);
      const v634 = v633.json;
      const v635 = v634.data.map(p562 => p562.id);
      $(document).trigger("updateListBm", [v635]);
      p560();
    });
  }
  function createBm() {
    return new Promise(async (p563, p564) => {
      const v636 = await saveSetting();
      const v637 = v636.bm.bmNumber.value;
      const v638 = v636.bm.createBmMode.value;
      if (v638 === "350") {
        $(document).trigger("checkProcess", ["Đang tạo BM350"]);
      }
      if (v638 === "50") {
        $(document).trigger("checkProcess", ["Đang tạo BM50"]);
      }
      if (v638 === "over") {
        $(document).trigger("checkProcess", ["Đang tạo BM cổng over"]);
      }
      let vLN068 = 0;
      for (let vLN069 = 0; vLN069 < v637; vLN069++) {
        try {
          const v639 = v636.bm.bmName.value + " " + randomNumberRange(11111, 99999);
          await fb.createBm(v638, v639);
          vLN068++;
        } catch {}
        await delayTime(2000);
      }
      $(document).trigger("checkProcess", ["Đã tạo thành công " + vLN068 + "/" + v637 + " BM"]);
      await delayTime(2000);
      p563();
    });
  }
  function createPage() {
    return new Promise(async (p565, p566) => {
      const v640 = await saveSetting();
      const v641 = v640.page.pageName.value + " " + randomNumberRange(11111, 99999);
      const v642 = v640.page.pageNumber.value;
      let vLN070 = 0;
      for (let vLN12 = 1; vLN12 <= v642; vLN12++) {
        try {
          await fb.createPage(v641);
          vLN070++;
        } catch {}
        await delayTime(3000);
      }
      $(document).trigger("checkProcess", ["Tạo thành công " + vLN070 + "/" + v642 + " Page"]);
      await delayTime(2000);
      p565();
    });
  }
  function acceptPage() {
    return new Promise(async (p567, p568) => {
      const v643 = await saveSetting();
      let v644 = false;
      const v645 = v643.general.limit.value;
      $(document).on("stop", function (p569) {
        v644 = true;
      });
      const vA29 = [];
      let vLN071 = 0;
      await fb.switchToMain();
      const v646 = await fb.getInvites();
      for (let vLN072 = 0; vLN072 < v646.length; vLN072++) {
        if (!v644) {
          const vF19 = () => {
            return new Promise(async (p570, p571) => {
              try {
                await fb.acceptPage(v646[vLN072]);
                vLN071++;
              } catch (e120) {}
              p570();
            });
          };
          vA29.push(vF19());
        } else {
          break;
        }
      }
      await Promise.all(vA29);
      $(document).trigger("checkProcess", ["Chấp nhận thành công: <strong>" + vLN071 + "/" + v646.length + "</strong> page"]);
      await delayTime(3000);
      p567();
    });
  }
  function login(p572) {
    return new Promise(async (p573, p574) => {
      try {
        let v647 = false;
        let vLS17 = "";
        for (let vLN073 = 0; vLN073 < 5; vLN073++) {
          try {
            await emptyCookie();
            const v648 = p572.split("|");
            const v649 = v648[0];
            const v650 = v648[1];
            const v651 = v648[2];
            const v652 = await fetch2("https://www.facebook.com/");
            const v653 = v652.text;
            const v654 = v653.split("[\"_js_datr\",\"")[1].split("\",")[0];
            await setCookie("datr=" + v654 + ";");
            const v655 = v653.split("name=\"jazoest\" value=\"")[1].split("\" autocomplete=\"off\"")[0];
            const v656 = v653.split("name=\"lsd\" value=\"")[1].split("\" autocomplete=\"off\"")[0];
            const v657 = await fetch2("https://www.facebook.com/login/?privacy_mutation_token=eyJ0eXBlIjowLCJjcmVhdGlvbl90aW1lIjoxNzI2OTgwODgwLCJjYWxsc2l0ZV9pZCI6MzgxMjI5MDc5NTc1OTQ2fQ%3D%3D&next", {
              headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "jazoest=" + v655 + "&lsd=" + v656 + "&email=" + v649 + "&login_source=comet_headerless_login&next=&encpass=#PWD_BROWSER:0:1111:" + v650,
              method: "POST"
            });
            const v658 = v657.url;
            if (v658.includes("two_factor/")) {
              const v659 = v658.split("?encrypted_context=")[1].split("&flow=")[0];
              const v660 = await fetch2(v658);
              const v661 = v660.text;
              const v662 = v661.match(/(?<=\"async_get_token\":\")[^\"]*/g)[0];
              const v663 = await fetch2("https://api.code.pro.vn/2fa/v1/get-code?secretKey=" + v651);
              const v664 = v663.json;
              const v665 = await fetch2("https://www.facebook.com/api/graphql/", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=0&__aaid=0&__user=0&__a=1&__req=4&__hs=19988.HYP%3Acomet_plat_default_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016700928&__s=1uhzir%3Azta2du%3Acgvxrx&__hsi=7417333130652066369&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65wce0yE7i0n24o5-0Bo7O2l0Fwqo31w9O1lwlEjwae4UaEW0LobrwmE2eU5O0GpovU1modEGdw46wbS1LwTwNwLweq1Iwqo4eEgwro2PxW1owmU&__csr=nf7tkOEgFqLiiDFaQil4yEGm8nKrJi6yk4Ea8ymqeCHzp8yfwGAwj8yq2e4K9xe10wJDw-G3K1Zwh8bUhzVk1ew8q16y8e862dwMgS1LwdK1wwo83kw8W0jm018Tw29U01GtK0gV00nSS5o1wo0RB0288&__comet_req=1&fb_dtsg=" + v662 + "&jazoest=" + v655 + "&lsd=" + v656 + "&__spin_r=1016700928&__spin_b=trunk&__spin_t=1726982447&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useTwoFactorLoginValidateCodeMutation&variables=%7B%22code%22%3A%7B%22sensitive_string_value%22%3A%22" + v664.code + "%22%7D%2C%22method%22%3A%22TOTP%22%2C%22flow%22%3A%22TWO_FACTOR_LOGIN%22%2C%22encryptedContext%22%3A%22" + v659 + "%22%2C%22maskedContactPoint%22%3Anull%7D&server_timestamps=true&doc_id=7404767032917067",
                method: "POST"
              });
              const v666 = v665.text;
              if (v666.includes("\"is_code_valid\":true")) {
                v647 = true;
                break;
              }
            } else if (v658.includes("www_first_password_failure")) {
              vLS17 = "Sai mật khẩu";
              break;
            }
          } catch (e121) {
            await delayTime(2000);
          }
        }
        if (v647) {
          p573();
        } else {
          p574(vLS17);
        }
      } catch (e122) {
        console.log(e122);
        p574("Đăng nhập thất bại");
      }
    });
  }
  function loginBasic(p575) {
    return new Promise(async (p576, p577) => {
      let v667 = false;
      let vLS18 = "";
      let vLS19 = "";
      try {
        const v668 = p575.split("|");
        const v669 = v668[0];
        const v670 = v668[1];
        const v671 = v668[2];
        const v672 = await fetch2("https://mbasic.facebook.com/login/?ref=dbl&fl&login_from_aymh=1");
        const v673 = v672.text;
        const v674 = $.parseHTML(v673);
        let v675 = $(v674).find("input[name=\"lsd\"]").val();
        let v676 = $(v674).find("input[name=\"fb_dtsg\"]").val();
        let v677 = $(v674).find("input[name=\"m_ts\"]").val();
        let v678 = $(v674).find("input[name=\"jazoest\"]").val();
        let v679 = $(v674).find("input[name=\"li\"]").val();
        if (v677 && v678 && v679) {
          const v680 = await fetch2("https://mbasic.facebook.com/login/device-based/regular/login/?refsrc=deprecated&lwv=100&refid=8", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "fb_dtsg=" + v676 + "&lsd=" + v675 + "&jazoest=" + v678 + "&m_ts=" + v677 + "&li=" + v679 + "&try_number=0&unrecognized_tries=0&email=" + v669 + "&pass=" + v670 + "&login=%C4%90%C4%83ng+nh%E1%BA%ADp&bi_xrwh=0",
            method: "POST"
          });
          const v681 = v680.text;
          const v682 = $.parseHTML(v681);
          if ($(v682).find("#approvals_code").length) {
            const v683 = await fetch2("https://api.code.pro.vn/2fa/v1/get-code?secretKey=" + v671);
            const v684 = v683.json;
            if (v684.code) {
              v676 = $(v682).find("input[name=\"fb_dtsg\"]").val();
              const v685 = $(v682).find("input[name=\"nh\"]").val();
              if (v685) {
                const v686 = await fetch2("https://mbasic.facebook.com/login/checkpoint/", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "fb_dtsg=" + v676 + "&jazoest=" + v678 + "&checkpoint_data=&approvals_code=" + v684.code + "&codes_submitted=0&submit%5BSubmit+Code%5D=G%E1%BB%ADi+m%C3%A3&nh=" + v685 + "&fb_dtsg=" + v676 + "&jazoest=" + v678,
                  method: "POST"
                });
                vLS19 = v686.url;
                const v687 = v686.text;
                if (v687.includes("value=\"save_device\"")) {
                  v667 = true;
                }
              }
            }
          } else if (v680.url.includes("e=1348131") || v680.url.includes("e=1348092")) {
            vLS18 = "Sai mật khẩu";
          }
        }
      } catch (e123) {
        console.log(e123);
      }
      if (v667) {
        p576(vLS19);
      } else {
        p577(vLS18);
      }
    });
  }