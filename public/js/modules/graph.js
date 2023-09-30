import { switchToState, stateKeys } from "./ui-orchestrator";
import { getActiveGraph } from "./options";
import { parsePinyin, trimTone } from "./pronunciation-parser";

const parent = document.getElementById('graph-container');
const graphContainer = document.getElementById('graph');
const colorCodeSwitch = document.getElementById('color-code-switch');

const freqLegend = document.getElementById('freq-legend');
const toneLegend = document.getElementById('tone-legend');

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
    while (queue.length > 0) {
        //apparently shift isn't O(1) in js, but this is not many elements
        let curr = queue.shift();
        elements.nodes.push({
            data: {
                id: curr.path.join(''),
                word: curr.word,
                depth: curr.path.length - 1,
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
    if (tone === '1') {
        return '#ff635f';
    } else if (tone === '2') {
        return '#7aeb34';
    } else if (tone === '3') {
        return '#de68ee';
    } else if (tone === '4') {
        return '#68aaee';
    }
    return prefersDark ? '#888' : '#000';
}
function makeLegible(element) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const character = (mode === modes.components) ? element.data('word') : element.data('id');
    const tone = getTone(character);
    // if (tone === '1' || tone === '3' || tone === '4') {
    //     return 'white'; //TODO
    // }
    if (tone === '5' && !prefersDark && getActiveGraph().transcriptionName !== 'jyutping') {
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
        name: 'cose',
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
    const sourceDefs = definitions[sourceCharacter];
    const targetDefs = definitions[targetCharacter];
    if (!sourceDefs || !targetDefs) {
        return '';
    }
    for (const definition of sourceDefs.filter(x => x.pinyin)) {
        const srcPinyin = trimTone(definition.pinyin.toLowerCase());
        const [srcInitial, srcFinal] = parsePinyin(srcPinyin);
        const targetDefsWithPinyin = targetDefs.filter(x => x.pinyin);
        // O(n^2), but there's never more than a few definitions.
        // first pass: check for exact matches (minus tone, already expressed through color)
        for (const targetDef of targetDefsWithPinyin) {
            const targetPinyin = trimTone(targetDef.pinyin.toLowerCase());
            if (targetPinyin === srcPinyin) {
                return targetPinyin;
            }
        }
        // second pass: we didn't find an exact match, so see if there are any initials
        // or finals that match.
        for (const targetDef of targetDefsWithPinyin) {
            const targetPinyin = trimTone(targetDef.pinyin.toLowerCase());
            const [targetInitial, targetFinal] = parsePinyin(targetPinyin);
            if (targetInitial && (targetInitial === srcInitial)) {
                return `${targetInitial}-`;
            }
            if (targetFinal && (targetFinal === srcFinal)) {
                return `-${targetFinal}`;
            }
        }
    }
    return '';
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
                'background-color': (isTones && (getActiveGraph().transcriptionName !== 'jyutping')) ? toneColor : levelColor,
                'label': isTree ? 'data(word)' : 'data(id)',
                'color': isTones ? makeLegible : 'black',
                'font-size': isTree ? '20px' : '18px',
                'text-valign': 'center',
                'text-halign': 'center'
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': (!isTones && !isTree) ? levelColor : prefersDark ? '#666' : '#121212',
                'target-arrow-shape': !isTree ? 'none' : 'triangle',
                'curve-style': 'straight',
                'label': !isTree ? 'data(displayWord)' : edgeLabel,
                'color': (_ => prefersDark ? '#eee' : '#000'),
                'font-size': isTree ? '12px' : '10px',
                'text-background-color': (_ => prefersDark ? '#121212' : '#fff'),
                'text-background-opacity': '1',
                'text-background-shape': 'round-rectangle',
                'text-background-padding': '1px',
                'text-events': 'yes'
            }
        }
    ];
    if (isTree) {
        result[1].style.width = '3px';
        result[1].style['color'] = '#fff';
        result[1].style['text-background-color'] = '#000';
        result[1].style['text-background-padding'] = '2px';
        result[1].style['arrow-scale'] = '0.65';
        result[1].style['text-background-shape'] = 'rectangle';
        result[1].style['target-arrow-color'] = prefersDark ? '#aaa' : '#121212';
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
        directed: true
    };
}
function buildComponentTree(value) {
    // if (getActiveGraph().transcriptionName !== 'jyutping') {
    //     toneLegend.removeAttribute('style');
    //     freqLegend.style.display = 'none';
    // }
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
    // freqLegend.removeAttribute('style');
    // toneLegend.style.display = 'none';
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

function toggleColorCodeVisibility() {
    if (getActiveGraph().transcriptionName !== 'jyutping') {
        colorCodeSwitch.removeAttribute('style');
    } else {
        colorCodeMode = colorCodeModes.frequency;
        freqLegend.removeAttribute('style');
        toneLegend.style.display = 'none';
        colorCodeSwitch.style.display = 'none';
    }
}
function initialize() {
    toggleColorCodeVisibility();
    colorCodeSwitch.addEventListener('click', function () {
        if (colorCodeMode === colorCodeModes.frequency) {
            colorCodeSwitch.innerText = "Tones";
            colorCodeMode = colorCodeModes.tones;
            toneLegend.removeAttribute('style');
            freqLegend.style.display = 'none';
        } else {
            colorCodeSwitch.innerText = "Frequency";
            colorCodeMode = colorCodeModes.frequency;
            freqLegend.removeAttribute('style');
            toneLegend.style.display = 'none';
        }
        updateColorScheme();
    });
    document.addEventListener('graph-update', function (event) {
        buildGraph(event.detail);
    });
    document.addEventListener('components-update', function (event) {
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
    window.addEventListener('resize', function () {
        clearTimeout(pendingResizeTimeout);
        pendingResizeTimeout = setTimeout(() => {
            // TODO: probably want a sizeDirty bit we can check for when the graph isn't shown and a resize happens
            if (cy && showingGraph) {
                cy.layout(mode === modes.graph ? layout(cy.nodes().length) : bfsLayout(root)).run();
            }
        }, 1000);
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);
    document.addEventListener('character-set-changed', function (event) {
        if (event.detail.ranks) {
            ranks = event.detail.ranks;
        }
        toggleColorCodeVisibility();
    });
}

export { initialize, isInGraph }