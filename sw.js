const CACHE = 'hg-dashboard-v3';
const ASSETS = ['/neng-sale-online/', '/neng-sale-online/icon.png', '/neng-sale-online/manifest.json'];

// Install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Handle messages from main thread (for manual refresh)
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (e.data === 'CLEAR_CACHE') {
    e.waitUntil(
      caches.keys().then(keys =>
        Promise.all(keys.map(k => caches.delete(k)))
      )
    );
  }
});

// Fetch: network first (always get latest data), fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and Supabase API requests (always need live data)
  if (e.request.method !== 'GET') return;
  if (e.request.url.includes('supabase.co')) return;
  if (e.request.url.includes('fonts.googleapis.com')) return;
  if (e.request.url.includes('cdn.jsdelivr.net')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache a copy of the response
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
