// Gloss relevance is independent of corpus rank; rank breaks ties between meanings.
export function englishMatch(glosses, query) {
    const normalize = value => value.toLowerCase().replace(/\([^)]*\)/g, '').replace(/^to\s+/, '').replace(/\s+/g, ' ').trim();
    const needle = normalize(query);
    if (!needle) return Infinity;
    const meanings = glosses.map(normalize);
    const exact = meanings.indexOf(needle);
    if (exact !== -1) return 2.5 + Math.min(exact, 3) * .15;
    if (meanings.some(value => value.startsWith(`${needle} `))) return 4;
    return meanings.some(value => (` ${value} `).includes(` ${needle} `)) ? 6 : Infinity;
}
