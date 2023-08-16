let state = JSON.parse(localStorage.getItem('options') || '{}');
const validPrefixes = ['hsk', 'simplified', 'traditional', 'cantonese'];
let graphPrefix = 'simplified';

let path = document.location.pathname;
if (path[0] === '/') {
    path = path.substring(1);
}
pathSegments = path.split('/')
if (pathSegments.length > 0 && validPrefixes.includes(pathSegments[0])) {
    graphPrefix = pathSegments[0];
} else if (state && state.selectedCharacterSet && validPrefixes.includes(state.selectedCharacterSet)) {
    graphPrefix = state.selectedCharacterSet;
}
window.sentencesFetch = fetch(`/data/${graphPrefix}/sentences.json`);
window.definitionsFetch = fetch(`/data/${graphPrefix}/definitions.json`);
window.componentsFetch = fetch('/data/components/components.json');
// TODO(refactor): it kinda makes sense to still load the HSK stuff as a pre-built graph,
// but this, and the similar code in options and main, aren't great
if (graphPrefix === 'hsk') {
    window.graphFetch = fetch(`/data/${graphPrefix}/graph.json`);
} else {
    window.freqsFetch = fetch(`/data/${graphPrefix}/wordlist.json`);
}