import { faqTypes, showFaq } from "./faq.js";
import { updateVisited, writeExploreState, getVisited, addCards, inStudyList, getCardPerformance } from "./data-layer.js";
import { hanziBox, notFoundElement, walkThrough } from "./dom.js";
import { getActiveGraph } from "./options.js";

let maxExamples = 5;
let currentExamples = {};
let currentWord = '';

//TODO(refactor): move notion of activetab to orchestrator

//explore tab items
const examplesList = document.getElementById('examples');

// TODO(refactor): consider removal of getActiveGraph...
let getVoice = function () {
    //use the first-encountered zh-CN voice for now
    if (!('speechSynthesis' in window)) {
        return null;
    }
    return speechSynthesis.getVoices().find(voice => voice.lang.replace('_', '-') === (getActiveGraph().ttsKey || 'zh-CN'));
};

let voice = getVoice();

//TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
//generally, this thing is weird, so uh...
//ideally we'd not do this or have any global variable
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = function () {
        if (!voice) {
            voice = getVoice();
        }
    };
}

let runTextToSpeech = function (text, anchors) {
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    voice = voice || getVoice();
    if (voice) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = voice.lang;
        utterance.voice = voice;
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
    const activeGraph = getActiveGraph();
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

let augmentDefinitions = function (word, container) {
    const activeGraph = getActiveGraph();
    fetch(`./${activeGraph.definitionsAugmentPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
        .then(response => response.json())
        .then(function (data) {
            if (!container) {
                return false;
            }
            setupDefinitions(data[word], container);
            // TODO(refactor): should this be moved to setupDefinitions (and same with setupExamples/augmentExamples)?
            currentExamples[word].push(getCardFromDefinitions(word, data[word]));
        });
};
let renderDefinitions = function (word, definitionList, container) {
    let definitionsContainer = document.createElement('ul');
    definitionsContainer.className = 'definitions';
    container.appendChild(definitionsContainer);
    if (definitionList.length > 0) {
        setupDefinitions(definitionList, definitionsContainer);
    } else if (getActiveGraph().definitionsAugmentPath) {
        augmentDefinitions(word, definitionsContainer);
    }
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
    } else if (getActiveGraph().augmentPath) {
        augmentExamples(word, exampleList);
    }
};
let setupExamples = function (words) {
    currentExamples = {};
    // if we're showing examples, never show the walkthrough.
    walkThrough.style.display = 'none';
    notFoundElement.style.display = 'none';
    //TODO this mixes markup modification and example finding
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
        renderDefinitions(words[i], definitionList, item);
        renderContext(words[i], item);
        renderExamples(words[i], examples, item);

        examplesList.append(item);
    }
    currentWord = words[0];
    writeExploreState(currentWord);
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

let initialize = function () {
    // Note: github pages rewrites are only possible via a 404 hack,
    // so removing the history API integration on the main branch.
    //TODO(refactor): show study when it was the last state
    document.addEventListener('explore-update', function (event) {
        hanziBox.value = event.detail[0];
        setupExamples(event.detail);
        updateVisited(event.detail);
    });
    document.addEventListener('character-set-changed', function () {
        voice = getVoice();
    });
    voice = getVoice();
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
                    if (character in hanzi) {
                        document.dispatchEvent(new CustomEvent('graph-update', { detail: character }));
                    }
                    //enable seamless switching, but don't update if we're already showing examples for character
                    if (!noExampleChange && (!currentWord || (currentWord.length !== 1 || currentWord[0] !== character))) {
                        setupExamples([character]);
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

export { initialize, makeSentenceNavigable, addTextToSpeech };