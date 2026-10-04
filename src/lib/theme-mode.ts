export type ColorMode = "light" | "dark";

const key = "studyhub-color-mode";

export function applyColorMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", mode === "dark");
  window.localStorage.setItem(key, mode);
  window.dispatchEvent(new Event("studyhub-mode-change"));
}

export function getColorMode(): ColorMode {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(key) === "dark" ? "dark" : "light";
}