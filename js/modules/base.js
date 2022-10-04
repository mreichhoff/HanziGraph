import { faqTypes, showFaq } from "./faq.js";
import { updateVisited, getVisited, addCards, inStudyList, getCardPerformance } from "./data-layer.js";
import { addToGraph, initializeGraph, updateColorScheme } from "./graph.js";
import { graphChanged, preferencesChanged } from "./recommendations.js";

//TODO break this down further
//refactor badly needed...hacks on top of hacks at this point
let maxExamples = 5;
let currentExamples = {};
let currentHanzi = [];
let currentWord = '';
let tabs = {
    explore: 'explore',
    study: 'study'
};
let wordSet = new Set();
let activeTab = tabs.explore;

let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
let freqLegend = ['Top500', 'Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k'];
let bigFreqLegend = ['Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k', '>10k'];
const legendContainer = document.getElementById('legend');

let legendElements = document.querySelectorAll('div.circle');
let graphOptions = {
    // TODO: remove top10k and trad. Choices should be:
    // Simplified (default)
    // Traditional
    // Cantonese
    // HSK
    newHsk: {
        display: 'New HSK', prefix: 'new-hsk-', legend: hskLegend
    },
    oldHsk: {
        display: 'Old HSK', prefix: '', legend: hskLegend
    },
    top10k: {
        display: 'Top 10k words', prefix: 'top-10k-', legend: freqLegend
    },
    trad: {
        display: 'Top 10k traditional', prefix: 'trad-', legend: freqLegend
    },
    top50k: {
        display: 'Top 50k words', prefix: '50k-', legend: bigFreqLegend
    },
    simplified: {
        display: 'Simplified', prefix: 'simplified-', legend: bigFreqLegend, augmentPath: 'data/simplified', partitionCount: 100
    },
    traditional: {
        display: 'Traditional', prefix: 'traditional-', legend: bigFreqLegend, augmentPath: 'data/traditional', partitionCount: 100
    }
};
let activeGraph = graphOptions.simplified;
let getActiveGraph = function () {
    return activeGraph;
}

//top-level section container
const mainContainer = document.getElementById('main-container');
const graphContainer = document.getElementById('graph-container');

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
const notFoundElement = document.getElementById('not-found-message');
//recommendations
const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

const walkThrough = document.getElementById('walkthrough');

//menu items
const graphSelector = document.getElementById('graph-selector');
const levelSelector = document.getElementById('level-selector');
const menuButton = document.getElementById('menu-button');
const menuContainer = document.getElementById('menu-container');
const menuExitButton = document.getElementById('menu-exit-button');
const showPinyinCheckbox = document.getElementById('show-pinyin');
const togglePinyinLabel = document.getElementById('toggle-pinyin-label');

let getZhTts = function () {
    //use the first-encountered zh-CN voice for now
    return speechSynthesis.getVoices().find(voice => (voice.lang === "zh-CN" || voice.lang === "zh_CN"));
};
let zhTts = getZhTts();
//TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
speechSynthesis.onvoiceschanged = function () {
    if (!zhTts) {
        zhTts = getZhTts();
    }
};

let runTextToSpeech = function (text, anchors) {
    zhTts = zhTts || getZhTts();
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    if (zhTts) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = zhTts.lang;
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
                character.removeAttribute('style');
            });
        });
        speechSynthesis.speak(utterance);
    }
};

let addTextToSpeech = function (holder, text, aList) {
    let textToSpeechButton = document.createElement('span');
    textToSpeechButton.className = 'volume';
    textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
    holder.appendChild(textToSpeechButton);
};
let addSaveToListButton = function (holder, text) {
    let buttonTexts = ['✔️', '+'];
    let saveToListButton = document.createElement('span');
    saveToListButton.className = 'add-button';
    saveToListButton.textContent = inStudyList(text) ? buttonTexts[0] : buttonTexts[1];
    saveToListButton.addEventListener('click', function () {
        addCards(currentExamples, text);
        saveToListButton.textContent = buttonTexts[0];
    });
    holder.appendChild(saveToListButton);
};

let persistState = function () {
    // const newUrl = `/${currentWord}`;
    // history.pushState({
    //     word: currentWord,
    // }, '', newUrl);
};

let persistUIState = function () {
    localStorage.setItem('state', JSON.stringify({
        activeTab: activeTab,
        currentGraph: activeGraph.display,
        graphPrefix: activeGraph.prefix
    }));
}

function parseUrl(path) {
    if (path[0] === '/') {
        path = path.substring(1);
    }
    const segments = path.split('/');
    if (segments.length !== 1) {
        return null;
    }
    const term = segments[0];
    return {
        word: term
    };
}
function loadState(state) {
    const term = decodeURIComponent(state.word);
    hanziBox.value = term;
    search(term, levelSelector.value, true);
}

