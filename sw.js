// Keeps Treasury working offline. Your cards are never sent anywhere.
const CACHE = 'treasury-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png',
  './cardo-latin-400-normal.woff2', './cardo-latin-400-italic.woff2', './cardo-latin-700-normal.woff2',
  './alegreya-sans-latin-400-normal.woff2', './alegreya-sans-latin-500-normal.woff2', './alegreya-sans-latin-700-normal.woff2',
  './unifrakturmaguntia-latin-400-normal.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network first for the page itself (so updates arrive), cache first for everything else.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  const fromNet = () => fetch(e.request).then(r => {
    if (r && r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  });
  if (isPage) {
    e.respondWith(fromNet().catch(() => caches.match(e.request, {ignoreSearch: true}).then(h => h || caches.match('./index.html'))));
  } else {
    e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(h => h || fromNet()));
  }
});
