import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultTones, toneOverrides, tonePalette, contrastingText } from '../../public/js/modules/immersive-colors.mjs';

test('text color chooses the higher contrast option, including saturated colors', () => {
    for (const color of ['#ffffff', '#ffff00', '#00ff00', '#ff0000', '#777777']) assert.equal(contrastingText(color), '#000000');
    for (const color of ['#000000', '#0000ff', '#663399', '#757575']) assert.equal(contrastingText(color), '#ffffff');
});

test('saved tone palettes validate each color and retain neutral customization', () => {
    const saved = ['#ffffff', '#123456', 'invalid', null, '#abcdef'];
    assert.deepEqual(tonePalette(saved), ['#ffffff', '#123456', defaultTones[2], defaultTones[3], '#abcdef']);
    for (const invalid of [null, {}, 'bad', []]) assert.deepEqual(tonePalette(invalid), defaultTones);
    assert.notEqual(tonePalette(null), defaultTones);
});


test('bright tones always use black text and neutral follows the theme', () => {
    for (const dark of [false, true]) {
        const palette = tonePalette(null, dark);
        for (const color of palette.slice(0, 4)) assert.equal(contrastingText(color), '#000000');
        assert.equal(palette[4], dark ? '#ffffff' : '#000000');
        assert.equal(contrastingText(palette[4]), dark ? '#000000' : '#ffffff');
        assert.equal(tonePalette([null, null, null, null, '#123456'], dark)[4], '#123456');
    }
});

test('legacy defaults migrate while explicit custom colors survive', () => {
    const legacy = ['#dc493d', '#168454', '#a243ca', '#2474d5', '#65747e'];
    assert.deepEqual(toneOverrides(legacy), [null, null, null, null, null]);
    assert.equal(toneOverrides(['#abcdef', ...legacy.slice(1)])[0], '#abcdef');
    assert.equal(toneOverrides({ version: 2, colors: legacy })[4], '#65747e');
    assert.deepEqual(toneOverrides({version: 2, colors: 'invalid'}), [null, null, null, null, null]);
});

test('frequency ramps are per-mode ordinal scales that keep explicit customizations', async () => {
    const { defaultFrequencies, frequencyOverrides, frequencyPalette } = await import('../../public/js/modules/immersive-colors.mjs');
    for (const isDark of [false, true]) {
        const ramp = defaultFrequencies(isDark);
        assert.deepEqual(frequencyPalette(null, isDark), ramp);
        assert.equal(ramp.length, 6);
        // Ordinal ramps must move monotonically in lightness, or the order is unreadable.
        const luminance = hex => [1, 3, 5].map(o => parseInt(hex.slice(o, o + 2), 16) / 255)
            .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
            .reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
        const steps = ramp.map(luminance);
        for (let i = 1; i < steps.length; i++) {
            assert.ok(isDark ? steps[i] < steps[i - 1] : steps[i] > steps[i - 1],
                `${ramp[i - 1]} → ${ramp[i]} must continue the ramp in ${isDark ? 'dark' : 'light'} mode`);
        }
    }
    // The two modes are separate selections, not an automatic flip of one another.
    assert.notDeepEqual(defaultFrequencies(true), [...defaultFrequencies(false)].reverse());
    // Overrides survive a theme change; untouched slots follow the mode.
    const custom = frequencyOverrides({ version: 2, colors: ['#ABCDEF', 'invalid', null, null, null, null] });
    assert.deepEqual(custom, ['#abcdef', null, null, null, null, null]);
    for (const isDark of [false, true]) {
        assert.equal(frequencyPalette(custom, isDark)[0], '#abcdef');
        assert.equal(frequencyPalette(custom, isDark)[1], defaultFrequencies(isDark)[1]);
    }
    // A reader still on the old warm-to-cool defaults is migrated rather than pinned.
    const legacy = ['#ff6b5e', '#ee858e', '#d79dbb', '#b2ace0', '#879fec', '#5894ef'];
    assert.deepEqual(frequencyOverrides(legacy), [null, null, null, null, null, null]);
    assert.equal(frequencyOverrides(['#abcdef', ...legacy.slice(1)])[0], '#abcdef');
    for (const invalid of [null, {}, 'bad', []]) assert.deepEqual(frequencyPalette(frequencyOverrides(invalid)), defaultFrequencies(false));
});

test('kanji rank bands have stable boundaries and distinguish missing ranks', async () => {
    const {kanjiFrequencyLevel, unrankedKanjiColor} = await import('../../public/js/modules/immersive-colors.mjs');
    assert.deepEqual([1,50,51,150,151,400,401,800,801,1500,1501].map(kanjiFrequencyLevel), [1,1,2,2,3,3,4,4,5,5,6]);
    for (const rank of [undefined,0,NaN,Infinity,-1]) assert.equal(kanjiFrequencyLevel(rank),0);
    assert.equal(contrastingText(unrankedKanjiColor(false)), '#000000');
    // Unranked characters are a neutral beyond the ramp, but must still read as marks.
    const luminance = hex => [1, 3, 5].map(o => parseInt(hex.slice(o, o + 2), 16) / 255)
        .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4)
        .reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
    const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };
    assert.ok(ratio(unrankedKanjiColor(false), '#f5f3ee') >= 2, 'light neutral clears the paper');
    assert.ok(ratio(unrankedKanjiColor(true), '#142321') >= 2, 'dark neutral clears the dark ground');
});
