import { faqTypes, showFaq } from "./faq.js";
import { updateVisited, getVisited, addCards, inStudyList, getCardPerformance } from "./data-layer.js";
import { graphChanged, preferencesChanged } from "./recommendations.js";
import { switchToState, stateKeys } from "./ui-orchestrator.js";
import { hanziBox } from "./dom.js";

//TODO break this down further
//refactor badly needed...hacks on top of hacks at this point
let maxExamples = 5;
let currentExamples = {};
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

let legendElements = document.querySelectorAll('.level-label');
let graphOptions = {
    oldHsk: {
        display: 'HSK Wordlist', prefix: 'hsk', legend: hskLegend
    },
    simplified: {
        display: 'Simplified', prefix: 'simplified', legend: bigFreqLegend, augmentPath: 'data/simplified', partitionCount: 100
    },
    traditional: {
        display: 'Traditional', prefix: 'traditional', legend: bigFreqLegend, augmentPath: 'data/traditional', partitionCount: 100
    },
    cantonese: {
        display: 'Cantonese', prefix: 'cantonese', legend: freqLegend, ttsKey: 'zh-HK'
    }
};
let activeGraph = graphOptions.simplified;
let getActiveGraph = function () {
    return activeGraph;
}

//explore tab items
const examplesList = document.getElementById('examples');
//explore tab navigation controls
const hanziSearchForm = document.getElementById('hanzi-choose');
const notFoundElement = document.getElementById('not-found-message');
//recommendations
const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

const walkThrough = document.getElementById('walkthrough');

//menu items
const graphSelector = document.getElementById('graph-selector');
const showPinyinCheckbox = document.getElementById('show-pinyin');
const togglePinyinLabel = document.getElementById('toggle-pinyin-label');

let getZhTts = function () {
    //use the first-encountered zh-CN voice for now
    if (!('speechSynthesis' in window)) {
        return null;
    }
    return speechSynthesis.getVoices().find(voice => (voice.lang === "zh-CN" || voice.lang === "zh_CN"));
};

let zhTts = getZhTts();

//TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
//generally, this thing is weird, so uh...
//ideally we'd not do this or have any global variable
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function () {
        if (!zhTts) {
            zhTts = getZhTts();
        }
    };
}

