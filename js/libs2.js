/**
 * loadBm
 * Descripción: Carga los datos de Business Manager (BM) del usuario desde localStorage o desde la API de Facebook, y dispara eventos para actualizar la interfaz.
 * Retorna: Promise<void>
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
function loadBm() {
    return new Promise(async (resolve, reject) => {
      try {
        const cachedBmData = (await getLocalStorage("dataBm_" + fb.uid)) || [];
        if (cachedBmData.length > 0) {
          $(document).trigger("loadSavedBm", [cachedBmData]);
        } else {
          const businessManagers = await fb.getBm();
          try {
            const bmStatus = await fb.getBmStatus();
            $(document).trigger("loadBmSuccess", [bmStatus]);
          } catch (e33) {
            $(document).trigger("loadBmSuccess3", [businessManagers]);
          }
          try {
            const bmPages = await fb.getBmPage();
            $(document).trigger("loadBmSuccess4", [bmPages]);
          } catch (e34) {
            console.log(e34);
          }
          $(document).trigger("loadBmSuccess2", [businessManagers]);
          const processBmItem = businessManager => {
            return new Promise(async (processResolve, processReject) => {
              try {
                const bmLimit = await fb.getBmLimit(businessManager.id);
                $(document).trigger("loadLimitSuccess", [{
                  id: businessManager.id,
                  type: "BM" + bmLimit + " - " + moment(businessManager.created_time).format("DD/MM/YYYY"),
                  limit: bmLimit
                }]);
              } catch {}
              try {
                const bmAccounts = await fb.getBmAccounts(businessManager.id);
                const accountsData = {
                  id: businessManager.id,
                  count: bmAccounts.length
                };
                $(document).trigger("loadQtvSuccess", [accountsData]);
              } catch {}
              try {
                const instaData = await fb.getInsta(businessManager.id);
                const instaCount = {
                  id: businessManager.id,
                  count: instaData.data.length
                };
                $(document).trigger("loadInstaSuccess", [instaCount]);
              } catch {}
              processResolve();
            });
          };
          const processingPromises = [];
          for (let bmIndex = 0; bmIndex < businessManagers.length; bmIndex++) {
            processingPromises.push(processBmItem(businessManagers[bmIndex]));
          }
          await Promise.all(processingPromises);
          $(document).trigger("saveData");
        }
        resolve();
      } catch {
        reject();
      }
    });
  }
/**
 * getPage
 * Descripción: Obtiene las páginas de Facebook asociadas al usuario autenticado.
 * Retorna: Promise<Array>
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
function  getPage() {
    return new Promise(async (resolve, reject) => {
      try {
        const graphResponse = await fetch2("https://graph.facebook.com/me/accounts?type=page&fields=id,additional_profile_id,birthday,name,likes,followers_count,is_published,page_created_time,business,perms&access_token=" + this.accessToken);
        const pageData = graphResponse.json.data;
        resolve(pageData);
      } catch {
        reject();
      }
    });
  }
/**
 * switchPage
 * Descripción: Cambia el usuario activo en la cookie a otro usuario (i_user).
 * Parámetros: userId (id del usuario a activar)
 * Retorna: Promise<void>
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
  function switchPage(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        const cookieData = await getCookie();
        await setCookie(cookieData + "; i_user=" + userId);
        resolve();
      } catch (e35) {
        reject(e35);
      }
    });
  }
/**
 * switchToMain
 * Descripción: Restaura el usuario principal en la cookie, eliminando i_user.
 * Retorna: Promise<void>
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
  function switchToMain() {
    return new Promise(async (resolve, reject) => {
      try {
        const cookieData = await getCookie();
        await setCookie(cookieData.split(";").filter(cookieSection => !cookieSection.includes("i_user")).join(";"));
        resolve();
      } catch (e36) {
        reject();
      }
    });
  }
/**
 * getPageData
 * Descripción: Obtiene el token y dtsg de una página específica del usuario.
 * Parámetros: pageId (id de la página)
 * Retorna: Promise<Object> (token y dtsg)
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
  function getPageData(pageId) {
    return new Promise(async (resolve, reject) => {
      try {
        const accountsResponse = await fetch2("https://graph.facebook.com/" + this.uid + "/accounts?access_token=" + this.accessToken);
        const accountsData = accountsResponse.json;
        const pageAccount = accountsData.data.filter(account => account.id == pageId)[0];
        const settingsResponse = await fetch2("https://www.facebook.com/settings?tab=profile&section=name&view");
        const settingsHtml = settingsResponse.text;
        const tokenMatches = settingsHtml.match(/(?<=\"token\":\")[^\"]*/g).filter(tokenMatch => tokenMatch.startsWith("NA"));
        if (pageAccount.access_token && tokenMatches[0]) {
          const pageDataObject = {
            token: pageAccount.access_token,
            dtsg: tokenMatches[0]
          };
          resolve(pageDataObject);
        } else {
          reject();
        }
      } catch (e37) {
        reject(e37);
      }
    });
  }
