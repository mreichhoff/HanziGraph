import { getDatabase, update, ref, onValue, increment, get, child } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const dataTypes = {
    visited: 'visited',
    studyList: 'studyList',
    studyResults: 'studyResults'
};
let callbacks = {
    visited: [],
    studyList: [],
    studyResults: []
};
const studyResult = {
    CORRECT: 'correct',
    INCORRECT: 'incorrect'
};
const cardTypes = {
    RECOGNITION: 'recognition',
    RECALL: 'recall',
    CLOZE: 'cloze'
};
const MAX_RECALL = 2;
const MAX_CLOZE = 2;

let studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');
let visited = JSON.parse(localStorage.getItem('visited') || '{}');

let authenticatedUser = null;

let studyResultsLastUpdated = null;
let visitedLastUpdated = null;

//TODO
let canUpdateNonCriticalData = function (user, lastUpdate) {
    return (user && (!lastUpdate || (Date.now() - lastUpdate) >= (60 * 60 * 1000)));
}

let getStudyResults = function () {
    return studyResults;
};
let getVisited = function () {
    return visited;
};
//note: nodes will be marked visited when the user searches for or taps a node in the graph
//for now, avoiding marking nodes visited via clicking a hanzi in an example or card
//because in those cases no examples are shown
let updateVisited = function (nodes) {
    for (let i = 0; i < nodes.length; i++) {
        if (!visited[nodes[i]]) {
            visited[nodes[i]] = 0;
        }
        visited[nodes[i]]++;
    }
    if (authenticatedUser) {
        const db = getDatabase();
        const nodeRef = ref(db, 'users/' + authenticatedUser.uid + '/visited/zh-CN/');
        let updates = {};
        for (let i = 0; i < nodes.length; i++) {
            updates[nodes[i]] = increment(1);
        }
        update(nodeRef, updates).then(() => {
            fetchVisited();
            fetchStudyResults();
        }).catch((error) => {
            console.log(error);
        });
    }
    localStorage.setItem('visited', JSON.stringify(visited));
    callbacks[dataTypes.visited].forEach(x => x(visited));
};

let registerCallback = function (dataType, callback) {
    callbacks[dataType].push(callback);
};

//keeping keys/localStudyList for parity with current hacked together firebase version
let saveStudyList = function (keys, localStudyList, isAddition) {
    if (authenticatedUser) {
        localStudyList = localStudyList || studyList;
        const db = getDatabase();
        const nodeRef = ref(db, `users/${authenticatedUser.uid}`);
        let updates = {};
        for (let i = 0; i < keys.length; i++) {
            //setting to null will delete if not present
            updates[`decks/zh-CN/${sanitizeKey(keys[i])}`] = localStudyList[keys[i]] || null;
            if (isAddition) {
                //the user could've previously deleted the card...this addition should win out
                updates[`deleted/zh-CN/${sanitizeKey(keys[i])}`] = null;
            }
        }
        update(nodeRef, updates).then(() => {
            //regardless of how we ended up here, the localStorage part has been incorporated, so clear it out
            localStorage.setItem('studyListDirty', false);
        }).catch(() => {
            localStorage.setItem('studyListDirty', true);
        });
    } else {
        localStorage.setItem('studyListDirty', true);
    }
    localStorage.setItem('studyList', JSON.stringify(studyList));
};
let updateCard = function (result, key) {
    let now = new Date();
    if (result === studyResult.INCORRECT) {
        studyList[key].nextJump = 0.5;
        studyList[key].wrongCount++;
        studyList[key].due = now.valueOf();
    } else {
        let nextJump = studyList[key].nextJump || 0.5;
        studyList[key].nextJump = nextJump * 2;
        studyList[key].rightCount++;
        studyList[key].due = now.valueOf() + (nextJump * 24 * 60 * 60 * 1000);
    }
    saveStudyList([key]);
};
let addRecallCards = function (newCards, text, newKeys) {
    let total = Math.min(MAX_RECALL, newCards.length);
    for (let i = 0; i < total; i++) {
        let key = newCards[i].zh.join('') + cardTypes.RECALL;
        if (!studyList[key] && newCards[i].en) {
            newKeys.push(key);
            studyList[key] = {
                en: newCards[i].en,
                due: Date.now() + newCards.length + i,
                zh: newCards[i].zh,
                wrongCount: 0,
                rightCount: 0,
                type: cardTypes.RECALL,
                vocabOrigin: text,
                added: Date.now()
            };
        }
    }
};
// TODO: may be better combined with addRecallCards...
let addClozeCards = function (newCards, text, newKeys) {
    let added = 0;
    for (let i = 0; i < newCards.length; i++) {
        if (added == MAX_CLOZE) {
            return;
        }
        // don't make cloze cards with the exact text
        if (newCards[i].zh.join('').length <= text.length) {
            continue;
        }
        let key = newCards[i].zh.join('') + cardTypes.CLOZE;
        if (!studyList[key] && newCards[i].en) {
            added++;
            newKeys.push(key);
            studyList[key] = {
                en: newCards[i].en,
                // due after the recognition cards, for some reason
                due: Date.now() + newCards.length + i,
                zh: newCards[i].zh,
                wrongCount: 0,
                rightCount: 0,
                type: cardTypes.CLOZE,
                vocabOrigin: text,
                added: Date.now()
            };
        }
    }
};
let addCards = function (currentExamples, text) {
    let newCards = currentExamples[text].map((x, i) => ({ ...x, due: Date.now() + i }));
    let newKeys = [];
    for (let i = 0; i < newCards.length; i++) {
        let zhJoined = newCards[i].zh.join('');
        if (!studyList[zhJoined] && newCards[i].en) {
            newKeys.push(zhJoined);
            studyList[zhJoined] = {
                en: newCards[i].en,
                due: newCards[i].due,
                zh: newCards[i].zh,
                wrongCount: 0,
                rightCount: 0,
                type: cardTypes.RECOGNITION,
                vocabOrigin: text,
                added: Date.now()
            };
        }
    }
    addRecallCards(newCards, text, newKeys);
    addClozeCards(newCards, text, newKeys);
    //TODO: remove these keys from /deleted/ to allow re-add
    //update it whenever it changes
    saveStudyList(newKeys, null, true);
    callbacks[dataTypes.studyList].forEach(x => x(studyList));
};

