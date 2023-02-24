let jiebaCut = null;

// lol
function vetCandidate(candidate) {
    if (!(candidate in wordSet)) {
        if (!isNaN(candidate)) {
            // it's not not a number, so ignore it.
            return [{ word: candidate, ignore: true }];
        }
        if (/^[\x00-\xFF]*$/.test(candidate)) {
            // it's not Chinese, so ignore it
            return [{ word: candidate, ignore: true }];
        }
        // For two character words not in the wordSet, just add individual characters.
        if (candidate.length === 2) {
            if (candidate[0] in wordSet && candidate[1] in wordSet) {
                return [candidate[0], candidate[1]];
            }
        }
        // it's not a number, it's not english or something, it's more than two characters, so not some trivial
        // fixup case...for now, ignore. We should probably handle 3 and 4 character non-wordSet candidates though.
        return [{ word: candidate, ignore: true }];
    }
    return [candidate];
}

function segment(text, locale) {
    if (!jiebaCut && (!Intl || !Intl.Segmenter)) {
        return [text];
    }
    text = text.replace(/[？。！，·【】；：、?,'!]/g, '');
    let candidates = [];
    let result = [];
    if (jiebaCut) {
        candidates = jiebaCut(text, true);
        for (const candidate of candidates) {
            result.push(...(vetCandidate(candidate)));
        }
    } else {
        const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
        candidates = Array.from(segmenter.segment(text));
        for (const candidate of candidates) {
            result.push(...(vetCandidate(candidate.segment)));
        }
    }

    return result;
}

async function initialize() {
    const { default: init,
        cut,
    } = await import("/js/external/jieba_rs_wasm.js");
    await init();
    jiebaCut = cut;
}

export { segment, initialize }