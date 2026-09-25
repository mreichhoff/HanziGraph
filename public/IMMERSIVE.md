# Experimental graph explorer

Build with `npm run build`, then open `/explorer/` using the existing hosting server. This is an independent HTML page (`public/explorer/index.html`), stylesheet, and Rollup entry point; the classic UI is unchanged. Generated bundles follow the repository's existing ignored-bundle convention.

Links can specify a dataset and initial word, for example `/explorer/?set=traditional&word=學`. Supported sets: simplified (default), traditional, Cantonese, and Japanese. Legacy `set=hsk` explorer URLs fall back to simplified Chinese.

## Installable app

The explorer installs as its own app, separate from classic HanziGraph: `public/explorer/manifest.json` (start URL `/explorer/?set=japanese`, scope `/explorer/`) and its own worker, `public/explorer/sw.js`. Because the worker script sits in `/explorer/`, browsers confine it to that path: it never controls a classic page, and it only deletes caches named `explorer-*`. A `firebase.json` rewrite sends other `/explorer/…` paths here rather than to classic.

Pages load network-first, falling back to the saved copy offline or after 4 seconds on a stalled connection, so a deploy shows on the next launch. Code and data answer from the cache and refresh in the background; a new `?v=` build replaces the old entry. On localhost everything is network-first. Bump `cacheName` in `sw.js` only when the caching scheme itself changes. Offline use covers whatever has been opened online.

Classic's `/asset-service-worker.js` is untouched, which has two harmless side effects. Whenever classic's worker installs or updates, it deletes every cache but its own, including the explorer's; that refills on the next online launch. And in a browser that already has classic's worker, the explorer's very first load goes through it, so classic's cache keeps a copy of those files; the explorer's worker handles every load after that.

## Interaction

- Search Chinese, pinyin, or English meanings from the initially loaded dictionary. Exact Chinese words can also load definitions from dictionary partitions.
- Searching a multi-character word brings its characters together and frames the whole word. The exact searched-word connection bypasses the normal sparse-edge filter, stays visible through expansion, and remains while its card is open (or until the next search for the latest word). Search cards open below the group.
- Tap characters or edges for definitions, examples, pronunciation playback, word frequency, and related characters.
- Cards open beside the clicked node or edge, keeping the source and edge endpoints visible. When adjacent space is insufficient, the card sits below a reserved context area and the graph is reframed into it; unusually large selections can zoom out to fit. Only one card is open at a time on all screen sizes. Clicking another character or edge replaces it; clicking empty graph space or pressing Escape dismisses it. Panning and zooming keep it open. Cards keep their graph position while panning and zooming, moving with the graph (including offscreen) while their text stays the same size; close controls remain available while scrolling.
- Edges display their word labels; hover or select a character to emphasize its connections. Pan to discover connections, pinch/scroll to zoom, or drag individual nodes. The redundant graph control panel is removed; the tone legend uses the available footer width and stays on one line on small screens. Individual character cards still offer “Explore these connections”.
- The tone legend contains five color pickers, including neutral. Changes preview immediately and persist locally for this explorer; the reset arrow restores defaults. Default tones 1–4 use bright, saturated coral, green, purple, and blue with black text; neutral defaults to black in light mode and white in dark mode. Explicit custom colors remain unchanged across themes. Node text automatically uses whichever of black or white has greater contrast.
- The menu includes a locally saved pinyin toggle for both word pronunciations and example sentences in detail cards (jyutping for Cantonese). It updates the open card immediately and applies to newly loaded cards.
- The menu controls character set, tone/frequency colors, and automatic discovery after panning/zooming. `/` focuses search; Escape dismisses the card; the keyboard-accessible Visible characters menu offers a canvas alternative.

## Performance choices

The explorer indexes every Han-character neighbor in the frequency word list, retaining up to two example words per pair. Unlike the classic graph's eight-neighbor limit, continued discovery can reach less common connections. Neighbor order still favors frequent words first.

Initial graph size scales with viewport area (normally at least 24 characters, unless the seed component is smaller). A sparse tree supplies the initial fCoSE layout. Subsequent nodes use collision-aware placement biased toward empty viewport space; existing nodes stay put. Drawing uses short, non-crossing edges with a maximum degree of three, and avoids links through other nodes. Labels appear on rendered edges at readable zoom levels; hover/selection emphasizes the connections. This drawing filter does not remove dictionary connections; cards paginate all neighbors twelve at a time.

The resident render budget is 180 characters on desktop and 90 on mobile. To make room, the renderer evicts the most distant off-screen nodes, protecting characters with open cards. Positions and discovery history survive eviction, so returning to a neighborhood restores it. Each viewport gesture adds at most 24 nodes (scaled to viewport area). A pan into empty territory can seed another neighborhood using an undiscovered real neighbor, or another dictionary character when that frontier is exhausted. No artificial links connect distant islands. Zoomed-out gestures restore known nodes but do not add new ones.

