const STATIC_CACHE_NAME = 'elborracho-static-v1'; // REFACTORIZADO: Nombre de app actualizado
const DYNAMIC_CACHE_NAME = 'elborracho-dynamic-v1'; // REFACTORIZADO: Nombre de app actualizado
const APP_SHELL = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/css/components.css',
    '/css/responsive.css',
    '/js/main.js',
    '/manifest.json',
    '/config.json',
    '/products.json',
    '/images/logo.png',
    '/images/favicon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('SW: Cacheando App Shell');
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        // CORRECCIÓN CRÍTICA: Ahora no borramos el caché dinámico en cada activación.
        // Solo se eliminan los cachés que no sean el estático y dinámico actuales.
        .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
        .map(key => {
          console.log('SW: Borrando caché antiguo:', key);
          return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('fetch', e => {
  // Estrategia: Network falling back to Cache
  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Si la petición es exitosa, la clonamos y la guardamos en el caché dinámico.
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          // No cacheamos las peticiones de Netlify Functions para evitar inconsistencias.
          if (!e.request.url.includes('/.netlify/functions/')) {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Si la red falla, intentamos servir desde el caché.
        return caches.match(e.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en el caché, puedes devolver una página de fallback offline si la tienes.
          // Por ahora, se resolverá en el error por defecto del navegador.
        });
      })
  );
});
