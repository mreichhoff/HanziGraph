import { writeExploreState, addCards, inStudyList } from "./data-layer.js";
import { hanziBox, notFoundElement, walkThrough, examplesList } from "./dom.js";
import { getActiveGraph, getPartition } from "./options.js";
import { renderCoverageGraph } from "./coverage-graph"
import { diagramKeys, switchDiagramView } from "./ui-orchestrator.js";

let coverageGraph = {};
let charFreqs = {};

let maxExamples = 5;
let currentExamples = {};
let currentWords = [];

const modes = {
    explore: 'explore',
    components: 'components'
};
let currentMode = modes.explore;
let currentTabs = null;

//TODO(refactor): move notion of activetab to orchestrator
// TODO(refactor): consider removal of getActiveGraph...
let getVoice = function () {
    //use the first-encountered zh-CN voice for now
    if (!('speechSynthesis' in window)) {
        return null;
    }
    return speechSynthesis.getVoices().find(voice => voice.lang.replace('_', '-') === (getActiveGraph().ttsKey || 'zh-CN'));
};
// hacking around garbage collection issues...
window.activeUtterances = [];
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
        activeUtterances.push(utterance);
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
            // length check shouldn't be necessary, but just in case, I guess?
            if (activeUtterances.length !== 0) {
                activeUtterances.shift();
            }
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
let renderPinyinForDefinition = function (pinyin, container) {
    const syllables = pinyin.split(' ');
    for (const syllable of syllables) {
        let syllableElement = document.createElement('span');
        // TODO: could just do this with CSS (.tonewhatever under .canto: no color coding)
        if (!getActiveGraph().disableToneColors) {
            syllableElement.classList.add(`tone${syllable[syllable.length - 1]}`);
        }
        syllableElement.innerText = syllable;
        container.appendChild(syllableElement);
    }
}
function modifyHeaderTones(definitionList, word) {
    if (!definitionList || definitionList.length <= 0 || getActiveGraph().disableToneColors) {
        return;
    }
    // TODO just send the pinyin on the word set....
    const wordHolder = document.getElementById(`${word}-header`);
    const syllables = definitionList[0].pinyin.split(' ');
    const elementsToModify = wordHolder.querySelectorAll('.word-header-character');
    if (syllables.length !== elementsToModify.length) {
        return;
    }
    for (let i = 0; i < elementsToModify.length; i++) {
        const syllable = syllables[i];
        elementsToModify[i].classList.add(`tone${syllable[syllable.length - 1]}`);
    }
}
let setupDefinitions = function (definitionList, container) {
    if (!definitionList) {
        return;
    }
    for (let i = 0; i < definitionList.length; i++) {
        let definitionItem = document.createElement('li');
        definitionItem.classList.add('definition');
        renderPinyinForDefinition(definitionList[i].pinyin, definitionItem);
        let englishSpan = document.createElement('span');
        englishSpan.innerText = `: ${definitionList[i].en}`;
        definitionItem.appendChild(englishSpan);
        container.appendChild(definitionItem);
    }
};
let findExamples = function (word, sentences, max) {
    max = max || maxExamples;
    let examples = [];
    //used for e.g., missing translation
    let lessDesirableExamples = [];
    //TODO consider indexing up front
    //can also reuse inner loop...consider inverting
    for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].zh.includes(word) || (word.length === 1 && sentences[i].zh.join('').includes(word))) {
            if (sentences[i].en && sentences[i].pinyin) {
                examples.push(sentences[i]);
                if (examples.length === max) {
                    break;
                }
            } else if (lessDesirableExamples.length < max) {
                lessDesirableExamples.push(sentences[i]);
            }
        }
    }
    if (examples.length < max && lessDesirableExamples.length > 0) {
        examples.splice(examples.length, 0, ...lessDesirableExamples.slice(0, (max - examples.length)));
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

// expects callers to ensure augmentation is available
let augmentExamples = function (word, container, maxExamples) {
    const activeGraph = getActiveGraph();
    fetch(`/${activeGraph.augmentPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
        .then(response => response.json())
        .then(function (data) {
            if (!container) {
                return false;
            }
            let examples = findExamples(word, data, maxExamples || 2);
            setupExampleElements(examples, container);
            currentExamples[word].push(...examples);
        });
};

let augmentDefinitions = function (word, container) {
    const activeGraph = getActiveGraph();
    fetch(`/${activeGraph.definitionsAugmentPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
        .then(response => response.json())
        .then(function (data) {
            if (!container) {
                return false;
            }
            let definitionList = data[word] || [];
            setupDefinitions(definitionList, container);
            // now that we know the tones of the word/character, modify the header to be color-coded, too.
            modifyHeaderTones(definitionList, word);
            // TODO(refactor): should this be moved to setupDefinitions (and same with setupExamples/augmentExamples)?
            currentExamples[word].push(getCardFromDefinitions(word, definitionList));
        });
};
let renderDefinitions = function (word, definitionList, container) {
    let definitionsContainer = document.createElement('ul');
    definitionsContainer.className = 'definitions';
    container.appendChild(definitionsContainer);
    if (definitionList && definitionList.length > 0) {
        setupDefinitions(definitionList, definitionsContainer);
    } else if (getActiveGraph().definitionsAugmentPath) {
        augmentDefinitions(word, definitionsContainer);
    }
}
// TODO: combine with renderWordHeader
let renderCharacterHeader = function (character, container) {
    let characterHolder = document.createElement('h2');
    characterHolder.classList.add('character-header');
    let characterSpan = document.createElement('span');
    characterSpan.textContent = character;
    characterSpan.classList.add('clickable');
    // TODO: figure out canto here
    if (!getActiveGraph().disableToneColors) {
        characterSpan.classList.add(`tone${getTone(character)}`);
    }
    characterHolder.appendChild(characterSpan);
    characterSpan.addEventListener('click', function () {
        if (!characterHolder.classList.contains('active')) {
            document.querySelectorAll('.character-header').forEach(x => x.classList.remove('active'));
            characterHolder.classList.add('active');
        }
        document.dispatchEvent(new CustomEvent('components-update', { detail: character }));
    });
    container.appendChild(characterHolder);
}
let renderWordHeaderByCharacter = function (word, container) {
    const definitionList = definitions[word];
    let syllables = null;
    if (definitionList && definitionList[0].pinyin) {
        syllables = definitionList[0].pinyin.split(' ');
        if (syllables.length !== word.length) {
            syllables = null;
        }
    }
    for (let i = 0; i < word.length; i++) {
        const character = word[i];
        const charSpan = document.createElement('span');
        charSpan.innerText = character;
        // TODO total hack to allow async eval of color coding,
        // needed since most definitions aren't loaded up front.
        // could get around this by including pinyin on the word set...
        charSpan.classList.add('word-header-character');
        if (syllables && !getActiveGraph().disableToneColors) {
            const syllable = syllables[i];
            charSpan.classList.add(`tone${syllable[syllable.length - 1]}`);
        }
        container.appendChild(charSpan);
    }
}
let renderWordHeader = function (word, container, active) {
    let wordHolder = document.createElement('h2');
    wordHolder.classList.add('word-header');
    let wordSpan = document.createElement('span');
    renderWordHeaderByCharacter(word, wordSpan);
    wordSpan.id = `${word}-header`;
    wordSpan.classList.add('clickable');
    wordHolder.appendChild(wordSpan);
    addTextToSpeech(wordHolder, word, []);
    addSaveToListButton(wordHolder, word);
    if (active) {
        wordHolder.classList.add('active');
    }
    wordSpan.addEventListener('click', function () {
        if (!wordHolder.classList.contains('active')) {
            document.querySelectorAll('.word-header').forEach(x => x.classList.remove('active'));
            wordHolder.classList.add('active');
        }
        switchDiagramView(diagramKeys.main);
        document.dispatchEvent(new CustomEvent('graph-update', { detail: word }));
    });
    container.appendChild(wordHolder);
};
let renderExamples = function (word, examples, maxExamples, container) {
    let exampleList = document.createElement('ul');
    exampleList.classList.add('examples');
    container.appendChild(exampleList);
    if (examples.length > 0) {
        setupExampleElements(examples, exampleList);
    } else if (getActiveGraph().augmentPath) {
        augmentExamples(word, exampleList, maxExamples);
    }
};
let renderMeaning = function (word, definitionList, examples, maxExamples, container) {
    if (!(word in wordSet)) {
        container.innerText = "No definitions found. This may indicate a component without its own meaning.";
        return;
    }
    renderDefinitions(word, definitionList, container);
    renderExamples(word, examples, maxExamples, container);
};
let renderStats = function (word, container) {
    let wordFreqHeader = document.createElement('h3');
    wordFreqHeader.classList.add('explore-stat-header');
    wordFreqHeader.innerText = 'Word Frequency Stats';
    if (coverageGraph && ('words' in coverageGraph) && (word in wordSet)) {
        container.appendChild(wordFreqHeader);
        renderCoverageGraph(coverageGraph['words'], word, wordSet[word], 'word', container);
    }
    let charFreqHeader = document.createElement('h3');
    charFreqHeader.classList.add('explore-stat-header');
    charFreqHeader.innerText = 'Character Frequency Stats';
    container.appendChild(charFreqHeader);
    let rendered = false;
    for (const character of word) {
        if (charFreqs && (character in charFreqs) && coverageGraph && ('chars' in coverageGraph)) {
            renderCoverageGraph(coverageGraph['chars'], character, charFreqs[character], 'character', container);
            rendered = true;
        }
    }
    if (!rendered) {
        charFreqHeader.style.display = 'none';
    }
    //TODO(refactor): render the coverage stats, if available
    // if not available, still render the "word ranks X, characters rank Y"
};

function switchToTab(id, tabs) {
    for (const [tabId, elements] of Object.entries(tabs)) {
        const separator = elements.tab.querySelector('.separator');
        if (id === tabId) {
            elements.tab.classList.add('active');
            separator.classList.add('expand');
            elements.panel.removeAttribute('style');
            elements.panel.classList.add(elements.transitionClass);
            elements.callback();
        } else {
            elements.tab.classList.remove('active');
            separator.classList.remove('expand');
            elements.panel.classList.remove(elements.transitionClass);
            elements.panel.style.display = 'none';
        }
    }
}
function renderSeparator(container) {
    let separator = document.createElement('span');
    separator.classList.add('separator');
    container.appendChild(separator);
    return separator;
}

let renderTabs = function (container, texts, panels, renderCallbacks, transitionClasses) {
    // TODO(refactor): callbacks to hide/show the panels
    let tabs = {};
    for (let i = 0; i < texts.length; i++) {
        let tabContainer = document.createElement('span');
        tabContainer.classList.add('explore-tab');
        tabContainer.id = `tab-${texts[i].toLowerCase()}`;
        if (i === 0) {
            tabContainer.classList.add('active');
        }
        tabContainer.innerText = texts[i];
        renderSeparator(tabContainer);
        container.appendChild(tabContainer);
        tabs[tabContainer.id] = {
            tab: tabContainer,
            panel: panels[i],
            callback: renderCallbacks[i],
            transitionClass: transitionClasses[i]
        };

        tabContainer.addEventListener('click', function (event) {
            switchToTab(event.target.id, tabs);
        });
    }
    return tabs;
}

function getTone(character) {
    return (character in definitions && definitions[character].length) ? definitions[character][0].pinyin[definitions[character][0].pinyin.length - 1] : '5';
}

function renderPronunciations(character, container) {
    if (!(character in definitions)) {
        return;
    }
    let definitionElement = document.createElement('ul');
    definitionElement.className = 'pronunciations';
    const pinyinList = [...new Set(definitions[character].map(x => x.pinyin.toLowerCase()))];

    for (let i = 0; i < pinyinList.length; i++) {
        let definitionItem = document.createElement('li');
        definitionItem.classList.add('pronunciation');
        if (!getActiveGraph().disableToneColors) {
            // TODO: have get tone handle this...currently character level, but shouldn't be
            definitionItem.classList.add(`tone${pinyinList[i][pinyinList[i].length - 1]}`);
        }
        definitionItem.textContent = pinyinList[i].toLowerCase();
        definitionElement.appendChild(definitionItem);
    }
    container.appendChild(definitionElement);
}

function renderComponents(word, container) {
    let first = true;
    for (const character of word) {
        if (!(character in components)) {
            continue;
        }
        // TODO: is this right?
        let item = document.createElement('div');
        item.classList.add('character-data');
        if (first) {
            let instructions = document.createElement('p');
            instructions.classList.add('explanation');
            instructions.innerText = 'Click any character to update the diagram.';
            item.appendChild(instructions);
        }
        renderCharacterHeader(character, item);
        renderPronunciations(character, item);
        first = false;
        let componentsHeader = document.createElement('h3');
        componentsHeader.innerText = 'Components';
        item.appendChild(componentsHeader);
        let componentsContainer = document.createElement('div');
        const joinedComponents = components[character].components.join('');
        if (joinedComponents) {
            componentsContainer.className = 'target';
            makeComponentsNavigable(joinedComponents, componentsContainer);
        } else {
            componentsContainer.innerText = "No components found. Maybe we can't break this down any more.";
        }
        item.appendChild(componentsContainer);
        let componentsOfHeader = document.createElement('h3');
        componentsOfHeader.innerText = 'Compounds';
        item.appendChild(componentsOfHeader);
        let componentOfContainer = document.createElement('div');
        const joinedComponentOf = components[character].componentOf.filter(x => x in hanzi).sort((a, b) => hanzi[a].node.level - hanzi[b].node.level).join('');
        if (joinedComponentOf) {
            componentOfContainer.className = 'target';
            makeComponentsNavigable(joinedComponentOf, componentOfContainer);
        } else {
            componentOfContainer.innerText = 'This character is not a component of others.'
        }
        item.appendChild(componentOfContainer);
        container.appendChild(item);
    }
}

function renderExplore(word, container, definitionList, examples, maxExamples, active) {
    let tabs = document.createElement('div');
    renderWordHeader(word, container, active);
    tabs.classList.add('explore-tabs');
    container.appendChild(tabs);
    let meaningContainer = document.createElement('div');
    meaningContainer.classList.add('explore-subpane');
    let componentsContainer = document.createElement('div');
    componentsContainer.classList.add('explore-subpane');
    componentsContainer.style.display = 'none';
    let statsContainer = document.createElement('div');
    statsContainer.classList.add('explore-subpane');
    statsContainer.style.display = 'none';
    currentTabs = renderTabs(tabs, ['Meaning', 'Components', 'Stats'], [meaningContainer, componentsContainer, statsContainer], [() => { }, () => {
        document.dispatchEvent(new CustomEvent('components-update', { detail: word[0] }));
    }, function () {
        statsContainer.innerHTML = '';
        renderStats(word, statsContainer)
    }], ['slide-in', 'slide-in', 'slide-in']);
    container.appendChild(meaningContainer);
    renderMeaning(word, definitionList, examples, maxExamples, meaningContainer);
    renderComponents(word, componentsContainer);
    container.appendChild(componentsContainer);
    container.appendChild(statsContainer);
}

let setupExamples = function (words, type, skipState) {
    currentExamples = {};
    // if we're showing examples, never show the walkthrough.
    walkThrough.style.display = 'none';
    notFoundElement.style.display = 'none';
    //TODO this mixes markup modification and example finding
    while (examplesList.firstChild) {
        examplesList.firstChild.remove();
    }
    let numExamples = maxExamples;
    if (words.length > 1) {
        numExamples = 3;
        if (type === 'english') {
            numExamples = 1;
        }
        let instructions = document.createElement('p');
        instructions.classList.add('explanation');
        instructions.innerText = 'There are multiple words.';
        examplesList.appendChild(instructions);
    }
    let rendered = false;
    for (let i = 0; i < words.length; i++) {
        let examples = findExamples(words[i], sentences, numExamples);
        let definitionList = definitions[words[i]] || [];

        currentExamples[words[i]] = [];
        //TODO: definition list doesn't have the same interface (missing zh field)
        currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
        //setup current examples for potential future export
        currentExamples[words[i]].push(...examples);

        let item = document.createElement('div');
        item.classList.add('word-data');
        // TODO(refactor):
        // a) this "each word is either ignore or an actual word" thing is weird
        // b) render some message that's clearer
        if (words[i].ignore) {
            let ignoredHeader = document.createElement('h2');
            ignoredHeader.innerText = words[i].word;
            ignoredHeader.classList.add('word-header');
            item.appendChild(ignoredHeader);
            examplesList.append(item);
            continue;
        }
        renderExplore(words[i], item, definitionList, examples, numExamples, !rendered);
        rendered = true;

        examplesList.append(item);
    }
    currentWords = words;
    if (!skipState) {
        persistNavigationState(hanziBox.value);
        writeExploreState(currentWords);
    }
};

let persistNavigationState = function (words) {
    const activeGraph = getActiveGraph();
    const newUrl = `/${activeGraph.prefix}/${words}`;
    document.title = `${words} | ${activeGraph.display}`;
    history.pushState({
        word: words,
    }, '', newUrl);
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
let fetchStats = function () {
    const activeGraph = getActiveGraph();
    if (activeGraph.hasCoverage === 'all') {
        fetch(`/data/${activeGraph.prefix}/coverage_stats.json`)
            .then(response => response.json())
            .then(data => coverageGraph = data);
        fetch(`/data/${activeGraph.prefix}/character_freq_list.json`)
            .then(response => response.json())
            .then(data => {
                charFreqs = {}
                for (let i = 0; i < data.length; i++) {
                    charFreqs[data[i]] = i + 1;//avoid zero indexing
                }
            });
    } else {
        charFreqs = null;
        coverageGraph = null;
    }
}
let initialize = function () {
    // Note: github pages rewrites are only possible via a 404 hack,
    // so removing the history API integration on the main branch.
    //TODO(refactor): show study when it was the last state
    document.addEventListener('explore-update', function (event) {
        currentMode = ((event.detail.mode === modes.components) ? modes.components : modes.explore);
        hanziBox.value = event.detail.display || event.detail.words[0];
        setupExamples(event.detail.words, event.detail.type || 'chinese', event.detail.skipState);
        if (currentMode === modes.components) {
            switchToTab('tab-components', currentTabs);
        }
    });
    document.addEventListener('character-set-changed', function () {
        voice = getVoice();
        fetchStats();
    });
    voice = getVoice();
    fetchStats();
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
                        switchDiagramView(diagramKeys.main);
                        document.dispatchEvent(new CustomEvent('graph-update', { detail: character }));
                    }
                    //enable seamless switching, but don't update if we're already showing examples for character
                    if (!noExampleChange && (!currentWords || (currentWords.length !== 1 || currentWords[0] !== character))) {
                        setupExamples([character], 'chinese');
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
// TODO: combine with makeSentenceNavigable, or just drop this, it's not that complicated
function makeComponentsNavigable(text, container) {
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
                    document.dispatchEvent(new CustomEvent('components-update', { detail: character }));
                }
            });
            anchorList.push(a);
            sentenceContainer.appendChild(a);
        }(text[i]));
    }
    container.appendChild(sentenceContainer);
    return anchorList;
}

export { initialize, makeSentenceNavigable, addTextToSpeech };