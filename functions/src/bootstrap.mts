import { createFirebaseSpanExporter } from "@agentpond/firebase";
import { initializeApp } from "firebase-admin/app";
import { NodeSDK } from "@opentelemetry/sdk-node";

initializeApp();

const telemetry = new NodeSDK({
    traceExporter: createFirebaseSpanExporter(),
});

telemetry.start();

const functions = await import("./index.js");

export const explainText = functions.explainText;
export const explainEnglishText = functions.explainEnglishText;
export const analyzeImage = functions.analyzeImage;
export const generateChineseSentences = functions.generateChineseSentences;
export const analyzeCollocation = functions.analyzeCollocation;
export const explainWordInContext = functions.explainWordInContext;
