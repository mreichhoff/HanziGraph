import { onCallGenkit, HttpsError } from "firebase-functions/v2/https";
import { genkit, z } from "genkit";
import { vertexAI } from '@genkit-ai/google-genai';
import { isUserAuthorized } from "./auth";
import { tracePrompt } from "./ai-tracing";
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

// according to the docs, there's no need for an API key when using the vertex API,
// as instead the service principal is granted a vertex API role.
// that said, "you have no secrets bound" shows as a debug log.
// the docs aren't super clear, but see
// https://firebase.google.com/docs/functions/oncallgenkit?hl=en&authuser=0#api-creds
// and choose the Gemini (Vertex AI) tab.
const ai = genkit({
    plugins: [
        vertexAI({ location: 'global' }),
    ],
    model: vertexAI.model('gemini-3-flash-preview'),
});

const ChineseExplanationSchema = ai.defineSchema('ChineseExplanationSchema', explanationSchema);
const explainChinesePrompt = ai.prompt<z.ZodTypeAny, typeof ChineseExplanationSchema>('explain-chinese');
const EnglishExplanationSchema = ai.defineSchema('EnglishExplanationSchema', englishExplanationSchema);
const explainEnglishPrompt = ai.prompt<z.ZodTypeAny, typeof EnglishExplanationSchema>('explain-english');

// TODO: dig into streamSchema and streaming structured responses
const explainFlow = ai.defineFlow({
    name: "explainText",
    inputSchema: z.string(),
    outputSchema: explanationSchema,
}, async (text, { context }) => {
    // TODO: there's some authorization syntactic sugar with onCallGenkit, but it appears deprecated
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await tracePrompt("explain-chinese", () => explainChinesePrompt({ text }));
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
},
);

const explainEnglishFlow = ai.defineFlow({
    name: "explainEnglish",
    inputSchema: z.string(),
    outputSchema: englishExplanationSchema,
}, async (text, { context }) => {
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await tracePrompt("explain-english", () => explainEnglishPrompt({ text }));
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const explainText = onCallGenkit(explainFlow);

export const explainEnglishText = onCallGenkit(explainEnglishFlow);

// TODO: set up flows in separate files (text analysis in one, image in another)
const ImageAnalysisSchema = ai.defineSchema('ImageAnalysisSchema', imageAnalysisSchema);
const analyzeImagePrompt = ai.prompt<z.ZodTypeAny, typeof ImageAnalysisSchema>('analyze-image');
const analyzeImageFlow = ai.defineFlow({
    name: "analyzeImage",
    inputSchema: z.string(),
    outputSchema: imageAnalysisSchema,
}, async (base64ImageUrl, { context }) => {
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await tracePrompt("analyze-image", () => analyzeImagePrompt({ base64ImageUrl }));
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const analyzeImage = onCallGenkit({
    memory: '1GiB',
}, analyzeImageFlow);

const ChineseSentenceGenerationSchema = ai.defineSchema(
    'ChineseSentenceGenerationSchema',
    chineseSentenceGenerationSchema
);
const GenerateChineseSentencesInputSchema = ai.defineSchema(
    'GenerateChineseSentencesInputSchema',
    generateChineseSentencesInputSchema
);
const generateChineseSentencesPrompt = ai.prompt<
    typeof GenerateChineseSentencesInputSchema, typeof ChineseSentenceGenerationSchema>('generate-chinese-sentences');
const generateChineseSentencesFlow = ai.defineFlow({
    name: "generateChineseSentences",
    inputSchema: generateChineseSentencesInputSchema,
    outputSchema: chineseSentenceGenerationSchema,
}, async (request, { context }) => {
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await tracePrompt(
        "generate-chinese-sentences",
        () => generateChineseSentencesPrompt(request),
    );
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const generateChineseSentences = onCallGenkit(generateChineseSentencesFlow);

const AnalyzeCollocationSchema = ai.defineSchema('AnalyzeCollocationSchema', analyzeCollocationSchema);
const analyzeCollocationPrompt = ai.prompt<z.ZodTypeAny, typeof AnalyzeCollocationSchema>('analyze-collocation');

const analyzeCollocationFlow = ai.defineFlow({
    name: "analyzeCollocation",
    inputSchema: z.string(),
    outputSchema: analyzeCollocationSchema,
}, async (collocation, { context }) => {
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    collocation = collocation.replaceAll(' ', '');
    const { output } = await tracePrompt(
        "analyze-collocation",
        () => analyzeCollocationPrompt({ collocation }),
    );
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
},
);

export const analyzeCollocation = onCallGenkit(analyzeCollocationFlow);

const ExplainWordInContextInputSchema = ai.defineSchema(
    'ExplainWordInContextInputSchema',
    explainWordInContextInputSchema
);
const ExplainWordInContextSchema = ai.defineSchema(
    'ExplainWordInContextSchema',
    explainWordInContextSchema
);
const explainWordInContextPrompt = ai.prompt<
    typeof ExplainWordInContextInputSchema, typeof ExplainWordInContextSchema>('explain-word-in-context');

const explainWordInContextFlow = ai.defineFlow({
    name: "explainWordInContext",
    inputSchema: explainWordInContextInputSchema,
    outputSchema: explainWordInContextSchema,
}, async (request, { context }) => {
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await tracePrompt(
        "explain-word-in-context",
        () => explainWordInContextPrompt(request),
    );
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const explainWordInContext = onCallGenkit(explainWordInContextFlow);
