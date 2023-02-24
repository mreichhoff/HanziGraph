import { initialize as orchestratorInit, stateKeys, switchToState } from "./ui-orchestrator.js"
import { initialize as exploreInit } from "./explore.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";
import { initialize as recommendationsInit } from "./recommendations.js";
import { initialize as graphInit } from "./graph.js";
import { initialize as optionsInit, getActiveGraph } from "./options.js";
import { readExploreState } from "./data-layer.js";
import { hanziBox, notFoundElement, walkThrough } from "./dom.js";
import { initialize as flowDiagramInit } from "./flow-diagram.js";
import { segment, initialize as searchInit } from "./search.js";

const hanziSearchForm = document.getElementById('hanzi-choose');

function search(value) {
    if (value && (definitions[value] || (value in wordSet))) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [value] } }));
        return;
    }
    const segments = segment(value, getActiveGraph().locale);
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
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: segments, display: value } }));
    }
}
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

Promise.all(dataLoads).then(_ => {
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
    // TODO(refactor): this belongs in explore rather than main
    let oldState = readExploreState();
    if (oldState && oldState.words) {
        document.dispatchEvent(new CustomEvent('graph-update',
            { detail: oldState.words[0] }));
        document.dispatchEvent(new CustomEvent('explore-update',
            { detail: { words: oldState.words, display: oldState.words.join('') } }));
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
    searchInit();
});
