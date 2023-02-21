import { initialize as firebaseInit } from './firebase-init.js';
import { initialize as authStateInit } from './auth-state.js';
import { initialize as orchestratorInit, stateKeys, switchToState } from "./ui-orchestrator.js"
import { initialize as exploreInit } from "./explore.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";
import { initialize as recommendationsInit } from "./recommendations.js";
import { initialize as graphInit } from "./graph.js";
import { initialize as optionsInit, getActiveGraph, parseUrl } from "./options.js";
import { readExploreState } from "./data-layer.js";
import { hanziBox, notFoundElement, walkThrough, examplesList } from "./dom.js";
import { initialize as flowDiagramInit } from "./flow-diagram.js";
import { initialize as dataLayerInit } from "./data-layer.js";

const hanziSearchForm = document.getElementById('hanzi-choose');

function search(value, skipState) {
    if (value && (definitions[value] || (value in wordSet))) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [value], skipState: skipState } }));
    } else {
        notFoundElement.removeAttribute('style');
    }
}

function loadState(state) {
    const term = decodeURIComponent(state.word || '');
    hanziBox.value = term;
    search(term, true);
}

window.onpopstate = (event) => {
    const state = event.state;
    if (!state || !state.word) {
        walkThrough.removeAttribute('style');
        examplesList.innerHTML = '';
        hanziBox.value = '';
        return;
    }
    loadState(state);
};

let dataLoads;
if (window.graphFetch) {
    dataLoads = [
        window.graphFetch
            .then(response => response.json())
            .then(data => {
                window.hanzi = data;
            }),
        window.sentencesFetch
            .then(response => response.json())
            .then(data => window.sentences = data),
        window.definitionsFetch
            .then(response => response.json())
            .then(data => window.definitions = data)
    ]
} else {
    // assume freqs are used instead, and the graph is derived from that
    dataLoads = [
        window.freqsFetch
            .then(response => response.json())
            .then(data => {
                window.freqs = data;
            }),
        window.sentencesFetch
            .then(response => response.json())
            .then(data => window.sentences = data),
        window.definitionsFetch
            .then(response => response.json())
            .then(data => window.definitions = data)
    ]
}

Promise.all(
    dataLoads
).then(_ => {
    firebaseInit();
    authStateInit();
    dataLayerInit();
    orchestratorInit();
    optionsInit();
    graphInit();
    studyModeInit();
    exploreInit();
    flowDiagramInit();
    hanziSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        search(hanziBox.value);
        switchToState(stateKeys.main);
    });
    // TODO(refactor): this belongs in explore rather than main?
    let oldState = readExploreState();
    let urlState = parseUrl(document.location.pathname);
    // precedence goes to the direct URL entered first, then to anything hanging around in history, then localstorage.
    // if none are present, show the walkthrough.
    if (urlState && urlState.word) {
        search(urlState.word);
    } else if (history.state && history.state.word) {
        search(history.state.word);
    } else if (oldState && oldState.word && oldState.selectedCharacterSet === getActiveGraph().prefix) {
        search(oldState.word);
    } else {
        //add a default graph on page load to illustrate the concept
        walkThrough.removeAttribute('style');
        const defaultHanzi = getActiveGraph().defaultHanzi;
        document.dispatchEvent(new CustomEvent('graph-update',
            { detail: defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)] }));
    }
    // These happen last due to being secondary functionality
    statsInit();
    faqInit();
    recommendationsInit();
});
