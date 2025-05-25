/**
 * Card Manager - Enhanced functionality for card management
 */

$(document).ready(function() {
    // Update card count in button when cards are loaded
    $(document).on('cardCountUpdated', function(event, count) {
        $('#cardCountButton').text(count);
    });
    
    // Add Card Button
    $('#addCardBtn').on('click', function() {
        $('#addCardForm').removeClass('d-none');
        $('#cardName').focus();
    });
    
    // Cancel Add Card
    $('#cancelCardBtn').on('click', function() {
        $('#addCardForm').addClass('d-none');
        clearCardForm();
    });
    
    // Save Card Button
    $('#saveCardBtn').on('click', function() {
        saveManualCard();
    });
    
    // Paste Cards Button
    $('#pasteCardsBtn').on('click', function() {
        pasteCardsFromClipboard();
    });
    
    // Clear Cards Button
    $('#clearCardsBtn').on('click', function() {
        clearAllCards();
    });
    
    // Format card number input
    $('#cardNumber').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 16) {
            value = value.substr(0, 16);
        }
        $(this).val(value);
    });
    
    // Format expiration date
    $('#expDate').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substr(0, 2) + '/' + value.substr(2, 2);
        }
        if (value.length > 5) {
            value = value.substr(0, 5);
        }
        $(this).val(value);
    });
    
    // Format CCV
    $('#cardCsv').on('input', function() {
        let value = $(this).val().replace(/\D/g, '');
        if (value.length > 4) {
            value = value.substr(0, 4);
        }
        $(this).val(value);
    });
    
    // Enter key handling in form
    $('#addCardForm input').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            saveManualCard();
        }
    });
    
    // Escape key to cancel
    $('#addCardForm').on('keyup', function(e) {
        if (e.which === 27) { // Escape key
            $('#cancelCardBtn').click();
        }
    });
});

/**
 * Save manually entered card
 */
async function saveManualCard() {
    const cardName = $('#cardName').val().trim();
    const cardNumber = $('#cardNumber').val().trim();
    const expDate = $('#expDate').val().trim();
    const cardCsv = $('#cardCsv').val().trim();
    
    // Validation
    if (!cardName) {
        showAlert('Por favor ingresa el nombre en la tarjeta', 'warning');
        $('#cardName').focus();
        return;
    }
    
    if (!cardNumber || cardNumber.length < 13) {
        showAlert('Por favor ingresa un número de tarjeta válido (mínimo 13 dígitos)', 'warning');
        $('#cardNumber').focus();
        return;
    }
    
    if (!expDate || !expDate.match(/^\d{2}\/\d{2}$/)) {
        showAlert('Por favor ingresa una fecha de vencimiento válida (MM/YY)', 'warning');
        $('#expDate').focus();
        return;
    }
    
    if (!cardCsv || cardCsv.length < 3) {
        showAlert('Por favor ingresa un CCV válido (mínimo 3 dígitos)', 'warning');
        $('#cardCsv').focus();
        return;
    }
    
    // Check if card already exists
    const existingCard = await getLocalStorage("card_" + cardNumber);
    if (existingCard) {
        showAlert('Esta tarjeta ya existe en la lista', 'warning');
        return;
    }
    
    try {
        // Save card
        const expParts = expDate.split('/');
        await setLocalStorage("card_" + cardNumber, {
            cardName: cardName,
            cardNumber: cardNumber,
            expMonth: expParts[0],
            expYear: expParts[1],
            expDate: expDate,
            cardCsv: cardCsv,
            count: 0
        });
        
        // Clear form and hide it
        clearCardForm();
        $('#addCardForm').addClass('d-none');
        
        // Reload cards in grid
        if (typeof loadCards === 'function') {
            loadCards();
        }
        
        showAlert('Tarjeta agregada correctamente', 'success');
        
    } catch (error) {
        console.error('Error saving card:', error);
        showAlert('Error al guardar la tarjeta', 'error');
    }
}

