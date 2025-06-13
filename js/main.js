// REFACTORIZADO: Este archivo es ahora el orquestador principal de la aplicación.
import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
// import { initAgeVerification } from './age-verification.js'; // Descomentar si se implementa el modal de edad
// import { setupSearch, toggleSearchModal } from './search.js'; // Descomentar si se implementa la búsqueda
// import { setupSupport } from './support.js'; // Descomentar si se implementa el soporte

// Estado global de la aplicación
export const appState = {
    products: [],
    config: {},
    cart: []
};

/**
 * NUEVO: Renderiza los carruseles de productos por categoría.
 */
function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    if (!carouselsContainer || !filtersContainer) return;

    const categories = [...new Set(appState.products.map(p => p.category))];

    // 1. Renderizar botones de filtro
    filtersContainer.innerHTML = `
        <button class="category-btn active" data-category="Todos">Todos</button>
        ${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}
    `;

    // 2. Renderizar carruseles por cada categoría
    carouselsContainer.innerHTML = categories.map(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');

        return `
            <section id="category-${category.toLowerCase().replace(/\s/g, '-')}" class="product-carousel-section mt-8">
                <h3 class="text-2xl font-bold mb-4">${category}</h3>
                <div class="category-products-carousel">
                    ${productCardsHTML}
                </div>
            </section>
        `;
    }).join('');

    // 3. Añadir lógica a los botones de filtro
    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;

        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const selectedCategory = button.dataset.category;

        document.querySelectorAll('.product-carousel-section').forEach(section => {
            if (selectedCategory === 'Todos') {
                section.style.display = 'block';
            } else {
                section.style.display = section.id === `category-${selectedCategory.toLowerCase().replace(/\s/g, '-')}` ? 'block' : 'none';
            }
        });
    });
}


/**
 * NUEVO: Orquestador principal que inicializa la aplicación.
 */
async function init() {
    try {
        // initAgeVerification(); // Descomentar para activar la verificación de edad

        // Cargar configuración y productos en paralelo para mejorar la velocidad
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'),
            fetch('/products.json') // Usamos el JSON local por simplicidad. Para producción, cambiar a: fetch('/.netlify/functions/get-catalog')
        ]);

        if (!configResponse.ok || !productsResponse.ok) {
            throw new Error('No se pudieron cargar los datos iniciales.');
        }

        appState.config = await configResponse.json();
        appState.products = await productsResponse.json();

        // 1. Configurar la UI con datos de config.json
        document.title = appState.config.siteName;
        document.querySelector('header img').alt = appState.config.siteName;
        document.getElementById('contact-whatsapp-btn').href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20o%20quiero%20hacer%20un%20pedido.`;

        // 2. Inicializar los módulos de la aplicación
        // initHeroCarousel(appState.config.banners); // Descomentar cuando el HTML del carrusel esté listo
        // initBrandsCarousel(appState.config.brands); // Descomentar cuando el HTML del carrusel esté listo
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        // setupSupport(); // Descomentar cuando se implemente el soporte
        // setupSearch(); // Descomentar cuando se implemente la búsqueda

        // 3. Configurar listeners de eventos globales
        document.querySelector('main').addEventListener('click', (e) => {
            // Delegación de eventos para los botones "Añadir al Carrito"
            const addToCartButton = e.target.closest('.add-to-cart-btn');
            if (addToCartButton) {
                const productId = addToCartButton.closest('.product-card').dataset.id;
                addToCart(productId);
            }
        });

        // 4. Registrar el Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registrado con éxito', reg))
                    .catch(err => console.error('Error al registrar el Service Worker', err));
            });
        }

    } catch (error) {
        console.error('Error fatal en la inicialización:', error);
        document.getElementById('category-section').innerHTML = `<p class="text-center text-red-500">Error al cargar el catálogo. Por favor, intenta de nuevo más tarde.</p>`;
    }
}

// Iniciar la aplicación cuando el DOM esté listo.
document.addEventListener('DOMContentLoaded', init);
