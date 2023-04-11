# HanziGraph

## Demo


https://user-images.githubusercontent.com/17800817/226909950-5448e64b-7d2c-42ef-9edc-6869b082ee7f.mov


## Description

HanziGraph is a Chinese/English dictionary and study tool for Chinese language learners or those interested in how Chinese characters are used. It represents the Chinese language as [a graph](https://en.wikipedia.org/wiki/Graph_theory), in which individual characters are the [nodes](https://en.wikipedia.org/wiki/Vertex_(graph_theory)), and the [edges](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge) are words. As a concrete example, `确` and `定` would each represent a node, and `确定` would be the edge that connects them.

The nodes and edges all have data associated with them. Specifically, each node and edge has:
* Usage frequency data, which takes the form of color coding (red: very frequent; blue: less frequent). Word frequency can also be substituted with color coding by HSK level.
* Definitions, from [CEDICT](https://cc-cedict.org/editor/editor.php) (and in the case of Cantonese, [CC-CANTO](https://cantonese.org/)).
* Example sentences, sorted by average word frequency, from [tatoeba](https://tatoeba.org/), [OpenSubtitles](http://www.opensubtitles.org/), [the UN parallel corpus](https://cms.unov.org/UNCorpus), and [WikiMatrix](https://arxiv.org/abs/1907.05791).

In addition to character relationships expressed through a graph structure, the tool uses [collocation](https://en.wikipedia.org/wiki/Collocation) data to show how words relate to one another. It expresses those relationships with [sankey diagrams](https://en.wikipedia.org/wiki/Sankey_diagram). These diagrams can also be thought of as a graph, where each node is a word and each edge is a collocation, with the edge weight representing frequency of use. One example would be `时候` commonly being preceded by `的`. In this case, `时候` and `的` are nodes, and the weight of their connecting edge represents the frequency of the collocation `的时候`.

Based on which nodes and edges a user visits, the tool is able to recommend related characters. It bases these recommendations on the user having seen connected characters, with more-common characters prioritized. For example, if a user has viewed `决`, `释`, and `理`, `解` might be recommended, since it is connected to what the learner has already seen (via `解决`, `解释`, and `理解`) and is very common.

Flashcards can be created from the definitions and example sentences, and either studied in the tool or exported to Anki. The flashcards test both recognition (translating from Chinese to English) and recall (translating from English to Chinese); cloze cards (fill in the blank) are also made. When a new word is being studied, it should often be studied in several contexts, so up to 10 cards are made for a single word or character.

You can learn more via [a discussion on reddit](https://www.reddit.com/r/ChineseLanguage/comments/tcgps5/free_tool_to_learn_hanzi_get_example_sentences/) and [on hacking Chinese](https://challenges.hackingchinese.com/resources/stories/513-hanzigraph-visual-vocabulary-relationships).

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

There's also a port to help learners [study Japanese kanji](https://github.com/mreichhoff/JapaneseGraph).

## Acknowledgements
Sentence and definition data was pulled from:
* [Tatoeba](https://tatoeba.org/), which releases data under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/)
* [CEDICT](https://cc-cedict.org/editor/editor.php), which releases data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Because of sharealike, the definitions files should be considered released under that license as well.
* [OPUS](https://opus.nlpl.eu/OpenSubtitles2018.php), specifically the [OpenSubtitles](http://www.opensubtitles.org/), [UN parallel](https://cms.unov.org/UNCorpus), and [WikiMatrix](https://arxiv.org/abs/1907.05791) corpuses.

Cantonese frequency data was generated from [a spreadsheet](https://docs.google.com/spreadsheets/d/1ArxEFo46PTrDyDDhWyu3wB0epxqTyd8WBaprnwTEPm4/) found [on reddit](https://www.reddit.com/r/Cantonese/comments/62i3ud/most_common_cantonese_words_frequency_list/), [HKCanCor](https://github.com/fcbond/hkcancor) via [pycantonese](https://github.com/jacksonllee/pycantonese), and tatoeba.

[Jieba](https://github.com/wchan757/jieba) was used to tokenize sentences, including in [Cantonese](https://github.com/wchan757/Cantonese_Word_Segmentation). It is also used [in WASM form](https://github.com/fengkx/jieba-wasm) to tokenize sentences on the frontend.

[CytoscapeJS](https://github.com/cytoscape/cytoscape.js) and [d3](https://github.com/d3/d3) are helpful for graph visualization.
