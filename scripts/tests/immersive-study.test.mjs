import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {englishMatch} from '../../public/js/modules/immersive-search.mjs';
import {exampleTokens} from '../../public/js/modules/immersive-japanese.mjs';
import {buildExplorerGraph,wordConnections} from '../../public/js/modules/immersive-geometry.mjs';
const load = name => JSON.parse(readFileSync(new URL(`../../public/data/japanese/${name}.json`, import.meta.url)));

test('English search treats dictionary infinitives as exact meanings, without matching eat inside unrelated words', () => {
    assert.equal(englishMatch(['to eat','to live on'], 'eat'), 2.5);
    assert.ok(englishMatch(['to eat'], 'eat') < englishMatch(['eating room'], 'eat'));
    assert.equal(englishMatch(['heart','great'], 'eat'), Infinity);
    const index=load('explorer-index'), defs=load('definitions');
    const search = q => index.searchOrder.map(word => ({word, score:englishMatch(defs[word].flatMap(d=>d.en.split(';')),q) + ([...word].length===1 ? .2 : 0)})).filter(x=>Number.isFinite(x.score)).sort((a,b)=>a.score-b.score).slice(0,7).map(x=>x.word);
    assert.equal(search('eat')[0], '食べる');
    assert.ok(search('friend').includes('友達'));
    assert.ok(search('new').includes('新しい'));
});
test('all graph characters survive vocabulary curation and explicit searches retain excluded spellings', () => {
    const words=load('explorer-word-order'), index=load('explorer-index');
    assert.deepEqual(new Set(words),new Set(load('wordlist')));
    const all=buildExplorerGraph(words), curated=buildExplorerGraph(words,new Set(index.excludedEdges));
    assert.deepEqual(new Set(Object.keys(curated)),new Set(Object.keys(all)));
    assert.equal(curated['学'].edges['校'].words[0], '学校');
    assert.ok(!curated['学'].edges['高'].words.some(w=>w.length>6));
    assert.ok(curated['學']);
    assert.equal(wordConnections('學校',new Set(['學','校']))[0].label,'學校');
});
test('precomputed readings and kanji vocabulary avoid okurigana fragments', () => {
    const index=load('explorer-index'), kanji=load('kanji');
    assert.ok(!index.readings['行'].includes('い'));
    assert.ok(!index.readings['新'].includes('あたら'));
    assert.deepEqual(index.readings['学校'],['がっこう']);
    assert.ok(kanji['学'].on.includes('ガク'));
    assert.ok(kanji['学'].kun.includes('まな.ぶ'));
    assert.ok(kanji['学'].words.includes('学ぶ'));
    assert.ok(kanji['大'].words.includes('大きい'));
});
test('clickable examples preserve exact text and never split compound furigana', () => {
    const sentence={zh:['学','校','で','食べる','。'],fu:'[学校|がっ|こう]で[食|た]べる。'};
    const tokens=exampleTokens(sentence);
    assert.deepEqual(tokens.map(t=>t.text),['学校','で','食べる','。']);
    assert.equal(tokens.map(t=>t.text).join(''),sentence.zh.join(''));
    assert.deepEqual(tokens[2].parts,[{text:'食',reading:'た'},{text:'べる',reading:''}]);
    assert.equal(exampleTokens({...sentence,fu:'[別|べつ]'}).flatMap(t=>t.parts).every(p=>!p.reading),true);
    assert.deepEqual(exampleTokens({zh:['我','学习','。']}).map(t=>t.text),['我','学习','。']);
});
