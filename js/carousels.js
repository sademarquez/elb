// No es necesario importar Swiper, ya está disponible globalmente desde el script en index.html

export function initHeroCarousel(bannersData) {
    const wrapper = document.getElementById('heroSwiperWrapper');
    if (!wrapper || !bannersData || bannersData.length === 0) return;

    wrapper.innerHTML = bannersData.map(banner => `
        <div class="swiper-slide hero-slide" style="background-image: url('${banner.imageUrl}')">
            <div class="hero-slide-content">
                <h2>${banner.title}</h2>
                <p>${banner.description}</p>
                <a href="${banner.link}" class="action-btn">${banner.buttonText}</a>
            </div>
        </div>
    `).join('');
    
    new Swiper('.hero-swiper', {
        // Esta lógica ya era correcta: el loop se activa solo si hay más de 1 banner.
        loop: bannersData.length > 1,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        effect: 'fade',
    });
}

export function initBrandsCarousel(brandsData) {
    const wrapper = document.getElementById('brandsSwiperWrapper');
    // Si no hay marcas o solo hay una, no tiene sentido el carrusel.
    if (!wrapper || !brandsData || brandsData.length < 2) {
        const brandsSection = document.getElementById('brands-section');
        if (brandsSection) brandsSection.style.display = 'none'; // Oculta toda la sección
        return;
    }

    // SOLUCIÓN DEFINITIVA: Duplicamos las marcas para darle a Swiper suficientes
    // slides para que el bucle infinito funcione sin warnings.
    // Si tienes 4 marcas, ahora crearemos 12 slides en el HTML.
    const slidesData = [...brandsData, ...brandsData, ...brandsData];

    wrapper.innerHTML = slidesData.map(brand => `
        <div class="swiper-slide" style="width: auto;"> <!-- style="width: auto;" es clave para slidesPerView: 'auto' -->
            <div class="brand-logo">
                <img src="${brand.logoUrl}" alt="${brand.name}" loading="lazy">
            </div>
        </div>
    `).join('');

    new Swiper('.brands-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 60,
        loop: true,
        freeMode: true, // Permite el deslizamiento libre y continuo
        autoplay: {
            delay: 1, // Usar 1 en lugar de 0 para máxima compatibilidad
            disableOnInteraction: false,
            pauseOnMouseEnter: true, // Una buena práctica de UX, el carrusel se pausa al pasar el mouse
        },
        speed: 8000, // Velocidad del desplazamiento
        grabCursor: false,
        allowTouchMove: true,
    });
}
