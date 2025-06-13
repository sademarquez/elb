// Importaciones
import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js'; // <-- CORRECCIÓN: Importamos el estado desde el nuevo módulo

// OJO: Ya no exportamos appState desde aquí
// export const appState = { ... }; // <-- LÍNEA ELIMINADA

// ... (renderCategoryCarousels no cambia, pero ahora usará el appState importado) ...

async function init() {
    // ...
    try {
        // ... (carga de datos sin cambios) ...
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog')
        ]);
        
        // CORRECCIÓN: Poblamos el appState importado
        if (configResponse.ok) appState.config = await configResponse.json();
        if (productsResponse.ok) appState.products = await productsResponse.json();
        
        // ... El resto de la función init() es EXACTAMENTE IGUAL,
        // ya que todas las demás funciones (renderCategoryCarousels, initCart, etc.)
        // ahora acceden al appState que hemos poblado.

        document.title = appState.config.siteName;
        // ... etc ...

        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        initHeroCarousel(appState.config.banners); 
        initBrandsCarousel(appState.config.brands);
        setupSearch(); 

        document.getElementById('openSearchBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openSearchNavBtn')?.addEventListener('click', () => toggleSearchModal(true));
        document.getElementById('openCartNavBtn')?.addEventListener('click', () => toggleCartSidebar(true));
        
        // ... (el resto sin cambios) ...

    } catch (error) {
        // ...
    }
}

document.addEventListener('DOMContentLoaded', init);
