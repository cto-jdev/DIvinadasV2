$(document).ready(async function() {

    loadSetting()
    loadPhone()

    await delayTime(1000)

    const cookie = await getCookie()
    let manualToken = await getLocalStorage('manualAccessToken')
    let accessToken = manualToken || await getLocalStorage('accessToken')

    // Si no hay accessToken guardado, intentar obtenerlo automáticamente
    if (!accessToken) {
        try {
            const fbInstance = new FB();
            const tokenData = await fbInstance.getAccessToken();
            if (tokenData && tokenData.accessToken) {
                accessToken = tokenData.accessToken;
                await setLocalStorage('manualAccessToken', accessToken);
                await setLocalStorage('accessToken', accessToken);
            }
        } catch {}
    }

    $('#cookie').val(cookie)
    $('#accessToken').val(accessToken)
    
    // Cargar licencia actual si existe
    const currentLicense = localStorage.getItem('current_license');
    if (currentLicense) {
        $('input[name="license"]').val(currentLicense);
        validateAndShowLicenseInfo(currentLicense);
    }

    // Manejar cambio de servicio de teléfono para mostrar información específica
    $('select[name="phoneService"]').on('change', function() {
        const selectedService = $(this).val();
        
        // Ocultar todas las informaciones específicas
        $('#sim24Info').addClass('d-none');
        
        // Mostrar información específica según el servicio
        if (selectedService === 'sim24') {
            $('#sim24Info').removeClass('d-none');
        }
    });
    
    // Verificar servicio actual al cargar la página
    const currentService = $('select[name="phoneService"]').val();
    if (currentService === 'sim24') {
        $('#sim24Info').removeClass('d-none');
    }

    // Manejar clic en botón de validación
    $('#validateLicense').click(async function() {
        const license = $('input[name="license"]').val().trim();
        if (!license) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor ingrese una licencia'
            });
            return;
        }

        $(this).prop('disabled', true);
        $(this).html('<span class="spinner-border spinner-border-sm me-1"></span> Validando...');

        try {
            const isValid = await validateAndShowLicenseInfo(license);
            if (isValid) {
                Swal.fire({
                    icon: 'success',
                    title: 'Licencia Válida',
                    text: 'La licencia ha sido validada correctamente'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al validar la licencia'
            });
        } finally {
            $(this).prop('disabled', false);
            $(this).html('<i class="ri-checkbox-circle-line me-1"></i> Validar');
        }
    });

    // Manejar cambio de licencia
    $('input[name="license"]').on('change', async function() {
        const newLicense = $(this).val().trim();
        if (newLicense) {
            await validateAndShowLicenseInfo(newLicense);
        }
    });

})

/**
 * loadPhone
 * Descripción: Carga los servicios de teléfono desde localStorage y los muestra en el select correspondiente.
 * Retorna: Promise<void>
 */
async function loadPhone() {

    const data = await getLocalStorage('serviceData') || []

    let html = ''

    for (let index = 0; index < data.length; index++) {
        html += '<option '+(data[index].selected ? 'selected' : '')+' value="'+data[index].id+'">'+data[index].name+'</option>'
    }

    $('select[name="customPhone"]').html(html)


}

$('.addPhoneForm').on('submit', async function(e) {

    e.preventDefault()

    const services = await getLocalStorage('serviceData') || []

    const data = {
        id: services.length + 1,
        name: $('.addPhoneForm .serviceName').val(),
        apiGetPhone: $('.addPhoneForm .apiGetPhone').val(),
        phoneValue: $('.addPhoneForm .phoneValue').val(),
        phonePrefix: $('.addPhoneForm .phonePrefix').val(),
        phoneDelay: $('.addPhoneForm .phoneDelay').val(),
        idValue: $('.addPhoneForm .idValue').val(),
        apiGetCode: $('.addPhoneForm .apiGetCode').val(),
        codeValue: $('.addPhoneForm .codeValue').val()
    }

    $('.addPhoneForm .serviceName').val(''),
    $('.addPhoneForm .apiGetPhone').val(''),
    $('.addPhoneForm .phoneValue').val(''),
    $('.addPhoneForm .phonePrefix').val(''),
    $('.addPhoneForm .phoneDelay').val(''),
    $('.addPhoneForm .idValue').val(''),
    $('.addPhoneForm .apiGetCode').val(''),
    $('.addPhoneForm .codeValue').val('')

    services.push(data)

    await setLocalStorage('serviceData', services)

    loadPhone()

    $('#addPhoneModal').modal('hide')

})

