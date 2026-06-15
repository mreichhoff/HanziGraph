import { hanziBox, notFoundElement, searchControl } from "./dom";
import { getActiveGraph, getPartition } from "./options";
import { switchToState, stateKeys } from "./ui-orchestrator";
import { handleCommand } from "./commands.js";
import { translateEnglish, isAiEligible } from "./data-layer.js";
import * as speechRecognition from "./speech-recognition.js";

let searchSuggestionsWorker = null;
let pinyinMap = {};
let pendingSentenceGenCallbacks = {};
let pendingRetokenizeCallback = null;
let pendingDefinitionFetches = {};
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
    if (message.data.type === 'tokenize-list') {
        if (message.data.next === 'ai-file') {
            multiSentenceSearch(message.data.result, message.data.aiData);
            return;
        }
        pendingSentenceGenCallbacks[message.data.word](message.data.result);
        delete pendingSentenceGenCallbacks[message.data.word];
        return;
    }
    if (message.data.type === 'retokenize-cards') {
        if (pendingRetokenizeCallback) {
            pendingRetokenizeCallback(message.data.result);
            pendingRetokenizeCallback = null;
        }
        return;
    }
    // AI searches based on unknown English text will have an `originalQuery`, since the
    // query sent over to the search suggestions worker is for the AI's translation.
    // in either case, we ensure the user isn't off doing other things before we render anything.
    if (!message.data.query || (message.data.query !== hanziBox.value && message.data.originalQuery !== hanziBox.value)) {
        return;
    }
    if (message.data.type === 'tokenize') {
        multiWordSearch(message.data.query, message.data.tokens, message.data.mode, message.data.skipState, message.data.aiData)
        return;
    }
    renderSearchSuggestions(message.data.query, message.data.suggestions, message.data.tokens, searchSuggestionsContainer);
}

function getSyllables(pinyin) {
    return pinyin.replace(' - ', ' ').split(' ');
}

function renderPinyin(pinyin, container) {
    if (!pinyin) {
        return;
    }
    const syllables = getSyllables(pinyin);
    for (const syllable of syllables) {
        const syllableElement = document.createElement('span');
        if (!getActiveGraph().disableToneColors) {
            syllableElement.classList.add(`tone${syllable[syllable.length - 1]}`);
        }
        syllableElement.textContent = syllable;
        container.appendChild(syllableElement);
    }
}

function getDefinitionPreview(definitionList) {
    if (!definitionList || definitionList.length <= 0) {
        return '';
    }
    const preview = definitionList
        .slice(0, 2)
        .map(definition => definition.en)
        .filter(x => !!x)
        .join('; ');
    const maxPreviewLength = 140;
    if (preview.length <= maxPreviewLength) {
        return preview;
    }
    return `${preview.substring(0, maxPreviewLength - 3)}...`;
}

function renderSuggestionDetails(suggestion, container) {
    const existingDetails = container.querySelector('.search-suggestion-details');
    if (existingDetails) {
        existingDetails.remove();
    }
    const definitionList = window.definitions[suggestion];
    if (!definitionList || definitionList.length <= 0) {
        return;
    }

    const details = document.createElement('div');
    details.classList.add('search-suggestion-details');

    const pinyin = document.createElement('span');
    pinyin.classList.add('search-suggestion-pinyin');
    renderPinyin(definitionList[0].pinyin, pinyin);
    details.appendChild(pinyin);

    const previewText = getDefinitionPreview(definitionList);
    if (previewText) {
        const definition = document.createElement('span');
        definition.classList.add('search-suggestion-definition');
        definition.textContent = previewText;
        details.appendChild(definition);
    }
    container.appendChild(details);
}

// TODO: in practice, do we need this? suggestions are generated based on definitions loaded up front iirc
// also a bit duplicative of the logic in explore.js, but fine for now
function fetchDefinitionsForSuggestion(suggestion, container) {
    const activeGraph = getActiveGraph();
    if (!activeGraph.definitionsAugmentPath || !activeGraph.partitionCount) {
        return;
    }
    const partition = getPartition(suggestion, activeGraph.partitionCount);
    const partitionKey = `${activeGraph.prefix}-${partition}`;
    if (!pendingDefinitionFetches[partitionKey]) {
        pendingDefinitionFetches[partitionKey] = fetch(`/${activeGraph.definitionsAugmentPath}/${partition}.json`)
            .then(response => response.json())
            .then(data => {
                Object.assign(window.definitions, data);
                return data;
            })
            .catch(() => ({}));
    }
    pendingDefinitionFetches[partitionKey].then(data => {
        if (container.isConnected && data[suggestion]) {
            renderSuggestionDetails(suggestion, container);
        }
    });
}

