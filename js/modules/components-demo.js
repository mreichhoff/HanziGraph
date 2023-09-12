const searchForm = document.getElementById('search-form');
const hanziBox = document.getElementById('hanzi-box');
const walkthrough = document.getElementById('walkthrough');
const container = document.getElementById('examples');
const parent = document.getElementById('graph-container');
const graphContainer = document.getElementById('graph');

let definitions = {};
let components = {};
let simplifiedRanks = {};
let traditionalRanks = {};

// TODO: this is duplicated almost verbatim from graph.js...
function updateColorScheme() {
    if (!cy) {
        return;
    }
    cy.style(getStylesheet());
}
let pendingResizeTimeout = null;
const colors = ['#fc5c7d', '#ea6596', '#d56eaf', '#bb75c8', '#9b7ce1', '#6a82fb'];
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
                path: curr.path
            }
        });
        for (const component of components[curr.word].components) {
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
function bfsLayout(root) {
    return {
        name: 'breadthfirst',
        roots: [root],
        padding: 6,
        spacingFactor: 0.85,
        directed: true,
    };
}
function getTone(character) {
    return (character in definitions && definitions[character].length) ? definitions[character][0].pinyin[definitions[character][0].pinyin.length - 1] : '5';
}
function makeLegible(element) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const character = element.data('word');
    const tone = getTone(character);
    // if (tone === '1' || tone === '3' || tone === '4') {
    //     return 'white'; //TODO
    // }
    if (tone === '5' && !prefersDark) {
        return 'white';
    }
    return 'black';
}
function toneColor(element) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const character = element.data('word');
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
    return prefersDark ? '#aaa' : '#000';
}
function rankColor(element) {
    const character = element.data('word');
    const rank = character in simplifiedRanks ? simplifiedRanks[character] : (traditionalRanks[character] || 10000);
    if (rank < 100) {
        return colors[0];
    } else if (rank < 250) {
        return colors[1];
    } else if (rank < 500) {
        return colors[2];
    } else if (rank < 1000) {
        return colors[3];
    } else if (rank < 2000) {
        return colors[4];
    }
    return colors[5];
}
function trimTone(pinyin) {
    return pinyin.substring(0, pinyin.length - 1);
}
function edgeLabel(element) {
    const sourceCharacter = element.data('source')[element.data('source').length - 1];
    const targetCharacter = element.data('target')[element.data('source').length];
    const sourceDefs = definitions[sourceCharacter];
    const targetDefs = definitions[targetCharacter];
    if (!sourceDefs || !targetDefs) {
        return '';
    }

    for (const definition of sourceDefs.filter(x => x.pinyin)) {
        const srcPinyin = trimTone(definition.pinyin.toLowerCase());
        // O(n^2), but there's never more than a few definitions.
        for (const targetDef of targetDefs) {
            if (!targetDef.pinyin) {
                continue;
            }
            const targetPinyin = trimTone(targetDef.pinyin.toLowerCase());
            if (targetPinyin === srcPinyin) {
                return targetPinyin;
            }
        }
    }
    return '';
}
function getStylesheet() {
    //TODO make this injectable
    let prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    let result = [
        {
            selector: 'node',
            style: {
                'background-color': toneColor,
                'label': 'data(word)',
                'color': makeLegible,
                'font-size': '20px',
                'text-valign': 'center',
                'text-halign': 'center'
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': prefersDark ? '#aaa' : '#121212',
                'target-arrow-shape': 'triangle',
                'curve-style': 'straight',
                'color': (_ => prefersDark ? '#000' : '#fff'),
                'font-size': '12px',
                'text-background-color': (_ => prefersDark ? '#fff' : '#000'),
                'text-background-padding': '2px',
                'text-background-opacity': '1',
                'text-background-shape': 'rectangle',
                'text-events': 'yes',
                'width': '3px',
                'arrow-scale': '0.65',
                'target-arrow-color': prefersDark ? '#fff' : '#121212',
                'label': edgeLabel
            }
        }
    ];
    return result;
}
let root = null;
let cy = null;
function buildComponentTree(value) {
    root = value;
    graphContainer.innerHTML = '';
    graphContainer.className = '';
    root = value;
    cy = cytoscape({
        container: graphContainer,
        elements: componentsBfs(value),
        layout: bfsLayout(value),
        style: getStylesheet(),
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', function (evt) {
        renderComponents(evt.target.data('word'), container)
    });
}

