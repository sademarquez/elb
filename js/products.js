// js/products.js
import { appState } from './state.js';

// --- FUNCIONES INTERNAS PARA CREAR CADA TIPO DE TARJETA ---
function createStandardProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card standard-card';
    card.dataset.id = product.id;
    const formattedPrice = product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png'; // Placeholder
    card.innerHTML = `<div class="product-image-container"><img src="${imageUrl}" alt="${product.name}" class="product-image"></div><div class="product-details"><span class="product-brand">${product.brand}</span><h3 class="product-name">${product.name}</h3><div class="price-action-wrapper"><p class="product-price">${formattedPrice}</p><button class="add-to-cart-btn" aria-label="Añadir"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg></button></div></div>`;
    return card;
}

function createServiceCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card service-card';
    card.dataset.id = product.id;
    const formattedPrice = product.price > 0 ? `Desde ${product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'Sujeto a diagnóstico';
    const whatsappMessage = encodeURIComponent(`Hola, quisiera más información sobre el servicio: "${product.name}".`);
    const whatsappLink = `https://wa.me/${appState.config.contactPhone}?text=${whatsappMessage}`;
    const imageUrl = product.imageUrl || 'https://i.imgur.com/3Y1Z8g9.png'; // Placeholder
    card.innerHTML = `<div class="service-icon"><img src="${imageUrl}" alt="Icono" class="service-image-icon"></div><div class="service-details"><h3 class="service-name">${product.name}</h3><p class="service-description">Reparación profesional con repuestos de calidad y garantía.</p><p class="service-price">${formattedPrice}</p><a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="service-action-btn">Solicitar Servicio</a></div>`;
    return card;
}

function createSellCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card sell-card';
    card.dataset.id = product.id;
    const whatsappMessage = encodeURIComponent(`Hola, me interesa cotizar mi ${product.name} para la venta.`);
    const whatsappLink = `https://wa.me/${appState.config.contactPhone}?text=${whatsappMessage}`;
    card.innerHTML = `<div class="sell-content"><div class="sell-icon">💰</div><h3 class="sell-title">${product.name}</h3><p class="sell-description">¿Ya no usas tu equipo? Te damos una oferta justa. ¡Contáctanos!</p><a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="sell-action-btn">Cotizar mi Equipo</a></div>`;
    return card;
}

// --- FUNCIÓN EXPORTADA PRINCIPAL ---
// Esta es la única función que otros módulos necesitan importar.
export function renderProductCard(product) {
    switch (product.category) {
        case '🛠️ Servicio Técnico':
            return createServiceCard(product);
        case '💰 Vende tu Celular':
            return createSellCard(product);
        default:
            return createStandardProductCard(product);
    }
}