The dictionary graph stays in memory; only rendering is virtualized. At very wide zoom, when all resident characters are visible, expansion pauses rather than evicting on-screen characters. Zoom in and pan to explore further. Partitioned definitions and examples load on demand through a bounded cache.

## Scope and verification

This is an exploration surface, not a replacement for all classic features. Study history, flashcards, coverage charts, AI tools, and account features remain in the classic app, linked from each detail card. Search suggestions cover the base dictionary, not the entire partitioned dictionary. Tone colors use the first pronunciation; Cantonese defaults to frequency coloring. Example data can contain numbered or accented pinyin, which is displayed as supplied.

Regression tests: `node --test scripts/tests/immersive.test.mjs` verifies full adjacency (including supplementary Han), card placement/collision avoidance, sparse edge degree/crossing limits, avoidance of links through nodes, eviction that protects visible characters and open cards, and compact searched-word placement with mandatory exact-word edges. Browser checks cover floating cards, mobile sizing, search, long-pan discovery beyond the render budget, and console errors. Build with the existing Rollup pipeline. Touch behavior should still be tried on physical devices before considering this a replacement UI.

## Japanese mode

Choose **Japanese** in the language / character set menu, or open `/explorer/?set=japanese` (optionally `&word=学校`). This uses the same explorer, renderer budget, search connection behavior, and detail cards. Classic links point to `https://japanesegraph.com/japanese/<word>`; speech uses `ja-JP`. The canvas contains kanji only, while dictionary searches and cards may include kana-only words.

Data in `public/data/japanese/` was copied from the local `JapaneseGraph` branch at `f2f55d09b6099de8ca77bf0132663c9032e2422a`. Only the word list, base dictionary, sentence examples, supplied graph, character frequency list, and on-demand dictionary partitions were imported (about 44 MB on disk). No branch checkout or classic Japanese application code is required. The initial data is local to this host; classic links are the only dependency on the separate domain.

The word list is alphabetical, so it must not be treated as word-frequency ranks. Supplied graph word bands prioritize initial connections; the full word list supplies less common connections. Node colors use the actual character frequency list with bands of 250, 500, 1,000, 1,500, and 2,000. Japanese does not display fabricated word-frequency ranks or use Mandarin tone colors.

The dictionary has English glosses but no readings. Kana search and title furigana therefore use readings found in annotated example sentences; coverage is incomplete and this does not provide a full on/kun reading dictionary or romaji search. Hiragana and katakana queries are normalized, including half-width katakana. Ruby text preserves the supplied compound-level readings without inventing character readings from compounds. Sentence markup is built with DOM text nodes, not injected HTML; malformed annotations that don't match the sentence fall back to plain Japanese. The furigana toggle is saved separately from Chinese pinyin preferences. Japanese examples favor shorter sentences.

Run `node --test scripts/tests/immersive*.test.mjs` for shared graph/color tests and Japanese parsing, reading-index, kana-normalization, and real-data integration tests.

Speech chooses a compatible voice whose name starts with `Google` (preferring an exact locale), then Kyoko for Japanese or Tingting for Mandarin, then leaves the voice unset and supplies only the language. Cantonese never falls back to a Mandarin voice. Voice discovery is started during initialization and the list is read again for every Listen click so newly available voices can be selected.

## Optional local integrations

The menu's **Local integrations** dialog configures an OpenAI-compatible local AI endpoint/model and AnkiConnect endpoint/key/deck. Each dataset has its own `immersive-integrations-<dataset>` settings, deck and optional teacher prompt. Initial endpoint/model values can come from classic settings on the same origin, but integrations remain disabled until explicitly enabled here. Classic settings and study history are not modified. These clients follow the classic modules' protocols without importing their Chinese-only response schemas, DOM settings, or bulk-sync behavior.

When enabled, word cards offer Add to Anki, Explain and More examples. Sentence examples offer Add to Anki and an explanation of the selected word in that sentence. Generated examples are labeled and can be listened to or individually exported. AI defaults distinguish beginner Japanese with kana readings, simplified/traditional Mandarin with pinyin, and Cantonese with jyutping. Generated Japanese readings are shown as a separate line rather than guessed ruby alignment. The existing reading visibility toggle applies to those lines. Responses are rendered as text, never model-supplied HTML. Requests time out after 90 seconds, can be cancelled, and are aborted when their card closes.

Anki exports individual recognition notes with Text, Reading, Meaning, Source and Language fields in a dedicated **Graph Explorer** model. The configured deck and model are created as needed only when Add to Anki is clicked. Existing models are checked for compatible fields; duplicates are reported rather than overwriting existing notes. Dictionary and model text is HTML-escaped before exporting. AI-generated notes receive an additional tag. There is no review queue or automatic/bulk synchronization.

Keep the relevant local applications running and permit this site's origin in their CORS settings. Connect / load decks uses AnkiConnect's permission flow. For local development, serve this explorer on a port other than 8765 when AnkiConnect uses its default port 8765. `localhost` on a phone refers to the phone, not the desktop running Anki or the AI server; a reachable configured server is needed there. Hosted HTTPS/browser local-network restrictions depend on the browser and server configuration.

