import { makeSentenceNavigable, addTextToSpeech } from "./explore.js";
import { dataTypes, registerCallback, saveStudyList, getStudyList, findOtherCards, removeFromStudyList, recordEvent, studyResult, updateCard, cardTypes } from "./data-layer.js";
import { registerStateChangeCallback, stateKeys } from "./ui-orchestrator.js";
import * as anki from "./anki.js";

const studyContainer = document.getElementById('study-container');

const exportStudyListButton = document.getElementById('exportStudyListButton');
const cardQuestionContainer = document.getElementById('card-question-container');
const cardAnswerContainer = document.getElementById('card-answer-container');
const showAnswerButton = document.getElementById('show-answer-button');
const taskCompleteElement = document.getElementById('task-complete');
const cardsDueElement = document.getElementById('cards-due');
const cardsDueCounter = document.getElementById('card-due-count');
const taskDescriptionElement = document.getElementById('task-description');
const cardAnswerElement = document.getElementById('card-answer');
const wrongButton = document.getElementById('wrong-button');
const rightButton = document.getElementById('right-button');
const deleteCardButton = document.getElementById('delete-card-button');
const cardAddedTime = document.getElementById('card-added-time');
const cardAddedTimeContainer = document.getElementById('card-added-time-container');
const cardAddedReason = document.getElementById('card-added-reason');
const cardOriginContainer = document.getElementById('card-origin-container');

const relatedCardsContainer = document.getElementById('related-cards-container');
const relatedCardsElement = document.getElementById('related-cards');
const relatedCardQueryElement = document.getElementById('related-card-query');
const cardOldMessageElement = document.getElementById('card-old-message');
const cardNewMessageElement = document.getElementById('card-new-message');
const cardRightCountElement = document.getElementById('card-right-count');
const cardWrongCountElement = document.getElementById('card-wrong-count');
const cardPercentageElement = document.getElementById('card-percentage');
const clozePlaceholderCharacter = "_";
const clozePlaceholder = clozePlaceholderCharacter + clozePlaceholderCharacter + clozePlaceholderCharacter;

const explanationContainer = document.getElementById('study-explain-container');
const explanationHideButton = document.getElementById('hide-study-explanation');
const ankiNudgeContainer = document.getElementById('anki-nudge-container');

// Shared inline definition container for study mode - created once and reused
let studyInlineDefContainer = null;

let currentKey = null;
let studyModeActive = false;
let currentTextToSpeechButton = null;