let inStudyList = function (text) {
    return studyList[text];
};

let getCardPerformance = function (character) {
    let count = 0;
    let correct = 0;
    let incorrect = 0;
    //TODO: if performance becomes an issue, we can pre-compute this
    //as-is, it performs fine even with larger flashcard decks
    Object.keys(studyList || {}).forEach(x => {
        if (x.indexOf(character) >= 0) {
            count++;
            correct += studyList[x].rightCount;
            incorrect += studyList[x].wrongCount;
        }
    });
    return { count: count, performance: Math.round(100 * correct / ((correct + incorrect) || 1)) };
};

let getStudyList = function () {
    return studyList;
}
let findOtherCards = function (seeking, currentKey) {
    let cards = Object.keys(studyList);
    let candidates = cards.filter(x => x !== currentKey && (!studyList[x].type || studyList[x].type === cardTypes.RECOGNITION) && x.includes(seeking)).sort((a, b) => studyList[b].rightCount - studyList[a].rightCount);
    return candidates;
};

let removeFromStudyList = function (key) {
    delete studyList[key];
    callbacks[dataTypes.studyList].forEach(x => x(studyList));
    addDeletedKey(key);
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

let recordEvent = function (result) {
    let currentDate = new Date();
    let hour = currentDate.getHours();
    let day = getISODate(currentDate);
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

    if (authenticatedUser) {
        const db = getDatabase();
        const resultRef = ref(db, 'users/' + authenticatedUser.uid + '/results/zh-CN/');
        let updates = {};
        //using client side date since offline mode is possible (which means a batch could come in well after it happened),
        //plus I prefer the user's perception of the time to win out, and their machine being incorrect should be rare
        updates['hourly/' + (hour + '/' + result)] = increment(1);
        updates['daily/' + (day + '/' + result)] = increment(1);

        update(resultRef, updates).then(() => {
            fetchStudyResults();
            fetchVisited();
        }).catch((error) => {
            console.log(error);
        });
    }
    localStorage.setItem('studyResults', JSON.stringify(studyResults));
    callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
};

let addDeletedKey = function (key) {
    //if there's no user, the key will have been pulled out of localStorage; no further action
    //if there is a user, write this key to the set of deleted keys, and let the corresponding
    //update handler clear the key on any other devices
    if (authenticatedUser) {
        const db = getDatabase();
        const flashcardRef = ref(db, 'users/' + authenticatedUser.uid + '/deleted/zh-CN');
        let updates = {};
        updates[sanitizeKey(key)] = true;
        update(flashcardRef, updates);
    }
};

let mergeStudyLists = function (baseStudyList, targetStudyList) {
    let madeChanges = false;
    baseStudyList = baseStudyList || {};
    for (const key in targetStudyList) {
        if (!baseStudyList[key] ||
            (baseStudyList[key].rightCount + baseStudyList[key].wrongCount) <
            (targetStudyList[key].rightCount + targetStudyList[key].wrongCount)) {
            madeChanges = true;
            baseStudyList[key] = targetStudyList[key];
        } else if ((baseStudyList[key].rightCount + baseStudyList[key].wrongCount) ===
            (targetStudyList[key].rightCount + targetStudyList[key].wrongCount)) {
            if (targetStudyList[key].due !== baseStudyList[key].due) {
                baseStudyList[key].due = Math.min(baseStudyList[key].due, targetStudyList[key].due);
                madeChanges = true;
            }
        }
    }
    studyList = baseStudyList;
    localStorage.setItem('studyList', JSON.stringify(studyList));
    return madeChanges;
};
let sanitizeKey = function (key) {
    return key.replaceAll('.', '。').replaceAll('#', '').replaceAll('$', 'USD').replaceAll('/', '').replaceAll('[', '').replaceAll(']', '');
};

let fetchStudyResults = function () {
    if (canUpdateNonCriticalData(authenticatedUser, studyResultsLastUpdated)) {
        //potentially could still get in here twice, but not super concerned about an extra read or two in rare cases
        studyResultsLastUpdated = Date.now();
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${authenticatedUser.uid}/results/zh-CN`)).then((snapshot) => {
            studyResults = snapshot.val() || studyResults;
            localStorage.setItem('studyResults', JSON.stringify(studyResults));
            callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
        }).catch((error) => {
            studyResultsLastUpdated = null;
            console.error(error);
        });
    }
}
let fetchVisited = function () {
    if (canUpdateNonCriticalData(authenticatedUser, visitedLastUpdated)) {
        visitedLastUpdated = Date.now();
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${authenticatedUser.uid}/visited/zh-CN`)).then((snapshot) => {
            visited = snapshot.val() || visited;
            localStorage.setItem('visited', JSON.stringify(visited));
            callbacks[dataTypes.visited].forEach(x => x(visited));
        }).catch((error) => {
            visitedLastUpdated = null;
            console.error(error);
        });
    }
}

