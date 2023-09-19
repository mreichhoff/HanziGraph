function trimTone(pinyin) {
    return pinyin.substring(0, pinyin.length - 1);
}
// These rules based on https://pinyin.info/rules/initials_finals.html
const pinyinInitials = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'z', 'c',
    's', 'zh', 'ch', 'sh', 'r', 'j', 'q', 'x'].sort((a, b) => {
        // enable starts with comparisons in parsing via sorting by length descending
        // I think that ensures we'd choose e.g., zh, ch, or sh if applicable, instead of z, s, or c.
        return b.length - a.length;
    });
const pinyinFinals = ['a', 'o', 'e', 'ai', 'ei', 'ao', 'ou', 'an', 'ang', 'en', 'eng', 'ong', 'u', 'ua', 'uo', 'uai', 'ui', 'uan', 'uang', 'un', 'ueng', 'i', 'ia', 'ie', 'iao', 'iu', 'ian', 'iang', 'in', 'ing', 'iong', 'ü', 'üe', 'üan', 'ün'].sort((a, b) => {
    // similar to initials, enable ends-with comparisons in parsing via sorting by length descending
    // I think that ensures we'd choose e.g., uan, iong, or iao if applicable, instead of an, ong, or ao.
    return b.length - a.length;
});
// Per the above site, w and y initials actually aren't initials at all, but a spelling convention for certain
// standalone finals. The ü final with j, q, or x initials also loses its umlaut.
const pinyinSpecialCases = {
    // w convention...
    'wu': [null, 'u'],
    'wa': [null, 'ua'],
    'wo': [null, 'uo'],
    'wai': [null, 'uai'],
    'wei': [null, 'ui'],
    'wan': [null, 'uan'],
    'wang': [null, 'uang'],
    'wen': [null, 'un'],
    'weng': [null, 'ueng'],
    // y convention...
    'yi': [null, 'i'],
    'ya': [null, 'ia'],
    'ye': [null, 'ie'],
    'yao': [null, 'iao'],
    'you': [null, 'iu'],
    'yan': [null, 'ian'],
    'yang': [null, 'iang'],
    'yin': [null, 'in'],
    'ying': [null, 'ing'],
    'yong': [null, 'iong'],
    'yu': [null, 'ü'],
    'yue': [null, 'üe'],
    'yuan': [null, 'üan'],
    'yun': [null, 'ün'],
    // ü convention...
    // TODO: could probably simplify rather than directly looking up
    'ju': ['j', 'ü'],
    'jue': ['j', 'üe'],
    'juan': ['j', 'üan'],
    'jun': ['j', 'ün'],
    'qu': ['q', 'ü'],
    'que': ['q', 'üe'],
    'quan': ['q', 'üan'],
    'qun': ['q', 'ün'],
    'xu': ['x', 'ü'],
    'xue': ['x', 'üe'],
    'xuan': ['x', 'üan'],
    'xun': ['x', 'ün'],
}
function parsePinyin(pinyin) {
    if (pinyin === 'xx') {
        // This is a special CEDICT case for when pronunciation isn't known
        // (or so it seems)
        return [null, null];
    }
    pinyin = pinyin.replace('u:', 'ü')
    let initial;
    let final;
    if (pinyin in pinyinSpecialCases) {
        return pinyinSpecialCases[pinyin];
    }
    for (const candidate of pinyinInitials) {
        if (pinyin.startsWith(candidate)) {
            initial = candidate;
            break;
        }
    }
    for (const candidate of pinyinFinals) {
        if (pinyin.endsWith(candidate)) {
            final = candidate;
            break;
        }
    }
    return [initial, final];
}

export { parsePinyin, trimTone }