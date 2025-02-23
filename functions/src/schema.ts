import { z } from "genkit";

export const explanationSchema = z.object({
    plainTextExplanation: z.string(),
    grammarHighlights: z.array(
        z.object({
            grammarConceptName: z.string(),
            grammarConceptExplanation: z.string(),
        })),
    wordByWord: z.array(
        z.object({
            word: z.string(),
            meaning: z.string(),
            pinyin: z.string(),
        })),
});

export const englishExplanationSchema = z.object({
    translation: z.object({
        chineseText: z.string(),
        pinyin: z.string(),
    }),
    grammarHighlights: z.array(
        z.object({
            grammarConceptName: z.string(),
            grammarConceptExplanation: z.string(),
        })),
    wordByWord: z.array(
        z.object({
            word: z.string(),
            meaning: z.string(),
            pinyin: z.string(),
        })),
});
