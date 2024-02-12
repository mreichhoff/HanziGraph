import { hanziBox, notFoundElement } from "./dom";
import { getActiveGraph, getPartition } from "./options";
import { switchToState, stateKeys } from "./ui-orchestrator";
import { handleCommand } from "./commands.js";

let searchSuggestionsWorker = null;
let pinyinMap = {};
const mainHeader = document.getElementById('main-header');
const searchSuggestionsContainer = document.getElementById('search-suggestions-container');

function looksLikeEnglish(value) {
    return /^[\x00-\xFF]*$/.test(value);
}

function suggestSearches() {
    const partialSearch = hanziBox.value;
    if (!partialSearch) {
        clearSuggestions();
    }
    // For now, don't suggest based on english words, but do suggest for pinyin.
    // Either way, send it off to the worker.
    searchSuggestionsWorker.postMessage({
        type: 'query',
        payload: { query: partialSearch.trim(), locale: getActiveGraph().locale }
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
    if (message.data.type === 'tokenize') {
        multiWordSearch(message.data.query, message.data.tokens, message.data.mode, message.data.skipState)
        return;
    }
    renderSearchSuggestions(message.data.query, message.data.suggestions, message.data.tokens, searchSuggestionsContainer);
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
    if (term) {
        await ensureLoaded;
        search(term, getActiveGraph().locale, (mode || 'explore'));
    }
}

function multiWordSearch(query, segments, mode, skipState) {
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
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: segments, display: query, mode: (mode || 'explore'), skipState: !!skipState } }));
    }
}

function englishSearch(word, data, skipState) {
    if (!data) {
        notFoundElement.removeAttribute('style');
    } else {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: data[0] }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: data, display: word, type: 'english', skipState: !!skipState } }));
    }
}

function search(value, locale, mode, skipState) {
    clearSuggestions();
    if (!value) {
        return;
    }
    // first, check if this is a command.
    const commandResult = handleCommand(value);
    if(commandResult && commandResult.length > 0) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: commandResult[0] }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: commandResult, mode: (mode || 'explore'), skipState: !!skipState } }));
        return;
    }
    // then, check if it's a known word or character.
    if (definitions[value] || (value in wordSet)) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [value], mode: (mode || 'explore'), skipState: !!skipState } }));
        return;
    }
    // no luck yet? Maybe it's pinyin.
    if (value in pinyinMap) {
        // per mdn, iterating a set is done in insertion order, so should be sorted by frequency rank
        const results = Array.from(pinyinMap[value]);
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: results[0] }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: results, display: value, mode: (mode || 'explore'), skipState: !!skipState } }));
        return;
    }
    // ok, fine, try english?
    if (looksLikeEnglish(value) && getActiveGraph().englishPath) {
        value = value.toLowerCase();
        fetch(`/${getActiveGraph().englishPath}/${getPartition(value, getActiveGraph().partitionCount)}.json`)
            .then(response => response.json())
            .then(function (data) {
                if (value !== hanziBox.value.toLowerCase()) {
                    return false;
                }
                englishSearch(value, data[value], skipState);
            });
        return;
    }
    // whoa, maybe it's multiple words then?
    searchSuggestionsWorker.postMessage({
        type: 'tokenize',
        // ask the worker to tokenize, and then on response run the multi-word search
        // TODO: if we'd ever have other actions besides a multi-word search, we would have to pass
        // the action along here or something
        payload: { query: value, locale, mode, skipState: !!skipState }
    });
}

export { search, initialize, looksLikeEnglish }