// ... (resto del archivo)

function createStandardProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card standard-card';
    card.dataset.id = product.id;

    // ... (formateo de precio)
    
    // CORRECCIÓN: Usamos una imagen de placeholder si imageUrl es inválida
    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png'; // Un placeholder genérico

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${imageUrl}" alt="${product.name}" class="product-image">
        </div>
        // ... (resto del HTML de la tarjeta)
    `;
    return card;
}
// Repetir la misma lógica para createServiceCard y cualquier otra que use imageUrl
// ...
