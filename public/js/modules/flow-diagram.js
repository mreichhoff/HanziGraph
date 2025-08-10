import { diagramKeys, switchDiagramView } from "./ui-orchestrator";
import { sankey, sankeyLinkHorizontal, sankeyCenter, sankeyJustify, sankeyRight, sankeyLeft } from "d3-sankey";
import { map, schemeTableau10, union, scaleOrdinal, format as d3format, create } from "d3";
import { getPartition, getActiveGraph } from "./options";
import { faqTypes, showFaq } from "./faq";
import { isAiEligible, analyzeCollocation } from "./data-layer";
import { createLoadingDots } from "./dom";

function addToTrie(trie, collocation, count, term, maxDepth) {
    let words = collocation.split(' ');
    // Avoid clutter via this one simple trick
    if (words.length > maxDepth) {
        return maxDepth;
    }
    if (words.some(word => (!(word in window.wordSet)))) {
        return maxDepth;
    }
    let i = 0;
    if (!trie[0]) {
        trie[0] = {};
        trie[0][term] = { edges: {}, collocations: new Set() };
    }
    for (i = 0; i < words.length; i++) {
        if (words[i] === term) {
            break;
        }
    }
    // TODO: combine these for loops
    // TODO are these counts right, especially for those edges distance 1 from the search term?
    for (let j = i + 1; j < words.length; j++) {
        if (!trie[j - i]) {
            trie[j - i] = {};
        }
        if (!trie[j - i][words[j]]) {
            trie[j - i][words[j]] = { edges: {}, collocations: new Set() };
        }
        trie[j - i][words[j]].collocations.add(collocation);
        if (!trie[j - i - 1][words[j - 1]].edges[words[j]]) {
            trie[j - i - 1][words[j - 1]].edges[words[j]] = 0;
        }
        let currentCount = trie[j - i - 1][words[j - 1]].edges[words[j]];
        trie[j - i - 1][words[j - 1]].edges[words[j]] = Math.max(count, currentCount);//+=count;
        trie[j - i - 1][words[j - 1]].collocations.add(collocation);
    }
    for (let j = i - 1; j >= 0; j--) {
        if (!trie[j - i]) {
            trie[j - i] = {};
        }
        if (!trie[j - i][words[j]]) {
            trie[j - i][words[j]] = { edges: {}, collocations: new Set() };
        }
        trie[j - i][words[j]].collocations.add(collocation);
        if (!trie[j - i][words[j]].edges[words[j + 1]]) {
            trie[j - i][words[j]].edges[words[j + 1]] = 0;
        }
        let currentCount = trie[j - i][words[j]].edges[words[j + 1]] || 0;
        trie[j - i][words[j]].edges[words[j + 1]] = Math.max(count, currentCount);//+=count;
        trie[j - i][words[j]].collocations.add(collocation);
    }
    return -i;
}

function getDiagramElements(trie, rootDepth) {
    let elements = { nodes: [], edges: [], labels: {}, collocations: {} };
    let nonRoots = {};
    nonRoots[rootDepth] = new Set();
    for (let level = rootDepth; level in trie; level++) {
        const nodes = trie[level];
        for (const [node, data] of Object.entries(nodes)) {
            elements.nodes.push({
                id: `${node}-${level}`
            });
            elements.labels[`${node}-${level}`] = node;
            elements.collocations[`${node}-${level}`] = data.collocations;
            for (const edge of Object.keys(data.edges)) {
                if (!nonRoots[level + 1]) {
                    nonRoots[level + 1] = new Set();
                }
                nonRoots[level + 1].add(edge);
                elements.edges.push({
                    //id: `${node}-${level}-${edge}`,
                    source: `${node}-${level}`,
                    target: `${edge}-${parseInt(level) + 1}`,
                    value: data.edges[edge] //TODO switch to iterator on key/value pairs
                });
            }
        }
    }
    return elements;
}

function getDepth(width) {
    // TODO: leaving this here for now. Possibly should be able to be modified via a preference or something.
    // clutter gets bad fast, however.
    return 3;
}

function getFontSize(width) {
    if (width >= 600) {
        return 16;
    }
    return 14;
}

function getHeight(containerHeight) {
    return Math.min(500, containerHeight - 40);
}

let cachedCollocations = {};

