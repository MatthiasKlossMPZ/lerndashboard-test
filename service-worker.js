// service-worker.js

const url = new URL(self.location.href);
const VERSION = url.searchParams.get('v') || '1.0.0';
const CACHE_NAME = `lerndashboard-v${VERSION.replace(/\./g, '')}`;

const urlsToCache = [
  '/',
  '/index.html',
  '/new-resource.html',
  '/edit-resource.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url).then(response => {
              if (!response.ok) throw new Error(`Failed: ${url}`);
              return cache.put(url, response);
            }).catch(err => {
              console.warn('Cache skip (404?):', url);
            });
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// FETCH – mit Offline-Fallback für Navigation
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
  }
});

// AKTIVIEREN – alten Cache löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});