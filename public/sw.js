// APMUSIC Progressive Web App Service Worker
const CACHE_NAME = 'apmusic-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Never cache API calls, audio streams, or third-party media.
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate'
    || requestUrl.pathname === '/'
    || requestUrl.pathname === '/index.html';

  event.respondWith(
    (isNavigation
      ? fetch(event.request, { cache: 'no-store' })
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', response.clone()));
            }
            return response;
          })
          .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
      : caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') return response;
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
            return response;
          });
        }))
  );
});