/**
 * Clear the card form
 */
function clearCardForm() {
    $('#cardName').val('');
    $('#cardNumber').val('');
    $('#expDate').val('');
    $('#cardCsv').val('');
}

/**
 * Paste cards from clipboard with enhanced parsing
 */
async function pasteCardsFromClipboard() {
    try {
        const clipboardText = await navigator.clipboard.readText();
        if (!clipboardText.trim()) {
            showAlert('El portapapeles está vacío', 'warning');
            return;
        }
        
        const lines = clipboardText.split(/\r?\n|\r|\n/g).filter(line => line.trim());
        let addedCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;
        
        for (const line of lines) {
            const parts = line.split('|');
            
            if (parts.length >= 4) {
                const cardName = parts[0].trim();
                const cardNumber = parts[1].trim();
                const expDate = parts[2].trim();
                const cardCsv = parts[3].trim();
                
                // Validate card data
                if (cardNumber.length >= 13 && expDate.match(/^\d{2}\/\d{2}$/)) {
                    // Check if card already exists
                    const existingCard = await getLocalStorage("card_" + cardNumber);
                    if (existingCard) {
                        duplicateCount++;
                        continue;
                    }
                    
                    try {
                        const expParts = expDate.split('/');
                        await setLocalStorage("card_" + cardNumber, {
                            cardName: cardName,
                            cardNumber: cardNumber,
                            expMonth: expParts[0],
                            expYear: expParts[1],
                            expDate: expDate,
                            cardCsv: cardCsv,
                            count: 0
                        });
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
        
        // Reload cards in grid
        if (typeof loadCards === 'function') {
            loadCards();
        }
        
        // Show results
        let message = `Proceso completado:\n`;
        if (addedCount > 0) message += `✓ ${addedCount} tarjetas agregadas\n`;
        if (duplicateCount > 0) message += `⚠ ${duplicateCount} tarjetas duplicadas ignoradas\n`;
        if (errorCount > 0) message += `✗ ${errorCount} líneas con errores ignoradas\n`;
        
        showAlert(message, addedCount > 0 ? 'success' : 'warning');
        
    } catch (error) {
        console.error('Error accessing clipboard:', error);
        showAlert('Error al acceder al portapapeles. Asegúrate de haber copiado el texto con el formato correcto.', 'error');
    }
}

/**
 * Clear all cards with confirmation
 */
function clearAllCards() {
    if (confirm('¿Estás seguro de que quieres eliminar TODAS las tarjetas? Esta acción no se puede deshacer.')) {
        try {
            // Get all localStorage keys for cards
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('card_')) {
                    keysToRemove.push(key);
                }
            }
            
            // Remove all card keys
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Reload cards in grid
            if (typeof loadCards === 'function') {
                loadCards();
            }
            
            showAlert(`Se eliminaron ${keysToRemove.length} tarjetas`, 'success');
            
        } catch (error) {
            console.error('Error clearing cards:', error);
            showAlert('Error al eliminar las tarjetas', 'error');
        }
    }
}

/**
 * Show alert message with different types
 */
function showAlert(message, type = 'info') {
    // Use SweetAlert2 if available, otherwise use basic alert
    if (typeof Swal !== 'undefined') {
        const icon = type === 'success' ? 'success' : 
                    type === 'warning' ? 'warning' : 
                    type === 'error' ? 'error' : 'info';
        
        Swal.fire({
            text: message,
            icon: icon,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    } else {
        alert(message);
    }
}

/**
 * Enhanced loadCards function override to update button count
 */
if (typeof loadCards === 'function') {
    const originalLoadCards = loadCards;
    window.loadCards = function() {
        originalLoadCards();
        
        // Count cards and update button
        const cardCount = Object.keys(localStorage).filter(key => key.startsWith('card_')).length;
        $('#cardCountButton').text(cardCount);
        $(document).trigger('cardCountUpdated', [cardCount]);
    };
} 