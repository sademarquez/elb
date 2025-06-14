const STATIC_CACHE_NAME = 'comunicaciones-luna-static-v1';
const DYNAMIC_CACHE_NAME = 'comunicaciones-luna-dynamic-v1';
// CORRECCIÓN: APP_SHELL más mínimo y seguro.
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js'
  // No incluimos iconos aquí, ya que si fallan, rompen toda la instalación del SW.
  // El navegador los cacheará por su cuenta si se usan.
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(STATIC_CACHE_NAME).then(c => {
    console.log('SW: Cacheando App Shell mínimo');
    return c.addAll(APP_SHELL);
  }).catch(err => {
    console.error('Fallo en cache.addAll:', err);
  }));
});

// ... (El resto de sw.js no cambia)
