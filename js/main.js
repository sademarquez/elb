import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

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
        <div id="product-grid-container" class="product-grid"></div>
    `;

    const filtersContainer = document.getElementById('category-filters');
    const gridContainer = document.getElementById('product-grid-container');

    if (!appState.products || appState.products.length === 0) {
        gridContainer.innerHTML = `<p class="text-center p-4 col-span-full">No se encontraron productos.</p>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    appState.products.forEach(product => fragment.appendChild(renderProductCard(product)));
    gridContainer.appendChild(fragment);

    const categories = [...new Set(appState.products.map(p => p.category))];
    filtersContainer.innerHTML = `<button class="category-btn active" data-category="Todos">Todos</button>${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}`;

    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const selectedCategory = button.dataset.category;
        const allCards = gridContainer.querySelectorAll('.product-card');

        allCards.forEach(card => {
            const product = appState.products.find(p => p.id === card.dataset.id);
            if (!product) return;
            card.style.display = (selectedCategory === 'Todos' || product.category === selectedCategory) ? 'flex' : 'none';
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
        console.error('Error fatal en loadApp():', error);
        const catalogContainer = document.getElementById('category-section');
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4"><p>Error: ${error.message}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadApp);

if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