/**
 * renamePage
 * Descripción: Cambia el nombre de una página de Facebook.
 * Parámetros: pageId (id de la página), newName (nuevo nombre), pageData (objeto con token y dtsg)
 * Retorna: Promise<void>
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
  function renamePage(pageId, newName, pageData) {
    return new Promise(async (resolve, reject) => {
      try {
        await fetch2("https://www.facebook.com/ajax/settings/account/name.php", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "cquick_token=" + pageData.token + "&ctarget=https%3A%2F%2Fwww.facebook.com&cquick=jsc_c_1&jazoest=25374&fb_dtsg=" + pageData.dtsg + "&save_password=" + encodeURIComponent(password) + "&pseudonymous_name=" + encodeURIComponent(newName) + "&__user=" + pageId + "&__a=1&__req=4&__hs=19695.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010180631&__s=%3Aut7rwf%3Akoqxot&__hsi=7308682028817560329&__dyn=7xu5Fo4OQ1PyUbAihwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3BwbC0LVE4W0y8460KEswIwuo5-2G1Qw5Mx61vwnE2PwOxS2218w5uwaO0OU3mwkE5G0zE5W0HUvw6ixy0gq0Lo6-1FwbO0NE1rE&__csr=&lsd=HsqF1vTumyjXb6g7r3sn5v&__spin_r=1010180631&__spin_b=trunk&__spin_t=1701685141"
        });
        const graphResponse = await fetch2("https://graph.facebook.com/" + pageId + "/?fields=name&access_token=" + accessToken);
        const graphData = graphResponse.json;
        if (graphData.name === newName) {
          resolve();
        } else {
          reject();
        }
      } catch (e38) {
        reject();
      }
    });
  }
/**
 * sharePage
 * Descripción: Comparte una página con otro usuario como administrador.
 * Parámetros: pageId (id de la página), adminId (id del admin), dtsgObject (objeto con dtsg)
 * Retorna: Promise<string|void> (id de la invitación o mensaje de error)
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
  function sharePage(pageId, adminId, dtsgObject) {
    return new Promise(async (resolve, reject) => {
      try {
        const graphResponse = await fetch2("https://www.facebook.com/api/graphql/", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "av=" + pageId + "&__user=" + pageId + "&__a=1&__req=g&__hs=19697.HYP%3Acomet_plat_default_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1010231448&__s=zvjw9u%3Ajgblij%3Ah6vy63&__hsi=7309320928293449979&__dyn=7AzHxqUW13xt0mUyEqxemhwLBwopU98nwgUao4u5QdwSxucyUco5S3O2Saw8i2S1DwUx609vCxS320om78bbwto88422y11xmfz83WwtohwGxu782lwv89kbxS2218wc60D8vwRwlE-U2exi4UaEW2au1NxGm2SUbElxm3y3aexfxm16wUws9ovUy2a0SEuBwJCwLyESE2KwwwOg2cwMwrUdUcojxK2B0oobo8oC1Iwqo4e4UcEeEfE-VU&__csr=g9X10x5N7mJ5STnrASKHF4SZRtH88KheiqprWy9VqV8RaGhaKmryqhaAXHy8SjigzV5GXWB-F6i8CCAz9VFUrQGV8qKbV8KqeJ5AFa5ohmJ2e8xjG4A54t5GiqcDG7EjUmCyFoS48OcyoshkV8tXV8OummQayEhxq15xyu8z88Ehho8UjyUiwJxqdzEdZ12bKcwEzU4O3h3pEW5UrxS7UkBw9Sm2qaiy8qwHwDx64e8x-58fU9Ai4aw8K58K4E9axS8x2axW7Eao6K19Cwep0Gwko8Xw5-U0gmxei036q0Y80yu0UE0ajo020Gw0NTw3XU09Io3tw8-1jw4rw2-U2qo6K0fTo-2h020U0eBo1wS8xGyPwoQ1BU2wwby0Fo0FV016ulw5xF0ei0fLwrE6i0w9oB0Xw9m09GwcC08pw4H8it3o0vgw&__comet_req=1&fb_dtsg=" + dtsgObject.dtsg + "&jazoest=25639&lsd=O8kC1RCTsys6PG356SZQnQ&__aaid=0&__spin_r=1010231448&__spin_b=trunk&__spin_t=1701833896&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCoreAppAdminInviteMutation&variables=%7B%22input%22%3A%7B%22additional_profile_id%22%3A%22" + pageId + "%22%2C%22admin_id%22%3A%22" + adminId + "%22%2C%22admin_visibility%22%3A%22Unspecified%22%2C%22grant_full_control%22%3Atrue%2C%22actor_id%22%3A%22" + pageId + "%22%2C%22client_mutation_id%22%3A%222%22%7D%7D&server_timestamps=true&doc_id=5707097792725637"
        });
        const responseText = graphResponse.text;
        if (responseText.includes("errors") && responseText.includes("description")) {
          const errorData = JSON.parse(responseText);
          return reject(errorData.errors[0].description);
        }
        const inviteIdMatches = responseText.match(/(?<=\"profile_admin_invite_id\":\")[^\"]*/g);
        if (inviteIdMatches[0]) {
          resolve(inviteIdMatches[0]);
        } else {
          reject();
        }
      } catch (e39) {
        console.log(e39);
        reject();
      }
    });
  }
