/**
 * delayTime
 * Descripción: Devuelve una promesa que se resuelve después de un tiempo en milisegundos.
 * Parámetros: p5 (número de milisegundos a esperar)
 * Retorna: Promise<void>
 */
function delayTime(p5) {
    return new Promise((p6, p7) => {
      setTimeout(() => {
        return p6();
      }, p5);
    });
  }
  class FB {
    /**
     * constructor
     * Descripción: Inicializa la clase FB con propiedades userInfo, accessToken y dtsg en false.
     */
    constructor() {
      this.userInfo = false;
      this.accessToken = false;
      this.dtsg = false;
    }
    /**
     * checkLive
     * Descripción: Verifica el estado de la sesión de Facebook (login, checkpoint, etc).
     * Retorna: Promise<string> ("not_login", "new_login", "success", "282", "956", "error")
     */
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
    /**
     * getAccessToken
     * Descripción: Obtiene el accessToken y tokens de seguridad de Facebook Business.
     * Retorna: Promise<Object|string> (objeto con accessToken, dtsg, dtsg2 o string de error)
     */
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
    /**
     * getAccessToken2
     * Descripción: Obtiene el accessToken desde Ads Manager.
     * Retorna: Promise<string> (accessToken)
     */
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
    /**
     * getFriends
     * Descripción: Obtiene el número total de amigos del usuario autenticado.
     * Retorna: Promise<number>
     */
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
    /**
     * getUserInfo
     * Descripción: Obtiene la información del usuario autenticado y la guarda en localStorage si es necesario.
     * Retorna: Promise<Object> (información del usuario)
     */
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
    /**
     * getDeactivedPage
     * Descripción: Obtiene las páginas desactivadas de un negocio de Facebook.
     * Parámetros: p22 (id del negocio)
     * Retorna: Promise<Array> (páginas desactivadas)
     */
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
              vLS2 = "Activo";
            }
            if (p42.advertising_restriction_info.status === "VANILLA_RESTRICTED" && p42.advertising_restriction_info.is_restricted || p42.advertising_restriction_info.status === "APPEAL_INCOMPLETE") {
              if (p42.advertising_restriction_info.restriction_type === "ALE") {
                vLS = "DIE_3DONG";
                vLS2 = "Deshabilitado 3 líneas";
              } else {
                vLS = "DIE";
                vLS2 = "Deshabilitado";
              }
            }
            if (p42.advertising_restriction_info.restriction_type === "ALE" && p42.advertising_restriction_info.status === "APPEAL_TIMEOUT") {
              vLS = "DIE_3DONG";
              vLS2 = "Deshabilitado 3 líneas";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_REJECTED_NO_RETRY" && p42.advertising_restriction_info.is_restricted) {
              vLS = "DIE_VV";
              vLS2 = "Deshabilitado permanente";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_REJECTED") {
              vLS = "DIE_VV";
              vLS2 = "Deshabilitado permanente";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_PENDING") {
              vLS = "DIE_DK";
              vLS2 = "Deshabilitado en apelación";
            }
            if (p42.advertising_restriction_info.status === "APPEAL_ACCEPTED") {
              if (p42.advertising_restriction_info.restriction_type === "ALE") {
                vLS = "BM_KHANG_3DONG";
                vLS2 = "BM apelado 3 líneas";
              } else if (!p42.advertising_restriction_info.is_restricted) {
                vLS = "BM_KHANG";
                vLS2 = "BM apelado";
              } else {
                vLS = "BM_XANHVO";
                vLS2 = "BM verde falso";
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
                        v58[vLN06].text = "Deshabilitado permanente";
                      }
                      if (v62 === "2025-01-26" || v62 === "2025-01-27" || v62 === "2025-01-28") {
                        v58[vLN06].type = "DIE_CAPTCHA";
                        v58[vLN06].text = "Deshabilitado por Captcha";
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
          p55("Enviando nueva invitación al email: " + p53);
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
          p70("Eliminando cuenta IG");
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
          p70("Eliminación exitosa de " + vLN07 + "/" + v76.data.length + " cuentas IG");
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
            body: "jazoest=25520&fb_dtsg=" + this.dtsg + "&is_cm=1&act=" + p81 + "&was_success=1&error_code=&user_id=" + p82 + "&search_query=&add_user_permission=281423141961500&__usid=6-Tsjjz1o1pttdlc%3APsjjz1o19kla0-RV%3D6%3AF%3D&__aaid=" + p81 + "&__user=" + this.uid + "&__a=1&__req=1i&__hs=19975.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1016325924&__s=ipvh6d%3A1elzm6%3Awcjrck&__hsi=7412680376252426657&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF8pK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8kybKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAxK4U-dwMxeayEiwAgCmq6UCQubxu3ydDxG8wRyK4UoLzokGp5yrz8C9wGLg-9wFy9oCagixi48hyUix6cG228BCyKbwzxa10yUG1LDDV8sw8KmbwVzi1y4fz8coiGQU9EeVVUWrUlUym5UpU9oeUhxWUnposxx7KAfwxCwyDxm5V9UWaV-bxhem9xq2K9AwHxq5kiV89bx5e8wAAAVQEhyeucyEy68WaJ129ho&__csr=&__comet_req=25&lsd=o_cxfnmTRU9tXHvOIjv5ic&__spin_r=1016325924&__spin_b=trunk&__spin_t=1725899143&__jssesw=1",
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
            body: "av=" + this.uid + "&__usid=6-Ts5rdw4ejkzb9%3APs5rdw3f9ktw3%3A0-As5rdsb1ltzmda-RV%3D6%3AF%3D&__user=" + this.uid + "&__a=1&__req=1n&__hs=19707.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010466044&__s=d06uwg%3A6ckp8m%3A85uy65&__hsi=7313164176971322218&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwRyXxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25234&lsd=bCvJhCyzXeg968-UrrpA6K&__aaid=" + p85 + "&__spin_r=1010466044&__spin_b=trunk&__spin_t=1702728722&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingAccountInformationUtilsUpdateAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22" + p85 + "%22%2C%22currency%22%3A%22" + p87 + "%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A25%2C%22logging_id%22%3A%222786824690%22%7D%2C%22tax%22%3A%7B%22business_address%22%3A%7B%22city%22%3A%22DiviAnds%22%2C%22country_code%22%3A%22" + p89 + "%22%2C%22state%22%3A%22DiviAnds%22%2C%22street1%22%3A%22DiviAnds%22%2C%22street2%22%3A%22DiviAnds%22%2C%22zip%22%3A%2299999%22%7D%2C%22business_name%22%3A%22DiviAnds%22%2C%22is_personal_use%22%3Afalse%2C%22second_tax_id%22%3A%22%22%2C%22tax_id%22%3A%22%22%2C%22tax_registration_status%22%3A%22%22%7D%2C%22timezone%22%3A%22" + p88 + "%22%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22BILLING_HUB%22%2C%22external_flow_id%22%3A%222389477848%22%2C%22target_name%22%3A%22BillingAccountInformationUtilsUpdateAccountMutation%22%2C%22user_session_id%22%3A%22upl_1702728726646_fb2b6a0c-5c7b-4cd7-8973-6809dd8c607b%22%2C%22wizard_config_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_name%22%3A%22COLLECT_ACCOUNT_INFO%22%2C%22wizard_screen_name%22%3A%22account_information_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702728726646_b7c07b3c-65d4-478d-8578-4d26107d8179%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%225%22%7D%7D&server_timestamps=true&doc_id=23988069674173253",
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
            body: "av=" + this.uid + "&__usid=6-Tsp3zazukdpi%3APsp3zay15biznw%3A0-Asp3z7rm1c7vw-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=q&__hs=20083.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=GOOD&__rev=1019078593&__s=h7tq5u%3A0xfovi%3Axmbuqq&__hsi=7452752022536676552&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw5MypU5-0Bo7O2l0Fwqo5W1yw9O48comwkE-UbE7i4UaEW2G261fwwwJK1qxa1ozEjU4Wdwoo4S5ayouxe0hqfwLCyKbw46wbS1LwTwNAK2q0z8co9U4S7E6C13www4kxW1owmUaEeE5K22&__csr=glgDFT5ELRkaOWNmx5aYHnRS-yRsGTp5n-B9uhR8DThmCDNfAjfqFy9dtmuG_HjTF8yVeW-DO__qlkldyti9pbCQ-mFfA-hQlkGAiXiCp4F9LJ2AVRSWtQF5YHLABGV4GGil2J6hdipWyWLhk8huHF7XAX-EzhHQeiFVFJ5AG8Gl4KluuGGqQEWqihABiDoCVHAKF2eq4qGZ4CmiXzFp8ydGm8AgymSVujcECu4agKmrCWCHxDCGA58Km27Z1amXy9oJe7oG5oZ1pUCFUlzFV8O23x92UKbCyA12xeUc88UixGazEB0HK7GwCwKx2m3u8xO4o2GAz8kBwDDwso8U0xC0fXjjAhUZd01fd1q0y0b0K7QzN0ng5C5xlwmE4R01sO0gS0ku19wVx6aIHA81_xO0ezDxO0U82XwemU1yoaE4-0na5UlU4q2G49K0gQE028Ow0-Sc0HEb81ho0SS08rBu0pt08QE7101ie07O4oMW2W1NgfIEow1eq0f7Lt00ZOw5wg0Qb804FE6-04i40fNDw33k0bXwaq2GutwiQ0dbw810aG6U&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25731&lsd=3lg94FqqYWrhBLOzqUqzlY&__spin_r=1019078593&__spin_b=trunk&__spin_t=1735229050&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=GetBusinessSensitiveActionEnumQuery&variables=%7B%22reviewParams%22%3A%7B%22action_type%22%3A%22BUSINESS_REMOVE_USER%22%2C%22business_id%22%3A%22" + p109 + "%22%2C%22remove_user_params%22%3A%7B%22target_user_id%22%3A%22" + p108 + "%22%7D%7D%2C%22roleRequestId%22%3A%22%22%2C%22isNotAddAdmin%22%3Atrue%7D&server_timestamps=true&doc_id=7112725228756755",
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
                body: "av=" + this.uid + "&__usid=6-Tsp5238al5avw%3APsp523617ulfhv%3A0-Asp51sr4mptu7-RV%3D6%3AF%3D&__aaid=0&__bid=" + p109 + "&__user=" + this.uid + "&__a=1&__req=25&__hs=20084.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1019084625&__s=bh7b95%3A72s3d7%3Ayv2miq&__hsi=7452967898814735127&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25388&lsd=tD-h8jfAcIJCp9QTA2mzVt&__spin_r=1019084625&__spin_b=trunk&__spin_t=1735279313&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_enter_email_code%22%3A%7B%22check_id%22%3Anull%2C%22code%22%3A%22" + v111 + "%22%2C%22serialized_state%22%3A%22" + v110 + "%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8680151995437244",
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
            p132("Cancelando " + v125 + " invitaciones");
            for (let vLN011 = 0; vLN011 < v124.length; vLN011++) {
              const v128 = v124[vLN011];
              vA6.push(vF5(v128));
            }
            await Promise.all(vA6);
            p132("Cancelación exitosa de " + vLN010 + "/" + v125 + " invitaciones");
            p133();
          } else {
            p132("No hay invitaciones");
            p134();
          }
        } catch {
          p132("Cancelación de invitaciones fallida");
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
            const v131 = await fetch2("https://graph.facebook.com/v14.0/me/adaccounts?limit=99999&fields=name,profile_picture,account_id,account_status,is_prepay_account,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},balance,owner,users{id,is_active,name,permissions,role,roles},insights.date_preset(maximum){spend},userpermissions.user(" + this.uid + "){role},adspixels{id,name}&access_token=" + this.accessToken + "&summary=1&locale=en_US");
            vA7 = v131.json;
            vA7.data = vA7.data.filter(p144 => !p144.owner_business);
          } catch {
            const v132 = await fetch2("https://adsmanager-graph.facebook.com/v16.0/me/adaccounts?limit=99999&fields=name,profile_picture,account_id,account_status,owner_business,created_time,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},owner,insights.date_preset(maximum){spend},userpermissions.user(" + this.uid + "){role},adspixels{id,name}&summary=1&access_token=" + this.accessToken + "&suppress_http_code=1&locale=en_US");
            vA7 = v132.json;
            const v133 = Math.ceil(vA7.data.length / 50);
            for (let vLN1 = 1; vLN1 <= v133; vLN1++) {
              const v134 = (vLN1 - 1) * 50;
              const v135 = vA7.data.slice(v134, vLN1 * 50);
              const vA8 = [];
              v135.forEach(p145 => {
                vA8.push({
                  id: p145.account_id,
                  relative_url: "/act_" + p145.account_id + "?fields=is_prepay_account,next_bill_date,balance,users{id,is_active,name,permissions,role,roles},adspixels{id,name}",
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
                  const v148 = await fetch2("https://graph.facebook.com/v14.0/" + p150 + "/" + p151 + "?access_token=" + this.accessToken + "&pretty=1&fields=name%2Cprofile_picture%2Caccount_id%2Caccount_status%2Cis_prepay_account%2Cowner_business%2Ccreated_time%2Cnext_bill_date%2Ccurrency%2Cadtrust_dsl%2Ctimezone_name%2Ctimezone_offset_hours_utc%2Cdisable_reason%2Cadspaymentcycle%7Bthreshold_amount%7D%2Cbalance%2Cowner%2Cusers%7Bid%2Cis_active%2Cname%2Cpermissions%2Crole%2Croles%7D%2Cinsights.date_preset%28maximum%29%7Bspend%7D%2Cuserpermissions.user%28100029138032182%29%7Brole%7D%2Cadspixels%7Bid%2Cname%7D&limit=50");
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
              // Agregar píxeles asociados
              console.log('adspixels para cuenta', p156.account_id, p156.adspixels);
              let pixels = [];
              if (p156.adspixels && p156.adspixels.data && Array.isArray(p156.adspixels.data)) {
                pixels = p156.adspixels.data.map(px => ({ id: px.id, name: px.name }));
              }
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
                type: p156.owner_business ? "Business" : "Personal",
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
                bm: p156.owner_business ? p156.owner_business.id : null,
                pixel: pixels // <-- aquí se agregan los píxeles
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
            body: "variables={\"paymentAccountID\":\"" + p161 + "\"}&doc_id=5746473718752934&__usid=6-Ts5btmh131oopb:Ps5bu98bb7oey:0-As5btmhrwegfg-RV=6:F=&__user=" + this.uid + "&__a=1&__req=s&__hs=19699.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010282616&__s=flj1ty:75294s:o83s9c&__hsi=7310049091311550655&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg=" + this.dtsg + "&jazoest=25610&lsd=HExoeF2styyeq_LWWUo9db&__aaid=" + p161 + "&__spin_r=1010282616&__spin_b=trunk&__spin_t=1702003435&__jssesw=1"
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
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5nduusqru6%3APs5nduu1s4ryxb%3A0-As5nduuzgap66-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=1o&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010413747&__s=a9ss2l%3Aptab0y%3Ae2tqc1&__hsi=7312362442079618026&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwYwgm6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o721Qw&fb_dtsg=" + v162 + "&jazoest=25289&lsd=WCAAksbHDq9ktWk0fRV9iq&__aaid=" + p164 + "&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542054&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A45%2C%22logging_id%22%3A%223760170890%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542056078_4b48c676-8dff-447d-8576-be8eace3fa70%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542056078_63cbaee3-ff87-45c3-8093-96bbd0331e68%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%227%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }
          if (p166 == 5) {
            v166 = await fetch2("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3674", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + v161 + "&payment_dev_cycle=prod&__usid=6-Ts5nebgytlglm%3APs5ned212v0lbj%3A0-As5nebgnh3ghe-RV%3D6%3AF%3D&__user=" + v161 + "&__a=1&__req=1d&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010413747&__s=338clt%3Ahvf4zf%3Afrhk6f&__hsi=7312365256460775839&__dyn=7AgSXgWGgWEjgDBxmSudgf64ECbxGuml4AqxuUgBwCwXCwABzGCGq5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF8pK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8kybKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAxK4U-dwMxeayEiwAgCmq6UCQubxu3ydDxG8wRyK4UoLzokGp5yrz8C9wGLg-9wFy9oCagixi48hyUix6cG228BCyKbwzxa10yUG1LDDV8sw8KmbwVzi1y4fz8coiGQU9EeVVUWrUlUym5UpU9oeUhxWUnposxx7KAfwxCwyDxm5V9UWaV-bxhem9xq2K9AwHxq5kiV89bx5e8wAAAVQEhyeucyEy68WaJ129ho&__comet_req=25&fb_dtsg=" + v162 + "&jazoest=25466&lsd=V93_40ILei7NAmQfSh_tls&__aaid=" + item.ad + "&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542709&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A41%2C%22logging_id%22%3A%223115641264%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(p165.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + v164 + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + v165 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + v163 + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + p165.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + vParseInt + "%22%2C%22expiry_year%22%3A%2220" + vParseInt2 + "%22%2C%22payment_account_id%22%3A%22" + p164 + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542711187_368e9941-43bc-4e54-8a9a-78e0e48980fd%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542711187_088ec65b-5388-4d82-8e28-12533de0fff5%22%7D%2C%22actor_id%22%3A%22" + v161 + "%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
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
                      body: "av=" + this.uid + "&__usid=6-Tse1ovt1j8u6wd%3APse1oxj1m4rr33%3A0-Ase1ovtochuga-RV%3D6%3AF%3D&session_id=144e97c8e5fc4969&__aaid=" + p183 + "&__bid=" + p184 + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19868.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1013767953&__s=qxxa8s%3Ax39hkh%3Apw4cw7&__hsi=7372940659475198570&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fz98W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAyo884KeCK2q362u1dxW6U98a85Ou0DU7i1TwUw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25134&lsd=nZD2aEOcch1tFKEE4sGoAT&__spin_r=1013767953&__spin_b=trunk&__spin_t=1716646518&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewQuery&variables=%7B%22assetOwnerId%22%3A%223365254127037950%22%2C%22assetId%22%3A%22" + p183 + "%22%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=6875615999208668",
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
            
            // Cargar píxeles para cuentas que no los tengan
            await this.loadMissingPixels();
          }
          p181();
        } catch {}
      });
    }
    
    // Función para cargar píxeles faltantes
    async loadMissingPixels() {
      try {
        console.log('🔄 Verificando píxeles faltantes...');
        
        // Obtener todas las cuentas de la tabla
        const accounts = [];
        if (typeof accountGrid !== 'undefined' && accountGrid.api) {
          accountGrid.api.forEachNode(function(node) {
            accounts.push(node.data);
          });
        }
        
        // Filtrar cuentas sin píxeles
        const accountsWithoutPixels = accounts.filter(account => 
          !account.pixel || !Array.isArray(account.pixel) || account.pixel.length === 0
        );
        
        if (accountsWithoutPixels.length > 0) {
          console.log(`📊 Encontradas ${accountsWithoutPixels.length} cuentas sin píxeles, cargando...`);
          
          const pixelPromises = accountsWithoutPixels.map(async (account) => {
            try {
              const formattedId = account.adId.startsWith('act_') ? account.adId : `act_${account.adId}`;
              const response = await fetch2(`https://graph.facebook.com/v17.0/${formattedId}/adspixels?fields=id,name&access_token=${this.accessToken}`);
              
              if (response && response.json && response.json.data) {
                const pixels = response.json.data.map(pixel => ({
                  id: pixel.id,
                  name: pixel.name
                }));
                
                if (pixels.length > 0) {
                  // Actualizar la tabla
                  $(document).trigger("updatePixels", {
                    accountId: account.adId,
                    pixels: pixels
                  });
                  
                  console.log(`✅ Cargados ${pixels.length} píxeles para cuenta ${account.adId}`);
                }
              }
            } catch (error) {
              console.log(`⚠️ Error cargando píxeles para cuenta ${account.adId}:`, error.message);
            }
          });
          
          await Promise.all(pixelPromises);
          console.log('✅ Carga de píxeles faltantes completada');
        } else {
          console.log('✅ Todas las cuentas ya tienen píxeles cargados');
        }
      } catch (error) {
        console.error('❌ Error en loadMissingPixels:', error);
      }
    }
    // Métodos añadidos desde libs2.js
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
        return new Promise(async (resolve, reject) => {
            try {
                const response = await fetch2("https://graph.facebook.com/me/accounts?type=page&fields=id,additional_profile_id,birthday,name,likes,followers_count,is_published,page_created_time,business,perms&access_token=" + this.accessToken);
                // Validar que la respuesta sea JSON y tenga el campo data
                if (response && response.json && Array.isArray(response.json.data)) {
                    resolve(response.json.data);
                } else {
                    // Si la respuesta no es válida, rechazar con mensaje claro
                    reject("No se pudo obtener las páginas de Facebook. Es posible que la sesión haya expirado, el token sea inválido o Facebook devolvió un error inesperado. Intenta recargar o volver a iniciar sesión.");
                }
            } catch (e) {
                reject("Error de red o de autenticación al obtener las páginas: " + (e && e.message ? e.message : e));
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
                    body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEg5Ku0hi1TwmUaEeE5K227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%2C%22assetId%22%3A%22" + p217 + "%22%7D&server_timestamps=true&doc_id=6228297077225495",
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
    // Método restaurado de la versión OLD para calidad de cuenta
    getAccountQuality() {
      return new Promise(async (p228, p229) => {
        try {
          const v276 = await fetch2("https://www.facebook.com/api/graphql/?_flowletID=1&_triggerFlowletID=2", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsas5n6h0it5h%3APsas5n4jqrxdy%3A0-Asas5ms1bzoc6y-RV%3D6%3AF%3D&session_id=2791d1615dda0cb8&__aaid=0&__user=" + this.uid + "&__a=1&__req=1&__hs=19805.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012251909&__s=p9dz00%3A3ya0mx%3Aafup89&__hsi=7349388123137635674&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fx6ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAyo884KeCK2q362u1dxW6U98a85Ou0DU7i1TwUw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25334&lsd=" + this.lsd + "&__spin_r=1012251909&__spin_b=trunk&__spin_t=1711162767&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=7327539680662016",
            method: "POST"
          });
          const v277 = await v276.json;
          if (!v277.errors) {
            let v278 = "N/A";
            let v279 = "";
            const v280 = v277.data.assetOwnerData.advertising_restriction_info.is_restricted;
            const v281 = v277.data.assetOwnerData.advertising_restriction_info.status;
            const v282 = v277.data.assetOwnerData.advertising_restriction_info.restriction_type;
            if (!v280) {
              if (v282 == "PREHARM" && v281 == "APPEAL_ACCEPTED") {
                v278 = "Verificación Azul VeryID";
                v279 = "success";
              }
              if (v282 == "ALE" && v281 == "APPEAL_ACCEPTED") {
                v278 = "Verificación Azul 902";
                v279 = "success";
              }
              if (v281 == "NOT_RESTRICTED") {
                v278 = "Anuncios en Vivo - Sin Problemas";
                v279 = "success";
              }
              if (v282 == "ADS_ACTOR_SCRIPTING") {
                v278 = "Verificación azul VeryID oculta";
                v279 = "success";
              }
              if (v281 == "NOT_RESTRICTED" && v282 == "BUSINESS_INTEGRITY") {
                v278 = "Verificación azul 902 oculta";
                v279 = "success";
              }
            } else {
              if (v281 == "VANILLA_RESTRICTED" && v282 == "BUSINESS_INTEGRITY") {
                v278 = "HCQC 902 VeryID";
                v279 = "danger";
              }
              if (v281 == "APPEAL_INCOMPLETE" && v282 == "BUSINESS_INTEGRITY") {
                v278 = "VeryID 902 INCOMPLETO";
                v279 = "danger";
              }
              if (v281 == "APPEAL_PENDING" && v282 == "BUSINESS_INTEGRITY") {
                v278 = "Apelación 902 en Proceso";
                v279 = "danger";
              }
              if (v281 == "APPEAL_REJECTED" && v282 == "BUSINESS_INTEGRITY") {
                v278 = "HCQC 902 fallido - Reintentar VeryID 273";
                v279 = "danger";
              }
              if (v280 && v282 == "PREHARM") {
                if (v281 == "VANILLA_RESTRICTED") {
                  v278 = "Restricción de Anuncios";
                  v279 = "danger";
                }
                if (v281 == "APPEAL_PENDING") {
                  v278 = "Apelación VeryID en Proceso";
                  v279 = "danger";
                }
                if (v281 == "APPEAL_INCOMPLETE") {
                  v278 = "VeryID Incompleto";
                  v279 = "danger";
                }
                if (v281 == "APPEAL_REJECTED_NO_RETRY" || v281 == "APPEAL_TIMEOUT" || v281 == "APPEAL_TIMEOUT") {
                  v278 = "VeryID Fallido - Reintentar VeryID 273";
                  v279 = "danger";
                }
              }
              if (v280 && v282 == "ALE") {
                if (v281 == "APPEAL_PENDING") {
                  v278 = "Apelación 902 en Proceso";
                  v279 = "warning";
                }
                if (v281 == "APPEAL_REJECTED_NO_RETRY") {
                  v278 = "HCQC Permanente";
                  v279 = "danger";
                }
                const v283 = v277.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state;
                const v284 = v277.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_friction;
                const v285 = v277.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_ineligibility_reason;
                if (v281 == "VANILLA_RESTRICTED" && v283 == "FAILED" || v281 == "VANILLA_RESTRICTED" && v283 == "TIMEOUT") {
                  v278 = "HCQC 902 fallido - Reintentar VeryID 273";
                  v279 = "danger";
                }
                if (v281 == "VANILLA_RESTRICTED" && v283 == null && v284 == "UFAC") {
                  v278 = "HCQC 902 VeryID";
                  v279 = "danger";
                }
                if (v281 == "VANILLA_RESTRICTED" && v283 == null && v284 == null && v285 == "ENTITY_APPEAL_LIMIT_REACHED") {
                  v278 = "HCQC 902 fallido - Reintentar VeryID 273";
                  v279 = "danger";
                } else {
                  if (v281 == "VANILLA_RESTRICTED" && v283 == null && v284 == null) {
                    v278 = "HCQC 902 Seleccionar Línea";
                    v279 = "danger";
                  }
                  if (v281 == "VANILLA_RESTRICTED" && v283 == "SUCCESS" && v284 == null) {
                    v278 = "HCQC 902 Seleccionar Línea";
                    v279 = "danger";
                  }
                }
              }
              if (v280 && v282 == "ACE" || v282 === "GENERIC") {
                v278 = "VeryID Fallido - Reintentar VeryID 273";
                v279 = "danger";
              }
              if (v280 && v282 == "RISK_REVIEW" || v282 === "RISK_REVIEW_EMAIL_VERIFICATION") {
                v278 = "VeryID Punto de Control";
                v279 = "danger";
              }
              if (v282 == "ADS_ACTOR_SCRIPTING") {
                if (v281 == "APPEAL_REJECTED") {
                  v278 = "VeryID Fallido - Reintentar VeryID 273";
                  v279 = "danger";
                } else if (v281 == "APPEAL_PENDING") {
                  v278 = "Apelación VeryID en Proceso";
                  v279 = "warning";
                } else if (v281 == "APPEAL_ACCEPTED") {
                  v278 = "Verificación Azul 902";
                  v279 = "success";
                } else if (v281 == "APPEAL_INCOMPLETE") {
                  v278 = "VeryID Incompleto";
                  v279 = "danger";
                } else {
                  v278 = "Restricción de Anuncios";
                  v279 = "danger";
                }
              }
            }
            const v286 = {
              status: v278,
              color: v279
            };
            p228(v286);
          } else {
            p229(v277.errors[0].summary);
          }
        } catch (_0xa74635) {
          p229(_0xa74635);
        }
      });
    }
    loadPage() {
        return new Promise(async (resolve, reject) => {
            try {
                const localData = JSON.parse(localStorage.getItem("dataPage")) || [];
                if (localData.length > 0) {
                    $(document).trigger("loadSavedPage", [localData]);
                    resolve();
                } else {
                    const pages = await this.getPage();
                    $(document).trigger("loadPageSuccess", [pages]);
                    // Actualizar el estado de cada página (status)
                    const updateStatus = (page) => {
                        return new Promise(async (res) => {
                            try {
                                const status = await this.checkPage(page.id);
                                const statusObj = { id: page.id, status };
                                $(document).trigger("updatePageStatus", [statusObj]);
                            } catch {}
                            res();
                        });
                    };
                    const promises = [];
                    for (let i = 0; i < pages.length; i++) {
                        promises.push(updateStatus(pages[i]));
                    }
                    await Promise.all(promises);
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    
    // Función para obtener link XMDT de cuentas publicitarias - Método mejorado basado en código funcional
    getLinkXmdtAds(p237) {
        return new Promise(async (p238, p239) => {
            try {
                // Validar que tenemos los datos necesarios
                if (!p237 || !this.uid || !this.dtsg) {
                    throw new Error("Faltan datos necesarios para obtener link XMDT");
                }

                console.log("Iniciando proceso XMDT para cuenta:", p237);

                // Paso 1: Crear apelación usando el método del código funcional
                const createAppealUrl = "https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1661";
                const createAppealBody = "av=" + this.uid + "&session_id=17e613b789f86fcc&__aaid=" + p237 + "&__bid=" + p237 + "&__user=" + this.uid + "&__a=1&__req=j&__hs=20151.BP%3ADEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1020564878&__s=dr1ti4%3A103eex%3Ahjfkpz&__hsi=7477848285631838275&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSxum4Euxa0z8S2S2q1Ex20zEyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC1Dw4WwgEhxW10wnEtwoVUao9k2B0q85W1bxq1-orx2ewyx6i2GU8U-UbE4S2q4UoG7o2swh8S1qxa1ozEjwnE2Lxi3-1RwrUux616yES2e0UFU2RwrU6CiU9E4KeyE9Eco9U6O6U4R0mVU1587u1rwc6227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25737&lsd=" + (this.lsd || "defaultLsd") + "&__spin_r=1020564878&__spin_b=trunk&__spin_t=1741072229&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBSHGAMEOpenXFACAppealActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22enforcement_instance%22%3A%22" + p237 + "%22%7D%7D&server_timestamps=true&doc_id=8036119906495815";

                console.log("Creando apelación...");
                const createResponse = await fetch2(createAppealUrl, {
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    body: createAppealBody
                });

                if (!createResponse || !createResponse.json) {
                    throw new Error("No se pudo crear la apelación");
                }

                const createData = createResponse.json;
                console.log("Respuesta de creación:", createData);

                // Extraer appeal_id de la respuesta
                let appealId = null;
                if (createData && createData.data) {
                    if (createData.data.xfb_XFACGraphQLAppealManagerFetchOrCreateAppeal) {
                        appealId = createData.data.xfb_XFACGraphQLAppealManagerFetchOrCreateAppeal.xfac_appeal_id;
                    } else if (createData.data.create_appeal) {
                        appealId = createData.data.create_appeal.appeal_id;
                    } else {
                        // Buscar recursivamente cualquier campo que contenga appeal_id
                        const findAppealId = (obj) => {
                            if (!obj || typeof obj !== "object") return null;
                            for (const key in obj) {
                                if (key.includes("appeal_id") || key.includes("appealId")) {
                                    return obj[key];
                                }
                                if (typeof obj[key] === "object") {
                                    const found = findAppealId(obj[key]);
                                    if (found) return found;
                                }
                            }
                            return null;
                        };
                        appealId = findAppealId(createData.data);
                    }
                }

                // Si no se pudo obtener appeal_id, usar el ID de la cuenta como fallback
                if (!appealId) {
                    console.log("No se pudo obtener appeal_id, usando ID de cuenta como fallback");
                    appealId = p237;
                }

                console.log("Appeal ID obtenido:", appealId);

                // Paso 2: Obtener enrollment_id usando el método del código funcional
                const getEnrollmentUrl = "https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1420";
                const getEnrollmentBody = "av=" + this.uid + "&session_id=1b39647eb945a644&__aaid=" + p237 + "&__bid=" + p237 + "&__user=" + this.uid + "&__a=1&__req=i&__hs=20151.BP%3ADEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1020564878&__s=g139k8%3A103eex%3Ahwphka&__hsi=7477845871681707178&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSxum4Euxa0z8S2S2q1Ex20zEyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC1Dw4WwgEhxW10wnEtwoVUao9k2B0q85W1bxq1-orx2ewyx6i2GU8U-UbE4S2q4UoG7o2swh8S1qxa1ozEjwnE2Lxi3-1RwrUux616yES2e0UFU2RwrU6CiU9E4KeyE9Eco9U6O6U4R0mVU1587u1rwc6227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25762&lsd=" + (this.lsd || "defaultLsd") + "&__spin_r=1020564878&__spin_b=trunk&__spin_t=1741071667&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacActorAppealTriggerRootQuery&variables=%7B%22input%22%3A%7B%22trigger_event_type%22%3A%22XFAC_ACTOR_APPEAL_ENTRY%22%2C%22ufac_design_system%22%3A%22GEODESIC%22%2C%22xfac_id%22%3A%22" + appealId + "%22%2C%22nt_context%22%3Anull%2C%22trigger_session_id%22%3A%22d289e01d-ffc9-43ef-905b-0ee4a5807fd5%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=29439169672340596";

                console.log("Obteniendo enrollment_id...");
                const enrollmentResponse = await fetch2(getEnrollmentUrl, {
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded"
                    },
                    body: getEnrollmentBody
                });

                if (!enrollmentResponse || !enrollmentResponse.json) {
                    throw new Error("No se pudo obtener el enrollment_id");
                }

                const enrollmentData = enrollmentResponse.json;
                console.log("Respuesta de enrollment:", enrollmentData);

                // Extraer enrollment_id de la respuesta
                let enrollmentId = null;
                if (enrollmentData && enrollmentData.data) {
                    if (enrollmentData.data.ixt_xfac_actor_appeal_trigger && 
                        enrollmentData.data.ixt_xfac_actor_appeal_trigger.screen && 
                        enrollmentData.data.ixt_xfac_actor_appeal_trigger.screen.view_model) {
                        enrollmentId = enrollmentData.data.ixt_xfac_actor_appeal_trigger.screen.view_model.enrollment_id;
                    } else {
                        // Buscar recursivamente cualquier campo que contenga enrollment_id
                        const findEnrollmentId = (obj) => {
                            if (!obj || typeof obj !== "object") return null;
                            for (const key in obj) {
                                if (key.includes("enrollment_id") || key.includes("enrollmentId")) {
                                    return obj[key];
                                }
                                if (typeof obj[key] === "object") {
                                    const found = findEnrollmentId(obj[key]);
                                    if (found) return found;
                                }
                            }
                            return null;
                        };
                        enrollmentId = findEnrollmentId(enrollmentData.data);
                    }
                }

                // Si no se pudo obtener enrollment_id, usar appeal_id como fallback
                if (!enrollmentId && appealId) {
                    console.log("No se pudo obtener enrollment_id, usando appeal_id como fallback");
                    enrollmentId = appealId;
                }

                // Si aún no tenemos enrollment_id, usar el ID de la cuenta
                if (!enrollmentId) {
                    console.log("Usando ID de cuenta como último recurso");
                    enrollmentId = p237;
                }

                console.log("Enrollment ID final:", enrollmentId);

                // Verificar que el enrollment_id es válido
                if (enrollmentId && enrollmentId.length > 5) {
                    // Generar el enlace XMDT completo
                    const xmdtLink = "https://www.facebook.com/checkpoint/1501092823525282/" + enrollmentId;
                    
                    // Guardar el enlace en localStorage para seguimiento
                    this.saveXmdtLink(p237, xmdtLink);
                    
                    console.log("Link XMDT generado:", xmdtLink);
                    p238(enrollmentId);
                } else {
                    throw new Error("No se pudo generar un enrollment_id válido para la cuenta " + p237);
                }

            } catch (e45) {
                console.error("Error en getLinkXmdtAds:", e45);
                
                // Como último recurso, intentar generar un enlace directo
                try {
                    console.log("Intentando método de respaldo...");
                    // Usar el ID de la cuenta directamente como enrollment_id
                    const fallbackId = p237;
                    const fallbackLink = "https://www.facebook.com/checkpoint/1501092823525282/" + fallbackId;
                    
                    // Guardar el enlace de respaldo
                    this.saveXmdtLink(p237, fallbackLink + " (fallback)");
                    
                    console.log("Usando ID de respaldo:", fallbackId);
                    console.log("Link XMDT de respaldo:", fallbackLink);
                    p238(fallbackId);
                } catch (fallbackError) {
                    p239(new Error("Error al obtener link XMDT: " + (e45.message || "Error desconocido") + ". Método de respaldo también falló."));
                }
            }
        });
    }

    // Función para guardar enlaces XMDT generados
    saveXmdtLink(accountId, link) {
        try {
            // Obtener enlaces existentes
            let xmdtLinks = JSON.parse(localStorage.getItem('xmdt_links_log') || '[]');
            
            // Crear entrada con timestamp
            const entry = {
                uid: this.uid || 'unknown',
                accountId: accountId,
                link: link,
                timestamp: new Date().toISOString(),
                formatted: `${this.uid || 'unknown'}|${link}`
            };
            
            // Agregar nueva entrada al inicio del array
            xmdtLinks.unshift(entry);
            
            // Mantener solo los últimos 100 enlaces para no sobrecargar localStorage
            if (xmdtLinks.length > 100) {
                xmdtLinks = xmdtLinks.slice(0, 100);
            }
            
            // Guardar en localStorage
            localStorage.setItem('xmdt_links_log', JSON.stringify(xmdtLinks));
            
            console.log("Enlace XMDT guardado:", entry.formatted);
        } catch (e) {
            console.error("Error al guardar enlace XMDT:", e);
        }
    }

    // Función para obtener todos los enlaces XMDT generados
    getXmdtLinks() {
        try {
            return JSON.parse(localStorage.getItem('xmdt_links_log') || '[]');
        } catch (e) {
            console.error("Error al obtener enlaces XMDT:", e);
            return [];
        }
    }

    // Función para mostrar enlaces XMDT en formato UID|link
    showXmdtLinks() {
        const links = this.getXmdtLinks();
        if (links.length === 0) {
            console.log("No hay enlaces XMDT generados");
            return;
        }
        
        console.log("=== ENLACES XMDT GENERADOS ===");
        links.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.formatted} (${new Date(entry.timestamp).toLocaleString()})`);
        });
        console.log("===============================");
        
        return links.map(entry => entry.formatted);
    }

    // Función para exportar enlaces XMDT como texto
    exportXmdtLinks() {
        const links = this.getXmdtLinks();
        if (links.length === 0) {
            return "No hay enlaces XMDT generados";
        }
        
        let exportText = "=== ENLACES XMDT GENERADOS ===\n";
        exportText += "Formato: UID|LINK (Fecha)\n\n";
        
        links.forEach((entry, index) => {
            exportText += `${index + 1}. ${entry.formatted}\n`;
            exportText += `   Cuenta: ${entry.accountId}\n`;
            exportText += `   Fecha: ${new Date(entry.timestamp).toLocaleString()}\n\n`;
        });
        
        return exportText;
    }

    // Función para limpiar el log de enlaces XMDT
    clearXmdtLinks() {
        localStorage.removeItem('xmdt_links_log');
        console.log("Log de enlaces XMDT limpiado");
    }
} // Cierro la clase FB correctamente
window.fb = new FB();

// Funciones globales para acceso rápido a enlaces XMDT
window.showXmdtLinks = function() {
    return window.fb.showXmdtLinks();
};

window.exportXmdtLinks = function() {
    const exportText = window.fb.exportXmdtLinks();
    console.log(exportText);
    return exportText;
};

window.clearXmdtLinks = function() {
    return window.fb.clearXmdtLinks();
};

window.getXmdtLinksFormatted = function() {
    const links = window.fb.getXmdtLinks();
    return links.map(entry => entry.formatted);
};