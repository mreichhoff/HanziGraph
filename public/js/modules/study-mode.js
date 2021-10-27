import { getDatabase, update, ref, onValue, increment } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { makeSentenceNavigable, addTextToSpeech } from "./base.js";

window.studyList = window.studyList || JSON.parse(localStorage.getItem('studyList') || '{}');

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
    if (window.user) {
        const db = getDatabase();
        const resultRef = ref(db, 'users/' + user.uid + '/results/zh-CN/');
        let updates = {};
        //using client side date since offline mode is possible (which means a batch could come in well after it happened),
        //plus I prefer the user's perception of the time to win out, and their machine being incorrect should be rare
        updates['hourly/' + (date.getHours() + '/' + result)] = increment(1);
        updates['daily/' + (getISODate(date) + '/' + result)] = increment(1);

        update(resultRef, updates);
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
    let newCards = currentExamples[text].map(x => ({ ...x, due: Date.now() }));
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
                rightCount: 0
            };
        }
    }
    //update it whenever it changes
    saveStudyList(newKeys);
    document.getElementById('exportStudyListButton').style.display = 'inline';
};

let currentKey = null;
let setupStudyMode = function () {
    currentKey = null;
    let currentCard = null;
    document.getElementById('card-answer-container').style.display = 'none';
    let counter = 0;
    for (const [key, value] of Object.entries(studyList)) {
        if (value.due <= Date.now()) {
            if (!currentCard || currentCard.due > value.due) {
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
    makeSentenceNavigable(question, document.getElementById('card-question-container'));
    addTextToSpeech(document.getElementById('card-question-container'), question);
    document.getElementById('card-answer').textContent = currentCard.en;
};
document.getElementById('show-answer-button').addEventListener('click', function () {
    document.getElementById('card-answer-container').style.display = 'block';
    document.getElementById('card-answer-container').scrollIntoView();
});
document.getElementById('wrong-button').addEventListener('click', function () {
    let now = new Date();
    studyList[currentKey].nextJump = 0.5;
    studyList[currentKey].wrongCount++;
    studyList[currentKey].due = now.valueOf();
    saveStudyList([currentKey]);
    setupStudyMode();
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
    recordEvent(now, studyResult.CORRECT);
});
document.getElementById('delete-card-button').addEventListener('click', function () {
    delete studyList[currentKey];
    addDeletedKey(currentKey);
    saveStudyList([currentKey]);
    setupStudyMode();
});

document.getElementById('exportStudyListButton').style.display = (Object.keys(studyList).length > 0) ? 'inline' : 'none';
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
    document.getElementById('exportStudyListButton').style.display = (Object.keys(studyList).length > 0) ? 'inline' : 'none';
};

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
            const data = snapshot.val();
            for (const key in data) {
                if (window.studyList[key]) {
                    delete window.studyList[key];
                }
            }
        });
    }
});

export { setupStudyMode, saveStudyList, addCards, inStudyList };