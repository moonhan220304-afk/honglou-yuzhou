"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sitePath } from "@/lib/api";

const SCOPES = [
  { key: "questions", label: "问题" },
  { key: "characters", label: "人物" },
  { key: "community", label: "社区" },
] as const;

type ScopeKey = (typeof SCOPES)[number]["key"];

const SCOPE_PATH: Record<ScopeKey, string> = {
  questions: "/questions",
  characters: "/characters",
  community: "/community",
};

/** 全站搜索入口：点开面板选板块、输入关键词，跳转到对应板块并带入搜索词。 */
export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kw, setKw] = useState("");
  const [scope, setScope] = useState<ScopeKey>("questions");

  const go = (s: ScopeKey) => {
    const q = kw.trim() ? `?q=${encodeURIComponent(kw.trim())}` : "";
    router.push(sitePath(`${SCOPE_PATH[s]}${q}`));
    setOpen(false);
    setKw("");
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
      )}
      <div className="relative">
        <button
          type="button"
          aria-label="全站搜索"
          onClick={() => setOpen((v) => !v)}
          className="text-muted transition-colors hover:text-primary"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.8-3.8" />
          </svg>
        </button>

        {open && (
          <div className="fixed right-4 top-16 z-50 w-72 rounded-2xl border border-line bg-surface p-4 shadow-hover">
            <div className="relative">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.8-3.8" />
              </svg>
              <input
                type="search"
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") go(scope);
                }}
                placeholder="搜什么？如「黛玉」「葬花」…"
                aria-label="全站搜索关键词"
                autoFocus
                className="w-full rounded-full border border-line bg-paper/70 py-2 pl-10 pr-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
              />
            </div>
            <p className="mt-3 text-xs text-muted">搜索范围：</p>
            <div className="mt-2 flex gap-2">
              {SCOPES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => go(s.key)}
                  onMouseEnter={() => setScope(s.key)}
                  className={`flex-1 rounded-full px-3 py-1.5 text-xs transition-colors ${
                    scope === s.key
                      ? "bg-primary text-paper"
                      : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted">
              Enter 直接搜索{scope === "questions" ? "问题" : scope === "characters" ? "人物" : "社区帖子"}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
