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
