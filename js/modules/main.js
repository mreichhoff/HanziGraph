import { initialize as menuOrchestratorInit } from "./menu-orchestrator.js"
import { initialize as baseInit } from "./base.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";
import { initialize as recommendationsInit } from "./recommendations.js";

Promise.all(
    [
        window.graphFetch
            .then(response => response.json())
            .then(data => window.hanzi = data),
        window.sentencesFetch
            .then(response => response.json())
            .then(data => window.sentences = data),
        window.definitionsFetch
            .then(response => response.json())
            .then(data => window.definitions = data)
    ]
).then(_ => {
    menuOrchestratorInit();
    studyModeInit();
    baseInit();
    statsInit();
    faqInit();
    recommendationsInit();
});
//ideally we'll continue adding to this