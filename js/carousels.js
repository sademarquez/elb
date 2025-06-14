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
        loop: bannersData.length > 1, // CORRECTO: Loop condicional
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
    if (!wrapper || !brandsData || brandsData.length === 0) return;

    wrapper.innerHTML = brandsData.map(brand => `
        <div class="swiper-slide">
            <div class="brand-logo">
                <img src="${brand.logoUrl}" alt="${brand.name}" loading="lazy">
            </div>
        </div>
    `).join('');

    new Swiper('.brands-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 60,
        loop: true,
        freeMode: true, // Permite el deslizamiento libre
        autoplay: {
            delay: 0, // Inicia inmediatamente
            disableOnInteraction: false,
        },
        speed: 8000, // Duración de la animación de un extremo a otro
        allowTouchMove: false, // El usuario no puede detenerlo
        grabCursor: false,
    });
}
