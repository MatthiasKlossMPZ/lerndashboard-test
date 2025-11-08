// service-worker.js

const url = new URL(self.location.href);
const VERSION = url.searchParams.get('v') || '1.0.0';
const CACHE_NAME = `lerndashboard-v${VERSION.replace(/\./g, '')}`;

const urlsToCache = [
  'index.html',
  'new-resource.html',
  'edit-resource.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

// INSTALL – mit Fehlerbehandlung
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