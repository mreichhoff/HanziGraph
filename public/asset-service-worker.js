const cacheName = 'hanzigraph-7073a1e632f65bc4d85e816455c4ddd7b2a86c03';
self.addEventListener('fetch', (e) => {
    if (e.request.method === 'GET' && !e.request.url.includes('firestore')) {
        e.respondWith((async () => {
            const cache = await caches.open(cacheName);
            const r = await cache.match(e.request);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            cache.put(e.request, response.clone());
            return response;
        })());
    }
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (key !== cacheName) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
});
