"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { characterImage } from "@/lib/images";
import { characterName } from "@/lib/data";
import { IconGrid } from "@/components/icons";
import SectionHero from "@/components/section-hero";
import type { Character } from "@/lib/types";

/**
 * 人物志 · 抽卡式浏览 —— 左右堆叠 + 半透明虚化 + 点击换人
 * 交互：悬停侧卡只做点亮预览，点击（或触屏 tap）才真正换人。
 */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SIDE = 160;
const EXIT = 350;
const SWAP_MS = 320;

export default function CharacterGacha({ characters }: { characters: Character[] }) {
  const list = characters.filter((c) => c.id && c.name);
  const n = list.length;
  const [idx, setIdx] = useState(0);
  const [swiping, setSwiping] = useState<null | 1 | -1>(null);
  const [hoverDir, setHoverDir] = useState<null | 1 | -1>(null);
  const swipingRef = useRef<null | 1 | -1>(null);

  const go = (dir: 1 | -1) => {
    if (swipingRef.current) return;
    swipingRef.current = dir;
    setSwiping(dir);
    setTimeout(() => {
      setIdx((i) => (i + dir + n) % n);
      setSwiping(null);
      swipingRef.current = null;
    }, SWAP_MS);
  };
  const at = (i: number) => list[((i % n) + n) % n];

  const cur = at(idx);
  const left = at(idx - 1);
  const right = at(idx + 1);

  /* 键盘 ← → */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const CardBody = ({ c, dim = false }: { c: Character; dim?: boolean }) => {
    const img = characterImage(c.id);
    const alias = c.aliases?.[0] ?? "";
    const ident = c.identity ? `${c.identity.position ?? ""}${c.identity.origin ? " · " + c.identity.origin : ""}` : "";
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center px-7 text-center ${dim ? "pointer-events-none select-none" : ""}`}>
        <div className="relative">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sitePath(img)}
              alt={c.name}
              className="mx-auto h-28 w-28 rounded-full object-cover object-top shadow-lg ring-[3px] ring-white md:h-36 md:w-36"
            />
          ) : (
            <span className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-primary/10 font-serif text-5xl text-primary md:h-36 md:w-36">
              {c.name.slice(0, 1)}
            </span>
          )}
          <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-3.5 py-1 font-serif text-[11px] text-white shadow">
            {c.category ?? ""}
          </span>
        </div>
        <h2 className="mt-5 font-serif text-[28px] font-semibold text-ink md:text-3xl">{c.name}</h2>
        {alias && <p className="mt-1 font-serif text-[13px] tracking-wide text-gold">{alias}</p>}
        {ident && <p className="mt-1.5 text-[13px] text-muted">{ident}</p>}
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">{c.summary?.short ?? ""}</p>
      </div>
    );
  };

  const cardBase =
    "card-print card-print--identity absolute inset-0 h-[400px] w-[290px] overflow-hidden rounded-2xl bg-surface select-none touch-pan-y";
  const cardTransition = `transform ${SWAP_MS}ms ${SPRING}, opacity ${SWAP_MS}ms ease, filter ${SWAP_MS}ms ease`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* 标题（统一板块页头） */}
      <SectionHero
        sector="characters"
        eyebrow="CHARACTERS"
        title="人物志"
        description="悬停预览，点击两侧卡片换人"
      />

      {/* 卡片区：三张卡以容器中心对称偏移（左右虚化） */}
      <div className="relative mx-auto mt-10 h-[420px] w-[290px]" style={{ perspective: "1200px" }}>
        {/* 左卡：碰到即滑到中央 */}
        <div
          key={left.id}
          className={cardBase}
          onPointerEnter={() => setHoverDir(-1)}
          onPointerLeave={() => setHoverDir(null)}
          onClick={() => go(-1)}
          style={{
            position: "absolute",
            transform:
              swiping === -1
                ? "translateX(0) rotate(0) scale(1)"
                : `translateX(${hoverDir === -1 ? -118 : -SIDE}px) rotate(-5deg) scale(${hoverDir === -1 ? 0.93 : 0.86})`,
            zIndex: swiping === -1 ? 30 : hoverDir === -1 ? 20 : 10,
            opacity: swiping === 1 ? 0 : swiping === -1 ? 1 : hoverDir === -1 ? 0.92 : 0.45,
            filter: swiping === -1 ? "blur(0)" : hoverDir === -1 ? "blur(0.5px)" : "blur(2px)",
            transition: cardTransition,
          }}
        >
          <CardBody c={left} dim={hoverDir !== -1} />
        </div>
        {/* 右卡：碰到即滑到中央 */}
        <div
          key={right.id}
          className={cardBase}
          onPointerEnter={() => setHoverDir(1)}
          onPointerLeave={() => setHoverDir(null)}
          onClick={() => go(1)}
          style={{
            position: "absolute",
            transform:
              swiping === 1
                ? "translateX(0) rotate(0) scale(1)"
                : `translateX(${hoverDir === 1 ? 118 : SIDE}px) rotate(5deg) scale(${hoverDir === 1 ? 0.93 : 0.86})`,
            zIndex: swiping === 1 ? 30 : hoverDir === 1 ? 20 : 10,
            opacity: swiping === -1 ? 0 : swiping === 1 ? 1 : hoverDir === 1 ? 0.92 : 0.45,
            filter: swiping === 1 ? "blur(0)" : hoverDir === 1 ? "blur(0.5px)" : "blur(2px)",
            transition: cardTransition,
          }}
        >
          <CardBody c={right} dim={hoverDir !== 1} />
        </div>
        {/* 当前卡（居中） */}
        <div
          key={cur.id}
          className={cardBase}
          style={{
            position: "absolute",
            transform: swiping
              ? `translateX(${-swiping * EXIT}px) rotate(${-swiping * 7}deg) scale(0.9)`
              : "translateX(0) rotate(0) scale(1)",
            zIndex: swiping ? 20 : 30,
            opacity: swiping ? 0.35 : 1,
            boxShadow: "0 2px 6px rgba(60,45,30,.06), 0 14px 30px rgba(60,45,30,.16), 0 34px 70px rgba(60,45,30,.12)",
            transition: cardTransition,
          }}
        >
          <CardBody c={cur} />
          {/* 底部操作条 */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between rounded-b-2xl border-t border-line-inner bg-paper-deep/45 px-6 py-3.5 backdrop-blur">
            <span className="text-xs text-muted">第 {idx + 1} / {n} 位</span>
            <Link
              href={`/characters/${cur.id}`}
              className="rounded-full bg-primary px-6 py-2 font-serif text-sm text-white transition-colors hover:bg-primary-deep"
            >
              查看档案 →
            </Link>
          </div>
        </div>

        {/* 滑动提示 */}
        <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-xs tracking-[0.25em] text-muted">
          ← 点两侧卡片换人 →
        </span>
      </div>

      {/* 指示点 */}
      <div className="mt-12 flex items-center justify-center gap-1.5">
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

      {/* 查看全部 */}
      <div className="mt-6 text-center">
        <Link
          href={sitePath("/characters/roster")}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-5 py-2 text-sm text-body transition-colors hover:border-characters/50 hover:text-characters"
        >
          <IconGrid className="h-4 w-4" />
          查看全部
        </Link>
      </div>
    </div>
  );
}
