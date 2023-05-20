import { switchToState, stateKeys } from "./ui-orchestrator";
const parent = document.getElementById('graph-container');
const graphContainer = document.getElementById('graph');

let cy = null;
let currentPath = [];
// TODO(refactor): consolidate with options
let ranks = [1000, 2000, 4000, 7000, Number.MAX_SAFE_INTEGER];

let levelProperty = 'word_level';

function findRank(word) {
    if (!window.wordSet || !(word in wordSet)) {
        return ranks.length;
    }
    let freq = wordSet[word];
    for (let i = 0; i < ranks.length; i++) {
        if (freq < ranks[i]) {
            return i + 1;
        }
    }
    return ranks.length;
}
function findEdge(base, target, result) {
    for (const edge of result.edges) {
        if (edge.data.source === base && edge.data.target === target) {
            return true;
        }
    }
    return false;
}
function addEdge(base, target, word, result) {
    if (!hanzi[base] || !hanzi[target]) { return; }
    if (base === target) { return; }
    if (!findEdge(base, target, result)) {
        result.edges.push({
            data: {
                id: Array.from(base + target).sort().toString(),
                source: base, target: target,
                level: findRank(word),
                words: [word],
                displayWord: word
            }
        });
    }
}
function addEdges(word, result) {
    for (let i = 0; i < word.length - 1; i++) {
        addEdge(word[i], word[i + 1], word, result);
    }
    if (word.length > 1) {
        // also connect last to first
        addEdge(word[word.length - 1], word[0], word, result);
    }
};

function dfs(start, elements, maxDepth, visited, maxEdges) {
    if (maxDepth < 0 || !(start in hanzi)) {
        return;
    }
    let curr = hanzi[start];
    //todo does javascript have a set?
    visited[start] = true;
    let usedEdges = [];
    for (const [key, value] of Object.entries(curr.edges)) {
        if (usedEdges.length == maxEdges) {
            break;
        }
        //don't add outgoing edges when we won't process the next layer
        if (maxDepth > 0) {
            if (!visited[key]) {
                elements.edges.push({
                    data: {
                        id: Array.from(start + key).sort().toString(),
                        source: start, target: key,
                        level: value[levelProperty],
                        words: value.words,
                        // render examples for all words, but only display one
                        displayWord: value.words[0]
                    }
                });
                usedEdges.push(key);
            }
        }
    }
    elements.nodes.push({ data: { id: start, level: curr.node[levelProperty] } });
    for (const key of usedEdges) {
        if (!visited[key]) {
            dfs(key, elements, maxDepth - 1, visited, maxEdges);
        }
    }
}
const colors = ['#fc5c7d', '#e5689c', '#c971bb', '#a47adb', '#6a82fb'];
function levelColor(element) {
    let level = element.data('level');
    return colors[level - 1];
}

