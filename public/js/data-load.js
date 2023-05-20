let state = JSON.parse(localStorage.getItem('options') || '{}');
let graphPrefix = 'japanese';

window.sentencesFetch = fetch(`/data/${graphPrefix}/sentences.json`);
window.definitionsFetch = fetch(`/data/${graphPrefix}/definitions.json`);
window.freqsFetch = fetch(`/data/${graphPrefix}/wordlist.json`);
window.graphFetch = fetch(`/data/${graphPrefix}/graph.json`);