function renderSuggestion(priorWordsForDisplay, suggestion, container) {
    let text = document.createElement('div');
    text.classList.add('search-suggestion-text');
    let prior = document.createElement('span');
    prior.innerText = priorWordsForDisplay;
    prior.classList.add('search-suggestion-stem');
    let current = document.createElement('span');
    current.innerText = suggestion;
    current.classList.add('search-suggestion-current');
    text.appendChild(prior);
    text.appendChild(current);
    container.appendChild(text);
    if (window.definitions[suggestion]) {
        renderSuggestionDetails(suggestion, container);
    } else {
        fetchDefinitionsForSuggestion(suggestion, container);
    }
}
function renderSearchSuggestions(query, suggestions, tokens, container) {
    searchControl.style.display = 'none';
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
        item.addEventListener('click', function () {
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
        item.addEventListener('click', function () {
            multiWordSearch(priorWordsForDisplay + suggestion, allButLastToken.concat(suggestion));
            clearSuggestions();
            switchToState(stateKeys.main);
        });
    }
    container.removeAttribute('style');
}

function showControlsIfEligible() {
    if (isAiEligible()) {
        searchControl.removeAttribute('style');
        mainHeader.classList.add('has-suggestions');
        // Show speech button if supported
        if (speechRecognition.isSpeechRecognitionSupported()) {
            speechRecognition.showButton();
        }
    }
}

function clearSuggestions() {
    mainHeader.classList.remove('has-suggestions');
    searchSuggestionsContainer.style.display = 'none';
    searchControl.style.display = 'none';
    speechRecognition.hideButton();
}

function sendDataToWorker() {
    searchSuggestionsWorker.postMessage({
        type: 'data',
        payload: { wordSet: window.wordSet, definitions: window.definitions }
    });
}

let lastPointerDown = null;

function isInSearchUi(target) {
    return target && (
        searchControl.contains(target) ||
        searchSuggestionsContainer.contains(target) ||
        hanziBox.contains(target)
    );
}

function handleDocumentPointerDown(event) {
    lastPointerDown = { target: event.target, time: Date.now() };
    if (!isInSearchUi(event.target)) {
        clearSuggestions();
    }
}

function refreshSearchUiPointerGesture() {
    if (lastPointerDown && isInSearchUi(lastPointerDown.target)) {
        lastPointerDown.time = Date.now();
    }
}

async function initialize(term, mode) {
    searchSuggestionsWorker = new Worker('/js/modules/search-suggestions-worker.js');
    sendDataToWorker();
    searchSuggestionsWorker.addEventListener('message', handleWorkerMessage);
    // the worker is sent data and responds once ready. If there's a search term, we may need the data
    // it sends, so allow waiting.
    const ensureLoaded = new Promise(ready => searchSuggestionsWorker.addEventListener("message", ready, { once: true }));
    hanziBox.addEventListener('input', suggestSearches);
    hanziBox.addEventListener('blur', function (event) {
        document.dispatchEvent(new Event('skip-graph-resize'));
        setTimeout(function () {
            const recentPointerTarget = lastPointerDown && Date.now() - lastPointerDown.time < 500
                ? lastPointerDown.target
                : null;
            if (
                isInSearchUi(event.relatedTarget) ||
                isInSearchUi(document.activeElement) ||
                isInSearchUi(recentPointerTarget)
            ) {
                return;
            }
            clearSuggestions();
        }, 0);
    });
    hanziBox.addEventListener('focus', showControlsIfEligible);
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('pointermove', refreshSearchUiPointerGesture, { passive: true });
    document.addEventListener('touchstart', function (event) {
        if (window.PointerEvent) {
            return;
        }
        handleDocumentPointerDown(event);
    });
    document.addEventListener('touchmove', function () {
        if (window.PointerEvent) {
            return;
        }
        refreshSearchUiPointerGesture();
    }, { passive: true });
    document.addEventListener('mousedown', function (event) {
        if (window.PointerEvent) {
            return;
        }
        handleDocumentPointerDown(event);
    });
    if (term) {
        await ensureLoaded;
        search(term, getActiveGraph().locale, (mode || 'explore'));
    }
    // very questionable architecture (mistakes were made)
    document.addEventListener('ai-file-response', function (event) {
        handleAiFileResponse(event.detail.aiData);
    });
    document.addEventListener('sentence-generation-response', function (event) {
        if (pendingSentenceGenCallbacks[event.detail.word]) {
            // shouldn't happen, but let the existing one win
            event.detail.reject();
            return;
        }
        pendingSentenceGenCallbacks[event.detail.word] = event.detail.resolve;
        searchSuggestionsWorker.postMessage({
            type: 'tokenize-list',
            payload: {
                query: event.detail.aiData.data.sentences,
                locale: getActiveGraph().locale,
                word: event.detail.word
            }
        });
    });

    // Handle re-tokenization requests (e.g., when importing from Anki)
    document.addEventListener('request-retokenize-cards', function (event) {
        pendingRetokenizeCallback = event.detail.resolve;
        searchSuggestionsWorker.postMessage({
            type: 'retokenize-cards',
            payload: {
                cards: event.detail.cards,
                locale: getActiveGraph().locale
            }
        });
    });
}

function multiWordSearch(query, segments, mode, skipState, aiData) {
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
        document.dispatchEvent(new CustomEvent('explore-update', {
            detail: {
                words: segments,
                display: query,
                mode: (mode || 'explore'),
                // give eligible users the option to get an AI explanation on multi-word searches of a certain length
                allowExplain: (segments.length >= 3 && !aiData),
                skipState: !!skipState,
                aiData
            }
        }));
    }
}

