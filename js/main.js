import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initWelcomeModal } from './welcome-modal.js';

function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    const contactBtn = document.getElementById('contact-whatsapp-btn');
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
    if (contactBtn) contactBtn.href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!`;
}

function renderCategoryCarousels() {
    const catalogSection = document.getElementById('category-section');
    if (!catalogSection) return;

    catalogSection.innerHTML = `
        <h2 class="text-3xl font-bold mb-4">Catálogo</h2>
        <div id="category-filters" class="flex gap-3 justify-center items-center flex-wrap mb-4"></div>
        <div id="category-carousels"></div>
    `;

    const filtersContainer = document.getElementById('category-filters');
    const carouselsContainer = document.getElementById('category-carousels');

    if (!appState.products || appState.products.length === 0) {
        carouselsContainer.innerHTML = `<p class="text-center text-amber-400 p-4">No se encontraron productos.</p>`;
        return;
    }
    
    const categories = [...new Set(appState.products.map(p => p.category))];
    let filtersHTML = `<button class="category-btn active" data-category="Todos">Todos</button>`;
    categories.forEach(cat => {
        const emoji = cat.split(' ')[0];
        filtersHTML += `<button class="category-btn" data-category="${cat}" title="${cat}">${emoji}</button>`;
    });
    filtersContainer.innerHTML = filtersHTML;
    
    let allCarouselsHTML = '';
    categories.forEach(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');
        const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
        allCarouselsHTML += `<section id="category-${categoryId}" class="product-carousel-section mt-8"><h3 class="text-2xl font-bold mb-2 flex items-center gap-3">${category}</h3><div class="category-products-carousel">${productCardsHTML}</div></section>`;
    });
    carouselsContainer.innerHTML = allCarouselsHTML;
    
    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn'); if (!button) return;
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedCategory = button.dataset.category;
        document.querySelectorAll('.product-carousel-section').forEach(section => {
            const categoryId = selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-');
            section.style.display = (selectedCategory === 'Todos' || section.id === `category-${categoryId}`) ? 'block' : 'none';
        });
    });
}

async function loadApp() {
    try {
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
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        // Setup all event listeners in one go
        document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openSearchNavBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openCartNavBtn')?.addEventListener('click', () => toggleCartSidebar(true));
        document.querySelector('main')?.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                const productCard = e.target.closest('.product-card');
                if (productCard) addToCart(productCard.dataset.id);
            }
        });

    } catch (error) {
        const catalogContainer = document.getElementById('category-section');
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4"><p>${error.message}</p></div>`;
    }
}

// --- PUNTO DE ENTRADA PRINCIPAL ---
function main() {
    // 1. Inicializa el modal de bienvenida y le pasa la función que debe ejecutar al continuar.
    initWelcomeModal(loadApp);
    
    // 2. Registra el Service Worker una vez que toda la ventana ha cargado.
    if ('serviceWorker' in navigator) { 
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registrado con éxito.', reg))
                .catch(err => console.error('Fallo al registrar el Service Worker:', err));
        });
    }
}

// Escucha el evento que indica que el HTML ha sido completamente cargado y parseado,
// luego ejecuta la función principal.
document.addEventListener('DOMContentLoaded', main);
