import { initialize as firebaseInit } from './firebase-init.js';
import { initialize as authStateInit } from './auth-state.js';
import { initialize as orchestratorInit, stateKeys, switchToState } from "./ui-orchestrator.js"
import { initialize as exploreInit } from "./explore.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";
import { initialize as graphInit } from "./graph.js";
import { initialize as optionsInit, getActiveGraph, parseUrl } from "./options.js";
import { readExploreState } from "./data-layer.js";
import { hanziBox, walkThrough, examplesList, writeSeoMetaTags } from "./dom.js";
import { initialize as flowDiagramInit } from "./flow-diagram.js";
import { initialize as dataLayerInit } from "./data-layer.js";
import { initialize as searchInit, search } from "./search.js";
import { initialize as fileAnalysisInitialize } from "./file-analysis.js"

// Set to false to enable running more simply, e.g. via running `python3 -m http.server` in public/.
const USE_FIREBASE = true;

const hanziSearchForm = document.getElementById('hanzi-choose');

function loadState(state) {
    const term = decodeURIComponent(state.word || '');
    hanziBox.value = term;
    search(term, getActiveGraph().locale, 'explore', true);
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
            .then(data => window.definitions = data),
        window.componentsFetch
            .then(response => response.json())
            .then(data => window.components = data)
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
            .then(data => window.definitions = data),
        window.componentsFetch
            .then(response => response.json())
            .then(data => window.components = data)
    ]
}

Promise.all(
    dataLoads
).then(_ => {
    let urlState = parseUrl(document.location.pathname);
    // TODO: have firebaseInit return a boolean, skip if false
    // then just have a no-firebase-config.js that can be substituted
    // for the prod-like firebase-init.js
    if (USE_FIREBASE) {
        firebaseInit();
        authStateInit();
        dataLayerInit();
        fileAnalysisInitialize();
    }
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

        // we're about to force a blur, which should hide the soft keyboard on android or ios
        // but in some cases, the keyboard hiding triggers a resize, so you get an annoying graph re-render.
        // This in very rare cases could cause cause a skipped re-layout on window size change
        // but that should be rare.
        document.dispatchEvent(new Event('skip-graph-resize'));
        hanziBox.blur();
    });

    // similar to the blur logic above, the soft keyboard will show. Skip the next resize event.
    // Same edge case with possible skipped 'real' resizes, but that should be very rare.
    hanziBox.addEventListener('focus', function () {
        document.dispatchEvent(new Event('skip-graph-resize'));
    });

    // TODO(refactor): this belongs in explore rather than main?
    let oldState = readExploreState();
    // precedence goes to the direct URL entered first, then to anything hanging around in history, then localstorage.
    // if none are present, show the walkthrough.
    let needsTokenization = false;
    writeSeoMetaTags(urlState, getActiveGraph().display);
    if (urlState && urlState.word) {
        hanziBox.value = urlState.word;
        if (urlState.word in wordSet) {
            search(urlState.word, getActiveGraph().locale, urlState.mode);
        } else {
            needsTokenization = true;
        }
    } else if (history.state && history.state.word) {
        search(history.state.word);
    } else if (oldState && oldState.words && oldState.selectedCharacterSet === getActiveGraph().prefix) {
        search(oldState.words.join(''));
    } else {
        // we set a graph, but no word. Set the title.
        if (urlState && urlState.graph) {
            document.title = `${getActiveGraph().display} | HanziGraph`;
        }
        //add a default graph on page load to illustrate the concept
        walkThrough.removeAttribute('style');
        const defaultHanzi = getActiveGraph().defaultHanzi;
        document.dispatchEvent(new CustomEvent('graph-update',
            { detail: defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)] }));
    }
    if (needsTokenization) {
        searchInit(urlState.word, urlState.mode);
    }
    // These happen last due to being secondary functionality
    statsInit();
    faqInit();
    if (!needsTokenization) {
        searchInit();
    }
});
