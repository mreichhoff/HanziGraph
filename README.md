# HanziGraph
HanziGraph is a tool for Chinese language learners or those interested in how Chinese characters are used. It represents the Chinese language as [a graph](https://en.wikipedia.org/wiki/Graph_theory), in which individual characters are the [nodes](https://en.wikipedia.org/wiki/Vertex_(graph_theory)), and the [edges](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge) are words. As a concrete example, 确 and 定 would each represent a node, and 确定 would be the edge that connects them.

The nodes and edges all have data associated with them. Specifically, each node and edge has:
* Usage frequency data, which takes the form of color coding (red: very frequent; blue: less frequent). Word frequency can also be substituted with color coding by HSK level.
* Definitions, from [CEDICT](https://cc-cedict.org/editor/editor.php) (and in the case of Cantonese, [CC-CANTO](https://cantonese.org/))
* Example sentences, sorted by average word frequency, from [tatoeba](https://tatoeba.org/), [OpenSubtitles](http://www.opensubtitles.org/), and [CommonCrawl](https://opus.nlpl.eu/CCAligned.php).

Based on which nodes and edges a user visits, the tool is able to recommend related characters, based on the user having seen connected characters and with high frequency characters being prioritized. For example, if a user has viewed 决, 释, and 理, 解 might be recommended, since it is connected to what the learner has already seen.

Flashcards can be created from the definitions and example sentences, and either studied in the tool or exported to Anki. The flashcards test both recognition (translating from Chinese to English) and recall (translating from English to Chinese); cloze cards (fill in the blank) are also made. When a new word is being studied, it should often be studied in several contexts, so up to 10 cards are made for a single word or character.

You can learn more via [a discussion on reddit](https://www.reddit.com/r/ChineseLanguage/comments/tcgps5/free_tool_to_learn_hanzi_get_example_sentences/) and [on hacking Chinese](https://challenges.hackingchinese.com/resources/stories/513-hanzigraph-visual-vocabulary-relationships).

## Project Status
The webapp is still a prototype, but it is functional and can be installed as [a PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installing) or used on the web. Note that there is both [a firebase-hosted version](https://hanzigraph.com) and [a github pages site](https://mreichhoff.github.io/HanziGraph/). The latter does not allow cross-device syncing, but is otherwise equivalent. 

There's also a port to help learners [study Japanese kanji](https://github.com/mreichhoff/JapaneseGraph).

## Acknowledgements
Sentence and definition data was pulled from:
* [Tatoeba](https://tatoeba.org/), which releases data under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/)
* [CEDICT](https://cc-cedict.org/editor/editor.php), which releases data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Because of sharealike, the definitions files should be considered released under that license as well.
* [OPUS](https://opus.nlpl.eu/OpenSubtitles2018.php), specifically the [OpenSubtitles](http://www.opensubtitles.org/) and [CommonCrawl](https://opus.nlpl.eu/CCAligned.php) corpuses.

Cantonese frequency data was generated primarily from [HKCanCor](https://github.com/fcbond/hkcancor) via [pycantonese](https://github.com/jacksonllee/pycantonese) and tatoeba.

[Jieba](https://github.com/wchan757/jieba) was used to tokenize sentences, including in [Cantonese](https://github.com/wchan757/Cantonese_Word_Segmentation).

[CytoscapeJS](https://github.com/cytoscape/cytoscape.js) is helpful for graph visualization.
