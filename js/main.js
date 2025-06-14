import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

function updateStaticUI() {
    const config = appState.config;
    document.title = config.siteName || 'Comunicaciones Luna';
    document.getElementById('siteTitle').textContent = config.siteName;
    
    const whatsappBtn = document.getElementById('contact-whatsapp-btn');
    if (whatsappBtn && config.contactPhone) {
        const message = encodeURIComponent(`¡Hola ${config.siteName}! Quisiera más información.`);
        whatsappBtn.href = `https://wa.me/${config.contactPhone}?text=${message}`;
    }
}

function renderSkeletonCards(count = 8) {
    const gridContainer = document.getElementById('product-grid-container');
    if (!gridContainer) return;
    gridContainer.innerHTML = Array(count).fill('').map(() => `
        <div class="product-card skeleton-card">
            <div class="card-image-wrapper skeleton"></div>
            <div class="card-content-wrapper">
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 40%; margin-top: 1rem;"></div>
            </div>
        </div>
    `).join('');
}

function renderCatalog() {
    const catalogSection = document.getElementById('category-section');
    const gridContainer = document.getElementById('product-grid-container');
    const filtersContainer = document.getElementById('category-filters');

    if (!catalogSection || !gridContainer || !filtersContainer) return;

    if (!appState.products || appState.products.length === 0) {
        gridContainer.innerHTML = `<p class="text-center p-4 col-span-full">No hay productos disponibles en este momento.</p>`;
        return;
    }

    gridContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();
    appState.products.forEach(product => fragment.appendChild(renderProductCard(product)));
    gridContainer.appendChild(fragment);
    
    // MEJORA: Mapa de iconos para las categorías
    const categoryIcons = {
        'Todos': '✨',
        'Celulares': '📱',
        'Accesorios': '🎧',
        'Servicio Técnico': '🔧',
        'Vende tu Celular': '💰'
    };

    const categories = ['Todos', ...new Set(appState.products.map(p => p.category).filter(Boolean))];
    filtersContainer.innerHTML = categories.map(cat => {
        const icon = categoryIcons[cat] || '📦'; // Icono por defecto
        return `<button class="category-btn ${cat === 'Todos' ? 'active' : ''}" data-category="${cat}">
                    <span class="category-icon">${icon}</span>
                    <span>${cat}</span>
                </button>`;
    }).join('');
}
function setupEventListeners() {
    // Carrito
    document.getElementById('openCartBtn')?.addEventListener('click', () => toggleCartSidebar(true));
    document.getElementById('bottomNavCartBtn')?.addEventListener('click', () => toggleCartSidebar(true));
    
    // Búsqueda
    document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
    document.getElementById('bottomNavSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));

    // Filtrado de categorías
    document.getElementById('category-filters')?.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const selectedCategory = button.dataset.category;
        const allCards = document.querySelectorAll('#product-grid-container .product-card');

        allCards.forEach(card => {
            const product = appState.products.find(p => p.id === card.dataset.id);
            const matches = (selectedCategory === 'Todos' || product?.category === selectedCategory);
            card.classList.toggle('hide', !matches);
        });
    });

    // Añadir al carrito (delegación de eventos en el contenedor de productos)
    document.getElementById('product-grid-container')?.addEventListener('click', (e) => {
        const button = e.target.closest('.add-to-cart-btn');
        if (button) {
            const card = button.closest('.product-card');
            if (card && card.dataset.id) {
                addToCart(card.dataset.id);
            }
        }
    });
}

async function loadApp() {
    const catalogSection = document.getElementById('category-section');
    if (catalogSection) {
        catalogSection.innerHTML = `
            <h2 class="section-title">Nuestro Catálogo</h2>
            <div id="category-filters" class="category-filters"></div>
            <div id="product-grid-container" class="product-grid"></div>
        `;
        renderSkeletonCards();
    }
    
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), 
            fetch('/api/get-catalog') // Asumiendo que esta es la Netlify Function
        ]);
        if (!configResponse.ok || !productsResponse.ok) {
            throw new Error('No se pudo cargar la configuración o los productos.');
        }

        appState.config = await configResponse.json();
        const productData = await productsResponse.json();
        if (productData.error) throw new Error(productData.error);
        appState.products = productData;
        
        updateStaticUI();
        renderCatalog();
        initCart(appState.products, appState.config.contactPhone);
        initHeroCarousel(appState.config.banners);
        initBrandsCarousel(appState.config.brands);
        setupSearch();
        setupEventListeners();
        
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        if(catalogSection) {
            document.getElementById('product-grid-container').innerHTML = `<div class="p-4 text-center col-span-full bg-red-900/50 rounded-lg">
                <p class="font-bold text-lg">Oops, algo salió mal</p>
                <p class="text-red-300">${error.message}</p>
                <p class="mt-2 text-sm">Por favor, intenta recargar la página.</p>
            </div>`;
        }
    }
}

document.addEventListener('DOMContentLoaded', loadApp);
if ('serviceWorker' in navigator) { 
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registrado con éxito.', reg))
            .catch(err => console.error('Error registrando el Service Worker:', err));
    }); 
}
