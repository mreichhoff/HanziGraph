// Settings module - handles the settings UI for Local AI and Anki integration
import * as localAi from './local-ai.js';
import * as anki from './anki.js';
import { switchToState, stateKeys } from './ui-orchestrator.js';

// Tab navigation
const settingsTabs = document.querySelectorAll('.settings-tab');
const settingsPanels = document.querySelectorAll('.settings-panel');

// Local AI DOM elements
const settingsLink = document.getElementById('settings-link');
const localAiEnabledCheckbox = document.getElementById('local-ai-enabled');
const localAiEndpointInput = document.getElementById('local-ai-endpoint');
const localAiModelSelect = document.getElementById('local-ai-model');
const testConnectionButton = document.getElementById('test-connection-button');
const refreshModelsButton = document.getElementById('refresh-models-button');
const connectionStatus = document.getElementById('connection-status');
const localAiStatusContainer = document.getElementById('local-ai-status-container');
const localAiStatus = document.getElementById('local-ai-status');

// Anki DOM elements
const ankiEnabledCheckbox = document.getElementById('anki-enabled');
const ankiEndpointInput = document.getElementById('anki-endpoint');
const ankiDeckSelect = document.getElementById('anki-deck');
const ankiApiKeyInput = document.getElementById('anki-api-key');
const testAnkiConnectionButton = document.getElementById('test-anki-connection');
const refreshDecksButton = document.getElementById('refresh-decks-button');
const ankiConnectionStatus = document.getElementById('anki-connection-status');
const ankiStatusContainer = document.getElementById('anki-status-container');
const ankiStatus = document.getElementById('anki-status');
const syncToAnkiButton = document.getElementById('sync-to-anki-button');
const importFromAnkiButton = document.getElementById('import-from-anki-button');
const ankiSyncStatus = document.getElementById('anki-sync-status');

function switchTab(tabName) {
    settingsTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    settingsPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === `${tabName}-settings`);
    });
}

function updateLocalAiStatus() {
    const settings = localAi.getSettings();

    if (settings.enabled && settings.model) {
        localAiStatusContainer.style.display = 'block';
        localAiStatus.textContent = `✓ Local AI enabled with model: ${settings.model}`;
        localAiStatus.className = 'settings-status status-success';
        // Fire the eligibility event so other parts of the app know AI is available
        document.dispatchEvent(new CustomEvent('ai-eligibility-changed', { detail: true }));
    } else if (settings.enabled && !settings.model) {
        localAiStatusContainer.style.display = 'block';
        localAiStatus.textContent = '⚠ Please select a model to enable AI features';
        localAiStatus.className = 'settings-status status-warning';
    } else {
        localAiStatusContainer.style.display = 'none';
    }
}

function populateModelSelect(models, selectedModel) {
    localAiModelSelect.innerHTML = '';

    if (models.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '-- Test connection first --';
        localAiModelSelect.appendChild(option);
        return;
    }

    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        if (model === selectedModel) {
            option.selected = true;
        }
        localAiModelSelect.appendChild(option);
    });

    // If no model was selected but we have models, select the first one
    if (!selectedModel && models.length > 0) {
        localAiModelSelect.value = models[0];
        localAi.saveSettings({ model: models[0] });
    }
}

async function handleTestConnection() {
    connectionStatus.textContent = 'Testing...';
    connectionStatus.className = 'connection-status status-testing';

    // Save the current endpoint first
    localAi.saveSettings({ endpoint: localAiEndpointInput.value });

    const result = await localAi.testConnection();

    if (result.success) {
        connectionStatus.textContent = '✓ Connected';
        connectionStatus.className = 'connection-status status-success';

        // Save available models and populate the select
        localAi.saveSettings({ availableModels: result.models });
        populateModelSelect(result.models, localAi.getSettings().model);
    } else {
        connectionStatus.textContent = `✗ ${result.error}`;
        connectionStatus.className = 'connection-status status-error';
    }
}

async function handleRefreshModels() {
    connectionStatus.textContent = 'Refreshing...';
    connectionStatus.className = 'connection-status status-testing';

    const models = await localAi.fetchModels();

    if (models.length > 0) {
        connectionStatus.textContent = '✓ Models refreshed';
        connectionStatus.className = 'connection-status status-success';
        localAi.saveSettings({ availableModels: models });
        populateModelSelect(models, localAi.getSettings().model);
    } else {
        connectionStatus.textContent = '✗ Could not fetch models';
        connectionStatus.className = 'connection-status status-error';
    }
}

