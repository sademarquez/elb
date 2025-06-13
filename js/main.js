import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js';

// ... (renderCategoryCarousels no cambia) ...

// NUEVO: Toda la lógica de carga de la aplicación se mueve a su propia función.
async function loadApp() {
    const catalogContainer = document.getElementById('category-section');
    try {
        if(catalogContainer) {
             const placeholder = document.createElement('p');
             placeholder.className = 'text-center text-gray-400';
             placeholder.textContent = 'Cargando catálogo...';
             catalogContainer.appendChild(placeholder);
        }
       
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
        initBrandsCarousel(appSState.config.brands);
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
        console.error('Error fatal en loadApp():', error);
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg"><p class="font-bold">Error al cargar</p><p class="text-sm mt-2">${error.message}</p></div>`;
    }
}

// NUEVO: La función init() ahora es mucho más simple.
function init() {
    // Llama a la verificación de edad y le pasa la función loadApp como callback.
    // loadApp solo se ejecutará si la edad es verificada.
    initAgeVerification(loadApp); 
}

document.addEventListener('DOMContentLoaded', init);
