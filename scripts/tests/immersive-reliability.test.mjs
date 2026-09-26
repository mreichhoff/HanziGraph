import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { rememberedExplorerRoute } from '../../public/js/modules/immersive-card.mjs';

const sets = ['simplified', 'traditional', 'cantonese', 'japanese'];
test('bare launches remember language while shared links and shortcuts override it', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
    const route = path => rememberedExplorerRoute(path, sets, storage);
    assert.deepEqual(route('/explorer/'), { dataset: 'simplified', word: '' });
    route('/explorer/japanese/学校');
    assert.equal(route('/explorer/').dataset, 'japanese');
    assert.deepEqual(route('/explorer/traditional/學'), { dataset: 'traditional', word: '學' });
    assert.equal(route('/explorer/index.html').dataset, 'traditional');
    values.set('immersive-dataset', 'invalid');
    assert.equal(route('/explorer/').dataset, 'simplified');
});
test('blocked storage does not break launches or explicit language selection', () => {
    const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
    for (const storage of [undefined, blocked]) {
        assert.equal(rememberedExplorerRoute('/explorer/', sets, storage).dataset, 'simplified');
        assert.equal(rememberedExplorerRoute('/explorer/japanese/学', sets, storage).dataset, 'japanese');
    }
});
test('classic worker removes only its own old caches', async () => {
    const handlers = {}, removed = [];
    const source = readFileSync(new URL('../../public/asset-service-worker.js', import.meta.url), 'utf8');
    const current = source.match(/const cacheName = '([^']+)'/)[1];
    vm.runInNewContext(source, {
        self: { addEventListener: (name, handler) => { handlers[name] = handler; } },
        caches: { keys: async () => [current, 'hanzigraph-old', 'explorer-1', 'another-app'], delete: async key => removed.push(key) }
    });
    let pending;
    handlers.activate({ waitUntil: promise => { pending = promise; } });
    await pending;
    assert.deepEqual(removed, ['hanzigraph-old']);
});
test('history restoration uses search framing under replace mode without adding history', async () => {
    const source = readFileSync(new URL('../../public/js/modules/immersive.js', import.meta.url), 'utf8');
    // Exercise the real browser coordinator with its UI dependencies stubbed.
    const restore = source.slice(source.indexOf('async function restore(word)'), source.indexOf('// Some browsers collect'));
    const searches = [], input = {};
    const context = vm.createContext({ historyMode: 'push', $: () => input,
        submitSearch: async word => { searches.push([word, context.historyMode]); },
        closeAll() {}, connect() {}, refresh() {}, record() {} });
    vm.runInContext(restore, context);
    await context.restore('学校');
    assert.deepEqual(searches, [['学校', 'replace']]);
    assert.equal(input.value, '学校');
    assert.equal(context.historyMode, 'push');
    await context.restore('');
    assert.equal(searches.length, 1);
});
