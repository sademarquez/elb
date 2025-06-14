import { appState } from './state.js'; // Importar appState si alguna tarjeta especial lo necesita.

// La única función que se exporta y se usa en toda la aplicación
export function renderProductCard(product) {
    const card = document.createElement('div');
    // Añadimos clases para animación y layout.
    card.className = 'product-card new-design'; 
    card.dataset.id = product.id;

    // Etiqueta de condición (Nuevo/Usado) con colores diferentes.
    // Solo se muestra si la columna 'condition' existe en los datos.
    const conditionTag = product.condition
        ? `<span class="product-condition ${product.condition.toLowerCase().replace(/\s+/g, '-')}">${product.condition}</span>`
        : '';

    // Formateo del precio a moneda local (COP)
    const formattedPrice = product.price.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png'; // Un placeholder si no hay imagen.

    card.innerHTML = `
        <div class="card-image-wrapper">
            ${conditionTag}
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="card-content-wrapper">
            <h3 class="product-name">${product.name}</h3>
            <div class="price-and-cart">
                <p class="product-price">${formattedPrice}</p>
                <button class="add-to-cart-btn" aria-label="Añadir al carrito">+</button>
            </div>
        </div>
    `;

    return card;
}
