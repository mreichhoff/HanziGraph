# HanziGraph
A webapp meant for Chinese learners to visualize and explore word-forming relationships among Chinese characters and to see example sentences that illustrate their use. See [the prototype site](https://hanzigraph.com) to learn more.

You can also find [a discussion on reddit](https://www.reddit.com/r/ChineseLanguage/comments/tcgps5/free_tool_to_learn_hanzi_get_example_sentences/) and [on hacking Chinese](https://challenges.hackingchinese.com/resources/stories/513-hanzigraph-visual-vocabulary-relationships).

## Project Status
The webapp is still a prototype, but it is functional and can be installed as [a PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installing) or used on the web. Note that there is both [a firebase-hosted version](https://hanzigraph.com) and [a github pages site](https://mreichhoff.github.io/HanziGraph/). The latter does not allow cross-device syncing, but is otherwise equivalent. Note that [a similar project](https://mreichhoff.github.io/TrieLingual/) is available for multiple European languages, and [yet another is available for Japanese kanji](https://github.com/mreichhoff/JapaneseGraph).

## Acknowledgements
Sentence and definition data was pulled from:
* [tatoeba](https://tatoeba.org/), which releases data under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr/)
* [CEDICT](https://cc-cedict.org/editor/editor.php), which releases data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Because of sharealike, the `definitions.js` file should be considered released under that license as well.
* [OPUS](https://opus.nlpl.eu/OpenSubtitles2018.php), specifically their [OpenSubtitles](http://www.opensubtitles.org/) corpus.
