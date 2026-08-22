"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { characterImage } from "@/lib/images";
import { characterName } from "@/lib/data";
import { IconGrid } from "@/components/icons";
import type { Character } from "@/lib/types";

/**
 * 人物志 · 抽卡式浏览 v6 —— 左右堆叠 + 半透明虚化 + 纯滑动交互（对齐参考图）
 *
 * - 当前卡居中；左右两侧各露出一张卡，半透明 + 虚化（blur）营造景深
 * - 交互：手指/鼠标左右滑动（实时跟随拖动，松手超过阈值切换），支持键盘 ← →
 * - 不用点击按钮（用户明确要求滑动式）
 */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const THRESHOLD = 70;

export default function CharacterGacha({ characters }: { characters: Character[] }) {
  const list = characters.filter((c) => c.id && c.name);
  const [idx, setIdx] = useState(0);
  const n = list.length;
  const [dragX, setDragX] = useState(0);
  const drag = useRef<{ start: number; active: boolean }>({ start: 0, active: false });
  const [leaving, setLeaving] = useState<null | 1 | -1>(null);

  const go = (dir: 1 | -1) => {
    setLeaving(dir);
    setTimeout(() => {
      setIdx((i) => (i + dir + n) % n);
      setLeaving(null);
      setDragX(0);
    }, 180);
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
  }, []);

  /* 拖拽/滑动 */
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { start: e.clientX, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    setDragX(e.clientX - drag.current.start);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = e.clientX - drag.current.start;
    if (Math.abs(dx) > THRESHOLD) go(dx < 0 ? 1 : -1);
    else setDragX(0);
  };

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
    "card-print card-print--identity absolute inset-0 h-[400px] w-[290px] overflow-hidden rounded-2xl bg-surface transition-all duration-500 motion-reduce:transition-none select-none touch-pan-y";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* 标题（居中） */}
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-gold">CHARACTERS</p>
        <h1 className="mt-2 font-serif text-[34px] font-semibold text-ink">人物志</h1>
        <p className="mt-2 text-sm text-muted">左右滑动换人——不满意就换下一位</p>
      </div>

      {/* 卡片区：容器固定卡宽并居中，三张卡以容器为中心对称偏移（左右虚化） */}
      <div
        className="relative mx-auto mt-10 h-[420px] w-[290px]"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current.active = false;
          setDragX(0);
        }}
      >
        {/* 左卡（半透明 + 虚化） */}
        <div
          className={cardBase}
          style={{
            transform: `translateX(${-160 + dragX * 0.3}px) rotate(-5deg) scale(0.86)`,
            zIndex: 10,
            opacity: 0.45,
            filter: "blur(2px)",
            transitionTimingFunction: SPRING,
          }}
        >
          <CardBody c={left} dim />
        </div>
        {/* 右卡（半透明 + 虚化） */}
        <div
          className={cardBase}
          style={{
            transform: `translateX(${160 + dragX * 0.3}px) rotate(5deg) scale(0.86)`,
            zIndex: 10,
            opacity: 0.45,
            filter: "blur(2px)",
            transitionTimingFunction: SPRING,
          }}
        >
          <CardBody c={right} dim />
        </div>
        {/* 当前卡（居中，跟随拖拽） */}
        <div
          className={cardBase}
          style={{
            transform: `translateX(${dragX}px) rotate(0) scale(1)`,
            zIndex: 30,
            boxShadow: "0 2px 6px rgba(60,45,30,.06), 0 14px 30px rgba(60,45,30,.16), 0 34px 70px rgba(60,45,30,.12)",
            transitionTimingFunction: SPRING,
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
          ← 滑动换人 →
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
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-5 py-2 text-sm text-body transition-colors hover:border-primary/50 hover:text-primary"
        >
          <IconGrid className="h-4 w-4" />
          查看全部
        </Link>
      </div>
    </div>
  );
}
