# HanziGraph

HanziGraph is a Chinese/English dictionary and study tool for Chinese language learners. It represents the Chinese language as [a graph](https://en.wikipedia.org/wiki/Graph_theory), in which individual characters are the [nodes](https://en.wikipedia.org/wiki/Vertex_(graph_theory)), and the [edges](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge) are words. As a concrete example, `确` and `定` would each represent a node, and `确定` would be the edge that connects them.

It is installable as a standalone [PWA](https://web.dev/progressive-web-apps/), or can be viewed on the web.

Looking for **Japanese**? See `/data/japanese` and the slightly modified web code on [the JapaneseGraph branch](https://github.com/mreichhoff/HanziGraph/tree/JapaneseGraph).

### Features

#### Interactive Graph

The nodes and edges (more than 100,000 in all) have data associated with them.
* For hanzi (nodes), color coding based on tone.
* For words (edges) and hanzi (nodes), usage frequency data, which can take the form of color coding (red: very frequent; blue: less frequent). Word frequency can also be substituted with color coding by HSK level.
* Definitions, from [CEDICT](https://cc-cedict.org/editor/editor.php) (and in the case of Cantonese, [CC-CANTO](https://cantonese.org/)).
* Human-generated example sentences, sorted by average word frequency, from [tatoeba](https://tatoeba.org/).
* For words not present in tatoeba's corpus, AI generated examples are used instead.

##### Graph Demo




https://github.com/mreichhoff/HanziGraph/assets/17800817/03812ce4-d0b0-48a8-935a-5f9ac156c8e6





#### Component Breakdowns

Each hanzi can also be diagrammed as a component tree, where each successive level of the tree is a further breakdown of its parent. Compounds using a character as a component are also listed. Colors indicate tones, and when pronunciation (pinyin initial, final, or both) is shared, the shared portion is shown on each connecting edge.

#### Components Demo



https://github.com/mreichhoff/HanziGraph/assets/17800817/25dfde16-77f6-4516-9984-cae240bb3582


Note that this functionality is also has its own standalone mode.


https://github.com/mreichhoff/HanziGraph/assets/17800817/e131345e-33c2-466d-a91f-a91aa9c60a82




#### Word Relationships

In addition to **character** relationships expressed through a graph structure, the tool uses [collocation](https://en.wikipedia.org/wiki/Collocation) data to show how **words** relate to one another. It expresses those relationships with [sankey diagrams](https://en.wikipedia.org/wiki/Sankey_diagram). These diagrams can also be thought of as a graph, where each node is a word and each edge is a collocation, with the edge weight representing frequency of use. One example would be `时候` commonly being preceded by `的`. In this case, `时候` and `的` are nodes, and the weight of their connecting edge represents the frequency of the collocation `的时候`.

#### Sankey Demo




https://github.com/mreichhoff/HanziGraph/assets/17800817/c6b75af8-7ca1-40df-accc-45875b05f6dc





#### Cumulative Frequency Stats

Curious how much bang-for-your-buck you're getting by learning a given word? The frequency coloring and coverage graphs can help. The coverage graphs indicate what percentage of the language you'd understand if you learned each word in order of frequency up to your search term, where very frequent words make up a disproportionate amount of the spoken language.



https://github.com/mreichhoff/HanziGraph/assets/17800817/9a573a0d-4aa1-439b-b829-937f24ed7d06


#### Flashcards

Flashcards can be created from the definitions and example sentences, and either studied in the tool or exported to Anki. The flashcards test both recognition (translating from Chinese to English) and recall (translating from English to Chinese); cloze cards (fill in the blank) are also made. When a new word is being studied, it should often be studied in several contexts, so up to 10 cards are made for a single word or character.


## As seen on...

You can learn more via [a discussion on reddit](https://www.reddit.com/r/ChineseLanguage/comments/tcgps5/free_tool_to_learn_hanzi_get_example_sentences/) and [on hacking Chinese](https://challenges.hackingchinese.com/resources/stories/513-hanzigraph-visual-vocabulary-relationships). 

The tool was also [recommended on the You Can Learn Chinese podcast](https://thechinaproject.com/podcast/the-impact-of-comprehensible-input-on-language-learning-a-deep-dive/). The Japanese version was [recommended by Tofugu](https://www.tofugu.com/japanese/japanese-learning-resources-summer-2022/) and [The Japan Foundation, Sydney](https://mailchi.mp/jpf/jlearner-apr-23).

## Running the code
Running the main branch code is intended to be extremely simple. There is no backend; the entire app runs in-browser. Setup is therefore as simple as:

```bash
git clone https://github.com/mreichhoff/HanziGraph.git
cd HanziGraph
# Assuming python is installed, though any basic web server would do; it's just viewing files.
python3 -m http.server
```

after which you can use the app in your browser, e.g. at `localhost:8000`.

Note that some of the larger data files are partitioned to avoid excessive memory use or network bandwidth (while also avoiding huge numbers of files).

## Project Status
The webapp is still a prototype, but it is functional and can be installed as [a PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installing) or used on the web. Note that there is both [a firebase-hosted version](https://hanzigraph.com) and [a github pages site](https://mreichhoff.github.io/HanziGraph/). The latter does not allow cross-device syncing, but is otherwise equivalent (though note that sometimes one or the other is a few commits behind).

Note that consolidation of the code for the various datasets (Mandarin, Cantonese, Japanese) is ongoing. Upcoming changes will also begin use of [lit](https://lit.dev) and pay down technical debt.

## Acknowledgements
Sentence and definition data was pulled from:
* [Tatoeba](https://tatoeba.org/), which releases data under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/)
* [CEDICT](https://cc-cedict.org/editor/editor.php), which releases data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Because of sharealike, the definitions files should be considered released under that license as well.
* [OPUS](https://opus.nlpl.eu/OpenSubtitles2018.php), specifically the [OpenSubtitles](http://www.opensubtitles.org/), [UN parallel](https://cms.unov.org/UNCorpus), and [WikiMatrix](https://arxiv.org/abs/1907.05791) corpuses.
* OpenAI's `gpt-3.5-turbo` model generated example sentences for ~80,000 words and characters.
* Japanese definitions were pulled from [JMDict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project); links to their license terms are available on that page.

Character composition data was pulled from [cjkvi-ids](https://github.com/cjkvi/cjkvi-ids) (specifically, the portion derived from the [CHISE project](http://www.chise.org/), under their license) and [cjk-decomp](https://github.com/amake/cjk-decomp/blob/master/cjk-decomp.txt).

Cantonese frequency data was generated from [a spreadsheet](https://docs.google.com/spreadsheets/d/1ArxEFo46PTrDyDDhWyu3wB0epxqTyd8WBaprnwTEPm4/) found [on reddit](https://www.reddit.com/r/Cantonese/comments/62i3ud/most_common_cantonese_words_frequency_list/), [HKCanCor](https://github.com/fcbond/hkcancor) via [pycantonese](https://github.com/jacksonllee/pycantonese), and tatoeba.

[Jieba](https://github.com/wchan757/jieba) was used to tokenize sentences, including in [Cantonese](https://github.com/wchan757/Cantonese_Word_Segmentation). It is also used [in WASM form](https://github.com/fengkx/jieba-wasm) to tokenize sentences on the frontend.

[CytoscapeJS](https://github.com/cytoscape/cytoscape.js) and [d3](https://github.com/d3/d3) are helpful for graph visualization. Some icons were based on [CSS icons](https://css.gg/).

