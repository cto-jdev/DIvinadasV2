// Inicialización segura de fb para evitar errores si no existe
window.fb = window.fb || {};
fb.uid = fb.uid || localStorage.getItem('fb_uid') || '';
fb.dtsg = fb.dtsg || localStorage.getItem('fb_dtsg') || '';

const url = new URL(location.href);
const extId = url.searchParams.get("extId") ? url.searchParams.get("extId") : localStorage.getItem("extId");
$("[data-tooltip]").tinyTooltip();
const checkExtension = async function () {
  try {
    await checkUser();
  } catch {
    $("#pageLoading").addClass("d-none");
    $("#gridLoading").addClass("d-none");
    Swal.fire({
      icon: "error", 
      title: "Ha ocurrido un error",
      html: "No has instalado la extensión <strong>DiviAnds</strong> o no está activada",
      allowOutsideClick: false,
      showConfirmButton: true,
      confirmButtonText: "Descargar Extensión DiviAnds",
      confirmButtonColor: "#4267B2"
    }).then(p5 => {
      if (p5.isConfirmed) {
        window.open("https://dashboard.toolfb.vn/client/download", "_blank").focus();
        location.reload();
      }
      return false;
    });
  }
};
checkExtension();
/**
 * checkUser
 * Descripción: Verifica el usuario actual mediante la extensión de Chrome.
 * Retorna: Promise<any>
 */
function checkUser() {
  return new Promise(async (p6, p7) => {
    try {
      const v12 = await chrome.runtime.sendMessage(extId, {
        type: "checkUser"
      });
      p6(v12);
    } catch (e2) {
      p7(e2);
    }
  });
}
/**
 * getVersion
 * Descripción: Obtiene la versión de la extensión desde el background de Chrome.
 * Retorna: Promise<any>
 */
function getVersion() {
  return new Promise(async (p8, p9) => {
    try {
      const v13 = await chrome.runtime.sendMessage(extId, {
        type: "getVersion"
      });
      p8(v13);
    } catch (e3) {
      p9(e3);
    }
  });
}
/**
 * getVersionTxt
 * Descripción: Obtiene el texto de la versión de la extensión.
 * Retorna: Promise<any>
 */
function getVersionTxt() {
  return new Promise(async (p10, p11) => {
    try {
      const v14 = await chrome.runtime.sendMessage(extId, {
        type: "getVersionTxt"
      });
      if (v14) {
        p10(v14);
      } else {
        p11();
      }
    } catch (e4) {
      p11(e4);
    }
  });
}
/**
 * fetch2
 * Descripción: Realiza una petición fetch a través del background de la extensión.
 * Parámetros: p14 (url), p15 (opciones)
 * Retorna: Promise<any>
 */
function fetch2(p14, p15 = {}) {
  return new Promise((p16, p17) => {
    const vO6 = {
      type: "fetch",
      url: p14,
      options: p15
    };
    chrome.runtime.sendMessage(extId, vO6, function (p18) {
      if (!p18.error) {
        p16(p18);
      } else {
        p17(p18.error);
      }
    });
  });
}
/**
 * getCookie
 * Descripción: Obtiene las cookies actuales mediante la extensión.
 * Retorna: Promise<any>
 */
function getCookie() {
  return new Promise(async (p19, p20) => {
    try {
      const v16 = await chrome.runtime.sendMessage(extId, {
        type: "getCookie"
      });
      p19(v16);
    } catch (e6) {
      p20(e6);
    }
  });
}
/**
 * emptyCookie
 * Descripción: Elimina las cookies del dominio especificado (por defecto facebook.com).
 * Parámetros: p21 (dominio)
 * Retorna: Promise<void>
 */
function emptyCookie(p21 = "facebook.com") {
  return new Promise(async (p22, p23) => {
    try {
      const vO8 = {
        type: "emptyCookie",
        domain: p21
      };
      await chrome.runtime.sendMessage(extId, vO8);
      p22();
    } catch (e7) {
      p23(e7);
    }
  });
}
/**
 * uploadImage
 * Descripción: Sube una imagen generada localmente a Facebook para verificación.
 * Parámetros: p24 (datos usuario), p25 (plantilla), p26 (bmId), p27 (uid), p28 (dtsg)
 * Retorna: Promise<any>
 */
function uploadImage(p24, p25, p26, p27, p28) {
  return new Promise(async (p29, p30) => {
    try {
      console.log('🎨 Generando imagen para apelación BM...');
      console.log('📋 Datos del usuario:', p24);
      console.log('🖼️ Plantilla:', p25?.name || 'Sin nombre');
      
      // Verificar que tenemos los datos necesarios
      if (!p24 || !p25) {
        throw new Error('Datos de usuario o plantilla no válidos');
      }
      
      // Crear canvas para generar la imagen
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar tamaño del canvas (tamaño estándar para documentos)
      canvas.width = 800;
      canvas.height = 600;
      
      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Si tenemos imagen base64 de la plantilla, usarla
      if (p25.src && p25.src.startsWith('data:image/')) {
        try {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = p25.src;
          });
          
          // Dibujar la imagen de fondo
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch (imgError) {
          console.warn('No se pudo cargar imagen de plantilla, usando fondo simple');
        }
      }
      
      // Procesar elementos de la plantilla si existen
      if (p25.data && Array.isArray(p25.data)) {
        for (const element of p25.data) {
          try {
            if (element.type === 'firstName' && p24.firstName) {
              ctx.fillStyle = element.color || '#000000';
              ctx.font = `${element.style || 'normal'} ${element.size || 16}px ${element.family || 'Arial'}`;
              ctx.textAlign = 'left';
              ctx.fillText(p24.firstName, element.left || 50, element.top || 50);
            } else if (element.type === 'lastName' && p24.lastName) {
              ctx.fillStyle = element.color || '#000000';
              ctx.font = `${element.style || 'normal'} ${element.size || 16}px ${element.family || 'Arial'}`;
              ctx.textAlign = 'left';
              ctx.fillText(p24.lastName, element.left || 50, element.top || 80);
            } else if (element.type === 'birthday' && p24.birthday) {
              ctx.fillStyle = element.color || '#000000';
              ctx.font = `${element.style || 'normal'} ${element.size || 16}px ${element.family || 'Arial'}`;
              ctx.textAlign = 'left';
              ctx.fillText(p24.birthday, element.left || 50, element.top || 110);
            }
          } catch (elementError) {
            console.warn('Error procesando elemento de plantilla:', elementError);
          }
        }
      } else {
        // Fallback: agregar texto básico si no hay elementos de plantilla
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        
        // Nombre completo
        if (p24.fullName) {
          ctx.fillText(p24.fullName, canvas.width / 2, 150);
        }
        
        // Información adicional
        ctx.font = '18px Arial';
        let yPos = 200;
        
        if (p24.firstName) {
          ctx.fillText(`Nombre: ${p24.firstName}`, canvas.width / 2, yPos);
          yPos += 30;
        }
        
        if (p24.lastName) {
          ctx.fillText(`Apellido: ${p24.lastName}`, canvas.width / 2, yPos);
          yPos += 30;
        }
        
        if (p24.birthday) {
          ctx.fillText(`Fecha de nacimiento: ${p24.birthday}`, canvas.width / 2, yPos);
          yPos += 30;
        }
      }
      
      // Agregar marca de agua DivinAds
      ctx.font = '12px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.textAlign = 'right';
      ctx.fillText('Generado por DivinAds', canvas.width - 20, canvas.height - 20);
      
      // Convertir canvas a blob para subida
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png', 0.9);
      });
      
      console.log('✅ Imagen generada exitosamente');
      console.log('📊 Tamaño de imagen:', blob.size, 'bytes');
      
      // Almacenar imagen localmente para futuro uso
      try {
        const imageDataUrl = canvas.toDataURL('image/png', 0.9);
        const imageKey = 'bm_appeal_image_' + Date.now();
        localStorage.setItem(imageKey, imageDataUrl);
        console.log('💾 Imagen almacenada localmente con clave:', imageKey);
      } catch (storageError) {
        console.warn('No se pudo almacenar imagen localmente:', storageError);
      }
      
      // ==========================================
      // SUBIDA REAL A FACEBOOK
      // ==========================================
      console.log('🚀 Iniciando subida a Facebook...');
      
      try {
        // Preparar FormData para la subida
        const formData = new FormData();
        formData.append('file', blob, 'document.png');
        formData.append('fb_dtsg', p28 || fb.dtsg);
        formData.append('__user', p27 || fb.uid);
        formData.append('__a', '1');
        formData.append('__req', '1');
        formData.append('__hs', '19756.HYP:comet_pkg.2.1..2.1');
        formData.append('dpr', '1');
        formData.append('__ccg', 'EXCELLENT');
        formData.append('__rev', '1010735000');
        formData.append('__s', 'x:' + Math.random().toString(36).substring(2));
        formData.append('__hsi', '7315423123456789012');
        formData.append('__dyn', '7AzHJ16U9obwDBxaA');
        formData.append('__csr', '');
        formData.append('__comet_req', '15');
        formData.append('lsd', fb.lsd || '');
        formData.append('jazoest', '25494');
        formData.append('__spin_r', '1010735000');
        formData.append('__spin_b', 'trunk');
        formData.append('__spin_t', Math.floor(Date.now() / 1000));
        
        // URL de subida de Facebook para verificación de identidad
        const uploadUrl = 'https://upload.facebook.com/ajax/mercury/upload.php';
        
        // Realizar la subida
        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'Accept': '*/*',
            'Accept-Language': 'es-ES,es;q=0.9',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'X-FB-Friendly-Name': 'FileUploadMutation',
            'X-FB-LSD': fb.lsd || '',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });
        
        if (!uploadResponse.ok) {
          throw new Error(`Error HTTP: ${uploadResponse.status} - ${uploadResponse.statusText}`);
        }
        
        const uploadText = await uploadResponse.text();
        console.log('📤 Respuesta de subida recibida');
        
        // Procesar respuesta de Facebook
        let uploadData;
        try {
          // Facebook devuelve JSON con prefijo "for (;;);"
          const cleanResponse = uploadText.replace(/^for \(;;\);/, '');
          uploadData = JSON.parse(cleanResponse);
        } catch (parseError) {
          console.warn('Error parseando respuesta JSON, intentando extracción manual');
          
          // Intentar extraer handle de manera manual
          const handleMatch = uploadText.match(/["']?h["']?\s*:\s*["']([^"']+)["']/);
          if (handleMatch && handleMatch[1]) {
            uploadData = { payload: { h: handleMatch[1] } };
          } else {
            throw new Error('No se pudo extraer handle de la respuesta');
          }
        }
        
        // Verificar que obtuvimos un handle válido
        if (uploadData && uploadData.payload && uploadData.payload.h) {
          const handle = uploadData.payload.h;
          console.log('✅ Imagen subida exitosamente a Facebook');
          console.log('🔗 Handle obtenido:', handle);
          
          const result = {
            h: handle,
            success: true,
            method: 'facebook_upload',
            uploadResponse: uploadData,
            timestamp: new Date().toISOString()
          };
          
          p29(result);
          
        } else {
          console.warn('⚠️ Respuesta de Facebook no contiene handle válido');
          console.log('📄 Respuesta completa:', uploadData);
          
          // Intentar método alternativo con extensión si está disponible
          if (typeof chrome !== 'undefined' && chrome.runtime && extId) {
            console.log('🔄 Intentando subida mediante extensión...');
            
            try {
              const extensionUpload = await chrome.runtime.sendMessage(extId, {
                type: "uploadImage",
                imageData: canvas.toDataURL('image/png', 0.9),
                enrollmentId: p26,
                userData: p24
              });
              
              if (extensionUpload && extensionUpload.success && extensionUpload.handle) {
                console.log('✅ Subida exitosa mediante extensión');
                
                const result = {
                  h: extensionUpload.handle,
                  success: true,
                  method: 'extension_upload',
                  timestamp: new Date().toISOString()
                };
                
                p29(result);
                return;
              }
            } catch (extError) {
              console.warn('Error en subida por extensión:', extError);
            }
          }
          
          // Si todo falla, devolver resultado parcial
          const fallbackResult = {
            h: null,
            success: false,
            imageGenerated: true,
            reason: 'upload_failed_but_image_generated',
            method: 'fallback',
            imageData: canvas.toDataURL('image/png', 0.9)
          };
          
          console.log('⚠️ Subida falló, pero imagen fue generada exitosamente');
          p29(fallbackResult);
        }
        
      } catch (uploadError) {
        console.error('❌ Error en subida a Facebook:', uploadError);
        
        // Intentar con método alternativo de subida
        console.log('🔄 Intentando método de subida alternativo...');
        
        try {
          const alternativeResult = await uploadImageAlternative(blob, p26, p27, p28);
          
          if (alternativeResult && alternativeResult.success) {
            console.log('✅ Subida exitosa con método alternativo');
            p29(alternativeResult);
            return;
          }
        } catch (altError) {
          console.warn('Error en método alternativo:', altError);
        }
        
        // Si todos los métodos fallan, devolver error pero con imagen generada
        const errorResult = {
          h: null,
          success: false,
          imageGenerated: true,
          reason: 'all_upload_methods_failed',
          error: uploadError.message,
          imageData: canvas.toDataURL('image/png', 0.9)
        };
        
        console.log('❌ Todos los métodos de subida fallaron');
        p29(errorResult);
      }
      
    } catch (e8) {
      console.error('❌ Error crítico en uploadImage:', e8);
      p30(e8);
    }
  });
}

