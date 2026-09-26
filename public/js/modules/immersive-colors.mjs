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

// Frequency is an ordinal scale, so the ramp holds one hue and moves only in
// lightness: deep teal for the most common characters through to pale aqua for the
// rarest, so the order is readable from a node without consulting the legend. Each
// mode has its own steps, anchored so the far end still clears its own surface.
const frequencyRamps = {
    light: ['#004c61', '#006171', '#007680', '#218a8e', '#559d9c', '#80aeab'],
    dark: ['#4ec9e0', '#35b5c5', '#23a0aa', '#228a8f', '#2a7474', '#305e5b']
};
// The former warm-to-cool ramp: treated as "never customized" so it migrates.
const legacyFrequencies = ['#ff6b5e', '#ee858e', '#d79dbb', '#b2ace0', '#879fec', '#5894ef'];
export const defaultFrequencies = (isDark = false) => frequencyRamps[isDark ? 'dark' : 'light'];

export function frequencyOverrides(saved) {
    const colors = Array.isArray(saved) ? saved : saved?.version === 2 ? saved.colors : null;
    return frequencyRamps.light.map((_, index) => {
        const color = Array.isArray(colors) ? colors[index] : null;
        const legacy = Array.isArray(saved) && color?.toLowerCase() === legacyFrequencies[index];
        return isColor(color) && !legacy ? color.toLowerCase() : null;
    });
}

export function frequencyPalette(saved, isDark = false) {
    return defaultFrequencies(isDark).map((fallback, index) => isColor(saved?.[index]) ? saved[index].toLowerCase() : fallback);
}

export const kanjiFrequencyLimits = [50, 150, 400, 800, 1500];
export function kanjiFrequencyLevel(rank) {
    if (!Number.isFinite(rank) || rank <= 0) return 0;
    return [...kanjiFrequencyLimits, Infinity].findIndex(limit => rank <= limit) + 1;
}
// Unranked characters sit beyond the ramp, so they take a neutral rather than a step.
// Each mode's neutral still clears its own surface at the ramp's 2:1 floor.
export const unrankedKanjiColor = dark => dark ? '#858f95' : '#a5a5a5';
