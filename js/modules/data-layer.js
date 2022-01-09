const dataTypes = {
    visited: 'visited',
    studyList: 'studyList',
    studyResults: 'studyResults'
};
let callbacks = {
    visited: [],
    studyList: [],
    studyResults: []
}
let visited = JSON.parse(localStorage.getItem('visited') || '{}');

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

export { getVisited, updateVisited, registerCallback, dataTypes }