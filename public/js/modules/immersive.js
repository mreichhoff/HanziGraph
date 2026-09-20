import { englishMatch } from './immersive-search.mjs';
import { searchKind, sentenceWords, dictionaryForm } from './immersive-sentences.mjs';
import { readingParts } from './immersive-card.mjs';
import { initializeIntegrations } from './immersive-integration-ui.js';
import { preferredVoice } from './immersive-speech.mjs';
import { parseFurigana, normalizeKana, exampleTokens } from './immersive-japanese.mjs';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { getWordSetFromFrequency } from './graph-functions.js';

import { buildExplorerGraph, isCharacter, placeContextCard, sparseConnections, evictionOrder, wordConnections, searchPositions, neighborPosition } from './immersive-geometry.mjs';

import { kanjiFrequencyLimits, kanjiFrequencyLevel, unrankedKanjiColor, toneOverrides, tonePalette, contrastingText, defaultFrequencies, frequencyPalette } from './immersive-colors.mjs';

cytoscape.use(fcose);
const $ = id => document.getElementById(id);
const mobile = matchMedia('(max-width:700px)');
const dark = matchMedia('(prefers-color-scheme:dark)');
const params = new URLSearchParams(location.search);
const datasets = ['simplified', 'traditional', 'cantonese', 'japanese'];
const dataset = datasets.includes(params.get('set')) ? params.get('set') : 'simplified';
const japanese = dataset === 'japanese';
const language = japanese ? 'ja' : 'zh';
const classicUrl = word => japanese ? `https://japanesegraph.com/japanese/${encodeURIComponent(word || '')}` : `/${dataset}/${encodeURIComponent(word || '')}`;
let readingIndex = new Map();
let japaneseIndex;
let kanjiRanks = {};
let usuallyKana = new Set();
let sentencesPromise;
const loadSentences = () => sentencesPromise ||= cached(`/data/${dataset}/sentences.json`).then(value => { sentences = value; return value; });
let knownWords = new Set();
const readingsFor = (word, defs = definitions[word] || []) => japanese ? [...(readingIndex.get(word) || [])] : defs.map(d => d.pinyin).filter(Boolean);
const toneStorageKey = 'immersive-tone-colors';
let customTones = toneOverrides(null);
try { customTones = toneOverrides(JSON.parse(localStorage.getItem(toneStorageKey))); } catch { /* Storage may be unavailable or malformed. */ }
let tones = tonePalette(customTones, dark.matches);
function saveTones() {
    try { localStorage.setItem(toneStorageKey, JSON.stringify({ version: 2, colors: customTones })); } catch { /* Colors still work for this session. */ }
}
const frequencyStorageKey = 'immersive-frequency-colors';
let frequencies = frequencyPalette(null);
try { frequencies = frequencyPalette(JSON.parse(localStorage.getItem(frequencyStorageKey))); } catch { /* Use defaults if storage is unavailable. */ }
function saveFrequencies() {
    try { localStorage.setItem(frequencyStorageKey, JSON.stringify(frequencies)); } catch { /* Keep session colors. */ }
}
let graph, definitions, sentences, ranks, cy, seed = '学';
let colorMode = (japanese || dataset === 'cantonese') ? 'frequency' : 'tone';
let announcementTimer;
let expansionTimer, searchTimer, searchIndex = [];
let integrations;
const cache = new Map();
const cards = new Map();
const cap = () => mobile.matches ? 90 : 180;
// Coordinates survive renderer eviction, so returning to a place restores it.
const positions = new Map();
const cardAnchors = new Map();
let discovered = new Set();
let neighborhoodCursor = 0;
let characterOrder = [];
let searchedWord = '';
const searchedWords = new Set();
// Connections the reader asked for by name, kept drawn while both characters are resident.
const pinnedPairs = new Set();
const pairKey = (a, b) => [a, b].sort().join(':');

