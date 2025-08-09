import { onCallGenkit, HttpsError } from "firebase-functions/v2/https";
import { genkit, z } from "genkit";
import { vertexAI, gemini20Flash001 } from '@genkit-ai/vertexai';
import * as admin from 'firebase-admin';
import { isUserAuthorized } from "./auth";
import {
    explanationSchema,
    englishExplanationSchema,
    imageAnalysisSchema,
    chineseSentenceGenerationSchema,
    generateChineseSentencesInputSchema,
} from "./schema";

let firebaseApp: admin.app.App;

// according to the docs, there's no need for an API key when using the vertex API,
// as instead the service principal is granted a vertex API role.
// that said, "you have no secrets bound" shows as a debug log.
// the docs aren't super clear, but see
// https://firebase.google.com/docs/functions/oncallgenkit?hl=en&authuser=0#api-creds
// and choose the Gemini (Vertex AI) tab.
const ai = genkit({
    plugins: [
        vertexAI({ location: 'us-central1' }),
    ],
    model: gemini20Flash001,
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
    if (!firebaseApp) {
        firebaseApp = admin.initializeApp();
    }
    // TODO: there's some authorization syntactic sugar with onCallGenkit, but it appears deprecated
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await explainChinesePrompt({ text });
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
    if (!firebaseApp) {
        firebaseApp = admin.initializeApp();
    }
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await explainEnglishPrompt({ text });
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
    if (!firebaseApp) {
        firebaseApp = admin.initializeApp();
    }
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await analyzeImagePrompt({ base64ImageUrl });
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const analyzeImage = onCallGenkit(analyzeImageFlow);

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
    if (!firebaseApp) {
        firebaseApp = admin.initializeApp();
    }
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const { output } = await generateChineseSentencesPrompt(request);
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const generateChineseSentences = onCallGenkit(generateChineseSentencesFlow);
