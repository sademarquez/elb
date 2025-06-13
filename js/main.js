import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initParticles } from './particle-setup.js'; // <-- Nueva importación

function updateStaticUI() { /* ... sin cambios ... */ }
function renderCategoryCarousels() { /* ... sin cambios ... */ }

function setupFloatingHeader() {
    const header = document.getElementById('mainHeader');
    const logo = document.getElementById('headerLogo');
    if (!header || !logo) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        logo.classList.toggle('scrolled-logo', window.scrollY > 50);
    });
}

async function loadApp() {
    try {
        setupFloatingHeader(); 
        initParticles(); // <-- Llamada para activar el fondo animado
        
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();
        
        updateStaticUI();
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        if (appState.config.banners) initHeroCarousel(appState.config.banners);
        if (appState.config.brands) initBrandsCarousel(appState.config.brands);
        setupSearch();
        
        // ... (Listeners sin cambios)
    } catch (error) { /* ... */ }
}

document.addEventListener('DOMContentLoaded', loadApp);
if ('serviceWorker' in navigator) { /* ... */ }
