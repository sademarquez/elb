// js/products.js

// Importamos el estado global para poder acceder a la configuración, como el número de teléfono.
import { appState } from './state.js';

/**
 * Función principal que actúa como un "router" de renderizado.
 * Decide qué tipo de tarjeta crear basándose en la categoría del producto.
 * @param {Object} product - El objeto producto a renderizar.
 * @returns {HTMLElement} El elemento div que representa la tarjeta de producto apropiada.
 */
export function renderProductCard(product) {
    // Usamos un switch para determinar qué función de creación de tarjeta llamar.
    switch (product.category) {
        case '🛠️ Servicio Técnico':
            return createServiceCard(product);
        case '💰 Vende tu Celular':
            return createSellCard(product);
        default: // Para '📱 Celulares' y '🎧 Accesorios' o cualquier otra categoría
            return createStandardProductCard(product);
    }
}

/**
 * Crea la tarjeta de producto estándar, optimizada para celulares y accesorios.
 * @param {Object} product - El objeto producto.
 * @returns {HTMLElement} La tarjeta de producto estándar.
 */
function createStandardProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card standard-card';
    card.dataset.id = product.id; // Esencial para la funcionalidad del carrito

    // Formateo del precio a moneda local (COP)
    const formattedPrice = product.price.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="product-details">
            <span class="product-brand">${product.brand}</span>
            <h3 class="product-name">${product.name}</h3>
            <div class="price-action-wrapper">
                <p class="product-price">${formattedPrice}</p>
                <button class="add-to-cart-btn" aria-label="Añadir al carrito">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    `;
    return card;
}

/**
 * Crea una tarjeta informativa y de acción para la categoría "Servicio Técnico".
 * @param {Object} product - El objeto del servicio.
 * @returns {HTMLElement} La tarjeta de servicio técnico.
 */
function createServiceCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card service-card';
    card.dataset.id = product.id;

    const formattedPrice = product.price > 0 
        ? `Desde ${product.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : 'Sujeto a diagnóstico';
    
    const whatsappMessage = encodeURIComponent(`Hola, quisiera más información sobre el servicio de "${product.name}".`);
    const whatsappLink = `https://wa.me/${appState.config.contactPhone}?text=${whatsappMessage}`;

    card.innerHTML = `
        <div class="service-icon">
            <img src="${product.imageUrl}" alt="Icono de servicio" class="service-image-icon">
        </div>
        <div class="service-details">
            <h3 class="service-name">${product.name}</h3>
            <p class="service-description">Diagnóstico y reparación profesional con repuestos de alta calidad y garantía.</p>
            <p class="service-price">${formattedPrice}</p>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="service-action-btn">
                Solicitar Servicio
            </a>
        </div>
    `;
    return card;
}

/**
 * Crea una tarjeta llamativa para la categoría "Vende tu Celular".
 * @param {Object} product - El objeto del ítem de venta/tasación.
 * @returns {HTMLElement} La tarjeta de venta.
 */
function createSellCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card sell-card';
    card.dataset.id = product.id;
    
    const whatsappMessage = encodeURIComponent(`Hola, me interesa cotizar mi ${product.name} para la venta.`);
    const whatsappLink = `https://wa.me/${appState.config.contactPhone}?text=${whatsappMessage}`;

    card.innerHTML = `
        <div class="sell-content">
            <div class="sell-icon">💰</div>
            <h3 class="sell-title">${product.name}</h3>
            <p class="sell-description">¿Tienes un equipo que ya no usas? Te damos una oferta justa y el pago es inmediato. ¡Contáctanos!</p>
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" class="sell-action-btn">
                Cotizar mi Equipo
            </a>
        </div>
    `;
    return card;
}
