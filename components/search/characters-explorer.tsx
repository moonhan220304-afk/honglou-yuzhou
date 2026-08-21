"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cardPrintClass } from "@/lib/card-print";
import CharacterAvatar from "@/components/character-avatar";
import SectionSearch from "@/components/section-search";
import type { Character } from "@/lib/types";

const categories = [
  {
    key: "核心人物",
    note: "全书叙事的中心人物",
    match: (c: { category: string }) => c.category === "核心人物",
  },
  {
    key: "金陵十二钗正册",
    note: "太虚幻境薄命司正册诸钗，命运的主线",
    match: (c: { category: string }) => c.category === "金陵十二钗正册",
  },
  {
    key: "金陵十二钗又副册",
    note: "又副册诸钗",
    match: (c: { category: string }) =>
      c.category === "金陵十二钗又副册" || c.category.startsWith("薄命司副册"),
  },
  {
    key: "贾府家长",
    note: "家族权力与秩序的顶层",
    match: (c: { category: string }) => c.category.includes("家长"),
  },
  {
    key: "丫鬟与仆从",
    note: "贴身丫鬟、小厮、乳母与陪房",
    match: (c: { category: string }) =>
      /丫鬟|小厮|乳母|老仆|女仆|粗使丫头|下人|仆役|男仆|陪房/.test(c.category),
  },
  {
    key: "戏班与优伶",
    note: "梨香院戏班十二官与忠顺王府优伶",
    match: (c: { category: string }) => /戏班|十二官|优伶/.test(c.category),
  },
];

export default function CharactersExplorer({
  characters,
}: {
  characters: Record<string, Character>;
}) {
  const search = useSearchParams();
  const [kw, setKw] = useState(search.get("q") ?? "");

  useEffect(() => {
    (async () => {
      setKw(search.get("q") ?? "");
    })();
  }, [search]);

  const all = Object.values(characters);

  const filtered = useMemo(() => {
    const k = kw.trim().toLowerCase();
    if (!k) return null;
    return all.filter((c) => {
      const haystack = [
        c.name,
        ...(c.aliases ?? []),
        c.category,
        ...(c.tags ?? []),
        c.identity?.family ?? "",
        c.identity?.position ?? "",
        c.identity?.origin ?? "",
        c.summary?.short ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(k);
    });
  }, [kw, all]);

  const searching = !!filtered;

  return (
    <div className="mt-12">
      <SectionSearch
        value={kw}
        onChange={setKw}
        placeholder="搜索人物：如「黛玉」「凤姐」「刘姥姥」…"
        className="mx-auto max-w-xl"
      />

      {searching ? (
        <>
          <p className="mt-6 text-xs text-muted">
            {filtered!.length > 0
              ? `找到 ${filtered!.length} 位人物`
              : `没有找到与「${kw.trim()}」相关的人物`}
          </p>
          {filtered!.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-12 text-center">
              <p className="font-serif text-lg text-secondary-btn-text">
                没有找到与「{kw.trim()}」相关的人物
              </p>
              <p className="mt-2 text-sm text-muted">换个关键词试试，比如姓名、别号或身份</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered!.map((c, i) => (
                <CharacterCardLink key={c.id} c={c} showCategory i={i} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-14">
          {categories.map((cat) => {
            const members = all.filter(cat.match);
            if (members.length === 0) return null;
            return (
              <section key={cat.key}>
                <div className="flex items-baseline gap-3">
                  <h2 className="font-serif text-lg font-semibold text-ink">{cat.key}</h2>
                  <span className="text-xs text-muted">{cat.note}</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {members.map((c, i) => (
                    <CharacterCardLink key={c.id} c={c} i={i} />
                  ))}
                </div>
              </section>
            );
          })}

          {all.filter((c) => !categories.some((cat) => cat.match(c))).length > 0 && (
            <section>
              <div className="flex items-baseline gap-3">
                <h2 className="font-serif text-lg font-semibold text-ink">更多人物</h2>
                <span className="text-xs text-muted">
                  家族内外——男丁、姻亲、丫鬟、仆从与结构人物
                </span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {all
                  .filter((c) => !categories.some((cat) => cat.match(c)))
                  .map((c, i) => (
                    <CharacterCardLink key={c.id} c={c} showCategory i={i} />
                  ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function CharacterCardLink({
  c,
  showCategory = false,
  i,
}: {
  c: Character;
  showCategory?: boolean;
  i: number;
}) {
  return (
    <Link
      href={`/characters/${c.id}`}
      className={`group rounded-2xl bg-surface ${cardPrintClass(i, 0)} p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover`}
    >
      <div className="flex items-center gap-4">
        <CharacterAvatar characterId={c.id} name={c.name} className="h-12 w-12 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-serif text-base font-semibold text-ink group-hover:text-primary">
            {c.name}
          </p>
          {c.aliases.length > 0 ? (
            <p className="truncate text-xs text-muted">{c.aliases[0]}</p>
          ) : showCategory ? (
            <p className="truncate text-xs text-muted">{c.category}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {c.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-[4px] bg-paper-deep px-2 py-0.5 text-xs text-secondary-btn-text"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
