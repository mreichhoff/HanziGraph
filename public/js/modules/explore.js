import { writeExploreState, addCard, inStudyList, isFlashCardUser, explainChineseSentence, isAiEligible, countWordsWithoutCards, hasCardWithWord, registerCallback, dataTypes } from "./data-layer.js";
import { hanziBox, notFoundElement, walkThrough, examplesList } from "./dom.js";
import { getActiveGraph, getPartition } from "./options.js";
import { renderCoverageGraph } from "./coverage-graph"
import { diagramKeys, switchDiagramView, showNotification } from "./ui-orchestrator.js";
import { findPinyinRelationships } from "./pronunciation-parser.js"
import { renderUsageDiagram } from "./flow-diagram.js";
import { showFaq, faqTypes } from "./faq.js";

let coverageGraph = {};
let charFreqs = null;

let maxExamples = 5;
let currentExamples = {};
let currentWords = [];
let menuPopover;

const modes = {
    explore: 'explore',
    components: 'components'
};

const sources = {
    tatoeba: { display: 'Tatoeba', link: 'https://tatoeba.org' },
    ai: { display: 'AI 🤖' },
    subs: { display: 'OpenSubtitles', link: 'https://www.opensubtitles.org' },
    user: { display: 'User-entered 🫅' }
}
let currentMode = modes.explore;
let currentTabs = null;