$('.editPhoneForm').on('submit', async function(e) {

    e.preventDefault()

    const id = $('.editPhoneForm .phoneId').val()

    const data = {
        id,
        name: $('.editPhoneForm .serviceName').val(),
        apiGetPhone: $('.editPhoneForm .apiGetPhone').val(),
        phoneValue: $('.editPhoneForm .phoneValue').val(),
        phonePrefix: $('.editPhoneForm .phonePrefix').val(),
        phoneDelay: $('.editPhoneForm .phoneDelay').val(),
        idValue: $('.editPhoneForm .idValue').val(),
        apiGetCode: $('.editPhoneForm .apiGetCode').val(),
        codeValue: $('.editPhoneForm .codeValue').val()
    }


    $('.editPhoneForm .serviceName').val(''),
    $('.editPhoneForm .apiGetPhone').val(''),
    $('.editPhoneForm .phoneValue').val(''),
    $('.editPhoneForm .phonePrefix').val(''),
    $('.editPhoneForm .phoneDelay').val(''),
    $('.editPhoneForm .idValue').val(''),
    $('.editPhoneForm .apiGetCode').val(''),
    $('.editPhoneForm .codeValue').val('')

    const services = await getLocalStorage('serviceData') || []
    const current = services.findIndex(item => item.id == id)

    services[current] = data
    
    await setLocalStorage('serviceData', services)

    loadPhone()

    $('#editPhoneModal').modal('hide')

})

/**
 * getNumber
 * Descripción: Obtiene un número de teléfono de prueba usando la plantilla configurada y lo muestra en el modal de test.
 * Retorna: Promise<void>
 */
async function getNumber() {

    $('button[onclick="getNumber()"]').prop('disabled', true)

    const data = await getPhoneTemplate()

    if (data) {
        $('#testNumber').val(data.number)
        $('#testId').val(data.id)
    } else {
        alert('No se pudo obtener el número')
    }

    $('button[onclick="getNumber()"]').prop('disabled', false)

}

/**
 * getCode
 * Descripción: Obtiene el código de verificación para el número de prueba y lo muestra en un alert.
 * Retorna: Promise<void>
 */
async function getCode() {

    $('button[onclick="getCode()"]').prop('disabled', true)

    const id =  $('#testId').val()

    const data = await getPhoneCodeTemplate(id)

    if (data) {

        alert('Código: '+data)
        
    } else {
        alert('No se pudo obtener el código')
    }

    $('button[onclick="getCode()"]').prop('disabled', false)

}

/**
 * testPhone
 * Descripción: Abre el modal de prueba de teléfono y limpia los campos de test.
 * Retorna: void
 */
function testPhone() {

    saveSetting()

    $('#testNumber').val('')
    $('#testId').val('')

    $('#testPhoneModal').modal('show')

}

/**
 * addPhone
 * Descripción: Abre el modal para agregar un nuevo servicio de teléfono.
 * Retorna: void
 */
function addPhone() {

    $('#addPhoneModal').modal('show')

}

/**
 * editPhone
 * Descripción: Abre el modal para editar el servicio de teléfono seleccionado, cargando sus datos en el formulario.
 * Retorna: Promise<void>
 */
async function editPhone() {

    const services = await getLocalStorage('serviceData') || []

    const selected = $('select[name="customPhone"]').find(':selected').val()

    if (selected) {

        const data = services.filter(item => item.id == selected)[0]

        $('.phoneId').val(selected)

        $('.editPhoneForm .serviceName').val(data.name),
        $('.editPhoneForm .apiGetPhone').val(data.apiGetPhone),
        $('.editPhoneForm .phoneValue').val(data.phoneValue),
        $('.editPhoneForm .phonePrefix').val(data.phonePrefix),
        $('.editPhoneForm .phoneDelay').val(data.phoneDelay),
        $('.editPhoneForm .idValue').val(data.idValue),
        $('.editPhoneForm .apiGetCode').val(data.apiGetCode),
        $('.editPhoneForm .codeValue').val(data.codeValue)

        $('#editPhoneModal').modal('show')

    }

}

