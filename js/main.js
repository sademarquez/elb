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
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
    if (contactBtn) contactBtn.href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!`;
}

function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    if (!carouselsContainer || !filtersContainer) return;
    carouselsContainer.innerHTML = ''; filtersContainer.innerHTML = '';
    if (!appState.products || appState.products.length === 0) {
        carouselsContainer.innerHTML = `<p class="text-center text-amber-400 bg-gray-800 p-4 rounded-lg">No hay productos en el catálogo.</p>`;
        return;
    }
    const categories = [...new Set(appState.products.map(p => p.category))];
    filtersContainer.innerHTML = `<button class="category-btn active" data-category="Todos">Todos</button>${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}`;
    carouselsContainer.innerHTML = categories.map(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');
        return `<section class="product-carousel-section mt-8"><h3 class="text-2xl font-bold mb-4">${category}</h3><div class="category-products-carousel">${productCardsHTML}</div></section>`;
    }).join('');
    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn'); if (!button) return;
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
}

async function loadApp() {
    const catalogContainer = document.getElementById('category-section');
    console.log('%c--- Iniciando loadApp ---', 'color: cyan; font-weight: bold;');
    
    try {
        if(catalogContainer) catalogContainer.innerHTML = '<p class="text-center text-gray-400">Cargando datos...</p>';
        
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog') 
        ]);

        if (!configResponse.ok) throw new Error('Error crítico: No se pudo cargar el archivo config.json.');
        appState.config = await configResponse.json();
        console.log('Configuración cargada:', appState.config);

        if (!productsResponse.ok) throw new Error('No se pudo cargar el catálogo desde la API.');
        
        const productsData = await productsResponse.json();
        if(productsData.error) throw new Error(`Error de la API: ${productsData.error}`);
        
        appState.products = productsData;
        console.log('Productos cargados. Cantidad:', appState.products.length);
        
        console.log('Renderizando UI...');
        updateStaticUI();
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners && appState.config.banners.length > 0) initHeroCarousel(appState.config.banners);
        if (appState.config.brands && appState.config.brands.length > 0) initBrandsCarousel(appState.config.brands);
        
        setupSearch();
        
        document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openSearchNavBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openCartNavBtn')?.addEventListener('click', () => toggleCartSidebar(true));
        document.querySelector('main').addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const productCard = e.target.closest('.product-card');
                if (productCard) addToCart(productCard.dataset.id);
            }
        });

        if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg"><p class="font-bold">Error al cargar la aplicación</p><p>${error.message}</p></div>`;
    }
}

function init() { initAgeVerification(loadApp); }
document.addEventListener('DOMContentLoaded', init);
