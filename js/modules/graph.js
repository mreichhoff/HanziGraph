let cy = null;
let currentHanzi = [];

function dfs(start, elements, maxDepth, visited, maxLevel) {
    if (maxDepth < 0) {
        return;
    }
    let curr = hanzi[start];
    //todo does javascript have a set?
    visited[start] = true;
    for (const [key, value] of Object.entries(curr.edges)) {
        //don't add outgoing edges when we won't process the next layer
        if (maxDepth > 0 && value.level <= maxLevel) {
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
    for (const [key, value] of Object.entries(curr.edges)) {
        if (!visited[key] && value.level <= maxLevel) {
            dfs(key, elements, maxDepth - 1, visited, maxLevel);
        }
    }
}
//this file meant to hold all cytoscape-related code
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

function layout(root, numNodes) {
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
    let maxLevel = 6;
    //not needed if currentHanzi contains id, which would mean the nodes have already been added
    //includes O(N) but currentHanzi almost always < 10 elements
    if (currentHanzi && !currentHanzi.includes(id)) {
        addToGraph(id, maxLevel);
    }
    document.dispatchEvent(new CustomEvent('explore-update', { detail: [evt.target.id()] }));
}
function edgeTapHandler(evt) {
    document.dispatchEvent(new CustomEvent('explore-update', { detail: evt.target.data('words') }));
}
function setupCytoscape(root, elements, graphContainer, nodeEventHandler, edgeEventHandler) {
    cy = cytoscape({
        container: graphContainer,
        elements: elements,
        layout: layout(root, elements.nodes.length),
        style: getStylesheet(),
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', nodeEventHandler);
    cy.on('tap', 'edge', edgeEventHandler);
}
function initializeGraph(value, maxLevel, containerElement) {
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    dfs(value, result, maxDepth, {}, maxLevel);
    setupCytoscape(value, result, containerElement, nodeTapHandler, edgeTapHandler);
    currentHanzi = [value];
}
function addToGraph(character, maxLevel) {
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    dfs(character, result, maxDepth, {}, maxLevel);
    let preNodeCount = cy.nodes().length;
    let preEdgeCount = cy.edges().length;
    cy.add(result);
    if (cy.nodes().length !== preNodeCount || cy.edges().length !== preEdgeCount) {
        //if we've actually added to the graph, re-render it; else just let it be
        cy.layout(layout(character, cy.nodes().length)).run();
    }
    currentHanzi.push(character);
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

function inCurrentPath(character) {
    return (currentHanzi && !currentHanzi.includes(character));
}

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);

// TODO(refactor): this file should own the entire graph. It should just be given what to render
// and set up its own event handlers and everything else instead of having base.js listen to events
// and delegate, though there may be some need to have other files be aware (e.g., when switching graphs between
// traditional and simplified)
export { initializeGraph, inCurrentPath, addToGraph, isInGraph, updateColorScheme }