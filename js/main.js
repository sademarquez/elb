import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js';

function updateStaticUI() { /* ... sin cambios ... */ }

// --- FUNCIÓN DE RENDERIZADO SIMPLIFICADA ---
function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    const catalogSection = document.getElementById('category-section');

    if (!carouselsContainer || !filtersContainer || !catalogSection) return;

    // Limpia el contenido previo
    catalogSection.innerHTML = `
        <h2 class="text-3xl font-bold mb-4">Catálogo</h2>
        <div id="category-filters" class="flex gap-4 overflow-x-auto pb-4 mb-4"></div>
        <div id="category-carousels"></div>
    `;

    // Re-seleccionamos los contenedores porque los acabamos de re-crear
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
        
        // Simplemente generamos el HTML para cada sección de categoría
        allCarouselsHTML += `
            <section class="product-carousel-section mt-8">
                <h3 class="text-2xl font-bold mb-4">${category}</h3>
                <div class="category-products-carousel">${productCardsHTML}</div>
            </section>
        `;
    });

    // Insertamos todo el HTML de los carruseles de una sola vez
    newCarouselsContainer.innerHTML = allCarouselsHTML;
    
    // OJO: Por ahora, NO AÑADIMOS los filtros ni sus listeners.
}


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
        renderCategoryCarousels(); // Llama a la nueva función simplificada
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        // ... listeners sin cambios ...
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        const catalogContainer = document.getElementById('category-section');
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg"><p class="font-bold">Error</p><p>${error.message}</p></div>`;
    }
}

function init() { initAgeVerification(loadApp); }
document.addEventListener('DOMContentLoaded', init);

// ...
function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    const contactBtn = document.getElementById('contact-whatsapp-btn');
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
    if (contactBtn) contactBtn.href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!`;
}
