"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, sitePath } from "@/lib/api";
import PoemRotator from "@/components/poem-rotator";
import { computeSky } from "@/lib/sky";
import type { SkyState } from "@/lib/sky";
import { formatTime } from "@/lib/client-community";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface FeedItem {
  id: number;
  title: string;
  content: string;
  type: string;
  like_count: number;
  created_at: number;
  author: { username: string; avatar: string | null };
}

const typeLabel: Record<string, string> = {
  post: "讨论",
  dynamic: "动态",
  longform: "长文",
  poem: "诗作",
  answer: "接句",
};

/** 移动版首页（第二阶段）：沉浸首屏（仅首次 + 可跳过）→ 今日热议 + 每日一诗 */
export default function MHome() {
  const [entered, setEntered] = useState(() => {
    // 首次访问才显示开机动画；之后直接进信息流（localStorage 记忆）
    try {
      return typeof window !== "undefined" && localStorage.getItem("hlm_visited") === "1";
    } catch {
      return false;
    }
  });
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sky, setSky] = useState<SkyState | null>(null);

  const enter = () => {
    try {
      localStorage.setItem("hlm_visited", "1");
    } catch {}
    setEntered(true);
  };

  // 自动跳过开机动画（3 秒）
  useEffect(() => {
    if (entered) return;
    const t = setTimeout(enter, 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

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

  useEffect(() => {
    api<{ items: FeedItem[] }>("/api/feed?tab=hot&per=10")
      .then((r) => setFeed(r.items))
      .catch(() => setFeed([]))
      .finally(() => setLoaded(true));
  }, []);

  /* ---------- 沉浸式首屏（开机动画） ---------- */
  if (!entered) {
    return (
      <div className="mx-auto w-full max-w-[480px]">
        <div className="relative h-screen min-h-[600px] overflow-hidden">
          <img
            src={`${base}/images/hero/hero-garden-mobile.jpg`}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
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
              <button
                type="button"
                onClick={enter}
                className="flex items-center justify-center gap-2 rounded-full bg-white py-3 font-serif text-[15px] font-medium text-ink shadow-lg transition-opacity active:opacity-80"
              >
                开始探索
              </button>
            </div>
            <button
              type="button"
              onClick={enter}
              className="mt-3 text-center text-[11px] text-white/55 underline underline-offset-4"
            >
              跳过，直接进入 →
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 内容首页 ---------- */
  return (
    <div className="mx-auto w-full max-w-[480px] pb-24">
      <div className="border-b border-line-inner bg-paper px-4 py-4">
        <h2 className="flex items-center gap-2 font-serif text-[19px] font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          今日热议
        </h2>
        <p className="mt-1 text-xs text-muted">全站讨论热度最高的内容</p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {!loaded && <p className="py-8 text-center text-xs text-muted">正在翻阅园中动静……</p>}
        {loaded && feed.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line bg-surface py-10 text-center text-xs text-muted">
            园中今日尚静，去
            <Link href={sitePath("/poem-society")} className="mx-0.5 text-primary">
              海棠诗社
            </Link>
            写第一首诗吧
          </p>
        )}
        {feed.map((p) => (
          <Link
            key={p.id}
            href={`/community/post/?id=${p.id}`}
            className="rounded-2xl bg-surface p-4 shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                {typeLabel[p.type] || p.type}
              </span>
              <span className="text-[11px] text-muted">{p.author.username}</span>
              <span className="ml-auto text-[10px] text-muted">{formatTime(p.created_at)}</span>
            </div>
            <p className="mt-2 font-serif text-[14px] font-semibold leading-snug text-ink">
              {p.title || p.content.slice(0, 36)}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{p.content}</p>
            <p className="mt-2 text-[11px] text-muted">赞 {p.like_count} · 点开参与讨论</p>
          </Link>
        ))}
      </div>

      <div className="border-t border-line-inner bg-paper px-4 py-4">
        <h2 className="flex items-center gap-2 font-serif text-[17px] font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-gold" />
          每日一诗
        </h2>
        <div className="mt-3">
          <PoemRotator />
        </div>
      </div>
    </div>
  );
}
