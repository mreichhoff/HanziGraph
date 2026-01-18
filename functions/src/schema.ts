import { z } from "genkit";

const sentenceSchema = z.array(
    z.object({
        chineseTextWithoutPinyin: z.string(),
        pinyin: z.string(),
        englishTranslation: z.string(),
    }));

// TODO: should the `explanationSchema` and `englishExplanationSchema` also split input into sentences?
// kinda seems like the user would've split it up themselves if that was the intention, vs an image
// where it's often tougher to do that.
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
    sentences: sentenceSchema,
    plainTextExplanation: z.string(),
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

export const chineseSentenceGenerationSchema = z.object({
    sentences: sentenceSchema,
});

export const analyzeCollocationSchema = z.object({
    englishTranslation: z.string(),
    plainTextExplanation: z.string(),
    sentences: sentenceSchema,
});

export const explainWordInContextInputSchema = z.object({
    word: z.string(),
    sentence: z.string(),
});

export const explainWordInContextSchema = z.object({
    wordMeaning: z.string(),
    plainTextExplanation: z.string(),
});
