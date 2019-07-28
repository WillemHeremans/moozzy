

const cacheName = 'moozzy-cache-v1';
const contentToCache = [
  '/',
  '/favicon.ico',
  '/index.html',
  '/moozzy.webmanifest',
  '/css/style.css',
  '/js/database.js',
  '/js/metatag.js',
  '/js/player.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css',
  'https://use.fontawesome.com/releases/v5.7.2/css/all.css',
];

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[Service Worker] Caching all: app shell and content');
      return cache.addAll(contentToCache);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(r) {
      console.log('[Service Worker] Fetching resource: '+event.request.url);
      return r || fetch(event.request).then(function(response) {
        return caches.open(cacheName).then(function(cache) {
          console.log('[Service Worker] Caching new resource: '+ event.request.url);
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});