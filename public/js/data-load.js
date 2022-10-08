let state = JSON.parse(localStorage.getItem('state') || '{}');
const validPrefixes = ['hsk', 'simplified', 'traditional', 'cantonese'];
let graphPrefix = 'simplified';

let path = document.location.pathname;
if (path[0] === '/') {
    path = path.substring(1);
}
pathSegments = path.split('/')
if (pathSegments.length > 0 && validPrefixes.includes(pathSegments[0])) {
    graphPrefix = pathSegments[0];
} else if (state && state.graphPrefix && validPrefixes.includes(state.graphPrefix)) {
    graphPrefix = state.graphPrefix;
}
window.graphFetch = fetch(`/data/${graphPrefix}/graph.json`);
window.sentencesFetch = fetch(`/data/${graphPrefix}/sentences.json`);
window.definitionsFetch = fetch(`/data/${graphPrefix}/definitions.json`);