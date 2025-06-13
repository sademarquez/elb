// js/support.js
// REFACTORIZADO: Ahora obtiene la información de contacto desde el estado global de la app.

import { appState } from './main.js'; // Para acceder a la configuración global
// import { showToastNotification } from './toast.js'; // Descomentar cuando se implemente el toast

export function setupSupport() {
    // ... (el código para abrir/cerrar modales y manejar formularios sigue aquí) ...
    // La única diferencia es cómo se obtiene el número de WhatsApp.

    const faultReportForm = document.getElementById('faultReportForm');
    if (faultReportForm) {
        faultReportForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // CORRECCIÓN: Obtiene el teléfono del estado global `appState`
            const whatsappNumber = appState.config.contactPhone;
            if (!whatsappNumber) {
                alert('Número de WhatsApp no configurado.');
                // showToastNotification('Número de WhatsApp no configurado.', 'error');
                return;
            }

            // ... el resto del código del formulario es idéntico ...
        });
    }

    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (event) => {
            event.preventDefault();

            // CORRECCIÓN: Obtiene el teléfono del estado global `appState`
            const whatsappNumber = appState.config.contactPhone;
            if (!whatsappNumber) {
                alert('Número de WhatsApp no configurado.');
                // showToastNotification('Número de WhatsApp no configurado.', 'error');
                return;
            }
            
            // ... el resto del código del formulario es idéntico ...
        });
    }
    console.log('Módulo de soporte configurado (listeners listos).');
}
