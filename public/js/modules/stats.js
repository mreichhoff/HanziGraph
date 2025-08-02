import { getStudyResults, getStudyList } from "./data-layer.js";
import { getActiveGraph } from "./options.js";
import { switchToState, stateKeys } from "./ui-orchestrator.js";

const statsContainer = document.getElementById('stats-container');

const statsShow = document.getElementById('stats-link');

const hourlyGraphDetail = document.getElementById('hourly-graph-detail');
const addedCalendarDetail = document.getElementById('added-calendar-detail');
const studyCalendarDetail = document.getElementById('study-calendar-detail');
const studyGraphDetail = document.getElementById('studied-graph-detail');
const statsSummary = document.getElementById('stats-summary');
const modeControl = document.getElementById('mode-control');

let shown = false;

function sameDay(d1, d2) {
    return d1.getUTCFullYear() == d2.getUTCFullYear() &&
        d1.getUTCMonth() == d2.getUTCMonth() &&
        d1.getUTCDate() == d2.getUTCDate();
}
function Calendar(data, {
    id,
    clickHandler = () => { },
    getIntensity = () => { return '' }
} = {}) {
    let now = new Date();
    let root = document.createElement('div');
    root.id = `${id}-calendar`;
    root.className = 'calendar';
    for (let i = 0; i < data[0].date.getUTCDay(); i++) {
        if (i === 0) {
            let monthIndicator = document.createElement('div');
            monthIndicator.style.gridRow = '1';
            monthIndicator.className = 'month-indicator';
            root.appendChild(monthIndicator);
        }
        let currentDay = document.createElement('div');
        currentDay.className = 'calendar-day-dummy';
        currentDay.style.gridRow = `${i + 2}`;
        root.appendChild(currentDay);
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].date.getUTCDay() === 0) {
            let monthIndicator = document.createElement('div');
            monthIndicator.style.gridRow = '1';
            monthIndicator.className = 'month-indicator';
            if (data[i].date.getUTCDate() < 8) {
                monthIndicator.innerText = data[i].date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
            }
            root.appendChild(monthIndicator);
        }
        let currentDay = document.createElement('div');
        if (sameDay(now, data[i].date)) {
            currentDay.id = `${id}-today`;
            currentDay.classList.add('today');
        } else if (now.valueOf() < data[i].date.valueOf()) {
            currentDay.classList.add('future');
        }
        currentDay.style.gridRow = `${data[i].date.getUTCDay() + 2}`;
        //currentDay.style.gridColumn = `${12 - i}`;
        currentDay.classList.add('calendar-day');
        currentDay.classList.add(getIntensity(data[i].total));
        currentDay.addEventListener('click', clickHandler.bind(this, 0, i));
        root.appendChild(currentDay);
    }
    return root;
}
function BarChart(data, {
    labelText = () => { return '' },
    color = () => { return '' },
    clickHandler = () => { },
    includeYLabel = true,
    customClass,
    scaleToFit
} = {}) {
    let root = document.createElement('div');
    root.classList.add('bar-chart');
    if (customClass) {
        root.classList.add(customClass);
    }
    if (includeYLabel) {
        root.style.gridTemplateColumns = `50px repeat(${data.length}, 1fr)`;
        for (let i = 10; i >= 1; i--) {
            let yLabel = document.createElement('div');
            yLabel.style.gridRow = `${100 - (10 * i)}`;
            yLabel.innerText = `${10 * i}% -`;
            yLabel.className = 'bar-chart-y-label';
            root.appendChild(yLabel);
        }
    } else {
        root.style.gridTemplateColumns = `repeat(${data.length}, 1fr)`;
    }
    let scaleMultiplier = 1;
    if (scaleToFit) {
        scaleMultiplier = 100;
        //TODO if you ever get really serious, you could determine the number of rows
        //in the grid for scaling purposes instead of scaling across 100 total
        for (let i = 0; i < data.length; i++) {
            let curr = Math.floor(1 / ((data[i].count || 1) / (data[i].total || 100)));
            scaleMultiplier = Math.min(curr || 1, scaleMultiplier);
        }
    }
    for (let i = 0; i < data.length; i++) {
        let bar = document.createElement('div');
        bar.className = 'bar-chart-bar';
        bar.style.gridColumn = `${i + (includeYLabel ? 2 : 1)}`;
        bar.style.backgroundColor = color(i);
        //how many `|| 1` is too many?
        //you know what, don't answer
        bar.style.gridRow = `${(100 - (Math.floor(100 * (data[i].count * scaleMultiplier) / (data[i].total || 1)) || 1)) || 1} / 101`;
        bar.addEventListener('click', clickHandler.bind(this, i));
        root.appendChild(bar);
    }
    let hr = document.createElement('div');
    hr.style.gridRow = '101';
    //don't try this at home
    hr.style.gridColumn = `${includeYLabel ? 2 : 1}/max`;
    hr.className = 'bar-chart-separator';
    root.appendChild(hr);
    for (let i = 0; i < data.length; i++) {
        let xLabel = document.createElement('div');
        xLabel.className = 'bar-chart-x-label';
        xLabel.style.gridColumn = `${i + (includeYLabel ? 2 : 1)}`;
        xLabel.style.gridRow = '102';
        xLabel.innerText = labelText(i);
        root.appendChild(xLabel);
    }
    return root;
}

