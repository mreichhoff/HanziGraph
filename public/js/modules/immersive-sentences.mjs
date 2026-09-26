// Dictionary matches take precedence over sentence analysis, including kana words.
export function searchKind(query, knownWords, dataset) {
    const native = dataset === 'japanese' ? /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u : /\p{Script=Han}/u;
    if (knownWords.has(query) || ([...query].length === 1 && native.test(query))) return 'word';
    return native.test(query) ? 'sentence' : 'lookup';
}

export function sentenceWords(text, dataset) {
    return [...new Intl.Segmenter(dataset === 'japanese' ? 'ja' : 'zh', {granularity:'word'}).segment(text)]
        .filter(part => part.isWordLike).map(part => part.segment);
}

export function validateAnalysis(value, original) {
    const invalid = () => { throw new Error('The model returned an incomplete analysis or changed the sentence. Please retry or choose a model with structured output support.'); };
    if (!value || !['translation', 'explanation', 'reading'].every(key => typeof value[key] === 'string' && value[key].trim())) invalid();
    if (!Array.isArray(value.words) || !value.words.length || value.words.length > original.length) invalid();
    if (!value.words.every(word => word && ['text','lemma','reading','meaning','explanation'].every(key => typeof word[key] === 'string') && word.text.length)) invalid();
    if (value.words.map(word => word.text).join('') !== original) invalid();
    return value;
}

// A lemma is a target-language headword, never an English definition.
export function dictionaryForm(token, dataset) {
    const lemma = token.lemma?.trim();
    if (!lemma) return token.text;
    const native = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u;
    const allowed = dataset === 'japanese'
        ? /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{M}ー々〆ヶ]+$/u
        : /^[\p{Script=Han}\p{M}]+$/u;
    if (native.test(token.text) && !allowed.test(lemma)) return token.text;
    return lemma;
}
