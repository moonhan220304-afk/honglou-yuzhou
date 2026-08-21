"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { heroImage } from "@/lib/images";
import PoemRotator from "@/components/poem-rotator";
import { formatTime } from "@/lib/client-community";

/* ---------- 沉浸式首屏（开机动画） ---------- */
function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const enter = () => {
    setLeaving(true);
    setTimeout(onEnter, 420);
  };
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#12100C] transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 星空大图 + 深色遮罩 */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
      {/* 星星点缀 */}
      {[
        ["12%", "16%", "0s"],
        ["78%", "22%", "0.6s"],
        ["26%", "64%", "1.1s"],
        ["86%", "58%", "0.3s"],
        ["60%", "10%", "1.6s"],
        ["38%", "28%", "0.9s"],
        ["70%", "76%", "1.9s"],
      ].map(([l, t, d], i) => (
        <span
          key={i}
          className="absolute text-[10px] text-white/70"
          style={{ left: l, top: t, animation: `sky-twinkle 2.4s ease-in-out ${d} infinite` }}
        >
          ✦
        </span>
      ))}

      <div className="relative z-10 px-6 text-center" style={{ animation: "star-panel-in 0.9s ease both" }}>
        <h1 className="font-serif text-5xl font-medium tracking-[0.35em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:text-7xl">
          红楼梦
        </h1>
        <p className="mt-6 font-serif text-sm italic leading-relaxed text-white/85 drop-shadow md:text-base">
          「满纸荒唐言，一把辛酸泪」
          <br />
          大观园 · 数字红楼世界
        </p>
        <button
          type="button"
          onClick={enter}
          className="mt-12 rounded-full border-2 border-white bg-white/10 px-12 py-3.5 font-serif text-base tracking-[0.5em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink"
        >
          开始探索
        </button>
      </div>

      <button
        type="button"
        onClick={enter}
        className="absolute bottom-6 right-6 z-10 text-xs text-white/50 underline underline-offset-4 transition-colors hover:text-white"
      >
        直接进入 →
      </button>
    </div>
  );
}

/* ---------- 首页内容 ---------- */
function HomeContent({ me }: { me: Me | null }) {
  const [feed, setFeed] = useState<
    { id: number; title: string; content: string; type: string; like_count: number; created_at: number; author: { username: string; avatar: string | null } }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api<{ items: typeof feed }>("/api/feed?tab=hot&per=12")
      .then((r) => setFeed(r.items))
      .catch(() => setFeed([]))
      .finally(() => setLoaded(true));
  }, []);

  const typeLabel: Record<string, string> = {
    post: "讨论",
    dynamic: "动态",
    longform: "长文",
    poem: "诗作",
    answer: "接句",
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[1fr_300px]">
      {/* 主列：今日热议 */}
      <section>
        <h2 className="flex items-center gap-3 font-serif text-2xl font-semibold text-ink">
          <span className="h-5 w-1 rounded-full bg-primary" />
          今日热议
        </h2>
        <p className="mt-1 text-sm text-muted">全站讨论热度最高的内容——帖子、动态、诗作都在这里</p>

        <div className="mt-5 space-y-4">
          {!loaded && (
            <p className="py-10 text-center text-sm text-muted">正在翻阅园中今日动静……</p>
          )}
          {loaded && feed.length === 0 && (
            <div className="rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
              <p className="font-serif text-ink">园中今日尚静。</p>
              <p className="mt-2 text-sm text-muted">
                去
                <Link href={sitePath("/community")} className="mx-1 text-primary hover:underline">聊一聊</Link>
                或
                <Link href={sitePath("/poem-society")} className="mx-1 text-primary hover:underline">海棠诗社</Link>
                发第一帖，就能在这里露脸。
              </p>
            </div>
          )}
          {feed.map((p) => (
            <Link
              key={p.id}
              href={`/community/post/?id=${p.id}`}
              className="card-print card-print--questions block rounded-2xl bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover"
            >
              <div className="flex items-center gap-2.5">
                <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {typeLabel[p.type] || p.type}
                </span>
                <span className="text-xs text-muted">{p.author.username}</span>
                <span className="ml-auto text-xs text-muted">{formatTime(p.created_at)}</span>
              </div>
              <h3 className="mt-2.5 font-serif text-[15px] font-semibold leading-relaxed text-ink">
                {p.title || p.content.slice(0, 40)}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-body">{p.content}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted">
                <span>赞 {p.like_count}</span>
                <span>· 点开参与讨论</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 右栏 */}
      <aside className="space-y-5">
        <div className="card-print card-print--identity rounded-2xl bg-surface p-5">
          {me ? (
            <>
              <div className="flex items-center gap-3">
                {me.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sitePath(me.avatar)} alt="" className="h-11 w-11 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-serif text-primary">
                    {me.username.slice(0, 1)}
                  </span>
                )}
                <div>
                  <div className="font-serif font-semibold text-ink">@{me.username}</div>
                  <div className="text-xs text-muted">{me.level_name ?? "懵懂"} · LV{me.level ?? 1}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">积分 {me.points ?? 0} · 关注 {me.followers ?? 0}</p>
              <Link
                href={sitePath("/profile")}
                className="mt-3 block rounded-full border border-primary/40 text-center text-xs text-primary transition-colors hover:bg-primary hover:text-white"
                style={{ padding: "6px 0" }}
              >
                进入我的空间 →
              </Link>
            </>
          ) : (
            <>
              <p className="font-serif text-sm text-ink">欢迎来大观园</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">登录后可以发帖、写诗、签到赚积分升级。</p>
              <Link
                href={sitePath("/login")}
                className="mt-3 block rounded-full bg-primary text-center text-xs text-white transition-colors hover:bg-primary-deep"
                style={{ padding: "7px 0" }}
              >
                登录 / 注册
              </Link>
            </>
          )}
        </div>

        <div className="card-print card-print--viewpoints rounded-2xl bg-surface p-5">
          <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-gold" />
            每日一诗
          </h3>
          <div className="mt-3">
            <PoemRotator />
          </div>
        </div>

        <div className="card-print rounded-2xl bg-surface p-5">
          <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-gold" />
            热度榜
          </h3>
          <ol className="mt-3 space-y-2">
            {feed.slice(0, 6).map((p, i) => (
              <li key={p.id} className="flex gap-2.5 text-sm">
                <span className="w-4 shrink-0 font-serif text-gold">{i + 1}</span>
                <Link href={`/community/post/?id=${p.id}`} className="line-clamp-1 text-body transition-colors hover:text-primary">
                  {p.title || p.content.slice(0, 24)}
                </Link>
              </li>
            ))}
            {feed.length === 0 && <li className="text-xs text-muted">暂无数据</li>}
          </ol>
        </div>
      </aside>
    </div>
  );
}

/* ---------- 首页（开机动画 + 内容） ---------- */
export default function HomePage() {
  const [entered, setEntered] = useState(false);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  if (!entered) return <SplashScreen onEnter={() => setEntered(true)} />;
  return <HomeContent me={me} />;
}
