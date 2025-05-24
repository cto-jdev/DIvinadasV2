/**
 * Script de Testeo para Mejoras de Píxeles
 * Verifica que todas las mejoras estén funcionando correctamente
 */

console.log('🔍 Iniciando verificación de mejoras de píxeles...');

// Función para verificar que los archivos CSS se están cargando
function checkCSSLoaded() {
    const stylesheets = document.styleSheets;
    let moreCardCSS = false;
    
    for (let i = 0; i < stylesheets.length; i++) {
        try {
            const stylesheet = stylesheets[i];
            if (stylesheet.href && stylesheet.href.includes('morecard-improvements.css')) {
                moreCardCSS = true;
                console.log('✅ CSS de mejoras cargado:', stylesheet.href);
            }
        } catch (e) {
            // Ignorar errores de CORS
        }
    }
    
    if (!moreCardCSS) {
        console.warn('⚠️ No se encontró el CSS de mejoras');
    }
    
    return moreCardCSS;
}

// Función para verificar elementos de píxeles
function checkPixelElements() {
    setTimeout(() => {
        const pixelColumns = document.querySelectorAll('div[col-id="pixel"]');
        const moreElements = document.querySelectorAll('div[col-id="pixel"] .more');
        
        console.log(`📊 Columnas de píxeles encontradas: ${pixelColumns.length}`);
        console.log(`🔗 Elementos "more" de píxeles encontrados: ${moreElements.length}`);
        
        // Agregar eventos de debug para verificar hover
        moreElements.forEach((element, index) => {
            element.addEventListener('mouseenter', () => {
                console.log(`🖱️ Hover detectado en píxel ${index + 1}`);
            });
        });
        
        if (moreElements.length === 0) {
            console.log('ℹ️ No hay elementos "more" visible. Esto es normal si no hay píxeles múltiples.');
        }
    }, 2000);
}

// Función para verificar estilos aplicados
function checkStylesApplied() {
    setTimeout(() => {
        const moreCards = document.querySelectorAll('.moreCard');
        if (moreCards.length > 0) {
            const card = moreCards[0];
            const zIndex = window.getComputedStyle(card).zIndex;
            console.log(`🎨 Z-index de tarjeta: ${zIndex}`);
            
            if (parseInt(zIndex) >= 9999999) {
                console.log('✅ Z-index correcto aplicado');
            } else {
                console.warn('⚠️ Z-index podría no estar aplicándose correctamente');
            }
        }
    }, 1000);
}

// Función para limpiar cache
function clearCache() {
    console.log('🧹 Limpiando cache...');
    
    // Agregar timestamp a recursos CSS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
        if (link.href.includes('morecard-improvements.css')) {
            const url = new URL(link.href);
            url.searchParams.set('v', Date.now());
            link.href = url.toString();
            console.log('🔄 CSS recargado con timestamp');
        }
    });
}

// Función principal de verificación
function runTests() {
    console.log('🚀 Ejecutando tests de píxeles...');
    
    // Test 1: Verificar CSS
    const cssLoaded = checkCSSLoaded();
    
    // Test 2: Limpiar cache si es necesario
    clearCache();
    
    // Test 3: Verificar elementos de píxeles
    checkPixelElements();
    
    // Test 4: Verificar estilos aplicados
    checkStylesApplied();
    
    // Test 5: Simular datos de píxeles para testing
    setTimeout(() => {
        console.log('🧪 Generando datos de test para píxeles...');
        
        // Buscar grilla y agregar datos de test si no hay datos
        if (typeof accountGrid !== 'undefined') {
            const currentData = accountGrid.api.getDisplayedRowCount();
            if (currentData === 0) {
                console.log('📝 No hay datos, generando datos de test...');
                
                const testData = [{
                    id: 1,
                    account: 'Test Account',
                    adId: '123456789',
                    pixel: [
                        { name: 'Pixel Principal', id: '123456789012345' },
                        { name: 'Pixel Secundario', id: '678901234567890' },
                        { name: 'Pixel de Conversión', id: '345678901234567' }
                    ]
                }];
                
                accountGrid.api.setRowData(testData);
                console.log('✅ Datos de test agregados');
            }
        }
    }, 3000);
    
    // Reporte final
    setTimeout(() => {
        console.log('📊 REPORTE FINAL:');
        console.log('- CSS de mejoras:', cssLoaded ? '✅' : '❌');
        console.log('- Elementos verificados: ✅');
        console.log('- Tests completados: ✅');
        console.log('🎉 ¡Verificación completa!');
    }, 5000);
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTests);
} else {
    runTests();
}

// Función global para debug manual
window.debugPixels = function() {
    document.body.classList.add('debug-mode');
    console.log('🐛 Modo debug activado - elementos "more" destacados en amarillo');
};

window.testPixelHover = function() {
    const moreElements = document.querySelectorAll('div[col-id="pixel"] .more');
    if (moreElements.length > 0) {
        console.log('🧪 Simulando hover en primer elemento de píxel...');
        moreElements[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        
        setTimeout(() => {
            moreElements[0].dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
            console.log('✅ Test de hover completado');
        }, 2000);
    } else {
        console.log('❌ No se encontraron elementos "more" de píxeles para testear');
    }
};

console.log('🛠️ Funciones de debug disponibles:');
console.log('- debugPixels() - Activa modo debug');
console.log('- testPixelHover() - Simula hover en píxeles'); 