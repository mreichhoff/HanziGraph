// Local AI module for OpenAI-compatible servers (e.g., LMStudio)
// This module provides the same interface as the Firebase functions but calls a local server instead.
const SETTINGS_KEY = 'localAiSettings';

// Default settings
const defaultSettings = {
    enabled: false,
    endpoint: 'http://localhost:1234/v1',
    model: '',
    availableModels: []
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

// System prompts
const systemPrompts = {
    chineseTeacher: 'You are a helpful Chinese teacher for speakers of English who want to learn Chinese. You speak naturally, and you provide helpful sentences that illustrate how to use Chinese vocabulary.'
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
// TODO: it's unclear these are good prompts on the backend, and they probably are worse for
// less-capable local models. Both sides likely need tuning.
async function explainChineseSentence(text) {
    const messages = [
        { role: 'user', content: `Explain the Chinese text "${text}".` }
    ];

    const output = await callLocalAi(messages, schemas.explanation);
    return { data: output };
}

async function translateEnglish(text) {
    const messages = [
        { role: 'user', content: `Translate the English text "${text}" into Chinese, and explain the translation.` }
    ];

    const output = await callLocalAi(messages, schemas.englishExplanation);
    output.englishTranslation = text;
    return { data: output };
}

async function generateChineseSentences(word, definitions) {
    const definitionsList = definitions.map(d => `* ${d}`).join('\n');
    const messages = [
        { role: 'system', content: systemPrompts.chineseTeacher },
        {
            role: 'user',
            content: `Please generate two example Chinese sentences, each with a separate English translation and pinyin, for each of the following definitions of the Chinese word "${word}":\n${definitionsList}\n\nEach sentence must include "${word}".`
        }
    ];

    const output = await callLocalAi(messages, schemas.sentenceGeneration);
    return { data: output };
}

async function analyzeCollocation(collocation) {
    const messages = [
        { role: 'system', content: systemPrompts.chineseTeacher },
        {
            role: 'user',
            content: `Please generate three example Chinese sentences, each with a separate English translation and pinyin, that uses the phrase "${collocation}".\nEach sentence must include "${collocation}".\n\nPlease also translate "${collocation}" to English and provide a plain-text explanation of how such a phrase would be used.`
        }
    ];

    const output = await callLocalAi(messages, schemas.collocationAnalysis);
    return { data: output };
}

// TODO: how common are multi-modal models (which this assumes) in local AI setups?
// we might need to let the user pick a separate model for images? Not sure yet.
async function analyzeImage(base64ImageContents) {
    // Note: Image analysis requires a vision-capable model
    // The base64 content should be in format: data:image/jpeg;base64,xxxxx
    const messages = [
        {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: 'Read the Chinese text in this image, split it into sentences, and then explain it, including an English translation for each sentence and any relevant grammar rules. If the image contains good English translations of the Chinese text, use those verbatim.'
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
    const messages = [
        { role: 'system', content: systemPrompts.chineseTeacher },
        {
            role: 'user',
            content: `In the sentence "${sentence}", explain how the word "${word}" is used.

Provide:
1. The meaning of "${word}" as used in this specific sentence (in English).
2. A plain-text explanation of why "${word}" is used here, including any nuances, grammatical role, or idiomatic usage that would help a learner understand its function in this context.

Keep your explanation focused and practical for a language learner.`
        }
    ];

    const output = await callLocalAi(messages, schemas.wordInContext);
    return { data: output };
}

export {
    loadSettings,
    saveSettings,
    getSettings,
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
