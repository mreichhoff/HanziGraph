// TODO(refactor): there probably shouldn't be shared elements, but going this route for now
const hanziBox = document.getElementById('hanzi-box');
const notFoundElement = document.getElementById('not-found-message');
const walkThrough = document.getElementById('walkthrough');
const examplesList = document.getElementById('examples');

function writeSeoMetaTags(urlState, graphDisplay) {
    let urlMeta = document.createElement('meta');
    urlMeta.setAttribute('property', 'og:url');
    urlMeta.setAttribute('content', document.location.href);
    document.head.appendChild(urlMeta);

    let typeMeta = document.createElement('meta');
    typeMeta.setAttribute('property', 'og:type');
    typeMeta.setAttribute('content', 'website');
    document.head.appendChild(typeMeta);

    let imageMeta = document.createElement('meta');
    imageMeta.setAttribute('property', 'og:image');
    imageMeta.setAttribute('content', `${document.location.origin}/images/hanzigraph-192x192.png`);
    document.head.appendChild(imageMeta);

    let titleMeta = document.createElement('meta');
    titleMeta.setAttribute('property', 'og:title');
    titleMeta.setAttribute('content', (urlState && urlState.word) ? `${urlState.word} | ${graphDisplay}` :
        (urlState && urlState.graph) ? `${graphDisplay}` : `HanziGraph`);
    document.head.appendChild(titleMeta);

    if (urlState && urlState.graph && !urlState.word) {
        let canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', document.location.href);
        document.head.appendChild(canonical);
    }
}

export { hanziBox, notFoundElement, walkThrough, examplesList, writeSeoMetaTags }