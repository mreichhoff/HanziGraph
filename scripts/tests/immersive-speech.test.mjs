import test from 'node:test';
import assert from 'node:assert/strict';
import { preferredVoice, textForSpeech } from '../../public/js/modules/immersive-speech.mjs';
const voice = (name, lang) => ({name, lang});

test('Google voices take priority over named system voices for each language', () => {
    const voices = [voice('Kyoko', 'ja-JP'), voice('Tingting', 'zh-CN'), voice('Google 日本語', 'ja-JP'), voice('Google 普通话', 'zh-CN')];
    assert.equal(preferredVoice(voices, 'ja-JP'), voices[2]);
    assert.equal(preferredVoice(voices, 'zh-CN'), voices[3]);
});
test('Google matches prefer the requested region before other Mandarin voices', () => {
    const voices = [voice('Google 普通话', 'zh-CN'), voice('Google 國語', 'zh-TW')];
    assert.equal(preferredVoice(voices, 'zh-TW'), voices[1]);
    assert.equal(preferredVoice(voices.slice(0, 1), 'zh-TW'), voices[0]);
});
test('named fallbacks support enhanced variants and never cross languages', () => {
    const voices = [voice('Google US English', 'en-US'), voice('Kyoko (Enhanced)', 'ja_JP'), voice('Tingting', 'zh-CN')];
    assert.equal(preferredVoice(voices, 'ja-JP'), voices[1]);
    assert.equal(preferredVoice(voices, 'zh-TW'), voices[2]);
    assert.equal(preferredVoice(voices, 'zh-HK'), undefined);
    assert.equal(preferredVoice([voices[2]], 'ja-JP'), undefined);
    assert.equal(preferredVoice([], 'zh-CN'), undefined);
});
test('Cantonese uses a Cantonese Google voice without falling back to Mandarin', () => {
    const voices = [voice('Google 普通话', 'zh-CN'), voice('Google Cantonese', 'yue-HK')];
    assert.equal(preferredVoice(voices, 'zh-HK'), voices[1]);
    assert.equal(preferredVoice([voice('Other Japanese', 'ja-JP')], 'ja-JP'), undefined);
});

test('Japanese word audio follows the displayed reading while sentences retain context', () => {
    assert.equal(textForSpeech({text:'丈夫', reading:'じょうぶ / ますらお'}, 'japanese', true), 'じょうぶ');
    assert.equal(textForSpeech({text:'丈夫なかばんです。', reading:'じょうぶなかばんです。'}, 'japanese', false), '丈夫なかばんです。');
    assert.equal(textForSpeech({text:'丈夫', reading:''}, 'japanese', true), '丈夫');
    assert.equal(textForSpeech({text:'丈夫', reading:'zhang4 fu5'}, 'simplified', true), '丈夫');
});
