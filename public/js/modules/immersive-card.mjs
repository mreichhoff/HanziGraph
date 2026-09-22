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
export function explorerLink(location, dataset, word) {
    const url = new URL(location);
    url.search = ''; url.hash = '';
    url.searchParams.set('set', dataset); url.searchParams.set('word', word);
    return url.href;
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
