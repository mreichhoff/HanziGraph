(function () {
    'use strict';

    //TODO may want to stop this and just have it stay shown, with faq over top via absolute position/z-index
    const mainContainer$2 = document.getElementById('container');
    //faq items
    const faqContainer = document.getElementById('faq-container');
    const faqSingleCharWarning = document.getElementById('faq-single-char-warning');
    const faqStudyMode = document.getElementById('faq-study-mode');
    const faqRecommendations = document.getElementById('faq-recommendations');
    const faqContext = document.getElementById('faq-context');
    const faqGeneral = document.getElementById('faq-general');
    const faqExitButton = document.getElementById('faq-exit-button');
    const showStudyFaq = document.getElementById('show-study-faq');
    const showGeneralFaq = document.getElementById('show-general-faq');

    //TODO should combine with faqTypes
    const faqTypesToElement = {
        singleCharWarning: faqSingleCharWarning,
        studyMode: faqStudyMode,
        context: faqContext,
        general: faqGeneral,
        recommendations: faqRecommendations
    };
    const faqTypes$1 = {
        singleCharWarning: 'singleCharWarning',
        studyMode: 'studyMode',
        context: 'context',
        general: 'general',
        recommendations: 'recommendations'
    };

    let showFaq$1 = function (faqType) {
        mainContainer$2.style.display = 'none';
        faqContainer.removeAttribute('style');
        faqTypesToElement[faqType].removeAttribute('style');
    };

    let initialize$4 = function () {
        faqExitButton.addEventListener('click', function () {
            faqContainer.style.display = 'none';
            mainContainer$2.removeAttribute('style');
            Object.values(faqTypesToElement).forEach(x => {
                x.style.display = 'none';
            });
        });
        showStudyFaq.addEventListener('click', function () {
            showFaq$1(faqTypes$1.studyMode);
        });
        showGeneralFaq.addEventListener('click', function () {
            showFaq$1(faqTypes$1.general);
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
            if (!visited[nodes[i]]) {
                visited[nodes[i]] = 0;
            }
            visited[nodes[i]]++;
        }
        localStorage.setItem('visited', JSON.stringify(visited));
        callbacks[dataTypes.visited].forEach(x => x(visited));
    };

    let registerCallback = function (dataType, callback) {
        callbacks[dataType].push(callback);
    };

    //keeping keys/localStudyList for parity with current hacked together firebase version
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
    let addCards = function (currentExamples, text) {
        let newCards = currentExamples[text].map((x, i) => ({ ...x, due: Date.now() + i }));
        let newKeys = [];
        for (let i = 0; i < newCards.length; i++) {
            let zhJoined = newCards[i].zh.join('');
            newKeys.push(zhJoined);
            if (!studyList[zhJoined] && newCards[i].en) {
                studyList[zhJoined] = {
                    en: newCards[i].en,
                    due: newCards[i].due,
                    zh: newCards[i].zh,
                    wrongCount: 0,
                    rightCount: 0,
                    added: Date.now()
                };
            }
        }
        //TODO: remove these keys from /deleted/ to allow re-add
        //update it whenever it changes
        saveStudyList();
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
    };

    let inStudyList = function (text) {
        return studyList[text];
    };

    let getCardCount = function (character) {
        let count = 0;
        //TODO: if performance becomes an issue, we can pre-compute this
        //as-is, it performs fine even with larger flashcard decks
        Object.keys(studyList || {}).forEach(x => {
            if (x.indexOf(character) >= 0) {
                count++;
            }
        });
        return count;
    };

    let getStudyList = function () {
        return studyList;
    };
    let findOtherCards = function (seeking, currentKey) {
        let cards = Object.keys(studyList);
        let candidates = cards.filter(x => x !== currentKey && x.includes(seeking)).sort((a, b) => studyList[b].rightCount - studyList[a].rightCount);
        return candidates;
    };

    let removeFromStudyList = function (key) {
        delete studyList[key];
        callbacks[dataTypes.studyList].forEach(x => x(studyList));
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
        //fix up potential response from backend that doesn't include one of correct or incorrect
        //i.e., check above sets it, then we get a response when reading from backend that has the given hour but
        //no correct or incorrect property, which can happen if you get X wrong/right in a row to start an hour
        //we can be confident we'll still have hourly and daily as those are written in the same operation
        //TODO check firebase docs
        if (!studyResults.hourly[hour][result]) {
            studyResults.hourly[hour][result] = 0;
        }
        studyResults.hourly[hour][result]++;
        if (!studyResults.daily[day]) {
            studyResults.daily[day] = {};
            studyResults.daily[day][studyResult.CORRECT] = 0;
            studyResults.daily[day][studyResult.INCORRECT] = 0;
        }
        //fix up potential response from backend that doesn't include one of correct or incorrect
        //i.e., check above sets it, then we get a response when reading from backend that has the given day but
        //no correct or incorrect property, which can happen if you get X wrong/right in a row to start a day
        if (!studyResults.daily[day][result]) {
            studyResults.daily[day][result] = 0;
        }
        studyResults.daily[day][result]++;
        localStorage.setItem('studyResults', JSON.stringify(studyResults));
    };

    let cy = null;

    let dfs = function (start, elements, maxDepth, visited, maxLevel) {
        if (maxDepth < 0) {
            return;
        }
        let curr = hanzi[start];
        //todo does javascript have a set?
        visited[start] = true;
        for (const [key, value] of Object.entries(curr.edges)) {
            //don't add outgoing edges when we won't process the next layer
            if (maxDepth > 0 && value.level <= maxLevel) {
                if (!visited[key]) {
                    elements.edges.push({ data: { id: Array.from(start + key).sort().toString(), source: start, target: key, level: value.level, words: value.words } });
                }
            }
        }
        elements.nodes.push({ data: { id: start, level: curr.node.level } });
        for (const [key, value] of Object.entries(curr.edges)) {
            if (!visited[key] && value.level <= maxLevel) {
                dfs(key, elements, maxDepth - 1, visited, maxLevel);
            }
        }
    };
    //this file meant to hold all cytoscape-related code
    let levelColor = function (element) {
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
    };

    let layout = function (root, numNodes) {
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
    };
    let setupCytoscape = function (root, elements, graphContainer, nodeEventHandler, edgeEventHandler) {
        //TODO make this injectable
        let prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
        cy = cytoscape({
            container: graphContainer,
            elements: elements,
            layout: layout(root, elements.nodes.length),
            style: [
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
                        'label': 'data(words)',
                        'color': (_ => prefersLight ? 'black' : '#eee'),
                        'font-size': '10px',
                        'text-background-color': (_ => prefersLight ? '#f9f9f9' : '#121212'),
                        'text-background-opacity': '1',
                        'text-background-shape': 'round-rectangle',
                        'text-events': 'yes'
                    }
                }
            ],
            maxZoom: 10,
            minZoom: 0.5
        });
        cy.on('tap', 'node', nodeEventHandler);
        cy.on('tap', 'edge', edgeEventHandler);
    };
    let initializeGraph = function (value, maxLevel, containerElement, nodeEventHandler, edgeEventHandler) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(value, result, maxDepth, {}, maxLevel);
        setupCytoscape(value, result, containerElement, nodeEventHandler, edgeEventHandler);
    };
    let addToGraph = function (character, maxLevel) {
        let result = { 'nodes': [], 'edges': [] };
        let maxDepth = 1;
        dfs(character, result, maxDepth, {}, maxLevel);
        let preNodeCount = cy.nodes().length;
        let preEdgeCount = cy.edges().length;
        cy.add(result);
        if (cy.nodes().length !== preNodeCount || cy.edges().length !== preEdgeCount) {
            //if we've actually added to the graph, re-render it; else just let it be
            cy.layout(layout(character, cy.nodes().length)).run();
        }
    };
    let isInGraph = function (node) {
        return cy && cy.getElementById(node).length;
    };

    const recommendationsContainer = document.getElementById('recommendations-container');
    let recommendationsWorker = null;

    let initialize$3 = function () {
        recommendationsWorker = new Worker('js/modules/recommendations-worker.js');
        recommendationsWorker.postMessage({
            type: 'graph',
            payload: window.hanzi
        });
        recommendationsWorker.postMessage({
            type: 'visited',
            payload: getVisited()
        });
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
                            recommendationsContainer.style.display = 'none';
                        }
                    });
                    recommendationsContainer.appendChild(curr);
                    usedRecommendation = true;
                }
                let recommendationsFaqLink = document.createElement('a');
                recommendationsFaqLink.className = 'faq-link';
                recommendationsFaqLink.innerText = "Why?";
                recommendationsFaqLink.addEventListener('click', function () {
                    showFaq(faqTypes.recommendations);
                });
                if (usedRecommendation) {
                    recommendationsContainer.appendChild(recommendationsFaqLink);
                }
            } else {
                recommendationsContainer.style.display = 'none';
            }
        };
    };
    let graphChanged = function () {
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
        recommendationsWorker.postMessage({
            type: 'levelPreferences',
            payload: {
                minLevel: minLevel,
                maxLevel: maxLevel
            }
        });
    };

    //TODO break this down further
    //refactor badly needed...hacks on top of hacks at this point
    let maxExamples = 5;
    let currentExamples = {};
    let currentHanzi = null;
    let currentWord = null;
    let undoChain = [];
    let tabs = {
        explore: 'explore',
        study: 'study'
    };
    let activeTab = tabs.explore;

    let hskLegend = ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'];
    let freqLegend = ['Top500', 'Top1k', 'Top2k', 'Top4k', 'Top7k', 'Top10k'];
    let legendElements = document.querySelectorAll('div.circle');
    let graphOptions = {
        newHsk: {
            display: 'New HSK', prefix: 'new-hsk-', legend: hskLegend
        },
        oldHsk: {
            display: 'Old HSK', prefix: '', legend: hskLegend
        },
        top10k: {
            display: 'Top 10k words', prefix: 'top-10k-', legend: freqLegend
        }
    };
    let activeGraph = graphOptions.oldHsk;
    let getActiveGraph = function () {
        return activeGraph;
    };

    //top-level section container
    const mainContainer$1 = document.getElementById('container');

    const exploreTab = document.getElementById('show-explore');
    const studyTab$1 = document.getElementById('show-study');

    const mainHeader = document.getElementById('main-header');

    //study items...these may not belong in this file
    const studyContainer = document.getElementById('study-container');

    //explore tab items
    const examplesList = document.getElementById('examples');
    const exampleContainer = document.getElementById('example-container');
    //explore tab navigation controls
    const hanziBox$1 = document.getElementById('hanzi-box');
    const hanziSearchForm = document.getElementById('hanzi-choose');
    const previousHanziButton = document.getElementById('previousHanziButton');
    //recommendations
    const recommendationsDifficultySelector = document.getElementById('recommendations-difficulty');

    //menu items
    const graphSelector = document.getElementById('graph-selector');
    const levelSelector = document.getElementById('level-selector');
    const menuButton = document.getElementById('menu-button');
    const menuContainer = document.getElementById('menu-container');
    const menuExitButton = document.getElementById('menu-exit-button');
    const showPinyinCheckbox = document.getElementById('show-pinyin');
    const togglePinyinLabel = document.getElementById('toggle-pinyin-label');

    let getZhTts = function () {
        //use the first-encountered zh-CN voice for now
        return speechSynthesis.getVoices().find(voice => voice.lang === "zh-CN");
    };
    let zhTts = getZhTts();
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    speechSynthesis.onvoiceschanged = function () {
        if (!zhTts) {
            zhTts = getZhTts();
        }
    };

    let runTextToSpeech = function (text, anchors) {
        zhTts = zhTts || getZhTts();
        //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
        if (zhTts) {
            let utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "zh-CN";
            utterance.voice = zhTts;
            utterance.addEventListener('boundary', function (event) {
                if (event.charIndex == null || event.charLength == null) {
                    return false;
                }
                anchors.forEach((character, index) => {
                    if (index >= event.charIndex && index < (event.charIndex + (event.charLength || 1))) {
                        character.style.fontWeight = 'bold';
                    } else {
                        character.style.fontWeight = 'normal';
                    }
                });
            });
            utterance.addEventListener('end', function () {
                anchors.forEach(character => {
                    character.style.fontWeight = 'normal';
                });
            });
            speechSynthesis.speak(utterance);
        }
    };

    let addTextToSpeech = function (holder, text, aList) {
        let textToSpeechButton = document.createElement('span');
        textToSpeechButton.className = 'text-button listen';
        textToSpeechButton.textContent = 'Listen';
        textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text, aList), false);
        holder.appendChild(textToSpeechButton);
    };
    let addSaveToListButton = function (holder, text) {
        let buttonTexts = ['In your study list!', 'Add to study list'];
        let saveToListButton = document.createElement('span');
        saveToListButton.className = 'text-button';
        saveToListButton.textContent = inStudyList(text) ? buttonTexts[0] : buttonTexts[1];
        saveToListButton.addEventListener('click', function () {
            addCards(currentExamples, text);
            saveToListButton.textContent = buttonTexts[0];
        });
        holder.appendChild(saveToListButton);
    };

    let persistState = function () {
        let localUndoChain = undoChain.length > 5 ? undoChain.slice(0, 5) : undoChain;
        localStorage.setItem('state', JSON.stringify({
            hanzi: currentHanzi,
            word: currentWord,
            level: levelSelector.value,
            undoChain: localUndoChain,
            activeTab: activeTab,
            currentGraph: activeGraph.display,
            graphPrefix: activeGraph.prefix
        }));
    };
    let setupDefinitions = function (definitionList, definitionHolder) {
        for (let i = 0; i < definitionList.length; i++) {
            let definitionItem = document.createElement('li');
            let definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
            definitionItem.textContent = definitionContent;
            definitionHolder.appendChild(definitionItem);
        }
    };
    let findExamples = function (word) {
        let examples = [];
        //used for e.g., missing translation
        let lessDesirableExamples = [];
        //TODO consider indexing up front
        //can also reuse inner loop...consider inverting
        for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].zh.includes(word)) {
                if (sentences[i].en && sentences[i].pinyin) {
                    examples.push(sentences[i]);
                    if (examples.length === maxExamples) {
                        break;
                    }
                } else if (lessDesirableExamples.length < maxExamples) {
                    lessDesirableExamples.push(sentences[i]);
                }
            }
        }
        if (examples.length < maxExamples && lessDesirableExamples.length > 0) {
            examples.splice(examples.length, 0, ...lessDesirableExamples.slice(0, (maxExamples - examples.length)));
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
            let zhHolder = document.createElement('p');
            let exampleText = examples[i].zh.join('');
            let aList = makeSentenceNavigable(exampleText, zhHolder, true);
            zhHolder.className = 'zh-example example-line';
            addTextToSpeech(zhHolder, exampleText, aList);
            exampleHolder.appendChild(zhHolder);
            if (examples[i].pinyin) {
                let pinyinHolder = document.createElement('p');
                pinyinHolder.textContent = examples[i].pinyin;
                pinyinHolder.className = 'pinyin-example example-line';
                exampleHolder.appendChild(pinyinHolder);
            }
            let enHolder = document.createElement('p');
            enHolder.textContent = examples[i].en;
            enHolder.className = 'example-line';
            exampleHolder.appendChild(enHolder);
            exampleList.appendChild(exampleHolder);
        }
    };
    let setupExamples = function (words) {
        currentExamples = {};
        //TODO this mixes markup modification and example finding
        //refactor needed
        while (examplesList.firstChild) {
            examplesList.firstChild.remove();
        }
        for (let i = 0; i < words.length; i++) {
            let examples = findExamples(words[i]);
            currentExamples[words[i]] = [];

            let item = document.createElement('li');
            let wordHolder = document.createElement('h2');
            wordHolder.textContent = words[i];
            addTextToSpeech(wordHolder, words[i], []);
            addSaveToListButton(wordHolder, words[i]);
            item.appendChild(wordHolder);

            let definitionHolder = document.createElement('ul');
            definitionHolder.className = 'definition';
            let definitionList = definitions[words[i]] || [];
            setupDefinitions(definitionList, definitionHolder);
            item.appendChild(definitionHolder);

            let contextHolder = document.createElement('p');
            //TODO not so thrilled with 'context' as the name here
            contextHolder.className = 'context';
            contextHolder.innerText += "Previously: ";
            [...words[i]].forEach(x => {
                contextHolder.innerText += `${x} seen ${getVisited()[x] || 0} times; in ${getCardCount(x)} flash cards. `;
            });
            let contextFaqLink = document.createElement('a');
            contextFaqLink.className = 'faq-link';
            contextFaqLink.textContent = "Learn more.";
            contextFaqLink.addEventListener('click', function () {
                showFaq$1(faqTypes$1.context);
            });
            contextHolder.appendChild(contextFaqLink);
            item.appendChild(contextHolder);

            //TODO: definition list doesn't have the same interface (missing zh field)
            currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
            //setup current examples for potential future export
            currentExamples[words[i]].push(...examples);

            if (words[i].length === 1 && !singleCharacterWords.has(words[i])) {
                let exampleWarning = document.createElement('p');
                exampleWarning.className = 'example-warning';
                //I know I shouldn't do this, but I'll refactor any day now
                exampleWarning.textContent = `This character does not appear alone in the ${activeGraph.display}. It appears only as part of other words. Examples seen by clicking the connecting lines may be of higher quality. `;
                let warningFaqLink = document.createElement('a');
                warningFaqLink.textContent = "Learn more.";
                warningFaqLink.className = 'faq-link';
                warningFaqLink.addEventListener('click', function () {
                    showFaq$1(faqTypes$1.singleCharWarning);
                });
                exampleWarning.appendChild(warningFaqLink);
                item.appendChild(exampleWarning);
            }
            let exampleList = document.createElement('ul');
            item.appendChild(exampleList);
            setupExampleElements(examples, exampleList);

            examplesList.append(item);
        }
        currentWord = words;
    };
    let updateUndoChain = function () {
        //push clones onto the stack
        undoChain.push({ hanzi: [...currentHanzi], word: (currentWord ? [...currentWord] : currentWord) });
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

    let nodeTapHandler = function (evt) {
        let id = evt.target.id();
        let maxLevel = levelSelector.value;
        updateUndoChain();
        //not needed if currentHanzi contains id, which would mean the nodes have already been added
        //includes O(N) but currentHanzi almost always < 10 elements
        if (currentHanzi && !currentHanzi.includes(id)) {
            addToExistingGraph(id, maxLevel);
        }
        setupExamples([id]);
        persistState();
        exploreTab.click();
        mainHeader.scrollIntoView();
        updateVisited([id]);
    };
    let edgeTapHandler = function (evt) {
        let words = evt.target.data('words');
        updateUndoChain();
        setupExamples(words);
        persistState();
        //TODO toggle functions
        exploreTab.click();
        mainHeader.scrollIntoView();
        updateVisited([evt.target.source().id(), evt.target.target().id()]);
    };
    let addToExistingGraph = function (character, maxLevel) {
        addToGraph(character, maxLevel);
        //currentHanzi must be set up before this call
        currentHanzi.push(character);
    };
    let updateGraph = function (value, maxLevel) {
        document.getElementById('graph').remove();
        let nextGraph = document.createElement("div");
        nextGraph.id = 'graph';
        //TODO: makes assumption about markup order
        mainContainer$1.append(nextGraph);

        if (value && hanzi[value]) {
            initializeGraph(value, maxLevel, nextGraph, nodeTapHandler, edgeTapHandler);
            currentHanzi = [value];
            persistState();
        }
    };

    let initialize$2 = function () {
        let oldState = JSON.parse(localStorage.getItem('state'));
        if (!oldState) {
            //graph chosen is default, no need to modify legend or dropdown
            //add a default graph on page load to illustrate the concept
            let defaultHanzi = ["围", "须", "按", "冲", "店", "课", "右", "怕", "舞", "跳"];
            updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], levelSelector.value);
        } else {
            if (state.currentGraph) {
                let activeGraphKey = Object.keys(graphOptions).find(x => graphOptions[x].display === state.currentGraph);
                activeGraph = graphOptions[activeGraphKey];
                legendElements.forEach((x, index) => {
                    x.innerText = activeGraph.legend[index];
                });
                graphSelector.value = state.currentGraph;
            }
            levelSelector.value = oldState.level;
            //oldState.hanzi should always have length >= 1
            updateGraph(oldState.hanzi[0], oldState.level);
            for (let i = 1; i < oldState.hanzi.length; i++) {
                addToExistingGraph(oldState.hanzi[i], oldState.level);
            }
            if (oldState.word) {
                setupExamples(oldState.word);
            }
            undoChain = oldState.undoChain;
            if (oldState.activeTab === tabs.study) {
                //reallllllly need a toggle method
                //this does set up the current card, etc.
                studyTab$1.click();
            }
            persistState();
        }
    };

    let makeSentenceNavigable = function (text, container, noExampleChange) {
        let sentenceContainer = document.createElement('span');
        sentenceContainer.className = "sentence-container";

        let anchorList = [];
        for (let i = 0; i < text.length; i++) {
            (function (character) {
                let a = document.createElement('a');
                a.textContent = character;
                a.addEventListener('click', function () {
                    if (hanzi[character]) {
                        let updated = false;
                        if (currentHanzi && !currentHanzi.includes(character)) {
                            updateUndoChain();
                            updated = true;
                            updateGraph(character, levelSelector.value);
                        }
                        //enable seamless switching, but don't update if we're already showing examples for character
                        if (!noExampleChange && (!currentWord || (currentWord.length !== 1 || currentWord[0] !== character))) {
                            if (!updated) {
                                updateUndoChain();
                            }
                            setupExamples([character]);
                        }
                        persistState();
                    }
                });
                anchorList.push(a);
                sentenceContainer.appendChild(a);
            }(text[i]));
        }
        container.appendChild(sentenceContainer);
        return anchorList;
    };

    hanziSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        let value = hanziBox$1.value;
        let maxLevel = levelSelector.value;
        if (value && hanzi[value]) {
            updateUndoChain();
            updateGraph(value, maxLevel);
            setupExamples([value]);
            persistState();
            updateVisited([value]);
        }
    });

    levelSelector.addEventListener('change', function () {
        //TODO hide edges in existing graph rather than rebuilding
        //TODO refresh after level change can be weird
        updateGraph(currentHanzi[currentHanzi.length - 1], levelSelector.value);
    });

    previousHanziButton.addEventListener('click', function () {
        if (!undoChain.length) {
            return;
        }
        let next = undoChain.pop();
        let maxLevel = levelSelector.value;
        updateGraph(next.hanzi[0], maxLevel);
        for (let i = 1; i < next.hanzi.length; i++) {
            addToExistingGraph(next.hanzi[i], maxLevel);
        }
        if (next.word) {
            setupExamples(next.word);
        }
        persistState();
    });
    showPinyinCheckbox.addEventListener('change', function () {
        let toggleLabel = togglePinyinLabel;
        if (showPinyinCheckbox.checked) {
            toggleLabel.innerText = 'Turn off pinyin in examples';
        } else {
            toggleLabel.innerText = 'Turn on pinyin in examples';
        }
    });
    exploreTab.addEventListener('click', function () {
        exampleContainer.removeAttribute('style');
        studyContainer.style.display = 'none';
        //TODO could likely do all of this with CSS
        exploreTab.classList.add('active');
        studyTab$1.classList.remove('active');
        activeTab = tabs.explore;
        persistState();
    });

    studyTab$1.addEventListener('click', function () {
        exampleContainer.style.display = 'none';
        studyContainer.removeAttribute('style');
        studyTab$1.classList.add('active');
        exploreTab.classList.remove('active');
        activeTab = tabs.study;
        persistState();
    });

    recommendationsDifficultySelector.addEventListener('change', function () {
        let val = recommendationsDifficultySelector.value;
        preferencesChanged(val);
    });

    menuButton.addEventListener('click', function () {
        mainContainer$1.style.display = 'none';
        menuContainer.removeAttribute('style');
    });
    menuExitButton.addEventListener('click', function () {
        menuContainer.style.display = 'none';
        mainContainer$1.removeAttribute('style');
    });

    let switchGraph = function () {
        let value = graphSelector.value;
        if (value !== activeGraph.display) {
            let key = Object.keys(graphOptions).find(x => graphOptions[x].display === value);
            activeGraph = graphOptions[key];
            let prefix = activeGraph.prefix;
            //fetch regardless...allow service worker and/or browser cache to optimize
            fetch(`./data/${prefix}graph.json`)
                .then(response => response.json())
                .then(function (data) {
                    window.hanzi = data;
                    graphChanged();
                    legendElements.forEach((x, index) => {
                        x.innerText = activeGraph.legend[index];
                    });
                });
            fetch(`./data/${prefix}sentences.json`)
                .then(response => response.json())
                .then(function (data) {
                    window.sentences = data;
                });
            fetch(`./data/${prefix}single-char-words.json`)
                .then(response => response.json())
                .then(function (data) {
                    singleCharacterWords = new Set(data);
                });
            persistState();
        }
    };

    graphSelector.addEventListener('change', switchGraph);

    //TODO probably doesn't belong here and should instead be indirected (could also just export from base)
    const studyTab = document.getElementById('show-study');

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

    let currentKey = null;

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
            relatedPerf.innerText = `(right ${studyList[related[i]].rightCount}, wrong ${studyList[related[i]].wrongCount})`;
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
            taskCompleteElement.style.display = 'inline';
            taskDescriptionElement.style.display = 'none';
            showAnswerButton.style.display = 'none';
            return;
        } else {
            taskCompleteElement.style.display = 'none';
            taskDescriptionElement.style.display = 'inline';
            showAnswerButton.style.display = 'block';
        }
        let question = currentCard.zh.join('');
        let aList = makeSentenceNavigable(question, cardQuestionContainer);
        for (let i = 0; i < aList.length; i++) {
            aList[i].addEventListener('click', displayRelatedCards.bind(this, aList[i]));
        }
        addTextToSpeech(cardQuestionContainer, question, aList);
        cardAnswerElement.textContent = currentCard.en;
        if (currentCard.wrongCount + currentCard.rightCount != 0) {
            cardOldMessageElement.removeAttribute('style');
            cardNewMessageElement.style.display = 'none';
            cardPercentageElement.textContent = Math.round(100 * currentCard.rightCount / (currentCard.rightCount + currentCard.wrongCount));
            cardRightCountElement.textContent = `${currentCard.rightCount} time${currentCard.rightCount != 1 ? 's' : ''}`;
            cardWrongCountElement.textContent = `${currentCard.wrongCount} time${currentCard.wrongCount != 1 ? 's' : ''}`;
        } else {
            cardNewMessageElement.removeAttribute('style');
            cardOldMessageElement.style.display = 'none';
        }
        relatedCardsContainer.style.display = 'none';
    };

    let initialize$1 = function () {
        showAnswerButton.addEventListener('click', function () {
            showAnswerButton.innerText = "Answer:";
            cardAnswerContainer.style.display = 'block';
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
                //replace is a hack for flashcard field separator...TODO could escape
                content += [key.replace(';', ''), value.en.replace(';', '')].join(';');
                content += '\n';
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
        });
        studyTab.addEventListener('click', function () {
            setupStudyMode();
        });
    };

    //TODO move these to a central spot
    const mainContainer = document.getElementById('container');
    const statsContainer = document.getElementById('stats-container');

    const statsShow = document.getElementById('stats-show');
    const statsExitButton = document.getElementById('exit-button');

    const hourlyGraphDetail = document.getElementById('hourly-graph-detail');
    const addedCalendarDetail = document.getElementById('added-calendar-detail');
    const studyCalendarDetail = document.getElementById('study-calendar-detail');
    const studyGraphDetail = document.getElementById('studied-graph-detail');
    const visitedGraphDetail = document.getElementById('visited-graph-detail');

    let lastLevelUpdatePrefix = '';

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

    let initialize = function () {
        lastLevelUpdatePrefix = getActiveGraph().prefix;
        updateTotalsByLevel();
        statsShow.addEventListener('click', function () {
            let activeGraph = getActiveGraph();
            if (activeGraph.prefix !== lastLevelUpdatePrefix) {
                lastLevelUpdatePrefix = activeGraph.prefix;
                updateTotalsByLevel();
            }
            mainContainer.style.display = 'none';
            statsContainer.removeAttribute('style');
            createVisitedGraphs(getVisited(), activeGraph.legend);
            createCardGraphs(getStudyList(), activeGraph.legend);
            createStudyResultGraphs(getStudyResults(), activeGraph.legend);
        });

        statsExitButton.addEventListener('click', function () {
            statsContainer.style.display = 'none';
            mainContainer.removeAttribute('style');
            //TODO this is silly
            studyGraphDetail.innerText = '';
            addedCalendarDetail.innerText = '';
            visitedGraphDetail.innerText = '';
            studyCalendarDetail.innerText = '';
            hourlyGraphDetail.innerText = '';
        });
    };

    Promise.all(
        [
            window.graphFetch
                .then(response => response.json())
                .then(data => window.hanzi = data),
            window.sentencesFetch
                .then(response => response.json())
                .then(data => window.sentences = data),
            window.singleCharacterWordsFetch
                .then(response => response.json())
                .then(data => window.singleCharacterWords = new Set(data))
        ]
    ).then(_ => {
        initialize$1();
        initialize$2();
        initialize();
        initialize$4();
        initialize$3();
    });
    //ideally we'll continue adding to this

})();
