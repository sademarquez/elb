export function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    // Etiqueta de condición (Nuevo/Usado) con colores diferentes
    const conditionTag = product.condition
        ? `<span class="product-condition ${product.condition.toLowerCase()}">${product.condition}</span>`
        : '';

    const formattedPrice = product.price.toLocaleString('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
    });

    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png';

    card.innerHTML = `
        <div class="card-image-wrapper">
            ${conditionTag}
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="card-content-wrapper">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${formattedPrice}</p>
            <button class="add-to-cart-btn">Añadir al Carrito</button>
        </div>
    `;
    return card;
}
