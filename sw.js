const STATIC_CACHE_NAME = 'luna-static-v2'; // Nueva versión
const DYNAMIC_CACHE_NAME = 'luna-dynamic-v2';
// Hacemos el App Shell mínimo para evitar fallos de instalación
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC_CACHE_NAME).then(c => {
    return c.addAll(APP_SHELL);
  }));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME).map(key => caches.delete(key)));
  }));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).then(networkResponse => {
      return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        // No cachear la función de Netlify para tener siempre datos frescos
        if (!e.request.url.includes('/api/')) {
          cache.put(e.request, networkResponse.clone());
        }
        return networkResponse;
      });
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
