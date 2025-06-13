import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js';

// --- FUNCIONES AUXILIARES (DEFINICIÓN ÚNICA Y CORRECTA) ---
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

    // Limpia cualquier mensaje de "cargando..." del contenedor principal
    const loadingMessage = catalogSection.querySelector('p');
    if (loadingMessage) loadingMessage.remove();

    if (!appState.products || appState.products.length === 0) {
        carouselsContainer.innerHTML = `<p class="text-center text-amber-400 p-4">No hay productos en el catálogo.</p>`;
        return;
    }
    
    const categories = [...new Set(appState.products.map(p => p.category))];
    
    // Genera el HTML para los botones de filtro y lo inserta
    filtersContainer.innerHTML = `
        <button class="category-btn active" data-category="Todos">Todos</button>
        ${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}
    `;
    
    // Genera el HTML para los carruseles de productos y lo inserta
    carouselsContainer.innerHTML = categories.map(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');
        const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        return `
            <section id="category-${categoryId}" class="product-carousel-section mt-8">
                <h3 class="text-2xl font-bold mb-4">${category}</h3>
                <div class="category-products-carousel">${productCardsHTML}</div>
            </section>
        `;
    }).join('');
    
    // Añade el listener para la funcionalidad de los filtros
    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;

        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = button.dataset.category;
        document.querySelectorAll('.product-carousel-section').forEach(section => {
            if (selectedCategory === 'Todos') {
                section.style.display = 'block';
            } else {
                const categoryId = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-');
                section.style.display = section.id === `category-${categoryId}` ? 'block' : 'none';
            }
        });
    });
}

// --- LÓGICA DE INICIALIZACIÓN ---
async function loadApp() {
    const catalogSection = document.getElementById('category-section');
    try {
        if(catalogSection) catalogSection.innerHTML = `<p class="text-center p-8">Cargando catálogo...</p>`;

        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        if (!configResponse.ok) throw new Error('No se pudo cargar config.json.');
        appState.config = await configResponse.json();

        if (!productsResponse.ok) throw new Error('No se pudo cargar el catálogo.');
        const productsData = await productsResponse.json();
        if(productsData.error) throw new Error(productsData.error);
        appState.products = productsData;
        
        updateStaticUI();
        renderCategoryCarousels(); // La función clave que ahora está corregida
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        // Listeners
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
        if(catalogSection) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4"><p>${error.message}</p></div>`;
    }
}

function init() {
    initAgeVerification(loadApp); 
}
document.addEventListener('DOMContentLoaded', init);

// Restauramos el Service Worker
if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
