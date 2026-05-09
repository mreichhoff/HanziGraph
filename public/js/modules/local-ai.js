// Local AI module for OpenAI-compatible servers (e.g., LMStudio)
// This module provides the same interface as the Firebase functions but calls a local server instead.
const SETTINGS_KEY = 'localAiSettings';

// Default prompt templates. Placeholders use {varName} syntax.
const defaultPrompts = {
    systemPrompt: 'You are a helpful Chinese teacher for speakers of English who want to learn Chinese. You speak naturally, and you provide helpful sentences that illustrate how to use Chinese vocabulary.',
    explainChinese: 'Explain the Chinese text "{text}".',
    translateEnglish: 'Translate the English text "{text}" into Chinese, and explain the translation.',
    generateSentences: 'Please generate two example Chinese sentences, each with a separate English translation and pinyin, for each of the following definitions of the Chinese word "{word}":\n{definitions}\n\nEach sentence must include "{word}".',
    analyzeCollocation: 'Please generate three example Chinese sentences, each with a separate English translation and pinyin, that uses the phrase "{collocation}".\nEach sentence must include "{collocation}".\n\nPlease also translate "{collocation}" to English and provide a plain-text explanation of how such a phrase would be used.',
    analyzeImage: 'Read the Chinese text in this image, split it into sentences, and then explain it, including an English translation for each sentence and any relevant grammar rules. If the image contains good English translations of the Chinese text, use those verbatim.',
    wordInContext: 'In the sentence "{sentence}", explain how the word "{word}" is used.\n\nProvide:\n1. The meaning of "{word}" as used in this specific sentence (in English).\n2. A plain-text explanation of why "{word}" is used here, including any nuances, grammatical role, or idiomatic usage that would help a learner understand its function in this context.\n\nKeep your explanation focused and practical for a language learner.'
};

// Default settings
const defaultSettings = {
    enabled: false,
    endpoint: 'http://localhost:1234/v1',
    model: '',
    availableModels: [],
    customPrompts: {}
};

let settings = loadSettings();

function loadSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
        try {
            return { ...defaultSettings, ...JSON.parse(stored) };
        } catch (e) {
            console.error('Failed to parse local AI settings:', e);
        }
    }
    return { ...defaultSettings };
}

function saveSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    document.dispatchEvent(new CustomEvent('local-ai-settings-changed', { detail: settings }));
}

function getSettings() {
    return { ...settings };
}

function isLocalAiEnabled() {
    return settings.enabled && settings.endpoint && settings.model;
}

function getDefaultPrompts() {
    return { ...defaultPrompts };
}

// Returns the active prompts: custom values override defaults, empty strings fall back to defaults.
function getActivePrompts() {
    const custom = settings.customPrompts || {};
    const result = {};
    for (const key of Object.keys(defaultPrompts)) {
        result[key] = (custom[key] !== undefined && custom[key] !== '') ? custom[key] : defaultPrompts[key];
    }
    return result;
}

// threat model here is users calling a local API with prompts and input that they control, so little need to worry about escaping or injection here. 
// The user can already do whatever they want with the prompts and input.
function applyTemplate(template, vars) {
    return template.replace(/\{(\w+)\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{${key}}`));
}

// JSON Schema definitions matching the Firebase function schemas.
// See `functions/src/schemas.ts` for the backend schema definitions.
const schemas = {
    explanation: {
        type: 'object',
        properties: {
            plainTextExplanation: { type: 'string' },
            englishTranslation: { type: 'string' },
            pinyin: { type: 'string' },
            grammarHighlights: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        grammarConceptName: { type: 'string' },
                        grammarConceptExplanation: { type: 'string' }
                    },
                    required: ['grammarConceptName', 'grammarConceptExplanation']
                }
            }
        },
        required: ['plainTextExplanation', 'englishTranslation', 'pinyin', 'grammarHighlights']
    },
    englishExplanation: {
        type: 'object',
        properties: {
            plainTextExplanation: { type: 'string' },
            chineseTranslationWithoutPinyin: { type: 'string' },
            pinyin: { type: 'string' },
            grammarHighlights: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        grammarConceptName: { type: 'string' },
                        grammarConceptExplanation: { type: 'string' }
                    },
                    required: ['grammarConceptName', 'grammarConceptExplanation']
                }
            }
        },
        required: ['plainTextExplanation', 'chineseTranslationWithoutPinyin', 'pinyin', 'grammarHighlights']
    },
    sentenceGeneration: {
        type: 'object',
        properties: {
            sentences: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        chineseTextWithoutPinyin: { type: 'string' },
                        pinyin: { type: 'string' },
                        englishTranslation: { type: 'string' }
                    },
                    required: ['chineseTextWithoutPinyin', 'pinyin', 'englishTranslation']
                }
            }
        },
        required: ['sentences']
    },
    collocationAnalysis: {
        type: 'object',
        properties: {
            englishTranslation: { type: 'string' },
            plainTextExplanation: { type: 'string' },
            sentences: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        chineseTextWithoutPinyin: { type: 'string' },
                        pinyin: { type: 'string' },
                        englishTranslation: { type: 'string' }
                    },
                    required: ['chineseTextWithoutPinyin', 'pinyin', 'englishTranslation']
                }
            }
        },
        required: ['englishTranslation', 'plainTextExplanation', 'sentences']
    },
    imageAnalysis: {
        type: 'object',
        properties: {
            sentences: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        chineseTextWithoutPinyin: { type: 'string' },
                        pinyin: { type: 'string' },
                        englishTranslation: { type: 'string' }
                    },
                    required: ['chineseTextWithoutPinyin', 'pinyin', 'englishTranslation']
                }
            },
            plainTextExplanation: { type: 'string' },
            grammarHighlights: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        grammarConceptName: { type: 'string' },
                        grammarConceptExplanation: { type: 'string' }
                    },
                    required: ['grammarConceptName', 'grammarConceptExplanation']
                }
            }
        },
        required: ['sentences', 'plainTextExplanation', 'grammarHighlights']
    },
    wordInContext: {
        type: 'object',
        properties: {
            wordMeaning: { type: 'string' },
            plainTextExplanation: { type: 'string' }
        },
        required: ['wordMeaning', 'plainTextExplanation']
    }
};

async function callLocalAi(messages, schema) {
    const response = await fetch(`${settings.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: settings.model,
            messages: messages,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'response',
                    strict: true,
                    schema: schema
                }
            },
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Local AI request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No content in response');
    }

    return JSON.parse(content);
}

