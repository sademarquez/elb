import { appState } from './state.js';

const CART_STORAGE_KEY = 'luna_minimal_cart';

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(appState.cart));
}

export function initCart() {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    appState.cart = storedCart ? JSON.parse(storedCart) : [];
}

export function addToCart(productId) {
    const existingItem = appState.cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        appState.cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
}

export function updateQuantity(productId, change) {
    const itemIndex = appState.cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;

    appState.cart[itemIndex].quantity += change;

    if (appState.cart[itemIndex].quantity <= 0) {
        appState.cart.splice(itemIndex, 1);
    }
    saveCart();
}

export function getCart() {
    return appState.cart;
}

export function generateWhatsappMessage() {
    const { config, products, cart } = appState;
    if (cart.length === 0 || !config.contactPhone) return null;

    let message = `¡Hola *${config.siteName}*! 👋\nQuisiera hacer el siguiente pedido:\n\n`;
    let total = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            const subtotal = product.price * item.quantity;
            message += `*${item.quantity}x* ${product.name} - ${formatPrice(subtotal)}\n`;
            total += subtotal;
        }
    });

    message += `\n*Total del Pedido: ${formatPrice(total)}*`;
    message += `\n\n¡Quedo a la espera!`;

    return `https://wa.me/${config.contactPhone}?text=${encodeURIComponent(message)}`;
}

// Helper para formato de moneda
function formatPrice(price) {
    return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
}