/**
 * Método alternativo de subida de imagen
 */
async function uploadImageAlternative(blob, enrollmentId, uid, dtsg) {
  try {
    console.log('🔄 Ejecutando método alternativo de subida...');
    
    // Convertir blob a base64 para método alternativo
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
    
    // Usar API de checkpoint directamente
    const checkpointResponse = await fetch(`https://www.facebook.com/checkpoint/1501092823525282/${enrollmentId}/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({
        'fb_dtsg': dtsg,
        '__user': uid,
        '__a': '1',
        'image_data': base64,
        'upload_type': 'identity_document'
      })
    });
    
    if (checkpointResponse.ok) {
      const responseText = await checkpointResponse.text();
      
      // Intentar extraer handle de la respuesta
      const handleMatch = responseText.match(/upload_handle["']?\s*:\s*["']([^"']+)["']/);
      
      if (handleMatch && handleMatch[1]) {
        return {
          h: handleMatch[1],
          success: true,
          method: 'checkpoint_upload'
        };
      }
    }
    
    throw new Error('Método alternativo también falló');
    
  } catch (error) {
    console.error('❌ Error en método alternativo:', error);
    return {
      success: false,
      reason: error.message
    };
  }
}
/**
 * getBase64
 * Descripción: Convierte una URL de imagen a base64 usando la extensión.
 * Parámetros: p31 (url)
 * Retorna: Promise<string>
 */
function getBase64(p31) {
  return new Promise(async (p32, p33) => {
    try {
      const vO10 = {
        type: "getBase64",
        url: p31
      };
      const v18 = await chrome.runtime.sendMessage(extId, vO10);
      p32(v18);
    } catch (e9) {
      p33(e9);
    }
  });
}
/**
 * setCookie
 * Descripción: Establece las cookies proporcionadas usando la extensión.
 * Parámetros: p34 (string de cookies)
 * Retorna: Promise<void>
 */
function setCookie(p34) {
  return new Promise(async (p35, p36) => {
    try {
      await emptyCookie();
      const vO11 = {
        type: "setCookie",
        cookie: p34
      };
      await chrome.runtime.sendMessage(extId, vO11);
      p35();
    } catch (e10) {
      p36(e10);
    }
  });
}
/**
 * newTab
 * Descripción: Abre una nueva pestaña en el navegador con la URL dada.
 * Parámetros: p37 (url)
 * Retorna: Promise<void>
 */
function newTab(p37) {
  return new Promise(async (p38, p39) => {
    try {
      const vO12 = {
        type: "newTab",
        url: p37
      };
      await chrome.runtime.sendMessage(extId, vO12);
      p38();
    } catch (e11) {
      p39(e11);
    }
  });
}
/**
 * getAllLocalStore
 * Descripción: Obtiene todos los datos almacenados en localStorage a través de la extensión.
 * Retorna: Promise<any>
 */
function getAllLocalStore() {
  return new Promise(async (p40, p41) => {
    try {
      const v19 = await chrome.runtime.sendMessage(extId, {
        type: "getAllLocalStore"
      });
      p40(v19);
    } catch (e12) {
      p41(e12);
    }
  });
}
/**
 * setLocalStorage
 * Descripción: Guarda un valor en localStorage (o en la extensión si es posible).
 * Parámetros: p42 (clave), p43 (valor)
 * Retorna: Promise<void>
 */
function setLocalStorage(p42, p43) {
  return new Promise(async (p44, p45) => {
    try {
      if (typeof extId === 'string' && extId && typeof chrome !== 'undefined' && chrome.runtime) {
        const vO14 = {
          type: "setLocalStorage",
          key: p42,
          data: p43
        };
        try {
          await chrome.runtime.sendMessage(extId, vO14);
          p44();
          return;
        } catch (e) {
          console.warn('Error con extensión, usando localStorage nativo:', e);
          // Si falla, usa localStorage nativo
        }
      }
      // Fallback: localStorage nativo
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(p42, JSON.stringify(p43));
        p44();
      } else {
        p45(new Error('localStorage no disponible'));
      }
    } catch (e13) {
      p45(e13);
    }
  });
}
/**
 * removeLocalStorage
 * Descripción: Elimina un valor de localStorage (o de la extensión si es posible).
 * Parámetros: p46 (clave)
 * Retorna: Promise<void>
 */
function removeLocalStorage(p46) {
  return new Promise(async (p47, p48) => {
    try {
      const vO15 = {
        type: "removeLocalStorage",
        name: p46
      };
      await chrome.runtime.sendMessage(extId, vO15);
      p47();
    } catch (e14) {
      p48(e14);
    }
  });
}
/**
 * getLocalStorage
 * Descripción: Obtiene un valor de localStorage (o de la extensión si es posible).
 * Parámetros: p49 (clave)
 * Retorna: Promise<any>
 */
function getLocalStorage(p49) {
  return new Promise(async (p50, p51) => {
    try {
      if (typeof extId === 'string' && extId && typeof chrome !== 'undefined' && chrome.runtime) {
        const vO16 = {
          type: "getLocalStorage",
          name: p49
        };
        try {
          const v20 = await chrome.runtime.sendMessage(extId, vO16);
          p50(v20);
          return;
        } catch (e) {
          console.warn('Error con extensión, usando localStorage nativo:', e);
          // Si falla, usa localStorage nativo
        }
      }
      // Fallback: localStorage nativo
      if (typeof localStorage !== 'undefined') {
        const value = localStorage.getItem(p49);
        p50(value ? JSON.parse(value) : null);
      } else {
        p50(null);
      }
    } catch (e15) {
      console.warn('Error en getLocalStorage:', e15);
      p50(null);
    }
  });
}
/**
 * clearLocalStorage
 * Descripción: Elimina todos los datos almacenados en localStorage a través de la extensión.
 * Retorna: Promise<void>
 */
function clearLocalStorage() {
  return new Promise(async (p52, p53) => {
    try {
      const vO17 = {
        type: "clearLocalStorage"
      };
      await chrome.runtime.sendMessage(extId, vO17);
      p52();
    } catch (e16) {
      p53(e16);
    }
  });
}
/**
 * reloadExtension
 * Descripción: Recarga la extensión de Chrome.
 * Retorna: Promise<void>
 */
function reloadExtension() {
  return new Promise(async (p54, p55) => {
    try {
      await chrome.runtime.sendMessage(extId, {
        type: "reloadExtension"
      });
      p54();
    } catch (e17) {
      p55(e17);
    }
  });
}
$(".currencyMenu a").click(async function () {
  const v21 = $(this).text();
  $(".currentCurrency").text(v21);
  convertCurrency(v21);
  await setLocalStorage("currency", v21);
});
function convertCurrency(p56 = "") {
  $(".currency").each(function () {
    const v22 = $(this).attr("data-currency");
    const v23 = $(this).attr("data-value");
    
    // Validar que existan los datos necesarios
    if (!v22 || !v23 || typeof rates === 'undefined') {
      $(this).html("0.00");
      return;
    }
    
    try {
      if (p56 === "USD") {
        const vNumber = Number((v23 / rates[v22]).toFixed(2));
        $(this).html(new Intl.NumberFormat("en-US").format(isNaN(vNumber) ? 0 : vNumber));
      } else if (p56 === "VND") {
        const vNumber2 = Number((v23 / rates[v22] * rates.VND).toFixed(0));
        $(this).html(new Intl.NumberFormat("en-US").format(isNaN(vNumber2) ? 0 : vNumber2));
      } else {
        const vNumber3 = Number(v23);
        $(this).html(new Intl.NumberFormat("en-US").format(isNaN(vNumber3) ? 0 : vNumber3));
      }
    } catch (error) {
      console.warn('Error en convertCurrency:', error);
      $(this).html("0.00");
    }
  });
}
function copy(p57) {
  navigator.clipboard.writeText(p57);
  Swal.fire({
    title: "¡Éxito!",
    text: "Copiado al portapapeles",
    icon: "success", 
    confirmButtonText: "Cerrar"
  });
}
function copyId(p58) {
  const vGetSelectedRows = getSelectedRows();
  if (vGetSelectedRows.length > 0) {
    let vA2 = [];
    accountGrid.api.forEachNode(p59 => {
      if (p59.selected) {
        vA2.push(p59.data[p58]);
      }
    });
    navigator.clipboard.writeText(vA2.join("\r\n"));
    Swal.fire({
      title: "¡Éxito!",
      text: "Lista de IDs copiada al portapapeles",
      icon: "success",
      confirmButtonText: "Cerrar"
    });
  } else {
    Swal.fire({
      title: "¡Ha ocurrido un error!",
      text: "Selecciona al menos un elemento para continuar",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Copiar todo",
      cancelButtonText: "Cerrar"
    }).then(p60 => {
      if (p60.isConfirmed) {
        let vA3 = [];
        accountGrid.api.forEachNode(p61 => {
          vA3.push(p61.data[p58]);
        });
        navigator.clipboard.writeText(vA3.join("\r\n"));
        Swal.fire({
          title: "¡Éxito!",
          text: "Lista de IDs copiada al portapapeles",
          icon: "success",
          confirmButtonText: "Cerrar"
        });
      }
    });
  }
}
function exportData(p62) {
  const vGetSelectedRows2 = getSelectedRows();
  if (vGetSelectedRows2.length > 0) {
    if (p62 === "excel") {
      accountGrid.api.exportDataAsExcel({
        onlySelected: true
      });
    } else {
      accountGrid.api.exportDataAsCsv({
        onlySelected: true
      });
    }
  } else {
    Swal.fire({
      title: "¡Ha ocurrido un error!",
      text: "Selecciona al menos un elemento para continuar",
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Exportar todo",
      cancelButtonText: "Cerrar"
    }).then(p63 => {
      if (p63.isConfirmed) {
        if (p62 === "excel") {
          accountGrid.api.exportDataAsExcel();
        } else {
          accountGrid.api.exportDataAsCsv();
        }
      }
    });
  }
}
window.onload = async function () {
  let v24 = await getLocalStorage("ver");
  if (!v24) {
    const v25 = await getVersion();
    await setLocalStorage("ver", v25);
    v24 = v25;
  }
  $(".appVersion").html("<span class=\"mb-0 text-decoration-none badge text-bg-light\">v" + v24 + "</span>");
  $("#pageLoading").addClass("d-none");
  $("#gridLoading").html("<div id=\"loadingData\" class=\"d-flex flex-column align-items-center\"><div class=\"loader\"></div></div>");
};
$(document).on("click", "#xmdt", async function () {
  const v26 = await fetch("https://www.via902.vn/ajaxs/client/ext/account.php");
  const v27 = await v26.json();
  if (v27.success) {
    Swal.fire({
      title: "Advertencia",
      icon: "warning",
      text: "Guarda la información de la cuenta, será enviada a checkpoint de correo"
    }).then(async p64 => {
      if (p64.isConfirmed) {
        const v28 = Swal.fire({
          title: "Procesando protección contra Checkpoint XMDT",
          text: "Por favor espera",
          didOpen: () => {
            Swal.showLoading();
          }
        });
        const v29 = await getCookie();
        const v30 = await fetch("https://www.via902.vn/ajaxs/client/ext/xmdt.php", {
          headers: {
            "content-type": "application/x-www-form-urlencoded"
          },
          method: "POST",
          body: "cookie=" + encodeURIComponent(v29) + "&uid=" + fb.uid + "&dtsg=" + fb.dtsg
        });
        const v31 = await v30.json();
        v28.close();
        if (v31.success) {
          Swal.fire({
            title: "¡Éxito!",
            html: "Protección contra <strong>Checkpoint XMDT</strong> aplicada correctamente",
            icon: "success"
          });
        } else {
          const vO28 = {
            title: "Ha ocurrido un error",
            html: v31.message,
            icon: "error",
            confirmButtonText: "OK",
            showCancelButton: true,
            cancelButtonText: "Cerrar",
            confirmButtonText: "Recargar saldo"
          };
          Swal.fire(vO28).then(p65 => {
            if (p65.isConfirmed) {
              location.href = "https://www.via902.vn/client/recharge";
            }
          });
        }
      }
    });
  } else {
    Swal.fire({
      title: "No has iniciado sesión",
      text: "Por favor inicia sesión",
      icon: "error",
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      confirmButtonText: "Iniciar sesión"
    }).then(p66 => {
      if (p66.isConfirmed) {
        location.href = "https://www.via902.vn/client/login";
      }
    });
  }
});
$(document).on("click", "#k902", async function () {
  const v32 = await fetch("https://www.via902.vn/ajaxs/client/ext/account.php");
  const v33 = await v32.json();
  if (v33.success) {
    Swal.fire({
      title: "Advertencia",
      icon: "warning", 
      text: "Asegúrate de que tu cuenta haya pasado la verificación de identidad para poder saltar los días de restricción"
    }).then(p67 => {
      if (p67.isConfirmed) {
        Swal.fire({
          confirmButtonText: "Comenzar",
          html: "\n                        <form id=\"form902\" class=\"text-start overflow-hidden p-1\">\n                            <label class=\"form-label fw-medium\">\n                                Seleccionar línea\n                            </label>\n\n                            <div class=\"row\">\n                                <div class=\"col-6\">\n                                    <div class=\"form-check\">\n                                        <input class=\"form-check-input\" type=\"radio\" name=\"chooseLine\" value=\"policy\" id=\"dong1\" checked>\n                                        <label class=\"form-check-label\" for=\"dong1\">\n                                            Línea 1\n                                        </label>\n                                    </div>\n                                </div>\n                                <div class=\"col-6\">\n                                    <div class=\"form-check\">\n                                        <input class=\"form-check-input\" type=\"radio\" name=\"chooseLine\" value=\"unauthorized_use\" id=\"dong2\">\n                                        <label class=\"form-check-label\" for=\"dong2\">\n                                            Línea 2\n                                        </label>\n                                    </div>\n                                </div>\n                                <div class=\"col-6\">\n                                    <div class=\"form-check\">\n                                        <input class=\"form-check-input\" type=\"radio\" name=\"chooseLine\" value=\"other\" id=\"dong3\">\n                                        <label class=\"form-check-label\" for=\"dong3\">\n                                            Línea 3\n                                        </label>\n                                    </div>\n                                </div>\n                                <div class=\"col-6\">\n                                    <div class=\"form-check\">\n                                        <input class=\"form-check-input\" type=\"radio\" name=\"chooseLine\" value=\"random\" id=\"random\">\n                                        <label class=\"form-check-label\" for=\"random\">\n                                            Aleatorio\n                                        </label>\n                                    </div>\n                                </div>\n                            </div>\n\n                            <div class=\"my-3\">\n                                <label class=\"form-label fw-medium\">\n                                    Contenido de la apelación\n                                </label>\n                                <input type=\"text\" class=\"form-control\" value=\"I think there was unauthorized use of my Facebook account.\" name=\"noiDungKhang\">\n                            </div>\n                        </form>\n                    ",
          preConfirm: async () => {
            const v34 = await getCookie();
            const v35 = $("#form902").serialize() + "&cookie=" + encodeURIComponent(v34) + "&uid=" + fb.uid + "&dtsg=" + fb.dtsg;
            const v36 = Swal.fire({
              title: "Procesando apelación 902",
              text: "Por favor espera",
              didOpen: () => {
                Swal.showLoading();
              }
            });
            const v37 = await fetch("https://www.via902.vn/ajaxs/client/ext/902.php", {
              headers: {
                "content-type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              body: v35
            });
            const v38 = await v37.json();
            v36.close();
            if (v38.success) {
              Swal.fire({
                title: "¡Éxito!",
                html: "Apelación <strong>902</strong> completada exitosamente",
                icon: "success"
              });
            } else {
              const vO32 = {
                title: "Ha ocurrido un error",
                html: v38.message,
                icon: "error",
                confirmButtonText: "OK",
                showCancelButton: true,
                cancelButtonText: "Cerrar",
                confirmButtonText: "Recargar saldo"
              };
              Swal.fire(vO32).then(p68 => {
                if (p68.isConfirmed) {
                  location.href = "https://www.via902.vn/client/recharge";
                }
              });
            }
          }
        });
      }
    });
  } else {
    Swal.fire({
      title: "No has iniciado sesión",
      text: "Por favor inicia sesión",
      icon: "error",
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      confirmButtonText: "Iniciar sesión"
    }).then(p69 => {
      if (p69.isConfirmed) {
        location.href = "https://www.via902.vn/client/login";
      }
    });
  }
});
async function startt() {
  if (!$("#start").is(":disabled")) {
    // Verificar licencia antes de continuar
    try {
      const licenseData = JSON.parse(localStorage.getItem('license_data'));
      if (!licenseData || new Date(licenseData.expiration_date) < new Date()) {
        Swal.fire({
          icon: "error",
          title: "Error de activación",
          text: "Licencia inválida o expirada",
          confirmButtonText: "Verificar licencia"
        }).then(result => {
          if (result.isConfirmed) {
            $("#settingModal").modal("show");
          }
        });
        return;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al verificar la licencia"
      });
      return;
    }

    const v39 = await saveSetting();
    const v40 = $("#app").attr("data");
    if (v40 === "bm" && v39.bm?.nhanLinkBm?.value) {
      const v41 = v39.bm.backupLink?.value.split("\n").filter(p70 => p70).map(p71 => p71.trim());
      if (v41.length > 0) {
        const v42 = Swal.fire({
          title: "Recibiendo enlaces",
          html: "<span id=\"checkProgress\">Por favor espera...</span>",
          showDenyButton: true,
          denyButtonText: "Detener",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          preDeny: () => {
            $(document).trigger("stop");
          }
        });
        await nhanLink(v41);
        v42.close();
      }
    } else if (v40 === "page" && v39.page?.acceptPage?.value) {
      const v43 = Swal.fire({
        title: "Aceptando invitaciones",
        html: "<span id=\"checkProgress\">Por favor espera...</span>",
        showDenyButton: true,
        denyButtonText: "Detener",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        preDeny: () => {
          $(document).trigger("stop");
        }
      });
      await acceptPage();
      v43.close();
    } else if (v40 === "page" && v39.page?.createPage?.value) {
      const v44 = Swal.fire({
        title: "Creando Página",
        html: "<span id=\"checkProgress\">Por favor espera...</span>",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      await createPage();
      v44.close();
    } else if (v40 === "bm" && v39.bm?.getIdBm?.value) {
      const v45 = Swal.fire({
        title: "Obteniendo lista de IDs de BM",
        html: "<span id=\"checkProgress\">Por favor espera...</span>",
        showDenyButton: true,
        denyButtonText: "Detener",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        preDeny: () => {
          $(document).trigger("stop");
        }
      });
      await getIdBm();
      v45.close();
    } else if (v40 === "bm" && v39.bm?.getInfoBm?.value) {
      const v46 = Swal.fire({
        title: "Obteniendo información del BM",
        html: "<span id=\"checkProgress\">Por favor espera...</span>",
        showDenyButton: true,
        denyButtonText: "Detener",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        preDeny: () => {
          $(document).trigger("stop");
        }
      });
      const v47 = $("[name=\"listIdBm2\"]").val().split("\n").filter(p72 => p72).map(p73 => {
        return {
          id: p73.split("|")[0],
          link: p73.split("|")[1] || ""
        };
      });
      const vParseInt = parseInt($("[name=\"getInfoDelay\"]").val());
      const vParseInt2 = parseInt($("[name=\"getInfoMax\"]").val());
      const v48 = await getInfoBm(v47, vParseInt2, vParseInt);
      let vLS = "";
      for (let vLN02 = 0; vLN02 < v48.length; vLN02++) {
        vLS += "\n                    <tr>\n                        <th scope=\"row\">" + (vLN02 + 1) + "</th>\n                        <td>" + v48[vLN02].id + "</td>\n                        <td>" + v48[vLN02].name + "</td>\n                        <td>" + (v48[vLN02].allow_page_management_in_www ? "<span class=\"badge text-bg-success\">Activo</span>" : "<span class=\"badge text-bg-danger\">Inactivo</span>") + "</td>\n                        <td>" + (v48[vLN02].verification_status === "not_verified" ? "NO" : "SÍ") + "</td>\n                        <td>" + v48[vLN02].link + "</td>\n                        <td>" + v48[vLN02].linkStatus + "</td>\n                    </tr>\n                ";
      }
      $("#bmInfoData").html(vLS);
      $("#bmInfoModal").modal("show");
      v46.close();
    } else if (v40 === "bm" && v39.bm?.createBm?.value) {
      const v49 = Swal.fire({
        title: "Creando BM",
        html: "<span id=\"checkProgress\">Por favor espera...</span>",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      await createBm();
      v49.close();
    } else if (v40 === "bm" && v39.bm?.createPixel?.value) {
      // Función de crear píxeles
      if (typeof handleCreatePixelProcess === 'function') {
        await handleCreatePixelProcess();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'La función de crear píxeles no está disponible'
        });
      }
    } else if (v40 === "clone") {
      const v50 = Swal.fire({
        title: "Ejecutando...",
        html: "<span id=\"checkProgress\"></span>",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      await runVia(v39, p74 => {
        if (p74.action === "message") {
          $("#checkProgress").text(p74.msg);
        }
      });
      $("#swal2-title").text("¡Completado!");
      v50.hideLoading();
    } else if (v40 === "ads" && v39.ads?.assignCards?.value) {
      // Nueva función de asignación de tarjetas
      const selectedAccounts = getSelectedRows();
      const selectedCard = v39.ads?.selectedCardForAssignment?.value || $('#cardSelectForAssign').val();
      
      console.log('🎯 Sistema de asignación de tarjetas activado');
      console.log('📋 Cuentas seleccionadas:', selectedAccounts.length);
      console.log('💳 Tarjeta seleccionada:', selectedCard);
      
      if (selectedAccounts.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Selecciona Cuentas",
          text: "Debes seleccionar al menos una cuenta publicitaria en la tabla principal",
          confirmButtonText: "Cerrar"
        });
      } else if (!selectedCard) {
        Swal.fire({
          icon: "warning", 
          title: "Selecciona Tarjeta",
          text: "Debes seleccionar una tarjeta en la sección 'Asignar tarjetas a cuentas'",
          confirmButtonText: "Cerrar"
        });
      } else {
        const v52 = Swal.fire({
          title: "Asignando Tarjetas",
          html: "<span id=\"checkProgress\">Asignando tarjeta a " + selectedAccounts.length + " cuenta(s)...</span>",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });
        
        // Ejecutar función de asignación
        const assignResult = typeof window.executeCardAssignment === 'function' ? 
          await window.executeCardAssignment(selectedCard, selectedAccounts) : false;
        
        v52.close();
        
        if (assignResult) {
          Swal.fire({
            icon: "success",
            title: "¡Tarjetas Asignadas!",
            text: `Tarjeta asignada exitosamente a ${selectedAccounts.length} cuenta(s)`,
            confirmButtonText: "Cerrar"
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error en Asignación",
            text: "Hubo un problema al asignar las tarjetas. Revisa la consola para más detalles.",
            confirmButtonText: "Cerrar"
          });
        }
      }
    } else if (v40 === "ads" && v39.ads?.connectPixels?.value) {
      // Nueva función de píxeles integrada
      const pixelReady = typeof isPixelFunctionReady === 'function' ? isPixelFunctionReady() : false;
      if (pixelReady) {
        const v52 = Swal.fire({
          title: "Conectando Píxeles",
          html: "<span id=\"checkProgress\">Iniciando proceso...</span>",
          showDenyButton: true,
          denyButtonText: "Detener",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          preDeny: () => {
            $(document).trigger("stop");
          }
        });
        
        // Ejecutar función de píxeles
        const pixelResult = typeof executePixelFunction === 'function' ? await executePixelFunction() : false;
        
        if (pixelResult) {
          Swal.fire({
            icon: "success",
            title: "¡Píxeles Conectados!",
            text: "El proceso se completó exitosamente",
            confirmButtonText: "Cerrar"
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Proceso Completado",
            text: "Revisa los logs para más detalles",
            confirmButtonText: "Cerrar"
          });
        }
        
        v52.close();
      } else {
        Swal.fire({
          icon: "error",
          title: "Configuración Incompleta",
          text: "Por favor selecciona Business Manager, píxel y cuentas antes de continuar",
          confirmButtonText: "Cerrar"
        });
      }
    } else {
      let vGetSelectedRows3 = getSelectedRows();
      if (vGetSelectedRows3.length > 0) {
        const v51 = true;
        if (v51) {
          vGetSelectedRows3.forEach(p75 => {
            accountGrid.api.getRowNode(p75.id).setDataValue("process", "");
          });
          $("#start").prop("disabled", true);
          setTimeout(() => {
            $("#start").addClass("d-none");
            $("#start").prop("disabled", false);
            $("#stop").removeClass("d-none");
          }, 2000);
          start(vGetSelectedRows3, v39);
        }
      }
    }
  }
}
$("#start").click(async function () {
  try {
    startt();
  } catch {}
});
$("#stop").click(function () {
  if (!$("#stop").is(":disabled")) {
    $(document).trigger("stop");
    $("#stop").prop("disabled", true);
    setTimeout(() => {
      $("#stop").addClass("d-none");
      $("#stop").prop("disabled", false);
      $("#start").removeClass("d-none");
    }, 2000);
  }
});
$(document).on("click", ".loginButton", async function () {
  const v59 = $(this).attr("data-id");
  const v60 = await getLocalStorage("dataClone");
  const v61 = v60.filter(p85 => p85.id == v59);
  const v62 = v61[0].account;
  const v63 = await saveSetting();
  try {
    const vVO44 = {
      expired: {
        text: "Mua gói",
        url: "https://divinads.com/inicio-de-sesion/"
      },
      key_error: {
        text: "Đăng ký",
        url: "https://dashboard.toolfb.vn/client/register"
      },
      max_session: {
        text: "Quản lý phiên",
        url: "https://dashboard.toolfb.vn/client/sessions"
      }
    };
    loginDialog(v62);
  } catch {
    Swal.fire({
      icon: "error", 
      title: "Error de activación",
      text: "Ha ocurrido un error",
      confirmButtonText: "Editar clave"
    }).then(p87 => {
      if (p87.isConfirmed) {
        // $('#settingModal').modal('show'); // Evito mostrar el modal automáticamente
      }
    });
  }
});
$("body").on("click", "#switch", async function () {
  let vLS2 = "";
  const v66 = await getLocalStorage("dataClone");
  const v67 = await getLocalStorage("uid");
  v66.filter(p88 => p88.uid === v67).forEach(p89 => {
    vLS2 += "\n            <div class=\"p-1\">\n            <div class=\"bg-white rounded-4 overflow-hidden border mb-3 pe-3 d-flex justify-content-between align-items-center\">\n                <div class=\" d-flex align-items-center\" style=\"padding: 10px\" data-id=\"" + p89.uid + "\">\n                    <img class=\"rounded-circle\" src=\"" + (p89.avatar ? p89.avatar : "../img/avatar.jpg") + "\" height=\"30\">\n                    <span class=\"ps-3 flex-grow-1 d-flex flex-column align-items-start text-black\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + (p89.name ? p89.name : "Unknown") + "</strong>\n                        <small>" + p89.uid + "</small>\n                    </span>\n                </div>\n                <button type=\"button\" class=\"btn btn-success btn-sm p-0 px-2\"><i class=\"ri-checkbox-blank-circle-fill me-1\"></i>Activo</button>\n            </div>\n        ";
  });
  const v68 = v66.filter(p90 => p90.uid !== v67);
  if (v68.length > 0) {
    vLS2 += "\n            <div class=\"flex-grow-1 mb-3\">\n                <div class=\"position-relative h-100\">\n                    <a href=\"javascript:;\" id=\"searchSubmit\" class=\"text-dark\"><i class=\"ri-search-line fs-5 position-absolute\" style=\"top: 10px; right: 8px\"></i></a>\n                    <input id=\"profileSearch\" class=\"rounded-4 form-control h-100 fw-medium\" style=\"padding: 10px; padding-right: 30px;\" id=\"search\" placeholder=\"Ingresa palabras clave...\">\n                </div>\n            </div>\n        ";
    vLS2 += "<div class=\"bg-white rounded-4 overflow-hidden border mb-3\">";
    vLS2 += "<div class=\"ssssssss\" style=\"max-height: 300px;\">";
    vLS2 += "<div class=\"notFounded d-none p-3\">¡No se encontraron resultados!</div>";
    v68.forEach(p91 => {
      vLS2 += "\n                <div role=\"button\" class=\"profileItem loginButton d-flex align-items-center\" style=\"padding: 10px\" data-id=\"" + p91.id + "\">\n                    <img class=\"rounded-circle\" src=\"" + (p91.avatar ? p91.avatar : "../img/avatar.jpg") + "\" height=\"30\">\n                    <span class=\"ps-3 flex-grow-1 d-flex flex-column align-items-start text-black\" style=\"width:calc(100% - 30px);line-height: initial\">\n                        <strong style=\"font-size: 14px; margin-bottom: 3px\">" + (p91.name ? p91.name : "Unknown") + "</strong>\n                        <small>" + p91.uid + "</small>\n                    </span>\n                </div>\n                <div class=\"border-bottom\"></div>\n            ";
    });
    vLS2 += "</div>";
    vLS2 += "</div>";
  }
  vLS2 += "\n        <div class=\"\">\n            <button type=\"button\" onclick=\"loginDialog()\" class=\"p-3 bg-white rounded-4 overflow-hidden fw-medium fs-5 border w-100\"><i class=\"ri-add-circle-line me-2\"></i> Iniciar sesión con nueva cuenta</button>\n        </div></div>";
  Swal.fire({
    title: "Seleccionar cuenta",
    html: vLS2,
    background: "#f0ecf4",
    showConfirmButton: false,
    showCloseButton: true,
    didRender: () => {
      setTimeout(() => {
        $(".ssssssss").niceScroll({
          cursorcolor: "#c2c2c2",
          cursorwidth: "8px",
          cursorborder: "border: 0",
          railpadding: {
            top: 5,
            right: 2,
            left: 2,
            bottom: 5
          }
        });
      }, 1000);
    }
  });
  return false;
});
let searchTimeout = null;
$(document).on("keyup search input paste cut", "#profileSearch", function () {
  $(".notFounded").addClass("d-none");
  const v$ = $(this);
  const v69 = $(this).attr("data");
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(function () {
    const v70 = v$.val();
    if (v70 !== v69) {
      v$.attr("data", v70);
      $(".profileItem").addClass("d-none");
      $(".profileItem").next().addClass("d-none");
      let vLN03 = 0;
      $(".profileItem").each(function () {
        const v71 = $(this).text();
        if (v71.includes(v70)) {
          $(this).removeClass("d-none");
          $(this).next().removeClass("d-none");
          vLN03++;
        }
      });
      if (vLN03 === 0) {
        $(".notFounded").removeClass("d-none");
      }
    }
  }, 500);
});
$("body").on("click", "#logout, #logoutBtn", async function () {
  Swal.fire({
    title: "¿Estás seguro que deseas cerrar sesión?",
    text: "Esta acción no se puede deshacer",
    icon: "warning", 
    showCancelButton: true,
    confirmButtonColor: "#dc3545",
    confirmButtonText: "Cerrar sesión",
    cancelButtonText: "Cancelar"
  }).then(async p92 => {
    if (p92.isConfirmed) {
      await emptyCookie();
      await removeLocalStorage("loadBm");
      await removeLocalStorage("loadAds");
      await removeLocalStorage("loadPage");
      await removeLocalStorage("accessToken");
      await removeLocalStorage("accessToken2");
      await removeLocalStorage("dtsg");
      await removeLocalStorage("dtsg2");
      location.reload();
    }
  });
  return false;
});
$("#searchSubmit").click(function () {
  accountGrid.api.setQuickFilter($("#search").val());
});
$("#search").change(function () {
  accountGrid.api.setQuickFilter($("#search").val());
});
$(".statusFilter").change(function () {
  const vA4 = [];
  $(".statusFilter").each(function () {
    if ($(this).is(":checked")) {
      vA4.push($(this).val());
    }
  });
  if (vA4.length > 0) {
    const vO49 = {
      values: vA4
    };
    accountGrid.api.getFilterInstance("status").setModel(vO49);
  } else {
    accountGrid.api.getFilterInstance("status").setModel(null);
  }
  accountGrid.api.onFilterChanged();
});
$(".form-check-input[data-target]").change(function () {
  const v72 = $(this).is(":checked") ? true : false;
  const v73 = $(this).attr("data-target");
  if (v72) {
    $("#" + v73).removeClass("d-none");
  } else {
    $("#" + v73).addClass("d-none");
  }
});
$("#reloadData").click(async function () {
  try {
    const v74 = $("#app").attr("data");
    await removeLocalStorage("accessToken");
    await removeLocalStorage("accessToken2");
    await removeLocalStorage("dtsg");
    await removeLocalStorage("dtsg2");
    if (v74 === "bm") {
      await removeLocalStorage("dataBm_" + fb.uid);
      await setLocalStorage("loadBm", true);
    } else if (v74 === "page") {
      await removeLocalStorage("dataPage_" + fb.uid);
      await setLocalStorage("loadPage", true);
    } else if (v74 === "group") {
      await removeLocalStorage("dataGroup_" + fb.uid);
      await setLocalStorage("loadGroup", true);
    } else {
      await removeLocalStorage("dataAds_" + fb.uid);
      await setLocalStorage("loadAds", true);
    }
    location.reload();
  } catch {}
});
$("#exportData").click(function () {
  let vGetSelectedRows4 = getSelectedRows();
  if (vGetSelectedRows4.length > 0) {
    vGetSelectedRows4 = vGetSelectedRows4.map(p93 => p93.bmId).join("\n");
    download("export.txt", vGetSelectedRows4);
  }
});
$("#importData").click(function () {
  const v75 = $("#app").attr("data");
  let vLS3 = "";
  if (v75 === "ads") {
    vLS3 = "Cuenta Publicitaria";
  }
  if (v75 === "bm") {
    vLS3 = "BM";
  }
  if (v75 === "page") {
    vLS3 = "Página";
  }
  if (v75 === "group") {
    vLS3 = "Grupo";
  }
  Swal.fire({
    title: "Seleccionar múltiples IDs de " + vLS3,
    input: "textarea", 
    inputAttributes: {
      placeholder: "Ingresa la lista de IDs de " + vLS3
    },
    showCancelButton: true,
    confirmButtonText: "Seleccionar",
    confirmButtonColor: "#4267B2",
    allowOutsideClick: false,
    showLoaderOnConfirm: true,
    preConfirm: async p94 => {
      if (p94.includes(",")) {
        p94 = p94.split(",").filter(p95 => p95).map(p96 => p96.trim());
      } else {
        p94 = p94.split("\n").filter(p97 => p97).map(p98 => p98.trim());
      }
      accountGrid.api.forEachNode(p99 => {
        if (v75 === "bm" && p94.includes(p99.data.bmId)) {
          p99.setSelected(true);
        }
        if (v75 === "page" && p94.includes(p99.data.pageId)) {
          p99.setSelected(true);
        }
        if (v75 === "group" && p94.includes(p99.data.groupId)) {
          p99.setSelected(true);
        }
        if (v75 === "ads" && p94.includes(p99.data.adId)) {
          p99.setSelected(true);
        }
      });
      return;
    }
  });
});
$(".form-select").change(function () {
  const v76 = $(this).find(":selected").val();
  const v77 = $(this).attr("name");
  $("[data-parent=\"" + v77 + "\"]").addClass("d-none");
  $("[data-parent=\"" + v77 + "\"][data-value=\"" + v76 + "\"]").removeClass("d-none");
});
$("#foldButton").click(async function () {
  if (!$("body").hasClass("folded")) {
    $("body").addClass("folded");
    await setLocalStorage("folded", true);
  } else {
    $("body").removeClass("folded");
    await setLocalStorage("folded", false);
  }
});
$(document).on("956", function (p100) {
  Swal.fire({
    icon: "error",
    title: "Checkpoint de Correo",
    text: "La cuenta está en Checkpoint",
    confirmButtonText: "Cerrar Sesión",
    allowOutsideClick: false
  }).then(async p101 => {
    if (p101.isConfirmed) {
      await emptyCookie();
      location.reload();
    }
  });
});
async function loginDialog(p102 = "") {
  Swal.fire({
    title: "Iniciar Sesión",
    html: "\n            <div class=\"p-1\">\n                <textarea id=\"loginData\" class=\"form-control mb-3\" rows=\"5\" placeholder=\"Ingresa información de VIA o Cookie\">" + p102 + "</textarea>\n                <div class=\"d-flex justify-content-between align-items-center\">\n                    <strong style=\"width: 170px;\" class=\"text-start\">Opciones de inicio de sesión</strong>\n                    <div class=\"d-flex\">\n                        <div class=\"form-check me-3\">\n                            <input class=\"form-check-input\" type=\"checkbox\" role=\"switch\" id=\"loginFacebook\">\n                            <label class=\"form-check-label\" style=\"margin-top: 2px;\" for=\"loginFacebook\">Facebook</label>\n                        </div>\n                        <div class=\"form-check\">\n                            <input class=\"form-check-input\" type=\"checkbox\" role=\"switch\" id=\"loginHotmail\">\n                            <label class=\"form-check-label\" style=\"margin-top: 2px;\" for=\"loginHotmail\">Hotmail</label>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Iniciar Sesión",
    confirmButtonColor: "#4267B2",
    preConfirm: async p103 => {
      const v78 = $("#loginData").val();
      const v79 = $("#loginFacebook").is(":checked");
      const v80 = $("#loginHotmail").is(":checked");
      if (v78) {
        if (!v79 && !v80) {
          Swal.showValidationMessage("Por favor selecciona al menos un método de inicio de sesión");
        } else if (v78.includes("|")) {
          await setLocalStorage("loginFacebook", v79);
          await setLocalStorage("loginHotmail", v80);
          const v81 = v78.split("|");
          if (v78 && v81.length) {
            if (v79) {
              const vO51 = {
                uid: v81[0],
                password: v81[1],
                two_fa: v81[2].replaceAll(" ", "")
              };
              await setLocalStorage("dataFB", vO51);
              await emptyCookie("facebook.com");
              await newTab("https://www.facebook.com/login/");
            }
            if (v80) {
              const v82 = v81.findIndex(p104 => {
                return p104.match(/@outlook|@hotmail/g);
              });
              if (v82 !== -1) {
                const vO52 = {
                  email: v81[v82],
                  passwordEmail: v81[v82 + 1]
                };
                const vVO52 = vO52;
                await setLocalStorage("dataHM", vVO52);
                await emptyCookie("outlook.live.com");
                await emptyCookie("login.live.com");
                await emptyCookie("live.com");
                await newTab("https://login.live.com/");
              } else {
                Swal.showValidationMessage("No se encontró el email");
              }
            }
            setInterval(async () => {
              const v83 = await getCookie();
              if (v83.includes("c_user=")) {
                location.reload();
              }
            }, 1000);
          }
        } else {
          await setCookie(v78);
          location.reload();
        }
      } else {
        Swal.showValidationMessage("Por favor ingresa la información de la VIA o Cookie");
      }
      return false;
    }
  });
  const v84 = await getLocalStorage("loginFacebook");
  const v85 = await getLocalStorage("loginHotmail");
  if (v84) {
    $("#loginFacebook").prop("checked", true);
  }
  if (v85) {
    $("#loginHotmail").prop("checked", true);
  }
}
$(document).on("notLogged", async function (p105) {
  $("#loadingData").addClass("d-none");
  await removeLocalStorage("loadBm");
  await removeLocalStorage("loadAds");
  await removeLocalStorage("loadPage");
  await removeLocalStorage("viaInfo");
  await removeLocalStorage("accessToken");
  await removeLocalStorage("accessToken2");
  await removeLocalStorage("dtsg");
  await removeLocalStorage("dtsg2");
  Swal.fire({
    icon: "error",
    title: "Ha ocurrido un error",
    text: "No has iniciado sesión en Facebook",
    showCancelButton: true,
    showConfirmButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Iniciar sesión",
    confirmButtonColor: "#4267B2"
  }).then(p106 => {
    if (p106.isConfirmed) {
      loginDialog();
    }
  });
});
$(document).on("running", function (p107, p108) {
  accountGrid.api.getRowNode(p108).setDataValue("process", "RUNNING");
});
$(document).on("finished", function (p109, p110) {
  accountGrid.api.getRowNode(p110).setDataValue("process", "FINISHED");
});
$(document).on("message", function (p111, p112) {
  accountGrid.api.getRowNode(p112.id).setDataValue("message", p112.message);
});
$(document).on("checkProcess", function (p113, p114) {
  $("#checkProgress").html(p114);
});
$(document).on("stopped", function (p115, p116) {
  $("#stop").addClass("d-none");
  $("#start").removeClass("d-none");
});
function download(p117, p118) {
  var v86 = document.createElement("a");
  v86.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(p118));
  v86.setAttribute("download", p117);
  v86.style.display = "none";
  document.body.appendChild(v86);
  v86.click();
  document.body.removeChild(v86);
}
async function getSetting() {
  return new Promise(async (p119, p120) => {
    try {
      const v87 = await getLocalStorage("setting");
      const v88 = await getLocalStorage("settingBm");
      const v89 = await getLocalStorage("settingAds");
      const v90 = await getLocalStorage("settingPage");
      const v91 = await getLocalStorage("settingVia");
      const vO54 = {
        general: v87.general || {},
        bm: v88.bm || {},
        ads: v89.ads || {},
        page: v90.page || {},
        via: v91.via || {}
      };
      p119(vO54);
    } catch (e19) {
      p120(e19);
    }
  });
}
async function saveSetting() {
  const vO55 = {};
  $("[data-tool]").each(function () {
    const v92 = $(this).attr("data-tool");
    vO55[v92] = {};
    $(this).find("[data-type=\"multi\"]").each(function () {
      let v93 = $(this).attr("name");
      if (v93) {
        vO55[v92][v93] = {
          value: [],
          type: "multi",
          target: ""
        };
      }
    });
    $(this).find("[data-type=\"multi\"]").each(function () {
      let v94 = $(this).attr("name");
      let v95 = $(this).val();
      if (!vO55[v92][v94].value.includes(v95) && $(this).is(":checked")) {
        vO55[v92][v94].value.push(v95);
      }
    });
    $(this).find("input:not([type=\"radio\"], [data-type=\"multi\"])").each(function () {
      let v96 = $(this).val();
      let vLSText = "text";
      let vLS4 = "";
      let v97 = $(this).attr("name");
      v96 = !isNaN(v96) ? parseInt(v96) : v96;
      if ($(this).attr("type") === "checkbox") {
        vLSText = "checkbox";
        if ($(this).is(":checked")) {
          v96 = true;
        } else {
          v96 = false;
        }
      }
      if ($(this).attr("type") === "file") {
        vLSText = "file";
        v96 = $(this).get(0).files[0] ? $(this).get(0).files[0].path : "";
      }
      if ($(this).attr("data-target")) {
        vLS4 = $(this).attr("data-target");
      }
      if (v97) {
        const vO57 = {
          value: v96,
          type: vLSText,
          target: vLS4
        };
        vO55[v92][v97] = vO57;
      }
    });
    $(this).find("input[type=\"radio\"]:checked").each(function () {
      let v98 = $(this).attr("name");
      let v99 = $(this).val();
      if (v98) {
        const vO58 = {
          value: v99,
          type: "radio"
        };
        vO55[v92][v98] = vO58;
      }
    });
    $(this).find("select").each(function () {
      let v100 = $(this).find(":selected").val() || "";
      let v101 = $(this).attr("name");
      if (v101) {
        const vO59 = {
          value: v100,
          type: "select"
        };
        vO55[v92][v101] = vO59;
      }
    });
    $(this).find("textarea").each(function () {
      let v102 = $(this).val();
      let v103 = $(this).attr("name");
      if (v103) {
        const vO60 = {
          value: v102,
          type: "textarea"
        };
        vO55[v92][v103] = vO60;
      }
    });
  });
  const v104 = $("#app").attr("data");
  if (v104 === "bm") {
    await setLocalStorage("settingBm", vO55);
  } else if (v104 === "page") {
    await setLocalStorage("settingPage", vO55);
  } else if (v104 === "group") {
    await setLocalStorage("settingGroup", vO55);
  } else if (v104 === "tool") {
    const v105 = $("[data-tool]").attr("data-tool");
    await setLocalStorage("setting_tool_" + v105, vO55);
  } else if (v104 === "clone") {
    await setLocalStorage("settingVia", vO55);
  } else if (v104 === "setting") {
    await setLocalStorage("setting", vO55);
  } else {
    await setLocalStorage("settingAds", vO55);
  }
  if (v104 !== "setting") {
    const v106 = (await getLocalStorage("setting")) || {};
    vO55.general = {
      ...v106.general,
      ...vO55.general
    };
  }
  return vO55;
}
async function loadSetting() {
  const v107 = $("#app").attr("data");
  if (v107 !== "setting") {
    try {
      const v108 = await (await fetch("../data.json")).json();
      const v109 = (await getLocalStorage("currency")) || "MIX";
      $(".currentCurrency").text(v109);
      convertCurrency(v109);
      const v110 = v108.currency.map(p121 => {
        return "<option value=\"" + p121.id + "\">" + p121.value + "</option>";
      });
      const v111 = v108.country.map(p122 => {
        return "<option value=\"" + p122.id + "\">" + p122.value + "</option>";
      });
      const v112 = v108.timezone.map(p123 => {
        return "<option value=\"" + p123.id + "\">" + p123.value + "</option>";
      });
      const v113 = v108.timezone2.map(p124 => {
        return "<option value=\"" + p124.id + "\">" + p124.value + "</option>";
      });
      $("select[name=\"timezone\"]").html(v113);
      $("select[name=\"timezone2\"]").html(v112);
      $("select[name=\"currency\"]").html(v110);
      $("select[name=\"country\"]").html(v111);
    } catch (e20) {
      console.log(e20);
    }
  }
  let vO61 = {};
  if (v107 === "bm") {
    vO61 = (await getLocalStorage("settingBm")) || [];
  } else if (v107 === "via") {
    vO61 = (await getLocalStorage("settingVia")) || [];
  } else if (v107 === "page") {
    vO61 = (await getLocalStorage("settingPage")) || [];
  } else if (v107 === "tool") {
    const v114 = $("[data-tool]").attr("data-tool");
    vO61 = (await getLocalStorage("setting_tool_" + v114)) || [];
  } else if (v107 === "setting") {
    vO61 = (await getLocalStorage("setting")) || [];
  } else {
    vO61 = (await getLocalStorage("settingAds")) || [];
  }
  Object.keys(vO61).forEach(p125 => {
    Object.keys(vO61[p125]).forEach(p126 => {
      const v115 = vO61[p125][p126];
      if (v115.type === "multi") {
        v115.value.forEach(p127 => {
          $("[data-tool=\"" + p125 + "\"]").find("input[name=\"" + p126 + "\"][value=\"" + p127 + "\"]").prop("checked", true);
        });
      }
      if (v115.type === "checkbox") {
        $("[data-tool=\"" + p125 + "\"]").find("input[name=\"" + p126 + "\"]").prop("checked", v115.value);
      }
      if (v115.type === "radio") {
        $("[data-tool=\"" + p125 + "\"]").find("input[type=\"radio\"]").prop("checked", false);
        $("[data-tool=\"" + p125 + "\"]").find("input[type=\"radio\"][value=\"" + v115.value + "\"]").prop("checked", true);
        if (v115.target) {
          $("[data-tool=\"" + p125 + "\"]").find("#" + v115.target).removeClass("d-none");
        }
      }
      if (v115.type === "text") {
        $("[data-tool=\"" + p125 + "\"]").find("input[name=\"" + p126 + "\"]").val(v115.value);
      }
      if (v115.type === "textarea") {
        $("[data-tool=\"" + p125 + "\"]").find("textarea[name=\"" + p126 + "\"]").val(v115.value);
      }
      if (v115.type === "select") {
        $("[data-tool=\"" + p125 + "\"]").find("select[name=\"" + p126 + "\"] option[value=\"" + v115.value + "\"]").prop("selected", true);
        $("[data-parent=\"" + p126 + "\"][data-value=\"" + v115.value + "\"]").removeClass("d-none");
      }
      if (p126 === "deleteEmailMode" && v115.value.includes("mbasic")) {
        $("#setPrimaryEmail").removeClass("d-none");
      }
      if (v115.target) {
        if (v115.value) {
          $("[data-tool=\"" + p125 + "\"]").find("#" + v115.target).removeClass("d-none");
        }
      }
    });
  });
  if (v107 === "bm") {
    const v116 = vO61.bm?.backupLink?.value.split(/\r?\n|\r|\n/g).filter(p128 => p128) || 0;
    const v117 = vO61.bm?.linkDaNhan?.value.split(/\r?\n|\r|\n/g).filter(p129 => p129) || 0;
    const v118 = vO61.bm?.backUpEmail?.value.split(/\r?\n|\r|\n/g).filter(p130 => p130) || 0;
    const v119 = vO61.bm?.backupLinkError?.value.split(/\r?\n|\r|\n/g).filter(p131 => p131) || 0;
    const v120 = vO61.bm?.backupLinkSuccess?.value.split(/\r?\n|\r|\n/g).filter(p132 => p132) || 0;
    const v121 = vO61.bm?.listIdBm?.value.split(/\r?\n|\r|\n/g).filter(p133 => p133) || 0;
    $("#backupLinkCount1").text(v117.length);
    $("#backupLinkCount").text(v116.length);
    $("#backupEmailCount").text(v118.length);
    $("#backupLinkErrorCount").text(v119.length);
    $("#backupLinkSuccessCount").text(v120.length);
    $("#getBmIdCount").text(v121.length);
  }
  if (v107 === "ads") {
    const v122 = vO61.ads?.linkShareBm?.value.split(/\r?\n|\r|\n/g).filter(p134 => p134) || 0;
    $("#linkShareBmCount").text(v122.length);
  }
  // Inicializar la visibilidad de elementos data-parent para todos los selects
  $(".form-select").each(function() {
    const selectedValue = $(this).find(":selected").val();
    const selectName = $(this).attr("name");
    if (selectedValue && selectName) {
      $("[data-parent=\"" + selectName + "\"]").addClass("d-none");
      $("[data-parent=\"" + selectName + "\"][data-value=\"" + selectedValue + "\"]").removeClass("d-none");
    }
  });

  $("body").addClass("setting-loaded");
  $("#loadingScreen").addClass("d-none");
  $(".select2").select2();
}
function getSelectedRows() {
  const vA5 = [];
  accountGrid.api.forEachNodeAfterFilterAndSort(p135 => {
    if (p135.selected) {
      vA5.push(p135.data);
    }
  });
  return vA5;
}
$("#customizeModal").on("show.bs.modal", async function (p136) {
  const vA6 = ["0", "id", "action"];
  const v123 = accountGrid.columnApi.getColumnState().filter(p137 => {
    return !vA6.includes(p137.colId);
  });
  let vLS5 = "";
  v123.forEach(p138 => {
    const v124 = columnDefs.filter(p139 => {
      return p139.field === p138.colId;
    });
    vLS5 += "\n        <div class=\"col-item shadow-sm border rounded p-3 mb-3 d-flex\">\n            <div class=\"form-check checkbox-lg\">\n                <input class=\"form-check-input me-3\" type=\"checkbox\" value=\"" + p138.colId + "\" " + (!p138.hide ? "checked" : "") + ">\n            </div>\n            <div class=\"flex-grow-1 d-flex justify-content-between ps-4 fw-bold\">\n                " + v124[0].headerName + "\n                <i class=\"ri-draggable fs-5\" style=\"cursor: move\"></i>\n            </div>\n        </div>\n        ";
  });
  $("#colCustomize").html(vLS5);
  new Sortable(document.getElementById("colCustomize"), {
    animation: 0,
    handle: ".ri-draggable",
    ghostClass: "opacity-50"
  });
});
$("#resetColumns").click(async function () {
  accountGrid.columnApi.resetColumnState();
  const v125 = $("#app").attr("data");
  if (v125 === "bm") {
    await setLocalStorage("stateBm", []);
  } else if (v125 === "page") {
    await setLocalStorage("statePage", []);
  } else if (v125 === "clone") {
    await setLocalStorage("stateClone", []);
  } else {
    await setLocalStorage("stateAds", []);
  }
  $("#customizeModal").modal("hide");
});
$("#saveColumns").click(async function () {
  const vA7 = ["0", "id"];
  const v126 = accountGrid.columnApi.getColumnState().filter(p140 => {
    return !vA7.includes(p140.colId);
  });
  const v127 = accountGrid.columnApi.getColumnState().filter(p141 => {
    return vA7.includes(p141.colId);
  });
  const vA8 = [];
  $(".col-item").each(function () {
    const v128 = $(this).find("input").val();
    const v129 = !$(this).find("input").is(":checked");
    const v130 = v126.filter(p142 => {
      return p142.colId === v128;
    });
    v130[0].hide = v129;
    vA8.push(v130[0]);
  });
  accountGrid.columnApi.applyColumnState({
    state: vA8.concat(v127),
    applyOrder: true
  });
  const v131 = $("#app").attr("data");
  if (v131 === "bm") {
    await setLocalStorage("stateBm", vA8.concat(v127));
  } else if (v131 === "page") {
    await setLocalStorage("statePage", vA8.concat(v127));
  } else {
    await setLocalStorage("stateAds", vA8.concat(v127));
  }
  $("#customizeModal").modal("hide");
});

/**
 * Sistema de Licencia DivinAds
 * Descripción: Sistema completo de verificación y manejo de licencias
 */

// Función principal para verificar licencia
async function checkKey(license, showAlert = false) {
  return new Promise(async (resolve, reject) => {
      try {
          if (!license) {
              license = localStorage.getItem('current_license');
          }
          
          if (!license) {
              if (showAlert) {
                  Swal.fire({
                      icon: "error",
                      title: "Error de Licencia",
                      text: "No se ha ingresado una licencia",
                      confirmButtonText: "Ingresar licencia"
                  }).then(result => {
                      if (result.isConfirmed) {
                          $("#settingModal").modal("show");
                      }
                  });
              }
              reject();
              return;
          }

          // Incluir el token de sesión en las cabeceras si existe
          const headers = {
              'Content-Type': 'application/json'
          };
          const sessionToken = localStorage.getItem('session_token');
          if (sessionToken) {
              headers['X-Session-Token'] = sessionToken;
          }

          // Usar fetch2 para evitar problemas de CORS
          const response = await fetch2(`https://divinads.com/wp-json/divinads/v1/wp-email/${license}`, {
              headers: headers
          });
          
          let data;
          try {
              data = typeof response.json === 'string' ? JSON.parse(response.json) : response.json;
          } catch (parseError) {
              console.error('Error parsing response:', parseError);
              throw new Error('Respuesta inválida del servidor');
          }

          // Verificar límite de sesiones
          if (data.data && data.data.active_sessions && data.data.session_limit) {
              const activeSessions = parseInt(data.data.active_sessions);
              const sessionLimit = parseInt(data.data.session_limit);
              
              if (activeSessions >= sessionLimit) {
                  if (showAlert) {
                      Swal.fire({
                          icon: "error",
                          title: "Límite de sesiones alcanzado",
                          text: `Has alcanzado el límite de ${sessionLimit} sesiones simultáneas permitidas en tu plan.`,
                          confirmButtonText: "Entendido"
                      });
                  }
                  reject();
                  return;
              }
          }

          if (data.error === 'session_expired') {
              localStorage.removeItem('session_token');
              return checkKey(license, showAlert);
          }

          if (data.success && data.data) {
              localStorage.setItem('license_data', JSON.stringify(data.data));
              localStorage.setItem('current_license', license);
              
              // Almacenar el token de sesión si está presente
              if (data.data.session_token) {
                  localStorage.setItem('session_token', data.data.session_token);
              }
              
              // Iniciar el ping de sesión si no está activo
              if (!window.sessionPingInterval) {
                  startSessionKeepAlive();
              }
              
              resolve(data.data);
          } else {
              if (showAlert) {
                  Swal.fire({
                      icon: "error",
                      title: "Error de Licencia",
                      text: "Licencia inválida o expirada"
                  });
              }
              reject();
          }
      } catch (error) {
          console.error('Error en checkKey:', error);
          
          if (showAlert) {
              Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Error al verificar la licencia: " + (error.message || error)
              });
          }
          reject();
      }
  });
}

