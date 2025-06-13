// La duración del modal en milisegundos (3000ms = 3 segundos)
const MODAL_TIMEOUT_MS = 3000;

let modalHasBeenDismissed = false; // Bandera para asegurar que solo se cierre una vez

/**
 * Muestra un modal de bienvenida que se cierra automáticamente o al interactuar.
 * @param {Function} onContinueCallback - La función a ejecutar después de que el modal se cierre.
 */
export function initWelcomeModal(onContinueCallback) {
    const modal = document.getElementById('welcomeModal');
    const mainContent = document.getElementById('mainContent');

    if (!modal || !mainContent) {
        console.warn('Elementos para el modal de bienvenida no encontrados. Cargando app directamente.');
        if (mainContent) mainContent.style.visibility = 'visible';
        if (onContinueCallback) requestAnimationFrame(onContinueCallback);
        return;
    }

    // Muestra el modal
    modal.classList.add('visible');

    // Función para cerrar el modal y proceder
    const proceedToApp = () => {
        // Si ya se ha cerrado, no hacer nada.
        if (modalHasBeenDismissed) return;
        modalHasBeenDismissed = true;

        // Limpia los listeners para evitar ejecuciones múltiples
        clearTimeout(timerId);
        document.removeEventListener('click', proceedToApp);
        document.removeEventListener('touchstart', proceedToApp);
        document.removeEventListener('keydown', proceedToApp);

        // Oculta el modal con una transición suave
        modal.classList.remove('visible');
        modal.addEventListener('transitionend', () => modal.remove(), { once: true });

        // Muestra el contenido principal y ejecuta el callback
        mainContent.style.visibility = 'visible';
        if (onContinueCallback) {
            requestAnimationFrame(onContinueCallback);
        }
    };

    // --- LÓGICA DE CIERRE ---
    
    // 1. Cierre automático después de un tiempo
    const timerId = setTimeout(proceedToApp, MODAL_TIMEOUT_MS);
    
    // 2. Cierre inmediato al interactuar con la página
    document.addEventListener('click', proceedToApp, { once: true }); // se ejecuta una sola vez
    document.addEventListener('touchstart', proceedToApp, { once: true }); // para móviles
    document.addEventListener('keydown', proceedToApp, { once: true }); // al presionar cualquier tecla
}
