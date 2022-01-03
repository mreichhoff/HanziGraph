import { initialize } from "./base.js";

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
).then(_ => initialize());
//ideally we'll continue adding to this