/**
 * checkPage
 * Descripción: Verifica el estado de restricción de una página de Facebook.
 * Parámetros: pageId (id de la página)
 * Retorna: Promise<number|string> (código de estado)
 * FASE 2 REFACTOR: Deobfuscated variable names for clarity
 */
  function checkPage(pageId) {
    return new Promise(async (resolve, reject) => {
      let statusCode = "";
      try {
        const graphqlResponse = await fetch2("https://www.facebook.com/api/graphql/", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19552.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1007841040&__s=779bk7%3Adtflwd%3Al2ozr1&__hsi=7255550840262710485&__dyn=7xeUmxa2C5rgydwn8K2abBWqxu59o9E4a2i5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hwgo5qq3a4EuCwQwCxq1zwCCwjFFpobQUTwJHiG6kE8RoeUKUfo7y78qgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2C4oW2e2i3mbxOfxa2y5E5WUru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwQzUS2W2K4E5yeDyU52dCgqw-z8c8-5aDBwEBwKG13y85i4oKqbDyoOEbVEHyU8U3yDwbm1Lwqp8aE4KeCK2q362u1dxW10w8mu&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25578&lsd=pdtuMMg6hmB03Ocb2TuVkx&__spin_r=1007841040&__spin_b=trunk&__spin_t=1689314572&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetViewV2Query&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%2C%22assetId%22%3A%22" + pageId + "%22%7D&server_timestamps=true&doc_id=6228297077225495",
          method: "POST"
        });
        const responseData = graphqlResponse.json;
        if (responseData.data.pageData.advertising_restriction_info.status === "APPEAL_REJECTED_NO_RETRY") {
          statusCode = 1;
        }
        if (responseData.data.pageData.advertising_restriction_info.status === "VANILLA_RESTRICTED") {
          statusCode = 2;
        }
        if (responseData.data.pageData.advertising_restriction_info.status === "APPEAL_PENDING") {
          statusCode = 3;
        }
        if (responseData.data.pageData.advertising_restriction_info.status === "NOT_RESTRICTED") {
          statusCode = 4;
        }
        if (responseData.data.pageData.advertising_restriction_info.restriction_type === "BI_IMPERSONATION") {
          statusCode = 5;
        }
        if (!responseData.data.pageData.advertising_restriction_info.is_restricted && responseData.data.pageData.advertising_restriction_info.restriction_type === "ALE") {
          statusCode = 6;
        }
      } catch {}
      resolve(statusCode);
    });
  }
  function loadPage() {
    return new Promise(async (resolve, reject) => {
      try {
        const cachedPageData = (await getLocalStorage("dataPage_" + fb.uid)) || [];
        if (cachedPageData.length > 0) {
          $(document).trigger("loadSavedPage", [cachedPageData]);
        } else {
          const pagesList = await this.getPage();
          $(document).trigger("loadPageSuccess", [pagesList]);
          const checkPageStatus = page => {
            return new Promise(async (checkResolve, checkReject) => {
              try {
                const pageStatus = await this.checkPage(page.id);
                const pageStatusObject = {
                  id: page.id,
                  status: pageStatus
                };
                $(document).trigger("updatePageStatus", [pageStatusObject]);
              } catch (e40) {}
              checkResolve();
            });
          };
          const statusCheckPromises = [];
          for (let pageIndex = 0; pageIndex < pagesList.length; pageIndex++) {
            statusCheckPromises.push(checkPageStatus(pagesList[pageIndex]));
          }
          await Promise.all(statusCheckPromises);
        }
        resolve();
      } catch {
        reject();
      }
    });
  }
  function loadGroup() {
    return new Promise(async (resolve, reject) => {
      try {
        const cachedGroupData = (await getLocalStorage("dataGroup_" + fb.uid)) || [];
        if (cachedGroupData.length > 0) {
          $(document).trigger("loadSavedGroup", [cachedGroupData]);
        } else {
          const groupsList = await this.getGroup();
          $(document).trigger("loadGroupSuccess", [groupsList]);
        }
        resolve();
      } catch {
        reject();
      }
    });
  }
  function getInvites() {
    return new Promise(async (resolve, reject) => {
      let invitesList = [];
      try {
        const invitesResponse = await fetch2("https://www.facebook.com/api/graphql/", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "av=" + this.uid + "&__aaid=0&__user=" + this.uid + "&__a=1&__req=1n&__hs=19809.HYP2%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1012346269&__s=hlz3t5%3Aqps39g%3Aphae8m&__hsi=7350991099154827576&__dyn=7AzHK4HwBgDx-5Q1ryaxG4Qih09y2O5U4e2CEf9UKbgS3qi7UK360CEboG4E762S1DwUx60xU8k1sw9u0LVEtwMw65xO321Rwwwg8a8462mcw8a1TwgEcEhwGxu782lwj8bU9kbxS210hU31wiE567Udo5qfK0zEkxe2Gexe5E5e7oqBwJK2W5olwUwOzEjUlDw-wQK2616DBx_xWcwoE2mBwFKq2-azo6O14wwwOg2cwMwhEkxebwHwNxe6Uak2-1vwxyo566k1FwgU4q3G3WfKufxa3m7E&__csr=gtgoR2fk4IQZjElbEttlNidNa5h6yN29bOhdvRqaJGBjNQJidZ8Fz9RFGpCkGKJlZ4iOFfFXjmt6GFaFHLt4ABQh4RF997pnjhpGAJER7l5qZCinDRgJkBVanABnh9uZmVppd4QXjLybXvK-KrApp5z8y9FenWRjyBznyFCrGVbGGAAVUTVUgyBhWyV8zxi4p9UqAzUmx2uczrpK-7RCKagCiW-hmcgC4otwNAxeUC4EfF9rUKu9zeexmlabADxycG32E8Qdxi8AwAKFUKUhwyxiu58y2a3y7UmUvg9pHh8lDwhUC5UaJ1ui4-9wLwOwQwKzBwEK8z8KdK5UyUqxO291i4orxuexTAwFxC225EhwtVFA5Egxe3xei8w8Si0jW9KEG4WwUG8h8K2B0Gx0iqaEE8Q3qESB6PRAGl4OQ8AbkJQwyEbonw8aewjA19UaU2MwYgSq9tt1DgCcwjo6q2a0z9rCwLxZx1wbW1owcK19wjA2y58lic3O227Udo6-0HUc8VyHCyFU56Ue-fyqhpU0Li06ro34w32UC1nDw18i8xm0MXwzwcW0fjU6J03dU0P201M8wr804X20H40kyCewh8iBG0rSQ5U5e1lwzg1Fk1awyxu0bdw7tw1Au0P83pw12a68K0LqUqw7hw189wdm0QU0jbw6dwKx61nwlo14Uy0dwg0WW0e5AG0dSo4Whyo3zw1Ni3Nw2041rxe5to2Xwd60mq8yEc8F1504Jziw1iu1Uw16au8w&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25312&lsd=EM5XT5VIDQF8uzBNd5t2fD&__spin_r=1012346269&__spin_b=trunk&__spin_t=1711535989&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=PageCometLaunchpointInvitesRootQuery&variables=%7B%22id%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=7224925170868877"
        });
        const invitesData = invitesResponse.json;
        invitesList = invitesData.data.user.profile_admin_invites.map(invite => {
          const inviteObject = {
            inviteId: invite.profile_admin_invite_id,
            pageId: invite.profile_admin_inviter.id
          };
          return inviteObject;
        });
      } catch (e41) {
        console.log(e41);
      }
      resolve(invitesList);
    });
  }
  function acceptPage(invite) {
    return new Promise(async (resolve, reject) => {
      try {
        const acceptResponse = await fetch2("https://www.facebook.com/api/graphql/", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "av=" + this.uid + "&__aaid=0&__user=" + this.uid + "&__a=1&__req=1t&__hs=19809.HYP2%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=GOOD&__rev=1012346269&__s=58dfwt%3Aqps39g%3Ad4ou37&__hsi=7350991530179737815&__dyn=7AzHK4HwkEng5K8G6EjBAg2owIxu13wFwnUW3q2ibwNw9G2Saw8i2S1DwUx60GE3Qwb-q7oc81xoswMwto886C11wBz83WwgEcEhwGxu782lwv89kbxS2218wc61awkovwRwlE-U2exi4UaEW2G1jxS6FobrwKxm5o7G4-5pUfEe88o4Wm7-7EO0-poarCwLyES1Iwh888cA0z8c84q58jyUaUcojxK2B08-269wkopg6C13whEeE4WVU-4Edouw&__csr=gtgoR6itgmjRlEnTIrsKx3dOi8l4qTP8AL9kHvRqayGBjEnOH8T8K8Fd9paDDi8EBRVkLqjW-8m8ypWFADQiimXh8JetCmbDUCPoJ2HozHDHy-mdKaABx24payV8izXLHzobUS7ERwKBGaxqUozosyd2U9FpUO58mx27VEzKU89EWaAKq9zoC18xy68ym1rx62-5ob85a17zk1Txi7898fWxO1HAxS0B81dEiAwCwo88Ukw50w-w7bw5hw1jy0oG0ii1So88mwEwd2037a07j40XpU092U03g4g0TKQ5U5e1lwzg0yO04GU0p7wcO0So04va09Yw0pPk1rxe5to6m1lw2go0sXw3oU&__comet_req=15&fb_dtsg=" + this.dtsg + "&jazoest=25593&lsd=DKpGY6WjRs4LdeRqjPDpX2&__spin_r=1012346269&__spin_b=trunk&__spin_t=1711536089&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfilePlusCometAcceptOrDeclineAdminInviteMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + this.uid + "%22%2C%22is_accept%22%3Atrue%2C%22profile_admin_invite_id%22%3A%22" + invite.inviteId + "%22%2C%22user_id%22%3A%22" + this.uid + "%22%7D%2C%22scale%22%3A1%2C%22__relay_internal__pv__VideoPlayerRelayReplaceDashManifestWithPlaylistrelayprovider%22%3Afalse%7D&server_timestamps=true&doc_id=25484830601161332"
        });
        const acceptData = acceptResponse.json;
        if (acceptData.data.accept_or_decline_profile_plus_admin_invite.id === this.uid) {
          resolve();
        } else {
          reject();
        }
      } catch (e42) {
        reject(e42);
      }
    });
  }
  function getAccountQuality() {
    return new Promise(async (resolve, reject) => {
      try {
        const qualityResponse = await fetch2("https://www.facebook.com/api/graphql/?_flowletID=1&_triggerFlowletID=2", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          body: "av=" + this.uid + "&__usid=6-Tsas5n6h0it5h%3APsas5n4jqrxdy%3A0-Asas5ms1bzoc6y-RV%3D6%3AF%3D&session_id=2791d1615dda0cb8&__aaid=0&__user=" + this.uid + "&__a=1&__req=1&__hs=19805.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1012251909&__s=p9dz00%3A3ya0mx%3Aafup89&__hsi=7349388123137635674&__dyn=7xeUmxa2C5rgydwn8K2abBAjxu59o9E6u5VGxK5FEG484S4UKewSAxam4EuGfwnoiz8WdwJzUmxe1kx21FxG9xedz8hw9yq3a4EuCwQwCxq1zwCCwjFFpobQUTwJBGEpiwzlwXyXwZwu8sxF3bwExm3G4UhwXxW9wgo9oO1Wxu0zoO12ypUuwg88EeAUpK19xmu2C2l0Fx6ewzwAwRyQ6U-4Ea8mwoEru6ogyHwyx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e18w9Cu0Jo6-4e1mAyo884KeCK2q362u1dxW6U98a85Ou0DU7i&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25334&lsd=" + this.lsd + "&__spin_r=1012251909&__spin_b=trunk&__spin_t=1711162767&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=AccountQualityHubAssetOwnerViewQuery&variables=%7B%22assetOwnerId%22%3A%22" + this.uid + "%22%7D&server_timestamps=true&doc_id=7327539680662016",
          method: "POST"
        });
        const responseData = qualityResponse.json;
        if (!responseData.errors) {
          let statusMessage = "N/A";
          let statusColor = "";
          const isRestricted = responseData.data.assetOwnerData.advertising_restriction_info.is_restricted;
          const restrictionStatus = responseData.data.assetOwnerData.advertising_restriction_info.status;
          const restrictionType = responseData.data.assetOwnerData.advertising_restriction_info.restriction_type;
          if (!isRestricted) {
            if (restrictionType == "PREHARM" && restrictionStatus == "APPEAL_ACCEPTED") {
              statusMessage = "Verificado XMDT";
              statusColor = "success";
            }
            if (restrictionType == "ALE" && restrictionStatus == "APPEAL_ACCEPTED") {
              statusMessage = "Verificado 902";
              statusColor = "success";
            }
            if (restrictionStatus == "NOT_RESTRICTED") {
              statusMessage = "Live Ads - Sin Problemas";
              statusColor = "success";
            }
            if (restrictionType == "ADS_ACTOR_SCRIPTING") {
              statusMessage = "Verificado XMDT oculto";
              statusColor = "success";
            }
            if (restrictionStatus == "NOT_RESTRICTED" && restrictionType == "BUSINESS_INTEGRITY") {
              statusMessage = "Verificado 902 oculto";
              statusColor = "success";
            }
          } else {
            if (restrictionStatus == "VANILLA_RESTRICTED" && restrictionType == "BUSINESS_INTEGRITY") {
              statusMessage = "Restricción 902 XMDT";
              statusColor = "danger";
            }
            if (restrictionStatus == "APPEAL_INCOMPLETE" && restrictionType == "BUSINESS_INTEGRITY") {
              statusMessage = "XMDT 902 INCOMPLETO";
              statusColor = "danger";
            }
            if (restrictionStatus == "APPEAL_PENDING" && restrictionType == "BUSINESS_INTEGRITY") {
              statusMessage = "Apelando 902";
              statusColor = "danger";
            }
            if (restrictionStatus == "APPEAL_REJECTED" && restrictionType == "BUSINESS_INTEGRITY") {
              statusMessage = "Restricción 902 rechazada - Volver a XMDT 273";
              statusColor = "danger";
            }
            if (isRestricted && restrictionType == "PREHARM") {
              if (restrictionStatus == "VANILLA_RESTRICTED") {
                statusMessage = "Restricción Publicitaria";
                statusColor = "danger";
              }
              if (restrictionStatus == "APPEAL_PENDING") {
                statusMessage = "Apelando XMDT";
                statusColor = "danger";
              }
              if (restrictionStatus == "APPEAL_INCOMPLETE") {
                statusMessage = "XMDT Incompleto";
                statusColor = "danger";
              }
              if (restrictionStatus == "APPEAL_REJECTED_NO_RETRY" || restrictionStatus == "APPEAL_TIMEOUT" || restrictionStatus == "APPEAL_TIMEOUT") {
                statusMessage = "XMDT Rechazado - Volver a XMDT 273";
                statusColor = "danger";
              }
            }
            if (isRestricted && restrictionType == "ALE") {
              if (restrictionStatus == "APPEAL_PENDING") {
                statusMessage = "Apelando 902";
                statusColor = "warning";
              }
              if (restrictionStatus == "APPEAL_REJECTED_NO_RETRY") {
                statusMessage = "Restricción Permanente";
                statusColor = "danger";
              }
              const ufacState = responseData.data.assetOwnerData.advertising_restriction_info.additional_parameters.ufac_state;
              const appealFriction = responseData.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_friction;
              const appealIneligibilityReason = responseData.data.assetOwnerData.advertising_restriction_info.additional_parameters.appeal_ineligibility_reason;
              if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == "FAILED" || restrictionStatus == "VANILLA_RESTRICTED" && ufacState == "TIMEOUT") {
                statusMessage = "XMDT 902 Fallado - Volver a XMDT 273";
                statusColor = "danger";
              }
              if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == null && appealFriction == "UFAC") {
                statusMessage = "XMDT 902 Fallado - Volver a XMDT 273";
                statusColor = "danger";
              }
              if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == null && appealFriction == null && appealIneligibilityReason == "ENTITY_APPEAL_LIMIT_REACHED") {
                statusMessage = "XMDT 902 Fallado - Volver a XMDT 273";
                statusColor = "danger";
              } else {
                if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == null && appealFriction == null) {
                  statusMessage = "XMDT 902 Fallado - Volver a XMDT 273";
                  statusColor = "danger";
                }
                if (restrictionStatus == "VANILLA_RESTRICTED" && ufacState == "SUCCESS" && appealFriction == null) {
                  statusMessage = "XMDT 902 Fallado - Volver a XMDT 273";
                  statusColor = "danger";
                }
              }
            }
            if (isRestricted && restrictionType == "ACE" || restrictionType === "GENERIC") {
              statusMessage = "XMDT Fallado - Volver a XMDT 273";
              statusColor = "danger";
            }
            if (isRestricted && restrictionType == "RISK_REVIEW" || restrictionType === "RISK_REVIEW_EMAIL_VERIFICATION") {
              statusMessage = "XMDT Checkpoint";
              statusColor = "danger";
            }
            if (restrictionType == "ADS_ACTOR_SCRIPTING") {
              if (restrictionStatus == "APPEAL_REJECTED") {
                statusMessage = "XMDT Fallado - Volver a XMDT 273";
                statusColor = "danger";
              } else if (restrictionStatus == "APPEAL_PENDING") {
                statusMessage = "Apelando XMDT";
                statusColor = "warning";
              } else if (restrictionStatus == "APPEAL_ACCEPTED") {
                statusMessage = "Verificado 902";
                statusColor = "success";
              } else if (restrictionStatus == "APPEAL_INCOMPLETE") {
                statusMessage = "XMDT Incompleto";
                statusColor = "danger";
              } else {
                statusMessage = "Restricción Publicitaria";
                statusColor = "danger";
              }
            }
          }
          const qualityStatusObject = {
            status: statusMessage,
            color: statusColor
          };
          resolve(qualityStatusObject);
        } else {
          reject(responseData.errors[0].summary);
        }
      } catch (e43) {
        reject(e43);
      }
    });
  }
  function getLinkAn() {
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
function getLinkXmdtAds(p237) {
    return new Promise(async (p238, p239) => {
      try {
        // Validar que tenemos los datos necesarios
        if (!p237 || !this.uid || !this.dtsg) {
          throw new Error("Faltan datos necesarios para obtener link XMDT");
        }

        // Paso 1: Obtener información de la cuenta publicitaria
        const v239 = await fetch2("https://business.facebook.com/api/graphql/", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=1&__hs=19699.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1010282616&__s=flj1ty:75294s:o83s9c&__hsi=7310049091311550655&__dyn=7xeUmxa3-Q5E9EdoK2abBAqwIBwCwgE98nCG6UtyEgwjojyUW3qiidBxa7GzU726US2Sfxq4U5i4824yoyaxG4o4B0l898885G0Eo9FE4Wqmm2Z17wJBGEpiwzlBwgrxK261UxO4VA48a8lwWxe4oeUa85vzo2vw9G12x67EK3i1uK6o6fBwFwBgak48W2e2i11grzUeUmwvC6UgzE8EhAy88rwzzXwAyo98gxu5ogAzEowwwTxu1cwwwzzobEaUiwYxKexe5U4qp0au58Gm2W1Ez84e6ohxabDAAzawSyES2e0UFU6K19xq1ox3wlFbwCwiUWawCwNwDwr8rwMxO1sDx27o72&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25610&lsd=HExoeF2styyeq_LWWUo9db&__aaid=" + p237 + "&__spin_r=1010282616&__spin_b=trunk&__spin_t=1702003435&__jssesw=1&variables={\"paymentAccountID\":\"" + p237 + "\"}&doc_id=5746473718752934"
        });
        
        if (!v239 || !v239.json) {
          throw new Error("No se pudo obtener información de la cuenta publicitaria");
        }

        const v240 = v239.json;
        
        // Verificar que la respuesta contiene los datos esperados
        if (!v240.data || !v240.data.billable_account_by_payment_account) {
          throw new Error("La cuenta publicitaria no tiene información de facturación válida");
        }

        const v241 = v240.data.billable_account_by_payment_account.id;
        
        if (!v241) {
          throw new Error("No se pudo obtener el ID de la cuenta de facturación");
        }

        // Paso 2: Obtener información de restricciones
        const v242 = await fetch2("https://www.facebook.com/api/graphql/", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "av=" + this.uid + "&__user=" + this.uid + "&__a=1&__req=14&__hs=20097.BP:DEFAULT.2.0.0.0.0&dpr=1&__ccg=EXCELLENT&__rev=1019227852&__s=0iltbe:dvrmaz:103jkm&__hsi=7457852865934213148&__dyn=7xeUmxa3-Q5E9EdoK2Wmhe2Om2q1Dxuq3O1Fx-ewSAxam4Euxa1twKzobo9E6y4824yoyaxG4o2oCwho5G0O85mqbwgEbUy742ppU467U8o2lxe68a8522m3K7EC11wBz8188O12x67E421uxS1zDwFwBgak1EwRwEwiUmwvDxC48W2a4p8aHwzzXwKwjo9EjxyEtw9O222edwmEiwm8W4U5W0DU-58fU7m1LxW4o-3qazo8U3yDwbm1LwqpbBwwwiUWawCwNwDwr8rwjk1rDw4kwtU5K2G0yVHwwxS&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25406&lsd=ezom4RfqRqejfUWS5IqHv-&__spin_r=1019227852&__spin_b=trunk&__spin_t=1736416683&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useAccountQualityHubIssueQueryWrapperQuery&variables={\"id\":\"" + v241 + "\",\"startTime\":null}&server_timestamps=true&doc_id=8742430529208614"
        });

        if (!v242 || !v242.json) {
          throw new Error("No se pudo obtener información de restricciones");
        }

        const v243 = v242.json;
        
        // Verificar que hay información de restricciones
        if (!v243.data || !v243.data.node || !v243.data.node.advertising_restriction_info) {
          throw new Error("La cuenta no tiene restricciones XMDT activas");
        }

        const restrictionInfo = v243.data.node.advertising_restriction_info;
        const v244 = restrictionInfo.additional_parameters?.paid_actor_root_appeal_container_id;
        const v245 = restrictionInfo.ids_issue_ent_id;
        const v246 = restrictionInfo.additional_parameters?.decision_id;
        const v247 = restrictionInfo.additional_parameters?.friction_decision_id;

        // Intentar diferentes métodos para obtener el enrollment_id
        let enrollmentId = null;

        // Método 1: paid_actor_root_appeal_container_id
        if (v244) {
          try {
            const v248 = await fetch2("https://business.facebook.com/accountquality/ufac/?entity_id=" + p237 + "&paid_actor_root_appeal_container_id=" + v244 + "&entity_type=2&_callFlowletID=2181&_triggerFlowletID=2181", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__user=" + this.uid + "&__a=1&__req=u&__hs=19832.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1012906458&__s=9ubr7j:rv9koe:ds4ihh&__hsi=7359564425697670285&__dyn=7xeUmxa2C5rgydwCwRyU8EKmhe5UkBwCwpUnCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx60C9EcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo462mcwuEnw8ScwgECu7E422a3Fe6rwiolDwFwBgak48W2e2i3mbgrzUiwExq1yxJUpx2awCx6i8wxK2efK2W1dx-q4VEhG7o4O1fwwxefzobEaUiwm8Wubwk8Sq6UfEO32fxiFUd8bGwgUy1kx6bCyVUCcG2-qaUK2e0UFU2RwrU6CiVo884KeCK2q362u1dxW6U98a85Ou0DU7i1Tw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25352&lsd=MPaEvH-IKd3rimyUrjtr5C&__spin_r=1012906458&__spin_b=trunk&__spin_t=1713532122&__jssesw=1"
            });
            
            if (v248 && v248.text) {
              const cleanText = v248.text.replace("for (;;);", "");
              const v249 = JSON.parse(cleanText);
              if (v249.payload && v249.payload.enrollment_id) {
                enrollmentId = v249.payload.enrollment_id;
              }
            }
          } catch (e) {
            console.log("Método 1 falló:", e);
          }
        }

        // Método 2: decision_id
        if (!enrollmentId && v246 && v245) {
          try {
            const v251 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v246 + "&ids_issue_id=" + v245 + "&entity_type=2&entity_id=" + p237 + "&_flowletID=9999", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__user=" + this.uid + "&__a=1&__req=q&__hs=19649.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009336620&__s=vkojb0:tpoa7e:m367w6&__hsi=7291509895584633584&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25489&lsd=QTfKpPcJRl9RAFTWridNry&__aaid=0&__spin_r=1009336620&__spin_b=trunk&__spin_t=1697686941"
            });
            
            if (v251 && v251.text) {
              const cleanText = v251.text.replace("for (;;);", "");
              const v252 = JSON.parse(cleanText);
              if (v252.payload && v252.payload.enrollment_id) {
                enrollmentId = v252.payload.enrollment_id;
              }
            }
          } catch (e) {
            console.log("Método 2 falló:", e);
          }
        }

        // Método 3: friction_decision_id
        if (!enrollmentId && v247 && v245) {
          try {
            const v254 = await fetch2("https://www.facebook.com/accountquality/ufac/?decision_id=" + v247 + "&ids_issue_id=" + v245 + "&entity_type=2&entity_id=" + p237 + "&_flowletID=2169", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "__user=" + this.uid + "&__a=1&__req=u&__hs=19655.BP:DEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009465523&__s=417qpb:lchip2:yq4pb1&__hsi=7293818531390316856&__dyn=7xeUmxa2C5rgydwCwRyU8EKnFG5UkBwCwgE98nCG6UmCyEgwjojyUW3qi4FoixWE-1txaczES2Sfxq4U5i486C6EC8yEScx611wlFEcEixWq3i2q5E6e2qq1eCBBwLjzu2SmGxBa2dmm3mbK6U8o7y78jCgOUa8lwWxe4oeUuyo465udz87G5U2dz84a9DxW10wywWjxCU4C5pUao9k2B12ewzwAwRyUszUiwExq1yxJUpx2aK2a4p8y26U8U-UbE4S7VEjCx6Etwj84-3ifzobEaUiwm8Wubwk8Sp1G3WcwMzUkGum2ym2WE4e8wl8hyVEKu9zawLCyKbwzwi82pDwbm1Lx3wlFbBwwwiUWqU9Eco9U4S7ErwAwEwn9U2vw&__csr=&fb_dtsg=" + this.dtsg + "&jazoest=25548&lsd=A-HDfPRVoR7YG2zHwlCDBx&__aaid=0&__spin_r=1009465523&__spin_b=trunk&__spin_t=1698224463"
            });
            
            if (v254 && v254.text) {
              const cleanText = v254.text.replace("for (;;);", "");
              const v255 = JSON.parse(cleanText);
              if (v255.payload && v255.payload.enrollment_id) {
                enrollmentId = v255.payload.enrollment_id;
              }
            }
          } catch (e) {
            console.log("Método 3 falló:", e);
          }
        }

        // Verificar si obtuvimos el enrollment_id
        if (enrollmentId) {
          p238(enrollmentId);
        } else {
          throw new Error("No se pudo obtener el enrollment_id. La cuenta puede no tener restricciones XMDT activas o los parámetros han cambiado.");
        }

      } catch (e45) {
        console.error("Error en getLinkXmdtAds:", e45);
        p239(new Error("Error al obtener link XMDT: " + (e45.message || "Error desconocido")));
      }
    });
  }
