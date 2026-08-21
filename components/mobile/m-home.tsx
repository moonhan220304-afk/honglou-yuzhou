"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { characters, questions } from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";
import PoemRotator from "@/components/poem-rotator";
import { computeSky, skyBoxShadow } from "@/lib/sky";
import type { SkyState } from "@/lib/sky";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 移动版首页：单列固定布局，任何视口宽度下都按手机尺寸渲染 */
export default function MHome() {
  const [qaOpen, setQaOpen] = useState(false);
  const [daily, setDaily] = useState<typeof questions | null>(null);
  const [sky, setSky] = useState<SkyState | null>(null);

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      setDaily(questions);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => setSky(computeSky());
    raf = requestAnimationFrame(update);
    const t = setInterval(update, 60000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(t);
    };
  }, []);

  const hot = daily ?? questions;

  return (
    <div className="mx-auto w-full max-w-[480px]">
      {/* 首屏：沉浸式全景（竖版大观园图全屏铺满） */}
      <div className="relative h-screen min-h-[600px] overflow-hidden">
        <img
          src={`${base}/images/hero/hero-garden-mobile.jpg`}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* 天光：按北京时间随时间流转（太阳/星空/日出黄昏），位于可读性遮罩之下 */}
        {sky && (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 transition-opacity duration-[3000ms]"
              style={{
                opacity: sky.night,
                background:
                  "linear-gradient(180deg, rgba(10,14,34,0.40) 0%, rgba(14,18,42,0.22) 45%, rgba(8,12,30,0.36) 100%)",
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-[3000ms]"
              style={{
                opacity: sky.dusk,
                background:
                  "radial-gradient(110% 55% at 75% 90%, rgba(255,132,64,0.30), transparent 60%), radial-gradient(120% 60% at 25% 95%, rgba(168,92,160,0.22), transparent 65%)",
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-[3000ms]"
              style={{
                opacity: sky.sunrise,
                background:
                  "radial-gradient(100% 52% at 22% 88%, rgba(255,150,86,0.34), transparent 58%), linear-gradient(0deg, rgba(255,166,96,0.12), transparent 45%)",
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-[3000ms]"
              style={{
                opacity: sky.day,
                background:
                  "linear-gradient(180deg, rgba(255,244,214,0.12) 0%, transparent 42%)",
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-[3000ms]"
              style={{ opacity: sky.stars }}
            >
              <div
                className="absolute left-0 top-0 h-px w-px rounded-full"
                style={{ boxShadow: skyBoxShadow, animation: "sky-twinkle 7s ease-in-out infinite" }}
              />
            </div>
            <div
              className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[3000ms]"
              style={{
                left: `${sky.sun.x}%`,
                top: `${sky.sun.y}%`,
                opacity: sky.sun.o * (1 - sky.night),
                background:
                  "radial-gradient(circle, rgba(255,240,205,0.95) 0%, rgba(255,205,130,0.5) 40%, rgba(255,190,120,0.12) 62%, transparent 72%)",
                filter: "blur(1px)",
              }}
            />
            <div
              className="absolute inset-0 transition-opacity duration-[3000ms]"
              style={{
                opacity: sky.stars * sky.moon.o,
                background: `radial-gradient(60% 40% at ${sky.moon.x}% ${sky.moon.y}%, rgba(196,220,255,0.12), transparent 70%)`,
              }}
            />
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[3000ms]"
              style={{
                left: `${sky.moon.x}%`,
                top: `${sky.moon.y}%`,
                width: "5.5rem",
                height: "5.5rem",
                opacity: sky.moon.o * sky.night,
                background:
                  "radial-gradient(circle, rgba(214,230,255,0.5) 0%, rgba(196,216,255,0.18) 48%, transparent 72%)",
                filter: "blur(1.5px)",
              }}
            />
            <div
              className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[3000ms]"
              style={{
                left: `${sky.moon.x}%`,
                top: `${sky.moon.y}%`,
                opacity: sky.moon.o * sky.night,
                background:
                  "radial-gradient(circle, rgba(255,254,246,1) 0%, rgba(252,249,235,0.95) 58%, rgba(240,240,255,0.7) 80%, rgba(214,226,255,0.35) 94%, transparent 100%)",
                boxShadow:
                  "0 0 16px 3px rgba(232,240,255,0.5), 0 0 48px 18px rgba(214,228,255,0.22)",
                filter: "blur(0.4px)",
              }}
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/60" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end px-5 pb-6 pt-24">
          <span className="inline-block w-fit border-l-2 border-white bg-white/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-white backdrop-blur">
            大观园 · 数字红楼世界
          </span>
          <h1 className="mt-3 font-serif text-[38px] font-medium leading-[1.15] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]">
            欢迎来到
            <br />
            大观园
          </h1>
          <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-white/92 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            探索《红楼梦》的世界——从一个人物、一个问题、一个地点进入，在原文证据与多元观点之间，找到你自己的答案。
          </p>
          <div className="mt-5 flex flex-col gap-2.5">
            <Link
              href="/journey"
              className="flex items-center justify-center gap-2 rounded-full bg-white py-3 font-serif text-[15px] font-medium text-ink shadow-lg"
            >
              ▶ 开始探索
            </Link>
            <Link
              href="/map"
              className="flex items-center justify-center rounded-full border border-white/35 bg-white/15 py-3 font-serif text-[15px] text-white backdrop-blur"
            >
              逛逛大观园
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2.5 pb-1">
            <span className="h-px w-8 bg-white/40" />
            <span className="font-serif text-[11px] tracking-[0.3em] text-white/85 drop-shadow">
              滑动或点击，开始探索
            </span>
            <svg
              className="animate-bounce text-white/80"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
            <span className="h-px w-8 bg-white/40" />
          </div>
        </div>
      </div>

      {/* 热议话题（默认收起） */}
      <div className="border-b border-line-inner bg-paper px-4 py-3">
        <button
          type="button"
          onClick={() => setQaOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl bg-surface px-4 py-3"
        >
          <span className="font-serif text-[15px] font-semibold text-ink">
            热议话题
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-muted transition-transform duration-300 ${qaOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {qaOpen && (
          <div className="mt-3 flex flex-col gap-2.5">
            {hot.slice(0, 4).map((q) => (
              <Link
                key={q.id}
                href={`/questions/${q.id}`}
                className="rounded-xl bg-surface p-3.5 shadow-card"
              >
                <p className="font-serif text-[14px] font-semibold leading-snug text-ink">
                  {q.title}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {q.heat_weight} 热度 · {q.viewpoints.length} 种观点
                </p>
              </Link>
            ))}
            <Link
              href="/questions"
              className="text-center text-xs text-primary"
            >
              查看全部问题 →
            </Link>
          </div>
        )}
      </div>

      {/* 模块入口：2×2 网格 */}
      <div className="grid grid-cols-2 gap-3 px-4 py-4">
        {[
          { href: "/characters", glyph: "人", title: "人物宇宙", sub: "74 位人物档案" },
          { href: "/questions", glyph: "问", title: "问题中心", sub: "295 个红学之问" },
          { href: "/journey", glyph: "径", title: "探索路线", sub: "逐站看懂命运" },
          { href: "/map", glyph: "园", title: "大观园地图", sub: "19 个地点" },
        ].map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="rounded-2xl bg-surface p-4 shadow-card"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-base text-primary">
              {m.glyph}
            </span>
            <p className="mt-2.5 font-serif text-[15px] font-semibold text-ink">
              {m.title}
            </p>
            <p className="mt-0.5 text-xs text-muted">{m.sub}</p>
          </Link>
        ))}
      </div>

      {/* 每日一诗 */}
      <div className="px-4 pb-2">
        <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          每日一诗
        </h2>
        <div className="mt-3">
          <PoemRotator />
        </div>
      </div>

      {/* 热门人物 */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            热门人物
          </h2>
          <Link href="/characters" className="text-xs text-primary">
            全部 →
          </Link>
        </div>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {(
            [
              ["character_lin_daiyu", "林黛玉"],
              ["character_jia_baoyu", "贾宝玉"],
              ["character_xue_baochai", "薛宝钗"],
              ["character_wang_xifeng", "王熙凤"],
              ["character_jia_tanchun", "贾探春"],
              ["character_jiamu", "贾母"],
            ] as const
          ).map(([id, name]) => (
            <Link
              key={id}
              href={`/characters/${id}`}
              className="flex w-[72px] shrink-0 flex-col items-center gap-1.5"
            >
              <CharacterAvatar characterId={id} name={name} className="h-16 w-16" />
              <span className="text-xs text-ink">{name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 引用 + 品牌 */}
      <div className="px-4 pb-8 pt-2 text-center">
        <p className="font-serif text-sm italic text-muted">
          「满纸荒唐言，一把辛酸泪。」——《红楼梦》
        </p>
        <p className="mt-2 text-[11px] text-muted/70">
          红楼社 · 一梦红楼 · 所有内容可溯源至原文
        </p>
      </div>
    </div>
  );
}