// TODO: this is duplicated almost verbatim from explore.js...
function makeSentenceNavigable(text, container) {
    let sentenceContainer = document.createElement('span');
    sentenceContainer.className = "sentence-container";

    let anchorList = [];
    for (let i = 0; i < text.length; i++) {
        (function (character) {
            let a = document.createElement('a');
            a.textContent = character;
            if (character in components) {
                a.className = 'navigable';
            }
            a.addEventListener('click', function () {
                if (character in components) {
                    buildComponentTree(character);
                }
            });
            anchorList.push(a);
            sentenceContainer.appendChild(a);
        }(text[i]));
    }
    container.appendChild(sentenceContainer);
    return anchorList;
}
function renderCharacterHeader(character, container, active) {
    let characterHolder = document.createElement('h2');
    characterHolder.classList.add('character-header');
    let characterSpan = document.createElement('span');
    characterSpan.textContent = character;
    characterSpan.classList.add('clickable');
    characterSpan.classList.add(`tone${getTone(character)}`);
    characterHolder.appendChild(characterSpan);
    if (active) {
        characterHolder.classList.add('active');
    }
    characterSpan.addEventListener('click', function () {
        if (!characterHolder.classList.contains('active')) {
            document.querySelectorAll('.character-header').forEach(x => x.classList.remove('active'));
            characterHolder.classList.add('active');
        }
        buildComponentTree(character);
    });
    container.appendChild(characterHolder);
}
function renderDefinitions(character, container) {
    if (!(character in definitions)) {
        return;
    }
    let definitionElement = document.createElement('ul');
    const definitionList = definitions[character];
    let pronunciations = new Set();
    for (let i = 0; i < definitionList.length; i++) {
        let definitionItem = document.createElement('li');
        if (!pronunciations.has(definitionList[i].pinyin.toLowerCase())) {
            definitionItem.classList.add('pronunciation');
            definitionItem.classList.add(`tone${definitionList[i].pinyin[definitionList[i].pinyin.length - 1]}`);
            definitionItem.textContent = definitionList[i].pinyin.toLowerCase();
            definitionElement.appendChild(definitionItem);
            // maybe make one li and divs inside?
            definitionItem = document.createElement('li');
            pronunciations.add(definitionList[i].pinyin.toLowerCase());
        }
        definitionItem.classList.add('definition');
        definitionItem.innerText = definitionList[i].en;
        definitionElement.appendChild(definitionItem);
    }
    container.appendChild(definitionElement);
}
function renderComponents(word, container) {
    container.innerHTML = '';
    walkthrough.style.display = 'none';
    let first = true;
    for (const character of word) {
        let item = document.createElement('div');
        item.classList.add('character-data');
        if (first) {
            let instructions = document.createElement('p');
            instructions.classList.add('explanation');
            instructions.innerText = 'Click any character for more information.';
            item.appendChild(instructions);
        }
        renderCharacterHeader(character, item, first);
        renderDefinitions(character, item);
        first = false;
        let componentsHeader = document.createElement('h3');
        componentsHeader.innerText = 'Components';
        item.appendChild(componentsHeader);
        let componentsContainer = document.createElement('div');
        const joinedComponents = components[character].components.join('');
        if (joinedComponents) {
            componentsContainer.className = 'target';
            makeSentenceNavigable(joinedComponents, componentsContainer);
        } else {
            componentsContainer.innerText = "No components found. Maybe we can't break this down any more.";
        }
        item.appendChild(componentsContainer);
        let componentsOfHeader = document.createElement('h3');
        componentsOfHeader.innerText = 'Component of';
        item.appendChild(componentsOfHeader);
        let componentOfContainer = document.createElement('div');
        const joinedComponentOf = components[character].componentOf.sort((a, b) => {
            let aRank = a in simplifiedRanks ? simplifiedRanks[a] : (traditionalRanks[a] || 10000);
            let bRank = b in simplifiedRanks ? simplifiedRanks[b] : (traditionalRanks[b] || 10000);
            return aRank - bRank;
        }).join('');
        if (joinedComponentOf) {
            componentOfContainer.className = 'target';
            makeSentenceNavigable(joinedComponentOf, componentOfContainer, true);
        } else {
            componentOfContainer.innerText = 'This character is not a component of others.'
        }
        item.appendChild(componentOfContainer);
        container.appendChild(item);
    }
}
function renderData(characters) {
    const eligibleCharacters = characters.filter(x => x in components);
    if (eligibleCharacters.length < 1) {
        notFoundElement.removeAttribute('style');
        return;
    }
    notFoundElement.style.display = 'none';
    renderComponents(eligibleCharacters, container);
    buildComponentTree(eligibleCharacters[0]);
}
const notFoundElement = document.getElementById('not-found-message');
Promise.all([
    fetch('../data/components/components.json')
        .then(response => response.json())
        .then(data => components = data),
    fetch('../data/components/mandarin-defs.json')
        .then(response => response.json())
        .then(data => definitions = data),
    fetch('../data/simplified/character_freq_list.json')
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                simplifiedRanks[data[i]] = i;
            }
        }),
    fetch('../data/traditional/character_freq_list.json')
        .then(response => response.json())
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                traditionalRanks[data[i]] = i;
            }
        })
]).then(_ => {
    window.addEventListener('resize', function () {
        clearTimeout(pendingResizeTimeout);
        pendingResizeTimeout = setTimeout(() => {
            // TODO: probably want a sizeDirty bit we can check for when the graph isn't shown and a resize happens
            if (cy) {
                cy.layout(bfsLayout(root)).run();
            }
        }, 1000);
    });
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        renderData([...hanziBox.value]);
    });
    const starters = ['新', '镦', '貌', '诬', '客', '警', '嘴', '醒', '复', '惯', '醒', '倾', '翻', '擲', '齉', '嘟', '囔'];
    buildComponentTree(starters[Math.floor(Math.random() * starters.length)]);
});