# HanziGraph

HanziGraph is a Chinese/English dictionary and study tool for Chinese language learners. It represents the Chinese language as [a graph](https://en.wikipedia.org/wiki/Graph_theory), in which individual characters are the [nodes](https://en.wikipedia.org/wiki/Vertex_(graph_theory)), and the [edges](https://en.wikipedia.org/wiki/Glossary_of_graph_theory#edge) are words. As a concrete example, `确` and `定` would each represent a node, and `确定` would be the edge that connects them.

Looking for **Japanese**? See [the JapaneseGraph branch](https://github.com/mreichhoff/HanziGraph/tree/JapaneseGraph).

### Demo




https://github.com/user-attachments/assets/3d22e3d5-0e09-4b88-9289-96e67f9d06eb





### Features

HanziGraph can also:
* Demonstrate **character composition** with tree diagrams of components and compounds
* Perform **hanzi math**, like: `酒-氵+各` (result: `酪`)
* Show **sankey diagrams** to demonstrate how words are used together
* Demonstrate usage with **example sentences** (mostly human-generated, with some AI-generated 🤖)
* Automatically generate spaced repetition **flashcards**, and track your **study stats**
* Demonstrate word coverage with **cumulative frequency graphs**
* **Tokenize** sentences into words
* **Work offline**
* Run in-browser **text-to-speech** to demonstrate pronunciation
* Be **installed** as a standalone [PWA](https://web.dev/progressive-web-apps/)
* Use **light** or **dark** themes, based on OS preferences
* **And more!**

#### Interactive Graph

The nodes and edges (more than 100,000 in all) have data associated with them.
* For hanzi (nodes), color coding based on tone.
* Usage frequency data, which can be used to color-code (red: very frequent; blue: less frequent) instead of tones. Word frequency can also be substituted with color coding by HSK level.
* Definitions, from [CEDICT](https://cc-cedict.org/editor/editor.php) (and in the case of Cantonese, [CC-CANTO](https://cantonese.org/)).
* Human-generated example sentences, sorted by average word frequency, from [tatoeba](https://tatoeba.org/).
* For words not present in tatoeba's corpus, AI-generated 🤖 examples are used instead.

#### Component Breakdowns

Each hanzi can also be diagrammed as a component tree, where each successive level of the tree is a further breakdown of its parent. Compounds using a character as a component are also listed. Colors indicate tones, and when pronunciation (pinyin initial, final, or both) is shared, the shared portion is shown on each connecting edge.

As an example, here's the breakdown for 恐 (kong3), showing how it shares its pinyin final and its tone with its component 巩.

<img width="483" alt="kong3-Components" src="https://github.com/mreichhoff/HanziGraph/assets/17800817/7c06d606-83f3-4b28-a38c-63a5520cee9a">

This can also help answer questions like "which simplified character has the largest number of transitive components?"

Answer: 蠮 (ye1)

<img width="612" alt="ye1-components" src="https://github.com/mreichhoff/HanziGraph/assets/17800817/69ea34a7-16bc-46f8-b8db-fc1ea7084d3b">

This mode is also available as [a standalone tool](https://hanzigraph.com/components).

#### Word Relationships

In addition to **character** relationships expressed through a graph structure, the tool uses [collocation](https://en.wikipedia.org/wiki/Collocation) data to show how **words** relate to one another. It expresses those relationships with [sankey diagrams](https://en.wikipedia.org/wiki/Sankey_diagram). These diagrams can also be thought of as a graph, where each node is a word and each edge is a collocation, with the edge weight representing frequency of use. One example would be `时候` commonly being preceded by `的`. In this case, `时候` and `的` are nodes, and the weight of their connecting edge represents the frequency of the collocation `的时候`.

<img width="649" alt="SankeyDiagram" src="https://github.com/mreichhoff/HanziGraph/assets/17800817/b52ad26f-1b09-4144-b1fa-1bc2423f2816">

#### Cumulative Frequency Stats

Curious how much bang-for-your-buck you're getting by learning a given word? The frequency coloring and coverage graphs can help. The coverage graphs indicate what percentage of the language you'd understand if you learned each word in order of frequency up to your search term, where very frequent words make up a disproportionate amount of the spoken language.

<img width="630" alt="StatsGraph" src="https://github.com/mreichhoff/HanziGraph/assets/17800817/6df18983-cc7d-434e-9793-9575399171b6">


#### Flashcards

Flashcards can be created from the definitions and example sentences, and either studied in the tool or exported to Anki. The flashcards test both recognition (translating from Chinese to English) and recall (translating from English to Chinese); cloze cards (fill in the blank) are also made. When a new word is being studied, it should often be studied in several contexts, so up to 10 cards are made for a single word or character.

Study stats, including how many words and characters are in your flashcards, and how many words in various frequency buckets are present, are also tracked.

https://github.com/mreichhoff/HanziGraph/assets/17800817/3947ff48-341f-4fcd-acc8-3eae8c378c6a

#### Commands

In addition to searching by Chinese, English, or Pinyin, HanziGraph can run commands.

##### Math

Ever wanted to type a character as a math equation? (ok, I'm weird)

Now you can, with addition and subtraction via the `!math` command!

Examples:

* `!math 酒-氵+各` gives `酪`
* `!math 亻+寸+广+仌+⺆` gives `腐`

(better documentation coming soon!)

##### Random Choice

Output a random word, based on word frequency, to help find new vocabulary to study.

`!random <min_freq_rank || 0> <max_freq_rank || 10,000>`

##### Query by Rank

Output the word that ranks N based on frequency.

The given `rank` argument must be greater than 0 and less than the number of known words.

`!rank <rank>`

More commands may be added in the future (e.g., `!measure <measure_word>`).

## As seen on...

You can learn more via [a discussion on reddit](https://www.reddit.com/r/ChineseLanguage/comments/tcgps5/free_tool_to_learn_hanzi_get_example_sentences/) and [on hacking Chinese](https://challenges.hackingchinese.com/resources/stories/513-hanzigraph-visual-vocabulary-relationships). 

The tool was also [recommended on the You Can Learn Chinese podcast](https://thechinaproject.com/podcast/the-impact-of-comprehensible-input-on-language-learning-a-deep-dive/). The Japanese version was [recommended by Tofugu](https://www.tofugu.com/japanese/japanese-learning-resources-summer-2022/) and [The Japan Foundation, Sydney](https://mailchi.mp/jpf/jlearner-apr-23).

## Running the code
HanziGraph is a static site hosted on firebase. By default, there's no backend whatsoever, though users can sign in and
sync their flashcards across devices (via client-side firestore integration).

To run the static site with no firebase dependencies, one can switch `USE_FIREBASE` to `false` in main.js, then:

```
npm install && npm run build
cd public
python3 -m http.server
```

To run the firebase version locally, one could set up one's own Firebase project via [their quickstart guide](https://firebase.google.com/docs/hosting/quickstart), replace the firebase initialization code, and then use `firebase emulators:start`.

Better build automation is coming soon, which will allow simpler firebase disablement and easier config substitution.

Note that some of the larger data files are partitioned to avoid excessive memory use or network bandwidth (while also avoiding huge numbers of files).

## Code Deployment
* Any pull request will deploy the proposed code change to a preview URL automatically, allowing manual testing.
* Merges to the main branch are deployed to production automatically.
* Additional deployment automation, particularly with end-to-end testing, is a future work item.

## Project Status
The webapp is still a prototype, but it is functional and can be installed as [a PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installing) or used on the web.

Note that consolidation of the code for the various datasets (Mandarin, Cantonese, Japanese) is ongoing. Upcoming changes will also begin use of [lit](https://lit.dev) and pay down technical debt (there's uh...there's *a lot* of technical debt).

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

