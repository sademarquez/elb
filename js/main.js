// Importaciones
import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js'; // <-- NUEVO: Descomentamos la importación

// ... (resto de main.js no cambia) ...

async function init() {
    // NUEVO: La verificación de edad se ejecuta ANTES que todo lo demás.
    initAgeVerification(); 

    const catalogContainer = document.getElementById('category-section');
    try {
        // ... (el resto de la función init() sigue exactamente igual)
        const [configResponse, productsResponse] = await Promise.all([
            //...
        ]);
        //...

    } catch (error) {
        // ...
    }
}

document.addEventListener('DOMContentLoaded', init);
