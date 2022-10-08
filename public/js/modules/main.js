import { initialize as firebaseInit } from './firebase-init.js';
import { initialize as authStateInit } from './auth-state.js';
import { initialize as baseInit } from "./base.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";
import { initialize as recommendationsInit } from "./recommendations.js";
import { initialize as datalayerInit } from "./data-layer.js";

Promise.all(
    [
        window.graphFetch
            .then(response => response.json())
            .then(data => window.hanzi = data),
        window.sentencesFetch
            .then(response => response.json())
            .then(data => window.sentences = data),
    ]
).then(_ => {
    firebaseInit();
    authStateInit();
    datalayerInit();
    studyModeInit();
    baseInit();
    statsInit();
    faqInit();
    recommendationsInit();
});
//ideally we'll continue adding to this