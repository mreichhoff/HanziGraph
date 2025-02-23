import { onCallGenkit, HttpsError } from "firebase-functions/v2/https";
import { genkit, z } from "genkit";
import { vertexAI, gemini20Flash001 } from '@genkit-ai/vertexai';
import { initializeApp, app } from "firebase-admin";
import { isUserAuthorized } from "./auth";
import { explanationSchema, englishExplanationSchema } from "./schema";

let firebaseApp: app.App;

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
});

// TODO: dig into streamSchema and streaming structured responses
const explainFlow = ai.defineFlow({
    name: "explainText",
    inputSchema: z.string(),
    outputSchema: explanationSchema,
}, async (text, { context }) => {
    if (!firebaseApp) {
        firebaseApp = initializeApp();
    }
    // TODO: there's some authorization syntactic sugar with onCallGenkit, but it appears deprecated
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }

    const prompt = `Explain the Chinese text ${text}.`;

    const { output } = await ai.generate({ model: gemini20Flash001, prompt, output: { schema: explanationSchema } });
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
        firebaseApp = initializeApp();
    }
    const isAuthorized = await isUserAuthorized(context);
    if (!isAuthorized) {
        throw new HttpsError("permission-denied", "user not authorized");
    }
    const prompt = `Translate the English text ${text} into Chinese, and explain the translation.`;
    const { output } = await ai.generate({
        model: gemini20Flash001,
        prompt,
        output: { schema: englishExplanationSchema },
    });
    if (!output) {
        throw new HttpsError("internal", 'oh no, the model like, failed?');
    }
    return output;
});

export const explainText = onCallGenkit(explainFlow);

export const explainEnglishText = onCallGenkit(explainEnglishFlow);
