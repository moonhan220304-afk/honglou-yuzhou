"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { FeedItem, FollowItem, Me, PointsResp, PostSummary, TestStats } from "@/lib/api";
import { compressAndUpload, formatTime, QuestionSourceBadge } from "@/lib/client-community";
import { archetypes } from "@/lib/test-data";
import { getCharacter } from "@/lib/data";
import { characterImages } from "@/lib/images";
import TestResultShare from "@/components/test-result-share";
import type { TestShareData } from "@/components/test-result-share";
import LevelBadge from "@/components/level-badge";
import UserChip from "@/components/user-chip";
import {
  levelProgressPct,
  nextLevelName,
  remainToNext,
  todayKey,
  typeLabel,
} from "@/lib/levels";

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
  const [signature, setSignature] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
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
      setSignature(m?.signature ?? "");
      if (!m) return;

      /* 我的帖子（含待审/驳回/删除态） */
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

      /* 混合流补 type（tab=mine；若后端尚未实现该 tab，按 author.id 过滤兜底） */
      const typeMap = new Map<number, string>();
      try {
        const r = await api<{ tab: string; items: FeedItem[] }>("/api/feed?tab=mine&per=30");
        for (const it of r.items) {
          if (it.author.id === m.id) typeMap.set(it.id, it.type);
        }
      } catch {
        /* feed 失败不阻塞：type 全部回落为 post */
      }
      setItems(base.map((p) => ({ ...p, type: typeMap.get(p.id) ?? p.type })));

      /* 我的关注 */
      try {
        const f = await api<{ ok: boolean; items: FollowItem[] }>(`/api/follows?user_id=${m.id}`);
        setFollows(f.items);
      } catch {
        setFollows([]);
      }

      /* 今日是否已签到：优先 me.last_checkin，其次积分日志里今天的签到记录 */
      try {
        const r = await api<PointsResp>("/api/points");
        const tk = todayKey();
        const logged = r.logs.some((l) => l.reason === "checkin" && l.ref === tk);
        setCheckedIn(m.last_checkin === tk || logged);
      } catch {
        setCheckedIn(m.last_checkin === todayKey());
      }

      /* 测试结果 */
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

  const onPickAvatar = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setSaveErr("");
    setSaveMsg("");
    setBusy(true);
    try {
      const url = await compressAndUpload(f);
      const r = await api<{ user: Me }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ avatar: url }),
      });
      setMe((m) => (m ? { ...m, avatar: r.user.avatar } : m));
      setSaveMsg("头像已更新");
    } catch (ex) {
      setSaveErr(ex instanceof Error ? ex.message : "头像更新失败");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveErr("");
    setSaveMsg("");
    setBusy(true);
    try {
      const r = await api<{ user: Me }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ signature: signature.trim() }),
      });
      setMe((m) => (m ? { ...m, signature: r.user.signature } : m));
      setSignature(r.user.signature ?? "");
      setSaveMsg("个性签名已保存");
    } catch (ex) {
      setSaveErr(ex instanceof Error ? ex.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

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
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/community" className="text-xs text-muted transition-colors hover:text-primary">
        ← 返回
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">个人中心</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* 左：资料与设置 */}
        <div className="space-y-5">
          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
            <div className="flex items-center gap-4">
              {me.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sitePath(me.avatar)}
                  alt="头像"
                  className="h-16 w-16 rounded-full border-2 border-gold object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-serif text-2xl text-primary">
                  {me.username.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-serif text-lg font-semibold text-ink">{me.username}</p>
                  <LevelBadge level={level} levelName={levelName} />
                </div>
                <p className="text-xs text-muted">
                  {me.role === "admin" ? "管理员" : "社友"} · 注册于 {formatTime(me.created_at)}
                </p>
                {me.signature && (
                  <p className="mt-1 truncate font-serif text-[13px] text-gold">「{me.signature}」</p>
                )}
              </div>
            </div>

            {/* 积分与等级进度 */}
            <div className="mt-5 rounded-2xl bg-paper-deep/60 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted">积分</span>
                <span className="font-serif text-2xl font-semibold text-primary">{points}</span>
              </div>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                {maxed ? "已至最高等级「元老」" : `距下一级「${nextName}」还差 ${remain} 分`}
              </p>
            </div>

            {/* 关注 / 粉丝 */}
            <div className="mt-4 flex items-center justify-between text-sm text-body">
              <span>关注 <b className="font-mono text-primary">{me.following ?? 0}</b></span>
              <span>粉丝 <b className="font-mono text-primary">{me.followers ?? 0}</b></span>
              <Link
                href="/profile/points"
                className="font-serif text-xs text-gold transition-colors hover:text-primary"
              >
                积分明细 →
              </Link>
            </div>

            {/* 签到 */}
            <button
              type="button"
              onClick={doCheckin}
              disabled={checkedIn || checkinBusy}
              className={`mt-4 w-full rounded-full px-4 py-2.5 font-serif text-sm transition-colors disabled:cursor-default ${
                checkedIn
                  ? "border border-gold/50 bg-surface text-gold"
                  : "bg-primary text-paper hover:bg-primary-deep disabled:opacity-60"
              }`}
            >
              {checkinBusy ? "签到中…" : checkedIn ? "今日已签到 ✓" : "每日签到 ＋5 分"}
            </button>
            {checkinMsg && (
              <p className={`mt-2 text-center text-xs ${checkinMsg.includes("失败") ? "text-red-700" : "text-primary"}`}>
                {checkinMsg}
              </p>
            )}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="mt-4 w-full rounded-full border border-gold/60 px-4 py-2 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary disabled:opacity-60"
            >
              {busy ? "处理中…" : me.avatar ? "更换头像" : "上传头像"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickAvatar(e.target.files)}
            />
          </section>

          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
            <h2 className="font-serif text-base font-semibold text-ink">个性签名</h2>
            <form onSubmit={saveSignature} className="mt-3 space-y-3">
              <textarea
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                rows={3}
                maxLength={120}
                placeholder="一句话介绍自己（最多 120 字）"
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
              />
              {saveErr && <p className="text-sm text-red-700">{saveErr}</p>}
              {saveMsg && <p className="text-sm text-green-700">{saveMsg}</p>}
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
              >
                保存签名
              </button>
            </form>
          </section>

          {/* 我的关注 */}
          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
            <h2 className="font-serif text-base font-semibold text-ink">
              我的关注
              {follows && follows.length > 0 && (
                <span className="ml-1.5 font-mono text-xs text-muted">{follows.length}</span>
              )}
            </h2>
            {follows === null && <p className="mt-3 text-sm text-muted">加载中…</p>}
            {follows !== null && follows.length === 0 && (
              <p className="mt-3 rounded-xl bg-paper-deep/60 px-4 py-3 text-xs leading-relaxed text-muted">
                还没有关注任何人。在社区里遇见投缘的同好，点进 TA 的主页关注一下吧。
              </p>
            )}
            {follows !== null && follows.length > 0 && (
              <ul className="mt-3 space-y-2.5">
                {follows.map((f) => (
                  <li key={f.id}>
                    <UserChip
                      id={f.id}
                      username={f.username}
                      avatar={f.avatar}
                      points={f.points}
                      showPoints
                      href={`/u?id=${f.id}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
            <h2 className="font-serif text-base font-semibold text-ink">账号设置</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {me.role === "admin" && (
                <a href={sitePath("/admin")} className="rounded-xl bg-paper-deep px-4 py-2.5 text-body transition-colors hover:bg-line/50 hover:text-primary">
                  管理后台 →
                </a>
              )}
              <Link href="/community/new" className="rounded-xl bg-paper-deep px-4 py-2.5 text-body transition-colors hover:bg-line/50 hover:text-primary">
                发起讨论 →
              </Link>
              <Link href={`/u?id=${me.id}`} className="rounded-xl bg-paper-deep px-4 py-2.5 text-body transition-colors hover:bg-line/50 hover:text-primary">
                我的公开主页 →
              </Link>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" });
                  } catch {}
                  router.push("/");
                }}
                className="rounded-xl bg-paper-deep px-4 py-2.5 text-left text-muted transition-colors hover:bg-line/50 hover:text-red-700"
              >
                退出登录
              </button>
            </div>
          </section>
        </div>

        {/* 右：我的内容 + 测试结果 */}
        <div className="space-y-6">
          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-3 font-serif text-lg font-semibold text-ink">
              <span className="h-4 w-1 rounded-full bg-primary" />
              我的内容
            </h2>

            {/* 三档切换 */}
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`rounded-full px-3.5 py-1.5 font-serif text-xs transition-colors ${
                    tab === t.key
                      ? "bg-primary text-paper"
                      : "bg-paper-deep text-secondary-btn-text hover:bg-line/50 hover:text-primary"
                  }`}
                >
                  {t.label}
                  {items !== null && <span className="ml-1 font-mono opacity-70">{countOf(t.key)}</span>}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {items === null && <p className="text-sm text-muted">加载中…</p>}
              {items !== null && visible.length === 0 && (
                <p className="rounded-2xl bg-paper-deep/60 p-6 text-center text-sm text-muted">
                  {tab === "all"
                    ? "还没有发布过内容，"
                    : "这一档还没有内容，"}
                  <Link href="/community/new" className="text-primary hover:underline">
                    去发起讨论
                  </Link>
                </p>
              )}
              {visible.map((p) => (
                <div key={p.id} className="block rounded-2xl bg-paper-deep/60 p-4 transition-colors hover:bg-line/40">
                  <Link href={`/community/post/?id=${p.id}`} className="block">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                        {typeLabel(p.type)}
                      </span>
                      <span>{formatTime(p.created_at)}</span>
                      {p.status === "pending" && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">待审核</span>
                      )}
                      {p.status === "removed" && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-red-700">已删除</span>
                      )}
                      <span className="ml-auto">赞 {p.like_count} · 阅读 {p.view_count}</span>
                    </div>
                    <p className="mt-1.5 truncate font-serif text-[15px] font-semibold text-ink">
                      {p.title || "（无标题）"}
                    </p>
                    {p.content && (
                      <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-body">
                        {p.content}
                      </p>
                    )}
                    {p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-1" />}
                  </Link>
                  {p.status !== "removed" && (
                    <button
                      type="button"
                      onClick={() => deletePost(p)}
                      className="mt-2 text-xs text-red-500/70 transition-colors hover:text-red-700"
                    >
                      删除这条内容
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-3 font-serif text-lg font-semibold text-ink">
              <span className="h-4 w-1 rounded-full bg-primary" />
              我的测试结果
            </h2>
            {myTest === undefined && <p className="mt-4 text-sm text-muted">加载中…</p>}
            {myTest === null && (
              <div className="mt-4 rounded-2xl bg-paper-deep/60 p-6 text-center">
                <p className="text-sm text-muted">你还没有测过红楼人格测试</p>
                <Link
                  href="/test"
                  className="mt-3 inline-block rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
                >
                  去测试 →
                </Link>
              </div>
            )}
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
                <div className="mt-4 rounded-2xl bg-paper-deep/60 p-5">
                  <div className="flex items-center gap-4">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatar}
                        alt={character?.name ?? ""}
                        className="h-16 w-16 rounded-full border-2 border-gold object-cover"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-serif text-2xl text-primary">
                        {character?.name.charAt(0) ?? "红"}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-serif text-lg font-semibold text-ink">{arch.title}</p>
                      <p className="text-xs text-muted">
                        对应人物：{character?.name}
                        {testStats && (
                          <>
                            {" "}
                            · 站内 <b className="font-mono text-primary">{testStats.total}</b> 人已测，与你相同{" "}
                            <b className="font-mono text-primary">{sameCount}</b> 人
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShareOpen(true)}
                      className="rounded-full bg-primary px-5 py-2 font-serif text-xs text-paper transition-colors hover:bg-primary-deep"
                    >
                      再次分享
                    </button>
                    <Link
                      href="/test"
                      className="rounded-full bg-paper-deep px-5 py-2 font-serif text-xs text-secondary-btn-text transition-colors hover:bg-line/60 hover:text-primary"
                    >
                      重新测试
                    </Link>
                    {character && (
                      <Link
                        href={`/characters/${character.id}`}
                        className="rounded-full bg-paper-deep px-5 py-2 font-serif text-xs text-secondary-btn-text transition-colors hover:bg-line/60 hover:text-primary"
                      >
                        了解{character.name} →
                      </Link>
                    )}
                  </div>
                  <TestResultShare data={shareData} onClose={() => setShareOpen(false)} />
                </div>
              );
            })()}
          </section>
        </div>
      </div>
    </div>
  );
}
