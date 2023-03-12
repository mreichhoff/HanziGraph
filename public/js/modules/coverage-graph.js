import { map, curveLinear, range, axisBottom, axisLeft, extent, line as d3line, max, create, scaleLinear, scaleSequential } from "d3";

function findCoverage(percentages, rank) {
    let min = 0;
    let max = percentages.length - 1;
    let mid = Math.round((min + max) / 2);
    while (min < max) {
        if (percentages[mid].x == rank) {
            return percentages[mid].y;
        }
        if (percentages[mid].x < rank) {
            min = mid + 1;
        } else {
            max = mid - 1;
        }
        mid = Math.round((min + max) / 2);
    }
    return percentages[mid].y;
}

function renderCoverageGraph(percentages, term, rank, type, container) {
    let transformedPercentages = [];
    transformedPercentages.push({ x: 0, y: 0 });
    for (const [x, y] of Object.entries(percentages)) {
        // plus one to avoid zero indexing
        transformedPercentages.push({ x: parseInt(x) + 1, y: y });
    }

    const coverage = findCoverage(transformedPercentages, rank);
    let chart = LineChart(transformedPercentages, {
        x: d => d.x,
        y: d => d.y,
        yLabel: `Percentage of ${type}s recognized`,
        xLabel: `Number of ${type}s learned`,
        xDomain: [0, rank],
        yDomain: [0, 1],
        width: container.offsetWidth,
        // maintain the default aspect ratio 
        height: (container.offsetWidth / 1.6),
        color: '#68aaee',
        strokeWidth: 2.5,
        yFormat: '%',
        horizontalLine: { y: coverage, color: '#de68ee', width: 1.5, opacity: 0.8 },
        verticalLine: { x: rank, color: '#de68ee', width: 1.5, opacity: 0.8 },
        horizontalLabel: { x: rank / 2, y: coverage, color: '#de68ee', text: term, weight: 'bold', font: 'sans-serif', fontSize: '16px' },
    });
    renderExplanation(term, coverage, type, rank, container);
    container.appendChild(chart);
}
function getOrderingSuffix(number) {
    // Oh no, what have I done!?
    if (number % 100 === 11 || number % 100 === 12 || number % 100 === 13) {
        return 'th';
    }
    number = number % 10;
    return number === 1 ? 'st' : number === 2 ? 'nd' : number === 3 ? 'rd' : 'th';
}
function renderExplanation(term, coverage, type, rank, container) {
    let rankContainer = document.createElement('p');
    rankContainer.classList.add('coverage-explanation');
    rankContainer.innerText = `${term} is the ${rank}${getOrderingSuffix(rank)} most common ${type}.`;
    container.appendChild(rankContainer);
    let explanationContainer = document.createElement('p');
    // TODO(refactor): explanatory text like this should just have a single class
    explanationContainer.classList.add('coverage-explanation');
    explanationContainer.innerText = `If you learned each ${type} in order of frequency up to "${term}", you'd know approximately ${(coverage * 100).toFixed(1)}% of all ${type}s encountered in speech.`;
    container.appendChild(explanationContainer);
}

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/line-chart
function LineChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    defined, // for gaps in data
    curve = curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xType = scaleSequential, // the x-scale type
    xDomain, // [xmin, xmax]
    xLabel = "",
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = scaleLinear, // the y-scale type
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    color = "currentColor", // stroke color of line
    strokeLinecap = "round", // stroke line cap of the line
    strokeLinejoin = "round", // stroke line join of the line
    strokeWidth = 1.5, // stroke width of line, in pixels
    strokeOpacity = 1, // stroke opacity of line
    horizontalLine,
    verticalLine,
    horizontalLabel,
    verticalLabel
} = {}) {
    // Compute values.
    const X = map(data, x);
    const Y = map(data, y);
    const I = range(X.length);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = map(data, defined);

    // Compute default domains.
    if (xDomain === undefined) xDomain = extent(X);
    if (yDomain === undefined) yDomain = [0, max(Y)];

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = axisLeft(yScale).ticks(height / 40, yFormat);

    // Construct a line generator.
    const line = d3line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));

    const svg = create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis)
        .call(g => g.append("text")
            .attr("x", (width / 2) - marginLeft)
            .attr("y", 28)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(xLabel));

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

    svg.append("path")
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-opacity", strokeOpacity)
        .attr("d", line(I));

    if (horizontalLine) {
        svg.append('line')
            .attr('x1', xScale(0))
            .attr('y1', yScale(horizontalLine.y))
            .attr('x2', xScale(xDomain[1]))
            .attr('y2', yScale(horizontalLine.y))
            .attr('stroke', horizontalLine.color)
            .attr('stroke-opacity', horizontalLine.opacity)
            .attr("stroke-width", horizontalLine.width)
            .attr('stroke-dasharray', 4);
    }
    if (verticalLine) {
        svg.append('line')
            .attr('x1', xScale(verticalLine.x))
            .attr('y1', yScale(0))
            .attr('x2', xScale(verticalLine.x))
            .attr('y2', yScale(horizontalLine ? horizontalLine.y : Y[Y.length - 1]))
            .attr('stroke', verticalLine.color)
            .attr('stroke-opacity', verticalLine.opacity)
            .attr("stroke-width", verticalLine.width)
            .attr('stroke-dasharray', 4);
    }
    if (horizontalLabel) {
        svg.append('text')
            .attr('x', xScale(horizontalLabel.x))
            .attr('y', yScale(horizontalLabel.y) - 6)
            .attr('fill', horizontalLabel.color)
            .attr('font-weight', horizontalLabel.weight)
            .attr('font-size', horizontalLabel.fontSize)
            .attr('font-family', horizontalLabel.font)
            .text(horizontalLabel.text);
    }
    if (verticalLabel) {
        svg.append('text')
            .attr('x', xScale(verticalLabel.x) - 40)
            .attr('y', yScale(verticalLabel.y))
            .attr('fill', verticalLabel.color)
            .attr('font-weight', verticalLabel.weight)
            .attr('font-size', verticalLabel.fontSize)
            .attr('font-family', verticalLabel.font)
            .text(verticalLabel.text);
    }

    return svg.node();
}

export { renderCoverageGraph }