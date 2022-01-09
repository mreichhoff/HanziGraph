import { addCards, setupStudyMode, inStudyList, getCardCount } from "./study-mode.js";
import { createVisitedGraphs, updateTotalsByLevel } from "./stats.js";
import { faqTypes, showFaq } from "./faq.js";
import { dataTypes, registerCallback, updateVisited, getVisited } from "./data-layer.js";

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
let activeTab = tabs.explore;

let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
let freqLegend = ['Top500', 'Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k'];
let legendElements = document.querySelectorAll('div.circle');
let graphOptions = {
    newHsk: {
        display: 'New HSK', prefix: 'new-hsk-', legend: hskLegend
    },
    oldHsk: {
        display: 'Old HSK', prefix: '', legend: hskLegend
    },
    top10k: {
        display: 'Top 10k words', prefix: 'top-10k-', legend: freqLegend
    }
};
let activeGraph = graphOptions.oldHsk;
let getActiveGraph = function () {
    return activeGraph;
}

//top-level section containers
const mainContainer = document.getElementById('container');
const statsContainer = document.getElementById('stats-container');

const exploreTab = document.getElementById('show-explore');
const studyTab = document.getElementById('show-study');

const mainHeader = document.getElementById('main-header');

//study items...these may not belong in this file
const studyContainer = document.getElementById('study-container');

//explore tab items
const examplesList = document.getElementById('examples');
const exampleContainer = document.getElementById('example-container');
//explore tab navigation controls
const hanziBox = document.getElementById('hanzi-box');
const hanziSearchForm = document.getElementById('hanzi-choose');
const previousHanziButton = document.getElementById('previousHanziButton');
//recommendations
const recommendationsContainer = document.getElementById('recommendations-container');
const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

//menu items
const graphSelector = document.getElementById('graph-selector');
const levelSelector = document.getElementById('level-selector');
const menuButton = document.getElementById('menu-button');
const menuContainer = document.getElementById('menu-container');
const menuExitButton = document.getElementById('menu-exit-button');
const showPinyinCheckbox = document.getElementById('show-pinyin');
const togglePinyinLabel = document.getElementById('toggle-pinyin-label');

//stats items
const statsShow = document.getElementById('stats-show');
const statsExitButton = document.getElementById('exit-button');
//stats detail items: these don't belong here
const studiedGraphDetail = document.getElementById('studied-graph-detail');
const addedCalendarDetail = document.getElementById('added-calendar-detail');
const visitedGraphDetail = document.getElementById('visited-graph-detail');
const studyCalendarDetail = document.getElementById('study-calendar-detail');
const hourlyGraphDetail = document.getElementById('hourly-graph-detail');

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

let addTextToSpeech = function (holder, text, aList) {
    let textToSpeechButton = document.createElement('span');
    textToSpeechButton.className = 'text-button listen';
    textToSpeechButton.textContent = 'Listen';
    textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
    holder.appendChild(textToSpeechButton);
};
let addSaveToListButton = function (holder, text) {
    let buttonTexts = ['In your study list!', 'Add to study list'];
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
        level: levelSelector.value,
        undoChain: localUndoChain,
        activeTab: activeTab,
        currentGraph: activeGraph.display,
        graphPrefix: activeGraph.prefix
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

        let contextHolder = document.createElement('p');
        //TODO not so thrilled with 'context' as the name here
        contextHolder.className = 'context';
        contextHolder.innerText += "Previously: ";
        [...words[i]].forEach(x => {
            contextHolder.innerText += `${x} seen ${getVisited()[x] || 0} times; in ${getCardCount(x)} flash cards. `;
        });
        let contextFaqLink = document.createElement('a');
        contextFaqLink.className = 'faq-link';
        contextFaqLink.textContent = "Learn more.";
        contextFaqLink.addEventListener('click', function () {
            showFaq(faqTypes.context);
        });
        contextHolder.appendChild(contextFaqLink);
        item.appendChild(contextHolder);

        //TODO: definition list doesn't have the same interface (missing zh field)
        currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
        //setup current examples for potential future export
        currentExamples[words[i]].push(...examples);

        if (words[i].length === 1 && !singleCharacterWords.has(words[i])) {
            let exampleWarning = document.createElement('p');
            exampleWarning.className = 'example-warning';
            //I know I shouldn't do this, but I'll refactor any day now
            exampleWarning.textContent = `This character does not appear alone in the ${activeGraph.display}. It appears only as part of other words. Examples seen by clicking the connecting lines may be of higher quality. `;
            let warningFaqLink = document.createElement('a');
            warningFaqLink.textContent = "Learn more.";
            warningFaqLink.className = 'faq-link';
            warningFaqLink.addEventListener('click', function () {
                showFaq(faqTypes.singleCharWarning);
            });
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
let setupCytoscape = function (root, elements, graphContainer) {
    let prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    cy = cytoscape({
        container: graphContainer,
        elements: elements,
        layout: layout(root, elements.nodes.length),
        style: [
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
                    'text-background-color': (_ => prefersLight ? '#f9f9f9' : '#121212'),
                    'text-background-opacity': '1',
                    'text-background-shape': 'round-rectangle',
                    'text-events': 'yes'
                }
            }
        ],
        maxZoom: 10,
        minZoom: 0.5
    });
    cy.on('tap', 'node', function (evt) {
        let id = evt.target.id();
        let maxLevel = levelSelector.value;
        updateUndoChain();
        //not needed if currentHanzi contains id, which would mean the nodes have already been added
        //includes O(N) but currentHanzi almost always < 10 elements
        if (currentHanzi && !currentHanzi.includes(id)) {
            addToExistingGraph(id, maxLevel);
        }
        setupExamples([id]);
        persistState();
        exploreTab.click();
        mainHeader.scrollIntoView();
        updateVisited([id]);
    });
    cy.on('tap', 'edge', function (evt) {
        let words = evt.target.data('words');
        updateUndoChain();
        setupExamples(words);
        persistState();
        //TODO toggle functions
        exploreTab.click();
        mainHeader.scrollIntoView();
        updateVisited([evt.target.source().id(), evt.target.target().id()]);
    });
};

