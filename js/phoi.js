$(document).ready(async function() {

    const id = new URL(window.location.href).searchParams.get('id')
    const data = await getLocalStorage(id) || false

    if (id && data) {

        $('#save').attr('data-file', id)

        if (data.src) {
    
            $('#card').html('<img draggable="false" src="'+data.src+'">')
    
            data.data.forEach(item => {
    
                let color = ''
                let style = ''
                let size = ''
                let family = ''
                let content = ''
                let width = ''
                let height = ''
    
                if (item.type !== 'image') {
    
                    if (item.color) {
                        color = 'color: '+item.color+';'
                    }
    
                    if (item.style) {
                        style = 'font-weight: '+item.style+';'
                    }
    
                    if (item.size) {
                        size = 'font-size: '+item.size+'px;'
                    }
    
                    if (item.src) {
                        content = '<img src="'+item.src+'">'
                        width = 'width: '+item.width+'px;'
                        height = 'height: '+item.height+'px;'
                    } else {
                        content = $('.phoi-elm[data-type="'+item.type+'"]').text()
                    }
    
                    if (item.family) {
                        family = 'font-family: '+item.family.replaceAll('"', '').replaceAll('\\', '')+';'
                    }
    
                } else {
                    content = '<img src="../public/img/avatar.jpg">'
                    width = 'width: '+item.width+'px;'
                    height = 'height: '+item.height+'px;'
                }
    
                $('#card').append(`
                    <div class="elm" data-type="${item.type}" style="
                        top: ${item.top}px;
                        left: ${item.left}px;
                        ${color}
                        ${family}
                        ${style}
                        ${size}
                        ${width}
                        ${height}
                    ">${content}</div>
                `)
            })
    
            $('.elm[data-type="image"]').resizable({ handles: 'all' })
            $('.elm[data-type="seal"]').resizable({ handles: 'all' })
    
            $('.elm').draggable({
                containment:'#card',
                start: function(e, u) {
                    $('.elm').removeClass('active')
                    $(u.helper[0]).addClass('active')
                }
            })
    
        }

    }

})

/**
 * randomNumberRange
 * Descripción: Devuelve un número entero aleatorio entre min (incluido) y max (excluido).
 * Parámetros: min (número mínimo), max (número máximo)
 * Retorna: número
 */
function randomNumberRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

/**
 * allowDrop
 * Descripción: Permite soltar elementos en un área de drop (drag & drop).
 * Parámetros: e (evento)
 */
function allowDrop(e) {
    e.preventDefault()
}

/**
 * drag
 * Descripción: Inicia el arrastre de un elemento, guardando su tipo y texto en dataTransfer.
 * Parámetros: e (evento)
 */
function drag(e) {

    $.event.addProp('dataTransfer')

    e.dataTransfer.setData('type', e.target.dataset.type)
    e.dataTransfer.setData('text', e.target.innerText)
}

/**
 * drop
 * Descripción: Maneja el evento de soltar un elemento en el área de drop, agregando el elemento al DOM según su tipo.
 * Parámetros: e (evento)
 */
function drop(e) {

    e.preventDefault()

    const type = e.dataTransfer.getData('type')

    let text = e.dataTransfer.getData('text')
    
    const x = e.offsetX
    const y = e.offsetY

    $('.elm').removeClass('active')

    if (type == 'image') {

        $('#card').append(`<div class="elm active" data-type="image" style="top:${y}px;left:${x}px"><img src="img/avatar.jpg"></div>`)

    } else if (type == 'seal') {

        $('#loadSeal').click()

        $('#card').append(`<div class="elm active" data-type="seal" style="top:${y}px;left:${x}px"><img src=""></div>`)

    } else {

        $('#card').append(`<div class="elm active" data-type="${type}" style="top:${y}px;left:${x}px;font-size:16px;color:#000000;/*font-family: 'Arial'*/">${text}</div>`)

    }

    getTextStyle()

    $('.elm[data-type="image"]').resizable({ handles: 'all' })

    $('.elm').draggable({
        containment:'#card',
        start: function(e, u) {
            $('.elm').removeClass('active')
            $(u.helper[0]).addClass('active')
        }
    })

}

/**
 * getPhoi
 * Descripción: Obtiene todos los phoi almacenados y los muestra en la interfaz.
 * Retorna: void
 */
