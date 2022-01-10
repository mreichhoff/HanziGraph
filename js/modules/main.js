import { initialize as baseInit } from "./base.js";
import { initialize as faqInit } from "./faq.js";
import { initialize as studyModeInit } from "./study-mode.js";
import { initialize as statsInit } from "./stats.js";

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
    studyModeInit();
    baseInit();
    statsInit();
    faqInit();
});
//ideally we'll continue adding to this