let addToExistingGraph = function (character, maxLevel) {
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
    //TODO: makes assumption about markup order
    mainContainer.append(nextGraph);

    if (value && hanzi[value]) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(value, result, maxDepth, {}, maxLevel);
        setupCytoscape(value, result, nextGraph);
        currentHanzi = [value];
        persistState();
    }
};
let recommendationsWorker = new Worker('js/modules/recommendations-worker.js');
let initialize = function () {
    registerCallback(dataTypes.visited, function (visited) {
        recommendationsWorker.postMessage({
            type: 'visited',
            payload: visited
        });
    });
    let oldState = JSON.parse(localStorage.getItem('state'));
    if (!oldState) {
        //graph chosen is default, no need to modify legend or dropdown
        //add a default graph on page load to illustrate the concept
        let defaultHanzi = ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"];
        updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], levelSelector.value);
    } else {
        if (state.currentGraph) {
            let activeGraphKey = Object.keys(graphOptions).find(x => graphOptions[x].display === state.currentGraph);
            activeGraph = graphOptions[activeGraphKey];
            legendElements.forEach((x, index) => {
                x.innerText = activeGraph.legend[index];
            });
            graphSelector.value = state.currentGraph;
        }
        levelSelector.value = oldState.level;
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
            studyTab.click();
        }
        persistState();
    }
    updateTotalsByLevel();
    recommendationsWorker.postMessage({
        type: 'graph',
        payload: hanzi
    });
    recommendationsWorker.postMessage({
        type: 'visited',
        payload: getVisited()
    });
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
                        updateGraph(character, levelSelector.value);
                    }
                    //enable seamless switching, but don't update if we're already showing examples for character
                    if (!noExampleChange && (!currentWord || (currentWord.length !== 1 || currentWord[0] !== character))) {
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

hanziSearchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    let value = hanziBox.value;
    let maxLevel = levelSelector.value;
    if (value && hanzi[value]) {
        updateUndoChain();
        updateGraph(value, maxLevel);
        setupExamples([hanziBox.value]);
        persistState();
        updateVisited([value]);
    }
});

levelSelector.addEventListener('change', function () {
    //TODO hide edges in existing graph rather than rebuilding
    //TODO refresh after level change can be weird
    updateGraph(currentHanzi[currentHanzi.length - 1], levelSelector.value);
});

previousHanziButton.addEventListener('click', function () {
    if (!undoChain.length) {
        return;
    }
    let next = undoChain.pop();
    let maxLevel = levelSelector.value;
    updateGraph(next.hanzi[0], maxLevel);
    for (let i = 1; i < next.hanzi.length; i++) {
        addToExistingGraph(next.hanzi[i], maxLevel);
    }
    if (next.word) {
        setupExamples(next.word);
    }
    persistState();
});
showPinyinCheckbox.addEventListener('change', function () {
    let toggleLabel = togglePinyinLabel;
    if (showPinyinCheckbox.checked) {
        toggleLabel.innerText = 'Turn off pinyin in examples';
    } else {
        toggleLabel.innerText = 'Turn on pinyin in examples';
    }
});
exploreTab.addEventListener('click', function () {
    exampleContainer.removeAttribute('style');
    studyContainer.style.display = 'none';
    //TODO could likely do all of this with CSS
    exploreTab.classList.add('active');
    studyTab.classList.remove('active');
    activeTab = tabs.explore;
    persistState();
});

studyTab.addEventListener('click', function () {
    exampleContainer.style.display = 'none';
    studyContainer.removeAttribute('style');
    studyTab.classList.add('active');
    exploreTab.classList.remove('active');
    setupStudyMode();
    activeTab = tabs.study;
    persistState();
});


