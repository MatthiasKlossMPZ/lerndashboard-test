// service-worker.js

const REPO_PATH = 'https://matthiasklossmpz.github.io/lerndashboard-test/';
const VERSION = new URL(self.location).searchParams.get('v') || '1.5.3.1';
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
];

// ÄNDERUNG 2: skipWaiting() via Message empfangen
self.addEventListener('message', event => {
    if (event.data && event.data.action === 'skipWaiting') {
        console.log('skipWaiting() empfangen');
        self.skipWaiting();
    }
});

// INSTALL – KEIN automatisches skipWaiting!
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache.map(url => new Request(url, { credentials: 'omit' })));
        }).then(() => {
            console.log(`Service Worker v${VERSION} installiert – wartet auf Klick`);
        })
    );
});

// AKTIVIEREN – clients.claim() bleibt!
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => !key.startsWith(CACHE_NAME)).map(key => caches.delete(key))
        )).then(() => {
            console.log(`Service Worker v${VERSION} aktiviert`);
            return self.clients.claim();
        })
    );
});

// FETCH – bleibt unverändert
self.addEventListener('fetch', event => {
    const requestURL = new URL(event.request.url);
    if (requestURL.origin === location.origin || requestURL.hostname.includes('cdnjs.cloudflare.com')) {
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request).then(networkResponse => {
                    if (networkResponse.ok) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                    }
                    return networkResponse;
                });
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match(`${REPO_PATH}/index.html`);
                }
            })
        );
    }
});