function handleModelChange() {
    const selectedModel = localAiModelSelect.value;
    localAi.saveSettings({ model: selectedModel });
    updateLocalAiStatus();
}

function handleLocalAiEnabledChange() {
    const enabled = localAiEnabledCheckbox.checked;
    localAi.saveSettings({ enabled });
    updateLocalAiStatus();
}

function handleLocalAiEndpointChange() {
    localAi.saveSettings({ endpoint: localAiEndpointInput.value });
    // Clear connection status when endpoint changes
    connectionStatus.textContent = '';
    connectionStatus.className = 'connection-status';
}

function loadLocalAiSettings() {
    const settings = localAi.getSettings();

    localAiEnabledCheckbox.checked = settings.enabled;
    localAiEndpointInput.value = settings.endpoint;

    if (settings.availableModels && settings.availableModels.length > 0) {
        populateModelSelect(settings.availableModels, settings.model);
    }

    updateLocalAiStatus();
}

function updateAnkiStatus() {
    const settings = anki.getSettings();

    if (settings.enabled && settings.deckName) {
        ankiStatusContainer.style.display = 'block';
        ankiStatus.textContent = `✓ Anki sync enabled for deck: ${settings.deckName}`;
        ankiStatus.className = 'settings-status status-success';
        document.dispatchEvent(new CustomEvent('anki-enabled-changed', { detail: true }));
    } else if (settings.enabled && !settings.deckName) {
        ankiStatusContainer.style.display = 'block';
        ankiStatus.textContent = '⚠ Please select a deck to enable Anki sync';
        ankiStatus.className = 'settings-status status-warning';
    } else {
        ankiStatusContainer.style.display = 'none';
        document.dispatchEvent(new CustomEvent('anki-enabled-changed', { detail: false }));
    }
}

function populateDeckSelect(decks, selectedDeck) {
    ankiDeckSelect.innerHTML = '';

    // Always include the default HanziGraph option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'HanziGraph';
    defaultOption.textContent = 'HanziGraph';
    if (selectedDeck === 'HanziGraph' || !selectedDeck) {
        defaultOption.selected = true;
    }
    ankiDeckSelect.appendChild(defaultOption);

    decks.forEach(deck => {
        if (deck !== 'HanziGraph') {
            const option = document.createElement('option');
            option.value = deck;
            option.textContent = deck;
            if (deck === selectedDeck) {
                option.selected = true;
            }
            ankiDeckSelect.appendChild(option);
        }
    });
}

async function handleTestAnkiConnection() {
    ankiConnectionStatus.textContent = 'Testing...';
    ankiConnectionStatus.className = 'connection-status status-testing';

    // Save the current endpoint first
    anki.saveSettings({ endpoint: ankiEndpointInput.value });

    const result = await anki.testConnection();

    if (result.success) {
        ankiConnectionStatus.textContent = `✓ Connected (v${result.version})`;
        ankiConnectionStatus.className = 'connection-status status-success';

        // Fetch and populate decks
        try {
            const decks = await anki.getDecks();
            populateDeckSelect(decks, anki.getSettings().deckName);
        } catch (error) {
            console.error('Failed to fetch decks:', error);
        }
    } else {
        ankiConnectionStatus.textContent = `✗ ${result.error}`;
        ankiConnectionStatus.className = 'connection-status status-error';
    }
}

async function handleRefreshDecks() {
    ankiConnectionStatus.textContent = 'Refreshing...';
    ankiConnectionStatus.className = 'connection-status status-testing';

    try {
        const decks = await anki.getDecks();
        populateDeckSelect(decks, anki.getSettings().deckName);

        ankiConnectionStatus.textContent = '✓ Refreshed';
        ankiConnectionStatus.className = 'connection-status status-success';
    } catch (error) {
        ankiConnectionStatus.textContent = `✗ ${error.message}`;
        ankiConnectionStatus.className = 'connection-status status-error';
    }
}

function handleAnkiDeckChange() {
    anki.saveSettings({ deckName: ankiDeckSelect.value });
    updateAnkiStatus();
}

function handleAnkiEnabledChange() {
    const enabled = ankiEnabledCheckbox.checked;
    anki.saveSettings({ enabled });
    updateAnkiStatus();
}

function handleAnkiEndpointChange() {
    anki.saveSettings({ endpoint: ankiEndpointInput.value });
    ankiConnectionStatus.textContent = '';
    ankiConnectionStatus.className = 'connection-status';
}

function handleAnkiApiKeyChange() {
    anki.saveSettings({ apiKey: ankiApiKeyInput.value });
}

