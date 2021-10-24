(function () {
    //refactor badly needed...hacks on top of hacks at this point
    window.studyList = window.studyList || JSON.parse(localStorage.getItem('studyList') || '{}');
    var undoChain = [];
    var currentHanzi = null;
    var currentWord = null;
    var cy = null;
    var tabs = {
        explore: 'explore',
        study: 'study'
    };
    var activeTab = tabs.explore;
    var maxExamples = 5;
    var currentExamples = {};
    var getZhTts = function () {
        //use the first-encountered zh-CN voice for now
        return speechSynthesis.getVoices().find(voice => voice.lang === "zh-CN");
    };
    var zhTts = getZhTts();
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    speechSynthesis.onvoiceschanged = function () {
        if (!zhTts) {
            zhTts = getZhTts();
        }
    };
    var levelColor = function (element) {
        let level = element.data('level');
        switch (level) {
            case 6:
                return 'blue';
            case 5:
                return 'purple';
            case 4:
                return 'green';
            case 3:
                return 'yellow';
            case 2:
                return 'orange';
            case 1:
                return 'red';
        }
    };

    var layout = function (root) {
        return {
            name: 'breadthfirst',
            roots: [root],
            padding: 6,
            spacingFactor: 0.85
        };
    };

    var runTextToSpeech = function (text) {
        zhTts = zhTts || getZhTts();
        //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
        if (zhTts) {
            var utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = "zh-CN";
            utterance.voice = zhTts;
            speechSynthesis.speak(utterance);
        }
    };

    var addTextToSpeech = function (holder, text) {
        var textToSpeechButton = document.createElement('span');
        textToSpeechButton.className = 'text-button listen';
        textToSpeechButton.textContent = 'Listen';
        textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text), false);
        holder.appendChild(textToSpeechButton);
    };
    var addSaveToListButton = function (holder, text) {
        var buttonTexts = ['In your study list!', 'Add this to my study list!'];
        var saveToListButton = document.createElement('span');
        saveToListButton.className = 'text-button';
        saveToListButton.textContent = studyList[text] ? buttonTexts[0] : buttonTexts[1];
        saveToListButton.addEventListener('click', function () {
            var newCards = currentExamples[text].map(x => ({ ...x, due: Date.now() }));
            var newKeys = [];
            for (var i = 0; i < newCards.length; i++) {
                var zhJoined = newCards[i].zh.join('');
                newKeys.push(zhJoined);
                if (!studyList[zhJoined] && newCards[i].en) {
                    studyList[zhJoined] = {
                        en: newCards[i].en,
                        due: newCards[i].due,
                        zh: newCards[i].zh,
                        wrongCount: 0,
                        rightCount: 0
                    };
                }
            }
            //update it whenever it changes
            saveStudyList(newKeys);
            document.getElementById('exportStudyListButton').style.display = 'inline';
            saveToListButton.textContent = buttonTexts[0];
        });
        holder.appendChild(saveToListButton);
    };

    var persistState = function () {
        var localUndoChain = undoChain.length > 5 ? undoChain.slice(0, 5) : undoChain;
        sessionStorage.setItem('state', JSON.stringify({
            hanzi: currentHanzi,
            word: currentWord,
            level: document.getElementById('level-selector').value,
            undoChain: localUndoChain,
            activeTab: activeTab
        }));
    };
    var setupDefinitions = function (definitionList, definitionHolder) {
        for (var i = 0; i < definitionList.length; i++) {
            var definitionItem = document.createElement('li');
            var definitionContent = definitionList[i].pinyin + ': ' + definitionList[i].en;
            definitionItem.textContent = definitionContent;
            definitionHolder.appendChild(definitionItem);
        }
    };
    var findExamples = function (word) {
        var examples = [];
        //used for e.g., missing translation
        var lessDesirableExamples = [];
        //TODO consider indexing up front
        //can also reuse inner loop...consider inverting
        for (var i = 0; i < sentences.length; i++) {
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
    var setupExampleElements = function (examples, exampleList) {
        for (var i = 0; i < examples.length; i++) {
            var exampleHolder = document.createElement('li');
            var zhHolder = document.createElement('p');
            var exampleText = examples[i].zh.join('');
            makeSentenceNavigable(exampleText, zhHolder, true);
            zhHolder.className = 'zh-example example-line';
            addTextToSpeech(zhHolder, exampleText);
            exampleHolder.appendChild(zhHolder);
            if (examples[i].pinyin) {
                var pinyinHolder = document.createElement('p');
                pinyinHolder.textContent = examples[i].pinyin;
                pinyinHolder.className = 'pinyin-example example-line';
                exampleHolder.appendChild(pinyinHolder);
            }
            var enHolder = document.createElement('p');
            enHolder.textContent = examples[i].en;
            enHolder.className = 'example-line';
            exampleHolder.appendChild(enHolder);
            exampleList.appendChild(exampleHolder);
        }
    };
    var setupExamples = function (words) {
        currentExamples = {};
        //TODO this mixes markup modification and example finding
        //refactor needed
        var examplesList = document.getElementById('examples');
        while (examplesList.firstChild) {
            examplesList.firstChild.remove();
        }
        for (var i = 0; i < words.length; i++) {
            var examples = findExamples(words[i]);
            currentExamples[words[i]] = [];

            var item = document.createElement('li');
            var wordHolder = document.createElement('h2');
            wordHolder.textContent = words[i];
            addTextToSpeech(wordHolder, words[i]);
            addSaveToListButton(wordHolder, words[i]);
            item.appendChild(wordHolder);

            var definitionHolder = document.createElement('ul');
            definitionHolder.className = 'definition';
            var definitionList = definitions[words[i]] || [];
            setupDefinitions(definitionList, definitionHolder);
            item.appendChild(definitionHolder);
            //TODO: definition list doesn't have the same interface (missing zh field)
            currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
            //setup current examples for potential future export
            currentExamples[words[i]].push(...examples);

            var exampleList = document.createElement('ul');
            item.appendChild(exampleList);
            setupExampleElements(examples, exampleList);

            examplesList.append(item);
        }
        currentWord = words;
    };
    var updateUndoChain = function () {
        //push clones onto the stack
        undoChain.push({ hanzi: [...currentHanzi], word: (currentWord ? [...currentWord] : currentWord) });
    };
    //TODO can this be combined with the definition rendering part?
    var getCardFromDefinitions = function (text, definitionList) {
        //this assumes definitionList non null
        var result = { zh: [text] };
        var answer = '';
        for (var i = 0; i < definitionList.length; i++) {
            answer += definitionList[i].pinyin + ': ' + definitionList[i].en;
            answer += i == definitionList.length - 1 ? '' : ', ';
        }
        result['en'] = answer;
        return result;
    };
    var setupCytoscape = function (root, elements) {
        cy = cytoscape({
            container: document.getElementById('graph'),
            elements: elements,
            layout: layout(root),
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': levelColor,
                        'label': 'data(id)',
                        'color': (element => element.data('level') > 3 ? '#eee' : '#333333'),
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
                        'color': '#eee',
                        'font-size': '10px',
                        'text-background-color': '#333333',
                        'text-background-opacity': '1',
                        'text-background-shape': 'round-rectangle'
                    }
                }
            ],
            maxZoom: 10,
            minZoom: 0.5
        });
        cy.on('tap', 'node', function (evt) {
            var id = evt.target.id();
            var maxLevel = document.getElementById('level-selector').value;
            updateUndoChain();
            addToExistingGraph(id, maxLevel);
            setupExamples([id]);
            persistState();
            document.getElementById('show-explore').click();
        });
        cy.on('tap', 'edge', function (evt) {
            words = evt.target.data('words');
            updateUndoChain();
            setupExamples(words);
            persistState();
            //TODO toggle functions
            document.getElementById('show-explore').click();
        });
    };

    var addToExistingGraph = function (character, maxLevel) {
        var result = { 'nodes': [], 'edges': [] };
        var maxDepth = 1;
        dfs(character, result, maxDepth, {}, maxLevel);
        cy.add(result);
        cy.layout(layout(character)).run();
        //currentHanzi must be set up before this call
        currentHanzi.push(character);
    };

    var dfs = function (start, elements, maxDepth, visited, maxLevel) {
        if (maxDepth < 0) {
            return;
        }
        var curr = hanzi[start];
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
    var updateGraph = function (value, maxLevel) {
        document.getElementById('graph').remove();
        var nextGraph = document.createElement("div");
        nextGraph.id = 'graph';
        document.getElementById('container').append(nextGraph);

        if (value && hanzi[value]) {
            var result = { 'nodes': [], 'edges': [] };
            var maxDepth = 1;
            dfs(value, result, maxDepth, {}, maxLevel);
            setupCytoscape(value, result);
            currentHanzi = [value];
            persistState();
        }
    };

    var initialize = function () {
        var oldState = JSON.parse(sessionStorage.getItem('state'));
        if (!oldState) {
            //add a default graph on page load to illustrate the concept
            var defaultHanzi = ["围", "显", "故", "商", "店"];
            updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], document.getElementById('level-selector').value);
        } else {
            document.getElementById('level-selector').value = oldState.level;
            //oldState.hanzi should always have length >= 1
            updateGraph(oldState.hanzi[0], oldState.level);
            for (var i = 1; i < oldState.hanzi.length; i++) {
                addToExistingGraph(oldState.hanzi[i], oldState.level);
            }
            if (oldState.word) {
                setupExamples(oldState.word);
            }
            undoChain = oldState.undoChain;
            if (oldState.activeTab === tabs.study) {
                //reallllllly need a toggle method
                //this does set up the current card, etc.
                document.getElementById('show-study').click();
            }
            persistState();
        }
    };

    document.getElementById('hanzi-choose').addEventListener('submit', function (event) {
        event.preventDefault();
        var value = document.getElementById('hanzi-box').value;
        var maxLevel = document.getElementById('level-selector').value;
        if (value) {
            updateUndoChain();
            updateGraph(value, maxLevel);
            setupExamples([document.getElementById('hanzi-box').value]);
            persistState();
        }
    });
    document.getElementById('level-selector').addEventListener('change', function () {
        //TODO hide edges in existing graph rather than rebuilding
        //TODO refresh after level change can be weird
        updateGraph(currentHanzi[currentHanzi.length - 1], document.getElementById('level-selector').value);
    });
    document.getElementById('exportStudyListButton').style.display = (Object.keys(studyList).length > 0) ? 'inline' : 'none';
    document.getElementById('exportStudyListButton').addEventListener('click', function () {
        let content = "data:text/plain;charset=utf-8,";
        for (const [key, value] of Object.entries(studyList)) {
            //replace is a hack for flashcard field separator...TODO could escape
            content += [key.replace(';', ''), value.en.replace(';', '')].join(';');
            content += '\n';
        }
        //wow, surely it can't be this absurd
        var encodedUri = encodeURI(content);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "hanzi-graph-export-" + Date.now() + ".txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    var makeSentenceNavigable = function (text, container, noExampleChange) {
        var sentenceContainer = document.createElement('span');
        sentenceContainer.className = "sentence-container";
        for (var i = 0; i < text.length; i++) {
            (function (character) {
                var a = document.createElement('a');
                a.textContent = character;
                a.addEventListener('click', function () {
                    if (hanzi[character]) {
                        updateUndoChain();
                        //TODO undochain here if you click multiple then undo repeatedly
                        updateGraph(character, document.getElementById('level-selector').value);
                        //enable seamless switching
                        if (!noExampleChange) {
                            setupExamples([character]);
                        }
                        persistState();
                    }
                });
                sentenceContainer.appendChild(a);
            }(text[i]));
        }
        container.appendChild(sentenceContainer);
    };

    document.getElementById('previousHanziButton').addEventListener('click', function () {
        if (!undoChain.length) {
            return;
        }
        var next = undoChain.pop();
        var maxLevel = document.getElementById('level-selector').value;
        updateGraph(next.hanzi[0], maxLevel);
        for (var i = 1; i < next.hanzi.length; i++) {
            addToExistingGraph(next.hanzi[i], maxLevel);
        }
        if (next.word) {
            setupExamples(next.word);
        }
        persistState();
    });

    //study mode code...could move to a separate file
    var currentCard = null;
    var currentKey = null;
    var setupStudyMode = function () {
        currentCard = null;
        currentKey = null;
        document.getElementById('card-answer-container').style.display = 'none';
        var counter = 0;
        for (const [key, value] of Object.entries(studyList)) {
            if (value.due <= Date.now()) {
                if (!currentCard || currentCard.due > value.due) {
                    currentCard = value;
                    currentKey = key;
                }
                counter++;
            }
        }
        document.getElementById('card-due-count').textContent = counter;
        document.getElementById('card-question-container').innerHTML = '';
        if (counter === 0) {
            document.getElementById('task-complete').style.display = 'inline';
            document.getElementById('task-description').style.display = 'none';
            document.getElementById('show-answer-button').style.display = 'none';
            return;
        } else {
            document.getElementById('task-complete').style.display = 'none';
            document.getElementById('task-description').style.display = 'inline';
            document.getElementById('show-answer-button').style.display = 'block';
        }
        question = currentCard.zh.join('');
        makeSentenceNavigable(question, document.getElementById('card-question-container'));
        addTextToSpeech(document.getElementById('card-question-container'), question);
        document.getElementById('card-answer').textContent = currentCard.en;
    };
    document.getElementById('show-answer-button').addEventListener('click', function () {
        document.getElementById('card-answer-container').style.display = 'block';
        document.getElementById('card-answer-container').scrollIntoView();
    });
    document.getElementById('wrong-button').addEventListener('click', function () {
        studyList[currentKey].nextJump = 0.5;
        studyList[currentKey].wrongCount++;
        studyList[currentKey].due = Date.now() + 15 * 60 * 1000;
        saveStudyList([currentKey]);
        setupStudyMode();
    });
    document.getElementById('right-button').addEventListener('click', function () {
        var nextJump = studyList[currentKey].nextJump || 0.5;
        studyList[currentKey].nextJump = nextJump * 2;
        studyList[currentKey].rightCount++;
        studyList[currentKey].due = Date.now() + (nextJump * 24 * 60 * 60 * 1000);
        saveStudyList([currentKey]);
        setupStudyMode();
    });
    document.getElementById('show-explore').addEventListener('click', function () {
        document.getElementById('example-container').style.display = 'block';
        document.getElementById('study-container').style.display = 'none';
        //TODO could likely do all of this with CSS
        document.getElementById('show-explore').classList.add('active');
        document.getElementById('show-study').classList.remove('active');
        activeTab = tabs.explore;
        persistState();
    });
    document.getElementById('show-study').addEventListener('click', function () {
        document.getElementById('example-container').style.display = 'none';
        document.getElementById('study-container').style.display = 'block';
        document.getElementById('show-study').classList.add('active');
        document.getElementById('show-explore').classList.remove('active');
        setupStudyMode();
        activeTab = tabs.study;
        persistState();
    });
    document.getElementById('delete-card-button').addEventListener('click', function () {
        delete studyList[currentKey];
        saveStudyList([currentKey]);
        setupStudyMode();
    });

    initialize();
})();
