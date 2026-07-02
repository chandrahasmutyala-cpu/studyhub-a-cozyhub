// Pixazo (Nano Banana 2) image generation / image-to-image helper.
// Used ONLY by DoodleKitty and Media Translator screenshot mode.
// Groq remains the provider for every text feature.

const BASE = "https://gateway.pixazo.ai";

type SubmitBody = {
  prompt: string;
  image_urls?: string[];
  num_images?: number;
  aspect_ratio?: string;
  resolution?: "0.5K" | "1K" | "2K" | "4K";
  output_format?: "jpeg" | "png" | "webp";
};

type StatusResp = {
  request_id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "ERROR";
  error: string | null;
  output?: { media_url: string[]; media_type: string } | null;
};

function key(): string {
  const k = process.env.PICAZO_API_KEY;
  if (!k) throw new Error("PICAZO_API_KEY is not configured on the server.");
  return k;
}

async function submit(path: string, body: SubmitBody): Promise<string> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": key(),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Pixazo submit failed (${res.status}): ${t.slice(0, 300)}`);
  }
  const json = (await res.json()) as { request_id: string; status: string };
  if (!json.request_id) throw new Error("Pixazo did not return a request_id.");
  return json.request_id;
}

async function poll(requestId: string, timeoutMs = 90_000): Promise<StatusResp> {
  const started = Date.now();
  let delay = 2000;
  while (Date.now() - started < timeoutMs) {
    const r = await fetch(`${BASE}/v2/requests/status/${requestId}`, {
      headers: { "Ocp-Apim-Subscription-Key": key() },
    });
    if (r.ok) {
      const json = (await r.json()) as StatusResp;
      if (json.status === "COMPLETED") return json;
      if (json.status === "FAILED" || json.status === "ERROR") {
        throw new Error(json.error || `Pixazo job ${json.status.toLowerCase()}.`);
      }
    }
    await new Promise((res) => setTimeout(res, delay));
    delay = Math.min(delay + 1000, 6000);
  }
  throw new Error("Pixazo request timed out. Please try again.");
}

export async function pixazoImageToImage(opts: {
  prompt: string;
  imageUrl: string;
  aspectRatio?: string;
  resolution?: SubmitBody["resolution"];
  outputFormat?: SubmitBody["output_format"];
}): Promise<string> {
  const id = await submit("/nano-banana-2/v1/image-to-image-batch", {
    prompt: opts.prompt,
    image_urls: [opts.imageUrl],
    num_images: 1,
    aspect_ratio: opts.aspectRatio ?? "auto",
    resolution: opts.resolution ?? "1K",
    output_format: opts.outputFormat ?? "png",
  });
  const final = await poll(id);
  const url = final.output?.media_url?.[0];
  if (!url) throw new Error("Pixazo returned no output media.");
  return url;
}

export async function pixazoTextToImage(opts: {
  prompt: string;
  aspectRatio?: string;
  resolution?: SubmitBody["resolution"];
  outputFormat?: SubmitBody["output_format"];
}): Promise<string> {
  const id = await submit("/nano-banana-2-lite/v1/text-to-image", {
    prompt: opts.prompt,
    num_images: 1,
    aspect_ratio: opts.aspectRatio ?? "auto",
    resolution: opts.resolution ?? "1K",
    output_format: opts.outputFormat ?? "png",
  });
  const final = await poll(id);
  const url = final.output?.media_url?.[0];
  if (!url) throw new Error("Pixazo returned no output media.");
  return url;
}
