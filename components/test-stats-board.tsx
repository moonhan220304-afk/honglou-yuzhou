"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { TestStats } from "@/lib/api";
import { archetypes } from "@/lib/test-data";
import { characterImages } from "@/lib/images";

const RANK_BADGE = [
  "bg-gold text-white", // 魁
  "bg-[#9CA3AF] text-white", // 亚
  "bg-[#C58A5A] text-white", // 季
];

/** 测试页数据看板：站内测过的人数 + 各类型排行榜（真实数据） */
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
      <div className="rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-serif text-lg text-primary">
          测
        </span>
        <p className="mt-3 font-serif text-lg text-secondary-btn-text">还没有人完成测试</p>
        <p className="mt-1 text-xs text-muted">来做第一个吧，测完就能看到站内统计啦</p>
      </div>
    );
  }

  const byTypeMap = new Map(stats.byType.map((t) => [t.archetype_id, t.c]));
  const sorted = [...archetypes]
    .filter((a) => (byTypeMap.get(a.id) ?? 0) > 0)
    .sort((a, b) => (byTypeMap.get(b.id) ?? 0) - (byTypeMap.get(a.id) ?? 0));
  const max = byTypeMap.get(sorted[0]?.id) ?? 1;

  return (
    <div className="card-print card-print--questions rounded-3xl bg-surface p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h2 className="font-serif text-lg font-semibold text-ink">站内同好统计</h2>
        <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
          {stats.total} 人已测
        </span>
      </div>
      <p className="mt-1.5 text-xs text-muted">数据来自站内真实测试结果，每次测试完自动更新</p>

      <ol className="mt-6 space-y-3.5">
        {sorted.map((a, i) => {
          const n = byTypeMap.get(a.id) ?? 0;
          const pct = stats.total > 0 ? Math.round((n / stats.total) * 100) : 0;
          const avatar = characterImages[a.character_id] ?? null;
          const rank = i + 1;
          const badgeCls = RANK_BADGE[i] ?? "text-muted";
          return (
            <li key={a.id} className="flex items-center gap-3">
              {/* 名次章 */}
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-serif text-xs font-semibold ${
                  rank <= 3 ? badgeCls : "text-muted"
                }`}
              >
                {rank}
              </span>
              {/* 头像 */}
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" src={avatar}
                  alt={a.title}
                  className={`h-9 w-9 shrink-0 rounded-full object-cover ${
                    rank === 1 ? "ring-2 ring-gold shadow-[0_0_10px_rgba(196,154,108,0.4)]" : n > 0 ? "ring-1 ring-line" : "opacity-45 grayscale"
                  }`}
                />
              ) : (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-deep font-serif text-sm text-muted">
                  {a.title.charAt(0)}
                </span>
              )}
              {/* 名称 + 进度条 */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-serif text-sm text-ink">{a.title}</span>
                  <span className="shrink-0 text-xs text-muted">{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-deep">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-all duration-500"
                    style={{ width: `${Math.max((n / max) * 100, n > 0 ? 6 : 0)}%` }}
                  />
                </div>
              </div>
              {/* 人数 */}
              <span className="w-9 shrink-0 text-right font-mono text-sm text-primary">{n > 0 ? n : "—"}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
