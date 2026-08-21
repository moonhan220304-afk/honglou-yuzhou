"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { characters, getCharacter, topQuestions, relationshipsOf, questions } from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";
import WanderButton from "@/components/wander-button";
import ScrollPanorama from "@/components/scroll-panorama";
import { heroImage } from "@/lib/images";
import { computeSky, skyBoxShadow } from "@/lib/sky";
import { fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import type { SkyState } from "@/lib/sky";

/* ---------- 每日轮换 + 设备个性化（热议话题） ---------- */

function lcgDaily(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 每日种子 = 北京日期 + 设备种子（localStorage 首次生成） */
function dailyPersonalSeed(): number {
  const now = new Date();
  const bj = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  const dayKey = `${bj.getFullYear()}${bj.getMonth() + 1}${bj.getDate()}`;
  let user = 0;
  try {
    user = Number(localStorage.getItem("hlm_user_seed")) || 0;
    if (!user) {
      user = Math.floor(Math.random() * 1e9);
      localStorage.setItem("hlm_user_seed", String(user));
    }
  } catch {
    user = 7;
  }
  return hashStr(`${dayKey}-${user}`);
}

/** 从高热度池子里按当日种子洗牌取 N 条：每天不同、每人不同，质量有保障 */
function pickDailyQuestions<T extends { heat_weight?: number }>(
  seed: number,
  all: T[],
  n: number,
): T[] {
  const pool = [...all]
    .sort((a, b) => (b.heat_weight ?? 0) - (a.heat_weight ?? 0))
    .slice(0, 15);
  const r = lcgDaily(seed);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

const navItems = [
  { href: "/characters", label: "人物" },
  { href: "/questions", label: "问题" },
  { href: "/graph", label: "关系图谱" },
  { href: "/test", label: "人格测试" },
  { href: "/community", label: "社区讨论" },
];

/** 首页地图热区（大观园俯瞰图上的发光锚点） */
const HOTSPOTS = [
  {
    id: "location_xiaoxiangguan",
    name: "潇湘馆",
    sub: "林黛玉居所",
    x: 53,
    y: 50,
  },
  {
    id: "location_yihongyuan",
    name: "怡红院",
    sub: "贾宝玉居所",
    x: 59,
    y: 57,
  },
  {
    id: "location_hengwuyuan",
    name: "蘅芜苑",
    sub: "薛宝钗居所",
    x: 66,
    y: 44,
  },
];

export default function HomeView({
  daiyuId,
  baoyuId,
  hotQuestion,
  discussions = 0,
}: {
  daiyuId: string;
  baoyuId: string;
  hotQuestion: {
    id: string;
    title: string;
    heat: number;
    characterCount: number;
    eventCount: number;
    viewpoints: { title: string; confidence: number }[];
    totalViewpoints: number;
  } | null;
  discussions?: number;
}) {
  const [showSpot, setShowSpot] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [qaOpen, setQaOpen] = useState(false);
  const [mobileQaOpen, setMobileQaOpen] = useState(false);
  const [dailyQs, setDailyQs] = useState<{
    hot: {
      id: string;
      title: string;
      heat: number;
      characterCount: number;
      eventCount: number;
      viewpoints: { title: string; confidence: number }[];
      totalViewpoints: number;
    } | null;
    list: { id: string; title: string; heat: number; characterId?: string }[];
  } | null>(null);

  useEffect(() => {
    let raf = 0;
    raf = requestAnimationFrame(() => {
      const seed = dailyPersonalSeed();
      const picked = pickDailyQuestions(seed, questions, 4);
      const hot = picked[0]
        ? {
            id: picked[0].id,
            title: picked[0].title,
            heat: picked[0].heat_weight,
            characterCount: picked[0].related_character_ids?.length ?? 0,
            eventCount: picked[0].related_event_ids?.length ?? 0,
            viewpoints: picked[0].viewpoints.map((v) => ({
              title: v.title,
              confidence: v.confidence,
            })),
            totalViewpoints: picked[0].viewpoints.length,
          }
        : null;
      setDailyQs({
        hot,
        list: picked.slice(1).map((q) => ({
          id: q.id,
          title: q.title,
          heat: q.heat_weight,
          characterId: q.related_character_ids?.[0],
        })),
      });
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  useEffect(() => {
    fetchMe().then(setMe);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [sky, setSky] = useState<SkyState | null>(null);
  const daiyu = getCharacter(daiyuId);
  const baoyu = getCharacter(baoyuId);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  return (
    <>
      <ScrollPanorama src={heroImage} zoomFrom={1.02} zoomTo={1.24} boost={showSpot} />
      {/* 文字可读性遮罩：轻量分层 */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,8,6,0.04)_0%,rgba(10,8,6,0.16)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/25 to-transparent" />

        {/* 天光：按北京时间随时间流转 */}
        {sky && (
          <>
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
              className="absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[3000ms]"
              style={{
                left: `${sky.sun.x}%`,
                top: `${sky.sun.y}%`,
                opacity: sky.sun.o * (1 - sky.night),
                background:
                  "radial-gradient(circle, rgba(255,240,205,0.95) 0%, rgba(255,205,130,0.5) 40%, rgba(255,190,120,0.12) 62%, transparent 72%)",
                filter: "blur(1px)",
              }}
            />
            {/* 明月 + 月光（高悬夜空，如轻纱般洒下） */}
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
                width: "6.5rem",
                height: "6.5rem",
                opacity: sky.moon.o * sky.night,
                background:
                  "radial-gradient(circle, rgba(214,230,255,0.5) 0%, rgba(196,216,255,0.18) 48%, transparent 72%)",
                filter: "blur(1.5px)",
              }}
            />
            <div
              className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-[3000ms]"
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
          </>
        )}
      </div>

      {/* 顶部导航：进入首屏即悬浮；滚动后加毛玻璃底避免内容穿底 */}
      <div
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#12100C]/85 shadow-[0_2px_18px_rgba(0,0,0,0.35)] backdrop-blur-md"
            : "bg-gradient-to-b from-black/50 via-black/25 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-8 md:px-12">
          <Link
            href="/"
            className={`flex items-center rounded-2xl border px-2.5 py-1.5 backdrop-blur-md transition-colors duration-300 ${
              scrolled
                ? "border-white/40 bg-[#F5F0E6]/95"
                : "border-white/20 bg-white/15 hover:bg-white/25"
            }`}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`}
              alt="红楼社"
              className="h-9 w-auto sm:h-11"
            />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/90 transition-colors duration-300 hover:text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <WanderButton className="hidden rounded-full bg-white/15 px-4 py-1.5 font-serif text-xs text-white backdrop-blur transition-colors hover:bg-white/25 sm:inline-block" />
            {me ? (
              <HomeUserMenu me={me} />
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-1.5 font-serif text-xs font-medium text-ink transition-colors hover:bg-white/85"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 首屏：大观园沉浸入口 */}
      <section
        className="relative flex min-h-screen flex-col justify-between px-5 pb-10 pt-24 sm:px-8 md:px-12"
        style={{ minHeight: "100svh" }}
      >
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* 左：主文案 */}
          <div>
            <div className="mb-5 inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 backdrop-blur-md">
              <span className="font-mono text-[11px] tracking-[0.2em] text-white drop-shadow">
                大观园 · 数字红楼世界
              </span>
            </div>
            <h1 className="font-serif text-3xl font-medium leading-[1.2] tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7),0_6px_24px_rgba(0,0,0,0.5)] sm:text-5xl lg:text-6xl">
              欢迎来到
              <br />
              大观园
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] sm:text-base">
              探索《红楼梦》的世界——从一个人物、一个问题、一个地点进入，在原文证据与多元观点之间，找到你自己的答案。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/journey"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-serif text-sm font-medium text-ink shadow-lg transition-all hover:bg-white/85"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 5v14l11-7z" />
                </svg>
                开始探索
              </Link>
              <button
                type="button"
                onClick={() => setShowSpot((s) => !s)}
                className="rounded-full border border-white/30 bg-white/10 px-6 py-3 font-serif text-sm text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                {showSpot ? "收起地图指引" : "逛逛大观园"}
              </button>
              {showSpot && (
                <span className="hidden text-xs text-white/75 drop-shadow md:inline">
                  点击发光圆点进入对应院落 →
                </span>
              )}
            </div>

            {/* 手机端：院落入口卡片（不叠在图上，避免被画面遮挡） */}
            {showSpot && (
              <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
                {HOTSPOTS.map((s) => (
                  <Link
                    key={s.id}
                    href={`/map/${s.id}`}
                    className="rounded-xl border border-white/20 bg-black/30 px-3 py-2.5 backdrop-blur-md transition-colors active:bg-black/45"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C0392B] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C0392B]" />
                      </span>
                      <span className="font-serif text-[13px] text-white">{s.name}</span>
                    </span>
                    <span className="mt-1 block text-[10px] leading-tight text-white/65">
                      {s.sub}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-8 font-serif text-sm italic text-white/80 drop-shadow">
              「满纸荒唐言，一把辛酸泪。」——《红楼梦》
            </p>
          </div>

          {/* 手机端：热议话题默认收起（按钮点击展开），不挡住首屏大观园 */}
          <div className="lg:hidden">
            {!showSpot && (
              <button
                type="button"
                onClick={() => setMobileQaOpen((v) => !v)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-black/30 px-4 py-2.5 font-serif text-sm text-white/90 backdrop-blur-md transition-colors active:bg-black/45"
              >
                {mobileQaOpen ? "收起热议话题" : "热议话题"}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform duration-300 ${mobileQaOpen ? "rotate-180" : ""}`}
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            )}
            <div
              className={`flex flex-col gap-3 transition-all duration-500 ease-out ${
                showSpot || !mobileQaOpen
                  ? "pointer-events-none max-h-0 translate-y-4 overflow-hidden opacity-0"
                  : "mt-3 max-h-[640px] opacity-100"
              }`}
            >
              <p className="font-mono text-[11px] tracking-[0.2em] text-white/80 drop-shadow">
                众说纷纭 · 今日热议
              </p>
              <HomeQuestionCard q={dailyQs?.hot ?? hotQuestion} />
              {(dailyQs?.list ??
                topQuestions(4)
                  .slice(1)
                  .map((q) => ({
                    id: q.id,
                    title: q.title,
                    heat: q.heat_weight,
                    characterId: q.related_character_ids?.[0],
                  }))).map((q) => (
                <QuestionCard
                  key={q.id}
                  id={q.id}
                  title={q.title}
                  heat={q.heat}
                  characterId={q.characterId}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 桌面端：热议话题抽屉（默认收在右侧只露把手，悬停拉出，移开收回） */}
        <div className="absolute inset-y-0 right-0 z-20 hidden items-center lg:flex">
          <div
            onMouseEnter={() => setQaOpen(true)}
            onMouseLeave={() => setQaOpen(false)}
            className={`flex items-center transition-transform duration-500 ease-out ${
              showSpot
                ? "translate-x-full"
                : qaOpen
                  ? "translate-x-0"
                  : "translate-x-[20rem]"
            }`}
          >
            <div className="flex h-36 w-9 cursor-pointer items-center justify-center rounded-l-xl border border-r-0 border-white/20 bg-[#0B0F1D]/70 backdrop-blur-md">
              <span className="text-xs tracking-[0.3em] text-white/85 [writing-mode:vertical-rl]">
                热议话题
              </span>
            </div>
            <div className="flex w-80 flex-col gap-3 rounded-l-2xl border border-white/20 bg-black/35 p-4 backdrop-blur-xl">
              <p className="font-mono text-[11px] tracking-[0.2em] text-white/80 drop-shadow">
                众说纷纭 · 今日热议
              </p>
              <HomeQuestionCard q={dailyQs?.hot ?? hotQuestion} />
              <div className="flex flex-col gap-3">
                {(dailyQs?.list ??
                  topQuestions(4)
                    .slice(1)
                    .map((q) => ({
                      id: q.id,
                      title: q.title,
                      heat: q.heat_weight,
                      characterId: q.related_character_ids?.[0],
                    }))).map((q) => (
                  <QuestionCard
                    key={q.id}
                    id={q.id}
                    title={q.title}
                    heat={q.heat}
                    characterId={q.characterId}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 地图热区标注（仅桌面；手机端改用户落卡片列表） */}
        {showSpot && (
          <div className="pointer-events-none absolute inset-0 hidden md:block">
            {HOTSPOTS.map((s) => (
              <Link
                key={s.id}
                href={`/map/${s.id}`}
                className="pointer-events-auto absolute -m-3 flex p-3 group"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
              >
                <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C0392B] opacity-60" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#C0392B] shadow-[0_0_10px_rgba(192,57,43,0.9)] sm:h-3 sm:w-3 sm:shadow-[0_0_12px_rgba(192,57,43,0.9)]" />
                </span>
                <span className="absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/30 bg-black/45 px-2.5 py-0.5 font-serif text-[10px] text-white opacity-90 backdrop-blur transition-opacity group-hover:bg-black/60 sm:px-3 sm:py-1 sm:text-xs">
                  {s.name}
                  <span className="hidden sm:inline"> · {s.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* 底部滚动引导 */}
        <div className="flex items-center justify-center gap-3 pt-8">
          <span className="h-px w-10 bg-white/40" />
          <span className="font-serif text-xs tracking-[0.3em] text-white/85 drop-shadow">
            滑动或点击，开始探索
          </span>
          <svg className="animate-bounce text-white/80" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span className="h-px w-10 bg-white/40" />
        </div>
      </section>

      {/* 推进空间 */}
      <div className="h-[60vh]" aria-hidden />

      {/* 下滑三板块（人物 / 热门问题 / 关系图谱） */}
      <section className="relative px-5 pb-16 sm:px-8 md:px-12">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          <ThreePanelCharacter character={daiyu} />
          <ThreePanelQuestion hotQuestion={hotQuestion} discussions={discussions} />
          <ThreePanelGraph character={baoyu} />
        </div>
      </section>
    </>
  );
}

/* ---------- 首屏问题卡 ---------- */

function QuestionCard({
  id,
  title,
  heat,
  characterId,
}: {
  id: string;
  title: string;
  heat: number;
  characterId?: string;
}) {
  return (
    <Link
      href={`/questions/${id}`}
      className="group flex items-center gap-4 rounded-2xl border border-white/20 bg-white/15 p-3.5 backdrop-blur-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/25"
    >
      {characterId && (
        <CharacterAvatar
          characterId={characterId}
          name={title.charAt(0)}
          className="h-12 w-12 shrink-0"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{title}</p>
        <p className="mt-0.5 text-xs text-white/70">{heat} 热度 · 多观点并陈</p>
      </div>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0 text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

function HomeQuestionCard({
  q,
}: {
  q: {
    id: string;
    title: string;
    heat: number;
    characterCount: number;
    eventCount: number;
    viewpoints: { title: string; confidence: number }[];
    totalViewpoints: number;
  } | null;
}) {
  if (!q) return null;
  return (
    <Link
      href={`/questions/${q.id}`}
      className="group rounded-2xl border border-white/25 bg-black/30 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-black/40"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-[#C0392B]/90 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-white">
          热议
        </span>
        <span className="font-mono text-[10px] tracking-wider text-white/70">
          {q.heat} 热度 · {q.characterCount} 相关人物 · {q.eventCount} 相关事件
        </span>
      </div>
      <p className="mt-2.5 font-serif text-base font-semibold text-white">{q.title}</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {q.viewpoints.slice(0, 2).map((v) => (
          <span
            key={v.title}
            className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/85"
          >
            {v.title}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-white/70">
        查看全部观点（{q.totalViewpoints}）→
      </p>
    </Link>
  );
}

/* ---------- 三板块 ---------- */

function ThreePanelCharacter({ character }: { character: ReturnType<typeof getCharacter> }) {
  if (!character) return null;
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-surface card-print card-print--identity p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
      <p className="font-mono text-[11px] tracking-[0.2em] text-gold">人物</p>
      <div className="mt-4 flex items-center gap-4">
        <CharacterAvatar
          characterId={character.id}
          name={character.name}
          className="h-20 w-20 shrink-0"
        />
        <div>
          <p className="font-serif text-xl font-semibold text-ink">{character.name}</p>
          <p className="mt-1 text-xs text-muted">
            {character.identity.position.split("；")[0]}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {character.tags.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded-full bg-paper-deep px-2.5 py-1 text-xs text-secondary-btn-text"
          >
            {t}
          </span>
        ))}
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-body">
        {character.summary.short}
      </p>
      <Link
        href={`/characters/${character.id}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-deep"
      >
        查看人物详情
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </div>
  );
}

function ThreePanelQuestion({
  hotQuestion,
  discussions,
}: {
  hotQuestion: {
    id: string;
    title: string;
    heat: number;
    characterCount: number;
    eventCount: number;
    viewpoints: { title: string; confidence: number }[];
    totalViewpoints: number;
  } | null;
  discussions: number;
}) {
  if (!hotQuestion) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface card-print card-print--timeline p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.2em] text-gold">热门问题</p>
        <Link href="/questions" className="text-xs text-muted hover:text-primary">
          更多问题 →
        </Link>
      </div>
      <p className="mt-4 font-serif text-lg font-semibold leading-snug text-ink">
        {hotQuestion.title}
      </p>
      <p className="mt-2 text-xs text-muted">
        {hotQuestion.heat} 热度 · {discussions || hotQuestion.heat * 2} 人讨论 ·{" "}
        {hotQuestion.characterCount} 相关人物 · {hotQuestion.eventCount} 相关事件
      </p>
      <div className="mt-4 space-y-2.5">
        {hotQuestion.viewpoints.slice(0, 3).map((v, i) => (
          <div key={v.title} className="flex items-center gap-3">
            <span className="w-20 shrink-0 truncate text-xs text-body">{v.title}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-paper-deep">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-primary"
                style={{ width: `${Math.min(100, v.confidence)}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-xs text-muted">
              {v.confidence}%
            </span>
          </div>
        ))}
      </div>
      <Link
        href={`/questions/${hotQuestion.id}`}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary-deep"
      >
        查看原文证据与全部观点
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Link>
    </div>
  );
}

function ThreePanelGraph({ character }: { character: ReturnType<typeof getCharacter> }) {
  if (!character) return null;
  const neighborIds = relationshipsOf(character.id)
    .map((r) => (r.from === character.id ? r.to : r.from))
    .filter((id, i, arr) => arr.indexOf(id) === i);
  const neighbors = neighborIds
    .map((id) => characters[id])
    .filter(Boolean)
    .slice(0, 6);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-surface card-print card-print--relations p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
      <p className="font-mono text-[11px] tracking-[0.2em] text-gold">关系图谱</p>
      <div className="mt-5 flex flex-col items-center">
        <CharacterAvatar
          characterId={character.id}
          name={character.name}
          className="h-16 w-16"
        />
        <p className="mt-2 font-serif text-sm font-semibold text-ink">{character.name}</p>
        <svg width="160" height="10" viewBox="0 0 160 10" className="mt-1">
          <line x1="0" y1="5" x2="160" y2="5" stroke="#C49A6C" strokeWidth="1" strokeDasharray="4 3" />
        </svg>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {neighbors.map((n) => (
            <Link
              key={n.id}
              href={`/characters/${n.id}`}
              className="flex items-center gap-1.5 rounded-full bg-paper-deep/60 px-2.5 py-1 text-xs text-secondary-btn-text transition-colors hover:border-gold/70 hover:text-primary"
            >
              <CharacterAvatar characterId={n.id} name={n.name} className="h-4 w-4 border-0 shadow-none" />
              {n.name}
            </Link>
          ))}
        </div>
      </div>
      <Link
        href="/graph"
        className="mt-5 block text-center text-sm font-medium text-primary transition-colors hover:text-primary-deep"
      >
        进入关系图谱 →
      </Link>
    </div>
  );
}

/** 首页深色版用户入口：点名字进个人中心，箭头展开菜单（与站内 UserMenu 一致） */
function HomeUserMenu({ me }: { me: Me }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div className="flex items-center overflow-hidden rounded-full border border-white/25 bg-white/15 backdrop-blur">
        <Link
          href="/profile"
          className="flex h-8 items-center gap-1.5 pl-3 pr-1 font-serif text-xs font-medium text-white transition-colors hover:bg-white/15"
          title="个人中心"
        >
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sitePath(me.avatar)} alt="头像" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25 font-serif text-[10px] text-white">
              {me.username.charAt(0)}
            </span>
          )}
          <span className="hidden max-w-[80px] truncate sm:inline">{me.username}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="用户菜单"
          className="flex h-8 w-7 items-center justify-center text-white transition-colors hover:bg-white/15"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-2xl border border-white/20 bg-[#14110C]/95 p-1.5 shadow-hover backdrop-blur-md">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            个人中心
          </Link>
          <Link
            href="/community/new"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            发起讨论
          </Link>
          <Link
            href="/community?mine=1"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            我的帖子
          </Link>
          {me.role === "admin" && (
            <a
              href={sitePath("/admin")}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              管理后台
            </a>
          )}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              try {
                await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" });
              } catch {}
              window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
