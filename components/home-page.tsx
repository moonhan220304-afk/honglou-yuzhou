"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { heroImage, characterImage } from "@/lib/images";
import { locations, characterName } from "@/lib/data";
import PoemRotator from "@/components/poem-rotator";
import { formatTime } from "@/lib/client-community";
import { IconFlame } from "@/components/icons";

/* ---------- 大观园全景热区（与早期沉浸首页一致：鼠标悬停浮现园名红标） ---------- */
const HOTSPOTS = [
  { id: "location_xiaoxiangguan", name: "潇湘馆", sub: "林黛玉居所", x: 53, y: 46 },
  { id: "location_yihongyuan", name: "怡红院", sub: "贾宝玉居所", x: 59, y: 54 },
  { id: "location_hengwuyuan", name: "蘅芜苑", sub: "薛宝钗居所", x: 66, y: 41 },
];

/* ---------- 沉浸式首屏（全景 + 园子红标 + 人物卡片飞出） ---------- */
function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [openSpot, setOpenSpot] = useState<string | null>(null);
  const enter = () => {
    setLeaving(true);
    setTimeout(onEnter, 420);
  };

  const spot = openSpot ? locations.find((l) => l.id === openSpot) : undefined;
  const residents =
    spot?.resident_character_ids?.slice(0, 5)
      .map((cid) => ({ id: cid, name: characterName(cid), img: characterImage(cid) }))
      .filter((c) => c.name !== c.id) ?? [];

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#12100C] transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 大观园全景 */}
      <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/20 to-black/70" />

      {/* 标题区 */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center" style={{ animation: "star-panel-in 0.9s ease both" }}>
        <h1 className="font-serif text-5xl font-medium tracking-[0.35em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:text-7xl">
          红楼梦
        </h1>
        <p className="mt-5 font-serif text-sm italic leading-relaxed text-white/85 drop-shadow md:text-base">
          「满纸荒唐言，一把辛酸泪」——大观园 · 数字红楼世界
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 md:flex-row md:gap-6">
          <button
            type="button"
            onClick={enter}
            className="rounded-full border-2 border-white bg-white/10 px-10 py-3 font-serif text-base tracking-[0.4em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink"
          >
            开始探索
          </button>
          <span className="font-serif text-xs tracking-[0.2em] text-white/70">
            或点击画面中的园子红标，看看谁住在这里
          </span>
        </div>
      </div>

      {/* 园子红标（悬停浮现园名） */}
      {HOTSPOTS.map((h) => {
        const open = openSpot === h.id;
        return (
          <button
            key={h.id}
            type="button"
            onMouseEnter={() => setOpenSpot(h.id)}
            onClick={() => setOpenSpot(h.id === openSpot ? null : h.id)}
            className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
          >
            <span className="relative flex h-3.5 w-3.5">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-[#C0392B] ${open ? "" : "animate-ping"} opacity-60`} />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#C0392B] shadow-[0_0_0_3px_rgba(192,57,43,0.25)]" />
            </span>
            <span
              className={`absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/70 px-2.5 py-1 font-serif text-xs text-white backdrop-blur transition-opacity duration-200 ${
                open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              }`}
            >
              {h.name}
              <span className="block text-[10px] font-normal text-white/70">{h.sub}</span>
            </span>
          </button>
        );
      })}

      {/* 人物卡片飞出（点击园子后悬浮在画面上） */}
      {openSpot && (
        <div className="absolute bottom-24 right-5 z-30 flex max-w-full flex-wrap justify-end gap-3 md:bottom-28 md:right-10" style={{ animation: "star-panel-in-x 0.35s ease both" }}>
          {residents.map((c, i) => (
            <Link
              key={c.id}
              href={`/characters/${c.id}`}
              className="group w-[74px] shrink-0 rounded-xl bg-paper/95 p-2 text-center shadow-lg backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl md:w-[88px]"
              style={{ animation: `star-panel-in 0.4s ${i * 0.07}s ease both` }}
            >
              {c.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sitePath(c.img)} alt={c.name} className="mx-auto h-12 w-12 rounded-full object-cover md:h-14 md:w-14" />
              ) : (
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-serif text-primary md:h-14 md:w-14">
                  {c.name.slice(0, 1)}
                </span>
              )}
              <span className="mt-1.5 block truncate font-serif text-xs text-ink group-hover:text-primary">{c.name}</span>
            </Link>
          ))}
          <div className="absolute -top-7 right-0 whitespace-nowrap font-serif text-xs text-white/80 drop-shadow">
            {spot?.name} · 住着这些人，点卡片进档案 →
          </div>
        </div>
      )}

      {/* 直接进入（常驻） */}
      <button
        type="button"
        onClick={enter}
        className="absolute bottom-6 right-6 z-30 text-xs text-white/55 underline underline-offset-4 transition-colors hover:text-white"
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
            <IconFlame className="h-4 w-4 text-gold" />
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
