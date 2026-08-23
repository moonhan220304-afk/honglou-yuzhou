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
import ProfileShareCard from "@/components/profile-share-card";
import LevelBadge from "@/components/level-badge";
import { IconSearch, IconPlus, IconShare, IconHeart, IconEye } from "@/components/icons";
import { levelProgressPct, nextLevelName, remainToNext, todayKey, typeLabel } from "@/lib/levels";

type TabKey = "all" | "board" | "dynamic";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "board", label: "贴吧" },
  { key: "dynamic", label: "动态" },
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
  const [cardOpen, setCardOpen] = useState(false);

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
    if (tab === "board") return p.type === "post" || p.type === "longform";
    if (tab === "dynamic") return p.type === "dynamic";
    return true;
  });
  const countOf = (key: TabKey) =>
    (items ?? []).filter((p) => {
      if (key === "all") return true;
      if (key === "board") return p.type === "post" || p.type === "longform";
      if (key === "dynamic") return p.type === "dynamic";
      return true;
    }).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      {/* 顶部行：返回 + 搜索（同排，不叠在背景图上） */}
      <div className="flex items-center justify-between">
        <Link href="/community" className="text-xs text-muted transition-colors hover:text-primary">
          ← 返回
        </Link>
        <Link
          href="/search"
          aria-label="搜索"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep/70 text-muted transition-colors hover:bg-line/60 hover:text-primary"
        >
          <IconSearch className="h-4 w-4" />
        </Link>
      </div>

      {/* Hero：封面 + 头像 + 身份（Twitter 式，与用户主页一致） */}
      <div className="mt-4">
        <div
          className="relative h-36 w-full md:h-44"
          style={
            me.bg_image
              ? { backgroundImage: `url(${sitePath(me.bg_image)})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!me.bg_image && <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-surface-warm to-surface" />}
        </div>
        <div className="px-4 md:px-6">
          <div className="relative -mt-12 flex items-end justify-between">
            {me.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img loading="lazy" src={sitePath(me.avatar)}
                alt="头像"
                className="h-24 w-24 rounded-full border-4 border-surface object-cover ring-1 ring-gold/50 shadow-card md:h-28 md:w-28"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-surface bg-primary/10 font-serif text-4xl text-primary ring-1 ring-gold/50 shadow-card md:h-28 md:w-28">
                {me.username.charAt(0)}
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCardOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-gold/60 px-4 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary"
              >
                <IconShare className="h-3.5 w-3.5" />
                分享
              </button>
              <Link
                href="/profile/edit"
                className="flex h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-paper transition-colors hover:bg-primary-deep"
              >
                编辑资料
              </Link>
            </div>
          </div>

          {/* 名字（金色加粗）+ 等级 + 签名 */}
          <h1 className="mt-3 font-serif text-2xl font-bold leading-snug text-title-gold md:text-[26px]">{me.username}</h1>
          <div className="mt-1">
            <LevelBadge level={level} levelName={levelName} />
          </div>
          <p className="mt-2 font-serif text-sm text-body">
            {me.signature ? `「${me.signature}」` : "「无」"}
          </p>

          {/* 统计 */}
          <div className="mt-4 flex items-center gap-5 text-sm">
            <span className="text-body">
              <b className="font-mono text-ink">{me.following ?? 0}</b>
              <span className="ml-1 text-muted">关注</span>
            </span>
            <span className="text-body">
              <b className="font-mono text-ink">{me.followers ?? 0}</b>
              <span className="ml-1 text-muted">粉丝</span>
            </span>
            <span className="text-body">
              <b className="font-mono text-ink">{items?.length ?? 0}</b>
              <span className="ml-1 text-muted">内容</span>
            </span>
          </div>
        </div>
      </div>

      {/* 右下角快捷发布（移动端） */}
      <Link
        href="/community/status"
        aria-label="发动态"
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-paper shadow-lg md:hidden"
      >
        <IconPlus className="h-6 w-6" />
      </Link>

      {/* 签到 + 积分（放在「全部」标签上方，不再隔在内容中间） */}
      <div className="mt-5 rounded-2xl border border-line/60 bg-surface px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">积分</span>
            <span className="font-serif text-xl font-semibold text-primary">{points}</span>
            <div className="hidden h-1.5 w-32 overflow-hidden rounded-full bg-surface md:block">
              <div className="h-full rounded-full bg-gradient-to-r from-gold to-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="hidden text-[11px] text-muted md:inline">
              {maxed ? "已至最高等级「元老」" : `距下一级「${nextName}」还差 ${remain} 分`}
            </span>
          </div>
          <button
            type="button"
            onClick={doCheckin}
            disabled={checkedIn || checkinBusy}
            className={`rounded-full px-4 py-1.5 font-serif text-xs transition-colors disabled:cursor-default ${
              checkedIn ? "border border-gold/50 bg-surface text-gold" : "bg-primary text-paper hover:bg-primary-deep"
            }`}
          >
            {checkinBusy ? "签到中…" : checkedIn ? "今日已签到 ✓" : "每日签到 ＋5 分"}
          </button>
        </div>
        {checkinMsg && <p className={`mt-1.5 text-xs ${checkinMsg.includes("失败") ? "text-danger" : "text-primary"}`}>{checkinMsg}</p>}
        <div className="mt-2 flex items-center gap-4 border-t border-line-inner/60 pt-2 text-xs text-body md:hidden">
          <Link href="/profile/points" className="transition-colors hover:text-primary">积分明细</Link>
          <Link href="/profile/edit" className="transition-colors hover:text-primary">编辑资料</Link>
          <Link href={`/u?id=${me.id}`} className="transition-colors hover:text-primary">我的主页</Link>
          <button
            type="button"
            onClick={async () => {
              try { await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" }); } catch {}
              router.push("/");
            }}
            className="ml-auto text-muted transition-colors hover:text-danger"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* 内容标签页：贴吧 / 动态（Twitter 式，与用户主页一致） */}
      <div className="mt-4 flex border-b border-line-inner">
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center py-3 font-serif text-[15px] transition-colors ${
                on ? "border-b-2 border-primary font-medium text-primary" : "text-muted hover:text-body"
              }`}
            >
              {t.label}
              <span className="ml-1 font-mono text-xs opacity-60">{countOf(t.key)}</span>
            </button>
          );
        })}
      </div>

      {/* 主内容：feed + 右栏 */}
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* 主列 feed（Twitter 式：无边框，分隔线） */}
        <div className="min-w-0">
          {saveErr && <p className="mb-2 text-xs text-danger">{saveErr}</p>}
          {items === null && <p className="py-10 text-sm text-muted">加载中…</p>}
          {items !== null && visible.length === 0 && (
            <p className="py-12 text-center text-sm text-muted">
              {tab === "all" ? "还没有发布过内容，" : "这一档还没有内容，"}
              <Link href="/community/new" className="text-primary hover:underline">去发起讨论</Link>
            </p>
          )}
          <div className="divide-y divide-line-inner/60">
            {visible.map((p) => (
              <article key={p.id} className="group flex gap-3.5 py-5 transition-colors hover:bg-paper-deep/30 md:px-2">
                <span className="mt-1 shrink-0">
                  {me.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img loading="lazy" src={sitePath(me.avatar)} alt={me.username} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-sm text-primary">
                      {me.username.slice(0, 1)}
                    </span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="font-medium text-ink">{me.username}</span>
                    <span>· {formatTime(p.created_at)}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{typeLabel(p.type)}</span>
                    {p.status === "pending" && <span className="rounded-full bg-warning/15 px-2 py-0.5 text-warning">待审核</span>}
                    {p.status === "removed" && <span className="rounded-full bg-danger/15 px-2 py-0.5 text-danger">已删除</span>}
                    <span className="ml-auto opacity-0 transition-opacity group-hover:opacity-100">
                      {p.status !== "removed" && (
                        <button type="button" onClick={() => deletePost(p)} className="text-danger/70 hover:text-danger">
                          删除
                        </button>
                      )}
                    </span>
                  </div>
                  <Link href={`/community/post/?id=${p.id}`} className="block">
                    {tab !== "dynamic" && p.title && (
                      <h2 className="mt-1.5 font-serif text-[16px] font-semibold leading-snug text-title-gold">
                        {p.title}
                      </h2>
                    )}
                    {p.content && <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-body">{p.content}</p>}
                    {p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-1.5" />}
                  </Link>
                  <div className="mt-2.5 flex items-center gap-5 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <IconHeart className="h-3.5 w-3.5" />
                      {p.like_count}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      <IconEye className="h-3.5 w-3.5" />
                      {p.view_count}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
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

      {/* 个人名片分享卡 */}
      <ProfileShareCard
        data={
          cardOpen && me
            ? {
                username: me.username,
                avatar: me.avatar,
                signature: me.signature,
                level: level,
                levelName: levelName,
                profileUrl: typeof window !== "undefined" ? `${window.location.origin}${sitePath(`/u?id=${me.id}`)}` : sitePath(`/u?id=${me.id}`),
              }
            : null
        }
        onClose={() => setCardOpen(false)}
      />
    </div>
  );
}
