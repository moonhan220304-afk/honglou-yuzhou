"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { characterImage } from "@/lib/images";
import { characterName } from "@/lib/data";
import { IconArrowLeft, IconArrowRight, IconGrid } from "@/components/icons";
import type { Character } from "@/lib/types";

/**
 * 人物志 · 抽卡式浏览：一张人物卡居中，左右滑动/点击切换；
 * 「查看全部」进入总览（/characters/roster）。
 */
export default function CharacterGacha({ characters }: { characters: Character[] }) {
  const list = characters.filter((c) => c.id && c.name);
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const cur = list[Math.min(idx, Math.max(0, list.length - 1))];

  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + list.length) % list.length);
  const img = cur ? characterImage(cur.id) : undefined;
  const alias = cur?.aliases?.[0] ?? "";
  const ident = cur?.identity ? `${cur.identity.position ?? ""}${cur.identity.origin ? " · " + cur.identity.origin : ""}` : "";

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

      {/* 抽卡主体 */}
      <div
        className="relative mt-8"
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
        <div className="card-print card-print--identity relative overflow-hidden rounded-3xl bg-surface shadow-card transition-all hover:shadow-hover">
          {/* 人物大头像 */}
          <div className="relative h-[300px] w-full overflow-hidden bg-paper-deep md:h-[360px]">
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sitePath(img)} alt={cur.name} className="h-full w-full object-cover object-top" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-serif text-7xl text-primary/30">{cur?.name.slice(0, 1)}</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-6 pb-5 pt-16">
              <h2 className="font-serif text-3xl font-semibold text-white drop-shadow">{cur?.name}</h2>
              {alias && <p className="mt-1 font-serif text-sm text-white/85">{alias}</p>}
            </div>
          </div>
          {/* 简介 */}
          <div className="px-6 py-5">
            {ident && <p className="text-sm leading-relaxed text-body">{ident}</p>}
            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">
              {cur?.summary?.short ?? "探索这位人物的完整档案……"}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-muted">
                第 {idx + 1} / {list.length} 位
              </span>
              <Link
                href={`/characters/${cur?.id}`}
                className="rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-white transition-colors hover:bg-primary-deep"
              >
                查看档案 →
              </Link>
            </div>
          </div>
        </div>

        {/* 左右切换 */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一位"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-paper/90 p-3 text-body shadow-md transition-all hover:border-primary/50 hover:text-primary md:-left-5"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一位"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-paper/90 p-3 text-body shadow-md transition-all hover:border-primary/50 hover:text-primary md:-right-5"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* 指示点 */}
      <div className="mt-6 flex items-center justify-center gap-1.5">
        {list.map((_, i) => (
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