// TODO: combine with explore.js
function getFrequencyLevel(rank, ranks) {
    for (let i = 0; i < ranks.length; i++) {
        if (rank < ranks[i]) {
            return i + 1;
        }
    }
    return ranks.length;
}

function renderCollocationData(term, collocations, nextSibling, container) {
    let sorted = Object.entries(collocations).map(x => {
        return [x[0].split(' '), x[1]];
    }).sort((a, b) => {
        if (a[0].length !== b[0].length) {
            return b[0].length - a[0].length;
        }
        return b[1] - a[1];
    }).slice(0, 3);
    if (sorted.length <= 0) {
        // Nothing to see here, move along
        return;
    }
    let description = document.createElement('p');
    description.className = 'collocations-detail';
    // TODO: assumption of ranks being present ok for now, but should be switched (well, a couple refactors would be good there)
    description.innerHTML = `<span class="emphasized freq${getFrequencyLevel(wordSet[term], getActiveGraph().ranks)}">${term}</span> is often used with:`;
    for (const collocation of sorted) {
        let collocationsContainer = document.createElement('p');
        collocationsContainer.classList.add('collocation');
        for (const word of collocation[0]) {
            let wordHolder = document.createElement('a');
            wordHolder.classList.add('emphasized', 'navigable', `freq${getFrequencyLevel(wordSet[word], getActiveGraph().ranks)}`);
            wordHolder.innerText = word;
            wordHolder.addEventListener('click', function () {
                switchDiagramView(diagramKeys.main);
                document.dispatchEvent(new CustomEvent('graph-update', { detail: word }));
            })
            collocationsContainer.appendChild(wordHolder);
        }
        // collocationsContainer.innerHTML += '...';
        description.appendChild(collocationsContainer);
    }
    container.insertBefore(description, nextSibling);
}

async function renderUsageDiagram(term, container) {
    container.innerHTML = '';
    let explanation = document.createElement('p');
    // TODO(refactor): consolidate explanation classes
    explanation.classList.add('flow-explanation');
    container.appendChild(explanation);
    // will be empty unless the user is eligible
    const aiContainer = document.createElement('div');
    aiContainer.classList.add('inline-button-container');
    container.appendChild(aiContainer);
    explanation.innerText = 'Loading...';
    let count = 0;
    let loadingIndicator = setInterval(function () {
        count++;
        if (count < 20) {
            explanation.innerText += '.';
        }
    }, 500);
    const collocations = await getCollocations(term);
    clearInterval(loadingIndicator);
    if (!collocations) {
        explanation.innerText = `Sorry, we found no data for ${term}`;
        return;
    }
    renderCollocationData(term, collocations, explanation, container);
    explanation.innerText = 'Click any word to update the diagram. ';
    let faqLink = document.createElement('a');
    faqLink.className = 'active-link';
    faqLink.textContent = "Learn more.";
    faqLink.addEventListener('click', function () {
        showFaq(faqTypes.flow);
    });
    explanation.appendChild(faqLink);
    let trie = {};
    let rootDepth = 0;
    // Build what is effectively a level-order trie based on the collocations.
    // Level ordering ensures nodes are not confused in cases where the same word appears at multiple depths.
    for (const [collocation, count] of Object.entries(collocations)) {
        rootDepth = Math.min(rootDepth, addToTrie(trie, collocation, count, term, getDepth(container.offsetWidth)));
    }
    // Once the trie is built, convert that to a set of nodes and edges, and render a sankey diagram.
    let elements = getDiagramElements(trie, rootDepth);
    let chart = SankeyChart({
        nodes: elements.nodes,
        links: elements.edges
    }, {
        nodeGroup: d => d.id.split('-')[0],
        // TODO: not sure this can be done via CSS breakpoints given svg viewport, etc.?
        // should probably also have main be responsible for this instead of reading window directly
        width: Math.min(container.offsetWidth, 1000),
        height: Math.min(container.offsetWidth / 1.4, 400),
        nodeLabel: d => elements.labels[d.id],
        nodeAlign: 'center',
        linkTitle: d => `${elements.labels[d.source.id]} ${elements.labels[d.target.id]}: ${d.value}`,
        linkClickHandler: (d, i) => {
            if (isAiEligible()) {
                aiContainer.innerHTML = '';
                aiContainer.classList.remove('ai-explanation-container');
                aiContainer.classList.add('inline-button-container');
                const collocationsAtClickedNode = elements.collocations[i.id];
                for (const collocation of collocationsAtClickedNode) {
                    const collocationSentencesContainer = document.createElement('div');
                    collocationSentencesContainer.classList.add('inline-menu-item');
                    const aiIcon = document.createElement('span');
                    aiIcon.classList.add('ai-icon');
                    const sentenceButton = document.createElement('span');
                    sentenceButton.innerText = `Analyze "${collocation}"`;
                    collocationSentencesContainer.appendChild(aiIcon);
                    collocationSentencesContainer.appendChild(sentenceButton);
                    collocationSentencesContainer.addEventListener('click', async function () {
                        aiContainer.innerHTML = '';
                        aiContainer.classList.remove('inline-button-container');
                        aiContainer.appendChild(createLoadingDots());
                        const aiData = await analyzeCollocation(collocation);
                        aiContainer.innerHTML = '';
                        aiContainer.classList.add('ai-explanation-container');
                        document.dispatchEvent(new CustomEvent('collocation-analysis-response', { detail: { aiData, term, collocation, aiContainer } }));
                    });
                    aiContainer.appendChild(collocationSentencesContainer);
                }
            }
            getCollocations(elements.labels[i.id]);
            switchDiagramView(diagramKeys.main);
            document.dispatchEvent(new CustomEvent('graph-update', { detail: elements.labels[i.id] }));
        },
        fontColor: 'currentColor',
        fontSize: getFontSize(container.offsetWidth),
        nodeStroke: null
    });
    container.appendChild(chart);
}