const announce = text => {
    clearTimeout(announcementTimer);
    $('status').textContent = text;
    if (text) announcementTimer = setTimeout(() => { $('status').textContent = ''; }, 5000);
};
const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
};
function button(text, action, className) {
    const node = el('button', text, className);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
}
async function json(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${url}`);
    return response.json();
}
function partition(word) {
    let total = 0;
    for (let i = 0; i < word.length; i++) total += word.charCodeAt(i);
    return total % 100;
}
function cached(url) {
    if (!cache.has(url)) {
        cache.set(url, json(url).catch(error => { cache.delete(url); throw error; }));
        if (cache.size > 20) cache.delete(cache.keys().next().value);
    }
    return cache.get(url);
}
function nodeColor(node) {
    if (japanese && !kanjiRanks[node.id()]) return unrankedKanjiColor(dark.matches);
    if (colorMode === 'frequency') return frequencies[Math.min(5, (graph[node.id()]?.node.level || 6) - 1)];
    const tone = Number(definitions[node.id()]?.[0]?.pinyin?.slice(-1)) || 5;
    return tones[Math.min(4, tone - 1)];
}
function renderReading(container, text) {
    container.replaceChildren();
    if (japanese || dataset === 'cantonese') { container.textContent = text; return; }
    for (const part of readingParts(text)) {
        if (!part.tone) { container.append(document.createTextNode(part.text)); continue; }
        const token = el('span', part.text, 'tone-reading');
        token.style.setProperty('--reading-color', `var(--tone-${part.tone})`);
        token.style.setProperty('--reading-ink', `var(--tone-ink-${part.tone})`);
        container.append(token);
    }
}
function style() {
    tones.forEach((tone, i) => {
        document.documentElement.style.setProperty(`--tone-${i + 1}`, tone);
        document.documentElement.style.setProperty(`--tone-ink-${i + 1}`, contrastingText(tone));
    });
    return [
        { selector: 'node', style: { label: 'data(id)', width: 52, height: 52, 'font-size': 28, 'font-family': 'sans-serif', 'text-valign': 'center', 'text-halign': 'center', 'background-color': nodeColor, color: node => contrastingText(nodeColor(node)), 'border-width': 3, 'border-color': dark.matches ? '#142321' : '#fffefb', 'overlay-opacity': 0 } },
        { selector: 'node.inspected', style: { 'border-width': 4, 'border-color': dark.matches ? '#d4eddb' : '#345f50' } },
        { selector: 'edge', style: { width: 1.5, 'line-color': dark.matches ? '#587566' : '#a9beb0', 'curve-style': 'straight', 'font-size': 12, color: dark.matches ? '#d0e4d7' : '#345847', 'text-background-color': dark.matches ? '#142321' : '#f5f3ee', 'text-background-opacity': .98, 'text-background-padding': 4, 'text-rotation': 'autorotate', 'min-zoomed-font-size': 9, 'text-events': 'yes', 'overlay-opacity': 0 } },
        { selector: 'edge[label]', style: { label: 'data(label)' } },
        { selector: 'edge.revealed', style: { width: 2.3, 'line-color': dark.matches ? '#9dc5ab' : '#648f77', 'z-index': 2 } }

    ];
}
function revealConnections() {
    cy.edges().removeClass('revealed');
    cy.nodes('.inspected, .hovered').connectedEdges().addClass('revealed');
    cy.edges('.hovered, .search-word').addClass('revealed');
}
function refresh() {
    announce('');
    $('node-list').replaceChildren(...visibleNodes().map(n => button(n.id(), () => openWord(n.id()))));
    cy.nodes().removeClass('inspected');
    for (const word of cards.keys()) for (const char of word) cy.getElementById(char).addClass('inspected');
    revealConnections();
}
function addNode(char, position = positions.get(char) || { x: 0, y: 0 }) {
    if (!graph[char] || cy.getElementById(char).length || cy.nodes().length >= cap()) return false;
    cy.add({ data: { id: char }, position });
    positions.set(char, { ...position });
    discovered.add(char);
    return true;
}
function connect() {
    const connections = sparseConnections(cy.nodes().map(n => ({ id: n.id(), position: n.position() })), graph);
    const drawing = new Map(connections.map(({ id, source, target, edge }) => [id,
        { id, source, target, words: edge.words, label: edge.words[0] || '' }]));
    const forced = new Set();
    const available = new Set(cy.nodes().map(node => node.id()));
    // Keep earlier searched words connected while their cards are open. The most
    // recent search wins the label if two words share the same character pair.
    const words = [...cards.keys()].filter(word => searchedWords.has(word) && word !== searchedWord);
    if (searchedWord) words.push(searchedWord);
    for (const word of words) for (const edge of wordConnections(word, available)) {
        drawing.set(edge.id, edge); forced.add(edge.id);
    }
    // A tapped connection is an explicit request, so it outranks the distance, degree
    // and crossing filters for as long as both of its characters stay on the canvas.
    for (const pair of pinnedPairs) {
        const [source, target] = pair.split(':');
        const edge = graph[source]?.edges[target];
        if (!edge || !available.has(source) || !available.has(target)) continue;
        const id = `edge:${pair}`;
        drawing.set(id, { id, source, target, words: edge.words, label: edge.words[0] || '' });
        forced.add(id);
    }
    cy.batch(() => {
        cy.edges().filter(edge => !drawing.has(edge.id())).remove();
        for (const data of drawing.values()) {
            let edge = cy.getElementById(data.id);
            if (!edge.length) edge = cy.add({ data });
            else edge.data({ words: data.words, label: data.label });
            edge.toggleClass('search-word', forced.has(data.id));
        }
    });
    revealConnections();
}
function protectedCharacters() {
    return new Set([...cards.keys()].filter(word => !word.startsWith('\u0000')).concat(searchedWord).flatMap(word => [...word]));
}
function makeRoom(count, protectedIds = new Set()) {
    const extent = cy.extent();
    const protectedNodes = new Set([...protectedCharacters(), ...protectedIds]);
    const candidates = evictionOrder(cy.nodes().map(node => ({ id: node.id(), position: node.position() })), extent, protectedNodes);
    const needed = Math.max(0, cy.nodes().length + count - cap());
    cy.batch(() => candidates.slice(0, needed).forEach(id => {
        const node = cy.getElementById(id);
        positions.set(id, { ...node.position() });
        node.remove();
    }));
    return cap() - cy.nodes().length;
}
// makeRoom only recycles characters that have already left the viewport. An explicit
// request may also displace the on-screen character furthest from what is being read.
function makeSpaceFor(count, center, protectedIds = new Set()) {
    if (makeRoom(count, protectedIds) >= count) return true;
    const safe = new Set([...protectedCharacters(), ...protectedIds]);
    const candidates = [...cy.nodes()].filter(node => !safe.has(node.id())).sort((a, b) =>
        Math.hypot(b.position('x') - center.x, b.position('y') - center.y) -
        Math.hypot(a.position('x') - center.x, a.position('y') - center.y));
    cy.batch(() => {
        for (const node of candidates) {
            if (cap() - cy.nodes().length >= count) break;
            positions.set(node.id(), { ...node.position() });
            node.remove();
        }
    });
    return cap() - cy.nodes().length >= count;
}
// Tapping a listed connection asks for that one link, so draw it: bring the character
// alongside, displacing another if the canvas is full, and keep the edge pinned.
function revealNeighbor(source, target, choice) {
    const edge = graph[source]?.edges[target];
    const anchor = cy.getElementById(source);
    if (!edge || !anchor.length) { navigate(target); return; }
    const extent = cy.extent();
    let node = cy.getElementById(target);
    const offscreen = node.length && (node.position('x') < extent.x1 || node.position('x') > extent.x2 ||
        node.position('y') < extent.y1 || node.position('y') > extent.y2);
    if (!node.length || offscreen) {
        if (!node.length) makeSpaceFor(1, anchor.position(), new Set([source, target]));
        const blocked = [...cards.values()].map(card => card.getBoundingClientRect())
            .filter(box => box.width > 0 && box.height > 0)
            .map(box => ({ x1: (box.left - cy.pan().x) / cy.zoom(), y1: (box.top - cy.pan().y) / cy.zoom(),
                x2: (box.right - cy.pan().x) / cy.zoom(), y2: (box.bottom - cy.pan().y) / cy.zoom() }));
        const position = neighborPosition(anchor.position(), cy.nodes().map(n => n.position()), extent, blocked) || viewportTarget();
        if (node.length) { node.position(position); positions.set(target, { ...position }); }
        else if (!addNode(target, position)) {
            announce(`There is no room for ${target} right now. Pan into open space and try again.`);
            return;
        }
    }
    pinnedPairs.add(pairKey(source, target));
    connect(); refresh();
    if (choice) { choice.classList.add('linked'); choice.setAttribute('aria-pressed', 'true'); }
    announce(`${target} linked to ${source}${edge.words[0] ? ` by ${edge.words[0]}` : ''}. Tap either character on the canvas for details.`);
}
function viewportTarget() {
    const extent = cy.extent(), points = cy.nodes().map(n => n.position());
    if (![extent.x1, extent.y1, extent.w, extent.h].every(Number.isFinite)) return {x:0, y:0};
    let best = {x:extent.x1 + extent.w / 2, y:extent.y1 + extent.h / 2}, score = -Infinity;
    // Aim at the emptiest patch of the viewport, including newly exposed space.
    for (const u of [.2, .4, .6, .8]) for (const v of [.23, .43, .63, .8]) {
        const p = { x: extent.x1 + extent.w * u, y: extent.y1 + extent.h * v };
        const clearance = points.length ? Math.min(...points.map(q => Math.hypot(p.x - q.x, p.y - q.y))) : 1000;
        const candidate = clearance - Math.hypot(u - .5, v - .5) * 30;
        if (candidate > score) { best = p; score = candidate; }
    }
    return best;
}
function restoreViewport() {
    const extent = cy.extent();
    const nearby = [...positions].filter(([char, p]) => !cy.getElementById(char).length &&
        p.x >= extent.x1 - 50 && p.x <= extent.x2 + 50 && p.y >= extent.y1 - 50 && p.y <= extent.y2 + 50);
    makeRoom(nearby.length);
    for (const [char, p] of nearby) addNode(char, p);
}
function expandNodes(nodes, budget = 12) {
    const target = viewportTarget();
    const sources = [...nodes].sort((a, b) => Math.hypot(a.position('x') - target.x, a.position('y') - target.y) - Math.hypot(b.position('x') - target.x, b.position('y') - target.y));
    makeRoom(budget, new Set(sources.slice(0, 4).map(n => n.id())));
    let added = 0;
    const occupied = cy.nodes().map(n => n.position());
    // One new neighbor per source per pass avoids creating large radial hubs.
    for (let pass = 0; pass < 3 && added < budget; pass++) {
        for (const node of sources) {
            if (added >= budget || cy.nodes().length >= cap()) break;
            if (node.removed()) continue;
            const char = Object.keys(graph[node.id()].edges).find(char => !discovered.has(char));
            if (!char) continue;
            const origin = node.position();
            const direction = Math.atan2(target.y - origin.y, target.x - origin.x);
            let best, score = Infinity;
            for (let step = 0; step < 48; step++) {
                const angle = direction + step * 2.399963;
                const radius = 115 + (step % 4) * 30;
                const p = { x: origin.x + Math.cos(angle) * radius, y: origin.y + Math.sin(angle) * radius };
                if (occupied.some(q => Math.hypot(p.x - q.x, p.y - q.y) < 100)) continue;
                const distance = Math.hypot(p.x - target.x, p.y - target.y);
                if (distance < score) { score = distance; best = p; }
            }
            if (best && addNode(char, best)) { occupied.push(best); sources.push(cy.getElementById(char)); added++; }
        }
    }
    connect(); refresh();
    return added;
}
function visibleNodes() {
    const extent = cy.extent();
    return cy.nodes().filter(n => { const p = n.position(); return p.x >= extent.x1 && p.x <= extent.x2 && p.y >= extent.y1 && p.y <= extent.y2; });
}
function discover(budget = 12, automatic = false) {
    restoreViewport();
    const visible = visibleNodes();
    const target = viewportTarget();
    const nearby = cy.nodes().filter(n => Math.hypot(n.position('x') - target.x, n.position('y') - target.y) < 450);
    let added = expandNodes(nearby.length ? nearby : visible, budget);
    // A large pan can leave every existing node off screen. Seed a new island
    // with a real, as-yet unseen neighbor; never draw a fictitious connecting edge.
    const emptyPatch = !visible.length || visible.every(n => Math.hypot(n.position('x') - target.x, n.position('y') - target.y) > 300);
    const targetVacant = cy.nodes().every(n => Math.hypot(n.position('x') - target.x, n.position('y') - target.y) >= 100);
    if (!added && targetVacant && (emptyPatch || !automatic) && makeRoom(budget) > 0) {
        const frontier = [...cy.nodes()].sort((a, b) => Math.hypot(a.position('x') - target.x, a.position('y') - target.y) - Math.hypot(b.position('x') - target.x, b.position('y') - target.y));
        let next;
        for (const node of frontier) {
            next = Object.keys(graph[node.id()].edges).find(char => !discovered.has(char));
            if (next) break;
        }
        while (!next && neighborhoodCursor < characterOrder.length) {
            const candidate = characterOrder[neighborhoodCursor++];
            if (!discovered.has(candidate)) next = candidate;
        }
        if (next && addNode(next, target)) {
            added++;
            added += expandNodes([cy.getElementById(next)], budget - 1);
        }
    }
    connect(); refresh();
    if (!added && !automatic) announce('This patch is full. Pan into open space to discover more connections.');
}
function reset(word = seed) {
    clearTimeout(expansionTimer);
    closeAll();
    positions.clear(); discovered = new Set(); neighborhoodCursor = 0;
    searchedWord = ''; searchedWords.clear(); pinnedPairs.clear();
    seed = word;
    cy.elements().remove();
    const roots = [...word].filter(char => graph[char]);
    if (!roots.length) roots.push(Object.keys(graph)[0]);
    const count = Math.min(cap(), Math.max(24, Math.round(innerWidth * innerHeight / 17000)));
    const queue = [...roots];
    const seen = new Set(queue);
    const tree = [];
    for (let i = 0; i < queue.length && cy.nodes().length < count; i++) {
        const char = queue[i];
        addNode(char);
        for (const next of Object.keys(graph[char].edges).slice(0, 4)) {
            if (!seen.has(next)) { seen.add(next); queue.push(next); tree.push([char, next]); }
        }
    }
    for (const [source, target] of tree) {
        if (cy.getElementById(target).length) cy.add({ data: { id: `initial:${source}:${target}`, source, target } });
    }
    cy.layout({ name: 'fcose', animate: false, fit: false, nodeSeparation: 115, idealEdgeLength: 135, nodeRepulsion: 11000, numIter: 1200 }).run();
    cy.nodes().forEach(node => positions.set(node.id(), { ...node.position() }));
    connect();
    const bounds = cy.nodes().boundingBox();
    const center = { x: (bounds.x1 + bounds.x2) / 2, y: (bounds.y1 + bounds.y2) / 2 };
    const zoom = mobile.matches ? 1 : 1.15;
    cy.viewport({ zoom, pan: { x: innerWidth / 2 - center.x * zoom, y: innerHeight / 2 - center.y * zoom } });
    refresh();
}
function positionCard(word, anchor, source) {
    const card = cards.get(word);
    if (!card) return;
    if (card.dataset.centered === 'true') {
        card.style.left = `${Math.max(12, (innerWidth - card.offsetWidth) / 2)}px`;
        card.style.top = `${Math.max(82, (innerHeight - card.offsetHeight) / 2)}px`;
        return;
    }
    let pan = cy.pan(), zoom = cy.zoom();
    if (anchor) {
        card.style.height = '';
        const size = { width: card.offsetWidth, height: card.offsetHeight };
        const nodes = source ? (source.isNode() ? [source] : [source.source(), source.target()]) : [...new Set([...word])].map(char => cy.getElementById(char)).filter(node => node.length);
        const boxes = nodes.map(node => node.renderedBoundingBox());
        const context = boxes.length ? {
            x:Math.min(...boxes.map(box => box.x1)), y:Math.min(...boxes.map(box => box.y1)),
            width:Math.max(...boxes.map(box => box.x2)) - Math.min(...boxes.map(box => box.x1)),
            height:Math.max(...boxes.map(box => box.y2)) - Math.min(...boxes.map(box => box.y1))
        } : null;
        const placement = placeContextCard(anchor, size,
            { x:12, y:82, width:innerWidth - 24, height:Math.max(180, innerHeight - 182) }, context);
        const {rect, scale, shift} = placement;
        if (scale !== 1 || shift.x || shift.y) {
            // Remove the previous anchor while viewport events fire during reframing.
            cardAnchors.delete(word);
            const nextZoom = zoom * scale;
            cy.minZoom(Math.min(cy.minZoom(), nextZoom));
            cy.viewport({zoom:nextZoom, pan:{x:pan.x * scale + shift.x, y:pan.y * scale + shift.y}});
            pan = cy.pan(); zoom = cy.zoom();
        }
        card.style.height = `${rect.height}px`;
        cardAnchors.set(word, { x: (rect.x - pan.x) / zoom, y: (rect.y - pan.y) / zoom });
    }
    const position = cardAnchors.get(word);
    if (!position) return;
    card.style.left = `${position.x * zoom + pan.x}px`;
    card.style.top = `${position.y * zoom + pan.y}px`;
}
function closeCard(word) {
    cards.get(word)?.cleanup?.();
    integrations?.releaseCard(cards.get(word));
    cards.get(word)?.remove();
    cards.delete(word);
    cardAnchors.delete(word);
    connect(); refresh();
}
function closeAll() {
    for (const card of cards.values()) { card.cleanup?.(); integrations?.releaseCard(card); card.remove(); }
    cards.clear();
    cardAnchors.clear();
}
function speak(word) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = japanese ? 'ja-JP' : dataset === 'cantonese' ? 'zh-HK' : dataset === 'traditional' ? 'zh-TW' : 'zh-CN';
    const voice = preferredVoice(speechSynthesis.getVoices(), utterance.lang);
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
}
function appendJapanese(container, parts) {
    for (const part of parts) {
        if (!part.reading) { container.append(document.createTextNode(part.text)); continue; }
        const ruby = el('ruby', part.text);
        ruby.append(el('rp', '('), el('rt', part.reading), el('rp', ')'));
        container.append(ruby);
    }
}
async function renderKanji(section, char) {
    try {
        const entry = (await cached('/data/japanese/kanji.json'))[char];
        if (!entry || !section.isConnected) return;
        const readings = el('dl', '', 'kanji-readings card-pinyin');
        // Dictionaries write on readings in katakana and kun readings in hiragana, so the
        // script itself says which kind a reading is. ガク and がく are the same sounds.
        const label = (text, hint) => { const term = el('dt', text); term.title = hint; return term; };
        if (entry.on.length) readings.append(
            label('On', 'On reading: borrowed from Chinese and used mostly inside compounds. Shown in katakana by dictionary convention — ガク and がく are the same sounds.'),
            el('dd', entry.on.join(' · ')));
        if (entry.kun.length) readings.append(
            label('Kun', 'Kun reading: the native Japanese reading, used when the kanji stands alone or takes a kana ending. ・ marks where that kana ending begins.'),
            el('dd', entry.kun.map(value => value.replaceAll('.', '・')).join(' · ')));
        section.append(readings);
        const metadata = [entry.strokes ? `${entry.strokes} strokes` : '', entry.grade >= 1 && entry.grade <= 6 ? `School grade ${entry.grade}` : ''].filter(Boolean);
        section.append(el('p', metadata.join(' · '), 'kanji-metadata'));
        if (entry.words?.length) {
            section.append(el('h3', 'Words with this kanji'));
            const list = el('div', '', 'kanji-vocabulary');
            for (const word of entry.words) {
                const choice = button('', () => navigate(word));
                const label = el('span'); appendJapanese(label, [{text:word, reading:readingsFor(word)[0] || ''}]);
                const gloss = definitions[word]?.[0]?.en.split(';')[0] || '';
                choice.append(label, el('small', gloss)); list.append(choice);
            }
            section.append(list);
        }
        const source = el('a', 'Kanji data: KANJIDIC2 / EDRDG', 'classic-link');
        source.href = 'https://www.edrdg.org/wiki/KANJIDIC_Project.html'; section.append(source);
    } catch { section.append(el('p', 'Kanji readings could not be loaded. Reopen this card to retry.')); }
}

function clickableExample(card, container, sentence) {
    const inspector = el('div', '', 'example-word-detail');
    let selected, revision = 0;
    const close = () => {
        revision++; integrations.releaseCard(inspector); inspector.replaceChildren();
        selected?.setAttribute('aria-pressed', 'false'); selected?.focus(); selected = null;
    };
    const cleanup = card.cleanup;
    card.cleanup = () => { cleanup?.(); integrations.releaseCard(inspector); };
    container.replaceChildren();
    for (const token of exampleTokens(sentence)) {
        if (!/[\p{L}\p{N}]/u.test(token.text)) { container.append(document.createTextNode(token.text)); continue; }
        const choice = button('', async () => {
            if (selected === choice) { close(); return; }
            selected?.setAttribute('aria-pressed', 'false'); selected = choice; choice.setAttribute('aria-pressed', 'true');
            const current = ++revision;
            integrations.releaseCard(inspector); inspector.replaceChildren();
            const heading = el('div', '', 'sentence-word-header');
            heading.append(el('strong', token.text));
            const dismiss = button('×', close, 'close'); dismiss.setAttribute('aria-label', 'Close example word'); heading.append(dismiss);
            const reading = el('div', '', 'card-pinyin');
            const meanings = el('ul', 'Looking up…', 'definitions');
            inspector.append(heading, reading, meanings);
            try {
                const defs = await lookupDefinitions(token.text);
                if (!card.isConnected || current !== revision) return;
                const pronunciation = japanese ? token.parts.map(part => part.reading || part.text).join('') : readingsFor(token.text, defs).join(' / ');
                renderReading(reading, pronunciation);
                meanings.replaceChildren(...defs.map(def => el('li', def.en)));
                if (!defs.length) meanings.textContent = 'No entry for this exact form. It may be part of an inflected word.';
                inspector.append(button('Open word →', () => navigate(token.text), 'integration-button'));
                inspector.append(integrations.actions(inspector, () => ({text:token.text, word:token.text, reading:pronunciation, english:defs.map(def => def.en).join('; '), context:sentence.zh.join(''), source:classicUrl(token.text)}), {word:true}));
            } catch { if (current === revision) meanings.textContent = 'Lookup failed. Select the word again to retry.'; }
        }, 'example-token');
        choice.setAttribute('aria-label', `Look up ${token.text}`); choice.setAttribute('aria-pressed', 'false');
        if (japanese) appendJapanese(choice, token.parts); else choice.textContent = token.text;
        container.append(choice);
    }
    return inspector;
}

function findExamples(word, source) {
    const matches = source.filter(s => s.en && (s.zh.includes(word) || ([...word].length === 1 && s.zh.join('').includes(word))));
    if (japanese) matches.sort((a, b) => a.zh.join('').length - b.zh.join('').length);
    return matches.slice(0, 3);
}
async function openWord(word, anchor, source) {
    clearTimeout(searchTimer);
    const node = cy.getElementById([...word].find(char => cy.getElementById(char).length) || '');
    anchor ||= node.length ? node.renderedPosition() : { x: innerWidth / 2, y: innerHeight / 3 };
    $('suggestions').hidden = true;
    if (cards.has(word)) { positionCard(word, anchor, source); cards.get(word).focus(); return; }
    while (cards.size) closeCard(cards.keys().next().value);
    const card = el('section', undefined, 'card');
    if (![...word].some(char => graph[char])) card.dataset.centered = 'true';
    card.tabIndex = -1;
    card.addEventListener('click', event => {
        if (!event.target.closest('.card-more')) card.querySelectorAll('.card-more[open]').forEach(menu => { menu.open = false; });
    });
    card.setAttribute('aria-label', `Details for ${word}`);
    const header = el('div', undefined, 'card-header');
    const title = el('h2', word, 'character'); title.lang = language;
    const close = button('×', () => closeCard(word), 'close');
    close.setAttribute('aria-label', `Close ${word}`);
    const heading = el('div', '', 'card-heading'); heading.append(title);
    const headerTools = el('div', '', 'card-header-tools');
    header.append(heading, headerTools); card.append(header);
    const pronunciation = el('div', 'Loading…', 'transcription card-pinyin'); heading.append(pronunciation);
    const stats = el('div', undefined, 'stats');
    if (!japanese && ranks[word]) stats.append(el('span', `Frequency #${ranks[word].toLocaleString()}`));
    if (graph[word]) stats.append(el('span', `${Object.keys(graph[word].edges).length} connections`));
    card.append(stats, el('h3', 'Meanings'));
    const meanings = el('ol', 'Loading definitions…', 'definitions'); card.append(meanings);
    let wordDefinitions = definitions[word] || [];
    const wordActions = integrations.actions(card, () => ({text:word, reading:readingsFor(word, wordDefinitions).join(' / '), english:wordDefinitions.map(d => d.en).join('; '), source:classicUrl(word)}), {generate:true, toolbarHost:headerTools});
    headerTools.append(close);
    card.append(wordActions);
    const kanjiSection = el('div', '', 'kanji-section');
    if (japanese && [...word].length === 1 && isCharacter(word)) { card.append(kanjiSection); renderKanji(kanjiSection, word); }
    if (usuallyKana.has(word)) stats.append(el('span', 'Usually written in kana'));
    card.append(el('h3', 'In context'));
    const examples = el('div', 'Loading examples…'); card.append(examples);
    if (graph[word]) {
        card.append(el('h3', 'Connected characters'));
        const related = el('div', undefined, 'related');
        const neighbors = Object.keys(graph[word].edges);
        let shown = 0;
        const more = button('More connections', () => showRelated());
        function showRelated() {
            for (const char of neighbors.slice(shown, shown + 12)) {
                const choice = button(char, () => revealNeighbor(word, char, choice));
                choice.setAttribute('aria-label', `Link ${char} to ${word} on the canvas`);
                choice.setAttribute('aria-pressed', String(pinnedPairs.has(pairKey(word, char))));
                if (pinnedPairs.has(pairKey(word, char))) choice.classList.add('linked');
                related.append(choice);
            }
            shown += 12;
            more.hidden = shown >= neighbors.length;
        }
        showRelated();
        card.append(related, more);
    }
    const classic = el('a', `More in classic ${japanese ? 'JapaneseGraph' : 'HanziGraph'} ↗`, 'classic-link');
    classic.href = classicUrl(word); card.append(classic);
    if (japanese) card.append(dictionaryCredit());
    cards.set(word, card); $('cards').append(card); positionCard(word, anchor, source); card.focus(); refresh();
    const defsTask = (async () => {
        try {
            let defs = await lookupDefinitions(word);
            if (japanese && [...word].length === 1 && isCharacter(word)) {
                const info = (await cached('/data/japanese/kanji.json'))[word];
                if (info?.meanings.length) defs = info.meanings.map(en => ({en}));
            }
            wordDefinitions = defs || [];
            wordActions.hidden = false;
            renderReading(pronunciation, [...new Set(readingsFor(word, defs || []))].join(' / '));
            if (japanese) {
                title.replaceChildren();
                appendJapanese(title, [{ text: word, reading: readingsFor(word)[0] || '' }]);
                pronunciation.hidden = true;
            }
            meanings.replaceChildren(...(defs || []).map(d => el('li', d.en)));
            if (!defs?.length) meanings.textContent = 'No definition available for this word.';
        } catch { pronunciation.textContent = ''; meanings.replaceChildren(el('li', 'Definitions could not be loaded. Close and reopen this card to retry.')); }
    })();
    const examplesTask = (async () => {
        let available = sentences;
        try { available ||= await loadSentences(); } catch { examples.textContent = 'Examples could not be loaded. Reopen this card to retry.'; sentencesPromise = null; return; }
        let found = findExamples(word, available);
        let failed = false;
        if (found.length < 3 && ['simplified', 'traditional'].includes(dataset)) {
            try {
                const extra = findExamples(word, await cached(`/data/${dataset}/${partition(word)}.json`));
                const unique = new Set(found.map(s => s.zh.join('')));
                for (const s of extra) if (!unique.has(s.zh.join(''))) { found.push(s); unique.add(s.zh.join('')); }
            } catch { failed = true; }
        }
        examples.replaceChildren();
        for (const sentence of found.slice(0, 3)) {
            const block = el('div', undefined, 'example');
            const chinese = el('p', sentence.zh.join(''), 'chinese'); chinese.lang = language;
            const inspector = clickableExample(card, chinese, sentence);
            const reading = el('p', '', 'card-pinyin'); renderReading(reading, sentence.pinyin || '');
            block.append(chinese, reading, el('p', sentence.en), inspector);
            const entry = {text:sentence.zh.join(''), reading:japanese && sentence.fu ? parseFurigana(sentence.fu).map(part => part.reading || part.text).join('') : sentence.pinyin || '', english:sentence.en, source:classicUrl(word), word, context:sentence.zh.join('')};
            block.append(integrations.actions(card, () => entry));
            examples.append(block);
        }
        if (!found.length) examples.textContent = failed ? 'Examples could not be loaded. Close and reopen this card to retry.' : 'No example sentences available yet.';
    })();
    await Promise.all([defsTask, examplesTask]);
}
function navigate(word, showCard = true) {
    if (japanese) for (const char of word) if (isCharacter(char) && !graph[char]) graph[char] = {node:{level:kanjiFrequencyLevel(kanjiRanks[char])}, edges:{}};
    if (![...word].some(char => graph[char])) { if (showCard) openWord(word); return; }
    clearTimeout(expansionTimer);
    searchedWord = word;
    searchedWords.add(word);
    const chars = [...new Set([...word].filter(c => graph[c]))];
    let cardAnchor;
    if (chars.length > 1) {
        // Existing characters may live in completely different neighborhoods.
        // Gather just the requested characters, preserving everyone else's position.
        const origin = positions.get(chars[0]) || viewportTarget();
        const occupied = [...positions].filter(([char]) => !chars.includes(char)).map(([, p]) => p);
        const columns = Math.min(chars.length, Math.max(2, Math.ceil(Math.sqrt(chars.length * innerWidth / (innerHeight * .32)))));
        const planned = searchPositions(chars, origin, occupied, columns);
        const xs = planned.map(n => n.position.x), ys = planned.map(n => n.position.y);
        const width = Math.max(...xs) - Math.min(...xs) + 70;
        const height = Math.max(...ys) - Math.min(...ys) + 70;
        const zoom = Math.min(1, (innerWidth - 72) / width, innerHeight * .32 / height);
        cy.minZoom(Math.min(.35, zoom));
        const center = { x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2 };
        const screenY = 100 + height * zoom / 2;
        cy.viewport({ zoom, pan: { x: innerWidth / 2 - center.x * zoom, y: screenY - center.y * zoom } });
        const missing = chars.filter(char => !cy.getElementById(char).length);
        makeRoom(missing.length + 8, new Set(chars));
        // Explicit searches take priority even when every resident node is visible.
        if (cap() - cy.nodes().length < missing.length) {
            const protectedIds = protectedCharacters();
            const candidates = [...cy.nodes()].filter(n => !protectedIds.has(n.id())).sort((a, b) =>
                Math.hypot(b.position('x') - center.x, b.position('y') - center.y) - Math.hypot(a.position('x') - center.x, a.position('y') - center.y));
            for (const node of candidates) {
                if (cap() - cy.nodes().length >= missing.length) break;
                positions.set(node.id(), { ...node.position() }); node.remove();
            }
        }
        cy.batch(() => {
            for (const { id, position } of planned) {
                if (!cy.getElementById(id).length) addNode(id, position);
                else cy.getElementById(id).position(position);
                positions.set(id, { ...position });
            }
        });
        cardAnchor = { x: innerWidth / 2 - 127, y: screenY + height * zoom / 2 + 50 };
        expandNodes(chars.map(char => cy.getElementById(char)), 8);
    } else if (chars.length) {
        const missing = chars.filter(c => !cy.getElementById(c).length);
        let position = positions.get(chars[0]) || viewportTarget();
        if (missing.length && !positions.has(chars[0]) && cy.nodes().length + missing.length > cap()) {
            position = { x: cy.nodes().boundingBox().x2 + innerWidth, y: position.y };
        }
        cy.viewport({ zoom: 1, pan: { x: innerWidth * .45 - position.x, y: innerHeight * .4 - position.y } });
        makeRoom(missing.length + 8, new Set(chars));
        chars.forEach(char => addNode(char, position));
        restoreViewport();
        expandNodes(chars.map(c => cy.getElementById(c)).filter(n => n.length), 8);
    }
    connect();
    if (showCard) openWord(word, cardAnchor);
}
function dictionaryCredit() {
    const credit = el('a', 'Dictionary: JMdict / EDRDG · CC BY-SA 4.0', 'classic-link');
    credit.href = 'https://www.edrdg.org/edrdg/licence.html';
    return credit;
}
async function lookupDefinitions(word) {
    let defs = definitions[word];
    if (!defs) defs = (await cached(`/data/${dataset}/definitions/${partition(word)}.json`))[word];
    if (japanese) {
        try {
            const extra = (await cached(`/data/japanese/lexicon/${partition(word)}.json`))[word];
            if (extra?.readings?.length && !readingIndex.has(word)) readingIndex.set(word, new Set(extra.readings));
            if (extra?.definitions?.length) defs = extra.definitions.map(en => ({en}));
        } catch (error) { if (!defs?.length) throw error; }
    }
    return defs || [];
}

