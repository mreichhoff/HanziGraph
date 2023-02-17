import { initialize as orchestratorInit, stateKeys, switchToState } from "./ui-orchestrator.js"
import { initialize as baseInit } from "./base.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";
import { initialize as recommendationsInit } from "./recommendations.js";
import { initialize as graphInit } from "./graph.js";
import { initialize as optionsInit, getActiveGraph } from "./options.js";
import { readExploreState } from "./data-layer.js";
import { hanziBox, notFoundElement, walkThrough } from "./dom.js";

const hanziSearchForm = document.getElementById('hanzi-choose');

function allInGraph(word) {
    for (let i = 0; i < word.length; i++) {
        if (!hanzi[word[i]]) {
            return false;
        }
    }
    return true;
}
function search(value) {
    if (value && allInGraph(value) && (definitions[value] || wordSet.has(value))) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
        document.dispatchEvent(new CustomEvent('explore-update', { detail: [value] }));
    } else {
        notFoundElement.removeAttribute('style');
    }
}

Promise.all(
    [
        window.graphFetch
            .then(response => response.json())
            .then(data => window.hanzi = data),
        window.sentencesFetch
            .then(response => response.json())
            .then(data => window.sentences = data),
        window.definitionsFetch
            .then(response => response.json())
            .then(data => window.definitions = data)
    ]
).then(_ => {
    orchestratorInit();
    optionsInit();
    graphInit();
    studyModeInit();
    baseInit();
    statsInit();
    faqInit();
    recommendationsInit();

    hanziSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        search(hanziBox.value);
        switchToState(stateKeys.main);
    });

    let oldState = readExploreState();
    if (oldState) {
        document.dispatchEvent(new CustomEvent('graph-update',
            { detail: oldState.word }));
        document.dispatchEvent(new CustomEvent('explore-update',
            { detail: [oldState.word] }));
    } else {
        //add a default graph on page load to illustrate the concept
        walkThrough.removeAttribute('style');
        const defaultHanzi = getActiveGraph().defaultHanzi;
        document.dispatchEvent(new CustomEvent('graph-update',
            { detail: defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)] }));
    }
});
//ideally we'll continue adding to this