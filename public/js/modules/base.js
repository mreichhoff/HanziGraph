import { addCards, setupStudyMode, inStudyList } from "./study-mode.js";
import { getDatabase, update, ref, increment } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";

//TODO break this down further
//refactor badly needed...hacks on top of hacks at this point
let maxExamples = 5;
let currentExamples = {};
let currentHanzi = null;
let currentWord = null;
let undoChain = [];
let cy = null;
let tabs = {
    explore: 'explore',
    study: 'study'
};
let singleCharacterWords = new Set();
fetch('./data/single-char-words.json')
    .then(response => response.json())
    .then(function (data) {
        singleCharacterWords = new Set(data);
    });
let activeTab = tabs.explore;

let getZhTts = function () {
    //use the first-encountered zh-CN voice for now
    return speechSynthesis.getVoices().find(voice => voice.lang === "zh-CN");
};
let zhTts = getZhTts();
//TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
speechSynthesis.onvoiceschanged = function () {
    if (!zhTts) {
        zhTts = getZhTts();
    }
};

let levelColor = function (element) {
    let level = element.data('level');
    switch (level) {
        case 6:
            return 'blue';
        case 5:
            return 'purple';
        case 4:
            return 'green';
        case 3:
            return 'yellow';
        case 2:
            return 'orange';
        case 1:
            return 'red';
    }
};

let layout = function (root) {
    return {
        name: 'cose',
        animate: false
    };
    // TODO determine the right way to render...going with cose for now
    //     return {
    //         name: 'breadthfirst',
    //         roots: [root],
    //         padding: 6,
    //         spacingFactor: 0.85
    //     };
    // }
};

let runTextToSpeech = function (text, anchors) {
    zhTts = zhTts || getZhTts();
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    if (zhTts) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "zh-CN";
        utterance.voice = zhTts;
        utterance.addEventListener('boundary', function (event) {
            if (event.charIndex == null || event.charLength == null) {
                return false;
            }
            anchors.forEach((character, index) => {
                if (index >= event.charIndex && index < (event.charIndex + (event.charLength || 1))) {
                    character.style.fontWeight = 'bold';
                } else {
                    character.style.fontWeight = 'normal';
                }
            });
        });
        utterance.addEventListener('end', function () {
            anchors.forEach(character => {
                character.style.fontWeight = 'normal';
            });
        });
        speechSynthesis.speak(utterance);
    }
};
//nodes will be marked visited when the user searches for or taps a node in the graph
//for now, avoiding marking nodes visited via clicking a hanzi in an example or card
//because in those cases no examples are shown
let markVisited = function (nodes) {
    if (window.user) {
        const db = getDatabase();
        const nodeRef = ref(db, 'users/' + user.uid + '/visited/zh-CN/');
        let updates = {};
        for (let i = 0; i < nodes.length; i++) {
            updates[nodes[i]] = increment(1);
        }
        update(nodeRef, updates);
    }
};
let addTextToSpeech = function (holder, text, aList) {
    let textToSpeechButton = document.createElement('span');
    textToSpeechButton.className = 'text-button listen';
    textToSpeechButton.textContent = 'Listen';
    textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
    holder.appendChild(textToSpeechButton);
};
let addSaveToListButton = function (holder, text) {
    let buttonTexts = ['In your study list!', 'Add to my study list!'];
    let saveToListButton = document.createElement('span');
    saveToListButton.className = 'text-button';
    saveToListButton.textContent = inStudyList(text) ? buttonTexts[0] : buttonTexts[1];
    saveToListButton.addEventListener('click', function () {
        addCards(currentExamples, text);
        saveToListButton.textContent = buttonTexts[0];
    });
    holder.appendChild(saveToListButton);
};