async function testConnection() {
    try {
        const response = await fetch(`${settings.endpoint}/models`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return { success: false, error: `Server returned ${response.status}` };
        }

        const data = await response.json();
        const models = data.data?.map(m => m.id) || [];

        return { success: true, models };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function fetchModels() {
    try {
        const response = await fetch(`${settings.endpoint}/models`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.status}`);
        }

        const data = await response.json();
        return data.data?.map(m => m.id) || [];
    } catch (error) {
        console.error('Failed to fetch models:', error);
        return [];
    }
}

// AI function implementations that mirror the Firebase GenKit functions
// See `functions/src/index.ts` for the GenKit entry point.
async function explainChineseSentence(text) {
    const prompts = getActivePrompts();
    const messages = [
        { role: 'system', content: prompts.systemPrompt },
        { role: 'user', content: applyTemplate(prompts.explainChinese, { text }) }
    ];

    const output = await callLocalAi(messages, schemas.explanation);
    return { data: output };
}

async function translateEnglish(text) {
    const prompts = getActivePrompts();
    const messages = [
        { role: 'system', content: prompts.systemPrompt },
        { role: 'user', content: applyTemplate(prompts.translateEnglish, { text }) }
    ];

    const output = await callLocalAi(messages, schemas.englishExplanation);
    output.englishTranslation = text;
    return { data: output };
}

async function generateChineseSentences(word, definitions) {
    const prompts = getActivePrompts();
    const definitionsList = definitions.map(d => `* ${d}`).join('\n');
    const messages = [
        { role: 'system', content: prompts.systemPrompt },
        {
            role: 'user',
            content: applyTemplate(prompts.generateSentences, { word, definitions: definitionsList })
        }
    ];

    const output = await callLocalAi(messages, schemas.sentenceGeneration);
    return { data: output };
}

async function analyzeCollocation(collocation) {
    const prompts = getActivePrompts();
    const messages = [
        { role: 'system', content: prompts.systemPrompt },
        {
            role: 'user',
            content: applyTemplate(prompts.analyzeCollocation, { collocation })
        }
    ];

    const output = await callLocalAi(messages, schemas.collocationAnalysis);
    return { data: output };
}

// TODO: how common are multi-modal models (which this assumes) in local AI setups?
// we might need to let the user pick a separate model for images? Not sure yet.
async function analyzeImage(base64ImageContents) {
    const prompts = getActivePrompts();
    // Note: Image analysis requires a vision-capable model
    // The base64 content should be in format: data:image/jpeg;base64,xxxxx
    const messages = [
        { role: 'system', content: prompts.systemPrompt },
        {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: prompts.analyzeImage
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: base64ImageContents
                    }
                }
            ]
        }
    ];

    const output = await callLocalAi(messages, schemas.imageAnalysis);
    return { data: output };
}

async function explainWordInContext(word, sentence) {
    const prompts = getActivePrompts();
    const messages = [
        { role: 'system', content: prompts.systemPrompt },
        {
            role: 'user',
            content: applyTemplate(prompts.wordInContext, { word, sentence })
        }
    ];

    const output = await callLocalAi(messages, schemas.wordInContext);
    return { data: output };
}

export {
    loadSettings,
    saveSettings,
    getSettings,
    getDefaultPrompts,
    isLocalAiEnabled,
    testConnection,
    fetchModels,
    explainChineseSentence,
    translateEnglish,
    generateChineseSentences,
    analyzeCollocation,
    analyzeImage,
    explainWordInContext
};
