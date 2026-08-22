"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { characterImage } from "@/lib/images";
import { characterName } from "@/lib/data";
import { IconArrowLeft, IconArrowRight, IconGrid } from "@/components/icons";
import type { Character } from "@/lib/types";

/**
 * 人物志 · 抽卡式浏览 v2：卡片堆叠悬浮（现代卡片栈）——
 * 当前卡居中、后两张卡错位露出边缘，像一叠扑克牌，左右滑动切换。
 */
export default function CharacterGacha({ characters }: { characters: Character[] }) {
  const list = characters.filter((c) => c.id && c.name);
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = list.length;

  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + n) % n);
  const at = (i: number) => list[((i % n) + n) % n];

  /* 可见的三张：后两张错位堆叠露出边缘 */
  const prev = at(idx - 1);
  const cur = at(idx);
  const next = at(idx + 1);

  const CardBody = ({ c }: { c: Character }) => {
    const img = characterImage(c.id);
    const alias = c.aliases?.[0] ?? "";
    const ident = c.identity ? `${c.identity.position ?? ""}${c.identity.origin ? " · " + c.identity.origin : ""}` : "";
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-7 text-center">
        {/* 圆形大头像（居中） */}
        <div className="relative">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sitePath(img)} alt={c.name} className="mx-auto h-36 w-36 rounded-full object-cover object-top shadow-lg ring-4 ring-surface md:h-44 md:w-44" />
          ) : (
            <span className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-primary/10 font-serif text-6xl text-primary md:h-44 md:w-44">
              {c.name.slice(0, 1)}
            </span>
          )}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-0.5 font-serif text-[11px] text-white shadow">
            {c.category ?? ""}
          </span>
        </div>
        <h2 className="mt-5 font-serif text-3xl font-semibold text-ink md:text-4xl">{c.name}</h2>
        {alias && <p className="mt-1.5 font-serif text-sm text-gold">{alias}</p>}
        {ident && <p className="mt-2 text-sm text-muted">{ident}</p>}
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">
          {c.summary?.short ?? "探索这位人物的完整档案……"}
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold">CHARACTERS</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">人物志</h1>
          <p className="mt-2 text-sm text-muted">一张一位，左右滑动——不满意就换下一位</p>
        </div>
        <Link
          href={sitePath("/characters/roster")}
          className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-4 py-2 text-sm text-body transition-colors hover:border-primary/50 hover:text-primary"
        >
          <IconGrid className="h-4 w-4" />
          查看全部
        </Link>
      </div>

      {/* 卡片栈主体 */}
      <div
        className="relative mt-8 h-[400px] md:h-[440px]"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {/* 后两张：错位堆叠露出边缘（明显露出，暗示后面还有更多卡） */}
        <div
          className="card-print card-print--identity absolute inset-0 rounded-3xl bg-surface shadow-lg transition-all duration-300"
          style={{ transform: "translateX(-13%) translateY(14px) rotate(-6deg) scale(0.88)", zIndex: 10, opacity: 0.8 }}
        >
          <CardBody c={prev} />
        </div>
        <div
          className="card-print card-print--identity absolute inset-0 rounded-3xl bg-surface shadow-lg transition-all duration-300"
          style={{ transform: "translateX(13%) translateY(14px) rotate(6deg) scale(0.88)", zIndex: 10, opacity: 0.8 }}
        >
          <CardBody c={next} />
        </div>
        {/* 当前卡 */}
        <div
          className="card-print card-print--identity absolute inset-0 rounded-3xl bg-surface shadow-card transition-all duration-300 hover:shadow-hover"
          style={{ transform: "translateX(0) rotate(0) scale(1)", zIndex: 30 }}
        >
          <CardBody c={cur} />
          {/* 底部操作 */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between rounded-b-3xl border-t border-line-inner bg-paper-deep/40 px-7 py-4 backdrop-blur">
            <span className="text-xs text-muted">第 {idx + 1} / {n} 位</span>
            <Link
              href={`/characters/${cur.id}`}
              className="rounded-full bg-primary px-7 py-2 font-serif text-sm text-white transition-colors hover:bg-primary-deep"
            >
              查看档案 →
            </Link>
          </div>
        </div>

        {/* 左右切换 */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一位"
          className="absolute left-0 top-1/2 z-40 -translate-y-1/2 rounded-full border border-line bg-paper/90 p-3 text-body shadow-md transition-all hover:border-primary/50 hover:text-primary md:-left-5"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一位"
          className="absolute right-0 top-1/2 z-40 -translate-y-1/2 rounded-full border border-line bg-paper/90 p-3 text-body shadow-md transition-all hover:border-primary/50 hover:text-primary md:-right-5"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* 指示点 */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {list.slice(0, Math.min(n, 40)).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`第 ${i + 1} 位`}
            className={`h-1.5 rounded-full transition-all ${
              i === idx ? "w-5 bg-primary" : "w-1.5 bg-line hover:bg-gold"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
