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
let hskBarChartClickHandler = function (id, hskTotalsByLevel, prop, index, message) {
    let detail = document.getElementById(id);
    detail.innerHTML = '';
    //TODO: why no built-in difference method?
    let missingHanzi = new Set([...hskTotalsByLevel[index + 1].characters].filter(x => !hskTotalsByLevel[index + 1][prop].has(x)));
    missingHanzi.forEach(x => message += x);
    detail.innerHTML = message;
};
//could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
let hskTotalsByLevel = {};
let updateHskTotalsByLevel = function () {
    hskTotalsByLevel = {};
    Object.keys(hanzi).forEach(x => {
        let level = hanzi[x].node.level;
        if (!(level in hskTotalsByLevel)) {
            hskTotalsByLevel[level] = { seen: new Set(), total: 0, visited: new Set(), characters: new Set() };
        }
        hskTotalsByLevel[level].total++;
        hskTotalsByLevel[level].characters.add(x);
    });
}
let createCardGraphs = function (studyList, legend) {
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
    document.getElementById('studied-graph').innerHTML = '';
    document.getElementById('studied-graph').appendChild(
        BarChart(levelData, {
            labelText: (i) => legend[i],
            color: () => "#68aaee",
            clickHandler: function (i) {
                hskBarChartClickHandler(
                    'studied-graph-detail',
                    hskTotalsByLevel,
                    'seen',
                    i,
                    `In ${legend[i]}, your study list doesn't yet contain:<br>`
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
    dailyAdds.sort((x, y) => x.date - y.date);
    document.getElementById('added-calendar').innerHTML = '';
    document.getElementById('added-calendar').appendChild(
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
    document.getElementById('added-calendar-calendar').scrollTo({
        top: 0,
        left: document.getElementById('added-calendar-today').offsetLeft
    });
}
let createVisitedGraphs = function (visitedCharacters, legend) {
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
    document.getElementById('visited-graph').innerHTML = '';
    document.getElementById('visited-graph').appendChild(
        BarChart(levelData, {
            labelText: (i) => legend[i],
            color: () => "#68aaee",
            clickHandler: function (i) {
                hskBarChartClickHandler(
                    'visited-graph-detail',
                    hskTotalsByLevel,
                    'visited',
                    i,
                    `In ${legend[i]}, you haven't yet visited:<br>`
                );
            }
        })
    );
    document.getElementById('visited-container').removeAttribute('style');
};

let createStudyResultGraphs = function (results) {
    let hourlyData = [];
    let dailyData = [];
    for (let i = 0; i < 24; i++) {
        hourlyData.push({
            hour: i,
            correct: (i.toString() in results.hourly) ? (results.hourly[i.toString()].correct || 0) : 0,
            incorrect: (i.toString() in results.hourly) ? (results.hourly[i.toString()].incorrect || 0) : 0
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
    document.getElementById('study-calendar').innerHTML = '';
    document.getElementById('study-calendar').appendChild(
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
                let detail = document.getElementById('study-calendar-detail');
                detail.innerHTML = '';

                let data = dailyData[i];
                detail.innerText = `On ${getUTCISODate(data.date)}, you studied ${data.total || 0} cards. You got ${data.correct} right and ${data.incorrect} wrong.`;
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
    document.getElementById('hourly-graph').innerHTML = '';
    let hourlyClickHandler = function (i) {
        let detail = document.getElementById('hourly-graph-detail');
        if ((hourlyData[i].correct + hourlyData[i].incorrect) !== 0) {
            detail.innerText = `In the ${getHour(hourlyData[i].hour)} hour, you've gotten ${hourlyData[i].correct} correct and ${hourlyData[i].incorrect} incorrect, or ${Math.round((hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100)}% correct.`;
        } else {
            detail.innerText = `In the ${getHour(hourlyData[i].hour)} hour, you've not studied.`;
        }
    };
    let hourlyColor = i => {
        let percentage = (hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100;
        if (percentage <= 100 && percentage >= 75) {
            return '#6de200';
        }
        if (percentage < 75 && percentage >= 50) {
            return '#68aaee';
        }
        if (percentage < 50 && percentage >= 25) {
            return '#ff9b35';
        }
        if (percentage < 25) {
            return '#ff635f';
        }
    };
    document.getElementById('hourly-graph').appendChild(
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

export { createCardGraphs, createVisitedGraphs, createStudyResultGraphs, updateHskTotalsByLevel };