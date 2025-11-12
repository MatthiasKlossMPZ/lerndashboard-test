// service-worker.js
<<<<<<< HEAD
const REPO_PATH = 'https://matthiasklossmpz.github.io/lerndashboard-test/';  // ← WICHTIG: GitHub Pages Pfad
const VERSION = new URL(self.location).searchParams.get('v') || '1.5.2.7';
const CACHE_NAME = `lerndashboard-v${VERSION.replace(/\./g, '')}`;

const urlsToCache = [
  `${REPO_PATH}/`,
  `${REPO_PATH}/index.html`,
  `${REPO_PATH}/new-resource.html`,
  `${REPO_PATH}/edit-resource.html`,
  `${REPO_PATH}/manifest.json`,
  `${REPO_PATH}/icon-192.png`,
  `${REPO_PATH}/icon-512.png`,
  `${REPO_PATH}/icon-maskable-192.png`,
  `${REPO_PATH}/icon-maskable-512.png`,

  // Externe Bibliotheken (für Offline!)
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js'
=======
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
>>>>>>> origin/main
];

// INSTALL
self.addEventListener('install', event => {
  event.waitUntil(
<<<<<<< HEAD
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache.map(url => new Request(url, { credentials: 'omit' })));
    }).then(() => self.skipWaiting())
=======
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
>>>>>>> origin/main
  );
});

// AKTIVIEREN – alten Cache löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
<<<<<<< HEAD
      keys.filter(key => !key.startsWith(CACHE_NAME)).map(key => caches.delete(key))
=======
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
>>>>>>> origin/main
    )).then(() => self.clients.claim())
  );
});

// FETCH – Navigation → immer index.html
self.addEventListener('fetch', event => {
<<<<<<< HEAD
  const requestURL = new URL(event.request.url);

  // Nur unsere Domain + CDN cachen
  if (requestURL.origin === location.origin || requestURL.hostname.includes('cdnjs.cloudflare.com')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(networkResponse => {
          // Cache erfolgreiche Antworten
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        });
      }).catch(() => {
        // Fallback: index.html bei 404
        if (event.request.mode === 'navigate') {
          return caches.match(`${REPO_PATH}/index.html`);
        }
      })
    );
  }
});
=======
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
>>>>>>> origin/main
