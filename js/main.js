import { initCart, addToCart, toggleCartSidebar } from './cart.js';
// Ya no necesitamos los carruseles aquí, así que los quitamos para limpiar.
// import { initBrandsCarousel } from './carousels.js'; 
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

function updateStaticUI() { /* ... sin cambios ... */ }

// --- NUEVA LÓGICA DE RENDERIZADO SEPARADO ---
function renderContent() {
    const products = appState.products;

    // 1. Renderizar la banda de marcas estática
    const brandsContainer = document.getElementById('brands-container');
    if (brandsContainer && appState.config.brands) {
        brandsContainer.innerHTML = appState.config.brands.map(brand => `
            <img src="${brand.logoUrl}" alt="${brand.name}" class="brand-logo-static">
        `).join('');
    }

    // 2. Separar productos de servicios/oportunidades
    const mainProducts = products.filter(p => p.category === '📱 Celulares' || p.category === '🎧 Accesorios');
    const serviceItems = products.filter(p => p.category === '🛠️ Servicio Técnico');
    const sellItems = products.filter(p => p.category === '💰 Vende tu Celular');

    // 3. Renderizar el catálogo principal
    renderProductCatalog(mainProducts);
    
    // 4. Renderizar la nueva sección de servicios
    renderServices(serviceItems, sellItems);
}

function renderProductCatalog(productsToRender) {
    const filtersContainer = document.getElementById('category-filters');
    const gridContainer = document.getElementById('product-grid-container');

    if (!filtersContainer || !gridContainer) return;

    if (!productsToRender || productsToRender.length === 0) {
        gridContainer.innerHTML = `<p class="text-center col-span-full">No hay productos disponibles.</p>`;
        return;
    }
    
    const categories = [...new Set(productsToRender.map(p => p.category))];
    filtersContainer.innerHTML = `<button class="category-btn active" data-category="Todos">Todos</button>${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}`;
    
    const fragment = document.createDocumentFragment();
    productsToRender.forEach(product => fragment.appendChild(renderProductCard(product)));
    gridContainer.appendChild(fragment);

    // Lógica de filtros (sin cambios)
    filtersContainer.addEventListener('click', (e) => { /* ... */ });
}

function renderServices(serviceItems, sellItems) {
    const serviceContainer = document.getElementById('service-card-container');
    const sellContainer = document.getElementById('sell-card-container');
    
    if (serviceContainer && serviceItems.length > 0) {
        serviceContainer.innerHTML = serviceItems.map(item => renderProductCard(item).outerHTML).join('');
    }
    if (sellContainer && sellItems.length > 0) {
        sellContainer.innerHTML = sellItems.map(item => renderProductCard(item).outerHTML).join('');
    }
}


async function loadApp() {
    try {
        setupFloatingHeader(); // Mantener el header flotante

        const [configResponse, productsResponse] = await Promise.all([ fetch('/config.json'), fetch('/api/get-catalog') ]);
        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();
        
        updateStaticUI();
        renderContent(); // <-- ÚNICA LLAMADA DE RENDERIZADO
        initCart(appState.products, appState.config.contactPhone);
        setupSearch();
        
        // ... listeners ...
    } catch (error) { /* ... */ }
}

function setupFloatingHeader() { /* ... sin cambios ... */ }
document.addEventListener('DOMContentLoaded', loadApp);
if ('serviceWorker' in navigator) { /* ... */ }
