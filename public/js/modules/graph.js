import { switchToState, stateKeys } from "./ui-orchestrator";
const graphContainer = document.getElementById('graph');

let cy = null;
let currentPath = [];

function addEdges(word) {
    for (let i = 0; i < word.length; i++) {
        let curr = word[i];
        if (!hanzi[curr]) { continue; }
        for (let j = 0; j < word.length; j++) {
            if (i === j || !hanzi[word[j]]) { continue; }
            if (!hanzi[curr].edges[word[j]]) {
                hanzi[curr].edges[word[j]] = {
                    // TODO(refactor): stop it
                    level: 6,
                    words: []
                };
            }
            // not that efficient, but we almost never see more than 5 items in words, so NBD
            if (hanzi[curr].edges[word[j]].words.indexOf(word) < 0) {
                hanzi[curr].edges[word[j]].words.push(word);
            }
        }
    }
};

function dfs(start, elements, maxDepth, visited) {
    if (maxDepth < 0) {
        return;
    }
    let curr = hanzi[start];
    //todo does javascript have a set?
    visited[start] = true;
    for (const [key, value] of Object.entries(curr.edges)) {
        //don't add outgoing edges when we won't process the next layer
        if (maxDepth > 0) {
            if (!visited[key]) {
                elements.edges.push({
                    data: {
                        id: Array.from(start + key).sort().toString(),
                        source: start, target: key,
                        level: value.level,
                        words: value.words,
                        // render examples for all words, but only display one
                        displayWord: value.words[0]
                    }
                });
            }
        }
    }
    elements.nodes.push({ data: { id: start, level: curr.node.level } });
    for (const key of Object.keys(curr.edges)) {
        if (!visited[key]) {
            dfs(key, elements, maxDepth - 1, visited);
        }
    }
}
function levelColor(element) {
    let level = element.data('level');
    switch (level) {
        case 6:
            return '#68aaee';
        case 5:
            return '#de68ee';
        case 4:
            return '#6de200';
        case 3:
            return '#fff249';
        case 2:
            return '#ff9b35';
        case 1:
            return '#ff635f';
    }
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
function setupCytoscape(elements, graphContainer, nodeEventHandler, edgeEventHandler) {
    cy = cytoscape({
        container: graphContainer,
        elements: elements,
        layout: layout(elements.nodes.length),
        style: getStylesheet(),
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', nodeEventHandler);
    cy.on('tap', 'edge', edgeEventHandler);
}
function addToGraph(character) {
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    dfs(character, result, maxDepth, {});
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
// build a graph based on a word rather than just a character like renderGraph
function buildGraph(value) {
    // we don't necessarily populate all via the script
    // TODO: move to after DFS. Get the nodes and edges into result, then add. Decide whether modifying `hanzi` is good
    addEdges(value);
    graphContainer.innerHTML = '';
    graphContainer.className = '';
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    // TODO: this is kinda not DFS
    for (const character of value) {
        dfs(character, result, maxDepth, {});
    }
    setupCytoscape(result, graphContainer, nodeTapHandler, edgeTapHandler);
    currentPath = [...value];
}

function initialize() {
    document.addEventListener('graph-update', function (event) {
        buildGraph(event.detail);
    });
    // TODO(refactor): listen to character-set-changed event
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);
}

export { initialize, isInGraph }