/**
 * Genkit Evaluation Entry Point
 *
 * This file is used for running evaluations locally with the Genkit CLI.
 * It's separate from the main Cloud Functions entry point (index.ts) to allow
 * evaluations to run without Firebase auth requirements.
 *
 * Usage:
 *   npm run eval:start     # Start Genkit dev server with eval support
 *   npm run eval:flow      # Run evaluation on a specific flow
 *
 * Or directly with genkit CLI:
 *   genkit start -- npx tsx src/genkit-eval.ts
 *   genkit eval:flow explainText --input datasets/explain-chinese.json
 */

import { genkit, z } from "genkit";
import { vertexAI } from '@genkit-ai/google-genai';
import { BaseEvalDataPoint } from 'genkit/evaluator';
import {
    explanationSchema,
    englishExplanationSchema,
    imageAnalysisSchema,
    chineseSentenceGenerationSchema,
    generateChineseSentencesInputSchema,
    analyzeCollocationSchema,
    explainWordInContextInputSchema,
    explainWordInContextSchema,
} from "./schema";

// Initialize Genkit with evaluation support
// Note: This instance doesn't include Firebase auth for easier local testing
// Flows use Flash for cost/speed, but LLM-as-judge evaluators use Pro for accuracy
const ai = genkit({
    plugins: [
        vertexAI({
            location: 'us-central1',
            projectId: process.env.GCLOUD_PROJECT || 'hanzigraph',
        }),
    ],
    model: vertexAI.model('gemini-2.0-flash'),
});

// Register schemas - MUST be done before loading prompts
const ChineseExplanationSchema = ai.defineSchema(
    'ChineseExplanationSchema', explanationSchema);
const EnglishExplanationSchema = ai.defineSchema(
    'EnglishExplanationSchema', englishExplanationSchema);
const ImageAnalysisSchema = ai.defineSchema(
    'ImageAnalysisSchema', imageAnalysisSchema);
const ChineseSentenceGenerationSchema = ai.defineSchema(
    'ChineseSentenceGenerationSchema', chineseSentenceGenerationSchema);
const GenerateChineseSentencesInputSchema = ai.defineSchema(
    'GenerateChineseSentencesInputSchema', generateChineseSentencesInputSchema);
const AnalyzeCollocationSchema = ai.defineSchema(
    'AnalyzeCollocationSchema', analyzeCollocationSchema);
const ExplainWordInContextInputSchema = ai.defineSchema(
    'ExplainWordInContextInputSchema', explainWordInContextInputSchema);
const ExplainWordInContextSchema = ai.defineSchema(
    'ExplainWordInContextSchema', explainWordInContextSchema);

// ============================================================================
// CUSTOM EVALUATORS - defined inline to use the same Genkit instance
// ============================================================================

/**
 * Evaluator: Chinese Text Present
 * Checks if the output contains Chinese characters (basic sanity check)
 */
export const chineseTextPresentEvaluator = ai.defineEvaluator(
    {
        name: 'custom/chineseTextPresent',
        displayName: 'Chinese Text Present',
        definition: 'Checks if the output contains Chinese characters when expected.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        const output = typeof datapoint.output === 'string' ?
            datapoint.output :
            JSON.stringify(datapoint.output);

        const chineseRegex = /[\u4e00-\u9fff]/;
        const hasChineseText = chineseRegex.test(output);

        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: hasChineseText,
                details: {
                    reasoning: hasChineseText ?
                        'Output contains Chinese characters as expected.' :
                        'Output does not contain Chinese characters.',
                },
            },
        };
    }
);

/**
 * Evaluator: Valid Pinyin Format
 * Checks if pinyin in the output follows valid patterns
 */
export const validPinyinFormatEvaluator = ai.defineEvaluator(
    {
        name: 'custom/validPinyinFormat',
        displayName: 'Valid Pinyin Format',
        definition: 'Checks if pinyin in the output follows valid patterns with tone marks or numbers.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        const output = typeof datapoint.output === 'string' ?
            datapoint.output :
            JSON.stringify(datapoint.output);

        const toneMarks = /[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/i;
        const toneNumbers = /[a-z]+[1-4]/i;
        const hasPinyin = toneMarks.test(output) || toneNumbers.test(output);

        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: hasPinyin,
                details: {
                    reasoning: hasPinyin ?
                        'Output contains valid pinyin with tone marks or numbers.' :
                        'Output does not appear to contain valid pinyin.',
                },
            },
        };
    }
);

