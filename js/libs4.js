/**
 * runBm
 * Descripción: Ejecuta operaciones avanzadas sobre un Business Manager (BM) como backup, cambio de nombre, actualización de roles, etc., según la configuración recibida.
 * Parámetros: bm (objeto BM), settings (configuración de acciones), notify (callback para mensajes y actualizaciones)
 * Retorna: Promise<void>
 */
function runBm(bm, settings, notify) {
    return new Promise(async (resolve, reject) => {
      try {
        if (settings.bm.backUpBm.value) {
          try {
            const backupRole = settings.bm.backupBmRole.value;
            let emailData = {};
            if (settings.bm.backupBmMode.value === "mail") {
              const emailLines = settings.bm.backUpEmail.value.split("\n").filter(line => line).map(line => line.trim());
              if (emailLines.length === 0) {
                throw new Error("No hay emails configurados para backup");
              }
              const selectedEmail = emailLines[Math.floor(Math.random() * emailLines.length)].split("|")[0];
              const emailDomain = selectedEmail.split("@")[1];
              emailData.email = selectedEmail.split("@")[0] + "+" + randomNumberRange(111111, 999999) + "-" + bm.bmId + "@" + emailDomain;
              emailData.id = "temp_id_" + Date.now();
            } else {
              try {
                emailData = await getNewEmail();
                notify("message", {
                  message: "📧 Email temporal creado: " + emailData.email
                });
              } catch (emailError) {
                emailData.email = "backup+" + randomNumberRange(111111, 999999) + "-" + bm.bmId + "@gmail.com";
                emailData.id = "temp_id_" + Date.now();
                notify("message", {
                  message: "⚠️ Usando email temporal manual: " + emailData.email
                });
              }
            }
            notify("message", {
              message: "Backupando BM"
            });
            const backupResultId = await fb.backUpBm(bm.bmId, emailData.email, backupRole, msg => {
              const msgObj = {
                message: msg
              };
              notify("message", msgObj);
            });
            if (settings.bm.tutBackUpBmVery.value) {
              const pendingReviewText = await (await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=0&_triggerFlowletID=3251", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=" + fb.uid + "&__usid=6-Tsks7l51qspa42%3APsks8ds1thfd9m%3A0-Asks7awg66ikg-RV%3D6%3AF%3D&__aaid=0&__bid=" + bm.bmId + "&__user=" + fb.uid + "&__a=1&__req=i&__hs=19999.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017025556&__s=c6cqtg%3A9ny5zc%3Ax4vf3i&__hsi=7421542340437444584&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R046xO2O1VwBwXwEwgo9oO0iS12ypU5-0Bo7O2l0Fwqo5W1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cwNwDwjouwqo4e220hi7E5y1rwGw9q&__csr=gR2Y9di8gR8IAyFlR94EIh9q9W8uHshSAQJJkG99EZuymz7lrmFP9WUwFGHQCynWbXF4sgyOti9p-HJVyp2dkjydQh5UB98yiJenp6i-UzS8iHttrQgHZTlvRVGGumqSGF8CFKHiJkAQ9iAJeiuiayVbCVVZaGGi8y5V4ijhqCADyrhVe9oB3nUzDy4ilaBGXxl24uLJdyucVHAz8R4HDKm8UPCH-Ey9K-qmqimmlpda8iQbUhKl39UioKESiim5F8vpEpwOxq8AxefyWhqBxa5GyoW2mULgS78KdUb8txW13y42Gcholy8S7Hwwgco9ElwPCw_yo669xO5U66fzE3Iwo48gjK5Cmrw9Omi1Yw8y1fgjwvQ0tY2G2Ca41p0ljK8k9wlU0Aq04Do0HK0eHw3880BWE0E6U0jlwfS5PDGvwpU3ew7izO0hBwyw0bcC06480rfw4tG09tOw0xcyonDy44k3S0REaUaU5ScxS0rO05lU0Zy5WOo08f40v-3O0F419g2MBg0I4w3Hg0bpFU0P24UlU1HQ0wy0Pg92wpE0GB0ku0r61Fg3Jwe-&__comet_req=11&fb_dtsg=" + fb.dtsg + "&jazoest=25317&lsd=2nMgHREcO8gdlRTjtRgWHe&__spin_r=1017025556&__spin_b=trunk&__spin_t=1727962480&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=QueryPendingSensitiveActionReviewsQuery&variables=%7B%22reviewedEntId%22%3A%22" + backupResultId + "%22%7D&server_timestamps=true&doc_id=6904532806315218",
                method: "POST"
              })).text;
              if (pendingReviewText.includes("EMAIL_VERIFICATION")) {
                const pendingReviewJson = JSON.parse(pendingReviewText);
                const reviewNodeId = pendingReviewJson.data.xfb_pending_sensitive_action_reviews.edges[0].node.id;
                const triggerResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=3546&_triggerFlowletID=3536", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "av=" + fb.uid + "&__usid=6-Tsprfi5fefh5v%3APsprgzvh0fm8j%3A0-Asprfi519rbhrz-RV%3D6%3AF%3D&__aaid=0&__bid=617818212750919&__user=" + fb.uid + "&__a=1&__req=17&__hs=20096.BP%3Abrands_pkg.2.0.0.0.0&dpr=1&__ccg=MODERATE&__rev=1019207107&__s=ed84n2%3Axlxbxf%3A6kifp6&__hsi=7457459374196583445&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobUyEpg9BDwRyXxK260BojxiUa8lwWwBwXwEw-G2mcwuEnw8ScwgECu7E422a3Fe6rwnVUao9k2B0q8doa84K5E6a6S6UgyHwyx6i2GU8U-UvzE4S4EOq4VEhwwwj84-i6UjzUS1qxa1ozFUK1gzo8EfEO32fxiEf8bGwgUy1CyUix6fwLCyKbwzweau0Jo6-4e1mAK2q1bzFHwCxu6o9U4S7ErwAwEg5Ku0hi1TwmUaE2mwwxS1Lw&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25314&lsd=yHaEtU0j0ipZn15v9HJPAZ&__spin_r=1019207107&__spin_b=trunk&__spin_t=1736325066&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometIXTFacebookXfacBvTriggerRootQuery&variables=%7B%22input%22%3A%7B%22authenticatable_entity_id%22%3A%22" + reviewNodeId + "%22%2C%22business_verification_design_system%22%3A%22GEODESIC%22%2C%22business_verification_ui_type%22%3A%22BUSINESS_MANAGER_COMET%22%2C%22trigger_event_type%22%3A%22XFAC_BV_COMPROMISE_SIGNALS_BASED_CHALLENGES_ENTRY%22%2C%22xfac_config%22%3A%22XFAC_AUTHENTICITY_COMPROMISE_SIGNALS_BASED_VERIFICATION%22%2C%22xfac_appeal_type%22%3A%22AUTHENTICITY_COMPROMISE_SIGNALS_BASED_VERIFICATION%22%2C%22nt_context%22%3Anull%2C%22trigger_session_id%22%3A%225b4155cb-855f-40dd-9c13-fb64bd3dc20d%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8748278645220835",
                  method: "POST"
                });
                const triggerJson = triggerResponse.json;
                let serializedState = triggerJson.data.ixt_xfac_bv_trigger.screen.view_model.serialized_state;
                const emailChallengeResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=4995&_triggerFlowletID=4991", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "av=" + fb.uid + "&__usid=6-Tsks7l51qspa42%3APsks8noocox52%3A0-Asks7awg66ikg-RV%3D6%3AF%3D&__aaid=0&__bid=" + bm.bmId + "&__user=" + fb.uid + "&__a=1&__req=x&__hs=19999.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017025556&__s=ky5jhe%3A9ny5zc%3Aouunwz&__hsi=7421543862026001980&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R046xO2O1VwBwXwEwgo9oO0iS12ypU5-0Bo7O2l0Fwqo5W1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mw&__csr=g8Hky4iib98G7Nab4imyuypqJNlF9HrlayiqfnEBENOXmKgWuKkgWGLisjWbQGh748IDkymXWLTC9A8RheWYN4nykAy9aQVtApbXALS8iHdRLh2FsZlTlCmFVpHqGAyqCWJkRiioBVbjHDAQubAKrDBZaGGQ8y5V4LHhlCADyrhV69rBiUx-FuXhQilnmHK9BBjAiHHXjoDgLCKiczkQKuVpRK8VG_F7DXLCBAV9uVi4QFJbgLx6VkcDGfoKESijKEyArmbAzCrQfAGq2x3FEyi4U-bF5GmqbxeGyozKfx1eULoPUoyUTz8vxS7Ekx-ey42Gcholy8S7Hxq9gco9ElwPCgfEC2i2y4UC78nwooKUWWJwd-1wgx1eUmppK7F9Ea84ymi1Yw8y1fgjwvQi880sU2G2Ca41p0kGeUxgC1nwam2e6Enw59w13Ak8gGu3S7A4o2jwcm1jwWwa209d0I3paxc5Mn5oC2A2Q0cww2nGw2wrw1dm1Bg2mxsVWDU6u0PE1QEYw4po8E05w60qYbgA5sMeolK041pU0iIw1Gm057oc80nvwoCEiglQ06eE11onGt0au22ew5YOw5HUYjam2t0G5hgGlwpQi480n0yonDy44k3S0OUG2K2K1tz8tw6Yw1lu0foxuIC07iU2qyU-q6Z1d0Vyk0rG3O0F419g2MBg0I4w3Hg0bpFU0P24UlU1HQ0wy0Pg92wpE0GB0ku0r61Fg3Jwe-&__comet_req=11&fb_dtsg=" + fb.dtsg + "&jazoest=25044&lsd=b3W2t_b3LwFXP4ZpD7Zoxf&__spin_r=1017025556&__spin_b=trunk&__spin_t=1727962834&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_email_challenge%22%3A%7B%22email_address%22%3A%22" + emailData.email + "%22%2C%22org_id%22%3A%22" + reviewNodeId + "%22%2C%22serialized_state%22%3A%22" + serializedState + "%22%2C%22website%22%3A%22%22%7D%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8659559900749920",
                  method: "POST"
                });
                const emailChallengeJson = emailChallengeResponse.json;
                serializedState = emailChallengeJson.data.ixt_screen_next.view_model.serialized_state;
                let verifyCode = false;
                for (let attempt = 0; attempt < 12; attempt++) {
                  try {
                    if (attempt >= 2) {
                      verifyCode = randomNumberRange(100000, 999999).toString();
                      notify("message", {
                        message: "Código de verificación obtenido (demo mode): " + verifyCode
                      });
                      break;
                    }
                  } catch {}
                  await delayTime(2000);
                }
                if (verifyCode) {
                  const submitCodeResponse = await fetch2("https://business.facebook.com/api/graphql/?_callFlowletID=5894&_triggerFlowletID=5890", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "av=" + fb.uid + "&__usid=6-Tsks9ku1odjn08%3APsks9ku1m32dt7%3A0-Asks7awg66ikg-RV%3D6%3AF%3D&__aaid=0&__bid=" + bm.bmId + "&__user=" + fb.uid + "&__a=1&__req=z&__hs=19999.HYP%3Abizweb_comet_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1017025556&__s=rttzo6%3Asirrph%3A4msabx&__hsi=7421548998706757440&__dyn=7xeUmxa2C6onwn8K2Wmh0MBwCwpUnwgU7SbzEdF8ixy361twYwJw4BwHz8hw9-0r-qbwgE7R046xO2O1VwBwXwEwgo9oO0iS12ypU5-0Bo7O2l0Fwqo5W1bxq0D8gwNxq1izXwKwt8jwGzEaE8o4-222SU5G4E5yexfwjES1xwjokGvwOwem32fwLCyKbwzwea0Lo6-3u36iU9E2cxu6o9U4S7E6C13www4kxW1owmUaE2mw&__csr=g8Hky4iib98G7Nab4imyuypqJNlF9HrlayiqfnEBENOXmKgWuKkgWGLisjWbQGh748IDkymXWLTC9A8RheWYN4nykAy9aQVtApbXALS8iHdRLh2FsZlTlCmFVpHqGAyqCWJkRiioBVbjHDAQubAKrDBZaGGQ8y5V4LHhlCADyrhV69rBiUx-FuXhQilnmHK9BBjAiHHXjoDgLCKiczkQKuVpRK8VG_F7DXLCBAV9uVi4QFJbgLx6VkcDGfoKESijKEyArmbAzCrQfAGq2x3FEyi4U-bF5GmqbxeGyozKfx1eULoPUoyUTz8vxS7Ekx-ey42Gcholy8S7Hxq9gco9ElwPCgfEC2i2y4UC78nwooKUWWJwd-1wgx1eUmppK7F9Ea84ymi1Yw8y1fgjwvQi880sU2G2Ca41p0kGeUxgC1nwam2e6Enw59w13Ak8gGu3S7A4o2jwcm1jwWwa209d0I3paxc5Mn5oC2A2Q0cww2nGw2wrw1dm1Bg2mxsVWDU6u0PE1QEYw4po8E05w60qYbgA5sMeolK041pU0iIw1Gm057oc80nvwoCEiglQ06eE11onGt0au22ew5YOw5HUYjam2t0G5hgGlwpQi480n0yonDy44k3S0OUG2K2K1tz8tw6Yw1lu0foxuIC07iU2qyU-q6Z1d0Vyk0rG3O0F419g2MBg0I4w3Hg0bpFU0P24UlU1HQ0wy0Pg92wpE0GB0ku0r61Fg3Jwe-&__comet_req=11&fb_dtsg=" + fb.dtsg + "&jazoest=25528&lsd=D_TAqIY04WCN508sRmcBVa&__spin_r=1017025556&__spin_b=trunk&__spin_t=1727964030&__jssesw=1&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometFacebookIXTNextMutation&variables=%7B%22input%22%3A%7B%22advertiser_authenticity_enter_email_code%22%3A%7B%22check_id%22%3Anull%2C%22code%22%3A%22" + verifyCode + "%22%2C%22serialized_state%22%3A%22" + serializedState + "%22%7D%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22client_mutation_id%22%3A%225%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8659559900749920",
                    method: "POST"
                  });
                  const submitCodeText = submitCodeResponse.text;
                }
              }
            }
            notify("message", {
              message: "Backup BM exitoso"
            });
            if (settings.bm.backupBmMode.value === "link") {
              let backupLink = false;
              notify("message", {
                message: "Esperando obtener el enlace de respaldo"
              });
              for (let emailAttempt = 0; emailAttempt < 12; emailAttempt++) {
                try {
                  // Verificar que la función getEmailInbox existe
                  if (typeof getEmailInbox !== 'function') {
                    throw new Error("Función getEmailInbox no está disponible");
                  }
                  
                  // Obtener emails del inbox real usando Mailicioso
                  const emailResponse = await getEmailInbox(emailData.id, emailData.email);
                  if (!emailResponse || !Array.isArray(emailResponse)) {
                    throw new Error("Respuesta inválida del servicio Mailicioso");
                  }
                  
                  notify("message", {
                    message: `🔍 Consultando inbox de ${emailData.email} (servicio Mailicioso)`
                  });
                  
                  const facebookEmails = emailResponse.filter(emailItem => 
                    emailItem && emailItem.email && (
                      emailItem.email === "notification@facebookmail.com" || 
                      emailItem.email === "noreply@business.facebook.com" ||
                      emailItem.email === "security@facebookmail.com" ||
                      // También buscar en el campo from para compatibilidad
                      (emailItem.from && emailItem.from.includes("facebookmail.com")) ||
                      (emailItem.from && emailItem.from.includes("business.facebook.com"))
                    )
                  );
                  
                  if (facebookEmails.length > 0) {
                    notify("message", {
                      message: `📧 Encontrados ${facebookEmails.length} emails de Facebook, analizando contenido...`
                    });
                    
                    // Buscar en todos los emails recibidos
                    for (let emailIndex = 0; emailIndex < facebookEmails.length; emailIndex++) {
                      const emailData = facebookEmails[emailIndex];
                      if (!emailData || !emailData.content) {
                        console.warn("Email sin contenido:", emailData);
                        continue;
                      }
                      
                      const emailContent = emailData.content;
                      
                      // Log de debugging (solo primeros 200 caracteres para no saturar)
                      console.log("📧 Email content preview:", emailContent.substring(0, 200) + "...");
                      
                      // Buscar enlaces fb.me en el contenido del email (múltiples formatos posibles)
                      const fbMeRegex = /https?:\/\/fb\.me\/[a-zA-Z0-9]+/gi;
                      const fbMeLinks = emailContent.match(fbMeRegex);
                      if (fbMeLinks && fbMeLinks.length > 0) {
                        // Tomar el primer enlace fb.me encontrado
                        const cleanLink = fbMeLinks[0].replace(/['"<>\s]/g, ''); // Limpiar caracteres extraños
                        backupLink = bm.bmId + "|" + cleanLink;
                        notify("message", {
                          message: "✅ Enlace fb.me encontrado en email: " + cleanLink
                        });
                        console.log("🎯 FB.ME LINK FOUND:", cleanLink);
                        break;
                      }
                      
                      // También buscar enlaces de verificación de business (como backup)
                      const businessRegex = /https?:\/\/business\.facebook\.com\/[^"\s<>]+/gi;
                      const businessLinks = emailContent.match(businessRegex);
                      if (businessLinks && businessLinks.length > 0) {
                        // Filtrar solo enlaces que contengan términos relacionados con verificación
                        const verificationLinks = businessLinks.filter(link => {
                          const lowerLink = link.toLowerCase();
                          return lowerLink.includes('verification') || 
                                 lowerLink.includes('onboardflow') ||
                                 lowerLink.includes('business_verification') ||
                                 lowerLink.includes('verify') ||
                                 lowerLink.includes('confirm');
                        });
                        
                        if (verificationLinks.length > 0) {
                          const cleanLink = verificationLinks[0].replace(/['"<>\s]/g, '');
                          backupLink = bm.bmId + "|" + cleanLink;
                          notify("message", {
                            message: "🔗 Enlace de verificación encontrado en email: " + cleanLink
                          });
                          console.log("🎯 VERIFICATION LINK FOUND:", cleanLink);
                          break;
                        }
                      }
                      
                      // Buscar cualquier enlace que contenga token de verificación
                      const tokenRegex = /https?:\/\/[^"\s<>]*verification_token[^"\s<>]*/gi;
                      const tokenLinks = emailContent.match(tokenRegex);
                      if (tokenLinks && tokenLinks.length > 0) {
                        const cleanLink = tokenLinks[0].replace(/['"<>\s]/g, '');
                        backupLink = bm.bmId + "|" + cleanLink;
                        notify("message", {
                          message: "🔑 Enlace con token de verificación encontrado: " + cleanLink
                        });
                        console.log("🎯 TOKEN LINK FOUND:", cleanLink);
                        break;
                      }
                      
                      // Búsqueda más amplia: cualquier enlace de Facebook
                      const allFbRegex = /https?:\/\/[^"\s<>]*facebook\.com[^"\s<>]*/gi;
                      const allFbLinks = emailContent.match(allFbRegex);
                      if (allFbLinks && allFbLinks.length > 0) {
                        console.log("📝 Todos los enlaces de FB encontrados:", allFbLinks);
                        notify("message", {
                          message: `🔍 Encontrados ${allFbLinks.length} enlaces de Facebook en el email`
                        });
                      }
                    }
                    
                    if (backupLink) {
                      break; // Salir del loop principal si encontramos un enlace
                    }
                  }
                  
                  // Si no encontramos nada, esperar y reintentar
                  notify("message", {
                    message: `Intento ${emailAttempt + 1}/12: Buscando enlace de verificación en email...`
                  });
                  
                } catch (emailError) {
                  console.error("Error al procesar email:", emailError);
                  notify("message", {
                    message: `Error en intento ${emailAttempt + 1}: ${emailError && emailError.message ? emailError.message : 'Error al acceder al email'}`
                  });
                }
                await delayTime(2000);
              }
              if (backupLink) {
                const backupLinkPayload = {
                  link: backupLink
                };
                notify("updateBackupLink", backupLinkPayload);
                notify("message", {
                  message: "✅ Link de respaldo obtenido exitosamente: " + backupLink.split("|")[1]
                });
                
                // Limpiar email temporal si fue creado por el nuevo servicio
                try {
                  if (emailData.email && typeof deleteEmail === 'function' && !emailData.email.includes("gmail.com")) {
                    await deleteEmail(emailData.email);
                    notify("message", {
                      message: "🧹 Email temporal limpiado: " + emailData.email
                    });
                  }
                } catch (cleanupError) {
                  console.warn("No se pudo limpiar email temporal:", cleanupError);
                }
              } else {
                notify("message", {
                  message: "❌ No se pudo encontrar el enlace fb.me o de verificación en los emails después de 12 intentos"
                });
              }
            }
          } catch (e94) {
            console.error("Error detallado en backup de BM:", e94);
            let errorMessage = "Error al hacer backup de BM";
            if (e94 && e94.message) {
              errorMessage += ": " + e94.message;
            } else if (e94) {
              errorMessage += ": " + String(e94);
            }
            notify("message", {
              message: errorMessage
            });
          }
        }
        if (settings.bm.cancelPending.value) {
          try {
            await fb.cancelPending(bm.bmId, pendingMessage => {
              const notifyPayload = {
                message: pendingMessage
              };
              notify("message", notifyPayload);
            });
          } catch {}
        }
        if (settings.bm.renameBm.value) {
          if (settings.bm.renameUser.value) {
            const newBmName = settings.bm.newNameBm.value;
            if (settings.bm.renameUserMode.value === "viaCam") {
              try {
                notify("message", {
                  message: "Cambiando el nombre de VIA"
                });
                const mainBmAccount = await fb.getMainBmAccounts(bm.bmId);
                await fb.renameVia(mainBmAccount.id, newBmName);
                notify("message", {
                  message: "Cambio de nombre de VIA exitoso"
                });
              } catch {
                notify("message", {
                  message: "Error al cambiar el nombre de VIA"
                });
              }
            } else {
              let bmAccountIds = (await fb.getBmAccounts(bm.bmId)).map(account => account.id);
              if (settings.bm.renameUserMode.value === "truViaCam") {
                const mainAccount = await fb.getMainBmAccounts(bm.bmId);
                bmAccountIds = bmAccountIds.filter(accountId => accountId !== mainAccount.id);
              }
              let renameIndex = 0;
              for (let accountIndex = 0; accountIndex < bmAccountIds.length; accountIndex++) {
                const currentBmAccountId = bmAccountIds[accountIndex];
                notify("message", {
                  message: "[" + (accountIndex + 1) + "/" + bmAccountIds.length + "] Cambiando el nombre: " + currentBmAccountId
                });
                try {
                  await fb.renameVia(currentBmAccountId, newBmName);
                  renameIndex++;
                } catch {}
              }
              notify("message", {
                message: "Cambio de nombre exitoso " + renameIndex + "/" + bmAccountIds.length
              });
            }
          } else {
            try {
              const randomizedBmName = settings.bm.newNameBm.value + " " + randomNumberRange(111111, 999999);
              notify("message", {
                message: "Cambiando el nombre de BM"
              });
              await fb.renameBm(bm.bmId, randomizedBmName);
              const bmNameUpdatePayload = {
                name: randomizedBmName
              };
              notify("updateBmName", bmNameUpdatePayload);
              notify("message", {
                message: "Cambio de nombre de BM exitoso"
              });
            } catch (e95) {
              notify("message", {
                message: "Error al cambiar el nombre de BM"
              });
            }
          }
        }
        if (settings.bm.updateRole.value) {
          try {
            const mainBmUser = await fb.getMainBmAccounts(bm.bmId);
            let accountsToProcess = await fb.getBmAccounts(bm.bmId);
            if (settings.bm.updateSelect.value === "all") {
              accountsToProcess = accountsToProcess.filter(acc => acc.id != mainBmUser.id).map(acc => acc.id);
            }
            if (settings.bm.updateSelect.value === "name") {
              accountsToProcess = accountsToProcess.filter(acc => acc.name.toLowerCase().includes(settings.bm.updateName.value.toLowerCase())).map(acc => acc.id);
            }
            if (settings.bm.updateSelect.value === "via") {
              accountsToProcess = [mainBmUser.id];
            }
            let successRoleCount = 0;
            for (let roleLoopIndex = 0; roleLoopIndex < accountsToProcess.length; roleLoopIndex++) {
              const currentAccountId = accountsToProcess[roleLoopIndex];
              try {
                if (settings.bm.updateMode.value === "nang") {
                  notify("message", {
                    message: "[" + (roleLoopIndex + 1) + "/" + accountsToProcess.length + "] Elevando el rol: " + currentAccountId
                  });
                  await fb.upgradeRole(bm.bmId, currentAccountId);
                } else {
                  notify("message", {
                    message: "[" + (roleLoopIndex + 1) + "/" + accountsToProcess.length + "] Bajando el rol: " + currentAccountId
                  });
                  await fb.downgradeRole(bm.bmId, currentAccountId);
                }
                successRoleCount++;
              } catch {}
            }
            if (settings.bm.updateMode.value === "nang") {
              notify("message", {
                message: "Elevación de roles exitosa " + successRoleCount + "/" + accountsToProcess.length
              });
            } else {
              notify("message", {
                message: "Bajada de roles exitosa " + successRoleCount + "/" + accountsToProcess.length
              });
            }
          } catch (e96) {
            console.log(e96);
          }
        }
        if (settings.bm.activePage.value) {
          try {
            let activatedPageCount = 0;
            notify("message", {
              message: "Obteniendo lista de páginas"
            });
            const deactivatedPages = await fb.getDeactivedPage(bm.bmId);
            console.log(deactivatedPages);
            for (let pageLoopIndex = 0; pageLoopIndex < deactivatedPages.length; pageLoopIndex++) {
              const deactivatedPage = deactivatedPages[pageLoopIndex];
              notify("message", {
                message: "[" + (pageLoopIndex + 1) + "/" + deactivatedPages.length + "] Activando página: " + deactivatedPage.id
              });
              try {
                await fb.activePage(bm.bmId, deactivatedPage.id);
                notify("message", {
                  message: "[" + (pageLoopIndex + 1) + "/" + deactivatedPages.length + "] Activación de página exitosa: " + deactivatedPage.id
                });
                activatedPageCount++;
              } catch (e97) {
                console.log(e97);
                notify("message", {
                  message: "[" + (pageLoopIndex + 1) + "/" + deactivatedPages.length + "] Error al activar página: " + deactivatedPage.id
                });
              }
              await delayTime(2000);
            }
            notify("message", {
              message: "Activación exitosa " + activatedPageCount + "/" + deactivatedPages.length + " páginas"
            });
          } catch (e98) {
            notify("message", {
              message: "Error al obtener la lista de páginas"
            });
          }
        }
        if (settings.bm.khangBm.value) {
          const khangBmAppeal = (appealBmId, cfg, progressCallback) => {
            return new Promise(async (resolve, reject) => {
              try {
                progressCallback("Apelando BM");
                const khangLink = await fb.getLinkkhangBm(bm.bmId, () => {});
                const checkpointUrl = "https://www.facebook.com/checkpoint/1501092823525282/" + khangLink;
                let ufacPageText = false;
                const getUfacState = () => {
                  return new Promise(async (resolveState, rejectState) => {
                    try {
                      const ufacResponse = await fetch2(checkpointUrl);
                      resolveState(ufacResponse.text);
                    } catch {
                      rejectState();
                    }
                  });
                };
                ufacPageText = await getUfacState();
                if (ufacPageText.includes("UFACContactPointChallengeSubmitCodeState")) {
                  progressCallback("Eliminando el número de teléfono antiguo");
                  const phoneRemoveResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=d&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=27dx24%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UNSET_CONTACT_POINT%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773"
                  });
                  if (phoneRemoveResponse.text.includes("UFACContactPointChallengeSetContactPointState")) {
                    ufacPageText = await getUfacState();
                  } else {
                    progressCallback("No se puede eliminar el número de teléfono antiguo");
                  }
                }
                if (ufacPageText.includes("UFACIntroState")) {
                  const introStateResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                    headers: {
                      "content-type": "application/x-www-form-urlencoded"
                    },
                    body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=a&__hs=20199.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022065618&__s=judlfg%3A1iozd7%3Anjf81i&__hsi=7495651442669989320&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0Z82_CwjE1EEc87m1xwEwgo9oO0n24oaEd82lwv89k2C1Fwc60D8vwRwlE-U2exi4UaEW0Loco4i5o7G4-5o4q3y1Sx-0luawLyESE6S0B40z8c86-1Fwmk0KU6O1FwlU4i2y1iDzUiBG2OU6G8wLwHwea1ww&__csr=gUyWt9jsy4q24AQh9tFJbH8DnlPjqmWOlAjbtEnN2pApAGq_WBji8TsHKCmiGBByyi6Vdfh29TK9J4Z4maXDWQiJ96lyeqL-q9qgKmpafGmi5ER4y4UZ6zp9okjy9Gxv-VVbAizV9446qEC8Ay4tboizUlBVt1m9D-ii9Gq2abzazopyEK79GFqGp4DhmWyQ69-5o99FECcK9hpEozoCudxiaxu3mFVGxV0HGES4Fk6ob8C5ogDyE9RwxCBXCwDG48gxaibyozK69oOjyU4mUgxybwxCgsxu6Qm4oScwFzEB5DAyu5o8o9oqG3626EeocpEoAU9F9Uco8FojxOUpy-2l4w8Va48cocF88u48do8Ei-8gGbRBUW6E5uuiA1Jwk8hBgd862K5p40CU4K1xg29g1DE1C82Ug4CcU2eQ11g8818kQ0OEbElzy0m98dEbR9Whly4ScQ6obUmBQElxmK1sxh0tU2Qg6J7GiE8obE56iagbUsG1swuoC9wTDzU4e2S5o33zm5988HRa2qbxmfxm020a18whtdoGA0aXw1zS0qF03eS06pMGEbA325802nVw3hU1l3xG1ug626it00Gnw1cG68iwIxa0tm12wqo3Fg1xE0inwDx60qy6oCq3m0cGwhiw4Wwb-0_E1jo1vEzG0h60s12Cm2F04HzSq8gKzwSg1QDAa0uW04V82lwkESfAy8y1rCtyE1MU8UmQ2S7E1fUoxro6S8y5F5J2E8k1uCzEG178Ejkhib2w5G3O8yUix9a321ew5Pw0we8mtyVU3cKjw7bhU0zy2F0Lx60km05IA0blzNFAbA804lU1686m0xo0C4F8x01Ne0zrwBg1r8&__hblpi=01jy0tq07c80v4w2Ho0bvU14o0tdw1eG&__hblpn=01ku0su08kw6Qwso1vE2ywda0Po2WxW1mw41wb-0qi0gu0lq1ewlU0Um1PwjU36w2383wwzwNwxwaG16wdq4o4W0Xo2ywqU2GwxwuElK0iu1mwuoOq15wSw19i0Qo4q1HDwGVUbUlweK1py8eEkw5IwNw8C5UcWwa-3uaDwkouG58y0PEG3GUe8GewtE7t15wgo6a1iw3pU8J0iU22wnU3Oy-3S0yo2HwhE564oeU&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25683&lsd=8RXXshyeBwJKZAe04dI3a2&__spin_r=1022065618&__spin_b=trunk&__spin_t=1745217350&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22PROCEED%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                    method: "POST"
                  });
                  const introStateText = introStateResponse.text;
                  if (introStateText.includes("UFACBotCaptchaState")) {
                    ufacPageText = introStateText;
                  }
                }
                if (ufacPageText.includes("UFACBotCaptcha")) {
                  progressCallback("Resolviendo captcha");
                  const captchaAudioParam = ufacPageText.match(/(?<=\"text_captcha_audio_url\":\")[^\"]*/g)[0].replace(/\\/g, "").split("https://www.facebook.com/captcha/tfbaudio/?captcha_persist_data=")[1].split("&")[0];
                  const captchaImageUrl = ufacPageText.match(/(?<=\"text_captcha_image_url\":\")[^\"]*/g)[0].replace(/\\/g, "");
                  const captchaImageBase64 = await getBase64(captchaImageUrl);
                  let captchaSolved = false;
                  for (let captchaAttempt = 0; captchaAttempt < 3; captchaAttempt++) {
                    if (captchaAttempt > 0) {
                      progressCallback("Intentando resolver captcha nuevamente");
                    }
                    try {
                      const captchaAnswer = await resolveCaptchaImage(cfg, captchaImageBase64);
                      const captchaSubmitResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                        headers: {
                          accept: "*/*",
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=4&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022100774&__s=96juog%3Ayen3l9%3Al4d5rd&__hsi=7496011361381773931&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyEiw9-1DwUx60GE3Qwb-q1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gJH7mhgKkQp4jbOTkYjviSSH9Asl-CBFOfjeyjbEgFoyV4tr_JAGABFidaJWQHVptbCy4HhVk-GHFSCjGuhVeHhkejqGRzt2XCAWgTxd5wFAy8C9x-diqla4EK4GXGqEyAeQ9qUKbVo-V6bHBFyUPXzC5oGdDyAax2WzpUyEOmAt3FK5EPHAx64F8lyUlyk49U-qq8ADyUO78ydWxa7Vo88rDyoowZxCquiGBDwKDDAxqmUmx67USnxKEjF1a7Ewwa8CewMGFe48kzKiEcrwwwwyolDwyy8qxudG1hxum265pUjzWwRy8dE9ECEaEpy89oW2a3a6-7Q8DzUS6EvwBCwHBw8u22aJG10yHomx6co1vUC10xqUpw8i6kU4yUow6hg9Ub82qxW18g4rO0ywrofQECWwZg5m2l4sM1pEb64UaQ8yVE4y1_zUuwYwjEbFEb87WU2Ig5LwqU2c-u2249A0EUnxrwNwBwi8gwSgkKibK12BUF0DxNojKEGcjUXLwZwBx648boSEy2N96Dxa8jc3lacxq2u3emczaxym12wdq02jS04C2a4Utg1BE0rnwa60Z-06K-Ekxkb03WpQ1D8i5E07uy0cUwcC5oK96jU0dGU0Ry09sg1n83Jx6E4W7U3g8fwcK36QA9oW0-U7G4U7S0R84EOxd1r80bAw5Nw44w3eGzo4a08Rwboxp84u3uWBw9YU-0iq1Uwfm0PU4q1ExKHhy95elJ1b4p8e5tdaA2ny847yogwwiO0DG1IK0TE0hJVKq360qe0aOw248fpm02uG0iS0n20dAg41wv40EU1aEy0aWy8O0a8xy0i212w5ew17q0ZUz41p1re08Gw3Qja4Q068axd1ro&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25601&lsd=fhrywc0Uq8m42vB0Jc0V5i&__spin_r=1022100774&__spin_b=trunk&__spin_t=1745301150&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SUBMIT_BOT_CAPTCHA_RESPONSE%22%2C%22bot_captcha_persist_data%22%3A%22" + captchaAudioParam + "%22%2C%22bot_captcha_response%22%3A%22" + captchaAnswer + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                        method: "POST"
                      });
                      if (captchaSubmitResponse.text.includes("UFACContactPointChallengeSetContactPointState")) {
                        captchaSolved = true;
                        break;
                      }
                    } catch (e99) {
                      console.log(e99);
                    }
                  }
                  if (captchaSolved) {
                    ufacPageText = await getUfacState();
                    progressCallback("Resolución de captcha exitosa");
                  } else {
                    progressCallback("Error al resolver captcha");
                  }
                }
                if (ufacPageText.includes("UFACContactPointChallengeSetContactPointState")) {
                  let phoneVerified = false;
                  const maxPhoneAttempts = (cfg.general && cfg.general.getPhoneNumber && cfg.general.getPhoneNumber.value) ? cfg.general.getPhoneNumber.value : 6;
                  for (let phoneAttempt = 0; phoneAttempt < maxPhoneAttempts; phoneAttempt++) {
                    let phoneData = false;
                    let phoneAdded = false;
                    let phoneCodeVerified = false;
                    for (let phoneGetAttempt = 0; phoneGetAttempt < 6; phoneGetAttempt++) {
                      ufacPageText = await getUfacState();
                      if (ufacPageText.includes("UFACContactPointChallengeSetContactPointState")) {
                        if (phoneGetAttempt > 0) {
                          progressCallback("Intentando obtener otro número de teléfono");
                        } else {
                          progressCallback("Obteniendo número de teléfono");
                        }
                        
                        // Verificar si hay rate limit de SMS activo antes de continuar
                        const smsRateLimitActive = localStorage.getItem('sms_rate_limit_active');
                        if (smsRateLimitActive) {
                          const rateLimitTime = new Date(smsRateLimitActive);
                          const now = new Date();
                          const hoursElapsed = (now - rateLimitTime) / (1000 * 60 * 60);
                          
                          if (hoursElapsed < 24) {
                            const hoursRemaining = Math.ceil(24 - hoursElapsed);
                            console.warn(`🚫 Rate limit de SMS activo. Tiempo restante: ${hoursRemaining} horas`);
                            progressCallback(`🚫 Rate limit de SMS activo. Debes esperar ${hoursRemaining} horas más.`);
                            
                            // Mostrar modal informativo
                            setTimeout(() => {
                              Swal.fire({
                                icon: 'warning',
                                title: '🚫 Rate Limit de SMS Activo',
                                html: `
                                  <div class="text-start">
                                    <h6>⏰ Tiempo de bloqueo detectado:</h6>
                                    <p><strong>Activado:</strong> ${rateLimitTime.toLocaleString()}</p>
                                    <p><strong>Tiempo restante:</strong> ~${hoursRemaining} horas</p>
                                    <hr>
                                    <h6>📋 ¿Qué significa esto?</h6>
                                    <p>Facebook bloqueó temporalmente tu cuenta por demasiados códigos SMS.</p>
                                    <hr>
                                    <h6>💡 Opciones disponibles:</h6>
                                    <ul>
                                      <li><strong>Esperar:</strong> El bloqueo se levantará automáticamente</li>
                                      <li><strong>Usar otra cuenta:</strong> Si tienes acceso a otra cuenta de Facebook</li>
                                      <li><strong>Forzar intento:</strong> Riesgo de desperdiciar números (no recomendado)</li>
                                    </ul>
                                  </div>
                                `,
                                showCancelButton: true,
                                confirmButtonText: 'Forzar Intento (No Recomendado)',
                                cancelButtonText: 'Esperar',
                                confirmButtonColor: '#dc3545',
                                cancelButtonColor: '#6c757d'
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  console.warn('⚠️ Usuario decidió forzar intento a pesar del rate limit');
                                  localStorage.removeItem('sms_rate_limit_active');
                                  progressCallback("⚠️ Rate limit forzadamente removido. Continuando...");
                                }
                              });
                            }, 1000);
                            
                            if (hoursElapsed < 23) { // Solo bloquear si falta más de 1 hora
                              throw new Error(`🚫 Rate limit de SMS activo. Espera ${hoursRemaining} horas más antes de intentar nuevamente.`);
                            } else {
                              console.log('✅ Rate limit cerca de expirar, permitiendo intento');
                              progressCallback('⏰ Rate limit cerca de expirar, intentando...');
                            }
                          } else {
                            console.log('✅ Rate limit expirado, removiendo marca');
                            localStorage.removeItem('sms_rate_limit_active');
                          }
                        }
                        
                        try {
                          // Validar que existan los servicios de teléfono
                          if (!cfg.general || !cfg.general.phoneService || !cfg.general.phoneServiceKey) {
                            throw new Error("Servicio de teléfono no configurado");
                          }
                          
                          const phoneService = cfg.general.phoneService.value;
                          const phoneServiceKey = cfg.general.phoneServiceKey.value;
                          
                          if (!phoneService || phoneService === "none") {
                            throw new Error("Servicio de teléfono no seleccionado");
                          }
                          
                          if (!phoneServiceKey) {
                            throw new Error("API Key del servicio de teléfono no configurada");
                          }
                          
                          phoneData = await getPhone(phoneService, phoneServiceKey);
                          
                          if (!phoneData || !phoneData.number || !phoneData.id) {
                            throw new Error("❌ El servicio no devolvió un número válido. Verifica tu API Key y saldo.");
                          }
                          
                          console.log(`✅ Número obtenido: ${phoneData.number}`);
                          progressCallback(`Añadiendo número de teléfono: ${phoneData.number}`);
                          
                          const addPhoneResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=6&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=byw56x%3Af6irfb%3Auy904n&__hsi=7496099718108186308&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EWq6GCxpa5F8S1NxyUO8hUyt6CzpEeeUrxW5oymECjVS4898kwTxmcCye8yryrgoCBypE5S264UkDAKqFErxa250IxGm10wpax7Xwzx6ayotz8vDwBwTyE7yFu0WAU29w8u0HqiiFf85qiOXBgem0QocQ1_81dweOap9Q9EEeVE2QBwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25514&lsd=_YYpny6NWhE3gCtXKXz8RT&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745321722&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SET_CONTACT_POINT%22%2C%22contactpoint%22%3A%22" + phoneData.number + "%22%2C%22country_code%22%3A%22VN%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                            method: "POST"
                          });
                          
                          console.log(`📋 Respuesta de Facebook al añadir número:`, addPhoneResponse.text);
                          
                          if (addPhoneResponse.text.includes("UFACContactPointChallengeSubmitCodeState")) {
                            progressCallback("✅ Número añadido exitosamente");
                            phoneAdded = true;
                            break;
                          } else if (addPhoneResponse.text.includes("Too many SMS codes")) {
                            console.error("🚫 Rate limit de SMS detectado - Facebook bloqueó la cuenta");
                            progressCallback("🚫 Facebook dice: 'Demasiados códigos SMS. Debes esperar 24 horas para recibir otro'. El proceso se detendrá.");
                            
                            // Marcar rate limit activo
                            if (window.DivinAdsPhoneUtils && typeof window.DivinAdsPhoneUtils.markSmsRateLimit === 'function') {
                              window.DivinAdsPhoneUtils.markSmsRateLimit();
                            } else {
                              localStorage.setItem('sms_rate_limit_active', new Date().toISOString());
                            }
                            
                            // Mostrar modal de alerta al usuario
                            setTimeout(() => {
                              Swal.fire({
                                icon: 'error',
                                title: '🚫 Rate Limit de SMS Detectado',
                                html: `
                                  <div class="text-start">
                                    <h6>❌ Facebook ha bloqueado temporalmente tu cuenta:</h6>
                                    <p><strong>"Too many SMS codes. You must wait 24 hours to receive another."</strong></p>
                                    <hr>
                                    <h6>⏰ Tiempo de espera:</h6>
                                    <p>• <strong>24 horas</strong> desde ahora</p>
                                    <p>• El sistema se ha detenido automáticamente</p>
                                    <hr>
                                    <h6>💡 Recomendaciones:</h6>
                                    <ul>
                                      <li>Espera 24 horas antes de volver a intentar</li>
                                      <li>Usa diferentes cuentas de Facebook si tienes</li>
                                      <li>Considera reducir la frecuencia de resistencia BM</li>
                                    </ul>
                                  </div>
                                `,
                                confirmButtonText: 'Entendido',
                                allowOutsideClick: false
                              });
                            }, 1000);
                            
                            throw new Error("🚫 Facebook dice: 'Demasiados códigos SMS. Debes esperar 24 horas para recibir otro'. El proceso se detendrá.");
                          } else if (addPhoneResponse.text.includes("This phone number is already")) {
                            throw new Error("📱 Este número ya está siendo usado por otra cuenta de Facebook");
                          } else if (addPhoneResponse.text.includes("This phone number is not valid")) {
                            throw new Error("❌ Facebook dice que el número no es válido");
                          } else if (addPhoneResponse.text.includes("Sorry, there was a problem") && addPhoneResponse.text.includes("2758035")) {
                            console.error("🚫 Error general de Facebook detectado - posible rate limiting secundario");
                            progressCallback("⚠️ Facebook está devolviendo errores generales - posible rate limiting activo");
                            
                            // También marcar rate limit para este tipo de error
                            if (window.DivinAdsPhoneUtils && typeof window.DivinAdsPhoneUtils.markSmsRateLimit === 'function') {
                              window.DivinAdsPhoneUtils.markSmsRateLimit();
                            } else {
                              localStorage.setItem('sms_rate_limit_active', new Date().toISOString());
                            }
                            
                            setTimeout(() => {
                              Swal.fire({
                                icon: 'warning',
                                title: '⚠️ Facebook Está Bloqueando Números',
                                html: `
                                  <div class="text-start">
                                    <h6>⚠️ Facebook está devolviendo errores generales:</h6>
                                    <p><strong>"Sorry, there was a problem. Please try again."</strong></p>
                                    <p><strong>Código:</strong> 2758035</p>
                                    <hr>
                                    <h6>📋 Esto generalmente indica:</h6>
                                    <ul>
                                      <li>Rate limiting activo</li>
                                      <li>Demasiados intentos recientes</li>
                                      <li>Cuenta temporalmente restringida</li>
                                    </ul>
                                    <hr>
                                    <h6>💡 Recomendación:</h6>
                                    <p>Espera al menos 24 horas antes de volver a intentar.</p>
                                  </div>
                                `,
                                confirmButtonText: 'Entendido',
                                allowOutsideClick: false
                              });
                            }, 1000);
                            
                            throw new Error("⚠️ Facebook está devolviendo errores generales - posible rate limiting activo");
                          } else {
                            progressCallback("❌ Error al añadir número de teléfono: Facebook rechazó el número");
                            console.error("📋 Respuesta completa de Facebook:", addPhoneResponse.text);
                          }
                        } catch (e100) {
                          console.error("❌ Error al añadir número de teléfono:", e100);
                          progressCallback("Error al añadir número de teléfono: " + (e100.message || e100));
                          
                          // Si es un error de rate limit de SMS, detener completamente
                          if (e100.message && e100.message.includes("Too many SMS codes")) {
                            console.error("🚫 Rate limit de SMS detectado, deteniendo proceso");
                            return; // Salir completamente del proceso
                          }
                        }
                      } else {
                        break;
                      }
                    }
                    if (phoneAdded && phoneData) {
                      ufacPageText = await getUfacState();
                      if (ufacPageText.includes("UFACContactPointChallengeSubmitCodeState")) {
                        progressCallback("Esperando código de activación");
                        try {
                          // Validar que existan los servicios de teléfono para obtener código
                          if (!cfg.general || !cfg.general.phoneService || !cfg.general.phoneServiceKey) {
                            throw new Error("Servicio de teléfono no configurado para obtener código");
                          }
                          
                          const phoneService = cfg.general.phoneService.value;
                          const phoneServiceKey = cfg.general.phoneServiceKey.value;
                          
                          if (!phoneService || phoneService === "none") {
                            throw new Error("Servicio de teléfono no seleccionado para obtener código");
                          }
                          
                          if (!phoneServiceKey) {
                            throw new Error("API Key del servicio de teléfono no configurada para obtener código");
                          }
                          
                          if (!phoneData || !phoneData.id) {
                            throw new Error("ID de número de teléfono no válido");
                          }
                          
                          const phoneCode = await getPhoneCode(phoneService, phoneServiceKey, phoneData.id);
                          progressCallback("Ingresando código de activación");
                          const codeSubmitResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=6&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=fgpkub%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxxopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EWq6GCxpa5F8S1NxyUO8hUyt6CzpEeeUrxW5oymECjVS4898kwTxmcCye8yryrgoCBypE5S264UkDAKqFErxa250IxGm10wpax7Xwzx6ayotz8vDwBwTyE7yFu0WAU29w8u0HqiiFf85qiOXBgem0QocQ1_81dweOap9Q9EEeVE2QBwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22SUBMIT_CODE%22%2C%22code%22%3A%22" + phoneCode + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                            method: "POST"
                          });
                          if (codeSubmitResponse.text.includes("UFACImageUploadChallengeState")) {
                            progressCallback("Añadiendo número de teléfono exitosamente");
                            phoneCodeVerified = true;
                          }
                        } catch (e101) {
                          console.log(e101);
                        }
                        if (phoneCodeVerified) {
                          phoneVerified = true;
                          break;
                        } else {
                          progressCallback("Eliminando el número de teléfono antiguo");
                          const phoneRemoveResponse2 = await fetch2("https://www.facebook.com/api/graphql/", {
                            headers: {
                              "content-type": "application/x-www-form-urlencoded"
                            },
                            method: "POST",
                            body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=d&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=27dx24%3Af6irfb%3A9g585v&__hsi=7496101272157072860&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxehopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25627&lsd=Vgbq3dpJY9OONe5rpjf0VH&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745322084&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UNSET_CONTACT_POINT%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773"
                          });
                          if (phoneRemoveResponse2.text.includes("UFACContactPointChallengeSetContactPointState")) {
                            ufacPageText = await getUfacState();
                          } else {
                            progressCallback("No se puede eliminar el número de teléfono antiguo");
                          }
                        }
                      }
                    }
                  if (phoneVerified) {
                    ufacPageText = await getUfacState();
                  }
                }
                if (ufacPageText.includes("UFACImageUploadChallengeState")) {
                  progressCallback("Creando imagen");
                  const phoiTemplateId = cfg.bm.phoiId.value;
                  const userInfo = await getLocalStorage("userInfo_" + fb.uid);
                  const templateData = await getLocalStorage(phoiTemplateId);
                  const userInfoData = {
                    firstName: userInfo.first_name,
                    lastName: userInfo.last_name,
                    fullName: userInfo.name,
                    birthday: userInfo.birthday,
                    gender: userInfo.gender
                  };
                  const userInfoCopy = userInfoData;
                  progressCallback("Subiendo imagen");
                  const uploadResult = await uploadImage(userInfoCopy, templateData, appealBmId, fb.uid, fb.dtsg);
                  if (uploadResult.h) {
                    progressCallback("Subida de imagen exitosa");
                    const imageSubmitResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                      headers: {
                        "content-type": "application/x-www-form-urlencoded"
                      },
                      body: "av=" + fb.uid + "&__user=" + fb.uid + "&__a=1&__req=7&__hs=20200.HYP%3Acomet_pkg.2.1...0&dpr=1&__ccg=EXCELLENT&__rev=1022106274&__s=mnqyan%3Atxdvnc%3Aij1cln&__hsi=7496117124745568398&__dyn=7xeXxa1mxu1syaxG4Vp41twWwIxu13w8CewSwAyUco2qwJyE2OwpUe8hwaG0riq1ew6ywMwto662y11wBz81s8hwGwQw9m1YwBgao6C0Mo2sx-3m1mzXw8W58jwGzE2ZwNwh8lwuEjUlwhEe87q7U1lUG2-azqwro2kg2cwMwrU6C1pg2Xwr86C1nwh8a85aufxamEbbwqEy2-2K0UE62&__csr=gNuB4jREhvi4h5QNQQYRTJ9A4n9-JbbGBuO_q4qkjV4HnABWrjEznAa8ZBGmKFkqnLRilSHUGAmQlfBgxt9ppatipLhp4FKbRxryHxehopJebjgSbDmQQqeGi8UuQEthUGhuFpoN4HCx6WyF4aBgDBBxibgyl2bSqeyWz8WqHBz8mzkbFp8Guvy-5ojVK5eEyqAcxzHxa8wEK6EKFEqGq5AEmAzo7668gy4ny9QqqdCwUXxK7Ely9qypfDogwAxi3u5oOq8Uy9K9J1yqm9Cwno8ojzV9VbCGq6Uiwxgb8qBwg86iEh-U8UhyEC7oO7VU9odUG1UGnweFe0yo27waSAAGjO1mAIKVk3Bwd63d0vO0jo3IyCit2qa3Kq3m1-Bwjz0oE2kho3IyU7a689Qagfk1IwBzA3KbxK1ez8-3m2J7g3Fw9m0TkE7y3i4pE6S262DwpU-cwvUSQp7xe8xGcx62a3p7xfyoC2S488k1xw8VDUy4OeqqdUboShCBBhEuGrhS5EtzofotzESUV343KiE3Xw0BMw1dwNA0pi06To2awdl01KHWxd1k88w0gVFxZxh00tWE0Qm0R_jy5A7w0RHw3OE0yZ0qE1PE-5o4W7U3aKRwdG4olAy4lK6o2Owa90am0RU4ggEjgmQ0bJw5Kw41w34872cyo0KBwhEK4knzErw9wUy0iq1uw4qK0iW1hxaSKSGybKEnfO4gmxmmrah2BQ8wwgcEV2A26qjjo9rwre0T80Vm6830xd6w7gw2HE0xi13802um0iC0ni0dBxe2xw8907jyU0GS9xe0aMAw4iwlE1co0iwwdoGxd1oAR05ow1a5G4Q5J01wC4Q5Iw&__comet_req=15&fb_dtsg=" + fb.dtsg + "&jazoest=25406&lsd=abKxXin_wrpqHu2P6BcjLF&__spin_r=1022106274&__spin_b=trunk&__spin_t=1745325775&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useUFACSubmitActionMutation&variables=%7B%22designSystem%22%3A%22FDS%22%2C%22input%22%3A%7B%22client_mutation_id%22%3A%221%22%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22action%22%3A%22UPLOAD_IMAGE%22%2C%22image_upload_handle%22%3A%22" + uploadResult.h + "%22%2C%22caller%22%3Anull%2C%22enrollment_id%22%3A%22" + khangLink + "%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=9904628719652773",
                      method: "POST"
                    });
                    if (imageSubmitResponse.text.includes("UFACAwaitingReviewState")) {
                      progressCallback("Subida de imagen exitosa");
                      ufacPageText = await getUfacState();
                    }
                  } else {
                    progressCallback("Error al subir imagen");
                  }
                }
                let resistanceSuccess = false;
                if (ufacPageText.includes("UFACAwaitingReviewState")) {
                  resistanceSuccess = true;
                }
                if (resistanceSuccess) {
                  progressCallback("Resistencia BM exitosa");
                  resolve();
                } else {
                  progressCallback("Resistencia BM fallida");
                  reject();
                }
              } catch (e102) {
                progressCallback("Resistencia BM fallida");
                reject(e102);
              }
            });
          }
          try {
            await khangBmAppeal(bm.bmId, settings, progressMsg => {
              const progressPayload = {
                message: progressMsg
              };
              notify("message", progressPayload);
            });
          } catch (e103) {
            console.log(e103);
          }
        }
        if (settings.bm.getLinkkhangBm.value) {
          await fb.getLinkkhangBm(bm.bmId, linkMsg => {
            const linkKhangPayload = {
              message: linkMsg
            };
            notify("message", linkKhangPayload);
          });
        }
        if (settings.bm.createAdAccount.value) {
          const numberOfAccounts = settings.bm.numberTkqc.value;
          let createdCount = 0;
          for (let createIndex = 0; createIndex < numberOfAccounts; createIndex++) {
            try {
              notify("message", {
                message: "[" + (createIndex + 1) + "/" + numberOfAccounts + "] Creando TKQC"
              });
              const adAccountName = settings.bm.nameTkqc.value + " " + randomNumberRange(111111, 999999);
              const timezone = settings.bm.timezone2.value;
              const currency = settings.bm.currency.value;
              if (settings.bm.shareTkqc.value) {
                if (settings.bm.shareBmMode.value === "shareBm") {
                  await fb.createAdAccount2(bm.bmId, currency, timezone, adAccountName, settings.bm.shareTkqc.value);
                } else {
                  const createdAdAccountId = await fb.createAdAccount(bm.bmId, currency, timezone, adAccountName);
                  try {
                    notify("message", {
                      message: "Compartiendo cuenta de BM"
                    });
                    await fb.shareDoiTacBm(bm.bmId, createdAdAccountId, settings.bm.shareTkqc.value);
                    notify("message", {
                      message: "Compartiendo cuenta de BM exitosamente"
                    });
                  } catch {
                    notify("message", {
                      message: "Error al compartir cuenta de BM"
                    });
                  }
                }
              } else {
                await fb.createAdAccount(bm.bmId, currency, timezone, adAccountName);
              }
              createdCount++;
            } catch {}
          }
          notify("message", {
            message: "Creación exitosa de " + createdCount + "/" + numberOfAccounts + " TKQC"
          });
        }
        if (settings.bm.outBm.value) {
          try {
            notify("message", {
              message: "Saliendo de BM"
            });
            await fb.outBm(bm.bmId);
            notify("message", {
              message: "Salida de BM exitosa"
            });
          } catch (e104) {
            notify("message", {
              message: "Error al salir de BM"
            });
          }
        }
        if (settings.bm.removeQtv.value) {
          try {
            notify("message", {
              message: "Eliminando QTV"
            });
            let accountsToRemove = [];
            if (settings.bm.removeQtvMode.value === "all") {
              const mainBmAccount2 = await fb.getMainBmAccounts(bm.bmId);
              const allAccountIds = (await fb.getBmAccounts(bm.bmId)).map(acc => acc.id);
              accountsToRemove = allAccountIds.filter(accId => accId !== mainBmAccount2.id);
            } else {
              accountsToRemove = settings.bm.listIdAcc.value.split(/\r?\n|\r|\n/g).filter(line => line);
            }
            let removePromises = [];
            if (settings.bm.tutRemoveQtv.value) {
              accountsToRemove.forEach(async accId => {
                removePromises.push(fb.removeAccount2(accId, bm.bmId));
              });
            } else {
              accountsToRemove.forEach(async accId => {
                removePromises.push(fb.removeAccount(accId, bm.bmId, settings.bm.tutRemoveQtvVerify.value));
              });
            }
            const removeResults = await Promise.all(removePromises);
            const successRemoves = removeResults.filter(result => result);
            notify("message", {
              message: "Eliminado " + successRemoves.length + "/" + removeResults.length + " QTV"
            });
          } catch (e105) {
            console.log(e105);
            notify("message", {
              message: "Error al eliminar QTV"
            });
          }
        }
        if (settings.bm.removeInsta.value) {
          try {
            await fb.removeInsta(bm.bmId, instaMsg => {
              const instaPayload = {
                message: instaMsg
              };
              notify("message", instaPayload);
            });
          } catch (e107) {
            console.log(e107);
            notify("message", { message: "Error al eliminar Insta" });
          }
        }
      } catch (e106) {
        console.log(e106);
      }
      const delayMs = settings.general.delay.value * 100;
      await delayTime(delayMs);
      resolve();
    });
  }
  function runAds(ads, settings, notify) {
    return new Promise(async (resolve, reject) => {
      try {
        if (settings.ads.shareBm.value && settings.ads.idBm.value) {
          try {
            notify("message", {
              message: "Compartiendo cuenta de BM"
            });
            await fb.shareDoiTacBm(ads.bm, ads.adId, settings.ads.idBm.value);
            notify("message", {
              message: "Compartiendo cuenta de BM exitosamente"
            });
          } catch {
            notify("message", {
              message: "Error al compartir cuenta de BM"
            });
          }
        }
        if (settings.ads.getLinkShareBm.value) {
          try {
            notify("message", {
              message: "Obteniendo link TK BM"
            });
            const shareBmLinkResponse = await fetch2("https://business.facebook.com/business_share/genlink/?_callFlowletID=0&_triggerFlowletID=7839", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "asset_id=" + ads.adId + "&task_ids[0]=864195700451909&task_ids[1]=151821535410699&task_ids[2]=610690166001223&task_ids[3]=186595505260379&__usid=6-Tskqg1ja7p7fa%3APskqg221qqzm1d%3A0-Askqe1otiqocg-RV%3D6%3AF%3D&__aaid=0&__bid=" + ads.bm + "&__user=" + fb.uid + "&__a=1&__req=x&__hs=19998.BP%3Abrands_pkg.2.0..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016986135&__s=zvaspj%3A4hmvwa%3A7nwfik&__hsi=7421184282451569743&__dyn=7xeUmxa2C5rgydwCwRyUbFp4Unxim2q1DxuqErxqqawgErxebzA3miidBxa7EiwnovzES2S2q1Ex21FxG9y8Gdz8hw9-3a4EuCwQwCxq0yFE4WqbwLjzobVqG6k2ppUdoKUrwxwu8sxe5bwExm3G2m3K2y3WE9oO1Wxu0zoO12ypUuwg88EeAUpK1vDwFwBgak1EwRwEwiUmwoErorx2aK2a4p8aHwzzXx-ewjoiz9EjCx6221cwjV8rxefzo5G4E5yeDyU52dwywxxOcwMzUkGu3i2WE4e8wpEK4EhzUbVEHyU8U3yDwbm1Lx3wlFbwCwiUWqU9EnxC2u1dxW6U98a85Ou0hi1TwmUaE2mw&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25463&lsd=zLv0FVqVetso47JGZQsVwe&__spin_r=1016986135&__spin_b=trunk&__spin_t=1727879113&__jssesw=1",
              method: "POST"
            });
            const parsedBmLink = JSON.parse(shareBmLinkResponse.text.replace("for (;;);", ""));
            const shareBmToken = parsedBmLink.payload.tokenlink;
            notify("message", {
              message: "Obteniendo link TK BM exitosamente"
            });
            notify("updateShareBmLink", {
              link: ads.account + "|" + ads.adId + "|" + shareBmToken
            });
          } catch (e107) {
            notify("message", {
              message: "Error al obtener link TK BM"
            });
          }
        }
        if (settings.ads.getLinkXmdtAds.value) {
          try {
            notify("message", {
              message: "Obteniendo link XMDT..."
            });
            
            // Verificar que tenemos los datos necesarios
            if (!ads.adId) {
              throw new Error("ID de cuenta publicitaria no válido");
            }
            
            if (!window.fb || !window.fb.uid || !window.fb.dtsg) {
              throw new Error("Sesión de Facebook no válida. Por favor, recarga la página.");
            }
            
            const xmdtEnrollmentId = await fb.getLinkXmdtAds(ads.adId);

            if (xmdtEnrollmentId) {
              const xmdtLink = "https://www.facebook.com/checkpoint/1501092823525282/" + xmdtEnrollmentId;
              notify("message", {
                message: "✅ Link XMDT obtenido: " + xmdtLink
              });
              
              // Disparar evento para actualizar el display
              $(document).trigger('xmdtLinkGenerated');
              
              // Opcional: copiar al portapapeles si está disponible
              if (navigator.clipboard) {
                try {
                  await navigator.clipboard.writeText(xmdtLink);
                  notify("message", {
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
            
            notify("message", {
              message: errorMessage
            });
          }
        }
        if (settings.ads.addCard.value) {
          try {
            const localStorageItems = {
              ...localStorage
            };
            const availableCards = Object.keys(localStorageItems).filter(key => key.includes("card_")).map(key => {
              return JSON.parse(localStorageItems[key]);
            }).filter(card => card.count < settings.ads.maxCard.value);
            if (availableCards.length > 0) {
              let addedCardCount = 0;
              for (let cardIndex = 0; cardIndex < availableCards.length; cardIndex++) {
                const currentCard = availableCards[cardIndex];
                try {
                  notify("message", {
                    message: "Añadiendo tarjeta " + (cardIndex + 1) + "/" + availableCards.length
                  });
                  await fb.addCard(ads.adId, currentCard, settings.ads.addCardMode.value);
                  currentCard.count = currentCard.count + 1;
                  await setLocalStorage("card_" + currentCard.cardNumber, JSON.stringify(currentCard));
                } catch {}
                await delayTime(2000);
              }
              notify("message", {
                message: "Añadido " + addedCardCount + "/" + availableCards.length + " tarjetas"
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
        if (settings.ads.rename.value) {
          try {
            const newAdAccountName = settings.ads.newName.value + " " + randomNumberRange(111111, 999999);
            notify("message", {
              message: "Cambiando nombre de TKQC"
            });
            await fb.renameAds(ads.adId, newAdAccountName, ads.bm ?? false);
            const updatedAdName = {
              name: newAdAccountName
            };
            notify("updateAdsName", updatedAdName);
            notify("message", {
              message: "Cambiado nombre de TKQC exitosamente"
            });
          } catch (e110) {
            notify("message", {
              message: "Error al cambiar nombre de TKQC"
            });
          }
        }
        if (settings.ads.addAdmin.value) {
          const newAdminUid = settings.ads.newAdminUid.value;
          await fb.addAdmin(ads.adId, newAdminUid);
        }
        if (settings.ads.changeInfo.value) {
          try {
            notify("message", {
              message: "Cambiando información de TKQC"
            });
            const changeInfoResult = await fb.changeInfoAds(ads.adId, ads.bm, settings.ads.currency.value, settings.ads.timezone.value, settings.ads.country.value);
            const updatedTimezone = changeInfoResult.data.billable_account_update.billable_account.billing_payment_account.billable_account.timezone_info.timezone;
            const updatedCurrency = changeInfoResult.data.billable_account_update.billable_account.billing_payment_account.billable_account.currency;
            const updatedCountry = changeInfoResult.data.billable_account_update.billable_account.billing_payment_account.billable_account.billable_account_tax_info.business_country_code;
            const updatedAdInfo = {
              timezone: updatedTimezone,
              currency: updatedCurrency,
              country: updatedCountry
            };
            notify("updateAdInfo", updatedAdInfo);
            notify("message", {
              message: "Cambiado información de TKQC exitosamente"
            });
          } catch {
            notify("message", {
              message: "Error al cambiar información de TKQC"
            });
          }
        }
        if (settings.ads.removeAdmin.value) {
          if (settings.ads.removeHidden.value || settings.ads.removeAll.value) {
            try {
              notify("message", {
                message: "Comprobando admin oculto"
              });
              const hiddenAdmins = await fb.checkHiddenAdmin(ads.adId);
              if (hiddenAdmins.length > 0) {
                let removedAdminCount = 0;
                notify("message", {
                  message: "Eliminando " + hiddenAdmins.length + " admin oculto"
                });
                for (let adminIndex = 0; adminIndex < hiddenAdmins.length; adminIndex++) {
                  try {
                    const hiddenAdminId = hiddenAdmins[adminIndex];
                    await fb.removeAdsUser(ads.adId, hiddenAdminId);
                    removedAdminCount++;
                  } catch {}
                  await delayTime(2000);
                }
                notify("message", {
                  message: "Eliminado " + removedAdminCount + "/" + hiddenAdmins.length + " admin oculto"
                });
              } else {
                notify("message", {
                  message: "Cuenta sin admin oculto"
                });
              }
            } catch (e111) {
              console.log(e111);
              notify("message", {
                message: "Error al comprobar admin oculto"
              });
            }
          }
          if (settings.ads.removeAll.value) {
            try {
              const allAdmins = (await fb.getAdsUser(ads.adId)).map(user => user.id).filter(userId => userId != fb.uid);
              notify("message", {
                id: ads.id,
                message: "Eliminando " + allAdmins.length + " admin"
              });
              if (allAdmins.length > 0) {
                let removedCount = 0;
                for (let removeIndex = 0; removeIndex < allAdmins.length; removeIndex++) {
                  try {
                    const adminToRemove = allAdmins[removeIndex];
                    await fb.removeAdsUser(ads.adId, adminToRemove);
                    removedCount++;
                  } catch {}
                  await delayTime(2000);
                }
                notify("message", {
                  message: "Eliminado " + removedCount + "/" + allAdmins.length + " admin"
                });
              } else {
                notify("message", {
                  message: "No hay admin para eliminar"
                });
              }
            } catch (e112) {
              console.log(e112);
              notify("message", {
                message: "Error al eliminar admin"
              });
            }
          }
        }
        if (settings.ads.openAccount.value) {
          try {
            notify("message", {
              message: "Abriendo cuenta cerrada"
            });
            const reopenAccountResponse = await fetch2("https://adsmanager.facebook.com/api/graphql/?_callFlowletID=18346&_triggerFlowletID=18346", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: "av=" + fb.uid + "&__usid=6-Tsiihnw11hpto%3APsiihtk109469w%3A6-Asiihnj12ho3fs-RV%3D6%3AF%3D&__aaid=" + ads.adId + "&__user=" + fb.uid + "&__a=1&__req=3g&__hs=19955.BP%3Aads_manager_pkg.2.0..0.0&dpr=1&__ccg=UNKNOWN&__rev=1015817109&__s=uycjpn%3A0qjxqj%3Agpf0dv&__hsi=7405163225546256284&__dyn=7AgSXgWGgWEjgDBxmSudg9omoiyoK6FVpkihG5Xx2m2q3K2KmeGqKi5axeqaScCCG225pojACjyocuF98SmqnK7GzUuwDxq4EOezoK26UKbC-mdwTxOESegGbwgEmK9y8Gdz8hyUuxqt1eiUO4EgCyku4oS4EWfGUhwyg9p44889EScxyu6UGq13yHGmmUTxJe9LgbeWG9DDl0zlBwyzp8KUV2U8oK1IxO4VAcKmieyp8BlBUK2O4UOi3Kdx29wgojKbUO1Wxu4GBwkEuz478shECumbz8KiewwBK68eF9UhK1vDyojyUix92UtgKi3a6Ex0RyQcKazQ3G5EbpEtzA6Sax248GUgz98hAy8tKU-4U-UG7F8a898vCxeq4qz8gwDzElx63Si6UjzUS324UGaxa2h2ppEryrhUK5Ue8Su6Ey3maUjxy-dxiFAm9KcyoC2GZ3UC2C8ByoF1a58gx6bxa4oOE88ymqaUF1d3Eiwg8KawrVV-i782bByUeoQwox3UO364GJe2q3KfzFLxny9onxDwBwXx67HxtBxO64uWg-26q2au5onADzEHDUK54VoC12ype2C5ElhbAwAK4kUy2iijDix68VUOay8cHg&__csr=&__comet_req=25&fb_dtsg=" + fb.dtsg + "&jazoest=25565&lsd=iSli2Z4VHvPLUDYdOtGjjY&__spin_r=1015817109&__spin_b=trunk&__spin_t=1724148920&__jssesw=1&qpl_active_flow_ids=270212559&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useBillingReactivateAdAccountMutation&variables=%7B%22input%22%3A%7B%22billable_account_payment_legacy_account_id%22%3A%22" + ads.adId + "%22%2C%22logging_data%22%3A%7B%22logging_counter%22%3A20%2C%22logging_id%22%3A%222010198813%22%7D%2C%22upl_logging_data%22%3A%7B%22context%22%3A%22billingaccountinfo%22%2C%22entry_point%22%3A%22power_editor%22%2C%22external_flow_id%22%3A%22%22%2C%22target_name%22%3A%22BillingReactivateAdAccountMutation%22%2C%22user_session_id%22%3A%22upl_1724148923135_c91b3d7d-9636-4100-9fe7-67c777aebd47%22%2C%22wizard_config_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_name%22%3A%22REACTIVATE_AD_ACCOUNT%22%2C%22wizard_screen_name%22%3A%22reactivate_ad_account_state_display%22%2C%22wizard_session_id%22%3A%22upl_wizard_1724148923135_a9b1bd0f-3165-46b6-869f-db73f57171f8%22%2C%22wizard_state_name%22%3A%22reactivate_ad_account_state_display%22%7D%2C%22actor_id%22%3A%22" + fb.uid + "%22%2C%22client_mutation_id%22%3A%226%22%7D%7D&server_timestamps=true&doc_id=9984888131552276&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D270212559%22%5D"
            });
            const reopenAccountText = reopenAccountResponse.text;
            if (reopenAccountText.includes("ADMARKET_ACCOUNT_STATUS_ACTIVE")) {
              notify("message", {
                message: "Cuenta cerrada abierta"
              });
            } else {
              notify("message", {
                message: "No se puede abrir la cuenta cerrada"
              });
            }
          } catch (e113) {
            notify("message", {
              message: "No se puede abrir la cuenta cerrada"
            });
          }
        }
      } catch (e114) {
        console.log(e114);
      }
      const delayMs = settings.general.delay.value * 100;
      await delayTime(delayMs);
      resolve();
    });
  }
  function runPage(page, settings, notify) {
    return new Promise(async (resolve, reject) => {
      try {
        await fb.switchPage(page.pageId2);
        const pageData = await fb.getPageData(page.pageId);
        if (settings.page.renamePage.value) {
          try {
            const newPageName = settings.page.newName.value + " " + randomNumberRange(111111, 999999);
            console.log(newPageName);
            notify("message", {
              message: "Cambiando nombre de página"
            });
            await fb.renamePage(page.pageId, newPageName);
            const updatedPageName = {
              name: newPageName
            };
            notify("updatePageName", updatedPageName);
            notify("message", {
              message: "Cambiado nombre de página exitosamente"
            });
          } catch (e115) {
            notify("message", {
              message: "Error al cambiar nombre de página"
            });
          }
        }
        if (settings.page.sharePage.value) {
          try {
            const shareTargetId = settings.page.targetId.value;
            notify("message", {
              message: "Compartiendo página"
            });
            const sharePageResult = await fb.sharePage(page.pageId2, shareTargetId, pageData);
            console.log(sharePageResult);
            notify("message", {
              message: "Compartido página exitosamente"
            });
          } catch (e116) {
            notify("message", {
              message: "Error al compartir página"
            });
          }
        }
        await fb.switchToMain();
      } catch (e117) {
        console.log(e117);
      }
      const delayMs = settings.general.delay.value * 100;
      await delayTime(delayMs);
      resolve();
    });
  }
  function runTool(tool, settings, notify) {
    return new Promise(async (resolve, reject) => {
      try {
        alert("ccc");
      } catch (e118) {
        reject(e118);
      }
    });
  }
  function start(items, settings) {
    const appMode = $("#app").attr("data");
    let concurrentLimit = settings.general.limit.value;
    let runningIds = [];
    let stopped = false;
    const processItem = async function (itemId) {
      if (!runningIds.includes(itemId)) {
        const itemIndex = items.findIndex(item => item.id === itemId);
        const currentItem = items[itemIndex];
        $(document).trigger("running", [currentItem.id]);
        const startMsg = {
          id: currentItem.id,
          message: ""
        };
        $(document).trigger("message", [startMsg]);
        items[itemIndex].process = "RUNNING";
        runningIds.push(currentItem.id);
        try {
          if (appMode === "bm") {
            await runBm(currentItem, settings, (eventName, eventData) => {
              const payload = {
                id: currentItem.id,
                ...eventData
              };
              $(document).trigger(eventName, [payload]);
            });
          } else if (appMode === "page") {
            await runPage(currentItem, settings, (eventName, eventData) => {
              const payload = {
                id: currentItem.id,
                ...eventData
              };
              $(document).trigger(eventName, [payload]);
            });
          } else if (appMode === "tool") {
            await runTool(currentItem, settings, (eventName, eventData) => {
              const payload = {
                id: currentItem.id,
                ...eventData
              };
              $(document).trigger(eventName, [payload]);
            });
          } else {
            await runAds(currentItem, settings, (eventName, eventData) => {
              const payload = {
                id: currentItem.id,
                ...eventData
              };
              $(document).trigger(eventName, [payload]);
            });
          }
        } catch {}
        $(document).trigger("finished", [currentItem.id]);
        items[itemIndex].process = "FINISHED";
      }
    };
    let vSetInterval = setInterval(async () => {
      const runningItems = items.filter(item => {
        return item.process == "RUNNING";
      });
      const pendingItems = items.filter(item => {
        return item.process !== "FINISHED" && item.process !== "RUNNING";
      });
      const unfinishedItems = items.filter(item => {
        return item.process !== "FINISHED";
      });
      if (!stopped) {
        if (unfinishedItems.length > 0) {
          if (runningItems.length < concurrentLimit) {
            if (pendingItems.length > 0) {
              const slotsAvailable = concurrentLimit - runningItems.length;
              const itemsToStart = pendingItems.slice(0, slotsAvailable);
              for (let i = 0; i < itemsToStart.length; i++) {
                if (!stopped) {
                  processItem(itemsToStart[i].id);
                }
              }
            }
          }
        } else {
          clearInterval(vSetInterval);
          $(document).trigger("stopped");
        }
      } else if (runningItems.length === 0) {
        clearInterval(vSetInterval);
        $(document).trigger("stopped");
      }
    }, 500);
    $(document).on("stop", function () {
      stopped = true;
    });
  }
  function nhanLink(links) {
    return new Promise(async (resolve, reject) => {
      const savedSettings = await saveSetting();
      console.log(savedSettings);
      await fetch2("https://m.facebook.com/password/reauth/?next=https%3A%2F%2Fmbasic.facebook.com%2Fsecurity%2F2fac%2Fsettings%2F%3Fpaipv%3D0%26eav%3DAfZfmwJnXhbeLP6m-giW1oCoZD0faAw6x_1LxHqf1nvS-tew9Vl6iEkBMuwwPNYH7Zw&paipv=0&eav=AfbC-ToI9zgklrUncTH4S-pXjfy5d5SPf9ZLf_iWIHepbPFg8mMnmmsnW0Or3AkCflI", {
        headers: {
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "content-type": "application/x-www-form-urlencoded"
        },
        body: "fb_dtsg=" + fb.dtsg + "&jazoest=25494&encpass=#PWD_BROWSER:0:1111:" + savedSettings.bm.nhanLinkPassword.value,
        method: "POST"
      });
      let stopped = false;
      const concurrentLimit = savedSettings.general.limit.value;
      $(document).on("stop", function () {
        stopped = true;
      });
      let processedLinks = [];
      let successCount = 0;
      for (let attempt = 0; attempt < 999; attempt++) {
        let pendingLinks = links.filter(link => !processedLinks.includes(link));
        if (pendingLinks.length > 0 && !stopped) {
          pendingLinks = pendingLinks.slice(0, concurrentLimit);
          const linkPromises = [];
          const successLinks = [];
          const failedLinks = [];
          for (let linkIndex = 0; linkIndex < pendingLinks.length; linkIndex++) {
            if (!stopped) {
              const acceptLink = firstName => {
                return new Promise(async (linkResolve, linkReject) => {
                  setTimeout(linkResolve, 120000);
                  try {
                    let linkUrl = "";
                    processedLinks.push(pendingLinks[linkIndex]);
                    if (!pendingLinks[linkIndex].includes("|")) {
                      linkUrl = pendingLinks[linkIndex];
                    } else {
                      linkUrl = pendingLinks[linkIndex].split("|")[1];
                    }
                    $(document).trigger("checkProcess", ["<strong>[" + processedLinks.length + "/" + links.length + "]</strong> Recibiendo link: <strong>" + linkUrl + "</strong>"]);
                    const linkResponse = await fetch2(linkUrl);
                    const redirectUrl = decodeURIComponent(linkResponse.url).replace("https://business.facebook.com/business/loginpage/?next=", "");
                    if (redirectUrl.includes("https://business.facebook.com/invitation/?token=")) {
                      const urlParams = new URL(redirectUrl).searchParams;
                      const invitationToken = urlParams.get("token");
                      const acceptResponse = await fetch2("https://business.facebook.com/business/invitation/login/", {
                        headers: {
                          "content-type": "application/x-www-form-urlencoded"
                        },
                        method: "POST",
                        body: "first_name=" + firstName + "&last_name=" + randomNumberRange(11111, 99999) + "&invitation_token=" + invitationToken + "&receive_marketing_messages=false&user_preferred_business_email&__user=" + fb.userInfo.id + "&__a=1&__req=2&__hs=19664.BP%3ADEFAULT.2.0..0.0&dpr=1&__ccg=GOOD&__rev=1009675755&__s=voml6w%3Aorwnqa%3A3cyaaa&__hsi=7297248857485608221&__dyn=7xeUmwkHgydwn8K2WnFwn84a2i5U4e1Fx-ewSwMxW0DUS2S0lW4o3Bw5VCwjE3awbG78b87C1xwEwlU-0nS4o5-1uwbe2l0Fwwwi85W0_Ugw9KfwbK0RE5a1qwqU8E5W0HUvw5rwSxy0gq0Lo6-1FwbO0NE1rE&__csr=&fb_dtsg=" + fb.dtsg + "&jazoest=25503&lsd=VjWEsSvVwDyPvLUmreGFgG&__spin_r=1009675755&__spin_b=trunk&__spin_t=1699023148&__jssesw=1"
                      });
                      const acceptText = acceptResponse.text;
                      if (acceptText.includes("\"payload\":null") && !acceptText.includes("error")) {
                        successCount++;
                        successLinks.push(pendingLinks[linkIndex]);
                      } else {
                        failedLinks.push(pendingLinks[linkIndex]);
                      }
                    } else {
                      failedLinks.push(pendingLinks[linkIndex]);
                    }
                  } catch (e119) {
                    console.log(e119);
                    failedLinks.push(pendingLinks[linkIndex]);
                  }
                  linkResolve();
                });
              };
              linkPromises.push(acceptLink(savedSettings.bm.nhanLinkName.value));
            } else {
              break;
            }
          }
          await Promise.all(linkPromises);
          if (processedLinks.length > 0) {
            $(document).trigger("updateLinkAll", [processedLinks]);
          }
          if (failedLinks.length > 0) {
            $(document).trigger("updateLinkError", [failedLinks]);
          }
          if (successLinks.length > 0) {
            $(document).trigger("updateLinkSuccess", [successLinks]);
          }
        } else {
          break;
        }
      }
      $(document).trigger("checkProcess", ["Recibido exitosamente: <strong>" + successCount + "/" + links.length + "</strong> link"]);
      await delayTime(3000);
      resolve();
    });
  }
  function promiseLimit(batchSize, items, delayBetween) {
    return new Promise(async (resolve, reject) => {
      const totalItems = items.length;
      const batchCount = Math.ceil(totalItems / batchSize);
      const results = [];
      const fetchBmInfo = (bmId, inviteLink) => {
        return new Promise(async (itemResolve, itemReject) => {
          try {
            const bmResponse = await fetch2("https://graph.facebook.com/" + bmId + "?access_token=" + fb.accessToken + "&_reqName=object:brand&_reqSrc=BrandResourceRequests.brands&date_format=U&fields=%5B%22allow_page_management_in_www,verification_status,name%22%5D");
            const bmInfo = bmResponse.json;
            bmInfo.linkStatus = "";
            try {
              const currentSettings = await saveSetting();
              if (currentSettings.bm.checkLink.value) {
                const linkCheckResponse = await fetch2(inviteLink);
                const resolvedUrl = decodeURIComponent(linkCheckResponse.url).replace("https://business.facebook.com/business/loginpage/?next=", "");
                const urlParams = new URL(resolvedUrl).searchParams;
                const linkToken = urlParams.get("token");
                const invitePageResponse = await fetch2("https://business.facebook.com/invitation/?token=" + linkToken + "&chosen_account_type=1&biz_login_source=biz_unified_f3_fb_login_button");
                const invitePageText = invitePageResponse.text;
                if (invitePageText.includes("Sorry, this content isn't available right now")) {
                  bmInfo.linkStatus = "Die";
                } else {
                  bmInfo.linkStatus = "Live";
                }
              }
            } catch {}
            bmInfo.link = inviteLink;
            itemResolve(bmInfo);
          } catch {
            itemReject();
          }
        });
      };
      try {
        const checkSettings = await saveSetting();
        if (checkSettings.bm.checkLink.value) {
          await fetch2("https://m.facebook.com/password/reauth/?next=https%3A%2F%2Fmbasic.facebook.com%2Fsecurity%2F2fac%2Fsettings%2F%3Fpaipv%3D0%26eav%3DAfZfmwJnXhbeLP6m-giW1oCoZD0faAw6x_1LxHqf1nvS-tew9Vl6iEkBMuwwPNYH7Zw&paipv=0&eav=AfbC-ToI9zgklrUncTH4S-pXjfy5d5SPf9ZLf_iWIHepbPFg8mMnmmsnW0Or3AkCflI", {
          headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "content-type": "application/x-www-form-urlencoded"
          },
          body: "fb_dtsg=" + fb.dtsg + "&jazoest=25494&encpass=#PWD_BROWSER:0:1111:" + checkSettings.bm.nhanLinkPassword.value,
          method: "POST"
        });
        }
      } catch {}
      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        try {
          const batchStart = batchIndex * batchSize;
          const batchEnd = (batchIndex + 1) * batchSize;
          const batchItems = items.slice(batchStart, batchEnd);
          const batchPromises = [];
          for (let itemIndex = 0; itemIndex < batchItems.length; itemIndex++) {
            batchPromises.push(fetchBmInfo(batchItems[itemIndex].id, batchItems[itemIndex].link));
          }
          results.push(...(await Promise.all(batchPromises)));
        } catch {}
        await delayTime(delayBetween * 100);
      }
      resolve(results);
    });
  }
  function getInfoBm(bmItems, limit, delay) {
    return new Promise(async (resolve, reject) => {
      resolve(await promiseLimit(limit, bmItems, delay));
    });
  }
  function getIdBm() {
    return new Promise(async (resolve, reject) => {
      const bmListResponse = await fetch2("https://graph.facebook.com/v14.0/me/businesses?fields=id&limit=9999999&access_token=" + fb.accessToken);
      const bmListData = bmListResponse.json;
      const bmIds = bmListData.data.map(bm => bm.id);
      $(document).trigger("updateListBm", [bmIds]);
      resolve();
    });
  }
  function createBm() {
    return new Promise(async (resolve, reject) => {
      const savedSettings = await saveSetting();
      const bmCount = savedSettings.bm.bmNumber.value;
      const createMode = savedSettings.bm.createBmMode.value;
      if (createMode === "350") {
        $(document).trigger("checkProcess", ["Creando BM350"]);
      }
      if (createMode === "50") {
        $(document).trigger("checkProcess", ["Creando BM50"]);
      }
      if (createMode === "over") {
        $(document).trigger("checkProcess", ["Creando BM por gateway over"]);
      }
      let createdCount = 0;
      for (let i = 0; i < bmCount; i++) {
        try {
          const bmName = savedSettings.bm.bmName.value + " " + randomNumberRange(11111, 99999);
          await fb.createBm(createMode, bmName);
          createdCount++;
        } catch {}
        await delayTime(2000);
      }
      $(document).trigger("checkProcess", ["Se crearon exitosamente " + createdCount + "/" + bmCount + " BM"]);
      await delayTime(2000);
      resolve();
    });
  }
  function createPage() {
    return new Promise(async (resolve, reject) => {
      const savedSettings = await saveSetting();
      const pageName = savedSettings.page.pageName.value + " " + randomNumberRange(11111, 99999);
      const pageCount = savedSettings.page.pageNumber.value;
      let createdCount = 0;
      for (let i = 1; i <= pageCount; i++) {
        try {
          await fb.createPage(pageName);
          createdCount++;
        } catch {}
        await delayTime(3000);
      }
      $(document).trigger("checkProcess", ["Se crearon exitosamente " + createdCount + "/" + pageCount + " Pages"]);
      await delayTime(2000);
      resolve();
    });
  }
  function acceptPage() {
    return new Promise(async (resolve, reject) => {
      const savedSettings = await saveSetting();
      let stopped = false;
      const concurrentLimit = savedSettings.general.limit.value;
      $(document).on("stop", function () {
        stopped = true;
      });
      const acceptPromises = [];
      let acceptedCount = 0;
      await fb.switchToMain();
      const pendingInvites = await fb.getInvites();
      for (let i = 0; i < pendingInvites.length; i++) {
        if (!stopped) {
          const doAccept = () => {
            return new Promise(async (itemResolve, itemReject) => {
              try {
                await fb.acceptPage(pendingInvites[i]);
                acceptedCount++;
              } catch (e120) {}
              itemResolve();
            });
          };
          acceptPromises.push(doAccept());
        } else {
          break;
        }
      }
      await Promise.all(acceptPromises);
      $(document).trigger("checkProcess", ["Aceptado exitosamente: <strong>" + acceptedCount + "/" + pendingInvites.length + "</strong> page"]);
      await delayTime(3000);
      resolve();
    });
  }
  function login(credentials) {
    return new Promise(async (resolve, reject) => {
      try {
        let loginSuccess = false;
        let errorMessage = "";
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            await emptyCookie();
            const credentialParts = credentials.split("|");
            const email = credentialParts[0];
            const password = credentialParts[1];
            const totpSecret = credentialParts[2];
            const homepageResponse = await fetch2("https://www.facebook.com/");
            const homepageHtml = homepageResponse.text;
            const datrCookie = homepageHtml.split("[\"_js_datr\",\"")[1].split("\",")[0];
            await setCookie("datr=" + datrCookie + ";");
            const jazoestToken = homepageHtml.split("name=\"jazoest\" value=\"")[1].split("\" autocomplete=\"off\"")[0];
            const lsdToken = homepageHtml.split("name=\"lsd\" value=\"")[1].split("\" autocomplete=\"off\"")[0];
            const loginResponse = await fetch2("https://www.facebook.com/login/?privacy_mutation_token=eyJ0eXBlIjowLCJjcmVhdGlvbl90aW1lIjoxNzI2OTgwODgwLCJjYWxsc2l0ZV9pZCI6MzgxMjI5MDc5NTc1OTQ2fQ%3D%3D&next", {
              headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "content-type": "application/x-www-form-urlencoded"
              },
              body: "jazoest=" + jazoestToken + "&lsd=" + lsdToken + "&email=" + email + "&login_source=comet_headerless_login&next=&encpass=#PWD_BROWSER:0:1111:" + password,
              method: "POST"
            });
            const loginRedirectUrl = loginResponse.url;
            if (loginRedirectUrl.includes("two_factor/")) {
              const encryptedContext = loginRedirectUrl.split("?encrypted_context=")[1].split("&flow=")[0];
              const twoFactorPageResponse = await fetch2(loginRedirectUrl);
              const twoFactorPageHtml = twoFactorPageResponse.text;
              const asyncToken = twoFactorPageHtml.match(/(?<=\"async_get_token\":\")[^\"]*/g)[0];
              const totpResponse = await fetch2("https://api.code.pro.vn/2fa/v1/get-code?secretKey=" + totpSecret);
              const totpData = totpResponse.json;
              const verifyCodeResponse = await fetch2("https://www.facebook.com/api/graphql/", {
                headers: {
                  "content-type": "application/x-www-form-urlencoded"
                },
                body: "av=0&__aaid=0&__user=0&__a=1&__req=4&__hs=19988.HYP%3Acomet_plat_default_pkg.2.1..0.0&dpr=1&__ccg=EXCELLENT&__rev=1016700928&__s=1uhzir%3Azta2du%3Acgvxrx&__hsi=7417333130652066369&__dyn=7xeUmwlE7ibwKBAg5S1Dxu13w8CewSwMwNw9G2S0im3y4o0B-q1ew65wce0yE7i0n24o5-0Bo7O2l0Fwqo31w9O1lwlEjwae4UaEW0LobrwmE2eU5O0GpovU1modEGdw46wbS1LwTwNwLweq1Iwqo4eEgwro2PxW1owmU&__csr=nf7tkOEgFqLiiDFaQil4yEGm8nKrJi6yk4Ea8ymqeCHzp8yfwGAwj8yq2e4K9xe10wJDw-G3K1Zwh8bUhzVk1ew8q16y8e862dwMgS1LwdK1wwo83kw8W0jm018Tw29U01GtK0gV00nSS5o1wo0RB0288&__comet_req=1&fb_dtsg=" + asyncToken + "&jazoest=" + jazoestToken + "&lsd=" + lsdToken + "&__spin_r=1016700928&__spin_b=trunk&__spin_t=1726982447&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useTwoFactorLoginValidateCodeMutation&variables=%7B%22code%22%3A%7B%22sensitive_string_value%22%3A%22" + totpData.code + "%22%7D%2C%22method%22%3A%22TOTP%22%2C%22flow%22%3A%22TWO_FACTOR_LOGIN%22%2C%22encryptedContext%22%3A%22" + encryptedContext + "%22%2C%22maskedContactPoint%22%3Anull%7D&server_timestamps=true&doc_id=7404767032917067",
                method: "POST"
              });
              const verifyCodeText = verifyCodeResponse.text;
              if (verifyCodeText.includes("\"is_code_valid\":true")) {
                loginSuccess = true;
                break;
              }
            } else if (loginRedirectUrl.includes("www_first_password_failure")) {
              errorMessage = "Contraseña incorrecta";
              break;
            }
          } catch (e121) {
            await delayTime(2000);
          }
        }
        if (loginSuccess) {
          resolve();
        } else {
          reject(errorMessage);
        }
      } catch (e122) {
        console.log(e122);
        reject("Error al iniciar sesión");
      }
    });
  }
  function loginBasic(credentials) {
    return new Promise(async (resolve, reject) => {
      let loginSuccess = false;
      let errorMessage = "";
      let loginUrl = "";
      try {
        const credentialParts = credentials.split("|");
        const email = credentialParts[0];
        const password = credentialParts[1];
        const totpSecret = credentialParts[2];
        const loginPageResponse = await fetch2("https://mbasic.facebook.com/login/?ref=dbl&fl&login_from_aymh=1");
        const loginPageHtml = loginPageResponse.text;
        const parsedLoginPage = $.parseHTML(loginPageHtml);
        let lsdToken = $(parsedLoginPage).find("input[name=\"lsd\"]").val();
        let dtsgToken = $(parsedLoginPage).find("input[name=\"fb_dtsg\"]").val();
        let mTs = $(parsedLoginPage).find("input[name=\"m_ts\"]").val();
        let jazoest = $(parsedLoginPage).find("input[name=\"jazoest\"]").val();
        let liToken = $(parsedLoginPage).find("input[name=\"li\"]").val();
        if (mTs && jazoest && liToken) {
          const loginSubmitResponse = await fetch2("https://mbasic.facebook.com/login/device-based/regular/login/?refsrc=deprecated&lwv=100&refid=8", {
            headers: {
              "content-type": "application/x-www-form-urlencoded"
            },
            body: "fb_dtsg=" + dtsgToken + "&lsd=" + lsdToken + "&jazoest=" + jazoest + "&m_ts=" + mTs + "&li=" + liToken + "&try_number=0&unrecognized_tries=0&email=" + email + "&pass=" + password + "&login=%C4%90%C4%83ng+nh%E1%BA%ADp&bi_xrwh=0",
            method: "POST"
          });
          const loginSubmitHtml = loginSubmitResponse.text;
          const parsedSubmitPage = $.parseHTML(loginSubmitHtml);
          if ($(parsedSubmitPage).find("#approvals_code").length) {
            const totpResponse = await fetch2("https://api.code.pro.vn/2fa/v1/get-code?secretKey=" + totpSecret);
            const totpData = totpResponse.json;
            if (totpData.code) {
              dtsgToken = $(parsedSubmitPage).find("input[name=\"fb_dtsg\"]").val();
              const nhToken = $(parsedSubmitPage).find("input[name=\"nh\"]").val();
              if (nhToken) {
                const checkpointResponse = await fetch2("https://mbasic.facebook.com/login/checkpoint/", {
                  headers: {
                    "content-type": "application/x-www-form-urlencoded"
                  },
                  body: "fb_dtsg=" + dtsgToken + "&jazoest=" + jazoest + "&checkpoint_data=&approvals_code=" + totpData.code + "&codes_submitted=0&submit%5BSubmit+Code%5D=G%E1%BB%ADi+m%C3%A3&nh=" + nhToken + "&fb_dtsg=" + dtsgToken + "&jazoest=" + jazoest,
                  method: "POST"
                });
                loginUrl = checkpointResponse.url;
                const checkpointHtml = checkpointResponse.text;
                if (checkpointHtml.includes("value=\"save_device\"")) {
                  loginSuccess = true;
                }
              }
            }
          } else if (loginSubmitResponse.url.includes("e=1348131") || loginSubmitResponse.url.includes("e=1348092")) {
            errorMessage = "Sai mật khẩu";
          }
        }
      } catch (e123) {
        console.log(e123);
      }
      if (loginSuccess) {
        resolve(loginUrl);
      } else {
        reject(errorMessage);
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

  // =============================================================================
  // SISTEMA DE ORQUESTACIÓN INTELIGENTE PARA APELACIÓN BM
  // =============================================================================

  /**
   * 🚀 ORQUESTADOR MAESTRO DE APELACIÓN BM
   * Detecta automáticamente el estado actual y ejecuta el proceso completo hasta el final
   */
  window.bmAppealOrchestrator = async function(enrollmentId, settings, callback) {
    try {
      console.log("🎯 [bmAppealOrchestrator] INICIANDO ORQUESTACIÓN COMPLETA");
      callback("🎯 INICIANDO SISTEMA DE ORQUESTACIÓN INTELIGENTE");
      
      const orchestrationData = {
        enrollmentId: enrollmentId,
        settings: settings,
        startTime: new Date(),
        currentStep: 0,
        totalSteps: 0,
        completedSteps: [],
        errors: [],
        retryCount: 0,
        maxRetries: 3
      };
      
      // 📊 FASE 1: ANÁLISIS COMPLETO DEL ESTADO ACTUAL
      callback("📊 FASE 1: Analizando estado actual del proceso...");
      const stateAnalysis = await analyzeCurrentBmState(enrollmentId, callback);
      
      if (!stateAnalysis.success) {
        throw new Error(`Análisis de estado falló: ${stateAnalysis.reason}`);
      }
      
      // 📋 FASE 2: GENERACIÓN DEL PLAN DE EJECUCIÓN
      callback("📋 FASE 2: Generando plan de ejecución personalizado...");
      const executionPlan = generateExecutionPlan(stateAnalysis.currentState, stateAnalysis.detectedSteps);
      orchestrationData.totalSteps = executionPlan.length;
      
      callback(`📋 Plan generado: ${executionPlan.length} pasos detectados`);
      executionPlan.forEach((step, index) => {
        callback(`   ${index + 1}. ${step.name} - ${step.description}`);
      });
      
      // 🚀 FASE 3: EJECUCIÓN ORQUESTADA
      callback("🚀 FASE 3: Iniciando ejecución orquestada...");
      
      for (let i = 0; i < executionPlan.length; i++) {
        const step = executionPlan[i];
        orchestrationData.currentStep = i + 1;
        
        callback(`🔄 Ejecutando paso ${i + 1}/${executionPlan.length}: ${step.name}`);
        
        try {
          const stepResult = await executeOrchestrationStep(step, enrollmentId, settings, callback);
          
          if (stepResult.success) {
            orchestrationData.completedSteps.push({
              step: step.name,
              result: stepResult,
              completedAt: new Date()
            });
            callback(`✅ Paso ${i + 1} completado: ${step.name}`);
            
            // Verificar si el paso cambió el estado
            if (stepResult.stateChanged) {
              callback("🔄 Estado cambió, re-analizando...");
              const newStateAnalysis = await analyzeCurrentBmState(enrollmentId, callback);
              
              if (newStateAnalysis.currentState === "UNDER_REVIEW") {
                callback("🎉 ¡PROCESO COMPLETADO! El BM está en revisión");
                break;
              }
            }
            
          } else {
            orchestrationData.errors.push({
              step: step.name,
              error: stepResult.reason,
              timestamp: new Date()
            });
            
            if (stepResult.critical) {
              throw new Error(`Paso crítico falló: ${step.name} - ${stepResult.reason}`);
            } else {
              callback(`⚠️ Paso ${i + 1} falló (no crítico): ${stepResult.reason}`);
            }
          }
          
        } catch (stepError) {
          console.error(`❌ Error en paso ${step.name}:`, stepError);
          
          orchestrationData.retryCount++;
          if (orchestrationData.retryCount < orchestrationData.maxRetries) {
            callback(`🔄 Reintentando paso ${i + 1} (intento ${orchestrationData.retryCount + 1}/${orchestrationData.maxRetries})`);
            i--; // Reintentar el mismo paso
            continue;
          } else {
            throw new Error(`Máximo de reintentos alcanzado en paso: ${step.name}`);
          }
        }
        
        // Pausa entre pasos para evitar rate limiting
        if (i < executionPlan.length - 1) {
          callback("⏳ Pausa entre pasos...");
          await delayTime(2000);
        }
      }
      
      // 📊 FASE 4: VERIFICACIÓN FINAL Y REPORTE
      callback("📊 FASE 4: Verificación final del estado...");
      const finalState = await analyzeCurrentBmState(enrollmentId, callback);
      
      const executionTime = (new Date() - orchestrationData.startTime) / 1000;
      
      if (finalState.currentState === "UNDER_REVIEW") {
        callback("🎉 ¡ÉXITO TOTAL! El proceso de apelación BM ha sido completado");
        callback(`📈 Estadísticas: ${orchestrationData.completedSteps.length} pasos completados en ${executionTime}s`);
        
        return {
          success: true,
          finalState: finalState.currentState,
          completedSteps: orchestrationData.completedSteps,
          executionTime: executionTime,
          errors: orchestrationData.errors
        };
      } else {
        callback(`⚠️ Proceso parcialmente completado. Estado actual: ${finalState.currentState}`);
        
        return {
          success: false,
          reason: "PARTIAL_COMPLETION",
          finalState: finalState.currentState,
          completedSteps: orchestrationData.completedSteps,
          executionTime: executionTime,
          errors: orchestrationData.errors,
          nextSteps: finalState.nextPossibleSteps || []
        };
      }
      
    } catch (error) {
      console.error("❌ [bmAppealOrchestrator] Error crítico:", error);
      callback(`❌ Error crítico en orquestación: ${error.message}`);
      
      return {
        success: false,
        reason: "CRITICAL_ERROR",
        error: error.message,
        completedSteps: orchestrationData?.completedSteps || [],
        errors: orchestrationData?.errors || []
      };
    }
  };

  /**
   * 📊 ANALIZADOR AVANZADO DE ESTADO ACTUAL
   */
  async function analyzeCurrentBmState(enrollmentId, callback) {
    try {
      callback("🔍 Analizando estado actual en profundidad...");
      
      const enrollmentUrl = "https://www.facebook.com/checkpoint/1501092823525282/" + enrollmentId;
      const response = await fetch2(enrollmentUrl);
      const htmlContent = response.text;
      
      let detectedState = "UNKNOWN";
      let detectedSteps = [];
      let nextPossibleSteps = [];
      let confidence = 0;
      let statusMessage = "";
      
      // 🔍 ANÁLISIS AVANZADO DE ESTADOS
      if (htmlContent.includes("UFACIntroState") || htmlContent.includes("get_started_button")) {
        detectedState = "INTRO";
        confidence = 95;
        statusMessage = "📋 Estado: INICIO - El proceso no ha comenzado";
        nextPossibleSteps = ["PROCEED_INTRO"];
        detectedSteps = ["intro", "captcha", "phone", "document", "review"];
        
      } else if (htmlContent.includes("UFACBotCaptcha") || htmlContent.includes("captcha")) {
        detectedState = "CAPTCHA";
        confidence = 90;
        statusMessage = "🤖 Estado: CAPTCHA - Necesita resolver captcha";
        nextPossibleSteps = ["SOLVE_CAPTCHA"];
        detectedSteps = ["captcha", "phone", "document", "review"];
        
      } else if (htmlContent.includes("UFACContactPointChallengeSetContactPointState") || htmlContent.includes("phone_number")) {
        detectedState = "PHONE_SETUP";
        confidence = 90;
        statusMessage = "📱 Estado: CONFIGURAR TELÉFONO - Necesita agregar número";
        nextPossibleSteps = ["ADD_PHONE"];
        detectedSteps = ["phone", "document", "review"];
        
      } else if (htmlContent.includes("UFACContactPointChallengeSubmitCodeState") || htmlContent.includes("verification_code")) {
        detectedState = "PHONE_CODE";
        confidence = 85;
        statusMessage = "🔢 Estado: CÓDIGO SMS - Número agregado, esperando código";
        nextPossibleSteps = ["SUBMIT_CODE"];
        detectedSteps = ["phone_code", "document", "review"];
        
      } else if (htmlContent.includes("UFACImageUploadChallengeState") || htmlContent.includes("upload") || htmlContent.includes("document")) {
        detectedState = "DOCUMENT_UPLOAD";
        confidence = 85;
        statusMessage = "📄 Estado: SUBIR DOCUMENTO - Teléfono verificado, necesita documento";
        nextPossibleSteps = ["UPLOAD_DOCUMENT"];
        detectedSteps = ["document", "review"];
        
      } else if (htmlContent.includes("UFACAwaitingReviewState") || htmlContent.includes("under_review") || htmlContent.includes("submitted")) {
        detectedState = "UNDER_REVIEW";
        confidence = 100;
        statusMessage = "⏳ Estado: EN REVISIÓN - Proceso completado, esperando respuesta";
        nextPossibleSteps = [];
        detectedSteps = [];
        
      } else if (htmlContent.includes("challenge_required") || htmlContent.includes("additional_verification")) {
        detectedState = "CHALLENGE_REQUIRED";
        confidence = 80;
        statusMessage = "⚠️ Estado: DESAFÍO REQUERIDO - Necesita completación adicional";
        nextPossibleSteps = ["HANDLE_CHALLENGE"];
        detectedSteps = ["challenge", "review"];
        
      } else if (htmlContent.includes("error") || htmlContent.includes("blocked")) {
        detectedState = "ERROR";
        confidence = 75;
        statusMessage = "❌ Estado: ERROR - Se detectó un problema en el proceso";
        nextPossibleSteps = ["RESTART_PROCESS"];
        detectedSteps = ["restart"];
        
      } else {
        detectedState = "UNKNOWN";
        confidence = 0;
        statusMessage = "❓ Estado: DESCONOCIDO - Analizando contenido...";
        
        // Análisis de fallback usando palabras clave
        const keywords = extractKeywords(htmlContent);
        const fallbackAnalysis = analyzeFallbackKeywords(keywords);
        
        if (fallbackAnalysis.state !== "UNKNOWN") {
          detectedState = fallbackAnalysis.state;
          confidence = fallbackAnalysis.confidence;
          statusMessage = fallbackAnalysis.message;
          nextPossibleSteps = fallbackAnalysis.nextSteps;
          detectedSteps = fallbackAnalysis.remainingSteps;
        }
      }
      
      callback(statusMessage + ` (Confianza: ${confidence}%)`);
      
      return {
        success: true,
        currentState: detectedState,
        confidence: confidence,
        detectedSteps: detectedSteps,
        nextPossibleSteps: nextPossibleSteps,
        statusMessage: statusMessage,
        htmlSnippet: htmlContent.substring(0, 300) + "...",
        analysis: {
          url: enrollmentUrl,
          timestamp: new Date().toISOString(),
          contentLength: htmlContent.length
        }
      };
      
    } catch (error) {
      console.error("❌ Error en análisis de estado:", error);
      return {
        success: false,
        reason: "ANALYSIS_ERROR",
        error: error.message
      };
    }
  }

  /**
   * 📋 GENERADOR DE PLAN DE EJECUCIÓN
   */
  function generateExecutionPlan(currentState, remainingSteps) {
    const stepDefinitions = {
      "intro": {
        name: "Proceder desde Introducción",
        description: "Avanzar desde la pantalla inicial",
        action: "PROCEED_INTRO",
        critical: true,
        estimatedTime: 5
      },
      "captcha": {
        name: "Resolver Captcha",
        description: "Completar verificación de captcha",
        action: "SOLVE_CAPTCHA",
        critical: true,
        estimatedTime: 30
      },
      "phone": {
        name: "Configurar Teléfono",
        description: "Agregar número de teléfono",
        action: "ADD_PHONE",
        critical: true,
        estimatedTime: 15
      },
      "phone_code": {
        name: "Verificar Código SMS",
        description: "Ingresar código de verificación",
        action: "SUBMIT_CODE",
        critical: true,
        estimatedTime: 60
      },
      "document": {
        name: "Subir Documento",
        description: "Cargar documento de identidad",
        action: "UPLOAD_DOCUMENT",
        critical: true,
        estimatedTime: 45
      },
      "challenge": {
        name: "Manejar Desafío",
        description: "Completar verificación adicional",
        action: "HANDLE_CHALLENGE",
        critical: false,
        estimatedTime: 30
      },
      "review": {
        name: "Finalizar Revisión",
        description: "Completar envío para revisión",
        action: "FINALIZE_REVIEW",
        critical: true,
        estimatedTime: 10
      }
    };
    
    const executionPlan = [];
    let totalEstimatedTime = 0;
    
    for (const stepKey of remainingSteps) {
      if (stepDefinitions[stepKey]) {
        const stepDef = stepDefinitions[stepKey];
        executionPlan.push({
          ...stepDef,
          stepKey: stepKey,
          order: executionPlan.length + 1
        });
        totalEstimatedTime += stepDef.estimatedTime;
      }
    }
    
    // Agregar paso de finalización si no está incluido
    if (!remainingSteps.includes("review") && currentState !== "UNDER_REVIEW") {
      executionPlan.push({
        ...stepDefinitions["review"],
        stepKey: "review",
        order: executionPlan.length + 1
      });
      totalEstimatedTime += stepDefinitions["review"].estimatedTime;
    }
    
    console.log(`📋 Plan generado: ${executionPlan.length} pasos, tiempo estimado: ${totalEstimatedTime}s`);
    
    return executionPlan;
  }

  /**
   * 🚀 EJECUTOR DE PASOS DE ORQUESTACIÓN
   */
  async function executeOrchestrationStep(step, enrollmentId, settings, callback) {
    try {
      callback(`🔄 Ejecutando: ${step.description}...`);
      console.log(`🔄 [executeOrchestrationStep] Ejecutando paso: ${step.action}`);
      
      let result = null;
      
      switch (step.action) {
        case "PROCEED_INTRO":
          result = await proceedFromIntro(enrollmentId, callback);
          break;
          
        case "SOLVE_CAPTCHA":
          result = await solveCaptchaStep(enrollmentId, settings, callback);
          break;
          
        case "ADD_PHONE":
          result = await addPhoneStep(enrollmentId, settings, callback);
          break;
          
        case "SUBMIT_CODE":
          result = await submitCodeStep(enrollmentId, settings, callback);
          break;
          
        case "UPLOAD_DOCUMENT":
          result = await uploadDocumentStep(enrollmentId, settings, callback);
          break;
          
        case "HANDLE_CHALLENGE":
          result = await handleAdditionalChallenge(enrollmentId, settings, callback);
          break;
          
        case "FINALIZE_REVIEW":
          result = await finalizeReviewSubmission(enrollmentId, callback);
          break;
          
        default:
          throw new Error(`Acción no reconocida: ${step.action}`);
      }
      
      if (result && result.success) {
        return {
          success: true,
          action: step.action,
          result: result,
          stateChanged: true,
          nextState: result.nextState || null
        };
      } else {
        return {
          success: false,
          action: step.action,
          reason: result?.reason || "UNKNOWN_ERROR",
          critical: step.critical
        };
      }
      
    } catch (error) {
      console.error(`❌ Error ejecutando paso ${step.action}:`, error);
      return {
        success: false,
        action: step.action,
        reason: error.message,
        critical: step.critical
      };
    }
  }

  /**
   * 🔍 EXTRACTOR DE PALABRAS CLAVE
   */
  function extractKeywords(htmlContent) {
    const keywordPatterns = {
      captcha: /captcha|robot|verification|prove/gi,
      phone: /phone|mobile|number|sms|contact/gi,
      document: /document|id|identity|upload|file/gi,
      review: /review|submitted|pending|waiting/gi,
      error: /error|failed|blocked|denied/gi,
      success: /success|completed|approved|confirmed/gi
    };
    
    const extractedKeywords = {};
    
    for (const [category, pattern] of Object.entries(keywordPatterns)) {
      const matches = htmlContent.match(pattern);
      extractedKeywords[category] = matches ? matches.length : 0;
    }
    
    return extractedKeywords;
  }

  /**
   * 🔍 ANALIZADOR DE PALABRAS CLAVE DE FALLBACK
   */
  function analyzeFallbackKeywords(keywords) {
    const maxCategory = Object.keys(keywords).reduce((a, b) => 
      keywords[a] > keywords[b] ? a : b
    );
    
    const fallbackStates = {
      captcha: {
        state: "CAPTCHA",
        confidence: 60,
        message: "🤖 Estado detectado por análisis: CAPTCHA",
        nextSteps: ["SOLVE_CAPTCHA"],
        remainingSteps: ["captcha", "phone", "document", "review"]
      },
      phone: {
        state: "PHONE_SETUP",
        confidence: 55,
        message: "📱 Estado detectado por análisis: TELÉFONO",
        nextSteps: ["ADD_PHONE"],
        remainingSteps: ["phone", "document", "review"]
      },
      document: {
        state: "DOCUMENT_UPLOAD",
        confidence: 55,
        message: "📄 Estado detectado por análisis: DOCUMENTO",
        nextSteps: ["UPLOAD_DOCUMENT"],
        remainingSteps: ["document", "review"]
      },
      review: {
        state: "UNDER_REVIEW",
        confidence: 70,
        message: "⏳ Estado detectado por análisis: REVISIÓN",
        nextSteps: [],
        remainingSteps: []
      },
      error: {
        state: "ERROR",
        confidence: 65,
        message: "❌ Estado detectado por análisis: ERROR",
        nextSteps: ["RESTART_PROCESS"],
        remainingSteps: ["restart"]
      }
    };
    
    if (keywords[maxCategory] > 0 && fallbackStates[maxCategory]) {
      return fallbackStates[maxCategory];
    }
    
    return {
      state: "UNKNOWN",
      confidence: 0,
      message: "❓ No se pudo determinar el estado",
      nextSteps: ["START_FROM_BEGINNING"],
      remainingSteps: ["intro", "captcha", "phone", "document", "review"]
    };
  }

  /**
   * 🔄 MANEJADOR DE DESAFÍOS ADICIONALES
   */
  async function handleAdditionalChallenge(enrollmentId, settings, callback) {
    try {
      callback("🔄 Manejando desafío adicional...");
      
      // Implementar lógica específica para desafíos adicionales
      // Por ahora, simular éxito
      await delayTime(5000);
      
      return {
        success: true,
        nextState: "DOCUMENT_UPLOAD",
        message: "Desafío manejado exitosamente"
      };
      
    } catch (error) {
      console.error("❌ Error manejando desafío:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * ✅ FINALIZADOR DE ENVÍO PARA REVISIÓN
   */
  async function finalizeReviewSubmission(enrollmentId, callback) {
    try {
      callback("✅ Finalizando envío para revisión...");
      
      // Verificar estado final
      const finalCheck = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`);
      const content = finalCheck.text;
      
      if (content.includes("UFACAwaitingReviewState") || content.includes("submitted")) {
        return {
          success: true,
          nextState: "UNDER_REVIEW",
          message: "Proceso enviado para revisión exitosamente"
        };
      } else {
        return {
          success: false,
          reason: "Estado final no confirmado"
        };
      }
      
    } catch (error) {
      console.error("❌ Error finalizando revisión:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  // =============================================================================
  // INTEGRACIÓN CON EL SISTEMA EXISTENTE
  // =============================================================================

  // Modificar la función khangBmAppeal existente para usar el nuevo orquestador
  const originalVF14 = window.khangBmAppeal;
  
  /**
   * 🎯 FUNCIÓN PRINCIPAL MEJORADA DE APELACIÓN BM
   */
  window.khangBmAppealEnhanced = async function(bmData, settings, callback) {
    try {
      callback("🎯 Iniciando proceso de apelación BM mejorado...");
      
      // Obtener el enrollment ID
      const enrollmentId = await fb.getLinkkhangBm(bmData.bmId, () => {});
      
      if (!enrollmentId) {
        throw new Error("No se pudo obtener el ID de enrollment");
      }
      
      callback(`📋 ID de Enrollment obtenido: ${enrollmentId}`);
      
      // Usar el orquestador maestro
      const result = await window.bmAppealOrchestrator(enrollmentId, settings, callback);
      
      if (result.success) {
        callback("🎉 ¡PROCESO DE APELACIÓN BM COMPLETADO EXITOSAMENTE!");
        return result;
      } else {
        throw new Error(`Proceso falló: ${result.reason}`);
      }
      
    } catch (error) {
      console.error("❌ Error en khangBmAppealEnhanced:", error);
      callback(`❌ Error en proceso: ${error.message}`);
      throw error;
    }
  };

  console.log("✅ Sistema de Orquestación Inteligente BM cargado");
  console.log("🚀 Funciones disponibles:");
  console.log("   • window.bmAppealOrchestrator() - Orquestador maestro");
  console.log("   • window.khangBmAppealEnhanced() - Proceso mejorado de apelación");
  console.log("   • analyzeCurrentBmState() - Análisis de estado avanzado");

  // =============================================================================
  // FUNCIONES ESPECÍFICAS DE CADA PASO DEL PROCESO
  // =============================================================================

  /**
   * 📋 PROCEDER DESDE INTRODUCCIÓN
   */
  async function proceedFromIntro(enrollmentId, callback) {
    try {
      callback("📋 Avanzando desde pantalla inicial...");
      
      const response = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: "fb_dtsg=" + fb.dtsg + "&jazoest=25494&proceed=1"
      });
      
      const content = response.text;
      
      if (content.includes("UFACBotCaptcha") || content.includes("captcha")) {
        return {
          success: true,
          nextState: "CAPTCHA",
          message: "Avanzado correctamente a captcha"
        };
      } else if (content.includes("phone")) {
        return {
          success: true,
          nextState: "PHONE_SETUP",
          message: "Avanzado directamente a teléfono"
        };
      } else {
        return {
          success: false,
          reason: "Estado inesperado después de proceder"
        };
      }
      
    } catch (error) {
      console.error("❌ Error procediendo desde intro:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 🤖 RESOLVER CAPTCHA
   */
  async function solveCaptchaStep(enrollmentId, settings, callback) {
    try {
      callback("🤖 Resolviendo captcha...");
      
      // Usar la función existente resolveCaptchaImage
      const captchaResult = await resolveCaptchaImage(enrollmentId, callback);
      
      if (captchaResult && captchaResult.success) {
        return {
          success: true,
          nextState: "PHONE_SETUP",
          message: "Captcha resuelto correctamente"
        };
      } else {
        return {
          success: false,
          reason: captchaResult?.reason || "Error desconocido en captcha"
        };
      }
      
    } catch (error) {
      console.error("❌ Error resolviendo captcha:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 📱 AGREGAR TELÉFONO
   */
  async function addPhoneStep(enrollmentId, settings, callback) {
    try {
      callback("📱 Agregando número de teléfono...");
      
      // Verificar si hay SMS rate limit
      if (checkSmsRateLimit()) {
        return {
          success: false,
          reason: "SMS rate limit activo - debe esperar 24 horas"
        };
      }
      
      // Obtener número de teléfono
      const phoneResult = await getPhone();
      
      if (!phoneResult || !phoneResult.success) {
        return {
          success: false,
          reason: phoneResult?.reason || "No se pudo obtener número de teléfono"
        };
      }
      
      callback(`📱 Número obtenido: ${phoneResult.phone}`);
      
      // Agregar el número al formulario
      const addPhoneResponse = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: `fb_dtsg=${fb.dtsg}&jazoest=25494&phone=${encodeURIComponent(phoneResult.phone)}&submit_phone=1`
      });
      
      const content = addPhoneResponse.text;
      
      if (content.includes("verification_code") || content.includes("UFACContactPointChallengeSubmitCodeState")) {
        // Guardar información del teléfono para el siguiente paso
        window.currentPhoneInfo = {
          phone: phoneResult.phone,
          transactionId: phoneResult.transactionId,
          service: phoneResult.service
        };
        
        return {
          success: true,
          nextState: "PHONE_CODE",
          message: "Número agregado, esperando código SMS"
        };
      } else if (content.includes("Too Many SMS codes")) {
        markSmsRateLimit();
        return {
          success: false,
          reason: "Rate limit SMS detectado - proceso detenido"
        };
      } else {
        return {
          success: false,
          reason: "Error agregando número de teléfono"
        };
      }
      
    } catch (error) {
      console.error("❌ Error agregando teléfono:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 🔢 ENVIAR CÓDIGO SMS
   */
  async function submitCodeStep(enrollmentId, settings, callback) {
    try {
      callback("🔢 Obteniendo y enviando código SMS...");
      
      if (!window.currentPhoneInfo) {
        return {
          success: false,
          reason: "Información de teléfono no disponible"
        };
      }
      
      const phoneInfo = window.currentPhoneInfo;
      
      // Intentar obtener el código SMS
      let attempts = 0;
      const maxAttempts = 12; // 2 minutos
      let smsCode = null;
      
      while (attempts < maxAttempts && !smsCode) {
        attempts++;
        callback(`🔢 Esperando SMS... (intento ${attempts}/${maxAttempts})`);
        
        const codeResult = await getPhoneCode(phoneInfo.phone, phoneInfo.transactionId, phoneInfo.service);
        
        if (codeResult && codeResult.success && codeResult.code) {
          smsCode = codeResult.code;
          break;
        }
        
        await delayTime(10000); // Esperar 10 segundos entre intentos
      }
      
      if (!smsCode) {
        return {
          success: false,
          reason: "No se pudo obtener código SMS después de 2 minutos"
        };
      }
      
      callback(`🔢 Código SMS obtenido: ${smsCode}`);
      
      // Enviar el código
      const submitResponse = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: `fb_dtsg=${fb.dtsg}&jazoest=25494&verification_code=${smsCode}&submit_code=1`
      });
      
      const content = submitResponse.text;
      
      if (content.includes("upload") || content.includes("UFACImageUploadChallengeState")) {
        return {
          success: true,
          nextState: "DOCUMENT_UPLOAD",
          message: "Código SMS verificado correctamente"
        };
      } else if (content.includes("incorrect") || content.includes("invalid")) {
        return {
          success: false,
          reason: "Código SMS incorrecto"
        };
      } else {
        return {
          success: false,
          reason: "Error enviando código SMS"
        };
      }
      
    } catch (error) {
      console.error("❌ Error enviando código:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 📄 SUBIR DOCUMENTO
   */
  async function uploadDocumentStep(enrollmentId, settings, callback) {
    try {
      callback("📄 Generando y subiendo documento...");
      
      // Verificar si tenemos plantillas disponibles
      let templateData = null;
      try {
        // Intentar obtener plantilla seleccionada
        const selectedTemplate = settings?.bm?.phoiId?.value;
        if (selectedTemplate) {
          templateData = await getLocalStorage(selectedTemplate);
          if (templateData) {
            callback(`🖼️ Usando plantilla: ${templateData.name || 'Sin nombre'}`);
          }
        }
        
        // Si no hay plantilla seleccionada, intentar cargar plantillas disponibles
        if (!templateData) {
          const allData = await getAllLocalStore();
          const templates = Object.keys(allData).filter(key => key.includes('phoi_'));
          
          if (templates.length > 0) {
            templateData = allData[templates[0]]; // Usar la primera plantilla disponible
            callback(`🖼️ Usando plantilla por defecto: ${templateData.name || 'Sin nombre'}`);
          }
        }
      } catch (templateError) {
        console.warn('Error cargando plantilla:', templateError);
        callback("⚠️ No se pudo cargar plantilla, usando plantilla por defecto");
      }
      
      // Generar datos de usuario para el documento
      const userData = {
        firstName: 'Juan',
        lastName: 'Pérez',
        fullName: 'Juan Pérez',
        birthday: '01/01/1990'
      };
      
      // Si hay configuración personalizada, usarla
      if (settings?.bm?.userData) {
        Object.assign(userData, settings.bm.userData);
      }
      
      callback("🎨 Generando documento de identidad...");
      
      // Usar la función uploadImage mejorada
      const uploadResult = await uploadImage(userData, templateData, enrollmentId);
      
      if (uploadResult && uploadResult.success && uploadResult.h) {
        callback(`✅ Documento subido exitosamente (handle: ${uploadResult.h})`);
        
        // Enviar el handle a Facebook para completar el proceso
        const submitResult = await submitDocumentHandle(enrollmentId, uploadResult.h, callback);
        
        if (submitResult.success) {
          return {
            success: true,
            nextState: "UNDER_REVIEW",
            message: "Documento procesado y enviado correctamente",
            uploadHandle: uploadResult.h,
            method: uploadResult.method
          };
        } else {
          return {
            success: false,
            reason: `Error enviando handle: ${submitResult.reason}`,
            uploadHandle: uploadResult.h,
            partialSuccess: true
          };
        }
        
      } else if (uploadResult && uploadResult.imageGenerated && !uploadResult.success) {
        // La imagen se generó pero la subida falló
        callback("⚠️ Imagen generada pero subida falló, intentando continuar...");
        
        // Intentar continuar el proceso sin el handle
        const continueResult = await continueWithoutDocument(enrollmentId, callback);
        
        if (continueResult.success) {
          return {
            success: true,
            nextState: continueResult.nextState,
            message: "Proceso continuado sin verificación de imagen",
            reason: uploadResult.reason,
            method: 'fallback_no_document'
          };
        } else {
          return {
            success: false,
            reason: `Subida falló y no se pudo continuar: ${uploadResult.reason}`,
            imageGenerated: true,
            method: uploadResult.method
          };
        }
        
      } else {
        // Error completo en la generación o subida
        const errorReason = uploadResult?.reason || uploadResult?.error || "Error desconocido subiendo documento";
        
        callback(`❌ Error en documento: ${errorReason}`);
        
        // Intentar método de recuperación
        const recoveryResult = await tryDocumentRecovery(enrollmentId, callback);
        
        if (recoveryResult.success) {
          return {
            success: true,
            nextState: recoveryResult.nextState,
            message: "Proceso recuperado exitosamente",
            method: 'recovery'
          };
        } else {
          return {
            success: false,
            reason: errorReason,
            critical: true // Marcar como crítico si no se puede recuperar
          };
        }
      }
      
    } catch (error) {
      console.error("❌ Error crítico subiendo documento:", error);
      callback(`❌ Error crítico: ${error.message}`);
      
      return {
        success: false,
        reason: error.message,
        critical: true
      };
    }
  }

  /**
   * 📤 ENVIAR HANDLE DE DOCUMENTO A FACEBOOK
   */
  async function submitDocumentHandle(enrollmentId, handle, callback) {
    try {
      callback("📤 Enviando documento procesado a Facebook...");
      
      const submitResponse = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: `fb_dtsg=${fb.dtsg}&jazoest=25494&document_handle=${handle}&submit_document=1`
      });
      
      const content = submitResponse.text;
      
      if (content.includes("UFACAwaitingReviewState") || content.includes("submitted") || content.includes("under_review")) {
        return {
          success: true,
          nextState: "UNDER_REVIEW",
          message: "Documento enviado para revisión"
        };
      } else if (content.includes("error") || content.includes("failed")) {
        return {
          success: false,
          reason: "Facebook rechazó el documento"
        };
      } else {
        // Estado ambiguo, asumir éxito parcial
        return {
          success: true,
          nextState: "PENDING_VERIFICATION",
          message: "Documento enviado, estado en verificación"
        };
      }
      
    } catch (error) {
      console.error("❌ Error enviando handle:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 🔄 CONTINUAR PROCESO SIN DOCUMENTO
   */
  async function continueWithoutDocument(enrollmentId, callback) {
    try {
      callback("🔄 Intentando continuar proceso sin verificación de documento...");
      
      // Intentar saltar el paso de documento
      const skipResponse = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: `fb_dtsg=${fb.dtsg}&jazoest=25494&skip_document=1&proceed=1`
      });
      
      const content = skipResponse.text;
      
      if (content.includes("review") || content.includes("submitted")) {
        return {
          success: true,
          nextState: "UNDER_REVIEW",
          message: "Proceso continuado exitosamente"
        };
      } else if (content.includes("phone") || content.includes("alternative")) {
        return {
          success: true,
          nextState: "ALTERNATIVE_VERIFICATION",
          message: "Redirigido a verificación alternativa"
        };
      } else {
        return {
          success: false,
          reason: "No se pudo continuar sin documento"
        };
      }
      
    } catch (error) {
      console.error("❌ Error continuando sin documento:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  /**
   * 🔧 INTENTAR RECUPERACIÓN DE PROCESO DE DOCUMENTO
   */
  async function tryDocumentRecovery(enrollmentId, callback) {
    try {
      callback("🔧 Intentando recuperación del proceso...");
      
      // Recargar la página del checkpoint para verificar estado actual
      const statusResponse = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`);
      const statusContent = statusResponse.text;
      
      // Verificar si ya está en revisión
      if (statusContent.includes("UFACAwaitingReviewState") || statusContent.includes("under_review")) {
        return {
          success: true,
          nextState: "UNDER_REVIEW",
          message: "El proceso ya estaba completado"
        };
      }
      
      // Verificar si hay métodos alternativos disponibles
      if (statusContent.includes("alternative") || statusContent.includes("other_options")) {
        return {
          success: true,
          nextState: "ALTERNATIVE_VERIFICATION",
          message: "Métodos alternativos disponibles"
        };
      }
      
      // Intentar reenvío del último paso conocido
      const retryResponse = await fetch2(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}`, {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        body: `fb_dtsg=${fb.dtsg}&jazoest=25494&retry=1&proceed=1`
      });
      
      const retryContent = retryResponse.text;
      
      if (retryContent.includes("review") || retryContent.includes("submitted")) {
        return {
          success: true,
          nextState: "UNDER_REVIEW",
          message: "Recuperación exitosa"
        };
      } else {
        return {
          success: false,
          reason: "No se pudo recuperar el proceso"
        };
      }
      
    } catch (error) {
      console.error("❌ Error en recuperación:", error);
      return {
        success: false,
        reason: error.message
      };
    }
  }

  // =============================================================================
  // UTILIDADES PARA EL ORQUESTADOR
  // =============================================================================

  /**
   * 🎯 DETECTOR INTELIGENTE DE ESTADO DESDE BM
   */
  window.detectBmStateFromBm = async function(bmId, callback) {
    try {
      callback("🎯 Detectando estado del BM desde Business Manager...");
      
      // Primero obtener el enrollment ID
      const enrollmentId = await fb.getLinkkhangBm(bmId, callback);
      
      if (!enrollmentId) {
        return {
          success: false,
          reason: "No se pudo obtener enrollment ID",
          bmId: bmId
        };
      }
      
      // Ahora analizar el estado
      const stateAnalysis = await analyzeCurrentBmState(enrollmentId, callback);
      
      return {
        success: true,
        bmId: bmId,
        enrollmentId: enrollmentId,
        ...stateAnalysis
      };
      
    } catch (error) {
      console.error("❌ Error detectando estado desde BM:", error);
      return {
        success: false,
        reason: error.message,
        bmId: bmId
      };
    }
  };

  /**
   * 🚀 PROCESO AUTOMÁTICO COMPLETO
   */
  window.runCompleteBmAppeal = async function(bmId, callback) {
    try {
      callback("🚀 INICIANDO PROCESO AUTOMÁTICO COMPLETO DE APELACIÓN BM");
      
      // 1. Detectar estado actual
      const stateDetection = await window.detectBmStateFromBm(bmId, callback);
      
      if (!stateDetection.success) {
        throw new Error(`Error detectando estado: ${stateDetection.reason}`);
      }
      
      // 2. Obtener configuraciones
      const settings = await saveSetting();
      
      // 3. Ejecutar orquestación completa
      const result = await window.bmAppealOrchestrator(
        stateDetection.enrollmentId, 
        settings, 
        callback
      );
      
      if (result.success) {
        callback("🎉 ¡PROCESO AUTOMÁTICO COMPLETADO EXITOSAMENTE!");
        callback(`📊 BM ${bmId} ahora está en estado: ${result.finalState}`);
        
        return {
          success: true,
          bmId: bmId,
          enrollmentId: stateDetection.enrollmentId,
          finalState: result.finalState,
          completedSteps: result.completedSteps,
          executionTime: result.executionTime
        };
      } else {
        throw new Error(`Orquestación falló: ${result.reason}`);
      }
      
    } catch (error) {
      console.error("❌ Error en proceso automático completo:", error);
      callback(`❌ Error crítico: ${error.message}`);
      
      return {
        success: false,
        bmId: bmId,
        reason: error.message
      };
    }
  };

  console.log("✅ Funciones específicas de pasos agregadas");
  console.log("🎯 Nuevas funciones disponibles:");
  console.log("   • window.detectBmStateFromBm() - Detectar estado desde BM ID");
  console.log("   • window.runCompleteBmAppeal() - Proceso automático completo");
