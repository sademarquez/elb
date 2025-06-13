import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
}

// Renderiza únicamente la banda estática de logos de marcas
function renderBrands(brands) {
    const brandsContainer = document.getElementById('brands-container');
    if (brandsContainer && brands) {
        brandsContainer.innerHTML = brands.map(brand => `
            <img src="${brand.logoUrl}" alt="${brand.name}" class="brand-logo-static">
        `).join('');
    }
}

// Renderiza la cuadrícula de productos y sus filtros
function renderProductCatalog(products) {
    const filtersContainer = document.getElementById('catalog-filters');
    const gridContainer = document.getElementById('catalog-grid');
    if (!filtersContainer || !gridContainer) return;

    if (!products || products.length === 0) {
        gridContainer.innerHTML = `<p class="text-center col-span-full">No hay productos disponibles.</p>`;
        return;
    }
    
    const categories = [...new Set(products.map(p => p.category))];
    filtersContainer.innerHTML = `<button class="category-btn active" data-category="Todos">Todos</button>${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}`;
    
    const fragment = document.createDocumentFragment();
    products.forEach(product => fragment.appendChild(renderProductCard(product)));
    gridContainer.appendChild(fragment);

    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        document.querySelectorAll('#catalog-filters .category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedCategory = button.dataset.category;
        gridContainer.querySelectorAll('.product-card').forEach(card => {
            const product = appState.products.find(p => p.id === card.dataset.id);
            card.style.display = (selectedCategory === 'Todos' || product?.category === selectedCategory) ? 'flex' : 'none';
        });
    });
}

// Renderiza la sección de servicios
function renderServicesAndOpportunities(items) {
    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid && items.length > 0) {
        servicesGrid.innerHTML = items.map(item => renderProductCard(item).outerHTML).join('');
    }
}

// Función principal de inicialización
async function loadApp() {
    try {
        setupFloatingHeader();

        const [configResponse, productsResponse] = await Promise.all([fetch('/config.json'), fetch('/api/get-catalog')]);
        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();
        
        // Separar los productos de los servicios/oportunidades
        const mainProducts = appState.products.filter(p => p.category === '📱 Celulares' || p.category === '🎧 Accesorios');
        const serviceItems = appState.products.filter(p => p.category === '🛠️ Servicio Técnico' || p.category === '💰 Vende tu Celular');

        // Renderizar cada sección con su data correspondiente
        updateStaticUI();
        renderBrands(appState.config.brands);
        renderProductCatalog(mainProducts);
        renderServicesAndOpportunities(serviceItems);
        
        initCart(appState.products, appState.config.contactPhone);
        setupSearch();
        
        // Listeners
        document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
        // ... (resto de listeners sin cambios)
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
    }
}

function setupFloatingHeader() {
    const header = document.getElementById('mainHeader');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
        document.getElementById('headerLogo')?.classList.toggle('scrolled-logo', window.scrollY > 50);
    });
}

document.addEventListener('DOMContentLoaded', loadApp);

if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
}
