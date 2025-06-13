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

    // Duplicamos las marcas para un bucle infinito y fluido.
    const duplicatedBrands = [...brandsData, ...brandsData, ...brandsData, ...brandsData];

    // Ahora generamos un 'div' con el emoji y el nombre.
    wrapper.innerHTML = duplicatedBrands.map(brand => `
        <div class="swiper-slide">
            <div class="brand-emoji-item">
                <span class="brand-emoji">${brand.emoji}</span>
                <span class="brand-name-text">${brand.name}</span>
            </div>
        </div>
    `).join('');

    new Swiper('.brands-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 30,
        loop: true,
        freeMode: true,
        autoplay: {
            delay: 1,
            disableOnInteraction: false,
        },
        speed: 8000,
        grabCursor: false,
        allowTouchMove: false,
    });
}
