import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js';

// --- DEFINICIÓN ÚNICA DE FUNCIONES AUXILIARES ---
function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    const contactBtn = document.getElementById('contact-whatsapp-btn');
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
    if (contactBtn) contactBtn.href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!`;
}

function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    const catalogSection = document.getElementById('category-section');

    if (!carouselsContainer || !filtersContainer || !catalogSection) return;
    catalogSection.innerHTML = `
        <h2 class="text-3xl font-bold mb-4">Catálogo</h2>
        <div id="category-filters" class="flex gap-4 overflow-x-auto pb-4 mb-4"></div>
        <div id="category-carousels"></div>
    `;

    const newCarouselsContainer = document.getElementById('category-carousels');
    if (!appState.products || appState.products.length === 0) {
        newCarouselsContainer.innerHTML = `<p class="text-center text-amber-400 p-4">No se encontraron productos.</p>`;
        return;
    }
    
    const categories = [...new Set(appState.products.map(p => p.category))];
    let allCarouselsHTML = '';
    categories.forEach(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');
        allCarouselsHTML += `
            <section class="product-carousel-section mt-8" style="border:0;"> <!-- Borde rojo eliminado -->
                <h3 class="text-2xl font-bold mb-4">${category}</h3>
                <div class="category-products-carousel">${productCardsHTML}</div>
            </section>
        `;
    });
    newCarouselsContainer.innerHTML = allCarouselsHTML;
}
// --- FIN DE DEFINICIONES ---


async function loadApp() {
    console.log('--- Iniciando loadApp ---');
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();
        console.log('Datos cargados. Productos:', appState.products.length);

        console.log('Renderizando UI...');
        updateStaticUI();
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
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

    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        const catalogContainer = document.getElementById('category-section');
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg"><p class="font-bold">Error</p><p>${error.message}</p></div>`;
    }
}

function init() {
    // Hemos eliminado la verificación de edad temporalmente para asegurar que todo cargue.
    // Una vez que funcione, podemos reintroducirla.
    loadApp();
}
document.addEventListener('DOMContentLoaded', init);

// Quitamos la inicialización del SW temporalmente para no tener problemas de caché mientras depuramos
// if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }
