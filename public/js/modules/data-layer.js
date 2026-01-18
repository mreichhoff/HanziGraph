import { getApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, collection, writeBatch, increment, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
// normally we avoid * imports, but the local AI functions use the same names
// as some in this file for convenience, so we avoid collisions this way.
import * as localAi from './local-ai.js';
import * as anki from './anki.js';

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

let studyListCharacters = new Set();
let studyListWords = new Set();
// TODO: get rid of all localStorage use. Switch to indexedDB instead.
// fortunately, any signed-in user would use firestore for this, which
// does use indexedDB.
let studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
initVocabSets();

let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');

let authenticatedUser = null;
let aiEligible = false;

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

// Sync all cards to Anki
async function syncToAnki() {
    if (!anki.isAnkiEnabled()) {
        return { success: false, error: 'Anki is not enabled' };
    }

    const results = {
        added: 0,
        updated: 0,
        failed: 0,
        errors: []
    };

    for (const [key, card] of Object.entries(studyList)) {
        try {
            const result = await anki.syncCard(key, card);
            if (result.added) {
                results.added++;
            } else if (result.updated) {
                results.updated++;
            }
        } catch (error) {
            results.failed++;
            results.errors.push({ key, error: error.message });
        }
    }

    return { success: true, results };
}

// Load study list from Anki (import from Anki)
async function loadFromAnki() {
    if (!anki.isAnkiEnabled()) {
        return { success: false, error: 'Anki is not enabled' };
    }

    try {
        const ankiCards = await anki.getAllCards();
        const cardsToImport = {};
        const cardsToTokenize = {};

        // First pass: identify cards to import and collect their Chinese text
        for (const [key, ankiCard] of Object.entries(ankiCards)) {
            if (!studyList[key]) {
                cardsToImport[key] = ankiCard;
                cardsToTokenize[key] = key; // key is the Chinese text
            }
        }

        if (Object.keys(cardsToImport).length === 0) {
            return { success: true, imported: 0 };
        }

        // Request re-tokenization from the search worker
        const tokenizedResults = await new Promise((resolve) => {
            document.dispatchEvent(new CustomEvent('request-retokenize-cards', {
                detail: { cards: cardsToTokenize, resolve }
            }));
        });

        // Second pass: create cards with proper tokenization
        let imported = 0;
        for (const [key, ankiCard] of Object.entries(cardsToImport)) {
            const tokenizedZh = tokenizedResults[key] || ankiCard.zh || [];
            studyList[key] = {
                en: ankiCard.en || '',
                zh: tokenizedZh.map(x => x.ignore ? x.word : x),
                pinyin: ankiCard.pinyin || '',
                due: Date.now(),
                streak: ankiCard.streak || 0,
                ease: ankiCard.ease || 2.5,
                interval: ankiCard.interval || 0,
                lastReviewTimestamp: ankiCard.lastReviewTimestamp || Date.now(),
                wrongCount: ankiCard.wrongCount || 0,
                rightCount: ankiCard.rightCount || 0,
                type: ankiCard.type || cardTypes.RECOGNITION,
                vocabOrigin: ankiCard.vocabOrigin || '',
                language: ankiCard.language || 'zh-CN',
                added: ankiCard.added || Date.now()
            };
            imported++;
        }

        initVocabSets();
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
        saveStudyList(Object.keys(cardsToImport));

        return { success: true, imported };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

let updateCard = function (result, key) {
    let card = studyList[key];
    // fix up any old data from before adopting SM2
    if (card.ease === null || card.ease === undefined) {
        card.ease = 2.5;
    }
    if (card.interval === null || card.interval === undefined) {
        card.interval = card.nextJump || 0;
    }
    if (card.streak === null || card.streak === undefined) {
        // the old basic geometric algorithm was just nextJump *= 2 for each correct answer
        // and reset to 0 otherwise. It could also be 0.5 because I'm a dufus, so add 1 for fun.
        card.streak = card.nextJump ? (1 + (Math.log(card.nextJump) / Math.log(2))) : 0;
    }
    card.lastReviewTimestamp = Date.now();
    const score = (result === studyResult.CORRECT) ? 5 : 1;
    if (result === studyResult.INCORRECT) {
        card.streak = 0;
        card.interval = 0;
        card.wrongCount++;
    } else {
        if (card.streak === 0) {
            card.interval = 1;
        } else if (card.streak === 1) {
            card.interval = 3;
        } else {
            card.interval = Math.round(card.interval * card.ease);
        }
        card.streak++;
        card.rightCount++;
    }
    card.ease = Math.max((card.ease + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02))), 1.3);
    // keep setting due for compatibility with old clients and data
    card.due = card.lastReviewTimestamp + (card.interval * 24 * 60 * 60 * 1000);
    saveStudyList([key]);

    // Sync updated card to Anki if enabled
    if (anki.isAnkiEnabled()) {
        anki.syncCard(key, card).catch(err => {
            console.error('Failed to sync updated card to Anki:', err);
        });
    }
};
let addRecallCards = function (newCards, text, newKeys, languageKey) {
    let total = Math.min(MAX_RECALL, newCards.length);
    for (let i = 0; i < total; i++) {
        let key = newCards[i].zh.join('') + cardTypes.RECALL;
        if (!studyList[key] && newCards[i].en) {
            newKeys.push(key);
            studyList[key] = {
                en: newCards[i].en,
                zh: newCards[i].zh,
                // data for SM2
                streak: 0,
                ease: 2.5,
                interval: 0,
                lastReviewTimestamp: Date.now(),
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

// TODO: reinstate cloze (and maybe recall?) as another button in the sentence menu
// should also consolidate the various addCard functions that roughly do the same
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
                zh: newCards[i].zh,
                // data for SM2
                streak: 0,
                ease: 2.5,
                interval: 0,
                lastReviewTimestamp: Date.now(),
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

function updateVocabWithSentence(tokenizedSentence) {
    if (!Array.isArray(tokenizedSentence)) {
        return;
    }
    for (const word of tokenizedSentence) {
        if (typeof word !== 'string' || !word) {
            continue;
        }
        studyListWords.add(word);
        for (const character of word) {
            studyListCharacters.add(character);
        }
    }
}

function addCard(example, text, languageKey) {
    let zhJoined = example.zh.join('');
    if (zhJoined in studyList) {
        // no-op...user already made this card. Shouldn't happen, but in case
        // we receive an update from firestore between menu render and button click
        return;
    }
    const newKeys = [zhJoined];
    const newCard = {
        en: example.en,
        zh: example.zh,
        due: Date.now(),
        // data for SM2
        streak: 0,
        ease: 2.5,
        interval: 0,
        lastReviewTimestamp: Date.now(),
        wrongCount: 0,
        rightCount: 0,
        type: cardTypes.RECOGNITION,
        vocabOrigin: text,
        language: languageKey || 'zh-CN',
        added: Date.now()
    };
    studyList[zhJoined] = newCard;
    saveStudyList(newKeys, null, true);
    updateVocabWithSentence(example.zh);

    // Sync to Anki if enabled
    if (anki.isAnkiEnabled()) {
        anki.syncCard(zhJoined, newCard).catch(err => {
            console.error('Failed to sync new card to Anki:', err);
        });
    }

    callbacks[dataTypes.studyList].forEach(x => x(studyList));
}

let inStudyList = function (text) {
    return studyList[text];
};

let getStudyList = function () {
    return studyList;
}
function isFlashCardUser() {
    return studyList && Object.keys(studyList).length > 0;
}
let findOtherCards = function (seeking, currentKey) {
    let cards = Object.keys(studyList);
    let candidates = cards.filter(x => x !== currentKey && (!studyList[x].type || studyList[x].type === cardTypes.RECOGNITION) && x.includes(seeking)).sort((a, b) => studyList[b].rightCount - studyList[a].rightCount);
    return candidates;
};

function getWordsWithoutCards(tokenizedSentence) {
    const uniqueWords = new Set();
    for (const word of tokenizedSentence) {
        if (!studyListWords.has(word)) {
            uniqueWords.add(word);
        }
    }
    return uniqueWords;
}

function initVocabSets() {
    studyListCharacters.clear();
    studyListWords.clear();
    for (const card of Object.values(studyList)) {
        updateVocabWithSentence(card.zh);
    }
}

function hasCardWithWord(word) {
    if (word.length === 1) {
        return studyListCharacters.has(word);
    }
    return studyListWords.has(word);
}

let removeFromStudyList = function (key) {
    const cardToRemove = studyList[key];
    delete studyList[key];
    // could keep some mapping of cards to vocab they provide, but deletions are rare enough I'd rather not deal with it
    initVocabSets();
    callbacks[dataTypes.studyList].forEach(x => x(studyList));
    saveStudyList([key]);

    // Remove from Anki if enabled
    if (anki.isAnkiEnabled() && cardToRemove) {
        anki.removeCard(cardToRemove).catch(err => {
            console.error('Failed to remove card from Anki:', err);
        });
    }
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
                    let mustResetVocab = false;
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
                                if (!studyList[key] && value.zh) {
                                    updateVocabWithSentence(value.zh);
                                }
                                studyList[key] = value;
                                madeUpdates = true;
                            }
                        }
                        for (const deletedKey of deletedKeys) {
                            delete studyList[deletedKey];
                            madeUpdates = true;
                            mustResetVocab = true;
                        }
                    } else {
                        for (const deletedKey of deletedKeys) {
                            delete studyList[deletedKey];
                            madeUpdates = true;
                            mustResetVocab = true;
                        }
                        let updatedKeys = [];
                        for (const [key, value] of Object.entries(serverStudyList)) {
                            const localCard = localStudyList[key];
                            if (localCard && ((localCard.rightCount + localCard.wrongCount) > (value.rightCount + value.wrongCount))) {
                                updatedKeys.push(key);
                            } else {
                                if (!studyList[key] && value.zh) {
                                    updateVocabWithSentence(value.zh);
                                }
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
                        if (mustResetVocab) {
                            initVocabSets();
                        }
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

            // users have permission to read their own doc in permissions, but not to write it.
            onSnapshot(doc(db, `permissions/${authenticatedUser.uid}`), doc => {
                aiEligible = (doc && doc.get('ai') === true);
                document.dispatchEvent(new CustomEvent('ai-eligibility-changed', { detail: aiEligible }));
            })
        } else {
            // no signed in user means no AI features.
            aiEligible = false;
            document.dispatchEvent(new CustomEvent('ai-eligibility-changed', { detail: aiEligible }));
        }
    });

    // Anki sync event listeners
    document.addEventListener('request-anki-sync', async () => {
        const result = await syncToAnki();
        document.dispatchEvent(new CustomEvent('anki-sync-complete', { detail: result }));
    });

    document.addEventListener('request-anki-import', async () => {
        const result = await loadFromAnki();
        document.dispatchEvent(new CustomEvent('anki-import-complete', { detail: result }));
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

async function explainChineseSentence(text) {
    if (localAi.isLocalAiEnabled()) {
        return await localAi.explainChineseSentence(text);
    }
    const functions = getFunctions();
    // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    const explainChinese = httpsCallable(functions, 'explainText');
    const result = await explainChinese(text);
    return result;
}

async function translateEnglish(text) {
    let result;
    if (localAi.isLocalAiEnabled()) {
        result = await localAi.translateEnglish(text);
    } else {
        const functions = getFunctions();
        // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
        const explainEnglish = httpsCallable(functions, 'explainEnglishText');
        result = await explainEnglish(text);
    }
    // i know i shouldn't
    result.data['englishTranslation'] = text;
    return result;
}

async function generateChineseSentences(word, definitions) {
    let aiData;
    if (localAi.isLocalAiEnabled()) {
        aiData = await localAi.generateChineseSentences(word, definitions);
    } else {
        const functions = getFunctions();
        // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
        const generateChineseSentencesCall = httpsCallable(functions, 'generateChineseSentences');
        aiData = await generateChineseSentencesCall({ word, definitions });
    }
    // lol, rube goldberg...run this event to trigger search to trigger the worker, which will tokenize the sentences
    // based on the dictionary known by this client (the backend likely should tokenize instead, but I'm lazy and one
    // could imagine old clients wanting to continue using their version of the Chinese dictionary). The tokenization
    // will finish and then resolve the promise (or reject if there's a conflicting request for this same word), and then
    // we can just return the sentences for rendering. The caller of this function need not know it's a giant mess,
    // and we could move tokenization for this call to the backend if needed without changing this interface.
    const tokenizedSentences = await new Promise((resolve, reject) => {
        document.dispatchEvent(new CustomEvent('sentence-generation-response', { detail: { aiData, word, resolve, reject } }));
    });
    return tokenizedSentences;
}

async function analyzeCollocation(collocation) {
    let aiData;
    if (localAi.isLocalAiEnabled()) {
        aiData = await localAi.analyzeCollocation(collocation);
    } else {
        const functions = getFunctions();
        // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
        const analyzeCollocationCall = httpsCallable(functions, 'analyzeCollocation');
        aiData = await analyzeCollocationCall(collocation);
    }
    // same explanation of goofiness as `generateChineseSentences`. In the collocation case, we both generate sentences
    // and get an explanation back. Tokenize the sentences, then return the whole thing.
    const tokenizedSentences = await new Promise((resolve, reject) => {
        document.dispatchEvent(new CustomEvent('sentence-generation-response', { detail: { aiData, collocation, resolve, reject } }));
    });
    // i know i shouldn't
    aiData.data['sentences'] = tokenizedSentences;
    return aiData;
}

function isAiEligible() {
    return aiEligible || localAi.isLocalAiEnabled();
}

async function analyzeImage(base64ImageContents) {
    if (localAi.isLocalAiEnabled()) {
        return await localAi.analyzeImage(base64ImageContents);
    }
    const functions = getFunctions();
    // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    const analyzeImage = httpsCallable(functions, 'analyzeImage');
    const result = await analyzeImage(base64ImageContents);
    return result;
}

async function explainWordInContext(word, sentence) {
    if (localAi.isLocalAiEnabled()) {
        return await localAi.explainWordInContext(word, sentence);
    }
    const functions = getFunctions();
    // connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    const explainWordInContextCall = httpsCallable(functions, 'explainWordInContext');
    const result = await explainWordInContextCall({ word, sentence });
    return result;
}

export { writeExploreState, readExploreState, writeOptionState, readOptionState, registerCallback, saveStudyList, addCard, inStudyList, getWordsWithoutCards, getStudyList, isFlashCardUser, removeFromStudyList, findOtherCards, updateCard, recordEvent, getStudyResults, explainChineseSentence, translateEnglish, analyzeImage, generateChineseSentences, analyzeCollocation, explainWordInContext, isAiEligible, hasCardWithWord, initialize, studyResult, dataTypes, cardTypes, syncToAnki, loadFromAnki }