// Función global para verificar licencia
async function verifyLicense() {
  try {
      const licenseData = JSON.parse(localStorage.getItem('license_data'));
      if (!licenseData) {
          throw new Error('No hay datos de licencia');
      }

      const expirationDate = new Date(licenseData.expiration_date);
      const now = new Date();
      
      if (expirationDate <= now) {
          throw new Error('Licencia expirada');
      }

      return true;
  } catch (error) {
      Swal.fire({
          icon: "error",
          title: "Error de Licencia",
          text: error.message || "Error al verificar la licencia",
          confirmButtonText: "Verificar licencia"
      }).then(result => {
          if (result.isConfirmed) {
              $("#settingModal").modal("show");
          }
      });
      return false;
  }
}

// Función para mantener la sesión activa
function startSessionKeepAlive() {
  // Limpiar el intervalo existente si hay uno
  if (window.sessionPingInterval) {
      clearInterval(window.sessionPingInterval);
  }

  // Crear nuevo intervalo de ping cada 5 minutos
  window.sessionPingInterval = setInterval(async () => {
      try {
          const license = localStorage.getItem('current_license');
          if (!license) {
              clearInterval(window.sessionPingInterval);
              return;
          }

          const headers = {
              'Content-Type': 'application/json'
          };
          const sessionToken = localStorage.getItem('session_token');
          if (sessionToken) {
              headers['X-Session-Token'] = sessionToken;
          }

          // Usar fetch2 para evitar problemas de CORS
          const response = await fetch2(`https://divinads.com/wp-json/divinads/v1/wp-email/${license}`, {
              headers: headers
          });
          
          let data;
          try {
              data = typeof response.json === 'string' ? JSON.parse(response.json) : response.json;
          } catch (parseError) {
              console.warn('Error parsing session ping response:', parseError);
              return;
          }

          if (!data.success || data.error === 'session_expired') {
              // Si la sesión expiró o hay error, limpiar datos y recargar
              localStorage.removeItem('session_token');
              localStorage.removeItem('license_data');
              clearInterval(window.sessionPingInterval);
              
              Swal.fire({
                  icon: "error",
                  title: "Sesión expirada",
                  text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
                  confirmButtonText: "Aceptar"
              }).then(() => {
                  location.reload();
              });
              return;
          }

          // Actualizar datos de licencia
          if (data.data) {
              localStorage.setItem('license_data', JSON.stringify(data.data));
              if (data.data.session_token) {
                  localStorage.setItem('session_token', data.data.session_token);
              }
          }

      } catch (error) {
          console.error('Error en el ping de sesión:', error);
      }
  }, 5 * 60 * 1000); // 5 minutos
}

