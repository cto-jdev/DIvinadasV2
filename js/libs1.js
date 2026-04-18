/**
 * delayTime
 * Descripción: Devuelve una promesa que se resuelve después de un tiempo en milisegundos.
 * Parámetros: milliseconds (número de milisegundos a esperar)
 * Retorna: Promise<void>
 * FASE 2 REFACTOR: Variables renombradas p5→milliseconds, p6→resolve, p7→reject
 */
function delayTime(milliseconds) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve();
      }, milliseconds);
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
      this.tokenEAAG = '';
      this.tokenEAAB = '';
    }
    /**
     * checkLive
     * Descripción: Verifica el estado de la sesión de Facebook (login, checkpoint, etc).
     * Retorna: Promise<string> ("not_login", "new_login", "success", "282", "956", "error")
     * FASE 2 REFACTOR: Deobfuscated variable names for readability
     */
    checkLive() {
      return new Promise(async (resolve, reject) => {
        try {
          const facebookResponse = await fetch2("https://facebook.com");
          const cookieData = await getCookie();
          let currentUserId = 0;
          let storedUserId = 0;
          try {
            currentUserId = cookieData.split("c_user=")[1].split(";")[0] ?? 0;
            try {
              storedUserId = (await getLocalStorage("userInfo_" + fb.uid)).id ?? 0;
            } catch {}
          } catch (e2) {}
          if (facebookResponse.url.includes("login") || facebookResponse.url.includes("index.php?next") || currentUserId === 0) {
            resolve("not_login");
          } else if (currentUserId !== 0 && storedUserId !== 0 && currentUserId != storedUserId) {
            resolve("new_login");
          } else if (facebookResponse.url.includes("/checkpoint/601051028565049")) {
            try {
              const checkpointResponse = await fetch2(facebookResponse.url);
              const checkpointHtml = checkpointResponse.text;
              const checkpointToken = checkpointHtml.match(/(?<=\"token\":\")[^\"]*/g).filter(token => token.startsWith("NA"))[0];
              const actorId = checkpointHtml.match(/(?<=\"actorID\":\")[^\"]*/g)[0];
              await fetch2("https://www.facebook.com/api/graphql/", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + actorId + "&__user=" + actorId + "&__a=1&__req=f&__hs=20093.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1&__ccg=EXCELLENT&__rev=1019152241&__s=3r0i1l%3Adoygjs%3Arl8pzq&__hsi=7456304789546566464&__dyn=7xeUmwlEnwn8K2Wmh0no6u5U4e0yoW3q32360CEbo19oe8hw2nVE4W099w8G1Dz81s8hwnU2lwv89k2C1Fwc60D8vwRwlE-U2zxe2GewbS361qw8Xwn82Lw5XwSyES1Mw9m0Lo6-1Fw4mwr86C0No7S3m1TwLwHwea&__csr=iNP8qDzqVpK79p9bDmXDyd3F6mVGxF1h4yoKcwABwEx213yU8oK0G83zw5iwbW0IEa8W0D84C09gw5VxO0lO05988U01DqU1xE08mE&__comet_req=15&fb_dtsg=" + checkpointToken + "&jazoest=25482&lsd=pzKOpDZ-eJ0rLdRdpFloMd&__spin_r=1019152241&__spin_b=trunk&__spin_t=1736056243&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FBScrapingWarningMutation&variables=%7B%7D&server_timestamps=true&doc_id=6339492849481770",
                method: "POST"
              });
            } catch (e3) {
              console.log(e3);
            }
          } else if (facebookResponse.url.includes("/checkpoint/1501092823525282")) {
            resolve("282");
          } else if (facebookResponse.url.includes("/checkpoint/828281030927956")) {
            resolve("956");
          } else {
            resolve("success");
          }
        } catch (e4) {
          console.log(e4);
          resolve("error");
        }
      });
    }
    /**
     * getAccessToken
     * Descripción: Obtiene el accessToken y tokens de seguridad de Facebook Business.
     * Retorna: Promise<Object|string> (objeto con accessToken, dtsg, dtsg2 o string de error)
     * FASE 2 REFACTOR: Deobfuscated variable names
     */
    getAccessToken() {
      return new Promise(async (resolve, reject) => {
        try {
          let billingResponse = false;
          try {
            billingResponse = await fetch2("https://business.facebook.com/billing_hub/payment_settings/?asset_id=4");
          } catch {
            billingResponse = await fetch2("https://business.facebook.com/billing_hub/payment_settings/");
          }
          const responseHtml = billingResponse.text;
          if (billingResponse.url.includes("login") || billingResponse.url.includes("index.php?next")) {
            resolve("not_login");
          } else if (billingResponse.url.includes("/checkpoint/1501092823525282")) {
            resolve("282");
          } else if (billingResponse.url.includes("/checkpoint/828281030927956")) {
            resolve("956");
          } else {
            let accessTokenMatches = responseHtml.match(/(?<="accessToken":")[^"]*/g) || [];
            let validAccessTokens = accessTokenMatches.filter(token => token.includes("EAA"));
            
            let facebookTokenMatches = responseHtml.match(/(?<="token":")[^"]*/g) || [];
            // Relaxed DTSG filter: look for typical length/format instead of just "NA"
            let validDtsgTokens = facebookTokenMatches.filter(token => token.length > 15);
            
            const asyncTokenMatches = responseHtml.match(/(?<="async_get_token":")[^"]*/g) || [];
            
            // Backup regex for EAA token if the first one fails
            if (validAccessTokens.length === 0) {
              const alternativeMatch = responseHtml.match(/EAA[a-zA-Z0-9]+/g);
              if (alternativeMatch && alternativeMatch.length > 0) {
                validAccessTokens = [alternativeMatch[0]];
              }
            }
            
            // Backup regex for DTSG if the first one fails
            if (validDtsgTokens.length === 0) {
              const alternativeDtsgMatch = responseHtml.match(/"DTSGInitialData",\[\],\{"token":"([^"]+)"/);
              if (alternativeDtsgMatch && alternativeDtsgMatch.length > 1) {
                validDtsgTokens = [alternativeDtsgMatch[1]];
              } else {
                 const anotherDtsgMatch = responseHtml.match(/name="fb_dtsg"\s+value="([^"]+)"/);
                 if (anotherDtsgMatch && anotherDtsgMatch.length > 1) {
                   validDtsgTokens = [anotherDtsgMatch[1]];
                 }
              }
            }
            
            if (validAccessTokens.length > 0 && validDtsgTokens.length > 0) {
              const tokenObject = {
                accessToken: validAccessTokens[0],
                dtsg: validDtsgTokens[0],
                dtsg2: asyncTokenMatches[0] || ''
              };
              resolve(tokenObject);
            } else {
              console.error('FB Token Extraction Failed:', 
                { foundEAA: validAccessTokens.length > 0, foundDTSG: validDtsgTokens.length > 0, 
                  rawEAA: accessTokenMatches.slice(0, 3), rawToken: facebookTokenMatches.slice(0, 3) });
              reject(new Error('Tokens not found in Facebook response'));
            }
          }
        } catch (e) {
          console.error("Fetch Exception during token extraction:", e);
          reject(e);
        }
      });
    }
    /**
     * getAccessToken2
     * Descripción: Obtiene el accessToken desde Ads Manager.
     * Retorna: Promise<string> (accessToken)
     */
    getAccessToken2() {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://adsmanager.facebook.com/adsmanager/manage/campaigns");
          let responseText = response.text;
          try {
            let urlMatch = responseText.match(/window.location\.replace\("(.+)"/);
            urlMatch = urlMatch[1].replace(/\\/g, "");
            const redirectResponse = await fetch2(urlMatch);
            responseText = redirectResponse.text;
          } catch {}
          const tokenMatch = responseText.match(/window.__accessToken="(.*)";/);
          resolve(tokenMatch[1]);
        } catch (error) {
          reject(error);
        }
      });
    }
    /**
     * getFriends
     * Descripción: Obtiene el número total de amigos del usuario autenticado.
     * Retorna: Promise<number>
     */
    getFriends() {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/me?fields=friends&access_token=" + this.accessToken2);
          const userData = response.json;
          resolve(userData.friends.summary.total_count);
        } catch (error) {
          reject();
        }
      });
    }
    /**
     * getUserInfo
     * Descripción: Obtiene la información del usuario autenticado y la guarda en localStorage si es necesario.
     * Retorna: Promise<Object> (información del usuario)
     * FASE 2 REFACTOR: Deobfuscated variable names for clarity
     */
    getUserInfo() {
      return new Promise(async (resolve, reject) => {
        try {
          const cookieData = await getCookie();
          const userId = cookieData.split("c_user=")[1].split(";")[0];
          if (userId) {
            await setLocalStorage("uid", userId);
          }
          let userInfo = await getLocalStorage("userInfo_" + userId);
          if (!userInfo) {
            const graphResponse = await fetch2("https://graph.facebook.com/me?fields=name,first_name,last_name,gender,email,picture.width(200).height(200),username,link,birthday&access_token=" + this.accessToken);
            const userData = graphResponse.json;
            userData.picture.data.url = await getBase64ImageFromUrl(userData.picture.data.url);
            try {
              userData.friends = await this.getFriends();
            } catch {}
            if (!userData.error) {
              await setLocalStorage("userInfo_" + userData.id, userData);
              userInfo = userData;
            } else {
              reject();
            }
          }
          try {
            const clonedDataArray = (await getLocalStorage("dataClone")) || [];
            const matchingClones = clonedDataArray.filter(clonedItem => clonedItem.uid === userInfo.id);
            if (!matchingClones[0] && userInfo.id) {
              let cloneIndex;
              if (clonedDataArray.length === 0) {
                cloneIndex = 0;
              } else {
                cloneIndex = clonedDataArray.length + 1;
              }
              const currentCookie = await getCookie();
              const cloneRecord = {
                id: cloneIndex,
                cookie: currentCookie,
                status: 0,
                account: currentCookie,
                uid: userInfo.id,
                dob: userInfo.birthday,
                gender: userInfo.gender,
                friends: userInfo.friends,
                name: userInfo.name,
                avatar: userInfo.picture.data.url
              };
              clonedDataArray.push(cloneRecord);
              await setLocalStorage("dataClone", clonedDataArray);
            }
          } catch (e7) {
            console.log(e7);
          }
          resolve(userInfo);
        } catch (e8) {
          reject(e8);
        }
      });
    }
    /**
     * getDeactivedPage
     * Descripción: Obtiene las páginas desactivadas de un negocio de Facebook.
     * Parámetros: businessId (id del negocio)
     * Retorna: Promise<Array> (páginas desactivadas)
     */
    getDeactivedPage(businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const deactivatedPages = [];
          const response = await fetch2("https://graph.facebook.com/v17.0/" + businessId + "/owned_pages?access_token=" + this.accessToken + "&__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=object:business/owned_pages&_reqSrc=PageResourceRequests.brands&fields=[\"id\",\"name\",\"is_deactivated\"]&locale=en_US&method=get&pretty=0&suppress_http_code=1&xref=f5a225ece5d79cbc4&_callFlowletID=0&limit=2000&_triggerFlowletID=2522");
          const responseData = response.json;
          responseData.data.filter(page => page.is_deactivated).forEach(page => {
            deactivatedPages.push(page);
          });
          let nextPageUrl = responseData.paging.next;
          if (nextPageUrl) {
            for (let iteration = 0; iteration < 9999; iteration++) {
              await delayTime(1000);
              const nextResponse = await fetch2(nextPageUrl);
              const nextData = nextResponse.json;
              nextData.data.filter(page => page.is_deactivated).forEach(page => {
                deactivatedPages.push(page);
              });
              if (nextData.paging?.next) {
                nextPageUrl = nextData.paging.next;
              } else {
                break;
              }
            }
          }
          resolve(deactivatedPages);
        } catch (error) {
          console.log(error);
          reject(error);
        }
      });
    }
    activePage(businessId, pageId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=5448&_triggerFlowletID=5448", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsg9bdh1pm0xfe%3APsg9bnzh3g1oh%3A0-Asg9bdhqo6bj6-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=q&__hs=19911.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1014711278&__s=zznrqy%3Ajdhrrh%3Artstop&__hsi=7388897698519762088&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1Dxuq3mq1FxebzA3miidBxa7EiwnobES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwQzobVqxN0Cmu3mbx-261UxO4UkK2y1gwBwXwEw-G2mcwuE2Bz84a9DxW10wywWjxCU5-u2C2l0Fg6y3m2y1bxq1yxJxK48GU8EhAwGK2efK7UW1dx-q4VEhwwwj84-224U-dwKwHxa1ozFUK1gzo8EfEO32fxiFUd8bGwgUy1kx6bCyUhzUbVEHyU8U3yDwbm1LwqpbwCwiUWqU9Eco9U4S7ErwAwEwn9U1587u1rw&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25814&lsd=nxvK4ygqhhRa3PeznPK6_k&__spin_r=1014711278&__spin_b=trunk&__spin_t=1720361807&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBusinessPageDelegatePageReactivationNoticeBannerReactivateProfileMutation&variables=%7B%22profile_id%22%3Anull%2C%22delegate_page_id%22%3A%22" + pageId + "%22%7D&server_timestamps=true&doc_id=5931430166980261",
            method: "POST"
          });
          const responseText = response.text;
          if (responseText.includes("\"name\"")) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    getBmPage() {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/select");
          const responseText = response.text;
          const parsedData = JSON.parse(responseText.split("requireLazy([\"TimeSliceImpl\",\"ServerJS\"],function(TimeSlice,ServerJS){var s=(new ServerJS());s.handle(")[1].split(");requireLazy([\"Run\"]")[0]);
          resolve(parsedData.require[2][3][1].businesses);
        } catch (error) {
          reject(error);
        }
      });
    }
    getBm() {
      return new Promise(async (resolve, reject) => {
        try {
          let businessData = {};
          try {
            const response1 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1).limit(99999){adtrust_dsl,currency,account_status}&limit=30&access_token=" + this.accessToken);
            const data1 = response1.json;
            if (data1.data.length) {
              businessData = data1;
            }
          } catch {
            const response2 = await fetch2("https://graph.facebook.com/v14.0/me/businesses?fields=name,id,verification_status,business_users,allow_page_management_in_www,sharing_eligibility_status,created_time,permitted_roles,client_ad_accounts.summary(1),owned_ad_accounts.summary(1).limit(100){adtrust_dsl,currency,account_status}&limit=30&access_token=" + this.accessToken);
            const data2 = response2.json;
            if (data2.data.length) {
              businessData = data2;
            }
          }
          const businessList = [];
          if (businessData.data) {
            businessData.data.forEach(business => {
              businessList.push(business);
            });
            let nextUrl = businessData.paging.next;
            if (nextUrl) {
              for (let iteration = 0; iteration < 9999; iteration++) {
                const nextResponse = await fetch2(nextUrl);
                const nextData = nextResponse.json;
                nextData.data.forEach(business => {
                  businessList.push(business);
                });
                if (nextData.paging?.next) {
                  nextUrl = nextData.paging.next;
                } else {
                  break;
                }
              }
            }
            resolve(businessList);
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    getBmStatus(deepCheck = true) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "fb_dtsg=" + this.dtsg + "&variables={}&doc_id=4941582179260904",
            method: "POST"
          });
          const responseData = response.json;
          const businessNodes = responseData.data.viewer.ad_businesses.nodes.map(node => {
            let statusTag = "";
            let statusText = "";
            if (node.advertising_restriction_info.status === "NOT_RESTRICTED" && !node.advertising_restriction_info.is_restricted) {
              statusTag = "LIVE";
              statusText = "Activo";
            }
            if (node.advertising_restriction_info.status === "VANILLA_RESTRICTED" && node.advertising_restriction_info.is_restricted || node.advertising_restriction_info.status === "APPEAL_INCOMPLETE") {
              if (node.advertising_restriction_info.restriction_type === "ALE") {
                statusTag = "DIE_3DONG";
                statusText = "Deshabilitado 3 líneas";
              } else {
                statusTag = "DIE";
                statusText = "Deshabilitado";
              }
            }
            if (node.advertising_restriction_info.restriction_type === "ALE" && node.advertising_restriction_info.status === "APPEAL_TIMEOUT") {
              statusTag = "DIE_3DONG";
              statusText = "Deshabilitado 3 líneas";
            }
            if (node.advertising_restriction_info.status === "APPEAL_REJECTED_NO_RETRY" && node.advertising_restriction_info.is_restricted) {
              statusTag = "DIE_VV";
              statusText = "Deshabilitado permanente";
            }
            if (node.advertising_restriction_info.status === "APPEAL_REJECTED") {
              statusTag = "DIE_VV";
              statusText = "Deshabilitado permanente";
            }
            if (node.advertising_restriction_info.status === "APPEAL_PENDING") {
              statusTag = "DIE_DK";
              statusText = "Deshabilitado en apelación";
            }
            if (node.advertising_restriction_info.status === "APPEAL_ACCEPTED") {
              if (node.advertising_restriction_info.restriction_type === "ALE") {
                statusTag = "BM_KHANG_3DONG";
                statusText = "BM apelado 3 líneas";
              } else if (!node.advertising_restriction_info.is_restricted) {
                statusTag = "BM_KHANG";
                statusText = "BM apelado";
              } else {
                statusTag = "BM_XANHVO";
                statusText = "BM verde falso";
              }
            }
            const mappedNode = {
              id: node.id,
              type: statusTag,
              name: node.name,
              text: statusText,
              status: node.advertising_restriction_info.status,
              is_restricted: node.advertising_restriction_info.is_restricted,
              restriction_type: node.advertising_restriction_info.restriction_type,
              avatar: node.profile_picture.uri
            };
            return mappedNode;
          });
          if (deepCheck) {
            let checkPromises = [];
            for (let i = 0; i < businessNodes.length; i++) {
              if (businessNodes[i].type === "DIE") {
                const checkFunction = () => {
                  return new Promise(async (innerResolve, innerReject) => {
                    try {
                      const innerResponse = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        method: "POST",
                        body: "av=" + this.uid + "&__usid=6-Ts626y2arz8fg%3APs626xy1mafk6f%3A0-As626x5t9hdw-RV%3D6%3AF%3D&session_id=3f06e26e24310de8&__user=" + this.uid + "&__a=1&__req=1&__hs=19713.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010574318&__s=bgx31o%3A93y1un%3Aj1i0y0&__hsi=7315329750708113449&__dyn=7xeUmxa2C5ryoS1syU8EKmhG5UkBwqo98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczEeU-5Ejwl8gwqoqyojzoO4o2oCwOxa7FEd89EmwoU9FE4Wqmm2ZedUbpqG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465o-0xUnw8ScwgECu7E422a3Gi6rwiolDwjQ2C4oW2e1qyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK3eUbE4S7VEjCx6Etwj84-224U-dwKwHxa1ozFUK1gzpErw-z8c89aDwKBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lx3wlF8C221bzFHwCwNwDwjouxK2i2y1sDw9-&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25595&lsd=XBGCglH3K63SPddlSyNKgf&__aaid=0&__bid=745415083846542&__spin_r=1010574318&__spin_b=trunk&__spin_t=1703232934&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + businessNodes[i].id + "%22%7D&server_timestamps=true&doc_id=24196151083363204"
                      });
                      const innerData = innerResponse.json;
                      const restrictionInfo = innerData.data.assetOwnerData.advertising_restriction_info;
                      const restrictionDate = restrictionInfo.restriction_date;
                      if (restrictionInfo.status === "VANILLA_RESTRICTED" && restrictionInfo.is_restricted && restrictionInfo.additional_parameters.ufac_state === "FAILED") {
                        businessNodes[i].type = "DIE_VV";
                        businessNodes[i].text = "Deshabilitado permanente";
                      }
                      if (restrictionDate === "2025-01-26" || restrictionDate === "2025-01-27" || restrictionDate === "2025-01-28") {
                        businessNodes[i].type = "DIE_CAPTCHA";
                        businessNodes[i].text = "Deshabilitado por Captcha";
                        businessNodes[i].dieDate = restrictionDate;
                      }
                    } catch {}
                    innerResolve();
                  });
                };
                checkPromises.push(checkFunction());
              }
            }
            await Promise.all(checkPromises);
          }
          resolve(businessNodes);
        } catch (error) {
          reject();
        }
      });
    }
    updateBmEmail(businessId, newEmail) {
      return new Promise(async (resolve, reject) => {
        try {
          const mainAccount = await this.getMainBmAccounts(businessId);
          const updateResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=4936&_triggerFlowletID=4932", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tskj0szsrnqcv%3APskj1vrgneeya%3A0-Askj0sz1xmluja-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=j&__hs=19994.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=GOOD&__rev=1016895490&__s=o81toq%3Aaxxdno%3Av9875l&__hsi=7419702681638436524&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgEbUy742p046xO2O1VwBwXwEw-G2mcwuE2OwgECu1vwoEcE7O2l0Fwqo5W1bxq0D8gwNxq1izXx-ewt8jwGzEaE8o4-222SU5G4E5yexfwjESq1qwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cwNwDwjouwqo4e220hi7E5y1rwGw9q&__csr=g9_cykBWdbkhsAYSBPkRFitQJDvWZTiq9iHR49HZ44vRKhbFt_tWsTjFFKRjnqqVadaJtCnTR-W-iIx5h2qFuFaLqWKCAlah6HA_iXhbKql4GOtW9eR-DDoCh2enK9puUSurpBuGFBhepypXWGuVuUOl9BiznWDV5ybBKSl5WWJ4gG8BF4mEKvG8xCVHLLyenGA-Kimm5o-anJG44miqAKAaBm48KpAGWm-m48Wm8Vrz4m79UpK5VbWgGquq4bxBx9a68jwLwwgKWBG3S58iyVHxVk2m49EyE8Ulx6u365VqyokCxZ7yElyoK6QUf8nxvwTCwEG3u10wxwYxbwhpo1cbV9oqzQcgpG322C1Ixp0axw2rMljQsbz3G4wl04Zw1CS04wE0HO0dfwrU0NaE0jcwf2EcEpwBDkywda0umtk3S4pK00HSo0cDE1uE2Zabw0z9g8Jm0pO3KbzU1Hy6wKw1eG0f4ARpE0u5U0YBw8J08Khw2rVZwe60x80sUxi05Ny02mk6Q0O2xF6Dw960ciU5e0PA0wpErw288&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25474&lsd=uzpgvQzTYIVG48bw-8QIlT&__spin_r=1016895490&__spin_b=trunk&__spin_t=1727534151&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsUpdateBusinessUserInfoMutation&variables=%7B%22businessUserID%22%3A%22" + mainAccount.id + "%22%2C%22firstName%22%3A%22" + encodeURIComponent(mainAccount.first_name) + "%22%2C%22lastName%22%3A%22" + encodeURIComponent(mainAccount.last_name) + "%22%2C%22email%22%3A%22" + encodeURIComponent(newEmail) + "%22%2C%22clearPendingEmail%22%3Anull%2C%22surface_params%22%3A%7B%22entry_point%22%3A%22BIZWEB_SETTINGS_BUSINESS_INFO_TAB%22%2C%22flow_source%22%3A%22BIZ_WEB%22%2C%22tab%22%3A%22business_info%22%7D%7D&server_timestamps=true&doc_id=8454950507853345",
            method: "POST"
          });
          const updateData = updateResponse.json;
          if (updateData.data.business_settings_update_business_user_personal_info.pending_email === newEmail) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    getBmLimit(businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/business/adaccount/limits/?business_id=" + businessId, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            referrer: "https://business.facebook.com",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: "__a=1&fb_dtsg=" + this.dtsg + "&lsd=" + this.lsd,
            method: "POST"
          });
          let responseData = response.text;
          responseData = JSON.parse(responseData.replace("for (;;);", ""));
          if (responseData.payload) {
            resolve(responseData.payload.adAccountLimit);
          } else if (responseData.blockedAction) {
            resolve(-1);
          } else {
            reject();
          }
        } catch (error) {
          reject();
        }
      });
    }
    backUpBm(businessId, email, role, logCallback) {
      return new Promise(async (resolve, reject) => {
        try {
          // Validaciones de entrada
          if (!businessId || !email || !role) {
            throw new Error("Parámetros requeridos faltantes: BM ID, email o rol");
          }
          
          if (!this.accessToken) {
            throw new Error("Access token no disponible");
          }
          
          let apiRole = "";
          // Actualizado: Usar roles enum correctos según la API v19.0
          if (role === "admin") {
            apiRole = "ADMIN";
          } else if (role === "other") {
            apiRole = "EMPLOYEE";
          } else {
            apiRole = "EMPLOYEE"; // Default fallback
          }
          
          logCallback("Validando access token y enviando invitación al email: " + email);
          
          // Actualizado: Usar API v19.0 y endpoint correcto
          const inviteResponse = await fetch2("https://graph.facebook.com/v19.0/" + businessId + "/business_users?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "email=" + encodeURIComponent(email) + "&role=" + apiRole + "&pretty=0&suppress_http_code=1"
          });
          const inviteData = inviteResponse.json;
          
          if (inviteData && inviteData.id) {
            logCallback("Invitación enviada exitosamente. ID: " + inviteData.id);
            resolve(inviteData.id);
          } else if (inviteData && inviteData.error) {
            logCallback("Error en la invitación: " + (inviteData.error.message || "Error desconocido"));
            console.error("Error de API:", inviteData.error);
            reject(inviteData.error);
          } else {
            logCallback("Error: Respuesta inesperada de la API");
            console.error("Respuesta inesperada:", inviteData);
            reject(new Error("Respuesta inesperada de la API"));
          }
        } catch (error) {
          const errorMsg = "Error al enviar invitación: " + (error.message || error);
          logCallback(errorMsg);
          console.error("Error en backUpBm:", error);
          reject(error);
        }
      });
    }
    renameBm(businessId, newName) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v19.0/" + businessId + "?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F" + businessId + "&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F" + businessId + "&entry_point=business_manager_business_info&locale=vi_VN&method=post&name=" + encodeURIComponent(newName) + "&pretty=0&suppress_http_code=1&version=17.0&xref=f325d6c85530f9c"
          });
          const responseData = response.json;
          if (responseData.id) {
            resolve();
          } else {
            reject();
          }
        } catch (error) {
          console.log(error);
          reject();
        }
      });
    }
    renameVia(userId, newFirstName) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v17.0/" + userId + "?access_token=" + this.accessToken + "&_flowletID=10926&_triggerFlowletID=10926", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness_user&_reqSrc=UserServerActions.brands&first_name=" + newFirstName + "&last_name=" + randomNumberRange(11111, 99999) + "&locale=vi_VN&method=post&personaId=" + userId + "&pretty=0&suppress_http_code=1&xref=f17adcdcd4e2ca4ed",
            method: "POST"
          });
          const responseData = response.json;
          if (responseData.success) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    getInsta(businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v17.0/" + businessId + "/owned_instagram_accounts?access_token=" + this.accessToken + "&__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Fowned_instagram_accounts&_reqSrc=BusinessConnectedOwnedInstagramAccountsStore.brands&date_format=U&fields=%5B%22id_v2%22%2C%22username%22%2C%22profile_pic%22%2C%22owner_business%22%2C%22is_professional%22%2C%22is_reauth_required_for_permissions%22%2C%22is_ig_app_message_toggle_enabled%22%2C%22is_mv4b_profile_locked%22%5D&limit=25&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f8a7bc4b52c89b1ad&_flowletID=2683&_triggerFlowletID=2683");
          const responseData = response.json;
          resolve(responseData);
        } catch (error) {
          reject(error);
        }
      });
    }
    removeInsta(businessId, logCallback) {
      return new Promise(async (resolve, reject) => {
        try {
          const instaData = await this.getInsta(businessId);
          let removedCount = 0;
          const removePromises = [];
          logCallback("Eliminando cuenta IG");
          const removeFunction = accountId => {
            return new Promise(async (innerResolve, innerReject) => {
              try {
                const removeResponse = await fetch2("https://graph.facebook.com/v17.0/" + businessId + "/instagram_accounts?access_token=" + this.accessToken + "&_flowletID=5310&_triggerFlowletID=5310", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness%2Finstagram_accounts&_reqSrc=InstagramAccountActions.brands&instagram_account=" + accountId + "&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f1408f332e8171391",
                  method: "POST"
                });
                const removeData = removeResponse.json;
                if (removeData.success) {
                  removedCount++;
                }
              } catch (error) {
                console.log(error);
              }
              innerResolve();
            });
          };
          for (let i = 0; i < instaData.data.length; i++) {
            const account = instaData.data[i];
            removePromises.push(removeFunction(account.id_v2));
          }
          await Promise.all(removePromises);
          logCallback("Eliminación exitosa de " + removedCount + "/" + instaData.data.length + " cuentas IG");
        } catch {}
        resolve();
      });
    }
    renameAds(adAccountId, newName, isBmAccount = false) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v19.0/" + adAccountId + "?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F" + adAccountId + "&_reqSrc=adsDaoGraphDataMutator&endpoint=%2F" + adAccountId + "&entry_point=ads_manager_settings&locale=vi_VN&method=post&name=" + encodeURIComponent(newName) + "&pretty=0&suppress_http_code=1&version=17.0&xref=f1df3c368d189ac"
          });
          const responseData = response.json;
          if (responseData.success) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    addAdmin(businessId, adminId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v19.0/" + businessId + "/business_users?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "role=ADMIN&user=" + adminId
          });
          const responseData = response.json;
          if (responseData.id) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    changeInfoAds(adAccountId, countryCode, currency, timezone, businessName, businessAddress, logCallback) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v19.0/" + adAccountId + "?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "business_info={\"business_name\":\"" + businessName + "\",\"business_address\":\"" + businessAddress + "\",\"business_country_code\":\"" + countryCode + "\",\"business_city\":\"" + businessAddress + "\",\"business_state\":\"" + businessAddress + "\",\"business_zip\":\"10000\"}&currency=" + currency + "&timezone_id=" + timezone
          });
          const responseData = response.json;
          if (responseData.success) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    getMainBmAccounts(businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v19.0/" + businessId + "/business_users?access_token=" + this.accessToken + "&fields=id,first_name,last_name,email");
          const responseData = response.json;
          const currentUserId = (await getLocalStorage("uid")) || getCookie().split("c_user=")[1].split(";")[0];
          resolve(responseData.data.filter(account => account.id === currentUserId)[0] || responseData.data[0]);
        } catch {
          reject();
        }
      });
    }
    getBmAccounts(businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v19.0/" + businessId + "/client_ad_accounts?access_token=" + this.accessToken + "&fields=id,name,account_status,currency,adtrust_dsl&limit=1000");
          const responseData = response.json;
          resolve(responseData.data);
        } catch {
          reject();
        }
      });
    }
    downgradeRole(businessId, businessUserId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=11539&_triggerFlowletID=11539", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsasm111tcohsq%3APsasm0z1lqubxp%3A0-Asasjvisjl1bu-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=11&__hs=19805.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012269933&__s=0qa5cy%3Aa01ig3%3Ahy5hkd&__hsi=7349479331121257233&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhe5UkBwCwpUnCG6UmCyEgwNxK4UKegdp98Sm4Euxa1txaczES2S2q4U5i486C6EC8yEScx60DUcEixWq3i2q5E6e2qq1eCyUbQUTwJBGEpiwzlBwRyXxK261UxO4VAcK2y5oeEjx63K2y3WE9oO1Wxu0zoO12ypUuwg88EeAUpK1vDwyCwBgak48W2e2i3mbgrzUeUmwoErorx2aK2a4p8y26U8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS2W2K4E5yeDyU52dCxK3WcwMzUkGu3i2WEdEO8wl8hyVEKu9zawLCyKbwzweau1Hwio6-4e1mAK2q1bzFHwCwNwDwjouxK2i2y1sDw9-1Qw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25471&lsd=e6ML1zklGHVeAjzT6hdE8_&__spin_r=1012269933&__spin_b=trunk&__spin_t=1711184003&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BusinessAccountPermissionTasksForUserModalMutation&variables=%7B%22businessUserID%22%3A%22" + businessUserId + "%22%2C%22business_account_task_ids%22%3A%5B%22926381894526285%22%5D%2C%22isUnifiedSettings%22%3Afalse%7D&server_timestamps=true&doc_id=7337443546298507",
            method: "POST"
          });
          const responseData = response.json;
          if (!responseData.errors) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    upgradeRole(businessId, businessUserId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=3129", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsmxjub117xs4l%3APsmxjw7sgqyks%3A0-Asmxjub15hrye4-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=s&__hs=20041.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1018195279&__s=e39j42%3Ax5tt51%3Af3d1fd&__hsi=7437036134981410251&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25465&lsd=swInxA34gvK9OSwF57p5Lb&__spin_r=1018195279&__spin_b=trunk&__spin_t=1731569910&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BusinessAccountPermissionTasksForUserModalMutation&variables=%7B%22businessUserID%22%3A%22" + businessUserId + "%22%2C%22business_account_task_ids%22%3A%5B%22926381894526285%22%2C%22603931664885191%22%2C%221327662214465567%22%2C%22862159105082613%22%2C%226161001899617846786%22%2C%221633404653754086%22%2C%22967306614466178%22%2C%222848818871965443%22%2C%22245181923290198%22%2C%22388517145453246%22%5D%2C%22isUnifiedSettings%22%3Afalse%7D&server_timestamps=true&doc_id=7706501459456230",
            method: "POST"
          });
          const responseData = response.json;
          if (!responseData.errors) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    removeAccount(targetUserId, businessId, retryWithEmail) {
      return new Promise(async (resolve, reject) => {
        try {
          const checkResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=4255", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsp3zazukdpi%3APsp3zay15biznw%3A0-Asp3z7rm1c7vw-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=q&__hs=20083.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=GOOD&__rev=1019078593&__s=h7tq5u%3A0xfovi%3Axmbuqq&__hsi=7452752022536676552&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw5MypU5-0Bo7O2l0Fwqo5W1yw9O48comwkE-UbE7i4UaEW2G261fwwwJK1qxa1ozEjU4Wdwoo4S5ayouxe0hqfwLCyKbw46wbS1LwTwNAK2q0z8co9U4S7E6C13www4kxW1owmUaEeE5K22&__csr=glgDFT5ELRkaOWNmx5aYHnRS-yRsGTp5n-B9uhR8DThmCDNfAjfqFy9dtmuG_HjTF8yVeW-DO__qlkldyti9pbCQ-mFfA-hQlkGAiXiCp4F9LJ2AVRSWtQF5YHLABGV4GGil2J6hdipWyWLhk8huHF7XAX-EzhHQeiFVFJ5AG8Gl4KluuGGqQEWqihABiDoCVHAKF2eq4qGZ4CmiXzFp8ydGm8AgymSVujcECu4agKmrCWCHxDCGA58Km27Z1amXy9oJe7oG5oZ1pUCFUlzFV8O23x92UKbCyA12xeUc88UixGazEB0HK7GwCwKx2m3u8xO4o2GAz8kBwDDwso8U0xC0fXjjAhUZd01fd1q0y0b0K7QzN0ng5C5xlwmE4R01sO0gS0ku19wVx6aIHA81_xO0ezDxO0U82XwemU1yoaE4-0na5UlU4q2G49K0gQE028Ow0-Sc0HEb81ho0SS08rBu0pt08QE7101ie07O4oMW2W1NgfIEow1eq0f7Lt00ZOw5wg0Qb804FE6-04i40fNDw33k0bXwaq2GutwiQ0dbw810aG6U&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25731&lsd=3lg94FqqYWrhBLOzqUqzlY&__spin_r=1019078593&__spin_b=trunk&__spin_t=1735229050&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=GetBusinessSensitiveActionEnumQuery&variables=%7B%22reviewParams%22%3A%7B%22action_type%22%3A%22BUSINESS_REMOVE_USER%22%2C%22business_id%22%3A%22" + businessId + "%22%2C%22remove_user_params%22%3A%7B%22target_user_id%22%3A%22" + targetUserId + "%22%7D%7D%2C%22roleRequestId%22%3A%22%22%2C%22isNotAddAdmin%22%3Atrue%7D&server_timestamps=true&doc_id=7112725228756755",
            method: "POST"
          });
          const checkText = checkResponse.text;
          if (checkText.includes("\"review_process\":\"NONE\"")) {
            const removeResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=4297", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsp3zuu16muqan%3APsp3zuu1y3hh81%3A0-Asp3z7rm1c7vw-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=u&__hs=20083.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=GOOD&__rev=1019078593&__s=jegcdv%3A6i9kbw%3As98h1x&__hsi=7452755096790988499&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw4JwgECu1vw9m1YwBgao6C3m2y1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokG9wOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mwww&__csr=glgDFT5ELRkaOWNmx5aYHnRS-yRsGTp5n-B9uhR8DThmCDNfAjfqFy9dtmuG_HjTF8yVeW-DO__qlkldyti9pbCQ-mFfA-hQlkGAiXiCp4F9LJ2AVRSWtQF5YHLABGV4GGil2J6hdipWyWLhk8huHF7XAX-EzhHQeiFVFJ5AG8Gl4KluuGGqQEWqihABiDoCVHAKF2eq4qGZ4CmiXzFp8ydGm8AgymSVujcECu4agKmrCWCHxDCmA58Km27Z1amXy9oJe7oG5oZ1oMyFu5oWnAz88e4AbG8yVEF1i6EKq4XwMwzxa6EGeyk2KUuF5K6UbEgBwTy8sx60GF8O59o9VU762e08pw3-QQV4ufjg0jPgmw8w2MbxZ8Yg5Q1pxolo5G1dg0ncw4dw57wioeohyHaV20vUsw3EVUswe20KU3BK0oC2G1fw5Oxu5u16wGx2rw4da01X7w3qE0fJz0aW2O0km0dJw26Vnw6ng2da1Mg0kzw1Yx6cewKwsk3Xa680jCw3NXTg0fsE1o40d2O01aq1Lw14x03YpU0MR02-U2CwGDDo4J03iU20g2GxK&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25602&lsd=qst8LNj_XF01FbsYja7ruZ&__spin_r=1019078593&__spin_b=trunk&__spin_t=1735229766&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BizKitSettingsRemoveBusinessUserMutation&variables=%7B%22businessID%22%3A%22" + businessId + "%22%2C%22businessUserID%22%3A%22" + targetUserId + "%22%7D&server_timestamps=true&doc_id=24401670346098526",
              method: "POST"
            });
            const removeText = removeResponse.text;
            if (removeText.includes("\"removed_business_user_id\":\"" + targetUserId + "\"")) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else if (retryWithEmail && checkText.includes("EMAIL_VERIFICATION")) {
            const tempEmailAccount = await getNewEmail();
            const requestReviewResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=14254", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsp5238al5avw%3APsp523617ulfhv%3A0-Asp51sr4mptu7-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=21&__hs=20084.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1019084625&__s=o7y020%3A72s3d7%3Ayv2miq&__hsi=7452967898814735127&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEwn82Dw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25388&lsd=tD-h8jfAcIJCp9QTA2mzVt&__spin_r=1019084625&__spin_b=trunk&__spin_t=1735279313&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=RequestBusinessRemoveUserReviewMutation&variables=%7B%22business_user_id%22%3A%22" + targetUserId + "%22%2C%22verification%22%3A%22EMAIL_VERIFICATION%22%7D&server_timestamps=true&doc_id=6588385494564438",
              method: "POST"
            });
            const reviewId = requestReviewResponse.json.data.xfb_business_settings_request_business_remove_user_review.id;
            const triggerResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=17812&_triggerFlowletID=17800", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsprjwxgxjbxt%3APsprkothunup6%3A0-Asprjldnfqxvs-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=30&__hs=20096.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=MODERATE&__rev=1019207539&__s=bwo10m%3A3ynzfz%3A8smij2&__hsi=7457479931389853262&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw4JwgECu1vw9m1YwBgao6C3m2y1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokG9wOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mwww&__csr=giMPbEIptgPcDmGskADjhbR9rZmHP8purlFR4FHOdYyQyRXmyrWaJKjiLQXV5mHJFOrKN2h5imnRRgDGBQjZaFExrJboDVD8sFidlKlbQV4-WH8JiF-DAJKBLmajADAKBHgjHoACiqcF2XyfAEGmXla-CHQVZ2F8XBFaJJ7CBChaGFrh9KaGrHABJ4nJ9d7DxSifFeqXhaGicyefF7Gu9CmHighQeyoDVeaGh7zQbz98S49oRbzFFk8Gay-UGiaG2IwyunVEnySeG22iUlz8a8C69UrVQ2yfg-8Biy8jGdwAzEhDDxuuiaAwCwMwjoOiUjxK1Iwwwi8b87mh03mU1rExehd5xS2h015Bw2uFc5iwlA1p1oze82Ud85S9y80gKw23jxq0KE8UME3BhExeqgw7i16G0bdw6qHw6Nw4KG0GpUgyoGm0xUrw6wghwDg5unxy0eXw0nio0hpw0iL981UFBo0j4Bw69Iw0Fu486501de0deg0hFghwDgaEF0r82ccmu5od80NW02iu9c06oE0jVg1880juBu08-w9S0biw2TE2AU0zkE3yg0Zt021Vk1igSvg1nk1DwWo0LG0g-3u&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25226&lsd=ZRF0ToV6zypnXO7gW8m6G6&__spin_r=1019207539&__spin_b=trunk&__spin_t=1736329852&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacBvTriggerRootQuery&variables=%7B%22input%22%3A%7B%22authenticatable_entity_id%22%3A%22" + reviewId + "%22%2C%22xfac_config%22%3A%22XFAC_BUSINESS_VERIFICATION_STANDALONE_EMAIL%22%2C%22xfac_appeal_type%22%3A%22BUSINESS_VERIFICATION_STANDALONE_EMAIL%22%2C%22business_verification_design_system%22%3A%22GEODESIC%22%2C%22business_verification_ui_type%22%3A%22BUSINESS_MANAGER_COMET%22%2C%22trigger_event_type%22%3A%22XFAC_BV_ENTRY%22%2C%22nt_context%22%3Anull%2C%22trigger_session_id%22%3A%22e81e7065-6d6e-4a26-8984-3e8bc7df09dd%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8748278645220835",
              method: "POST"
            });
            const triggerData = triggerResponse.json;
            const serializedState = triggerData.data.ixt_xfac_bv_trigger.screen.view_model.serialized_state;
            tempEmailAccount.email = triggerData.data.ixt_xfac_bv_trigger.screen.view_model.content_renderer.advertiser_authenticity_email_challenge_screen.email_addresses[0];
            const emailChallengeResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=15580", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + this.uid + "&__usid=6-Tsprjwxgxjbxt%3APsprkothunup6%3A0-Asprjldnfqxvs-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=31&__hs=20096.HYP%3Abizweb_comet_pkg.2.1.0.0.0&dpr=1&__ccg=MODERATE&__rev=1019207539&__s=rjlsyf%3A3ynzfz%3A8smij2&__hsi=7457479931389853262&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU29zEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R04zwIwuo9oeUa8462mcw4JwgECu1vw9m1YwBgao6C3m2y1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokG9wOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mwww&__csr=giMPbEIptgPcDmGskADjhbR9rZmHP8purlFR4FHOdYyQyRXmyrWaJKjiLQXV5mHJFOrKN2h5imnRRgDGBQjZaFExrJboDVD8sFidlKlbQV4-WH8JiF-DAJKBLmajADAKBHgjHoACiqcF2XyfAEGmXla-CHQVZ2F8XBFaJJ7CBChaGFrh9KaGrHABJ4nJ9d7DxSifFeqXhaGicyefF7Gu9CmHighQeyoDVeaGh7zQbz98S49oRbzFFk8Gay-UGiaG2IwyunVEnySeG22iUlz8a8C69UrVQ2yfg-8Biy8jGdwAzEhDDxuuiaAwCwMwjoOiUjxK1Iwwwi8b87mh03mU1rExehd5xS2h015Bw2uFc5iwlA1p1oze82Ud85S9y80gKw23jxq0KE8UME3BhExeqgw7i16G0bdw6qHw6Nw4KG0GpUgyoGm0xUrw6wghwDg5unxy0eXw0nio0hpw0iL981UFBo0j4Bw69Iw0Fu486501de0deg0hFghwDgaEF0r82ccmu5od80NW02iu9c06oE0jVg1880juBu08-w9S0biw2TE2AU0zkE3yg0Zt021Vk1igSvg1nk1DwWo0LG0g-3u&__comet_req=11&fb_dtsg=" + this.dtsg + "&jazoest=25226&lsd=ZRF0ToV6zypnXO7gW8m6G6&__spin_r=1019207539&__spin_b=trunk&__spin_t=1736329852&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_email_challenge%22%3A%7B%22email_address%22%3A%22" + encodeURIComponent(tempEmailAccount.email) + "%22%2C%22org_id%22%3A%22" + reviewId + "%22%2C%22serialized_state%22%3A%22" + serializedState + "%22%2C%22website%22%3A%22%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8466997430071660",
              method: "POST"
            });
            const serializedStateFromEmail = emailChallengeResponse.json.data.ixt_screen_next.view_model.serialized_state;
            let verificationCode = false;
            for (let i = 0; i < 12; i++) {
              try {
                const emails = (await getEmailInbox(tempEmailAccount.id, tempEmailAccount.email)).filter(code => code.email === "notification@facebookmail.com");
                if (emails[0]) {
                  verificationCode = emails[0].content.match(/([0-9]{6})/)[0];
                  break;
                }
              } catch {}
              await delayTime(2000);
            }
            if (verificationCode) {
              const submitCodeResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=16772", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + this.uid + "&__usid=6-Tsp5238al5avw%3APsp523617ulfhv%3A0-Asp51sr4mptu7-RV%3D6%3AF%3D&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=25&__hs=20084.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=GOOD&__rev=1019084625&__s=bh7b95%3A72s3d7%3Ayv2miq&__hsi=7452967898814735127&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25388&lsd=tD-h8jfAcIJCp9QTA2mzVt&__spin_r=1019084625&__spin_b=trunk&__spin_t=1735279313&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_enter_email_code%22%3A%7B%22check_id%22%3Anull%2C%22code%22%3A%22" + verificationCode + "%22%2C%22serialized_state%22%3A%22" + serializedStateFromEmail + "%22%7D%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8680151995437244",
                method: "POST"
              });
              const finalState = submitCodeResponse.json.data.ixt_screen_next.view_model.serialized_state;
              if (finalState) {
                resolve(true);
              } else {
                resolve(false);
              }
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        } catch (error) {
          console.log(error);
          resolve(false);
        }
      });
    }
    removeAccount2(adminId, businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://business.facebook.com/business/asset_onboarding/business_remove_admin/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "business_id=" + businessId + "&admin_id=" + adminId + "&session_id=2e942068-0721-40b7-a912-4f89f3a72b0e&event_source=PMD&__aaid=0&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=8&__hs=20010.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017311549&__s=n0exl1%3An9jvpp%3Af8agky&__hsi=7425567271958688187&__dyn=7xeUmF3EfXolwCwRyUbFp62-m2q3K2K5U4e1Fx-ewSxu68uxa0z8S2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEwpU1eE4a4o5-0ha2l2Utg6y1uwiU7y3G48comwkE-3a0y83mwkE5G4E6u4U5W0HUkyE16Ec8-3qazo8U3ywbS1Lwqp8aE5G360NE1UU7u1rwGwbu&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25473&lsd=lAqaEcMivHToYG0Fq_qw4b&__spin_r=1017311549&__spin_b=trunk&__spin_t=1728899607&__jssesw=1"
          });
          const responseText = response.text;
          if (responseText.includes("error")) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.log(error);
          resolve(false);
        }
      });
    }
    createAdAccount(businessId, currency, timezone, accountName) {
      return new Promise(async (resolve, reject) => {
        try {
          const mainAccount = await this.getMainBmAccounts(businessId);
          const createResponse = await fetch2("https://graph.facebook.com/v19.0/" + businessId + "/adaccount?access_token=" + this.accessToken, {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccount&_reqSrc=AdAccountActions.brands&ad_account_created_from_bm_flag=true&currency=" + currency + "&end_advertiser=" + businessId + "&invoicing_emails=%5B%5D&locale=vi_VN&media_agency=UNFOUND&method=post&name=" + encodeURIComponent(accountName) + "&partner=UNFOUND&po_number=&pretty=0&suppress_http_code=1&timezone_id=" + timezone + "&xref=f240a980fd9969"
          });
          const createData = createResponse.json;
          if (createData.account_id) {
            try {
              await fetch2("https://business.facebook.com/business/business_objects/update/permissions/", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                body: "asset_ids[0]=" + createData.account_id + "&asset_type=ad-account&business_id=" + businessId + "&roles[0]=151821535410699&roles[1]=610690166001223&roles[2]=864195700451909&roles[3]=186595505260379&user_ids[0]=" + mainAccount.id + "&__user=" + this.uid + "&__a=1&__req=t&__hs=19662.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009606682&__s=2zimvz%3A8blg31%3A9mxlfz&__hsi=7296403044252789266&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyE4a6UjyUV0RAAzpoixW4E5S7UWdwJwCwq8gwqoqyoyazoO4o461twOxa7FEd89EmwoU9FE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WElUScwuEnw8ScwgECu7E422a3Fe6rwnVU8FE9k2B12ewi8doa84K5E6a6S6UgyHwyx6i8wxK2efK7UW1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau1Hwio4m2C4e1mAK2q1bzFHwCwmo4S7ErwAwEwn82Dw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25484&lsd=M7V3k5fl_jTcOKm-KVKVe3&__aaid=0&__bid=" + businessId + "&__spin_r=1009606682&__spin_b=trunk&__spin_t=1698826216&__jssesw=1"
              });
            } catch {}
            resolve(createData.account_id);
          } else {
            reject();
          }
        } catch (error) {
          console.log(error);
          reject();
        }
      });
    }
    createAdAccount2(businessId, currency, timezone, accountName, endAdvertiserId) {
      return new Promise(async (resolve, reject) => {
        try {
          const createResponse = await fetch2("https://graph.facebook.com/v17.0/" + businessId + "/adaccount?access_token=" + this.accessToken + "&_callFlowletID=6343&_triggerFlowletID=6343", {
            headers: {
              accept: "*/*",
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abrand%2Fadaccount&_reqSrc=AdAccountActions.brands&ad_account_created_from_bm_flag=true&currency=" + currency + "&end_advertiser=" + endAdvertiserId + "&invoicing_emails=%5B%5D&locale=vi_VN&media_agency=UNFOUND&method=post&name=" + accountName + "&partner=UNFOUND&po_number=&pretty=0&suppress_http_code=1&timezone_id=" + timezone + "&xref=f050d1e55a85bee6d",
            method: "POST"
          });
          const createData = createResponse.json;
          if (createData.account_id) {
            resolve(createData.account_id);
          } else {
            reject();
          }
        } catch (error) {
          console.log(error);
          reject();
        }
      });
    }
    cancelPending(businessId, logCallback) {
      return new Promise(async (resolve, reject) => {
        try {
          const pendingUsersResponse = await fetch2("https://graph.facebook.com/v17.0/" + businessId + "/pending_users?access_token=" + this.accessToken + "&__cppo=1&_reqName=object%3Abusiness%2Fpending_users&_reqSrc=BusinessConnectedPendingUsersStore.brands&date_format=U&fields=%5B%22id%22%2C%22role%22%2C%22email%22%2C%22decrypted_email%22%2C%22invite_link%22%2C%22invited_user_type%22%2C%22status%22%2C%22permitted_business_account_task_ids%22%2C%22sensitive_action_reviews%22%5D&limit=9999&locale=vi_VN&method=get&pretty=0&sort=name_ascending&suppress_http_code=1&xref=f0e174657d4c29859&_flowletID=1&_triggerFlowletID=2");
          const pendingUsersData = pendingUsersResponse.json;
          const pendingUserIds = pendingUsersData.data.map(user => user.id);
          if (pendingUserIds.length > 0) {
            const totalPending = pendingUsersData.data.length;
            let cancelledCount = 0;
            const cancelPromises = [];
            const cancelSingleInvite = inviteId => {
              return new Promise(async (innerResolve, innerReject) => {
                try {
                  const deleteResponse = await fetch2("https://graph.facebook.com/v17.0/" + inviteId + "?access_token=" + this.accessToken + "&__cppo=1&_flowletID=2480&_triggerFlowletID=2480", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=object%3Abusiness_role_request&_reqSrc=UserServerActions.brands&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&xref=f0067a98f89047e57",
                    method: "POST",
                    mode: "cors"
                  });
                  const deleteData = deleteResponse.json;
                  if (deleteData.success) {
                    cancelledCount++;
                  }
                } catch {}
                innerResolve();
              });
            };
            logCallback("Cancelando " + totalPending + " invitaciones");
            for (let i = 0; i < pendingUserIds.length; i++) {
              const inviteId = pendingUserIds[i];
              cancelPromises.push(cancelSingleInvite(inviteId));
            }
            await Promise.all(cancelPromises);
            logCallback("Cancelación exitosa de " + cancelledCount + "/" + totalPending + " invitaciones");
            resolve();
          } else {
            logCallback("No hay invitaciones");
            reject();
          }
        } catch {
          logCallback("Cancelación de invitaciones fallida");
          reject();
        }
      });
    }
    outBm(businessId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v17.0/" + this.uid + "/businesses?access_token=" + this.accessToken + "&__cppo=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "__activeScenarioIDs=%5B%5D&__activeScenarios=%5B%5D&__interactionsMetadata=%5B%5D&_reqName=path%3A%2F" + this.uid + "%2Fbusinesses&_reqSrc=adsDaoGraphDataMutator&business=" + businessId + "&endpoint=%2F" + this.uid + "%2Fbusinesses&locale=vi_VN&method=delete&pretty=0&suppress_http_code=1&userID=" + this.uid + "&version=17.0&xref=f2e80f8533bb1f4"
          });
          const data = response.json;
          if (data.success) {
            resolve();
          } else {
            reject();
          }
        } catch {
          reject();
        }
      });
    }
    getAdAccounts() {
      return new Promise(async (resolve, reject) => {
        try {
          let accountsData = [];
          try {
            const firstAttemptResponse = await fetch2("https://graph.facebook.com/v14.0/me/adaccounts?limit=99999&fields=name,profile_picture,account_id,account_status,is_prepay_account,owner_business,created_time,next_bill_date,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},balance,owner,users{id,is_active,name,permissions,role,roles},insights.date_preset(maximum){spend},userpermissions.user(" + this.uid + "){role},adspixels{id,name}&access_token=" + this.accessToken + "&summary=1&locale=en_US");
            accountsData = firstAttemptResponse.json;
            accountsData.data = accountsData.data.filter(account => !account.owner_business);
          } catch {
            const secondAttemptResponse = await fetch2("https://adsmanager-graph.facebook.com/v16.0/me/adaccounts?limit=99999&fields=name,profile_picture,account_id,account_status,owner_business,created_time,currency,adtrust_dsl,timezone_name,timezone_offset_hours_utc,disable_reason,adspaymentcycle{threshold_amount},owner,insights.date_preset(maximum){spend},userpermissions.user(" + this.uid + "){role},adspixels{id,name}&summary=1&access_token=" + this.accessToken + "&suppress_http_code=1&locale=en_US");
            accountsData = secondAttemptResponse.json;
            const batchCount = Math.ceil(accountsData.data.length / 50);
            for (let batchIndex = 1; batchIndex <= batchCount; batchIndex++) {
              const startIndex = (batchIndex - 1) * 50;
              const batchSlice = accountsData.data.slice(startIndex, batchIndex * 50);
              const batchRequest = [];
              batchSlice.forEach(acc => {
                batchRequest.push({
                  id: acc.account_id,
                  relative_url: "/act_" + acc.account_id + "?fields=is_prepay_account,next_bill_date,balance,users{id,is_active,name,permissions,role,roles},adspixels{id,name}",
                  method: "GET"
                });
              });
              const batchResponse = await fetch2("https://adsmanager-graph.facebook.com/v16.0?access_token=" + this.accessToken + "&suppress_http_code=1&locale=en_US", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "include_headers=false&batch=" + JSON.stringify(batchRequest),
                method: "POST"
              });
              const batchResult = batchResponse.json;
              for (let i = 0; i < batchResult.length; i++) {
                if (batchResult[i].code == 200) {
                  const accountDetails = JSON.parse(batchResult[i].body);
                  const accountIndex = accountsData.data.findIndex(acc => acc.account_id === accountDetails.id);
                  accountsData.data[accountIndex] = {
                    ...accountsData.data[accountIndex],
                    ...accountDetails
                  };
                }
              }
            }
          }
          let businesses = {};
          try {
            const bizResponse = await fetch2("https://graph.facebook.com/v14.0/me/businesses?limit=99999&access_token=" + this.accessToken);
            const bizData = bizResponse.json;
            if (bizData.data.length) {
              businesses.data = bizData.data;
            }
          } catch {
            businesses.data = [];
            const bizRetryResponse = await fetch2("https://graph.facebook.com/v14.0/me/businesses?limit=1000&access_token=" + this.accessToken);
            const bizRetryData = bizRetryResponse.json;
            bizRetryData.data.forEach(business => {
              businesses.data.push(business);
            });
            let nextPageUrl = bizRetryData.paging.next;
            if (nextPageUrl) {
              for (let i = 0; i < 9999; i++) {
                const pageResponse = await fetch2(nextPageUrl);
                const pageData = pageResponse.json;
                if (pageData.data) {
                  pageData.data.forEach(business => {
                    businesses.data.push(business);
                  });
                }
                if (pageData.paging.next) {
                  nextPageUrl = pageData.paging.next;
                } else {
                  break;
                }
              }
            }
          }
          const processedAccountIds = accountsData.data.map(account => account.account_id);
          if (businesses.data) {
            const fetchAdAccountsForBusiness = (businessId, accountType) => {
              return new Promise(async (innerResolve, innerReject) => {
                try {
                  const bizAdsResponse = await fetch2("https://graph.facebook.com/v14.0/" + businessId + "/" + accountType + "?access_token=" + this.accessToken + "&pretty=1&fields=name%2Cprofile_picture%2Caccount_id%2Caccount_status%2Cis_prepay_account%2Cowner_business%2Ccreated_time%2Cnext_bill_date%2Ccurrency%2Cadtrust_dsl%2Ctimezone_name%2Ctimezone_offset_hours_utc%2Cdisable_reason%2Cadspaymentcycle%7Bthreshold_amount%7D%2Cbalance%2Cowner%2Cusers%7Bid%2Cis_active%2Cname%2Cpermissions%2Crole%2Croles%7D%2Cinsights.date_preset%28maximum%29%7Bspend%7D%2Cuserpermissions.user%28100029138032182%29%7Brole%7D%2Cadspixels%7Bid%2Cname%7D&limit=50");
                  const bizAdsData = bizAdsResponse.json;
                  bizAdsData.data.forEach(adAccount => {
                    if (!processedAccountIds.includes(adAccount.account_id)) {
                      accountsData.data.push(adAccount);
                      processedAccountIds.push(adAccount.account_id);
                    }
                  });
                  let bizAdsNextPageUrl = bizAdsData.paging.next;
                  if (bizAdsNextPageUrl) {
                    for (let i = 0; i < 9999; i++) {
                      const bizAdsNextPageResponse = await fetch2(bizAdsNextPageUrl);
                      const bizAdsNextPageData = bizAdsNextPageResponse.json;
                      if (bizAdsNextPageData.data) {
                        bizAdsNextPageData.data.forEach(adAccountNext => {
                          if (!processedAccountIds.includes(adAccountNext.account_id)) {
                            accountsData.data.push(adAccountNext);
                            processedAccountIds.push(adAccountNext.account_id);
                          }
                        });
                      }
                      if (bizAdsNextPageData.paging.next) {
                        bizAdsNextPageUrl = bizAdsNextPageData.paging.next;
                      } else {
                        break;
                      }
                    }
                  }
                } catch {}
                innerResolve();
              });
            };
            const bizAdsPromises = [];
            for (let i = 0; i < businesses.data.length; i++) {
              const business = businesses.data[i];
              bizAdsPromises.push(fetchAdAccountsForBusiness(business.id, "owned_ad_accounts"));
              bizAdsPromises.push(fetchAdAccountsForBusiness(business.id, "client_ad_accounts"));
            }
            await Promise.all(bizAdsPromises);
          }
          if (accountsData.data) {
            const disableReasonMap = {
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
            resolve(accountsData.data.map(account => {
              account.limit = account.adtrust_dsl;
              account.prePay = account.is_prepay_account ? "TT" : "TS";
              account.threshold = account.adspaymentcycle ? account.adspaymentcycle.data[0].threshold_amount : "";
              account.remain = (account.threshold || 0) - (account.balance || 0);
              account.spend = account.insights ? (account.insights.data[0]?.spend || "0") : "0";
              account.users = account.users ? (account.users.data || []) : [];
              
              let pixels = [];
              if (account.adspixels && account.adspixels.data && Array.isArray(account.adspixels.data)) {
                pixels = account.adspixels.data.map(px => ({ id: px.id, name: px.name }));
              }
              
              const billDate = moment(account.next_bill_date);
              const now = moment();
              const daysToBill = billDate.diff(now, "days");
              const isBillSoon = daysToBill >= 0 && daysToBill <= 3 ? "danger" : "";
              
              const accountStatusMap = {
                "1": "ACTIVE",
                "2": "DISABLED",
                "3": "UNSETTLED",
                "7": "PENDING_RISK_REVIEW",
                "8": "PENDING_SETTLEMENT",
                "9": "IN_GRACE_PERIOD",
                "100": "PENDING_CLOSURE",
                "101": "CLOSED",
                "201": "TAG_FOR_REVENUE_RECOVERY_WHILE_UNDER_RESTRICTION",
                "202": "DISABLED_FOR_BLOCK_FOR_BUSINESS"
              };

              const admins = account.users.filter(user => user.role === 1001);
              
              return {
                status: accountStatusMap[account.account_status],
                statusId: account.account_status,
                type: account.owner_business ? "Business" : "Personal",
                reason: disableReasonMap[account.disable_reason],
                account: account.name,
                adId: account.account_id,
                limit: account.limit,
                spend: account.spend,
                remain: account.remain,
                adminNumber: admins.length,
                nextBillDate: billDate.isValid() ? billDate.format("DD/MM/YYYY") : "N/A",
                nextBillDay: daysToBill < 0 ? 0 : daysToBill,
                createdTime: moment(account.created_time).format("DD/MM/YYYY"),
                timezone: account.timezone_name,
                currency: account.currency + "-" + account.prePay,
                threshold: account.threshold / 100,
                role: (account.userpermissions && account.userpermissions.data && account.userpermissions.data[0]) ? account.userpermissions.data[0].role : "UNKNOWN",
                balance: account.balance / 100,
                bm: account.owner_business ? account.owner_business.id : null,
                pixels: pixels
              };
            }));
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error(error);
          resolve([]);
        }
      });
    }
    checkHold(adAccountId) {
      return new Promise(async (resolve, reject) => {
        const result = {
          status: false,
          country: ""
        };
        try {
          const response = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + this.uid + "&__usid=6-Ts51f1w1gfkvpj%3APs51f2gvheire%3A0-As51f1wdhal3d-RV%3D6%3AF%3D&__user=" + this.uid + "&__a=1&__req=8&__hs=19693.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010170946&__s=ew2ohe%3Afdtegc%3A7il5yk&__hsi=7307960693527437806&__dyn=7xe6Eiw_K5U5ObwyyVp6Eb9o6C2i5VGxK7oG484S7UW3qiidBxa7GzU721nzUmxe1Bw8W4Uqx619g5i2i221qwa62qq1eCBBwLghUbpqG6kE8Ro4uUfo7y78qggwExm3G4UhwXwEwlU-0DU2qwgEhxW10wv86eu1fgaohzE8U6q78-3K5E7VxK48W2a4p8y26UcXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYwGxe1uwciawaG13xC4oiyVV98OEdEGdwzweau0Jomwm8gU5qi2G1bzEG2q362u1IxK321VDx27o72&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25595&lsd=_WnEZ0cRpYEKpFXHPcY7Lg&__aaid=" + adAccountId + "&__spin_r=1010170946&__spin_b=trunk&__spin_t=1701517192&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BillingHubPaymentSettingsViewQuery&variables=%7B%22assetID%22%3A%22" + adAccountId + "%22%7D&server_timestamps=true&doc_id=6747949808592904"
          });
          const responseText = response.text;
          const countryMatch = responseText.match(/(?<=\"predicated_business_country_code\":\")[^\"]*/g);
          if (countryMatch && countryMatch[0]) {
            result.country = countryMatch[0];
          }
          if (responseText.includes("RETRY_FUNDS_HOLD")) {
            result.status = true;
          } else {
            result.status = false;
          }
        } catch {
          result.status = false;
        }
        resolve(result);
      });
    }
    getCard(adAccountId) {
      return new Promise(async (resolve, reject) => {
        let cards = [];
        try {
          const response = await fetch2("https://business.facebook.com/api/graphql/?_flowletID=1", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
          });
          const responseData = response.json;
          cards = responseData.data?.billable_account_by_payment_account?.billing_payment_account?.billing_payment_methods;
        } catch {}
        resolve(cards);
      });
    }
    addCard(adAccountId, cardDetails, paymentMethodType) {
      return new Promise(async (resolve, reject) => {
        const userId = this.uid;
        const dtsgToken = this.dtsg;
        console.log(userId, dtsgToken);
        try {
          const cleanCardNumber = cardDetails.cardNumber.toString().replaceAll(" ", "");
          const expMonth = parseInt(cardDetails.expMonth);
          const expYear = parseInt(cardDetails.expYear);
          const bin = cleanCardNumber.toString().substr(0, 6);
          const last4 = cleanCardNumber.toString().slice(-4);
          let response = false;

          if (paymentMethodType == 1) {
            response = await fetch2("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5755", {
              headers: {
                accept: "*/*",
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + userId + "&payment_dev_cycle=prod&__usid=6-Ts5n9f71tgu6bi%3APs5n9f71o4wo1d%3A0-As5n9es1ukf1sd-RV%3D6%3AF%3D&__user=" + userId + "&__a=1&__req=23&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010409196&__s=tsyyte%3Aca3toj%3Ap91ad2&__hsi=7312337759778035971&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg=" + dtsgToken + "&jazoest=25632&lsd=8pbDxyOWVFHU8ZQqBPXwiA&__aaid=" + adAccountId + "&__spin_r=1010409196&__spin_b=trunk&__spin_t=1702536307&__jssesw=1&qpl_active_flow_ids=270206296&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A56%2C%22logging_id%22%3A%221695426641%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(cardDetails.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + bin + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + last4 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + cleanCardNumber + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + cardDetails.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + expMonth + "%22%2C%22expiry_year%22%3A%2220" + expYear + "%22%2C%22payment_account_id%22%3A%22" + adAccountId + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702536309339_5f530bbf-fed6-4f28-8d5c-48c42769f959%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702536309339_859290be-8180-4b68-a810-97e329d6ff00%22%7D%2C%22actor_id%22%3A%22" + userId + "%22%2C%22client_mutation_id%22%3A%2211%22%7D%7D&server_timestamps=true&doc_id=7203358526347017&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270206296%22%5D",
              method: "POST"
            });
          }

          if (paymentMethodType == 2) {
            response = await fetch2("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=5602", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + userId + "&payment_dev_cycle=prod&__usid=6-Ts5nbs384tvjc%3APs5nbs31x3roaz%3A0-As5nbrg12abp26-RV%3D6%3AF%3D&__user=" + userId + "&__a=1&__req=2c&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010409196&__s=vva7lu%3Ai7twp6%3Ai6haj9&__hsi=7312350885137944044&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq3O11orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg=" + dtsgToken + "&jazoest=25632&lsd=atclR6VUVMWqcQJ9vPCgdL&__aaid=" + adAccountId + "&__spin_r=1010409196&__spin_b=trunk&__spin_t=1702539363&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A36%2C%22logging_id%22%3A%222195093243%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(cardDetails.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + bin + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + last4 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + cleanCardNumber + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + cardDetails.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + expMonth + "%22%2C%22expiry_year%22%3A%2220" + expYear + "%22%2C%22payment_account_id%22%3A%22" + adAccountId + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702539365385_4aba71a2-a333-4dba-9816-d502aa296ad1%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702539445087_1069a84b-5462-4e7c-b503-964f5da85c9e%22%7D%2C%22actor_id%22%3A%22" + userId + "%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }

          if (paymentMethodType == 3) {
            response = await fetch2("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=8308", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + userId + "&payment_dev_cycle=prod&__usid=6-Ts5ncpg15yixvw%3APs5ncpg19n5k27%3A0-As5nco9x6xrcn-RV%3D6%3AF%3D&__user=" + userId + "&__a=1&__req=2h&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010412528&__s=0oatf1%3A21wtco%3A7hru27&__hsi=7312356040330685281&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3Kq2imeGqFEkG4VEHoOqqE88lBxeipe9wNWAAzppFuUuGfxW2u5Eiz8WdyU8ryUKrVoS3u7azoV2EK12xqUC8yEScx6bxW5FQ4Vbz8ix2q9hUhzoizE-Hx6290BAggwwCzoO69UryFE4eaKFprzu6QUCZ0IXGECutk2dmm2adAyXzAbwxyU6O78jCgOVp8W9AylmnyUb8jz98eUS48C11xny-cyo725UiGm1ixWcgsxN6ypVoKcyV8W22m78eF8pK3m2DBCG4UK4EigK7kbAzE8Uqy43mbgOUGfgeEhAwJCxSegroG48gyHx2cAByV8y7rKfxefKaxWi2y2icxaq4VEhGcx22uexm4ofp8rxefzobK4UGaxa2h2pqK6UCQubxu3ydCgqw-yK4UoLzokGp5yrz8CVoaHQfwCz8ym9yA4Ekx24oKqbDypVawwy9pEHCAwzxa3m5EG1LDDV8swhU4embwVzi1y4fz8coiGQU9EeU-eC-5u8BwNU9oboS4ouK5Qq78ohXF3U8pE8FUlxuiueyK5okyEC8wVw&__comet_req=25&fb_dtsg=" + dtsgToken + "&jazoest=25300&lsd=kQwoj2grbvdlOnXmuC9nTM&__aaid=" + adAccountId + "&__spin_r=1010412528&__spin_b=trunk&__spin_t=1702540563&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22US%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A60%2C%22logging_id%22%3A%224034760264%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(cardDetails.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + bin + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + last4 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + cleanCardNumber + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + cardDetails.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + expMonth + "%22%2C%22expiry_year%22%3A%2220" + expYear + "%22%2C%22payment_account_id%22%3A%22" + adAccountId + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702540566252_4f062482-d4e4-4c40-b8c5-c0d643d0e5b4%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702540566252_5d97ef95-3809-4231-a8b3-f487855c965d%22%7D%2C%22actor_id%22%3A%22" + userId + "%22%2C%22client_mutation_id%22%3A%2212%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }

          if (paymentMethodType == 4) {
            response = await fetch2("https://business.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3823", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + userId + "&payment_dev_cycle=prod&__usid=6-Ts5nduusqru6%3APs5nduu1s4ryxb%3A0-As5nduuzgap66-RV%3D6%3AF%3D&__user=" + userId + "&__a=1&__req=1o&__hs=19705.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010413747&__s=a9ss2l%3Aptab0y%3Ae2tqc1&__hsi=7312362442079618026&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxKaxq1UxO4VA48a8lwWxe4oeUa8465udw9-0CE4a4ouyUd85WUpwo-m2C2l0FggzE8U98451KfwXxq1-orx2ewyx6i8wxK2efK2i9wAx25Ulx2iexy223u5U4O222edwKwHxa3O6UW4UnwhFA0FUkyFobE6ycwgUpx64EKuiicG3qazo8U3yDwqU4C5E5y4e1mAK2q1bzEG2q362u1IxK32785Ou48tws8&fb_dtsg=" + dtsgToken + "&jazoest=25289&lsd=WCAAksbHDq9ktWk0fRV9iq&__aaid=" + adAccountId + "&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542054&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A45%2C%22logging_id%22%3A%223760170890%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(cardDetails.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + bin + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + last4 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + cleanCardNumber + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + cardDetails.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + expMonth + "%22%2C%22expiry_year%22%3A%2220" + expYear + "%22%2C%22payment_account_id%22%3A%22" + adAccountId + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542056078_4b48c676-8dff-447d-8576-be8eace3fa70%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542056078_63cbaee3-ff87-45c3-8093-96bbd0331e68%22%7D%2C%22actor_id%22%3A%22" + userId + "%22%2C%22client_mutation_id%22%3A%227%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }

          if (paymentMethodType == 5) {
            response = await fetch2("https://adsmanager.secure.facebook.com/ajax/payment/token_proxy.php?tpe=%2Fapi%2Fgraphql%2F&_flowletID=3674", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "av=" + userId + "&payment_dev_cycle=prod&__usid=6-Ts5nebgytlglm%3APs5ned212v0lbj%3A0-As5nebgnh3ghe-RV%3D6%3AF%3D&__user=" + userId + "&__a=1&__req=1d&__hs=19705.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1010413747&__s=338clt%3Ahvf4zf%3Afrhk6f&__hsi=7312365256460775839&__dyn=7AgSXgWGgWEjgDBxmSudgf64ECbxGuml4AqxuUgBwCwXCwABzGCGq5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF8pK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8kybKfxefKaxWi2y2i7VEjCx6EO489UW5ohwZAxK4U-dwMxeayEiwAgCmq6UCQubxu3ydDxG8wRyK4UoLzokGp5yrz8C9wGLg-9wFy9oCagixi48hyUix6cG228BCyKbwzxa10yUG1LDDV8sw8KmbwVzi1y4fz8coiGQU9EeVVUWrUlUym5UpU9oeUhxWUnposxx7KAfwxCwyDxm5V9UWaV-bxhem9xq2K9AwHxq5kiV89bx5e8wAAAVQEhyeucyEy68WaJ129ho&__comet_req=25&fb_dtsg=" + dtsgToken + "&jazoest=25466&lsd=V93_40ILei7NAmQfSh_tls&__aaid=" + adAccountId + "&__spin_r=1010413747&__spin_b=trunk&__spin_t=1702542709&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingAddCreditCardMutation&variables=%7B%22input%22%3A%7B%22billing_address%22%3A%7B%22country_code%22%3A%22VN%22%7D%2C%22billing_logging_data%22%3A%7B%22logging_counter%22%3A41%2C%22logging_id%22%3A%223115641264%22%7D%2C%22cardholder_name%22%3A%22" + encodeURIComponent(cardDetails.cardName) + "%22%2C%22credit_card_first_6%22%3A%7B%22sensitive_string_value%22%3A%22" + bin + "%22%7D%2C%22credit_card_last_4%22%3A%7B%22sensitive_string_value%22%3A%22" + last4 + "%22%7D%2C%22credit_card_number%22%3A%7B%22sensitive_string_value%22%3A%22" + cleanCardNumber + "%22%7D%2C%22csc%22%3A%7B%22sensitive_string_value%22%3A%22" + cardDetails.cardCsv + "%22%7D%2C%22expiry_month%22%3A%22" + expMonth + "%22%2C%22expiry_year%22%3A%2220" + expYear + "%22%2C%22payment_account_id%22%3A%22" + adAccountId + "%22%2C%22payment_type%22%3A%22MOR_ADS_INVOICE%22%2C%22unified_payments_api%22%3Atrue%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingcreditcard%22%2C%22target_name%22%3A%22useBillingAddCreditCardMutation%22%2C%22user_session_id%22%3A%22upl_1702542711187_368e9941-43bc-4e54-8a9a-78e0e48980fd%22%2C%22wizard_session_id%22%3A%22upl_wizard_1702542711187_088ec65b-5388-4d82-8e28-12533de0fff5%22%7D%2C%22actor_id%22%3A%22" + userId + "%22%2C%22client_mutation_id%22%3A%228%22%7D%7D&server_timestamps=true&doc_id=7203358526347017",
              method: "POST"
            });
          }

          if (response) {
            const responseText = response.text;
            if (responseText.includes("{\"credit_card\":{\"card_association\":\"")) {
              resolve();
            } else {
              reject();
            }
          } else {
            reject();
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    }
    checkHiddenAdmin(adAccountId, businessId = false) {
      return new Promise(async (resolve, reject) => {
        try {
          let response;
          if (businessId) {
            response = await fetch2("https://business.facebook.com/ads/manager/account_settings/information/?act=" + adAccountId + "&pid=p1&business_id=" + businessId + "&page=account_settings&tab=account_information");
          } else {
            response = await fetch2("https://www.facebook.com/ads/manager/account_settings/information/?act=" + adAccountId);
          }
          const responseText = response.text;
          const hiddenAdmins = responseText.match(/\b(\d+)\,(name:null)\b/g);
          if (hiddenAdmins) {
            resolve(hiddenAdmins.map(match => {
              return match.replace(",name:null", "");
            }));
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      });
    }
    getAdsUser(adAccountId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v16.0/act_" + adAccountId + "?access_token=" + this.accessToken + "&__cppo=1&__activeScenarioIDs=[]&__activeScenarios=[]&__interactionsMetadata=[]&_reqName=adaccount&fields=[\"users{id,is_active,name,permissions,role,roles}\"]&locale=en_US&method=get&pretty=0&suppress_http_code=1&xref=f3b1944e6a8b33c&_flowletID=1");
          const responseData = response.json;
          resolve(responseData.users.data);
        } catch (error) {
          reject(error);
        }
      });
    }
    removeAdsUser(adAccountId, userId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/v14.0/act_" + adAccountId + "/users/" + userId + "?method=DELETE&access_token=" + this.accessToken);
          const responseData = response.json;
          if (responseData.success) {
            resolve();
          } else {
            reject();
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    }
    loadAds() {
      return new Promise(async (resolve, reject) => {
        try {
          const savedAds = (await getLocalStorage("dataAds_" + this.uid)) || [];
          if (savedAds.length > 0) {
            $(document).trigger("loadSavedAds", [savedAds]);
          } else {
            const adAccounts = await this.getAdAccounts();
            $(document).trigger("loadAdsSuccess", [adAccounts]);
            const adAccountPromises = [];
            
            const checkAccountDetails = (adId, businessId = false) => {
              return new Promise(async (res, rej) => {
                try {
                  const holdData = await this.checkHold(adId);
                  let paymentMethods = "[]";
                  try {
                    const cards = await this.getCard(adId);
                    paymentMethods = JSON.stringify(cards.filter(card => card.credential.__typename !== "StoredBalance")) || "[]";
                  } catch {}
                  
                  let restrictionStatus = "";
                  if (holdData.status) {
                    restrictionStatus = 999;
                  } else if (businessId) {
                    const qualityResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=1&_triggerFlowletID=2", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      body: "av=" + this.uid + "&__usid=6-Tse1ovt1j8u6wd%3APse1oxj1m4rr33%3A0-Ase1ovtochuga-RV%3D6%3AF%3D&session_id=144e97c8e5fc4969&__aaid=" + adId + "&__bid=" + businessId + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19868.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1013767953&__s=qxxa8s%3Ax39hkh%3Apw4cw7&__hsi=7372940659475198570&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fz98W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAyo884KeCK2q362u1dxW6U98a85Ou0DU7i1TwUw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25134&lsd=nZD2aEOcch1tFKEE4sGoAT&__spin_r=1013767953&__spin_b=trunk&__spin_t=1116646518&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewQuery&variables=%7B%22assetOwnerId%22%3A%223365254127037950%22%2C%22assetId%22%3A%22" + adId + "%22%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=6875615999208668",
                      method: "POST"
                    });
                    const qualityData = qualityResponse.json;
                    const restrictionInfo = qualityData.data.adAccountData.advertising_restriction_info;
                    if (restrictionInfo.ids_issue_type === "AD_ACCOUNT_ALR_DISABLE" && restrictionInfo.status === "APPEAL_PENDING") {
                      restrictionStatus = 4;
                    }
                    if (restrictionInfo.ids_issue_type === "AD_ACCOUNT_ALR_DISABLE" && (restrictionInfo.status === "VANILLA_RESTRICTED" || restrictionInfo.status === "APPEAL_REJECTED")) {
                      restrictionStatus = 5;
                    }
                    if (restrictionInfo.ids_issue_type === "PREHARM_AD_ACCOUNT_BANHAMMER" && restrictionInfo.status === "APPEAL_INCOMPLETE") {
                      restrictionStatus = 6;
                    }
                    if (restrictionInfo.ids_issue_type === "PREHARM_AD_ACCOUNT_BANHAMMER" && restrictionInfo.status === "APPEAL_REJECTED") {
                      restrictionStatus = 7;
                    }
                  }
                  const accountDetails = {
                    id: adId,
                    status: restrictionStatus,
                    country: holdData.country,
                    payment: paymentMethods
                  };
                  $(document).trigger("loadAdsSuccess2", [accountDetails]);
                } catch (error) {
                  console.error(error);
                }
                res();
              });
            };

            adAccounts.forEach(account => {
              if (account.bm) {
                adAccountPromises.push(checkAccountDetails(account.adId, account.bm));
              } else {
                adAccountPromises.push(checkAccountDetails(account.adId));
              }
            });
            await Promise.all(adAccountPromises);
            
            // Cargar píxeles para cuentas que no los tengan
            await this.loadMissingPixels();
          }
          resolve();
        } catch (error) {
          console.error(error);
          reject(error);
        }
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
      return new Promise(async (resolve, reject) => {
        try {
          const savedBm = (await getLocalStorage("dataBm_" + this.uid)) || [];
          if (savedBm.length > 0) {
            $(document).trigger("loadSavedBm", [savedBm]);
          } else {
            const bmList = await this.getBm();
            try {
              const bmStatus = await this.getBmStatus();
              $(document).trigger("loadBmSuccess", [bmStatus]);
            } catch (error) {
              $(document).trigger("loadBmSuccess3", [bmList]);
            }
            try {
              const bmPages = await this.getBmPage();
              $(document).trigger("loadBmSuccess4", [bmPages]);
            } catch (error) {
              console.error(error);
            }
            $(document).trigger("loadBmSuccess2", [bmList]);

            const checkBmDetails = bm => {
              return new Promise(async (res, rej) => {
                try {
                  const adLimit = await this.getBmLimit(bm.id);
                  $(document).trigger("loadLimitSuccess", [{
                    id: bm.id,
                    type: "BM" + adLimit + " - " + moment(bm.created_time).format("DD/MM/YYYY"),
                    limit: adLimit
                  }]);
                } catch {}
                try {
                  const adAccounts = await this.getBmAccounts(bm.id);
                  const accountCount = {
                    id: bm.id,
                    count: adAccounts.length
                  };
                  $(document).trigger("loadQtvSuccess", [accountCount]);
                } catch {}
                try {
                  const instaAccounts = await this.getInsta(bm.id);
                  const instaCount = {
                    id: bm.id,
                    count: instaAccounts.data.length
                  };
                  $(document).trigger("loadInstaSuccess", [instaCount]);
                } catch {}
                res();
              });
            };

            const bmPromises = [];
            for (let i = 0; i < bmList.length; i++) {
              bmPromises.push(checkBmDetails(bmList[i]));
            }
            await Promise.all(bmPromises);
            $(document).trigger("saveData");
          }
          resolve();
        } catch (error) {
          console.error(error);
          reject(error);
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
    switchPage(pageId) {
      return new Promise(async (resolve, reject) => {
        try {
          const cookie = await getCookie();
          await setCookie(cookie + "; i_user=" + pageId);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    }
    switchToMain() {
      return new Promise(async (resolve, reject) => {
        try {
          const cookie = await getCookie();
          await setCookie(cookie.split(";").filter(part => !part.includes("i_user")).join(";"));
          resolve();
        } catch (error) {
          reject();
        }
      });
    }
    getPageData(pageId) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://graph.facebook.com/" + this.uid + "/accounts?access_token=" + this.accessToken);
          const responseData = response.json;
          const page = responseData.data.filter(p => p.id == pageId)[0];
          const settingsPage = await fetch2("https://www.facebook.com/settings?tab=profile&section=name&view");
          const settingsText = settingsPage.text;
          const tokens = settingsText.match(/(?<=\"token\":\")[^\"]*/g).filter(t => t.startsWith("NA"));
          if (page.access_token && tokens[0]) {
            const credentials = {
              token: page.access_token,
              dtsg: tokens[0]
            };
            resolve(credentials);
          } else {
            reject();
          }
        } catch (error) {
          reject(error);
        }
      });
    }
    renamePage(pageId, newName, credentials) {
      return new Promise(async (resolve, reject) => {
        try {
          await fetch2("https://www.facebook.com/ajax/settings/account/name.php", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "cquick_token=" + credentials.token + "&ctarget=https%3A%2F%2Fwww.facebook.com&cquick=jsc_c_1&jazoest=25374&fb_dtsg=" + credentials.dtsg + "&save_password=" + encodeURIComponent(password) + "&pseudonymous_name=" + encodeURIComponent(newName) + "&__user=" + pageId + "&__a=1&__req=4&__hs=19695.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010180631&__s=%3Aut7rwf%3Akoqxot&__hsi=7308682028817560329&__dyn=7xu5Fo4OQ1PyUbAihwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3BwbC0LVE4W0y8460KEswIwuo5-2G1Qw5Mx61vwnE2PwOxS2218w5uwaO0OU3mwkE5G0zE5W0HUvw6ixy0gq0Lo6-1FwbO0NE1rE&__csr=&lsd=HsqF1vTumyjXb6g7r3sn5v&__spin_r=1010180631&__spin_b=trunk&__spin_t=1701685141"
          });
          const verifyResponse = await fetch2("https://graph.facebook.com/" + pageId + "/?fields=name&access_token=" + accessToken);
          const verifyData = verifyResponse.json;
          if (verifyData.name === newName) {
            resolve();
          } else {
            reject();
          }
        } catch (error) {
          reject();
        }
      });
    }
    sharePage(pageId, adminId, credentials) {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            body: "av=" + pageId + "&__user=" + pageId + "&__a=1&__req=g&__hs=19697.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1010231448&__s=zvjw9u%3Ajgblij%3Ah6vy63&__hsi=7309320928293449979&__dyn=7AzHxqUW13xt0mUyEqxemhwLBwopU98nwgUao4u5QdwSxucyUco5S3O2Saw8i2S1DwUx609vCxS320om78bbwto88422y11xmfz83WwtohwGxu782lwv89kbxS2218wc60D8vwRwlE-U2exi4UaEW2au1NxGm2SUbElxm3y3aexfxm16wUws9ovUy2a0SEuBwJCwLyESE2KwwwOg2cwMwrUdUcojxK2B0oobo8oC1Iwqo4e4UcEeEfE-VU&__csr=g9X10x5N7mJ5STnrASKHF4SZRtH88KheiqprWy9VqV8RaGhaKmryqhaAXHy8SjigzV5GXWB-F6i8CCAz9VFUrQGV8qKbV8KqeJ5AFa5ohmJ2e8xjG4A54t5GiqcDG7EjUmCyFoS48OcyoshkV8tXV8OummQayEhxq15xyu8z88Ehho8UjyUiwJxqdzEdZ12bKcwEzU4O3h3pEW5UrxS7UkBw9Sm2qaiy8qwHwDx64e8x-58fU9Ai4aw8K58K4E9axS8x2axW7Eao6K19Cwep0Gwko8Xw5-U0gmxei036q0Y80yu0UE0ajo020Gw0NTw3XU09Io3tw8-1jw4rw2-U2qo6K0fTo-2h020U0eBo1wS8xGyPwoQ1BU2wwby0Fo0FV016ulw5xF0ei0fLwrE6i0w9oB0Xw9m09GwcC08pw4H8it3o0vgw&__comet_req=1&fb_dtsg=" + credentials.dtsg + "&jazoest=25639&lsd=O8kC1RCTsys6PG356SZQnQ&__aaid=0&__spin_r=1010231448&__spin_b=trunk&__spin_t=1701833896&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCoreAppAdminInviteMutation&variables=%7B%22input%22%3A%7B%22additional_profile_id%22%3A%22" + pageId + "%22%2C%22admin_id%22%3A%22" + adminId + "%22%2C%22admin_visibility%22%3A%22Unspecified%22%2C%22grant_full_control%22%3Atrue%2C%22actor_id%22%3A%22" + pageId + "%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=5707097792725637"
          });
          const responseText = response.text;
          if (responseText.includes("errors") && responseText.includes("description")) {
            const errorData = JSON.parse(responseText);
            return reject(errorData.errors[0].description);
          }
          const inviteMatch = responseText.match(/(?<=\"profile_admin_invite_id\":\")[^\"]*/g);
          if (inviteMatch && inviteMatch[0]) {
            resolve(inviteMatch[0]);
          } else {
            reject();
          }
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    }
    checkPage(pageId) {
      return new Promise(async (resolve, reject) => {
        let statusText = "";
        try {
          const response = await fetch2("https://www.facebook.com/api/graphql/", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dxacCxeq4o884O1fAwLzUS2W2K4E5yeDyU52dCgqw-z8K2ifxiFVoa9obGwSz8y1kx6bCyVUCfwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEg5Ku0hi1TwmUaEeE5K227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%2C%22assetId%22%3A%22" + pageId + "%22%7D&server_timestamps=true&doc_id=6228297077225495",
            method: "POST"
          });
          const responseData = response.json;
          if (responseData.data.pageData.advertising_restriction_info.status === "APPEAL_REJECTED_NO_RETRY") {
            statusText = 1;
          }
          if (responseData.data.pageData.advertising_restriction_info.status === "VANILLA_RESTRICTED") {
            statusText = 2;
          }
          if (responseData.data.pageData.advertising_restriction_info.status === "APPEAL_PENDING") {
            statusText = 3;
          }
          if (responseData.data.pageData.advertising_restriction_info.status === "NOT_RESTRICTED") {
            statusText = 4;
          }
          if (responseData.data.pageData.advertising_restriction_info.restriction_type === "BI_IMPERSONATION") {
            statusText = 5;
          }
          if (!responseData.data.pageData.advertising_restriction_info.is_restricted && responseData.data.pageData.advertising_restriction_info.restriction_type === "ALE") {
            statusText = 6;
          }
        } catch {}
        resolve(statusText);
      });
    }
    init() {
      return new Promise(async (resolve, reject) => {
        for (let retryCount = 0; retryCount < 3; retryCount++) {
          try {
            this.accessToken = await getLocalStorage("accessToken");
            this.accessToken2 = await getLocalStorage("accessToken2");
            this.dtsg = await getLocalStorage("dtsg");
            this.dtsg2 = await getLocalStorage("dtsg2");
            try {
              if (this.accessToken) {
                this.userInfo = await this.getUserInfo();
              }
            } catch (error) {
              this.accessToken = false;
              await removeLocalStorage("accessToken");
              await removeLocalStorage("accessToken2");
            }
            if (!this.accessToken || !this.dtsg) {
              const tokenData = await this.getAccessToken().catch(e => {
                console.error("Error obteniendo AccessToken", e);
                return null;
              });
              
              if (tokenData) {
                if (typeof tokenData === 'string') {
                  console.warn("Estado de sesión de FB:", tokenData);
                  // Continuar sin acceso (provocará error más adelante y mostrará "Sin cuenta")
                } else if (tokenData.accessToken && tokenData.dtsg) {
                  this.accessToken = tokenData.accessToken;
                  this.accessToken2 = "";
                  try {
                    this.accessToken2 = await this.getAccessToken2();
                  } catch {}
                  this.userInfo = await this.getUserInfo();
                  this.dtsg = tokenData.dtsg;
                  this.dtsg2 = tokenData.dtsg2;
                  await setLocalStorage("accessToken", this.accessToken);
                  await setLocalStorage("accessToken2", this.accessToken2);
                  await setLocalStorage("dtsg", this.dtsg);
                  await setLocalStorage("dtsg2", this.dtsg2);
                }
              }
            }
            if (this.userInfo && this.userInfo.id) {
               this.uid = this.userInfo.id;
            }
            break;
          } catch (error) {
            console.error("Intento de init " + retryCount + " falló:", error);
          }
        }
        if (this.accessToken && this.dtsg && this.userInfo) {
          resolve();
        } else {
          console.error("FB.init falló: no se obtuvieron tokens de acceso.");
          resolve(); // Resolve anyway so it doesn't crash initUserSession, let via.js gracefully handle the lack of token
        }
      });
    }
    // Método restaurado de la versión OLD para calidad de cuenta
    // Método restaurado de la versión OLD para calidad de cuenta
    getAccountQuality() {
      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch2("https://www.facebook.com/api/graphql/?_flowletID=1&_triggerFlowletID=2", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "av=" + this.uid + "&__usid=6-Tsas5n6h0it5h%3APsas5n4jqrxdy%3A0-Asas5ms1bzoc6y-RV%3D6%3AF%3D&session_id=2791d1615dda0cb8&__aaid=0&__user=" + this.uid + "&__a=1&__req=1&__hs=19805.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012251909&__s=p9dz00%3A3ya0mx%3Aafup89&__hsi=7349388123137635674&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fx6ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAyo884KeCK2q362u1dxW6U98a85Ou0DU7i1TwUw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25334&lsd=" + this.lsd + "&__spin_r=1012251909&__spin_b=trunk&__spin_t=1711162767&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=7327539680662016",
            method: "POST"
          });
          const responseData = await response.json;
          if (!responseData.errors) {
            let qualityStatus = "N/A";
            let badgeType = "";
            const isRestricted = responseData.data.assetOwnerData.advertising_restriction_info.is_restricted;
            const restrictionStatus = responseData.data.assetOwnerData.advertising_restriction_info.status;
            const restrictionType = responseData.data.assetOwnerData.advertising_restriction_info.restriction_type;
            
            if (!isRestricted) {
              if (restrictionType == "PREHARM" && restrictionStatus == "APPEAL_ACCEPTED") {
                qualityStatus = "Verificación Azul VeryID";
                badgeType = "success";
              }
              if (restrictionType == "ALE" && restrictionStatus == "APPEAL_ACCEPTED") {
                qualityStatus = "Verificación Azul 902";
                badgeType = "success";
              }
              if (restrictionStatus == "NOT_RESTRICTED") {
                qualityStatus = "Anuncios en Vivo - Sin Problemas";
                badgeType = "success";
              }
              if (restrictionType == "ADS_ACTOR_SCRIPTING") {
                qualityStatus = "Verificación azul VeryID oculta";
                badgeType = "success";
              }
              if (restrictionStatus == "NOT_RESTRICTED" && restrictionType == "BUSINESS_INTEGRITY") {
                qualityStatus = "Verificación azul 902 oculta";
                badgeType = "success";
              }
            } else {
              if (restrictionStatus == "VANILLA_RESTRICTED" && restrictionType == "BUSINESS_INTEGRITY") {
                qualityStatus = "HCQC 902 VeryID";
                badgeType = "danger";
              }
              if (restrictionStatus == "APPEAL_INCOMPLETE" && restrictionType == "BUSINESS_INTEGRITY") {
                qualityStatus = "VeryID 902 INCOMPLETO";
                badgeType = "danger";
              }
              if (restrictionStatus == "APPEAL_PENDING" && restrictionType == "BUSINESS_INTEGRITY") {
                qualityStatus = "Apelación 902 en Proceso";
                badgeType = "danger";
              }
              if (restrictionStatus == "APPEAL_REJECTED" && restrictionType == "BUSINESS_INTEGRITY") {
                qualityStatus = "HCQC 902 fallido - Reintentar VeryID 273";
                badgeType = "danger";
              }
              if (isRestricted && restrictionType == "PREHARM") {
                if (restrictionStatus == "VANILLA_RESTRICTED") {
                  qualityStatus = "Restricción de Anuncios";
                  badgeType = "danger";
                }
                if (restrictionStatus == "APPEAL_PENDING") {
                  qualityStatus = "Apelación VeryID en Proceso";
                  badgeType = "danger";
                }
                if (restrictionStatus == "APPEAL_INCOMPLETE") {
                  qualityStatus = "VeryID Incompleto";
                  badgeType = "danger";
                }
                if (restrictionStatus == "APPEAL_REJECTED_NO_RETRY" || restrictionStatus == "APPEAL_TIMEOUT") {
                  qualityStatus = "VeryID Fallido - Reintentar VeryID 273";
                  badgeType = "danger";
                }
              }
              if (isRestricted && restrictionType == "ALE") {
                if (restrictionStatus == "APPEAL_PENDING") {
                  qualityStatus = "Apelación 902 en Proceso";
                  badgeType = "warning";
                }
                if (restrictionStatus == "APPEAL_REJECTED_NO_RETRY") {
                  qualityStatus = "HCQC Permanente";
                  badgeType = "danger";
                }
                const ufacState = responseData.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state;
                const appealFriction = responseData.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_friction;
                const appealIneligibilityReason = responseData.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_ineligibility_reason;
                if (restrictionStatus == "VANILLA_RESTRICTED" && (ufacState == "FAILED" || ufacState == "TIMEOUT")) {
                  qualityStatus = "HCQC 902 fallido - Reintentar VeryID 273";
                  badgeType = "danger";
                }
                if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == null && appealFriction == "UFAC") {
                  qualityStatus = "HCQC 902 VeryID";
                  badgeType = "danger";
                }
                if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == null && appealFriction == null && appealIneligibilityReason == "ENTITY_APPEAL_LIMIT_REACHED") {
                  qualityStatus = "HCQC 902 fallido - Reintentar VeryID 273";
                  badgeType = "danger";
                } else if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == null && appealFriction == null) {
                  qualityStatus = "HCQC 902 Seleccionar Línea";
                  badgeType = "danger";
                } else if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == "SUCCESS" && appealFriction == null) {
                  qualityStatus = "HCQC 902 Seleccionar Línea";
                  badgeType = "danger";
                }
              }
              if (isRestricted && (restrictionType == "ACE" || restrictionType === "GENERIC")) {
                qualityStatus = "VeryID Fallido - Reintentar VeryID 273";
                badgeType = "danger";
              }
              if (isRestricted && (restrictionType == "RISK_REVIEW" || restrictionType === "RISK_REVIEW_EMAIL_VERIFICATION")) {
                qualityStatus = "VeryID Punto de Control";
                badgeType = "danger";
              }
              if (restrictionType == "ADS_ACTOR_SCRIPTING") {
                if (restrictionStatus == "APPEAL_REJECTED") {
                  qualityStatus = "VeryID Fallido - Reintentar VeryID 273";
                  badgeType = "danger";
                } else if (restrictionStatus == "APPEAL_PENDING") {
                  qualityStatus = "Apelación VeryID en Proceso";
                  badgeType = "warning";
                } else if (restrictionStatus == "APPEAL_ACCEPTED") {
                  qualityStatus = "Verificación Azul 902";
                  badgeType = "success";
                } else if (restrictionStatus == "APPEAL_INCOMPLETE") {
                  qualityStatus = "VeryID Incompleto";
                  badgeType = "danger";
                } else {
                  qualityStatus = "Restricción de Anuncios";
                  badgeType = "danger";
                }
              }
            }
            const result = {
              status: qualityStatus,
              color: badgeType
            };
            resolve(result);
          } else {
            reject(responseData.errors[0].summary);
          }
        } catch (error) {
          reject(error);
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
    // Función para obtener link XMDT de cuentas publicitarias - Método mejorado basado en código funcional
    getLinkXmdtAds(adAccountId) {
      return new Promise(async (resolve, reject) => {
        try {
          // Validar que tenemos los datos necesarios
          if (!adAccountId || !this.uid || !this.dtsg) {
            throw new Error("Faltan datos necesarios para obtener link XMDT");
          }

          console.log("Iniciando proceso XMDT para cuenta:", adAccountId);

          // Paso 1: Crear apelación usando el método del código funcional
          const createAppealUrl = "https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1661";
          const createAppealBody = "av=" + this.uid + "&session_id=17e613b789f86fcc&__aaid=" + adAccountId + "&__bid=" + adAccountId + "&__user=" + this.uid + "&__a=1&__req=j&__hs=20151.BP%3ADEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1020564878&__s=dr1ti4%3A103eex%3Ahjfkpz&__hsi=7477848285631838275&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSxum4Euxa0z8S2S2q1Ex20zEyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC1Dw4WwgEhxW10wnEtwoVUao9k2B0q85W1bxq1-orx2ewyx6i2GU8U-UbE4S2q4UoG7o2swh8S1qxa1ozEjwnE2Lxi3-1RwrUux616yES2e0UFU2RwrU6CiU9E4KeyE9Eco9U6O6U4R0mVU1587u1rwc6227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25737&lsd=" + (this.lsd || "defaultLsd") + "&__spin_r=1020564878&__spin_b=trunk&__spin_t=1741072229&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBSHGAMEOpenXFACAppealActionMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22enforcement_instance%22%3A%22" + adAccountId + "%22%7D%7D&server_timestamps=true&doc_id=8036119906495815";

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
                    appealId = adAccountId;
                }

                console.log("Appeal ID obtenido:", appealId);

                // Paso 2: Obtener enrollment_id usando el método del código funcional
                const getEnrollmentUrl = "https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=1420";
                const getEnrollmentBody = "av=" + this.uid + "&session_id=1b39647eb945a644&__aaid=" + adAccountId + "&__bid=" + adAccountId + "&__user=" + this.uid + "&__a=1&__req=i&__hs=20151.BP%3ADEFAULT.2.0...0&dpr=1&__ccg=GOOD&__rev=1020564878&__s=g139k8%3A103eex%3Ahwphka&__hsi=7477845871681707178&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSxum4Euxa0z8S2S2q1Ex20zEyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC1Dw4WwgEhxW10wnEtwoVUao9k2B0q85W1bxq1-orx2ewyx6i2GU8U-UbE4S2q4UoG7o2swh8S1qxa1ozEjwnE2Lxi3-1RwrUux616yES2e0UFU2RwrU6CiU9E4KeyE9Eco9U6O6U4R0mVU1587u1rwc6227o&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25762&lsd=" + (this.lsd || "defaultLsd") + "&__spin_r=1020564878&__spin_b=trunk&__spin_t=1741071667&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacActorAppealTriggerRootQuery&variables=%7B%22input%22%3A%7B%22trigger_event_type%22%3A%22XFAC_ACTOR_APPEAL_ENTRY%22%2C%22ufac_design_system%22%3A%22GEODESIC%22%2C%22xfac_id%22%3A%22" + appealId + "%22%2C%22nt_context%22%3Anull%2C%22trigger_session_id%22%3A%22d289e01d-ffc9-43ef-905b-0ee4a5807fd5%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=29439169672340596";

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
                    enrollmentId = adAccountId;
                }

                console.log("Enrollment ID final:", enrollmentId);

                // Verificar que el enrollment_id es válido
                if (enrollmentId && enrollmentId.length > 5) {
                    // Generar el enlace XMDT completo
                    const xmdtLink = "https://www.facebook.com/checkpoint/1501092823525282/" + enrollmentId;
                    
                    // Guardar el enlace en localStorage para seguimiento
                    this.saveXmdtLink(adAccountId, xmdtLink);
                    
                    console.log("Link XMDT generado:", xmdtLink);
                    resolve(enrollmentId);
                } else {
                    throw new Error("No se pudo generar un enrollment_id válido para la cuenta " + adAccountId);
                }

            } catch (e45) {
                console.error("Error en getLinkXmdtAds:", e45);
                
                // Como último recurso, intentar generar un enlace directo
                try {
                    console.log("Intentando método de respaldo...");
                    // Usar el ID de la cuenta directamente como enrollment_id
                    const fallbackId = adAccountId;
                    const fallbackLink = "https://www.facebook.com/checkpoint/1501092823525282/" + fallbackId;
                    
                    // Guardar el enlace de respaldo
                    this.saveXmdtLink(adAccountId, fallbackLink + " (fallback)");
                    
                    console.log("Usando ID de respaldo:", fallbackId);
                    console.log("Link XMDT de respaldo:", fallbackLink);
                    resolve(fallbackId);
                } catch (fallbackError) {
                    reject(new Error("Error al obtener link XMDT: " + (e45.message || "Error desconocido") + ". Método de respaldo también falló."));
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
const existingFb = window.fb || {};
window.fb = new FB();
if (existingFb.uid)         window.fb.uid         = existingFb.uid;
if (existingFb.dtsg)        window.fb.dtsg        = existingFb.dtsg;
if (existingFb.lsd)         window.fb.lsd         = existingFb.lsd;
if (existingFb.cookies)     window.fb.cookies     = existingFb.cookies;
if (existingFb.accessToken) window.fb.accessToken = existingFb.accessToken;
if (existingFb.tokenEAAG)   window.fb.tokenEAAG   = existingFb.tokenEAAG;
if (existingFb.tokenEAAB)   window.fb.tokenEAAB   = existingFb.tokenEAAB;

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