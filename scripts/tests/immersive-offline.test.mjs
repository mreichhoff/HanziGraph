import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import vm from 'node:vm';
import {dictionaryPaths, downloadPaths, missingPaths, offlineCacheName} from '../../public/js/modules/immersive-offline.mjs';
test('each offline dictionary lists existing runtime files including all Japanese supplemental partitions', () => {
    for (const dataset of ['japanese','simplified','traditional','cantonese']) {
        const paths = dictionaryPaths(dataset);
        assert.equal(new Set(paths).size, paths.length);
        for (const path of paths) assert.ok(existsSync(new URL('../../public' + path, import.meta.url)), path);
    }
    assert.ok(dictionaryPaths('japanese').includes('/data/japanese/lexicon/99.json'));
    assert.throws(() => dictionaryPaths('../unknown'));
});
function memoryCache() {
    const data = new Map();
    return {data, keys: async () => [...data.keys()].map(path => ({url:new URL(path,'https://example.com').href})),
        put: async (path, response) => data.set(path, await response.text())};
}
test('download verifies JSON, retains completed files, and resumes only missing files', async () => {
    const cache = memoryCache(), paths = ['/a.json','/b.json'];
    const signal = new AbortController().signal;
    await assert.rejects(downloadPaths(cache,paths,{signal,progress(){},fetcher:async path => new Response(path === '/a.json' ? '{}' : '<html>rewrite</html>')}));
    assert.ok(cache.data.has('/a.json'));
    assert.ok(!cache.data.has('/b.json'));
    const missing = await missingPaths(cache,paths,'https://example.com');
    assert.deepEqual(missing,['/b.json']);
    await downloadPaths(cache,missing,{signal,progress(){},fetcher:async () => new Response('{}')});
    assert.deepEqual(await missingPaths(cache,paths,'https://example.com'),[]);
});
test('cancelled downloads do not start fetching or save responses', async () => {
    const controller = new AbortController(); controller.abort();
    const cache = memoryCache();
    await assert.rejects(downloadPaths(cache,['/a.json'],{signal:controller.signal,progress(){},fetcher(){assert.fail('fetch after cancel');}}),{name:'AbortError'});
    assert.equal(cache.data.size,0);
});
test('worker retains explicit packs on activation and serves their data and shell offline', async () => {
    const source = readFileSync(new URL('../../public/explorer/sw.js',import.meta.url),'utf8');
    const handlers = {}, deleted = [], pack = offlineCacheName('japanese');
    const context = vm.createContext({URL,Request,Response,Promise,setTimeout,
        self:{location:{hostname:'example.com',origin:'https://example.com'},clients:{claim:async()=>{}},addEventListener:(type,handler)=>handlers[type]=handler},
        fetch:async()=>{throw Error('offline');},
        caches:{keys:async()=>['explorer-old','explorer-1',pack,'hanzigraph-classic'],delete:async key=>deleted.push(key),open:async key=>({match:async request=>key===pack ? new Response(typeof request==='string' ? 'shell' : 'dictionary') : undefined})}});
    vm.runInContext(source,context);
    let pending;
    handlers.activate({waitUntil:p=>pending=p}); await pending;
    assert.deepEqual(deleted,['explorer-old']);
    assert.equal(await (await context.dictionaryFirst({request:new Request('https://example.com/data/japanese/definitions.json')})).text(),'dictionary');
    assert.equal(await (await context.networkFirst({request:new Request('https://example.com/explorer/japanese/学校'),waitUntil(){}},'/explorer/')).text(),'shell');
});
