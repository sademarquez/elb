import { initCart, addToCart, toggleCartSidebar } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { renderProductCard } from './products.js';
import { setupSearch, toggleSearchModal } from './search.js';
import { appState } from './state.js';
import { initAgeVerification } from './age-verification.js';

function updateStaticUI() {
    const siteTitle = document.getElementById('siteTitle');
    const headerLogo = document.getElementById('headerLogo');
    const contactBtn = document.getElementById('contact-whatsapp-btn');
    if (siteTitle) siteTitle.textContent = appState.config.siteName;
    if (headerLogo) headerLogo.alt = appState.config.siteName;
    if (contactBtn) contactBtn.href = `https://wa.me/${appState.config.contactPhone}?text=¡Hola!`;
}

// --- FUNCIÓN CORREGIDA Y SIMPLIFICADA ---
function renderCategoryCarousels() {
    const carouselsContainer = document.getElementById('category-carousels');
    const filtersContainer = document.getElementById('category-filters');
    const catalogSection = document.getElementById('category-section');

    if (!carouselsContainer || !filtersContainer || !catalogSection) return;
    
    // Primero, limpiamos cualquier mensaje de "Cargando..."
    catalogSection.querySelector('p')?.remove(); 

    if (!appState.products || appState.products.length === 0) {
        carouselsContainer.innerHTML = `<p class="text-center text-amber-400 p-4">No se encontraron productos.</p>`;
        return;
    }

    const categories = [...new Set(appState.products.map(p => p.category))];
    
    // Renderiza los botones de filtro
    filtersContainer.innerHTML = `
        <button class="category-btn active" data-category="Todos">Todos</button>
        ${categories.map(cat => `<button class="category-btn" data-category="${cat}">${cat}</button>`).join('')}
    `;
    
    // Renderiza los carruseles de productos
    carouselsContainer.innerHTML = categories.map(category => {
        const productsInCategory = appState.products.filter(p => p.category === category);
        const productCardsHTML = productsInCategory.map(p => renderProductCard(p).outerHTML).join('');
        const categoryId = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        return `
            <section id="category-${categoryId}" class="product-carousel-section mt-8">
                <h3 class="text-2xl font-bold mb-4">${category}</h3>
                <div class="category-products-carousel">${productCardsHTML}</div>
            </section>
        `;
    }).join('');
    
    // Añade el listener para los filtros
    filtersContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.category-btn');
        if (!button) return;
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const selectedCategory = button.dataset.category;

        document.querySelectorAll('.product-carousel-section').forEach(section => {
            section.style.display = 'block'; // Asegura que todos sean visibles antes de filtrar
            if (selectedCategory !== 'Todos' && !section.id.includes(`category-${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)) {
                section.style.display = 'none';
            }
        });
    });
}

async function loadApp() {
    const catalogContainer = document.getElementById('category-section');
    console.log('%c--- Iniciando loadApp ---', 'color: cyan; font-weight: bold;');
    
    try {
        if(catalogContainer) {
            // Reemplaza todo el contenido de la sección de catálogo con el mensaje de carga
            catalogContainer.innerHTML = '<p class="text-center text-gray-400 p-8">Cargando datos del catálogo...</p>';
        }
        
        const [configResponse, productsResponse] = await Promise.all([
            fetch('/config.json'), fetch('/api/get-catalog') 
        ]);

        if (!configResponse.ok) throw new Error('Error crítico: No se pudo cargar config.json.');
        appState.config = await configResponse.json();
        console.log('Configuración cargada');

        if (!productsResponse.ok) throw new Error('No se pudo cargar el catálogo desde la API.');
        
        const productsData = await productsResponse.json();
        if(productsData.error) throw new Error(`Error de la API: ${productsData.error}`);
        
        appState.products = productsData;
        console.log('Productos cargados. Cantidad:', appState.products.length);
        
        console.log('Renderizando UI...');
        updateStaticUI();
        renderCategoryCarousels(); // <--- AHORA ESTA FUNCIÓN LIMPIARÁ EL MENSAJE Y RENDERIZARÁ TODO
        initCart(appState.products, appState.config.contactPhone);
        
        if (appState.config.banners && appState.config.banners.length > 0) initHeroCarousel(appState.config.banners);
        if (appState.config.brands && appState.config.brands.length > 0) initBrandsCarousel(appState.config.brands);
        
        setupSearch();
        
        //... (listeners)
        
    } catch (error) {
        console.error('Error fatal en loadApp():', error);
        if(catalogContainer) catalogContainer.innerHTML = `<div class="bg-red-900/50 p-4 rounded-lg"><p class="font-bold">Error al cargar</p><p>${error.message}</p></div>`;
    }
}

function init() { initAgeVerification(loadApp); }
document.addEventListener('DOMContentLoaded', init);
