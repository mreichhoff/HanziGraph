let state = JSON.parse(localStorage.getItem('options') || '{}');
const validPrefixes = ['hsk', 'simplified', 'traditional', 'cantonese'];
let graphPrefix = 'simplified';
if (state && state.selectedCharacterSet && validPrefixes.includes(state.selectedCharacterSet)) {
    graphPrefix = state.selectedCharacterSet;
}
window.graphFetch = fetch(`./data/${graphPrefix}/graph.json`);
window.sentencesFetch = fetch(`./data/${graphPrefix}/sentences.json`);
window.definitionsFetch = fetch(`./data/${graphPrefix}/definitions.json`);