// TODO: must match cardTypes, which sucks
// why can't you do: {cardTypes.RECOGNITION: function(){...}}?
const cardRenderers = {
    'recognition': function (currentCard) {
        taskDescriptionElement.innerText = 'What does the text below mean?';
        let question = currentCard.zh.join('');

        let aList = makeSentenceNavigable(question, cardQuestionContainer, {
            words: currentCard.zh,
            definitionContainer: studyInlineDefContainer,
            containerPadding: 0,
            sentence: question
        });

        for (let i = 0; i < aList.length; i++) {
            aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
        }
        cardQuestionContainer.classList.add('target');
        currentTextToSpeechButton = addTextToSpeech(cardQuestionContainer, question, aList);
        cardAnswerElement.textContent = currentCard.en;

    },
    'recall': function (currentCard) {
        let question = currentCard.en;
        let answer = currentCard.zh.join('');
        // so clean, so clean
        if (answer === currentCard.vocabOrigin) {
            taskDescriptionElement.innerText = `Can you match the definitions below to a Chinese word?`;
        } else {
            taskDescriptionElement.innerText = `Can you translate the text below to Chinese?`;
        }
        cardAnswerElement.innerHTML = '';
        cardQuestionContainer.classList.remove('target');
        // TODO(refactor): target causes side effects
        // cardAnswerContainer.classList.add('target');

        let aList = makeSentenceNavigable(answer, cardAnswerElement, {
            words: currentCard.zh,
            definitionContainer: studyInlineDefContainer,
            containerPadding: 0,
            sentence: answer
        });

        for (let i = 0; i < aList.length; i++) {
            aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
        }
        currentTextToSpeechButton = addTextToSpeech(cardAnswerElement, answer, aList);
        cardQuestionContainer.innerText = question;
    },
    'cloze': function (currentCard) {
        taskDescriptionElement.innerText = `Can you replace ${clozePlaceholder} to match the translation?`;
        let clozedSentence;
        let clozedWords;
        if (currentCard.vocabOrigin.length === 1) {
            clozedSentence = currentCard.zh.join('');
            clozedSentence = clozedSentence.replaceAll(currentCard.vocabOrigin, x => clozePlaceholder);
            // For single-char vocab, build words array with placeholders
            clozedWords = currentCard.zh.map(w => w.includes(currentCard.vocabOrigin) ? w.replaceAll(currentCard.vocabOrigin, clozePlaceholder) : w);
        }
        else {
            clozedSentence = currentCard.zh.map(x => x === currentCard.vocabOrigin ? clozePlaceholder : x).join('');
            clozedWords = currentCard.zh.map(x => x === currentCard.vocabOrigin ? clozePlaceholder : x);
        }
        let clozeContainer = document.createElement('p');
        clozeContainer.className = 'cloze-container';
        //TODO(refactor): target shouldn't make this thing into a flex element the way it does now
        cardQuestionContainer.classList.remove('target');
        // cardAnswerContainer.classList.add('target');

        let aList = makeSentenceNavigable(clozedSentence, clozeContainer, {
            words: clozedWords,
            definitionContainer: studyInlineDefContainer,
            containerPadding: 0,
            sentence: currentCard.zh.join('')  // Use full sentence for AI explain
        });
        for (let i = 0; i < aList.length; i++) {
            // TODO yuck
            if (i >= 2 && aList[i].innerText === clozePlaceholderCharacter && aList[i - 1].innerText === clozePlaceholderCharacter && aList[i - 2].innerText === clozePlaceholderCharacter) {
                aList[i].classList.add('cloze-placeholder');
                aList[i - 1].classList.add('cloze-placeholder');
                aList[i - 2].classList.add('cloze-placeholder');
            }
            aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
        }
        cardQuestionContainer.appendChild(clozeContainer);
        let clozeAnswerContainer = document.createElement('p');
        clozeAnswerContainer.className = 'cloze-container';
        clozeAnswerContainer.innerText = currentCard.en;
        cardQuestionContainer.appendChild(clozeAnswerContainer);
        cardAnswerElement.innerHTML = '';

        let answerAList = makeSentenceNavigable(currentCard.vocabOrigin, cardAnswerElement, {
            words: [currentCard.vocabOrigin],
            definitionContainer: studyInlineDefContainer,
            containerPadding: 0,
            sentence: currentCard.zh.join('')  // Use full sentence for AI explain
        });

        for (let i = 0; i < answerAList.length; i++) {
            answerAList[i].addEventListener('click', displayRelatedCards.bind(this, answerAList[i]));
        }
        currentTextToSpeechButton = addTextToSpeech(cardAnswerElement, currentCard.vocabOrigin, answerAList);
    }
};

let displayRelatedCards = function (anchor) {
    let MAX_RELATED_CARDS = 3;
    let related = findOtherCards(anchor.textContent, currentKey);
    let studyList = getStudyList();
    relatedCardQueryElement.innerText = anchor.textContent;
    if (!related || !related.length) {
        relatedCardsContainer.style.display = 'none';
        return;
    }
    relatedCardsElement.innerHTML = '';
    for (let i = 0; i < Math.min(MAX_RELATED_CARDS, related.length); i++) {
        let item = document.createElement('p');
        item.className = 'related-card';
        item.innerText = related[i];
        let relatedPerfContainer = document.createElement('p');
        relatedPerfContainer.classList.add('related-card-performance');
        let relatedPerf = document.createElement('span');
        relatedPerf.classList.add('emphasized');
        const percentage = Math.round(100 * studyList[related[i]].rightCount / ((studyList[related[i]].rightCount + studyList[related[i]].wrongCount) || 1))
        setPerformanceClass(percentage, relatedPerf);
        relatedPerfContainer.appendChild(relatedPerf);
        relatedPerfContainer.innerHTML += ' correct.';
        item.appendChild(relatedPerfContainer);
        relatedCardsElement.appendChild(item);
    }
    relatedCardsContainer.removeAttribute('style');
}

