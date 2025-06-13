// js/products.js

/**
 * Crea y devuelve un elemento de tarjeta de producto HTML con un nuevo diseño optimizado.
 * @param {Object} product - El objeto producto a renderizar.
 * @returns {HTMLElement} El elemento div que representa la tarjeta de producto.
 */
export function renderProductCard(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card transform hover:-translate-y-2 transition-transform duration-300'; // Clases para animación
    productCard.dataset.id = product.id;

    // Formatear el precio a moneda local (COP), eliminando los decimales si son .00
    const formattedPrice = product.price.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    productCard.innerHTML = `
        <div class="product-image-container relative overflow-hidden rounded-t-lg">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image w-full h-full object-cover">
            <span class="product-brand absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">${product.brand}</span>
        </div>
        <div class="product-details p-4 flex flex-col flex-grow">
            <h3 class="product-name text-base font-semibold text-text-color-primary mb-2">${product.name}</h3>
            <div class="mt-auto">
                <p class="product-price text-2xl font-bold text-primary-color mb-4">${formattedPrice}</p>
                <button class="add-to-cart-btn w-full flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                    Añadir al Carrito
                </button>
            </div>
        </div>
    `;

    return productCard;
}
