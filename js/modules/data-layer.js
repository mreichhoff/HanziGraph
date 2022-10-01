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
const MAX_BATCH_SIZE = 500;

let studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');
let visited = JSON.parse(localStorage.getItem('visited') || '{}');

let firstStudyListLoad = true;
let firstVisitedLoad = true;
let firstDailyResultsLoad = true;
let firstHourlyResultsLoad = true;

let authenticatedUser = null;

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
    localStorage.setItem('visited', JSON.stringify(visited));
    callbacks[dataTypes.visited].forEach(x => x(visited));
};

let registerCallback = function (dataType, callback) {
    callbacks[dataType].push(callback);
};

let saveStudyList = function (keys, localStudyList) {
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
    //fix up any potential missing properties
    if (!studyResults.hourly[hour][result]) {
        studyResults.hourly[hour][result] = 0;
    }
    studyResults.hourly[hour][result]++;
    if (!studyResults.daily[day]) {
        studyResults.daily[day] = {};
        studyResults.daily[day][studyResult.CORRECT] = 0;
        studyResults.daily[day][studyResult.INCORRECT] = 0;
    }
    if (!studyResults.daily[day][result]) {
        studyResults.daily[day][result] = 0;
    }
    studyResults.daily[day][result]++;
    localStorage.setItem('studyResults', JSON.stringify(studyResults));
    callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
};

let initialize = function () { };

export { getVisited, updateVisited, registerCallback, saveStudyList, addCards, inStudyList, getCardPerformance, getStudyList, removeFromStudyList, findOtherCards, updateCard, recordEvent, getStudyResults, initialize, studyResult, dataTypes, cardTypes }