/**
 * Evaluator: English Translation Present
 * Checks if the output contains English text (for translation outputs)
 */
export const englishTranslationPresentEvaluator = ai.defineEvaluator(
    {
        name: 'custom/englishTranslationPresent',
        displayName: 'English Translation Present',
        definition: 'Checks if the output contains English text for translations.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        const output = typeof datapoint.output === 'string' ?
            datapoint.output :
            JSON.stringify(datapoint.output);

        const englishWordRegex = /\b[a-zA-Z]{3,}\b/;
        const hasEnglish = englishWordRegex.test(output);

        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: hasEnglish,
                details: {
                    reasoning: hasEnglish ?
                        'Output contains English text.' :
                        'Output does not appear to contain English text.',
                },
            },
        };
    }
);

/**
 * Evaluator: Grammar Explanation Quality (LLM-based)
 * Uses an LLM to assess if grammar explanations are helpful and accurate
 */
export const grammarExplanationQualityEvaluator = ai.defineEvaluator(
    {
        name: 'custom/grammarExplanationQuality',
        displayName: 'Grammar Explanation Quality',
        definition: 'Assesses if grammar explanations are clear, accurate, and helpful for language learners.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        const input = typeof datapoint.input === 'string' ?
            datapoint.input :
            JSON.stringify(datapoint.input);
        const output = typeof datapoint.output === 'string' ?
            datapoint.output :
            JSON.stringify(datapoint.output);

        const { output: evalResult } = await ai.generate({
            model: vertexAI.model('gemini-2.5-pro'),
            prompt: `You are evaluating a Chinese language learning tool's output quality.

Input (Chinese text to explain): ${input}

Output (explanation provided): ${output}

Evaluate the quality of this explanation on a scale of 1-5:
1 = Poor: Incorrect, confusing, or unhelpful
2 = Below Average: Some useful information but significant issues
3 = Average: Correct but could be clearer or more detailed  
4 = Good: Clear, accurate, and helpful
5 = Excellent: Outstanding clarity, accuracy, and pedagogical value

Consider:
- Is the translation accurate?
- Are grammar explanations clear and correct?
- Is the pinyin accurate?
- Would this help a learner understand the text?`,
            output: {
                schema: z.object({
                    score: z.number().min(1).max(5).describe('Quality score from 1-5'),
                    reasoning: z.string().describe('Brief explanation for the score'),
                }),
            },
        });

        if (!evalResult) {
            return {
                testCaseId: datapoint.testCaseId,
                evaluation: {
                    score: 0,
                    details: { reasoning: 'LLM evaluator returned no output' },
                },
            };
        }

        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: evalResult.score / 5, // Normalize to 0-1
                details: {
                    reasoning: evalResult.reasoning,
                    rawScore: evalResult.score,
                },
            },
        };
    }
);

/**
 * Evaluator: Sentence Generation Quality (LLM-based)
 * Evaluates if generated sentences properly use the target word
 */
