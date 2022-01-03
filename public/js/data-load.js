let state = JSON.parse(localStorage.getItem('state') || '{}');
let graphPrefix = '';
if (state && state.graphPrefix) {
    graphPrefix = state.graphPrefix;
}
window.graphFetch = fetch(`./data/${graphPrefix}graph.json`);
window.sentencesFetch = fetch(`./data/${graphPrefix}sentences.json`);
window.singleCharacterWordsFetch = fetch(`./data/${graphPrefix}single-char-words.json`);