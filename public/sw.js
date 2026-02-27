const CACHE_NAME = 'matjar-sayur-v2';
const PRECACHE_URLS = [
    '/',
    '/keranjang',
    '/histori',
    '/offline.html',
    '/manifest.json',
    '/icons/icon-192.svg',
    '/icons/icon-512.svg',
];

// Install — precache essential pages
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network-first with cache fallback + offline page
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Skip external requests (GAS API, fonts CDN, etc.)
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;

    // For navigation requests, use network-first with offline fallback
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() =>
                    caches.match(event.request).then((cached) =>
                        cached || caches.match('/offline.html')
                    )
                )
        );
        return;
    }

    // For assets (CSS, JS, images), use cache-first
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // Only cache successful responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => new Response('', { status: 408 }));
        })
    );
});
