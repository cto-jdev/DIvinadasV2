// Funciones para agregar tarjetas con sistema robusto

$(document).ready(function() {
    
    // Función para actualizar contadores
    function updateCardCounters() {
        const allKeys = Object.keys(localStorage);
        const cardKeys = allKeys.filter(key => key.startsWith('card_'));
        const cardCount = cardKeys.length;
        
        console.log('🔢 Actualizando contadores...');
        console.log('   - Total localStorage keys:', allKeys.length);
        console.log('   - Card keys found:', cardKeys);
        console.log('   - Card count:', cardCount);
        
        $('#cardCountButton').text(cardCount);
        $('#cardCount').text(cardCount);
        
        console.log('✅ Contadores actualizados:', cardCount, 'tarjetas');
        
        // Debug adicional: verificar contenido de cada tarjeta
        if (cardCount > 0) {
            console.log('📋 Contenido de tarjetas:');
            cardKeys.forEach((key, index) => {
                try {
                    const cardData = JSON.parse(localStorage.getItem(key));
                    console.log(`   ${index + 1}. ${cardData.cardName} (${cardData.cardNumber})`);
                } catch (error) {
                    console.log(`   ${index + 1}. Error leyendo ${key}`);
                }
            });
        }
    }
    
    // Función robusta para recargar tarjetas
    function reloadCardsRobust() {
        console.log('🔄 Intentando recargar tarjetas...');
        
        // Primero, verificar qué hay en localStorage
        const allKeys = Object.keys(localStorage);
        const cardKeys = allKeys.filter(key => key.startsWith('card_'));
        console.log('🔍 Claves en localStorage:', allKeys.length, 'total,', cardKeys.length, 'de tarjetas');
        console.log('🎯 Claves de tarjetas:', cardKeys);
        
        // Método 1: Usar función original si existe
        if (typeof loadCards === 'function') {
            try {
                loadCards();
                console.log('✅ Tarjetas recargadas con loadCards()');
            } catch (error) {
                console.error('❌ Error con loadCards():', error);
            }
        }
        
        // Método 2: Recargar manualmente como respaldo
        setTimeout(() => {
            try {
                console.log('🔧 Método manual de respaldo...');
                
                let cardId = 1;
                const cards = [];
                
                cardKeys.forEach(key => {
                    try {
                        const cardDataString = localStorage.getItem(key);
                        console.log(`📋 Leyendo ${key}:`, cardDataString ? 'EXISTE' : 'NO EXISTE');
                        
                        if (cardDataString) {
                            const cardData = JSON.parse(cardDataString);
                            cards.push({
                                id: cardId++,
                                ...cardData
                            });
                            console.log(`✅ Tarjeta ${cardId-1} procesada:`, cardData.cardName);
                        }
                    } catch (error) {
                        console.error(`❌ Error procesando ${key}:`, error);
                    }
                });
                
                console.log('📊 Total de tarjetas procesadas:', cards.length);
                
                // Si hay acceso al grid, actualizar
                if (window.cardGrid && window.cardGrid.api) {
                    window.cardGrid.api.setRowData(cards);
                    console.log('🎯 Grid actualizado manualmente con', cards.length, 'tarjetas');
                } else {
                    console.warn('⚠️ cardGrid.api no disponible');
                }
                
                updateCardCounters();
                
            } catch (error) {
                console.error('❌ Error al recargar manualmente:', error);
            }
        }, 200);
    }
    
    // Mostrar formulario
    $('#addCardBtn').on('click', function() {
        $('#addCardForm').removeClass('d-none');
        $('#cardName').focus();
    });
    
    // Cancelar
    $('#cancelCardBtn').on('click', function() {
        $('#addCardForm').addClass('d-none');
        $('#cardName, #cardNumber, #expDate, #cardCsv').val('');
    });
    
    // Guardar tarjeta
    $('#saveCardBtn').on('click', function() {
        const cardName = $('#cardName').val().trim();
        const cardNumber = $('#cardNumber').val().trim();
        const expDate = $('#expDate').val().trim();
        const cardCsv = $('#cardCsv').val().trim();
        
        console.log('Intentando guardar tarjeta:', {cardName, cardNumber, expDate, cardCsv});
        
        if (!cardName || !cardNumber || !expDate || !cardCsv) {
            alert('Llena todos los campos');
            return;
        }
        
        if (cardNumber.length < 13) {
            alert('El número de tarjeta debe tener al menos 13 dígitos');
            return;
        }
        
        if (!expDate.match(/^\d{2}\/\d{2}$/)) {
            alert('La fecha debe tener formato MM/YY');
            return;
        }
        
        if (cardCsv.length < 3) {
            alert('El CCV debe tener al menos 3 dígitos');
            return;
        }
        
        const expParts = expDate.split('/');
        const cardData = {
            cardName: cardName,
            cardNumber: cardNumber,
            expMonth: expParts[0],
            expYear: expParts[1],
            expDate: expDate,
            cardCsv: cardCsv,
            count: 0
        };
        
        console.log('Guardando tarjeta:', cardData);
        
        // USAR LOCALSTORAGE DIRECTAMENTE - La función setLocalStorage() del proyecto no funciona
        console.log('🔧 Usando localStorage directamente (sin setLocalStorage del proyecto)');
        
        try {
            const cardKey = "card_" + cardNumber;
            const cardDataJson = JSON.stringify(cardData);
            
            console.log('💾 Guardando en localStorage:', cardKey);
            console.log('📦 Datos a guardar:', cardDataJson);
            
            // Guardar directamente en localStorage
            localStorage.setItem(cardKey, cardDataJson);
            
            // Verificar inmediatamente
            const verification = localStorage.getItem(cardKey);
            console.log('✅ Verificación inmediata:', verification ? 'ÉXITO' : 'FALLO');
            
            if (verification) {
                console.log('🎯 Datos verificados correctamente:', JSON.parse(verification));
                
                // Limpiar formulario
                $('#addCardForm').addClass('d-none');
                $('#cardName, #cardNumber, #expDate, #cardCsv').val('');
                
                // Recargar tarjetas
                setTimeout(() => reloadCardsRobust(), 300);
                
                alert('✅ Tarjeta agregada correctamente');
            } else {
                throw new Error('La tarjeta no se guardó correctamente en localStorage');
            }
            
        } catch (error) {
            console.error('❌ Error al guardar directamente en localStorage:', error);
            alert('Error al guardar: ' + error.message);
        }
    });
    
    // Formatear campos
    $('#cardNumber').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 16) value = value.substr(0, 16);
        $(this).val(value);
    });
    
    $('#expDate').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substr(0, 2) + '/' + value.substr(2, 2);
        }
        if (value.length > 5) value = value.substr(0, 5);
        $(this).val(value);
    });
    
    $('#cardCsv').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 4) value = value.substr(0, 4);
        $(this).val(value);
    });
    
    // Botón Pegar desde Portapapeles
    $('#pasteCardsBtn').on('click', async function() {
        console.log('📋 Botón pegar presionado');
        
        try {
            const clipboardText = await navigator.clipboard.readText();
            console.log('📄 Texto del portapapeles:', clipboardText.substring(0, 100) + '...');
            
            if (!clipboardText.trim()) {
                alert('El portapapeles está vacío');
                return;
            }
            
            const lines = clipboardText.split(/\r?\n|\r|\n/g).filter(line => line.trim());
            console.log('📝 Líneas encontradas:', lines.length);
            
            let addedCount = 0;
            let errorCount = 0;
            
            for (const line of lines) {
                const parts = line.split('|');
                console.log('🔍 Procesando línea:', parts);
                
                if (parts.length >= 4) {
                    const cardName = parts[0].trim();
                    const cardNumber = parts[1].trim();
                    const expDate = parts[2].trim();
                    const cardCsv = parts[3].trim();
                    
                    if (cardNumber.length >= 13 && expDate.match(/^\d{2}\/\d{2}$/)) {
                        try {
                            const expParts = expDate.split('/');
                            const cardData = {
                                cardName: cardName,
                                cardNumber: cardNumber,
                                expMonth: expParts[0],
                                expYear: expParts[1],
                                expDate: expDate,
                                cardCsv: cardCsv,
                                count: 0
                            };
                            
                            localStorage.setItem("card_" + cardNumber, JSON.stringify(cardData));
                            addedCount++;
                            console.log(`✅ Tarjeta ${addedCount} guardada: ${cardName}`);
                        } catch (error) {
                            errorCount++;
                            console.error('❌ Error guardando tarjeta:', error);
                        }
                    } else {
                        errorCount++;
                        console.log('❌ Formato inválido de tarjeta');
                    }
                } else {
                    errorCount++;
                    console.log('❌ Línea con formato incorrecto (necesita 4 partes separadas por |)');
                }
            }
            
            console.log(`📊 Resultado: ${addedCount} agregadas, ${errorCount} errores`);
            
            setTimeout(() => {
                reloadCardsRobust();
                alert(`✅ Proceso completado: ${addedCount} tarjetas agregadas, ${errorCount} errores`);
            }, 200);
            
        } catch (error) {
            console.error('❌ Error al acceder al portapapeles:', error);
            alert('Error al acceder al portapapeles: ' + error.message);
        }
    });
    
    // Botón Limpiar Todo
    $('#clearCardsBtn').on('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las tarjetas?')) {
            console.log('Eliminando todas las tarjetas...');
            try {
                const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('card_'));
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                console.log('Eliminadas', keysToRemove.length, 'tarjetas');
                
                reloadCardsRobust();
                alert('Todas las tarjetas han sido eliminadas');
            } catch (error) {
                console.error('Error al eliminar tarjetas:', error);
                alert('Error al eliminar tarjetas: ' + error);
            }
        }
    });
    
    // Función de diagnóstico completo
    function diagnosticCardSystem() {
        console.log('🔍 === DIAGNÓSTICO COMPLETO DEL SISTEMA ===');
        
        // 1. Verificar localStorage
        const cardKeys = Object.keys(localStorage).filter(key => key.startsWith('card_'));
        console.log('1️⃣ LocalStorage:');
        console.log('   - Tarjetas encontradas:', cardKeys.length);
        cardKeys.forEach(key => {
            const data = localStorage.getItem(key);
            console.log(`   - ${key}: ${data ? 'EXISTE' : 'NO EXISTE'}`);
        });
        
        // 2. Verificar funciones
        console.log('2️⃣ Funciones:');
        console.log('   - loadCards:', typeof loadCards);
        console.log('   - setLocalStorage:', typeof setLocalStorage);
        console.log('   - cardGrid:', typeof cardGrid);
        console.log('   - cardGrid.api:', (typeof cardGrid !== 'undefined' && cardGrid.api) ? 'EXISTE' : 'NO EXISTE');
        
        // 3. Verificar DOM
        console.log('3️⃣ Elementos DOM:');
        console.log('   - #cardModal:', $('#cardModal').length);
        console.log('   - #cards:', $('#cards').length);
        console.log('   - #cardCountButton:', $('#cardCountButton').length);
        console.log('   - #cardCount:', $('#cardCount').length);
        
        console.log('🔍 === FIN DEL DIAGNÓSTICO ===');
    }
    
    // Eventos del modal
    $('#cardModal').on('shown.bs.modal', function() {
        console.log('🎯 Modal de tarjetas abierto');
        diagnosticCardSystem();
        updateCardCounters();
        
        // Cargar tarjetas cuando se abra el modal
        setTimeout(() => {
            reloadCardsRobust();
        }, 300);
    });
    
    $('#cardModal').on('show.bs.modal', function() {
        console.log('📂 Modal de tarjetas mostrándose...');
        updateCardCounters();
    });
    
    // Función de prueba para agregar tarjeta desde consola
    window.addTestCard = function() {
        const testCard = {
            cardName: "Tarjeta de Prueba",
            cardNumber: "4111111111111111",
            expMonth: "12",
            expYear: "25",
            expDate: "12/25",
            cardCsv: "123",
            count: 0
        };
        
        console.log('🧪 Agregando tarjeta de prueba...');
        
        try {
            const cardKey = "card_" + testCard.cardNumber;
            localStorage.setItem(cardKey, JSON.stringify(testCard));
            
            // Verificar inmediatamente
            const verification = localStorage.getItem(cardKey);
            console.log('✅ Verificación de tarjeta de prueba:', verification ? 'ÉXITO' : 'FALLO');
            
            if (verification) {
                console.log('🎯 Datos de prueba verificados:', JSON.parse(verification));
                
                setTimeout(() => {
                    reloadCardsRobust();
                    console.log('✅ Tarjeta de prueba agregada y recargada');
                }, 200);
            } else {
                console.error('❌ La tarjeta de prueba no se guardó correctamente');
            }
        } catch (error) {
            console.error('❌ Error agregando tarjeta de prueba:', error);
        }
    };
    
    // Función para verificar estado desde consola
    window.debugCards = diagnosticCardSystem;
    
    // Función para forzar recarga desde consola
    window.reloadCards = reloadCardsRobust;
    
    // Actualizar contador al cargar la página
    setTimeout(updateCardCounters, 1000);
    
    // Interceptar la función loadCards después de que se cargue
    setTimeout(() => {
        if (typeof window.loadCards === 'function') {
            const originalLoadCards = window.loadCards;
            window.loadCards = function() {
                console.log('🔄 loadCards() interceptada y ejecutada');
                originalLoadCards();
                updateCardCounters();
            };
            console.log('✅ Función loadCards interceptada correctamente');
        } else {
            console.warn('⚠️ Función loadCards no encontrada para interceptar');
        }
    }, 2000);
}); 