//TODO(refactor): move notion of activetab to orchestrator
// TODO(refactor): consider removal of getActiveGraph...
let getVoice = function () {
    //use the first-encountered zh-CN voice for now
    if (!('speechSynthesis' in window)) {
        return null;
    }
    // should probably just give every graph a tts key instead of this zh-CN defaulting
    if (!getActiveGraph().ttsKey || getActiveGraph().ttsKey === 'zh-CN') {
        // it appears the `lang` prop on voices on android use an underscore rather than a hyphen (so zh_CN vs zh-CN).
        // additionally, in some cases there are other characters, like zh_CN_#Hans, so do a startsWith check.
        // the web speech API spec seems to say the `lang` property should conform to BCP47 language tags.
        // I don't think either of zh_CN or zh_CN_#Hans does, but perhaps I'm reading it wrong.
        // https://www.ietf.org/rfc/bcp/bcp47.txt
        const zhCnVoices = speechSynthesis.getVoices().filter(voice => voice.lang.replace('_', '-').startsWith('zh-CN'));
        // On MacOS, most voices are extremely robotic, but not Tingting, so hack around it
        // TODO: Chrome also has a google voice, though it doesn't fire `boundary` events.
        // also unknown what the full set of choices on all browsers/platforms is...
        const tingtingHack = zhCnVoices.find(voice => voice.name.toLowerCase().indexOf('tingting') >= 0);
        if (tingtingHack) {
            return tingtingHack;
        }
    }
    // if the hacks above returned nothing, use the first available zh-CN voice.
    // ideally, the `default` property would be reliable, but at least on MacOS, it's never set.
    return speechSynthesis.getVoices().find(voice => voice.lang.replace('_', '-').startsWith(getActiveGraph().ttsKey || 'zh-CN'));
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

let renderPinyinForDefinition = function (pinyin, container) {
    const syllables = getSyllables(pinyin);
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
    const wordHolders = document.getElementsByClassName(`${word}-header`);
    const syllables = getSyllables(definitionList[0].pinyin);
    for (const wordHolder of wordHolders) {
        const elementsToModify = wordHolder.querySelectorAll('.word-header-character');
        if (syllables.length !== elementsToModify.length) {
            return;
        }
        for (let i = 0; i < elementsToModify.length; i++) {
            const syllable = syllables[i];
            elementsToModify[i].classList.add(`tone${syllable[syllable.length - 1]}`);
        }
    }
}
function parseDefinitions(definitionList) {
    let parsedDefinitions = {};
    for (const item of definitionList) {
        // TODO: I goofed...
        // definitions format should be:
        // key: word (or character)
        // val: [{pinyin: a, definitions: [a,b,c], measure: [a,b,c]}...]
        // this would better match cedict's format
        // could consider combining simplified and trad, but separating for
        // the purpose of sentences seems better
        // should also verify this format...
        const key = item.pinyin;
        if (!(key in parsedDefinitions)) {
            parsedDefinitions[key] = [item];
        } else {
            parsedDefinitions[key].push(item);
        }
    }
    return parsedDefinitions;
}
function addFrequencyTag(word, container) {
    if (!wordSet || !(word in wordSet)) {
        return;
    }
    // TODO: not great to hardcode type strings
    if (getActiveGraph().type !== 'frequency') {
        return;
    }
    const rank = wordSet[word];
    // only render frequency tags for words in the top 10k
    if (rank > 10000) {
        return;
    }
    const rankInThousands = Math.ceil(rank / 1000);
    const tag = document.createElement('span');
    tag.classList.add('tag', 'nowrap');
    // direct HTML setting should be ok as `rankInThousands` is from Math.ceil, which surely would
    // never return, like, a script tag....I hope?
    tag.innerHTML = `<span class="deemphasized">Freq: Top ${rankInThousands}k</span>`;
    container.appendChild(tag);
}

// used to render a tag showing how many cards a word is in at time of rendering its definitions
let hasCardsElements = [];
function addFlashCardDefinitionTag(word) {
    if (!isFlashCardUser()) {
        return '';
    }
    const hasCards = hasCardWithWord(word);
    return `<span class="deemphasized">${hasCards ? "✅ Has flashcards" : "❌ No flashcards"}</span>`;
}

let setupDefinitions = function (word, definitionList, container) {
    if (!definitionList) {
        return;
    }
    let parsedDefinitions = parseDefinitions(definitionList);
    // unfortunately, we don't have definition-specific frequency numbers
    // just show any frequency tag on the first one
    let isFirstlineItem = true;
    for (const lineItem of Object.values(parsedDefinitions)) {
        let definitionItem = document.createElement('li');
        definitionItem.classList.add('definition');
        let pinyinAndEnglishHolder = document.createElement('div');
        // each item in `parsedDefinitions` is guaranteed to be at least length 1.
        renderPinyinForDefinition(lineItem[0].pinyin, pinyinAndEnglishHolder);
        for (let i = 0; i < lineItem.length; i++) {
            let englishSpan = document.createElement('span');
            englishSpan.classList.add('definition-part');
            englishSpan.innerHTML = `<span class="definition-number">${i + 1}:</span> ${lineItem[i].en}`;
            pinyinAndEnglishHolder.appendChild(englishSpan);
        }
        definitionItem.appendChild(pinyinAndEnglishHolder);
        let tagHolder = document.createElement('div');
        tagHolder.classList.add('tags');
        for (const definition of lineItem.filter(x => !!(x.measure))) {
            for (const measureWord of definition.measure) {
                let measureSpan = document.createElement('span');
                measureSpan.classList.add('tag', 'nowrap');
                measureSpan.innerHTML = `<span class="deemphasized">Measure:</span> ${measureWord}`;
                measureSpan.addEventListener('click', function () {
                    switchDiagramView(diagramKeys.main);
                    // TODO: implement search command concept, such that queries like `measure:measureWord`
                    // return a list of the most common words that use that measure word.
                    document.dispatchEvent(new CustomEvent('graph-update', { detail: measureWord }));
                });
                tagHolder.appendChild(measureSpan);
            }
        }
        if (isFirstlineItem) {
            addFrequencyTag(word, tagHolder);
            const cardTag = document.createElement('span');
            cardTag.classList.add('tag', 'nowrap');
            cardTag.innerHTML = addFlashCardDefinitionTag(word);
            if (isFlashCardUser() || tagHolder.children.length > 0) {
                tagHolder.appendChild(cardTag);
                hasCardsElements.push({ word, cardTag });
            }
            isFirstlineItem = false;
        }
        definitionItem.appendChild(tagHolder);
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
let addTextToSpeech = function (container, text, aList) {
    let textToSpeechButton = document.createElement('span');
    textToSpeechButton.className = 'speak-button';
    textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
    container.appendChild(textToSpeechButton);
};

// TODO: move to its own module, make it less repetitive
function renderMenu(word, aList, text, example, cardType) {
    let numRows = 0;
    menuPopover.innerHTML = '';
    const speakRow = document.createElement('div');
    speakRow.classList.add('popover-menu-row');
    let textToSpeechButton = document.createElement('span');
    textToSpeechButton.className = 'speak-button';
    const speakSpan = document.createElement('span');
    speakSpan.innerText = 'Listen';
    speakRow.addEventListener('click', function () {
        runTextToSpeech(text, aList);
        // hide the popover so as not to cover highlighting while speaking
        setTimeout(hideMenuPopover, 250);
    });
    speakRow.appendChild(textToSpeechButton);
    speakRow.appendChild(speakSpan);
    numRows++;

    const addCardRow = document.createElement('div');
    addCardRow.classList.add('popover-menu-row');
    const addSpan = document.createElement('span');
    addSpan.classList.add(inStudyList(text) ? 'check' : 'add-button');
    const addTextSpan = document.createElement('span');
    addTextSpan.innerText = inStudyList(text) ? 'Flashcard added' : `Add ${cardType} flashcard`;
    addCardRow.addEventListener('click', function () {
        if (cardType === cardTypes.sentence) {
            addCard(example, word, getActiveGraph().locale);
        } else {
            const definitionCard = currentExamples[word].find(x => x.type === cardTypes.definition);
            addCard(definitionCard, word, getActiveGraph().locale);
        }
        addSpan.classList.remove('add-button');
        addSpan.classList.add('check');
        addTextSpan.innerText = 'Flashcard added';
        showNotification();
        // give the user a brief moment to see the success message, then close.
        setTimeout(hideMenuPopover, 1000);
    });
    addCardRow.appendChild(addSpan);
    addCardRow.appendChild(addTextSpan);
    numRows++;

    const copyRow = document.createElement('div');
    copyRow.classList.add('popover-menu-row');
    const copyIconSpan = document.createElement('span');
    copyIconSpan.classList.add('copy-icon');
    copyRow.appendChild(copyIconSpan);
    const copyText = document.createElement('span');
    copyText.innerText = 'Copy';
    copyRow.appendChild(copyText);
    copyRow.addEventListener('click', async function () {
        try {
            await navigator.clipboard.writeText(text);
            copyIconSpan.classList.remove('copy-icon');
            copyIconSpan.classList.add('check');
            copyText.innerText = 'Copied';
        } catch (error) {
            // we shouldn't get here: the main site is in a secure context,
            // and to run this code you need a click, so user activation
            // should be there.
            copyText.innerText = 'Failed to copy';
        }
        setTimeout(hideMenuPopover, 250);
    });
    numRows++;

    let shareRow = null;
    if (cardType === cardTypes.definition) {
        const shareData = {
            text: `${word} | HanziGraph`,
            url: `${document.location.origin}/${getActiveGraph().prefix}/${word}`
        };
        if (navigator.canShare && navigator.canShare(shareData)) {
            shareRow = document.createElement('div');
            shareRow.classList.add('popover-menu-row');
            const shareIconSpan = document.createElement('span');
            shareIconSpan.classList.add('share-icon');
            shareRow.appendChild(shareIconSpan);
            const shareText = document.createElement('span');
            shareText.innerText = 'Share';
            shareRow.appendChild(shareText);
            shareRow.addEventListener('click', async function () {
                try {
                    await navigator.share(shareData);
                    shareIconSpan.classList.remove('share-icon');
                    shareIconSpan.classList.add('check');
                    shareText.innerText = "Shared";
                } catch (err) {
                    // no-op, as this happens if the user cancels
                    // no need to show an error in that case
                    // could get more detailed here, but meh
                }
                setTimeout(hideMenuPopover, 250);
            });
            numRows++;
        }
    }

    menuPopover.appendChild(speakRow);
    menuPopover.appendChild(addCardRow);
    menuPopover.appendChild(copyRow);
    if (shareRow) {
        menuPopover.appendChild(shareRow);
    }

    return numRows;
}

const cardTypes = {
    definition: 'definition',
    sentence: 'sentence'
};

// TODO: keep in sync with css....not great. 20 for padding, 24 for height
const ROW_HEIGHT = 44;

function hideMenuPopover() {
    menuPopover.hidePopover();
}

function addPopoverMenuButton(word, example, container, text, aList, cardType) {
    const button = document.createElement('span');
    button.classList.add('three-dot');
    const buttonContainer = document.createElement('span');
    buttonContainer.classList.add('three-dot-container');
    buttonContainer.appendChild(button);
    container.appendChild(buttonContainer);
    buttonContainer.addEventListener('click', function () {
        // TODO: this was here before the safari event ordering issue, and allowed
        // a second click of the same button to hide the menu. Safari was firing
        // the popover close before this, running the `toggle` handler, which removes
        // the open-button class, and only then running this event, so this branch
        // got skipped. Workarounds weren't great. Covering the button seems fine for now.
        if (button.classList.contains('open-button')) {
            menuPopover.hidePopover();
            button.classList.remove('open-button');
            return;
        }
        for (const openButton of document.querySelectorAll('.open-button')) {
            openButton.classList.remove('open-button');
        }
        button.classList.add('open-button');
        const buttonDimensions = button.getBoundingClientRect();
        menuPopover.style.left = `${buttonDimensions.left - 215}px`;
        // seemingly safari fires the popover events before the
        // click handlers, even mousedown. Touchstart might be an option, but it's too bad
        // mobile browsers don't all handle this seeming edge case similarly.
        // accordingly, we render the menu over the top of the button, which does seem
        // to be a reasonably common UI pattern on both iOS and Android.
        const numRows = renderMenu(word, aList, text, example, cardType);
        if (buttonDimensions.bottom + (numRows * 44) < window.visualViewport.height) {
            menuPopover.style.top = `${buttonDimensions.top + window.scrollY}px`;
        } else {
            menuPopover.style.top = `${buttonDimensions.top - (numRows * ROW_HEIGHT) + window.scrollY + 16}px`;
        }
        menuPopover.showPopover();
    });
}

// used for showing flash card users how many words in a sentence are not in their flash cards
//
// should we just use a framework for keeping this in sync with the underlying data?
// oh yeah
// but will I?
// no
let missingWordElements = [];
let setupExampleElements = function (word, examples, exampleList, defaultSource) {
    for (let i = 0; i < examples.length; i++) {
        let exampleHolder = document.createElement('li');
        exampleHolder.classList.add('example');
        let zhHolder = document.createElement('p');
        let exampleText = examples[i].zh.join('');
        let aList = makeSentenceNavigable(exampleText, zhHolder, true);
        zhHolder.className = 'target';
        addPopoverMenuButton(word, examples[i], zhHolder, exampleText, aList, cardTypes.sentence);
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
        let tagContainer = document.createElement('div');
        tagContainer.classList.add('tags');
        const sourceKey = examples[i].source || defaultSource;
        if (sourceKey in sources) {
            const source = sources[sourceKey];
            const sourceTag = document.createElement('span');
            sourceTag.classList.add('tag', 'nowrap');
            // innerHTML should be safe since we check that sourceKey is in our sources allowlist
            if (source.link) {
                sourceTag.innerHTML = `<span class="deemphasized">Source: <a href="${source.link}">${source.display}</a></span>`;
            } else {
                sourceTag.innerHTML = `<span class="deemphasized">Source: ${source.display}</span>`;
            }
            tagContainer.appendChild(sourceTag);
        }
        if (charFreqs) {
            const uniqueChars = [...new Set([...examples[i].zh.join('')])];
            const knownUniqueChars = uniqueChars.filter(x => !!charFreqs[x]);
            const averageCharacterRank = Math.round(knownUniqueChars.reduce((x, y) => x + charFreqs[y], 0) / knownUniqueChars.length);
            const rankTag = document.createElement('span');
            const easeString = averageCharacterRank < 160 ?
                '🔥🔥🔥' :
                averageCharacterRank < 300 ?
                    '🔥🔥' :
                    averageCharacterRank < 450 ?
                        '🔥' :
                        averageCharacterRank < 700 ?
                            '🥶' :
                            averageCharacterRank < 1000 ?
                                '🥶🥶' :
                                '🥶🥶🥶';
            rankTag.classList.add('tag', 'nowrap');
            rankTag.innerHTML = `<span class="deemphasized">Avg char freq:</span> <span class="sentence-freq-tag">${easeString}</span>`;
            tagContainer.appendChild(rankTag);
        }
        // if the user doesn't use HanziGraph for flashcards, render nothing.
        // otherwise, let them know how many new words are in the sentence to aid the choice of whether to make a flashcard
        const words = examples[i].zh.filter(x => x in wordSet);
        const unknownWordCount = countWordsWithoutCards(words);
        const unknownWordTag = document.createElement('span');
        unknownWordTag.innerHTML = getUnknownWordHtml(unknownWordCount);
        unknownWordTag.classList.add('tag', 'nowrap');
        missingWordElements.push({ unknownWordTag, words });
        tagContainer.appendChild(unknownWordTag);
        exampleHolder.appendChild(tagContainer);
        exampleList.appendChild(exampleHolder);
    }
};
function getUnknownWordHtml(unknownWordCount) {
    if (!isFlashCardUser()) {
        return '';
    }
    return unknownWordCount === 0 ?
        `<span class="deemphasized">✅ No unknown words</span>` :
        `<span class="deemphasized">No flashcards: <b>${unknownWordCount} word${unknownWordCount !== 1 ? 's' : ''}</b></span>`;
}

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
            setupExampleElements(word, examples, container, getActiveGraph().secondarySentenceSource);
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
            setupDefinitions(word, definitionList, container);
            // now that we know the tones of the word/character, modify the header to be color-coded, too.
            modifyHeaderTones(definitionList, word);
            // TODO(refactor): should this be moved to setupDefinitions (and same with setupExamples/augmentExamples)?
            if (definitionList.length > 0) {
                currentExamples[word].push(getCardFromDefinitions(word, definitionList));
            }
        });
};
let renderDefinitions = function (word, definitionList, container) {
    let definitionsContainer = document.createElement('ul');
    definitionsContainer.className = 'definitions';
    container.appendChild(definitionsContainer);
    if (definitionList && definitionList.length > 0) {
        setupDefinitions(word, definitionList, definitionsContainer);
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

function getSyllables(pinyin) {
    // some CEDICT entries include a " - ", so like:
    // yi1 mu2 - yi1 yang4 rather than yi1 mu2 yi1 yang4
    // arguably that should be a data fix, but I guess
    // it looks slightly better for display that way.
    // but for tone color coding, we just want to have each
    // syllable pronunciation by itself.
    return pinyin.replace(' - ', ' ').split(' ');
}
let renderWordHeaderByCharacter = function (word, container) {
    const definitionList = definitions[word];
    let syllables = null;
    if (definitionList && definitionList[0].pinyin) {
        syllables = getSyllables(definitionList[0].pinyin);
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
    wordSpan.classList.add('clickable', `${word}-header`);
    wordHolder.appendChild(wordSpan);
    addPopoverMenuButton(word, null, wordHolder, word, [], cardTypes.definition);
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
        setupExampleElements(word, examples, exampleList, 'tatoeba');
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
    let renderedWordFreq = false;
    if (coverageGraph && ('words' in coverageGraph) && (word in wordSet)) {
        container.appendChild(wordFreqHeader);
        renderCoverageGraph(coverageGraph['words'], word, wordSet[word], 'word', container);
        renderedWordFreq = true;
    }
    let charFreqHeader = document.createElement('h3');
    charFreqHeader.classList.add('explore-stat-header');
    charFreqHeader.innerText = 'Character Frequency Stats';
    container.appendChild(charFreqHeader);
    let renderedCharacterFreq = false;
    for (const character of word) {
        if (charFreqs && (character in charFreqs) && coverageGraph && ('chars' in coverageGraph)) {
            renderCoverageGraph(coverageGraph['chars'], character, charFreqs[character], 'character', container);
            renderedCharacterFreq = true;
        }
    }
    if (!renderedCharacterFreq) {
        charFreqHeader.style.display = 'none';
    }
    if (!renderedWordFreq && !renderedCharacterFreq) {
        let unavailableMessage = document.createElement('p');
        unavailableMessage.innerText = 'Sorry, no stats found.';
        container.appendChild(unavailableMessage);
    }
    //TODO(refactor): render the coverage stats, if available
    // if not available, still render the "word ranks X, characters rank Y"
};

function switchToTab(id, tabs) {
    for (const [tabId, elements] of Object.entries(tabs)) {
        const separator = elements.tab.querySelector('.separator');
        if (id === tabId) {
            if (elements.tab.classList.contains('active')) {
                // tab is already active, so no need to switch to it
                // the `else` below also needn't be run for the other tabs
                // but it's also ok if it is, or else we could do a first
                // loop to get this answer and then the main one.
                return;
            }
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

function renderRelatedCharacters(character, relatedCharacters, type, container) {
    if (relatedCharacters.length === 0) {
        container.innerText = type === 'compounds' ? 'This character is not a component of others.' : "No components found. Maybe we can't break this down any more.";
    } else {
        container.classList.add('related-characters');
    }
    for (const relatedCharacter of relatedCharacters) {
        // TODO: why does order of src and target matter?
        const pinyinRelationship = type === 'compounds' ? findPinyinRelationships(relatedCharacter, character) : findPinyinRelationships(character, relatedCharacter);
        const relatedAnchor = document.createElement('a');
        if (pinyinRelationship) {
            relatedAnchor.classList.add('nowrap');
            relatedAnchor.innerHTML = `${relatedCharacter} <span class="pinyin-relationship">(${pinyinRelationship})</span>`;
        } else {
            relatedAnchor.innerText = relatedCharacter;
        }
        relatedAnchor.classList.add(`tone${getTone(relatedCharacter)}`);
        if (relatedCharacter in components) {
            relatedAnchor.classList.add('navigable');
            relatedAnchor.addEventListener('click', function () {
                document.dispatchEvent(new CustomEvent('components-update', { detail: relatedCharacter }));
            });
        }
        container.appendChild(relatedAnchor);
    }
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
        renderRelatedCharacters(character, components[character].components, 'components', componentsContainer);
        item.appendChild(componentsContainer);
        let componentsOfHeader = document.createElement('h3');
        componentsOfHeader.innerText = 'Compounds';
        item.appendChild(componentsOfHeader);
        let componentOfContainer = document.createElement('div');
        const compounds = components[character].componentOf.filter(x => x in hanzi).sort((a, b) => hanzi[a].node.level - hanzi[b].node.level);
        renderRelatedCharacters(character, compounds, 'compounds', componentOfContainer);
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
    let flowContainer = document.createElement('div');
    flowContainer.classList.add('explore-subpane');
    flowContainer.style.display = 'none';
    // TODO: make this smarter
    currentTabs = renderTabs(tabs, ['Meaning', 'Components', 'Stats', 'Flow'], [meaningContainer, componentsContainer, statsContainer, flowContainer], [() => { }, () => {
        document.dispatchEvent(new CustomEvent('components-update', { detail: word[0] }));
    }, function () {
        statsContainer.innerHTML = '';
        renderStats(word, statsContainer)
    }, function () {
        flowContainer.innerHTML = '';
        renderUsageDiagram(word, flowContainer);
    }], ['slide-in', 'slide-in', 'slide-in', 'slide-in']);
    container.appendChild(meaningContainer);
    renderMeaning(word, definitionList, examples, maxExamples, meaningContainer);
    renderComponents(word, componentsContainer);
    container.appendChild(componentsContainer);
    container.appendChild(statsContainer);
    container.appendChild(flowContainer);
}

function renderGrammarHighlights(grammarHighlights, container) {
    if (!grammarHighlights || grammarHighlights.length < 1) {
        return;
    }
    const grammarHeader = document.createElement('h3')
    grammarHeader.innerText = `Grammar`;

    const grammarList = document.createElement('ul');
    grammarList.classList.add('grammar-list');
    grammarHighlights.forEach(grammarPoint => {
        const grammarItem = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.classList.add('grammar-name');
        nameSpan.innerText = `${grammarPoint.grammarConceptName}: `;
        const explanationSpan = document.createElement('span');
        explanationSpan.classList.add('grammar-explanation');
        explanationSpan.innerText = grammarPoint.grammarConceptExplanation;
        grammarItem.appendChild(nameSpan);
        grammarItem.appendChild(explanationSpan);
        grammarList.appendChild(grammarItem);
    });

    container.appendChild(grammarHeader);
    container.appendChild(grammarList);
}

function renderExplanation(explanation, container) {
    const explanationHeader = document.createElement('h3');
    explanationHeader.innerText = `Explanation`;

    const explanationContainer = document.createElement('div');
    explanationContainer.innerText = explanation;

    container.appendChild(explanationHeader);
    container.appendChild(explanationContainer);
}

function renderAiExplanationResponse(words, response, container) {
    // TODO: error states
    const data = response.data;
    const exampleHeader = document.createElement('h3');
    exampleHeader.innerText = "Translated";
    // this kinda just works like a normal example here...
    const exampleList = document.createElement('ul');
    setupExampleElements(null, [{ zh: words, pinyin: data.pinyin, en: data.englishTranslation }], exampleList, 'user');

    const explanationContainer = document.createElement('div');
    explanationContainer.classList.add('ai-explanation');
    const explanation = data.plainTextExplanation;
    renderExplanation(explanation, explanationContainer);

    const grammarContainer = document.createElement('div');
    grammarContainer.classList.add('ai-grammar-points');
    const grammar = data.grammarHighlights;
    renderGrammarHighlights(grammar, grammarContainer);

    container.appendChild(exampleHeader);
    container.appendChild(exampleList);
    container.appendChild(explanationContainer);
    container.appendChild(grammarContainer);
}

function createLoadingDots() {
    const loadingDots = document.createElement('div');
    loadingDots.classList.add('loading-dots');
    // there uh....there's four dots, ok?
    loadingDots.innerHTML = '<div></div><div></div><div></div><div></div>';
    return loadingDots;
}

let setupExamples = function (words, type, skipState, allowExplain, aiData) {
    currentExamples = {};
    hasCardsElements = [];
    missingWordElements = [];
    // if we're showing examples, never show the walkthrough.
    walkThrough.style.display = 'none';
    notFoundElement.style.display = 'none';
    //TODO this mixes markup modification and example finding
    while (examplesList.firstChild) {
        examplesList.firstChild.remove();
    }
    let numExamples = maxExamples;
    if (words.length > 1) {
        numExamples = 2;
        if (type === 'english') {
            numExamples = 1;
        }
        if (allowExplain && isAiEligible()) {
            const loadingDots = createLoadingDots();
            const aiResponseContainer = document.createElement('div');
            aiResponseContainer.style.display = 'none';
            aiResponseContainer.classList.add('ai-explanation-container');
            examplesList.appendChild(loadingDots);
            document.getElementById('explore-container').scrollTo({ top: 0 });
            examplesList.appendChild(aiResponseContainer);
            const wordsWithoutIgnored = words.map(x => x.ignore ? x.word : x);
            let joinedText = wordsWithoutIgnored.join('');
            explainChineseSentence(joinedText).then(result => {
                loadingDots.style.display = 'none';
                renderAiExplanationResponse(wordsWithoutIgnored, result, aiResponseContainer);
                aiResponseContainer.removeAttribute('style');
            }).catch(e => {
                loadingDots.style.display = 'none';
                aiResponseContainer.classList.add('ai-error')
                aiResponseContainer.innerText = 'Sorry, something went wrong.';
                aiResponseContainer.removeAttribute('style');
                setTimeout(function () {
                    aiResponseContainer.style.display = 'none';
                }, 5000);
            });
        } else if (aiData && isAiEligible()) {
            const aiResponseContainer = document.createElement('div');
            aiResponseContainer.classList.add('ai-explanation-container');
            const wordsWithoutIgnored = words.map(x => x.ignore ? x.word : x);
            renderAiExplanationResponse(wordsWithoutIgnored, aiData, aiResponseContainer);
            examplesList.appendChild(aiResponseContainer);
        }
        let instructions = document.createElement('p');
        instructions.classList.add('explanation');
        instructions.innerText = `There are multiple words.`;
        examplesList.appendChild(instructions);
    }
    let rendered = false;
    for (let i = 0; i < words.length; i++) {
        let examples = findExamples(words[i], sentences, numExamples);
        let definitionList = definitions[words[i]] || [];

        currentExamples[words[i]] = [];
        //TODO: definition list doesn't have the same interface (missing zh field)
        if (definitionList.length > 0) {
            currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
        }
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

// TODO can this be combined with the definition rendering part?
// TODO: enable adding specific definition cards rather than all at once
let getCardFromDefinitions = function (text, definitionList) {
    let parsedDefinitions = parseDefinitions(definitionList);
    //this assumes definitionList non null and non empty
    let result = { zh: [text], type: cardTypes.definition };
    let answer = Object.values(parsedDefinitions).map(item => {
        return `${item[0].pinyin}: ${item.map(x => x.en).join(', ')}`;
    }).join('; ');
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
        setupExamples(event.detail.words, event.detail.type || 'chinese', event.detail.skipState, event.detail.allowExplain, event.detail.aiData);
        if (currentMode === modes.components) {
            switchToTab('tab-components', currentTabs);
        }
    });
    menuPopover = document.getElementById('menu-popover');
    menuPopover.addEventListener('toggle', function (event) {
        const container = document.getElementById('explore-container');
        if (event.newState === "closed") {
            // needed as clicking the button a second time or clicking outside the menu and button
            // can both close the popover menu
            for (const button of document.querySelectorAll('.open-button')) {
                button.classList.remove('open-button');
            }
            container.removeEventListener('scroll', hideMenuPopover, { passive: true, once: true });
        } else {
            container.addEventListener('scroll', hideMenuPopover, { passive: true, once: true });
        }
    });
    document.addEventListener('loading-dots', function () {
        const loadingDots = createLoadingDots();
        // show the loading dots at the top of the examples, and assume it will
        // soon be cleared by a rendering of examples (this is a bad assumption)
        // (but at least there's a hide below, surely no client would ever mix that up)
        examplesList.prepend(loadingDots);
        // make sure the loading dots show up instead of leaving the user guessing what happened
        // TODO: get rid of this getElementById here
        document.getElementById('explore-container').scrollTo({ top: 0 });
    });
    document.addEventListener('hide-loading-dots', function () {
        const existingLoadingDots = examplesList.querySelector('.loading-dots');
        if (!existingLoadingDots) {
            return;
        }
        existingLoadingDots.style.display = 'none';
    });
    window.addEventListener('resize', function () {
        // resizing the screen throws off positioning of the menu...just hide it
        menuPopover.hidePopover();
    });
    voice = getVoice();
    fetchStats();
    registerCallback(dataTypes.studyList, function () {
        for (const item of missingWordElements) {
            const unknownWordCount = countWordsWithoutCards(item.words);
            item.unknownWordTag.innerHTML = getUnknownWordHtml(unknownWordCount);
        }
        for (const item of hasCardsElements) {
            item.cardTag.innerHTML = addFlashCardDefinitionTag(item.word);
        }
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

export { initialize, makeSentenceNavigable, addTextToSpeech };