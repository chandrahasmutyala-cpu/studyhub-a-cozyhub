// Server-only Groq client. Never import from client code.
import process from "node:process";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

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
    if (isMissingModel && model !== DEFAULT_GROQ_MODEL) {
      res = await requestGroq({ ...body, model: DEFAULT_GROQ_MODEL }, apiKey);
      if (res.ok) {
        const json = (await res.json()) as GroqResponse;
        return json.choices?.[0]?.message?.content ?? "";
      }
    }
    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 401) throw new Error("The Groq key was rejected. Update GROQ_API_KEY in the project secrets.");
    if (isMissingModel) throw new Error("The configured AI model is unavailable. Update GROQ_MODEL in the project secrets.");
    if (res.status >= 500) throw new Error("AI is temporarily unavailable. Please try again shortly.");
    console.error("Groq request failed", { status: res.status, body: text.slice(0, 500) });
    throw new Error("AI could not complete that request. Please try again.");
  }

  const json = (await res.json()) as GroqResponse;
  return json.choices?.[0]?.message?.content ?? "";
}
