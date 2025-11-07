const CACHE_NAME = 'lerndashboard-v47'; // Erhöhe bei jedem Update!

const urlsToCache = [
  '/',
  'index.html',
  'new-resource.html',
  'edit-resource.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
];

// INSTALL: Cache alles – mit Fehlerbehandlung
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Versuche zu cachen, aber ignoriere Fehler
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('[SW] Einige Dateien konnten nicht gecacht werden (offline?):', err);
          // Cache trotzdem öffnen
          return cache;
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE: Alte Caches löschen & sofort übernehmen
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(names => {
        return Promise.all(
          names.filter(name => name !== CACHE_NAME)
               .map(name => caches.delete(name))
        );
      }),
      self.clients.claim() // Sofort Clients übernehmen
    ])
  );
});

// FETCH: Aus Cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// NEU: Höre auf Messages vom Client (z.B. für force-skipWaiting)
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
