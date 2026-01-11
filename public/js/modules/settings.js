// Settings module - handles the settings UI and local AI configuration
import * as localAi from './local-ai.js';
import { switchToState, stateKeys } from './ui-orchestrator.js';

// DOM elements
const settingsLink = document.getElementById('settings-link');
const localAiEnabledCheckbox = document.getElementById('local-ai-enabled');
const localAiEndpointInput = document.getElementById('local-ai-endpoint');
const localAiModelSelect = document.getElementById('local-ai-model');
const testConnectionButton = document.getElementById('test-connection-button');
const refreshModelsButton = document.getElementById('refresh-models-button');
const connectionStatus = document.getElementById('connection-status');
const localAiStatusContainer = document.getElementById('local-ai-status-container');
const localAiStatus = document.getElementById('local-ai-status');

function updateStatus() {
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
    updateStatus();
}

function handleEnabledChange() {
    const enabled = localAiEnabledCheckbox.checked;
    localAi.saveSettings({ enabled });
    updateStatus();
}

function handleEndpointChange() {
    localAi.saveSettings({ endpoint: localAiEndpointInput.value });
    // Clear connection status when endpoint changes
    connectionStatus.textContent = '';
    connectionStatus.className = 'connection-status';
}

function loadSettings() {
    const settings = localAi.getSettings();

    localAiEnabledCheckbox.checked = settings.enabled;
    localAiEndpointInput.value = settings.endpoint;

    if (settings.availableModels && settings.availableModels.length > 0) {
        populateModelSelect(settings.availableModels, settings.model);
    }

    updateStatus();
}

function initialize() {
    // Load initial settings
    loadSettings();

    // Set up event listeners
    settingsLink.addEventListener('click', () => {
        switchToState(stateKeys.settings);
    });

    localAiEnabledCheckbox.addEventListener('change', handleEnabledChange);
    localAiEndpointInput.addEventListener('change', handleEndpointChange);
    localAiModelSelect.addEventListener('change', handleModelChange);
    testConnectionButton.addEventListener('click', handleTestConnection);
    refreshModelsButton.addEventListener('click', handleRefreshModels);

    // Listen for settings changes from other sources
    document.addEventListener('local-ai-settings-changed', () => {
        loadSettings();
    });
}

export { initialize };
