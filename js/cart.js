// REFACTORIZADO: Código simplificado y preparado para recibir configuración externa.

let cart = [];
let allProducts = [];
let whatsappNumber = '';

const cartSidebar = document.getElementById('cartSidebar');
const cartItemsContainer = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount'); // Para el header
const bottomNavCartCount = document.getElementById('bottomNavCartCount'); // Para la nav inferior móvil
const cartTotalPrice = document.getElementById('cartTotalPrice');
const CART_STORAGE_KEY = 'el_borracho_cart';

/**
 * REFACTORIZADO: Ahora recibe los productos y el teléfono al inicializarse.
 * @param {Array} productsData - Array de todos los productos de la tienda.
 * @param {string} phone - Número de teléfono de contacto para WhatsApp.
 */
export function initCart(productsData, phone) {
    allProducts = productsData;
    whatsappNumber = phone;
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
        try {
            cart = JSON.parse(storedCart);
        } catch (e) {
            console.error("Error al parsear el carrito desde localStorage", e);
            cart = [];
        }
    }
    
    document.getElementById('closeCartBtn')?.addEventListener('click', () => toggleCartSidebar(false));
    document.getElementById('checkoutWhatsappBtn')?.addEventListener('click', sendOrderToWhatsapp);
    
    cartItemsContainer?.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;

        const productId = button.closest('.cart-item')?.dataset.id;
        if (!productId) return;

        if (button.matches('.quantity-increase')) {
            updateQuantity(productId, 1);
        } else if (button.matches('.quantity-decrease')) {
            updateQuantity(productId, -1);
        } else if (button.matches('.remove-item-btn')) {
            removeFromCart(productId);
        }
    });

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
    toggleCartSidebar(true); // Abrir el carrito al añadir un producto
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
                // Producto no encontrado, quizás fue eliminado del catálogo.
                // Lo removemos del carrito para evitar errores.
                removeFromCart(item.id);
                return '';
            };
            return `
            <div class="cart-item" data-id="${item.id}">
                <img src="${product.imageUrl}" alt="${product.name}" loading="lazy">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <p class="price">$${product.price.toLocaleString('es-CO')}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-decrease">-</button>
                    <span class="px-2">${item.quantity}</span>
                    <button class="quantity-increase">+</button>
                </div>
                <button class="remove-item-btn text-2xl leading-none">×</button>
            </div>`;
        }).join('');
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => {
        const product = allProducts.find(p => p.id === item.id);
        return sum + (product ? (product.price * item.quantity) : 0);
    }, 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    if (bottomNavCartCount) bottomNavCartCount.textContent = totalItems;
    if (cartTotalPrice) cartTotalPrice.textContent = `$${totalPrice.toLocaleString('es-CO')}`;
}

function sendOrderToWhatsapp() {
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Añade productos para hacer un pedido.");
        return;
    }
    if (!whatsappNumber) {
        alert("Lo sentimos, hay un problema de configuración y no podemos procesar tu pedido. Contacta al soporte.");
        return;
    }

    let message = "¡Hola EL BORRACHO! Quisiera hacer el siguiente pedido:\n\n";
    let total = 0;
    cart.forEach(item => {
        const product = allProducts.find(p => p.id === item.id);
        if(product) {
            const subtotal = product.price * item.quantity;
            message += `${item.quantity}x ${product.name} - $${subtotal.toLocaleString('es-CO')}\n`;
            total += subtotal;
        }
    });
    message += `\n*Total del Pedido: $${total.toLocaleString('es-CO')}*`;
    message += `\n\nQuedo a la espera de la confirmación. ¡Gracias!`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}
