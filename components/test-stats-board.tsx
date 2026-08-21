"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TestStats } from "@/lib/api";
import { archetypes } from "@/lib/test-data";
import { characterImages } from "@/lib/images";

/** 测试页数据看板：站内测过的人数 + 各类型分布（真实数据） */
export default function TestStatsBoard() {
  const [stats, setStats] = useState<TestStats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ stats: TestStats }>("/api/test/stats");
        setStats(r.stats);
      } catch {
        setStats(null);
      }
    })();
  }, []);

  if (!stats || stats.total === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-8 text-center">
        <p className="font-serif text-lg text-secondary-btn-text">还没有人完成测试</p>
        <p className="mt-1 text-xs text-muted">来做第一个吧，测完就能看到站内统计啦</p>
      </div>
    );
  }

  const byTypeMap = new Map(stats.byType.map((t) => [t.archetype_id, t.c]));
  const sorted = [...archetypes].sort((a, b) => (byTypeMap.get(b.id) ?? 0) - (byTypeMap.get(a.id) ?? 0));

  return (
    <div className="rounded-3xl bg-surface card-print card-print--questions p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h2 className="font-serif text-lg font-semibold text-ink">站内同好统计</h2>
        <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
          {stats.total} 人已测
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted">数据来自站内真实测试结果，每次测试完自动更新</p>
      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {sorted.map((a) => {
          const n = byTypeMap.get(a.id) ?? 0;
          const avatar = characterImages[a.character_id] ?? null;
          return (
            <div
              key={a.id}
              title={`${a.title} · ${n} 人`}
              className={`flex flex-col items-center gap-1.5 rounded-xl p-2 text-center transition-colors ${
                n > 0 ? "bg-surface-warm shadow-card" : "opacity-45"
              }`}
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={a.id}
                  className={`h-10 w-10 rounded-full object-cover ${n > 0 ? "ring-1 ring-gold/50" : "grayscale"}`}
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-deep font-serif text-sm text-muted">
                  {a.id.charAt(0)}
                </span>
              )}
              <span className="font-mono text-xs text-primary">{n > 0 ? n : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
