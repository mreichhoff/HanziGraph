import { hanziBox, notFoundElement } from "./dom";
import { getActiveGraph } from "./options";

let jiebaCut = null;
let searchSuggestionsWorker = null;
const searchSuggestionsContainer = document.getElementById('search-suggestions-container');

// lol
function vetCandidate(candidate) {
    if (!(candidate in wordSet)) {
        if (!isNaN(candidate)) {
            // it's not not a number, so ignore it.
            return [{ word: candidate, ignore: true }];
        }
        if (/^[\x00-\xFF]*$/.test(candidate)) {
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

function segment(text, locale) {
    locale = locale || getActiveGraph().locale;
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
function suggestSearches() {
    const partialSearch = hanziBox.value;
    if (!partialSearch) {
        clearSuggestions();
    }
    let tokens = segment(partialSearch, getActiveGraph().locale);
    // if it's just a single character, handle it here.
    let hanziCheck = tokens.length > 1 ? tokens[tokens.length - 1] : partialSearch;
    if (hanziCheck in hanzi) {
        const words = [hanziCheck, ...extractWords(hanzi[hanziCheck])];
        renderSearchSuggestions(partialSearch, words, tokens, searchSuggestionsContainer);
        return;
    }
    // otherwise, pass it off to the worker and let it decide.
    searchSuggestionsWorker.postMessage({
        type: 'query',
        payload: { query: partialSearch, tokens: tokens }
    })
}
function extractWords(node) {
    if (!node.edges) {
        return [];
    }
    let result = new Set();
    for (const edge of Object.values(node.edges).sort((a, b) => a.level - b.level)) {
        result.add(...edge.words);
    }
    return Array.from(result);
}
function handleSuggestions(message) {
    if (!message.data || !message.data.query) {
        return;
    }
    if (message.data.query !== hanziBox.value) {
        return;
    }
    renderSearchSuggestions(message.data.query, message.data.suggestions, message.data.tokens, searchSuggestionsContainer);
}

function renderExplanationItem(text, container) {
    let instructionsItem = document.createElement('li');
    instructionsItem.classList.add('suggestions-explanation');
    instructionsItem.innerText = text;
    container.appendChild(instructionsItem);
}
function renderSuggestion(priorWordsForDisplay, suggestion, container) {
    let prior = document.createElement('span');
    prior.innerText = priorWordsForDisplay;
    prior.classList.add('search-suggestion-stem');
    let current = document.createElement('span');
    current.innerText = suggestion;
    current.classList.add('search-suggestion-current');
    container.appendChild(prior);
    container.appendChild(current);
}
function renderSearchSuggestions(query, suggestions, tokens, container) {
    container.innerHTML = '';
    const isMultiWord = tokens.length > 1;
    if (!suggestions || !suggestions.length) {
        renderExplanationItem(`No suggestions found for ${query}.`, container);
        return;
    }
    let priorWordsForDisplay = '';
    let allButLastToken = [];
    if (isMultiWord) {
        allButLastToken = tokens.slice(0, -1);
        priorWordsForDisplay = allButLastToken.map(x => {
            if (x.ignore) {
                return x.word;
            }
            return x;
        }).join('');
    }
    for (const suggestion of suggestions) {
        let item = document.createElement('li');
        item.classList.add('search-suggestion');
        renderSuggestion(priorWordsForDisplay, suggestion, item);
        container.appendChild(item);
        item.addEventListener('mousedown', function () {
            if (isMultiWord) {
                multiWordSearch(priorWordsForDisplay + suggestion, allButLastToken.concat(suggestion));
            } else {
                notFoundElement.style.display = 'none';
                document.dispatchEvent(new CustomEvent('graph-update', { detail: suggestion }));
                document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [suggestion] } }));
            }
            clearSuggestions();
        });
    }
    container.removeAttribute('style');
}
function clearSuggestions() {
    searchSuggestionsContainer.style.display = 'none';
}

function sendWordSetToWorker() {
    searchSuggestionsWorker.postMessage({
        type: 'wordset',
        payload: window.wordSet
    });
}
async function initialize(term) {
    searchSuggestionsWorker = new Worker('/js/modules/search-suggestions-worker.js');
    sendWordSetToWorker();
    document.addEventListener('character-set-changed', sendWordSetToWorker);
    searchSuggestionsWorker.addEventListener('message', handleSuggestions);
    hanziBox.addEventListener('input', suggestSearches);
    hanziBox.addEventListener('blur', clearSuggestions);
    const { default: init,
        cut,
    } = await import("/js/external/jieba_rs_wasm.js");
    await init();
    jiebaCut = cut;
    if (term) {
        search(term, getActiveGraph().locale);
    }
}

function multiWordSearch(query, segments) {
    let found = false;
    let wordForGraph = '';
    for (const segment of segments) {
        if (!segment.ignore && segment in wordSet) {
            wordForGraph = segment;
            found = true;
            break;
        }
    }
    if (!found) {
        notFoundElement.removeAttribute('style');
    } else {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: wordForGraph }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: segments, display: query } }));
    }
}

function search(value, locale) {
    clearSuggestions();
    if (value && (definitions[value] || (value in wordSet))) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [value] } }));
        return;
    }
    multiWordSearch(value, segment(value, locale))
}

export { search, initialize }