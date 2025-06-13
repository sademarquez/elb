import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';

function updateStaticUI() { /*...*/ }
function renderCategoryCarousels() { /*...*/ }
async function loadApp() {
    try {
        const catalogContainer = document.getElementById('category-section');
        if (catalogContainer) catalogContainer.innerHTML += '<div id="category-filters"></div><div id="category-carousels"></div>';
        
        const [configResponse, productsResponse] = await Promise.all([ fetch('/config.json'), fetch('/api/get-catalog') ]);
        appState.config = await configResponse.json();
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
    } catch (error) { console.error('Error en loadApp():', error); }
}

function showWelcomeAndLoadApp(callback) {
    const modalHTML = `
        <div id="welcomeModal" class="age-verification-modal cursor-pointer visible">
            <div class="age-verification-content text-center" style="pointer-events: none;">
                <img src="/images/logo_luna.png" alt="Logo" class="h-20 mx-auto mb-6 animate-pulse">
                <h2 class="text-4xl font-bold text-primary-color mb-3">Comunicaciones Luna</h2>
                <p class="text-text-color-secondary text-xl">Tu mundo, conectado.</p>
            </div>
        </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('welcomeModal');
    let dismissed = false;

    const dismissModal = () => {
        if (dismissed) return;
        dismissed = true;
        clearTimeout(timerId);
        document.removeEventListener('click', dismissModal);
        document.removeEventListener('keydown', dismissModal);
        if(modal) {
            modal.classList.remove('visible');
            modal.addEventListener('transitionend', () => modal.remove(), { once: true });
        }
        if (callback) callback();
    };

    const timerId = setTimeout(dismissModal, 2500);
    document.addEventListener('click', dismissModal, { once: true });
    document.addEventListener('keydown', dismissModal, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    // Al cargar la página, todo el contenido ya es parte del flujo normal del DOM.
    // Solo el modal de bienvenida se superpone.
    loadApp(); 
    showWelcomeAndLoadApp(); // Lo llamamos sin callback, solo para mostrar el splash.
});

// He simplificado el `main.js` en esta respuesta, asegúrate de que tus funciones
// renderCategoryCarousels y updateStaticUI estén completas como en el paso anterior.