let persistState = function () {
    let localUndoChain = undoChain.length > 5 ? undoChain.slice(0, 5) : undoChain;
    localStorage.setItem('state', JSON.stringify({
        hanzi: currentHanzi,
        word: currentWord,
        level: document.getElementById('level-selector').value,
        undoChain: localUndoChain,
        activeTab: activeTab
    }));
};
let setupDefinitions = function (definitionList, definitionHolder) {
    for (let i = 0; i < definitionList.length; i++) {
        let definitionItem = document.createElement('li');
        let definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
        definitionItem.textContent = definitionContent;
        definitionHolder.appendChild(definitionItem);
    }
};
let findExamples = function (word) {
    let examples = [];
    //used for e.g., missing translation
    let lessDesirableExamples = [];
    //TODO consider indexing up front
    //can also reuse inner loop...consider inverting
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].zh.includes(word)) {
            if (sentences[i].en && sentences[i].pinyin) {
                examples.push(sentences[i]);
                if (examples.length === maxExamples) {
                    break;
                }
            } else if (lessDesirableExamples.length < maxExamples) {
                lessDesirableExamples.push(sentences[i]);
            }
        }
    }
    if (examples.length < maxExamples && lessDesirableExamples.length > 0) {
        examples.splice(examples.length, 0, ...lessDesirableExamples.slice(0, (maxExamples - examples.length)));
    }
    //TODO...improve
    examples.sort((a, b) => {
        if (a.en && !b.en) {
            return -1;
        } else if (!a.en && b.en) {
            return 1;
        } else {
            return a.zh.length - b.zh.length;
        }
    });
    return examples;
};
let setupExampleElements = function (examples, exampleList) {
    for (let i = 0; i < examples.length; i++) {
        let exampleHolder = document.createElement('li');
        let zhHolder = document.createElement('p');
        let exampleText = examples[i].zh.join('');
        let aList = makeSentenceNavigable(exampleText, zhHolder, true);
        zhHolder.className = 'zh-example example-line';
        addTextToSpeech(zhHolder, exampleText, aList);
        exampleHolder.appendChild(zhHolder);
        if (examples[i].pinyin) {
            let pinyinHolder = document.createElement('p');
            pinyinHolder.textContent = examples[i].pinyin;
            pinyinHolder.className = 'pinyin-example example-line';
            exampleHolder.appendChild(pinyinHolder);
        }
        let enHolder = document.createElement('p');
        enHolder.textContent = examples[i].en;
        enHolder.className = 'example-line';
        exampleHolder.appendChild(enHolder);
        exampleList.appendChild(exampleHolder);
    }
};
let setupExamples = function (words) {
    currentExamples = {};
    //TODO this mixes markup modification and example finding
    //refactor needed
    let examplesList = document.getElementById('examples');
    while (examplesList.firstChild) {
        examplesList.firstChild.remove();
    }
    for (let i = 0; i < words.length; i++) {
        let examples = findExamples(words[i]);
        currentExamples[words[i]] = [];

        let item = document.createElement('li');
        let wordHolder = document.createElement('h2');
        wordHolder.textContent = words[i];
        addTextToSpeech(wordHolder, words[i], []);
        addSaveToListButton(wordHolder, words[i]);
        item.appendChild(wordHolder);

        let definitionHolder = document.createElement('ul');
        definitionHolder.className = 'definition';
        let definitionList = definitions[words[i]] || [];
        setupDefinitions(definitionList, definitionHolder);
        item.appendChild(definitionHolder);
        //TODO: definition list doesn't have the same interface (missing zh field)
        currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
        //setup current examples for potential future export
        currentExamples[words[i]].push(...examples);

        if (words[i].length === 1 && !singleCharacterWords.has(words[i])) {
            let exampleWarning = document.createElement('p');
            exampleWarning.className = 'example-warning';
            //I know I shouldn't do this, but I'll refactor any day now
            exampleWarning.textContent = 'This character does not appear alone in the HSK word list. It appears only as part of other words. Examples seen by clicking the connecting lines may be of higher quality. ';
            let warningFaqLink = document.createElement('a');
            warningFaqLink.href = './faq.html';
            warningFaqLink.textContent = "See the FAQ.";
            exampleWarning.appendChild(warningFaqLink);
            item.appendChild(exampleWarning);
        }
        let exampleList = document.createElement('ul');
        item.appendChild(exampleList);
        setupExampleElements(examples, exampleList);

        examplesList.append(item);
    }
    currentWord = words;
};
let updateUndoChain = function () {
    //push clones onto the stack
    undoChain.push({ hanzi: [...currentHanzi], word: (currentWord ? [...currentWord] : currentWord) });
};

//TODO can this be combined with the definition rendering part?
let getCardFromDefinitions = function (text, definitionList) {
    //this assumes definitionList non null
    let result = { zh: [text] };
    let answer = '';
    for (let i = 0; i < definitionList.length; i++) {
        answer += definitionList[i].pinyin + ': ' + definitionList[i].en;
        answer += i == definitionList.length - 1 ? '' : ', ';
    }
    result['en'] = answer;
    return result;
};
let setupCytoscape = function (root, elements) {
    cy = cytoscape({
        container: document.getElementById('graph'),
        elements: elements,
        layout: layout(root),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': levelColor,
                    'label': 'data(id)',
                    'color': (element => element.data('level') > 3 ? '#eee' : '#333333'),
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
                    'color': '#eee',
                    'font-size': '10px',
                    'text-background-color': '#333333',
                    'text-background-opacity': '1',
                    'text-background-shape': 'round-rectangle'
                }
            }
        ],
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', function (evt) {
        let id = evt.target.id();
        let maxLevel = document.getElementById('level-selector').value;
        updateUndoChain();
        //not needed if currentHanzi contains id, which would mean the nodes have already been added
        //includes O(N) but currentHanzi almost always < 10 elements
        if (currentHanzi && !currentHanzi.includes(id)) {
            addToExistingGraph(id, maxLevel);
        }
        setupExamples([id]);
        persistState();
        document.getElementById('show-explore').click();
        markVisited([id]);
    });
    cy.on('tap', 'edge', function (evt) {
        let words = evt.target.data('words');
        updateUndoChain();
        setupExamples(words);
        persistState();
        //TODO toggle functions
        document.getElementById('show-explore').click();
        markVisited([evt.target.source().id(), evt.target.target().id()]);
    });
};

