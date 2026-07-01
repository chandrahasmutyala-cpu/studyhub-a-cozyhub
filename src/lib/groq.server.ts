// Server-only Groq client. Never import from client code.
import process from "node:process";

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function groqChat(opts: {
  messages: ChatMsg[];
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("AI is not configured — GROQ_API_KEY is missing.");

  const body: Record<string, unknown> = {
    model: opts.model ?? "llama-3.3-70b-versatile",
    messages: opts.messages,
    temperature: opts.temperature ?? 0.7,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("AI is busy right now — try again in a moment.");
    if (res.status === 401) throw new Error("Groq API key is invalid. Please update GROQ_API_KEY.");
    throw new Error(`AI error ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? "";
}
