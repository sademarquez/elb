// main.js - El orquestador principal de la aplicación
import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';

// Estado global de la aplicación
export const appState = {
    products: [],
    config: {},
};

/**
 * Renderiza los carruseles de productos por categoría.
 */
function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    const catalogSection = document.getElementById('category-section');

    if (!carouselsContainer || !filtersContainer || !catalogSection) return;

    // Si no hay productos, muestra un mensaje claro.
    if (appState.products.length === 0) {
        catalogSection.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">Catálogo</h2>
            <p class="text-center text-amber-400 bg-gray-800 p-4 rounded-lg">
                No hay productos disponibles en este momento. Por favor, vuelve a intentarlo más tarde.
            </p>
        `;
        return;
    }

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
            <section id="category-${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}" class="product-carousel-section mt-8">
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
                section.style.display = section.id.includes(`category-${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`) ? 'block' : 'none';
            }
        });
    });
}

/**
 * Orquestador principal que inicializa la aplicación.
 */
async function init() {
    const catalogContainer = document.getElementById('category-section');
    try {
        // Mostramos un estado de carga inicial
        catalogContainer.innerHTML = `<p class="text-center text-gray-400">Cargando catálogo, por favor espera...</p>`;

        // Cargar configuración y productos en paralelo
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'),
            fetch('/.netlify/functions/get-catalog') // CORRECCIÓN: Llamamos a la función Netlify en vivo
        ]);

        // Cargar configuración local
        if (!configResponse.ok) throw new Error('No se pudo cargar config.json');
        appState.config = await configResponse.json();
        
        // Procesar respuesta de productos
        if (!productsResponse.ok) {
            const errorData = await productsResponse.json();
            throw new Error(errorData.error || 'Respuesta de red no fue exitosa.');
        }
        appState.products = await productsResponse.json();

        // 1. Configurar la UI con datos de config.json
        document.title = appState.config.siteName;
        document.querySelector('header img').alt = appState.config.siteName;
        document.getElementById('contact-whatsapp-btn').href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20o%20quiero%20hacer%20un%20pedido.`;

        // 2. Inicializar los módulos de la aplicación
        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);
        
        // --- Módulos para FASE 2 ---
        // Descomentar para activar
        // initHeroCarousel(appState.config.banners); 
        // initBrandsCarousel(appState.config.brands);

        // 3. Configurar listeners de eventos globales
        document.querySelector('main').addEventListener('click', (e) => {
            const addToCartButton = e.target.closest('.add-to-cart-btn');
            if (addToCartButton) {
                const productCard = addToCartButton.closest('.product-card');
                if(productCard) {
                    const productId = productCard.dataset.id;
                    addToCart(productId);
                }
            }
        });

        // 4. Registrar el Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(reg => console.log('Service Worker registrado.', reg))
                    .catch(err => console.error('Error al registrar SW:', err));
            });
        }

    } catch (error) {
        console.error('Error fatal en la inicialización:', error);
        // Mostrar un mensaje de error claro y visible en la UI
        catalogContainer.innerHTML = `
            <h2 class="text-3xl font-bold mb-4 text-red-500">Error al Cargar</h2>
            <div class="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                <p>No se pudo cargar el catálogo de productos.</p>
                <p class="text-sm mt-2"><strong>Detalle:</strong> ${error.message}</p>
                <p class="text-sm mt-2">Por favor, intenta recargar la página o contacta al soporte.</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', init);