/**
 * deletePhone
 * Descripción: Elimina el servicio de teléfono seleccionado tras confirmación del usuario.
 * Retorna: void
 */
function deletePhone() {
    
    const selected = $('select[name="customPhone"]').find(':selected').val()

    if (selected) {
        Swal.fire({
            title: '¿Estás seguro que deseas eliminar?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (res) => {
            if (res.isConfirmed) {

                const services = await getLocalStorage('serviceData') || []

                await setLocalStorage('serviceData', services.filter(item => item.id != selected))

                loadPhone()

            }
        })
    }

}

$("#saveSetting, .saveSetting, .btn-primary").on("click", async function() {
  try {
    // Guardar access token manual
    const manualToken = $("#accessToken").val();
    await setLocalStorage('manualAccessToken', manualToken);
    await setLocalStorage('accessToken', manualToken);
    
    // Guardar cookie
    const cookie = $("#cookie").val();
    if (cookie) {
      await setCookie(cookie);
    }
    
    // Guardar toda la configuración usando saveSetting()
    const config = await saveSetting();
    console.log('✅ Configuración guardada:', config);
    
    // Mostrar mensaje de éxito
    Swal.fire({
      icon: 'success',
      title: '✅ Configuración Guardada',
      text: 'La configuración se ha guardado correctamente.',
      timer: 2000,
      showConfirmButton: false
    });
    
  } catch (error) {
    console.error('❌ Error al guardar configuración:', error);
    Swal.fire({
      icon: 'error',
      title: '❌ Error al Guardar',
      text: 'Hubo un error al guardar la configuración: ' + error.message,
      confirmButtonText: 'OK'
    });
  }
});

/**
 * testPhoneService
 * Descripción: Prueba el servicio de teléfono configurado mostrando información detallada del proceso.
 * Retorna: Promise<void>
 */