async function getCollocations(word) {
    if (word in cachedCollocations) {
        return cachedCollocations[word];
    }
    const activeGraph = getActiveGraph();
    try {
        const response = await fetch(`/${activeGraph.collocationsPath}/${getPartition(word, activeGraph.partitionCount)}.json`);
        let data = await response.json();
        if (word in data) {
            // could cache every collocation in `data`, but will allow service worker cache instead of growing memory that way.
            cachedCollocations[word] = data[word];
            return data[word];
        } else {
            cachedCollocations[word] = null;
            return null;
        }
    } catch {
        // Treat errors no differently than missing data.
        return null;
    }
}

function initialize() {
    // TODO: should we listen to explore-update in addition to (or instead of) graph-update?
    // not thrilled about the separate listeners, but explore only means hanzi clicks get ignored,
    // and graph only means graph clicks get ignored, and both means duplicate concurrent events
    // The idea here is to pre-fetch the collocations and rely on service worker caching when available.
    document.addEventListener('explore-update', function (event) {
        for (const word of event.detail.words) {
            getCollocations(word);
        }
    });
}

//TODO: mostly copy/pasted from observable
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram
function SankeyChart({
    nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
    links // an iterable of link objects (typically [{source, target}, …])
}, {
    format = ",", // a function or format specifier for values in titles
    align = "justify", // convenience shorthand for nodeAlign
    fontColor = 'black',
    fontSize = 16,
    nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
    nodeGroup, // given d in nodes, returns an (ordinal) value for color
    nodeGroups, // an array of ordinal values representing the node groups
    nodeLabel, // given d in (computed) nodes, text to label the associated rect
    nodeTitle = _ => ``, // given d in (computed) nodes, hover text
    nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
    nodeWidth = 25, // width of node rects
    nodePadding = 10, // vertical separation between adjacent nodes
    nodeLabelPadding = 2, // horizontal separation between node and label
    nodeStroke = "currentColor", // stroke around node rects
    nodeStrokeWidth, // width of stroke around node rects, in pixels
    nodeStrokeOpacity, // opacity of stroke around node rects
    nodeStrokeLinejoin, // line join for stroke around node rects
    linkSource = ({ source }) => source, // given d in links, returns a node identifier string
    linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
    linkValue = ({ value }) => value, // given d in links, returns the quantitative value
    linkPath = sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
    linkTitle = d => `${d.source.id}  ${d.target.id}: ${d.value}`, // given d in (computed) links
    linkClickHandler = function (d, i) { },
    linkColor = "source-target", // source, target, source-target, or static color
    linkStrokeOpacity = 0.4, // link stroke opacity
    //linkMixBlendMode = "", // link blending mode, which some mobile browsers do not support on <svg>
    colors = schemeTableau10, // array of colors
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    marginTop = 5, // top margin, in pixels
    marginRight = 1, // right margin, in pixels
    marginBottom = 5, // bottom margin, in pixels
    marginLeft = 1, // left margin, in pixels
} = {}) {
    // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
    if (typeof nodeAlign !== "function") nodeAlign = {
        left: sankeyLeft,
        right: sankeyRight,
        center: sankeyCenter
    }[nodeAlign] ?? sankeyJustify;

    // Compute values.
    const LS = map(links, linkSource).map(intern);
    const LT = map(links, linkTarget).map(intern);
    const LV = map(links, linkValue);
    if (nodes === undefined) nodes = Array.from(union(LS, LT), id => ({ id }));
    const N = map(nodes, nodeId).map(intern);
    const G = nodeGroup == null ? null : map(nodes, nodeGroup).map(intern);

    // Replace the input nodes and links with mutable objects for the simulation.
    nodes = map(nodes, (_, i) => ({ id: N[i] }));
    links = map(links, (_, i) => ({ source: LS[i], target: LT[i], value: LV[i] }));

    // Ignore a group-based linkColor option if no groups are specified.
    if (!G && ["source", "target", "source-target"].includes(linkColor)) linkColor = "currentColor";

    // Compute default domains.
    if (G && nodeGroups === undefined) nodeGroups = G;

    // Construct the scales.
    const color = nodeGroup == null ? null : scaleOrdinal(nodeGroups, colors);

    // Compute the Sankey layout.
    sankey()
        .nodeId(({ index: i }) => N[i])
        .nodeAlign(nodeAlign)
        .nodeWidth(nodeWidth)
        .nodePadding(nodePadding)
        .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
        ({ nodes, links });

    // Compute titles and labels using layout nodes, so as to access aggregate values.
    if (typeof format !== "function") format = d3format(format);
    const Tl = nodeLabel === undefined ? N : nodeLabel == null ? null : map(nodes, nodeLabel);
    const Tt = nodeTitle == null ? null : map(nodes, nodeTitle);
    const Lt = linkTitle == null ? null : map(links, linkTitle);

    // A unique identifier for clip paths (to avoid conflicts).
    const uid = `O-${Math.random().toString(16).slice(2)}`;

    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const node = svg.append("g")
        .attr("stroke", nodeStroke)
        .attr("stroke-width", nodeStrokeWidth)
        .attr("stroke-opacity", nodeStrokeOpacity)
        .attr("stroke-linejoin", nodeStrokeLinejoin)
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0);

    if (G) node.attr("fill", ({ index: i }) => color(G[i]));
    if (Tt) node.append("title").text(({ index: i }) => Tt[i]);

    const link = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", linkStrokeOpacity)
        .selectAll("g")
        .data(links)
        .join("g");
    //.style("mix-blend-mode", linkMixBlendMode);

    if (linkColor === "source-target") link.append("linearGradient")
        .attr("id", d => `${uid}-link-${d.index}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => d.source.x1)
        .attr("x2", d => d.target.x0)
        .call(gradient => gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", ({ source: { index: i } }) => color(G[i])))
        .call(gradient => gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", ({ target: { index: i } }) => color(G[i])));

    link.append("path")
        .attr("d", linkPath)
        .attr("stroke", linkColor === "source-target" ? ({ index: i }) => `url(#${uid}-link-${i})`
            : linkColor === "source" ? ({ source: { index: i } }) => color(G[i])
                : linkColor === "target" ? ({ target: { index: i } }) => color(G[i])
                    : linkColor)
        .attr("stroke-width", ({ width }) => Math.max(1, width))
        .call(Lt ? path => path.append("title").text(({ index: i }) => Lt[i]) : () => { });

    if (Tl) svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
        .attr("fill", fontColor)
        .attr("font-size", fontSize)
        .attr("cursor", "pointer")
        .selectAll("text")
        .data(nodes)
        .join("text")
        .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
        .text(({ index: i }) => Tl[i])
        .on('click', linkClickHandler);

    function intern(value) {
        return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    return Object.assign(svg.node(), { scales: { color } });
}

export { initialize, renderUsageDiagram }