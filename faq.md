# Hanzi Graph FAQ
This site is a prototype, but it's decently usable in its current state. Feel free to see the (currently at a hackathon level of quality) [code](https://github.com/mreichhoff/HanziGraph) or contact [the author on github](https://github.com/mreichhoff).

The idea is to emphasize the connections among hanzi to help learners remember them. I've found this more fun and effective than other methods, like studying stroke order, writing each character out 100 times, or doing spaced repetition on cards mapping hanzi to pinyin and English.

## General
* Where did the examples come from?
  * The examples came from [Tatoeba](https://tatoeba.org), which releases data under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr), and from [OpenSubtitles](http://www.opensubtitles.org/), pulled from [opus.nlpl.eu](https://opus.nlpl.eu/OpenSubtitles2018.php). 
  * Definitions and pinyin transcriptions of individual words were pulled from [CEDICT](https://cc-cedict.org/editor/editor.php), which releases data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Explore Mode
* Why doesn't this look good on my smartphone?
  * Making it look better is in my TODO list.
* What if two hanzi can be connected more than one way, like 故事 and 事故?
  * Clicking the edge that connects them will show examples for both words.
* Which characters are present in the graph?
  * All of the HSK 1-6 characters should be present, and most have examples. [Ping on github](https://github.com/mreichhoff/HanziGraph/issues/new/choose) with any issues. Future updates may add the newer HSK characters.

## Study Mode
* How does this work?
  * When you add words to your study list, they will be presented to you as flashcards. You'll be shown the sentence and asked what it means; click "Show Answer" to see how tatoeba translated it. When you click "I didn't know that", the card will be added back to the end of your to-study list. When you click "I knew that!", it will be shown one day later, then two days if you get it right again, then four, and so on. It is meant to be a very, very basic [spaced repetition system](https://en.wikipedia.org/wiki/Spaced_repetition).
* What does the export button do?
  * The export button downloads a file that can be imported into a different (better) spaced repetition system, like Anki.
* What happens when I click a hanzi in study mode?
  * The graph will be updated to show the hanzi you clicked and its connections. The explore panel is also updated. 
* What happens when I click an edge in study mode?
  * If you click an edge, the examples are updated and you'll be brought back to the explore tab.
* Where are the flashcards stored?
  * When you are not signed in: all data for the site is stored in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). It does not leave your browser, and clearing your browser data will clear it.
  * When you are signed in: the data is stored on our backend, and should be present and up-to-date on any device. If you add flashcards while signed out, then sign in or register later, the two lists will be merged, so you shouldn't lose anything.