//TODO: combine with the one in data-layer.js
let getUTCISODate = function (date) {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    return (
        date.getUTCFullYear() +
        '-' +
        pad(date.getUTCMonth() + 1) +
        '-' +
        pad(date.getUTCDate()));
};
let getLocalISODate = function (date) {
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
let fillGapDays = function (daysWithData, originalData, defaultEntry) {
    let firstDayStudied = daysWithData.length ? daysWithData[0].date : new Date();
    //TODO add trollface ascii art to this insanity
    let today = new Date(getLocalISODate(new Date()));

    //always show at least the last 365 days
    let floorDate = new Date(today.valueOf() - 365 * 24 * 60 * 60 * 1000);
    if (firstDayStudied.valueOf() < floorDate.valueOf()) {
        floorDate = firstDayStudied;
    }

    let start = new Date(getLocalISODate(floorDate));
    let end = new Date(today.valueOf() + (7 * 24 * 60 * 60 * 1000));
    let curr = start.valueOf();
    while (curr <= end.valueOf()) {
        let next = new Date(curr);
        if (!(getUTCISODate(next) in originalData)) {
            daysWithData.push({
                date: next,
                ...defaultEntry
            });
        }
        curr += (24 * 60 * 60 * 1000);
    }
};
let characterBarChartClickHandler = function (detail, totalsByLevel, index, message) {
    detail.innerHTML = '';
    //TODO: why no built-in difference method?
    let missingHanzi = new Set([...totalsByLevel[index + 1].characters].filter(x => !totalsByLevel[index + 1].seen.has(x)));
    [...missingHanzi].slice(0, 10).forEach(x => message += `<span class="emphasized">${x}</span>, `);
    // innerHTML should be safe as the missingHanzi all come from the hanzi variable, which is trusted and acts as an allowlist.
    detail.innerHTML = message.slice(0, -2);
};

let wordBarChartClickHandler = function (detail, totalsByLevel, index, message, ranks) {
    detail.innerHTML = '';
    let start = 0;
    let end = ranks[index];
    if (index !== 0) {
        start = ranks[index - 1];
    }
    let unseenWordsToShow = [];
    for (let i = start; i < end && i < window.freqs.length; i++) {
        if (!totalsByLevel[index + 1].seen.has(window.freqs[i])) {
            unseenWordsToShow.push(window.freqs[i]);
            if (unseenWordsToShow.length > 9) {
                break;
            }
        }
    }
    for (const unseenWord of unseenWordsToShow) {
        message += `<span class="emphasized">${unseenWord}</span>, `;
    }
    message = message.slice(0, -2);
    // innerHTML should be ok since each unseenWord comes from freqs, a trusted input
    detail.innerHTML = message;
}
//could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
let characterTotalsByLevel = {};
let wordTotalsByLevel = {};
let updateTotalsByLevel = function (ranks) {
    characterTotalsByLevel = {};
    Object.keys(hanzi).forEach(x => {
        let level = hanzi[x].node.level;
        if (!(level in characterTotalsByLevel)) {
            characterTotalsByLevel[level] = { seen: new Set(), total: 0, characters: new Set() };
        }
        characterTotalsByLevel[level].total++;
        characterTotalsByLevel[level].characters.add(x);
    });
    wordTotalsByLevel = {};
    if (!ranks) {
        return;
    }
    let priorEnd = 0;
    for (let i = 0; i < ranks.length; i++) {
        wordTotalsByLevel[i + 1] = { seen: new Set(), total: ranks[i] - priorEnd };
        priorEnd = ranks[i];
    }
}
// TODO combine with the equivalent in study-mode.js
function getPerfClass(correctPercentage) {
    if (correctPercentage >= 80) {
        return 'good-performance';
    } else if (correctPercentage < 80 && correctPercentage >= 60) {
        return 'ok-performance';
    } else {
        return 'bad-performance';
    }
}
function setupStudyGraph() {
    studyGraphDetail.innerHTML = '';
    const legend = getActiveGraph().legend;
    const nextMode = statsContainer.querySelector('input[type=radio]:checked').value;
    const studiedGraph = document.getElementById('studied-graph');
    studiedGraph.innerHTML = '';
    let levelData = [];
    const totalsByLevel = (nextMode === 'words') ? wordTotalsByLevel : characterTotalsByLevel;
    Object.keys(totalsByLevel).sort().forEach(x => {
        levelData.push({
            count: totalsByLevel[x].seen.size || 0,
            total: totalsByLevel[x].total
        });
    });
    const clickHandler = function (i) {
        const mode = statsContainer.querySelector('input[type=radio]:checked').value;
        if (mode !== 'words') {
            characterBarChartClickHandler(
                studyGraphDetail,
                totalsByLevel,
                i,
                `Of the characters used in words in the <span class="emphasized-but-not-that-emphasized">${legend[i]}</span>, here are some that are not in your flashcards:<br/>`
            );
        } else {
            wordBarChartClickHandler(studyGraphDetail, totalsByLevel, i, `Of the <span class="emphasized-but-not-that-emphasized">${legend[i]}</span> words, here are some that are not in your flashcards:<br/>`, getActiveGraph().ranks);
        }
    }
    studiedGraph.appendChild(
        BarChart(levelData, {
            labelText: (i) => legend[i],
            color: () => "#007bff",
            clickHandler: clickHandler
        })
    );
}
let createCardGraphs = function (studyList, ranks) {
    let studyListCharacters = new Set();
    let studyListWords = new Set();
    Object.values(studyList).forEach(y => {
        const joinedZh = y.zh.join('');
        for (let i = 0; i < joinedZh.length; i++) {
            studyListCharacters.add(joinedZh[i]);
        }
        for (const word of y.zh) {
            studyListWords.add(word);
        }
    });
    studyListCharacters.forEach(x => {
        if (hanzi[x]) {
            let level = hanzi[x].node.level;
            characterTotalsByLevel[level].seen.add(x);
        }
    });
    if (ranks && wordSet) {
        modeControl.removeAttribute('style');
        for (const word of studyListWords) {
            let previousStart = 0;
            for (let i = 0; i < ranks.length; i++) {
                if (wordSet[word] >= previousStart && wordSet[word] < ranks[i]) {
                    wordTotalsByLevel[i + 1].seen.add(word);
                    break;
                }
                previousStart = ranks[i];
            }
        }
        statsContainer.querySelectorAll('input[type=radio]').forEach(radioButton => {
            radioButton.addEventListener('change', setupStudyGraph);
        });
    } else {
        modeControl.style.display = 'none';
    }

    // these innerHTMLs should be ok due to only substituting length/size functions of JS data structures
    if (!studyList || Object.entries(studyList).length <= 0) {
        statsSummary.innerHTML = `<span class="emphasized-but-not-that-emphasized">You haven't used any study features yet.</span>
            <br/>You can get started by adding cards when you see the <span class="add-button"></span> button.`;
    } else {
        statsSummary.innerHTML = `So far, you've created <span class="emphasized">${Object.entries(studyList).length}</span> flash cards!<br/>
        They contain
        <span class="emphasized">${studyListWords.size}</span> unique
        <span class="emphasized-but-not-that-emphasized">words</span> and
        <span class="emphasized">${studyListCharacters.size}</span> unique 
        <span class="emphasized-but-not-that-emphasized">characters.</span>`;
    }
    setupStudyGraph();

    let addedByDay = {};
    let sortedCards = Object.values(studyList).sort((x, y) => {
        return (x.added || 0) - (y.added || 0);
    });
    let seenCharacters = new Set();
    let seenWords = new Set();
    for (const card of sortedCards) {
        //hacky, but truncate to day granularity this way
        if (card.added) {
            let day = getLocalISODate(new Date(card.added));
            if (!(day in addedByDay)) {
                addedByDay[day] = {
                    chars: new Set(),
                    words: new Set(),
                    total: 0
                };
            }
            addedByDay[day].total++;
            [...card.zh.join('')].forEach(character => {
                if (hanzi[character] && !seenCharacters.has(character)) {
                    addedByDay[day].chars.add(character);
                    seenCharacters.add(character);
                }
            });
            card.zh.forEach(word => {
                if (wordSet && (word in wordSet)) {
                    if (!seenWords.has(word)) {
                        addedByDay[day].words.add(word);
                        seenWords.add(word);
                    }
                }
            });
        } else {
            //cards are sorted with unknown add date at front, so safe to add all at the start
            [...card.zh.join('')].forEach(character => {
                if (hanzi[character]) {
                    seenCharacters.add(character);
                }
            });
            card.zh.forEach(word => {
                if (wordSet && (word in wordSet)) {
                    seenWords.add(word);
                }
            });
        }
    }
    let dailyAdds = [];
    for (const [date, result] of Object.entries(addedByDay)) {
        dailyAdds.push({
            date: new Date(date),
            chars: result.chars,
            words: result.words,
            total: result.total
        });
    }

    fillGapDays(dailyAdds, addedByDay, { chars: new Set(), words: new Set(), total: 0 });
    dailyAdds.sort((x, y) => x.date - y.date);

    const addedCalendar = document.getElementById('added-calendar');
    addedCalendar.innerHTML = '';
    addedCalendar.appendChild(
        Calendar(dailyAdds, {
            id: 'added-calendar',
            getIntensity: function (total) {
                if (total == 0) {
                    return 'empty';
                } else if (total < 6) {
                    return 's';
                } else if (total < 12) {
                    return 'm';
                } else if (total < 18) {
                    return 'l';
                } else if (total < 24) {
                    return 'xl';
                } else if (total < 30) {
                    return 'xxl';
                } else {
                    return 'epic';
                }
            },
            clickHandler: function (_, i) {
                addedCalendarDetail.innerHTML = '';

                let data = dailyAdds[i];
                // TODO oh dear
                let characters = '';
                let words = '';
                [...data.chars].slice(0, 10).forEach(x => {
                    if (!(x in window.hanzi)) {
                        return;
                    }
                    characters += `<span class="emphasized">${x}</span>` + ', '
                });
                characters = characters.slice(0, -2);
                [...data.words].slice(0, 10).forEach(x => {
                    if (!window.wordSet || !(x in window.wordSet)) {
                        return;
                    }
                    words += `<span class="emphasized">${x}</span>` + ', '
                });
                words = words.slice(0, -2);
                const initialMessage = `On <span class="emphasized">${getUTCISODate(data.date)}</span>`;
                const totalMessage = `<span class="emphasized">${parseInt(data.total)}</span>`;
                if (data.total && data.chars.size && data.words.size) {
                    // innerHTML should be safe for all of these, since we control the date, the total, and the words and characters that are put into the cards.
                    // we also ensure each character and word is in the `hanzi` or `wordSet`, which functions as a trusted allowlist.
                    // the parseInt calls also help ensure nothing untrusted seeps in
                    // someone could, of course, modify those themselves, but self-tampering isn't really avoidable
                    addedCalendarDetail.innerHTML = `${initialMessage}, you added ${totalMessage} cards.<br/>New characters included:<br/>${characters}<br/>and new words included:<br/>${words}`;
                } else if (data.total && data.words.size) {
                    // note that it's impossible to have new characters but not new words, so that case is not handled.
                    addedCalendarDetail.innerHTML = `${initialMessage}, you added ${totalMessage} cards.<br/>New words included:<br/>${words}.<br/>There were no new characters.`;
                } else {
                    addedCalendarDetail.innerHTML = `${initialMessage}, you added <span class="emphasized-but-not-that-emphasized">no</span> new cards.`;
                }
            }
        })
    );
    document.getElementById('added-calendar-calendar').scrollTo({
        top: 0,
        left: document.getElementById('added-calendar-today').offsetLeft
    });
}

let createStudyResultGraphs = function (results) {
    let hourlyData = [];
    let dailyData = [];
    for (let i = 0; i < 24; i++) {
        hourlyData.push({
            hour: i,
            correct: (results.hourly[i.toString()]) ? (results.hourly[i.toString()].correct || 0) : 0,
            incorrect: (results.hourly[i.toString()]) ? (results.hourly[i.toString()].incorrect || 0) : 0
        });
    }
    let total = 0;
    for (let i = 0; i < hourlyData.length; i++) {
        total += hourlyData[i].correct + hourlyData[i].incorrect;
    }
    for (let i = 0; i < 24; i++) {
        hourlyData[i]['count'] = hourlyData[i].correct + hourlyData[i].incorrect;
        hourlyData[i]['total'] = total;
    }
    let daysStudied = Object.keys(results.daily);
    //ISO 8601 lexicographically sortable
    daysStudied.sort((x, y) => x.localeCompare(y));
    for (let i = 0; i < daysStudied.length; i++) {
        let correct = results.daily[daysStudied[i]].correct || 0;
        let incorrect = results.daily[daysStudied[i]].incorrect || 0;
        let total = correct + incorrect;
        dailyData.push({
            date: new Date(daysStudied[i]),
            total: total,
            result: correct - incorrect,
            correct: correct,
            incorrect: incorrect
        });
    }
    fillGapDays(dailyData, results.daily, {
        total: 0,
        result: 0,
        correct: 0,
        incorrect: 0
    });
    dailyData.sort((x, y) => x.date - y.date);
    const studyCalendar = document.getElementById('study-calendar');
    studyCalendar.innerHTML = '';
    studyCalendar.appendChild(
        Calendar(dailyData, {
            id: 'study-calendar',
            getIntensity: function (total) {
                if (total == 0) {
                    return 'empty';
                } else if (total < 10) {
                    return 's';
                } else if (total < 25) {
                    return 'm';
                } else if (total < 50) {
                    return 'l';
                } else if (total < 100) {
                    return 'xl';
                } else if (total < 150) {
                    return 'xxl';
                } else {
                    return 'epic';
                }
            },
            clickHandler: function (_, i) {
                studyCalendarDetail.innerHTML = '';

                let data = dailyData[i];
                // parseInt and the date function should make these variables safe for innerHTML consumption
                studyCalendarDetail.innerHTML = `On <span class="emphasized">${getUTCISODate(data.date)}</span>, you studied <span class="emphasized">${parseInt(data.total || 0)}</span> cards. You got <span class="emphasized">${parseInt(data.correct)}</span> right and <span class="emphasized">${parseInt(data.incorrect)}</span> wrong.`;
            }
        })
    );
    document.getElementById('study-calendar-container').removeAttribute('style');
    document.getElementById('study-calendar-calendar').scrollTo({
        top: 0,
        left: document.getElementById('study-calendar-today').offsetLeft
    });
    //why, you ask? I don't know
    let getHour = function (hour) { return hour == 0 ? '12am' : (hour < 12 ? `${hour}am` : hour == 12 ? '12pm' : `${hour % 12}pm`) };
    let hourlyClickHandler = function (i) {
        if ((hourlyData[i].correct + hourlyData[i].incorrect) !== 0) {
            const percentage = Math.round((hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100);
            // each variable here is either from parseInt, Math.round, or the getHour function, so should be safe
            hourlyGraphDetail.innerHTML = `In the <span class="emphasized">${getHour(hourlyData[i].hour)}</span> hour, you've gotten <span class="emphasized">${parseInt(hourlyData[i].correct)}</span> correct and <span class="emphasized">${parseInt(hourlyData[i].incorrect)}</span> incorrect, or <span class="emphasized ${getPerfClass(percentage)}">${percentage}%</span> correct.`;
        } else {
            hourlyGraphDetail.innerHTML = `In the <span class="emphasized">${getHour(hourlyData[i].hour)}</span> hour, you've not yet studied.`;
        }
    };
    let hourlyColor = i => {
        if ((hourlyData[i].correct + hourlyData[i].incorrect) === 0) {
            return '';// don't set the color if there's been no studying
        }
        let percentage = (hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100;
        // TODO: these are duplicated in the CSS, ugh 
        if (percentage <= 100 && percentage >= 80) {
            return '#6de200';
        }
        if (percentage < 80 && percentage >= 60) {
            return '#ffc300';
        }
        return '#ff635f';
    };
    const hourlyGraph = document.getElementById('hourly-graph');
    hourlyGraph.innerHTML = '';
    hourlyGraph.appendChild(
        BarChart(hourlyData, {
            labelText: (i) => getHour(i),
            color: hourlyColor,
            clickHandler: hourlyClickHandler,
            includeYLabel: false,
            customClass: 'hours',
            scaleToFit: true
        })
    );
    document.getElementById('hourly-container').removeAttribute('style');
};

let initialize = function () {
    updateTotalsByLevel(getActiveGraph().ranks);
    statsShow.addEventListener('click', function () {
        let activeGraph = getActiveGraph();
        switchToState(stateKeys.stats);
        shown = true;
        createCardGraphs(getStudyList(), activeGraph.ranks);
        createStudyResultGraphs(getStudyResults(), activeGraph.legend);
    });

    statsContainer.addEventListener('hidden', function () {
        //TODO(refactor) this is all silly
        if (!shown) {
            return;
        }
        statsSummary.innerText = '';
        studyGraphDetail.innerText = '';
        addedCalendarDetail.innerText = '';
        studyCalendarDetail.innerText = '';
        hourlyGraphDetail.innerText = '';
    });
};

export { initialize };