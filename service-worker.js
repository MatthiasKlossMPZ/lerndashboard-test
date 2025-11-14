// service-worker.js
const VERSION = '1.5.3.28';  // Erhöhe bei jedem Update!
const CACHE_NAME = `lerndashboard-v${VERSION.replace(/\./g, '')}`;
const REPO_PATH = 'https://matthiasklossmpz.github.io/lerndashboard-test/';

const urlsToCache = [
  './',
  'index.html',
  'new-resource.html',
  'edit-resource.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png',
  'libs/jspdf.umd.min.js',
  'libs/jspdf.plugin.autotable.min.js',
  'libs/jszip.min.js',
  'libs/exceljs.min.js',
  'libs/FileSaver.min.js'
];

// === skipWaiting ===
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('skipWaiting()');
    self.skipWaiting();
  }
});

// === INSTALL === (DEIN BLOCK IST PERFEKT!)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          urlsToCache.map(url =>
            fetch(url, { cache: 'reload' })
              .then(response => {
                if (!response.ok) throw new Error(`Failed: ${response.status} ${url}`);
                return cache.put(url, response);
              })
              .catch(err => {
                console.warn('SW: Caching failed (OK if offline):', url, err);
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
      return self.clients.claim();
    }).then(() => {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'NEW_VERSION', version: VERSION });
        });
      });
    })
  );
});

// === FETCH ===
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Nur eigene Ressourcen
  if (url.origin === location.origin || url.href.includes('/lerndashboard-test/')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) {
        return cached; // CACHE ZUERST!
        }

        return fetch(event.request).then(response => {
          // Nur cachebare Antworten
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone(); // ZUERST KLONEN
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone).catch(err => {
                console.warn('Cache put failed:', err);
              });
            });
          }
          return response; // Dann zurückgeben
        }).catch(() => {
          return caches.match('index.html');
        });
      })
    );
  }
});