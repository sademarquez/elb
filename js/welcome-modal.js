export function initWelcomeModal(onContinueCallback) {
    const modal = document.getElementById('welcomeModal');
    const mainContent = document.getElementById('mainContent');
    const continueBtn = document.getElementById('continueBtn');

    if (!modal || !mainContent || !continueBtn) {
        console.warn('Elementos del modal de bienvenida no encontrados. Se cargará la app directamente.');
        if (mainContent) mainContent.style.visibility = 'visible';
        if (onContinueCallback) requestAnimationFrame(onContinueCallback);
        return;
    }

    modal.classList.add('visible');

    const proceedToApp = () => {
        modal.classList.remove('visible');
        modal.addEventListener('transitionend', () => modal.remove(), { once: true });
        mainContent.style.visibility = 'visible';
        if (onContinueCallback) requestAnimationFrame(onContinueCallback);
    };

    continueBtn.addEventListener('click', proceedToApp);
}
