import { getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, collection, writeBatch, increment, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const dataTypes = {
    studyList: 'studyList',
    studyResults: 'studyResults'
};
let callbacks = {
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
const MAX_CLOZE = 1;
const MAX_BATCH_SIZE = 500;

// TODO: get rid of all localStorage use. Switch to indexedDB instead.
// fortunately, any signed-in user would use firestore for this, which
// does use indexedDB.
let studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');

let authenticatedUser = null;

let getStudyResults = function () {
    return studyResults;
};

let registerCallback = function (dataType, callback) {
    callbacks[dataType].push(callback);
};

let saveStudyList = function (keys, localStudyList) {
    if (authenticatedUser) {
        localStudyList = localStudyList || studyList;
        const db = getFirestore();
        let batch = writeBatch(db);
        let count = 0;
        for (let i = 0; i < keys.length; i++) {
            //setting to null will delete if not present
            const sanitizedKey = sanitizeKey(keys[i]);
            count++;
            if (localStudyList[keys[i]]) {
                batch.set(doc(db, `users/${authenticatedUser.uid}/studyList/${sanitizedKey}`), localStudyList[keys[i]], { merge: true });
            } else {
                batch.delete(doc(db, `users/${authenticatedUser.uid}/studyList/${sanitizedKey}`));
            }
            if (count == MAX_BATCH_SIZE) {
                // TODO: any need to react to batch successes?
                batch.commit();
                batch = writeBatch(db);
                count = 0;
            }
        }
        if (keys && keys.length > 0) {
            batch.commit().then(() => {
                localStorage.removeItem('studyList');
            });
        } else {
            // if we've been asked to save the study list, but there's no updated keys,
            // and there's an authenticated user, clear the localStorage copy.
            // It would be re-added if there's an error writing to firestore.
            localStorage.removeItem('studyList');
        }
    } else {
        localStorage.setItem('studyList', JSON.stringify(studyList));
    }
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
let addRecallCards = function (newCards, text, newKeys, languageKey) {
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
                language: languageKey || 'zh-CN',
                added: Date.now()
            };
        }
    }
};
// TODO: may be better combined with addRecallCards...
let addClozeCards = function (newCards, text, newKeys, languageKey) {
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
                language: languageKey || 'zh-CN',
                added: Date.now()
            };
        }
    }
};
let addCards = function (currentExamples, text, languageKey) {
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
                language: languageKey || 'zh-CN',
                added: Date.now()
            };
        }
    }
    // TODO: just not finding these useful. Make user prefs for them? Or just get rid of them...
    // addRecallCards(newCards, text, newKeys, languageKey);
    addClozeCards(newCards, text, newKeys, languageKey);
    //TODO: remove these keys from /deleted/ to allow re-add
    //update it whenever it changes
    saveStudyList(newKeys, null, true);
    callbacks[dataTypes.studyList].forEach(x => x(studyList));
};

let inStudyList = function (text) {
    return studyList[text];
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
    saveStudyList([key]);
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
        const db = getFirestore();
        const batch = writeBatch(db);
        const objectToMerge = {};
        objectToMerge[result] = increment(1);
        batch.set(doc(db, `users/${authenticatedUser.uid}/hourly/${hour}`), objectToMerge, { merge: true });
        batch.set(doc(db, `users/${authenticatedUser.uid}/daily/${day}`), objectToMerge, { merge: true });
        batch.commit().then(() => {
            localStorage.removeItem('studyResults');
        });
    } else {
        localStorage.setItem('studyResults', JSON.stringify(studyResults));
    }
    callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
};

let sanitizeKey = function (key) {
    return key.replaceAll('.', '。').replaceAll('#', '').replaceAll('$', 'USD').replaceAll('/', '').replaceAll('[', '').replaceAll(']', '');
};
let overwriteHourlyResultKeys = function (keys) {
    const db = getFirestore();
    const batch = writeBatch(db);
    for (let i = 0; i < keys.length; i++) {
        batch.set(doc(db, `users/${authenticatedUser.uid}/hourly/${sanitizeKey(keys[i])}`), studyResults.hourly[keys[i]], { merge: true });
    }
    batch.commit().then(() => {
        localStorage.removeItem('studyResults');
    })
};
let overwriteDailyResultKeys = function (keys) {
    const db = getFirestore();
    const batch = writeBatch(db);
    for (let i = 0; i < keys.length; i++) {
        batch.set(doc(db, `users/${authenticatedUser.uid}/daily/${sanitizeKey(keys[i])}`), studyResults.daily[keys[i]], { merge: true });
    }
    batch.commit().then(() => {
        localStorage.removeItem('studyResults');
    });
};

