// A module for integrating with local Anki via Anki-Connect plugin
// See: https://git.sr.ht/~foosoft/anki-connect

const SETTINGS_KEY = 'ankiConnectSettings';
const ANKI_CONNECT_VERSION = 6;

// Default settings
const defaultSettings = {
    enabled: false,
    endpoint: 'http://127.0.0.1:8765',
    deckName: 'HanziGraph',
    modelName: 'HanziGraph Basic',
    apiKey: '' // Optional, only if user has configured authentication
};

let settings = loadSettings();

function loadSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        try {
            return { ...defaultSettings, ...JSON.parse(stored) };
        } catch (e) {
            console.error('Failed to parse Anki Connect settings:', e);
        }
    }
    return { ...defaultSettings };
}

function saveSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.dispatchEvent(new CustomEvent('anki-settings-changed', { detail: settings }));
}

function getSettings() {
    return { ...settings };
}

function isAnkiEnabled() {
    return settings.enabled && settings.endpoint && settings.deckName && settings.modelName;
}

async function invoke(action, params = {}) {
    const request = {
        action,
        version: ANKI_CONNECT_VERSION,
        params
    };

    if (settings.apiKey) {
        request.key = settings.apiKey;
    }

    const response = await fetch(settings.endpoint, {
        method: 'POST',
        body: JSON.stringify(request)
    });

    const data = await response.json();

    if (Object.keys(data).length !== 2) {
        throw new Error('Response has an unexpected number of fields');
    }
    if (!('error' in data)) {
        throw new Error('Response is missing required error field');
    }
    if (!('result' in data)) {
        throw new Error('Response is missing required result field');
    }
    if (data.error) {
        throw new Error(data.error);
    }

    return data.result;
}

