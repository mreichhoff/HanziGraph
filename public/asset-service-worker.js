// TODO: separate caches for code vs data?
const cacheName = 'hanzigraph-e0065d2d4565a33159e9b886b8574f1eeec07c22';
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

// add code assets to the cache. The user can also indicate they want to make data available offline via postMessage handlers
self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(cacheName).then((cache) =>
        cache.addAll([
            "/",
            "/index.html",
            "/css/hanzi-graph.css",
            // TODO: inline this
            "/js/data-load.js",
            // TODO: add to bundle
            "/js/external/cytoscape.min.js",
            "/manifest.json",
            "/js/bundle.js",
            "/js/modules/search-suggestions-worker.js",
        ]),
    ),
    );
});

async function checkHasPaths(event) {
    const cache = await caches.open(cacheName);
    const paths = event.data.paths;
    // returns array length 0 on multiple browsers, even when cached?!
    // const matches = await cache.matchAll(paths);
    let result = true;
    for (const path of paths) {
        const whyDoesntMatchAllWork = await cache.match(path);
        if (!whyDoesntMatchAllWork) {
            result = false;
            break;
        }
    }
    event.source.postMessage({
        type: 'checkHasPathsResponse',
        result
    });
}
async function getPaths(event) {
    const cache = await caches.open(cacheName);
    const paths = event.data.paths;
    let result = true;
    try {
        await cache.addAll(paths);
    } catch (e) {
        result = false;
    }
    event.source.postMessage({
        type: 'getPathsResponse',
        result
    });
}

self.addEventListener("message", (event) => {
    if (event.data.type === 'checkHasPaths') {
        checkHasPaths(event);
        return;
    }
    if (event.data.type === 'getPaths') {
        getPaths(event);
        return;
    }
});