let getResultCount = function (results) {
    //defensive check
    return (results[studyResult.CORRECT] || 0) + (results[studyResult.INCORRECT] || 0);
}
let initialize = function () {
    let auth = getAuth();
    const app = getApp();
    initializeFirestore(app,
        {
            localCache:
                persistentLocalCache(/*settings*/{})
        });

    // TODO cancel callback?
    onAuthStateChanged(auth, (user) => {
        if (user) {
            authenticatedUser = user;
            //TODO get study results here, too
            const db = getFirestore();

            let localStudyList = JSON.parse(localStorage.getItem('studyList'));
            let localStudyResults = JSON.parse(localStorage.getItem('studyResults'));
            //TODO: these are all horribly repetitive and overengineered
            onSnapshot(collection(db, `users/${authenticatedUser.uid}/studyList`), { includeMetadataChanges: true }, (doc) => {
                // if hasPendingWrites is true, we're getting a notification for our own write; ignore
                // unless it's fromCache, possibly indicating offline updates
                // TODO: is this or clause effectively just making this always get entered?
                // should be ok if so, since localStudyList gets nulled out and so we'd just
                // find no changes and call it a day (and updates in that case are small).
                if (!doc.metadata.hasPendingWrites || doc.metadata.fromCache) {
                    let madeUpdates = false;
                    let serverStudyList = {};
                    let deletedKeys = [];
                    for (const item of doc.docChanges()) {
                        if (item.type === 'added' || item.type === 'modified') {
                            serverStudyList[item.doc.id] = item.doc.data();
                        } else if (item.type === 'removed') {
                            deletedKeys.push(item.doc.id);
                        }
                    }
                    // TODO: ensure sanitizeKey() isn't a server-only concept
                    //merge local with server:
                    //  if studylist not dirty, use server copy
                    //     the entire snapshot is only sent the first time,
                    //       so only use those keys present in the server copy
                    //     loop through deleted keys, remove from local copy, madeUpdates=true
                    //  if studylist dirty, find differing keys:
                    //     if local key not present on server or in deletedKeys, local stays the same, write local to server
                    //         the entire snapshot is only sent the first time, so only do this if first load
                    //     if server key not present in local, keep server, no write
                    //         what if user goes offline, deletes something, server doesn't see it?
                    //         must keep dirty deleted keys
                    //     if both present, keep whichever copy has been studied more
                    //         if the chosen copy is local, write local to server
                    //
                    // note that this would be far simpler with a log of study events that would be used to determine due, etc.
                    // TODO: do that, maybe?
                    //
                    // per https://stackoverflow.com/a/51084236:
                    // firestore also just overwrites with the latest write in its offline mode, which would break this
                    // (though the worst case seems to be losing the study count + due date, so not catastrophic,
                    // and anyway if you were studying a ton while offline, why shouldn't those count?)
                    // the main case where this algorithm would be used would be when a user is not signed in, studies, then signs in
                    // or similar.
                    if (!localStudyList || Object.keys(localStudyList).length < 1) {
                        for (const [key, value] of Object.entries(serverStudyList)) {
                            if (!studyList[key] || studyList[key].due !== value.due) {
                                studyList[key] = value;
                                madeUpdates = true;
                            }
                        }
                        for (const deletedKey of deletedKeys) {
                            delete studyList[deletedKey];
                            madeUpdates = true;
                        }
                    } else {
                        for (const deletedKey of deletedKeys) {
                            delete studyList[deletedKey];
                            madeUpdates = true;
                        }
                        let updatedKeys = [];
                        for (const [key, value] of Object.entries(serverStudyList)) {
                            const localCard = localStudyList[key];
                            if (localCard && ((localCard.rightCount + localCard.wrongCount) > (value.rightCount + value.wrongCount))) {
                                updatedKeys.push(key);
                            } else {
                                studyList[key] = value;
                                madeUpdates = true;
                            }
                        }
                        if (localStudyList) {
                            for (const localKey of Object.keys(localStudyList)) {
                                if (!serverStudyList[localKey]) {
                                    updatedKeys.push(localKey);
                                }
                            }
                            localStudyList = null;
                        }
                        saveStudyList(updatedKeys);
                    }

                    if (madeUpdates) {
                        callbacks[dataTypes.studyList].forEach(x => x(studyList));
                    }
                }
            });
            // TODO: combine hourly and daily
            onSnapshot(collection(db, `users/${authenticatedUser.uid}/hourly`), { includeMetadataChanges: true }, (doc) => {
                if (!doc.metadata.hasPendingWrites || doc.metadata.fromCache) {
                    let serverHourly = {};
                    for (const item of doc.docChanges()) {
                        // no support for deleting results, currently
                        if (item.type === 'added' || item.type === 'modified') {
                            serverHourly[item.doc.id] = item.doc.data();
                        }
                    }
                    if (localStudyResults && localStudyResults.hourly && Object.keys(localStudyResults.hourly).length > 0) {
                        //we wrote something the server didn't see.
                        let updatedKeys = [];
                        for (const [key, value] of Object.entries(localStudyResults.hourly)) {
                            if (!serverHourly[key] || getResultCount(serverHourly[key]) < getResultCount(value)) {
                                // we have something the server doesn't know about
                                if (value) {
                                    updatedKeys.push(key);
                                }
                            }
                        }
                        // whether first load or not, take the server's value if we can
                        // or overwrite if local is larger
                        for (const [key, value] of Object.entries(serverHourly)) {
                            if (!localStudyResults.hourly[key] || getResultCount(localStudyResults.hourly[key]) <= getResultCount(value)) {
                                studyResults.hourly[key] = value;
                            } else {
                                //key is in results, and its value is strictly greater than the server sent
                                updatedKeys.push(key);
                            }
                        }
                        delete localStudyResults["hourly"];
                        overwriteHourlyResultKeys(updatedKeys);
                    } else {
                        // we have no updates; server wins
                        for (const [key, value] of Object.entries(serverHourly)) {
                            studyResults.hourly[key] = value;
                        }
                    }
                }
            });
            onSnapshot(collection(db, `users/${authenticatedUser.uid}/daily`), { includeMetadataChanges: true }, (doc) => {
                if (!doc.metadata.hasPendingWrites || doc.metadata.fromCache) {
                    let serverDaily = {};
                    for (const item of doc.docChanges()) {
                        // no support for deleting results, currently
                        if (item.type === 'added' || item.type === 'modified') {
                            serverDaily[item.doc.id] = item.doc.data();
                        }
                    }
                    if (localStudyResults && localStudyResults.daily && Object.keys(localStudyResults.daily).length > 0) {
                        //we wrote something the server didn't see.
                        let updatedKeys = [];
                        for (const [key, value] of Object.entries(localStudyResults.daily)) {
                            if (!serverDaily[key] || getResultCount(serverDaily[key]) < getResultCount(value)) {
                                // we have something the server doesn't know about
                                updatedKeys.push(key);
                            }
                        }
                        // whether first load or not, take the server's value if we can
                        // or overwrite if local is larger
                        for (const [key, value] of Object.entries(serverDaily)) {
                            if (!localStudyResults.daily[key] || getResultCount(localStudyResults.daily[key]) <= getResultCount(value)) {
                                studyResults.daily[key] = value;
                            } else {
                                //key is in results, and its value is strictly greater than the server sent
                                updatedKeys.push(key);
                            }
                        }
                        delete localStudyResults["daily"];
                        overwriteDailyResultKeys(updatedKeys);
                    } else {
                        // we have no updates; server wins
                        for (const [key, value] of Object.entries(serverDaily)) {
                            studyResults.daily[key] = value;
                        }
                    }
                }
            });
        }
    });
};

let readOptionState = function () {
    return JSON.parse(localStorage.getItem('options'));
};
let writeOptionState = function (showPinyin, selectedCharacterSet) {
    localStorage.setItem('options', JSON.stringify({
        transcriptions: showPinyin,
        selectedCharacterSet: selectedCharacterSet
    }));
};

let readExploreState = function () {
    return JSON.parse(localStorage.getItem('exploreState'));
};
let writeExploreState = function (words) {
    localStorage.setItem('exploreState', JSON.stringify({
        words: words
    }));
}

export { writeExploreState, readExploreState, writeOptionState, readOptionState, registerCallback, saveStudyList, addCards, inStudyList, getStudyList, removeFromStudyList, findOtherCards, updateCard, recordEvent, getStudyResults, initialize, studyResult, dataTypes, cardTypes }
