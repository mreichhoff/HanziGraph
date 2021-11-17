import * as d3 from "https://cdn.skypack.dev/d3@7";
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
function Calendar(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    title, // given d in data, returns the title text
    width = 928, // width of the chart, in pixels
    cellSize = 17, // width and height of an individual day, in pixels
    weekday = "monday", // either: weekday, sunday, or monday
    formatDay = i => "SMTWTFS"[i], // given a day number in [0, 6], the day-of-week label
    formatMonth = "%b", // format specifier string for months (above the chart)
    yFormat, // format specifier string for values (in the title)
    colors = d3.interpolatePiYG,
    clickHandler = () => { }
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const I = d3.range(X.length);

    const countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7;
    const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
    const weekDays = weekday === "weekday" ? 5 : 7;
    const height = cellSize * (weekDays + 2);

    // Compute a color scale. This assumes a diverging color scheme where the pivot
    // is zero, and we want symmetric difference around zero.
    const max = d3.quantile(Y, 0.9975, Math.abs);
    const color = d3.scaleSequential([-max, +max], colors).unknown("none");

    // Construct formats.
    formatMonth = d3.utcFormat(formatMonth);

    // Compute titles.
    if (title === undefined) {
        const formatDate = d3.utcFormat("%B %-d, %Y");
        const formatValue = color.tickFormat(100, yFormat);
        title = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
    } else if (title !== null) {
        const T = d3.map(data, title);
        title = i => T[i];
    }

    // Group the index by year, in reverse input order. (Assuming that the input is
    // chronological, this will show years in reverse chronological order.)
    const years = d3.groups(I, i => X[i].getUTCFullYear()).reverse();

    function pathMonth(t) {
        const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
        const w = timeWeek.count(d3.utcYear(t), t);
        return `${d === 0 ? `M${w * cellSize},0`
            : d === weekDays ? `M${(w + 1) * cellSize},0`
                : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${weekDays * cellSize}`;
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height * years.length)
        .attr("viewBox", [0, 0, width, height * years.length])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10);

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
        .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
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
        .attr("x", i => timeWeek.count(d3.utcYear(X[i]), X[i]) * cellSize + 0.5)
        .attr("y", i => countDay(X[i].getUTCDay()) * cellSize + 0.5)
        .attr("fill", i => color(Y[i]))
        .on('click', clickHandler);

    if (title) cell.append("title")
        .text(title);

    const month = year.append("g")
        .selectAll("g")
        .data(([, I]) => d3.utcMonths(d3.utcMonth(X[I[0]]), X[I[I.length - 1]]))
        .join("g");

    month.filter((d, i) => i).append("path")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("d", pathMonth);

    month.append("text")
        .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
        .attr("y", -5)
        .text(formatMonth);

    return Object.assign(svg.node(), { scales: { color } });
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/grouped-bar-chart
function GroupedBarChart(data, {
    x = (d, i) => i, // given d in data, returns the (ordinal) x-value
    y = d => d, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    marginTop = 30, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xDomain, // array of x-values
    xRange = [marginLeft, width - marginRight], // [xmin, xmax]
    xPadding = 0.1, // amount of x-range to reserve to separate groups
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [ymin, ymax]
    zDomain, // array of z-values
    zPadding = 0.05, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);

    // Compute default domains, and unique the x- and z-domains.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;
    xDomain = new d3.InternSet(xDomain);
    zDomain = new d3.InternSet(zDomain);

    // Omit any data not present in both the x- and z-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]) && zDomain.has(Z[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).paddingInner(xPadding);
    const xzScale = d3.scaleBand(zDomain, [0, xScale.bandwidth()]).padding(zPadding);
    const yScale = yType(yDomain, yRange);
    const zScale = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 60, yFormat);

    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${X[i]}\n${Z[i]}\n${formatValue(Y[i])}`;
    } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
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
        .attr("x", i => xScale(X[i]) + xzScale(Z[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("width", xzScale.bandwidth())
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("fill", i => zScale(Z[i]));

    if (title) bar.append("title")
        .text(title);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    return Object.assign(svg.node(), { scales: { color: zScale } });
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
    yType = d3.scaleLinear, // y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    xPadding = 0.1, // amount of x-range to reserve to separate bars
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor", // bar fill color
    clickHandler = () => { }
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);

    // Compute default domains, and unique the x-domain.
    if (xDomain === undefined) xDomain = X;
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    xDomain = new d3.InternSet(xDomain);

    // Omit any data not present in the x-domain.
    const I = d3.range(X.length).filter(i => xDomain.has(X[i]));

    // Construct scales, axes, and formats.
    const xScale = d3.scaleBand(xDomain, xRange).padding(xPadding);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(height / 40, yFormat);

    // Compute titles.
    if (title === undefined) {
        const formatValue = yScale.tickFormat(100, yFormat);
        title = i => `${X[i]}\n${formatValue(Y[i])}`;
    } else {
        const O = d3.map(data, d => d);
        const T = title;
        title = i => T(O[i], i, data);
    }

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
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
        .attr("fill", color)
        .selectAll("rect")
        .data(I)
        .join("rect")
        .attr("x", i => xScale(X[i]))
        .attr("y", i => yScale(Y[i]))
        .attr("height", i => yScale(0) - yScale(Y[i]))
        .attr("width", xScale.bandwidth())
        .on('click', clickHandler);

    if (title) bar.append("title")
        .text(title);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    return svg.node();
}
export { Calendar, GroupedBarChart, BarChart };