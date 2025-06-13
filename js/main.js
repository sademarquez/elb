import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js';

function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    const contactBtn = document.getElementById('contact-whatsapp-btn');

    console.log('Verificando elementos UI:', { siteTitle, headerLogo, contactBtn });

    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
    if (contactBtn) contactBtn.href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20o%20quiero%20hacer%20un%20pedido.`;
}

function renderCategoryCarousels() { /* ... (sin cambios) ... */ }

async function loadApp() {
    const catalogContainer = document.getElementById('category-section');
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        if (configResponse.ok) appState.config = await configResponse.json();
        if (productsResponse.ok) appState.products = await productsResponse.json();
        else { throw new Error('No se pudieron cargar los productos'); }

        updateStaticUI();

        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        initHeroCarousel(appState.config.banners);
        initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openSearchNavBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openCartNavBtn')?.addEventListener('click', () => toggleCartSidebar(true));
        document.querySelector('main').addEventListener('click', (e) => {
            const addToCartButton = e.target.closest('.add-to-cart-btn');
            if (addToCartButton) {
                const productCard = addToCartButton.closest('.product-card');
                if (productCard) addToCart(productCard.dataset.id);
            }
        });

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
        }
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg"><p class="font-bold">Error</p><p>${error.message}</p></div>`;
    }
}

function init() {
    initAgeVerification(loadApp); 
}
document.addEventListener('DOMContentLoaded', init);
