# JapaneseGraph

JapaneseGraph is a tool for language learners. It represents the Japanese language as [a graph](https://en.wikipedia.org/wiki/Graph_theory), in which individual characters are the [nodes](https://en.wikipedia.org/wiki/Vertex_(graph_theory)), and the [edges](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge) are words. As a concrete example, `反` and `応` would each represent a node, and `反応` would be the edge that connects them.

This branch is for **Japanese**. The [main branch](https://github.com/mreichhoff/HanziGraph), and the repo name (HanziGraph), come from the Chinese version. The two codebases are being consolidated, as the functionality is nearly identical, with the data being the main differentiator.

### Demo


https://github.com/mreichhoff/HanziGraph/assets/17800817/82c4f84a-0524-421d-858a-195bacbeb82a


### Features

The nodes and edges have data associated with them. Specifically, each node and edge has:
* Usage frequency data, which takes the form of color coding (red: very frequent; blue: less frequent). Word frequency can also be substituted with color coding by JLPT level.
* Definitions, from [JMDict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project).
* Human-generated example sentences, sorted by average word frequency, from [tatoeba](https://tatoeba.org/).
* For words not present in tatoeba's corpus, AI generated examples may be used in the future (note that AI examples are already present on the Chinese version).

#### Word Relationships

In addition to **character** relationships expressed through a graph structure, the tool uses [collocation](https://en.wikipedia.org/wiki/Collocation) data to show how **words** relate to one another. It expresses those relationships with [sankey diagrams](https://en.wikipedia.org/wiki/Sankey_diagram). These diagrams can also be thought of as a graph, where each node is a word and each edge is a collocation, with the edge weight representing frequency of use. One example would be `舞踏` commonly being succeded by `会`. In this case, `舞踏` and `会` are nodes, and the weight of their connecting edge represents the frequency of the collocation `舞踏会`.

#### Recommending Characters

Based on which nodes and edges a user visits, the tool is able to recommend related characters. It bases these recommendations on the user having seen connected characters, with more-common characters prioritized. For example, if a user has viewed `変`, `化`, and `大`, `学` might be recommended, since it is connected to what the learner has already seen (via `大変`, `変化`, and `大学`) and is very common.

#### Flashcards

Flashcards can be created from the definitions and example sentences, and either studied in the tool or exported to Anki. The flashcards test both recognition (translating from Japanese to English) and recall (translating from English to Chinese); cloze cards (fill in the blank) are also made. When a new word is being studied, it should often be studied in several contexts, so up to 10 cards are made for a single word or character.

## As seen on...

You can also see [the reddit discussion](https://www.reddit.com/r/LearnJapanese/comments/u5n2xf/learning_kanji_through_the_words_that_connect_them/) or [the discussion on tofugu](https://www.tofugu.com/japanese-learning-resources-database/japanese-graph/) (it also made it onto [their curated list for summer 2022](https://www.tofugu.com/japanese/japanese-learning-resources-summer-2022/)). It was also [recommended](https://mailchi.mp/jpf/jlearner-apr-23) by [The Japan Foundation, Sydney](https://twitter.com/JPFSydney/status/1646390081836531712).

The Chinese version was [recommended on the You Can Learn Chinese podcast](https://thechinaproject.com/podcast/the-impact-of-comprehensible-input-on-language-learning-a-deep-dive/) and on [HackingChinese](https://challenges.hackingchinese.com/resources/stories/513-hanzigraph-visual-vocabulary-relationships).

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

To run the code in this branch, you can modify the firebase-init.js file with your [own firebase project config](https://firebase.google.com/docs), run `rollup -c rollup.config.ts`, and then start the firebase emulators.

## Project Status
The webapp is still a prototype, but it is functional and can be installed as [a PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installing) or used on the web.

Upcoming work includes paying down the (rather substantial) technical debt in the code, moving to [lit](https://lit.dev), and further consolidating the supported datasets (Japanese, Mandarin (simplified and traditional), and Cantonese).

## Acknowledgements
he examples came from [Tatoeba](https://tatoeba.org), which releases data
under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr), and
from [OpenSubtitles](http://www.opensubtitles.org/), pulled from [opus.nlpl.eu](https://opus.nlpl.eu/OpenSubtitles2018.php).

Definitions were pulled from [JMDict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project); links to their license terms are available on that page.

See the [main branch README](https://github.com/mreichhoff/HanziGraph#acknowledgements) for more details.