async function openSentence(text) {
    clearTimeout(searchTimer); clearTimeout(expansionTimer);
    $('suggestions').hidden = true;
    closeAll();
    // Segment locally before AI returns; never expand every character in a sentence.
    const first = sentenceWords(text, dataset).find(word => [...word].some(char => graph[char]));
    if (first) {
        navigate(first, false);
        const node = cy.getElementById([...first].find(char => graph[char]));
        const position = node.renderedPosition(), pan = cy.pan();
        cy.pan({x:pan.x + innerWidth / 2 - position.x, y:pan.y + 110 - position.y});
    }
    const key = '\u0000sentence';
    const card = el('section', '', 'card sentence-card'); card.dataset.centered = 'true';
    card.tabIndex = -1; card.setAttribute('aria-label', 'Sentence explorer');
    const header = el('div', '', 'card-header');
    header.append(el('h2', 'Sentence', 'sentence-title'));
    const attribution = el('span', 'AI', 'sentence-ai-credit');
    attribution.title = 'Translation, readings and explanations generated by your local AI model';
    header.append(attribution);
    const tools = el('div', '', 'card-header-tools');
    const close = button('×', () => closeCard(key), 'close'); close.setAttribute('aria-label', 'Close sentence');
    tools.append(close); header.append(tools); card.append(header);
    const sentence = el('p', text, 'sentence-text'); sentence.lang = language;
    const output = el('div', '', 'sentence-analysis'); output.setAttribute('aria-live', 'polite');
    const detail = el('div', '', 'sentence-word-detail');
    const sentenceReading = el('div', '', 'card-pinyin');
    const overview = el('div');
    card.append(sentence, sentenceReading, output, detail);
    cards.set(key, card); $('cards').append(card); positionCard(key); card.focus(); refresh();
    let controller;
    const analyze = async () => {
        controller?.abort(); controller = new AbortController();
        const current = controller;
        output.replaceChildren(); output.setAttribute('aria-busy', 'true');
        const waiting = el('div', '', 'ai-waiting');
        const pulse = el('span', '', 'waiting-pulse'); pulse.setAttribute('aria-hidden', 'true');
        const label = el('div'); label.append(el('strong', 'Unpacking your sentence'), el('small', 'Translation, readings, and grammar from your local model.'));
        waiting.append(pulse, label, button('Cancel', () => current.abort())); output.append(waiting);
        try {
            const analysis = await integrations.analyze(card, text, current.signal);
            if (!card.isConnected || current.signal.aborted) return;
            sentence.replaceChildren(); output.replaceChildren();
            let selection = 0, selectedChoice;
            const dismissWord = () => {
                ++selection;
                integrations.releaseCard(detail);
                detail.replaceChildren(); overview.hidden = false;
                selectedChoice?.setAttribute('aria-pressed', 'false');
                selectedChoice?.focus(); selectedChoice = null;
            };
            for (const token of analysis.words) {
                if (!/[\p{L}\p{N}]/u.test(token.text)) { sentence.append(document.createTextNode(token.text)); continue; }
                const choice = button('', async () => {
                    if (selectedChoice === choice) { dismissWord(); return; }
                    selectedChoice = choice;
                    const selected = ++selection;
                    const lemma = dictionaryForm(token, dataset);
                    overview.hidden = true;
                    sentence.querySelectorAll('button').forEach(node => node.setAttribute('aria-pressed', String(node === choice)));
                    integrations.releaseCard(detail);
                    detail.replaceChildren();
                    const title = el('h3', token.text); title.lang = language;
                    const wordHeader = el('div', '', 'sentence-word-header');
                    const wordHeading = el('div'); wordHeading.append(title);
                    const reading = el('div', '', 'card-pinyin'); renderReading(reading, token.reading); wordHeading.append(reading);
                    const wordTools = el('div', '', 'card-header-tools');
                    const dismiss = button('×', dismissWord, 'close');
                    dismiss.setAttribute('aria-label', 'Close word details');
                    wordHeader.append(wordHeading, wordTools); detail.append(wordHeader);
                    if (lemma !== token.text) detail.append(el('p', `Base form: ${lemma}`, 'muted'));
                    detail.append(el('p', token.meaning, 'sentence-word-meaning'), el('p', token.explanation));
                    const dictionary = el('details', '', 'sentence-dictionary');
                    dictionary.append(el('summary', 'Dictionary meanings'));
                    const defs = el('ul', 'Looking up dictionary meanings…', 'definitions'); dictionary.append(defs); if (japanese) dictionary.append(dictionaryCredit()); detail.append(dictionary);
                    detail.append(integrations.actions(detail, () => ({text:token.text, word:token.text, reading:token.reading, english:token.meaning, context:text, source:classicUrl(lemma), generated:true}), {word:true, toolbarHost:wordTools}));
                    wordTools.append(dismiss);

                    try {
                        let found = await lookupDefinitions(lemma);
                        if (!found.length && lemma !== token.text) found = await lookupDefinitions(token.text);
                        if (selection !== selected || !card.isConnected) return;
                        defs.replaceChildren(...found.map(def => el('li', def.en)));
                        if (!found.length) defs.textContent = 'No dictionary entry found; the explanation above is from local AI.';
                    } catch { if (selection === selected) defs.textContent = 'Dictionary lookup failed. Select the word again to retry.'; }
                }, 'sentence-token');
                choice.setAttribute('aria-pressed', 'false'); choice.setAttribute('aria-label', `Explain ${token.text}`);
                if (japanese) appendJapanese(choice, [{text:token.text, reading:token.reading !== token.text ? token.reading : ''}]);
                else choice.textContent = token.text;
                sentence.append(choice);
            }
            if (!japanese) renderReading(sentenceReading, analysis.reading);
            overview.append(el('p', analysis.explanation), el('p', 'Tap a word to explore its meaning and grammar.', 'muted'));
            output.append(el('p', analysis.translation, 'sentence-translation'), overview);
            card.append(integrations.actions(card, () => ({text, reading:analysis.reading, english:analysis.translation, context:text, source:location.href, generated:true})));
        } catch (error) {
            if (card.isConnected && current === controller) output.replaceChildren(el('p', error.message), button('Retry analysis', analyze, 'integration-button'));
        } finally { if (current === controller) output.removeAttribute('aria-busy'); }
    };
    // Child word requests are scoped separately so selecting another word cancels them.
    card.cleanup = () => { controller?.abort(); integrations.releaseCard(detail); };
    await analyze();
}

