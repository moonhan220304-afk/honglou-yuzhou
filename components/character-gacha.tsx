"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { characterImage } from "@/lib/images";
import { characterName } from "@/lib/data";
import { IconArrowLeft, IconArrowRight, IconGrid } from "@/components/icons";
import type { Character } from "@/lib/types";

/**
 * 人物志 · 抽卡式浏览 v4 —— 对齐参考图（一叠牌 · 卷轴式）
 *
 * 关键差异修正：
 * - 参考图是「垂直堆叠，后卡从底部露出一条边」（像一叠牌/卷轴，叙事沉浸感）
 * - 不是左右错位并排（那是选择/对比语义）
 * 实现：竖长卡 + 当前卡盖住后卡的上部、后卡底部露出一条边 + 扇形微旋转 + spring 切换
 */
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const STEP = 34; // 每层露出高度
const CARD_H = 500;

export default function CharacterGacha({ characters }: { characters: Character[] }) {
  const list = characters.filter((c) => c.id && c.name);
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = list.length;

  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + n) % n);
  const at = (i: number) => list[((i % n) + n) % n];

  /* 当前 → 下一张 → 再下一张：每层底部露出一条边（像一叠牌） */
  const cur = at(idx);
  const next = at(idx + 1);
  const behind = at(idx + 2);
  const H = CARD_H - STEP * 2; // 每张卡统一高度，露出由 top 错位产生

  const CardBody = ({ c, dim = false }: { c: Character; dim?: boolean }) => {
    const img = characterImage(c.id);
    const alias = c.aliases?.[0] ?? "";
    const ident = c.identity ? `${c.identity.position ?? ""}${c.identity.origin ? " · " + c.identity.origin : ""}` : "";
    return (
      <div className={`flex h-full w-full flex-col items-center justify-center px-7 text-center ${dim ? "pointer-events-none select-none" : ""}`}>
        {/* 圆形大头像（居中偏上，白描边 + 身份胶囊） */}
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


  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      {/* 标题（居中，对齐参考图） */}
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-gold">CHARACTERS</p>
        <h1 className="mt-2 font-serif text-[34px] font-semibold text-ink">人物志</h1>
        <p className="mt-2 text-sm text-muted">一张一位，左右滑动——不满意就换下一位</p>
      </div>

      {/* 卡片栈（竖长 + 底部露出堆叠） */}
      <div
        className="relative mx-auto mt-8 max-w-[330px] md:max-w-[350px]"
        style={{ height: CARD_H }}
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
        {/* 最底层卡（露出一条边） */}
        <div
          className="card-print card-print--identity absolute inset-x-0 top-0 overflow-hidden rounded-2xl bg-surface transition-all duration-500 motion-reduce:transition-none"
          style={{ position: "absolute", top: STEP * 2, height: H, zIndex: 10, transform: "rotate(-2.5deg) scale(0.97)", opacity: 0.5, transitionTimingFunction: SPRING }}
        >
          <CardBody c={behind} dim />
        </div>
        {/* 中层卡（露出一条边） */}
        <div
          className="card-print card-print--identity absolute inset-x-0 top-0 overflow-hidden rounded-2xl bg-surface transition-all duration-500 motion-reduce:transition-none"
          style={{ position: "absolute", top: STEP, height: H, zIndex: 20, transform: "rotate(1.5deg) scale(0.985)", opacity: 0.78, transitionTimingFunction: SPRING }}
        >
          <CardBody c={next} dim />
        </div>
        {/* 当前卡（最上层，完整显示，悬浮） */}
        <div
          className="card-print card-print--identity absolute inset-x-0 top-0 overflow-hidden rounded-2xl bg-surface transition-all duration-500 motion-reduce:transition-none"
          style={{
            position: "absolute",
            top: 0,
            height: H,
            zIndex: 30,
            transform: "rotate(-0.6deg) scale(1)",
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

        {/* 左右切换 */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一位"
          className="absolute -left-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-line bg-paper/95 p-3 text-body shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:text-primary md:-left-6"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一位"
          className="absolute -right-2 top-1/2 z-40 -translate-y-1/2 rounded-full border border-line bg-paper/95 p-3 text-body shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:text-primary md:-right-6"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* 滑动指示器（虚线 + 红点） */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-1.5">
          <span className="h-px w-10 bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-px w-10 bg-line" />
        </div>
      </div>

      {/* 查看全部 */}
      <div className="mt-5 text-center">
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
