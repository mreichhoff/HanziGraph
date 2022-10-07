let state = JSON.parse(localStorage.getItem('state') || '{}');
let graphPrefix = 'simplified-';
if (state && state.graphPrefix !== undefined && state.graphPrefix !== null) {
    graphPrefix = state.graphPrefix;
}
window.graphFetch = fetch(`./data/${graphPrefix}graph.json`);
window.sentencesFetch = fetch(`./data/${graphPrefix}sentences.json`);
window.definitionsFetch = fetch(`./data/${graphPrefix}definitions.json`);