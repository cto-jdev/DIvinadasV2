$(document).ready(async function() {

    let ver = await getLocalStorage('ver')

    if (!ver) {
        const cur = await getVersion()
        await setLocalStorage('ver', cur)
        ver = cur
    }

    $('#ver').text('Version: '+ver)

    const cookie = await getCookie()

    let uid = ''

    try {
        
        uid = cookie.split('c_user=')[1].split(';')[0]

    } catch {}

    const url = new URL(location.href)
    const id = url.searchParams.get('id')
    const bmId = url.searchParams.get('bm')
    const data = await getLocalStorage('dataAds_'+uid) || []

    const adData = (data.filter(item => item.adId == id))[0]

    // Guard: si no hay datos, mostrar mensaje amigable y salir
    if (!adData) {
        document.getElementById('t1').innerHTML = '<span class="badge text-bg-secondary">Sin datos</span>';
        return;
    }

    let status = ''

    if (adData.status == 101) {
        status = '<span class="badge text-bg-secondary">Cerrado</span>'
    }

    if (adData.status == 999) {
        status = '<span class="badge text-bg-info">En espera</span>'
    }

    if (adData.status == 1 || adData.status == 100) {
        status = '<span class="badge text-bg-success">Activo</span>'
    }

    if (adData.status == 2) {
        status = '<span class="badge text-bg-danger">Deshabilitado</span>'
    }

    if (adData.status == 3) {
        status = '<span class="badge text-bg-warning">Pago pendiente</span>'
    }

    if (adData.status == 4) {
        status = '<span class="badge text-bg-warning">Apelando 3 líneas</span>'
    }

    if (adData.status == 5) {
        status = '<span class="badge text-bg-danger">Muerto 3 líneas</span>'
    }

    if (adData.status == 6) {
        status = '<span class="badge text-bg-warning">Muerto XMDT</span>'
    }

    if (adData.status == 7) {
        status = '<span class="badge text-bg-warning">Muerto permanente</span>'
    }

    const currency = adData.currency.split('-')[0]

    $('#t1').html(status)
    $('#t2').html(adData.limit+' '+currency)
    $('#t3').html(adData.remain+' '+currency)
    $('#t4').html(adData.spend+' '+currency)
    $('#t5').html(adData.balance+' '+currency)
    $('#t6').html(adData.createdTime)
    $('#t7').html(adData.nextBillDate)
    $('#t9').html(adData.type)
    $('#t10').html(adData.timezone)

    let card = ''

    try {
        card = JSON.parse(adData.payment)[0]

        if (card.credential.card_association) {
            card = (card.credential.card_association+' - '+card.credential.last_four_digits) || ''
        }

    } catch {}

    $('#t11').html(card)
    $('#t12').html(adData.role)

    const hiddenAdmins = await fb.checkHiddenAdmin(id, bmId)

    $('#t8').text(hiddenAdmins.length)

})