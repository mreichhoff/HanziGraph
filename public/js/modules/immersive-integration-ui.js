import { textForSpeech } from './immersive-speech.mjs';
import { explorerLink } from './immersive-card.mjs';
import { defaultPrompts, integrationProblem, listModels, askAi, analyzeSentence, ankiRequest, addToAnki } from './immersive-integrations.mjs';

export function initializeIntegrations(dataset, speak, renderReading) {
    const key = `immersive-integrations-${dataset}`;
    const read = name => { try { return JSON.parse(localStorage.getItem(name)) || {}; } catch { return {}; } };
    const ai = read('localAiSettings'), anki = read('ankiConnectSettings');
    let settings = {aiEnabled:false, aiEndpoint:ai.endpoint || 'http://localhost:1234/v1', aiModel:ai.model || '', prompt:'', explainPrompt:'', contextPrompt:'', examplesPrompt:'', sentencePrompt:'', ankiEnabled:false, ankiEndpoint:anki.endpoint || 'http://127.0.0.1:8765', ankiKey:anki.apiKey || '', deck:dataset === 'japanese' ? 'JapaneseGraph' : 'HanziGraph', ...read(key)};
    const el = (tag, text, cls) => { const node = document.createElement(tag); if (text) node.textContent = text; if (cls) node.className = cls; return node; };
    const button = (text, action) => { const node = el('button', text, 'integration-button'); node.type = 'button'; node.addEventListener('click', action); return node; };
    const dialog = document.createElement('dialog');
    dialog.className = 'integration-dialog';
    dialog.setAttribute('aria-labelledby', 'integration-title');
    dialog.innerHTML = `<form method="dialog" novalidate>
      <div class="integration-heading"><h2 id="integration-title">Local integrations</h2><button value="cancel" aria-label="Close integration settings">×</button></div>
      <p>Optional tools for the word or sentence you’re exploring. Changes save automatically for this language.</p>
      <fieldset><legend>Local AI</legend>
        <label class="check"><input name="aiEnabled" type="checkbox"> Enable local AI</label>
        <label>Server URL<input name="aiEndpoint" type="url" placeholder="http://localhost:1234/v1"></label>
        <label>Model<input name="aiModel" list="explorer-models" autocomplete="off"></label><datalist id="explorer-models"></datalist>
        <button type="button" data-test="ai">Connect / load models</button>
        <p>Use an OpenAI-compatible server, such as LM Studio. Allow this site’s origin in your server’s CORS settings. Examples and sentence searches require structured output support.</p>
        <details class="prompt-settings"><summary>Customize AI prompts</summary>
          <p>Saved for this language. Leave a prompt blank to use its default. In action prompts, <code>{word}</code> inserts the selected word; <code>{context}</code> inserts dictionary meanings or the example sentence.</p>
          <label>System / teacher<textarea name="prompt" rows="5"></textarea></label>
          <label>Explain a word<textarea name="explainPrompt" rows="4"></textarea></label>
          <label>Explain in a sentence<textarea name="contextPrompt" rows="4"></textarea></label>
          <label>Analyze a sentence<textarea name="sentencePrompt" rows="5"></textarea></label>
          <label>Generate examples<textarea name="examplesPrompt" rows="4"></textarea></label>
          <p>Example responses still use the structured format needed by the cards.</p>
          <button type="button" data-reset-prompts>Restore default prompts</button>
        </details>
      </fieldset>
      <fieldset><legend>Anki</legend>
        <label class="check"><input name="ankiEnabled" type="checkbox"> Enable Anki</label>
        <label>AnkiConnect URL<input name="ankiEndpoint" type="url"></label>
        <label>API key (optional)<input name="ankiKey" type="password" autocomplete="off"></label>
        <label>Deck<input name="deck" list="explorer-decks" autocomplete="off"></label><datalist id="explorer-decks"></datalist>
        <button type="button" data-test="anki">Connect / load decks</button>
        <p>Keep Anki open with AnkiConnect installed and this site allowed. Adds recognition notes using the Graph Explorer note type; a new deck is created when needed. Existing notes aren’t overwritten.</p>
      </fieldset>
      <p class="integration-status" role="status"></p>
    </form>`;
    document.body.append(dialog);
    const form = dialog.querySelector('form'), status = dialog.querySelector('[role="status"]');
    const field = name => form.elements.namedItem(name);
    const rows = new Set(), requests = new Map();
    let connectionController, saveTimer, dirty = false;
    const enabled = kind => settings[`${kind}Enabled`] && !integrationProblem(settings, kind);
    const savedMessage = () => [integrationProblem(settings, 'ai'), integrationProblem(settings, 'anki')].filter(Boolean).join(' ') || 'All changes saved.';
    function populate() {
        for (const name of Object.keys(settings)) {
            const input = field(name); if (!input) continue;
            if (input.type === 'checkbox') input.checked = settings[name]; else input.value = settings[name];
        }
        for (const [name, value] of Object.entries(defaultPrompts(dataset))) field(name).value = settings[name] || value;
        status.textContent = savedMessage();
    }
    function values() {
        const result = {...settings};
        for (const name of Object.keys(settings)) {
            const input = field(name); if (input) result[name] = input.type === 'checkbox' ? input.checked : input.value.trim();
        }
        for (const [name, value] of Object.entries(defaultPrompts(dataset))) if (result[name] === value) result[name] = '';
        return result;
    }
    function refresh() {
        for (const row of rows) {
            if (!row.isConnected) { rows.delete(row); continue; }
            (row.commandNodes || []).forEach(node => { node.hidden = node.dataset.integration === 'ai' ? !enabled('ai') : !enabled('anki'); });
        }
    }
    const open = button('', () => { populate(); document.getElementById('settings').open = false; dialog.showModal(); });
    open.className = 'menu-integration-link';
    const label = el('span'); label.append(el('strong', 'Local integrations'), el('small', 'Anki & local AI'));
    const arrow = el('span', '›', 'menu-link-arrow'); arrow.setAttribute('aria-hidden', 'true');
    open.append(label, arrow);
    document.querySelector('.menu-links').prepend(open);
    dialog.querySelector('[data-reset-prompts]').addEventListener('click', () => {
        for (const [name, value] of Object.entries(defaultPrompts(dataset))) field(name).value = value;
        dirty = true; save();
    });
    function save() {
        clearTimeout(saveTimer);
        if (!dirty) return;
        try {
            const next = values(); localStorage.setItem(key, JSON.stringify(next));
            settings = next; dirty = false; refresh(); status.textContent = savedMessage();
        } catch (error) { status.textContent = `Changes could not be saved: ${error.message}`; }
    }
    form.addEventListener('input', () => {
        dirty = true; clearTimeout(saveTimer);
        saveTimer = setTimeout(save, 400);
    });
    form.addEventListener('change', () => { dirty = true; save(); });
    window.addEventListener('pagehide', save);
    for (const kind of ['ai','anki']) {
        const control = dialog.querySelector(`[data-test="${kind}"]`);
        control.addEventListener('click', async () => {
            // Connecting is explicit; saving settings never contacts a service.
            const draft = {...settings, aiEndpoint:field('aiEndpoint').value.trim(), ankiEndpoint:field('ankiEndpoint').value.trim(), ankiKey:field('ankiKey').value};
            connectionController?.abort(); connectionController = new AbortController();
            control.disabled = true; status.textContent = 'Connecting…';
            try {
                if (kind === 'anki') {
                    const permission = await ankiRequest(draft, 'requestPermission', {}, connectionController.signal);
                    if (permission?.permission !== 'granted') throw new Error('AnkiConnect permission was not granted.');
                }
                const names = kind === 'ai' ? await listModels(draft, connectionController.signal) : await ankiRequest(draft, 'deckNames', {}, connectionController.signal);
                if (!Array.isArray(names)) throw new Error('The server returned an invalid list.');
                dialog.querySelector(kind === 'ai' ? '#explorer-models' : '#explorer-decks').replaceChildren(...names.map(name => { const option = el('option'); option.value = name; return option; }));
                if (kind === 'ai' && !field('aiModel').value && names.length) { field('aiModel').value = names[0]; dirty = true; save(); }
                status.textContent = `Connected. ${names.length} ${kind === 'ai' ? 'models' : 'decks'} available.`;
            } catch (error) { status.textContent = `Could not connect: ${error.message}`; }
            finally { control.disabled = false; }
        });
    }
    dialog.addEventListener('close', () => { save(); connectionController?.abort(); document.querySelector('#settings summary').focus(); });
    // Escape closes this modal without also closing the graph's card or focusing search.
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });

    function actions(card, entryProvider, {generate = false, toolbarHost, word = false} = {}) {
        const row = el('div', '', 'integration-actions'); rows.add(row);
        const toolbar = el('div', '', 'card-tools');
        const menu = el('details', '', 'card-more');
        const summary = el('summary', '•••'); summary.setAttribute('aria-label', generate || word ? 'Word actions' : 'Sentence actions');
        const commands = el('div', '', 'card-command-list');
        menu.append(summary, commands);
        menu.addEventListener('toggle', () => {
            if (menu.open) card.querySelectorAll('.card-more').forEach(other => { if (other !== menu) other.open = false; });
        });
        menu.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { event.stopPropagation(); menu.open = false; summary.focus(); } });
        const output = el('div', '', 'integration-output'); output.setAttribute('aria-live', 'polite');
        const run = async (control, task, success) => {
            menu.open = false; summary.focus();
            const controller = new AbortController();
            if (!requests.has(card)) requests.set(card, new Set());
            requests.get(card).add(controller);
            const controls = [...commands.querySelectorAll('[data-integration]')];
            controls.forEach(node => { node.disabled = true; });
            output.replaceChildren(); output.setAttribute('aria-busy', 'true');
            const waiting = el('div', '', 'ai-waiting');
            const pulse = el('span', '', 'waiting-pulse'); pulse.setAttribute('aria-hidden', 'true');
            const label = el('div'); label.append(el('strong', control.dataset.integration === 'ai' ? 'Asking your local model' : 'Adding to Anki'), el('small', control.dataset.integration === 'ai' ? 'You can keep exploring while it works.' : 'Saving this note to your deck.'));
            const cancel = button('Cancel', () => controller.abort()); waiting.append(pulse, label, cancel); output.append(waiting);
            output.scrollIntoView({block:'nearest'});
            try {
                const result = await task(controller.signal);
                if (!card.isConnected) return;
                output.replaceChildren(); success(result);
            } catch (error) { if (card.isConnected) { output.textContent = error.message; } }
            finally { output.removeAttribute('aria-busy'); controls.forEach(node => { node.disabled = node.dataset.added === 'true'; }); requests.get(card)?.delete(controller); }
        };
        if ('speechSynthesis' in window) {
            const listen = button('▶', () => speak(textForSpeech(entryProvider(), dataset, generate || word)));
            listen.className = 'card-listen'; listen.title = 'Listen'; listen.setAttribute('aria-label', 'Listen'); toolbar.append(listen);
        }
        const add = button('Add to Anki', () => run(add, signal => addToAnki(settings, dataset, entryProvider(), signal), () => { output.textContent = `Added to ${settings.deck}.`; add.dataset.added = 'true'; add.textContent = 'Added to Anki'; }));
        add.dataset.integration = 'anki';
        const explain = button(generate ? 'Explain this word' : 'Explain in context', () => run(explain, signal => { const entry = entryProvider(); return askAi(settings, dataset, entry.word || entry.text, entry.context || entry.english, false, signal, undefined, Boolean(entry.context)); }, text => { output.append(el('div', 'Local AI · explanation', 'ai-label'), el('p', text)); }));
        explain.dataset.integration = 'ai'; commands.append(add, explain);
        if (generate) {
            const more = button('Generate examples', () => run(more, signal => { const entry = entryProvider(); return askAi(settings, dataset, entry.text, entry.english, true, signal); }, examples => {
                output.append(el('div', 'Local AI · generated examples', 'ai-label'));
                for (const example of examples) {
                    const block = el('div', '', 'example');
                    const text = el('p', example.text, 'chinese'); text.lang = dataset === 'japanese' ? 'ja' : 'zh';
                    const reading = el('p', '', 'card-pinyin'); renderReading(reading, example.reading);
                    block.append(text, reading, el('p', example.english));
                    const entry = {text:example.text, reading:example.reading, english:example.english, source:entryProvider().source, word:entryProvider().text, context:example.text, generated:true};
                    block.append(actions(card, () => entry)); output.append(block);
                }
                refresh();
            }));
            more.dataset.integration = 'ai'; commands.append(more);
            commands.append(button('Copy link to this word', async () => {
                menu.open = false; summary.focus();
                const url = explorerLink(location.href, dataset, entryProvider().text);
                try { await navigator.clipboard.writeText(url); output.textContent = 'Link copied.'; }
                catch { const link = el('a', 'Open link to this word'); link.href = url; output.replaceChildren(el('p', 'Copy the link below to share this word.'), link); }
            }));
        }
        if (!generate) commands.append(button('Copy sentence', async () => {
            menu.open = false; summary.focus();
            try { await navigator.clipboard.writeText(entryProvider().text); output.textContent = 'Sentence copied.'; }
            catch { output.textContent = entryProvider().text; }
        }));
        toolbar.append(menu);
        (toolbarHost || row).append(toolbar); row.append(output);
        // Store menu controls with their result row, even when mounted in the header.
        row.commandNodes = [...commands.querySelectorAll('[data-integration]')];
        row.commandNodes.forEach(node => { node.hidden = node.dataset.integration === 'ai' ? !enabled('ai') : !enabled('anki'); });
        return row;
    }
    function releaseCard(card) { for (const controller of requests.get(card) || []) controller.abort(); requests.delete(card); for (const row of rows) if (card?.contains(row)) rows.delete(row); }
    return {actions, releaseCard, aiEnabled:() => enabled('ai'),
        analyze:async (card, sentence, signal) => {
            if (!enabled('ai')) throw new Error('Enable local AI in the menu to analyze sentences.');
            const controller = new AbortController();
            const abort = () => controller.abort();
            if (signal?.aborted) abort();
            signal?.addEventListener('abort', abort, {once:true});
            if (!requests.has(card)) requests.set(card, new Set());
            requests.get(card).add(controller);
            try { return await analyzeSentence(settings, dataset, sentence, controller.signal); }
            finally { signal?.removeEventListener('abort', abort); requests.get(card)?.delete(controller); }
        }
    };
}
