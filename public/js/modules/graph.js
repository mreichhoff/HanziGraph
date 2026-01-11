import { switchToState, stateKeys, diagramKeys, switchDiagramView } from "./ui-orchestrator";
import { getActiveGraph } from "./options";
import { parsePinyin, trimTone, findPinyinRelationships } from "./pronunciation-parser";
import cytoscape from "cytoscape";
import fcose from 'cytoscape-fcose';

const parent = document.getElementById('graph-container');
const graphContainer = document.getElementById('graph');
const switchLegend = document.getElementById('switch-legend');

const freqLegend = document.getElementById('freq-legend');
const toneLegend = document.getElementById('tone-legend');
// TODO: shared with options...could de-couple with custom events, but who has the time
const headerLogo = document.getElementById('header-logo');

let cy = null;
let currentPath = [];
// TODO(refactor): consolidate with options
let ranks = [1000, 2000, 4000, 7000, 10000, Number.MAX_SAFE_INTEGER];

//TODO look up how to make this prettier
const modes = { graph: 'graph', components: 'components' };
let mode = modes.graph;
let root = null;

const colorCodeModes = { frequency: 'frequency', tones: 'tones' };
let colorCodeMode = colorCodeModes.tones;

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

function componentsBfs(value) {
    let elements = { 'nodes': [], 'edges': [] };
    let queue = [{ word: value, path: [value] }];
    let countsByDepth = {};
    while (queue.length > 0) {
        //apparently shift isn't O(1) in js, but this is not many elements
        let curr = queue.shift();
        if (!((curr.path.length - 1) in countsByDepth)) {
            countsByDepth[curr.path.length - 1] = 0;
        }
        elements.nodes.push({
            data: {
                id: curr.path.join(''),
                word: curr.word,
                depth: curr.path.length - 1,
                treeRank: countsByDepth[curr.path.length - 1]++,
                path: curr.path,
                level: (curr.word in hanzi ? hanzi[curr.word].node.level : 6)
            }
        });
        for (const component of window.components[curr.word].components) {
            elements.edges.push({
                data: {
                    id: ('_edge' + curr.path.join('') + component),
                    source: curr.path.join(''),
                    target: (curr.path.join('') + component)
                }
            });
            queue.push({ word: component, path: [...curr.path, component] });
        }
    }
    return elements;
}

function dfs(start, elements, maxDepth, visited, maxEdges) {
    if (maxDepth < 0) {
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
                        level: value.level,
                        words: value.words,
                        // render examples for all words, but only display one
                        displayWord: value.words[0]
                    }
                });
                usedEdges.push(key);
            }
        }
    }
    elements.nodes.push({ data: { id: start, level: curr.node.level } });
    for (const key of usedEdges) {
        if (!visited[key]) {
            dfs(key, elements, maxDepth - 1, visited, maxEdges);
        }
    }
}
// TODO: keep in sync with frequency classes in css...should move to cytoscape css instead of using this
const colors = ['#fc5c7d', '#ea6596', '#d56eaf', '#bb75c8', '#9b7ce1', '#6a82fb'];
function levelColor(element) {
    let level = element.data('level');
    return colors[level - 1];
}
function getTone(character) {
    return (character in definitions && definitions[character].length) ? definitions[character][0].pinyin[definitions[character][0].pinyin.length - 1] : '5';
}
function toneColor(element) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const character = (mode === modes.components) ? element.data('word') : element.data('id');
    const tone = getTone(character);
    if (tone === '1' || tone === '2' || tone === '3' || tone === '4') {
        return getComputedStyle(document.documentElement).getPropertyValue(`--tone-${tone}-color`);
    }
    return prefersDark ? '#888' : '#000';
}

// shamelessly taken from https://stackoverflow.com/questions/3942878
function useLightText(bgColor) {
    let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    let r = parseInt(color.substring(0, 2), 16); // hexToR
    let g = parseInt(color.substring(2, 4), 16); // hexToG
    let b = parseInt(color.substring(4, 6), 16); // hexToB
    let uicolors = [r / 255, g / 255, b / 255];
    let c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return L <= 0.179;
}

