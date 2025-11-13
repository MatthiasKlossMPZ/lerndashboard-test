// service-worker.js
const REPO_PATH = 'https://matthiasklossmpz.github.io/lerndashboard-test/'; // ← Slash am Ende!
const VERSION = new URL(self.location).searchParams.get('v') || '1.5.3.7';
const CACHE_NAME = `lerndashboard-v${VERSION.replace(/\./g, '')}`;

const urlsToCache = [
  `${REPO_PATH}`,
  `${REPO_PATH}index.html`,
  `${REPO_PATH}new-resource.html`,
  `${REPO_PATH}edit-resource.html`,
  `${REPO_PATH}manifest.json`,
  `${REPO_PATH}icon-192.png`,
  `${REPO_PATH}icon-512.png`,
  `${REPO_PATH}icon-maskable-192.png`,
  `${REPO_PATH}icon-maskable-512.png`,
  // Lokale Bibliotheken
  `${REPO_PATH}libs/jspdf.umd.min.js`,
  `${REPO_PATH}libs/jspdf.plugin.autotable.min.js`,
  `${REPO_PATH}libs/jszip.min.js`,
  `${REPO_PATH}libs/exceljs.min.js`,
  `${REPO_PATH}libs/FileSaver.min.js`
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
      .then(cache => cache.addAll(urlsToCache))
      .then(() => {
        console.log(`SW v${VERSION} installiert`);
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'NEW_VERSION', version: VERSION });
          });
        });
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
      return self.clients.claim();
    })
  );
});

// === FETCH – nur eigene Dateien ===
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Nur Anfragen aus unserem Repo
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