// ... (la función initHeroCarousel puede permanecer igual o podemos hacerla más segura) ...

export function initHeroCarousel(bannersData) {
    const wrapper = document.getElementById('heroSwiperWrapper');
    if (!wrapper || !bannersData || bannersData.length === 0) return; // Más seguro

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
        loop: bannersData.length > 1, // El loop solo se activa si hay más de 1 banner
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        effect: 'fade', // Efecto 'fade' es elegante y no depende tanto de los slides
    });
}

export function initBrandsCarousel(brandsData) {
    const wrapper = document.getElementById('brandsSwiperWrapper');
    if (!wrapper || !brandsData || brandsData.length === 0) return;

    // --- CORRECCIÓN DE FLUIDEZ ---
    // Duplicamos las marcas para asegurar un bucle infinito suave
    const duplicatedBrands = [...brandsData, ...brandsData, ...brandsData];

    wrapper.innerHTML = duplicatedBrands.map(brand => `
        <div class="swiper-slide">
            <div class="brand-logo"><img src="${brand.logoUrl}" alt="${brand.name}" loading="lazy"></div>
        </div>
    `).join('');

    new Swiper('.brands-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 40,
        loop: true,
        freeMode: true,
        autoplay: {
            delay: 1,
            disableOnInteraction: false,
        },
        speed: 7000, // Velocidad de desplazamiento
        grabCursor: false,
        allowTouchMove: false,
    });
}