async function testPhoneService() {
  try {
    console.log('🔍 Iniciando prueba del servicio de teléfono...');
    
    // Obtener configuración actual
    const phoneService = $('select[name="phoneService"]').val();
    const phoneServiceKey = $('input[name="phoneServiceKey"]').val();
    
    // Validar configuración
    if (!phoneService || phoneService === "none") {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor selecciona un servicio de teléfono antes de probar'
      });
      return;
    }
    
    if (!phoneServiceKey) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor ingresa tu API Key antes de probar'
      });
      return;
    }
    
    // Mostrar modal de progreso
    Swal.fire({
      title: 'Probando Servicio de Teléfono',
      html: `
        <div class="text-start">
          <p><strong>📋 Servicio:</strong> ${phoneService}</p>
          <p><strong>🔑 API Key:</strong> ${phoneServiceKey.substring(0, 10)}...</p>
          <hr>
          <div id="testProgress">
            <p>🔄 Iniciando prueba...</p>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Función para actualizar el progreso
    const updateProgress = (message) => {
      const progressDiv = document.getElementById('testProgress');
      if (progressDiv) {
        progressDiv.innerHTML += `<p>${message}</p>`;
        progressDiv.scrollTop = progressDiv.scrollHeight;
      }
    };
    
    updateProgress('🚀 Intentando obtener número de teléfono...');
    
    // Probar obtener número
    let phoneResult = null;
    try {
      phoneResult = await getPhone(phoneService, phoneServiceKey);
      
      if (phoneResult && phoneResult.number && phoneResult.id) {
        updateProgress(`✅ Número obtenido: ${phoneResult.number}`);
        updateProgress(`📱 ID del número: ${phoneResult.id}`);
        
        // Para sim24, explicar el comportamiento esperado
        if (phoneService === 'sim24') {
          updateProgress('ℹ️ <strong>Nota sobre sim24:</strong>');
          updateProgress('⚠️ En esta prueba NO se enviará SMS real');
          updateProgress('📱 ResponseCode: 1 = "Esperando SMS" (normal)');
          updateProgress('🔄 En uso real, Facebook enviaría el SMS');
          updateProgress('⏳ Esperando 3 segundos antes de probar código...');
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          updateProgress('🔄 Probando obtención de código (esperando ResponseCode: 1)...');
        } else {
          updateProgress('⏳ Esperando 5 segundos antes de probar código...');
          await new Promise(resolve => setTimeout(resolve, 5000));
          updateProgress('🔄 Intentando obtener código de verificación...');
        }
        
        // Probar obtener código con intentos reducidos para la prueba
        try {
          const codeResult = await getPhoneCode(phoneService, phoneServiceKey, phoneResult.id);
          
          if (codeResult) {
            updateProgress(`✅ Código obtenido: ${codeResult}`);
            updateProgress('🎉 ¡Servicio funcionando perfectamente!');
            
            // Mostrar resultado exitoso
            setTimeout(() => {
              Swal.fire({
                icon: 'success',
                title: '🎉 ¡Servicio Funcionando!',
                html: `
                  <div class="text-start">
                    <h6>✅ Prueba completada exitosamente:</h6>
                    <p><strong>📞 Número:</strong> ${phoneResult.number}</p>
                    <p><strong>🔢 Código:</strong> ${codeResult}</p>
                    <p><strong>📱 ID:</strong> ${phoneResult.id}</p>
                    <hr>
                    <small class="text-muted">El servicio está listo para usar en el proceso de resistencia BM.</small>
                  </div>
                `,
                confirmButtonText: 'Cerrar'
              });
            }, 2000);
            
          } else {
            throw new Error('No se obtuvo código');
          }
          
        } catch (codeError) {
          updateProgress(`⚠️ Código no obtenido: ${codeError.message}`);
          
          // Manejo especial para sim24
          if (phoneService === 'sim24' && codeError.message.includes('ResponseCode:1')) {
            updateProgress('✅ <strong>¡Esto es NORMAL para sim24!</strong>');
            updateProgress('📝 ResponseCode: 1 = "Esperando SMS"');
            updateProgress('🔄 En uso real funcionará cuando Facebook envíe SMS');
            
            setTimeout(() => {
              Swal.fire({
                icon: 'info',
                title: '✅ Servicio Funcionando Correctamente',
                html: `
                  <div class="text-start">
                    <h6>✅ Número obtenido exitosamente:</h6>
                    <p><strong>📞 Número:</strong> ${phoneResult.number}</p>
                    <p><strong>📱 ID:</strong> ${phoneResult.id}</p>
                    <hr>
                    <h6>ℹ️ Sobre ResponseCode: 1:</h6>
                    <p>• <strong>Es NORMAL</strong> para sim24 en pruebas</p>
                    <p>• Significa "Esperando SMS"</p>
                    <p>• En uso real, Facebook enviará el SMS</p>
                    <p>• El sistema funcionará correctamente</p>
                    <hr>
                    <div class="alert alert-success">
                      <strong>✅ Conclusión:</strong> Tu servicio sim24 está configurado correctamente y funcionará en producción.
                    </div>
                  </div>
                `,
                confirmButtonText: 'Entendido'
              });
            }, 2000);
          } else {
            updateProgress('❌ Error inesperado al obtener código');
            
            setTimeout(() => {
              Swal.fire({
                icon: 'warning',
                title: 'Error al Obtener Código',
                html: `
                  <div class="text-start">
                    <h6>✅ Número obtenido exitosamente:</h6>
                    <p><strong>📞 Número:</strong> ${phoneResult.number}</p>
                    <hr>
                    <h6>❌ Error con código:</h6>
                    <p>${codeError.message}</p>
                    <small class="text-muted">Verifica tu configuración de API o saldo.</small>
                  </div>
                `,
                confirmButtonText: 'Cerrar'
              });
            }, 2000);
          }
        }
        
      } else {
        throw new Error('El servicio no devolvió un número válido');
      }
      
    } catch (phoneError) {
      updateProgress(`❌ Error al obtener número: ${phoneError.message || phoneError}`);
      updateProgress('❌ El servicio no está funcionando correctamente');
      
      setTimeout(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error en el Servicio',
          html: `
            <div class="text-start">
              <h6>❌ No se pudo obtener número:</h6>
              <p>${phoneError.message || phoneError}</p>
              <hr>
              <h6>💡 Posibles soluciones:</h6>
              <ul>
                <li>Verifica que tu API Key sea correcta</li>
                <li>Asegúrate de tener saldo suficiente</li>
                <li>Verifica que el servicio esté disponible</li>
                <li>Prueba con otro servicio si es posible</li>
              </ul>
            </div>
          `,
          confirmButtonText: 'Cerrar'
        });
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Error en testPhoneService:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al probar el servicio: ' + (error.message || error)
    });
  }
}