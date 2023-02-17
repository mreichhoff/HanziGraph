import { graphChanged, preferencesChanged } from "./recommendations.js"
import { readOptionState, writeOptionState } from "./data-layer.js"

const graphSelector = document.getElementById('graph-selector');
const showPinyinCheckbox = document.getElementById('show-pinyin');
const togglePinyinLabel = document.getElementById('toggle-pinyin-label');
const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
let freqLegend = ['Top500', 'Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k'];
let bigFreqLegend = ['Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k', '>10k'];

let legendElements = document.querySelectorAll('.level-label');
let graphOptions = {
    oldHsk: {
        display: 'HSK Wordlist', prefix: 'hsk', legend: hskLegend, defaultHanzi: ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"]
    },
    simplified: {
        display: 'Simplified', prefix: 'simplified', legend: bigFreqLegend, augmentPath: 'data/simplified', partitionCount: 100, defaultHanzi: ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"]
    },
    traditional: {
        display: 'Traditional', prefix: 'traditional', legend: bigFreqLegend, augmentPath: 'data/traditional', partitionCount: 100, defaultHanzi: ["按", "店", "右", "怕", "舞", "跳", "動"]
    },
    cantonese: {
        display: 'Cantonese', prefix: 'cantonese', legend: freqLegend, ttsKey: 'zh-HK', defaultHanzi: ["我", "哥", "路", "細"], transcriptionName: 'jyutping'
    }
};
let activeGraphKey = 'simplified';

function getActiveGraph() {
    return graphOptions[activeGraphKey];
}

function switchGraph() {
    let value = graphSelector.value;
    if (value !== activeGraphKey) {
        activeGraphKey = value;
        let activeGraph = graphOptions[activeGraphKey];
        let prefix = activeGraph.prefix;
        //fetch regardless...allow service worker and/or browser cache to optimize
        fetch(`./data/${prefix}/graph.json`)
            .then(response => response.json())
            .then(function (data) {
                window.hanzi = data;
                graphChanged();
                legendElements.forEach((x, index) => {
                    x.innerText = activeGraph.legend[index];
                });
                // TODO(refactor): this will need to change as we switch to a frequency list...
                window.wordSet = getWordSet(hanzi);
            });
        fetch(`./data/${prefix}/sentences.json`)
            .then(response => response.json())
            .then(function (data) {
                window.sentences = data;
            });
        fetch(`./data/${prefix}/definitions.json`)
            .then(response => response.json())
            .then(function (data) {
                window.definitions = data;
            });
        writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
        setTranscriptionLabel();
        document.dispatchEvent(new Event('character-set-changed'));
    }
}

function getWordSet(graph) {
    //yeah, probably a better way...
    let wordSet = new Set();
    Object.keys(graph).forEach(x => {
        wordSet.add(x);
        Object.keys(graph[x].edges || {}).forEach(edge => {
            graph[x].edges[edge].words.forEach(word => {
                wordSet.add(word);
            });
        });
    });
    return wordSet;
};

function setTranscriptionLabel() {
    if (showPinyinCheckbox.checked) {
        togglePinyinLabel.innerText = `Turn off ${graphOptions[activeGraphKey].transcriptionName || 'pinyin'} in examples`;
    } else {
        togglePinyinLabel.innerText = `Turn on ${graphOptions[activeGraphKey].transcriptionName || 'pinyin'} in examples`;
    }
}
function initialize() {
    graphSelector.addEventListener('change', switchGraph);
    showPinyinCheckbox.addEventListener('change', function () {
        setTranscriptionLabel();
        writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
    });

    recommendationsDifficultySelector.addEventListener('change', function () {
        let val = recommendationsDifficultySelector.value;
        preferencesChanged(val);
        writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
    });

    //TODO(refactor): make readOptionState in data-layer.js, make a write method too, passing in state from this class
    // then remove all the options state from base, which is mostly in its initialize.
    // we'll then use different localstorage keys for options state (simplified vs traditional, pinyin checked, etc) vs 
    // the current UI state (which orchestrator should own) vs what is shown in graph and explore (which explore should own)
    // though maybe graph could own some too....
    let pastOptions = readOptionState();
    if (pastOptions) {
        graphSelector.value = pastOptions.selectedCharacterSet;
        activeGraphKey = pastOptions.selectedCharacterSet;
        showPinyinCheckbox.checked = pastOptions.transcriptions;
        showPinyinCheckbox.dispatchEvent(new Event('change'));
        recommendationsDifficultySelector.value = pastOptions.recommendationsDifficulty;
        recommendationsDifficultySelector.dispatchEvent(new Event('change'));
    }
    window.wordSet = getWordSet(hanzi);
}

export { initialize, getActiveGraph }