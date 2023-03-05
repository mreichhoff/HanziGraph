import { graphChanged, preferencesChanged } from "./recommendations.js"
import { readOptionState, writeOptionState } from "./data-layer.js"
import { getWordLevelsFromGraph, getWordSetFromFrequency, buildGraphFromFrequencyList } from "./graph-functions.js";

const graphSelector = document.getElementById('graph-selector');
const showPinyinCheckbox = document.getElementById('show-pinyin');
const togglePinyinLabel = document.getElementById('toggle-pinyin-label');
const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
let freqLegend = ['Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k', '>10k'];
let freqRanks = [1000, 2000, 4000, 7000, 10000, Number.MAX_SAFE_INTEGER];

let legendElements = document.querySelectorAll('.level-label');
const graphOptions = {
    hsk: {
        display: 'HSK Wordlist',
        prefix: 'hsk',
        legend: hskLegend,
        defaultHanzi: ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"],
        // while the other options load a wordset for the entire language, and use frequency for sorting,
        // HSK is based on a specific test instead. It accordingly places less weight on frequency.
        type: 'test',
        locale: 'zh-CN',
    },
    simplified: {
        display: 'Simplified',
        prefix: 'simplified',
        legend: freqLegend,
        ranks: freqRanks,
        augmentPath: 'data/simplified',
        definitionsAugmentPath: 'data/simplified/definitions',
        partitionCount: 100,
        defaultHanzi: ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"],
        locale: 'zh-CN',
        type: 'frequency',
        hasCoverage: 'all',
        collocationsPath: 'data/simplified/collocations',
        englishPath: 'data/simplified/english'
    },
    traditional: {
        display: 'Traditional',
        prefix: 'traditional',
        legend: freqLegend,
        ranks: freqRanks,
        augmentPath: 'data/traditional',
        definitionsAugmentPath: 'data/traditional/definitions',
        partitionCount: 100,
        locale: 'zh-TW',
        defaultHanzi: ["按", "店", "右", "怕", "舞", "跳", "動"],
        type: 'frequency',
        hasCoverage: 'all',
        collocationsPath: 'data/traditional/collocations',
        englishPath: 'data/traditional/english'
    },
    cantonese: {
        display: 'Cantonese',
        prefix: 'cantonese',
        legend: freqLegend,
        ranks: freqRanks,
        definitionsAugmentPath: 'data/cantonese/definitions',
        partitionCount: 100,
        // TODO(refactor): we differentiate locale from TTS locale due to zh-TW/zh-CN voice coverage, but it's wacky
        ttsKey: 'zh-HK',
        locale: 'zh-HK',
        defaultHanzi: ["我", "哥", "路", "細"],
        transcriptionName: 'jyutping',
        type: 'frequency'
    }
};
let activeGraphKey = 'simplified';

function getPartition(word, numPartitions) {
    let total = 0;
    for (let i = 0; i < word.length; i++) {
        total += word.charCodeAt(i);
    }
    return total % numPartitions;
};

function getActiveGraph() {
    return graphOptions[activeGraphKey];
}

