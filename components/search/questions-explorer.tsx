"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { characterName, chapterLabel } from "@/lib/data";
import { cardPrintClass } from "@/lib/card-print";
import CharacterAvatar from "@/components/character-avatar";
import SectionSearch from "@/components/section-search";
import type { Question } from "@/lib/types";

/** 问题分类：人物 / 剧情 / 主题（按 question_type 映射） */
export function categoryOf(q: Question): "人物" | "剧情" | "主题" {
  if (q.question_type?.startsWith("character")) return "人物";
  if (q.question_type === "plot") return "剧情";
  return "主题";
}

const CATEGORIES = ["全部", "人物", "剧情", "主题"] as const;
const DEFAULT_VISIBLE = 6;

export default function QuestionsExplorer({ questions }: { questions: Question[] }) {
  const search = useSearchParams();
  const [kw, setKw] = useState(search.get("q") ?? "");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("全部");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      setKw(search.get("q") ?? "");
    })();
  }, [search]);

  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    let list = questions;
    if (cat !== "全部") {
      list = list.filter((q) => categoryOf(q) === cat);
    }
    if (k) {
      list = list.filter((q) => {
        const haystack = [
          q.title,
          q.short_summary,
          q.neutral_overview,
          ...(q.related_character_ids ?? []).map(characterName),
          ...(q.related_chapter_ids ?? []).map(chapterLabel),
          ...(q.viewpoints ?? []).map((v) => v.title),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(k);
      });
    }
    /* 默认按热度排序（架构：只露热度前 6，查看更多再展开） */
    return [...list].sort((a, b) => (b.heat_weight ?? 0) - (a.heat_weight ?? 0));
  }, [kw, cat, questions]);

  const visible = expanded ? filtered : filtered.slice(0, DEFAULT_VISIBLE);

  return (
    <div className="mt-6">
      {/* 分类筛选条（知乎式，不是大卡片墙） */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCat(c);
              setExpanded(false);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              cat === c
                ? "border-primary bg-primary text-white"
                : "border-line bg-surface text-body hover:border-primary/50 hover:text-primary"
            }`}
          >
            {c === "全部" ? "全部" : `${c}类`}
            {c !== "全部" && (
              <span className="ml-1.5 text-xs opacity-70">
                {questions.filter((q) => categoryOf(q) === c).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <SectionSearch
        value={kw}
        onChange={setKw}
        placeholder="搜索问题：如「宝黛」「抄检大观园」「续书」…"
        className="mx-auto mt-5 max-w-xl"
      />

      {kw.trim() && (
        <p className="mt-4 text-xs text-muted">
          {filtered.length > 0
            ? `找到 ${filtered.length} 个相关问题`
            : `没有找到与「${kw.trim()}」相关的问题`}
        </p>
      )}

      {filtered.length === 0 && kw.trim() ? (
        <div className="mt-8 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
          <p className="font-serif text-lg text-secondary-btn-text">
            没有找到与「{kw.trim()}」相关的问题
          </p>
          <p className="mt-2 text-sm text-muted">换个关键词试试，比如人物名、事件或章回</p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {visible.map((q, i) => (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className={`group rounded-2xl bg-surface ${cardPrintClass(i, 4)} p-6 transition-all hover:-translate-y-0.5 hover:shadow-hover`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${
                        i < 3 ? "bg-primary/10 text-primary" : "bg-paper-deep text-muted"
                      }`}
                    >
                      {i < 3 ? "热议" : `热度 ${q.heat_weight}`}
                    </span>
                    <span className="rounded-full bg-paper-deep/70 px-2 py-0.5 text-[10px] text-secondary-btn-text">
                      {categoryOf(q)}类
                    </span>
                  </div>
                  <span className="text-xs text-muted">{q.viewpoints.length} 种观点</span>
                </div>
                <h2 className="mt-3 font-serif text-lg font-semibold leading-snug text-ink group-hover:text-primary">
                  {q.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                  {q.short_summary}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {q.related_character_ids?.slice(0, 4).map((cid) => (
                    <span
                      key={cid}
                      className="flex items-center gap-1.5 rounded-full bg-paper-deep/60 px-2.5 py-1 text-xs text-secondary-btn-text"
                    >
                      <CharacterAvatar
                        characterId={cid}
                        name={characterName(cid)}
                        className="h-4 w-4 border-0 shadow-none"
                      />
                      {characterName(cid)}
                    </span>
                  ))}
                  {q.related_chapter_ids?.length > 0 && (
                    <span className="text-xs text-muted">
                      涉及 {chapterLabel(q.related_chapter_ids[0])}等 {q.related_chapter_ids.length} 回
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {filtered.length > DEFAULT_VISIBLE && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="rounded-full border border-line bg-surface px-8 py-2.5 text-sm text-body transition-colors hover:border-primary/50 hover:text-primary"
              >
                {expanded ? "收起" : `查看全部 ${filtered.length} 个问题`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