// Verificar licencia antes de cualquier operación crítica
$(document).on('click', '[data-requires-license="true"]', async function(e) {
  if (!await verifyLicense()) {
      e.preventDefault();
      e.stopPropagation();
      return false;
  }
});

// Verificación periódica de licencia
setInterval(async () => {
  try {
      const license = localStorage.getItem('current_license');
      if (!license) return;

      // Usar fetch2 para evitar problemas de CORS
      const response = await fetch2(`https://divinads.com/wp-json/divinads/v1/wp-email/${license}`);
      
      let data;
      try {
          data = typeof response.json === 'string' ? JSON.parse(response.json) : response.json;
      } catch (parseError) {
          console.warn('Error parsing periodic license check response:', parseError);
          return;
      }
      
      if (!data.success) {
          localStorage.removeItem('license_data');
          localStorage.removeItem('current_license');
          location.reload();
      }
  } catch (error) {
      console.error('Error checking license:', error);
  }
}, 30000); // Verificar cada 30 segundos

// Iniciar el sistema de mantenimiento de sesión cuando se carga el script
document.addEventListener('DOMContentLoaded', () => {
  const license = localStorage.getItem('current_license');
  const sessionToken = localStorage.getItem('session_token');
  if (license && sessionToken) {
      startSessionKeepAlive();
  }
});

