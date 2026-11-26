/* Al-Sajid Academy PWA Service Worker v9.0 */
const CACHE_NAME = 'alsajid-academy-v9';
const CORE_ASSETS = [
  './',
  './index.html',
  './quran-quest.html',
  './juz-amma-stories.js',
  './juz-tabarak-stories.js',
  './juz-28-stories.js',
  './juz-27-stories.js',
  './juz-26-stories.js',
  './juz-25-stories.js',
  './juz-24-stories.js',
  './juz-23-stories.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Never intercept external API calls (Google Apps Script, Quran API, EveryAyah MP3 streams)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-First for HTML, JS, and JSON so updates on GitHub Pages always show fresh immediately
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-First for static icons and images
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        }
        return res;
      });
    })
  );
});