function multiSentenceSearch(sentences, aiData) {
    // we code good
    let wordForGraph = '';
    for (const sentence of sentences) {
        for (const word of sentence.zh) {
            if (!word.ignore && word in wordSet) {
                wordForGraph = word;
                break;
            }
        }
        // you may not like it, but this is what peak code looks like
        if (wordForGraph) {
            break;
        }
    }
    if (!wordForGraph) {
        notFoundElement.removeAttribute('style');
        document.dispatchEvent(new CustomEvent('hide-loading-dots'));
    } else {
        aiData.data.sentences = sentences;
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: wordForGraph }));
        document.dispatchEvent(new CustomEvent('explore-update', {
            detail: {
                words: sentences[0].zh,
                display: sentences[0].zh.map(x => x.ignore ? x.word : x).join(''),
                mode: 'explore',
                skipState: false,
                aiData
            }
        }));
    }
}

function handleAiFileResponse(aiData, skipState) {
    searchSuggestionsWorker.postMessage({
        type: 'tokenize-list',
        next: 'ai-file',
        payload: {
            query: aiData.data.sentences,
            locale: getActiveGraph().locale,
            mode: 'explore',
            skipState: !!skipState,
            aiData
        }
    });
}

function handleAiResponse(word, aiData, skipState) {
    searchSuggestionsWorker.postMessage({
        type: 'tokenize',
        payload: {
            query: aiData.data.chineseTranslationWithoutPinyin,
            locale: getActiveGraph().locale,
            mode: 'explore',
            skipState: !!skipState,
            originalQuery: word || aiData.data.chineseTranslationWithoutPinyin,
            aiData
        }
    });
}

async function englishSearch(word, normalizedValue, data, skipState) {
    if (!data) {
        if (isAiEligible()) {
            document.dispatchEvent(new CustomEvent('loading-dots'));
            try {
                const aiData = await translateEnglish(word);
                handleAiResponse(word, aiData, skipState);
            } catch (ex) {
                // if the AI fails, just indicate nothing was found. Should probably use
                // an AI-specific error message here, but for now just not found.
                notFoundElement.removeAttribute('style');
                document.dispatchEvent(new CustomEvent('hide-loading-dots'));
            }
        } else {
            notFoundElement.removeAttribute('style');
        }
    } else {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: data[0] }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: data, display: normalizedValue, type: 'english', skipState: !!skipState } }));
    }
}

function search(value, locale, mode, skipState) {
    clearSuggestions();
    if (!value) {
        return;
    }
    // first, check if this is a command.
    const commandResult = handleCommand(value);
    // null is returned if the value is not supported (i.e., not actually a command)
    if (commandResult !== null) {
        if (commandResult.length === 0) {
            notFoundElement.removeAttribute('style');
        } else {
            notFoundElement.style.display = 'none';
            document.dispatchEvent(new CustomEvent('graph-update', { detail: commandResult[0] }));
            document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: commandResult, mode: (mode || 'explore'), skipState: !!skipState } }));
        }
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
        const normalizedValue = value.toLowerCase();
        fetch(`/${getActiveGraph().englishPath}/${getPartition(normalizedValue, getActiveGraph().partitionCount)}.json`)
            .then(response => response.json())
            .then(function (data) {
                if (normalizedValue !== hanziBox.value.toLowerCase()) {
                    return false;
                }
                englishSearch(value, normalizedValue, data[normalizedValue], skipState);
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
