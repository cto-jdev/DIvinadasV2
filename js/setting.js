$(document).ready(async function() {

    loadSetting()
    loadPhone()

    await delayTime(1000)

    const cookie = await getCookie()
    const manualToken = await getLocalStorage('manualAccessToken')
    const accessToken = manualToken || await getLocalStorage('accessToken')

    $('#cookie').val(cookie)
    $('#accessToken').val(accessToken)
    
})

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

function testPhone() {

    saveSetting()

    $('#testNumber').val('')
    $('#testId').val('')

    $('#testPhoneModal').modal('show')

}

function addPhone() {

    $('#addPhoneModal').modal('show')

}

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
  const manualToken = $("#accessToken").val();
  await setLocalStorage('manualAccessToken', manualToken);
  await setLocalStorage('accessToken', manualToken);
  // ... aquí sigue el resto del guardado normal ...
});