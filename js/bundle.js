(function () {
    'use strict';

    const leftButtonContainer = document.getElementById('left-menu-button-container');
    const rightButtonContainer = document.getElementById('right-menu-button-container');
    const leftButton = document.getElementById('left-menu-button');
    const rightButton$1 = document.getElementById('right-menu-button');

    const mainAppContainer = document.getElementById('main-app-container');
    const statsContainer$1 = document.getElementById('stats-container');
    const faqContainer$1 = document.getElementById('faq-container');
    const menuContainer = document.getElementById('menu-container');

    const explorePane = document.getElementById('explore-container');
    const studyPane = document.getElementById('study-container');

    const containers = [mainAppContainer, statsContainer$1, faqContainer$1, menuContainer];
    const panes = [explorePane, studyPane];

    // TODO(refactor): I'm gonna go out on a limb and say there's a better way...
    const stateKeys = {
        main: 'main',
        study: 'study',
        faq: 'faq',
        stats: 'stats',
        menu: 'menu'
    };

    const states = {
        main: {
            leftButtonClass: 'menu-button',
            rightButtonClass: 'study-button',
            activeContainer: mainAppContainer,
            activePane: explorePane,
            leftState: 'menu',
            rightState: 'study',
            paneAnimation: 'slide-in'
        },
        study: {
            leftButtonClass: 'menu-button',
            rightButtonClass: 'explore-button',
            activeContainer: mainAppContainer,
            activePane: studyPane,
            leftState: 'menu',
            rightState: 'main',
            paneAnimation: 'slide-in'
        },
        faq: {
            leftButtonClass: 'exit-button',
            activeContainer: faqContainer$1,
            statePreserving: true,
            leftState: 'previous',
            animation: 'slide-in'
        },
        stats: {
            leftButtonClass: 'exit-button',
            activeContainer: statsContainer$1,
            statePreserving: true,
            leftState: 'main',
            animation: 'slide-in'
        },
        menu: {
            leftButtonClass: 'exit-button',
            activeContainer: menuContainer,
            statePreserving: true,
            leftState: 'previous',
            animation: 'slide-in'
        }
    };

    let prevState = null;
    let currentState = stateKeys.main;

    function switchToState(state) {
        if (state === currentState) {
            // no sense doing extra work...
            return;
        }
        // if we don't have the new state, treat it as indicating we must go back
        // for now we don't support chains of back/forward, it's just one
        const stateConfig = states[state] || states[prevState];

        for (const container of containers) {
            if (container.id !== stateConfig.activeContainer.id) {
                container.style.display = 'none';
                container.dispatchEvent(new Event('hidden'));
            }
        }
        stateConfig.activeContainer.removeAttribute('style');
        stateConfig.activeContainer.dispatchEvent(new Event('shown'));
        if (stateConfig.animation) {
            stateConfig.activeContainer.classList.add(stateConfig.animation);
            stateConfig.activeContainer.addEventListener('animationend', function () {
                stateConfig.activeContainer.classList.remove(stateConfig.animation);
            }, { once: true });
        }

        if (stateConfig.activePane) {
            for (const pane of panes) {
                if (pane.id !== stateConfig.activePane.id) {
                    pane.style.display = 'none';
                    pane.dispatchEvent(new Event('hidden'));
                }
            }
            stateConfig.activePane.removeAttribute('style');
            stateConfig.activePane.dispatchEvent(new Event('shown'));
            if (stateConfig.paneAnimation) {
                stateConfig.activePane.classList.add(stateConfig.paneAnimation);
                stateConfig.activePane.addEventListener('animationend', function () {
                    stateConfig.activePane.classList.remove(stateConfig.paneAnimation);
                }, { once: true });
            }
        }
        if (stateConfig.leftButtonClass) {
            leftButton.className = stateConfig.leftButtonClass;
            leftButton.removeAttribute('style');
        } else {
            leftButton.style.display = 'none';
        }
        if (stateConfig.rightButtonClass) {
            rightButton$1.className = stateConfig.rightButtonClass;
            rightButton$1.removeAttribute('style');
        } else {
            rightButton$1.style.display = 'none';
        }
        // this 'previous' string thing is weird, but it might just work
        // (until we need any notion of reentrancy)
        let tmp = prevState;
        if (stateConfig.statePreserving) {
            prevState = currentState;
        } else {
            prevState = null;
        }
        if (state === 'previous') {
            currentState = tmp;
        } else {
            currentState = state;
        }
    }

    const diagrams = {
        main: {
            element: document.getElementById('graph-container'),
            animation: 'slide-from-right'
        },
        flow: {
            element: document.getElementById('flow-diagram-container'),
            animation: 'slide-from-right'
        }
    };
    const diagramKeys = { main: 'main', flow: 'flow' };
    let currentDiagramKey = diagramKeys.main;

    function switchDiagramView(diagramKey) {
        if (diagramKey === currentDiagramKey) {
            return;
        }
        for (const [key, diagram] of Object.entries(diagrams)) {
            if (key !== diagramKey) {
                diagram.element.style.display = 'none';
                diagram.element.dispatchEvent(new Event('hidden'));
            } else {
                diagram.element.removeAttribute('style');
                diagram.element.classList.add(diagram.animation);
                diagram.element.addEventListener('animationend', function () {
                    diagram.element.classList.remove(diagram.animation);
                }, { once: true });
                diagram.element.dispatchEvent(new Event('shown'));
            }
        }
        currentDiagramKey = diagramKey;
    }

    function initialize$9() {
        leftButtonContainer.addEventListener('click', function () {
            if (states[currentState].leftState) {
                switchToState(states[currentState].leftState);
            }
        });
        rightButtonContainer.addEventListener('click', function () {
            if (states[currentState].rightState) {
                switchToState(states[currentState].rightState);
            }
        });
    }

    const faqContainer = document.getElementById('faq-container');
    const faqStudyMode = document.getElementById('faq-study-mode');
    const faqRecommendations = document.getElementById('faq-recommendations');
    const faqFlow = document.getElementById('faq-flow');
    const faqContext = document.getElementById('faq-context');
    const faqGeneral = document.getElementById('faq-general');
    const showStudyFaq = document.getElementById('show-study-faq');
    const showGeneralFaq = document.getElementById('show-general-faq');

    //TODO should combine with faqTypes
    const faqTypesToElement = {
        studyMode: faqStudyMode,
        context: faqContext,
        general: faqGeneral,
        recommendations: faqRecommendations,
        flow: faqFlow
    };
    const faqTypes = {
        studyMode: 'studyMode',
        context: 'context',
        general: 'general',
        recommendations: 'recommendations',
        flow: 'flow'
    };

    let showFaq = function (faqType) {
        switchToState(stateKeys.faq);
        faqTypesToElement[faqType].removeAttribute('style');
    };

    let initialize$8 = function () {
        faqContainer.addEventListener('hidden', function () {
            Object.values(faqTypesToElement).forEach(x => {
                x.style.display = 'none';
            });
        });
        showStudyFaq.addEventListener('click', function () {
            showFaq(faqTypes.studyMode);
        });
        showGeneralFaq.addEventListener('click', function () {
            showFaq(faqTypes.general);
        });
    };

    const dataTypes = {
        visited: 'visited',
        studyList: 'studyList',
        studyResults: 'studyResults'
    };
    let callbacks = {
        visited: [],
        studyList: [],
        studyResults: []
    };
    const studyResult = {
        CORRECT: 'correct',
        INCORRECT: 'incorrect'
    };
    const cardTypes = {
        RECOGNITION: 'recognition',
        RECALL: 'recall',
        CLOZE: 'cloze'
    };
    const MAX_RECALL = 2;
    const MAX_CLOZE = 2;

    let studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
    let studyResults = JSON.parse(localStorage.getItem('studyResults') || '{"hourly":{},"daily":{}}');
    let visited = JSON.parse(localStorage.getItem('visited') || '{}');

    let getStudyResults = function () {
        return studyResults;
    };
    let getVisited = function () {
        return visited;
    };
    //note: nodes will be marked visited when the user searches for or taps a node in the graph
    //for now, avoiding marking nodes visited via clicking a hanzi in an example or card
    //because in those cases no examples are shown
    let updateVisited = function (nodes) {
        for (let i = 0; i < nodes.length; i++) {
            for (let j = 0; j < nodes[i].length; j++) {
                if (!visited[nodes[i][j]]) {
                    visited[nodes[i][j]] = 0;
                }
                visited[nodes[i][j]]++;
            }
        }
        localStorage.setItem('visited', JSON.stringify(visited));
        callbacks[dataTypes.visited].forEach(x => x(visited));
    };

    let registerCallback = function (dataType, callback) {
        callbacks[dataType].push(callback);
    };

    let saveStudyList = function (keys, localStudyList) {
        localStorage.setItem('studyList', JSON.stringify(studyList));
    };
    let updateCard = function (result, key) {
        let now = new Date();
        if (result === studyResult.INCORRECT) {
            studyList[key].nextJump = 0.5;
            studyList[key].wrongCount++;
            studyList[key].due = now.valueOf();
        } else {
            let nextJump = studyList[key].nextJump || 0.5;
            studyList[key].nextJump = nextJump * 2;
            studyList[key].rightCount++;
            studyList[key].due = now.valueOf() + (nextJump * 24 * 60 * 60 * 1000);
        }
        saveStudyList();
    };
    let addRecallCards = function (newCards, text, newKeys) {
        let total = Math.min(MAX_RECALL, newCards.length);
        for (let i = 0; i < total; i++) {
            let key = newCards[i].zh.join('') + cardTypes.RECALL;
            if (!studyList[key] && newCards[i].en) {
                newKeys.push(key);
                studyList[key] = {
                    en: newCards[i].en,
                    due: Date.now() + newCards.length + i,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    type: cardTypes.RECALL,
                    vocabOrigin: text,
                    added: Date.now()
                };
            }
        }
    };
    // TODO: may be better combined with addRecallCards...
    let addClozeCards = function (newCards, text, newKeys) {
        let added = 0;
        for (let i = 0; i < newCards.length; i++) {
            if (added == MAX_CLOZE) {
                return;
            }
            // don't make cloze cards with the exact text
            if (newCards[i].zh.join('').length <= text.length) {
                continue;
            }
            let key = newCards[i].zh.join('') + cardTypes.CLOZE;
            if (!studyList[key] && newCards[i].en) {
                added++;
                newKeys.push(key);
                studyList[key] = {
                    en: newCards[i].en,
                    // due after the recognition cards, for some reason
                    due: Date.now() + newCards.length + i,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    type: cardTypes.CLOZE,
                    vocabOrigin: text,
                    added: Date.now()
                };
            }
        }
    };
    let addCards = function (currentExamples, text) {
        let newCards = currentExamples[text].map((x, i) => ({ ...x, due: Date.now() + i }));
        let newKeys = [];
        for (let i = 0; i < newCards.length; i++) {
            let zhJoined = newCards[i].zh.join('');
            if (!studyList[zhJoined] && newCards[i].en) {
                newKeys.push(zhJoined);
                studyList[zhJoined] = {
                    en: newCards[i].en,
                    due: newCards[i].due,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    type: cardTypes.RECOGNITION,
                    vocabOrigin: text,
                    added: Date.now()
                };
            }
        }
        addRecallCards(newCards, text, newKeys);
        addClozeCards(newCards, text, newKeys);
        //TODO: remove these keys from /deleted/ to allow re-add
        //update it whenever it changes
        saveStudyList();
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
    };

    let inStudyList = function (text) {
        return studyList[text];
    };

    let getCardPerformance = function (character) {
        let count = 0;
        let correct = 0;
        let incorrect = 0;
        //TODO: if performance becomes an issue, we can pre-compute this
        //as-is, it performs fine even with larger flashcard decks
        Object.keys(studyList || {}).forEach(x => {
            if (x.indexOf(character) >= 0) {
                count++;
                correct += studyList[x].rightCount;
                incorrect += studyList[x].wrongCount;
            }
        });
        return { count: count, performance: Math.round(100 * correct / ((correct + incorrect) || 1)) };
    };

    let getStudyList = function () {
        return studyList;
    };
    let findOtherCards = function (seeking, currentKey) {
        let cards = Object.keys(studyList);
        let candidates = cards.filter(x => x !== currentKey && (!studyList[x].type || studyList[x].type === cardTypes.RECOGNITION) && x.includes(seeking)).sort((a, b) => studyList[b].rightCount - studyList[a].rightCount);
        return candidates;
    };

    let removeFromStudyList = function (key) {
        delete studyList[key];
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
        saveStudyList();
    };

    let getISODate = function (date) {
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

    let recordEvent = function (result) {
        let currentDate = new Date();
        let hour = currentDate.getHours();
        let day = getISODate(currentDate);
        if (!studyResults.hourly[hour]) {
            studyResults.hourly[hour] = {};
            studyResults.hourly[hour][studyResult.CORRECT] = 0;
            studyResults.hourly[hour][studyResult.INCORRECT] = 0;
        }
        //fix up any potential missing properties
        if (!studyResults.hourly[hour][result]) {
            studyResults.hourly[hour][result] = 0;
        }
        studyResults.hourly[hour][result]++;
        if (!studyResults.daily[day]) {
            studyResults.daily[day] = {};
            studyResults.daily[day][studyResult.CORRECT] = 0;
            studyResults.daily[day][studyResult.INCORRECT] = 0;
        }
        if (!studyResults.daily[day][result]) {
            studyResults.daily[day][result] = 0;
        }
        studyResults.daily[day][result]++;
        localStorage.setItem('studyResults', JSON.stringify(studyResults));
        callbacks[dataTypes.studyResults].forEach(x => x(studyResults));
    };

    let readOptionState = function () {
        return JSON.parse(localStorage.getItem('options'));
    };
    let writeOptionState = function (showPinyin, recommendationsDifficulty, selectedCharacterSet) {
        localStorage.setItem('options', JSON.stringify({
            transcriptions: showPinyin,
            recommendationsDifficulty: recommendationsDifficulty,
            selectedCharacterSet: selectedCharacterSet
        }));
    };

    let readExploreState = function () {
        return JSON.parse(localStorage.getItem('exploreState'));
    };
    let writeExploreState = function (words) {
        localStorage.setItem('exploreState', JSON.stringify({
            words: words
        }));
    };

    // TODO(refactor): there probably shouldn't be shared elements, but going this route for now
    const hanziBox = document.getElementById('hanzi-box');
    const notFoundElement = document.getElementById('not-found-message');
    const walkThrough = document.getElementById('walkthrough');

    const graphContainer = document.getElementById('graph');

    let cy = null;
    let currentPath = [];
    // TODO(refactor): consolidate with options
    let ranks = [1000, 2000, 4000, 7000, 10000, Number.MAX_SAFE_INTEGER];

    function findRank(word) {
        if (!window.wordSet || !(word in wordSet)) {
            return ranks.length;
        }
        let freq = wordSet[word];
        for (let i = 0; i < ranks.length; i++) {
            if (freq < ranks[i]) {
                return i + 1;
            }
        }
        return ranks.length;
    }
    function addEdge(base, target, word) {
        if (!hanzi[base] || !hanzi[target]) { return; }
        if (base === target) { return; }
        if (!hanzi[base].edges[target]) {
            hanzi[base].edges[target] = {
                level: findRank(word),
                words: []
            };
        }
        if (hanzi[base].edges[target].words.indexOf(word) < 0) {
            // not that efficient, but words is very small
            hanzi[base].edges[target].words.push(word);
        }
    }
    function addEdges(word) {
        for (let i = 0; i < word.length - 1; i++) {
            addEdge(word[i], word[i + 1], word);
        }
        if (word.length > 1) {
            // also connect last to first
            addEdge(word[word.length - 1], word[0], word);
        }
    }
    function dfs(start, elements, maxDepth, visited) {
        if (maxDepth < 0) {
            return;
        }
        let curr = hanzi[start];
        //todo does javascript have a set?
        visited[start] = true;
        for (const [key, value] of Object.entries(curr.edges)) {
            //don't add outgoing edges when we won't process the next layer
            if (maxDepth > 0) {
                if (!visited[key]) {
                    elements.edges.push({
                        data: {
                            id: Array.from(start + key).sort().toString(),
                            source: start, target: key,
                            level: value.level,
                            words: value.words,
                            // render examples for all words, but only display one
                            displayWord: value.words[0]
                        }
                    });
                }
            }
        }
        elements.nodes.push({ data: { id: start, level: curr.node.level } });
        for (const key of Object.keys(curr.edges)) {
            if (!visited[key]) {
                dfs(key, elements, maxDepth - 1, visited);
            }
        }
    }
    function levelColor(element) {
        let level = element.data('level');
        switch (level) {
            case 6:
                return '#68aaee';
            case 5:
                return '#de68ee';
            case 4:
                return '#6de200';
            case 3:
                return '#fff249';
            case 2:
                return '#ff9b35';
            case 1:
                return '#ff635f';
        }
    }

    function layout(numNodes) {
        //very scientifically chosen 95 (不 was slow to load)
        //the grid layout appears to be far faster than cose
        //keeping root around in case we want to switch back to bfs
        if (numNodes > 95) {
            return {
                name: 'grid'
            };
        }
        return {
            name: 'cose',
            animate: false
        };
    }
    function getStylesheet() {
        //TODO make this injectable
        let prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return [
            {
                selector: 'node',
                style: {
                    'background-color': levelColor,
                    'label': 'data(id)',
                    'color': 'black',
                    'font-size': '16px',
                    'text-valign': 'center',
                    'text-halign': 'center'
                }
            },
            {
                selector: 'edge',
                style: {
                    'line-color': levelColor,
                    'target-arrow-shape': 'none',
                    'curve-style': 'straight',
                    'label': 'data(displayWord)',
                    'color': (_ => prefersDark ? '#eee' : '#000'),
                    'font-size': '10px',
                    'text-background-color': (_ => prefersDark ? '#121212' : '#fff'),
                    'text-background-opacity': '1',
                    'text-background-shape': 'round-rectangle',
                    'text-events': 'yes'
                }
            }
        ];
    }
    function nodeTapHandler(evt) {
        let id = evt.target.id();
        //not needed if currentHanzi contains id, which would mean the nodes have already been added
        //includes O(N) but currentHanzi almost always < 10 elements
        if (currentPath && !currentPath.includes(id)) {
            addToGraph(id);
        }
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [evt.target.id()] } }));
        // notify the flow diagrams...sigh
        document.dispatchEvent(new CustomEvent('graph-interaction', { detail: evt.target.id() }));
        switchToState(stateKeys.main);
    }
    function edgeTapHandler(evt) {
        document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: evt.target.data('words') } }));
        // notify the flow diagrams...sigh
        document.dispatchEvent(new CustomEvent('graph-interaction', { detail: evt.target.data('words')[0] }));
        switchToState(stateKeys.main);
    }
    function setupCytoscape(elements, graphContainer, nodeEventHandler, edgeEventHandler) {
        cy = cytoscape({
            container: graphContainer,
            elements: elements,
            layout: layout(elements.nodes.length),
            style: getStylesheet(),
            maxZoom: 10,
            minZoom: 0.5
        });
        cy.on('tap', 'node', nodeEventHandler);
        cy.on('tap', 'edge', edgeEventHandler);
    }
    function addToGraph(character) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(character, result, maxDepth, {});
        let preNodeCount = cy.nodes().length;
        let preEdgeCount = cy.edges().length;
        cy.add(result);
        if (cy.nodes().length !== preNodeCount || cy.edges().length !== preEdgeCount) {
            //if we've actually added to the graph, re-render it; else just let it be
            cy.layout(layout(cy.nodes().length)).run();
        }
        currentPath.push(character);
    }
    function isInGraph(node) {
        return cy && cy.getElementById(node).length;
    }
    function updateColorScheme() {
        if (!cy) {
            return;
        }
        cy.style(getStylesheet());
    }
    // build a graph based on a word rather than just a character like renderGraph
    function buildGraph(value) {
        // we don't necessarily populate all via the script
        // TODO: move to after DFS. Get the nodes and edges into result, then add. Decide whether modifying `hanzi` is good
        addEdges(value);
        graphContainer.innerHTML = '';
        graphContainer.className = '';
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        // TODO: this is kinda not DFS
        for (const character of value) {
            dfs(character, result, maxDepth, {});
        }
        setupCytoscape(result, graphContainer, nodeTapHandler, edgeTapHandler);
        currentPath = [...value];
    }

    function initialize$7() {
        document.addEventListener('graph-update', function (event) {
            buildGraph(event.detail);
        });
        // TODO(refactor): listen to character-set-changed event
        matchMedia("(prefers-color-scheme: dark)").addEventListener("change", updateColorScheme);
    }

    //TODO: like in other files, remove dups from dom.js if possible
    const recommendationsContainer = document.getElementById('recommendations-container');
    let recommendationsWorker = null;
    let levelPreferences = 'any';


    let initialize$6 = function () {
        recommendationsWorker = new Worker('js/modules/recommendations-worker.js');
        recommendationsWorker.postMessage({
            type: 'graph',
            payload: window.hanzi
        });
        recommendationsWorker.postMessage({
            type: 'visited',
            payload: getVisited()
        });
        // it's possible we remember state from a prior page load, and the variable can be set before initialization.
        if (levelPreferences !== 'any') {
            preferencesChanged(levelPreferences);
        }
        registerCallback(dataTypes.visited, function (visited) {
            recommendationsWorker.postMessage({
                type: 'visited',
                payload: visited
            });
        });
        recommendationsWorker.onmessage = function (e) {
            //this whole function could really use a refactor
            if (e.data.recommendations && e.data.recommendations.length) {
                recommendationsContainer.innerHTML = '';
                let recommendationMessage = document.createElement('span');
                recommendationMessage.style.display = 'none';
                recommendationMessage.innerText = "Recommended:";
                recommendationMessage.className = "recommendation-message";
                recommendationsContainer.appendChild(recommendationMessage);
                recommendationsContainer.removeAttribute('style');
                let usedRecommendation = false;
                for (let i = 0; i < e.data.recommendations.length; i++) {
                    //don't bother recommending items already being shown in the graph
                    if (isInGraph(e.data.recommendations[i])) {
                        continue;
                    }
                    recommendationMessage.removeAttribute('style');
                    let curr = document.createElement('a');
                    curr.innerText = e.data.recommendations[i];
                    curr.className = 'recommendation';
                    curr.addEventListener('click', function (event) {
                        //can I do this?
                        hanziBox.value = event.target.innerText;
                        document.querySelector('#hanzi-choose input[type=submit]').click();
                        event.target.style.display = 'none';
                        let otherRecs = document.querySelectorAll('.recommendation');
                        let stillShown = false;
                        for (let i = 0; i < otherRecs.length; i++) {
                            if (!otherRecs[i].style.display || otherRecs[i].style.display !== 'none') {
                                stillShown = true;
                                break;
                            }
                        }
                        if (!stillShown) {
                            recommendationsContainer.style.visibility = 'hidden';
                        }
                    });
                    recommendationsContainer.appendChild(curr);
                    usedRecommendation = true;
                }
                let recommendationsFaqLink = document.createElement('a');
                recommendationsFaqLink.className = 'active-link';
                recommendationsFaqLink.innerText = "Why?";
                recommendationsFaqLink.addEventListener('click', function () {
                    showFaq(faqTypes.recommendations);
                });
                if (usedRecommendation) {
                    recommendationsContainer.appendChild(recommendationsFaqLink);
                }
            } else {
                recommendationsContainer.style.visibility = 'hidden';
            }
        };
    };
    let graphChanged = function () {
        if (!recommendationsWorker) {
            // if this is called without the worker, NBD. Worst case we'll send it once we initialize.
            return;
        }
        recommendationsWorker.postMessage({
            type: 'graph',
            payload: window.hanzi
        });
    };
    let preferencesChanged = function (val) {
        let minLevel = 1;
        let maxLevel = 6;
        if (val === 'easy') {
            maxLevel = 3;
        } else if (val === 'hard') {
            minLevel = 4;
        }
        levelPreferences = val;
        if (!recommendationsWorker) {
            // if this is called without the worker, NBD. Worst case we'll send it once we initialize.
            return;
        }
        recommendationsWorker.postMessage({
            type: 'levelPreferences',
            payload: {
                minLevel: minLevel,
                maxLevel: maxLevel
            }
        });
    };

    function getWordLevelsFromGraph(graph) {
        let ranks = {};
        Object.keys(graph).forEach(x => {
            ranks[x] = graph[x].node.level;
            Object.keys(graph[x].edges || {}).forEach(edge => {
                graph[x].edges[edge].words.forEach(word => {
                    ranks[word] = graph[x].edges[edge].level;
                });
            });
        });
        return ranks;
    }

    function getWordSetFromFrequency(list) {
        let ranks = {};
        for (let i = 0; i < list.length; i++) {
            ranks[list[i]] = i + 1;//plus one to not zero index frequencies
        }
        return ranks;
    }
    // Attempting to mostly recreate the scripts/hanzi_graph.py on the client...
    function buildGraphFromFrequencyList(freqs, ranks) {
        const maxEdges = 8;
        const maxWordsPerEdge = 2;
        const maxIndexForMultipleWordsOnEdge = 10000;
        let graph = {};
        let currentLevel = 0;
        let maxForCurrentLevel = ranks[currentLevel];
        for (let i = 0; i < freqs.length; i++) {
            if (i > maxForCurrentLevel) {
                currentLevel++;
                maxForCurrentLevel = ranks[currentLevel];
            }
            const word = freqs[i];
            // first, ensure all the characters in this word are in the graph with the current level.
            for (let j = 0; j < word.length; j++) {
                const character = word[j];
                if (!(character in graph)) {
                    graph[character] = {
                        node: {
                            level: currentLevel + 1 //avoid zero index
                        },
                        edges: {}
                    };
                }
            }
            for (let j = 0; j < word.length; j++) {
                const outerCharacter = word[j];
                for (let k = 0; k < word.length; k++) {
                    const character = word[k];
                    if (j === k) {
                        continue;
                    }
                    if (!(outerCharacter in graph[character].edges) && Object.keys(graph[character].edges).length < maxEdges) {
                        graph[character].edges[outerCharacter] = { level: currentLevel + 1, words: [] };
                    }
                    if (graph[character].edges[outerCharacter] && graph[character].edges[outerCharacter].words.length < maxWordsPerEdge
                        && !graph[character].edges[outerCharacter].words.includes(word)) {
                        if (i < maxIndexForMultipleWordsOnEdge || graph[character].edges[outerCharacter].words.length === 0) {
                            graph[character].edges[outerCharacter].words.push(word);
                        }
                    }
                }
            }
        }
        return graph;
    }

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
            collocationsPath: 'data/simplified/collocations'
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
            collocationsPath: 'data/traditional/collocations'
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
    }
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
                    fetch(`./data/${prefix}/wordlist.json`)
                        .then(response => response.json())
                        .then(function (data) {
                            window.wordSet = getWordSetFromFrequency(data);
                            window.hanzi = buildGraphFromFrequencyList(data, activeGraph.ranks);
                            graphChanged();
                        }));
            } else if (activeGraph.type === 'test') {
                promises.push(
                    fetch(`./data/${prefix}/graph.json`)
                        .then(response => response.json())
                        .then(function (data) {
                            window.hanzi = data;
                            window.wordSet = getWordLevelsFromGraph(hanzi);
                            graphChanged();
                        })
                );
            }
            promises.push(
                fetch(`./data/${prefix}/sentences.json`)
                    .then(response => response.json())
                    .then(function (data) {
                        window.sentences = data;
                    })
            );
            promises.push(
                fetch(`./data/${prefix}/definitions.json`)
                    .then(response => response.json())
                    .then(function (data) {
                        window.definitions = data;
                    })
            );
            writeOptionState(showPinyinCheckbox.checked, recommendationsDifficultySelector.value, activeGraphKey);
            setTranscriptionLabel();
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
    function initialize$5() {
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
        if (pastOptions) {
            graphSelector.value = pastOptions.selectedCharacterSet;
            activeGraphKey = pastOptions.selectedCharacterSet;
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
    }

    function ascending$1(a, b) {
      return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function descending(a, b) {
      return a == null || b == null ? NaN
        : b < a ? -1
        : b > a ? 1
        : b >= a ? 0
        : NaN;
    }

    function bisector(f) {
      let compare1, compare2, delta;

      // If an accessor is specified, promote it to a comparator. In this case we
      // can test whether the search value is (self-) comparable. We can’t do this
      // for a comparator (except for specific, known comparators) because we can’t
      // tell if the comparator is symmetric, and an asymmetric comparator can’t be
      // used to test whether a single value is comparable.
      if (f.length !== 2) {
        compare1 = ascending$1;
        compare2 = (d, x) => ascending$1(f(d), x);
        delta = (d, x) => f(d) - x;
      } else {
        compare1 = f === ascending$1 || f === descending ? f : zero$1;
        compare2 = f;
        delta = f;
      }

      function left(a, x, lo = 0, hi = a.length) {
        if (lo < hi) {
          if (compare1(x, x) !== 0) return hi;
          do {
            const mid = (lo + hi) >>> 1;
            if (compare2(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          } while (lo < hi);
        }
        return lo;
      }

      function right(a, x, lo = 0, hi = a.length) {
        if (lo < hi) {
          if (compare1(x, x) !== 0) return hi;
          do {
            const mid = (lo + hi) >>> 1;
            if (compare2(a[mid], x) <= 0) lo = mid + 1;
            else hi = mid;
          } while (lo < hi);
        }
        return lo;
      }

      function center(a, x, lo = 0, hi = a.length) {
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function zero$1() {
      return 0;
    }

    function number$2(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending$1);
    const bisectRight = ascendingBisect.right;
    bisector(number$2).center;
    var bisect = bisectRight;

    function extent(values, valueof) {
      let min;
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null) {
            if (min === undefined) {
              if (value >= value) min = max = value;
            } else {
              if (min > value) min = value;
              if (max < value) max = value;
            }
          }
        }
      }
      return [min, max];
    }

    class InternMap extends Map {
      constructor(entries, key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        if (entries != null) for (const [key, value] of entries) this.set(key, value);
      }
      get(key) {
        return super.get(intern_get(this, key));
      }
      has(key) {
        return super.has(intern_get(this, key));
      }
      set(key, value) {
        return super.set(intern_set(this, key), value);
      }
      delete(key) {
        return super.delete(intern_delete(this, key));
      }
    }

    class InternSet extends Set {
      constructor(values, key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        if (values != null) for (const value of values) this.add(value);
      }
      has(value) {
        return super.has(intern_get(this, value));
      }
      add(value) {
        return super.add(intern_set(this, value));
      }
      delete(value) {
        return super.delete(intern_delete(this, value));
      }
    }

    function intern_get({_intern, _key}, value) {
      const key = _key(value);
      return _intern.has(key) ? _intern.get(key) : value;
    }

    function intern_set({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) return _intern.get(key);
      _intern.set(key, value);
      return value;
    }

    function intern_delete({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) {
        value = _intern.get(key);
        _intern.delete(key);
      }
      return value;
    }

    function keyof(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    const e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function tickSpec(start, stop, count) {
      const step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log10(step)),
          error = step / Math.pow(10, power),
          factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
      let i1, i2, inc;
      if (power < 0) {
        inc = Math.pow(10, -power) / factor;
        i1 = Math.round(start * inc);
        i2 = Math.round(stop * inc);
        if (i1 / inc < start) ++i1;
        if (i2 / inc > stop) --i2;
        inc = -inc;
      } else {
        inc = Math.pow(10, power) * factor;
        i1 = Math.round(start / inc);
        i2 = Math.round(stop / inc);
        if (i1 * inc < start) ++i1;
        if (i2 * inc > stop) --i2;
      }
      if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
      return [i1, i2, inc];
    }

    function ticks(start, stop, count) {
      stop = +stop, start = +start, count = +count;
      if (!(count > 0)) return [];
      if (start === stop) return [start];
      const reverse = stop < start, [i1, i2, inc] = reverse ? tickSpec(stop, start, count) : tickSpec(start, stop, count);
      if (!(i2 >= i1)) return [];
      const n = i2 - i1 + 1, ticks = new Array(n);
      if (reverse) {
        if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) / -inc;
        else for (let i = 0; i < n; ++i) ticks[i] = (i2 - i) * inc;
      } else {
        if (inc < 0) for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) / -inc;
        else for (let i = 0; i < n; ++i) ticks[i] = (i1 + i) * inc;
      }
      return ticks;
    }

    function tickIncrement(start, stop, count) {
      stop = +stop, start = +start, count = +count;
      return tickSpec(start, stop, count)[2];
    }

    function tickStep(start, stop, count) {
      stop = +stop, start = +start, count = +count;
      const reverse = stop < start, inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
      return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
    }

    function max$1(values, valueof) {
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      }
      return max;
    }

    function range(start, stop, step) {
      start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

      var i = -1,
          n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
          range = new Array(n);

      while (++i < n) {
        range[i] = start + i * step;
      }

      return range;
    }

    function map$1(values, mapper) {
      if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
      if (typeof mapper !== "function") throw new TypeError("mapper is not a function");
      return Array.from(values, (value, index) => mapper(value, index, values));
    }

    function union(...others) {
      const set = new InternSet();
      for (const other of others) {
        for (const o of other) {
          set.add(o);
        }
      }
      return set;
    }

    function identity$3(x) {
      return x;
    }

    var top = 1,
        right$1 = 2,
        bottom = 3,
        left$1 = 4,
        epsilon$2 = 1e-6;

    function translateX(x) {
      return "translate(" + x + ",0)";
    }

    function translateY(y) {
      return "translate(0," + y + ")";
    }

    function number$1(scale) {
      return d => +scale(d);
    }

    function center$1(scale, offset) {
      offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
      if (scale.round()) offset = Math.round(offset);
      return d => +scale(d) + offset;
    }

    function entering() {
      return !this.__axis;
    }

    function axis(orient, scale) {
      var tickArguments = [],
          tickValues = null,
          tickFormat = null,
          tickSizeInner = 6,
          tickSizeOuter = 6,
          tickPadding = 3,
          offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5,
          k = orient === top || orient === left$1 ? -1 : 1,
          x = orient === left$1 || orient === right$1 ? "x" : "y",
          transform = orient === top || orient === bottom ? translateX : translateY;

      function axis(context) {
        var values = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain()) : tickValues,
            format = tickFormat == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity$3) : tickFormat,
            spacing = Math.max(tickSizeInner, 0) + tickPadding,
            range = scale.range(),
            range0 = +range[0] + offset,
            range1 = +range[range.length - 1] + offset,
            position = (scale.bandwidth ? center$1 : number$1)(scale.copy(), offset),
            selection = context.selection ? context.selection() : context,
            path = selection.selectAll(".domain").data([null]),
            tick = selection.selectAll(".tick").data(values, scale).order(),
            tickExit = tick.exit(),
            tickEnter = tick.enter().append("g").attr("class", "tick"),
            line = tick.select("line"),
            text = tick.select("text");

        path = path.merge(path.enter().insert("path", ".tick")
            .attr("class", "domain")
            .attr("stroke", "currentColor"));

        tick = tick.merge(tickEnter);

        line = line.merge(tickEnter.append("line")
            .attr("stroke", "currentColor")
            .attr(x + "2", k * tickSizeInner));

        text = text.merge(tickEnter.append("text")
            .attr("fill", "currentColor")
            .attr(x, k * spacing)
            .attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));

        if (context !== selection) {
          path = path.transition(context);
          tick = tick.transition(context);
          line = line.transition(context);
          text = text.transition(context);

          tickExit = tickExit.transition(context)
              .attr("opacity", epsilon$2)
              .attr("transform", function(d) { return isFinite(d = position(d)) ? transform(d + offset) : this.getAttribute("transform"); });

          tickEnter
              .attr("opacity", epsilon$2)
              .attr("transform", function(d) { var p = this.parentNode.__axis; return transform((p && isFinite(p = p(d)) ? p : position(d)) + offset); });
        }

        tickExit.remove();

        path
            .attr("d", orient === left$1 || orient === right$1
                ? (tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1)
                : (tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1));

        tick
            .attr("opacity", 1)
            .attr("transform", function(d) { return transform(position(d) + offset); });

        line
            .attr(x + "2", k * tickSizeInner);

        text
            .attr(x, k * spacing)
            .text(format);

        selection.filter(entering)
            .attr("fill", "none")
            .attr("font-size", 10)
            .attr("font-family", "sans-serif")
            .attr("text-anchor", orient === right$1 ? "start" : orient === left$1 ? "end" : "middle");

        selection
            .each(function() { this.__axis = position; });
      }

      axis.scale = function(_) {
        return arguments.length ? (scale = _, axis) : scale;
      };

      axis.ticks = function() {
        return tickArguments = Array.from(arguments), axis;
      };

      axis.tickArguments = function(_) {
        return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis) : tickArguments.slice();
      };

      axis.tickValues = function(_) {
        return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis) : tickValues && tickValues.slice();
      };

      axis.tickFormat = function(_) {
        return arguments.length ? (tickFormat = _, axis) : tickFormat;
      };

      axis.tickSize = function(_) {
        return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis) : tickSizeInner;
      };

      axis.tickSizeInner = function(_) {
        return arguments.length ? (tickSizeInner = +_, axis) : tickSizeInner;
      };

      axis.tickSizeOuter = function(_) {
        return arguments.length ? (tickSizeOuter = +_, axis) : tickSizeOuter;
      };

      axis.tickPadding = function(_) {
        return arguments.length ? (tickPadding = +_, axis) : tickPadding;
      };

      axis.offset = function(_) {
        return arguments.length ? (offset = +_, axis) : offset;
      };

      return axis;
    }

    function axisBottom(scale) {
      return axis(bottom, scale);
    }

    function axisLeft(scale) {
      return axis(left$1, scale);
    }

    var noop = {value: () => {}};

    function dispatch() {
      for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
        if (!(t = arguments[i] + "") || (t in _) || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
        _[t] = [];
      }
      return new Dispatch(_);
    }

    function Dispatch(_) {
      this._ = _;
    }

    function parseTypenames$1(typenames, types) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
        return {type: t, name: name};
      });
    }

    Dispatch.prototype = dispatch.prototype = {
      constructor: Dispatch,
      on: function(typename, callback) {
        var _ = this._,
            T = parseTypenames$1(typename + "", _),
            t,
            i = -1,
            n = T.length;

        // If no callback was specified, return the callback of the given type and name.
        if (arguments.length < 2) {
          while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
          return;
        }

        // If a type was specified, set the callback for the given type and name.
        // Otherwise, if a null callback was specified, remove callbacks of the given name.
        if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
        while (++i < n) {
          if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
          else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
        }

        return this;
      },
      copy: function() {
        var copy = {}, _ = this._;
        for (var t in _) copy[t] = _[t].slice();
        return new Dispatch(copy);
      },
      call: function(type, that) {
        if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      },
      apply: function(type, that, args) {
        if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
        for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
      }
    };

    function get$1(type, name) {
      for (var i = 0, n = type.length, c; i < n; ++i) {
        if ((c = type[i]).name === name) {
          return c.value;
        }
      }
    }

    function set$1(type, name, callback) {
      for (var i = 0, n = type.length; i < n; ++i) {
        if (type[i].name === name) {
          type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
          break;
        }
      }
      if (callback != null) type.push({name: name, value: callback});
      return type;
    }

    var xhtml = "http://www.w3.org/1999/xhtml";

    var namespaces = {
      svg: "http://www.w3.org/2000/svg",
      xhtml: xhtml,
      xlink: "http://www.w3.org/1999/xlink",
      xml: "http://www.w3.org/XML/1998/namespace",
      xmlns: "http://www.w3.org/2000/xmlns/"
    };

    function namespace(name) {
      var prefix = name += "", i = prefix.indexOf(":");
      if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
      return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name; // eslint-disable-line no-prototype-builtins
    }

    function creatorInherit(name) {
      return function() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri === xhtml && document.documentElement.namespaceURI === xhtml
            ? document.createElement(name)
            : document.createElementNS(uri, name);
      };
    }

    function creatorFixed(fullname) {
      return function() {
        return this.ownerDocument.createElementNS(fullname.space, fullname.local);
      };
    }

    function creator(name) {
      var fullname = namespace(name);
      return (fullname.local
          ? creatorFixed
          : creatorInherit)(fullname);
    }

    function none() {}

    function selector(selector) {
      return selector == null ? none : function() {
        return this.querySelector(selector);
      };
    }

    function selection_select(select) {
      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    // Given something array like (or null), returns something that is strictly an
    // array. This is used to ensure that array-like objects passed to d3.selectAll
    // or selection.selectAll are converted into proper arrays when creating a
    // selection; we don’t ever want to create a selection backed by a live
    // HTMLCollection or NodeList. However, note that selection.selectAll will use a
    // static NodeList as a group, since it safely derived from querySelectorAll.
    function array$1(x) {
      return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
    }

    function empty() {
      return [];
    }

    function selectorAll(selector) {
      return selector == null ? empty : function() {
        return this.querySelectorAll(selector);
      };
    }

    function arrayAll(select) {
      return function() {
        return array$1(select.apply(this, arguments));
      };
    }

    function selection_selectAll(select) {
      if (typeof select === "function") select = arrayAll(select);
      else select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            subgroups.push(select.call(node, node.__data__, i, group));
            parents.push(node);
          }
        }
      }

      return new Selection$1(subgroups, parents);
    }

    function matcher(selector) {
      return function() {
        return this.matches(selector);
      };
    }

    function childMatcher(selector) {
      return function(node) {
        return node.matches(selector);
      };
    }

    var find$1 = Array.prototype.find;

    function childFind(match) {
      return function() {
        return find$1.call(this.children, match);
      };
    }

    function childFirst() {
      return this.firstElementChild;
    }

    function selection_selectChild(match) {
      return this.select(match == null ? childFirst
          : childFind(typeof match === "function" ? match : childMatcher(match)));
    }

    var filter = Array.prototype.filter;

    function children() {
      return Array.from(this.children);
    }

    function childrenFilter(match) {
      return function() {
        return filter.call(this.children, match);
      };
    }

    function selection_selectChildren(match) {
      return this.selectAll(match == null ? children
          : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
    }

    function selection_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Selection$1(subgroups, this._parents);
    }

    function sparse(update) {
      return new Array(update.length);
    }

    function selection_enter() {
      return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      constructor: EnterNode,
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
      querySelector: function(selector) { return this._parent.querySelector(selector); },
      querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
    };

    function constant$4(x) {
      return function() {
        return x;
      };
    }

    function bindIndex(parent, group, enter, update, exit, data) {
      var i = 0,
          node,
          groupLength = group.length,
          dataLength = data.length;

      // Put any non-null nodes that fit into update.
      // Put any null nodes into enter.
      // Put any remaining data into enter.
      for (; i < dataLength; ++i) {
        if (node = group[i]) {
          node.__data__ = data[i];
          update[i] = node;
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Put any non-null nodes that don’t fit into exit.
      for (; i < groupLength; ++i) {
        if (node = group[i]) {
          exit[i] = node;
        }
      }
    }

    function bindKey(parent, group, enter, update, exit, data, key) {
      var i,
          node,
          nodeByKeyValue = new Map,
          groupLength = group.length,
          dataLength = data.length,
          keyValues = new Array(groupLength),
          keyValue;

      // Compute the key for each node.
      // If multiple nodes have the same key, the duplicates are added to exit.
      for (i = 0; i < groupLength; ++i) {
        if (node = group[i]) {
          keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
          if (nodeByKeyValue.has(keyValue)) {
            exit[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
        }
      }

      // Compute the key for each datum.
      // If there a node associated with this key, join and add it to update.
      // If there is not (or the key is a duplicate), add it to enter.
      for (i = 0; i < dataLength; ++i) {
        keyValue = key.call(parent, data[i], i, data) + "";
        if (node = nodeByKeyValue.get(keyValue)) {
          update[i] = node;
          node.__data__ = data[i];
          nodeByKeyValue.delete(keyValue);
        } else {
          enter[i] = new EnterNode(parent, data[i]);
        }
      }

      // Add any remaining nodes that were not bound to data to exit.
      for (i = 0; i < groupLength; ++i) {
        if ((node = group[i]) && (nodeByKeyValue.get(keyValues[i]) === node)) {
          exit[i] = node;
        }
      }
    }

    function datum(node) {
      return node.__data__;
    }

    function selection_data(value, key) {
      if (!arguments.length) return Array.from(this, datum);

      var bind = key ? bindKey : bindIndex,
          parents = this._parents,
          groups = this._groups;

      if (typeof value !== "function") value = constant$4(value);

      for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
        var parent = parents[j],
            group = groups[j],
            groupLength = group.length,
            data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
            dataLength = data.length,
            enterGroup = enter[j] = new Array(dataLength),
            updateGroup = update[j] = new Array(dataLength),
            exitGroup = exit[j] = new Array(groupLength);

        bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

        // Now connect the enter nodes to their following update node, such that
        // appendChild can insert the materialized enter node before this node,
        // rather than at the end of the parent node.
        for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
          if (previous = enterGroup[i0]) {
            if (i0 >= i1) i1 = i0 + 1;
            while (!(next = updateGroup[i1]) && ++i1 < dataLength);
            previous._next = next || null;
          }
        }
      }

      update = new Selection$1(update, parents);
      update._enter = enter;
      update._exit = exit;
      return update;
    }

    // Given some data, this returns an array-like view of it: an object that
    // exposes a length property and allows numeric indexing. Note that unlike
    // selectAll, this isn’t worried about “live” collections because the resulting
    // array will only be used briefly while data is being bound. (It is possible to
    // cause the data to change while iterating by using a key function, but please
    // don’t; we’d rather avoid a gratuitous copy.)
    function arraylike(data) {
      return typeof data === "object" && "length" in data
        ? data // Array, TypedArray, NodeList, array-like
        : Array.from(data); // Map, Set, iterable, string, or anything else
    }

    function selection_exit() {
      return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
    }

    function selection_join(onenter, onupdate, onexit) {
      var enter = this.enter(), update = this, exit = this.exit();
      if (typeof onenter === "function") {
        enter = onenter(enter);
        if (enter) enter = enter.selection();
      } else {
        enter = enter.append(onenter + "");
      }
      if (onupdate != null) {
        update = onupdate(update);
        if (update) update = update.selection();
      }
      if (onexit == null) exit.remove(); else onexit(exit);
      return enter && update ? enter.merge(update).order() : update;
    }

    function selection_merge(context) {
      var selection = context.selection ? context.selection() : context;

      for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Selection$1(merges, this._parents);
    }

    function selection_order() {

      for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
        for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
          if (node = group[i]) {
            if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }

      return this;
    }

    function selection_sort(compare) {
      if (!compare) compare = ascending;

      function compareNode(a, b) {
        return a && b ? compare(a.__data__, b.__data__) : !a - !b;
      }

      for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            sortgroup[i] = node;
          }
        }
        sortgroup.sort(compareNode);
      }

      return new Selection$1(sortgroups, this._parents).order();
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function selection_call() {
      var callback = arguments[0];
      arguments[0] = this;
      callback.apply(null, arguments);
      return this;
    }

    function selection_nodes() {
      return Array.from(this);
    }

    function selection_node() {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
          var node = group[i];
          if (node) return node;
        }
      }

      return null;
    }

    function selection_size() {
      let size = 0;
      for (const node of this) ++size; // eslint-disable-line no-unused-vars
      return size;
    }

    function selection_empty() {
      return !this.node();
    }

    function selection_each(callback) {

      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) callback.call(node, node.__data__, i, group);
        }
      }

      return this;
    }

    function attrRemove$1(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS$1(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant$1(name, value) {
      return function() {
        this.setAttribute(name, value);
      };
    }

    function attrConstantNS$1(fullname, value) {
      return function() {
        this.setAttributeNS(fullname.space, fullname.local, value);
      };
    }

    function attrFunction$1(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttribute(name);
        else this.setAttribute(name, v);
      };
    }

    function attrFunctionNS$1(fullname, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
        else this.setAttributeNS(fullname.space, fullname.local, v);
      };
    }

    function selection_attr(name, value) {
      var fullname = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return fullname.local
            ? node.getAttributeNS(fullname.space, fullname.local)
            : node.getAttribute(fullname);
      }

      return this.each((value == null
          ? (fullname.local ? attrRemoveNS$1 : attrRemove$1) : (typeof value === "function"
          ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)
          : (fullname.local ? attrConstantNS$1 : attrConstant$1)))(fullname, value));
    }

    function defaultView(node) {
      return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
          || (node.document && node) // node is a Window
          || node.defaultView; // node is a Document
    }

    function styleRemove$1(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant$1(name, value, priority) {
      return function() {
        this.style.setProperty(name, value, priority);
      };
    }

    function styleFunction$1(name, value, priority) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) this.style.removeProperty(name);
        else this.style.setProperty(name, v, priority);
      };
    }

    function selection_style(name, value, priority) {
      return arguments.length > 1
          ? this.each((value == null
                ? styleRemove$1 : typeof value === "function"
                ? styleFunction$1
                : styleConstant$1)(name, value, priority == null ? "" : priority))
          : styleValue(this.node(), name);
    }

    function styleValue(node, name) {
      return node.style.getPropertyValue(name)
          || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
    }

    function propertyRemove(name) {
      return function() {
        delete this[name];
      };
    }

    function propertyConstant(name, value) {
      return function() {
        this[name] = value;
      };
    }

    function propertyFunction(name, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (v == null) delete this[name];
        else this[name] = v;
      };
    }

    function selection_property(name, value) {
      return arguments.length > 1
          ? this.each((value == null
              ? propertyRemove : typeof value === "function"
              ? propertyFunction
              : propertyConstant)(name, value))
          : this.node()[name];
    }

    function classArray(string) {
      return string.trim().split(/^|\s+/);
    }

    function classList(node) {
      return node.classList || new ClassList(node);
    }

    function ClassList(node) {
      this._node = node;
      this._names = classArray(node.getAttribute("class") || "");
    }

    ClassList.prototype = {
      add: function(name) {
        var i = this._names.indexOf(name);
        if (i < 0) {
          this._names.push(name);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      remove: function(name) {
        var i = this._names.indexOf(name);
        if (i >= 0) {
          this._names.splice(i, 1);
          this._node.setAttribute("class", this._names.join(" "));
        }
      },
      contains: function(name) {
        return this._names.indexOf(name) >= 0;
      }
    };

    function classedAdd(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.add(names[i]);
    }

    function classedRemove(node, names) {
      var list = classList(node), i = -1, n = names.length;
      while (++i < n) list.remove(names[i]);
    }

    function classedTrue(names) {
      return function() {
        classedAdd(this, names);
      };
    }

    function classedFalse(names) {
      return function() {
        classedRemove(this, names);
      };
    }

    function classedFunction(names, value) {
      return function() {
        (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
      };
    }

    function selection_classed(name, value) {
      var names = classArray(name + "");

      if (arguments.length < 2) {
        var list = classList(this.node()), i = -1, n = names.length;
        while (++i < n) if (!list.contains(names[i])) return false;
        return true;
      }

      return this.each((typeof value === "function"
          ? classedFunction : value
          ? classedTrue
          : classedFalse)(names, value));
    }

    function textRemove() {
      this.textContent = "";
    }

    function textConstant$1(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction$1(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      };
    }

    function selection_text(value) {
      return arguments.length
          ? this.each(value == null
              ? textRemove : (typeof value === "function"
              ? textFunction$1
              : textConstant$1)(value))
          : this.node().textContent;
    }

    function htmlRemove() {
      this.innerHTML = "";
    }

    function htmlConstant(value) {
      return function() {
        this.innerHTML = value;
      };
    }

    function htmlFunction(value) {
      return function() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      };
    }

    function selection_html(value) {
      return arguments.length
          ? this.each(value == null
              ? htmlRemove : (typeof value === "function"
              ? htmlFunction
              : htmlConstant)(value))
          : this.node().innerHTML;
    }

    function raise() {
      if (this.nextSibling) this.parentNode.appendChild(this);
    }

    function selection_raise() {
      return this.each(raise);
    }

    function lower() {
      if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
    }

    function selection_lower() {
      return this.each(lower);
    }

    function selection_append(name) {
      var create = typeof name === "function" ? name : creator(name);
      return this.select(function() {
        return this.appendChild(create.apply(this, arguments));
      });
    }

    function constantNull() {
      return null;
    }

    function selection_insert(name, before) {
      var create = typeof name === "function" ? name : creator(name),
          select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
      return this.select(function() {
        return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
      });
    }

    function remove() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    }

    function selection_remove() {
      return this.each(remove);
    }

    function selection_cloneShallow() {
      var clone = this.cloneNode(false), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_cloneDeep() {
      var clone = this.cloneNode(true), parent = this.parentNode;
      return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
    }

    function selection_clone(deep) {
      return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
    }

    function selection_datum(value) {
      return arguments.length
          ? this.property("__data__", value)
          : this.node().__data__;
    }

    function contextListener(listener) {
      return function(event) {
        listener.call(this, event, this.__data__);
      };
    }

    function parseTypenames(typenames) {
      return typenames.trim().split(/^|\s+/).map(function(t) {
        var name = "", i = t.indexOf(".");
        if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
        return {type: t, name: name};
      });
    }

    function onRemove(typename) {
      return function() {
        var on = this.__on;
        if (!on) return;
        for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
          if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
          } else {
            on[++i] = o;
          }
        }
        if (++i) on.length = i;
        else delete this.__on;
      };
    }

    function onAdd(typename, value, options) {
      return function() {
        var on = this.__on, o, listener = contextListener(value);
        if (on) for (var j = 0, m = on.length; j < m; ++j) {
          if ((o = on[j]).type === typename.type && o.name === typename.name) {
            this.removeEventListener(o.type, o.listener, o.options);
            this.addEventListener(o.type, o.listener = listener, o.options = options);
            o.value = value;
            return;
          }
        }
        this.addEventListener(typename.type, listener, options);
        o = {type: typename.type, name: typename.name, value: value, listener: listener, options: options};
        if (!on) this.__on = [o];
        else on.push(o);
      };
    }

    function selection_on(typename, value, options) {
      var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

      if (arguments.length < 2) {
        var on = this.node().__on;
        if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
          for (i = 0, o = on[j]; i < n; ++i) {
            if ((t = typenames[i]).type === o.type && t.name === o.name) {
              return o.value;
            }
          }
        }
        return;
      }

      on = value ? onAdd : onRemove;
      for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
      return this;
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (typeof event === "function") {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    function dispatchConstant(type, params) {
      return function() {
        return dispatchEvent(this, type, params);
      };
    }

    function dispatchFunction(type, params) {
      return function() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      };
    }

    function selection_dispatch(type, params) {
      return this.each((typeof params === "function"
          ? dispatchFunction
          : dispatchConstant)(type, params));
    }

    function* selection_iterator() {
      for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
        for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
          if (node = group[i]) yield node;
        }
      }
    }

    var root = [null];

    function Selection$1(groups, parents) {
      this._groups = groups;
      this._parents = parents;
    }

    function selection() {
      return new Selection$1([[document.documentElement]], root);
    }

    function selection_selection() {
      return this;
    }

    Selection$1.prototype = selection.prototype = {
      constructor: Selection$1,
      select: selection_select,
      selectAll: selection_selectAll,
      selectChild: selection_selectChild,
      selectChildren: selection_selectChildren,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      join: selection_join,
      merge: selection_merge,
      selection: selection_selection,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      classed: selection_classed,
      text: selection_text,
      html: selection_html,
      raise: selection_raise,
      lower: selection_lower,
      append: selection_append,
      insert: selection_insert,
      remove: selection_remove,
      clone: selection_clone,
      datum: selection_datum,
      on: selection_on,
      dispatch: selection_dispatch,
      [Symbol.iterator]: selection_iterator
    };

    function select(selector) {
      return typeof selector === "string"
          ? new Selection$1([[document.querySelector(selector)]], [document.documentElement])
          : new Selection$1([[selector]], root);
    }

    function create$1(name) {
      return select(creator(name).call(document.documentElement));
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
        reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
        reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
        reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
        reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
        reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHex8: color_formatHex8,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHex8() {
      return this.rgb().formatHex8();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb() {
        return this;
      },
      clamp() {
        return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
      },
      displayable() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatHex8: rgb_formatHex8,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
    }

    function rgb_formatHex8() {
      return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
    }

    function rgb_formatRgb() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
    }

    function clampa(opacity) {
      return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
    }

    function clampi(value) {
      return Math.max(0, Math.min(255, Math.round(value) || 0));
    }

    function hex(value) {
      value = clampi(value);
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      clamp() {
        return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
      },
      displayable() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl() {
        const a = clampa(this.opacity);
        return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
      }
    }));

    function clamph(value) {
      value = (value || 0) % 360;
      return value < 0 ? value + 360 : value;
    }

    function clampt(value) {
      return Math.max(0, Math.min(1, value || 0));
    }

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant$3 = x => () => x;

    function linear$1(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant$3(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear$1(a, d) : constant$3(isNaN(a) ? b : a);
    }

    var interpolateRgb = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate$1(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate$1(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function interpolateString(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate$1(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant$3(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, interpolateRgb) : interpolateString)
          : b instanceof color ? interpolateRgb
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    var degrees = 180 / Math.PI;

    var identity$2 = {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      skewX: 0,
      scaleX: 1,
      scaleY: 1
    };

    function decompose(a, b, c, d, e, f) {
      var scaleX, scaleY, skewX;
      if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
      if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
      if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
      if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
      return {
        translateX: e,
        translateY: f,
        rotate: Math.atan2(b, a) * degrees,
        skewX: Math.atan(skewX) * degrees,
        scaleX: scaleX,
        scaleY: scaleY
      };
    }

    var svgNode;

    /* eslint-disable no-undef */
    function parseCss(value) {
      const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
      return m.isIdentity ? identity$2 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
    }

    function parseSvg(value) {
      if (value == null) return identity$2;
      if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
      svgNode.setAttribute("transform", value);
      if (!(value = svgNode.transform.baseVal.consolidate())) return identity$2;
      value = value.matrix;
      return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
    }

    function interpolateTransform(parse, pxComma, pxParen, degParen) {

      function pop(s) {
        return s.length ? s.pop() + " " : "";
      }

      function translate(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push("translate(", null, pxComma, null, pxParen);
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb || yb) {
          s.push("translate(" + xb + pxComma + yb + pxParen);
        }
      }

      function rotate(a, b, s, q) {
        if (a !== b) {
          if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
          q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "rotate(" + b + degParen);
        }
      }

      function skewX(a, b, s, q) {
        if (a !== b) {
          q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
        } else if (b) {
          s.push(pop(s) + "skewX(" + b + degParen);
        }
      }

      function scale(xa, ya, xb, yb, s, q) {
        if (xa !== xb || ya !== yb) {
          var i = s.push(pop(s) + "scale(", null, ",", null, ")");
          q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
        } else if (xb !== 1 || yb !== 1) {
          s.push(pop(s) + "scale(" + xb + "," + yb + ")");
        }
      }

      return function(a, b) {
        var s = [], // string constants and placeholders
            q = []; // number interpolators
        a = parse(a), b = parse(b);
        translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
        rotate(a.rotate, b.rotate, s, q);
        skewX(a.skewX, b.skewX, s, q);
        scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
        a = b = null; // gc
        return function(t) {
          var i = -1, n = q.length, o;
          while (++i < n) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        };
      };
    }

    var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
    var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

    var frame = 0, // is an animation frame pending?
        timeout$1 = 0, // is a timeout pending?
        interval = 0, // are any timers active?
        pokeDelay = 1000, // how frequently we check for clock skew
        taskHead,
        taskTail,
        clockLast = 0,
        clockNow = 0,
        clockSkew = 0,
        clock = typeof performance === "object" && performance.now ? performance : Date,
        setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

    function now() {
      return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
    }

    function clearNow() {
      clockNow = 0;
    }

    function Timer() {
      this._call =
      this._time =
      this._next = null;
    }

    Timer.prototype = timer.prototype = {
      constructor: Timer,
      restart: function(callback, delay, time) {
        if (typeof callback !== "function") throw new TypeError("callback is not a function");
        time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
        if (!this._next && taskTail !== this) {
          if (taskTail) taskTail._next = this;
          else taskHead = this;
          taskTail = this;
        }
        this._call = callback;
        this._time = time;
        sleep();
      },
      stop: function() {
        if (this._call) {
          this._call = null;
          this._time = Infinity;
          sleep();
        }
      }
    };

    function timer(callback, delay, time) {
      var t = new Timer;
      t.restart(callback, delay, time);
      return t;
    }

    function timerFlush() {
      now(); // Get the current time, if not already set.
      ++frame; // Pretend we’ve set an alarm, if we haven’t already.
      var t = taskHead, e;
      while (t) {
        if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
        t = t._next;
      }
      --frame;
    }

    function wake() {
      clockNow = (clockLast = clock.now()) + clockSkew;
      frame = timeout$1 = 0;
      try {
        timerFlush();
      } finally {
        frame = 0;
        nap();
        clockNow = 0;
      }
    }

    function poke() {
      var now = clock.now(), delay = now - clockLast;
      if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
    }

    function nap() {
      var t0, t1 = taskHead, t2, time = Infinity;
      while (t1) {
        if (t1._call) {
          if (time > t1._time) time = t1._time;
          t0 = t1, t1 = t1._next;
        } else {
          t2 = t1._next, t1._next = null;
          t1 = t0 ? t0._next = t2 : taskHead = t2;
        }
      }
      taskTail = t0;
      sleep(time);
    }

    function sleep(time) {
      if (frame) return; // Soonest alarm already set, or will be.
      if (timeout$1) timeout$1 = clearTimeout(timeout$1);
      var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
      if (delay > 24) {
        if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
        if (interval) interval = clearInterval(interval);
      } else {
        if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
        frame = 1, setFrame(wake);
      }
    }

    function timeout(callback, delay, time) {
      var t = new Timer;
      delay = delay == null ? 0 : +delay;
      t.restart(elapsed => {
        t.stop();
        callback(elapsed + delay);
      }, delay, time);
      return t;
    }

    var emptyOn = dispatch("start", "end", "cancel", "interrupt");
    var emptyTween = [];

    var CREATED = 0;
    var SCHEDULED = 1;
    var STARTING = 2;
    var STARTED = 3;
    var RUNNING = 4;
    var ENDING = 5;
    var ENDED = 6;

    function schedule(node, name, id, index, group, timing) {
      var schedules = node.__transition;
      if (!schedules) node.__transition = {};
      else if (id in schedules) return;
      create(node, id, {
        name: name,
        index: index, // For context during callback.
        group: group, // For context during callback.
        on: emptyOn,
        tween: emptyTween,
        time: timing.time,
        delay: timing.delay,
        duration: timing.duration,
        ease: timing.ease,
        timer: null,
        state: CREATED
      });
    }

    function init(node, id) {
      var schedule = get(node, id);
      if (schedule.state > CREATED) throw new Error("too late; already scheduled");
      return schedule;
    }

    function set(node, id) {
      var schedule = get(node, id);
      if (schedule.state > STARTED) throw new Error("too late; already running");
      return schedule;
    }

    function get(node, id) {
      var schedule = node.__transition;
      if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
      return schedule;
    }

    function create(node, id, self) {
      var schedules = node.__transition,
          tween;

      // Initialize the self timer when the transition is created.
      // Note the actual delay is not known until the first callback!
      schedules[id] = self;
      self.timer = timer(schedule, 0, self.time);

      function schedule(elapsed) {
        self.state = SCHEDULED;
        self.timer.restart(start, self.delay, self.time);

        // If the elapsed delay is less than our first sleep, start immediately.
        if (self.delay <= elapsed) start(elapsed - self.delay);
      }

      function start(elapsed) {
        var i, j, n, o;

        // If the state is not SCHEDULED, then we previously errored on start.
        if (self.state !== SCHEDULED) return stop();

        for (i in schedules) {
          o = schedules[i];
          if (o.name !== self.name) continue;

          // While this element already has a starting transition during this frame,
          // defer starting an interrupting transition until that transition has a
          // chance to tick (and possibly end); see d3/d3-transition#54!
          if (o.state === STARTED) return timeout(start);

          // Interrupt the active transition, if any.
          if (o.state === RUNNING) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("interrupt", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }

          // Cancel any pre-empted transitions.
          else if (+i < id) {
            o.state = ENDED;
            o.timer.stop();
            o.on.call("cancel", node, node.__data__, o.index, o.group);
            delete schedules[i];
          }
        }

        // Defer the first tick to end of the current frame; see d3/d3#1576.
        // Note the transition may be canceled after start and before the first tick!
        // Note this must be scheduled before the start event; see d3/d3-transition#16!
        // Assuming this is successful, subsequent callbacks go straight to tick.
        timeout(function() {
          if (self.state === STARTED) {
            self.state = RUNNING;
            self.timer.restart(tick, self.delay, self.time);
            tick(elapsed);
          }
        });

        // Dispatch the start event.
        // Note this must be done before the tween are initialized.
        self.state = STARTING;
        self.on.call("start", node, node.__data__, self.index, self.group);
        if (self.state !== STARTING) return; // interrupted
        self.state = STARTED;

        // Initialize the tween, deleting null tween.
        tween = new Array(n = self.tween.length);
        for (i = 0, j = -1; i < n; ++i) {
          if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
            tween[++j] = o;
          }
        }
        tween.length = j + 1;
      }

      function tick(elapsed) {
        var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
            i = -1,
            n = tween.length;

        while (++i < n) {
          tween[i].call(node, t);
        }

        // Dispatch the end event.
        if (self.state === ENDING) {
          self.on.call("end", node, node.__data__, self.index, self.group);
          stop();
        }
      }

      function stop() {
        self.state = ENDED;
        self.timer.stop();
        delete schedules[id];
        for (var i in schedules) return; // eslint-disable-line no-unused-vars
        delete node.__transition;
      }
    }

    function interrupt(node, name) {
      var schedules = node.__transition,
          schedule,
          active,
          empty = true,
          i;

      if (!schedules) return;

      name = name == null ? null : name + "";

      for (i in schedules) {
        if ((schedule = schedules[i]).name !== name) { empty = false; continue; }
        active = schedule.state > STARTING && schedule.state < ENDING;
        schedule.state = ENDED;
        schedule.timer.stop();
        schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
        delete schedules[i];
      }

      if (empty) delete node.__transition;
    }

    function selection_interrupt(name) {
      return this.each(function() {
        interrupt(this, name);
      });
    }

    function tweenRemove(id, name) {
      var tween0, tween1;
      return function() {
        var schedule = set(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = tween0 = tween;
          for (var i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1 = tween1.slice();
              tween1.splice(i, 1);
              break;
            }
          }
        }

        schedule.tween = tween1;
      };
    }

    function tweenFunction(id, name, value) {
      var tween0, tween1;
      if (typeof value !== "function") throw new Error;
      return function() {
        var schedule = set(this, id),
            tween = schedule.tween;

        // If this node shared tween with the previous node,
        // just assign the updated shared tween and we’re done!
        // Otherwise, copy-on-write.
        if (tween !== tween0) {
          tween1 = (tween0 = tween).slice();
          for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
            if (tween1[i].name === name) {
              tween1[i] = t;
              break;
            }
          }
          if (i === n) tween1.push(t);
        }

        schedule.tween = tween1;
      };
    }

    function transition_tween(name, value) {
      var id = this._id;

      name += "";

      if (arguments.length < 2) {
        var tween = get(this.node(), id).tween;
        for (var i = 0, n = tween.length, t; i < n; ++i) {
          if ((t = tween[i]).name === name) {
            return t.value;
          }
        }
        return null;
      }

      return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
    }

    function tweenValue(transition, name, value) {
      var id = transition._id;

      transition.each(function() {
        var schedule = set(this, id);
        (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
      });

      return function(node) {
        return get(node, id).value[name];
      };
    }

    function interpolate(a, b) {
      var c;
      return (typeof b === "number" ? interpolateNumber
          : b instanceof color ? interpolateRgb
          : (c = color(b)) ? (b = c, interpolateRgb)
          : interpolateString)(a, b);
    }

    function attrRemove(name) {
      return function() {
        this.removeAttribute(name);
      };
    }

    function attrRemoveNS(fullname) {
      return function() {
        this.removeAttributeNS(fullname.space, fullname.local);
      };
    }

    function attrConstant(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttribute(name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrConstantNS(fullname, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = this.getAttributeNS(fullname.space, fullname.local);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function attrFunction(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttribute(name);
        string0 = this.getAttribute(name);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function attrFunctionNS(fullname, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0, value1 = value(this), string1;
        if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
        string0 = this.getAttributeNS(fullname.space, fullname.local);
        string1 = value1 + "";
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function transition_attr(name, value) {
      var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
      return this.attrTween(name, typeof value === "function"
          ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value))
          : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname)
          : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
    }

    function attrInterpolate(name, i) {
      return function(t) {
        this.setAttribute(name, i.call(this, t));
      };
    }

    function attrInterpolateNS(fullname, i) {
      return function(t) {
        this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
      };
    }

    function attrTweenNS(fullname, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function attrTween(name, value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_attrTween(name, value) {
      var key = "attr." + name;
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      var fullname = namespace(name);
      return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
    }

    function delayFunction(id, value) {
      return function() {
        init(this, id).delay = +value.apply(this, arguments);
      };
    }

    function delayConstant(id, value) {
      return value = +value, function() {
        init(this, id).delay = value;
      };
    }

    function transition_delay(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? delayFunction
              : delayConstant)(id, value))
          : get(this.node(), id).delay;
    }

    function durationFunction(id, value) {
      return function() {
        set(this, id).duration = +value.apply(this, arguments);
      };
    }

    function durationConstant(id, value) {
      return value = +value, function() {
        set(this, id).duration = value;
      };
    }

    function transition_duration(value) {
      var id = this._id;

      return arguments.length
          ? this.each((typeof value === "function"
              ? durationFunction
              : durationConstant)(id, value))
          : get(this.node(), id).duration;
    }

    function easeConstant(id, value) {
      if (typeof value !== "function") throw new Error;
      return function() {
        set(this, id).ease = value;
      };
    }

    function transition_ease(value) {
      var id = this._id;

      return arguments.length
          ? this.each(easeConstant(id, value))
          : get(this.node(), id).ease;
    }

    function easeVarying(id, value) {
      return function() {
        var v = value.apply(this, arguments);
        if (typeof v !== "function") throw new Error;
        set(this, id).ease = v;
      };
    }

    function transition_easeVarying(value) {
      if (typeof value !== "function") throw new Error;
      return this.each(easeVarying(this._id, value));
    }

    function transition_filter(match) {
      if (typeof match !== "function") match = matcher(match);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
          if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
            subgroup.push(node);
          }
        }
      }

      return new Transition(subgroups, this._parents, this._name, this._id);
    }

    function transition_merge(transition) {
      if (transition._id !== this._id) throw new Error;

      for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
        for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
          if (node = group0[i] || group1[i]) {
            merge[i] = node;
          }
        }
      }

      for (; j < m0; ++j) {
        merges[j] = groups0[j];
      }

      return new Transition(merges, this._parents, this._name, this._id);
    }

    function start(name) {
      return (name + "").trim().split(/^|\s+/).every(function(t) {
        var i = t.indexOf(".");
        if (i >= 0) t = t.slice(0, i);
        return !t || t === "start";
      });
    }

    function onFunction(id, name, listener) {
      var on0, on1, sit = start(name) ? init : set;
      return function() {
        var schedule = sit(this, id),
            on = schedule.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

        schedule.on = on1;
      };
    }

    function transition_on(name, listener) {
      var id = this._id;

      return arguments.length < 2
          ? get(this.node(), id).on.on(name)
          : this.each(onFunction(id, name, listener));
    }

    function removeFunction(id) {
      return function() {
        var parent = this.parentNode;
        for (var i in this.__transition) if (+i !== id) return;
        if (parent) parent.removeChild(this);
      };
    }

    function transition_remove() {
      return this.on("end.remove", removeFunction(this._id));
    }

    function transition_select(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selector(select);

      for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
          if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
            if ("__data__" in node) subnode.__data__ = node.__data__;
            subgroup[i] = subnode;
            schedule(subgroup[i], name, id, i, subgroup, get(node, id));
          }
        }
      }

      return new Transition(subgroups, this._parents, name, id);
    }

    function transition_selectAll(select) {
      var name = this._name,
          id = this._id;

      if (typeof select !== "function") select = selectorAll(select);

      for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
              if (child = children[k]) {
                schedule(child, name, id, k, children, inherit);
              }
            }
            subgroups.push(children);
            parents.push(node);
          }
        }
      }

      return new Transition(subgroups, parents, name, id);
    }

    var Selection = selection.prototype.constructor;

    function transition_selection() {
      return new Selection(this._groups, this._parents);
    }

    function styleNull(name, interpolate) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            string1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, string10 = string1);
      };
    }

    function styleRemove(name) {
      return function() {
        this.style.removeProperty(name);
      };
    }

    function styleConstant(name, interpolate, value1) {
      var string00,
          string1 = value1 + "",
          interpolate0;
      return function() {
        var string0 = styleValue(this, name);
        return string0 === string1 ? null
            : string0 === string00 ? interpolate0
            : interpolate0 = interpolate(string00 = string0, value1);
      };
    }

    function styleFunction(name, interpolate, value) {
      var string00,
          string10,
          interpolate0;
      return function() {
        var string0 = styleValue(this, name),
            value1 = value(this),
            string1 = value1 + "";
        if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
        return string0 === string1 ? null
            : string0 === string00 && string1 === string10 ? interpolate0
            : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
      };
    }

    function styleMaybeRemove(id, name) {
      var on0, on1, listener0, key = "style." + name, event = "end." + key, remove;
      return function() {
        var schedule = set(this, id),
            on = schedule.on,
            listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);

        schedule.on = on1;
      };
    }

    function transition_style(name, value, priority) {
      var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
      return value == null ? this
          .styleTween(name, styleNull(name, i))
          .on("end.style." + name, styleRemove(name))
        : typeof value === "function" ? this
          .styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value)))
          .each(styleMaybeRemove(this._id, name))
        : this
          .styleTween(name, styleConstant(name, i, value), priority)
          .on("end.style." + name, null);
    }

    function styleInterpolate(name, i, priority) {
      return function(t) {
        this.style.setProperty(name, i.call(this, t), priority);
      };
    }

    function styleTween(name, value, priority) {
      var t, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
        return t;
      }
      tween._value = value;
      return tween;
    }

    function transition_styleTween(name, value, priority) {
      var key = "style." + (name += "");
      if (arguments.length < 2) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
    }

    function textConstant(value) {
      return function() {
        this.textContent = value;
      };
    }

    function textFunction(value) {
      return function() {
        var value1 = value(this);
        this.textContent = value1 == null ? "" : value1;
      };
    }

    function transition_text(value) {
      return this.tween("text", typeof value === "function"
          ? textFunction(tweenValue(this, "text", value))
          : textConstant(value == null ? "" : value + ""));
    }

    function textInterpolate(i) {
      return function(t) {
        this.textContent = i.call(this, t);
      };
    }

    function textTween(value) {
      var t0, i0;
      function tween() {
        var i = value.apply(this, arguments);
        if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
        return t0;
      }
      tween._value = value;
      return tween;
    }

    function transition_textTween(value) {
      var key = "text";
      if (arguments.length < 1) return (key = this.tween(key)) && key._value;
      if (value == null) return this.tween(key, null);
      if (typeof value !== "function") throw new Error;
      return this.tween(key, textTween(value));
    }

    function transition_transition() {
      var name = this._name,
          id0 = this._id,
          id1 = newId();

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            var inherit = get(node, id0);
            schedule(node, name, id1, i, group, {
              time: inherit.time + inherit.delay + inherit.duration,
              delay: 0,
              duration: inherit.duration,
              ease: inherit.ease
            });
          }
        }
      }

      return new Transition(groups, this._parents, name, id1);
    }

    function transition_end() {
      var on0, on1, that = this, id = that._id, size = that.size();
      return new Promise(function(resolve, reject) {
        var cancel = {value: reject},
            end = {value: function() { if (--size === 0) resolve(); }};

        that.each(function() {
          var schedule = set(this, id),
              on = schedule.on;

          // If this node shared a dispatch with the previous node,
          // just assign the updated shared dispatch and we’re done!
          // Otherwise, copy-on-write.
          if (on !== on0) {
            on1 = (on0 = on).copy();
            on1._.cancel.push(cancel);
            on1._.interrupt.push(cancel);
            on1._.end.push(end);
          }

          schedule.on = on1;
        });

        // The selection was empty, resolve end immediately
        if (size === 0) resolve();
      });
    }

    var id = 0;

    function Transition(groups, parents, name, id) {
      this._groups = groups;
      this._parents = parents;
      this._name = name;
      this._id = id;
    }

    function newId() {
      return ++id;
    }

    var selection_prototype = selection.prototype;

    Transition.prototype = {
      constructor: Transition,
      select: transition_select,
      selectAll: transition_selectAll,
      selectChild: selection_prototype.selectChild,
      selectChildren: selection_prototype.selectChildren,
      filter: transition_filter,
      merge: transition_merge,
      selection: transition_selection,
      transition: transition_transition,
      call: selection_prototype.call,
      nodes: selection_prototype.nodes,
      node: selection_prototype.node,
      size: selection_prototype.size,
      empty: selection_prototype.empty,
      each: selection_prototype.each,
      on: transition_on,
      attr: transition_attr,
      attrTween: transition_attrTween,
      style: transition_style,
      styleTween: transition_styleTween,
      text: transition_text,
      textTween: transition_textTween,
      remove: transition_remove,
      tween: transition_tween,
      delay: transition_delay,
      duration: transition_duration,
      ease: transition_ease,
      easeVarying: transition_easeVarying,
      end: transition_end,
      [Symbol.iterator]: selection_prototype[Symbol.iterator]
    };

    function cubicInOut(t) {
      return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
    }

    var defaultTiming = {
      time: null, // Set on use.
      delay: 0,
      duration: 250,
      ease: cubicInOut
    };

    function inherit(node, id) {
      var timing;
      while (!(timing = node.__transition) || !(timing = timing[id])) {
        if (!(node = node.parentNode)) {
          throw new Error(`transition ${id} not found`);
        }
      }
      return timing;
    }

    function selection_transition(name) {
      var id,
          timing;

      if (name instanceof Transition) {
        id = name._id, name = name._name;
      } else {
        id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
      }

      for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
        for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
          if (node = group[i]) {
            schedule(node, name, id, i, group, timing || inherit(node, id));
          }
        }
      }

      return new Transition(groups, this._parents, name, id);
    }

    selection.prototype.interrupt = selection_interrupt;
    selection.prototype.transition = selection_transition;

    const pi$1 = Math.PI,
        tau$1 = 2 * pi$1,
        epsilon$1 = 1e-6,
        tauEpsilon$1 = tau$1 - epsilon$1;

    function append(strings) {
      this._ += strings[0];
      for (let i = 1, n = strings.length; i < n; ++i) {
        this._ += arguments[i] + strings[i];
      }
    }

    function appendRound(digits) {
      let d = Math.floor(digits);
      if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
      if (d > 15) return append;
      const k = 10 ** d;
      return function(strings) {
        this._ += strings[0];
        for (let i = 1, n = strings.length; i < n; ++i) {
          this._ += Math.round(arguments[i] * k) / k + strings[i];
        }
      };
    }

    class Path$1 {
      constructor(digits) {
        this._x0 = this._y0 = // start of current subpath
        this._x1 = this._y1 = null; // end of current subpath
        this._ = "";
        this._append = digits == null ? append : appendRound(digits);
      }
      moveTo(x, y) {
        this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
      }
      closePath() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._append`Z`;
        }
      }
      lineTo(x, y) {
        this._append`L${this._x1 = +x},${this._y1 = +y}`;
      }
      quadraticCurveTo(x1, y1, x, y) {
        this._append`Q${+x1},${+y1},${this._x1 = +x},${this._y1 = +y}`;
      }
      bezierCurveTo(x1, y1, x2, y2, x, y) {
        this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x},${this._y1 = +y}`;
      }
      arcTo(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;

        // Is the radius negative? Error.
        if (r < 0) throw new Error(`negative radius: ${r}`);

        let x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._append`M${this._x1 = x1},${this._y1 = y1}`;
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon$1));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
          this._append`L${this._x1 = x1},${this._y1 = y1}`;
        }

        // Otherwise, draw an arc!
        else {
          let x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi$1 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon$1) {
            this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
          }

          this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
        }
      }
      arc(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;

        // Is the radius negative? Error.
        if (r < 0) throw new Error(`negative radius: ${r}`);

        let dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._append`M${x0},${y0}`;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
          this._append`L${x0},${y0}`;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau$1 + tau$1;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon$1) {
          this._append`A${r},${r},0,1,${cw},${x - dx},${y - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon$1) {
          this._append`A${r},${r},0,${+(da >= pi$1)},${cw},${this._x1 = x + r * Math.cos(a1)},${this._y1 = y + r * Math.sin(a1)}`;
        }
      }
      rect(x, y, w, h) {
        this._append`M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${w = +w}v${+h}h${-w}Z`;
      }
      toString() {
        return this._;
      }
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$1(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function initInterpolator(domain, interpolator) {
      switch (arguments.length) {
        case 0: break;
        case 1: {
          if (typeof domain === "function") this.interpolator(domain);
          else this.range(domain);
          break;
        }
        default: {
          this.domain(domain);
          if (typeof interpolator === "function") this.interpolator(interpolator);
          else this.range(interpolator);
          break;
        }
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new InternMap(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        let i = index.get(d);
        if (i === undefined) {
          if (unknown !== implicit) return unknown;
          index.set(d, i = domain.push(d) - 1);
        }
        return range[i % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new InternMap();
        for (const value of _) {
          if (index.has(value)) continue;
          index.set(value, domain.push(value) - 1);
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisect(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy$1(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer$1() {
      var domain = unit,
          range = unit,
          interpolate = interpolate$1,
          transform,
          untransform,
          unknown,
          clamp = identity,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer$1()(identity, identity);
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear() {
      var scale = continuous();

      scale.copy = function() {
        return copy$1(scale, linear());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function transformer() {
      var x0 = 0,
          x1 = 1,
          t0,
          t1,
          k10,
          transform,
          interpolator = identity,
          clamp = false,
          unknown;

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : interpolator(k10 === 0 ? 0.5 : (x = (transform(x) - t0) * k10, clamp ? Math.max(0, Math.min(1, x)) : x));
      }

      scale.domain = function(_) {
        return arguments.length ? ([x0, x1] = _, t0 = transform(x0 = +x0), t1 = transform(x1 = +x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0), scale) : [x0, x1];
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = !!_, scale) : clamp;
      };

      scale.interpolator = function(_) {
        return arguments.length ? (interpolator = _, scale) : interpolator;
      };

      function range(interpolate) {
        return function(_) {
          var r0, r1;
          return arguments.length ? ([r0, r1] = _, interpolator = interpolate(r0, r1), scale) : [interpolator(0), interpolator(1)];
        };
      }

      scale.range = range(interpolate$1);

      scale.rangeRound = range(interpolateRound);

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t) {
        transform = t, t0 = t(x0), t1 = t(x1), k10 = t0 === t1 ? 0 : 1 / (t1 - t0);
        return scale;
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .interpolator(source.interpolator())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function sequential() {
      var scale = linearish(transformer()(identity));

      scale.copy = function() {
        return copy(scale, sequential());
      };

      return initInterpolator.apply(scale, arguments);
    }

    function colors(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    }

    var schemeTableau10 = colors("4e79a7f28e2ce1575976b7b259a14fedc949af7aa1ff9da79c755fbab0ab");

    function constant$2(x) {
      return function constant() {
        return x;
      };
    }

    function withPath(shape) {
      let digits = 3;

      shape.digits = function(_) {
        if (!arguments.length) return digits;
        if (_ == null) {
          digits = null;
        } else {
          const d = Math.floor(_);
          if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
          digits = d;
        }
        return shape;
      };

      return () => new Path$1(digits);
    }

    function array(x) {
      return typeof x === "object" && "length" in x
        ? x // Array, TypedArray, NodeList, array-like
        : Array.from(x); // Map, Set, iterable, string, or anything else
    }

    function Linear(context) {
      this._context = context;
    }

    Linear.prototype = {
      areaStart: function() {
        this._line = 0;
      },
      areaEnd: function() {
        this._line = NaN;
      },
      lineStart: function() {
        this._point = 0;
      },
      lineEnd: function() {
        if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
        this._line = 1 - this._line;
      },
      point: function(x, y) {
        x = +x, y = +y;
        switch (this._point) {
          case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
          case 1: this._point = 2; // falls through
          default: this._context.lineTo(x, y); break;
        }
      }
    };

    function curveLinear(context) {
      return new Linear(context);
    }

    function x$1(p) {
      return p[0];
    }

    function y$1(p) {
      return p[1];
    }

    function d3line(x, y) {
      var defined = constant$2(true),
          context = null,
          curve = curveLinear,
          output = null,
          path = withPath(line);

      x = typeof x === "function" ? x : (x === undefined) ? x$1 : constant$2(x);
      y = typeof y === "function" ? y : (y === undefined) ? y$1 : constant$2(y);

      function line(data) {
        var i,
            n = (data = array(data)).length,
            d,
            defined0 = false,
            buffer;

        if (context == null) output = curve(buffer = path());

        for (i = 0; i <= n; ++i) {
          if (!(i < n && defined(d = data[i], i, data)) === defined0) {
            if (defined0 = !defined0) output.lineStart();
            else output.lineEnd();
          }
          if (defined0) output.point(+x(d, i, data), +y(d, i, data));
        }

        if (buffer) return output = null, buffer + "" || null;
      }

      line.x = function(_) {
        return arguments.length ? (x = typeof _ === "function" ? _ : constant$2(+_), line) : x;
      };

      line.y = function(_) {
        return arguments.length ? (y = typeof _ === "function" ? _ : constant$2(+_), line) : y;
      };

      line.defined = function(_) {
        return arguments.length ? (defined = typeof _ === "function" ? _ : constant$2(!!_), line) : defined;
      };

      line.curve = function(_) {
        return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
      };

      line.context = function(_) {
        return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
      };

      return line;
    }

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
            yFormat: '%'
        });
        const coverage = findCoverage(transformedPercentages, rank);
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
        xType = sequential, // the x-scale type
        xDomain, // [xmin, xmax]
        xLabel = "",
        xRange = [marginLeft, width - marginRight], // [left, right]
        yType = linear, // the y-scale type
        yDomain, // [ymin, ymax]
        yRange = [height - marginBottom, marginTop], // [bottom, top]
        yFormat, // a format specifier string for the y-axis
        yLabel, // a label for the y-axis
        color = "currentColor", // stroke color of line
        strokeLinecap = "round", // stroke line cap of the line
        strokeLinejoin = "round", // stroke line join of the line
        strokeWidth = 1.5, // stroke width of line, in pixels
        strokeOpacity = 1, // stroke opacity of line
    } = {}) {
        // Compute values.
        const X = map$1(data, x);
        const Y = map$1(data, y);
        const I = range(X.length);
        if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
        const D = map$1(data, defined);

        // Compute default domains.
        if (xDomain === undefined) xDomain = extent(X);
        if (yDomain === undefined) yDomain = [0, max$1(Y)];

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

        const svg = create$1("svg")
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

        return svg.node();
    }

    let coverageGraph = {};
    let charFreqs = {};

    let maxExamples = 5;
    let currentExamples = {};
    let currentWords = [];

    //TODO(refactor): move notion of activetab to orchestrator

    //explore tab items
    const examplesList = document.getElementById('examples');

    // TODO(refactor): consider removal of getActiveGraph...
    let getVoice = function () {
        //use the first-encountered zh-CN voice for now
        if (!('speechSynthesis' in window)) {
            return null;
        }
        return speechSynthesis.getVoices().find(voice => voice.lang.replace('_', '-') === (getActiveGraph().ttsKey || 'zh-CN'));
    };
    // hacking around garbage collection issues...
    window.activeUtterances = [];
    let voice = getVoice();

    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    //generally, this thing is weird, so uh...
    //ideally we'd not do this or have any global variable
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = function () {
            if (!voice) {
                voice = getVoice();
            }
        };
    }

    let runTextToSpeech = function (text, anchors) {
        //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
        voice = voice || getVoice();
        if (voice) {
            let utterance = new SpeechSynthesisUtterance(text);
            activeUtterances.push(utterance);
            utterance.lang = voice.lang;
            utterance.voice = voice;
            utterance.addEventListener('boundary', function (event) {
                if (event.charIndex == null || event.charLength == null) {
                    return false;
                }
                anchors.forEach((character, index) => {
                    if (index >= event.charIndex && index < (event.charIndex + (event.charLength || 1))) {
                        character.style.backgroundColor = '#6de200';
                    } else {
                        character.removeAttribute('style');
                    }
                });
            });
            utterance.addEventListener('end', function () {
                anchors.forEach(character => {
                    character.removeAttribute('style');
                });
                // length check shouldn't be necessary, but just in case, I guess?
                if (activeUtterances.length !== 0) {
                    activeUtterances.shift();
                }
            });
            speechSynthesis.speak(utterance);
        }
    };

    let addTextToSpeech = function (container, text, aList) {
        let textToSpeechButton = document.createElement('span');
        textToSpeechButton.className = 'speak-button';
        textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
        container.appendChild(textToSpeechButton);
    };
    let addSaveToListButton = function (container, text) {
        let buttonTexts = ['✔️', '+'];
        let saveToListButton = document.createElement('span');
        saveToListButton.className = 'add-button';
        saveToListButton.textContent = inStudyList(text) ? buttonTexts[0] : buttonTexts[1];
        saveToListButton.addEventListener('click', function () {
            addCards(currentExamples, text);
            saveToListButton.textContent = buttonTexts[0];
        });
        container.appendChild(saveToListButton);
    };

    let setupDefinitions = function (definitionList, container) {
        if (!definitionList) {
            return;
        }
        for (let i = 0; i < definitionList.length; i++) {
            let definitionItem = document.createElement('li');
            definitionItem.classList.add('definition');
            let definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
            definitionItem.textContent = definitionContent;
            container.appendChild(definitionItem);
        }
    };
    let findExamples = function (word, sentences, max) {
        max = max || maxExamples;
        let examples = [];
        //used for e.g., missing translation
        let lessDesirableExamples = [];
        //TODO consider indexing up front
        //can also reuse inner loop...consider inverting
        for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].zh.includes(word) || (word.length === 1 && sentences[i].zh.join('').includes(word))) {
                if (sentences[i].en && sentences[i].pinyin) {
                    examples.push(sentences[i]);
                    if (examples.length === max) {
                        break;
                    }
                } else if (lessDesirableExamples.length < max) {
                    lessDesirableExamples.push(sentences[i]);
                }
            }
        }
        if (examples.length < max && lessDesirableExamples.length > 0) {
            examples.splice(examples.length, 0, ...lessDesirableExamples.slice(0, (max - examples.length)));
        }
        //TODO...improve
        examples.sort((a, b) => {
            if (a.en && !b.en) {
                return -1;
            } else if (!a.en && b.en) {
                return 1;
            } else {
                return a.zh.length - b.zh.length;
            }
        });
        return examples;
    };
    let setupExampleElements = function (examples, exampleList) {
        for (let i = 0; i < examples.length; i++) {
            let exampleHolder = document.createElement('li');
            exampleHolder.classList.add('example');
            let zhHolder = document.createElement('p');
            let exampleText = examples[i].zh.join('');
            let aList = makeSentenceNavigable(exampleText, zhHolder, true);
            zhHolder.className = 'target';
            addTextToSpeech(zhHolder, exampleText, aList);
            exampleHolder.appendChild(zhHolder);
            if (examples[i].pinyin) {
                let pinyinHolder = document.createElement('p');
                pinyinHolder.textContent = examples[i].pinyin;
                pinyinHolder.className = 'transcription';
                exampleHolder.appendChild(pinyinHolder);
            }
            let enHolder = document.createElement('p');
            enHolder.textContent = examples[i].en;
            enHolder.className = 'base';
            exampleHolder.appendChild(enHolder);
            exampleList.appendChild(exampleHolder);
        }
    };

    // expects callers to ensure augmentation is available
    let augmentExamples = function (word, container) {
        const activeGraph = getActiveGraph();
        fetch(`./${activeGraph.augmentPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
            .then(response => response.json())
            .then(function (data) {
                if (!container) {
                    return false;
                }
                let examples = findExamples(word, data, 2);
                setupExampleElements(examples, container);
                currentExamples[word].push(...examples);
            });
    };

    let augmentDefinitions = function (word, container) {
        const activeGraph = getActiveGraph();
        fetch(`./${activeGraph.definitionsAugmentPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
            .then(response => response.json())
            .then(function (data) {
                if (!container) {
                    return false;
                }
                let definitionList = data[word] || [];
                setupDefinitions(definitionList, container);
                // TODO(refactor): should this be moved to setupDefinitions (and same with setupExamples/augmentExamples)?
                currentExamples[word].push(getCardFromDefinitions(word, definitionList));
            });
    };
    let renderDefinitions = function (word, definitionList, container) {
        let definitionsContainer = document.createElement('ul');
        definitionsContainer.className = 'definitions';
        container.appendChild(definitionsContainer);
        if (definitionList && definitionList.length > 0) {
            setupDefinitions(definitionList, definitionsContainer);
        } else if (getActiveGraph().definitionsAugmentPath) {
            augmentDefinitions(word, definitionsContainer);
        }
    };
    let renderWordHeader = function (word, container, active) {
        let wordHolder = document.createElement('h2');
        wordHolder.classList.add('word-header');
        let wordSpan = document.createElement('span');
        wordSpan.textContent = word;
        wordSpan.classList.add('clickable');
        wordHolder.appendChild(wordSpan);
        addTextToSpeech(wordHolder, word, []);
        addSaveToListButton(wordHolder, word);
        let separator = renderSeparator(wordHolder);
        if (active) {
            wordHolder.classList.add('active');
            separator.classList.add('expand');
        }
        wordSpan.addEventListener('click', function () {
            if (!wordHolder.classList.contains('active')) {
                document.querySelectorAll('.word-header').forEach(x => x.classList.remove('active'));
                wordHolder.classList.add('active');
                separator.classList.add('expand');
            }
            document.dispatchEvent(new CustomEvent('graph-update', { detail: word }));
        });
        container.appendChild(wordHolder);
    };
    let renderContext = function (word, container) {
        let contextHolder = document.createElement('p');
        //TODO not so thrilled with 'context' as the name here
        contextHolder.className = 'context';
        [...word].forEach(x => {
            let cardData = getCardPerformance(x);
            contextHolder.innerText += `You've seen ${x} ${getVisited()[x] || 0} times. It's in ${cardData.count} flash cards (${cardData.performance}% correct). `;
        });
        let contextFaqLink = document.createElement('a');
        contextFaqLink.className = 'active-link';
        contextFaqLink.textContent = "Learn more.";
        contextFaqLink.addEventListener('click', function () {
            showFaq(faqTypes.context);
        });
        let contextFaqContainer = document.createElement('p');
        contextFaqContainer.classList.add('context-line');
        contextFaqContainer.appendChild(contextFaqLink);
        contextHolder.appendChild(contextFaqContainer);
        container.appendChild(contextHolder);
    };
    let renderExamples = function (word, examples, container) {
        let exampleList = document.createElement('ul');
        exampleList.classList.add('examples');
        container.appendChild(exampleList);
        if (examples.length > 0) {
            setupExampleElements(examples, exampleList);
        } else if (getActiveGraph().augmentPath) {
            augmentExamples(word, exampleList);
        }
    };
    let renderMeaning = function (word, definitionList, examples, container) {
        renderDefinitions(word, definitionList, container);
        renderExamples(word, examples, container);
    };
    let renderStats = function (word, container) {
        renderContext(word, container);
        let wordFreqHeader = document.createElement('h3');
        wordFreqHeader.classList.add('explore-stat-header');
        wordFreqHeader.innerText = 'Word Frequency Stats';
        if (coverageGraph && ('words' in coverageGraph) && (word in wordSet)) {
            container.appendChild(wordFreqHeader);
            renderCoverageGraph(coverageGraph['words'], word, wordSet[word], 'word', container);
        }
        let charFreqHeader = document.createElement('h3');
        charFreqHeader.classList.add('explore-stat-header');
        charFreqHeader.innerText = 'Character Frequency Stats';
        container.appendChild(charFreqHeader);
        let rendered = false;
        for (const character of word) {
            if (charFreqs && (character in charFreqs) && coverageGraph && ('chars' in coverageGraph)) {
                renderCoverageGraph(coverageGraph['chars'], character, charFreqs[character], 'character', container);
                rendered = true;
            }
        }
        if (!rendered) {
            charFreqHeader.style.display = 'none';
        }
        //TODO(refactor): render the coverage stats, if available
        // if not available, still render the "word ranks X, characters rank Y"
    };

    function switchToTab(id, tabs) {
        for (const [tabId, elements] of Object.entries(tabs)) {
            const separator = elements.tab.querySelector('.separator');
            if (id === tabId) {
                elements.tab.classList.add('active');
                separator.classList.add('expand');
                elements.panel.removeAttribute('style');
                elements.panel.classList.add(elements.transitionClass);
                elements.callback();
            } else {
                elements.tab.classList.remove('active');
                separator.classList.remove('expand');
                elements.panel.classList.remove(elements.transitionClass);
                elements.panel.style.display = 'none';
            }
        }
    }
    function renderSeparator(container) {
        let separator = document.createElement('span');
        separator.classList.add('separator');
        container.appendChild(separator);
        return separator;
    }

    let renderTabs = function (container, texts, panels, renderCallbacks, transitionClasses) {
        // TODO(refactor): callbacks to hide/show the panels
        let tabs = {};
        for (let i = 0; i < texts.length; i++) {
            let tabContainer = document.createElement('span');
            tabContainer.classList.add('explore-tab');
            tabContainer.id = `tab-${texts[i].toLowerCase()}`;
            if (i === 0) {
                tabContainer.classList.add('active');
            }
            tabContainer.innerText = texts[i];
            renderSeparator(tabContainer);
            container.appendChild(tabContainer);
            tabs[tabContainer.id] = {
                tab: tabContainer,
                panel: panels[i],
                callback: renderCallbacks[i],
                transitionClass: transitionClasses[i]
            };

            tabContainer.addEventListener('click', function (event) {
                switchToTab(event.target.id, tabs);
            });
        }
    };
    function renderExplore(word, container, definitionList, examples, active) {
        let tabs = document.createElement('div');
        renderWordHeader(word, container, active);
        tabs.classList.add('explore-tabs');
        container.appendChild(tabs);
        let meaningContainer = document.createElement('div');
        meaningContainer.classList.add('explore-subpane');
        let statsContainer = document.createElement('div');
        statsContainer.classList.add('explore-subpane');
        renderTabs(tabs, ['Meaning', 'Stats'], [meaningContainer, statsContainer], [() => { }, function () {
            statsContainer.innerHTML = '';
            renderStats(word, statsContainer);
        }], ['slide-in', 'slide-in']);
        container.appendChild(meaningContainer);
        renderMeaning(word, definitionList, examples, meaningContainer);
        container.appendChild(statsContainer);
    }
    let setupExamples = function (words) {
        currentExamples = {};
        // if we're showing examples, never show the walkthrough.
        walkThrough.style.display = 'none';
        notFoundElement.style.display = 'none';
        //TODO this mixes markup modification and example finding
        while (examplesList.firstChild) {
            examplesList.firstChild.remove();
        }
        let numExamples = maxExamples;
        if (words.length > 1) {
            numExamples = 3;
            let instructions = document.createElement('p');
            instructions.classList.add('explanation');
            instructions.innerText = 'There are multiple words. Click one to update the diagram.';
            examplesList.appendChild(instructions);
        }
        let rendered = false;
        for (let i = 0; i < words.length; i++) {
            let examples = findExamples(words[i], sentences, numExamples);
            let definitionList = definitions[words[i]] || [];

            currentExamples[words[i]] = [];
            //TODO: definition list doesn't have the same interface (missing zh field)
            currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
            //setup current examples for potential future export
            currentExamples[words[i]].push(...examples);

            let item = document.createElement('div');
            item.classList.add('word-data');
            // TODO(refactor):
            // a) this "each word is either ignore or an actual word" thing is weird
            // b) render some message that's clearer
            if (words[i].ignore) {
                let ignoredHeader = document.createElement('h2');
                ignoredHeader.innerText = words[i].word;
                ignoredHeader.classList.add('word-header');
                item.appendChild(ignoredHeader);
                examplesList.append(item);
                continue;
            }
            renderExplore(words[i], item, definitionList, examples, (!rendered && words.length > 1));
            rendered = true;

            examplesList.append(item);
        }
        currentWords = words;
        writeExploreState(currentWords);
    };

    //TODO can this be combined with the definition rendering part?
    let getCardFromDefinitions = function (text, definitionList) {
        //this assumes definitionList non null
        let result = { zh: [text] };
        let answer = '';
        for (let i = 0; i < definitionList.length; i++) {
            answer += definitionList[i].pinyin + ': ' + definitionList[i].en;
            answer += i == definitionList.length - 1 ? '' : ', ';
        }
        result['en'] = answer;
        return result;
    };
    let fetchStats = function () {
        const activeGraph = getActiveGraph();
        if (activeGraph.hasCoverage === 'all') {
            fetch(`./data/${activeGraph.prefix}/coverage_stats.json`)
                .then(response => response.json())
                .then(data => coverageGraph = data);
            fetch(`./data/${activeGraph.prefix}/character_freq_list.json`)
                .then(response => response.json())
                .then(data => {
                    charFreqs = {};
                    for (let i = 0; i < data.length; i++) {
                        charFreqs[data[i]] = i + 1;//avoid zero indexing
                    }
                });
        } else {
            charFreqs = null;
            coverageGraph = null;
        }
    };
    let initialize$4 = function () {
        // Note: github pages rewrites are only possible via a 404 hack,
        // so removing the history API integration on the main branch.
        //TODO(refactor): show study when it was the last state
        document.addEventListener('explore-update', function (event) {
            hanziBox.value = event.detail.display || event.detail.words[0];
            setupExamples(event.detail.words);
            updateVisited(event.detail.words);
        });
        document.addEventListener('character-set-changed', function () {
            voice = getVoice();
            fetchStats();
        });
        voice = getVoice();
        fetchStats();
    };

    let makeSentenceNavigable = function (text, container, noExampleChange) {
        let sentenceContainer = document.createElement('span');
        sentenceContainer.className = "sentence-container";

        let anchorList = [];
        for (let i = 0; i < text.length; i++) {
            (function (character) {
                let a = document.createElement('a');
                a.textContent = character;
                if (hanzi[character]) {
                    a.className = 'navigable';
                }
                a.addEventListener('click', function () {
                    if (hanzi[character]) {
                        if (character in hanzi) {
                            switchDiagramView(diagramKeys.main);
                            document.dispatchEvent(new CustomEvent('graph-update', { detail: character }));
                        }
                        //enable seamless switching, but don't update if we're already showing examples for character
                        if (!noExampleChange && (!currentWords || (currentWords.length !== 1 || currentWords[0] !== character))) {
                            setupExamples([character]);
                        }
                    }
                });
                anchorList.push(a);
                sentenceContainer.appendChild(a);
            }(text[i]));
        }
        container.appendChild(sentenceContainer);
        return anchorList;
    };

    const studyContainer = document.getElementById('study-container');

    const exportStudyListButton = document.getElementById('exportStudyListButton');
    const cardQuestionContainer = document.getElementById('card-question-container');
    const cardAnswerContainer = document.getElementById('card-answer-container');
    const showAnswerButton = document.getElementById('show-answer-button');
    const taskCompleteElement = document.getElementById('task-complete');
    const cardsDueElement = document.getElementById('cards-due');
    const cardsDueCounter = document.getElementById('card-due-count');
    const taskDescriptionElement = document.getElementById('task-description');
    const cardAnswerElement = document.getElementById('card-answer');
    const wrongButton = document.getElementById('wrong-button');
    const rightButton = document.getElementById('right-button');
    const deleteCardButton = document.getElementById('delete-card-button');

    const relatedCardsContainer = document.getElementById('related-cards-container');
    const relatedCardsElement = document.getElementById('related-cards');
    const relatedCardQueryElement = document.getElementById('related-card-query');
    const cardOldMessageElement = document.getElementById('card-old-message');
    const cardNewMessageElement = document.getElementById('card-new-message');
    const cardRightCountElement = document.getElementById('card-right-count');
    const cardWrongCountElement = document.getElementById('card-wrong-count');
    const cardPercentageElement = document.getElementById('card-percentage');
    const clozePlaceholderCharacter = "_";
    const clozePlaceholder = clozePlaceholderCharacter + clozePlaceholderCharacter + clozePlaceholderCharacter;

    const explanationContainer = document.getElementById('study-explain-container');
    const explanationHideButton = document.getElementById('hide-study-explanation');

    let currentKey = null;

    // TODO: must match cardTypes, which sucks
    // why can't you do: {cardTypes.RECOGNITION: function(){...}}?
    const cardRenderers = {
        'recognition': function (currentCard) {
            taskDescriptionElement.innerText = 'What does the text below mean?';
            let question = currentCard.zh.join('');
            let aList = makeSentenceNavigable(question, cardQuestionContainer);
            for (let i = 0; i < aList.length; i++) {
                aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
            }
            cardQuestionContainer.classList.add('target');
            addTextToSpeech(cardQuestionContainer, question, aList);
            cardAnswerElement.textContent = currentCard.en;

        },
        'recall': function (currentCard) {
            let question = currentCard.en;
            let answer = currentCard.zh.join('');
            // so clean, so clean
            if (answer === currentCard.vocabOrigin) {
                taskDescriptionElement.innerText = `Can you match the definitions below to a Chinese word?`;
            } else {
                taskDescriptionElement.innerText = `Can you translate the text below to Chinese?`;
            }
            cardAnswerElement.innerHTML = '';
            cardQuestionContainer.classList.remove('target');
            // TODO(refactor): target causes side effects
            // cardAnswerContainer.classList.add('target');
            let aList = makeSentenceNavigable(answer, cardAnswerElement);
            for (let i = 0; i < aList.length; i++) {
                aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
            }
            addTextToSpeech(cardAnswerElement, answer, aList);
            cardQuestionContainer.innerText = question;
        },
        'cloze': function (currentCard) {
            taskDescriptionElement.innerText = `Can you replace ${clozePlaceholder} to match the translation?`;
            let clozedSentence;
            if (currentCard.vocabOrigin.length === 1) {
                clozedSentence = currentCard.zh.join('');
                clozedSentence = clozedSentence.replaceAll(currentCard.vocabOrigin, x => clozePlaceholder);
            }
            else {
                clozedSentence = currentCard.zh.map(x => x === currentCard.vocabOrigin ? clozePlaceholder : x).join('');
            }
            let clozeContainer = document.createElement('p');
            clozeContainer.className = 'cloze-container';
            //TODO(refactor): target shouldn't make this thing into a flex element the way it does now
            cardQuestionContainer.classList.remove('target');
            // cardAnswerContainer.classList.add('target');
            let aList = makeSentenceNavigable(clozedSentence, clozeContainer);
            for (let i = 0; i < aList.length; i++) {
                // TODO yuck
                if (i >= 2 && aList[i].innerText === clozePlaceholderCharacter && aList[i - 1].innerText === clozePlaceholderCharacter && aList[i - 2].innerText === clozePlaceholderCharacter) {
                    aList[i].classList.add('cloze-placeholder');
                    aList[i - 1].classList.add('cloze-placeholder');
                    aList[i - 2].classList.add('cloze-placeholder');
                }
                aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
            }
            cardQuestionContainer.appendChild(clozeContainer);
            let clozeAnswerContainer = document.createElement('p');
            clozeAnswerContainer.className = 'cloze-container';
            clozeAnswerContainer.innerText = currentCard.en;
            cardQuestionContainer.appendChild(clozeAnswerContainer);
            cardAnswerElement.innerHTML = '';
            let answerAList = makeSentenceNavigable(currentCard.vocabOrigin, cardAnswerElement);
            for (let i = 0; i < answerAList.length; i++) {
                answerAList[i].addEventListener('click', displayRelatedCards.bind(this, answerAList[i]));
            }
            addTextToSpeech(cardAnswerElement, currentCard.vocabOrigin, answerAList);
        }
    };

    let displayRelatedCards = function (anchor) {
        let MAX_RELATED_CARDS = 3;
        let related = findOtherCards(anchor.textContent, currentKey);
        let studyList = getStudyList();
        relatedCardQueryElement.innerText = anchor.textContent;
        if (!related || !related.length) {
            relatedCardsContainer.style.display = 'none';
            return;
        }
        relatedCardsElement.innerHTML = '';
        for (let i = 0; i < Math.min(MAX_RELATED_CARDS, related.length); i++) {
            let item = document.createElement('p');
            item.className = 'related-card';
            item.innerText = related[i];
            let relatedPerf = document.createElement('p');
            relatedPerf.className = 'related-card-performance';
            relatedPerf.innerText = `(right ${studyList[related[i]].rightCount || 0}, wrong ${studyList[related[i]].wrongCount || 0})`;
            item.appendChild(relatedPerf);
            relatedCardsElement.appendChild(item);
        }
        relatedCardsContainer.removeAttribute('style');
    };

    let setupStudyMode = function () {
        let studyList = getStudyList();
        currentKey = null;
        let currentCard = null;
        cardAnswerContainer.style.display = 'none';
        showAnswerButton.innerText = "Show Answer";
        let counter = 0;
        for (const [key, value] of Object.entries(studyList)) {
            if (value.due <= Date.now()) {
                if (!currentCard || currentCard.due > value.due ||
                    (currentCard.due == value.due && value.zh.length < currentCard.zh.length)) {
                    currentCard = value;
                    currentKey = key;
                }
                counter++;
            }
        }
        cardsDueCounter.textContent = counter;
        cardQuestionContainer.innerHTML = '';
        if (counter === 0) {
            taskCompleteElement.removeAttribute('style');
            taskDescriptionElement.style.display = 'none';
            showAnswerButton.style.display = 'none';
            return;
        }

        taskCompleteElement.style.display = 'none';
        showAnswerButton.removeAttribute('style');
        // Old cards have no type property, but all are recognition
        cardRenderers[currentCard.type || cardTypes.RECOGNITION](currentCard);
        taskDescriptionElement.removeAttribute('style');

        if (currentCard.wrongCount + currentCard.rightCount != 0) {
            cardOldMessageElement.removeAttribute('style');
            cardNewMessageElement.style.display = 'none';
            cardPercentageElement.textContent = Math.round(100 * currentCard.rightCount / ((currentCard.rightCount + currentCard.wrongCount) || 1));
            cardRightCountElement.textContent = `${currentCard.rightCount || 0} time${currentCard.rightCount != 1 ? 's' : ''}`;
            cardWrongCountElement.textContent = `${currentCard.wrongCount || 0} time${currentCard.wrongCount != 1 ? 's' : ''}`;
        } else {
            cardNewMessageElement.removeAttribute('style');
            cardOldMessageElement.style.display = 'none';
        }
        relatedCardsContainer.style.display = 'none';
    };

    let initialize$3 = function () {
        showAnswerButton.addEventListener('click', function () {
            showAnswerButton.innerText = "Answer:";
            cardAnswerContainer.removeAttribute('style');
            showAnswerButton.scrollIntoView();
        });
        wrongButton.addEventListener('click', function () {
            updateCard(studyResult.INCORRECT, currentKey);
            setupStudyMode();
            cardsDueElement.scrollIntoView();
            cardsDueElement.classList.add('result-indicator-wrong');
            setTimeout(function () {
                cardsDueElement.classList.remove('result-indicator-wrong');
            }, 750);
            recordEvent(studyResult.INCORRECT);
        });
        rightButton.addEventListener('click', function () {
            updateCard(studyResult.CORRECT, currentKey);
            setupStudyMode();
            cardsDueElement.scrollIntoView();
            cardsDueElement.classList.add('result-indicator-right');
            setTimeout(function () {
                cardsDueElement.classList.remove('result-indicator-right');
            }, 750);
            recordEvent(studyResult.CORRECT);
        });
        deleteCardButton.addEventListener('click', function () {
            let deletedKey = currentKey;
            removeFromStudyList(deletedKey);
            //use deletedKey rather than currentKey since saveStudyList can end up modifying what we have
            //same with addDeletedKey
            saveStudyList();
            setupStudyMode();
        });
        exportStudyListButton.addEventListener('click', function () {
            let studyList = getStudyList();
            let content = "data:text/plain;charset=utf-8,";
            for (const [key, value] of Object.entries(studyList)) {
                // TODO: figure out cloze/recall exports
                if (!value.type || value.type === cardTypes.RECOGNITION) {
                    //replace is a hack for flashcard field separator...TODO could escape
                    content += [key.replace(';', ''), value.en.replace(';', '')].join(';');
                    content += '\n';
                }
            }
            //wow, surely it can't be this absurd
            let encodedUri = encodeURI(content);
            let link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "hanzi-graph-export-" + Date.now() + ".txt");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        if (Object.keys(getStudyList() || {}).length > 0) {
            exportStudyListButton.removeAttribute('style');
        }
        //TODO: may want to consider separate callback types for add/delete and also updated
        registerCallback(dataTypes.studyList, function (studyList) {
            if (studyList && Object.keys(studyList).length > 0) {
                exportStudyListButton.removeAttribute('style');
            } else {
                exportStudyListButton.style.display = 'none';
            }
            setupStudyMode();
        });
        studyContainer.addEventListener('shown', function () {
            setupStudyMode();
        });
        explanationHideButton.addEventListener('click', function () {
            explanationContainer.addEventListener('animationend', function () {
                explanationContainer.style.display = 'none';
                explanationContainer.classList.remove('fade');
            });
            explanationContainer.classList.add('fade');
        });
    };

    const statsContainer = document.getElementById('stats-container');

    const statsShow = document.getElementById('stats-link');

    const hourlyGraphDetail = document.getElementById('hourly-graph-detail');
    const addedCalendarDetail = document.getElementById('added-calendar-detail');
    const studyCalendarDetail = document.getElementById('study-calendar-detail');
    const studyGraphDetail = document.getElementById('studied-graph-detail');
    const visitedGraphDetail = document.getElementById('visited-graph-detail');

    let lastLevelUpdatePrefix = '';
    let shown = false;

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

    //TODO: combine with the one in data-layer.js
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
    let BarChartClickHandler = function (detail, totalsByLevel, prop, index, message) {
        detail.innerHTML = '';
        //TODO: why no built-in difference method?
        let missingHanzi = new Set([...totalsByLevel[index + 1].characters].filter(x => !totalsByLevel[index + 1][prop].has(x)));
        missingHanzi.forEach(x => message += x);
        detail.innerHTML = message;
    };
    //could be an array, but we're possibly going to add out of order, and also trying to avoid hardcoding max level
    let totalsByLevel = {};
    let updateTotalsByLevel = function () {
        totalsByLevel = {};
        Object.keys(hanzi).forEach(x => {
            let level = hanzi[x].node.level;
            if (!(level in totalsByLevel)) {
                totalsByLevel[level] = { seen: new Set(), total: 0, visited: new Set(), characters: new Set() };
            }
            totalsByLevel[level].total++;
            totalsByLevel[level].characters.add(x);
        });
    };
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
                totalsByLevel[level].seen.add(x);
            }
        });
        let levelData = [];
        //safe since we don't add keys in the read of /decks/
        Object.keys(totalsByLevel).sort().forEach(x => {
            levelData.push({
                count: totalsByLevel[x].seen.size || 0,
                total: totalsByLevel[x].total
            });
        });
        const studiedGraph = document.getElementById('studied-graph');
        studiedGraph.innerHTML = '';
        studiedGraph.appendChild(
            BarChart(levelData, {
                labelText: (i) => legend[i],
                color: () => "#68aaee",
                clickHandler: function (i) {
                    BarChartClickHandler(
                        studyGraphDetail,
                        totalsByLevel,
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

        const addedCalendar = document.getElementById('added-calendar');
        addedCalendar.innerHTML = '';
        addedCalendar.appendChild(
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
                    addedCalendarDetail.innerHTML = '';

                    let data = dailyAdds[i];
                    let characters = '';
                    data.chars.forEach(x => characters += x);
                    if (data.total && data.chars.size) {
                        addedCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you added ${data.total} cards, with these new characters: ${characters}`;
                    } else if (data.total) {
                        addedCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you added ${data.total} cards, with no new characters.`;
                    } else {
                        addedCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you added no new cards.`;
                    }
                }
            })
        );
        document.getElementById('added-calendar-calendar').scrollTo({
            top: 0,
            left: document.getElementById('added-calendar-today').offsetLeft
        });
    };
    let createVisitedGraphs = function (visitedCharacters, legend) {
        if (!visitedCharacters) {
            return;
        }
        Object.keys(visitedCharacters).forEach(x => {
            if (hanzi[x]) {
                const level = hanzi[x].node.level;
                totalsByLevel[level].visited.add(x);
            }
        });
        let levelData = [];
        //safe since we don't add keys in the read of /decks/
        Object.keys(totalsByLevel).sort().forEach(x => {
            levelData.push({
                count: totalsByLevel[x].visited.size || 0,
                total: totalsByLevel[x].total
            });
        });
        const visitedGraph = document.getElementById('visited-graph');
        visitedGraph.innerHTML = '';
        visitedGraph.appendChild(
            BarChart(levelData, {
                labelText: (i) => legend[i],
                color: () => "#68aaee",
                clickHandler: function (i) {
                    BarChartClickHandler(
                        visitedGraphDetail,
                        totalsByLevel,
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
                correct: (results.hourly[i.toString()]) ? (results.hourly[i.toString()].correct || 0) : 0,
                incorrect: (results.hourly[i.toString()]) ? (results.hourly[i.toString()].incorrect || 0) : 0
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
        const studyCalendar = document.getElementById('study-calendar');
        studyCalendar.innerHTML = '';
        studyCalendar.appendChild(
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
                    studyCalendarDetail.innerHTML = '';

                    let data = dailyData[i];
                    studyCalendarDetail.innerText = `On ${getUTCISODate(data.date)}, you studied ${data.total || 0} cards. You got ${data.correct} right and ${data.incorrect} wrong.`;
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
        let hourlyClickHandler = function (i) {
            if ((hourlyData[i].correct + hourlyData[i].incorrect) !== 0) {
                hourlyGraphDetail.innerText = `In the ${getHour(hourlyData[i].hour)} hour, you've gotten ${hourlyData[i].correct} correct and ${hourlyData[i].incorrect} incorrect, or ${Math.round((hourlyData[i].correct / (hourlyData[i].correct + hourlyData[i].incorrect)) * 100)}% correct.`;
            } else {
                hourlyGraphDetail.innerText = `In the ${getHour(hourlyData[i].hour)} hour, you've not studied.`;
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
        const hourlyGraph = document.getElementById('hourly-graph');
        hourlyGraph.innerHTML = '';
        hourlyGraph.appendChild(
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

    let initialize$2 = function () {
        lastLevelUpdatePrefix = getActiveGraph().prefix;
        updateTotalsByLevel();
        statsShow.addEventListener('click', function () {
            let activeGraph = getActiveGraph();
            if (activeGraph.prefix !== lastLevelUpdatePrefix) {
                lastLevelUpdatePrefix = activeGraph.prefix;
                updateTotalsByLevel();
            }
            switchToState(stateKeys.stats);
            shown = true;
            createVisitedGraphs(getVisited(), activeGraph.legend);
            createCardGraphs(getStudyList(), activeGraph.legend);
            createStudyResultGraphs(getStudyResults(), activeGraph.legend);
        });

        statsContainer.addEventListener('hidden', function () {
            //TODO(refactor) this is all silly
            if (!shown) {
                return;
            }
            studyGraphDetail.innerText = '';
            addedCalendarDetail.innerText = '';
            visitedGraphDetail.innerText = '';
            studyCalendarDetail.innerText = '';
            hourlyGraphDetail.innerText = '';
        });
    };

    function max(values, valueof) {
      let max;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (max < value || (max === undefined && value >= value))) {
            max = value;
          }
        }
      }
      return max;
    }

    function min(values, valueof) {
      let min;
      if (valueof === undefined) {
        for (const value of values) {
          if (value != null
              && (min > value || (min === undefined && value >= value))) {
            min = value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if ((value = valueof(value, ++index, values)) != null
              && (min > value || (min === undefined && value >= value))) {
            min = value;
          }
        }
      }
      return min;
    }

    function sum(values, valueof) {
      let sum = 0;
      if (valueof === undefined) {
        for (let value of values) {
          if (value = +value) {
            sum += value;
          }
        }
      } else {
        let index = -1;
        for (let value of values) {
          if (value = +valueof(value, ++index, values)) {
            sum += value;
          }
        }
      }
      return sum;
    }

    function targetDepth(d) {
      return d.target.depth;
    }

    function left(node) {
      return node.depth;
    }

    function right(node, n) {
      return n - 1 - node.height;
    }

    function justify(node, n) {
      return node.sourceLinks.length ? node.depth : n - 1;
    }

    function center(node) {
      return node.targetLinks.length ? node.depth
          : node.sourceLinks.length ? min(node.sourceLinks, targetDepth) - 1
          : 0;
    }

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function ascendingSourceBreadth(a, b) {
      return ascendingBreadth(a.source, b.source) || a.index - b.index;
    }

    function ascendingTargetBreadth(a, b) {
      return ascendingBreadth(a.target, b.target) || a.index - b.index;
    }

    function ascendingBreadth(a, b) {
      return a.y0 - b.y0;
    }

    function value(d) {
      return d.value;
    }

    function defaultId(d) {
      return d.index;
    }

    function defaultNodes(graph) {
      return graph.nodes;
    }

    function defaultLinks(graph) {
      return graph.links;
    }

    function find(nodeById, id) {
      const node = nodeById.get(id);
      if (!node) throw new Error("missing: " + id);
      return node;
    }

    function computeLinkBreadths({nodes}) {
      for (const node of nodes) {
        let y0 = node.y0;
        let y1 = y0;
        for (const link of node.sourceLinks) {
          link.y0 = y0 + link.width / 2;
          y0 += link.width;
        }
        for (const link of node.targetLinks) {
          link.y1 = y1 + link.width / 2;
          y1 += link.width;
        }
      }
    }

    function Sankey() {
      let x0 = 0, y0 = 0, x1 = 1, y1 = 1; // extent
      let dx = 24; // nodeWidth
      let dy = 8, py; // nodePadding
      let id = defaultId;
      let align = justify;
      let sort;
      let linkSort;
      let nodes = defaultNodes;
      let links = defaultLinks;
      let iterations = 6;

      function sankey() {
        const graph = {nodes: nodes.apply(null, arguments), links: links.apply(null, arguments)};
        computeNodeLinks(graph);
        computeNodeValues(graph);
        computeNodeDepths(graph);
        computeNodeHeights(graph);
        computeNodeBreadths(graph);
        computeLinkBreadths(graph);
        return graph;
      }

      sankey.update = function(graph) {
        computeLinkBreadths(graph);
        return graph;
      };

      sankey.nodeId = function(_) {
        return arguments.length ? (id = typeof _ === "function" ? _ : constant$1(_), sankey) : id;
      };

      sankey.nodeAlign = function(_) {
        return arguments.length ? (align = typeof _ === "function" ? _ : constant$1(_), sankey) : align;
      };

      sankey.nodeSort = function(_) {
        return arguments.length ? (sort = _, sankey) : sort;
      };

      sankey.nodeWidth = function(_) {
        return arguments.length ? (dx = +_, sankey) : dx;
      };

      sankey.nodePadding = function(_) {
        return arguments.length ? (dy = py = +_, sankey) : dy;
      };

      sankey.nodes = function(_) {
        return arguments.length ? (nodes = typeof _ === "function" ? _ : constant$1(_), sankey) : nodes;
      };

      sankey.links = function(_) {
        return arguments.length ? (links = typeof _ === "function" ? _ : constant$1(_), sankey) : links;
      };

      sankey.linkSort = function(_) {
        return arguments.length ? (linkSort = _, sankey) : linkSort;
      };

      sankey.size = function(_) {
        return arguments.length ? (x0 = y0 = 0, x1 = +_[0], y1 = +_[1], sankey) : [x1 - x0, y1 - y0];
      };

      sankey.extent = function(_) {
        return arguments.length ? (x0 = +_[0][0], x1 = +_[1][0], y0 = +_[0][1], y1 = +_[1][1], sankey) : [[x0, y0], [x1, y1]];
      };

      sankey.iterations = function(_) {
        return arguments.length ? (iterations = +_, sankey) : iterations;
      };

      function computeNodeLinks({nodes, links}) {
        for (const [i, node] of nodes.entries()) {
          node.index = i;
          node.sourceLinks = [];
          node.targetLinks = [];
        }
        const nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d]));
        for (const [i, link] of links.entries()) {
          link.index = i;
          let {source, target} = link;
          if (typeof source !== "object") source = link.source = find(nodeById, source);
          if (typeof target !== "object") target = link.target = find(nodeById, target);
          source.sourceLinks.push(link);
          target.targetLinks.push(link);
        }
        if (linkSort != null) {
          for (const {sourceLinks, targetLinks} of nodes) {
            sourceLinks.sort(linkSort);
            targetLinks.sort(linkSort);
          }
        }
      }

      function computeNodeValues({nodes}) {
        for (const node of nodes) {
          node.value = node.fixedValue === undefined
              ? Math.max(sum(node.sourceLinks, value), sum(node.targetLinks, value))
              : node.fixedValue;
        }
      }

      function computeNodeDepths({nodes}) {
        const n = nodes.length;
        let current = new Set(nodes);
        let next = new Set;
        let x = 0;
        while (current.size) {
          for (const node of current) {
            node.depth = x;
            for (const {target} of node.sourceLinks) {
              next.add(target);
            }
          }
          if (++x > n) throw new Error("circular link");
          current = next;
          next = new Set;
        }
      }

      function computeNodeHeights({nodes}) {
        const n = nodes.length;
        let current = new Set(nodes);
        let next = new Set;
        let x = 0;
        while (current.size) {
          for (const node of current) {
            node.height = x;
            for (const {source} of node.targetLinks) {
              next.add(source);
            }
          }
          if (++x > n) throw new Error("circular link");
          current = next;
          next = new Set;
        }
      }

      function computeNodeLayers({nodes}) {
        const x = max(nodes, d => d.depth) + 1;
        const kx = (x1 - x0 - dx) / (x - 1);
        const columns = new Array(x);
        for (const node of nodes) {
          const i = Math.max(0, Math.min(x - 1, Math.floor(align.call(null, node, x))));
          node.layer = i;
          node.x0 = x0 + i * kx;
          node.x1 = node.x0 + dx;
          if (columns[i]) columns[i].push(node);
          else columns[i] = [node];
        }
        if (sort) for (const column of columns) {
          column.sort(sort);
        }
        return columns;
      }

      function initializeNodeBreadths(columns) {
        const ky = min(columns, c => (y1 - y0 - (c.length - 1) * py) / sum(c, value));
        for (const nodes of columns) {
          let y = y0;
          for (const node of nodes) {
            node.y0 = y;
            node.y1 = y + node.value * ky;
            y = node.y1 + py;
            for (const link of node.sourceLinks) {
              link.width = link.value * ky;
            }
          }
          y = (y1 - y + py) / (nodes.length + 1);
          for (let i = 0; i < nodes.length; ++i) {
            const node = nodes[i];
            node.y0 += y * (i + 1);
            node.y1 += y * (i + 1);
          }
          reorderLinks(nodes);
        }
      }

      function computeNodeBreadths(graph) {
        const columns = computeNodeLayers(graph);
        py = Math.min(dy, (y1 - y0) / (max(columns, c => c.length) - 1));
        initializeNodeBreadths(columns);
        for (let i = 0; i < iterations; ++i) {
          const alpha = Math.pow(0.99, i);
          const beta = Math.max(1 - alpha, (i + 1) / iterations);
          relaxRightToLeft(columns, alpha, beta);
          relaxLeftToRight(columns, alpha, beta);
        }
      }

      // Reposition each node based on its incoming (target) links.
      function relaxLeftToRight(columns, alpha, beta) {
        for (let i = 1, n = columns.length; i < n; ++i) {
          const column = columns[i];
          for (const target of column) {
            let y = 0;
            let w = 0;
            for (const {source, value} of target.targetLinks) {
              let v = value * (target.layer - source.layer);
              y += targetTop(source, target) * v;
              w += v;
            }
            if (!(w > 0)) continue;
            let dy = (y / w - target.y0) * alpha;
            target.y0 += dy;
            target.y1 += dy;
            reorderNodeLinks(target);
          }
          if (sort === undefined) column.sort(ascendingBreadth);
          resolveCollisions(column, beta);
        }
      }

      // Reposition each node based on its outgoing (source) links.
      function relaxRightToLeft(columns, alpha, beta) {
        for (let n = columns.length, i = n - 2; i >= 0; --i) {
          const column = columns[i];
          for (const source of column) {
            let y = 0;
            let w = 0;
            for (const {target, value} of source.sourceLinks) {
              let v = value * (target.layer - source.layer);
              y += sourceTop(source, target) * v;
              w += v;
            }
            if (!(w > 0)) continue;
            let dy = (y / w - source.y0) * alpha;
            source.y0 += dy;
            source.y1 += dy;
            reorderNodeLinks(source);
          }
          if (sort === undefined) column.sort(ascendingBreadth);
          resolveCollisions(column, beta);
        }
      }

      function resolveCollisions(nodes, alpha) {
        const i = nodes.length >> 1;
        const subject = nodes[i];
        resolveCollisionsBottomToTop(nodes, subject.y0 - py, i - 1, alpha);
        resolveCollisionsTopToBottom(nodes, subject.y1 + py, i + 1, alpha);
        resolveCollisionsBottomToTop(nodes, y1, nodes.length - 1, alpha);
        resolveCollisionsTopToBottom(nodes, y0, 0, alpha);
      }

      // Push any overlapping nodes down.
      function resolveCollisionsTopToBottom(nodes, y, i, alpha) {
        for (; i < nodes.length; ++i) {
          const node = nodes[i];
          const dy = (y - node.y0) * alpha;
          if (dy > 1e-6) node.y0 += dy, node.y1 += dy;
          y = node.y1 + py;
        }
      }

      // Push any overlapping nodes up.
      function resolveCollisionsBottomToTop(nodes, y, i, alpha) {
        for (; i >= 0; --i) {
          const node = nodes[i];
          const dy = (node.y1 - y) * alpha;
          if (dy > 1e-6) node.y0 -= dy, node.y1 -= dy;
          y = node.y0 - py;
        }
      }

      function reorderNodeLinks({sourceLinks, targetLinks}) {
        if (linkSort === undefined) {
          for (const {source: {sourceLinks}} of targetLinks) {
            sourceLinks.sort(ascendingTargetBreadth);
          }
          for (const {target: {targetLinks}} of sourceLinks) {
            targetLinks.sort(ascendingSourceBreadth);
          }
        }
      }

      function reorderLinks(nodes) {
        if (linkSort === undefined) {
          for (const {sourceLinks, targetLinks} of nodes) {
            sourceLinks.sort(ascendingTargetBreadth);
            targetLinks.sort(ascendingSourceBreadth);
          }
        }
      }

      // Returns the target.y0 that would produce an ideal link from source to target.
      function targetTop(source, target) {
        let y = source.y0 - (source.sourceLinks.length - 1) * py / 2;
        for (const {target: node, width} of source.sourceLinks) {
          if (node === target) break;
          y += width + py;
        }
        for (const {source: node, width} of target.targetLinks) {
          if (node === source) break;
          y -= width;
        }
        return y;
      }

      // Returns the source.y0 that would produce an ideal link from source to target.
      function sourceTop(source, target) {
        let y = target.y0 - (target.targetLinks.length - 1) * py / 2;
        for (const {source: node, width} of target.targetLinks) {
          if (node === source) break;
          y += width + py;
        }
        for (const {target: node, width} of source.sourceLinks) {
          if (node === target) break;
          y -= width;
        }
        return y;
      }

      return sankey;
    }

    var pi = Math.PI,
        tau = 2 * pi,
        epsilon = 1e-6,
        tauEpsilon = tau - epsilon;

    function Path() {
      this._x0 = this._y0 = // start of current subpath
      this._x1 = this._y1 = null; // end of current subpath
      this._ = "";
    }

    function path() {
      return new Path;
    }

    Path.prototype = path.prototype = {
      constructor: Path,
      moveTo: function(x, y) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
      },
      closePath: function() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      },
      lineTo: function(x, y) {
        this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      quadraticCurveTo: function(x1, y1, x, y) {
        this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      bezierCurveTo: function(x1, y1, x2, y2, x, y) {
        this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
      },
      arcTo: function(x1, y1, x2, y2, r) {
        x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
        var x0 = this._x1,
            y0 = this._y1,
            x21 = x2 - x1,
            y21 = y2 - y1,
            x01 = x0 - x1,
            y01 = y0 - y1,
            l01_2 = x01 * x01 + y01 * y01;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x1,y1).
        if (this._x1 === null) {
          this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
        else if (!(l01_2 > epsilon));

        // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
        // Equivalently, is (x1,y1) coincident with (x2,y2)?
        // Or, is the radius zero? Line to (x1,y1).
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
          this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
        }

        // Otherwise, draw an arc!
        else {
          var x20 = x2 - x0,
              y20 = y2 - y0,
              l21_2 = x21 * x21 + y21 * y21,
              l20_2 = x20 * x20 + y20 * y20,
              l21 = Math.sqrt(l21_2),
              l01 = Math.sqrt(l01_2),
              l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
              t01 = l / l01,
              t21 = l / l21;

          // If the start tangent is not coincident with (x0,y0), line to.
          if (Math.abs(t01 - 1) > epsilon) {
            this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
          }

          this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
        }
      },
      arc: function(x, y, r, a0, a1, ccw) {
        x = +x, y = +y, r = +r, ccw = !!ccw;
        var dx = r * Math.cos(a0),
            dy = r * Math.sin(a0),
            x0 = x + dx,
            y0 = y + dy,
            cw = 1 ^ ccw,
            da = ccw ? a0 - a1 : a1 - a0;

        // Is the radius negative? Error.
        if (r < 0) throw new Error("negative radius: " + r);

        // Is this path empty? Move to (x0,y0).
        if (this._x1 === null) {
          this._ += "M" + x0 + "," + y0;
        }

        // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
        else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
          this._ += "L" + x0 + "," + y0;
        }

        // Is this arc empty? We’re done.
        if (!r) return;

        // Does the angle go the wrong way? Flip the direction.
        if (da < 0) da = da % tau + tau;

        // Is this a complete circle? Draw two arcs to complete the circle.
        if (da > tauEpsilon) {
          this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
        }

        // Is this arc non-empty? Draw an arc!
        else if (da > epsilon) {
          this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
        }
      },
      rect: function(x, y, w, h) {
        this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
      },
      toString: function() {
        return this._;
      }
    };

    function constant(x) {
      return function constant() {
        return x;
      };
    }

    function x(p) {
      return p[0];
    }

    function y(p) {
      return p[1];
    }

    var slice = Array.prototype.slice;

    function linkSource(d) {
      return d.source;
    }

    function linkTarget(d) {
      return d.target;
    }

    function link(curve) {
      var source = linkSource,
          target = linkTarget,
          x$1 = x,
          y$1 = y,
          context = null;

      function link() {
        var buffer, argv = slice.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
        if (!context) context = buffer = path();
        curve(context, +x$1.apply(this, (argv[0] = s, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
        if (buffer) return context = null, buffer + "" || null;
      }

      link.source = function(_) {
        return arguments.length ? (source = _, link) : source;
      };

      link.target = function(_) {
        return arguments.length ? (target = _, link) : target;
      };

      link.x = function(_) {
        return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), link) : x$1;
      };

      link.y = function(_) {
        return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), link) : y$1;
      };

      link.context = function(_) {
        return arguments.length ? ((context = _ == null ? null : _), link) : context;
      };

      return link;
    }

    function curveHorizontal(context, x0, y0, x1, y1) {
      context.moveTo(x0, y0);
      context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
    }

    function linkHorizontal() {
      return link(curveHorizontal);
    }

    function horizontalSource(d) {
      return [d.source.x1, d.y0];
    }

    function horizontalTarget(d) {
      return [d.target.x0, d.y1];
    }

    function sankeyLinkHorizontal() {
      return linkHorizontal()
          .source(horizontalSource)
          .target(horizontalTarget);
    }

    const container = document.getElementById('flow-diagram-container');
    const switchButtonContainer = document.getElementById('graph-switch-container');
    const switchButton = document.getElementById('graph-switch');

    function addToTrie(trie, collocation, count, term, maxDepth) {
        let words = collocation.split(' ');
        // Avoid clutter via this one simple trick
        if (words.length > maxDepth) {
            return maxDepth;
        }
        let i = 0;
        if (!trie[0]) {
            trie[0] = {};
            trie[0][term] = { edges: {}, collocations: new Set() };
        }
        for (i = 0; i < words.length; i++) {
            if (words[i] === term) {
                break;
            }
        }
        // TODO: combine these for loops
        // TODO are these counts right, especially for those edges distance 1 from the search term?
        for (let j = i + 1; j < words.length; j++) {
            if (!trie[j - i]) {
                trie[j - i] = {};
            }
            if (!trie[j - i][words[j]]) {
                trie[j - i][words[j]] = { edges: {}, collocations: new Set() };
            }
            trie[j - i][words[j]].collocations.add(collocation);
            if (!trie[j - i - 1][words[j - 1]].edges[words[j]]) {
                trie[j - i - 1][words[j - 1]].edges[words[j]] = 0;
            }
            let currentCount = trie[j - i - 1][words[j - 1]].edges[words[j]];
            trie[j - i - 1][words[j - 1]].edges[words[j]] = Math.max(count, currentCount);//+=count;
            trie[j - i - 1][words[j - 1]].collocations.add(collocation);
        }
        for (let j = i - 1; j >= 0; j--) {
            if (!trie[j - i]) {
                trie[j - i] = {};
            }
            if (!trie[j - i][words[j]]) {
                trie[j - i][words[j]] = { edges: {}, collocations: new Set() };
            }
            trie[j - i][words[j]].collocations.add(collocation);
            if (!trie[j - i][words[j]].edges[words[j + 1]]) {
                trie[j - i][words[j]].edges[words[j + 1]] = 0;
            }
            let currentCount = trie[j - i][words[j]].edges[words[j + 1]] || 0;
            trie[j - i][words[j]].edges[words[j + 1]] = Math.max(count, currentCount);//+=count;
            trie[j - i][words[j]].collocations.add(collocation);
        }
        return -i;
    }

    function getDiagramElements(trie, rootDepth) {
        let elements = { nodes: [], edges: [], labels: {}, collocations: {} };
        let nonRoots = {};
        nonRoots[rootDepth] = new Set();
        for (let level = rootDepth; level in trie; level++) {
            const nodes = trie[level];
            for (const [node, data] of Object.entries(nodes)) {
                if (!(node in window.wordSet)) {
                    continue;
                }
                elements.nodes.push({
                    id: `${node}-${level}`
                });
                elements.labels[`${node}-${level}`] = node;
                elements.collocations[`${node}-${level}`] = data.collocations;
                for (const edge of Object.keys(data.edges)) {
                    if (!(edge in wordSet)) {
                        continue;
                    }
                    if (!nonRoots[level + 1]) {
                        nonRoots[level + 1] = new Set();
                    }
                    nonRoots[level + 1].add(edge);
                    elements.edges.push({
                        //id: `${node}-${level}-${edge}`,
                        source: `${node}-${level}`,
                        target: `${edge}-${parseInt(level) + 1}`,
                        value: data.edges[edge] //TODO switch to iterator on key/value pairs
                    });
                }
            }
        }
        return elements;
    }

    function getDepth(width) {
        // TODO: leaving this here for now. Possibly should be able to be modified via a preference or something.
        // clutter gets bad fast, however.
        return 3;
    }

    function getFontSize(width) {
        if (width >= 600) {
            return 16;
        }
        return 14;
    }

    function getHeight(containerHeight) {
        return Math.min(500, containerHeight - 40);
    }

    function renderUsageDiagram(term, collocations, container) {
        container.innerHTML = '';
        let explanation = document.createElement('p');
        // TODO(refactor): consolidate explanation classes
        explanation.classList.add('flow-explanation');
        container.appendChild(explanation);
        if (!collocations) {
            explanation.innerText = `Sorry, we found no data for ${term}`;
            return;
        }
        explanation.innerText = 'Click any word for examples. ';
        let faqLink = document.createElement('a');
        faqLink.className = 'active-link';
        faqLink.textContent = "Learn more.";
        faqLink.addEventListener('click', function () {
            showFaq(faqTypes.flow);
        });
        explanation.appendChild(faqLink);
        let trie = {};
        let rootDepth = 0;
        // Build what is effectively a level-order trie based on the collocations.
        // Level ordering ensures nodes are not confused in cases where the same word appears at multiple depths.
        for (const [collocation, count] of Object.entries(collocations)) {
            rootDepth = Math.min(rootDepth, addToTrie(trie, collocation, count, term, getDepth(container.offsetWidth)));
        }
        // Once the trie is built, convert that to a set of nodes and edges, and render a sankey diagram.
        let elements = getDiagramElements(trie, rootDepth);
        let chart = SankeyChart({
            nodes: elements.nodes,
            links: elements.edges
        }, {
            nodeGroup: d => d.id.split('-')[0],
            // TODO: not sure this can be done via CSS breakpoints given svg viewport, etc.?
            // should probably also have main be responsible for this instead of reading window directly
            width: Math.min(container.offsetWidth, 1000),
            height: getHeight(container.offsetHeight),
            nodeLabel: d => elements.labels[d.id],
            nodeAlign: 'center',
            linkTitle: d => `${elements.labels[d.source.id]} ${elements.labels[d.target.id]}: ${d.value}`,
            linkClickHandler: (d, i) => {
                getCollocations(elements.labels[i.id]);
                document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [elements.labels[i.id]] } }));
            },
            fontColor: 'currentColor',
            fontSize: getFontSize(container.offsetWidth)
        });
        container.appendChild(chart);
    }
    let activeWord = null;
    let activeCollocations = null;
    let showingFlow = false;

    function toggleShowButton() {
        if (!getActiveGraph().collocationsPath) {
            switchButtonContainer.style.display = 'none';
        } else {
            switchButtonContainer.removeAttribute('style');
        }
    }
    function getCollocations(word) {
        activeWord = word;
        const activeGraph = getActiveGraph();
        fetch(`./${activeGraph.collocationsPath}/${getPartition(word, activeGraph.partitionCount)}.json`)
            .then(response => response.json())
            .then(data => {
                if (word != activeWord) {
                    return;
                }
                activeCollocations = data[word];
                if (showingFlow) {
                    renderUsageDiagram(activeWord, activeCollocations, container);
                }
            });
    }
    function initialize$1() {
        toggleShowButton();
        document.addEventListener('character-set-changed', toggleShowButton);
        // TODO: should we listen to explore-update in addition to (or instead of) graph-update?
        // not thrilled about the separate listeners, but explore only means hanzi clicks get ignored,
        // and graph only means graph clicks get ignored, and both means duplicate concurrent events
        document.addEventListener('graph-update', function (event) {
            getCollocations(event.detail);
        });
        document.addEventListener('graph-interaction', function (event) {
            getCollocations(event.detail);
        });
        container.addEventListener('shown', function () {
            switchButton.innerText = "Show Graph";
            showingFlow = true;
            renderUsageDiagram(activeWord, activeCollocations, container);
        });
        container.addEventListener('hidden', function () {
            showingFlow = false;
            switchButton.innerText = "Show Flow";
        });
        switchButtonContainer.addEventListener('click', function () {
            if (!showingFlow) {
                if (!activeWord) {
                    getCollocations('中文');
                }
                switchDiagramView(diagramKeys.flow);
            } else {
                switchDiagramView(diagramKeys.main);
            }
        });
    }

    //TODO: mostly copy/pasted from observable
    // Copyright 2021 Observable, Inc.
    // Released under the ISC license.
    // https://observablehq.com/@d3/sankey-diagram
    function SankeyChart({
        nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
        links // an iterable of link objects (typically [{source, target}, …])
    }, {
        format: format$1 = ",", // a function or format specifier for values in titles
        align = "justify", // convenience shorthand for nodeAlign
        fontColor = 'black',
        fontSize = 16,
        nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
        nodeGroup, // given d in nodes, returns an (ordinal) value for color
        nodeGroups, // an array of ordinal values representing the node groups
        nodeLabel, // given d in (computed) nodes, text to label the associated rect
        nodeTitle = _ => ``, // given d in (computed) nodes, hover text
        nodeAlign = align, // Sankey node alignment strategy: left, right, justify, center
        nodeWidth = 25, // width of node rects
        nodePadding = 10, // vertical separation between adjacent nodes
        nodeLabelPadding = 2, // horizontal separation between node and label
        nodeStroke = "currentColor", // stroke around node rects
        nodeStrokeWidth, // width of stroke around node rects, in pixels
        nodeStrokeOpacity, // opacity of stroke around node rects
        nodeStrokeLinejoin, // line join for stroke around node rects
        linkSource = ({ source }) => source, // given d in links, returns a node identifier string
        linkTarget = ({ target }) => target, // given d in links, returns a node identifier string
        linkValue = ({ value }) => value, // given d in links, returns the quantitative value
        linkPath = sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
        linkTitle = d => `${d.source.id}  ${d.target.id}: ${d.value}`, // given d in (computed) links
        linkClickHandler = function (d, i) { },
        linkColor = "source-target", // source, target, source-target, or static color
        linkStrokeOpacity = 0.4, // link stroke opacity
        //linkMixBlendMode = "", // link blending mode, which some mobile browsers do not support on <svg>
        colors = schemeTableau10, // array of colors
        width = 640, // outer width, in pixels
        height = 400, // outer height, in pixels
        marginTop = 5, // top margin, in pixels
        marginRight = 1, // right margin, in pixels
        marginBottom = 5, // bottom margin, in pixels
        marginLeft = 1, // left margin, in pixels
    } = {}) {
        // Convert nodeAlign from a name to a function (since d3-sankey is not part of core d3).
        if (typeof nodeAlign !== "function") nodeAlign = {
            left: left,
            right: right,
            center: center
        }[nodeAlign] ?? justify;

        // Compute values.
        const LS = map$1(links, linkSource).map(intern);
        const LT = map$1(links, linkTarget).map(intern);
        const LV = map$1(links, linkValue);
        if (nodes === undefined) nodes = Array.from(union(LS, LT), id => ({ id }));
        const N = map$1(nodes, nodeId).map(intern);
        const G = nodeGroup == null ? null : map$1(nodes, nodeGroup).map(intern);

        // Replace the input nodes and links with mutable objects for the simulation.
        nodes = map$1(nodes, (_, i) => ({ id: N[i] }));
        links = map$1(links, (_, i) => ({ source: LS[i], target: LT[i], value: LV[i] }));

        // Ignore a group-based linkColor option if no groups are specified.
        if (!G && ["source", "target", "source-target"].includes(linkColor)) linkColor = "currentColor";

        // Compute default domains.
        if (G && nodeGroups === undefined) nodeGroups = G;

        // Construct the scales.
        const color = nodeGroup == null ? null : ordinal(nodeGroups, colors);

        // Compute the Sankey layout.
        Sankey()
            .nodeId(({ index: i }) => N[i])
            .nodeAlign(nodeAlign)
            .nodeWidth(nodeWidth)
            .nodePadding(nodePadding)
            .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
            ({ nodes, links });

        // Compute titles and labels using layout nodes, so as to access aggregate values.
        if (typeof format$1 !== "function") format$1 = format(format$1);
        const Tl = nodeLabel === undefined ? N : nodeLabel == null ? null : map$1(nodes, nodeLabel);
        const Tt = nodeTitle == null ? null : map$1(nodes, nodeTitle);
        const Lt = linkTitle == null ? null : map$1(links, linkTitle);

        // A unique identifier for clip paths (to avoid conflicts).
        const uid = `O-${Math.random().toString(16).slice(2)}`;

        const svg = create$1("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const node = svg.append("g")
            .attr("stroke", nodeStroke)
            .attr("stroke-width", nodeStrokeWidth)
            .attr("stroke-opacity", nodeStrokeOpacity)
            .attr("stroke-linejoin", nodeStrokeLinejoin)
            .selectAll("rect")
            .data(nodes)
            .join("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0);

        if (G) node.attr("fill", ({ index: i }) => color(G[i]));
        if (Tt) node.append("title").text(({ index: i }) => Tt[i]);

        const link = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-opacity", linkStrokeOpacity)
            .selectAll("g")
            .data(links)
            .join("g");
        //.style("mix-blend-mode", linkMixBlendMode);

        if (linkColor === "source-target") link.append("linearGradient")
            .attr("id", d => `${uid}-link-${d.index}`)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => d.source.x1)
            .attr("x2", d => d.target.x0)
            .call(gradient => gradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", ({ source: { index: i } }) => color(G[i])))
            .call(gradient => gradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", ({ target: { index: i } }) => color(G[i])));

        link.append("path")
            .attr("d", linkPath)
            .attr("stroke", linkColor === "source-target" ? ({ index: i }) => `url(#${uid}-link-${i})`
                : linkColor === "source" ? ({ source: { index: i } }) => color(G[i])
                    : linkColor === "target" ? ({ target: { index: i } }) => color(G[i])
                        : linkColor)
            .attr("stroke-width", ({ width }) => Math.max(1, width))
            .call(Lt ? path => path.append("title").text(({ index: i }) => Lt[i]) : () => { });

        if (Tl) svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-weight", "bold")
            .attr("fill", fontColor)
            .attr("font-size", fontSize)
            .attr("cursor", "pointer")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => d.x0 < width / 2 ? d.x1 + nodeLabelPadding : d.x0 - nodeLabelPadding)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(({ index: i }) => Tl[i])
            .on('click', linkClickHandler);

        function intern(value) {
            return value !== null && typeof value === "object" ? value.valueOf() : value;
        }

        return Object.assign(svg.node(), { scales: { color } });
    }

    let jiebaCut = null;
    let searchSuggestionsWorker = null;
    const searchSuggestionsContainer = document.getElementById('search-suggestions-container');

    // lol
    function vetCandidate(candidate) {
        if (!(candidate in wordSet)) {
            if (!isNaN(candidate)) {
                // it's not not a number, so ignore it.
                return [{ word: candidate, ignore: true }];
            }
            if (/^[\x00-\xFF]*$/.test(candidate)) {
                // it's ascii, not Chinese, so ignore it
                // TODO: just use ! in_chinese_char_range 
                return [{ word: candidate, ignore: true }];
            }
            // For two character words not in the wordSet, just add individual characters.
            if (candidate.length === 2) {
                if (candidate[0] in wordSet && candidate[1] in wordSet) {
                    return [candidate[0], candidate[1]];
                }
            } else if (candidate.length === 3) {
                let first = candidate[0];
                let last = candidate.substring(1);
                if (first in wordSet && last in wordSet) {
                    return [first, last];
                }
                first = candidate.substring(0, 2);
                last = candidate.substring(2);
                if (first in wordSet && last in wordSet) {
                    return [first, last];
                }
                if (candidate[0] in wordSet && candidate[1] in wordSet && candidate[2] in wordSet) {
                    return [candidate[0], candidate[1], candidate[2]];
                }
            } else if (candidate.length === 4) {
                let first = candidate.substring(0, 2);
                let last = candidate.substring(2);
                if (first in wordSet && last in wordSet) {
                    return [first, last]
                }
                if (candidate[0] in wordSet && candidate[1] in wordSet && candidate[2] in wordSet && candidate[3] in wordSet) {
                    return [candidate[0], candidate[1], candidate[2], candidate[3]];
                }
            }
            // it's not a number, it's not english or something, it's not trivially repaired...ignore
            return [{ word: candidate, ignore: true }];
        }
        return [candidate];
    }

    function segment(text, locale) {
        if (!jiebaCut && (!Intl || !Intl.Segmenter)) {
            return [text];
        }
        text = text.replace(/[？。！，·【】；：、?,'!]/g, '');
        let candidates = [];
        let result = [];
        if (jiebaCut) {
            candidates = jiebaCut(text, true);
        } else {
            const segmenter = new Intl.Segmenter(locale, { granularity: "word" });
            candidates = Array.from(segmenter.segment(text)).map(x => x.segment);
        }
        for (const candidate of candidates) {
            result.push(...(vetCandidate(candidate)));
        }
        return result;
    }
    function suggestSearches() {
        const partialSearch = hanziBox.value;
        if (!partialSearch) {
            clearSuggestions();
        }
        let tokens = segment(partialSearch, getActiveGraph().locale);
        // if it's just a single character, handle it here.
        let hanziCheck = tokens.length > 1 ? tokens[tokens.length - 1] : partialSearch;
        if (hanziCheck in hanzi) {
            const words = [hanziCheck, ...extractWords(hanzi[hanziCheck])];
            renderSearchSuggestions(partialSearch, words, tokens, searchSuggestionsContainer);
            return;
        }
        // otherwise, pass it off to the worker and let it decide.
        searchSuggestionsWorker.postMessage({
            type: 'query',
            payload: { query: partialSearch, tokens: tokens }
        });
    }
    function extractWords(node) {
        if (!node.edges) {
            return [];
        }
        let result = new Set();
        for (const edge of Object.values(node.edges).sort((a, b) => a.level - b.level)) {
            result.add(...edge.words);
        }
        return Array.from(result);
    }
    function handleSuggestions(message) {
        if (!message.data || !message.data.query) {
            return;
        }
        if (message.data.query !== hanziBox.value) {
            return;
        }
        renderSearchSuggestions(message.data.query, message.data.suggestions, message.data.tokens, searchSuggestionsContainer);
    }

    function renderExplanationItem(text, container) {
        let instructionsItem = document.createElement('li');
        instructionsItem.classList.add('suggestions-explanation');
        instructionsItem.innerText = text;
        container.appendChild(instructionsItem);
    }
    function renderSuggestion(priorWordsForDisplay, suggestion, container) {
        let prior = document.createElement('span');
        prior.innerText = priorWordsForDisplay;
        prior.classList.add('search-suggestion-stem');
        let current = document.createElement('span');
        current.innerText = suggestion;
        current.classList.add('search-suggestion-current');
        container.appendChild(prior);
        container.appendChild(current);
    }
    function renderSearchSuggestions(query, suggestions, tokens, container) {
        container.innerHTML = '';
        const isMultiWord = tokens.length > 1;
        if (!suggestions || !suggestions.length) {
            renderExplanationItem(`No suggestions found for ${query}.`, container);
            return;
        }
        let priorWordsForDisplay = '';
        let allButLastToken = [];
        if (isMultiWord) {
            allButLastToken = tokens.slice(0, -1);
            priorWordsForDisplay = allButLastToken.map(x => {
                if (x.ignore) {
                    return x.word;
                }
                return x;
            }).join('');
        }
        for (const suggestion of suggestions) {
            let item = document.createElement('li');
            item.classList.add('search-suggestion');
            renderSuggestion(priorWordsForDisplay, suggestion, item);
            container.appendChild(item);
            item.addEventListener('mousedown', function () {
                if (isMultiWord) {
                    multiWordSearch(priorWordsForDisplay + suggestion, allButLastToken.concat(suggestion));
                } else {
                    notFoundElement.style.display = 'none';
                    document.dispatchEvent(new CustomEvent('graph-update', { detail: suggestion }));
                    document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [suggestion] } }));
                }
                clearSuggestions();
            });
        }
        container.removeAttribute('style');
    }
    function clearSuggestions() {
        searchSuggestionsContainer.style.display = 'none';
    }

    function sendWordSetToWorker() {
        searchSuggestionsWorker.postMessage({
            type: 'wordset',
            payload: window.wordSet
        });
    }
    async function initialize() {
        searchSuggestionsWorker = new Worker('js/modules/search-suggestions-worker.js');
        sendWordSetToWorker();
        document.addEventListener('character-set-changed', sendWordSetToWorker);
        searchSuggestionsWorker.addEventListener('message', handleSuggestions);
        hanziBox.addEventListener('input', suggestSearches);
        hanziBox.addEventListener('blur', clearSuggestions);
        const { default: init,
            cut,
        } = await import('../../../../../../js/external/jieba_rs_wasm.js');
        await init();
        jiebaCut = cut;
    }

    function multiWordSearch(query, segments) {
        let found = false;
        let wordForGraph = '';
        for (const segment of segments) {
            if (!segment.ignore && segment in wordSet) {
                wordForGraph = segment;
                found = true;
                break;
            }
        }
        if (!found) {
            notFoundElement.removeAttribute('style');
        } else {
            notFoundElement.style.display = 'none';
            document.dispatchEvent(new CustomEvent('graph-update', { detail: wordForGraph }));
            document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: segments, display: query } }));
        }
    }

    function search(value, locale) {
        clearSuggestions();
        if (value && (definitions[value] || (value in wordSet))) {
            notFoundElement.style.display = 'none';
            document.dispatchEvent(new CustomEvent('graph-update', { detail: value }));
            document.dispatchEvent(new CustomEvent('explore-update', { detail: { words: [value] } }));
            return;
        }
        multiWordSearch(value, segment(value, locale));
    }

    const hanziSearchForm = document.getElementById('hanzi-choose');

    let dataLoads;
    if (window.graphFetch) {
        dataLoads = [
            window.graphFetch
                .then(response => response.json())
                .then(data => {
                    window.hanzi = data;
                }),
            window.sentencesFetch
                .then(response => response.json())
                .then(data => window.sentences = data),
            window.definitionsFetch
                .then(response => response.json())
                .then(data => window.definitions = data)
        ];
    } else {
        // assume freqs are used instead, and the graph is derived from that
        dataLoads = [
            window.freqsFetch
                .then(response => response.json())
                .then(data => {
                    window.freqs = data;
                }),
            window.sentencesFetch
                .then(response => response.json())
                .then(data => window.sentences = data),
            window.definitionsFetch
                .then(response => response.json())
                .then(data => window.definitions = data)
        ];
    }

    Promise.all(dataLoads).then(_ => {
        initialize$9();
        initialize$5();
        initialize$7();
        initialize$3();
        initialize$4();
        initialize$1();
        hanziSearchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            search(hanziBox.value, getActiveGraph().locale);
            switchToState(stateKeys.main);
        });
        // TODO(refactor): this belongs in explore rather than main
        let oldState = readExploreState();
        if (oldState && oldState.words) {
            document.dispatchEvent(new CustomEvent('graph-update',
                { detail: oldState.words[0] }));
            document.dispatchEvent(new CustomEvent('explore-update',
                { detail: { words: oldState.words, display: oldState.words.join('') } }));
        } else {
            //add a default graph on page load to illustrate the concept
            walkThrough.removeAttribute('style');
            const defaultHanzi = getActiveGraph().defaultHanzi;
            document.dispatchEvent(new CustomEvent('graph-update',
                { detail: defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)] }));
        }
        // These happen last due to being secondary functionality
        initialize$2();
        initialize$8();
        initialize$6();
        initialize();
    });

})();
