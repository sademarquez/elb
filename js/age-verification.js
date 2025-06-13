const AGE_VERIFIED_KEY = 'el_borracho_age_verified';

/**
 * Inicializa la lógica del modal de verificación de edad.
 * @param {Function} onVerifiedCallback - La función a ejecutar una vez que se confirma la edad.
 */
export function initAgeVerification(onVerifiedCallback) {
    const modal = document.getElementById('ageVerificationModal');
    const mainContent = document.getElementById('mainContent');
    const confirmBtn = document.getElementById('confirmAgeBtn');
    const declineBtn = document.getElementById('declineAgeBtn');

    // Función interna para mostrar el contenido y ejecutar el callback de forma segura
    const runVerifiedState = () => {
        if (mainContent) mainContent.style.visibility = 'visible';
        if (modal) modal.classList.remove('visible');

        // Si existe la función callback, la ejecutamos en el próximo frame de animación.
        // Esto le da tiempo al navegador para procesar el cambio de 'visibility' antes de
        // que intentemos acceder a los elementos dentro de #mainContent.
        if (onVerifiedCallback) {
            requestAnimationFrame(onVerifiedCallback);
        }
    };

    // Si los elementos críticos del modal no existen, no bloqueamos la app.
    if (!modal || !mainContent || !confirmBtn || !declineBtn) {
        console.error('Elementos del modal de verificación no encontrados. Se cargará la app por defecto.');
        runVerifiedState(); // Ejecuta el estado verificado para no bloquear al usuario.
        return;
    }

    // Comprobar si el usuario ya está verificado en la sesión actual
    if (sessionStorage.getItem(AGE_VERIFIED_KEY) === 'true') {
        runVerifiedState();
    } else {
        // Si no está verificado, mostrar el modal.
        modal.classList.add('visible');
    }

    // Listener para el botón de confirmación
    confirmBtn.addEventListener('click', () => {
        sessionStorage.setItem(AGE_VERIFIED_KEY, 'true');
        runVerifiedState();
    });

    // Listener para el botón de rechazo
    declineBtn.addEventListener('click', () => {
        modal.querySelector('h2').textContent = 'Acceso Denegado';
        modal.querySelector('p').textContent = 'Lo sentimos, debes ser mayor de edad para acceder a este contenido.';
        modal.querySelector('.flex').remove();
    });
}
