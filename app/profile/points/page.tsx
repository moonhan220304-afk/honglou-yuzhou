"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe } from "@/lib/api";
import type { Me, PointsResp } from "@/lib/api";
import { formatTime } from "@/lib/client-community";
import LevelBadge from "@/components/level-badge";
import {
  LEVEL_THRESHOLDS,
  levelProgressPct,
  nextLevelName,
  remainToNext,
  reasonLabel,
  POINTS_RULES,
} from "@/lib/levels";

/** 我的积分页：当前积分 / 等级 / 进度条 / 积分明细 */
export default function PointsPage() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [data, setData] = useState<PointsResp | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      const m = await fetchMe();
      setMe(m);
      if (!m) return;
      try {
        const r = await api<PointsResp>("/api/points");
        setData(r);
        setMe((cur) =>
          cur ? { ...cur, points: r.points, level: r.level, level_name: r.level_name } : cur,
        );
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "积分数据加载失败");
      }
    })();
  }, []);

  if (me === undefined) return <div className="min-h-[60vh]" />;
  if (me === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">请先登录</p>
        <Link
          href="/login?next=/profile/points"
          className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper"
        >
          去登录
        </Link>
      </div>
    );
  }

  const points = data?.points ?? me.points ?? 0;
  const level = data?.level ?? me.level ?? 1;
  const levelName = data?.level_name ?? me.level_name ?? "";
  const pct = levelProgressPct(points, level);
  const remain = remainToNext(points, level);
  const nextName = nextLevelName(level);
  const maxed = nextName === null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/profile" className="text-xs text-muted transition-colors hover:text-primary">
        ← 返回个人中心
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">我的积分</h1>

      {/* 积分总览 */}
      <section className="mt-6 rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <p className="text-xs text-muted">当前积分</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-primary">{points}</p>
          </div>
          <div>
            <p className="text-xs text-muted">当前等级</p>
            <div className="mt-1.5 flex items-center gap-2">
              <LevelBadge level={level} levelName={levelName} />
            </div>
          </div>
          <p className="ml-auto max-w-[240px] text-right text-xs leading-relaxed text-muted">
            {maxed
              ? "已臻元老之境，积分榜上的老前辈"
              : `距下一级「${nextName}」还差 ${remain} 分`}
          </p>
        </div>
        <div className="mt-5">
          <div className="h-2.5 overflow-hidden rounded-full bg-paper-deep">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            {LEVEL_THRESHOLDS.map((t) => (
              <span key={t} className={points >= t ? "text-primary" : ""}>
                {t}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[11px] text-muted/80">等级线：0 · 200 · 600 · 1500</p>
        </div>
      </section>

      {/* 积分明细 */}
      <section className="mt-6 rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
        <h2 className="flex items-center gap-3 font-serif text-lg font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          积分明细
        </h2>
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
        {!err && data === null && <p className="mt-4 text-sm text-muted">加载中…</p>}
        {!err && data !== null && data.logs.length === 0 && (
          <p className="mt-4 rounded-2xl bg-paper-deep/60 p-6 text-center text-sm text-muted">
            还没有积分记录——去发一帖、评一句，攒下第一分吧
          </p>
        )}
        {data !== null && data.logs.length > 0 && (
          <ul className="mt-4 divide-y divide-line-inner">
            {data.logs.map((log) => (
              <li key={log.id} className="flex items-center gap-3 py-3">
                <span
                  className={`w-16 shrink-0 rounded-full px-2 py-1 text-center font-serif text-xs ${
                    log.delta > 0
                      ? "bg-primary/10 text-primary"
                      : "bg-paper-deep text-muted"
                  }`}
                >
                  {log.delta > 0 ? `+${log.delta}` : `${log.delta}`}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{reasonLabel(log.reason)}</p>
                  <p className="text-[11px] text-muted">{formatTime(log.created_at)}</p>
                </div>
                {log.ref && <span className="shrink-0 text-[11px] text-muted/70">{log.ref}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 积分规则（展示用） */}
      <section className="mt-6 rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
        <h2 className="flex items-center gap-3 font-serif text-lg font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-gold" />
          积分规则
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {POINTS_RULES.map((r) => (
            <li
              key={r.action}
              className="flex items-center justify-between rounded-xl bg-paper-deep/60 px-4 py-2.5 text-sm"
            >
              <span className="text-body">{r.action}</span>
              <span className="font-serif font-semibold text-primary">+{r.delta} 分</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          积分与等级仅作同好间的雅趣标榜，不设任何兑换；等级越高，越见你在社中的身影。
        </p>
      </section>
    </div>
  );
}