function switchGraph() {
    let value = graphSelector.value;
    if (value !== activeGraphKey) {
        activeGraphKey = value;
        let activeGraph = graphOptions[activeGraphKey];
        let prefix = activeGraph.prefix;
        let promises = [];
        // TODO(refactor): can we combine loading logic here and in main.js?
        //fetch regardless...allow service worker and/or browser cache to optimize
        if (activeGraph.type === 'frequency') {
            promises.push(
                fetch(`/data/${prefix}/wordlist.json`)
                    .then(response => response.json())
                    .then(function (data) {
                        window.wordSet = getWordSetFromFrequency(data);
                        window.hanzi = buildGraphFromFrequencyList(data, activeGraph.ranks);
                        graphChanged();
                    }));
        } else if (activeGraph.type === 'test') {
            promises.push(
                fetch(`/data/${prefix}/graph.json`)
                    .then(response => response.json())
                    .then(function (data) {
                        window.hanzi = data;
                        window.wordSet = getWordLevelsFromGraph(hanzi);
                        graphChanged();
                    })
            );
        }
        promises.push(
            fetch(`/data/${prefix}/sentences.json`)
                .then(response => response.json())
                .then(function (data) {
                    window.sentences = data;
                })
        );
        promises.push(
            fetch(`/data/${prefix}/definitions.json`)
                .then(response => response.json())
                .then(function (data) {
                    window.definitions = data;
                })
        );
        writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
        setTranscriptionLabel();
        updateWalkthrough();
        // TODO(refactor): have recommendations.js react to the character-set-changed event
        legendElements.forEach((x, index) => {
            x.innerText = activeGraph.legend[index];
        });
        Promise.all(promises).then(() => {
            document.dispatchEvent(new CustomEvent('character-set-changed', { detail: activeGraph }));
        });
    }
}

function setTranscriptionLabel() {
    if (showPinyinCheckbox.checked) {
        togglePinyinLabel.innerText = `Turn off ${graphOptions[activeGraphKey].transcriptionName || 'pinyin'} in examples`;
    } else {
        togglePinyinLabel.innerText = `Turn on ${graphOptions[activeGraphKey].transcriptionName || 'pinyin'} in examples`;
    }
}
const walkthroughCharacterSet = document.getElementById('walkthrough-character-set');
function updateWalkthrough() {
    walkthroughCharacterSet.innerText = graphOptions[activeGraphKey].display;
}
function initialize() {
    graphSelector.addEventListener('change', switchGraph);
    showPinyinCheckbox.addEventListener('change', function () {
        setTranscriptionLabel();
        writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
    });

    recommendationsDifficultySelector.addEventListener('change', function () {
        let val = recommendationsDifficultySelector.value;
        // TODO(refactor): should this be another event type? Should recommendations just own this?
        preferencesChanged(val);
        writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
    });

    let pastOptions = readOptionState();
    let urlOptions = parseUrl(document.location.pathname);
    const selectedGraph = getSelectedGraph(pastOptions, urlOptions);
    if (selectedGraph) {
        graphSelector.value = selectedGraph;
        activeGraphKey = selectedGraph;
    }
    if (pastOptions) {
        showPinyinCheckbox.checked = pastOptions.transcriptions;
        showPinyinCheckbox.dispatchEvent(new Event('change'));
        recommendationsDifficultySelector.value = pastOptions.recommendationsDifficulty;
        recommendationsDifficultySelector.dispatchEvent(new Event('change'));
    }
    if (graphOptions[activeGraphKey].type === 'frequency') {
        window.wordSet = getWordSetFromFrequency(window.freqs);
        window.hanzi = buildGraphFromFrequencyList(window.freqs, graphOptions[activeGraphKey].ranks);
    } else {
        window.wordSet = getWordLevelsFromGraph(window.hanzi);
    }
    setTranscriptionLabel();
    updateWalkthrough();
}
function getSelectedGraph(storedOpts, urlOpts) {
    if (urlOpts && urlOpts.graph) {
        return urlOpts.graph;
    } else if (storedOpts && storedOpts.selectedCharacterSet) {
        return storedOpts.selectedCharacterSet;
    }
    return null;
}
// TODO(refactor): does this belong here?
function parseUrl(path) {
    if (path[0] === '/') {
        path = path.substring(1);
    }
    const segments = path.split('/');
    if (segments.length === 1) {
        if (segments[0] in graphOptions) {
            return { graph: segments[0] };
        } else {
            return { word: decodeURIComponent(segments[0]) };
        }
    } else if (segments.length === 2) {
        return { graph: segments[0], word: decodeURIComponent(segments[1]) };
    }
    return {};
}

export { initialize, getActiveGraph, getPartition, parseUrl }