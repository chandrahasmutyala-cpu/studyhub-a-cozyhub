import { useEffect, useRef, useState } from "react";
import { Play, Pause, SkipForward, Music } from "lucide-react";
import sleepyKitten from "@/assets/sleepy-kitten.mp3.asset.json";
import pandaSleepy from "@/assets/panda-sleepy.mp3.asset.json";

const TRACKS = [
  { name: "Sleepy Kitten Purrs", url: sleepyKitten.url },
  { name: "Panda Sleepy Panda", url: pandaSleepy.url },
];

/**
 * Floating ambient music player. Loops the playlist while the app is open.
 * Browsers block autoplay-with-sound, so it starts paused and waits for the
 * user to tap play (or any first interaction).
 */
export function MusicPlayer() {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.volume = 0.35;
    const onEnded = () => setIdx((i) => (i + 1) % TRACKS.length);
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, []);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    if (playing) a.play().catch(() => setPlaying(false));
  }, [idx, playing]);

  function toggle() {
    const a = ref.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  }

  function next() {
    setIdx((i) => (i + 1) % TRACKS.length);
    if (!playing) setPlaying(true);
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur border border-border shadow-soft px-3 py-2">
      <audio ref={ref} src={TRACKS[idx].url} preload="none" />
      <button onClick={toggle} aria-label={playing ? "Pause music" : "Play music"}
        className="size-9 rounded-full bg-primary grid place-items-center">
        {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
      <div className="hidden sm:flex flex-col leading-tight pr-2">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Music className="size-3" /> Ambient
        </span>
        <span className="text-xs font-bold truncate max-w-[140px]">{TRACKS[idx].name}</span>
      </div>
      <button onClick={next} aria-label="Next track"
        className="size-8 rounded-full hover:bg-muted grid place-items-center">
        <SkipForward className="size-3.5" />
      </button>
    </div>
  );
}
