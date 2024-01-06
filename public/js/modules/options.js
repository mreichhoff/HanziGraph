import { readOptionState, writeOptionState } from "./data-layer.js"
import { getWordLevelsFromGraph, getWordSetFromFrequency, buildGraphFromFrequencyList } from "./graph-functions.js";

const graphSelector = document.getElementById('graph-selector');
const showPinyinCheckbox = document.getElementById('show-pinyin');
const togglePinyinLabel = document.getElementById('toggle-pinyin-label');
const offlineItem = document.getElementById('offline-item');
const offlineButton = document.getElementById('offline-button');

let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
let freqLegend = ['Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k', '>10k'];
let freqRanks = [1000, 2000, 4000, 7000, 10000, Number.MAX_SAFE_INTEGER];

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
        // just redirect instead of trying to modify data in place.
        // this also ensures the change is clear to the user (to the extent the initial page is clear)
        // unfortunately, it also may make offline use slightly worse
        // TODO: make offline behavior better
        document.location.href = `/${prefix}`;
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
        writeOptionState(showPinyinCheckbox.checked, activeGraphKey);
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
    }
    if (graphOptions[activeGraphKey].type === 'frequency') {
        window.wordSet = getWordSetFromFrequency(window.freqs);
        window.hanzi = buildGraphFromFrequencyList(window.freqs, graphOptions[activeGraphKey].ranks);
    } else {
        window.wordSet = getWordLevelsFromGraph(window.hanzi);
    }
    setTranscriptionLabel();
    updateWalkthrough();
    setupMakeOfflineButton();
}
let loadingIndicatorInterval = null;
let iterations = 0;

function addOfflineEventHandler(offlineButton, registration) {
    offlineButton.addEventListener('click', function () {
        offlineButton.innerText = "Loading...";
        iterations = 0;
        loadingIndicatorInterval = setInterval(() => {
            offlineButton.innerText += '.';
            iterations++;
            if (iterations > 100) {
                // RIP
                // TODO: abortsignal in cache addall to enforce timeout?
                clearInterval(loadingIndicatorInterval);
            }
        }, 1000);
        registration.active.postMessage({
            type: 'getPaths',
            paths: getPathsForOfflineUse()
        });
    }, { once: true });
}
// TODO: find a better home for this, and make the checks more robust
// (e.g., including online check, options for what to cache, quota/space check, etc.)
async function setupMakeOfflineButton() {
    if (!('serviceWorker' in navigator)) {
        offlineItem.style.display = 'none';
        return;
    }
    // not partitioned, so no need.
    if (!graphOptions[activeGraphKey].partitionCount) {
        offlineItem.style.display = 'none';
        return;
    }
    // oh no
    navigator.serviceWorker.ready.then((registration) => {
        navigator.serviceWorker.addEventListener('message', (message) => {
            if (message.data.type === 'checkHasPathsResponse') {
                // either tell the user the data is available, or give them the option to download it.
                offlineItem.removeAttribute('style');
                if (!message.data.result) {
                    addOfflineEventHandler(offlineButton, registration);
                } else {
                    offlineButton.innerText = "✅ Dictionary cached";
                }
                return;
            }
            if (message.data.type === 'getPathsResponse') {
                clearInterval(loadingIndicatorInterval);
                if (message.data.result) {
                    offlineButton.innerText = "✅ Dictionary cached";
                } else {
                    offlineButton.innerText = "Sorry, there was an error. Click to retry.";
                    addOfflineEventHandler(offlineButton, registration);
                }
                return;
            }
        });
        registration.active.postMessage({
            type: 'checkHasPaths',
            paths: getPathsForOfflineUse()
        });
    });
}
function getPathsForOfflineUse() {
    const activeGraph = getActiveGraph();

    let paths = [];
    paths.push(`/data/${activeGraph.prefix}/sentences.json`);
    paths.push(`/data/${activeGraph.prefix}/definitions.json`);
    paths.push('/data/components/components.json');
    paths.push(`/data/${activeGraph.prefix}/wordlist.json`);
    if (activeGraph.hasCoverage === 'all') {
        paths.push(`/data/${activeGraph.prefix}/coverage_stats.json`);
        paths.push(`/data/${activeGraph.prefix}/character_freq_list.json`);
    }
    for (let i = 0; i < activeGraph.partitionCount; i++) {
        paths.push(`/${activeGraph.definitionsAugmentPath}/${i}.json`);
        paths.push(`/${activeGraph.englishPath}/${i}.json`);
    }
    return paths;
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
    } else if (segments.length === 3) {
        return { graph: segments[0], word: decodeURIComponent(segments[1]), mode: segments[2] };
    }
    return {};
}

export { initialize, getActiveGraph, getPartition, parseUrl }