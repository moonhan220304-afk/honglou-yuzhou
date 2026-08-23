"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  DIFFICULTY_LABEL,
  DIFFICULTY_OPTIONS,
  isNewTopic,
  type TopicInfo,
  type TopicKind,
} from "@/lib/poem-society";
import PoemSocietyNav from "@/components/poem-society/poem-society-nav";

const KIND_META: Record<Exclude<TopicKind, "poem_topic">, { title: string; desc: string; unit: string }> = {
  fill: {
    title: "填字",
    desc: "考对仗与炼字：抄原句，填上你的字，以评论参与。",
    unit: "已作答",
  },
  feihua: {
    title: "飞花接句",
    desc: "出上句，接下句——以诗会友，妙句相和。",
    unit: "已接句",
  },
};

const DIFF_BADGE: Record<string, string> = {
  beginner: "bg-success/15 text-success",
  intermediate: "bg-gold/15 text-[#8a6a45]",
  advanced: "bg-primary/10 text-primary",
};

/** 填字 / 飞花 列表页：难度筛选 + 题目卡（同构，kind 区分） */
export default function DifficultyList({ kind }: { kind: "fill" | "feihua" }) {
  const meta = KIND_META[kind];
  const [difficulty, setDifficulty] = useState("all");
  const [items, setItems] = useState<TopicInfo[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await api<{ items: TopicInfo[] }>(
          `/api/topics?kind=${kind}&difficulty=${difficulty}`,
        );
        setItems(r.items);
        setErr("");
      } catch (ex) {
        setErr(ex instanceof Error ? ex.message : "加载失败");
        setItems([]);
      }
    })();
  }, [kind, difficulty]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header>
        <p className="text-xs tracking-[0.3em] text-poem">POEM SOCIETY · 海棠诗社</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">{meta.title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-body">{meta.desc}</p>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <PoemSocietyNav />
        <div className="flex items-center gap-1.5">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setDifficulty(d.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                difficulty === d.value
                  ? "bg-primary text-paper"
                  : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {err && <p className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}

      {!items && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-paper-deep/60" />
          ))}
        </div>
      )}

      {items && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.length === 0 && (
            <p className="rounded-2xl border border-dashed border-gold/50 bg-surface-warm p-8 text-center text-sm text-muted sm:col-span-2">
              该难度下暂无题目
            </p>
          )}
          {items.map((t) => (
            <Link
              key={t.id}
              href={`/poem-society/${kind}/${t.id}`}
              className="group rounded-2xl bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-0.5 ${DIFF_BADGE[t.difficulty] || "bg-paper-deep text-muted"}`}>
                  {DIFFICULTY_LABEL[t.difficulty] || t.difficulty}
                </span>
                {isNewTopic(t.created_at) && (
                  <span className="rounded-full bg-primary px-2 py-0.5 font-medium text-paper">新</span>
                )}
                {t.theme && <span className="text-muted">主题 · {t.theme}</span>}
              </div>
              <h3 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink group-hover:text-primary">
                {t.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">{t.content}</p>
              <p className="mt-3 text-xs text-muted">
                {meta.unit} <span className="font-serif text-sm font-semibold text-primary">{t.join_count}</span> 人
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
