import { useMemo } from "react";
import { HIRAGANA_BASIC, KATAKANA_BASIC } from "@/lib/japanese-data";

const positions = [
  "left-[4%] top-[14%]", "left-[17%] top-[34%]", "left-[30%] top-[9%]",
  "left-[44%] top-[27%]", "left-[59%] top-[12%]", "left-[73%] top-[39%]",
  "left-[88%] top-[19%]", "left-[10%] top-[70%]", "left-[25%] top-[83%]",
  "left-[39%] top-[64%]", "left-[54%] top-[86%]", "left-[68%] top-[69%]",
  "left-[84%] top-[79%]", "left-[93%] top-[53%]", "left-[3%] top-[49%]",
  "left-[48%] top-[4%]",
];

export function FloatingKanaBackground() {
  const glyphs = useMemo(() => {
    const source = [...HIRAGANA_BASIC, ...KATAKANA_BASIC];
    const korean = ["가", "한", "글", "봄", "빛", "별"];
    const chinese = ["学", "书", "月", "光", "梦", "文"];
    return positions.map((_, index) => index % 3 === 1
      ? korean[index % korean.length]
      : index % 3 === 2
        ? chinese[index % chinese.length]
        : source[(index * 7 + 3) % source.length]?.kana ?? "あ");
  }, []);

  return (
    <div className="floating-kana-background" aria-hidden="true">
      {glyphs.map((glyph, index) => (
        <span
          key={`${glyph}-${index}`}
          className={`floating-kana-glyph ${positions[index]}`}
          data-kana-index={index}
        >
          {glyph}
        </span>
      ))}
    </div>
  );
}