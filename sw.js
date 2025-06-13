const STATIC_CACHE_NAME = 'luna-static-v1';
const DYNAMIC_CACHE_NAME = 'luna-dynamic-v1';
const APP_SHELL = ['/', '/index.html', '/css/styles.css', '/js/main.js', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC_CACHE_NAME).then(c => c.addAll(APP_SHELL)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => {
    return Promise.all(keys.filter(key => key !== STATIC_CACHE_NAME).map(key => caches.delete(key)));
  }));
});

self.addEventListener('fetch', e => {
  // Estrategia Network falling back to cache
  e.respondWith(
    fetch(e.request).then(networkResponse => {
      return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
        cache.put(e.request.url, networkResponse.clone());
        return networkResponse;
      });
    }).catch(() => {
      return caches.match(e.request);
    })
  );
});