function layout(numNodes) {
    //very scientifically chosen 95 (不 was slow to load)
    //the grid layout appears to be far faster than cose
    //keeping root around in case we want to switch back to bfs
    if (numNodes > 95) {
        return {
            name: 'grid'
        };
    }
    return {
        name: 'cose',
        animate: false
    };
}
function getStylesheet() {
    //TODO make this injectable
    let prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return [
        {
            selector: 'node',
            style: {
                'background-color': levelColor,
                'label': 'data(id)',
                'color': 'black',
                'font-size': '16px',
                'text-valign': 'center',
                'text-halign': 'center'
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': levelColor,
                'target-arrow-shape': 'none',
                'curve-style': 'straight',
                'label': 'data(displayWord)',
                'color': (_ => prefersDark ? '#eee' : '#000'),
                'font-size': '10px',
                'text-background-color': (_ => prefersDark ? '#121212' : '#fff'),
                'text-background-opacity': '1',
                'text-background-shape': 'round-rectangle',
                'text-events': 'yes'
            }
        }
    ];
}
function nodeTapHandler(evt) {
    let id = evt.target.id();
    //not needed if currentHanzi contains id, which would mean the nodes have already been added
    //includes O(N) but currentHanzi almost always < 10 elements
    if (currentPath && !currentPath.includes(id)) {
        addToGraph(id);
    }
    document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [evt.target.id()] } }));
    // notify the flow diagrams...sigh
    document.dispatchEvent(new CustomEvent('graph-interaction', { detail: evt.target.id() }));
    switchToState(stateKeys.main);
}
function edgeTapHandler(evt) {
    document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: evt.target.data('words') } }));
    // notify the flow diagrams...sigh
    document.dispatchEvent(new CustomEvent('graph-interaction', { detail: evt.target.data('words')[0] }));
    switchToState(stateKeys.main);
}
function setupCytoscape(elements, graphContainer) {
    cy = cytoscape({
        container: graphContainer,
        elements: elements,
        layout: layout(elements.nodes.length),
        style: getStylesheet(),
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', nodeTapHandler);
    cy.on('tap', 'edge', edgeTapHandler);
}
function addToGraph(character) {
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    let maxEdges = 8;
    dfs(character, result, maxDepth, {}, maxEdges);
    let preNodeCount = cy.nodes().length;
    let preEdgeCount = cy.edges().length;
    cy.add(result);
    if (cy.nodes().length !== preNodeCount || cy.edges().length !== preEdgeCount) {
        //if we've actually added to the graph, re-render it; else just let it be
        cy.layout(layout(cy.nodes().length)).run();
    }
    currentPath.push(character);
}
function isInGraph(node) {
    return cy && cy.getElementById(node).length;
}
function updateColorScheme() {
    if (!cy) {
        return;
    }
    cy.style(getStylesheet());
}

// TODO: reinstate this
function inCurrentPath(character) {
    return (currentPath && currentPath.includes(character));
}
function getMaxEdges(word) {
    let unique = new Set();
    for (const character of word) {
        unique.add(character);
    }
    if (unique.size < 3) {
        return 8;
    }
    if (unique.size < 4) {
        return 6;
    }
    if (unique.size < 5) {
        return 5;
    }
    return 4;
}

function buildGraph(value) {
    graphContainer.innerHTML = '';
    graphContainer.className = '';
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    // TODO: this is kinda not DFS
    for (const character of value) {
        dfs(character, result, maxDepth, {}, getMaxEdges(value));
    }
    addEdges(value, result);

    if (result.nodes.length === 0 && result.edges.length === 0) {
        graphContainer.innerHTML = 'No results found. Only kanji are shown in this view. Try the "Show Flow" button.'
        return;
    }
    if (showingGraph) {
        setupCytoscape(result, graphContainer);
    } else {
        dirty = result;
    }
    currentPath = [...value];
}

let showingGraph = true;
let pendingResizeTimeout = null;
let dirty = null;

function initialize() {
    document.addEventListener('graph-update', function (event) {
        buildGraph(event.detail);
    });
    document.addEventListener('color-key-update', function (event) {
        levelProperty = event.detail;
    });
    parent.addEventListener('hidden', function () {
        showingGraph = false;
    });
    parent.addEventListener('shown-animationend', function () {
        showingGraph = true;
        if (dirty) {
            setupCytoscape(dirty, graphContainer);
            dirty = null;
        }
    });
    window.addEventListener('resize', function () {
        clearTimeout(pendingResizeTimeout);
        pendingResizeTimeout = setTimeout(() => {
            // TODO: probably want a sizeDirty bit we can check for when the graph isn't shown and a resize happens
            if (cy && showingGraph) {
                cy.layout(layout(cy.nodes().length)).run();
            }
        }, 1000);
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);
    document.addEventListener('character-set-changed', function (event) {
        if (event.detail.ranks) {
            ranks = event.detail.ranks;
        }
    });
}

export { initialize, isInGraph }