async function getPhoi() {

    const phoiData = await getAllLocalStore()

    const phoi = Object.keys(phoiData).filter(item => item.includes('phoi_')).map(item => {
        return {
            id: item,
            ...phoiData[item]
        }
    })

    $('#phoiList').html('')

    let html = '<div class="row">'

    phoi.forEach((phoi, i) => {

        html += `
            <div class="col-3 mb-3">
                <a class="phoiItem text-decoration-none text-black d-block p-3 border rounded" data-file="${phoi.id}" href="?id=${phoi.id}">
                    <i class="ri-checkbox-circle-fill fs-4 text-success"></i>
                    <div class="ratio ratio-4x3">
                        <img class="object-fit-contain w-100 h-100" src="${phoi.src}">
                    </div>
                    <div class="d-flex">
                        <span class="fw-medium">${phoi.name}</span>
                    </div>
                </a>
            </div>
        `
    })

    html += '</div>'
 
    $('#phoiList').html(html)

}

getPhoi()

/**
 * hex
 * Descripción: Convierte un número a su representación hexadecimal de dos dígitos.
 * Parámetros: x (número)
 * Retorna: string
 */
function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
}

/**
 * rgb2hex
 * Descripción: Convierte un color en formato rgb/rgba a formato hexadecimal.
 * Parámetros: rgb (string en formato rgb o rgba)
 * Retorna: string (color hexadecimal)
 */
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(,\s*\d+\.*\d+)?\)$/)
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])
}

/**
 * getTextStyle
 * Descripción: Actualiza los inputs de estilo de texto según el elemento activo seleccionado.
 * Retorna: void
 */
function getTextStyle() {

    const type = $('.elm.active').attr('data-type')

    if (type !== 'image' && type !== 'seal') {
        const size = $('.elm.active').css('font-size').replace('px', '')
        const color = rgb2hex($('.elm.active').css('color'))
        const font = $('.elm.active').css('font-family')
        const style = $('.elm.active').css('font-weight')

        $('input[name="fontColor"]').val(color)
        $('input[name="fontSize"]').val(size)

        if (style == '700') {
            $('#textBold').addClass('bg-body-secondary')
        } else {
            $('#textBold').removeClass('bg-body-secondary')
        }

        $('select[name="fontFamily"] option[value='+font+']').prop('selected', true)

    }

}

/**
 * getFormattedTime
 * Descripción: Devuelve la fecha y hora actual en formato YYYY-M-D-H-MIN-S.
 * Retorna: string
 */
function getFormattedTime() {
    const today = new Date()
    const y = today.getFullYear()
    const m = today.getMonth() + 1
    const d = today.getDate()
    const h = today.getHours()
    const mi = today.getMinutes()
    const s = today.getSeconds()
    return y + "-" + m + "-" + d + "-" + h + "-" + mi + "-" + s
}

/**
 * getBase64
 * Descripción: Convierte un archivo a una cadena base64.
 * Parámetros: file (archivo a convertir)
 * Retorna: Promise<string>
 */
function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
}

/**
 * getData
 * Descripción: Obtiene los datos de la tarjeta y los elementos (elm) en el DOM para su almacenamiento o procesamiento.
 * Retorna: objeto con src y data
 */
function getData() {

    if ($('#card > img').length > 0) {

        const data = {}

        data.src = $('#card > img').attr('src')

        data.data = []

        $('.elm').each(function(index) {

            const type = $(this).attr('data-type')

            data.data[index] = {}
            data.data[index].type = type

            data.data[index].top = parseInt($(this).css('top').replace('px', ''))
            data.data[index].left = parseInt($(this).css('left').replace('px', ''))

            if (type === 'seal') {
                data.data[index].src = $(this).find('img').attr('src')
            }

            if (type === 'image' || type === 'seal') {
                data.data[index].width = parseInt($(this).css('width').replace('px', ''))
                data.data[index].height = parseInt($(this).css('height').replace('px', ''))
            } else {
                data.data[index].width = $(this).width()
                data.data[index].height = $(this).height()
                data.data[index].size = parseInt($(this).css('font-size').replace('px', ''))
                data.data[index].color = rgb2hex($(this).css('color'))
                data.data[index].family = $(this).css('font-family')
                data.data[index].style = $(this).css('font-weight')
            }
            
        })

        return data
    }
}

