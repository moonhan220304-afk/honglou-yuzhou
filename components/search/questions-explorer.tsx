"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { characterName, chapterLabel } from "@/lib/data";
import { cardPrintClass } from "@/lib/card-print";
import CharacterAvatar from "@/components/character-avatar";
import SectionSearch from "@/components/section-search";
import { IconHeart, IconMessage } from "@/components/icons";
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

  /* 逻辑轴数据：热门人物（人物类代表） */
  const hotChars = useMemo(() => {
    const m = new Map<string, number>();
    for (const q of questions) {
      for (const cid of q.related_character_ids ?? []) m.set(cid, (m.get(cid) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [questions]);

  /* 逻辑轴数据：剧情类代表回次 */
  const plotSpan = useMemo(() => {
    const chapters: number[] = [];
    for (const q of questions) {
      if (categoryOf(q) === "剧情") chapters.push(...(q.related_chapter_ids ?? []));
    }
    if (!chapters.length) return null;
    return { from: Math.min(...chapters), to: Math.max(...chapters) };
  }, [questions]);

  const switchCat = (c: (typeof CATEGORIES)[number]) => {
    setCat(c);
    setExpanded(false);
  };

  return (
    <div className="mt-6">
      {/* 探索逻辑轴：一条贯穿的轴线串联分类，当前节点放大（人物→剧情→主题） */}
      <div className="mx-auto max-w-2xl">
        <div className="relative px-2 pt-2">
          <div className="absolute left-10 right-10 top-[30px] h-px bg-line" />
          <div className="relative flex items-start justify-between">
            {CATEGORIES.map((c) => {
              const on = cat === c;
              const count = c === "全部" ? questions.length : questions.filter((q) => categoryOf(q) === c).length;
              const glyph = c === "人物" ? "人" : c === "剧情" ? "事" : c === "主题" ? "题" : "全";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => switchCat(c)}
                  className="flex w-16 flex-col items-center gap-1.5"
                >
                  <span
                    className={`flex items-center justify-center rounded-full font-serif transition-all duration-300 ${
                      on
                        ? "h-12 w-12 bg-primary text-xl text-white shadow-lg"
                        : "h-8 w-8 bg-paper-deep text-sm text-muted hover:text-primary"
                    }`}
                  >
                    {glyph}
                  </span>
                  <span className={`font-serif text-xs ${on ? "font-semibold text-ink" : "text-muted"}`}>{c}</span>
                  <span className="text-[10px] text-muted">{count} 问</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 当前节点代表性内容（人物→头像墙；剧情→回次范围） */}
        <div className="mt-5 flex min-h-[64px] items-center justify-center rounded-2xl bg-paper-deep/40 px-4 py-3">
          {cat === "人物" && (
            <div className="flex items-center gap-4">
              {hotChars.map(([cid, cnt]) => (
                <Link key={cid} href={`/questions/?q=${characterName(cid)}`} className="group flex flex-col items-center gap-1">
                  <CharacterAvatar characterId={cid} name={characterName(cid)} className="h-10 w-10 border-0 shadow group-hover:ring-2 group-hover:ring-gold" />
                  <span className="text-[11px] text-secondary-btn-text group-hover:text-primary">{characterName(cid)}</span>
                  <span className="text-[10px] text-muted">{cnt} 问</span>
                </Link>
              ))}
            </div>
          )}
          {cat === "剧情" && plotSpan && (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
                第 {plotSpan.from}–{plotSpan.to} 回
              </span>
              <span className="text-xs text-muted">剧情类问题覆盖的回次区间，点开即见</span>
            </div>
          )}
          {cat === "主题" && (
            <span className="text-xs text-muted">爱情 · 命运 · 家族 · 信仰——跨人物、跨剧情的母题之问</span>
          )}
          {cat === "全部" && (
            <span className="text-xs text-muted">沿轴探索：从人物 → 剧情 → 主题，一层层走进问题深处</span>
          )}
        </div>
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
                className={`group overflow-hidden rounded-2xl bg-surface ${cardPrintClass(i, 4)} transition-all hover:-translate-y-0.5 hover:shadow-hover`}
              >
                {/* 图区：相关人物头像墙（小红书式首图） */}
                <div className="flex items-center gap-2 bg-paper-deep/50 px-5 py-3">
                  <div className="flex -space-x-2.5">
                    {(q.related_character_ids ?? []).slice(0, 4).map((cid) => (
                      <span key={cid} className="rounded-full border-2 border-surface bg-surface">
                        <CharacterAvatar
                          characterId={cid}
                          name={characterName(cid)}
                          className="h-8 w-8 border-0 shadow-none"
                        />
                      </span>
                    ))}
                    {(q.related_character_ids ?? []).length === 0 && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-serif text-sm text-primary">
                        问
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted">
                    {categoryOf(q)}类 · {q.viewpoints.length} 种观点
                  </span>
                  <span
                    className={`ml-auto rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${
                      i < 3 ? "bg-primary/10 text-primary" : "bg-paper-deep text-muted"
                    }`}
                  >
                    {i < 3 ? "热议" : `热度 ${q.heat_weight}`}
                  </span>
                </div>
                <div className="p-5">
                  <h2 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:text-primary">
                    {q.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{q.short_summary}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <IconHeart className="h-3.5 w-3.5" />
                      {q.heat_weight}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconMessage className="h-3.5 w-3.5" />
                      {q.viewpoints.length} 观点
                    </span>
                    {q.related_chapter_ids?.length > 0 && (
                      <span className="ml-auto">涉及 {q.related_chapter_ids.length} 回</span>
                    )}
                  </div>
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
