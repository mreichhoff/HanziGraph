import { defaultPrompts, listModels, askAi, ankiRequest, addToAnki } from './immersive-integrations.mjs';

export function initializeIntegrations(dataset, speak) {
    const key = `immersive-integrations-${dataset}`;
    const read = name => { try { return JSON.parse(localStorage.getItem(name)) || {}; } catch { return {}; } };
    const ai = read('localAiSettings'), anki = read('ankiConnectSettings');
    let settings = {aiEnabled:false, aiEndpoint:ai.endpoint || 'http://localhost:1234/v1', aiModel:ai.model || '', prompt:'', explainPrompt:'', contextPrompt:'', examplesPrompt:'', ankiEnabled:false, ankiEndpoint:anki.endpoint || 'http://127.0.0.1:8765', ankiKey:anki.apiKey || '', deck:dataset === 'japanese' ? 'JapaneseGraph' : 'HanziGraph', ...read(key)};
    const el = (tag, text, cls) => { const node = document.createElement(tag); if (text) node.textContent = text; if (cls) node.className = cls; return node; };
    const button = (text, action) => { const node = el('button', text, 'integration-button'); node.type = 'button'; node.addEventListener('click', action); return node; };
    const dialog = document.createElement('dialog');
    dialog.className = 'integration-dialog';
    dialog.setAttribute('aria-labelledby', 'integration-title');
    dialog.innerHTML = `<form method="dialog" novalidate>
      <div class="integration-heading"><h2 id="integration-title">Local integrations</h2><button value="cancel" aria-label="Close integration settings">×</button></div>
      <p>Optional tools for the word or sentence you’re exploring. Settings are saved for this language.</p>
      <fieldset><legend>Local AI</legend>
        <label class="check"><input name="aiEnabled" type="checkbox"> Enable local AI</label>
        <label>Server URL<input name="aiEndpoint" type="url" placeholder="http://localhost:1234/v1"></label>
        <label>Model<input name="aiModel" list="explorer-models" autocomplete="off"></label><datalist id="explorer-models"></datalist>
        <button type="button" data-test="ai">Connect / load models</button>
        <p>Use an OpenAI-compatible server, such as LM Studio. Allow this site’s origin in your server’s CORS settings. Examples require structured output support.</p>
        <details class="prompt-settings"><summary>Customize AI prompts</summary>
          <p>Saved for this language. Leave a prompt blank to use its default. In action prompts, <code>{word}</code> inserts the selected word; <code>{context}</code> inserts dictionary meanings or the example sentence.</p>
          <label>System / teacher<textarea name="prompt" rows="5"></textarea></label>
          <label>Explain a word<textarea name="explainPrompt" rows="4"></textarea></label>
          <label>Explain in a sentence<textarea name="contextPrompt" rows="4"></textarea></label>
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
      <button type="button" data-save>Save settings</button>
    </form>`;
    document.body.append(dialog);
    const form = dialog.querySelector('form'), status = dialog.querySelector('[role="status"]');
    const field = name => form.elements.namedItem(name);
    const rows = new Set(), requests = new Map();
    let connectionController;
    function populate() {
        for (const name of Object.keys(settings)) {
            const input = field(name); if (!input) continue;
            if (input.type === 'checkbox') input.checked = settings[name]; else input.value = settings[name];
        }
        for (const [name, value] of Object.entries(defaultPrompts(dataset))) field(name).value = settings[name] || value;
        status.textContent = '';
    }
    function values() {
        const result = {...settings};
        for (const name of Object.keys(settings)) {
            const input = field(name); if (input) result[name] = input.type === 'checkbox' ? input.checked : input.value.trim();
        }
        for (const name of ['aiEndpoint','ankiEndpoint']) {
            let url; try { url = new URL(result[name]); } catch { throw new Error('Enter a valid server URL.'); }
            if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use an HTTP or HTTPS server URL without embedded credentials.');
        }
        if (result.aiEnabled && !result.aiModel) throw new Error('Select or enter an AI model.');
        if (result.ankiEnabled && !result.deck) throw new Error('Enter an Anki deck name.');
        for (const [name, value] of Object.entries(defaultPrompts(dataset))) if (result[name] === value) result[name] = '';
        return result;
    }
    function refresh() {
        for (const row of rows) {
            if (!row.isConnected) { rows.delete(row); continue; }
            row.querySelectorAll('[data-integration]').forEach(node => { node.hidden = node.dataset.integration === 'ai' ? !settings.aiEnabled : !settings.ankiEnabled; });
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
        status.textContent = 'Default prompts restored. Save settings to apply.';
    });
    dialog.querySelector('[data-save]').addEventListener('click', () => {
        try { const next = values(); localStorage.setItem(key, JSON.stringify(next)); settings = next; refresh(); dialog.close(); }
        catch (error) { status.textContent = error.message; }
    });
    for (const kind of ['ai','anki']) {
        const control = dialog.querySelector(`[data-test="${kind}"]`);
        control.addEventListener('click', async () => {
            // Testing a connection does not enable an integration or write settings.
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
                if (kind === 'ai' && !field('aiModel').value && names.length) field('aiModel').value = names[0];
                status.textContent = `Connected. ${names.length} ${kind === 'ai' ? 'models' : 'decks'} available.`;
            } catch (error) { status.textContent = `Could not connect: ${error.message}`; }
            finally { control.disabled = false; }
        });
    }
    dialog.addEventListener('close', () => { connectionController?.abort(); document.querySelector('#settings summary').focus(); });
    // Escape closes this modal without also closing the graph's card or focusing search.
    dialog.addEventListener('keydown', event => { if (event.key === 'Escape') event.stopPropagation(); });

    function actions(card, entryProvider, {generate = false} = {}) {
        const row = el('div', '', 'integration-actions'); rows.add(row);
        const output = el('div', '', 'integration-output'); output.setAttribute('aria-live', 'polite');
        const run = async (control, task, success) => {
            const controller = new AbortController();
            if (!requests.has(card)) requests.set(card, new Set());
            requests.get(card).add(controller);
            const controls = [...row.children].filter(node => node.dataset.integration);
            controls.forEach(node => { node.disabled = true; }); output.textContent = 'Working…';
            const cancel = button('Cancel', () => controller.abort()); output.append(cancel);
            try {
                const result = await task(controller.signal);
                if (!card.isConnected) return;
                output.replaceChildren(); success(result);
            } catch (error) { if (card.isConnected) output.textContent = error.message; }
            finally { controls.forEach(node => { node.disabled = node.dataset.added === 'true'; }); requests.get(card)?.delete(controller); }
        };
        const add = button('Add to Anki', () => run(add, signal => addToAnki(settings, dataset, entryProvider(), signal), () => { output.textContent = `Added to ${settings.deck}.`; add.dataset.added = 'true'; add.disabled = true; add.textContent = 'Added to Anki'; }));
        add.dataset.integration = 'anki';
        const explain = button('Explain', () => run(explain, signal => { const entry = entryProvider(); return askAi(settings, dataset, entry.word || entry.text, entry.context || entry.english, false, signal, undefined, Boolean(entry.context)); }, text => { output.append(el('div', 'Local AI · explanation', 'ai-label'), el('p', text)); }));
        explain.dataset.integration = 'ai';
        row.append(add, explain);
        if (generate) {
            const more = button('More examples', () => run(more, signal => { const entry = entryProvider(); return askAi(settings, dataset, entry.text, entry.english, true, signal); }, examples => {
                output.append(el('div', 'Local AI · generated examples', 'ai-label'));
                for (const example of examples) {
                    const block = el('div', '', 'example');
                    const text = el('p', example.text, 'chinese'); text.lang = dataset === 'japanese' ? 'ja' : 'zh';
                    block.append(text, el('p', example.reading, 'card-pinyin'), el('p', example.english), button('Listen', () => speak(example.text)));
                    const entry = {text:example.text, reading:example.reading, english:example.english, source:entryProvider().source, word:entryProvider().text, context:example.text, generated:true};
                    block.append(actions(card, () => entry)); output.append(block);
                }
                refresh();
            }));
            more.dataset.integration = 'ai'; row.append(more);
        }
        row.append(output);
        row.querySelectorAll('[data-integration]').forEach(node => { node.hidden = node.dataset.integration === 'ai' ? !settings.aiEnabled : !settings.ankiEnabled; });
        return row;
    }
    function releaseCard(card) { for (const controller of requests.get(card) || []) controller.abort(); requests.delete(card); for (const row of rows) if (card?.contains(row)) rows.delete(row); }
    return {actions, releaseCard};
}