async function handleSyncToAnki() {
    if (!anki.isAnkiEnabled()) {
        ankiSyncStatus.textContent = '✗ Enable Anki first';
        ankiSyncStatus.className = 'connection-status status-error';
        return;
    }

    ankiSyncStatus.textContent = 'Exporting...';
    ankiSyncStatus.className = 'connection-status status-testing';
    syncToAnkiButton.disabled = true;

    try {
        // Get the current study list from data-layer
        // We dispatch an event to request sync, which data-layer will handle
        document.dispatchEvent(new CustomEvent('request-anki-sync'));
    } catch (error) {
        ankiSyncStatus.textContent = `✗ ${error.message}`;
        ankiSyncStatus.className = 'connection-status status-error';
        syncToAnkiButton.disabled = false;
    }
}

async function handleImportFromAnki() {
    if (!anki.isAnkiEnabled()) {
        ankiSyncStatus.textContent = '✗ Enable Anki first';
        ankiSyncStatus.className = 'connection-status status-error';
        return;
    }

    ankiSyncStatus.textContent = 'Importing...';
    ankiSyncStatus.className = 'connection-status status-testing';
    importFromAnkiButton.disabled = true;

    try {
        // Dispatch event to request import, which data-layer will handle
        document.dispatchEvent(new CustomEvent('request-anki-import'));
    } catch (error) {
        ankiSyncStatus.textContent = `✗ ${error.message}`;
        ankiSyncStatus.className = 'connection-status status-error';
        importFromAnkiButton.disabled = false;
    }
}

function loadAnkiSettings() {
    const settings = anki.getSettings();

    ankiEnabledCheckbox.checked = settings.enabled;
    ankiEndpointInput.value = settings.endpoint;
    ankiApiKeyInput.value = settings.apiKey || '';
    ankiDeckSelect.value = settings.deckName || 'HanziGraph';

    updateAnkiStatus();
}

function initialize() {
    // Load initial settings
    loadLocalAiSettings();
    loadAnkiSettings();

    // Tab navigation
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Settings link in menu
    settingsLink.addEventListener('click', () => {
        switchToState(stateKeys.settings);
    });

    // Local AI event listeners
    localAiEnabledCheckbox.addEventListener('change', handleLocalAiEnabledChange);
    localAiEndpointInput.addEventListener('change', handleLocalAiEndpointChange);
    localAiModelSelect.addEventListener('change', handleModelChange);
    testConnectionButton.addEventListener('click', handleTestConnection);
    refreshModelsButton.addEventListener('click', handleRefreshModels);

    // Anki event listeners
    ankiEnabledCheckbox.addEventListener('change', handleAnkiEnabledChange);
    ankiEndpointInput.addEventListener('change', handleAnkiEndpointChange);
    ankiDeckSelect.addEventListener('change', handleAnkiDeckChange);
    ankiApiKeyInput.addEventListener('change', handleAnkiApiKeyChange);
    testAnkiConnectionButton.addEventListener('click', handleTestAnkiConnection);
    refreshDecksButton.addEventListener('click', handleRefreshDecks);
    syncToAnkiButton.addEventListener('click', handleSyncToAnki);
    importFromAnkiButton.addEventListener('click', handleImportFromAnki);

    // Listen for settings changes from other sources
    document.addEventListener('local-ai-settings-changed', () => {
        loadLocalAiSettings();
    });

    document.addEventListener('anki-settings-changed', () => {
        loadAnkiSettings();
    });

    // Listen for sync completion and notify user of status
    document.addEventListener('anki-sync-complete', (event) => {
        const result = event.detail;
        if (result.success) {
            const r = result.results;
            ankiSyncStatus.textContent = `✓ Added: ${r.added}, Updated: ${r.updated}${r.failed > 0 ? `, Failed: ${r.failed}` : ''}`;
            ankiSyncStatus.className = 'connection-status status-success';
        } else {
            ankiSyncStatus.textContent = `✗ ${result.error}`;
            ankiSyncStatus.className = 'connection-status status-error';
        }
        syncToAnkiButton.disabled = false;
        ankiSyncStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Listen for import completion and notify user of status
    document.addEventListener('anki-import-complete', (event) => {
        const result = event.detail;
        if (result.success) {
            ankiSyncStatus.textContent = `✓ Imported ${result.imported} cards from Anki`;
            ankiSyncStatus.className = 'connection-status status-success';
        } else {
            ankiSyncStatus.textContent = `✗ ${result.error}`;
            ankiSyncStatus.className = 'connection-status status-error';
        }
        if (importFromAnkiButton) {
            importFromAnkiButton.disabled = false;
        }
        ankiSyncStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
}

export { initialize };
