let state = JSON.parse(localStorage.getItem('state') || '{}');
const validPrefixes = ['hsk', 'simplified', 'traditional', 'cantonese'];
let graphPrefix = 'simplified';
if (state && state.graphPrefix && validPrefixes.includes(state.graphPrefix)) {
    graphPrefix = state.graphPrefix;
}
window.graphFetch = fetch(`./data/${graphPrefix}/graph.json`);
window.sentencesFetch = fetch(`./data/${graphPrefix}/sentences.json`);
window.definitionsFetch = fetch(`./data/${graphPrefix}/definitions.json`);