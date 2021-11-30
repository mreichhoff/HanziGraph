import { interpolatePiYG } from 'https://cdn.skypack.dev/pin/d3-scale-chromatic@v3.0.0-wlyjJbUexgtDqhQ6ksVy/mode=imports,min/optimized/d3-scale-chromatic.js';
import { utcYear, utcSunday, utcMonths, utcMonth, utcMonday } from "https://cdn.skypack.dev/pin/d3-time@v3.0.0-Ww07wkuPsE2c8Ac33BKQ/mode=imports,min/optimized/d3-time.js";
import { utcFormat } from 'https://cdn.skypack.dev/pin/d3-time-format@v4.0.0-A7vYeSqgWxeXXSpz1rEp/mode=imports,min/optimized/d3-time-format.js';
import { axisBottom, axisLeft } from 'https://cdn.skypack.dev/pin/d3-axis@v3.0.0-Tp73hnXudkL5zk3Jd1gx/mode=imports,min/optimized/d3-axis.js';
import { scaleSequential, scaleBand, scaleLinear } from "https://cdn.skypack.dev/pin/d3-scale@v4.0.2-qUv67mnQQKwRMEsPRKcO/mode=imports,min/optimized/d3-scale.js";
import { quantile, groups, map, range, max, InternSet } from 'https://cdn.skypack.dev/pin/d3-array@v3.1.1-Ibshj34oOmCw8da1RLSW/mode=imports,min/optimized/d3-array.js';
import { create } from "https://cdn.skypack.dev/pin/d3-selection@v3.0.0-sAmQ3giCT8irML5wz1T1/mode=imports,min/optimized/d3-selection.js";
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
function Calendar(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    width = 1000, // width of the chart, in pixels
    cellSize = 17, // width and height of an individual day, in pixels
    weekday = "monday", // either: weekday, sunday, or monday
    formatDay = i => "SMTWTFS"[i], // given a day number in [0, 6], the day-of-week label
    formatMonth = "%b", // format specifier string for months (above the chart)
    yFormat, // format specifier string for values (in the title)
    colors = interpolatePiYG,
    clickHandler = () => { },
    fill = 'white',
    includeMonthBoundaries = false
} = {}) {
    // Compute values.
    const X = map(data, x);
    const Y = map(data, y);
    const I = range(X.length);

    const countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7;
    const timeWeek = weekday === "sunday" ? utcSunday : utcMonday;
    const weekDays = weekday === "weekday" ? 5 : 7;
    const height = cellSize * (weekDays + 2);

    // Compute a color scale. This assumes a diverging color scheme where the pivot
    // is zero, and we want symmetric difference around zero.
    const max = quantile(Y, 0.9975, Math.abs);
    const color = scaleSequential([-max, +max], colors).unknown("none");

    // Construct formats.
    formatMonth = utcFormat(formatMonth);

    // Compute titles.
    if (title === undefined) {
        const formatDate = utcFormat("%B %-d, %Y");
        const formatValue = color.tickFormat(100, yFormat);
        title = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
    } else if (title !== null) {
        const T = map(data, title);
        title = i => T[i];
    }

    // Group the index by year, in reverse input order. (Assuming that the input is
    // chronological, this will show years in reverse chronological order.)
    const years = groups(I, i => X[i].getUTCFullYear()).reverse();

    function pathMonth(t) {
        const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
        const w = timeWeek.count(utcYear(t), t);
        return `${d === 0 ? `M${w * cellSize},0`
            : d === weekDays ? `M${(w + 1) * cellSize},0`
                : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${weekDays * cellSize}`;
    }

    const svg = create("svg")
        .attr("width", width)
        .attr("height", height * years.length)
        .attr("viewBox", [0, 0, width, height * years.length])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 14)
        .attr('fill', fill);

    const year = svg.selectAll("g")
        .data(years)
        .join("g")
        .attr("transform", (d, i) => `translate(40.5,${height * i + cellSize * 1.5})`);

    year.append("text")
        .attr("x", -5)
        .attr("y", -5)
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .text(([key]) => key);

    year.append("g")
        .attr("text-anchor", "end")
        .selectAll("text")
        .data(weekday === "weekday" ? range(1, 6) : range(7))
        .join("text")
        .attr("x", -5)
        .attr("y", i => (countDay(i) + 0.5) * cellSize)
        .attr("dy", "0.31em")
        .text(formatDay);

    const cell = year.append("g")
        .selectAll("rect")
        .data(weekday === "weekday"
            ? ([, I]) => I.filter(i => ![0, 6].includes(X[i].getUTCDay()))
            : ([, I]) => I)
        .join("rect")
        .attr("width", cellSize - 1)
        .attr("height", cellSize - 1)
        .attr("x", i => timeWeek.count(utcYear(X[i]), X[i]) * cellSize + 0.5)
        .attr("y", i => countDay(X[i].getUTCDay()) * cellSize + 0.5)
        .attr("fill", i => color(Y[i]))
        .on('click', clickHandler);

    if (title) cell.append("title")
        .text(title);

    const month = year.append("g")
        .selectAll("g")
        .data(([, I]) => utcMonths(utcMonth(X[I[0]]), X[I[I.length - 1]]))
        .join("g");

    if (includeMonthBoundaries) {
        month.filter((d, i) => i).append("path")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 3)
            .attr("d", pathMonth);
    } else {
        month.filter((d, i) => i).append("path")
            .attr("fill", "none")
            .attr("stroke", "#fff")
            .attr("stroke-width", 3);
    }

    month.append("text")
        .attr("x", d => timeWeek.count(utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
        .attr("y", -5)
        .text(formatMonth);

    return Object.assign(svg.node(), { scales: { color } });
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