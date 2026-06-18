import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { doodleKittyEdit } from "@/lib/doodlekitty.functions";
import { Cat, Upload, Sparkles, Loader2, Download, RotateCcw, Link as LinkIcon, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/doodlekitty")({
  component: DoodleKittyPage,
});

type Summary = { detected: string[]; doodles: string[]; annotations: string[] };
type Loaded = { base64: string; mime: string; preview: string };

const EXAMPLE_PROMPTS = [
  "Add cat ears, whiskers and a few hearts",
  "Annotate the hair with wind lines and label 'windy'",
  "Add a math equation arrow pointing to the book",
  "Just sparkles and tiny stars in the sky",
];

function DoodleKittyPage() {
  const generate = useServerFn(doodleKittyEdit);
  const [image, setImage] = useState<Loaded | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(file: File | null | undefined) {
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      toast.error("Please upload a PNG, JPG, or WEBP image.");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      toast.error("Image must be smaller than 6 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = String(e.target?.result ?? "");
      const base64 = dataUrl.split(",")[1] ?? "";
      setImage({ base64, mime: file.type, preview: dataUrl });
      setResult(null);
      setSummary(null);
    };
    reader.readAsDataURL(file);
  }

  async function loadUrl() {
    if (!url.trim()) return;
    try {
      const r = await fetch(url.trim());
      if (!r.ok) throw new Error("Could not load image");
      const blob = await r.blob();
      if (!/^image\/(png|jpe?g|webp)$/.test(blob.type)) {
        toast.error("URL must point to a PNG, JPG, or WEBP image.");
        return;
      }
      const buf = await blob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      const base64 = btoa(bin);
      setImage({ base64, mime: blob.type, preview: `data:${blob.type};base64,${base64}` });
      setResult(null);
      setSummary(null);
      setUrl("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load image. CORS may be blocking it.");
    }
  }

  async function run() {
    if (!image) return;
    setLoading(true);
    setResult(null);
    setSummary(null);
    try {
      const { imageUrl, summary } = await generate({
        data: {
          imageBase64: image.base64,
          mimeType: image.mime,
          prompt: prompt.trim() || undefined,
        },
      });
      setResult(imageUrl);
      setSummary(summary);
      toast.success("DoodleKitty annotated your photo ✦");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImage(null);
    setResult(null);
    setSummary(null);
    setPrompt("");
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-border text-[10px] font-bold uppercase tracking-widest">
            <Cat className="size-3.5" /> DoodleKitty · white ink edition
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Hand-drawn white doodles, automatically.
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Upload a photo. DoodleKitty analyzes it and sketches white cat ears, whiskers,
            sparkles, arrows, formulas, and tiny labels — like an artist annotated it by hand.
          </p>
        </header>

        <div className="grid lg:grid-cols-[300px_1fr_280px] gap-5">
          {/* LEFT — input + settings */}
          <aside className="space-y-4">
            <Panel title="Upload">
              {!image ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-border bg-cream/50 hover:bg-cream grid place-items-center text-center px-4 transition"
                >
                  <div className="space-y-2">
                    <Upload className="size-7 mx-auto text-muted-foreground" />
                    <div className="text-sm font-bold">Drop a photo</div>
                    <div className="text-[11px] text-muted-foreground">PNG · JPG · WEBP · up to 6 MB</div>
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  <img src={image.preview} alt="upload" className="w-full rounded-2xl border border-border" />
                  <button onClick={reset} className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold rounded-full bg-white border border-border py-2 hover:bg-secondary">
                    <RotateCcw className="size-3.5" /> Replace
                  </button>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0])}
              />
            </Panel>

            <Panel title="Paste image URL">
              <div className="flex gap-1.5">
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="flex-1 text-xs rounded-full border border-border bg-cream px-3 py-2 outline-none"
                />
                <button onClick={loadUrl} className="size-9 rounded-full bg-white border border-border grid place-items-center" aria-label="Load URL">
                  <LinkIcon className="size-3.5" />
                </button>
              </div>
            </Panel>

            <Panel title="Doodle instructions (optional)">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Leave blank for fully automatic. Or describe doodles like: 'add cat ears, hearts, label the smile cute'"
                className="w-full text-sm rounded-2xl border border-border bg-cream px-3 py-2 outline-none resize-none"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrompt(p)}
                    className="text-[10px] font-semibold rounded-full bg-white border border-border px-2 py-1 hover:bg-secondary"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Panel>

            <button
              onClick={run}
              disabled={!image || loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-bold disabled:opacity-50 shadow-soft hover:shadow-pop transition"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
              {loading ? "Doodling…" : "Doodle this"}
            </button>
          </aside>

          {/* CENTER — preview */}
          <section className="bg-white/90 backdrop-blur border border-border rounded-3xl p-5 min-h-[480px] shadow-soft">
            {!image && (
              <div className="h-full min-h-[440px] grid place-items-center text-center text-sm text-muted-foreground">
                <div className="space-y-2">
                  <Cat className="size-10 mx-auto text-primary/60" />
                  <p>Upload a photo to see your annotated artwork here.</p>
                </div>
              </div>
            )}

            {image && !result && !loading && (
              <div className="grid place-items-center">
                <img src={image.preview} alt="original" className="max-h-[600px] rounded-2xl border border-border" />
                <p className="text-xs text-muted-foreground mt-3">Tap <b>Doodle this</b> to begin.</p>
              </div>
            )}

            {loading && (
              <div className="h-full min-h-[440px] grid place-items-center text-center">
                <div className="space-y-3">
                  <div className="relative size-16 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-peach animate-ping opacity-40" />
                    <div className="absolute inset-2 rounded-full bg-peach-soft grid place-items-center">
                      <Cat className="size-7" />
                    </div>
                  </div>
                  <p className="text-sm font-bold">Sketching white doodles…</p>
                  <p className="text-xs text-muted-foreground">Usually 10–30 seconds.</p>
                </div>
              </div>
            )}

            {result && image && (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Frame label="Before" src={image.preview} />
                  <Frame label="After ✦" src={result} highlight />
                </div>
                <div className="flex justify-center gap-2">
                  <a
                    href={result}
                    download={`doodlekitty-${Date.now()}.png`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold shadow-soft hover:shadow-pop transition"
                  >
                    <Download className="size-4" /> Download
                  </a>
                  <button
                    onClick={run}
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-border px-5 py-2.5 text-sm font-bold hover:bg-secondary"
                  >
                    <Sparkles className="size-4" /> Try another variation
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT — summary */}
          <aside className="space-y-4">
            <Panel title="DoodleKitty analysis">
              {!summary ? (
                <p className="text-xs text-muted-foreground">
                  After generating, you'll see what DoodleKitty detected and the doodles she added here.
                </p>
              ) : (
                <div className="space-y-3">
                  <ChipGroup label="Detected" items={summary.detected} fallback="Nothing notable detected" />
                  <ChipGroup label="Applied doodles" items={summary.doodles} fallback="No doodles applied" />
                  <ChipGroup label="Handwritten annotations" items={summary.annotations} fallback="No annotations" />
                </div>
              )}
            </Panel>

            <Panel title="How it works">
              <ul className="text-[11px] text-muted-foreground space-y-1.5 leading-relaxed">
                <li>• Only <b>white ink</b> doodles — no colors, no stickers, no emojis.</li>
                <li>• Auto-detects faces, hair motion, study desks, landscapes, animals…</li>
                <li>• Add custom instructions any time to override.</li>
                <li>• Original photo stays untouched underneath.</li>
              </ul>
            </Panel>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/90 backdrop-blur border border-border p-4 shadow-soft space-y-2.5">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}

function ChipGroup({ label, items, fallback }: { label: string; items: string[]; fallback: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-1">{label}</div>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">{fallback}</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {items.map((i) => (
            <span key={i} className="text-[10px] font-semibold rounded-full bg-cream border border-border px-2 py-0.5 capitalize">{i}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function Frame({ label, src, highlight }: { label: string; src: string; highlight?: boolean }) {
  return (
    <figure className="space-y-1">
      <figcaption className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{label}</figcaption>
      <img
        src={src}
        alt={label}
        className={`w-full rounded-2xl border ${highlight ? "border-primary shadow-pop" : "border-border"}`}
      />
    </figure>
  );
}