let initialize = function () {
    let auth = getAuth();
    // TODO cancel callback?
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authenticatedUser = user;
            //TODO get study results here, too
            const db = getDatabase();
            const flashcardRef = ref(db, 'users/' + authenticatedUser.uid + '/decks/zh-CN');
            onValue(flashcardRef, (snapshot) => {
                const data = snapshot.val();
                let studyListDirty = JSON.parse(localStorage.getItem('studyListDirty') || "false");
                if (studyListDirty) {
                    //TODO: it gets reset to true if the write fails, but is this actually the right spot?
                    localStorage.setItem('studyListDirty', false);
                    //TODO: should we use the in-memory studyList variable?
                    //this is an artifact of a prior implementation where it wasn't necessarily loaded
                    //immediately...
                    let localStudyList = JSON.parse(localStorage.getItem('studyList') || '{}');
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
                    if (mergeStudyLists(studyList, data)) {
                        callbacks[dataTypes.studyList].forEach(x => x(studyList));
                    }
                }
            });
            const deletedFlashcardRef = ref(db, 'users/' + authenticatedUser.uid + '/deleted/zh-CN');
            onValue(deletedFlashcardRef, (snapshot) => {
                const data = snapshot.val() || {};
                let madeChanges = false;
                for (const key in data) {
                    if (studyList[key]) {
                        delete studyList[key];
                        madeChanges = true;
                    }
                }
                if (madeChanges) {
                    callbacks[dataTypes.studyList].forEach(x => x(studyList));
                }
            });
            fetchStudyResults();
            fetchVisited();
        }
    });
};

export { getVisited, updateVisited, registerCallback, saveStudyList, addCards, inStudyList, getCardPerformance, getStudyList, removeFromStudyList, findOtherCards, updateCard, recordEvent, getStudyResults, initialize, studyResult, dataTypes, cardTypes }