function setPerformanceClass(correctPercentage, container) {
    container.classList.remove('good-performance', 'ok-performance', 'bad-performance')
    container.textContent = `${correctPercentage}%`;
    if (correctPercentage >= 80) {
        container.classList.add('good-performance');
    } else if (correctPercentage < 80 && correctPercentage >= 60) {
        container.classList.add('ok-performance');
    } else {
        container.classList.add('bad-performance')
    }
}

let setupStudyMode = function () {
    let studyList = getStudyList();
    currentKey = null;
    let currentCard = null;
    cardAnswerContainer.style.display = 'none';
    showAnswerButton.innerText = "Show Answer";

    // Create shared inline definition container once, as sibling after cardQuestionContainer
    if (!studyInlineDefContainer) {
        studyInlineDefContainer = document.createElement('div');
        studyInlineDefContainer.className = 'inline-definition-container';
        cardQuestionContainer.parentNode.insertBefore(
            studyInlineDefContainer,
            cardQuestionContainer.nextSibling
        );
    }
    // Reset and hide the definition container for new card
    studyInlineDefContainer.style.display = 'none';
    studyInlineDefContainer.innerHTML = '';

    // Show Anki nudge if enabled and not dismissed
    if (anki.isAnkiEnabled()) {
        ankiNudgeContainer.removeAttribute('style');
    } else {
        ankiNudgeContainer.style.display = 'none';
    }

    let counter = 0;
    for (const [key, value] of Object.entries(studyList)) {
        if (value.due <= Date.now()) {
            if (!currentCard || currentCard.due > value.due ||
                (currentCard.due == value.due && value.zh.length < currentCard.zh.length)) {
                currentCard = value;
                currentKey = key;
            }
            counter++;
        }
    }
    cardsDueCounter.textContent = counter;
    cardQuestionContainer.innerHTML = '';
    currentTextToSpeechButton = null;
    if (counter === 0) {
        taskCompleteElement.removeAttribute('style');
        taskDescriptionElement.style.display = 'none';
        showAnswerButton.style.display = 'none';
        return;
    }

    taskCompleteElement.style.display = 'none';
    showAnswerButton.removeAttribute('style');
    // Old cards have no type property, but all are recognition
    cardRenderers[currentCard.type || cardTypes.RECOGNITION](currentCard);
    taskDescriptionElement.removeAttribute('style');

    if (currentCard.wrongCount + currentCard.rightCount != 0) {
        cardOldMessageElement.removeAttribute('style');
        cardNewMessageElement.style.display = 'none';
        const correctPercentage = Math.round(100 * currentCard.rightCount / ((currentCard.rightCount + currentCard.wrongCount) || 1));
        setPerformanceClass(correctPercentage, cardPercentageElement);
        cardRightCountElement.textContent = `${currentCard.rightCount || 0} time${currentCard.rightCount != 1 ? 's' : ''}`;
        cardWrongCountElement.textContent = `${currentCard.wrongCount || 0} time${currentCard.wrongCount != 1 ? 's' : ''}`;
    } else {
        cardNewMessageElement.removeAttribute('style');
        cardOldMessageElement.style.display = 'none';
    }
    if (currentCard.added) {
        cardAddedTimeContainer.removeAttribute('style');
        cardAddedTime.innerText = new Date(Number(currentCard.added)).toLocaleDateString('en-US',
            {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });
    } else {
        cardAddedTimeContainer.style.display = 'none';
    }
    if (currentCard.vocabOrigin && currentCard.vocabOrigin !== currentCard.zh.join('')) {
        cardAddedReason.innerText = currentCard.vocabOrigin;
        cardOriginContainer.removeAttribute('style');
    } else {
        cardOriginContainer.style.display = 'none';
    }
    relatedCardsContainer.style.display = 'none';
};
function keyboardShortcutHandler(event) {
    // if the user is typing in some input field, don't mess with them.
    // if the user is pressing ctrl/shift/alt/meta, don't mess with them.
    // if the button to show the answer isn't being shown, there's no cards, so don't do anything.
    if (event.target.nodeName.toLowerCase() === 'input' ||
        event.ctrlKey || event.shiftKey || event.altKey || event.metaKey ||
        showAnswerButton.style.display === 'none') {
        return;
    }
    // could add a isFlipped variable or whatever, but that's effectively expressed with the display
    // (or not) of the card's answer.
    if (cardAnswerContainer.style.display === 'none' &&
        // keypress support...
        ((event.key === " " || event.code === "Space") ||
            // gamepad support...
            (event.detail && (event.detail.gamePadButton === 0 || event.detail.gamePadButton === 1)))) {
        // in general, trying not to preventDefault, I guess? But should probably add it to the branches below...
        event.preventDefault();
        flip();
        return;
    }
    if (cardAnswerContainer.style.display !== 'none' && (event.key === 'ArrowRight' || (event.detail && event.detail.gamePadButton === 5))) {
        markCorrect();
        return;
    }
    if (cardAnswerContainer.style.display !== 'none' && (event.key === 'ArrowLeft' || (event.detail && event.detail.gamePadButton === 4))) {
        markIncorrect();
        return;
    }
    if (currentTextToSpeechButton && ((event.key === 'r') || (event.detail && event.detail.gamePadButton === 3))) {
        currentTextToSpeechButton.click();
    }
}
function setupKeyboardShortcutEvents() {
    document.addEventListener('keydown', keyboardShortcutHandler);
    document.addEventListener('gamepadButtonDown', keyboardShortcutHandler);
}
function stopKeyboardShortcutEvents() {
    document.removeEventListener('keydown', keyboardShortcutHandler);
    document.removeEventListener('gamepadButtonDown', keyboardShortcutHandler);
}

