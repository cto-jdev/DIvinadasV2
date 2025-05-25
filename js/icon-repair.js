/**
 * Icon Repair Script - Reparación de iconos Remix Icon
 * Este script repara iconos que aparecen como barras o rectángulos
 */

$(document).ready(function() {
    
    // Función para reparar iconos
    function repairRemixIcons() {
        // Lista de iconos problemáticos con sus códigos Unicode correctos
        const iconMap = {
            'ri-bank-card-line': '\uea92',
            'ri-bank-card-2-line': '\uea90', 
            'ri-add-line': '\uea13',
            'ri-clipboard-line': '\ueb91',
            'ri-delete-bin-line': '\uec7a',
            'ri-check-line': '\ueb7b',
            'ri-close-line': '\ueb99',
            'ri-information-line': '\ued5b',
            'ri-save-line': '\uef41',
            'ri-refresh-line': '\uef00',
            'ri-shield-check-line': '\uef63'
        };
        
        // Buscar y reparar cada icono problemático
        Object.keys(iconMap).forEach(function(iconClass) {
            const elements = document.querySelectorAll('.' + iconClass);
            elements.forEach(function(element) {
                // Asegurar que tenga la fuente correcta
                element.style.fontFamily = 'RemixIcon';
                
                // Si el icono no se ve correctamente, forzar el contenido
                const computedStyle = window.getComputedStyle(element, ':before');
                const content = computedStyle.getPropertyValue('content');
                
                if (!content || content === 'none' || content === '""') {
                    // Crear pseudo-elemento manual si es necesario
                    element.setAttribute('data-icon', iconMap[iconClass]);
                    element.classList.add('icon-repaired');
                }
            });
        });
    }
    
    // Función para verificar si la fuente se cargó correctamente
    function checkFontLoaded() {
        const testElement = document.createElement('span');
        testElement.className = 'ri-add-line';
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.visibility = 'hidden';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement, ':before');
        const fontFamily = computedStyle.getPropertyValue('font-family');
        
        document.body.removeChild(testElement);
        
        return fontFamily.includes('RemixIcon') || fontFamily.includes('remixicon');
    }
    
    // Ejecutar reparación inmediatamente
    repairRemixIcons();
    
    // Verificar después de que las fuentes se carguen
    if (document.fonts) {
        document.fonts.ready.then(function() {
            setTimeout(repairRemixIcons, 100);
        });
    } else {
        // Fallback para navegadores que no soportan document.fonts
        setTimeout(repairRemixIcons, 500);
    }
    
    // Reparar iconos cuando se abra el modal
    $('#cardModal').on('shown.bs.modal', function() {
        setTimeout(repairRemixIcons, 50);
    });
    
    // Observer para detectar nuevos iconos agregados dinámicamente
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            let shouldRepair = false;
            
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) { // Element node
                            if (node.querySelector && node.querySelector('[class*="ri-"]')) {
                                shouldRepair = true;
                            }
                            if (node.className && node.className.includes('ri-')) {
                                shouldRepair = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldRepair) {
                setTimeout(repairRemixIcons, 10);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Función de debug para verificar iconos
    window.debugIcons = function() {
        console.log('=== Debug de Iconos Remix ===');
        console.log('Fuente cargada:', checkFontLoaded());
        
        const icons = document.querySelectorAll('[class*="ri-"]');
        console.log('Iconos encontrados:', icons.length);
        
        icons.forEach(function(icon) {
            const style = window.getComputedStyle(icon, ':before');
            console.log('Icono:', icon.className, 'Font-family:', style.fontFamily, 'Content:', style.content);
        });
    };
    
    // CSS adicional para iconos reparados manualmente
    const additionalStyles = `
        .icon-repaired:before {
            font-family: "RemixIcon" !important;
            content: attr(data-icon) !important;
            font-style: normal !important;
            font-weight: normal !important;
            line-height: 1 !important;
        }
    `;
    
    // Agregar estilos adicionales
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = additionalStyles;
    document.head.appendChild(styleSheet);
});

// Función global para reparar iconos en cualquier momento
window.repairIcons = function() {
    $(document).trigger('ready');
}; 