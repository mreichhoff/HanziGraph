import { makeSentenceNavigable, addTextToSpeech, getActiveGraph } from "./base.js";
import { createStudyResultGraphs, createCardGraphs } from "./stats.js";

window.studyList = window.studyList || JSON.parse(localStorage.getItem('studyList') || '{}');
let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');

let studyResult = {
    CORRECT: 'correct',
    INCORRECT: 'incorrect'
};
let getISODate = function (date) {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    return (
        date.getFullYear() +
        '-' +
        pad(date.getMonth() + 1) +
        '-' +
        pad(date.getDate()));
};

let getCardCount = function (character) {
    let count = 0;
    //TODO: if performance becomes an issue, we can pre-compute this
    //as-is, it performs fine even with larger flashcard decks
    Object.keys(studyList || {}).forEach(x => {
        if (x.indexOf(character) >= 0) {
            count++;
        }
    });
    return count;
};

let recordEvent = function (date, result) {
    let hour = date.getHours();
    let day = getISODate(date);
    if (!studyResults.hourly[hour]) {
        studyResults.hourly[hour] = {};
        studyResults.hourly[hour][studyResult.CORRECT] = 0;
        studyResults.hourly[hour][studyResult.INCORRECT] = 0;
    }
    //fix up potential response from backend that doesn't include one of correct or incorrect
    //i.e., check above sets it, then we get a response when reading from backend that has the given hour but
    //no correct or incorrect property, which can happen if you get X wrong/right in a row to start an hour
    //we can be confident we'll still have hourly and daily as those are written in the same operation
    //TODO check firebase docs
    if (!studyResults.hourly[hour][result]) {
        studyResults.hourly[hour][result] = 0;
    }
    studyResults.hourly[hour][result]++;
    if (!studyResults.daily[day]) {
        studyResults.daily[day] = {};
        studyResults.daily[day][studyResult.CORRECT] = 0;
        studyResults.daily[day][studyResult.INCORRECT] = 0;
    }
    //fix up potential response from backend that doesn't include one of correct or incorrect
    //i.e., check above sets it, then we get a response when reading from backend that has the given day but
    //no correct or incorrect property, which can happen if you get X wrong/right in a row to start a day
    if (!studyResults.daily[day][result]) {
        studyResults.daily[day][result] = 0;
    }
    studyResults.daily[day][result]++;
    localStorage.setItem('studyResults', JSON.stringify(studyResults));
};

let inStudyList = function (text) {
    return studyList[text];
};

