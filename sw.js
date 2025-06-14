const STATIC_CACHE_NAME = 'luna-static-v3';
const DYNAMIC_CACHE_NAME = 'luna-dynamic-v3';
const APP_SHELL = [ '/', '/index.html', '/manifest.json', '/css/styles.css', '/js/main.js' ];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC_CACHE_NAME).then(c => c.addAll(APP_SHELL)).catch(err => console.error('Fallo en cache.addAll:', err)));
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
        if (!e.request.url.includes('/api/')) {
          cache.put(e.request.url, networkResponse.clone());
        }
        return networkResponse;
      });
    }).catch(() => caches.match(e.request))
  );
});
