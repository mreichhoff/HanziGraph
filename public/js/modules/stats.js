import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js";
import { GroupedBarChart, Calendar, BarChart } from "./external/d3-display-elements.js";

//TODO: combine with the one in study-mode.js
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
    let firstDayStudied = daysWithData[0].date;
    let lastDayStudied = daysWithData[daysWithData.length - 1].date;
    let diff = ((lastDayStudied.valueOf() - firstDayStudied.valueOf()) / 1000 / 60 / 60 / 24) - 1;
    for (let i = 1; i <= diff; i++) {
        if (!(getUTCISODate(new Date(firstDayStudied.valueOf() + (i * 24 * 60 * 60 * 1000))) in originalData)) {
            daysWithData.push({
                date: new Date(firstDayStudied.valueOf() + (i * 24 * 60 * 60 * 1000)),
                ...defaultEntry
            });
        }
    }
};
let barChartClickHandler = function (id, hskTotalsByLevel, prop, index, message) {
    let detail = document.getElementById(id);
    detail.innerHTML = '';
    //TODO: why no built-in difference method?
    let missingHanzi = new Set([...hskTotalsByLevel[index + 1].characters].filter(x => !hskTotalsByLevel[index + 1][prop].has(x)));
    missingHanzi.forEach(x => message += x);
    detail.innerHTML = message;
};
//super rough for now, will be converted to graphs or other visualization
let auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (document.getElementById('hourly-chart').childElementCount != 0 ||
            document.getElementById('study-calendar').childElementCount != 0 ||
            document.getElementById('added-calendar').childElementCount != 0) {
            return;
        }
        //visited section
        //could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
        let hskTotalsByLevel = {};
        Object.keys(hanzi).forEach(x => {
            let level = hanzi[x].node.level;
            if (!(level in hskTotalsByLevel)) {
                hskTotalsByLevel[level] = { seen: new Set(), total: 0, visited: new Set(), characters: new Set() };
            }
            hskTotalsByLevel[level].total++;
            hskTotalsByLevel[level].characters.add(x);
        });
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${user.uid}/decks/zh-CN`)).then((snapshot) => {
            const studyList = snapshot.val();
            let studyListCharacters = new Set();
            Object.keys(studyList).forEach(x => {
                for (let i = 0; i < x.length; i++) {
                    studyListCharacters.add(x[i]);
                }
            });
            studyListCharacters.forEach(x => {
                if (hanzi[x]) {
                    let level = hanzi[x].node.level;
                    hskTotalsByLevel[level].seen.add(x);
                }
            });
            let levelData = [];
            //safe since we don't add keys in the read of /decks/
            Object.keys(hskTotalsByLevel).sort().forEach(x => {
                levelData.push({
                    count: hskTotalsByLevel[x].seen.size || 0,
                    total: hskTotalsByLevel[x].total
                });
            });
            document.getElementById('studied-graph').appendChild(
                BarChart(levelData, {
                    x: (_, i) => 'HSK' + (i + 1),
                    y: d => (d.count / d.total),
                    yFormat: "%",
                    yLabel: "↑ Percentage Seen",
                    color: "blue",
                    clickHandler: function (_, i) {
                        barChartClickHandler(
                            'studied-graph-detail',
                            hskTotalsByLevel,
                            'seen',
                            i,
                            `In HSK${i + 1}, your study list doesn't yet contain:<br>`
                        );
                    }
                })
            );


            let addedByDay = {};
            let sortedCards = Object.values(studyList).sort((x, y) => {
                return (x.added || 0) - (y.added || 0);
            });
            let seenCharacters = new Set();
            for (const card of sortedCards) {
                //hacky, but truncate to day granularity this way
                if (card.added) {
                    let day = getLocalISODate(new Date(card.added));
                    if (!(day in addedByDay)) {
                        addedByDay[day] = {
                            chars: new Set(),
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
                } else {
                    //cards are sorted with unknown add date at front, so safe to add all at the start
                    [...card.zh.join('')].forEach(character => {
                        if (hanzi[character]) {
                            seenCharacters.add(character);
                        }
                    });
                }
            }
            let dailyAdds = [];
            for (const [date, result] of Object.entries(addedByDay)) {
                dailyAdds.push({
                    date: new Date(date),
                    chars: result.chars,
                    total: result.total
                });
            }

            fillGapDays(dailyAdds, addedByDay, { chars: new Set(), total: 0 });

            document.getElementById('added-calendar').appendChild(
                Calendar(dailyAdds, {
                    x: d => d.date,
                    y: d => d.total,
                    title: d => `${getUTCISODate(d.date)}: ${d.total} added`,
                    weekday: 'sunday',
                    clickHandler: function (_, i) {
                        let detail = document.getElementById('added-calendar-detail');
                        detail.innerHTML = '';

                        let data = dailyAdds[i];
                        let characters = '';
                        data.chars.forEach(x => characters += x);
                        if (data.total && data.chars.size) {
                            detail.innerText = `On ${getUTCISODate(data.date)}, you added ${data.total} cards, with these new characters: ${characters}`;
                        } else if (data.total) {
                            detail.innerText = `On ${getUTCISODate(data.date)}, you added ${data.total} cards, with no new characters.`;
                        } else {
                            detail.innerText = `On ${getUTCISODate(data.date)}, you added no new cards.`;
                        }
                    }
                })
            );
        });
        get(child(dbRef, `users/${user.uid}/visited/zh-CN`)).then((snapshot) => {
            const visitedCharacters = snapshot.val();
            if (!visitedCharacters) {
                return;
            }
            Object.keys(visitedCharacters).forEach(x => {
                if (hanzi[x]) {
                    const level = hanzi[x].node.level;
                    hskTotalsByLevel[level].visited.add(x);
                }
            });
            let levelData = [];
            //safe since we don't add keys in the read of /decks/
            Object.keys(hskTotalsByLevel).sort().forEach(x => {
                levelData.push({
                    count: hskTotalsByLevel[x].visited.size || 0,
                    total: hskTotalsByLevel[x].total
                });
            });
            document.getElementById('visited-graph').appendChild(
                BarChart(levelData, {
                    x: (_, i) => 'HSK' + (i + 1),
                    y: d => (d.count / d.total),
                    yFormat: "%",
                    yLabel: "↑ Percentage Seen",
                    color: "blue",
                    clickHandler: function (_, i) {
                        barChartClickHandler(
                            'visited-graph-detail',
                            hskTotalsByLevel,
                            'visited',
                            i,
                            `In HSK${i + 1}, you haven't yet visited:<br>`
                        );
                    }
                })
            );
        });

        //study results section
        let hourlyData = [];
        let dailyData = [];
        get(child(dbRef, `users/${user.uid}/results/zh-CN`)).then((snapshot) => {
            const results = snapshot.val();
            for (let i = 0; i < 24; i++) {
                hourlyData.push({
                    hour: i,
                    count: (i.toString() in results.hourly) ? (results.hourly[i.toString()].correct || 0) : 0,
                    category: 'correct'
                });
                hourlyData.push({
                    hour: i,
                    count: (i.toString() in results.hourly) ? (results.hourly[i.toString()].incorrect || 0) : 0,
                    category: 'incorrect'
                });
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
            document.getElementById('study-calendar').appendChild(
                Calendar(dailyData, {
                    x: d => d.date,
                    y: d => d.total,
                    title: d => `${getUTCISODate(d.date)}: ${d.correct} correct and ${d.incorrect} incorrect`,
                    weekday: 'sunday',
                    clickHandler: function (_, i) {
                        let detail = document.getElementById('study-calendar-detail');
                        detail.innerHTML = '';

                        let data = dailyData[i];
                        detail.innerText = `On ${getUTCISODate(data.date)}, you studied ${data.total || 0} cards. You got ${data.correct} right and ${data.incorrect} wrong.`;
                    }
                })
            );
            document.getElementById('hourly-chart').appendChild(
                GroupedBarChart(hourlyData, {
                    x: d => d.hour,
                    y: d => d.count,
                    z: d => d.category,
                    yLabel: "↑ Count",
                    zDomain: ['correct', 'incorrect'],
                    colors: ['green', 'red']
                })
            );
        });
    }
});