import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initParticles } from './particle-setup.js'; // Nueva importación

function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
}

function renderCategoryCarousels() {
    const filtersContainer = document.getElementById('category-filters');
    const gridContainer = document.getElementById('product-grid-container');
    if (!filtersContainer || !gridContainer) return;

    if (!appState.products || appState.products.length === 0) {
        gridContainer.innerHTML = `<p class="text-center col-span-full">No se encontraron productos.</p>`;
        return;
    }
    
    const categories = [...new Set(appState.products.map(p => p.category))];
    filtersContainer.innerHTML = `<button class="category-btn active" data-category="Todos">Todos</button>${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}`;
    
    const fragment = document.createDocumentFragment();
    appState.products.forEach(product => fragment.appendChild(renderProductCard(product)));
    gridContainer.appendChild(fragment);

    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn'); if (!button) return;
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedCategory = button.dataset.category;
        gridContainer.querySelectorAll('.product-card').forEach(card => {
            const product = appState.products.find(p => p.id === card.dataset.id);
            card.style.display = (selectedCategory === 'Todos' || product?.category === selectedCategory) ? 'flex' : 'none';
        });
    });
}

function setupFloatingHeader() {
    const header = document.getElementById('mainHeader');
    const logo = document.getElementById('headerLogo');
    if (!header || !logo) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 20);
        logo.classList.toggle('scrolled-logo', window.scrollY > 20);
    });
}

async function loadApp() {
    try {
        initParticles(); // Activa el fondo animado
        setupFloatingHeader(); 

        const [configResponse, productsResponse] = await Promise.all([fetch('/config.json'), fetch('/api/get-catalog')]);
        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();
        if (appState.products.error) throw new Error(appState.products.error);
        
        updateStaticUI();
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        // Listeners
        document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
        // ... (resto de listeners)
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
    }
}

document.addEventListener('DOMContentLoaded', loadApp);
if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
