import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    if (!carouselsContainer || !filtersContainer) return;
    carouselsContainer.innerHTML = ''; filtersContainer.innerHTML = '';
    if (!appState.products || appState.products.length === 0) {
        carouselsContainer.innerHTML = `<p class="text-center text-amber-400 bg-gray-800 p-4 rounded-lg">No hay productos disponibles.</p>`;
        return;
    }
    const categories = [...new Set(appState.products.map(p => p.category))];
    filtersContainer.innerHTML = `<button class="category-btn active" data-category="Todos">Todos</button>${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}`;
    carouselsContainer.innerHTML = categories.map(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');
        return `<section id="category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}" class="product-carousel-section mt-8"><h3 class="text-2xl font-bold mb-4">${category}</h3><div class="category-products-carousel">${productCardsHTML}</div></section>`;
    }).join('');
    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedCategory = button.dataset.category;
        document.querySelectorAll('.product-carousel-section').forEach(section => {
            section.style.display = (selectedCategory === 'Todos' || section.id.includes(`category-${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)) ? 'block' : 'none';
        });
    });
}

async function init() {
    const catalogContainer = document.getElementById('category-section');
    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        if (configResponse.ok) appState.config = await configResponse.json();
        if (productsResponse.ok) appState.products = await productsResponse.json();
        else { throw new Error('No se pudieron cargar los productos'); }

        document.title = appState.config.siteName;
        document.querySelector('header a img').alt = appState.config.siteName;
        document.getElementById('contact-whatsapp-btn').href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20o%20quiero%20hacer%20un%20pedido.`;

        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        initHeroCarousel(appState.config.banners);
        initBrandsCarousel(appState.config.brands);
        setupSearch();

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

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js'));
        }
    } catch (error) {
        console.error('Error fatal en init():', error);
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg"><p class="font-bold">Error al cargar</p><p class="text-sm mt-2">${error.message}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
