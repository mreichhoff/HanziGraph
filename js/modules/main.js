import { initialize as baseInit } from "./base.js";
import { initialize as faqInit } from "./faq.js"

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
    baseInit();
    faqInit();
});
//ideally we'll continue adding to this