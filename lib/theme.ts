"use client";

/** 明暗主题：三态（light / dark / system），持久化到 localStorage['hlm_theme']，缺省跟随系统。 */

export type ThemeMode = "light" | "dark" | "system";

export function getStoredTheme(): ThemeMode {
  try {
    const v = localStorage.getItem("hlm_theme");
    return v === "light" || v === "dark" || v === "system" ? v : "system";
  } catch {
    return "system";
  }
}

export function isDark(mode: ThemeMode): boolean {
  return mode === "dark" || (mode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  if (isDark(mode)) document.documentElement.setAttribute("data-theme-dark", "1");
  else document.documentElement.removeAttribute("data-theme-dark");
  try {
    localStorage.setItem("hlm_theme", mode);
  } catch {}
}

/** 监听系统深浅色变化（system 态下自动跟随） */
export function watchSystemTheme(mode: ThemeMode, onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => {
    if (mode === "system") onChange();
  };
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}
