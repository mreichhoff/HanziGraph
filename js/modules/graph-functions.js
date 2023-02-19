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
                }
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

export { getWordLevelsFromGraph, getWordSetFromFrequency, buildGraphFromFrequencyList }