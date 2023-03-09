const maxRecommendations = 6;
let trie = {
    children: {},
    words: []
};
function queryTrie(term) {
    let node = trie;
    if (term.ignore) {
        return [];
    }
    for (const character of term) {
        if (character in node.children) {
            node = node.children[character]
        } else {
            return [];
        }
    }

    return node.words;
}
function getSuggestions(query, tokens) {
    if (!trie) {
        return [];
    }
    let suggestions = {};
    suggestions[query] = queryTrie(query);
    suggestions['tokenized'] = [];
    if (tokens.length > 1) {
        suggestions['tokenized'] = queryTrie(tokens[tokens.length - 1]);
    }
    return suggestions;
}
function buildTrie(wordSet) {
    let node = trie;
    // the wordset is sorted by frequency, so take the first N we encounter per path
    for (const word of Object.keys(wordSet).sort((a, b) => wordSet[a] - wordSet[b])) {
        for (const character of word) {
            if (!(character in node.children)) {
                node.children[character] = { children: {}, words: [] }
            }
            if (node.children[character].words.length < maxRecommendations) {
                node.children[character].words.push(word);
            }
            node = node.children[character];
        }
        node = trie;
    }
}
onmessage = function (e) {
    if (e.data.type === 'wordset') {
        buildTrie(e.data.payload);
    } else if (e.data.type === 'query') {
        postMessage({
            suggestions: getSuggestions(e.data.payload.query, e.data.payload.tokens),
            query: e.data.payload.query,
            tokens: e.data.payload.tokens
        });
    }
}