"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me, PostSummary, TestStats } from "@/lib/api";
import { compressAndUpload, formatTime, QuestionSourceBadge } from "@/lib/client-community";
import { archetypes } from "@/lib/test-data";
import { getCharacter } from "@/lib/data";
import { characterImages } from "@/lib/images";
import TestResultShare from "@/components/test-result-share";
import type { TestShareData } from "@/components/test-result-share";

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [signature, setSignature] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [myTest, setMyTest] = useState<{ archetypeId: string; characterId: string } | null | undefined>(undefined);
  const [testStats, setTestStats] = useState<TestStats | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await fetchMe();
      setMe(m);
      setSignature(m?.signature ?? "");
      if (!m) return;
      try {
        const r = await api<{ posts: PostSummary[] }>("/api/posts?mine=1");
        setPosts(r.posts);
      } catch {
        setPosts([]);
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

  const deletePost = async (p: PostSummary) => {
    if (!confirm(`确定删除《${p.title}》吗？删除后不可恢复。`)) return;
    try {
      await api(`/api/posts/${p.id}`, { method: "DELETE" });
      setPosts((list) => (list ? list.filter((x) => x.id !== p.id) : list));
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
                <p className="truncate font-serif text-lg font-semibold text-ink">{me.username}</p>
                <p className="text-xs text-muted">
                  {me.role === "admin" ? "管理员" : "社友"} · 注册于 {formatTime(me.created_at)}
                </p>
                {me.signature && (
                  <p className="mt-1 truncate font-serif text-[13px] text-gold">「{me.signature}」</p>
                )}
              </div>
            </div>
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
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" });
                  } catch {}
                  window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/`;
                }}
                className="rounded-xl bg-paper-deep px-4 py-2.5 text-left text-muted transition-colors hover:bg-line/50 hover:text-red-700"
              >
                退出登录
              </button>
            </div>
          </section>
        </div>

        {/* 右：我的测试结果 + 我的帖子 */}
        <div className="space-y-6">
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

          <section className="rounded-3xl border border-line/60 bg-surface p-6 shadow-card">
          <h2 className="flex items-center gap-3 font-serif text-lg font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            我的帖子
          </h2>
          <div className="mt-4 space-y-3">
            {posts === null && <p className="text-sm text-muted">加载中…</p>}
            {posts !== null && posts.length === 0 && (
              <p className="rounded-2xl bg-paper-deep/60 p-6 text-center text-sm text-muted">
                还没有发过帖，<Link href="/community/new" className="text-primary hover:underline">去发起讨论</Link>
              </p>
            )}
            {posts?.map((p) => (
              <div key={p.id} className="block rounded-2xl bg-paper-deep/60 p-4 transition-colors hover:bg-line/40">
                <Link href={`/community/post/?id=${p.id}`} className="block">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{p.tag}</span>
                    <span>{formatTime(p.created_at)}</span>
                    {p.status === "pending" && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">待审核</span>
                    )}
                    {p.status === "removed" && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-red-700">已删除</span>
                    )}
                    <span className="ml-auto">赞 {p.like_count} · 阅读 {p.view_count}</span>
                  </div>
                  <p className="mt-1.5 truncate font-serif text-[15px] font-semibold text-ink">{p.title}</p>
                  {p.question_id && <QuestionSourceBadge questionId={p.question_id} className="mt-1" />}
                </Link>
                {p.status !== "removed" && (
                  <button
                    type="button"
                    onClick={() => deletePost(p)}
                    className="mt-2 text-xs text-red-500/70 transition-colors hover:text-red-700"
                  >
                    删除这个帖子
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
        </div>
      </div>
    </div>
  );
}
