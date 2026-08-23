"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { FeedItem, FollowItem, Me, PointsResp, PostSummary, TestStats } from "@/lib/api";
import { formatTime, QuestionSourceBadge } from "@/lib/client-community";
import { archetypes } from "@/lib/test-data";
import { getCharacter } from "@/lib/data";
import { characterImages } from "@/lib/images";
import TestResultShare from "@/components/test-result-share";
import type { TestShareData } from "@/components/test-result-share";
import LevelBadge from "@/components/level-badge";
import { IconArrowLeft, IconSearch, IconPlus } from "@/components/icons";
import { levelProgressPct, nextLevelName, remainToNext, todayKey, typeLabel } from "@/lib/levels";

type TabKey = "all" | "dynamic" | "longform" | "work";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "dynamic", label: "动态" },
  { key: "longform", label: "长文" },
  { key: "work", label: "作品" },
];

/** 个人内容条目：/api/posts?mine=1 为基础（含状态），/api/feed 补充 type */
interface MineItem {
  id: number;
  title: string;
  content: string;
  tag: string;
  status: string;
  type: string;
  like_count: number;
  view_count: number;
  question_id: string | null;
  created_at: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [items, setItems] = useState<MineItem[] | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [saveErr, setSaveErr] = useState("");
  const [follows, setFollows] = useState<FollowItem[] | null>(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState("");
  const [checkinBusy, setCheckinBusy] = useState(false);
  const [myTest, setMyTest] = useState<{ archetypeId: string; characterId: string } | null | undefined>(undefined);
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await fetchMe();
      setMe(m);
      if (!m) return;

      let base: MineItem[] = [];
      try {
        const r = await api<{ posts: PostSummary[] }>("/api/posts?mine=1");
        base = r.posts.map((p) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          tag: p.tag,
          status: p.status,
          type: "post",
          like_count: p.like_count,
          view_count: p.view_count,
          question_id: p.question_id,
          created_at: p.created_at,
        }));
      } catch {
        base = [];
      }

      const typeMap = new Map<number, string>();
      try {
        const r = await api<{ tab: string; items: FeedItem[] }>("/api/feed?tab=mine&per=30");
        for (const it of r.items) {
          if (it.author.id === m.id) typeMap.set(it.id, it.type);
        }
      } catch {
        /* feed 失败不阻塞 */
      }
      setItems(base.map((p) => ({ ...p, type: typeMap.get(p.id) ?? p.type })));

      try {
        const f = await api<{ ok: boolean; items: FollowItem[] }>(`/api/follows?user_id=${m.id}`);
        setFollows(f.items);
      } catch {
        setFollows([]);
      }

      try {
        const r = await api<PointsResp>("/api/points");
        const tk = todayKey();
        const logged = r.logs.some((l) => l.reason === "checkin" && l.ref === tk);
        setCheckedIn(m.last_checkin === tk || logged);
      } catch {
        setCheckedIn(m.last_checkin === todayKey());
      }

      try {
        const t = await api<{ result: { archetype_id: string; character_id: string } | null; stats: TestStats }>(
          "/api/test/result",
        );
        setMyTest(t.result ? { archetypeId: t.result.archetype_id, characterId: t.result.character_id } : null);
        setTestStats(t.stats);
      } catch {
        setMyTest(null);
      }
    })();
  }, []);

  const doCheckin = async () => {
    setCheckinBusy(true);
    setCheckinMsg("");
    try {
      const r = await api<{ ok: boolean; delta?: number; msg?: string }>("/api/checkin", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (r.ok) {
        setCheckedIn(true);
        setCheckinMsg(`签到成功，+${r.delta ?? 5} 积分`);
        const fresh = await fetchMe();
        if (fresh) setMe(fresh);
      } else {
        setCheckedIn(true);
        setCheckinMsg(r.msg ?? "今天已签到");
      }
    } catch (ex) {
      setCheckinMsg(ex instanceof Error ? ex.message : "签到失败，请稍后再试");
    } finally {
      setCheckinBusy(false);
    }
  };

  const deletePost = async (p: MineItem) => {
    if (!confirm(`确定删除《${p.title || "这条内容"}》吗？删除后不可恢复。`)) return;
    try {
      await api(`/api/posts/${p.id}`, { method: "DELETE" });
      setItems((list) => (list ? list.filter((x) => x.id !== p.id) : list));
    } catch (ex) {
      setSaveErr(ex instanceof Error ? ex.message : "删除失败");
    }
  };

  if (me === undefined) return <div className="min-h-[60vh]" />;
  if (me === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">请先登录</p>
        <Link href="/login?next=/profile" className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper">
          去登录
        </Link>
      </div>
    );
  }

  const points = me.points ?? 0;
  const level = me.level ?? 1;
  const levelName = me.level_name ?? "";
  const remain = remainToNext(points, level);
  const nextName = nextLevelName(level);
  const maxed = nextName === null;
  const pct = levelProgressPct(points, level);

  const visible = (items ?? []).filter((p) => {
    if (tab === "all") return true;
    if (tab === "dynamic") return p.type === "dynamic";
    if (tab === "longform") return p.type === "longform";
    if (tab === "work") return p.type === "poem" || p.type === "answer";
    return true;
  });
  const countOf = (key: TabKey) =>
    (items ?? []).filter((p) => {
      if (key === "all") return true;
      if (key === "dynamic") return p.type === "dynamic";
      if (key === "longform") return p.type === "longform";
      if (key === "work") return p.type === "poem" || p.type === "answer";
      return true;
    }).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <Link href="/community" className="text-xs text-muted transition-colors hover:text-primary">
        ← 返回
      </Link>

      {/* Hero：封面 + 头像 + 身份 + 数据条 */}
      <div className="mt-4 overflow-hidden rounded-3xl border border-line/60 bg-surface shadow-card">
        <div
          className="relative h-28 md:h-32"
          style={
            me.bg_image
              ? { backgroundImage: `url(${sitePath(me.bg_image)})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!me.bg_image && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface-warm to-surface" />
              <div className="card-print card-print--identity absolute inset-0 opacity-40" />
            </>
          )}
          {/* 顶部工具行：返回 / 搜索 / 分享 */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="返回"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
            >
              <IconArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Link
                href={sitePath("/search")}
                aria-label="搜索"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur"
              >
                <IconSearch className="h-5 w-5" />
              </Link>
              <Link
                href={sitePath("/profile/edit")}
                className="flex h-9 items-center rounded-full bg-white/90 px-3.5 text-xs font-medium text-primary shadow backdrop-blur"
              >
                编辑资料
              </Link>
            </div>
          </div>
          <p className="absolute bottom-2 right-4 text-[10px] tracking-[0.3em] text-white/70 drop-shadow">一梦红楼 · 我的空间</p>
        </div>
        <div className="px-5 pb-6 md:px-6">
          <div className="flex flex-wrap items-center gap-4">
            {me.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" src={sitePath(me.avatar)}
                alt="头像"
                className="relative z-10 -mt-12 h-24 w-24 rounded-full border-4 border-surface object-cover ring-1 ring-gold/50 shadow-card md:-mt-14 md:h-28 md:w-28"
              />
            ) : (
              <span className="relative z-10 -mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-primary/10 font-serif text-4xl text-primary ring-1 ring-gold/50 shadow-card md:-mt-14 md:h-28 md:w-28">
                {me.username.charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="min-w-0 truncate font-serif text-2xl font-semibold text-ink md:text-[26px]">{me.username}</h1>
                <LevelBadge level={level} levelName={levelName} />
              </div>
              {me.signature && <p className="mt-2 font-serif text-[13px] text-gold">「{me.signature}」</p>}
            </div>
          </div>

          {/* @账号 / 角色 / 注册于：头像下方（左对齐） */}
          <div className="mt-4 space-y-1.5 border-t border-line-inner/60 pt-3">
            <p className="text-xs text-muted">@{me.id}</p>
            <p className="text-xs text-muted">{me.role === "admin" ? "管理员" : "社友"}</p>
            <p className="text-xs text-muted">注册于 {formatTime(me.created_at)}</p>
          </div>

          {/* 数据条：关注 / 粉丝 / 内容 */}
          <div className="mt-5 grid grid-cols-3 border-t border-line-inner/70 pt-4 text-center">
            {[
              { label: "关注", value: me.following ?? 0 },
              { label: "粉丝", value: me.followers ?? 0 },
              { label: "内容", value: items?.length ?? 0 },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-mono text-xl font-semibold text-ink">{s.value}</p>
                <p className="mt-0.5 text-[11px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 我的关注头像条 */}
          {follows !== null && follows.length > 0 && (
            <div className="mt-4 flex items-center gap-3 border-t border-line-inner/70 pt-4">
              <div className="flex -space-x-2">
                {follows.slice(0, 8).map((f) => (
                  <Link key={f.id} href={`/u?id=${f.id}`} className="group">
                    {f.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" src={sitePath(f.avatar)}
                        alt={f.username}
                        className="h-8 w-8 rounded-full border-2 border-surface object-cover ring-1 ring-gold/40 transition-transform group-hover:-translate-y-0.5"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-primary/10 font-serif text-[11px] text-primary transition-transform group-hover:-translate-y-0.5">
                        {f.username.charAt(0)}
                      </span>
                    )}
                  </Link>
                ))}
                {(me.following ?? 0) > 8 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-paper-deep font-mono text-[10px] text-muted">
                    +{(me.following ?? 0) - 8}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted">我的关注 · {me.following ?? 0}</span>
            </div>
          )}
        </div>
      </div>

      {/* 右下角快捷发布（移动端） */}
      <Link
        href={sitePath("/community/status")}
        aria-label="发动态"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-paper shadow-lg md:hidden"
      >
        <IconPlus className="h-6 w-6" />
      </Link>

      {/* sticky Tab */}
      <div className="sticky top-14 z-10 -mx-4 mt-6 border-b border-line/60 bg-paper/90 px-4 backdrop-blur md:-mx-6 md:px-6">
        <nav className="flex gap-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-1 pb-3 pt-2 font-serif text-sm transition-colors ${
                tab === t.key ? "border-primary font-semibold text-primary" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t.label}
              <span className="ml-1 font-mono text-xs opacity-60">{countOf(t.key)}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 主内容：feed + 右栏 */}
      <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* 主列 feed（单列时间线） */}
        <div className="min-w-0">
          {/* 移动端签到 + 积分（lg 以下显示，桌面端在右栏） */}
          <div className="mb-4 rounded-2xl border border-line/60 bg-surface p-4 shadow-card lg:hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">积分</span>
              <span className="font-serif text-xl font-semibold text-primary">{points}</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              {maxed ? "已至最高等级「元老」" : `距下一级「${nextName}」还差 ${remain} 分`}
            </p>
            <button
              type="button"
              onClick={doCheckin}
              disabled={checkedIn || checkinBusy}
              className={`mt-2.5 w-full rounded-full px-4 py-2 font-serif text-sm transition-colors disabled:cursor-default ${
                checkedIn ? "border border-gold/50 bg-surface text-gold" : "bg-primary text-paper hover:bg-primary-deep"
              }`}
            >
              {checkinBusy ? "签到中…" : checkedIn ? "今日已签到 ✓" : "每日签到 ＋5 分"}
            </button>
            {checkinMsg && <p className={`mt-2 text-center text-xs ${checkinMsg.includes("失败") ? "text-danger" : "text-primary"}`}>{checkinMsg}</p>}

            {/* 移动端管理入口（桌面端在右栏） */}
            <div className="mt-3 flex items-center justify-between border-t border-line-inner pt-3 text-sm">
              <Link href="/profile/points" className="text-body transition-colors hover:text-primary">积分明细</Link>
              <Link href="/profile/edit" className="text-body transition-colors hover:text-primary">编辑资料</Link>
              <Link href={`/u?id=${me.id}`} className="text-body transition-colors hover:text-primary">我的主页</Link>
              <button
                type="button"
                onClick={async () => {
                  try { await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" }); } catch {}
                  router.push("/");
                }}
                className="text-muted transition-colors hover:text-danger"
              >
                退出登录
              </button>
            </div>
          </div>

          {saveErr && <p className="mb-2 text-xs text-danger">{saveErr}</p>}
          {items === null && <p className="py-10 text-sm text-muted">加载中…</p>}
          {items !== null && visible.length === 0 && (
            <p className="rounded-2xl bg-paper-deep/60 p-8 text-center text-sm text-muted">
              {tab === "all" ? "还没有发布过内容，" : "这一档还没有内容，"}
              <Link href="/community/new" className="text-primary hover:underline">去发起讨论</Link>
            </p>
          )}
          {visible.map((p) => (
            <article key={p.id} className="group relative border-b border-line-inner/60 py-5 transition-colors hover:bg-paper-deep/30 md:px-2">
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{typeLabel(p.type)}</span>
                {p.status === "pending" && <span className="rounded-full bg-warning/15 px-2.5 py-0.5 text-warning">待审核</span>}
                {p.status === "removed" && <span className="rounded-full bg-danger/15 px-2.5 py-0.5 text-danger">已删除</span>}
                <span>{formatTime(p.created_at)}</span>
                <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                  {p.status !== "removed" && (
                    <button type="button" onClick={() => deletePost(p)} className="text-danger/70 hover:text-danger">
                      删除
                    </button>
                  )}
                </span>
              </div>
              <Link href={`/community/post/?id=${p.id}`} className="block">
                <h2 className="mt-1.5 font-serif text-[15px] font-semibold leading-snug text-ink group-hover:text-primary">
                  {p.title || "（无标题）"}
                </h2>
                {p.content && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-body">{p.content}</p>}
                {p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-1.5" />}
              </Link>
              <div className="mt-2.5 flex items-center gap-5 text-xs text-muted">
                <span>赞 {p.like_count}</span>
                <span className="ml-auto">阅读 {p.view_count}</span>
              </div>
            </article>
          ))}
        </div>

        {/* 右栏：成长 + 管理 + 测试结果（下沉的次要操作） */}
        <aside className="hidden space-y-5 lg:block">
          <div className="sticky top-20 space-y-5">
            {/* 成长 pill：签到 + 积分进度 */}
            <div className="rounded-2xl border border-line/60 bg-surface p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted">积分</span>
                <span className="font-serif text-2xl font-semibold text-primary">{points}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {maxed ? "已至最高等级「元老」" : `距下一级「${nextName}」还差 ${remain} 分`}
              </p>
              <button
                type="button"
                onClick={doCheckin}
                disabled={checkedIn || checkinBusy}
                className={`mt-3 w-full rounded-full px-4 py-2 font-serif text-sm transition-colors disabled:cursor-default ${
                  checkedIn ? "border border-gold/50 bg-surface text-gold" : "bg-primary text-paper hover:bg-primary-deep"
                }`}
              >
                {checkinBusy ? "签到中…" : checkedIn ? "今日已签到 ✓" : "每日签到 ＋5 分"}
              </button>
              {checkinMsg && <p className={`mt-2 text-center text-xs ${checkinMsg.includes("失败") ? "text-danger" : "text-primary"}`}>{checkinMsg}</p>}
            </div>

            {/* 管理入口 */}
            <div className="rounded-2xl border border-line/60 bg-surface p-4 shadow-card">
              <h3 className="font-serif text-base font-semibold text-ink">管理</h3>
              <div className="mt-2 flex flex-col text-sm">
                <Link href="/profile/points" className="rounded-lg px-2 py-2 text-body transition-colors hover:bg-paper-deep hover:text-primary">积分明细 →</Link>
                <Link href={`/u?id=${me.id}`} className="rounded-lg px-2 py-2 text-body transition-colors hover:bg-paper-deep hover:text-primary">我的公开主页 →</Link>
                {me.role === "admin" && (
                  <a href={sitePath("/admin")} className="rounded-lg px-2 py-2 text-body transition-colors hover:bg-paper-deep hover:text-primary">管理后台 →</a>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" });
                    } catch {}
                    router.push("/");
                  }}
                  className="rounded-lg px-2 py-2 text-left text-muted transition-colors hover:bg-paper-deep hover:text-danger"
                >
                  退出登录
                </button>
              </div>
            </div>

            {/* 测试结果徽章 */}
            {myTest && (() => {
              const arch = archetypes.find((a) => a.id === myTest.archetypeId) ?? archetypes[0];
              const character = getCharacter(arch.character_id);
              const avatar = characterImages[arch.character_id] ?? null;
              const sameCount = testStats?.byType.find((t) => t.archetype_id === arch.id)?.c ?? 0;
              const shareData: TestShareData | null = shareOpen
                ? {
                    title: arch.title,
                    characterId: arch.character_id,
                    characterName: character?.name ?? arch.title,
                    avatarUrl: avatar,
                    summary: arch.summary,
                    dimensions: arch.dimensions,
                    traits: arch.traits,
                    statsTotal: testStats?.total ?? 0,
                    statsSame: sameCount,
                  }
                : null;
              return (
                <div className="rounded-2xl border border-line/60 bg-surface p-4 shadow-card">
                  <h3 className="font-serif text-base font-semibold text-ink">红楼人格</h3>
                  <div className="mt-3 flex items-center gap-3">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img loading="lazy" src={avatar} alt={character?.name ?? ""} className="h-12 w-12 rounded-full border-2 border-gold object-cover" />
                    ) : (
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-serif text-xl text-primary">
                        {character?.name.charAt(0) ?? "红"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-serif text-sm font-semibold text-ink">{arch.title}</p>
                      <p className="truncate text-xs text-muted">对应人物：{character?.name}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setShareOpen(true)} className="rounded-full bg-primary px-4 py-1.5 font-serif text-xs text-paper transition-colors hover:bg-primary-deep">
                      分享
                    </button>
                    <Link href="/test" className="rounded-full bg-paper-deep px-4 py-1.5 font-serif text-xs text-secondary-btn-text transition-colors hover:bg-line/60">
                      重新测试
                    </Link>
                  </div>
                  <TestResultShare data={shareData} onClose={() => setShareOpen(false)} />
                </div>
              );
            })()}
          </div>
        </aside>
      </div>
    </div>
  );
}
