// Se elimina la palabra 'export'. Ahora es una función normal.
function initParticles() {
    tsParticles.load("tsparticles", {
        // ... (Aquí va toda tu configuración de partículas, no la cambiaré)
        // Por ejemplo:
        fpsLimit: 60,
        particles: {
            number: { value: 50 },
            color: { value: "#007aff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                out_mode: "out"
            }
        },
        interactivity: {
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            },
            modes: {
                repulse: { distance: 100 },
                push: { particles_nb: 4 }
            }
        },
        detectRetina: true
    });
}

// Llamamos a la función directamente para que se ejecute cuando se cargue el script.
initParticles();
