let hanzi = {};
let visited = {};
let maxLevel = 6;
let minLevel = 1;
const maxEdgesForRecommendation = 16;
let getRecommendations = function () {
    if (!hanzi || !visited) {
        return [];
    }
    if (Object.keys(visited).length < 5) {
        return [];
    }
    let keys = Object.keys(hanzi);
    let best = 0;
    let result = [];
    for (let i = 0; i < keys.length; i++) {
        if (visited[keys[i]] || hanzi[keys[i]].node.level < minLevel || hanzi[keys[i]].node.level > maxLevel) {
            continue;
        }
        let currentHanzi = hanzi[keys[i]];
        //let numerator = 0;
        //let edgeLevelTotal = 1;
        let edgeKeys = Object.keys(currentHanzi.edges);
        if (edgeKeys.length > maxEdgesForRecommendation) {
            continue;
        }
        let total = 0;
        for (let j = 0; j < edgeKeys.length; j++) {
            let curr = (visited[edgeKeys[j]] || 0) / hanzi[edgeKeys[j]].node.level;
            curr /= (Object.keys(hanzi[edgeKeys[j]].edges).length || 1);
            total += curr;
            //TODO lots of room for improvement
            //edgeLevelTotal += hanzi[edgeKeys[j]].node.level;
        }
        total /= currentHanzi.node.level;
        //let total = numerator / (edgeLevelTotal / (edgeKeys.length || 1));
        if (total > best || !result.length) {
            best = total;
            result = [keys[i]];
        } else if (total == best) {
            result.push(keys[i]);
        }
    }
    result.sort((a, b) => {
        return hanzi[a].node.level - hanzi[b].node.level;
    });
    return result.slice(0, 3);
}
onmessage = function (e) {
    if (e.data.type === 'graph') {
        hanzi = e.data.payload;
    } else if (e.data.type === 'visited') {
        visited = e.data.payload;
    } else if (e.data.type === 'levelPreferences') {
        maxLevel = e.data.payload.maxLevel;
        minLevel = e.data.payload.minLevel;
    }
}
setInterval(function () {
    let message = {
        recommendations: getRecommendations()
    };
    postMessage(message);
}, 60000);