// Función para validar y mostrar información de licencia
async function validateAndShowLicenseInfo(license) {
  try {
      const licenseData = await checkKey(license, false);
      if (licenseData) {
          $('#licenseInfo').html(`
              <div class="alert alert-success">
                  <strong>Usuario:</strong> ${licenseData.user_email}<br>
                  <strong>Días restantes:</strong> ${licenseData.days_remaining_formatted}<br>
                  <strong>Expira:</strong> ${licenseData.expiration_date_formatted}
              </div>
          `);
          return true;
      }
  } catch (error) {
      $('#licenseInfo').html(`
          <div class="alert alert-danger">
              Error al verificar la licencia
          </div>
      `);
      return false;
  }
}

// Exponer funciones globalmente
window.checkKey = checkKey;
window.verifyLicense = verifyLicense;
window.validateAndShowLicenseInfo = validateAndShowLicenseInfo;
window.startSessionKeepAlive = startSessionKeepAlive;

console.log('🔐 Sistema de licencia DivinAds cargado correctamente');
console.log('🌐 VERIFICACIÓN REAL ACTIVA:');
console.log('   • Conexión con servidor divinads.com');
console.log('   • Verificación completa de licencias');
console.log('   • Ping de sesión cada 5 minutos');
console.log('   • Usando fetch2 para evitar CORS');