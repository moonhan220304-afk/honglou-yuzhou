"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { characterName, chapterLabel } from "@/lib/data";
import { cardPrintClass } from "@/lib/card-print";
import CharacterAvatar from "@/components/character-avatar";
import SectionSearch from "@/components/section-search";
import type { Question } from "@/lib/types";

export default function QuestionsExplorer({ questions }: { questions: Question[] }) {
  const search = useSearchParams();
  const [kw, setKw] = useState(search.get("q") ?? "");

  useEffect(() => {
    (async () => {
      setKw(search.get("q") ?? "");
    })();
  }, [search]);

  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return questions;
    return questions.filter((q) => {
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
  }, [kw, questions]);

  return (
    <div className="mt-8">
      <SectionSearch
        value={kw}
        onChange={setKw}
        placeholder="搜索问题：如「宝黛」「抄检大观园」「续书」…"
        className="mx-auto max-w-xl"
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
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.map((q, i) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              className={`group rounded-2xl bg-surface ${cardPrintClass(i, 4)} p-6 transition-all hover:-translate-y-0.5 hover:shadow-hover`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] tracking-wider ${
                    i < 3 ? "bg-primary/10 text-primary" : "bg-paper-deep text-muted"
                  }`}
                >
                  {i < 3 ? "热议" : `热度 ${q.heat_weight}`}
                </span>
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
      )}
    </div>
  );
}
