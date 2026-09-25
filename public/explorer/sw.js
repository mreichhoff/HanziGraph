// Service worker for the installable explorer, kept apart from classic HanziGraph's
// /asset-service-worker.js. Living in /explorer/ caps its scope there, so the browser
// never lets it control a classic page, and it only touches caches with its own prefix.
const prefix = 'explorer-';
const cacheName = `${prefix}1`;
const shell = '/explorer/';
const cacheable = /^\/(?:css|data|explorer|images|js)\//;
// Local development always asks the server first, so edits show on the next reload.
const local = ['localhost', '127.0.0.1'].includes(self.location.hostname);

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => event.waitUntil((async () => {
    for (const key of await caches.keys())
        if (key.startsWith(prefix) && key !== cacheName) await caches.delete(key);
    await self.clients.claim();
})()));

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;
    if (request.mode === 'navigate') event.respondWith(networkFirst(event, shell, 4000));
    else if (cacheable.test(url.pathname)) event.respondWith(local ? networkFirst(event, request) : staleWhileRevalidate(event));
});

// Pages come from the network, so a deploy shows on the next launch. The saved copy
// answers offline, or when a stalled connection would otherwise hold up the launch.
// Every explorer URL serves the same page, so one saved shell covers them all.
async function networkFirst(event, key, patience = Infinity) {
    const cache = await caches.open(cacheName);
    const network = fetch(event.request).then(response => {
        const page = key !== shell || response.headers.get('content-type')?.includes('text/html');
        if (response.status === 200 && page) event.waitUntil(cache.put(key, response.clone()));
        return response;
    });
    event.waitUntil(network.catch(() => {}));
    const saved = await cache.match(key);
    if (!saved) return network;
    const fallback = network.catch(() => saved);
    if (!Number.isFinite(patience)) return fallback;
    return Promise.race([fallback, new Promise(resolve => setTimeout(resolve, patience, saved))]);
}

// Code and data answer from the cache at once and refresh in the background.
async function staleWhileRevalidate(event) {
    const cache = await caches.open(cacheName);
    const network = fetch(event.request).then(response => {
        if (response.status === 200) event.waitUntil(store(cache, event.request, response.clone()));
        return response;
    });
    event.waitUntil(network.catch(() => {}));
    return await cache.match(event.request) || network;
}

// A new ?v= build replaces the previous one instead of piling up beside it.
async function store(cache, request, response) {
    const url = new URL(request.url);
    if (url.searchParams.has('v')) for (const key of await cache.keys())
        if (new URL(key.url).pathname === url.pathname && key.url !== url.href) await cache.delete(key);
    await cache.put(request, response);
}
