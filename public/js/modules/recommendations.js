import { getVisited, registerCallback, dataTypes } from "./data-layer.js";
import { isInGraph } from "./graph.js";
import { showFaq, faqTypes } from "./faq.js";
import { hanziBox } from "./dom.js";

//TODO: like in other files, remove dups from dom.js if possible
const recommendationsContainer = document.getElementById('recommendations-container');
let recommendationsWorker = null;
let levelPreferences = 'any';


let initialize = function () {
    recommendationsWorker = new Worker('/js/modules/recommendations-worker.js');
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
            recommendationsFaqLink.innerText = "Why?"
            recommendationsFaqLink.addEventListener('click', function () {
                showFaq(faqTypes.recommendations);
            });
            if (usedRecommendation) {
                recommendationsContainer.appendChild(recommendationsFaqLink);
            }
        } else {
            recommendationsContainer.style.visibility = 'hidden';
        }
    }
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
}
export { initialize, graphChanged, preferencesChanged }