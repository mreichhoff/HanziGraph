const cacheName = 'hanzigraph-1a2a800325d7b1bf4b66e89220c32110f0e301e2';
self.addEventListener('fetch', (e) => {
    if (e.request.method === 'GET') {
        e.respondWith((async () => {
            const r = await caches.match(e.request);
            if (r) {
                return r;
            }
            const response = await fetch(e.request);
            const cache = await caches.open(cacheName);
            cache.put(e.request, response.clone());
            return response;
        })());
    }
});