export const sentenceGenerationQualityEvaluator = ai.defineEvaluator(
    {
        name: 'custom/sentenceGenerationQuality',
        displayName: 'Sentence Generation Quality',
        definition: 'Evaluates if generated Chinese sentences properly use the target word and are natural.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        const input = typeof datapoint.input === 'string' ?
            datapoint.input :
            JSON.stringify(datapoint.input);
        const output = typeof datapoint.output === 'string' ?
            datapoint.output :
            JSON.stringify(datapoint.output);

        const { output: evalResult } = await ai.generate({
            model: vertexAI.model('gemini-2.5-pro'),
            prompt: `You are evaluating generated Chinese example sentences for a language learning app.

Input (word and definitions): ${input}

Output (generated sentences): ${output}

Evaluate the quality on a scale of 1-5:
1 = Poor: Sentences don't contain the word, are grammatically wrong, or translations are incorrect
2 = Below Average: Some issues with naturalness or accuracy
3 = Average: Correct but generic or not very helpful for learning
4 = Good: Natural sentences that illustrate the word's usage well
5 = Excellent: Diverse, natural sentences that clearly demonstrate different meanings

Consider:
- Does each sentence actually contain the target word?
- Are the sentences grammatically correct Chinese?
- Are the English translations accurate?
- Is the pinyin correct?
- Do the sentences cover the different definitions provided?
- Are sentences at an appropriate difficulty level?`,
            output: {
                schema: z.object({
                    score: z.number().min(1).max(5).describe('Quality score from 1-5'),
                    reasoning: z.string().describe('Brief explanation for the score'),
                }),
            },
        });

        if (!evalResult) {
            return {
                testCaseId: datapoint.testCaseId,
                evaluation: {
                    score: 0,
                    details: { reasoning: 'LLM evaluator returned no output' },
                },
            };
        }

        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: evalResult.score / 5, // Normalize to 0-1
                details: {
                    reasoning: evalResult.reasoning,
                    rawScore: evalResult.score,
                },
            },
        };
    }
);

/**
 * Evaluator: Output Structure Valid
 * Checks if the output matches the expected schema structure
 */
export const outputStructureValidEvaluator = ai.defineEvaluator(
    {
        name: 'custom/outputStructureValid',
        displayName: 'Output Structure Valid',
        definition: 'Checks if the output has the expected structure with required fields.',
    },
    async (datapoint: BaseEvalDataPoint) => {
        const output = datapoint.output;

        if (!output || typeof output !== 'object') {
            return {
                testCaseId: datapoint.testCaseId,
                evaluation: {
                    score: false,
                    details: { reasoning: 'Output is not an object' },
                },
            };
        }

        // Check for sentence generation flow (only has sentences array)
        if ('sentences' in output && Array.isArray(output.sentences) && output.sentences.length > 0) {
            // Validate sentence structure
            const firstSentence = output.sentences[0];
            const sentenceFields = ['chineseTextWithoutPinyin', 'pinyin', 'englishTranslation'];
            const hasSentenceStructure = sentenceFields.every((field) => field in firstSentence);

            return {
                testCaseId: datapoint.testCaseId,
                evaluation: {
                    score: hasSentenceStructure,
                    details: {
                        reasoning: hasSentenceStructure ?
                            `Output has valid sentences array with ${output.sentences.length} sentences` :
                            `Sentences missing required fields. Found: ${Object.keys(firstSentence).join(', ')}`,
                        sentenceCount: output.sentences.length,
                    },
                },
            };
        }

        // Check for word-in-context flow (has wordMeaning + plainTextExplanation)
        if ('wordMeaning' in output && 'plainTextExplanation' in output) {
            return {
                testCaseId: datapoint.testCaseId,
                evaluation: {
                    score: true,
                    details: {
                        reasoning: 'Output has valid word-in-context structure ' +
                            'with wordMeaning and plainTextExplanation',
                    },
                },
            };
        }

        // Check for explanation flows (have plainTextExplanation, etc.)
        const commonFields = [
            'plainTextExplanation', 'englishTranslation', 'chineseTranslationWithoutPinyin',
            'pinyin', 'grammarHighlights', 'sentences',
        ];
        const presentFields = commonFields.filter((field) => field in output);
        const hasRequiredStructure = presentFields.length >= 2;

        return {
            testCaseId: datapoint.testCaseId,
            evaluation: {
                score: hasRequiredStructure,
                details: {
                    reasoning: hasRequiredStructure ?
                        `Output has expected structure with fields: ${presentFields.join(', ')}` :
                        `Output missing expected fields. Found: ${Object.keys(output).join(', ')}`,
                    presentFields,
                },
            },
        };
    }
);

// ============================================================================
// FLOWS
// ============================================================================

// Load prompts
const explainChinesePrompt = ai.prompt<
    z.ZodTypeAny, typeof ChineseExplanationSchema
