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
    customClass
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
    for (let i = 0; i < data.length; i++) {
        let bar = document.createElement('div');
        bar.className = 'bar-chart-bar';
        bar.style.gridColumn = `${i + (includeYLabel ? 2 : 1)}`;
        bar.style.backgroundColor = color(i);
        bar.style.gridRow = `${(100 - (Math.ceil(100 * data[i].count / data[i].total) || 1)) || 1} / 101`;
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
export { Calendar, BarChart };