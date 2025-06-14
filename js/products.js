export function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    // ... (resto del código de la tarjeta no cambia)

    // Listener para la micro-interacción
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', (e) => {
            // Previene que el evento de clic se propague a otros elementos
            e.stopPropagation();
            
            // Añade una clase temporal para la animación
            addToCartBtn.classList.add('adding-to-cart');
            // Cambia el icono a un check
            addToCartBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            `;
            
            // Después de un tiempo, revierte el botón a su estado original
            setTimeout(() => {
                addToCartBtn.classList.remove('adding-to-cart');
                addToCartBtn.innerHTML = `+`;
            }, 1500);
        });
    }

    return card;
}
