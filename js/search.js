import { appState } from './main.js';
import { renderProductCard } from './products.js';

// No necesitamos exportar estas variables, son internas del módulo
let searchModal, searchInput, searchResultsGrid, closeSearchModalBtn;

export function setupSearch() {
    searchModal = document.getElementById('searchModal');
    searchInput = document.getElementById('searchInput');
    searchResultsGrid = document.getElementById('searchResultsGrid');
    closeSearchModalBtn = document.getElementById('closeSearchModalBtn');

    if (!searchModal || !searchInput || !searchResultsGrid || !closeSearchModalBtn) {
        console.warn('Elementos del modal de búsqueda no encontrados. La funcionalidad estará deshabilitada.');
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm.length < 3) {
            searchResultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">Ingresa al menos 3 caracteres para buscar.</p>`;
            return;
        }

        const filteredProducts = appState.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );

        renderSearchResults(filteredProducts, searchTerm);
    };
    
    // Usamos 'input' para buscar en tiempo real mientras se escribe
    searchInput.addEventListener('input', performSearch);
    closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));

    console.log('Módulo de búsqueda inicializado.');
}

function renderSearchResults(products, searchTerm) {
    searchResultsGrid.innerHTML = ''; 

    if (products.length === 0) {
        searchResultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">No se encontraron resultados para "<strong>${searchTerm}</strong>".</p>`;
    } else {
        const fragment = document.createDocumentFragment();
        products.forEach(product => {
            const productCard = renderProductCard(product);
            fragment.appendChild(productCard);
        });
        searchResultsGrid.appendChild(fragment);
    }
}

export function toggleSearchModal(open) {
    if (!searchModal) return;

    if (open) {
        searchModal.style.display = 'flex';
        // Pequeño delay para la animación de opacidad
        setTimeout(() => {
            searchModal.classList.add('opacity-100');
            searchInput.focus();
            searchInput.value = '';
            searchResultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">Ingresa un término para buscar productos.</p>`;
        }, 10);
    } else {
        searchModal.classList.remove('opacity-100');
        // Esperar a que termine la transición para ocultarlo
        setTimeout(() => {
            searchModal.style.display = 'none';
        }, 300); // La duración debe coincidir con la transición en CSS
    }
}
