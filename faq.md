# Hanzi Graph FAQ
This site is a prototype, but it's decently usable in its current state. Feel free to see the (currently at a hackathon level of quality) [code](https://github.com/mreichhoff/HanziGraph) or contact [the author on github](https://github.com/mreichhoff).

## General
* Where did the examples come from?
  * The examples came from [Tatoeba](https://tatoeba.org), which releases data under [CC-BY 2.0 FR](https://creativecommons.org/licenses/by/2.0/fr). 
  * Definitions and pinyin transcriptions of individual words were pulled from [CEDICT](https://cc-cedict.org/editor/editor.php), which releases data under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

## Explore Mode
* Why doesn't this look good on my smartphone?
  * The site is currently meant to be viewed on larger screens. 
* What if two hanzi can be connected more than one way, like 故事 and 事故?
  * Clicking the edge that connects them will show examples for both words.

## Study Mode
* How does this work?
  * When you add words to your study list, they will be presented to you as flashcards. You'll be shown the sentence and asked what it means; click "Show Answer" to see how tatoeba translated it. When you click "I didn't know that", the card will be asked again in 15 minutes. When you click "I knew that!", it will be shown one day later, then two days if you get it right again, then four, and so on. It is meant to be a very, very basic [spaced repetition system](https://en.wikipedia.org/wiki/Spaced_repetition).
* What does the export button do?
  * The export button downloads a file that can be imported into a different (better) spaced repetition system, like Anki.
* What happens when I click a hanzi in study mode?
  * The graph will be updated to show the hanzi you clicked and its connections. The explore panel is also updated. 
* What happens when I click an edge in study mode?
  * If you click an edge, the examples are updated and you'll be brought back to the explore tab.
* Where are the flashcards stored?
  * All data for the site is currently stored in [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage). It does not leave your browser, and clearing your browser data will clear it. A future version could add cross-device syncing.