>('explain-chinese');
const explainEnglishPrompt = ai.prompt<
    z.ZodTypeAny, typeof EnglishExplanationSchema
>('explain-english');
const analyzeImagePrompt = ai.prompt<
    z.ZodTypeAny, typeof ImageAnalysisSchema
>('analyze-image');
const generateChineseSentencesPrompt = ai.prompt<
    typeof GenerateChineseSentencesInputSchema, typeof ChineseSentenceGenerationSchema
>('generate-chinese-sentences');
const analyzeCollocationPrompt = ai.prompt<
    z.ZodTypeAny, typeof AnalyzeCollocationSchema
>('analyze-collocation');
const explainWordInContextPrompt = ai.prompt<
    typeof ExplainWordInContextInputSchema, typeof ExplainWordInContextSchema
>('explain-word-in-context');

/**
 * Flow: explainText
 * Explains Chinese text with translation, pinyin, and grammar highlights
 */
export const explainTextFlow = ai.defineFlow({
    name: "explainText",
    inputSchema: z.string(),
    outputSchema: explanationSchema,
}, async (text) => {
    const { output } = await explainChinesePrompt({ text });
    if (!output) {
        throw new Error('Model failed to generate output');
    }
    return output;
});

/**
 * Flow: explainEnglish
 * Translates English to Chinese with explanation
 */
export const explainEnglishFlow = ai.defineFlow({
    name: "explainEnglish",
    inputSchema: z.string(),
    outputSchema: englishExplanationSchema,
}, async (text) => {
    const { output } = await explainEnglishPrompt({ text });
    if (!output) {
        throw new Error('Model failed to generate output');
    }
    return output;
});

/**
 * Flow: analyzeImage
 * Analyzes images containing Chinese text
 */
export const analyzeImageFlow = ai.defineFlow({
    name: "analyzeImage",
    inputSchema: z.string(),
    outputSchema: imageAnalysisSchema,
}, async (base64ImageUrl) => {
    const { output } = await analyzeImagePrompt({ base64ImageUrl });
    if (!output) {
        throw new Error('Model failed to generate output');
    }
    return output;
});

/**
 * Flow: generateChineseSentences
 * Generates example sentences for a Chinese word
 */
export const generateChineseSentencesFlow = ai.defineFlow({
    name: "generateChineseSentences",
    inputSchema: generateChineseSentencesInputSchema,
    outputSchema: chineseSentenceGenerationSchema,
}, async (request) => {
    const { output } = await generateChineseSentencesPrompt(request);
    if (!output) {
        throw new Error('Model failed to generate output');
    }
    return output;
});

/**
 * Flow: analyzeCollocation
 * Analyzes Chinese word collocations
 */
export const analyzeCollocationFlow = ai.defineFlow({
    name: "analyzeCollocation",
    inputSchema: z.string(),
    outputSchema: analyzeCollocationSchema,
}, async (collocation) => {
    collocation = collocation.replaceAll(' ', '');
    const { output } = await analyzeCollocationPrompt({ collocation });
    if (!output) {
        throw new Error('Model failed to generate output');
    }
    return output;
});

/**
 * Flow: explainWordInContext
 * Explains a specific word's meaning in a given sentence context
 */
export const explainWordInContextFlow = ai.defineFlow({
    name: "explainWordInContext",
    inputSchema: explainWordInContextInputSchema,
    outputSchema: explainWordInContextSchema,
}, async (request) => {
    const { output } = await explainWordInContextPrompt(request);
    if (!output) {
        throw new Error('Model failed to generate output');
    }
    return output;
});

// Export for Genkit CLI to discover
export { ai };

console.log('Genkit evaluation server ready.');
console.log(
    'Available flows: explainText, explainEnglish, analyzeImage, ' +
    'generateChineseSentences, analyzeCollocation, explainWordInContext');
console.log(
    'Custom evaluators: chineseTextPresent, validPinyinFormat, ' +
    'englishTranslationPresent, grammarExplanationQuality, ' +
    'sentenceGenerationQuality, outputStructureValid');
