import { axisBottom, axisLeft } from 'https://cdn.skypack.dev/pin/d3-axis@v3.0.0-Tp73hnXudkL5zk3Jd1gx/mode=imports,min/optimized/d3-axis.js';
import { scaleBand, scaleLinear } from "https://cdn.skypack.dev/pin/d3-scale@v4.0.2-qUv67mnQQKwRMEsPRKcO/mode=imports,min/optimized/d3-scale.js";
import { map, range, max, InternSet } from 'https://cdn.skypack.dev/pin/d3-array@v3.1.1-Ibshj34oOmCw8da1RLSW/mode=imports,min/optimized/d3-array.js';
import { create } from "https://cdn.skypack.dev/pin/d3-selection@v3.0.0-sAmQ3giCT8irML5wz1T1/mode=imports,min/optimized/d3-selection.js";

function sameDay(d1, d2) {
    return d1.getFullYear() == d2.getFullYear() &&
        d1.getMonth() == d2.getMonth() &&
        d1.getDate() == d2.getDate();
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
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/bar-chart
function BarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    marginTop = 20, // the top margin, in pixels
    marginRight = 0, // the right margin, in pixels
    marginBottom = 30, // the bottom margin, in pixels
    marginLeft = 40, // the left margin, in pixels
    width = 640, // the outer width of the chart, in pixels
    height = 400, // the outer height of the chart, in pixels
    xDomain, // an array of (ordinal) x-values
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor", // bar fill color
    clickHandler = () => { },
    fontSize = 14
} = {}) {
    // Compute values.
    const X = map(data, x);
    const Y = map(data, y);

    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, max(Y)];
    xDomain = new InternSet(xDomain);

    // Omit any data not present in the x-domain.
    const I = range(X.length).filter(i => xDomain.has(X[i]));

    // Construct scales, axes, and formats.
    const xScale = scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = axisBottom(xScale).tickSizeOuter(0);
    const yAxis = axisLeft(yScale).ticks(height / 40, yFormat);

    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${X[i]}\n${formatValue(Y[i])}`;
    } else {
        const O = map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
    }

    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .attr("font-size", fontSize)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));

    const bar = svg.append("g")
        .selectAll("rect")
        .data(I)
        .join("rect")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("width", xScale.bandwidth())
        .attr('fill', i => typeof color === 'function' ? color(i) : color)
        .on('click', clickHandler);

    if (title) bar.append("title")
        .text(title);


    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .attr('font-size', fontSize);

    return svg.node();
}
export { Calendar, BarChart };