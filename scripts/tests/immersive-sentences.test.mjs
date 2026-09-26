import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {searchKind, sentenceWords, validateAnalysis} from '../../public/js/modules/immersive-sentences.mjs';
import {analyzeSentence} from '../../public/js/modules/immersive-integrations.mjs';
const sentence = '学校に行きました。';
const analysis = {translation:'I went to school.', explanation:'Polite past tense.', reading:'がっこうにいきました。', words:[
    {text:'学校', lemma:'学校', reading:'がっこう', meaning:'school', explanation:'Destination.'},
    {text:'に', lemma:'に', reading:'に', meaning:'to', explanation:'Marks the destination.'},
    {text:'行きました', lemma:'行く', reading:'いきました', meaning:'went', explanation:'Polite past of 行く.'},
    {text:'。', lemma:'', reading:'', meaning:'', explanation:''}
]};
test('exact vocabulary wins over sentence routing, including kana-only words', () => {
    const known = new Set(['ありがとう','学校','年轻']);
    assert.equal(searchKind('ありがとう', known, 'japanese'), 'word');
    assert.equal(searchKind(sentence, known, 'japanese'), 'sentence');
    assert.equal(searchKind('ありがとう。', known, 'japanese'), 'sentence');
    assert.equal(searchKind('我今天去学校。', known, 'simplified'), 'sentence');
    assert.equal(searchKind('ngo5', known, 'cantonese'), 'lookup');
    assert.equal(searchKind('school', known, 'japanese'), 'lookup');
    assert.equal(searchKind('a', known, 'japanese'), 'lookup');
});
test('segmentation finds graph words without expanding the whole sentence', () => {
    assert.equal(sentenceWords('わたしは学校に行く。', 'japanese').find(word => /\p{Script=Han}/u.test(word)), '学校');
    assert.equal(sentenceWords('我今天去学校。', 'simplified')[0], '我');
});
test('analysis rejects changed text, dropped punctuation, missing readings and invalid tokens', () => {
    assert.equal(validateAnalysis(analysis, sentence), analysis);
    assert.throws(() => validateAnalysis({...analysis, words:analysis.words.slice(0, -1)}, sentence), /changed the sentence/);
    assert.throws(() => validateAnalysis({...analysis, reading:''}, sentence), /incomplete/);
    assert.throws(() => validateAnalysis({...analysis, words:[null]}, sentence), /incomplete/);
    assert.throws(() => validateAnalysis(null, sentence), /incomplete/);
});
test('sentence requests use configurable prompts, selected language and strict schema', async () => {
    for (const dataset of ['japanese','simplified','traditional','cantonese']) {
        const result = await analyzeSentence({aiEndpoint:'http://localhost:1234/v1/', aiModel:'test', sentencePrompt:'Analyze {context}'}, dataset, sentence, undefined, async (url, options) => {
            const body = JSON.parse(options.body);
            assert.equal(url, 'http://localhost:1234/v1/chat/completions');
            assert.equal(body.response_format.json_schema.strict, true);
            assert.ok(body.messages[1].content.startsWith(`Analyze "${sentence}"`));
            assert.match(body.messages[0].content, dataset === 'japanese' ? /hiragana/ : dataset === 'cantonese' ? /jyutping/ : /pinyin/);
            return {ok:true, json:async () => ({choices:[{message:{content:JSON.stringify(analysis)}}]})};
        });
        assert.deepEqual(result, analysis);
    }
});
test('Japanese supplement contains kana vocabulary and dictionary readings', () => {
    const kana = JSON.parse(readFileSync(new URL('../../public/data/japanese/lexicon/kana.json', import.meta.url)));
    for (const word of ['ありがとう','こんにちは','そして','とても']) {
        assert.ok(kana.includes(word), word);
        const part = [...word].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 100;
        const data = JSON.parse(readFileSync(new URL(`../../public/data/japanese/lexicon/${part}.json`, import.meta.url)));
        assert.ok(data[word].definitions.length, word);
    }
    const word = '丈夫', part = [...word].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 100;
    const data = JSON.parse(readFileSync(new URL(`../../public/data/japanese/lexicon/${part}.json`, import.meta.url)));
    assert.ok(data[word].readings.includes('じょうぶ'));
});
test('sentence analysis reports malformed responses and honors cancellation', async () => {
    const settings = {aiEndpoint:'http://localhost:1234/v1', aiModel:'test'};
    await assert.rejects(analyzeSentence(settings, 'japanese', sentence, undefined, async () => ({ok:true, json:async () => ({choices:[{message:{content:'not JSON'}}]})})), /sentence JSON/);
    const controller = new AbortController();
    const pending = analyzeSentence(settings, 'japanese', sentence, controller.signal, async (url, options) => new Promise((resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')), {once:true})));
    controller.abort();
    await assert.rejects(pending, /cancelled or timed out/);
});

test('dictionary forms keep target-language lemmas and discard English glosses', async () => {
    const {dictionaryForm} = await import('../../public/js/modules/immersive-sentences.mjs');
    assert.equal(dictionaryForm({text:'行きました', lemma:'行く'}, 'japanese'), '行く');
    assert.equal(dictionaryForm({text:'後ろ', lemma:'behind, back'}, 'japanese'), '後ろ');
    assert.equal(dictionaryForm({text:'後ろ', lemma:'後ろ (behind)'}, 'japanese'), '後ろ');
    assert.equal(dictionaryForm({text:'學校', lemma:'school'}, 'traditional'), '學校');
    assert.equal(dictionaryForm({text:'コーヒー', lemma:'コーヒー'}, 'japanese'), 'コーヒー');
});
