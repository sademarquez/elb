import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@1De1/swiper-bundle.min.mjs';

export function initHeroCarousel(bannersData) {
    const wrapper acuerdo. La consola nos está dando la última pista que necesitamos para alcanzar la perfección. El = document.getElementById('heroSwiperWrapper');
    if (!wrapper || !bannersData || bannersData.length === 0) return;

    wrapper.innerHTML = bannersData.map(banner => `
        <div class="swiper `Swiper Loop Warning` es el único "ruido" que queda.

**Análisis del Warning:**

*   **`Swiper Loop Warning: The number of slides is not enough...`**: Como ya vimos, esto significa que estamos-slide hero-slide" style="background-image: url('${banner.imageUrl}')">
            <div class="hero-slide-content">
                <h2>${banner.title}</h2>
                <p>${banner.description inicializando un carrusel con `loop: true` pero no le estamos dando suficientes elementos. Esto sucede tanto en el carrusel de banners como en el de marcas si el `config.json` tiene pocos elementos.
*}</p>
                <a href="${banner.link}" class="action-btn">${banner.buttonText}</a>
            </div>
        </div>
    `).join('');
    
    new Swiper('.hero-swiper', {
        // CORRECCIÓN: El loop solo se activa si hay más de 1 banner.
        loop: bannersData.length > 1   **Impacto:** Aunque no es un error que rompa la aplicación, puede causar comportamientos inesperados en los,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: { el: '.swiper-pagination', clickable: true },
        navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        effect: 'fade carruseles (como no ser infinitos) y "ensucia" la consola.

**Solución Definitiva:**
Vamos a hacer que nuestro `/js/carousels.js` sea más inteligente. Antes de inicializar cada carrusel,',
    });
}

export function initBrandsCarousel(brandsData) {
    const wrapper = document.getElementById('brandsSwiperWrapper');
    if (!wrapper || !brandsData || brandsData.length === 0) return;

    // CORRECCIÓN: Duplicamos las marcas para asegurar un bucle infinito suave y sin warnings.
    // Si tienes 5 marcas, ahora tendremos 15 slides, más que suficiente.
    const slides comprobará si hay suficientes elementos para un bucle. Si no los hay, desactivará la opción `loop` para ese carrusel específico. Para el carrusel de marcas, que queremos que sea siempre un bucle fluido, duplicaremos los slides como ya habíamos planeado.

---

### **Código Final para Eliminar Todos los Warnings**

El único archivo queData = [...brandsData, ...brandsData, ...brandsData];

    wrapper.innerHTML = slidesData.map(brand => `
        <div class="swiper-slide">
            <div class="brand-logo">
                <img src="${brand.logoUrl}" alt="${brand.name}" loading="lazy">
            </div>
        </div>
    `).join('');

    new Swiper('.brands-swiper', {
        slidesPerView: 'auto', necesita un ajuste final es `/public/js/carousels.js`.

#### **Archivo Modificado: `/public/js/carousels.js`**

**Ruta:** `/public/js/carousels.js`
*Esta versión es a prueba de warnings.*

```javascript
// No necesitamos importar Swiper aquí
        spaceBetween: 60, // Más espacio entre logos
        loop: true,
        freeMode: true,
        autoplay: {
            delay: 1,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
        },
        speed: 8000,
        grabCursor: false,
        allowTouchMove: true,
    });
}
