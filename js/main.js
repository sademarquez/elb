// main.js - Versión con depuración avanzada
import { initCart, addToCart } from './cart.js';
// ... otros imports

export const appState = {
    products: [],
    config: {},
};

function renderCategoryCarousels() {
    // ... (esta función no cambia, la dejamos como está)
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    const catalogSection = document.getElementById('category-section');

    if (!carouselsContainer || !filtersContainer || !catalogSection) return;

    if (!appState.products || appState.products.length === 0) {
        catalogSection.innerHTML = `
            <h2 class="text-3xl font-bold mb-4">Catálogo</h2>
            <p class="text-center text-amber-400 bg-gray-800 p-4 rounded-lg">
                No se encontraron productos en el catálogo.
            </p>
        `;
        return;
    }

    const categories = [...new Set(appState.products.map(p => p.category))];
    filtersContainer.innerHTML = `
        <button class="category-btn active" data-category="Todos">Todos</button>
        ${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}
    `;
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

/**
 * Orquestador principal que inicializa la aplicación.
 */
async function init() {
    const catalogContainer = document.getElementById('category-section');
    console.log("Iniciando aplicación...");

    try {
        catalogContainer.innerHTML = `<p class="text-center text-gray-400">Cargando catálogo, por favor espera...</p>`;

        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'),
            fetch('/.netlify/functions/get-catalog')
        ]);
        
        console.log("Respuesta de Configuración:", configResponse);
        console.log("Respuesta de Productos (Netlify):", productsResponse);

        if (!configResponse.ok) throw new Error('No se pudo cargar config.json');
        appState.config = await configResponse.json();
        
        if (!productsResponse.ok) {
            const errorText = await productsResponse.text();
            console.error("Texto del error de Netlify:", errorText);
            throw new Error(`El servidor de catálogo respondió con un error: ${productsResponse.status}`);
        }

        // --- PASO CLAVE DE DEPURACIÓN ---
        // Leemos la respuesta como texto primero para ver qué contiene exactamente
        const productsText = await productsResponse.text();
        console.log("Texto recibido de Netlify:", productsText);

        if (!productsText) {
            throw new Error("La respuesta del catálogo está vacía.");
        }

        try {
            // Intentamos convertir el texto a JSON
            appState.products = JSON.parse(productsText);
        } catch (e) {
            console.error("Error al parsear el JSON del catálogo:", e);
            throw new Error("El formato de los datos del catálogo es incorrecto.");
        }
        
        // Mostramos en consola los productos que hemos procesado
        console.log("Productos procesados en appState:", appState.products);

        // --- Fin de la depuración ---

        document.title = appState.config.siteName;
        document.querySelector('header img').alt = appState.config.siteName;
        document.getElementById('contact-whatsapp-btn').href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20o%20quiero%20hacer%20un%20pedido.`;

        renderCategoryCarousels();
        initCart(appState.products, appState.config.contactPhone);

        document.querySelector('main').addEventListener('click', (e) => {
            const addToCartButton = e.target.closest('.add-to-cart-btn');
            if (addToCartButton) {
                const productCard = addToCartButton.closest('.product-card');
                if (productCard) {
                    const productId = productCard.dataset.id;
                    addToCart(productId);
                }
            }
        });

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registrado.')).catch(err => console.error('Error SW:', err));
            });
        }

    } catch (error) {
        console.error('Error fatal en init():', error);
        catalogContainer.innerHTML = `
            <h2 class="text-3xl font-bold mb-4 text-red-500">Error al Cargar</h2>
            <div class="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
                <p>No se pudo mostrar el catálogo de productos.</p>
                <p class="text-sm mt-2"><strong>Detalle:</strong> ${error.message}</p>
                <p class="text-sm mt-2">Revisa la consola de desarrollador (F12) para más información.</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', init);
// renderProductCard necesita ser importada en los módulos que la usan, pero si la necesitas aquí, descomenta:
// import { renderProductCard } from './products.js';
