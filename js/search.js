import { appState } from './state.js';
import { renderProductCard } from './products.js';

let searchModal, searchInput, searchResultsGrid, closeSearchModalBtn;

export function setupSearch() {
    searchModal = document.getElementById('searchModal');
    searchInput = document.getElementById('searchInput');
    searchResultsGrid = document.getElementById('searchResultsGrid');
    closeSearchModalBtn = document.getElementById('closeSearchModalBtn');

    if (!searchModal || !searchInput || !searchResultsGrid || !closeSearchModalBtn) {
        console.warn('Elementos del modal de búsqueda no encontrados.');
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
    
    searchInput.addEventListener('input', performSearch);
    closeSearchModalBtn.addEventListener('click', () => toggleSearchModal(false));
}

function renderSearchResults(products, searchTerm) {
    searchResultsGrid.innerHTML = ''; 
    if (products.length === 0) {
        searchResultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">No se encontraron resultados para "<strong>${searchTerm}</strong>".</p>`;
    } else {
        const fragment = document.createDocumentFragment();
        products.forEach(product => fragment.appendChild(renderProductCard(product)));
        searchResultsGrid.appendChild(fragment);
    }
}

export function toggleSearchModal(open) {
    if (!searchModal) return;
    if (open) {
        searchModal.style.display = 'flex';
        searchModal.classList.add('opacity-100');
        searchInput.focus();
        searchResultsGrid.innerHTML = `<p class="text-gray-400 col-span-full text-center">Ingresa un término para buscar productos.</p>`;
    } else {
        searchModal.classList.remove('opacity-100');
        setTimeout(() => {
            searchModal.style.display = 'none';
            searchInput.value = '';
        }, 300);
    }
}
