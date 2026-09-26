import test from 'node:test';
import assert from 'node:assert/strict';
import { readingParts, explorerLink, explorerPath, parseExplorerPath, firstGloss, edgeLabel } from '../../public/js/modules/immersive-card.mjs';
test('reading colors support numbered and accented pinyin without changing text', () => {
    for (const text of ['xue2xi2 de5 shi2hou5', 'nǐ hǎo, xuéxí!']) assert.equal(readingParts(text).map(p => p.text).join(''), text);
    assert.deepEqual(readingParts('xue2xi2 de5').filter(p => p.tone).map(p => p.tone), [2,2,5]);
    assert.deepEqual(readingParts('mā má mǎ mà ma').filter(p => p.tone).map(p => p.tone), [1,2,3,4,5]);
});
test('shared links carry the character set and exact word in the path, and nothing else', () => {
    const url = new URL(explorerLink('https://example.com/explorer/simplified/%E5%A5%BD?old=1#unused', 'japanese', '学校'));
    assert.equal(url.origin, 'https://example.com'); assert.equal(url.search, ''); assert.equal(url.hash, '');
    assert.equal(decodeURIComponent(url.pathname), '/explorer/japanese/学校');
});
test('explorer paths round-trip words, sentences and awkward characters', () => {
    const sets = ['simplified', 'traditional', 'cantonese', 'japanese'];
    for (const word of ['学校', 'がっこう', '私は学生です。', 'a/b', 'what?#x', '50% off', '']) {
        const pathname = new URL(explorerPath('japanese', word), 'https://example.com').pathname;
        assert.deepEqual(parseExplorerPath(pathname, sets, 'simplified'), { dataset: 'japanese', word });
    }
    // A "/" decoded somewhere along the way still reads back as part of the word.
    assert.deepEqual(parseExplorerPath('/explorer/japanese/a/b', sets, 'simplified'), { dataset: 'japanese', word: 'a/b' });
});
test('explorer paths tolerate missing, unknown and hand-typed pieces', () => {
    const sets = ['simplified', 'japanese'], read = path => parseExplorerPath(path, sets, 'simplified');
    assert.deepEqual(read('/explorer/'), { dataset: 'simplified', word: '' });
    assert.deepEqual(read('/explorer'), { dataset: 'simplified', word: '' });
    assert.deepEqual(read('/explorer/index.html'), { dataset: 'simplified', word: '' });
    assert.deepEqual(read('/explorer/japanese'), { dataset: 'japanese', word: '' });
    assert.deepEqual(read('/explorer/japanese/学校/'), { dataset: 'japanese', word: '学校' });
    assert.deepEqual(read('/explorer/%E5%AD%A6%E6%A0%A1'), { dataset: 'simplified', word: '学校' });
    assert.deepEqual(read('/explorer/japanese/100%'), { dataset: 'japanese', word: '100%' });
});

test('edge meanings are trimmed for an edge, and skipped when they will not fit', () => {
    // Dictionary glosses are written for a card: drop parentheticals and extra senses.
    assert.equal(firstGloss('holding (a conference, exhibition, etc.)'), 'holding');
    assert.equal(firstGloss('variety; kind; type'), 'variety');
    assert.equal(firstGloss('  spaced   out  '), 'spaced out');
    assert.equal(firstGloss('education.'), 'education');
    // Anything still long enough to swamp the graph is dropped rather than truncated.
    assert.equal(firstGloss('Hokkaido, island and prefectural-level administrative unit'), '');
    for (const junk of [undefined, null, 42, '', '()']) assert.equal(firstGloss(junk), '');

    assert.equal(edgeLabel('学習', 'learning'), '学習\nlearning');
    assert.equal(edgeLabel('学習', ''), '学習', 'no gloss leaves the bare word');
    assert.equal(edgeLabel('学習', firstGloss('Hokkaido, northernmost of the four main islands')), '学習');
    assert.equal(edgeLabel('', 'learning'), '');
});
