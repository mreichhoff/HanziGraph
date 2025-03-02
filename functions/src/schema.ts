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
