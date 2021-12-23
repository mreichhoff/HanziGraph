import { getDatabase, update, ref, onValue, increment, get, child } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { makeSentenceNavigable, addTextToSpeech } from "./base.js";
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
    if (window.user) {
        const db = getDatabase();
        const resultRef = ref(db, 'users/' + user.uid + '/results/zh-CN/');
        let updates = {};
        //using client side date since offline mode is possible (which means a batch could come in well after it happened),
        //plus I prefer the user's perception of the time to win out, and their machine being incorrect should be rare
        updates['hourly/' + (hour + '/' + result)] = increment(1);
        updates['daily/' + (day + '/' + result)] = increment(1);

        update(resultRef, updates);
    } else {
        localStorage.setItem('studyResults', JSON.stringify(studyResults));
    }
};

let addDeletedKey = function (key) {
    //if there's no user, the key will have been pulled out of localStorage; no further action
    //if there is a user, write this key to the set of deleted keys, and let the corresponding
    //update handler clear the key on any other devices
    if (window.user) {
        const db = getDatabase();
        const flashcardRef = ref(db, 'users/' + user.uid + '/deleted/zh-CN');
        let updates = {};
        updates[sanitizeKey(key)] = true;
        update(flashcardRef, updates);
    }
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
    delete studyList[currentKey];
    addDeletedKey(currentKey);
    saveStudyList([currentKey]);
    setupStudyMode();
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

let auth = getAuth();

let sanitizeKey = function (key) {
    return key.replaceAll('.', '。').replaceAll('#', '').replaceAll('$', 'USD').replaceAll('/', '').replaceAll('[', '').replaceAll(']', '');
};

let saveStudyList = function (keys, localStudyList) {
    if (window.user) {
        localStudyList = localStudyList || studyList;
        const db = getDatabase();
        const flashcardRef = ref(db, 'users/' + user.uid + '/decks/zh-CN');
        let updates = {};
        for (let i = 0; i < keys.length; i++) {
            //setting to null will delete if not present
            updates[sanitizeKey(keys[i])] = localStudyList[keys[i]] || null;
        }
        update(flashcardRef, updates).then(() => {
            //regardless of how we ended up here, the localStorage part has been incorporated, so clear it out
            localStorage.removeItem('studyList');
        });
    } else {
        localStorage.setItem('studyList', JSON.stringify(window.studyList));
    }
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

let studyResultsLastUpdated = null;
document.getElementById('stats-show').addEventListener('click', function () {
    createCardGraphs(studyList);
    if (window.user && (!studyResultsLastUpdated || (Date.now() - studyResultsLastUpdated) >= (60 * 60 * 1000))) {
        //potentially could still get in here twice, but not super concerned about an extra read or two in rare cases
        studyResultsLastUpdated = Date.now();
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${user.uid}/results/zh-CN`)).then((snapshot) => {
            studyResults = snapshot.val() || studyResults;
            createStudyResultGraphs(studyResults);
        }).catch((error) => {
            studyResultsLastUpdated = null;
            console.error(error);
        });
    } else {
        createStudyResultGraphs(studyResults);
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        const db = getDatabase();
        const flashcardRef = ref(db, 'users/' + user.uid + '/decks/zh-CN');
        onValue(flashcardRef, (snapshot) => {
            const data = snapshot.val();
            let localStudyList = JSON.parse(localStorage.getItem('studyList')) || {};
            if (Object.keys(localStudyList).length > 0) {
                let updates = [];
                for (const key in localStudyList) {
                    if (!data || !data[key] ||
                        (data[key].rightCount + data[key].wrongCount) <
                        (localStudyList[key].rightCount + localStudyList[key].wrongCount)) {
                        updates.push(key);
                    }
                }
                if (updates.length > 0) {
                    saveStudyList(updates, localStudyList);
                    //break out and let the save re-trigger this
                    return;
                }
            }
            if (data) {
                mergeStudyLists(window.studyList, data);
                setupStudyMode();
            }
        });
        const deletedFlashcardRef = ref(db, 'users/' + user.uid + '/deleted/zh-CN');
        onValue(deletedFlashcardRef, (snapshot) => {
            const data = snapshot.val() || {};
            for (const key in data) {
                if (window.studyList[key]) {
                    delete window.studyList[key];
                }
            }
            setupStudyMode();
        });
    }
});

export { setupStudyMode, saveStudyList, addCards, inStudyList };