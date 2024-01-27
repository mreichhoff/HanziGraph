const maxRecommendations = 12;
// allow more matches for pinyin, given that we support tone-less queries,
// where you're far more likely to have many matches.
const maxPinyinMatches = 25;
let trie = {
    children: {},
    words: []
};
// Used if there's no exact match. We can still attempt a lookup by prefix
// example: user enters "w" with no further context...could suggest 我
let pinyinTrie = {
    children: {},
    words: []
};
let pinyinMap = {};
let jiebaCut = null;
let wordSet = null;

function segment(text, locale) {
    if (!jiebaCut && (!Intl || !Intl.Segmenter)) {
        return [text];
    }
    text = text.replace(/[？。！，·【】；：、?,'!]/g, '');
    let candidates = [];
    let result = [];
    if (jiebaCut) {
        candidates = jiebaCut(text, true);
    } else {
        const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
        candidates = Array.from(segmenter.segment(text)).map(x => x.segment);
    }
    for (const candidate of candidates) {
        result.push(...(vetCandidate(candidate)));
    }
    return result;
}

function looksLikeEnglish(value) {
    return /^[\x00-\xFF]*$/.test(value);
}

// lol
function vetCandidate(candidate) {
    if (!(candidate in wordSet)) {
        if (!isNaN(candidate)) {
            // it's not not a number, so ignore it.
            return [{ word: candidate, ignore: true }];
        }
        if (looksLikeEnglish(candidate)) {
            // it's ascii, not Chinese, so ignore it
            // TODO: just use ! in_chinese_char_range
            return [{ word: candidate, ignore: true }];
        }
        // For two character words not in the wordSet, just add individual characters.
        if (candidate.length === 2) {
            if (candidate[0] in wordSet && candidate[1] in wordSet) {
                return [candidate[0], candidate[1]];
            }
        } else if (candidate.length === 3) {
            let first = candidate[0];
            let last = candidate.substring(1);
            if (first in wordSet && last in wordSet) {
                return [first, last];
            }
            first = candidate.substring(0, 2);
            last = candidate.substring(2);
            if (first in wordSet && last in wordSet) {
                return [first, last];
            }
            if (candidate[0] in wordSet && candidate[1] in wordSet && candidate[2] in wordSet) {
                return [candidate[0], candidate[1], candidate[2]];
            }
        } else if (candidate.length === 4) {
            let first = candidate.substring(0, 2);
            let last = candidate.substring(2);
            if (first in wordSet && last in wordSet) {
                return [first, last]
            }
            if (candidate[0] in wordSet && candidate[1] in wordSet && candidate[2] in wordSet && candidate[3] in wordSet) {
                return [candidate[0], candidate[1], candidate[2], candidate[3]];
            }
        }
        // it's not a number, it's not english or something, it's not trivially repaired...ignore
        return [{ word: candidate, ignore: true }];
    }
    return [candidate];
}

function queryTrie(term, trieRoot) {
    let node = trieRoot;
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

    return node.words || [];
}
function queryPinyinMap(term) {
    if (!(term in pinyinMap)) {
        return [];
    }
    const result = pinyinMap[term];
    if (result.size > maxRecommendations) {
        // this actually seems to work even on empty arrays, but that just looks wrong
        return Array.from(result).slice(0, maxRecommendations);
    }
    return Array.from(result);
}
function isEmptySuggestions(suggestions, query) {
    return suggestions[query].length <= 0 && suggestions['tokenized'].length <= 0
}
function getSuggestions(query, tokens) {
    if (!trie) {
        return [];
    }
    let suggestions = {};
    suggestions[query] = queryTrie(query, trie);
    suggestions['tokenized'] = [];
    if (tokens.length > 1) {
        suggestions['tokenized'] = queryTrie(tokens[tokens.length - 1], trie);
    }
    // we got nothing from the chinese search, so let's try pinyin...
    // first try, with exact matches
    if (isEmptySuggestions(suggestions, query)) {
        suggestions[query] = queryPinyinMap(query);
        suggestions['tokenized'] = [];
        if (tokens.length > 1) {
            suggestions['tokenized'] = queryPinyinMap(tokens[tokens.length - 1]);
        }
        if (suggestions[query].length < maxRecommendations) {
            const prefixSuggestions = queryTrie(query, pinyinTrie);
            // this does allow us to go over maxRecommendations, but who cares
            prefixSuggestions.forEach(suggestion => {
                if (!suggestions[query].includes(suggestion)) {
                    suggestions[query].push(suggestion);
                }
            });
        }
    }
    // then, with prefix matching (we're desperate now)
    if (isEmptySuggestions(suggestions, query)) {
        suggestions[query] = queryTrie(query, pinyinTrie);
        suggestions['tokenized'] = [];
        if (tokens.length > 1) {
            suggestions['tokenized'] = queryTrie(tokens[tokens.length - 1], pinyinTrie);
        }
    }
    return suggestions;
}
function buildTries(wordSet, definitions) {
    let node = trie;
    let pinyinNode = pinyinTrie;

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
        if (definitions && definitions[word]) {
            const uniquePinyin = new Set(definitions[word].map(x => x.pinyin));
            // add all pronunciations, with and without tone numbers (e.g., so that one can search
            // yixia or yi1xia4 for 一下)
            // however, we should also add all permutations (e.g., yixia4 could also return 一下)
            for (const pinyin of uniquePinyin) {
                const syllables = pinyin.split(' ');
                let joinedPinyin = syllables.join('');
                // could do replaceAll with regex, but that wasn't supported until more recently on
                // android webview
                let removedTones = syllables.map(x => x.substring(0, x.length - 1)).join('');
                if (!(joinedPinyin in pinyinMap)) {
                    pinyinMap[joinedPinyin] = new Set();
                }
                if (pinyinMap[joinedPinyin].size < maxPinyinMatches) {
                    pinyinMap[joinedPinyin].add(word);
                }
                if (!(removedTones in pinyinMap)) {
                    pinyinMap[removedTones] = new Set();
                }
                if (pinyinMap[removedTones].size < maxPinyinMatches) {
                    pinyinMap[removedTones].add(word);
                }
                for (const character of joinedPinyin) {
                    if (!(character in pinyinNode.children)) {
                        pinyinNode.children[character] = { children: {}, words: [] }
                    }
                    if (pinyinNode.children[character].words.length < maxRecommendations) {
                        pinyinNode.children[character].words.push(word);
                    }
                    pinyinNode = pinyinNode.children[character];
                }
                pinyinNode = pinyinTrie;
                for (const character of removedTones) {
                    if (!(character in pinyinNode.children)) {
                        pinyinNode.children[character] = { children: {}, words: [] }
                    }
                    // could make these sets for faster lookups, but maxlength 12 + not on main thread + one-time build cost...
                    // just unify the interface, why not
                    if (pinyinNode.children[character].words.length < maxRecommendations
                        && !pinyinNode.children[character].words.includes(word)) {
                        pinyinNode.children[character].words.push(word);
                    }
                    pinyinNode = pinyinNode.children[character];
                }
                pinyinNode = pinyinTrie;
            }
        }
        node = trie;
        pinyinNode = pinyinTrie;
    }
}
onmessage = async function (e) {
    if (e.data.type === 'data') {
        const { default: init,
            cut,
        } = await import("/js/external/jieba_rs_wasm.js");
        await init();
        jiebaCut = cut;
        trie = {
            children: {},
            words: []
        };
        wordSet = e.data.payload.wordSet;
        buildTries(e.data.payload.wordSet, e.data.payload.definitions);
        // pinyinMap gets built up in buildTries (which should probably be named buildDataStructures
        // or something). The main thread wants it for knowing when to treat something as pinyin vs english.
        postMessage({
            pinyinMap
        });
    } else if (e.data.type === 'query') {
        const tokens = segment(e.data.payload.query, e.data.payload.locale);
        postMessage({
            suggestions: getSuggestions(e.data.payload.query, tokens),
            query: e.data.payload.query,
            tokens
        });
    } else if (e.data.type === 'tokenize') {
        const tokens = segment(e.data.payload.query, e.data.payload.locale);
        postMessage({
            query: e.data.payload.query,
            tokens,
            mode: e.data.payload.mode,
            type: e.data.type
        });
    }
}