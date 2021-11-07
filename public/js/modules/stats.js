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
//super rough for now, will be converted to graphs or other visualization
let auth = getAuth();
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (document.getElementById('hourly-chart').childElementCount != 0 || document.getElementById('calendar').childElementCount) {
            return;
        }
        //visited section
        //could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
        let hskTotalsByLevel = {};
        Object.keys(hanzi).forEach(x => {
            let level = hanzi[x].node.level;
            if (!(level in hskTotalsByLevel)) {
                hskTotalsByLevel[level] = { seen: 0, total: 0, visited: 0 };
            }
            hskTotalsByLevel[level].total++;
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
                    hskTotalsByLevel[level].seen++;
                }
            });
            let levelData = [];
            //safe since we don't add keys in the read of /decks/
            Object.keys(hskTotalsByLevel).sort().forEach(x => {
                levelData.push({
                    count: hskTotalsByLevel[x].seen || 0,
                    total: hskTotalsByLevel[x].total
                });
            });
            document.getElementById('studied-graph').appendChild(
                BarChart(levelData, {
                    x: (_, i) => i + 1,
                    y: d => (d.count / d.total),
                    yFormat: "%",
                    yLabel: "↑ Percentage Seen",
                    color: "blue"
                })
            );
        });
        get(child(dbRef, `users/${user.uid}/visited/zh-CN`)).then((snapshot) => {
            const visitedCharacters = snapshot.val();
            Object.keys(visitedCharacters).forEach(x => {
                if (hanzi[x]) {
                    const level = hanzi[x].node.level;
                    hskTotalsByLevel[level].visited++;
                }
            });
            let levelData = [];
            //safe since we don't add keys in the read of /decks/
            Object.keys(hskTotalsByLevel).sort().forEach(x => {
                levelData.push({
                    count: hskTotalsByLevel[x].visited || 0,
                    total: hskTotalsByLevel[x].total
                });
            });
            document.getElementById('visited-graph').appendChild(
                BarChart(levelData, {
                    x: (_, i) => i + 1,
                    y: d => (d.count / d.total),
                    yFormat: "%",
                    yLabel: "↑ Percentage Seen",
                    color: "blue"
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
            let firstDayStudied = dailyData[0].date;
            let lastDayStudied = dailyData[dailyData.length - 1].date;
            let diff = ((lastDayStudied.valueOf() - firstDayStudied.valueOf()) / 1000 / 60 / 60 / 24) - 1;
            for (let i = 1; i <= diff; i++) {
                if (!(getUTCISODate(new Date(firstDayStudied.valueOf() + (i * 24 * 60 * 60 * 1000))) in results.daily)) {
                    dailyData.push({
                        date: new Date(firstDayStudied.valueOf() + (i * 24 * 60 * 60 * 1000)),
                        total: 0,
                        result: 0,
                        correct: 0,
                        incorrect: 0
                    });
                }
            }
            dailyData.sort((x, y) => x.date - y.date);
            document.getElementById('calendar').appendChild(
                Calendar(dailyData, {
                    x: d => d.date,
                    y: d => d.total,
                    title: d => `${getUTCISODate(d.date)}: ${d.correct} correct and ${d.incorrect} incorrect`,
                    weekday: 'sunday'
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