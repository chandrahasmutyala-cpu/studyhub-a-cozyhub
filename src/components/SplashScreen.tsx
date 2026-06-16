import { useEffect, useState } from "react";
import splashAsset from "@/assets/studyhub-splash.png.asset.json";

const SEEN_KEY = "studyhub-splash-seen-v1";

/**
 * Full-screen intro splash shown on first load per session.
 * Uses the exact uncropped image with object-contain so nothing is cropped.
 */
export function SplashScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SEEN_KEY) !== "1";
  });

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(SEEN_KEY, "1");
      setShow(false);
    }, 2200);
    return () => clearTimeout(t);
  }, [show]);

  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-cream animate-fade-up"
      onClick={() => { sessionStorage.setItem(SEEN_KEY, "1"); setShow(false); }}
    >
      <img
        src={splashAsset.url}
        alt="StudyHub — Learn. Plan. Achieve."
        className="max-w-full max-h-full w-auto h-auto object-contain"
      />
    </div>
  );
}
