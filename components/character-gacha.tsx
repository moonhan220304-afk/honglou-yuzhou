"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { characterName } from "@/lib/data";
import { IconGrid } from "@/components/icons";
import SectionHero from "@/components/section-hero";
import CharacterAvatar from "@/components/character-avatar";
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
  // 触屏滑动抽卡：记录按下位置，横向位移超过阈值即换人（tap 仍走两侧卡片 onClick 兜底）
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  // 侧卡偏移：按屏宽自适应，保证侧卡右缘不超过屏宽（side ≤ vw/2 - 145）；桌面 160 堆叠更明显
  const [side, setSide] = useState(50);
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      setSide(Math.min(160, Math.max(10, Math.floor(vw / 2) - 145)));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

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

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    // 横向位移为主且超过 40px 才判定为滑动，避免误触点击
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      go(dx < 0 ? 1 : -1);
    }
  };

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
    const alias = c.aliases?.[0] ?? "";
    const ident = c.identity ? `${c.identity.position ?? ""}${c.identity.origin ? " · " + c.identity.origin : ""}` : "";
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center px-7 text-center ${dim ? "pointer-events-none select-none" : ""}`}>
        <div className="relative">
          <CharacterAvatar characterId={c.id} name={c.name} className="h-28 w-28 md:h-36 md:w-36" />
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
    "card-print card-print--identity absolute inset-0 h-[460px] w-[290px] overflow-hidden rounded-2xl bg-surface select-none touch-pan-y";
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

      {/* 卡片区：三张卡以容器中心对称偏移（左右虚化）；支持触屏左右滑动换人 */}
      <div
        className="relative mx-auto mt-10 h-[480px] w-[290px]"
        style={{ perspective: "1200px", touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (dragStartRef.current = null)}
      >
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
                : `translateX(${hoverDir === -1 ? -118 : -side}px) rotate(-5deg) scale(${hoverDir === -1 ? 0.93 : 0.86})`,
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
                : `translateX(${hoverDir === 1 ? 118 : side}px) rotate(5deg) scale(${hoverDir === 1 ? 0.93 : 0.86})`,
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
          ← 左右滑动或点两侧卡片换人 →
        </span>
      </div>

      {/* 指示点（限制数量避免溢出，保留触屏热区） */}
      <div className="mt-12 flex max-w-full items-center justify-center gap-1 overflow-x-auto px-2">
        {list.slice(0, Math.min(n, 12)).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`第 ${i + 1} 位`}
            aria-current={i === idx ? "true" : undefined}
            className="flex h-11 w-5 shrink-0 items-center justify-center"
          >
            <span
              className={`rounded-full transition-all ${
                i === idx ? "h-2 w-5 bg-primary" : "h-2 w-2 bg-line"
              }`}
            />
          </button>
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