$(document).on('click', '#test', async function() {

    const data = getData()

    const cookie = await getCookie()

    let uid = ''

    try {
        
        uid = cookie.split('c_user=')[1].split(';')[0]

    } catch {}

    const user = await getLocalStorage('userInfo_'+uid)

    const textData = {
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.name,
        birthday: user.birthday,
        gender: user.gender,
    }

    const res = await fetch('/phoi?preview=1', {
        headers: {
            "content-type": "application/json"
        },
        method: 'POST',
        body: JSON.stringify({
            data: textData,
            template: data
        })
    })

    const image = await res.text()

    if (image === 'ERRPR') {

        alert('¡ERROR!')

    } else {
        $('#previewImage').attr('src', 'data:image/png;base64,'+image)

        $('#previewModal').modal('show')
    }

})

$(document).on('click', '#save', async function() {

    const data = getData()
    const file = $(this).attr('data-file')

    if (data) {

        let inputValue = ''

        if (file) {

            const fileData = await getLocalStorage(file)

            console.log(fileData)

            inputValue = fileData.name
        }

        Swal.fire({
            title: 'Ingresa el nombre de la plantilla',
            input: 'text',
            showCancelButton: true,
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar', 
            inputValue,
            inputValidator: async (value) => {

                if (value.length) {
                    
                    data.name = value 

                    if (file) {
                        await setLocalStorage(file, data)
                    } else {
                        await setLocalStorage('phoi_'+new Date().getTime(), data)
                    }

                    Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Plantilla guardada',
                        confirmButtonColor: '#0d6efd'
                    })

                } else {
                    return 'El nombre no puede estar vacío'
                }

            }
        })

    }
})


$(document).on('change', '#loadSeal', async function() {
    const base64 = await getBase64(this.files[0])

    $('.elm[data-type="seal"] img').attr('src', base64)

    $('.elm[data-type="seal"]').resizable({ handles: 'all' })
})

$(document).on('change', '#newImage', async function() {

    console.log(this.files[0])

    const base64 = await getBase64(this.files[0])

    $('#save').removeAttr('data-file')

    $('#card').html('<img draggable="false" src="'+base64+'">')
})

$(document).on('change', 'input[name="fontSize"]', function() {
    $('.elm.active').css('font-size', $(this).val()+'px')
})

$(document).on('change', 'select[name="fontFamily"]', function() {

    const font = $(this).find(':selected').val()

    $('.elm.active').css('font-family', font)
})

$(document).on('click', '#textBold', function() {

    if ($('.elm.active').length) {
        if ($(this).hasClass('bg-body-secondary')) {
            $(this).removeClass('bg-body-secondary')
            $('.elm.active').css('font-weight', '')
        } else {
            $(this).addClass('bg-body-secondary')
            $('.elm.active').css('font-weight', '700')
        }
    }

})

$(document).on('input', 'input[name="fontColor"]', function() {
    $('.elm.active').css('color', $(this).val())
})

$(document).on('keydown', function(e) {

    const left = $('.elm.active').css('left') ? parseInt($('.elm.active').css('left').replace('px', '')) : 0
    const top = $('.elm.active').css('left') ? parseInt($('.elm.active').css('top').replace('px', '')) : 0

    switch(e.which) {
        case 37:
            $('.elm.active').css('left', (left-1)+'px')
        break;

        case 38:
            $('.elm.active').css('top', (top-1)+'px')
        break;

        case 39:
            $('.elm.active').css('left', (left+1)+'px')
        break;

        case 40:
            $('.elm.active').css('top', (top+1)+'px')
        break;
        case 46: 
            $('.elm.active').remove()
        break;

        default: return;
    }

    e.preventDefault()
})

$(document).on('click', '.elm', function() {

    $('.elm').removeClass('active')

    setTimeout(() => {
        $(this).addClass('active')
        getTextStyle()
    }, 100)
    
})

$(document).on('contextmenu', '.elm.active', function() {
    $(this).remove()
})

$(document).on('click', '.wrapper', function(event) {
    if (!$(event.target).hasClass('elm')) {
        $('.elm').removeClass('active')
        $('input[name="fontSize"]').val('')
        $('input[name="fontColor"]').val('')
        $('#textBold').removeClass('bg-body-secondary')
        $('select[name="fontFamily"] option').prop('selected', false)
    }
})

$('.phoi-elm').on('dragstart', function (event) {
    drag(event)
})

$('#card').on('drop', function(event) {
    drop(event)
})

$('#card').on('dragover', function(event) {
    allowDrop(event)
})