let addToExistingGraph = function (character, maxLevel) {
    let result = { 'nodes': [], 'edges': [] };
    let maxDepth = 1;
    dfs(character, result, maxDepth, {}, maxLevel);
    cy.add(result);
    cy.layout(layout(character)).run();
    //currentHanzi must be set up before this call
    currentHanzi.push(character);
};

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
let updateGraph = function (value, maxLevel) {
    document.getElementById('graph').remove();
    let nextGraph = document.createElement("div");
    nextGraph.id = 'graph';
    document.getElementById('container').append(nextGraph);

    if (value && hanzi[value]) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(value, result, maxDepth, {}, maxLevel);
        setupCytoscape(value, result);
        currentHanzi = [value];
        persistState();
    }
};

let initialize = function () {
    let oldState = JSON.parse(localStorage.getItem('state'));
    if (!oldState) {
        //add a default graph on page load to illustrate the concept
        let defaultHanzi = ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"];
        updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], document.getElementById('level-selector').value);
    } else {
        document.getElementById('level-selector').value = oldState.level;
        //oldState.hanzi should always have length >= 1
        updateGraph(oldState.hanzi[0], oldState.level);
        for (let i = 1; i < oldState.hanzi.length; i++) {
            addToExistingGraph(oldState.hanzi[i], oldState.level);
        }
        if (oldState.word) {
            setupExamples(oldState.word);
        }
        undoChain = oldState.undoChain;
        if (oldState.activeTab === tabs.study) {
            //reallllllly need a toggle method
            //this does set up the current card, etc.
            document.getElementById('show-study').click();
        }
        persistState();
    }
};

let makeSentenceNavigable = function (text, container, noExampleChange) {
    let sentenceContainer = document.createElement('span');
    sentenceContainer.className = "sentence-container";

    let anchorList = [];
    for (let i = 0; i < text.length; i++) {
        (function (character) {
            let a = document.createElement('a');
            a.textContent = character;
            a.addEventListener('click', function () {
                if (hanzi[character]) {
                    let updated = false;
                    if (currentHanzi && !currentHanzi.includes(character)) {
                        updateUndoChain();
                        updated = true;
                        updateGraph(character, document.getElementById('level-selector').value);
                    }
                    //enable seamless switching, but don't update if we're already showing examples for character
                    if (!noExampleChange && (currentWord.length !== 1 || currentWord[0] !== character)) {
                        if (!updated) {
                            updateUndoChain();
                        }
                        setupExamples([character]);
                    }
                    persistState();
                }
            });
            anchorList.push(a);
            sentenceContainer.appendChild(a);
        }(text[i]));
    }
    container.appendChild(sentenceContainer);
    return anchorList;
};

document.getElementById('hanzi-choose').addEventListener('submit', function (event) {
    event.preventDefault();
    let value = document.getElementById('hanzi-box').value;
    let maxLevel = document.getElementById('level-selector').value;
    if (value) {
        updateUndoChain();
        updateGraph(value, maxLevel);
        setupExamples([document.getElementById('hanzi-box').value]);
        persistState();
        markVisited([value]);
    }
});

document.getElementById('level-selector').addEventListener('change', function () {
    //TODO hide edges in existing graph rather than rebuilding
    //TODO refresh after level change can be weird
    updateGraph(currentHanzi[currentHanzi.length - 1], document.getElementById('level-selector').value);
});

document.getElementById('previousHanziButton').addEventListener('click', function () {
    if (!undoChain.length) {
        return;
    }
    let next = undoChain.pop();
    let maxLevel = document.getElementById('level-selector').value;
    updateGraph(next.hanzi[0], maxLevel);
    for (let i = 1; i < next.hanzi.length; i++) {
        addToExistingGraph(next.hanzi[i], maxLevel);
    }
    if (next.word) {
        setupExamples(next.word);
    }
    persistState();
});

document.getElementById('show-explore').addEventListener('click', function () {
    document.getElementById('example-container').style.display = 'block';
    document.getElementById('study-container').style.display = 'none';
    //TODO could likely do all of this with CSS
    document.getElementById('show-explore').classList.add('active');
    document.getElementById('show-study').classList.remove('active');
    // this hack here due to wanting examples in better view on mobile
    // but feeling it looks goofy to do this on desktop.
    // 864 lines up with the breakpoint in css
    if (document.getElementById('graph').offsetWidth < 864) {
        document.getElementById('examples').scrollIntoView();
    }
    activeTab = tabs.explore;
    persistState();
});

document.getElementById('show-study').addEventListener('click', function () {
    document.getElementById('example-container').style.display = 'none';
    document.getElementById('study-container').style.display = 'block';
    document.getElementById('show-study').classList.add('active');
    document.getElementById('show-explore').classList.remove('active');
    setupStudyMode();
    document.getElementById('study-call-to-action').scrollIntoView();
    activeTab = tabs.study;
    persistState();
});

export { initialize, makeSentenceNavigable, addTextToSpeech };