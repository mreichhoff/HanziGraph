import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseFurigana, normalizeKana, japaneseReadings, japaneseWordOrder } from '../../public/js/modules/immersive-japanese.mjs';
import { buildExplorerGraph } from '../../public/js/modules/immersive-geometry.mjs';

test('furigana preserves compounds, kana, punctuation, and supplementary kanji', () => {
    assert.deepEqual(parseFurigana('[学校|がっ|こう]で[𠮷|よし]。'), [
        {text:'学校', reading:'がっこう'}, {text:'で', reading:''},
        {text:'𠮷', reading:'よし'}, {text:'。', reading:''}
    ]);
});
test('reading index joins okurigana without inventing partial compound readings', () => {
    const index = japaneseReadings([{fu:'[学校|がっ|こう]で[食|た]べる。', zh:['学','校','で','食べる','。']}]);
    assert.deepEqual([...index.get('学校')], ['がっこう']);
    assert.deepEqual([...index.get('食べる')], ['たべる']);
    assert.equal(index.has('学'), false);
    assert.equal(normalizeKana('ｶﾞｯｺｳ'), 'がっこう');
});
test('Japanese data supports school search and a kanji-only graph', () => {
    const load = name => JSON.parse(readFileSync(new URL(`../../public/data/japanese/${name}.json`, import.meta.url)));
    const words = japaneseWordOrder(load('wordlist'), load('graph'));
    const graph = buildExplorerGraph(words);
    assert.ok(graph['学'].edges['校']);
    assert.ok(!graph['が']);
    const readings = japaneseReadings(load('sentences'));
    assert.ok(readings.get('学校').has('がっこう'));
    assert.ok(load('definitions')['学校'][0].en.includes('school'));
});
