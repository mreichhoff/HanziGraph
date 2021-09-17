(function(){
    var maxExamples = 5;
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
	textToSpeechButton.textContent = '[listen]';
	holder.addEventListener('click', runTextToSpeech.bind(this, text), false);
	holder.appendChild(textToSpeechButton);
    };

    var setupExamples = function(words){
	//TODO this mixes markup modification and example finding
	//refactor needed
	var examplesList = document.getElementById('examples');
	while (examplesList.firstChild) {
	    examplesList.firstChild.remove()
	}
	for(var i = 0; i < words.length; i++){
	    var examples = [];
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
	    var item = document.createElement('li');
	    var wordHolder = document.createElement('h2');
	    wordHolder.textContent = words[i];
	    addTextToSpeech(wordHolder, words[i]);
	    item.appendChild(wordHolder);

	    var definitionHolder = document.createElement('ul');
	    var definitionList = definitions[words[i]];
	    for(var j = 0; j < definitionList.length; j++){
		var definitionItem = document.createElement('li');
		definitionItem.textContent = definitionList[j].pinyin + ': ' + definitionList[j].en;
		definitionHolder.appendChild(definitionItem);
	    }

	    definitionHolder.className = 'definition';
	    item.appendChild(definitionHolder);

	    var exampleList = document.createElement('ul');
	    item.appendChild(exampleList);
	    for(var j = 0; j < examples.length; j++){
		var exampleHolder = document.createElement('li');
		var zhHolder = document.createElement('p');
		zhHolder.textContent = examples[j].zh.join('');
		zhHolder.className = 'zh-example example-line';
		addTextToSpeech(zhHolder, zhHolder.textContent);
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
	    setupExamples([id]);
	});
	cy.on('tap', 'edge', function(evt){
	    words = evt.target.data('words');
	    setupExamples(words);
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
    var updateGraph = function() {
	document.getElementById('graph').remove();
	var nextGraph = document.createElement("div");
	nextGraph.id = 'graph';
	document.getElementById('container').append(nextGraph);

	var value = document.getElementById('hanzi-box').value;
	var maxLevel = document.getElementById('level-selector').value;
	if(value && hanzi[value]){
	    var result = {'nodes':[], 'edges':[]};
	    var maxDepth = 1;
	    dfs(value, result, maxDepth, {}, maxLevel);
	    setupCytoscape(value, result);
	}
    };
    document.getElementById('hanzi-choose').addEventListener('submit', function(event){
	event.preventDefault();
	updateGraph();
	setupExamples([document.getElementById('hanzi-box').value]);
    });
    document.getElementById('level-selector').addEventListener('change', updateGraph);
})();