async function testConnection() {
    try {
        const result = await invoke('requestPermission');
        if (result.permission === 'granted') {
            return {
                success: true,
                version: result.version,
                requireApiKey: result.requireApiKey
            };
        } else {
            return { success: false, error: 'Permission denied by Anki' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getDecks() {
    return await invoke('deckNames');
}

async function createDeck(deckName) {
    return await invoke('createDeck', { deck: deckName });
}

async function ensureDeckExists() {
    const decks = await getDecks();
    if (!decks.includes(settings.deckName)) {
        await createDeck(settings.deckName);
    }
}

// Model (note type...not to be confused with AI models or something) operations
async function getModels() {
    return await invoke('modelNames');
}

// Create the custom HanziGraph note model if it doesn't exist
async function ensureModelExists() {
    const models = await getModels();
    if (!models.includes(settings.modelName)) {
        await invoke('createModel', {
            modelName: settings.modelName,
            inOrderFields: ['Chinese', 'Pinyin', 'English', 'VocabOrigin', 'Language', 'Added'],
            css: `.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
}
.chinese {
  font-size: 32px;
  margin-bottom: 10px;
}
.pinyin {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}
.english {
  font-size: 18px;
}`,
            cardTemplates: [
                {
                    Name: 'Recognition',
                    Front: '<div class="chinese">{{Chinese}}</div>',
                    Back: `{{FrontSide}}
<hr id="answer">
<div class="pinyin">{{Pinyin}}</div>
<div class="english">{{English}}</div>`
                }
            ]
        });
    }
}

// Convert HanziGraph card format to Anki note format
function cardToAnkiNote(card, key) {
    const chineseText = Array.isArray(card.zh) ? card.zh.join('') : card.zh;
    const pinyin = card.pinyin || '';

    return {
        deckName: settings.deckName,
        modelName: settings.modelName,
        fields: {
            Chinese: chineseText,
            Pinyin: pinyin,
            English: card.en || '',
            VocabOrigin: card.vocabOrigin || '',
            Language: card.language || 'zh-CN',
            Added: card.added ? new Date(card.added).toISOString() : new Date().toISOString()
        },
        tags: ['hanzigraph', card.vocabOrigin || ''].filter(Boolean),
        options: {
            allowDuplicate: false,
            duplicateScope: 'deck'
        }
    };
}

// Convert Anki note to HanziGraph card format
function ankiNoteToCard(noteInfo) {
    const fields = noteInfo.fields;
    const chineseText = fields.Chinese?.value || '';

    // Tokenize Chinese text into array (simple character split for now)
    // In practice, the actual tokenization happens elsewhere in HanziGraph
    const zh = chineseText.split('');

    return {
        zh: zh,
        en: fields.English?.value || '',
        pinyin: fields.Pinyin?.value || '',
        vocabOrigin: fields.VocabOrigin?.value || '',
        language: fields.Language?.value || 'zh-CN',
        added: fields.Added?.value ? new Date(fields.Added.value).getTime() : Date.now(),
        // Anki-specific fields for sync
        ankiNoteId: noteInfo.noteId,
        // We don't have exact SM2 data from Anki, but we can estimate
        // These will be updated from Anki's card info if available
        streak: 0,
        ease: 2.5,
        interval: 0,
        lastReviewTimestamp: Date.now(),
        wrongCount: 0,
        rightCount: 0,
        type: 'recognition'
    };
}

async function addNote(card, key) {
    await ensureDeckExists();
    await ensureModelExists();

    const note = cardToAnkiNote(card, key);
    try {
        const noteId = await invoke('addNote', { note });
        return noteId;
    } catch (error) {
        // If it's a duplicate error, try to find the existing note
        if (error.message.includes('duplicate')) {
            const existingNotes = await findNotes(card);
            if (existingNotes.length > 0) {
                return existingNotes[0];
            }
        }
        throw error;
    }
}

async function updateNote(noteId, card) {
    const chineseText = Array.isArray(card.zh) ? card.zh.join('') : card.zh;

    await invoke('updateNoteFields', {
        note: {
            id: noteId,
            fields: {
                Chinese: chineseText,
                Pinyin: card.pinyin || '',
                English: card.en || '',
                VocabOrigin: card.vocabOrigin || '',
                Language: card.language || 'zh-CN'
            }
        }
    });
}

async function deleteNote(noteId) {
    await invoke('deleteNotes', { notes: [noteId] });
}

async function findNotes(card) {
    const chineseText = Array.isArray(card.zh) ? card.zh.join('') : card.zh;
    const query = `deck:"${settings.deckName}" Chinese:"${chineseText}"`;
    return await invoke('findNotes', { query });
}

async function findAllHanziGraphNotes() {
    const query = `deck:"${settings.deckName}"`;
    return await invoke('findNotes', { query });
}

async function getNotesInfo(noteIds) {
    return await invoke('notesInfo', { notes: noteIds });
}

// Get all cards from Anki and convert to HanziGraph format
async function getAllCards() {
    try {
        const noteIds = await findAllHanziGraphNotes();
        if (noteIds.length === 0) {
            return {};
        }

        const notesInfo = await getNotesInfo(noteIds);
        const studyList = {};

        for (const noteInfo of notesInfo) {
            const card = ankiNoteToCard(noteInfo);
            const key = Array.isArray(card.zh) ? card.zh.join('') : card.zh;
            studyList[key] = card;
        }

        return studyList;
    } catch (error) {
        console.error('Failed to fetch cards from Anki:', error);
        return {};
    }
}

// Sync a single card to Anki (add or update)
async function syncCard(key, card) {
    if (!isAnkiEnabled()) {
        return { noteId: null, added: false, updated: false };
    }

    try {
        const existingNotes = await findNotes(card);
        if (existingNotes.length > 0) {
            // Update existing note
            await updateNote(existingNotes[0], card);
            return { noteId: existingNotes[0], added: false, updated: true };
        } else {
            // Add new note
            const noteId = await addNote(card, key);
            return { noteId, added: true, updated: false };
        }
    } catch (error) {
        console.error('Failed to sync card to Anki:', error);
        throw error;
    }
}

async function removeCard(card) {
    if (!isAnkiEnabled()) {
        return;
    }

    try {
        const existingNotes = await findNotes(card);
        if (existingNotes.length > 0) {
            await deleteNote(existingNotes[0]);
        }
    } catch (error) {
        console.error('Failed to remove card from Anki:', error);
        throw error;
    }
}

// Full sync: push all local cards to Anki
async function syncAllToAnki(studyList) {
    if (!isAnkiEnabled()) {
        return { success: false, error: 'Anki integration not enabled' };
    }

    await ensureDeckExists();
    await ensureModelExists();

    const results = { added: 0, updated: 0, errors: [] };

    for (const [key, card] of Object.entries(studyList)) {
        try {
            const existingNotes = await findNotes(card);
            if (existingNotes.length > 0) {
                await updateNote(existingNotes[0], card);
                results.updated++;
            } else {
                await addNote(card, key);
                results.added++;
            }
        } catch (error) {
            results.errors.push({ key, error: error.message });
        }
    }

    return { success: true, ...results };
}

export {
    loadSettings,
    saveSettings,
    getSettings,
    isAnkiEnabled,
    testConnection,
    getDecks,
    getModels,
    ensureDeckExists,
    ensureModelExists,
    getAllCards,
    syncCard,
    removeCard,
    syncAllToAnki,
    addNote,
    updateNote,
    deleteNote,
    findNotes
};
