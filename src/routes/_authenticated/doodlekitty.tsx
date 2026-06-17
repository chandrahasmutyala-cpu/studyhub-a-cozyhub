import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { doodleKittyEdit } from "@/lib/doodlekitty.functions";
import { Cat, Upload, Sparkles, Loader2, Download, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/doodlekitty")({
  component: DoodleKittyPage,
});

type StyleId = "cat-girl" | "kawaii" | "sketchbook" | "math-notes" | "scrapbook" | "dreamy" | "anime";
type Density = "light" | "medium" | "heavy";

const STYLES: { id: StyleId; emoji: string; name: string; tagline: string }[] = [
  { id: "cat-girl", emoji: "🐱", name: "Cat Girl", tagline: "Cat ears, whiskers, hearts" },
  { id: "kawaii", emoji: "🎀", name: "Kawaii", tagline: "Japanese sticker aesthetic" },
  { id: "sketchbook", emoji: "✏️", name: "Sketchbook", tagline: "Hand-drawn notebook doodles" },
  { id: "math-notes", emoji: "📐", name: "Math Notes", tagline: "White geometry & equations" },
  { id: "scrapbook", emoji: "📷", name: "Scrapbook", tagline: "Polaroid + journal vibe" },
  { id: "dreamy", emoji: "🌙", name: "Dreamy", tagline: "Stars, moons, sparkles" },
  { id: "anime", emoji: "✨", name: "Anime", tagline: "Expressive doodles & effects" },
];

function DoodleKittyPage() {
  const generate = useServerFn(doodleKittyEdit);
  const [imageData, setImageData] = useState<{ base64: string; mime: string; preview: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [style, setStyle] = useState<StyleId>("cat-girl");
  const [density, setDensity] = useState<Density>("medium");
  const [extra, setExtra] = useState("");
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
      setImageData({ base64, mime: file.type, preview: dataUrl });
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  async function run() {
    if (!imageData) return;
    setLoading(true);
    setResult(null);
    try {
      const { imageUrl } = await generate({
        data: {
          imageBase64: imageData.base64,
          mimeType: imageData.mime,
          style,
          density,
          customPrompt: extra || undefined,
        },
      });
      setResult(imageUrl);
      toast.success("Your doodle is ready ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setImageData(null);
    setResult(null);
    setExtra("");
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero */}
        <header className="text-center space-y-2 py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-peach-soft border border-border text-xs font-bold uppercase tracking-wider">
            <Cat className="size-3.5" /> DoodleKitty
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">
            Turn your photos into cute doodle art <span className="inline-block">✨</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Upload any photo and let AI draw adorable cat ears, hearts, sparkles, handwritten notes,
            and aesthetic sketches over it — like a real artist's doodle.
          </p>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="space-y-4">
            <Panel title="1 · Upload">
              {!imageData ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full aspect-[4/5] rounded-3xl border-2 border-dashed border-border bg-cream/60 hover:bg-cream grid place-items-center text-center px-4 transition"
                >
                  <div className="space-y-2">
                    <Upload className="size-7 mx-auto text-muted-foreground" />
                    <div className="text-sm font-bold">Drop your photo here</div>
                    <div className="text-xs text-muted-foreground">PNG, JPG, or WEBP · up to 6 MB</div>
                  </div>
                </button>
              ) : (
                <div className="space-y-2">
                  <img src={imageData.preview} alt="upload" className="w-full rounded-2xl border border-border" />
                  <button onClick={reset} className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold rounded-full bg-white border border-border py-2 hover:bg-secondary">
                    <RotateCcw className="size-3.5" /> Replace photo
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

            <Panel title="2 · Style">
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      style === s.id ? "border-primary bg-peach-soft" : "border-border bg-white hover:bg-secondary"
                    }`}
                  >
                    <div className="text-lg">{s.emoji}</div>
                    <div className="text-xs font-bold mt-1">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{s.tagline}</div>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="3 · Density">
              <div className="flex gap-1 bg-cream rounded-full p-1">
                {(["light", "medium", "heavy"] as Density[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`flex-1 px-3 py-1.5 rounded-full text-xs font-bold capitalize transition ${
                      density === d ? "bg-white shadow-soft" : "text-muted-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Panel>

            <Panel title="Extra ideas (optional)">
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                rows={3}
                placeholder="e.g. add a tiny crown above her head"
                className="w-full text-sm rounded-2xl border border-border bg-cream px-3 py-2 outline-none resize-none"
              />
            </Panel>

            <button
              onClick={run}
              disabled={!imageData || loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-bold disabled:opacity-50 shadow-soft hover:shadow-pop transition"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Doodling…" : "Generate doodles"}
            </button>
          </aside>

          {/* Canvas */}
          <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 min-h-[480px] shadow-soft">
            {!imageData && (
              <div className="h-full min-h-[440px] grid place-items-center text-center text-sm text-muted-foreground">
                <div className="space-y-2">
                  <Cat className="size-10 mx-auto text-primary/60" />
                  <p>Upload a photo on the left to see your doodled artwork here.</p>
                </div>
              </div>
            )}

            {imageData && !result && !loading && (
              <div className="grid place-items-center">
                <img src={imageData.preview} alt="original" className="max-h-[600px] rounded-2xl border border-border" />
                <p className="text-xs text-muted-foreground mt-3">Pick a style and tap <b>Generate doodles</b> ✨</p>
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
                  <p className="text-sm font-bold">Drawing kitty doodles…</p>
                  <p className="text-xs text-muted-foreground">This usually takes 10–30 seconds.</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Frame label="Original" src={imageData!.preview} />
                  <Frame label="Doodled ✨" src={result} highlight />
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
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white/85 backdrop-blur border border-border p-4 shadow-soft space-y-2">
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{title}</div>
      {children}
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
