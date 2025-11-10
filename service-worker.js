// service-worker.js
const CACHE_NAME = 'lerndashboard-v1';

const urlsToCache = [
  '/',                     // WICHTIG: Root-Pfad!
  '/index.html',           // Fallback
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
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// AKTIVIEREN – alten Cache löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

// FETCH – Navigation → immer index.html
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/'))
    );
  } else {
    event.respondWith(
      caches.match(req).then(resp => resp || fetch(req))
    );
  }
});