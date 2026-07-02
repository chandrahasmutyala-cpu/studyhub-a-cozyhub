import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { translateTranscript, translateScreenshot } from "@/lib/translator.functions";
import { Languages, Loader2, Upload, Sparkles, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/media-translator")({
  component: TranslatorPage,
});

type Lang = "japanese" | "chinese" | "korean";
type Sentence = { i?: number; src: string; en: string; reading?: string; notes?: string };
type TranscriptResult = { sentences?: Sentence[]; raw?: string };
type ImageResult = { overlayUrl?: string; note?: string; sentences?: Sentence[]; vocab?: { w: string; reading?: string; en: string }[]; grammar?: string[]; raw?: string };

function TranslatorPage() {
  const [tab, setTab] = useState<"transcript" | "screenshot">("transcript");
  return (
    <AppShell>
      <div className="max-w-4xl space-y-5 animate-fade-up">
        <header>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Module</div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-2 mt-1">
            <Languages className="size-7 text-primary" /> Language Media Translator
          </h1>
          <p className="text-sm text-muted-foreground">Paste a transcript or upload a screenshot. Japanese / Chinese / Korean → English with sentence-level breakdowns.</p>
        </header>

        <div className="flex gap-1 bg-white/80 backdrop-blur p-1 rounded-full border border-border w-fit">
          {([
            { id: "transcript", label: "Transcript", icon: FileText },
            { id: "screenshot", label: "Screenshot", icon: ImageIcon },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 ${tab === t.id ? "bg-primary" : "text-muted-foreground"}`}>
              <t.icon className="size-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "transcript" ? <TranscriptPanel /> : <ScreenshotPanel />}

        <div className="bg-white/80 backdrop-blur rounded-3xl border border-border p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Why no auto video-fetching?</strong> Pulling captions from YouTube, TikTok, etc.
          isn't reliable from inside the app and risks platform/copyright issues. Instead, paste the captions or transcript
          (the YouTube three-dot menu → "Show transcript" works great). On mobile, screenshot a subtitle line and use the Screenshot tab.
        </div>
      </div>
    </AppShell>
  );
}

function LangPicker({ value, onChange }: { value: Lang; onChange: (l: Lang) => void }) {
  return (
    <div className="flex gap-1 bg-cream p-1 rounded-full w-fit">
      {(["japanese","chinese","korean"] as Lang[]).map((l) => (
        <button key={l} onClick={() => onChange(l)}
          className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize ${value === l ? "bg-primary" : "text-muted-foreground"}`}>
          {l === "japanese" ? "日本語" : l === "chinese" ? "中文" : "한국어"}
        </button>
      ))}
    </div>
  );
}

function TranscriptPanel() {
  const translate = useServerFn(translateTranscript);
  const [lang, setLang] = useState<Lang>("japanese");
  const [text, setText] = useState("");
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function go() {
    if (!text.trim()) { toast.error("Paste a transcript first"); return; }
    setLoading(true); setResult(null);
    try {
      const res = await translate({ data: { text, language: lang } });
      setResult(res.result as TranscriptResult);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed to translate"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 space-y-3">
        <LangPicker value={lang} onChange={setLang} />
        <textarea value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Paste your transcript or subtitle lines here…"
          className="w-full min-h-[160px] bg-cream rounded-2xl px-4 py-3 text-sm outline-none" />
        <button onClick={go} disabled={loading}
          className="inline-flex items-center gap-2 bg-primary rounded-full px-5 py-2.5 font-bold text-sm disabled:opacity-40">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Translate & break down
        </button>
      </div>
      {result?.sentences && <SentenceList sentences={result.sentences} />}
      {result?.raw && <pre className="bg-white/85 border border-border rounded-2xl p-4 text-xs whitespace-pre-wrap">{result.raw}</pre>}
    </div>
  );
}

function ScreenshotPanel() {
  const translate = useServerFn(translateScreenshot);
  const [lang, setLang] = useState<Lang>("japanese");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageResult | null>(null);

  async function onFile(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    if (file.size > 5_000_000) { toast.error("Image must be under 5 MB"); return; }
    setLoading(true); setResult(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const res = await translate({ data: { imageBase64: base64, mimeType: file.type, language: lang } });
      setResult(res.result as ImageResult);
    } catch (err) { toast.error(err instanceof Error ? err.message : "OCR failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-3">
      <div className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 space-y-3">
        <LangPicker value={lang} onChange={setLang} />
        <label className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-primary block">
          <Upload className="size-6 mx-auto mb-2 text-muted-foreground" />
          <div className="font-bold text-sm">Click to upload screenshot</div>
          <div className="text-xs text-muted-foreground">PNG/JPG up to 5 MB</div>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </label>
        {preview && <img src={preview} alt="upload" className="max-h-72 rounded-2xl mx-auto" />}
        {loading && <div className="text-xs text-muted-foreground flex items-center gap-2"><Loader2 className="size-3 animate-spin" /> Reading the image…</div>}
      </div>

      {result?.overlayUrl && (
        <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5 space-y-3">
          <h3 className="font-display font-bold">English overlay</h3>
          <img src={result.overlayUrl} alt="translated screenshot" className="rounded-2xl mx-auto max-h-[70vh] border border-border" />
          {result.note && <p className="text-xs text-muted-foreground">{result.note}</p>}
          <a href={result.overlayUrl} download="translated.png" className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-bold">Download</a>
        </section>
      )}

      {result?.sentences && result.sentences.length > 0 && <SentenceList sentences={result.sentences} />}
      {result?.vocab && result.vocab.length > 0 && (
        <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5">
          <h3 className="font-display font-bold mb-2">Key vocabulary</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {result.vocab.map((v, i) => (
              <div key={i} className="bg-cream rounded-2xl p-3">
                <div className="font-bold">{v.w}</div>
                {v.reading && <div className="text-[11px] text-muted-foreground">{v.reading}</div>}
                <div className="text-xs">{v.en}</div>
              </div>
            ))}
          </div>
        </section>
      )}
      {result?.grammar && result.grammar.length > 0 && (
        <section className="bg-white/85 backdrop-blur border border-border rounded-3xl p-5">
          <h3 className="font-display font-bold mb-2">Grammar notes</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">{result.grammar.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </section>
      )}
      {result?.raw && <pre className="bg-white/85 border border-border rounded-2xl p-4 text-xs whitespace-pre-wrap">{result.raw}</pre>}
    </div>
  );
}

function SentenceList({ sentences }: { sentences: Sentence[] }) {
  return (
    <div className="space-y-2">
      {sentences.map((s, i) => (
        <article key={i} className="bg-white/85 backdrop-blur border border-border rounded-2xl p-4">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="text-base font-bold">{s.src}</div>
            {s.i !== undefined && <span className="text-[10px] font-bold text-muted-foreground">#{s.i}</span>}
          </div>
          {s.reading && <div className="text-[11px] text-muted-foreground">{s.reading}</div>}
          <div className="text-sm mt-1">{s.en}</div>
          {s.notes && <div className="text-[11px] text-primary-foreground bg-primary rounded-full inline-block px-2 py-0.5 mt-2">💡 {s.notes}</div>}
        </article>
      ))}
    </div>
  );
}
