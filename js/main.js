import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

function updateStaticUI() { /* ... sin cambios ... */ }

function renderSkeletonCards(count = 8) {
    const gridContainer = document.getElementById('product-grid-container');
    if (!gridContainer) return;
    let skeletonsHTML = '';
    for (let i = 0; i < count; i++) {
        skeletonsHTML += `
            <div class="product-card skeleton-card">
                <div class="card-image-wrapper skeleton"></div>
                <div class="card-content-wrapper">
                    <div class="skeleton skeleton-text" style="width: 80%;"></div>
                    <div class="skeleton skeleton-text" style="width: 40%; margin-top: 1rem;"></div>
                </div>
            </div>
        `;
    }
    gridContainer.innerHTML = skeletonsHTML;
}

function renderCategoryCarousels() {
    const catalogSection = document.getElementById('category-section');
    if (!catalogSection) return;

    catalogSection.innerHTML = `
        <h2 class="section-title">Catálogo</h2>
        <div id="category-filters" class="category-filters"></div>
        <div id="product-grid-container" class="product-grid"></div>
    `;

    renderSkeletonCards(); // Mostrar esqueletos mientras se cargan los datos

    const filtersContainer = document.getElementById('category-filters');
    const gridContainer = document.getElementById('product-grid-container');

    if (!appState.products || appState.products.length === 0) {
        gridContainer.innerHTML = `<p class="text-center p-4 col-span-full">No se encontraron productos.</p>`;
        return;
    }

    gridContainer.innerHTML = ''; // Limpiar esqueletos
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
            
            // Lógica de animación para el filtrado
            const matches = (selectedCategory === 'Todos' || product.category === selectedCategory);
            card.classList.toggle('hidden-by-filter', !matches);
        });
    });
}

async function loadApp() {
    // Renderizar la estructura y los esqueletos inmediatamente
    const catalogSection = document.getElementById('category-section');
    if (catalogSection) {
        catalogSection.innerHTML = `
            <h2 class="section-title">Catálogo</h2>
            <div id="category-filters" class="category-filters"></div>
            <div id="product-grid-container" class="product-grid"></div>
        `;
        renderSkeletonCards();
    }
    
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();
        if(appState.products.error) throw new Error(appState.products.error);
        
        updateStaticUI();
        renderCategoryCarousels(); // Ahora renderiza con los datos reales
        initCart(appState.products, appState.config.contactPhone);
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        // ... (listeners sin cambios)
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        if(catalogSection) catalogContainer.innerHTML = `<div class="error-card"><p>Error: ${error.message}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadApp);
if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')); }
