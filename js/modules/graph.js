let cy = null;

let dfs = function (start, elements, maxDepth, visited, maxLevel) {
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
                elements.edges.push({ data: { id: Array.from(start + key).sort().toString(), source: start, target: key, level: value.level, words: value.words } });
            }
        }
    }
    elements.nodes.push({ data: { id: start, level: curr.node.level } });
    for (const [key, value] of Object.entries(curr.edges)) {
        if (!visited[key] && value.level <= maxLevel) {
            dfs(key, elements, maxDepth - 1, visited, maxLevel);
        }
    }
};
//this file meant to hold all cytoscape-related code
let levelColor = function (element) {
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
};

let layout = function (root, numNodes) {
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
};
let getStylesheet = function () {
    //TODO make this injectable
    let prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
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
                'label': 'data(words)',
                'color': (_ => prefersLight ? 'black' : '#eee'),
                'font-size': '10px',
                'text-background-color': (_ => prefersLight ? '#f9f9f9' : 'black'),
                'text-background-opacity': '1',
                'text-background-shape': 'round-rectangle',
                'text-events': 'yes'
            }
        }
    ];
}
let setupCytoscape = function (root, elements, graphContainer, nodeEventHandler, edgeEventHandler) {
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
};
let initializeGraph = function (value, maxLevel, containerElement, nodeEventHandler, edgeEventHandler) {
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    dfs(value, result, maxDepth, {}, maxLevel);
    setupCytoscape(value, result, containerElement, nodeEventHandler, edgeEventHandler);
};
let addToGraph = function (character, maxLevel) {
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
};
let isInGraph = function (node) {
    return cy && cy.getElementById(node).length;
};
let updateColorScheme = function () {
    if (!cy) {
        return;
    }
    cy.style(getStylesheet());
};

export { initializeGraph, addToGraph, isInGraph, updateColorScheme }