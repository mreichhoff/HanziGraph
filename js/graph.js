(function(){
    //refactor badly needed...hacks on top of hacks at this point
    var studyList = JSON.parse(localStorage.getItem('studyList') || '{}');
    var undoChain = [];
    var currentHanzi = null;
    var maxExamples = 5;
    var currentExamples = {};
    var getZhTts = function(){
	//use the first-encountered zh-CN voice for now
	return speechSynthesis.getVoices().find(voice => voice.lang === "zh-CN");
    };
    var zhTts = getZhTts();
    //TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
    speechSynthesis.onvoiceschanged = function() {
	if(!zhTts){
	    zhTts = getZhTts();
	}
    };
    var levelColor = function(element){
	let level = element.data('level');
	switch(level) {
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

    var layout = function(root){
	return {
	    name: 'breadthfirst',
	    roots: [root],
	    padding: 6,
	    spacingFactor: 0.85
	}
    };

    var runTextToSpeech = function(text){
	zhTts = zhTts || getZhTts();
	//TTS voice option loading appears to differ in degree of asynchronicity by browser...being defensive
	if(zhTts){
	    var utterance = new SpeechSynthesisUtterance(text);
	    utterance.lang = "zh-CN";
	    utterance.voice = zhTts;
	    speechSynthesis.speak(utterance);
	}
    };

    var addTextToSpeech = function(holder, text){
	var textToSpeechButton = document.createElement('span');
	textToSpeechButton.className = 'text-button';
	textToSpeechButton.textContent = 'Listen';
	textToSpeechButton.addEventListener('click', runTextToSpeech.bind(this, text), false);
	holder.appendChild(textToSpeechButton);
    };
    var addSaveToListButton = function(holder, text){
	var buttonTexts = ['In your study list!', 'Add this to my study list!'];
	var saveToListButton = document.createElement('span');
	saveToListButton.className = 'text-button';
	saveToListButton.textContent = studyList[text] ? buttonTexts[0] : buttonTexts[1];
	saveToListButton.addEventListener('click', function(){
	    var newCards = currentExamples[text].map(x=>({...x, due: Date.now()}));
	    for(var i = 0; i < newCards.length; i++){
		var zhJoined = newCards[i].zh.join('');
		if(!studyList[zhJoined] && newCards[i].en){
		    studyList[zhJoined] = {en: newCards[i].en, due: newCards[i].due, zh: newCards[i].zh};
		}
	    }
	    //update it whenever it changes
	    localStorage.setItem('studyList', JSON.stringify(studyList));
	    document.getElementById('exportStudyListButton').style.display = 'inline';
	    saveToListButton.textContent = buttonTexts[0];
	});
	holder.appendChild(saveToListButton);
    };

    var setupExamples = function(words){
	currentExamples = {};
	//TODO this mixes markup modification and example finding
	//refactor needed
	var examplesList = document.getElementById('examples');
	while (examplesList.firstChild) {
	    examplesList.firstChild.remove()
	}
	for(var i = 0; i < words.length; i++){
	    var examples = [];
	    currentExamples[words[i]] = [];
	    //used for e.g., missing translation
	    var lessDesirableExamples = [];
	    //TODO consider indexing up front
	    //can also reuse inner loop...consider inverting
	    for(var j = 0; j < sentences.length; j++){
		if(sentences[j].zh.includes(words[i])){
		    if(sentences[j].en && sentences[j].pinyin){
			examples.push(sentences[j]);
			if(examples.length === maxExamples){
			    break;
			}
		    } else if(lessDesirableExamples.length < maxExamples){
			lessDesirableExamples.push(sentences[j]);
		    }
		}
	    }
	    if(examples.length < maxExamples && lessDesirableExamples.length > 0) {
		examples.splice(examples.length, 0, ...lessDesirableExamples.slice(0, (maxExamples - examples.length)));
	    }
	    //TODO...improve
	    examples.sort((a, b) => {
		if(a.en && !b.en){
		    return -1;
		} else if(!a.en && b.en){
		    return 1;
		} else {
		    return a.zh.length - b.zh.length;
		}
	    });

	    var item = document.createElement('li');
	    var wordHolder = document.createElement('h2');
	    wordHolder.textContent = words[i];
	    addTextToSpeech(wordHolder, words[i]);
	    addSaveToListButton(wordHolder, words[i]);
	    item.appendChild(wordHolder);

	    var definitionHolder = document.createElement('ul');
	    var definitionList = definitions[words[i]] || [];
	    for(var j = 0; j < definitionList.length; j++){
		var definitionItem = document.createElement('li');
		var definitionContent = definitionList[j].pinyin + ': ' + definitionList[j].en;
		definitionItem.textContent = definitionContent;
		definitionHolder.appendChild(definitionItem);
	    }
	    //TODO: definition list doesn't have the same interface (missing zh field)
	    currentExamples[words[i]].push(getCardFromDefinitions(words[i], definitionList));
	    //setup current examples for potential future export
	    currentExamples[words[i]].push(...examples);

	    definitionHolder.className = 'definition';
	    item.appendChild(definitionHolder);

	    var exampleList = document.createElement('ul');
	    item.appendChild(exampleList);
	    for(var j = 0; j < examples.length; j++){
		var exampleHolder = document.createElement('li');
		var zhHolder = document.createElement('p');
		var exampleText = examples[j].zh.join('');
		makeSentenceNavigable(exampleText, zhHolder, true);
		zhHolder.className = 'zh-example example-line';
		addTextToSpeech(zhHolder, exampleText);
		exampleHolder.appendChild(zhHolder);
		if(examples[j].pinyin){
		    var pinyinHolder = document.createElement('p');
		    pinyinHolder.textContent = examples[j].pinyin;
		    pinyinHolder.className = 'pinyin-example example-line';
		    exampleHolder.appendChild(pinyinHolder);
		}
		var enHolder = document.createElement('p');
		enHolder.textContent = examples[j].en;
		enHolder.className = 'example-line';
		exampleHolder.appendChild(enHolder);
		exampleList.appendChild(exampleHolder);
	    }
	    
	    examplesList.append(item);
	}
    };
    //TODO can this be combined with the definition rendering part?
    var getCardFromDefinitions = function(text, definitionList){
	//this assumes definitionList non null
	var result = {zh: [text]};
	var answer = '';
	for(var j = 0; j < definitionList.length; j++){
	    answer += definitionList[j].pinyin + ': ' + definitionList[j].en;
	    answer += j == definitionList.length-1 ? '' : ', ';
	}
	result['en'] = answer;
	return result;
    };
    var setupCytoscape = function(root, elements){
	var cy = cytoscape({
	    container: document.getElementById('graph'),
	    elements: elements,
	    layout: layout(root),
	    style:[
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
			'font-size': '8px',
			'text-background-color': '#333333',
			'text-background-opacity': '1',
			'text-background-shape': 'round-rectangle'
		    }
		}
	    ]
	});
	cy.on('tap', 'node', function(evt){
	    var id = evt.target.id();
	    var maxLevel = document.getElementById('level-selector').value;
	    var result = {'nodes':[], 'edges':[]};
	    var maxDepth = 1;
	    var curr = document.getElementById('hanzi-box').value;
	    dfs(id, result, maxDepth, {}, maxLevel);
	    cy.add(result);
	    cy.layout(layout(id)).run();
	    //TODO this is unfortunate
	    undoChain.push(currentHanzi);
	    currentHanzi = id;
	    setupExamples([id]);
	});
	cy.on('tap', 'edge', function(evt){
	    words = evt.target.data('words');
	    setupExamples(words);
	    //TODO toggle functions
	    document.getElementById('show-explore').click();
	});
    };

    var dfs = function(start, elements, maxDepth, visited, maxLevel){
	if(maxDepth < 0){
	    return;
	}
	var curr = hanzi[start];
	//todo does javascript have a set?
	visited[start] = true;
	for(const [key, value] of Object.entries(curr.edges)){
	    //don't add outgoing edges when we won't process the next layer
	    if(maxDepth > 0 && value.level <= maxLevel){
		if(!visited[key]){		
		    elements.edges.push({data: {id: Array.from(start+key).sort().toString(), source: start, target: key, level: value.level, words: value.words}});
		}
	    }
	}
	elements.nodes.push({data: {id: start, level: curr.node.level}});
	for(const [key, value] of Object.entries(curr.edges)){
	    if(!visited[key] && value.level <= maxLevel){
		dfs(key, elements, maxDepth-1, visited, maxLevel);
	    }
	}
    };
    var updateGraph = function(value, maxLevel, isUndo) {
	document.getElementById('graph').remove();
	var nextGraph = document.createElement("div");
	nextGraph.id = 'graph';
	document.getElementById('container').append(nextGraph);

	if(value && hanzi[value]){
	    var result = {'nodes':[], 'edges':[]};
	    var maxDepth = 1;
	    dfs(value, result, maxDepth, {}, maxLevel);
	    setupCytoscape(value, result);
	    if(currentHanzi && !isUndo){
		undoChain.push(currentHanzi);
	    }
	    currentHanzi = value;
	}
    };
    //add a default graph on page load to illustrate the concept
    var defaultHanzi = ["围", "显", "故", "商", "店"];
    updateGraph(defaultHanzi[Math.floor(Math.random() * defaultHanzi.length)], document.getElementById('level-selector').value);

    document.getElementById('hanzi-choose').addEventListener('submit', function(event){
	event.preventDefault();
	var value = document.getElementById('hanzi-box').value;
	var maxLevel = document.getElementById('level-selector').value;
	if(value){
	    updateGraph(value, maxLevel);
	    setupExamples([document.getElementById('hanzi-box').value]);
	}
    });
    document.getElementById('level-selector').addEventListener('change', function(){
	//TODO hide edges in existing graph rather than rebuilding
	updateGraph(document.getElementById('hanzi-box').value, document.getElementById('level-selector').value);
    });
    document.getElementById('exportStudyListButton').style.display = (Object.keys(studyList).length > 0) ? 'inline' : 'none';
    document.getElementById('exportStudyListButton').addEventListener('click', function(){
	let content = "data:text/plain;charset=utf-8,";
	for(const [key, value] of Object.entries(studyList)){
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

    var makeSentenceNavigable = function(text, container, noExampleChange){
	for(var i = 0; i < text.length; i++){
	    (function(character) {
		var a = document.createElement('a');
		a.textContent = character;
		a.addEventListener('click', function(){
		    if(hanzi[character]){
			updateGraph(character, document.getElementById('level-selector').value);
			//enable seamless switching
			if(!noExampleChange){
			    setupExamples([character]);
			}
		    }
		});
		container.appendChild(a);
	    }(text[i]));
	}
    };

    document.getElementById('previousHanziButton').addEventListener('click', function(){
	if(!undoChain.length){
	    return;
	}
	var next = undoChain.pop();
	updateGraph(next, document.getElementById('level-selector').value, true);
	setupExamples([next]);
	currentHanzi = next;
    });

    //study mode code...could move to a separate file
    var currentCard = null;
    var currentKey = null;
    var setupStudyMode = function(){
	currentCard = null;
	currentKey = null;
	document.getElementById('card-answer-container').style.display = 'none';
	var counter = 0;
	for(const [key, value] of Object.entries(studyList)){
	    if(value.due <= Date.now()){
		if(!currentCard){
		    currentCard = value;
		    currentKey = key;
		}
		counter++;
	    }
	}
	document.getElementById('card-due-count').textContent = counter;
	document.getElementById('card-question-container').innerHTML = '';
	if(counter === 0){
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
    document.getElementById('show-answer-button').addEventListener('click', function(){
	document.getElementById('card-answer-container').style.display = 'block';
    });
    document.getElementById('wrong-button').addEventListener('click', function(){
	studyList[currentKey].nextJump = 0.5;
	studyList[currentKey].due = Date.now() + 15*60*1000;
	localStorage.setItem('studyList', JSON.stringify(studyList));
	setupStudyMode();
    });
    document.getElementById('right-button').addEventListener('click', function(){
	var nextJump = studyList[currentKey].nextJump || 0.5;
	studyList[currentKey].nextJump = nextJump*2;
	studyList[currentKey].due = Date.now() + (nextJump*24*60*60*1000);
	localStorage.setItem('studyList', JSON.stringify(studyList));
	setupStudyMode();
    });
    document.getElementById('show-explore').addEventListener('click', function(){
	document.getElementById('example-container').style.display = 'block';
	document.getElementById('study-container').style.display = 'none';
	//TODO could likely do all of this with CSS
	document.getElementById('show-explore').classList.add('active');
	document.getElementById('show-study').classList.remove('active');
    });
    document.getElementById('show-study').addEventListener('click', function(){
	document.getElementById('example-container').style.display = 'none';
	document.getElementById('study-container').style.display = 'block';
	document.getElementById('show-study').classList.add('active');
	document.getElementById('show-explore').classList.remove('active');
	setupStudyMode();
    });
    document.getElementById('delete-card-button').addEventListener('click', function(){
	delete studyList[currentKey];
	localStorage.setItem('studyList', JSON.stringify(studyList));
	setupStudyMode();
    });
})();
