// Sistema de asignación de tarjetas a cuentas publicitarias

$(document).ready(function() {
    
    // Función para cargar tarjetas en el selector
    function loadCardsForAssignment() {
        const cardKeys = Object.keys(localStorage).filter(key => key.startsWith('card_'));
        const $select = $('#cardSelectForAssign');
        
        // Limpiar selector
        $select.html('<option value="">Seleccionar tarjeta...</option>');
        
        if (cardKeys.length === 0) {
            $select.append('<option value="" disabled>No hay tarjetas disponibles</option>');
            $('#cardCountButton2').text('0');
            return;
        }
        
        // Agregar tarjetas al selector
        cardKeys.forEach(key => {
            try {
                const cardData = JSON.parse(localStorage.getItem(key));
                const cardName = cardData.cardName || 'Sin nombre';
                const cardNumber = cardData.cardNumber || '';
                const lastFour = cardNumber.slice(-4);
                
                $select.append(`<option value="${cardNumber}">${cardName} (****${lastFour})</option>`);
            } catch (error) {
                // Error silencioso
            }
        });
        
        $('#cardCountButton2').text(cardKeys.length);
    }
    
    // Función para obtener cuentas seleccionadas
    function getSelectedAccounts() {
        if (typeof accountGrid === 'undefined' || !accountGrid.api) {
            return [];
        }
        
        const selectedRows = accountGrid.api.getSelectedRows();
        
        return selectedRows.map(row => ({
            id: row.id,
            adId: row.adId,
            account: row.account || 'Cuenta sin nombre'
        }));
    }
    
    // Esta función ya no se usa - reemplazada por executeCardAssignment
    // Se mantiene solo por compatibilidad en caso de uso manual en consola
    function assignCardToAccounts(cardNumber, accounts) {
        return window.executeCardAssignment(cardNumber, accounts);
    }
    
    // Función para quitar tarjetas asignadas
    function removeAssignedCards(accounts) {
        if (accounts.length === 0) {
            alert('Selecciona al menos una cuenta publicitaria en la tabla');
            return;
        }
        
        let successCount = 0;
        let errorCount = 0;
        
        accounts.forEach(account => {
            try {
                // Limpiar el campo payment en el grid
                const rowNode = accountGrid.api.getRowNode(account.id);
                if (rowNode) {
                    rowNode.setDataValue('payment', '');
                    
                    // Remover la asignación de localStorage
                    const assignmentKey = `assignment_${account.adId}`;
                    localStorage.removeItem(assignmentKey);
                    
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
            }
        });
        
        alert(`✅ Tarjetas removidas exitosamente de ${successCount} cuentas`);
    }
    
    // Función para detectar tipo de tarjeta
    function detectCardType(cardNumber) {
        const firstDigit = cardNumber.charAt(0);
        const firstTwo = cardNumber.substring(0, 2);
        
        if (firstDigit === '4') return 'VISA';
        if (firstTwo >= '51' && firstTwo <= '55') return 'MASTERCARD';
        if (['34', '37'].includes(firstTwo)) return 'AMERICANEXPRESS';
        if (['30', '36', '38'].includes(firstTwo)) return 'DINERSCLUB';
        if (firstTwo === '60' || firstTwo === '65') return 'DISCOVER';
        
        return 'VISA'; // Por defecto
    }
    
    // Función para obtener imagen de tarjeta
    function getCardImage(cardNumber) {
        const cardType = detectCardType(cardNumber);
        const imageMap = {
            'VISA': '../img/visa.svg',
            'MASTERCARD': '../img/mastercard.svg',
            'AMERICANEXPRESS': '../img/amex.svg',
            'DINERSCLUB': '../img/dinersclub.svg',
            'DISCOVER': '../img/discover.svg'
        };
        
        return imageMap[cardType] || '../img/credit.svg';
    }
    
    // Función para cargar asignaciones existentes al inicializar
    function loadExistingAssignments() {
        if (typeof accountGrid === 'undefined' || !accountGrid.api) {
            return;
        }
        
        const assignmentKeys = Object.keys(localStorage).filter(key => key.startsWith('assignment_'));
        
        assignmentKeys.forEach(key => {
            try {
                const adId = key.replace('assignment_', '');
                const assignment = JSON.parse(localStorage.getItem(key));
                
                // Buscar la fila correspondiente
                let targetRowNode = null;
                accountGrid.api.forEachNode(node => {
                    if (node.data.adId === adId) {
                        targetRowNode = node;
                    }
                });
                
                if (targetRowNode && assignment.cardNumber) {
                    const cardData = JSON.parse(localStorage.getItem(`card_${assignment.cardNumber}`));
                    if (cardData) {
                        const paymentData = [{
                            credential: {
                                __typename: "CreditCard",
                                card_association: detectCardType(assignment.cardNumber),
                                last_four_digits: assignment.cardNumber.slice(-4),
                                expiry_month: cardData.expMonth,
                                expiry_year: cardData.expYear
                            },
                            img: getCardImage(assignment.cardNumber),
                            is_primary: true,
                            usability: "USABLE"
                        }];
                        
                        targetRowNode.setDataValue('payment', JSON.stringify(paymentData));
                    }
                }
            } catch (error) {
                // Error silencioso
            }
        });
    }
    
    // Función principal para ejecutar desde el botón "Iniciar"
    window.executeCardAssignment = async function(cardNumber, selectedRows) {
        try {
            // Convertir selectedRows al formato esperado
            const accounts = selectedRows.map(row => ({
                id: row.id,
                adId: row.adId,
                account: row.account || 'Cuenta sin nombre'
            }));
            
            // Obtener datos de la tarjeta
            const cardData = JSON.parse(localStorage.getItem(`card_${cardNumber}`));
            if (!cardData) {
                return false;
            }
            
            // Crear objeto de pago simulando el formato de Facebook
            const paymentData = [{
                credential: {
                    __typename: "CreditCard",
                    card_association: detectCardType(cardNumber),
                    last_four_digits: cardNumber.slice(-4),
                    expiry_month: cardData.expMonth,
                    expiry_year: cardData.expYear
                },
                img: getCardImage(cardNumber),
                is_primary: true,
                usability: "USABLE"
            }];
            
            let successCount = 0;
            let errorCount = 0;
            
            // Asignar a cada cuenta
            for (const account of accounts) {
                try {
                    // Actualizar el campo payment en el grid
                    const rowNode = accountGrid.api.getRowNode(account.id);
                    if (rowNode) {
                        rowNode.setDataValue('payment', JSON.stringify(paymentData));
                        
                        // Guardar la asignación en localStorage
                        const assignmentKey = `assignment_${account.adId}`;
                        localStorage.setItem(assignmentKey, JSON.stringify({
                            cardNumber: cardNumber,
                            cardName: cardData.cardName,
                            assignedAt: new Date().toISOString()
                        }));
                        
                        successCount++;
                        
                        // Simular delay para visualización
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } else {
                        errorCount++;
                    }
                } catch (error) {
                    errorCount++;
                }
            }
            
            // Incrementar contador de uso de la tarjeta
            cardData.count = (cardData.count || 0) + successCount;
            localStorage.setItem(`card_${cardNumber}`, JSON.stringify(cardData));
            
            // Recargar grid de tarjetas si está abierto
            if (typeof loadCards === 'function') {
                loadCards();
            }
            
            return successCount > 0;
            
        } catch (error) {
            return false;
        }
    };
    
    // Event Listeners (mantener solo para funciones auxiliares)
    
    // Función auxiliar para quitar tarjetas (solo disponible manualmente en consola)
    window.removeAssignedCardsManual = function(accounts) {
        if (accounts.length > 0 && confirm(`¿Estás seguro de quitar las tarjetas de ${accounts.length} cuenta(s)?`)) {
            removeAssignedCards(accounts);
        }
    };
    
    // Función para limpiar TODAS las asignaciones de tarjetas
    window.clearAllCardAssignments = function() {
        if (confirm('¿Estás seguro de quitar TODAS las asignaciones de tarjetas? Esta acción no se puede deshacer.')) {
            try {
                // Obtener todas las asignaciones
                const assignmentKeys = Object.keys(localStorage).filter(key => key.startsWith('assignment_'));
                
                // Limpiar campo payment de todas las filas en el grid
                if (typeof accountGrid !== 'undefined' && accountGrid.api) {
                    accountGrid.api.forEachNode(node => {
                        node.setDataValue('payment', '');
                    });
                }
                
                // Eliminar todas las asignaciones de localStorage
                assignmentKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                alert(`Todas las asignaciones de tarjetas han sido eliminadas (${assignmentKeys.length} total)`);
                
            } catch (error) {
                alert('Error al limpiar asignaciones: ' + error.message);
            }
        }
    };
    
    // Cuando se abre la sección de asignación
    $('input[name="assignCards"]').on('change', function() {
        if ($(this).is(':checked')) {
            loadCardsForAssignment();
        }
    });
    
    // Cuando se abre el modal de tarjetas, actualizar también el segundo contador
    $('#cardModal').on('shown.bs.modal', function() {
        loadCardsForAssignment();
    });
    
    // Interceptar cuando se cargan datos en el accountGrid
    $(document).on('loadAdsSuccess', function() {
        setTimeout(() => {
            loadExistingAssignments();
        }, 1000);
    });
    
    $(document).on('loadSavedAds', function() {
        setTimeout(() => {
            loadExistingAssignments();
        }, 1000);
    });
    
    // Función global para cargar asignaciones (para debug)
    window.loadAssignments = loadExistingAssignments;
    window.loadCardsForAssignment = loadCardsForAssignment;
    
    // Auto-cargar cuando el DOM esté listo
    setTimeout(() => {
        loadCardsForAssignment();
        loadExistingAssignments();
    }, 2000);
}); 