//eww, even worse than normal from here down
let visitedLastUpdated = null;
let canUpdateVisited = function (user, lastUpdate) {
    return (user && (!lastUpdate || (Date.now() - lastUpdate) >= (60 * 60 * 1000)));
}
recommendationsDifficultySelector.addEventListener('change', function () {
    let val = recommendationsDifficultySelector.value;
    let minLevel = 1;
    let maxLevel = 6;
    if (val === 'easy') {
        maxLevel = 3;
    } else if (val === 'hard') {
        minLevel = 4;
    }
    recommendationsWorker.postMessage({
        type: 'levelPreferences',
        payload: {
            minLevel: minLevel,
            maxLevel: maxLevel
        }
    })
});
recommendationsWorker.onmessage = function (e) {
    if (e.data.recommendations && e.data.recommendations.length) {
        recommendationsContainer.innerHTML = '';
        let recommendationMessage = document.createElement('span');
        recommendationMessage.style.display = 'none';
        recommendationMessage.innerText = "Recommended:";
        recommendationMessage.className = "recommendation-message";
        recommendationsContainer.appendChild(recommendationMessage);
        recommendationsContainer.removeAttribute('style');
        let usedRecommendation = false;
        for (let i = 0; i < e.data.recommendations.length; i++) {
            //don't bother recommending items already being shown in the graph
            if (cy && cy.getElementById(e.data.recommendations[i]).length) {
                continue;
            }
            recommendationMessage.removeAttribute('style');
            let curr = document.createElement('a');
            curr.innerText = e.data.recommendations[i];
            curr.className = 'recommendation';
            curr.addEventListener('click', function (event) {
                //can I do this?
                hanziBox.value = event.target.innerText;
                document.querySelector('#hanzi-choose input[type=submit]').click();
                event.target.style.display = 'none';
                let otherRecs = document.querySelectorAll('.recommendation');
                let stillShown = false;
                for (let i = 0; i < otherRecs.length; i++) {
                    if (!otherRecs[i].style.display || otherRecs[i].style.display !== 'none') {
                        stillShown = true;
                        break;
                    }
                }
                if (!stillShown) {
                    recommendationsContainer.style.display = 'none';
                }
            });
            recommendationsContainer.appendChild(curr);
            usedRecommendation = true;
        }
        let recommendationsFaqLink = document.createElement('a');
        recommendationsFaqLink.className = 'faq-link';
        recommendationsFaqLink.innerText = "Why?"
        recommendationsFaqLink.addEventListener('click', function () {
            showFaq[faqTypes.recommendations];
        });
        if (usedRecommendation) {
            recommendationsContainer.appendChild(recommendationsFaqLink);
        }
    } else {
        recommendationsContainer.style.display = 'none';
    }
}

menuButton.addEventListener('click', function () {
    mainContainer.style.display = 'none';
    menuContainer.removeAttribute('style');
});
menuExitButton.addEventListener('click', function () {
    menuContainer.style.display = 'none';
    mainContainer.removeAttribute('style');
});

statsShow.addEventListener('click', function () {
    mainContainer.style.display = 'none';
    statsContainer.removeAttribute('style');
    createVisitedGraphs(getVisited(), activeGraph.legend);
});

statsExitButton.addEventListener('click', function () {
    statsContainer.style.display = 'none';
    mainContainer.removeAttribute('style');
    //TODO this is silly
    studiedGraphDetail.innerText = '';
    addedCalendarDetail.innerText = '';
    visitedGraphDetail.innerText = '';
    studyCalendarDetail.innerText = '';
    hourlyGraphDetail.innerText = '';
});

let switchGraph = function () {
    let value = graphSelector.value;
    if (value !== activeGraph.display) {
        let key = Object.keys(graphOptions).find(x => graphOptions[x].display === value);
        activeGraph = graphOptions[key];
        let prefix = activeGraph.prefix;
        //fetch regardless...allow service worker and/or browser cache to optimize
        fetch(`./data/${prefix}graph.json`)
            .then(response => response.json())
            .then(function (data) {
                window.hanzi = data;
                recommendationsWorker.postMessage({
                    type: 'graph',
                    payload: window.hanzi
                });
                legendElements.forEach((x, index) => {
                    x.innerText = activeGraph.legend[index];
                });
                updateTotalsByLevel();
            });
        fetch(`./data/${prefix}sentences.json`)
            .then(response => response.json())
            .then(function (data) {
                window.sentences = data;
            });
        fetch(`./data/${prefix}single-char-words.json`)
            .then(response => response.json())
            .then(function (data) {
                singleCharacterWords = new Set(data);
            });
        persistState();
    }
}

graphSelector.addEventListener('change', switchGraph);

export { initialize, makeSentenceNavigable, addTextToSpeech, getActiveGraph };