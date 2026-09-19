// JapaneseGraph annotations use [表記|よ|み] alongside unannotated kana.
export function parseFurigana(text) {
    const parts = [];
    let end = 0;
    for (const match of text.matchAll(/\[([^\[\]]+)\]/g)) {
        if (match.index > end) parts.push({ text: text.slice(end, match.index), reading: '' });
        const [surface, ...readings] = match[1].split('|');
        parts.push({ text: surface, reading: readings.join('') });
        end = match.index + match[0].length;
    }
    if (end < text.length) parts.push({ text: text.slice(end), reading: '' });
    return parts;
}

export function normalizeKana(text) {
    return text.normalize('NFKC').replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

export function japaneseReadings(sentences) {
    const readings = new Map();
    const add = (word, reading) => {
        if (!reading || reading === word) return;
        if (!readings.has(word)) readings.set(word, new Set());
        readings.get(word).add(reading);
    };
    for (const sentence of sentences) {
        if (!sentence.fu) continue;
        const parts = parseFurigana(sentence.fu);
        if (parts.map(p => p.text).join('') !== sentence.zh.join('')) continue;
        let offset = 0;
        const spans = parts.map(part => {
            const start = offset;
            offset += part.text.length;
            add(part.text, part.reading);
            return { ...part, start, end: offset };
        });
        offset = 0;
        for (const word of sentence.zh) {
            const end = offset + word.length;
            const pieces = spans.filter(p => p.start < end && p.end > offset);
            // Never guess a reading for part of an annotated compound.
            if (pieces.every(p => !p.reading || (p.start >= offset && p.end <= end))) {
                add(word, pieces.map(p => p.reading || p.text.slice(Math.max(0, offset - p.start), Math.min(p.text.length, end - p.start))).join(''));
            }
            offset = end;
        }
    }
    return readings;
}

export function japaneseWordOrder(words, suppliedGraph) {
    const levels = new Map();
    for (const value of Object.values(suppliedGraph)) {
        for (const edge of Object.values(value.edges)) {
            for (const word of edge.words) levels.set(word, Math.min(levels.get(word) || 6, edge.word_level || 6));
        }
    }
    return [...words].sort((a, b) => (levels.get(a) || 7) - (levels.get(b) || 7));
}
