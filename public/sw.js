const CACHE_NAME = 'todo-pwa-v2'; // Bumped version
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/icon.png'
];

self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    // Clear old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // For HTML and logic files, we prefer network to avoid stale hashes
    // For images/manifest, we can use cache-first
    const url = new URL(event.request.url);

    if (event.request.mode === 'navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then((response) => {
                return response || fetch(event.request);
            })
        );
    }
});
