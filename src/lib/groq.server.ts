// Server-only Groq client. Never import from client code.
import process from "node:process";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";

const MODEL_FALLBACKS = [
  DEFAULT_GROQ_MODEL,
  "llama-3.3-70b-versatile",
  "llama-4-scout-17b-16e-instruct",
  "llama-3.1-8b-instant",
] as const;

type GroqResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { code?: string; message?: string };
};

async function requestGroq(body: Record<string, unknown>, apiKey: string) {
  return fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function listAvailableModels(apiKey: string): Promise<Set<string>> {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) return new Set();

  const json = (await res.json().catch(() => null)) as
    | { data?: { id?: string }[] }
    | null;
  return new Set(
    (json?.data ?? [])
      .map((entry) => entry.id)
      .filter((id): id is string => Boolean(id)),
  );
}

async function chooseFallbackModel(apiKey: string, configuredModel?: string) {
  const available = await listAvailableModels(apiKey);
  const candidates = [configuredModel, ...MODEL_FALLBACKS].filter(
    (model): model is string => Boolean(model),
  );

  return candidates.find((model) => available.has(model)) ?? DEFAULT_GROQ_MODEL;
}

async function requestWithModelFallback(
  body: Record<string, unknown>,
  apiKey: string,
  configuredModel?: string,
) {
  const availableModel = await chooseFallbackModel(apiKey, configuredModel);
  const candidates = [
    availableModel,
    configuredModel,
    ...MODEL_FALLBACKS,
  ].filter((model, index, all): model is string => Boolean(model) && all.indexOf(model) === index);

  let lastResponse: Response | null = null;
  for (const candidate of candidates) {
    const response = await requestGroq({ ...body, model: candidate }, apiKey);
    if (response.ok || response.status !== 404) return response;
    lastResponse = response;
  }

  return lastResponse ?? requestGroq({ ...body, model: DEFAULT_GROQ_MODEL }, apiKey);
}

export async function groqChat(opts: {
  messages: ChatMsg[];
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env["GROQ_API_KEY"]?.trim();
  if (!apiKey) throw new Error("AI is not configured yet. Add GROQ_API_KEY in the project secrets.");

  const configuredModel = process.env["GROQ_MODEL"]?.trim();
  const model = opts.model ?? configuredModel ?? DEFAULT_GROQ_MODEL;

  const body: Record<string, unknown> = {
    model: opts.model ?? model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  let res = await requestGroq(body, apiKey);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const isMissingModel = res.status === 404 || /model|decommission|not found/i.test(text);
    if (isMissingModel) {
      res = await requestWithModelFallback(body, apiKey, configuredModel);
      if (res.ok) {
        const json = (await res.json()) as GroqResponse;
        return json.choices?.[0]?.message?.content ?? "";
      }
    }
    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 401) throw new Error("The Groq key was rejected. Update GROQ_API_KEY in the project secrets.");
    if (isMissingModel) throw new Error("No available Groq AI model could complete this request. Check the Groq account and model access.");
    if (res.status >= 500) throw new Error("AI is temporarily unavailable. Please try again shortly.");
    console.error("Groq request failed", { status: res.status, body: text.slice(0, 500) });
    throw new Error("AI could not complete that request. Please try again.");
  }

  const json = (await res.json()) as GroqResponse;
  return json.choices?.[0]?.message?.content ?? "";
}
