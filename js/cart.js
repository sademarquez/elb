let cart = [];
let allProducts = [];
let whatsappNumber = '';

const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountHeader = document.getElementById('cartCount');
const cartCountNav = document.getElementById('bottomNavCartCount');
const cartTotalPriceEl = document.getElementById('cartTotalPrice');
const CART_STORAGE_KEY = 'comunicaciones_luna_cart'; // Clave profesional

export function initCart(productsData, phone) {
    allProducts = productsData;
    whatsappNumber = phone;
    
    try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        cart = storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
        console.error("Error al parsear el carrito. Reseteando.", e);
        cart = [];
        localStorage.removeItem(CART_STORAGE_KEY);
    }
    
    document.getElementById('closeCartBtn')?.addEventListener('click', () => toggleCartSidebar(false));
    document.getElementById('checkoutWhatsappBtn')?.addEventListener('click', sendOrderToWhatsapp);
    
    cartItemsContainer?.addEventListener('click', handleCartAction);

    updateCartUI();
    console.log('Módulo de carrito inicializado.');
}

export function toggleCartSidebar(open) {
    if (cartSidebar) {
        cartSidebar.classList.toggle('open', open);
    }
}

export function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCartSidebar(true);
}

function handleCartAction(event) {
    const button = event.target.closest('button');
    if (!button) return;

    const cartItemElement = button.closest('.cart-item');
    if (!cartItemElement) return;

    const productId = cartItemElement.dataset.id;
    const action = button.dataset.action;

    switch (action) {
        case 'increase':
            updateQuantity(productId, 1);
            break;
        case 'decrease':
            updateQuantity(productId, -1);
            break;
        case 'remove':
            removeFromCart(productId);
            break;
    }
}

function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    cart[itemIndex].quantity += change;

    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }
    saveCart();
    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function updateCartUI() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-center text-text-color-secondary p-4">Tu carrito está vacío.</p>`;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => {
            const product = allProducts.find(p => p.id === item.id);
            if (!product) {
                // Producto no encontrado en el catálogo, podría haber sido eliminado.
                // Es mejor informarlo que fallar silenciosamente.
                console.warn(`Producto con ID ${item.id} no encontrado en el catálogo. Será eliminado del carrito.`);
                removeFromCart(item.id); // Llama a una actualización recursiva, pero es seguro.
                return '';
            };
            return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p class="price">${product.price.toLocaleString('es-CO', {style: 'currency', currency: 'COP', minimumFractionDigits: 0})}</p>
                </div>
                <div class="cart-item-controls">
                    <button data-action="decrease">-</button>
                    <span class="px-2">${item.quantity}</span>
                    <button data-action="increase">+</button>
                </div>
                <button data-action="remove" class="remove-item-btn text-2xl leading-none">×</button>
            </div>`;
        }).join('');
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => {
        const product = allProducts.find(p => p.id === item.id);
        return sum + (product ? (product.price * item.quantity) : 0);
    }, 0);
    
    if (cartCountHeader) cartCountHeader.textContent = totalItems;
    if (cartCountNav) cartCountNav.textContent = totalItems;
    if (cartTotalPriceEl) cartTotalPriceEl.textContent = totalPrice.toLocaleString('es-CO', {style: 'currency', currency: 'COP', minimumFractionDigits: 0});
    
    if (cartCountHeader) cartCountHeader.style.display = totalItems > 0 ? 'flex' : 'none';
    if (cartCountNav) cartCountNav.style.display = totalItems > 0 ? 'flex' : 'none';
}

function sendOrderToWhatsapp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    if (!whatsappNumber) {
        alert("Error de configuración. No podemos procesar tu pedido en este momento.");
        return;
    }

    let message = `¡Hola *Comunicaciones Luna*! ✨\n\nQuisiera hacer el siguiente pedido:\n\n`;
    let total = 0;
    cart.forEach(item => {
        const product = allProducts.find(p => p.id === item.id);
        if(product) {
            const subtotal = product.price * item.quantity;
            message += `*${item.quantity}x* ${product.name} - ${subtotal.toLocaleString('es-CO', {style: 'currency', currency: 'COP', minimumFractionDigits: 0})}\n`;
            total += subtotal;
        }
    });
    message += `\n*Total del Pedido: ${total.toLocaleString('es-CO', {style: 'currency', currency: 'COP', minimumFractionDigits: 0})}*`;
    message += `\n\nQuedo a la espera de la confirmación. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
