import { appState } from './state.js';
import * as api from './api.js';
import * as cart from './cart.js';
import * as ui from './ui.js';

async function initializeApp() {
    try {
        ui.showLoader(true);
        const [config, products] = await Promise.all([
            api.fetchConfig(),
            api.fetchCatalog()
        ]);
        
        appState.config = config;
        appState.products = products;
        
        cart.initCart();
        
        document.title = appState.config.siteName || 'Tienda';
        document.getElementById('header-logo').alt = appState.config.siteName;
        
        ui.renderProducts(appState.products);
        ui.updateCartUI(cart.getCart(), appState.products);
        
    } catch (error) {
        console.error('Error fatal al inicializar la aplicación:', error);
        document.getElementById('app-main').innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
    } finally {
        ui.showLoader(false);
    }
}

// --- Delegación de Eventos ---
document.body.addEventListener('click', (e) => {
    const target = e.target;
    const actionTarget = target.closest('[data-action]');
    if (!actionTarget) return;

    const action = actionTarget.dataset.action;
    const itemCard = target.closest('[data-product-id]');
    const productId = itemCard?.dataset.productId;

    switch (action) {
        case 'toggle-cart':
            ui.toggleCart();
            break;
            
        case 'add-to-cart':
            if (!productId) return;
            cart.addToCart(productId);
            ui.updateCartUI(cart.getCart(), appState.products);
            ui.showAddedFeedback(productId);
            break;
            
        case 'increase-quantity':
            if (!productId) return;
            cart.updateQuantity(productId, 1);
            ui.updateCartUI(cart.getCart(), appState.products);
            break;
            
        case 'decrease-quantity':
            if (!productId) return;
            cart.updateQuantity(productId, -1);
            ui.updateCartUI(cart.getCart(), appState.products);
            break;
            
        case 'checkout-whatsapp':
            const url = cart.generateWhatsappMessage();
            if (url) {
                window.open(url, '_blank');
            }
            break;
    }
});

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.error('Service worker registration failed:', err));
    });
}

// Iniciar la aplicación
initializeApp();
