import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("hanzigraph-ai");
const model = "vertexai/gemini-3-flash-preview";

/**
 * Trace one privacy-safe Genkit prompt invocation with OpenInference metadata.
 * @param {string} name Stable operation name for the model call.
 * @param {Function} prompt Genkit prompt invocation.
 * @return {Promise} The prompt response.
 */
export async function tracePrompt<T>(name: string, prompt: () => Promise<T>): Promise<T> {
    return tracer.startActiveSpan(
        name,
        {
            attributes: {
                "openinference.span.kind": "LLM",
                "llm.provider": "google",
                "llm.model_name": model,
            },
        },
        async (span) => {
            try {
                const response = await prompt();
                span.setStatus({ code: SpanStatusCode.OK });
                return response;
            } catch (error) {
                if (error instanceof Error) span.recordException(error);
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: error instanceof Error ? error.message : "Unknown AI error",
                });
                throw error;
            } finally {
                span.end();
            }
        },
    );
}
