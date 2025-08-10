import { z } from "genkit";

export const explanationSchema = z.object({
    plainTextExplanation: z.string(),
    englishTranslation: z.string(),
    pinyin: z.string(),
    grammarHighlights: z.array(
        z.object({
            grammarConceptName: z.string(),
            grammarConceptExplanation: z.string(),
        })),
});

export const englishExplanationSchema = z.object({
    plainTextExplanation: z.string(),
    chineseTranslationWithoutPinyin: z.string(),
    pinyin: z.string(),
    grammarHighlights: z.array(
        z.object({
            grammarConceptName: z.string(),
            grammarConceptExplanation: z.string(),
        })),
});

// TODO: these are all quite similar schemas, and should
// likely be combined. The frontend benefits from a uniform
// interface.
export const imageAnalysisSchema = z.object({
    plainTextExplanation: z.string(),
    chineseTranslationWithoutPinyin: z.string(),
    englishTranslation: z.string(),
    pinyin: z.string(),
    grammarHighlights: z.array(
        z.object({
            grammarConceptName: z.string(),
            grammarConceptExplanation: z.string(),
        })),
});

export const generateChineseSentencesInputSchema = z.object({
    word: z.string(),
    definitions: z.array(z.string()),
});

const sentenceSchema = z.array(
    z.object({
        chineseTextWithoutPinyin: z.string(),
        pinyin: z.string(),
        englishTranslation: z.string(),
    }));

export const chineseSentenceGenerationSchema = z.object({
    sentences: sentenceSchema,
});

export const analyzeCollocationSchema = z.object({
    englishTranslation: z.string(),
    plainTextExplanation: z.string(),
    sentences: sentenceSchema,
});
