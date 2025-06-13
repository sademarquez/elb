import { initCart, toggleCartSidebar, addToCart } from './cart.js';
import { initHeroCarousel, initBrandsCarousel } from './carousels.js';
import { initAgeVerification } from './age-verification.js';

const API_PRODUCTS_URL = 'products.json';
const API_CONFIG_URL = 'config.json';
let allProducts = [];
let displayedProductsCount = 0;
const PRODUCTS_PER_PAGE = 6;

function renderProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    // Estructura actualizada: Sin overlay, nombre y precio juntos.
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
        </div>
        <div class="product-details">
            <div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">$${product.price.toLocaleString('es-CO')}</p>
            </div>
            <button class="add-to-cart-btn" data-id="${product.id}">Agregar</button>
        </div>`;
    return card;
}

function renderCategoryButtons(categories) {
    const desktopContainer = document.getElementById('categoryButtonsContainer');
    const mobileRow1 = document.getElementById('categoryRow1');
    const mobileRow2 = document.getElementById('categoryRow2');

    if (!desktopContainer || !mobileRow1 || !mobileRow2) return;

    desktopContainer.innerHTML = '';
    mobileRow1.innerHTML = '';
    mobileRow2.innerHTML = '';

    const row1Categories = ['Licor', 'Cerveza', 'Vino', 'Tabaco'];

    const createButton = (category) => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category;
        button.dataset.category = category; // Usar dataset para identificar la categoría
        return button;
    };

    categories.forEach(category => {
        // Crear y añadir botón para la vista de escritorio
        desktopContainer.appendChild(createButton(category));

        // Crear y añadir botón para la vista móvil correspondiente
        if (row1Categories.includes(category)) {
            mobileRow1.appendChild(createButton(category));
        } else {
            mobileRow2.appendChild(createButton(category));
        }
    });
}


function renderProductsByCategory(category) {
    const container = document.getElementById('categoryProductsContainer');
    if (!container) return;
    const filteredProducts = allProducts.filter(p => p.category === category);
    container.innerHTML = '';
    if (filteredProducts.length > 0) {
        filteredProducts.forEach(product => container.appendChild(renderProductCard(product)));
    } else {
        container.innerHTML = `<p class="w-full text-center text-text-color-secondary">No hay productos en esta categoría.</p>`;
    }
}

function applyFiltersAndRender() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;
    const searchTerm = document.getElementById('mainSearchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryFilter').value;
    const sortOrder = document.getElementById('priceSortFilter').value;
    let filteredProducts = allProducts;
    const isFiltered = searchTerm || selectedCategory !== 'all' || sortOrder !== 'default';

    if (isFiltered) {
        if (searchTerm) filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
        if (selectedCategory !== 'all') filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        if (sortOrder === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
        else if (sortOrder === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
        
        grid.innerHTML = '';
        filteredProducts.forEach(product => grid.appendChild(renderProductCard(product)));
        loadMoreBtn.style.display = 'none';
    } else {
        displayInitialProducts();
    }
}

function populateCategoryFilter(categories) {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    filter.innerHTML = '<option value="all">Todas las Categorías</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filter.appendChild(option);
    });
}

function displayInitialProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;
    grid.innerHTML = '';
    const productsToDisplay = allProducts.slice(0, PRODUCTS_PER_PAGE);
    productsToDisplay.forEach(product => grid.appendChild(renderProductCard(product)));
    displayedProductsCount = productsToDisplay.length;
    loadMoreBtn.style.display = displayedProductsCount >= allProducts.length ? 'none' : 'block';
}

function loadMoreProducts() {
    const grid = document.getElementById('productGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!grid || !loadMoreBtn) return;
    const nextProducts = allProducts.slice(displayedProductsCount, displayedProductsCount + PRODUCTS_PER_PAGE);
    nextProducts.forEach(product => grid.appendChild(renderProductCard(product)));
    displayedProductsCount += nextProducts.length;
    if (displayedProductsCount >= allProducts.length) loadMoreBtn.style.display = 'none';
}

async function main() {
    try {
        initAgeVerification();

        const [productsResponse, configResponse] = await Promise.all([fetch('products.json'), fetch('config.json')]);
        if (!productsResponse.ok || !configResponse.ok) throw new Error('Error al cargar datos');
        
        allProducts = await productsResponse.json();
        const appConfig = await configResponse.json();
        
        initCart(allProducts, appConfig.contactPhone);
        setupEventListeners();
        
        initHeroCarousel(appConfig.banners);
        initBrandsCarousel(appConfig.brands);
        
        const categories = [...new Set(allProducts.map(p => p.category))];
        renderCategoryButtons(categories);
        populateCategoryFilter(categories);
        displayInitialProducts();
        
        // Simula el click en el primer botón de categoría para cargar productos iniciales
        const firstCategoryButton = document.querySelector('.category-btn');
        if (firstCategoryButton) {
            firstCategoryButton.click();
        }
        
        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();

    } catch (error) {
        console.error("Error al inicializar la aplicación:", error);
    }
}

function setupEventListeners() {
    document.getElementById('cartOpenBtn')?.addEventListener('click', () => toggleCartSidebar(true));
    document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreProducts);
    document.getElementById('mainSearchInput')?.addEventListener('input', applyFiltersAndRender);
    document.getElementById('categoryFilter')?.addEventListener('change', applyFiltersAndRender);
    document.getElementById('priceSortFilter')?.addEventListener('change', applyFiltersAndRender);
    document.body.addEventListener('click', event => {
        if (event.target.matches('.add-to-cart-btn')) addToCart(event.target.dataset.id);
    });

    // Event listener para los botones de categoría usando delegación
    const categoryNav = document.getElementById('category-nav-section');
    if (categoryNav) {
        categoryNav.addEventListener('click', (event) => {
            const button = event.target.closest('.category-btn');
            if (!button) return;

            const category = button.dataset.category;
            // Actualiza la clase 'active' en todos los botones correspondientes
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.category === category);
            });
            
            renderProductsByCategory(category);
        });
    }

    const bottomNav = document.getElementById('bottomNav');
    if (bottomNav) {
        bottomNav.addEventListener('click', event => {
            const button = event.target.closest('.bottom-nav-item');
            if (!button) return;
            bottomNav.querySelectorAll('.bottom-nav-item').forEach(item => item.classList.remove('active'));
            button.classList.add('active');
            const action = button.dataset.action;
            if (action === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
            else if (action === 'cart') toggleCartSidebar(true);
            else if (action === 'search') document.getElementById('mainSearchInput').focus({ preventScroll: true });
        });
    }
}

document.addEventListener('DOMContentLoaded', main);
