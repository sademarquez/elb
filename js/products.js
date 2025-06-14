export function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card elegant-card';
    card.dataset.id = product.id;

    // Google Sheet debe tener una columna 'condition' con "Nuevo" o "Usado"
    const condition = product.condition || '';
    const conditionTag = condition ? `<span class="product-condition ${condition.toLowerCase()}">${condition}</span>` : '';

    const formattedPrice = product.price.toLocaleString('es-CO', {
        style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0
    });
    
    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png'; // Placeholder

    card.innerHTML = `
        <div class="card-image-wrapper">
            ${conditionTag}
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="card-content-wrapper">
            <h3 class="product-name">${product.name}</h3>
            <div class="price-action-wrapper">
                <p class="product-price">${formattedPrice}</p>
                <button class="add-to-cart-btn" aria-label="Añadir al carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    return card;
}
