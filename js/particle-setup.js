export function initParticles() {
    // tsParticles es una variable global cargada desde el CDN, por eso no se importa.
    if (typeof tsParticles === 'undefined') {
        console.error('tsParticles no está cargado. Asegúrate de que el script CDN esté en index.html ANTES de main.js');
        return;
    }

    tsParticles.load("animated-bg", {
        fpsLimit: 60,
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: "#007AFF", // Color primario de "Comunicaciones Luna"
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: 0.6,
                random: true,
                anim: {
                    enable: true,
                    speed: 0.8,
                    opacity_min: 0.1,
                    sync: false,
                },
            },
            size: {
                value: 2.5,
                random: true,
                anim: {
                    enable: false,
                },
            },
            move: {
                enable: true,
                speed: 1.5,
                direction: "none", // Se mueven en direcciones aleatorias
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
            },
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: false,
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