Tests use mocked protocol responses and never write to a real Anki collection or require a model server. Live voice/model quality and local server permissions need testing with the user's configured services.

**Customize AI prompts** expands editors for the system/teacher prompt, word explanation, sentence-context explanation, and example generation. Defaults are shown as editable text; blank fields use defaults, and Restore default prompts resets the draft until saved. Action templates support `{word}` and `{context}` (dictionary meanings or sentence text), inserted as quoted values in a single substitution pass. Generated examples retain their required JSON response schema independently of the configurable prompt.

Detail cards use a compact header with one-tap audio and a three-dot action disclosure. Anki and AI commands appear there when enabled; word links preserve the explorer dataset and searched word. Sentence actions include copying the sentence. Mandarin readings use the same customizable tone colors as the graph, preserving the original numbered/accented text; Japanese keeps ruby and Cantonese keeps jyutping. Mixed-tone accented strings without syllable boundaries are left uncolored rather than assigning one misleading tone. Local requests show a cancellable status panel with reduced-motion support.

Frequency colors use six discrete warm-to-cool defaults: coral red for common characters through rose/lavender to blue for less common characters. Every frequency swatch is editable, saved under `immersive-frequency-colors` independently of tone preferences, and shared across explorer languages. Reset appears only for a non-default palette. Text contrast updates automatically. On phones frequency labels sit under their swatches to keep all six bands and Reset on one row.

## Sentence exploration and kana vocabulary

Exact Japanese kana vocabulary opens a centered detail card without moving the
graph. The supplemental JMdict index recognizes kana-only entries and common or
usually-kana spellings; readings and definitions load from `lexicon/0..99.json`
on demand. Rebuild with `python3 scripts/build-explorer-japanese.py`; source and
license notes are in `data/japanese/lexicon/README.md`.

When local AI is enabled, native-language searches that are not dictionary words
open a centered sentence card (up to 1,000 characters). Local `Intl.Segmenter`
selects the first graph-bearing word to focus, without expanding the entire
sentence. English meanings and romanized readings retain dictionary search.
The model returns translation, reading, explanation and clickable word tokens.
Japanese tokens use ruby readings; Mandarin uses tone-colored pinyin; Cantonese
uses jyutping. Clicking a word keeps the sentence and adds an inline inspector
with its contextual meaning/grammar and dictionary lookup of its lemma. Dictionary
meanings expand separately. AI annotations are labeled as such.

Sentence analysis uses OpenAI-compatible strict JSON-schema output. Tokens must
concatenate to exactly the original input; malformed or rewritten responses show
an error with Retry. Cancel, closing the card, and replacing it abort requests.
The sentence prompt is configurable alongside the other local AI prompts.
Tests inject model responses; actual analysis quality depends on the user's model.

## Japanese vocabulary quality pass

`explorer-word-order.json` contains every word in the original Japanese graph list,
reordered using direct wordfreq 3.1.1 Japanese vocabulary frequencies, JMdict
commonness, and modern spelling tags. Missing corpus entries use commonness as a
fallback, not a fabricated frequency rank. Rare/outdated/search-only/irregular
spellings and expressions longer than six code points do not create automatic
edges. Their characters remain in the graph index, and explicit searches still
force the requested connection. Searching a Han character missing from the graph
adds it on demand; there is no jōyō cutoff.

`explorer-index.json` supplies stable dictionary readings for base search entries,
search tie-breaking order, usually-kana flags, and automatic-edge exclusions.
Example sentences are fetched on the first Japanese card, independently of graph
startup. All languages' stored example tokens support inline dictionary lookup
without AI; Japanese token boundaries that bisect ruby annotations are merged.
Unrecognized inflected surface forms report a missing exact entry rather than
inventing a lemma. Local AI remains available for contextual explanations.

`kanji.json` is fetched on demand for kanji cards: meanings, on/kun with kana-ending
boundaries, strokes, elementary-school grade, and up to eight ranked single-kanji
words with kana. Character colors use KANJIDIC2 newspaper ranks via the small generated
`explorer-character-ranks.json`, independently of wordfreq vocabulary ordering.
Fixed bands are 50/150/400/800/1500/beyond, with gray for unranked kanji.
Panning never changes a character’s band. Isolated nodes remain searchable and
available to discovery. Edge selection blends distance with a bounded 80px
logarithmic penalty based on the best word’s position in vocabulary ordering;
hard geometry constraints and explicit-search overrides remain in effect.

Rebuild with Python in an isolated environment containing `wordfreq==3.1.1`:
`python scripts/build-explorer-japanese-study.py`. Inputs are the existing JMdict
JSON and `raw/japanese/kanjidic2.xml.gz`, downloaded from
https://www.edrdg.org/kanjidic/kanjidic2.xml.gz (2026-09-20 for this build).
The source dump is ignored by Git; generated outputs are checked in. Refresh the
source dictionaries before rebuilding. See `data/japanese/explorer-sources.html`
for credits and the CC BY-SA 4.0 terms applying to the derived data.
