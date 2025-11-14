// service-worker.js
const REPO_PATH = 'https://matthiasklossmpz.github.io/lerndashboard-test/';
const VERSION = '1.5.3.11';
const CACHE_NAME = `lerndashboard-v${VERSION.replace(/\./g, '')}`;

const urlsToCache = [
  `${REPO_PATH}?v=${VERSION}`,
  `${REPO_PATH}index.html?v=${VERSION}`,
  `${REPO_PATH}new-resource.html?v=${VERSION}`,
  `${REPO_PATH}edit-resource.html?v=${VERSION}`,
  `${REPO_PATH}manifest.json?v=${VERSION}`,
  `${REPO_PATH}icon-192.png?v=${VERSION}`,
  `${REPO_PATH}icon-512.png?v=${VERSION}`,
  `${REPO_PATH}icon-maskable-192.png?v=${VERSION}`,
  `${REPO_PATH}icon-maskable-512.png?v=${VERSION}`,
  `${REPO_PATH}libs/jspdf.umd.min.js?v=${VERSION}`,
  `${REPO_PATH}libs/jspdf.plugin.autotable.min.js?v=${VERSION}`,
  `${REPO_PATH}libs/jszip.min.js?v=${VERSION}`,
  `${REPO_PATH}libs/exceljs.min.js?v=${VERSION}`,
  `${REPO_PATH}libs/FileSaver.min.js?v=${VERSION}`
];

// === skipWaiting ===
self.addEventListener('message', event => {
  if (event.data?.action === 'skipWaiting') {
    console.log('skipWaiting() empfangen');
    self.skipWaiting();
  }
});

// === INSTALL ===
self.addEventListener('install', event => {
  event.waitUntil(
  caches.open(CACHE_NAME)
    .then(cache => {
      // Einzeln fetchen → Fehler werden ignoriert (offline, 404, etc.)
      return Promise.allSettled(
        urlsToCache.map(url =>
          fetch(url, { cache: 'reload' })
            .then(response => {
              if (!response.ok) throw new Error(`Failed: ${response.status} ${url}`);
              return cache.put(url, response);
            })
            .catch(err => {
              console.warn('SW: Caching failed (OK if offline):', url, err);
              // Nicht abbrechen – weiter mit nächsten URLs
            })
        )
      );
    })
    .then(() => {
      console.log(`SW v${VERSION} installiert (fehlende Dateien ignoriert)`);
    })
);
});

// === ACTIVATE ===
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => {
      console.log(`SW v${VERSION} aktiviert`);
      // Nur senden, wenn Controller existiert → Update!
      if (navigator.serviceWorker.controller) {
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'NEW_VERSION', version: VERSION });
          });
        });
      }
      return self.clients.claim();
    })
  );
});

// === FETCH ===
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.href.startsWith(REPO_PATH)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        });
      }).catch(() => caches.match(`${REPO_PATH}index.html`))
    );
  }
});