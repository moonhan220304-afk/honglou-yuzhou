"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { heroImage, characterImage } from "@/lib/images";
import { locations, characterName, getCharacter, relationshipsOf, counterpart } from "@/lib/data";
import { computeSky, skyBoxShadow, type SkyState } from "@/lib/sky";
import PoemRotator from "@/components/poem-rotator";
import { formatTime } from "@/lib/client-community";
import { IconFlame, IconArrowLeft, IconArrowRight } from "@/components/icons";

/* ---------- 大观园全景红点 ---------- */
const HOTSPOTS = [
  { id: "location_xiaoxiangguan", name: "潇湘馆", sub: "林黛玉居所", x: 53, y: 46 },
  { id: "location_yihongyuan", name: "怡红院", sub: "贾宝玉居所", x: 59, y: 54 },
  { id: "location_hengwuyuan", name: "蘅芜苑", sub: "薛宝钗居所", x: 66, y: 41 },
];

/* ---------- 沉浸式首屏（欢迎 → 探索 → 人物卡弹到中央） ---------- */
function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);
  const [sky, setSky] = useState<SkyState | null>(null);
  const [started, setStarted] = useState(false); // 点击「开始探索」后进入发现态
  const [leavingIntro, setLeavingIntro] = useState(false); // 欢迎态退场淡出
  const [openSpot, setOpenSpot] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null); // 手碰到的红点（显示宅邸名）
  const [residentIdx, setResidentIdx] = useState(0); // 当前展示的第几位居民
  const [blinkEnter, setBlinkEnter] = useState(false);

  useEffect(() => {
    setSky(computeSky());
    const t = setInterval(() => setSky(computeSky()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setBlinkEnter(true), 6000);
    return () => clearTimeout(t);
  }, [started]);

  // Esc 关闭人物卡
  useEffect(() => {
    if (!openSpot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSpot(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSpot]);

  const enter = () => {
    setLeaving(true);
    setTimeout(onEnter, 500);
  };

  const start = () => {
    setLeavingIntro(true);
    setTimeout(() => setStarted(true), 300);
  };

  const openSpotById = (id: string) => {
    setBlinkEnter(false);
    setOpenSpot(id);
    setResidentIdx(0);
  };
  const closeSpot = () => setOpenSpot(null);

  const spot = openSpot ? locations.find((l) => l.id === openSpot) : undefined;
  const residents =
    spot?.resident_character_ids?.slice(0, 12)
      .map((cid) => {
        const c = getCharacter(cid);
        if (!c) return null;
        return {
          id: cid,
          name: c.name,
          img: characterImage(cid),
          tag: c.category ?? "",
          aliases: c.aliases ?? [],
          identity: c.identity?.position ?? "",
          summary: c.summary?.short ?? "",
          tags: c.tags ?? [],
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null) ?? [];
  const cur = residents[Math.min(residentIdx, residents.length - 1)];
  const rels = cur
    ? relationshipsOf(cur.id)
        .slice(0, 5)
        .map((r) => {
          const other = counterpart(r.id, cur.id);
          return other ? { id: r.id, name: characterName(other), type: r.type } : null;
        })
        .filter((x): x is { id: string; name: string; type: string } => x !== null)
    : [];
  const prevResident = () => setResidentIdx((i) => (i - 1 + residents.length) % residents.length);
  const nextResident = () => setResidentIdx((i) => (i + 1) % residents.length);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#12100C] transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 大观园全景 */}
      <div className="absolute inset-0" style={{ animation: "garden-zoom-in 1.4s cubic-bezier(0.22,1,0.36,1) both" }}>
        <img src={heroImage} alt="" className="h-full w-full object-cover opacity-90" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/60" />

      {/* 天光系统 */}
      {sky && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 transition-opacity duration-[3000ms]" style={{ opacity: sky.night, background: "linear-gradient(180deg, rgba(10,14,34,.40), rgba(14,18,42,.22) 45%, rgba(8,12,30,.36))" }} />
          <div className="absolute inset-0 transition-opacity duration-[3000ms]" style={{ opacity: sky.dusk, background: "radial-gradient(110% 55% at 75% 90%, rgba(255,132,64,.30), transparent 60%), radial-gradient(120% 60% at 25% 95%, rgba(168,92,160,.22), transparent 65%)" }} />
          <div className="absolute inset-0 transition-opacity duration-[3000ms]" style={{ opacity: sky.sunrise, background: "radial-gradient(100% 52% at 22% 88%, rgba(255,150,86,.34), transparent 58%), linear-gradient(0deg, rgba(255,166,96,.12), transparent 45%)" }} />
          <div className="absolute inset-0 transition-opacity duration-[3000ms]" style={{ opacity: sky.day, background: "radial-gradient(120% 60% at 50% 20%, rgba(255,244,214,.18), transparent 60%)" }} />
          <div className="absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full blur-sm transition-opacity duration-[3000ms]" style={{ left: `${sky.sun.x}%`, top: `${sky.sun.y}%`, opacity: sky.sun.o, background: "radial-gradient(circle, rgba(255,236,180,.85), transparent 70%)" }} />
          <div className="absolute h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4efdf] shadow-[0_0_40px_16px_rgba(240,235,210,.35)] transition-opacity duration-[3000ms]" style={{ left: `${sky.moon.x}%`, top: `${sky.moon.y}%`, opacity: sky.moon.o }} />
          <div className="absolute left-0 top-0 h-[2px] w-[2px] rounded-full bg-white transition-opacity duration-[3000ms]" style={{ opacity: sky.stars, boxShadow: skyBoxShadow, animation: "sky-twinkle 4s ease-in-out infinite" }} />
        </div>
      )}

      {/* 欢迎态：标题在上、欢迎词在下、开始探索 */}
      {!started && (
        <div
          className={`relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center transition-opacity duration-300 ${
            leavingIntro ? "opacity-0" : "opacity-100"
          }`}
        >
          <h1 className="font-serif text-5xl font-medium tracking-[0.35em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:text-7xl" style={{ animation: "star-panel-in 0.9s ease both" }}>
            红楼梦
          </h1>
          <p className="mt-5 font-serif text-sm italic leading-relaxed text-white/85 drop-shadow md:text-base" style={{ animation: "star-panel-in 0.9s ease 0.12s both" }}>
            「满纸荒唐言，一把辛酸泪」——大观园 · 数字红楼世界
          </p>
          <button
            type="button"
            onClick={start}
            className="mt-10 rounded-full border-2 border-white/80 bg-white/10 px-10 py-3 font-serif text-base tracking-[0.4em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-ink"
          >
            开始探索
          </button>
        </div>
      )}

      {/* 探索态：只显示红点（发光引导）；卡片打开时隐藏红点，避免串在卡片上 */}
      {started && !openSpot && (
        <>
          {HOTSPOTS.map((h) => {
            const showName = hovered === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => openSpotById(h.id)}
                onPointerEnter={() => setHovered(h.id)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(h.id)}
                onBlur={() => setHovered(null)}
                aria-label={`${h.name} ${h.sub}`}
                className="absolute z-40 -translate-x-1/2 -translate-y-1/2 p-3"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <span className="relative flex h-3.5 w-3.5" style={{ animation: "dot-pop 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-primary shadow-[0_0_0_3px_rgba(192,57,43,0.25)]" style={{ animation: "dot-glow 2.2s ease-in-out infinite" }} />
                </span>
                <span
                  className={`absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/70 px-2.5 py-1 font-serif text-xs text-white backdrop-blur transition-opacity duration-150 ${
                    showName ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {h.name}
                  <span className="block text-[10px] font-normal text-white/70">{h.sub}</span>
                </span>
              </button>
            );
          })}
        </>
      )}

      {/* 人物卡：点击红点后弹「单张」大卡（关系图谱同款格式），可关闭/切换府邸 */}
      {openSpot && spot && cur && (
        <>
          {/* 点空白处关闭 */}
          <div className="absolute inset-0 z-[25]" onClick={closeSpot} aria-hidden />

          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-3">
            <div className="flex items-center gap-2 md:gap-3">
              {/* 换一位（左） */}
              {residents.length > 1 && (
                <button
                  type="button"
                  onClick={prevResident}
                  aria-label="上一位"
                  className="pointer-events-auto shrink-0 rounded-full border border-white/30 bg-black/50 p-2 text-white/85 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
                >
                  <IconArrowLeft className="h-5 w-5" />
                </button>
              )}

              {/* 单张大卡 */}
              <div
                className="pointer-events-auto relative w-[320px] max-w-[78vw] overflow-hidden rounded-2xl border border-white/10 bg-[#0D1220]/95 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl"
                style={{ animation: "card-pop-center 360ms cubic-bezier(0.16,1,0.3,1) both" }}
              >
                <button
                  type="button"
                  onClick={closeSpot}
                  aria-label="关闭"
                  className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-sm text-white/60 transition-colors hover:bg-white/[0.14] hover:text-white"
                >
                  ×
                </button>

                <div className="p-5">
                  {/* 头像 + 姓名 */}
                  <div className="flex items-center gap-3">
                    {cur.img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" src={cur.img}
                        alt={cur.name}
                        className="h-14 w-14 shrink-0 rounded-full object-cover object-top ring-2 ring-[#E8C98F]/70 shadow-[0_0_18px_rgba(232,201,143,0.35)]"
                      />
                    ) : (
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/[0.06] font-serif text-xl text-[#E8C98F]">
                        {cur.name.charAt(0)}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-serif text-lg font-semibold text-[#F2EBDC]">{cur.name}</p>
                      <p className="mt-0.5 text-xs text-white/50">
                        {cur.aliases.length > 0 ? cur.aliases.slice(0, 2).join(" · ") : cur.tag || "红楼人物"}
                      </p>
                    </div>
                  </div>

                  {/* 身份 */}
                  {cur.identity && (
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-white/70">
                      {cur.identity.split("；")[0]}
                    </p>
                  )}

                  {/* 简介 */}
                  {cur.summary && (
                    <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-white/55">{cur.summary}</p>
                  )}

                  {/* 标签 */}
                  {cur.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {cur.tags.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[10px] text-white/70">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 关系列表 */}
                  {rels.length > 0 && (
                    <div className="mt-4 border-t border-white/10 pt-3">
                      <p className="text-[10px] tracking-[0.2em] text-white/40">星缘 · {rels.length} 条关系</p>
                      <div className="mt-2 space-y-1.5">
                        {rels.map((r) => (
                          <div key={r.id} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8C98F]" />
                            <span className="min-w-0 flex-1 truncate text-xs text-[#EDE9DF]">{r.name}</span>
                            <span className="shrink-0 text-[10px] text-white/45">{r.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 进入完整档案 */}
                  <Link
                    href={`/characters/${cur.id}`}
                    className="mt-4 block rounded-full border border-[#E8C98F]/40 bg-[#E8C98F]/10 py-2 text-center text-xs font-medium text-[#E8C98F] transition-colors hover:bg-[#E8C98F]/20"
                  >
                    进入完整档案 →
                  </Link>
                </div>
              </div>

              {/* 换一位（右） */}
              {residents.length > 1 && (
                <button
                  type="button"
                  onClick={nextResident}
                  aria-label="下一位"
                  className="pointer-events-auto shrink-0 rounded-full border border-white/30 bg-black/50 p-2 text-white/85 backdrop-blur transition-colors hover:bg-black/70 hover:text-white"
                >
                  <IconArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* 直接进入（常驻胶囊，停留未操作时闪动） */}
      <button
        type="button"
        onClick={enter}
        className="absolute bottom-6 right-6 z-40 rounded-full border border-white/40 bg-black/30 px-5 py-2.5 font-serif text-sm tracking-[0.25em] text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/20"
        style={{ animation: blinkEnter ? "enter-blink 1.6s ease-in-out infinite" : "none" }}
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
                  <img loading="lazy" src={sitePath(me.avatar)} alt="" className="h-11 w-11 rounded-full object-cover" />
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

        <div className="card-print card-print--identity rounded-2xl bg-surface p-5">
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
