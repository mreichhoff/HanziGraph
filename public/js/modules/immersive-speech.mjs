const normalizeLanguage = language => language.toLowerCase().replace(/_/g, '-');
const isCantonese = language => language.startsWith('yue') || language === 'zh-hk' || language === 'zh-mo';

export function preferredVoice(voices, language) {
    const target = normalizeLanguage(language);
    const compatible = voices.filter(voice => {
        const lang = normalizeLanguage(voice.lang);
        if (target.startsWith('ja')) return lang === 'ja' || lang.startsWith('ja-');
        if (isCantonese(target)) return isCantonese(lang);
        return (lang === 'zh' || lang.startsWith('zh-') || lang.startsWith('cmn')) && !isCantonese(lang);
    });
    const google = compatible.filter(voice => /^Google\b/i.test(voice.name));
    const preferredName = target.startsWith('ja') ? 'Kyoko' : 'Tingting';
    return google.find(voice => normalizeLanguage(voice.lang) === target)
        || google[0]
        || compatible.find(voice => new RegExp(`^${preferredName}(?:$|\\s|\\()`, 'i').test(voice.name));
}

// Isolated Japanese kanji can be mistaken for names. Use the same first reading
// shown in the word heading; keep sentence text intact for contextual prosody.
export function textForSpeech(entry, dataset, isWord) {
    if (dataset === 'japanese' && isWord) {
        const reading = entry.reading?.split(' / ')[0]?.trim();
        if (reading) return reading;
    }
    return entry.text;
}
