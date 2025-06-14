import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

export function initHeroCarousel(bannersData) {
    const wrapper = document.getElementById('heroSwiperWrapper');
    if (!wrapper || !bannersData || bannersData.length === 0) return;

    wrapper.innerHTML = bannersData.map(banner => `
        <div class="swiper-slide hero-slide" style="background-image: url('${banner.imageUrl}')">
            <div class="hero-slide-content">
                <h2>${banner.title}</h2>
                <p>${banner.description}</p>
                <a href="${banner.link}" class="btn">${banner.buttonText}</a>
            </div>
        </div>
    `).join('');
    
    new Swiper('.hero-swiper', {
        loop: bannersData.length > 1,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        effect: 'fade',
    });
}

export function initBrandsCarousel(brandsData) {
    const wrapper = document.getElementById('brandsSwiperWrapper');
    if (!wrapper || !brandsData || brandsData.length === 0) return;

    // --- CORRECCIÓN DEFINITIVA PARA EL WARNING DE LOOP ---
    // Si hay pocas marcas, las duplicamos para asegurar un bucle fluido.
    // Con `...brandsData, ...brandsData` pasamos de 5 a 10 slides, suficiente para Swiper.
    const slidesData = [...brandsData, ...brandsData, ...brandsData];

    wrapper.innerHTML = slidesData.map(brand => `
        <div class="swiper-slide" style="width: auto;">
            <div class="brand-logo">
                <img src="${brand.logoUrl}" alt="${brand.name}" loading="lazy" style="max-height: 50px; width: auto;">
            </div>
        </div>
    `).join('');

    // Esta configuración está optimizada para un carrusel de logos continuo.
    new Swiper('.brands-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 60, // Aumentamos el espacio para que se vea más limpio
        loop: true,
        freeMode: true,
        autoplay: {
            delay: 1, // Sin delay para que empiece a moverse de inmediato
            disableOnInteraction: false,
            pauseOnMouseEnter: true, // Se detiene al pasar el mouse por encima
        },
        speed: 8000, // Una velocidad constante y agradable
        grabCursor: false,
        allowTouchMove: true, // Permitir el swipe en móviles
    });
}
