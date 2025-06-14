export function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;

    const formattedPrice = product.price.toLocaleString('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
    });
    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png';

    card.innerHTML = `
        <div class="card-image-wrapper">
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="card-content-wrapper">
            <span class="product-brand">${product.brand}</span>
            <h3 class="product-name">${product.name}</h3>
            <div class="price-action-wrapper">
                <p class="product-price">${formattedPrice}</p>
                <button class="add-to-cart-btn" aria-label="Añadir al carrito">+</button>
            </div>
        </div>
    `;
    return card;
}
