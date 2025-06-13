const AGE_VERIFIED_KEY = 'el_borracho_age_verified';

// NUEVO: La función ahora acepta un callback opcional.
export function initAgeVerification(onVerifiedCallback) {
    const modal = document.getElementById('ageVerificationModal');
    const mainContent = document.getElementById('mainContent');
    const confirmBtn = document.getElementById('confirmAgeBtn');
    const declineBtn = document.getElementById('declineAgeBtn');

    if (!modal || !mainContent || !confirmBtn || !declineBtn) {
        console.error('Elementos del modal de verificación no encontrados.');
        if (mainContent) mainContent.style.visibility = 'visible'; 
        if (onVerifiedCallback) onVerifiedCallback(); // Si faltan elementos, ejecuta el callback para cargar la app
        return;
    }

    const showMainContent = () => {
        mainContent.style.visibility = 'visible';
        modal.classList.remove('visible');
        // Ejecuta el callback solo si la función existe
        if (onVerifiedCallback) {
            onVerifiedCallback();
        }
    };

    const isVerified = sessionStorage.getItem(AGE_VERIFIED_KEY);

    if (isVerified === 'true') {
        showMainContent();
    } else {
        modal.classList.add('visible');
    }

    confirmBtn.addEventListener('click', () => {
        sessionStorage.setItem(AGE_VERIFIED_KEY, 'true');
        showMainContent(); // Llamamos a la nueva función que también ejecuta el callback
    });

    declineBtn.addEventListener('click', () => {
        modal.querySelector('h2').textContent = 'Acceso Denegado';
        modal.querySelector('p').textContent = 'Lo sentimos, debes ser mayor de edad para acceder a este contenido.';
        modal.querySelector('.flex').remove(); 
    });
}