function makeLegible(element) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const character = (mode === modes.components) ? element.data('word') : element.data('id');
    const tone = getTone(character);
    if (tone !== '5') {
        const toneColor = getComputedStyle(document.documentElement).getPropertyValue(`--tone-${tone}-color`);
        return useLightText(toneColor) ? 'white' : 'black';
    }
    if (tone === '5' && !prefersDark && !getActiveGraph().disableToneColors) {
        return 'white';
    }
    return 'black';
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
        name: 'fcose',
        animate: false
    };
}
function edgeLabel(element) {
    if (getActiveGraph().transcriptionName === 'jyutping') {
        // TODO: get this working for jyutping too
        return '';
    }
    const sourceCharacter = element.data('source')[element.data('source').length - 1];
    const targetCharacter = element.data('target')[element.data('source').length];
    return findPinyinRelationships(sourceCharacter, targetCharacter);
}

function getStylesheet() {
    const isTree = (mode === modes.components);
    const isTones = (colorCodeMode === colorCodeModes.tones);
    //TODO make this injectable
    let prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let result = [
        {
            selector: 'node',
            style: {
                'background-color': (isTones) ? toneColor : levelColor,
                'label': isTree ? 'data(word)' : 'data(id)',
                'color': isTones ? makeLegible : 'black',
                'font-size': '32px',
                'font-weight': '500',
                'text-valign': 'center',
                'text-halign': 'center',
                'width': '50px',
                'height': '50px',
                'border-width': '2px',
                'border-color': prefersDark ? '#555' : '#e0e0e0',
                'border-opacity': '0.6',
                'overlay-opacity': '0',
                'transition-property': 'background-color, border-color, border-width',
                'transition-duration': '0.2s'
            }
        },
        {
            selector: 'node:selected',
            style: {
                'border-width': '3px',
                'border-color': prefersDark ? '#fff' : '#000',
                'border-opacity': '0.8'
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': (!isTones && !isTree) ? levelColor : prefersDark ? '#555' : '#000',
                'target-arrow-shape': !isTree ? 'none' : 'triangle',
                'curve-style': 'straight',
                'label': !isTree ? 'data(displayWord)' : edgeLabel,
                'color': (_ => prefersDark ? '#ccc' : '#121212'),
                'font-size': isTree ? '12px' : '14px',
                'font-weight': '400',
                'text-background-color': (_ => prefersDark ? '#1a1a1a' : '#e4eeff'),
                'text-background-opacity': '1',
                'text-background-shape': 'round-rectangle',
                'text-background-padding': '3px',
                'text-events': 'yes',
                'width': '5px',
                'opacity': '1',
                'overlay-opacity': '0'
            }
        },
        {
            selector: 'edge:selected',
            style: {
                'width': '6px',
                'opacity': '1',
                'line-color': prefersDark ? '#999' : '#000'
            }
        }
    ];
    if (isTree) {
        result[2].style.width = '2.5px';
        result[2].style['color'] = prefersDark ? '#eee' : '#222';
        result[2].style['text-background-color'] = prefersDark ? '#222' : '#f5f5f5';
        result[2].style['text-background-padding'] = '4px';
        result[2].style['arrow-scale'] = '0.8';
        result[2].style['text-background-shape'] = 'round-rectangle';
        result[2].style['target-arrow-color'] = prefersDark ? '#555' : '#000';
    }
    return result;
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
function bfsLayout(root) {
    return {
        name: 'breadthfirst',
        roots: [root],
        padding: 6,
        spacingFactor: 0.85,
        directed: true,
        depthSort: function (a, b) {
            return a.data('treeRank') - b.data('treeRank')
        }
    };
}
function buildComponentTree(value) {
    graphContainer.innerHTML = '';
    graphContainer.className = '';
    root = value;
    mode = modes.components;
    cy = cytoscape({
        container: graphContainer,
        elements: componentsBfs(value),
        layout: bfsLayout(value),
        style: getStylesheet(),
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', function (evt) {
        document.dispatchEvent(new CustomEvent('explore-update', {
            detail: {
                words: [evt.target.data('word')]
            }
        }));
        // notify the flow diagrams...sigh
        document.dispatchEvent(new CustomEvent('graph-interaction', { detail: evt.target.data('word') }));
    });
}
function buildGraph(value) {
    graphContainer.innerHTML = '';
    graphContainer.className = '';
    mode = modes.graph;
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    // TODO: this is kinda not DFS
    for (const character of value) {
        dfs(character, result, maxDepth, {}, getMaxEdges(value));
    }
    addEdges(value, result);
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

function toggleColorCodeMode() {
    if (colorCodeMode === colorCodeModes.tones) {
        colorCodeMode = colorCodeModes.frequency;
        freqLegend.removeAttribute('style');
        freqLegend.classList.add('slide-in');
        toneLegend.style.display = 'none';
        toneLegend.classList.remove('slide-in');
        headerLogo.classList.add('freq');
    } else {
        colorCodeMode = colorCodeModes.tones;
        toneLegend.removeAttribute('style');
        toneLegend.classList.add('slide-in');
        freqLegend.style.display = 'none';
        freqLegend.classList.remove('slide-in');
        headerLogo.classList.remove('freq');
    }
    updateColorScheme();
}

function toggleColorCodeVisibility() {
    if (getActiveGraph().disableToneColors) {
        colorCodeMode = colorCodeModes.frequency;
        freqLegend.removeAttribute('style');
        toneLegend.style.display = 'none';
        switchLegend.style.display = 'none';
        headerLogo.classList.add('freq');
    } else {
        headerLogo.addEventListener('click', toggleColorCodeMode);
    }
}

let skipResize = false;
let pendingSkipResizeTimeout = null;
function handleResize() {
    clearTimeout(pendingResizeTimeout);
    pendingResizeTimeout = setTimeout(() => {
        // if the window resizes with the graph collapsed, re-expand it
        // note that switchDiagramView no-ops if we're going main-->main
        if (!window.matchMedia('(max-width:664px)').matches) {
            switchDiagramView(diagramKeys.main);
        }
        // TODO: probably want a sizeDirty bit we can check for when the graph isn't shown and a resize happens
        if (!skipResize && cy && showingGraph) {
            cy.layout(mode === modes.graph ? layout(cy.nodes().length) : bfsLayout(root)).run();
        }
        skipResize = false;
        // clear it now, it's a hacky timing based solution
        clearTimeout(pendingSkipResizeTimeout);
    }, 1000);
}

function initialize() {
    cytoscape.use(fcose);
    toggleColorCodeVisibility();
    switchLegend.addEventListener('click', toggleColorCodeMode);
    document.addEventListener('graph-update', function (event) {
        buildGraph(event.detail);
    });
    document.getElementById('collapse-graph').addEventListener('click', function () {
        switchDiagramView(diagramKeys.none);
    });
    document.addEventListener('components-update', function (event) {
        // Anytime the components are being rendered, ensure the main diagram is shown.
        // TODO: could also call this when `components-update` is dispatched. Note that
        // doing a similar switch on receipt of `graph-update` would not be appropriate
        // since it doesn't always require a switch.
        switchDiagramView(diagramKeys.main);
        buildComponentTree(event.detail);
    })
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
    window.addEventListener('resize', handleResize);
    document.addEventListener('user-graph-resize', handleResize);

    // this hack is present because the android soft keyboard triggers a window resize event
    document.addEventListener('skip-graph-resize', function () {
        clearTimeout(pendingSkipResizeTimeout);
        skipResize = true;
        // skip one, but if no event is fired, reset the skip thing anyway after 1.5 seconds to prevent
        // the event not being fired from causing a future resize to be erroneously skipped
        // since uh...the event isn't fired at least on iOS devices, unclear android/chrome version specifics
        pendingSkipResizeTimeout = setTimeout(function () {
            skipResize = false;
        }, 1500);
    });
    document.addEventListener('color-preferences-changed', updateColorScheme);
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);
}

export { initialize, isInGraph }