function  createBm(p240, p241) {
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
function  createPage(p244) {
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
function  getSiteKey(p247) {
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
  function khang902Api2(p250, p251 = "", p252 = {}) {
    return new Promise(async (p253, p254) => {
      const v271 = fb.dtsg;
      const vLS5FnEglTcQSfqnuBkn03g = "5FnEglTcQSfqnuBkn03g";
      const v272 = fb.accessToken;
      const vLS902 = "902";
      const v273 = fb.uid;
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
          return p254("No se puede apelar 902");
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
          p250("Seleccionando línea");
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
          p250("Resolviendo captcha");
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
              p250("Intentando resolver captcha nuevamente");
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
            p250("Captcha resuelto con éxito");
          } else {
            return p254("Captcha fallado");
          }
        }
        const v301 = v289.__typename === "UFACContactPointChallengeSubmitCodeState";
        if (v301) {
          p250("Eliminando número de teléfono antiguo");
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
            return p254("No se puede eliminar el número de teléfono antiguo");
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
                  p250("Intentando obtener otro número de teléfono");
                } else {
                  p250("Obteniendo número de teléfono");
                }
                try {
                  v305 = await getPhone(p252.general.phoneService.value, p252.general.phoneServiceKey.value);
                  p250("Añadiendo número de teléfono");
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
                p250("Esperando código de activación");
                try {
                  const v312 = await getPhoneCode(p252.general.phoneService.value, p252.general.phoneServiceKey.value, v305.id);
                  p250("Ingresando código de activación");
                  const v313 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=6114", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    body: "av=" + v273 + "&__usid=6-Ts32wgfj93yg8:Ps32wghqo2o2z:0-As32wgf5csdw0-RV=6:F=&session_id=3b23e41ba7202d8a&__user=" + v273 + "&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=bi5lni:5ecvmf:ccuxta&__hsi=7293830080792611326&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwDzElx63Si2-fzobK4UGaxa2h2pqK6UCQubxu3ydDxG3WaUjxy-dxiFAm9KcyrBwGLg-3e8ByoF1a58gx6bCyVUCuQFEpy9pEHCAG224EdomBAwrVAvAwvoaFoK3Cd868g-cwNxaHjxa4Uak48-eCK5u8BwNU9oboS4ouK5Qq6KeykuWg-26q6oyu5osAGeyK5okyEC8w&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25640&lsd=6Ne_nXUdqyapLuYMHYV87_&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698227152&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"1\",\"actor_id\":\"" + v273 + "\",\"action\":\"SUBMIT_CODE\",\"code\":\"" + v312 + "\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
                  });
                  const v314 = v313.text;
                  if (v314.includes("\"ufac_client\":{\"id\"")) {
                    p250("Añadiendo número de teléfono con éxito");
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
                  p250("Eliminando número de teléfono antiguo");
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
                    return p254("No se puede eliminar el número de teléfono antiguo");
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
          p250("Creando imagen");
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
          const v320 = await fetch2("https://app.divinads.com/phoi", {
            headers: {
              "content-type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(vO28)
          });
          const v321 = await v320.blob();
          p250("Subiendo imagen");
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
              p250("Imagen subida con éxito");
              const v324 = await fetch2("https://adsmanager.facebook.com/api/graphql/?_flowletID=6162", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                method: "POST",
                body: "av=" + v273 + "&__usid=6-Ts32xbmx9zp07:Ps32xbo1dw875c:0-As32xbmnpvjk8-RV=6:F=&session_id=31c62e5eed2d0ee6&__user=" + v273 + "&__a=1&__req=2a&__hs=19655.BP:ads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1009466057&__s=rnpwbw:po0pjn:3801to&__hsi=7293834906630568386&__dyn=7AgSXghF3Gxd2um5rpUR0Bxpxa9yaxGuml4WqxuUgBwCwWhE99oWFGCxiEjCyJz9FGwwxmm4V9AUC37GiidBCBXxWE-7E9UmxaczESbwxKqibC-mdwTxOESegHyo4a5HyoyazoO4oK7EmDgjAKcxa49EB7x6dxaezWK4o8A2mh1222qdz8oDxKaCwgUGWBBKdUrjyrQ2PKGypVRg8Rpo8ESibKegK26bwr8sxep3bLAzECi9lpubwIxecAwXzogyo465ubUO9ws8nxaFo5a7EN1O74q9DByUObAzE89osDwOAxCUdoapVGxebxa4AbxR2V8W2e6Ex0RyUSUGfwXx6i2Sq7oV1JyAfx2aK48OimbAy8tKU-4U-UG7F8a898OidCxeq4qz8gwSxm4ofp8bU-dwKUjyEG4E949BGUryrhUK5Ue8Su6EfEHxe6bUS5aChoCUO9Km2GZ3UcUym9yA4Ekx24oKqbDypXiCxC8BCyKqiE88iwRxqmi1LCh-i1ZwGByUeoQwox3UO364GJe4EjwFggzUWqUlUym37wBwJzohxWUnhEqUW9hXF3U8pEpy9UlxOiEWaUlxiayoy&__csr=&__comet_req=25&fb_dtsg=" + v271 + "&jazoest=25539&lsd=rJwxW05TW9fxOrWZ5HZ2UF&__aaid=3545839135664163&__spin_r=1009466057&__spin_b=trunk&__spin_t=1698228276&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables={\"input\":{\"client_mutation_id\":\"1\",\"actor_id\":\"" + v273 + "\",\"action\":\"UPLOAD_IMAGE\",\"image_upload_handle\":\"" + v323.h + "\",\"enrollment_id\":\"" + v286 + "\"},\"scale\":1}&server_timestamps=true&doc_id=6856852124361122"
              });
              if (v324.text.includes("UFACAwaitingReviewState")) {
                p250("Imagen subida con éxito");
                v289 = await vF10();
              } else {
                return p254("No se puede subir la imagen");
              }
            } else {
              return p254("No se puede subir la imagen");
            }
          };
          v322.send(v321);
          v289 = await getState();
        }
        const v325 = v289.__typename === "UFACAwaitingReviewState";
        if (v325) {
          p250("Seleccionando línea");
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
  function  shareDoiTacBm(p257, p258, p259) {
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
  function getGroup() {
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
  function searchGroup(p267, p268, p269) {
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
                question: p272.rendering_strategy.view_model.ctas.primary[0].profile.has_membership_questions ? "Si" : "No",
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
                    question: p273.rendering_strategy.view_model.ctas.primary[0].profile.has_membership_questions ? "Si" : "No",
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
  function searchByUid(p274, p275, p276) {
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
            question: p279.viewer_post_status === "CAN_POST_AFTER_APPROVAL" ? "Si" : "No",
            groupId: p279.id,
            avatar: "",
            status: p279.visibility === "OPEN" ? "Público" : "Privado",
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
  function  getLinkkhangBm(p280, p281) {
    return new Promise(async (p282, p283) => {
      let v341 = false;
      let v342 = false;
      try {
        p281("Obteniendo enlace de apelación BM");
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
            p281(p280 + "|https://www.facebook.com/checkpoint/1501092823525282/" + v357 + "|Tipo de Restricción: " + v354);
            v341 = true;
            v342 = v357;
          }
        }
      } catch (e57) {
        console.log(e57);
      }
      if (!v341) {
        p281("Error al obtener enlace de apelación BM");
      }
      p282(v342);
    });
  }
  async function init() {
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

// Asignar función getLinkkhangBm al objeto fb cuando esté disponible
if (typeof window !== 'undefined' && window.fb && typeof getLinkkhangBm !== 'undefined') {
    window.fb.getLinkkhangBm = getLinkkhangBm;
    console.log('✅ Función getLinkkhangBm asignada al objeto fb');
}