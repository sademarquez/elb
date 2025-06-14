const productCardTemplate = document.getElementById('product-card-template');
const cartItemTemplate = document.getElementById('cart-item-template');
const productGrid = document.getElementById('product-grid');
const cartItemsContainer = document.getElementById('cart-items-container');

// --- Renderizado del Catálogo ---
export function renderProducts(products) {
    productGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();
    products.forEach(product => {
        const card = productCardTemplate.content.cloneNode(true).firstElementChild;
        card.dataset.productId = product.id;
        card.querySelector('[data-value="name"]').textContent = product.name;
        card.querySelector('[data-value="price"]').textContent = formatPrice(product.price);
        card.querySelector('[data-value="imageUrl"]').src = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png';
        card.querySelector('[data-value="imageUrl"]').alt = product.name;
        fragment.appendChild(card);
    });
    productGrid.appendChild(fragment);
}

// --- Actualización de la UI del Carrito ---
export function updateCartUI(cart, products) {
    cartItemsContainer.innerHTML = '';
    let total = 0;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="cart-empty-message">Tu carrito está vacío.</p>`;
    } else {
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return;
            
            const cartItemNode = cartItemTemplate.content.cloneNode(true).firstElementChild;
            cartItemNode.dataset.productId = product.id;
            cartItemNode.querySelector('[data-value="imageUrl"]').src = product.imageUrl;
            cartItemNode.querySelector('[data-value="name"]').textContent = product.name;
            cartItemNode.querySelector('[data-value="price"]').textContent = formatPrice(product.price);
            cartItemNode.querySelector('[data-value="quantity"]').textContent = item.quantity;
            cartItemsContainer.appendChild(cartItemNode);
            total += product.price * item.quantity;
        });
    }
    
    // Actualizar total y contador
    document.getElementById('cart-total-price').textContent = formatPrice(total);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-counter-badge');
    badge.textContent = totalItems;
    badge.classList.toggle('is-visible', totalItems > 0);
    
    // Habilitar/deshabilitar botón de checkout
    document.getElementById('whatsapp-checkout-btn').disabled = cart.length === 0;
}

// --- Control de Paneles y Loaders ---
export function toggleCart(forceState) {
    const cartSidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('app-overlay');
    const isActive = forceState !== undefined ? forceState : !cartSidebar.classList.contains('is-active');
    
    cartSidebar.classList.toggle('is-active', isActive);
    overlay.classList.toggle('is-active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
}

export function showLoader(show) {
    document.getElementById('app-loader').classList.toggle('is-active', show);
}

export function showAddedFeedback(productId) {
    const button = document.querySelector(`.product-card[data-product-id="${productId}"] .add-to-cart-button`);
    if (!button) return;
    
    button.textContent = '¡Añadido!';
    button.classList.add('is-added');
    setTimeout(() => {
        button.textContent = 'Añadir';
        button.classList.remove('is-added');
    }, 1500);
}

// Helper de formato de moneda (puede estar duplicado, idealmente se importa de un `utils.js`)
function formatPrice(price) {
    return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
}