// window.onpopstate = (event) => {
//     const state = event.state;
//     if (!state || !state.word) {
//         walkThrough.removeAttribute('style');
//         examplesList.innerHTML = '';
//         hanziBox.value = '';
//         return;
//     }
//     loadState(state);
// };

let setupDefinitions = function (definitionList, definitionHolder) {
    for (let i = 0; i < definitionList.length; i++) {
        let definitionItem = document.createElement('li');
        let definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
        definitionItem.textContent = definitionContent;
        definitionHolder.appendChild(definitionItem);
    }
};
let findExamples = function (word, sentences) {
    let examples = [];
    //used for e.g., missing translation
    let lessDesirableExamples = [];
    //TODO consider indexing up front
    //can also reuse inner loop...consider inverting
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].zh.includes(word) || (word.length === 1 && sentences[i].zh.join('').includes(word))) {
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
let getPartition = function (word, numPartitions) {
    let total = 0;
    for (let i = 0; i < word.length; i++) {
        total += word.charCodeAt(i);
    }
    return total % numPartitions;
};

// expects callers to ensure augmentation is available
let augmentExamples = function (curr, word, container) {
    fetch(`./${activeGraph.augmentPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
        .then(response => response.json())
        .then(function (data) {
            if (!container) {
                return false;
            }
            let examples = findExamples(word, data);
            setupExampleElements(examples, container);
            currentExamples[word].push(...examples);
        });
}
let setupExamples = function (words) {
    currentExamples = {};
    // if we're showing examples, never show the walkthrough.
    walkThrough.style.display = 'none';
    //TODO this mixes markup modification and example finding
    //refactor needed
    while (examplesList.firstChild) {
        examplesList.firstChild.remove();
    }
    for (let i = 0; i < words.length; i++) {
        let examples = findExamples(words[i], sentences);
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
            let cardData = getCardPerformance(x);
            contextHolder.innerText += `${x} seen ${getVisited()[x] || 0} times; in ${cardData.count} flash cards (${cardData.performance}% correct). `;
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

        let exampleList = document.createElement('ul');
        item.appendChild(exampleList);
        if (examples.length > 0) {
            setupExampleElements(examples, exampleList);
        } else if (activeGraph.augmentPath) {
            augmentExamples(currentWord, words[i], exampleList);
        }

        examplesList.append(item);
    }
    currentWord = words[0];
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

let nodeTapHandler = function (evt) {
    let id = evt.target.id();
    let maxLevel = levelSelector.value;
    //not needed if currentHanzi contains id, which would mean the nodes have already been added
    //includes O(N) but currentHanzi almost always < 10 elements
    if (currentHanzi && !currentHanzi.includes(id)) {
        addToExistingGraph(id, maxLevel);
    }
    hanziBox.value = id;
    setupExamples([id]);
    persistState();
    exploreTab.click();
    mainHeader.scrollIntoView();
    updateVisited([id]);
    notFoundElement.style.display = 'none';
};
let edgeTapHandler = function (evt) {
    let words = evt.target.data('words');
    hanziBox.value = words[0];
    setupExamples(words);
    persistState();
    //TODO toggle functions
    exploreTab.click();
    mainHeader.scrollIntoView();
    updateVisited([evt.target.source().id(), evt.target.target().id()]);
    notFoundElement.style.display = 'none';
};
let addToExistingGraph = function (character, maxLevel) {
    addToGraph(character, maxLevel);
    //currentHanzi must be set up before this call
    currentHanzi.push(character);
};
let updateGraph = function (value, maxLevel, skipState) {
    document.getElementById('graph').remove();
    let nextGraph = document.createElement("div");
    nextGraph.id = 'graph';
    //TODO: makes assumption about markup order
    graphContainer.insertBefore(nextGraph, legendContainer);

    if (value && hanzi[value]) {
        initializeGraph(value, maxLevel, nextGraph, nodeTapHandler, edgeTapHandler);
    }
};
let getWordSet = function (graph) {
    //yeah, probably a better way...
    let wordSet = new Set();
    Object.keys(graph).forEach(x => {
        wordSet.add(x);
        Object.keys(graph[x].edges || {}).forEach(edge => {
            graph[x].edges[edge].words.forEach(word => {
                wordSet.add(word);
            });
        });
    });
    return wordSet;
};
let initialize = function () {
    wordSet = getWordSet(hanzi);
    if (history.state) {
        loadState(history.state);
    }
    // disabling on main due to github pages hosting pattern
    //  else if (document.location.pathname !== '/') {
    //     const state = parseUrl(document.location.pathname);
    //     if (state) {
    //         loadState(state);
    //         history.pushState(state, '', document.location);
    //     }
    // } 
    else {
        //graph chosen is default, no need to modify legend or dropdown
        //add a default graph on page load to illustrate the concept
        let defaultHanzi = ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"];
        walkThrough.removeAttribute('style');
        updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], levelSelector.value);
    }
    let oldState = JSON.parse(localStorage.getItem('state'));
    if (oldState) {
        if (oldState.currentGraph) {
            let activeGraphKey = Object.keys(graphOptions).find(x => graphOptions[x].display === oldState.currentGraph);
            activeGraph = graphOptions[activeGraphKey];
            legendElements.forEach((x, index) => {
                x.innerText = activeGraph.legend[index];
            });
            graphSelector.value = state.currentGraph;
        }
        if (oldState.activeTab === tabs.study) {
            //reallllllly need a toggle method
            //this does set up the current card, etc.
            studyTab.click();
        }
    }
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", updateColorScheme);
};

let makeSentenceNavigable = function (text, container, noExampleChange) {
    let sentenceContainer = document.createElement('span');
    sentenceContainer.className = "sentence-container";

    let anchorList = [];
    for (let i = 0; i < text.length; i++) {
        (function (character) {
            let a = document.createElement('a');
            a.textContent = character;
            if (hanzi[character]) {
                a.className = 'navigable';
            }
            a.addEventListener('click', function () {
                if (hanzi[character]) {
                    if (currentHanzi && !currentHanzi.includes(character)) {
                        updateGraph(character, levelSelector.value);
                    }
                    //enable seamless switching, but don't update if we're already showing examples for character
                    if (!noExampleChange && (!currentWord || (currentWord.length !== 1 || currentWord[0] !== character))) {
                        setupExamples([character]);
                        persistState();
                        persistUIState();
                    }
                }
            });
            anchorList.push(a);
            sentenceContainer.appendChild(a);
        }(text[i]));
    }
    container.appendChild(sentenceContainer);
    return anchorList;
};

let addEdges = function (word) {
    for (let i = 0; i < word.length; i++) {
        let curr = word[i];
        if (!hanzi[curr]) { continue; }
        for (let j = 0; j < word.length; j++) {
            if (i === j || !hanzi[word[j]]) { continue; }
            if (!hanzi[curr].edges[word[j]]) {
                hanzi[curr].edges[word[j]] = {
                    // TODO: stop it
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
// build a graph based on a word rather than just a character like updateGraph
let buildGraph = function (value, maxLevel) {
    let ranUpdate = false;
    // we don't necessarily populate all via the script
    addEdges(value);
    for (let i = 0; i < value.length; i++) {
        if (hanzi[value[i]]) {
            if (!ranUpdate) {
                //TODO do we need this?
                ranUpdate = true;
                updateGraph(value[i], maxLevel);
            } else {
                addToExistingGraph(value[i], maxLevel);
            }
        }
    }
};

let allInGraph = function (word) {
    for (let i = 0; i < word.length; i++) {
        if (!hanzi[word[i]]) {
            return false;
        }
    }
    return true;
};
let search = function (value, maxLevel, skipState) {
    if (value && allInGraph(value) && (definitions[value] || wordSet.has(value))) {
        notFoundElement.style.display = 'none';
        buildGraph(value, maxLevel);
        setupExamples([value]);
        if (!skipState) {
            persistState();
        }
        updateVisited([value]);
    } else {
        notFoundElement.removeAttribute('style');
    }
}
hanziSearchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    search(hanziBox.value, levelSelector.value);
});

levelSelector.addEventListener('change', function () {
    //TODO hide edges in existing graph rather than rebuilding
    //TODO refresh after level change can be weird
    updateGraph(currentHanzi[currentHanzi.length - 1], levelSelector.value);
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
    // the user's choice of word hasn't changed, but they've switched modes
    persistUIState();
});

studyTab.addEventListener('click', function () {
    exampleContainer.style.display = 'none';
    studyContainer.removeAttribute('style');
    studyTab.classList.add('active');
    exploreTab.classList.remove('active');
    activeTab = tabs.study;
    persistUIState();
});

recommendationsDifficultySelector.addEventListener('change', function () {
    let val = recommendationsDifficultySelector.value;
    preferencesChanged(val);
});

menuButton.addEventListener('click', function () {
    mainContainer.style.display = 'none';
    menuContainer.removeAttribute('style');
});
menuExitButton.addEventListener('click', function () {
    menuContainer.style.display = 'none';
    mainContainer.removeAttribute('style');
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
                graphChanged();
                legendElements.forEach((x, index) => {
                    x.innerText = activeGraph.legend[index];
                });
                wordSet = getWordSet(hanzi);
            });
        fetch(`./data/${prefix}sentences.json`)
            .then(response => response.json())
            .then(function (data) {
                window.sentences = data;
            });
        fetch(`./data/${prefix}definitions.json`)
            .then(response => response.json())
            .then(function (data) {
                definitions = data;
            });
        persistUIState();
    }
}

graphSelector.addEventListener('change', switchGraph);

export { initialize, makeSentenceNavigable, addTextToSpeech, getActiveGraph };