import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyColorMode, getColorMode, type ColorMode } from "@/lib/theme-mode";

export function ColorModeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ColorMode>("light");
  useEffect(() => {
    const sync = () => setMode(getColorMode());
    sync();
    window.addEventListener("studyhub-mode-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("studyhub-mode-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return (
    <Button type="button" variant="outline" size="icon" className={`size-11 rounded-lg ${className}`} onClick={() => applyColorMode(mode === "light" ? "dark" : "light")} aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"} title={mode === "light" ? "Dark mode" : "Light mode"}>
      {mode === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}
    </Button>
  );
}