function markIncorrect() {
    updateCard(studyResult.INCORRECT, currentKey);
    setupStudyMode();
    cardsDueElement.scrollIntoView();
    cardsDueElement.classList.add('result-indicator-wrong');
    setTimeout(function () {
        cardsDueElement.classList.remove('result-indicator-wrong');
    }, 750);
    recordEvent(studyResult.INCORRECT);
}
function markCorrect() {
    updateCard(studyResult.CORRECT, currentKey);
    setupStudyMode();
    cardsDueElement.scrollIntoView();
    cardsDueElement.classList.add('result-indicator-right');
    setTimeout(function () {
        cardsDueElement.classList.remove('result-indicator-right');
    }, 750);
    recordEvent(studyResult.CORRECT);
}
function flip() {
    showAnswerButton.innerText = "Answer:";
    cardAnswerContainer.removeAttribute('style');
    showAnswerButton.scrollIntoView();
}

function isOnlyThisGamepadButtonPushed(buttons, index) {
    if (!buttons[index].pressed) {
        return false;
    }
    for (let i = 0; i < buttons.length; i++) {
        if (i === index) { continue; }
        if (buttons[i].pressed) {
            return false;
        }
    }
    return true;
}

let gamePadAnimationFrame = null;
// the spec https://w3c.github.io/gamepad/#remapping seems to indicate there's just the one "standard" layout.
//   image here: https://w3c.github.io/gamepad/standard_gamepad.svg
// and so:
// buttons[0] is "flip card"
// buttons[1] is "flip card" as well, since xbox and switch have different patterns (buttons[0] on xbox is confirm, but switch uses buttons[1])...let either flip
// buttons[3] is "play audio"
// buttons[4] is "wrong answer"
// buttons[5] is "right answer"
//
// we make a simple state machine with this array: we wait for a button to be pushed and then lifted
// and then fire the corresponding event (kinda like keyup on keyboard)
// why doesn't gamepad give you this interface instead of forcing you to poll?
let priorButtonStates = [
    /*flip card*/false,
    /*flip card*/false,
    /*this null corresponds to a button not mapped to any function at the moment*/null,
    /*play audio*/false,
    /*mark answer wrong*/false,
    /*mark answer right*/false
];
let gamePadEnabled = false;
function runGamePadLoop() {
    const gamepads = navigator.getGamepads();
    if (!gamepads) {
        return;
    }
    // only allow the first controller to control the flashcard interface
    const gamepad = gamepads.find(x => x != null);
    if (!gamepad) {
        return;
    }

    const buttons = gamepad.buttons;
    [0, 1, 3, 4, 5].forEach(x => {
        if (priorButtonStates[x] && !buttons[x].pressed) {
            document.dispatchEvent(new CustomEvent(`gamepadButtonUp`, { detail: { gamePadButton: x } }));
            priorButtonStates[x] = false;
        }
        if (isOnlyThisGamepadButtonPushed(buttons, x)) {
            if (!priorButtonStates[x]) {
                document.dispatchEvent(new CustomEvent(`gamepadButtonDown`, { detail: { gamePadButton: x } }));
            }
            priorButtonStates[x] = true;
        }
    });

    gamePadAnimationFrame = requestAnimationFrame(runGamePadLoop);
}
function stopGamePadLoop() {
    cancelAnimationFrame(gamePadAnimationFrame);
}

