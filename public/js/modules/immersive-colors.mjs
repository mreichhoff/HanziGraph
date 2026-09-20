export const defaultTones = ['#ff6b5e', '#35cf83', '#cf7af0', '#58a8ff', '#000000'];
const legacyTones = ['#dc493d', '#168454', '#a243ca', '#2474d5', '#65747e'];
const isColor = value => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

export function toneOverrides(saved) {
    const legacy = Array.isArray(saved);
    const colors = legacy ? saved : saved?.version === 2 ? saved.colors : null;
    return defaultTones.map((_, index) => {
        const color = Array.isArray(colors) ? colors[index] : null;
        return isColor(color) && !(legacy && color.toLowerCase() === legacyTones[index]) ? color : null;
    });
}

export function tonePalette(saved, isDark = false) {
    return defaultTones.map((fallback, index) =>
        Array.isArray(saved) && isColor(saved[index]) ? saved[index] : index === 4 && isDark ? '#ffffff' : fallback);
}

// Compare black and white using sRGB relative luminance. The stronger contrast
// always reaches at least 4.58:1 for an opaque color.
export function contrastingText(hex) {
    const linear = [1, 3, 5].map(offset => {
        const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
    });
    const luminance = .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
    return (luminance + .05) / .05 >= 1.05 / (luminance + .05) ? '#000000' : '#ffffff';
}

// Warm common characters transition through rose/lavender to cool rare ones.
export const defaultFrequencies = ['#ff6b5e', '#ee858e', '#d79dbb', '#b2ace0', '#879fec', '#5894ef'];
export function frequencyPalette(saved) {
    return defaultFrequencies.map((fallback, index) => Array.isArray(saved) && isColor(saved[index]) ? saved[index].toLowerCase() : fallback);
}

export const kanjiFrequencyLimits = [50, 150, 400, 800, 1500];
export function kanjiFrequencyLevel(rank) {
    if (!Number.isFinite(rank) || rank <= 0) return 0;
    return [...kanjiFrequencyLimits, Infinity].findIndex(limit => rank <= limit) + 1;
}
export const unrankedKanjiColor = dark => dark ? '#858f95' : '#c7cdd1';
