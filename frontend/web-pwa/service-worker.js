// Liaison PWA service worker.
// Only registers on HTTPS/localhost (see registration gate in index.html).
// Bump CACHE on breaking changes to purge old caches.
const CACHE = 'liaison-v1';

self.addEventListener('install', (event) => {
  // Activate this SW immediately without waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop caches from previous versions.
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch API/cross-origin

  // Hashed, immutable build assets → cache-first.
  if (url.pathname.startsWith('/_expo/') || url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigations (SPA) → network-first so new deploys are picked up; fall back to
  // cached index.html when offline.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request));
    return;
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirstNavigate(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put('/index.html', res.clone());
    return res;
  } catch (e) {
    return (await cache.match('/index.html')) || Response.error();
  }
}