let addCards = function (currentExamples, text) {
    let newCards = currentExamples[text].map((x, i) => ({ ...x, due: Date.now() + i }));
    let newKeys = [];
    for (let i = 0; i < newCards.length; i++) {
        let zhJoined = newCards[i].zh.join('');
        newKeys.push(zhJoined);
        if (!studyList[zhJoined] && newCards[i].en) {
            studyList[zhJoined] = {
                en: newCards[i].en,
                due: newCards[i].due,
                zh: newCards[i].zh,
                wrongCount: 0,
                rightCount: 0,
                added: Date.now()
            };
        }
    }
    //update it whenever it changes
    saveStudyList(newKeys);
    //TODO: remove these keys from /deleted/ to allow re-add
    document.getElementById('exportStudyListButton').removeAttribute('style');
};
let displayRelatedCards = function (anchor) {
    let MAX_RELATED_CARDS = 3;
    let related = findOtherCards(anchor.textContent);
    let relatedCardsContainer = document.getElementById('related-cards-container');
    let relatedCardsElement = document.getElementById('related-cards');
    let relatedCardQueryElement = document.getElementById('related-card-query');
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
        let relatedPerf = document.createElement('p');
        relatedPerf.className = 'related-card-performance';
        relatedPerf.innerText = `(right ${studyList[related[i]].rightCount}, wrong ${studyList[related[i]].wrongCount})`;
        item.appendChild(relatedPerf);
        relatedCardsElement.appendChild(item);
    }
    relatedCardsContainer.removeAttribute('style');
}
let findOtherCards = function (seeking) {
    let cards = Object.keys(studyList);
    let candidates = cards.filter(x => x !== currentKey && x.includes(seeking)).sort((a, b) => studyList[b].rightCount - studyList[a].rightCount);
    return candidates;
}
let currentKey = null;
let setupStudyMode = function () {
    currentKey = null;
    let currentCard = null;
    document.getElementById('card-answer-container').style.display = 'none';
    document.getElementById('show-answer-button').innerText = "Show Answer";
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
    document.getElementById('card-due-count').textContent = counter;
    document.getElementById('card-question-container').innerHTML = '';
    if (counter === 0) {
        document.getElementById('task-complete').style.display = 'inline';
        document.getElementById('task-description').style.display = 'none';
        document.getElementById('show-answer-button').style.display = 'none';
        return;
    } else {
        document.getElementById('task-complete').style.display = 'none';
        document.getElementById('task-description').style.display = 'inline';
        document.getElementById('show-answer-button').style.display = 'block';
    }
    let question = currentCard.zh.join('');
    let aList = makeSentenceNavigable(question, document.getElementById('card-question-container'));
    for (let i = 0; i < aList.length; i++) {
        aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
    }
    addTextToSpeech(document.getElementById('card-question-container'), question, aList);
    document.getElementById('card-answer').textContent = currentCard.en;
    if (currentCard.wrongCount + currentCard.rightCount != 0) {
        document.getElementById('card-old-message').removeAttribute('style');
        document.getElementById('card-new-message').style.display = 'none';
        document.getElementById('card-percentage').textContent = Math.round(100 * currentCard.rightCount / (currentCard.rightCount + currentCard.wrongCount));
        document.getElementById('card-right-count').textContent = `${currentCard.rightCount} time${currentCard.rightCount != 1 ? 's' : ''}`;
        document.getElementById('card-wrong-count').textContent = `${currentCard.wrongCount} time${currentCard.wrongCount != 1 ? 's' : ''}`;
    } else {
        document.getElementById('card-new-message').removeAttribute('style');
        document.getElementById('card-old-message').style.display = 'none';
    }
    document.getElementById('related-cards-container').style.display = 'none';
};
document.getElementById('show-answer-button').addEventListener('click', function () {
    document.getElementById('show-answer-button').innerText = "Answer:";
    document.getElementById('card-answer-container').style.display = 'block';
    document.getElementById('show-answer-button').scrollIntoView();
});
document.getElementById('wrong-button').addEventListener('click', function () {
    let now = new Date();
    studyList[currentKey].nextJump = 0.5;
    studyList[currentKey].wrongCount++;
    studyList[currentKey].due = now.valueOf();
    saveStudyList([currentKey]);
    setupStudyMode();
    document.getElementById('cards-due').scrollIntoView();
    document.getElementById('cards-due').classList.add('result-indicator-wrong');
    setTimeout(function () {
        document.getElementById('cards-due').classList.remove('result-indicator-wrong');
    }, 750);
    recordEvent(now, studyResult.INCORRECT);
});
document.getElementById('right-button').addEventListener('click', function () {
    let now = new Date();
    let nextJump = studyList[currentKey].nextJump || 0.5;
    studyList[currentKey].nextJump = nextJump * 2;
    studyList[currentKey].rightCount++;
    studyList[currentKey].due = now.valueOf() + (nextJump * 24 * 60 * 60 * 1000);
    saveStudyList([currentKey]);
    setupStudyMode();
    document.getElementById('cards-due').scrollIntoView();
    document.getElementById('cards-due').classList.add('result-indicator-right');
    setTimeout(function () {
        document.getElementById('cards-due').classList.remove('result-indicator-right');
    }, 750);
    recordEvent(now, studyResult.CORRECT);
});
document.getElementById('delete-card-button').addEventListener('click', function () {
    let deletedKey = currentKey;
    delete studyList[deletedKey];
    //use deletedKey rather than currentKey since saveStudyList can end up modifying what we have
    //same with addDeletedKey
    saveStudyList([deletedKey]);
    setupStudyMode();
    addDeletedKey(deletedKey);
});

if (Object.keys(studyList).length > 0) {
    document.getElementById('exportStudyListButton').removeAttribute('style');
}
document.getElementById('exportStudyListButton').addEventListener('click', function () {
    let content = "data:text/plain;charset=utf-8,";
    for (const [key, value] of Object.entries(studyList)) {
        //replace is a hack for flashcard field separator...TODO could escape
        content += [key.replace(';', ''), value.en.replace(';', '')].join(';');
        content += '\n';
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

let sanitizeKey = function (key) {
    return key.replaceAll('.', '。').replaceAll('#', '').replaceAll('$', 'USD').replaceAll('/', '').replaceAll('[', '').replaceAll(']', '');
};

//keeping keys/localStudyList for parity with current hacked together firebase version
let saveStudyList = function (keys, localStudyList) {
    localStorage.setItem('studyList', JSON.stringify(window.studyList));
};
let mergeStudyLists = function (baseStudyList, targetStudyList) {
    baseStudyList = baseStudyList || {};
    for (const key in targetStudyList) {
        if (!baseStudyList[key] ||
            (baseStudyList[key].rightCount + baseStudyList[key].wrongCount) <=
            (targetStudyList[key].rightCount + targetStudyList[key].wrongCount)) {
            baseStudyList[key] = targetStudyList[key];
        }
    }
    window.studyList = baseStudyList;
    if (Object.keys(studyList).length > 0) {
        document.getElementById('exportStudyListButton').removeAttribute('style');
    }
};

document.getElementById('stats-show').addEventListener('click', function () {
    //TODO this is dumb...don't actually want two event handlers
    document.getElementById('container').style.display = 'none';
    document.getElementById('stats-container').removeAttribute('style');
    createCardGraphs(studyList, getActiveGraph().legend);
    createStudyResultGraphs(studyResults, getActiveGraph().legend);
});

export { setupStudyMode, saveStudyList, addCards, inStudyList, getCardCount };