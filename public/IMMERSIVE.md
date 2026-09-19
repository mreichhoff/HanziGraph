# Experimental graph explorer

Build with `npm run build`, then open `/immersive.html` using the existing hosting server. This is an independent HTML page, stylesheet, and Rollup entry point; the classic UI is unchanged. Generated bundles follow the repository's existing ignored-bundle convention.

Links can specify a dataset and initial word, for example `/immersive.html?set=traditional&word=學`. Supported sets: simplified (default), traditional, Cantonese, and HSK.

## Interaction

- Search Chinese, pinyin, or English meanings from the initially loaded dictionary. Exact Chinese words can also load definitions from dictionary partitions.
- Searching a multi-character word brings its characters together and frames the whole word. The exact searched-word connection bypasses the normal sparse-edge filter, stays visible through expansion, and remains while its card is open (or until the next search for the latest word). Search cards open below the group.
- Tap characters or edges for definitions, examples, pronunciation playback, frequency/HSK level, and related characters.
- Cards open over the clicked node or edge, clamped inside the viewport. Only one card is open at a time on all screen sizes. Clicking another character or edge replaces it; clicking empty graph space or pressing Escape dismisses it. Panning and zooming keep it open. Cards keep their graph position while panning and zooming, moving with the graph (including offscreen) while their text stays the same size; close controls remain available while scrolling.
- Edges display their word labels; hover or select a character to emphasize its connections. Pan to discover connections, pinch/scroll to zoom, or drag individual nodes. The redundant graph control panel is removed; the tone legend uses the available footer width and stays on one line on small screens. Individual character cards still offer “Explore these connections”.
- The tone legend contains five color pickers, including neutral. Changes preview immediately and persist locally for this explorer; the reset arrow restores defaults. Default tones 1–4 use bright, saturated coral, green, purple, and blue with black text; neutral defaults to black in light mode and white in dark mode. Explicit custom colors remain unchanged across themes. Node text automatically uses whichever of black or white has greater contrast.
- The menu includes a locally saved pinyin toggle for both word pronunciations and example sentences in detail cards (jyutping for Cantonese). It updates the open card immediately and applies to newly loaded cards.
- The menu controls character set, tone/frequency colors, and automatic discovery after panning/zooming. `/` focuses search; Escape dismisses the card; the keyboard-accessible Visible characters menu offers a canvas alternative.

## Performance choices

The explorer indexes every Han-character neighbor in the frequency word list, retaining up to two example words per pair. Unlike the classic graph's eight-neighbor limit, continued discovery can reach less common connections. HSK uses its supplied graph. Neighbor order still favors frequent words first.

Initial graph size scales with viewport area (normally at least 24 characters, unless the seed component is smaller). A sparse tree supplies the initial fCoSE layout. Subsequent nodes use collision-aware placement biased toward empty viewport space; existing nodes stay put. Drawing uses short, non-crossing edges with a maximum degree of three, and avoids links through other nodes. Labels appear on rendered edges at readable zoom levels; hover/selection emphasizes the connections. This drawing filter does not remove dictionary connections; cards paginate all neighbors twelve at a time.

The resident render budget is 180 characters on desktop and 90 on mobile. To make room, the renderer evicts the most distant off-screen nodes, protecting characters with open cards. Positions and discovery history survive eviction, so returning to a neighborhood restores it. Each viewport gesture adds at most 24 nodes (scaled to viewport area). A pan into empty territory can seed another neighborhood using an undiscovered real neighbor, or another dictionary character when that frontier is exhausted. No artificial links connect distant islands. Zoomed-out gestures restore known nodes but do not add new ones.

The dictionary graph stays in memory; only rendering is virtualized. At very wide zoom, when all resident characters are visible, expansion pauses rather than evicting on-screen characters. Zoom in and pan to explore further. Partitioned definitions and examples load on demand through a bounded cache.

## Scope and verification

This is an exploration surface, not a replacement for all classic features. Study history, flashcards, coverage charts, AI tools, and account features remain in the classic app, linked from each detail card. Search suggestions cover the base dictionary, not the entire partitioned dictionary. Tone colors use the first pronunciation; Cantonese defaults to frequency coloring. Example data can contain numbered or accented pinyin, which is displayed as supplied.

Regression tests: `node --test scripts/tests/immersive.test.mjs` verifies full adjacency (including supplementary Han), card placement/collision avoidance, sparse edge degree/crossing limits, avoidance of links through nodes, eviction that protects visible characters and open cards, and compact searched-word placement with mandatory exact-word edges. Browser checks cover floating cards, mobile sizing, search, long-pan discovery beyond the render budget, and console errors. Build with the existing Rollup pipeline. Touch behavior should still be tried on physical devices before considering this a replacement UI.

## Japanese mode

Choose **Japanese** in the language / character set menu, or open `/immersive.html?set=japanese` (optionally `&word=学校`). This uses the same explorer, renderer budget, search connection behavior, and detail cards. Classic links point to `https://japanesegraph.com/japanese/<word>`; speech uses `ja-JP`. The canvas contains kanji only, while dictionary searches and cards may include kana-only words.

Data in `public/data/japanese/` was copied from the local `JapaneseGraph` branch at `f2f55d09b6099de8ca77bf0132663c9032e2422a`. Only the word list, base dictionary, sentence examples, supplied graph, character frequency list, and on-demand dictionary partitions were imported (about 44 MB on disk). No branch checkout or classic Japanese application code is required. The initial data is local to this host; classic links are the only dependency on the separate domain.

The word list is alphabetical, so it must not be treated as word-frequency ranks. Supplied graph word bands prioritize initial connections; the full word list supplies less common connections. Node colors use the actual character frequency list with bands of 250, 500, 1,000, 1,500, and 2,000. Japanese does not display fabricated word-frequency ranks or use Mandarin tone colors.

The dictionary has English glosses but no readings. Kana search and title furigana therefore use readings found in annotated example sentences; coverage is incomplete and this does not provide a full on/kun reading dictionary or romaji search. Hiragana and katakana queries are normalized, including half-width katakana. Ruby text preserves the supplied compound-level readings without inventing character readings from compounds. Sentence markup is built with DOM text nodes, not injected HTML; malformed annotations that don't match the sentence fall back to plain Japanese. The furigana toggle is saved separately from Chinese pinyin preferences. Japanese examples favor shorter sentences.

Run `node --test scripts/tests/immersive*.test.mjs` for shared graph/color tests and Japanese parsing, reading-index, kana-normalization, and real-data integration tests.

Speech chooses a compatible voice whose name starts with `Google` (preferring an exact locale), then Kyoko for Japanese or Tingting for Mandarin, then leaves the voice unset and supplies only the language. Cantonese never falls back to a Mandarin voice. Voice discovery is started during initialization and the list is read again for every Listen click so newly available voices can be selected.
