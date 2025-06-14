const STATIC_CACHE_NAME = 'luna-static-v3';
const DYNAMIC_CACHE_NAME = 'luna-dynamic-v3';
const APP_SHELL = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/main.js',
    '/js/cart.js',
    '/js/carousels.js',
    '/js/products.js',
    '/js/search.js',
    '/js/state.js',
    '/images/logo_luna.png',
    '/favicon.ico'
];

// 1. Instalación: Cachear el App Shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('SW: Cacheando el App Shell');
      return cache.addAll(APP_SHELL);
    }).catch(err => console.error('Fallo en cache.addAll:', err))
  );
});

// 2. Activación: Limpiar cachés antiguos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Estrategia "Stale-While-Revalidate"
self.addEventListener('fetch', e => {
  // Para la API, siempre ir a la red primero, pero con fallback a caché.
  if (e.request.url.includes('/api/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Para el resto, estrategia Stale-While-Revalidate
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      const fetchPromise = fetch(e.request).then(networkResponse => {
        // No cachear respuestas de extensiones de Chrome
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
        }
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(e.request.url, networkResponse.clone());
          return networkResponse;
        });
      });
      // Devolver la respuesta cacheada inmediatamente, si existe.
      // La promesa de fetch continuará en segundo plano para actualizar el caché.
      return cachedResponse || fetchPromise;
    })
  );
});
