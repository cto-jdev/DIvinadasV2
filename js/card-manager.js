// Funciones para agregar tarjetas con sistema robusto

$(document).ready(function() {
    
    // Función para actualizar contadores
    function updateCardCounters() {
        const allKeys = Object.keys(localStorage);
        const cardKeys = allKeys.filter(key => key.startsWith('card_'));
        const cardCount = cardKeys.length;
        
        $('#cardCountButton').text(cardCount);
        $('#cardCount').text(cardCount);
    }
    
    // Función robusta para recargar tarjetas
    function reloadCardsRobust() {
        // Primero, verificar qué hay en localStorage
        const allKeys = Object.keys(localStorage);
        const cardKeys = allKeys.filter(key => key.startsWith('card_'));
        
        // Método 1: Usar función original si existe
        if (typeof loadCards === 'function') {
            try {
                loadCards();
            } catch (error) {
                // Error silencioso
            }
        }
        
        // Método 2: Recargar manualmente como respaldo
        setTimeout(() => {
            try {
                let cardId = 1;
                const cards = [];
                
                cardKeys.forEach(key => {
                    try {
                        const cardDataString = localStorage.getItem(key);
                        
                        if (cardDataString) {
                            const cardData = JSON.parse(cardDataString);
                            cards.push({
                                id: cardId++,
                                ...cardData
                            });
                        }
                    } catch (error) {
                        // Error silencioso
                    }
                });
                
                // Si hay acceso al grid, actualizar
                if (window.cardGrid && window.cardGrid.api) {
                    window.cardGrid.api.setRowData(cards);
                }
                
                updateCardCounters();
                
            } catch (error) {
                // Error silencioso
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
        
        try {
            const cardKey = "card_" + cardNumber;
            const cardDataJson = JSON.stringify(cardData);
            
            // Guardar directamente en localStorage
            localStorage.setItem(cardKey, cardDataJson);
            
            // Verificar inmediatamente
            const verification = localStorage.getItem(cardKey);
            
            if (verification) {
                // Limpiar formulario
                $('#addCardForm').addClass('d-none');
                $('#cardName, #cardNumber, #expDate, #cardCsv').val('');
                
                // Recargar tarjetas
                setTimeout(() => reloadCardsRobust(), 300);
                
                // Actualizar selector de asignación si existe
                if (typeof window.loadCardsForAssignment === 'function') {
                    setTimeout(() => window.loadCardsForAssignment(), 400);
                }
                
                alert('✅ Tarjeta agregada correctamente');
            } else {
                throw new Error('La tarjeta no se guardó correctamente en localStorage');
            }
            
        } catch (error) {
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
        try {
            const clipboardText = await navigator.clipboard.readText();
            
            if (!clipboardText.trim()) {
                alert('El portapapeles está vacío');
                return;
            }
            
            const lines = clipboardText.split(/\r?\n|\r|\n/g).filter(line => line.trim());
            
            let addedCount = 0;
            let errorCount = 0;
            
            for (const line of lines) {
                const parts = line.split('|');
                
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
                        } catch (error) {
                            errorCount++;
                        }
                    } else {
                        errorCount++;
                    }
                } else {
                    errorCount++;
                }
            }
            
            setTimeout(() => {
                reloadCardsRobust();
                
                // Actualizar selector de asignación si existe
                if (typeof window.loadCardsForAssignment === 'function') {
                    setTimeout(() => window.loadCardsForAssignment(), 300);
                }
                
                alert(`✅ Proceso completado: ${addedCount} tarjetas agregadas, ${errorCount} errores`);
            }, 200);
            
        } catch (error) {
            alert('Error al acceder al portapapeles: ' + error.message);
        }
    });
    
    // Botón Limpiar Todo
    $('#clearCardsBtn').on('click', function() {
        if (confirm('¿Estás seguro de que quieres eliminar TODAS las tarjetas?')) {
            try {
                const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('card_'));
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                reloadCardsRobust();
                
                // Actualizar selector de asignación si existe
                if (typeof window.loadCardsForAssignment === 'function') {
                    setTimeout(() => window.loadCardsForAssignment(), 300);
                }
                
                alert('Todas las tarjetas han sido eliminadas');
            } catch (error) {
                alert('Error al eliminar tarjetas: ' + error);
            }
        }
    });
    
    // Función de diagnóstico completo
    function diagnosticCardSystem() {
        // Función de diagnóstico disponible para debug en consola
        const cardKeys = Object.keys(localStorage).filter(key => key.startsWith('card_'));
        return {
            cardKeys: cardKeys,
            cardCount: cardKeys.length,
            loadCardsAvailable: typeof loadCards !== 'undefined',
            cardGridAvailable: typeof cardGrid !== 'undefined' && cardGrid.api
        };
    }
    
    // Eventos del modal
    $('#cardModal').on('shown.bs.modal', function() {
        updateCardCounters();
        
        // Cargar tarjetas cuando se abra el modal
        setTimeout(() => {
            reloadCardsRobust();
        }, 300);
    });
    
    $('#cardModal').on('show.bs.modal', function() {
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
        
        try {
            const cardKey = "card_" + testCard.cardNumber;
            localStorage.setItem(cardKey, JSON.stringify(testCard));
            
            // Verificar inmediatamente
            const verification = localStorage.getItem(cardKey);
            
            if (verification) {
                setTimeout(() => {
                    reloadCardsRobust();
                }, 200);
            }
        } catch (error) {
            // Error silencioso
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
                originalLoadCards();
                updateCardCounters();
            };
        }
    }, 2000);
}); 