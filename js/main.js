const appState = { products: [], contactPhone: '573174144815' };

// Función para crear una tarjeta de producto
function createProductCard(product) {
    const card = document.createElement('div');
    // ... lógica para crear la tarjeta, similar a la del código original
    card.innerHTML = `<div><h3>${product.name}</h3><p>$${product.price}</p><button class="whatsapp-btn" data-name="${product.name}">Pedir</button></div>`;
    return card;
}

// Función para renderizar el catálogo completo por carruseles
function renderCatalog(products) {
    const filtersContainer = document.getElementById('category-filters');
    const carouselsContainer = document.getElementById('category-carousels');
    if (!filtersContainer || !carouselsContainer) return;
    
    const categories = ['Todos', ...new Set(products.map(p => p.category))];
    
    // Renderizar botones de filtro
    filtersContainer.innerHTML = categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('');

    // Renderizar carruseles
    carouselsContainer.innerHTML = '';
    categories.slice(1).forEach(category => {
        const section = document.createElement('div');
        section.innerHTML = `<h3>${category}</h3><div class="product-carousel"></div>`;
        const carousel = section.querySelector('.product-carousel');
        products.filter(p => p.category === category).forEach(p => carousel.appendChild(createProductCard(p)));
        carouselsContainer.appendChild(section);
    });

    // Añadir listeners a los botones de categoría, etc.
}

// Flujo principal
async function init() {
    try {
        const response = await fetch('/.netlify/functions/get-catalog');
        const products = await response.json();
        if (products.error) throw new Error(products.error);

        appState.products = products;
        renderCatalog(products);

        // Configurar listener para el botón de contacto principal
        document.getElementById('contact-whatsapp-btn').addEventListener('click', () => {
             const whatsappUrl = `https://wa.me/${appState.contactPhone}?text=¡Hola!%20Necesito%20ayuda%20con%20el%20servicio%20técnico.`;
             window.open(whatsappUrl, '_blank');
        });

    } catch(e) {
        document.getElementById('catalog-container').innerHTML = `<p>Error al cargar el catálogo: ${e.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', init);
