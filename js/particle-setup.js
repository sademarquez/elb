export function initParticles() {
    tsParticles.load("animated-bg", {
        fpsLimit: 60,
        particles: {
            number: {
                value: 80, // Número de partículas
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: "#007AFF", // Color primario de nuestra paleta
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: 0.7,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false,
                },
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: false,
                },
            },
            move: {
                enable: true,
                speed: 2, // Velocidad de movimiento
                direction: "top", // Se mueven hacia arriba
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                },
            },
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false, // Desactivado para mejor rendimiento
                },
                onclick: {
                    enable: false,
                },
                resize: true,
            },
        },
        retina_detect: true,
        background: {
            color: "#000000",
        },
    });
}
