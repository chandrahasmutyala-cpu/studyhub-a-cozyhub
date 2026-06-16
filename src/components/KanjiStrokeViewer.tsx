import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Fetches the KanjiVG SVG for a single character from a CDN and renders it
 * with numbered arrows for each stroke.
 */
export function KanjiStrokeViewer({ kanji }: { kanji: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSvg(null); setError(null);
    const cp = kanji.codePointAt(0);
    if (!cp) return;
    const hex = cp.toString(16).padStart(5, "0");
    const url = `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`;
    let abort = false;
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("Stroke data not found"))))
      .then((text) => { if (!abort) setSvg(decorate(text)); })
      .catch((e) => { if (!abort) setError(e.message); });
    return () => { abort = true; };
  }, [kanji]);

  if (error) return <div className="text-xs text-muted-foreground">No stroke data available for {kanji}</div>;
  if (!svg) return <div className="grid place-items-center h-56"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>;
  return (
    <div
      className="w-full grid place-items-center [&_svg]:w-full [&_svg]:max-w-[280px] [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function decorate(rawSvg: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawSvg, "image/svg+xml");
    const svg = doc.querySelector("svg");
    if (!svg) return rawSvg;
    svg.setAttribute("style", "background:white;border-radius:16px;");

    doc.querySelectorAll("path").forEach((p) => {
      p.setAttribute("stroke", "#2a3a7a");
      p.setAttribute("stroke-width", "3");
      p.setAttribute("fill", "none");
      p.setAttribute("stroke-linecap", "round");
      p.setAttribute("stroke-linejoin", "round");
    });
    doc.querySelectorAll('[id^="kvg:StrokeNumbers"]').forEach((n) => n.remove());

    const paths = Array.from(doc.querySelectorAll("path"));
    const ns = "http://www.w3.org/2000/svg";
    const overlay = doc.createElementNS(ns, "g");

    paths.forEach((path, i) => {
      const d = path.getAttribute("d") ?? "";
      const m = d.match(/^[Mm]\s*(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/);
      if (!m) return;
      const x = parseFloat(m[1]);
      const y = parseFloat(m[2]);

      // arrow tip indicator (small triangle at start point)
      const arrow = doc.createElementNS(ns, "polygon");
      arrow.setAttribute("points", `${x - 4},${y + 4} ${x + 4},${y + 4} ${x},${y - 4}`);
      arrow.setAttribute("fill", "#f8d3d8");
      arrow.setAttribute("stroke", "#2a3a7a");
      arrow.setAttribute("stroke-width", "0.6");
      overlay.appendChild(arrow);

      const circle = doc.createElementNS(ns, "circle");
      circle.setAttribute("cx", String(x));
      circle.setAttribute("cy", String(y + 10));
      circle.setAttribute("r", "5.5");
      circle.setAttribute("fill", "#2a3a7a");
      overlay.appendChild(circle);

      const text = doc.createElementNS(ns, "text");
      text.setAttribute("x", String(x));
      text.setAttribute("y", String(y + 12));
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("font-size", "7");
      text.setAttribute("font-weight", "700");
      text.setAttribute("fill", "#ffffff");
      text.textContent = String(i + 1);
      overlay.appendChild(text);
    });

    svg.appendChild(overlay);
    return new XMLSerializer().serializeToString(svg);
  } catch {
    return rawSvg;
  }
}
