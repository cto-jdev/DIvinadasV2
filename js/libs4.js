/**
 * runBm
 * Descripción: Ejecuta operaciones avanzadas sobre un Business Manager (BM) como backup, cambio de nombre, actualización de roles, etc., según la configuración recibida.
 * Parámetros: p469 (objeto BM), p470 (configuración de acciones), p471 (callback para mensajes y actualizaciones)
 * Retorna: Promise<void>
 */
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
              message: "Backupando BM"
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
              message: "Backup BM exitoso"
            });
            if (p470.bm.backupBmMode.value === "link") {
              let v522 = false;
              p471("message", {
                message: "Esperando obtener el enlace de respaldo"
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
                  message: "Link de respaldo obtenido exitosamente"
                });
              } else {
                p471("message", {
                  message: "Error al obtener el enlace de respaldo"
                });
              }
            }
          } catch (e94) {
            console.log(e94);
            p471("message", {
              message: "Error al hacer backup de BM"
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
                  message: "Cambiando el nombre de VIA"
                });
                const v526 = await fb.getMainBmAccounts(p469.bmId);
                await fb.renameVia(v526.id, v525);
                p471("message", {
                  message: "Cambio de nombre de VIA exitoso"
                });
              } catch {
                p471("message", {
                  message: "Error al cambiar el nombre de VIA"
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
                  message: "[" + (vLN046 + 1) + "/" + v527.length + "] Cambiando el nombre: " + v529
                });
                try {
                  await fb.renameVia(v529, v525);
                  vLN045++;
                } catch {}
              }
              p471("message", {
                message: "Cambio de nombre exitoso " + vLN045 + "/" + v527.length
              });
            }
          } else {
            try {
              const v530 = p470.bm.newNameBm.value + " " + randomNumberRange(111111, 999999);
              p471("message", {
                message: "Cambiando el nombre de BM"
              });
              await fb.renameBm(p469.bmId, v530);
              const vO74 = {
                name: v530
              };
              p471("updateBmName", vO74);
              p471("message", {
                message: "Cambio de nombre de BM exitoso"
              });
            } catch (e95) {
              p471("message", {
                message: "Error al cambiar el nombre de BM"
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
                    message: "[" + (vLN048 + 1) + "/" + v532.length + "] Elevando el rol: " + v533
                  });
                  await fb.upgradeRole(p469.bmId, v533);
                } else {
                  p471("message", {
                    message: "[" + (vLN048 + 1) + "/" + v532.length + "] Bajando el rol: " + v533
                  });
                  await fb.downgradeRole(p469.bmId, v533);
                }
                vLN047++;
              } catch {}
            }
            if (p470.bm.updateMode.value === "nang") {
              p471("message", {
                message: "Elevación de roles exitosa " + vLN047 + "/" + v532.length
              });
            } else {
              p471("message", {
                message: "Bajada de roles exitosa " + vLN047 + "/" + v532.length
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
              message: "Obteniendo lista de páginas"
            });
            const v534 = await fb.getDeactivedPage(p469.bmId);
            console.log(v534);
            for (let vLN050 = 0; vLN050 < v534.length; vLN050++) {
              const v535 = v534[vLN050];
              p471("message", {
                message: "[" + (vLN050 + 1) + "/" + v534.length + "] Activando página: " + v535.id
              });
              try {
                await fb.activePage(p469.bmId, v535.id);
                p471("message", {
                  message: "[" + (vLN050 + 1) + "/" + v534.length + "] Activación de página exitosa: " + v535.id
                });
                vLN049++;
              } catch (e97) {
                console.log(e97);
                p471("message", {
                  message: "[" + (vLN050 + 1) + "/" + v534.length + "] Error al activar página: " + v535.id
                });
              }
              await delayTime(2000);
            }
            p471("message", {
              message: "Activación exitosa " + vLN049 + "/" + v534.length + " páginas"
            });
          } catch (e98) {
            p471("message", {
              message: "Error al obtener la lista de páginas"
            });
          }
        }
        if (p470.bm.khangBm.value) {
          const vF14 = (p486, p487, p488) => {
            return new Promise(async (p489, p490) => {
              try {
                p488("Apelando BM");
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
                  p488("Eliminando el número de teléfono antiguo");
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
                    p488("No se puede eliminar el número de teléfono antiguo");
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
                  p488("Resolviendo captcha");
                  const v543 = v538.match(/(?<=\"text_captcha_audio_url\":\")[^\"]*/g)[0].replace(/\\/g, "").split("https://www.facebook.com/captcha/tfbaudio/?captcha_persist_data=")[1].split("&")[0];
                  const v544 = v538.match(/(?<=\"text_captcha_image_url\":\")[^\"]*/g)[0].replace(/\\/g, "");
                  const v545 = await getBase64(v544);
                  let v546 = false;
                  for (let vLN051 = 0; vLN051 < 3; vLN051++) {
                    if (vLN051 > 0) {
                      p488("Intentando resolver captcha nuevamente");
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
                    p488("Resolución de captcha exitosa");
                  } else {
                    p488("Error al resolver captcha");
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
                          p488("Intentando obtener otro número de teléfono");
                        } else {
                          p488("Obteniendo número de teléfono");
                        }
                        try {
                          v551 = await getPhone(p487.general.phoneService.value, p487.general.phoneServiceKey.value);
                          p488("Añadiendo número de teléfono");
                          const v554 = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=6&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=byw56x%3Af6irfb%3Auy904n&__hsi=7496099718108186308&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EWq6GCxpa5F8S1NxyUO8hUyt6CzpEeeUrxW5oymECjVS4898kwTxmcCye8yryrgoCBypE5S264UkDAKqFErxa250IxGm10wpax7Xwzx6ayotz8vDwBwTyE7yFu0WAU29w8u0HqiiFf85qiOXBgem0QocQ1_81dweOap9Q9EEeVE2QBwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25514&lsd=_YYpny6NWhE3gCtXKXz8RT&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745321722&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SET_CONTACT_POINT%22%2C%22contactpoint%22%3A%22" + v551.number + "%22%2C%22country_code%22%3A%22VN%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                            method: "POST"
                          });
                          if (v554.text.includes("UFACContactPointChallengeSubmitCodeState")) {
                            v552 = true;
                            break;
                          } else {
                            p488("Error al añadir número de teléfono");
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
                        p488("Esperando código de activación");
                        try {
                          const v555 = await getPhoneCode(p487.general.phoneService.value, p487.general.phoneServiceKey.value, v551.id);
                          p488("Ingresando código de activación");
                          const v556 = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=6&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=fgpkub%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EWq6GCxpa5F8S1NxyUO8hUyt6CzpEeeUrxW5oymECjVS4898kwTxmcCye8yryrgoCBypE5S264UkDAKqFErxa250IxGm10wpax7Xwzx6ayotz8vDwBwTyE7yFu0WAU29w8u0HqiiFf85qiOXBgem0QocQ1_81dweOap9Q9EEeVE2QBwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SUBMIT_CODE%22%2C%22code%22%3A%22" + v555 + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                            method: "POST"
                          });
                          if (v556.text.includes("UFACImageUploadChallengeState")) {
                            p488("Añadiendo número de teléfono exitosamente");
                            v553 = true;
                          }
                        } catch (e101) {
                          console.log(e101);
                        }
                        if (v553) {
                          v549 = true;
                          break;
                        } else {
                          p488("Eliminando el número de teléfono antiguo");
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
                            p488("No se puede eliminar el número de teléfono antiguo");
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
                  p488("Creando imagen");
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
                  p488("Subiendo imagen");
                  const v561 = await uploadImage(vVO80, v560, p486, fb.uid, fb.dtsg);
                  if (v561.h) {
                    p488("Subida de imagen exitosa");
                    const v562 = await fetch2("https://www.facebook.com/api/graphql/", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=7&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=mnqyan%3Atxdvnc%3Aij1cln&__hsi=7496117124745568398&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxehopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25406&lsd=abKxXin_wrpqHu2P6BcjLF&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745325775&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UPLOAD_IMAGE%22%2C%22image_upload_handle%22%3A%22" + v561.h + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + v536 + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                      method: "POST"
                    });
                    if (v562.text.includes("UFACAwaitingReviewState")) {
                      p488("Subida de imagen exitosa");
                      v538 = await vF15();
                    }
                  } else {
                    p488("Error al subir imagen");
                  }
                }
                let v563 = false;
                if (v538.includes("UFACAwaitingReviewState")) {
                  v563 = true;
                }
                if (v563) {
                  p488("Resistencia BM exitosa");
                  p489();
                } else {
                  p488("Resistencia BM fallida");
                  p490();
                }
              } catch (e102) {
                p488("Resistencia BM fallida");
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
                message: "[" + (vLN055 + 1) + "/" + v564 + "] Creando TKQC"
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
                      message: "Compartiendo cuenta de BM"
                    });
                    await fb.shareDoiTacBm(p469.bmId, v568, p470.bm.shareTkqc.value);
                    p471("message", {
                      message: "Compartiendo cuenta de BM exitosamente"
                    });
                  } catch {
                    p471("message", {
                      message: "Error al compartir cuenta de BM"
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
            message: "Creación exitosa de " + vLN054 + "/" + v564 + " TKQC"
          });
        }
        if (p470.bm.outBm.value) {
          try {
            p471("message", {
              message: "Saliendo de BM"
            });
            await fb.outBm(p469.bmId);
            p471("message", {
              message: "Salida de BM exitosa"
            });
          } catch (e104) {
            p471("message", {
              message: "Error al salir de BM"
            });
          }
        }
        if (p470.bm.removeQtv.value) {
          try {
            p471("message", {
              message: "Eliminando QTV"
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
              message: "Eliminado " + v572.length + "/" + v571.length + " QTV"
            });
          } catch (e105) {
            console.log(e105);
            p471("message", {
              message: "Error al eliminar QTV"
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
          } catch (e107) {
            console.log(e107);
            p471("message", { message: "Error al eliminar Insta" });
          }
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
              message: "Compartiendo cuenta de BM"
            });
            await fb.shareDoiTacBm(p502.bm, p502.adId, p503.ads.idBm.value);
            p504("message", {
              message: "Compartiendo cuenta de BM exitosamente"
            });
          } catch {
            p504("message", {
              message: "Error al compartir cuenta de BM"
            });
          }
        }
        if (p503.ads.getLinkShareBm.value) {
          try {
            p504("message", {
              message: "Obteniendo link TK BM"
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
              message: "Obteniendo link TK BM exitosamente"
            });
            p504("updateShareBmLink", {
              link: p502.account + "|" + p502.adId + "|" + v576
            });
          } catch (e107) {
            p504("message", {
              message: "Error al obtener link TK BM"
            });
          }
        }
        if (p503.ads.getLinkXmdtAds.value) {
          try {
            p504("message", {
              message: "Obteniendo link XMDT..."
            });
            
            // Verificar que tenemos los datos necesarios
            if (!p502.adId) {
              throw new Error("ID de cuenta publicitaria no válido");
            }
            
            if (!window.fb || !window.fb.uid || !window.fb.dtsg) {
              throw new Error("Sesión de Facebook no válida. Por favor, recarga la página.");
            }
            
            const v577 = await fb.getLinkXmdtAds(p502.adId);
            
            if (v577) {
              const xmdtLink = "https://www.facebook.com/checkpoint/1501092823525282/" + v577;
              p504("message", {
                message: "✅ Link XMDT obtenido: " + xmdtLink
              });
              
              // Disparar evento para actualizar el display
              $(document).trigger('xmdtLinkGenerated');
              
              // Opcional: copiar al portapapeles si está disponible
              if (navigator.clipboard) {
                try {
                  await navigator.clipboard.writeText(xmdtLink);
                  p504("message", {
                    message: "📋 Link copiado al portapapeles"
                  });
                } catch (e) {
                  // Silenciar error de portapapeles
                }
              }
            } else {
              throw new Error("No se recibió enrollment_id válido");
            }
            
          } catch (e108) {
            console.error("Error detallado en getLinkXmdtAds:", e108);
            
            let errorMessage = "❌ Error al obtener link XMDT";
            
            if (e108.message) {
              if (e108.message.includes("no tiene restricciones XMDT")) {
                errorMessage = "⚠️ Esta cuenta no tiene restricciones XMDT activas";
              } else if (e108.message.includes("Sesión de Facebook")) {
                errorMessage = "🔄 " + e108.message;
              } else if (e108.message.includes("información de facturación")) {
                errorMessage = "💳 La cuenta no tiene información de facturación válida";
              } else {
                errorMessage = "❌ " + e108.message;
              }
            }
            
            p504("message", {
              message: errorMessage
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
                    message: "Añadiendo tarjeta " + (vLN057 + 1) + "/" + v578.length
                  });
                  await fb.addCard(p502.adId, v579, p503.ads.addCardMode.value);
                  v579.count = v579.count + 1;
                  await setLocalStorage("card_" + v579.cardNumber, JSON.stringify(v579));
                } catch {}
                await delayTime(2000);
              }
              p504("message", {
                message: "Añadido " + vLN056 + "/" + v578.length + " tarjetas"
              });
            } else {
              Swal.fire({
                title: "No hay tarjetas",
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
              message: "Cambiando nombre de TKQC"
            });
            await fb.renameAds(p502.adId, v580, p502.bm ?? false);
            const vO91 = {
              name: v580
            };
            p504("updateAdsName", vO91);
            p504("message", {
              message: "Cambiado nombre de TKQC exitosamente"
            });
          } catch (e110) {
            p504("message", {
              message: "Error al cambiar nombre de TKQC"
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
              message: "Cambiando información de TKQC"
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
              message: "Cambiado información de TKQC exitosamente"
            });
          } catch {
            p504("message", {
              message: "Error al cambiar información de TKQC"
            });
          }
        }
        if (p503.ads.removeAdmin.value) {
          if (p503.ads.removeHidden.value || p503.ads.removeAll.value) {
            try {
              p504("message", {
                message: "Comprobando admin oculto"
              });
              const v586 = await fb.checkHiddenAdmin(p502.adId);
              if (v586.length > 0) {
                let vLN058 = 0;
                p504("message", {
                  message: "Eliminando " + v586.length + " admin oculto"
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
                  message: "Eliminado " + vLN058 + "/" + v586.length + " admin oculto"
                });
              } else {
                p504("message", {
                  message: "Cuenta sin admin oculto"
                });
              }
            } catch (e111) {
              console.log(e111);
              p504("message", {
                message: "Error al comprobar admin oculto"
              });
            }
          }
          if (p503.ads.removeAll.value) {
            try {
              const v588 = (await fb.getAdsUser(p502.adId)).map(p510 => p510.id).filter(p511 => p511 != fb.uid);
              p504("message", {
                id: p502.id,
                message: "Eliminando " + v588.length + " admin"
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
                  message: "Eliminado " + vLN060 + "/" + v588.length + " admin"
                });
              } else {
                p504("message", {
                  message: "No hay admin para eliminar"
                });
              }
            } catch (e112) {
              console.log(e112);
              p504("message", {
                message: "Error al eliminar admin"
              });
            }
          }
        }
        if (p503.ads.openAccount.value) {
          try {
            p504("message", {
              message: "Abriendo cuenta cerrada"
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
                message: "Cuenta cerrada abierta"
              });
            } else {
              p504("message", {
                message: "No se puede abrir la cuenta cerrada"
              });
            }
          } catch (e113) {
            p504("message", {
              message: "No se puede abrir la cuenta cerrada"
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
              message: "Cambiando nombre de página"
            });
            await fb.renamePage(p512.pageId, v594);
            const vO97 = {
              name: v594
            };
            p514("updatePageName", vO97);
            p514("message", {
              message: "Cambiado nombre de página exitosamente"
            });
          } catch (e115) {
            p514("message", {
              message: "Error al cambiar nombre de página"
            });
          }
        }
        if (p513.page.sharePage.value) {
          try {
            const v595 = p513.page.targetId.value;
            p514("message", {
              message: "Compartiendo página"
            });
            const v596 = await fb.sharePage(p512.pageId2, v595, v593);
            console.log(v596);
            p514("message", {
              message: "Compartido página exitosamente"
            });
          } catch (e116) {
            p514("message", {
              message: "Error al compartir página"
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
                    $(document).trigger("checkProcess", ["<strong>[" + vA23.length + "/" + p538.length + "]</strong> Recibiendo link: <strong>" + vLS16 + "</strong>"]);
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
      $(document).trigger("checkProcess", ["Recibido exitosamente: <strong>" + vLN063 + "/" + p538.length + "</strong> link"]);
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
        $(document).trigger("checkProcess", ["Creando BM350"]);
      }
      if (v638 === "50") {
        $(document).trigger("checkProcess", ["Creando BM50"]);
      }
      if (v638 === "over") {
        $(document).trigger("checkProcess", ["Creando BM por gateway over"]);
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
      $(document).trigger("checkProcess", ["Se crearon exitosamente " + vLN068 + "/" + v637 + " BM"]);
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
      $(document).trigger("checkProcess", ["Se crearon exitosamente " + vLN070 + "/" + v642 + " Pages"]);
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
      $(document).trigger("checkProcess", ["Aceptado exitosamente: <strong>" + vLN071 + "/" + v646.length + "</strong> page"]);
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
              vLS17 = "Contraseña incorrecta";
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
        p574("Error al iniciar sesión");
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

  // Funciones para manejar enlaces XMDT
  function updateXmdtLinksDisplay() {
    try {
      const links = window.fb.getXmdtLinks();
      const displayArea = document.getElementById('xmdtLinksDisplay');
      const countBadge = document.getElementById('xmdtLinksCount');
      
      if (displayArea && countBadge) {
        // Actualizar contador
        countBadge.textContent = links.length;
        
        // Actualizar área de texto con enlaces en formato UID|LINK
        if (links.length > 0) {
          const formattedLinks = links.map(entry => entry.formatted).join('\n');
          displayArea.value = formattedLinks;
        } else {
          displayArea.value = 'No hay enlaces XMDT generados aún...';
        }
      }
    } catch (e) {
      console.error('Error al actualizar display de enlaces XMDT:', e);
    }
  }

  function copyXmdtLinksToClipboard() {
    try {
      const displayArea = document.getElementById('xmdtLinksDisplay');
      if (displayArea && displayArea.value && displayArea.value !== 'No hay enlaces XMDT generados aún...') {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(displayArea.value).then(() => {
            Swal.fire({
              title: '¡Copiado!',
              text: 'Enlaces XMDT copiados al portapapeles',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }).catch(e => {
            console.error('Error al copiar:', e);
            // Fallback para navegadores que no soportan clipboard API
            displayArea.select();
            document.execCommand('copy');
            Swal.fire({
              title: '¡Copiado!',
              text: 'Enlaces XMDT copiados al portapapeles',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          });
        } else {
          // Fallback para navegadores antiguos
          displayArea.select();
          document.execCommand('copy');
          Swal.fire({
            title: '¡Copiado!',
            text: 'Enlaces XMDT copiados al portapapeles',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      } else {
        Swal.fire({
          title: 'Sin enlaces',
          text: 'No hay enlaces XMDT para copiar',
          icon: 'warning',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (e) {
      console.error('Error al copiar enlaces XMDT:', e);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron copiar los enlaces',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  function clearXmdtLinks() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminarán todos los enlaces XMDT guardados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          window.fb.clearXmdtLinks();
          updateXmdtLinksDisplay();
          Swal.fire({
            title: '¡Eliminado!',
            text: 'Enlaces XMDT eliminados correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (e) {
          console.error('Error al limpiar enlaces XMDT:', e);
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron eliminar los enlaces',
            icon: 'error',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  }

  // Event listeners para los botones de enlaces XMDT
  $(document).ready(function() {
    // Actualizar display cuando se abra la sección
    $('input[name="getLinkXmdtAds"]').on('change', function() {
      if (this.checked) {
        setTimeout(updateXmdtLinksDisplay, 100);
      }
    });

    // Botón de actualizar
    $(document).on('click', '#refreshXmdtLinks', function() {
      updateXmdtLinksDisplay();
      Swal.fire({
        title: 'Actualizado',
        text: 'Lista de enlaces XMDT actualizada',
        icon: 'info',
        timer: 1500,
        showConfirmButton: false
      });
    });

    // Botón de copiar
    $(document).on('click', '#copyXmdtLinks', function() {
      copyXmdtLinksToClipboard();
    });

    // Botón de limpiar
    $(document).on('click', '#clearXmdtLinks', function() {
      clearXmdtLinks();
    });

    // Actualizar display automáticamente cuando se genere un nuevo enlace
    $(document).on('xmdtLinkGenerated', function() {
      updateXmdtLinksDisplay();
    });
  });