let initialize = function () {
    showAnswerButton.addEventListener('click', flip);
    wrongButton.addEventListener('click', markIncorrect);
    rightButton.addEventListener('click', markCorrect);
    deleteCardButton.addEventListener('click', function () {
        let deletedKey = currentKey;
        removeFromStudyList(deletedKey);
        //use deletedKey rather than currentKey since saveStudyList can end up modifying what we have
        //same with addDeletedKey
        saveStudyList([deletedKey]);
        setupStudyMode();
    });
    exportStudyListButton.addEventListener('click', function () {
        let studyList = getStudyList();
        let content = "data:text/plain;charset=utf-8,";
        for (const [key, value] of Object.entries(studyList)) {
            // TODO: figure out cloze/recall exports
            if (!value.type || value.type === cardTypes.RECOGNITION) {
                //replace is a hack for flashcard field separator...TODO could escape
                content += [key.replace(';', ''), value.en.replace(';', '')].join(';');
                content += '\n';
            }
        }
        //wow, surely it can't be this absurd
        let encodedUri = encodeURI(content);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "hanzi-graph-export-" + Date.now() + ".txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    if (Object.keys(getStudyList() || {}).length > 0) {
        exportStudyListButton.removeAttribute('style');
    }
    //TODO: may want to consider separate callback types for add/delete and also updated
    registerCallback(dataTypes.studyList, function (studyList) {
        if (studyList && Object.keys(studyList).length > 0) {
            exportStudyListButton.removeAttribute('style');
        } else {
            exportStudyListButton.style.display = 'none';
        }
        setupStudyMode();
    });
    registerStateChangeCallback(stateKeys.study, 'activate', function () {
        studyModeActive = true;
        setupKeyboardShortcutEvents();
        if (gamePadEnabled) {
            runGamePadLoop();
        }
    });
    registerStateChangeCallback(stateKeys.study, 'deactivate', function () {
        studyModeActive = false;
        stopKeyboardShortcutEvents();
        stopGamePadLoop();
    });
    studyContainer.addEventListener('shown', function () {
        setupStudyMode();
    });
    if (localStorage.getItem('hideStudyInfo')) {
        explanationContainer.style.display = 'none';
    }
    explanationHideButton.addEventListener('click', function () {
        explanationContainer.addEventListener('animationend', function () {
            explanationContainer.style.display = 'none';
            explanationContainer.classList.remove('fade');
        });
        explanationContainer.classList.add('fade');
        localStorage.setItem('hideStudyInfo', 'true');
    });

    window.addEventListener('gamepadconnected', function () {
        gamePadEnabled = true;
        if (studyModeActive) {
            runGamePadLoop();
        }
    });
    window.addEventListener('gamepaddisconnected', function () {
        gamePadEnabled = false;
        stopGamePadLoop();
    });
};

export { initialize }