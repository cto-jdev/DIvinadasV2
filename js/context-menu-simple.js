/**
 * Simple ContextMenu implementation
 * Replacement for missing context menu library
 */
class ContextMenu {
    constructor(element, items) {
        this.element = element;
        this.items = items;
        this.menu = null;
        this.isInstalled = false;
    }

    install() {
        if (this.isInstalled) return;
        
        this.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.show(e.clientX, e.clientY);
        });
        
        // Hide menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (this.menu && !this.menu.contains(e.target)) {
                this.hide();
            }
        });
        
        this.isInstalled = true;
    }

    show(x, y) {
        this.hide(); // Hide existing menu first
        
        this.menu = document.createElement('div');
        this.menu.className = 'context-menu-simple';
        this.menu.style.cssText = `
            position: fixed;
            top: ${y}px;
            left: ${x}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            min-width: 120px;
            padding: 4px 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
        `;

        this.items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.style.cssText = `
                padding: 8px 16px;
                cursor: pointer;
                transition: background-color 0.2s;
            `;
            
            menuItem.addEventListener('mouseenter', () => {
                menuItem.style.backgroundColor = '#f0f0f0';
            });
            
            menuItem.addEventListener('mouseleave', () => {
                menuItem.style.backgroundColor = 'transparent';
            });
            
            menuItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.hide();
                if (item.onclick) {
                    item.onclick(e);
                }
            });
            
            this.menu.appendChild(menuItem);
        });

        // Adjust position if menu would go off screen
        const rect = this.menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Position the menu temporarily to get its dimensions
        this.menu.style.visibility = 'hidden';
        document.body.appendChild(this.menu);
        
        const menuRect = this.menu.getBoundingClientRect();
        
        // Adjust horizontal position
        if (x + menuRect.width > viewportWidth) {
            x = Math.max(10, viewportWidth - menuRect.width - 10);
        }
        
        // Adjust vertical position
        if (y + menuRect.height > viewportHeight) {
            y = Math.max(10, viewportHeight - menuRect.height - 10);
        }
        
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        this.menu.style.visibility = 'visible';
    }

    hide() {
        if (this.menu) {
            this.menu.remove();
            this.menu = null;
        }
    }

    uninstall() {
        this.hide();
        this.isInstalled = false;
        // Remove event listeners would need more complex implementation
        // For this simple version, we'll just mark as uninstalled
    }
}

// Make it globally available
window.ContextMenu = ContextMenu; 