const AGE_VERIFIED_KEY = 'el_borracho_age_verified';

export function initAgeVerification(onVerifiedCallback) {
    const modal = document.getElementById('ageVerificationModal');
    const mainContent = document.getElementById('mainContent');
    const confirmBtn = document.getElementById('confirmAgeBtn');
    const declineBtn = document.getElementById('declineAgeBtn');

    if (!modal || !mainContent || !confirmBtn || !declineBtn) {
        console.error('Elementos del modal de verificación no encontrados. Cargando app directamente.');
        if (mainContent) mainContent.style.visibility = 'visible';
        if (onVerifiedCallback) requestAnimationFrame(onVerifiedCallback); // Cargar incluso si hay error
        return;
    }

    const showMainContent = () => {
        mainContent.style.visibility = 'visible';
        modal.classList.remove('visible');
        
        // CORRECCIÓN CLAVE:
        // Le pedimos al navegador que ejecute el callback en el próximo ciclo de renderizado.
        // Esto asegura que #mainContent esté completamente disponible en el DOM para ser manipulado.
        if (onVerifiedCallback) {
            requestAnimationFrame(onVerifiedCallback);
        }
    };

    const isVerified = sessionStorage.getItem(AGE_VERIFIED_KEY);

    if (isVerified === 'true') {
        // Para el caso en que ya está verificado, también usamos el callback
        showMainContent();
    } else {
        modal.classList.add('visible');
    }

    confirmBtn.addEventListener('click', () => {
        sessionStorage.setItem(AGE_VERIFIED_KEY, 'true');
        showMainContent(); 
    });

    declineBtn.addEventListener('click', () => {
        modal.querySelector('h2').textContent = 'Acceso Denegado';
        modal.querySelector('p').textContent = 'Lo sentimos, debes ser mayor de edad para acceder a este contenido.';
        modal.querySelector('.flex').remove();
    });
}