async function submitSearch(query) {
    announce('');
    $('suggestions').hidden = true;
    const kind = searchKind(query, knownWords, dataset);
    if (kind === 'word') { navigate(query); return; }
    if (kind === 'sentence') {
        // Less common words may exist only in definition partitions.
        try {
            const defs = await lookupDefinitions(query);
            if (query !== $('search').value.trim()) return;
            if (defs.length) { navigate(query); return; }
        }
        catch { /* Sentence analysis can still work when dictionary data is unavailable. */ }
        if (query !== $('search').value.trim()) return;
        if (integrations.aiEnabled()) openSentence(query);
        else announce('For sentence searches, enable local AI under Menu → Local integrations.');
        return;
    }
    const matches = suggestions();
    if (matches.length) navigate(matches[0].word);
    else announce(japanese ? 'No match. Try kanji, kana, or an English meaning.' : 'No match. Try a Chinese character, pinyin, or English meaning.');
}

function normalize(value) { return (japanese ? normalizeKana(value) : value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f0-9\s]/g, ''); }
function suggestions() {
    const query = $('search').value.trim();
    const normalized = normalize(query);
    $('suggestions').replaceChildren();
    if (!query) { $('suggestions').hidden = true; return []; }
    const lower = query.toLowerCase();
    const score = item => {
        if (item.word === query) return 0;
        if (item.word.startsWith(query)) return 1;
        if (item.numberedReadings.includes(lower.replace(/\s/g, ''))) return 1.5;
        if (normalized && item.readings.includes(normalized)) return 2;
        const english = englishMatch(item.glosses, lower) + (japanese && [...item.word].length === 1 ? .2 : 0);
        if (english < 5) return english;
        if (normalized && item.pinyin.includes(normalized)) return 5;
        return english;
    };
    const results = searchIndex.map(item => ({ item, score: score(item) }))
        .filter(match => Number.isFinite(match.score)).sort((a, b) => a.score - b.score)
        .slice(0, 7).map(match => match.item);
    for (const item of results) {
        const choice = button('', () => { $('search').value = item.word; navigate(item.word); });
        choice.append(el('b', item.word), el('span', `${readingsFor(item.word).join(' / ')}${readingsFor(item.word).length ? ' · ' : ''}${definitions[item.word][0].en.slice(0, 48)}`));
        $('suggestions').append(choice);
    }
    $('suggestions').hidden = !results.length;
    return results;
}
function updateColorReset() {
    const reset = $('legend').querySelector('.reset-tone-colors');
    const palette = colorMode === 'tone' ? tones : frequencies;
    const defaults = colorMode === 'tone' ? tonePalette(null, dark.matches) : defaultFrequencies;
    if (reset) reset.hidden = palette.every((color, i) => color.toLowerCase() === defaults[i]);
}
function legend() {
    const toneMode = colorMode === 'tone';
    $('legend').replaceChildren();
    $('legend').classList.toggle('frequency-legend', !toneMode);
    $('legend').setAttribute('aria-label', toneMode ? 'Tone colors' : `${japanese ? 'Kanji' : 'Word'} frequency colors, common to rare`);
    const colors = toneMode ? tones : frequencies;
    const labels = toneMode ? ['1', '2', '3', '4', 'neutral'] : japanese ? ['50', '150', '400', '800', '1.5k', '1.5k+'] : ['1k', '2k', '4k', '7k', '10k', '10k+'];
    const limits = japanese ? kanjiFrequencyLimits : [1000, 2000, 4000, 7000, 10000];
    labels.forEach((label, i) => {
        const control = el('label', undefined, 'tone-picker');
        const picker = el('input'); picker.type = 'color'; picker.value = colors[i];
        const name = toneMode ? i === 4 ? 'Neutral tone' : `Tone ${i + 1}` : `Frequency rank ${i ? limits[i - 1] + 1 : 1}${i === 5 ? ' and beyond' : `–${limits[i]}`}`;
        picker.setAttribute('aria-label', `${name} color`); control.title = `Choose ${name.toLowerCase()} color`;
        picker.addEventListener('input', () => {
            if (toneMode) {
                customTones[i] = picker.value === tonePalette(null, dark.matches)[i] ? null : picker.value;
                tones = tonePalette(customTones, dark.matches); saveTones();
            } else { frequencies[i] = picker.value; saveFrequencies(); }
            cy.style(style()); updateColorReset();
        });
        control.append(picker, document.createTextNode(label)); $('legend').append(control);
    });
    if (japanese) {
        const unknown = el('span', '—', 'unranked-legend');
        unknown.title = 'Unranked in the KANJIDIC2 frequency corpus';
        unknown.setAttribute('aria-label', unknown.title);
        unknown.style.backgroundColor = unrankedKanjiColor(dark.matches);
        unknown.style.color = contrastingText(unrankedKanjiColor(dark.matches));
        $('legend').append(unknown);
    }
    const reset = button('↺', () => {
        if (toneMode) { customTones = toneOverrides(null); tones = tonePalette(customTones, dark.matches); saveTones(); }
        else { frequencies = frequencyPalette(null); saveFrequencies(); }
        cy.style(style());
        $('legend').querySelectorAll('input[type="color"]').forEach((picker, i) => { picker.value = toneMode ? tones[i] : frequencies[i]; });
        updateColorReset();
    }, 'reset-tone-colors');
    reset.title = `Reset ${toneMode ? 'tone' : 'frequency'} colors`; reset.setAttribute('aria-label', reset.title);
    $('legend').append(reset); updateColorReset();
}
async function initialize() {
    integrations = initializeIntegrations(dataset, speak, renderReading);
    // Ask early so browsers that load their voice list asynchronously can populate it
    // before the first Listen click. Re-read on every click to include new voices.
    if ('speechSynthesis' in window) speechSynthesis.getVoices();
    const readingStorageKey = japanese ? 'immersive-show-furigana' : 'immersive-show-pinyin';
    const pinyinToggle = $('show-card-pinyin');
    try { pinyinToggle.checked = localStorage.getItem(readingStorageKey) !== 'false'; } catch { /* Use the default when storage is unavailable. */ }
    const applyPinyinVisibility = () => document.body.classList.toggle('hide-card-pinyin', !pinyinToggle.checked);
    applyPinyinVisibility();
    pinyinToggle.addEventListener('change', () => {
        applyPinyinVisibility();
        try { localStorage.setItem(readingStorageKey, String(pinyinToggle.checked)); } catch { /* Keep the session preference. */ }
    });
    if (dataset === 'cantonese') $('card-pinyin-label').textContent = 'Show jyutping in detail cards';
    $('dataset').value = dataset; $('colors').value = colorMode;
    $('classic').href = classicUrl();
    if (japanese) {
        document.title = 'JapaneseGraph · Explore';
        const brand = document.querySelector('.brand');
        brand.href = 'https://japanesegraph.com/'; brand.title = 'Open classic JapaneseGraph';
        brand.firstElementChild.textContent = '字'; brand.firstElementChild.lang = 'ja';
        brand.querySelector('.brand-name').replaceChildren(document.createTextNode('JapaneseGraph'), el('small', 'EXPLORER'));
        $('classic').textContent = 'Open classic JapaneseGraph ↗';
        const sources = el('a', 'Dictionary & ranking sources');
        sources.href = '/data/japanese/explorer-sources.html';
        document.querySelector('.menu-links').append(sources);
        $('card-pinyin-label').textContent = 'Show furigana in detail cards';
        $('colors').querySelector('[value="frequency"]').textContent = 'Kanji frequency';
        $('legend').setAttribute('aria-label', 'Kanji frequency rank: top 50, 150, 400, 800, 1500, beyond, and unranked');
        document.querySelector('label[for="search"]').textContent = 'Search kanji, kana or English';
    }
    if (japanese || dataset === 'cantonese') $('colors').querySelector('[value="tone"]').disabled = true;
    $('dataset').addEventListener('change', () => { location.href = `/immersive.html?set=${$('dataset').value}`; });
    const data = await Promise.all([
        json(`/data/${dataset}/${japanese ? 'explorer-word-order' : 'wordlist'}.json`),
        json(`/data/${dataset}/definitions.json`), japanese ? null : json(`/data/${dataset}/sentences.json`),
        japanese ? json('/data/japanese/explorer-index.json') : null,
        japanese ? json('/data/japanese/explorer-character-ranks.json') : null,
        japanese ? json('/data/japanese/lexicon/kana.json') : []
    ]);
    definitions = data[1]; sentences = data[2];
    knownWords = new Set([...data[0], ...Object.keys(definitions), ...data[5]]);
    japaneseIndex = data[3];
    graph = buildExplorerGraph(data[0], new Set(japaneseIndex?.excludedEdges || []));
    if (japanese) {
        readingIndex = new Map(Object.entries(japaneseIndex.readings).map(([word, readings]) => [word, new Set(readings)]));
        kanjiRanks = data[4];
        usuallyKana = new Set(japaneseIndex.usuallyKana);
        for (const [char, value] of Object.entries(graph)) value.node.level = kanjiFrequencyLevel(kanjiRanks[char]);
    }
    // Frequency lists include Latin letters and punctuation; keep only Han characters (hanzi or kanji) on the canvas.
    graph = Object.fromEntries(Object.entries(graph).filter(([char]) => isCharacter(char)));
    for (const value of Object.values(graph)) {
        value.edges = Object.fromEntries(Object.entries(value.edges).filter(([char]) => graph[char] && value !== graph[char]));
    }
    ranks = japanese ? {} : getWordSetFromFrequency(data[0]);
    characterOrder = Object.keys(graph);
    const searchRanks = japanese ? Object.fromEntries(japaneseIndex.searchOrder.map((word, i) => [word, i + 1])) : ranks;
    searchIndex = Object.entries(definitions).sort((a, b) => (searchRanks[a[0]] || 1e9) - (searchRanks[b[0]] || 1e9)).map(([word, defs]) => ({ word, pinyin: normalize(readingsFor(word, defs).join(' ')), readings: readingsFor(word, defs).map(normalize), numberedReadings: readingsFor(word, defs).map(reading => reading.toLowerCase().replace(/\s/g, '')), glosses: defs.flatMap(d => d.en.toLowerCase().split(';').map(x => x.trim())), english: defs.map(d => d.en).join(' ').toLowerCase() }));
    cy = cytoscape({ container: $('graph'), elements: [], style: style(), layout: { name: 'preset' }, minZoom: .35, maxZoom: 2.5 });
    cy.on('tap', 'node', event => openWord(event.target.id(), event.renderedPosition, event.target));
    cy.on('tap', 'edge', event => openWord(event.target.data('words')[0], event.renderedPosition, event.target));
    cy.on('mouseover', 'node, edge', event => { event.target.addClass('hovered'); revealConnections(); });
    cy.on('mouseout', 'node, edge', event => { event.target.removeClass('hovered'); revealConnections(); });
    cy.on('dragfree', 'node', event => { positions.set(event.target.id(), { ...event.target.position() }); connect(); });
    // Cytoscape emits tap for a click/tap, not for a pan or pinch gesture.
    cy.on('tap', event => {
        if (event.target !== cy) return;
        $('suggestions').hidden = true;
        $('settings').open = false;
        for (const word of cards.keys()) closeCard(word);
    });
    // Trigger only after a user finishes moving the viewport. Programmatic pan/layout
    // does not recursively expand the graph; each gesture adds at most 24 nodes.
    const scheduleExpansion = () => {
        clearTimeout(expansionTimer);
        expansionTimer = setTimeout(() => {
            if (!$('auto-expand').checked) { refresh(); return; }
            if (cy.zoom() < .65) { restoreViewport(); connect(); refresh(); return; }
            discover(Math.min(24, Math.max(8, Math.round(innerWidth * innerHeight / 50000))), true);
        }, 450);
    };
    cy.on('dragpan scrollzoom pinchzoom', scheduleExpansion);
    cy.on('pan zoom', () => {
        for (const word of cards.keys()) positionCard(word);
    });
    $('colors').addEventListener('change', () => { colorMode = $('colors').value; cy.style(style()); legend(); });
    dark.addEventListener('change', () => {
        tones = tonePalette(customTones, dark.matches);
        cy.style(style()); legend();
    });
    window.addEventListener('resize', () => {
        for (const word of cards.keys()) positionCard(word);
    });
    mobile.addEventListener('change', () => { if (mobile.matches) { if (cy.nodes().length > cap()) reset(); } });
    $('search').addEventListener('input', () => { announce(''); clearTimeout(searchTimer); searchTimer = setTimeout(suggestions, 120); });
    $('search-form').addEventListener('submit', event => {
        event.preventDefault(); const query = $('search').value.trim(); if (!query) return;
        clearTimeout(searchTimer);
        submitSearch(query);
        $('search').blur();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') { $('suggestions').hidden = true; $('settings').open = false; if (cards.size) closeCard([...cards.keys()].pop()); $('search').focus(); }
        if (event.key === '/' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); $('search').focus(); }
        if (event.key === 'ArrowDown' && document.activeElement === $('search') && !$('suggestions').hidden) { event.preventDefault(); $('suggestions').querySelector('button')?.focus(); }
    });
    if (dataset === 'traditional' && seed === '学') seed = '學';
    reset(); legend(); $('loading').hidden = true;
    if (params.get('word')) { $('search').value = params.get('word').slice(0, 1000); await submitSearch($('search').value); }
}
initialize().catch(error => {
    console.error(error);
    $('loading').replaceChildren(el('p', 'The explorer could not load. Check your connection and try again.'), button('Retry', () => location.reload()));
    announce('Unable to load graph');
});
