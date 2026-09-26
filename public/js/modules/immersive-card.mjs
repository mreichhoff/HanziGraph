export function readingParts(text) {
    const parts = [];
    const pattern = /[a-züvāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜê:]+[1-5]?/gi;
    let end = 0;
    for (const match of text.matchAll(pattern)) {
        if (match.index > end) parts.push({text:text.slice(end, match.index)});
        const marked = match[0].normalize('NFD');
        const toneMarks = new Set([...marked].filter(c => ['\u0304','\u0301','\u030c','\u0300'].includes(c)));
        const tone = toneMarks.size > 1 ? undefined : Number(match[0].match(/[1-5]$/)?.[0]) || (marked.includes('\u0304') ? 1 : marked.includes('\u0301') ? 2 : marked.includes('\u030c') ? 3 : marked.includes('\u0300') ? 4 : 5);
        parts.push({text:match[0], tone}); end = match.index + match[0].length;
    }
    if (end < text.length) parts.push({text:text.slice(end)});
    return parts;
}
// Explorer addresses are /explorer/{character set}/{word}. The word is one encoded
// segment, but everything after the set is read as the word, so a "/" inside a
// sentence survives even if something along the way decodes it.
export function explorerPath(dataset, word = '') {
    return `/explorer/${dataset}/${word ? encodeURIComponent(word) : ''}`;
}
export function parseExplorerPath(pathname, datasets, fallback) {
    const rest = pathname.replace(/^\/explorer\/?/, '').replace(/^index\.html$/, '').split('/');
    const dataset = datasets.includes(rest[0]) ? rest.shift() : fallback;
    let word = rest.join('/').replace(/\/$/, '');
    try { word = decodeURIComponent(word); } catch { /* Keep a malformed escape as typed. */ }
    return { dataset, word: word.trim().slice(0, 1000) };
}
export function explorerLink(location, dataset, word) {
    return new URL(explorerPath(dataset, word), location).href;
}

export function rememberedExplorerRoute(pathname, datasets, storage) {
    let fallback = 'simplified';
    try {
        const saved = storage.getItem('immersive-dataset');
        if (datasets.includes(saved)) fallback = saved;
    } catch { /* Storage may be blocked; explicit links still work. */ }
    const route = parseExplorerPath(pathname, datasets, fallback);
    try { storage.setItem('immersive-dataset', route.dataset); } catch { /* Session only. */ }
    return route;
}

// An edge can carry the word's meaning under the word itself. Dictionary glosses are
// written for a card, not an edge, so parentheticals and extra senses are dropped and
// anything still too long is skipped rather than allowed to swamp the graph.
export function firstGloss(text, limit = 24) {
    if (typeof text !== 'string') return '';
    const gloss = text.replace(/\([^)]*\)/g, ' ').split(';')[0].replace(/\s+/g, ' ').trim().replace(/[,;.]$/, '');
    return gloss.length && gloss.length <= limit ? gloss : '';
}
export function edgeLabel(word, gloss) {
    return word && gloss ? `${word}\n${gloss}` : word;
}
