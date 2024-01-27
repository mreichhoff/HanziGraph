import { hanziBox, notFoundElement } from "./dom";
import { getActiveGraph, getPartition } from "./options";
import { switchToState, stateKeys } from "./ui-orchestrator";

let jiebaCut = null;
let searchSuggestionsWorker = null;
let pinyinMap = {};
const mainHeader = document.getElementById('main-header');
const searchSuggestionsContainer = document.getElementById('search-suggestions-container');

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
    // For now, don't suggest based on english words, but do suggest for pinyin.
    // Either way, send it off to the worker.
    const tokens = segment(partialSearch, getActiveGraph().locale);
    searchSuggestionsWorker.postMessage({
        type: 'query',
        payload: { query: partialSearch.trim(), tokens: tokens }
    });
}
function handleWorkerMessage(message) {
    if (!message.data) {
        return;
    }
    if (message.data.pinyinMap) {
        pinyinMap = message.data.pinyinMap;
        return;
    }
    if (!message.data.query || message.data.query !== hanziBox.value) {
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
    if (!suggestions || (!suggestions[query].length && !suggestions['tokenized'].length)) {
        clearSuggestions();
        return;
    }
    mainHeader.classList.add('has-suggestions');
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
    for (const suggestion of suggestions[query]) {
        let item = document.createElement('li');
        item.classList.add('search-suggestion');
        renderSuggestion('', suggestion, item);
        container.appendChild(item);
        item.addEventListener('mousedown', function () {
            notFoundElement.style.display = 'none';
            document.dispatchEvent(new CustomEvent('graph-update', { detail: suggestion }));
            document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [suggestion] } }));
            clearSuggestions();
            switchToState(stateKeys.main);
        });
    }
    for (const suggestion of suggestions['tokenized']) {
        let item = document.createElement('li');
        item.classList.add('search-suggestion');
        renderSuggestion(priorWordsForDisplay, suggestion, item);
        container.appendChild(item);
        item.addEventListener('mousedown', function () {
            multiWordSearch(priorWordsForDisplay + suggestion, allButLastToken.concat(suggestion));
            clearSuggestions();
            switchToState(stateKeys.main);
        });
    }
    container.removeAttribute('style');
}
function clearSuggestions() {
    mainHeader.classList.remove('has-suggestions');
    searchSuggestionsContainer.style.display = 'none';
}

function sendDataToWorker() {
    searchSuggestionsWorker.postMessage({
        type: 'data',
        payload: { wordSet: window.wordSet, definitions: window.definitions }
    });
}

async function initialize(term, mode) {
    searchSuggestionsWorker = new Worker('/js/modules/search-suggestions-worker.js');
    sendDataToWorker();
    searchSuggestionsWorker.addEventListener('message', handleWorkerMessage);
    // the worker is sent data and responds once ready. If there's a search term, we may need the data
    // it sends, so allow waiting.
    const ensureLoaded = new Promise(ready => searchSuggestionsWorker.addEventListener("message", ready, { once: true }));
    hanziBox.addEventListener('input', suggestSearches);
    hanziBox.addEventListener('blur', clearSuggestions);
    // TODO: get all jieba use off the main thread
    const { default: init,
        cut,
    } = await import("/js/external/jieba_rs_wasm.js");
    await init();
    jiebaCut = cut;
    if (term) {
        await ensureLoaded;
        search(term, getActiveGraph().locale, (mode || 'explore'));
    }
}

function multiWordSearch(query, segments, mode) {
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
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: segments, display: query, mode: (mode || 'explore') } }));
    }
}

function englishSearch(word, data) {
    if (!data) {
        notFoundElement.removeAttribute('style');
    } else {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: data[0] }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: data, display: word, type: 'english' } }));
    }
}

function search(value, locale, mode) {
    clearSuggestions();
    if (!value) {
        return;
    }
    if (definitions[value] || (value in wordSet)) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [value], mode: (mode || 'explore') } }));
        return;
    }
    if (value in pinyinMap) {
        // per mdn, iterating a set is done in insertion order, so should be sorted by frequency rank
        const results = Array.from(pinyinMap[value]);
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: results[0] }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: results, display: value, mode: (mode || 'explore') } }));
        return;
    }
    if (looksLikeEnglish(value) && getActiveGraph().englishPath) {
        value = value.toLowerCase();
        fetch(`/${getActiveGraph().englishPath}/${getPartition(value, getActiveGraph().partitionCount)}.json`)
            .then(response => response.json())
            .then(function (data) {
                if (value !== hanziBox.value.toLowerCase()) {
                    return false;
                }
                englishSearch(value, data[value]);
            });
        return;
    }
    multiWordSearch(value, segment(value, locale), mode)
}

export { search, initialize, looksLikeEnglish }