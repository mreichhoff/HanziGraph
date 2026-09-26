// Explicit downloads outlive shell-cache updates. Bump the version only for an
// incompatible dictionary format, not for ordinary application releases.
export const offlineCacheName = dataset => `dictionary-explorer-v1-${dataset}`;
export function dictionaryPaths(dataset) {
    if (!['japanese', 'simplified', 'traditional', 'cantonese'].includes(dataset)) throw Error('Unknown language');
    const base = `/data/${dataset}/`;
    const files = ['definitions.json', 'sentences.json', dataset === 'japanese' ? 'explorer-word-order.json' : 'wordlist.json'];
    for (let i = 0; i < 100; i++) {
        files.push(`definitions/${i}.json`);
        if (dataset === 'japanese') files.push(`lexicon/${i}.json`);
        if (['simplified', 'traditional'].includes(dataset)) files.push(`${i}.json`);
    }
    if (dataset === 'japanese') files.push('explorer-index.json', 'explorer-character-ranks.json', 'explorer-glosses.json', 'kanji.json', 'lexicon/kana.json', 'explorer-sources.html');
    return files.map(file => base + file);
}
export async function missingPaths(cache, paths, origin) {
    const saved = new Set((await cache.keys()).map(request => request.url));
    return paths.filter(path => !saved.has(new URL(path, origin).href));
}
export async function downloadPaths(cache, paths, {signal, progress, fetcher = fetch}) {
    let next = 0, done = 0, failure;
    await Promise.allSettled(Array.from({length:4}, async () => {
        try {
            while (!failure && next < paths.length) {
                signal.throwIfAborted();
                const path = paths[next++];
                const response = await fetcher(path, {signal, cache:'no-store'});
                if (!response.ok) throw Error(`Could not download ${path}`);
                if (/\.(js|css)(\?|$)/.test(path) && response.headers.get('content-type')?.includes('text/html')) throw Error(`Invalid app file: ${path}`);
                // A hosting rewrite can return the app HTML for a missing JSON file.
                if (path.endsWith('.json')) await response.clone().json();
                if (path === '/explorer/' && !response.headers.get('content-type')?.includes('text/html')) throw Error('Could not save the Explorer page');
                signal.throwIfAborted();
                await cache.put(path, response);
                progress(++done);
            }
        } catch (error) { failure ||= error; }
    }));
    if (failure) throw failure;
}

export function initializeOffline(dataset) {
    const host = document.getElementById('offline-dictionary');
    const status = host.querySelector('[role="status"]');
    const download = host.querySelector('[data-download]');
    const cancel = host.querySelector('[data-cancel]');
    const remove = host.querySelector('[data-remove]');
    const name = {japanese:'Japanese', simplified:'Simplified Chinese', traditional:'Traditional Chinese', cantonese:'Cantonese'}[dataset];
    const shell = ['/explorer/', ...[...document.querySelectorAll('script[src], link[rel="stylesheet"]')].map(node => node.getAttribute('src') || node.getAttribute('href'))];
    const paths = [...shell, ...dictionaryPaths(dataset)];
    let controller;
    download.textContent = `Download ${name}`;
    if (!('caches' in window) || !('serviceWorker' in navigator)) {
        status.textContent = 'Offline downloads are unavailable in this browser.';
        download.disabled = true; return;
    }
    async function check() {
        const cache = await caches.open(offlineCacheName(dataset));
        const missing = await missingPaths(cache, paths, location.origin);
        const count = paths.length - missing.length;
        status.textContent = missing.length ? (count ? `Partial download · ${count}/${paths.length} files saved` : 'Download definitions, readings and examples for use without Wi-Fi.') : `${name} · Available offline`;
        download.hidden = !missing.length;
        download.textContent = count ? `Resume ${name} download` : `Download ${name}`;
        remove.hidden = !count;
        return {cache, missing, count};
    }
    download.addEventListener('click', async () => {
        controller = new AbortController();
        download.disabled = true; cancel.hidden = false; remove.hidden = true;
        try {
            if (!navigator.serviceWorker.controller?.scriptURL.endsWith('/explorer/sw.js')) throw Error('Reload Explorer once before downloading.');
            // Request retention where supported; completion still depends on actual cache contents.
            navigator.storage?.persist?.().catch(() => {});
            const {cache, missing, count} = await check();
            remove.hidden = true;
            await downloadPaths(cache, missing, {signal:controller.signal, progress:done => {
                status.textContent = `Downloading ${name} · ${count + done}/${paths.length} files. Keep this page open.`;
            }});
            await check();
        } catch (error) {
            controller.abort();
            status.textContent = error.name === 'AbortError' ? 'Download paused. Resume when you’re ready.' : `Download incomplete. ${error.name === 'QuotaExceededError' ? 'Not enough device storage.' : error.message} Retry to continue.`;
            download.hidden = false; download.textContent = 'Resume download'; remove.hidden = false;
        } finally { download.disabled = false; cancel.hidden = true; controller = null; }
    });
    cancel.addEventListener('click', () => controller?.abort());
    remove.addEventListener('click', async () => {
        try { await caches.delete(offlineCacheName(dataset)); await check(); }
        catch { status.textContent = 'Could not remove the download. Please retry.'; }
    });
    check().catch(() => { status.textContent = 'Device storage is unavailable.'; download.disabled = true; });
}
