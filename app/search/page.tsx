"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sitePath } from "@/lib/api";

const SCOPES = [
  { key: "questions", label: "问题", href: "/questions", hint: "搜红学之问" },
  { key: "characters", label: "人物", href: "/characters", hint: "搜人物档案" },
  { key: "community", label: "社区", href: "/community", hint: "搜帖子讨论" },
] as const;

/** 移动端全站搜索页：选板块 + 关键词，跳转到对应板块并带入搜索词。 */
export default function SearchPage() {
  const router = useRouter();
  const [kw, setKw] = useState("");
  const [scope, setScope] = useState<(typeof SCOPES)[number]["key"]>("questions");

  const go = (s: (typeof SCOPES)[number]["key"]) => {
    const target = SCOPES.find((x) => x.key === s)!;
    const q = kw.trim() ? `?q=${encodeURIComponent(kw.trim())}` : "";
    router.push(sitePath(`${target.href}${q}`));
  };

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-16">
      <h1 className="font-serif text-2xl font-semibold text-ink">搜索</h1>
      <p className="mt-1 text-xs text-muted">搜什么？如「黛玉」「葬花」…</p>

      <div className="relative mt-4">
        <input
          type="search"
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go(scope);
          }}
          placeholder="输入关键词"
          aria-label="全站搜索关键词"
          autoFocus
          className="w-full rounded-full border border-line bg-surface px-5 py-3 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
        />
      </div>

      <p className="mt-5 text-xs text-muted">搜索范围：</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {SCOPES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setScope(s.key)}
            onDoubleClick={() => go(s.key)}
            className={`rounded-2xl border p-3 text-center transition-colors ${
              scope === s.key ? "border-primary bg-primary/10 text-primary" : "border-line bg-surface text-body"
            }`}
          >
            <span className="block font-serif text-sm">{s.label}</span>
            <span className="mt-0.5 block text-[11px] text-muted">{s.hint}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => go(scope)}
        className="mt-5 w-full rounded-full bg-primary py-3 font-serif text-sm text-paper transition-colors active:bg-primary-deep"
      >
        搜索{SCOPES.find((s) => s.key === scope)?.label}
      </button>
      <p className="mt-3 text-center text-[11px] text-muted">Enter 或点上方按钮，跳转到对应板块并带入关键词</p>
    </div>
  );
}
