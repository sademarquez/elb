import { initCart, addToCart } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';

export const appState = { products: [], config: {} };

function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    const catalogSection = document.getElementById('category-section');

    if (!carouselsContainer || !filtersContainer || !catalogSection) return;

    // Limpiar mensajes de carga o placeholders
    filtersContainer.innerHTML = '';
    carouselsContainer.innerHTML = '';

    if (!appState.products || appState.products.length === 0) {
        carouselsContainer.innerHTML = `<p class="text-center text-amber-400 bg-gray-800 p-4 rounded-lg">No hay productos disponibles en el catálogo en este momento.</p>`;
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
    const carouselsPlaceholder = document.getElementById('category-carousels');
    if (carouselsPlaceholder) carouselsPlaceholder.innerHTML = `<p>Cargando productos...</p>`;

    try {
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog') 
        ]);

        if (!configResponse.ok) throw new Error(`No se pudo cargar config.json (status: ${configResponse.status})`);
        appState.config = await configResponse.json();

        if (!productsResponse.ok) {
            const errorData = await productsResponse.json().catch(() => ({error: `El servidor respondió con un error ${productsResponse.status}`}));
            throw new Error(errorData.error);
        }
        appState.products = await productsResponse.json();

        document.title = appState.config.siteName;
        document.querySelector('header img').alt = appState.config.siteName;
        document.getElementById('contact-whatsapp-btn').href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20o%20quiero%20hacer%20un%20pedido.`;

        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        initHeroCarousel(appState.config.banners); 
        initBrandsCarousel(appState.config.brands);
        
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
        if (catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg"><p class="font-bold">No se pudo cargar el catálogo.</p><p class="text-sm mt-2"><strong>Detalle:</strong> ${error.message}</p></div>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