let runTextToSpeech = function (text, anchors) {
    zhTts = speechSynthesis.getVoices().find(voice => voice.lang.replace('_', '-') === (activeGraph.ttsKey || 'zh-CN'));
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
                    character.style.backgroundColor = '#6de200';
                } else {
                    character.removeAttribute('style');
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

let addTextToSpeech = function (container, text, aList) {
    let textToSpeechButton = document.createElement('span');
    textToSpeechButton.className = 'speak-button';
    textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
    container.appendChild(textToSpeechButton);
};
let addSaveToListButton = function (container, text) {
    let buttonTexts = ['✔️', '+'];
    let saveToListButton = document.createElement('span');
    saveToListButton.className = 'add-button';
    saveToListButton.textContent = inStudyList(text) ? buttonTexts[0] : buttonTexts[1];
    saveToListButton.addEventListener('click', function () {
        addCards(currentExamples, text);
        saveToListButton.textContent = buttonTexts[0];
    });
    container.appendChild(saveToListButton);
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
    search(term, true);
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

let setupDefinitions = function (definitionList, container) {
    for (let i = 0; i < definitionList.length; i++) {
        let definitionItem = document.createElement('li');
        definitionItem.classList.add('definition');
        let definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
        definitionItem.textContent = definitionContent;
        container.appendChild(definitionItem);
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
        exampleHolder.classList.add('example');
        let zhHolder = document.createElement('p');
        let exampleText = examples[i].zh.join('');
        let aList = makeSentenceNavigable(exampleText, zhHolder, true);
        zhHolder.className = 'target';
        addTextToSpeech(zhHolder, exampleText, aList);
        exampleHolder.appendChild(zhHolder);
        if (examples[i].pinyin) {
            let pinyinHolder = document.createElement('p');
            pinyinHolder.textContent = examples[i].pinyin;
            pinyinHolder.className = 'transcription';
            exampleHolder.appendChild(pinyinHolder);
        }
        let enHolder = document.createElement('p');
        enHolder.textContent = examples[i].en;
        enHolder.className = 'base';
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
let augmentExamples = function (word, container) {
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
};
let renderDefinitions = function (definitionList, container) {
    let definitionsContainer = document.createElement('ul');
    definitionsContainer.className = 'definitions';
    setupDefinitions(definitionList, definitionsContainer);
    container.appendChild(definitionsContainer);
}
let renderWordHeader = function (word, container) {
    let wordHolder = document.createElement('h2');
    wordHolder.classList.add('word-header')
    wordHolder.textContent = word;
    addTextToSpeech(wordHolder, word, []);
    addSaveToListButton(wordHolder, word);
    container.appendChild(wordHolder);
};
let renderContext = function (word, container) {
    let contextHolder = document.createElement('p');
    //TODO not so thrilled with 'context' as the name here
    contextHolder.className = 'context';
    contextHolder.innerText += "Previously: ";
    [...word].forEach(x => {
        let cardData = getCardPerformance(x);
        contextHolder.innerText += `${x} seen ${getVisited()[x] || 0} times; in ${cardData.count} flash cards (${cardData.performance}% correct). `;
    });
    let contextFaqLink = document.createElement('a');
    contextFaqLink.className = 'active-link';
    contextFaqLink.textContent = "Learn more.";
    contextFaqLink.addEventListener('click', function () {
        showFaq(faqTypes.context);
    });
    contextHolder.appendChild(contextFaqLink);
    container.appendChild(contextHolder);
};
let renderExamples = function (word, examples, container) {
    let exampleList = document.createElement('ul');
    exampleList.classList.add('examples');
    container.appendChild(exampleList);
    if (examples.length > 0) {
        setupExampleElements(examples, exampleList);
    } else if (activeGraph.augmentPath) {
        augmentExamples(word, exampleList);
    }
};
let setupExamples = function (words) {
    currentExamples = {};
    // if we're showing examples, never show the walkthrough.
    walkThrough.style.display = 'none';
    notFoundElement.style.display = 'none';
    //TODO this mixes markup modification and example finding
    //refactor needed
    while (examplesList.firstChild) {
        examplesList.firstChild.remove();
    }
    for (let i = 0; i < words.length; i++) {
        let examples = findExamples(words[i], sentences);
        let definitionList = definitions[words[i]] || [];

        currentExamples[words[i]] = [];
        //TODO: definition list doesn't have the same interface (missing zh field)
        currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
        //setup current examples for potential future export
        currentExamples[words[i]].push(...examples);

        let item = document.createElement('li');
        item.classList.add('word-data');
        renderWordHeader(words[i], item);
        renderDefinitions(definitionList, item);
        renderContext(words[i], item);
        renderExamples(words[i], examples, item);

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
        document.dispatchEvent(new CustomEvent('graph-update',
            { detail: defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)] }));
    }
    let oldState = JSON.parse(localStorage.getItem('state'));
    if (oldState) {
        if (oldState.currentGraph) {
            let activeGraphKey = Object.keys(graphOptions).find(x => graphOptions[x].display === oldState.currentGraph);
            if (activeGraphKey) {
                activeGraph = graphOptions[activeGraphKey];
                legendElements.forEach((x, index) => {
                    x.textContent = activeGraph.legend[index];
                });
                graphSelector.value = state.currentGraph;
            }
        }
        if (oldState.activeTab === tabs.study) {
            switchToState(states.study);
        }
    }
    document.addEventListener('explore-update', function (event) {
        hanziBox.value = event.detail[0];
        setupExamples(event.detail);
        persistState();
        switchToState(stateKeys.main);
        updateVisited(event.detail);
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
            if (hanzi[character]) {
                a.className = 'navigable';
            }
            a.addEventListener('click', function () {
                if (hanzi[character]) {
                    // TODO(refactor): can we push the inCurrentPath bit into the graph module?
                    if (character in hanzi) {
                        document.dispatchEvent(new CustomEvent('graph-update', { detail: character }));
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

let allInGraph = function (word) {
    for (let i = 0; i < word.length; i++) {
        if (!hanzi[word[i]]) {
            return false;
        }
    }
    return true;
};
let search = function (value, skipState) {
    if (value && allInGraph(value) && (definitions[value] || wordSet.has(value))) {
        notFoundElement.style.display = 'none';
        document.dispatchEvent(new CustomEvent('graph-update', { detail: value }))
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
    search(hanziBox.value);
    switchToState(stateKeys.main);
});
showPinyinCheckbox.addEventListener('change', function () {
    let toggleLabel = togglePinyinLabel;
    if (showPinyinCheckbox.checked) {
        toggleLabel.innerText = 'Turn off pinyin in examples';
    } else {
        toggleLabel.innerText = 'Turn on pinyin in examples';
    }
});

recommendationsDifficultySelector.addEventListener('change', function () {
    let val = recommendationsDifficultySelector.value;
    preferencesChanged(val);
});

let switchGraph = function () {
    let value = graphSelector.value;
    if (value !== activeGraph.display) {
        let key = Object.keys(graphOptions).find(x => graphOptions[x].display === value);
        activeGraph = graphOptions[key];
        let prefix = activeGraph.prefix;
        //fetch regardless...allow service worker and/or browser cache to optimize
        fetch(`./data/${prefix}/graph.json`)
            .then(response => response.json())
            .then(function (data) {
                window.hanzi = data;
                graphChanged();
                legendElements.forEach((x, index) => {
                    x.innerText = activeGraph.legend[index];
                });
                wordSet = getWordSet(hanzi);
            });
        fetch(`./data/${prefix}/sentences.json`)
            .then(response => response.json())
            .then(function (data) {
                window.sentences = data;
            });
        fetch(`./data/${prefix}/definitions.json`)
            .then(response => response.json())
            .then(function (data) {
                definitions = data;
            });
        persistUIState();
    }
}

graphSelector.addEventListener('change', switchGraph);

export { initialize, setupExamples, makeSentenceNavigable, addTextToSpeech, getActiveGraph };