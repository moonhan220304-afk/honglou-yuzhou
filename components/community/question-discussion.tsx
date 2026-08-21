"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { CommentItem, Me, PostQuote, PostSummary } from "@/lib/api";
import { formatTime, renderContent, QuoteBlock } from "@/lib/client-community";
import CommentThread from "@/components/community/comment-thread";
import ShareCardModal from "@/components/community/share-card-modal";
import type { ShareCardData } from "@/components/community/share-card-modal";

interface ExpandedState {
  comments: CommentItem[];
  liked: boolean;
  reply: string;
  replyTo: number | null;
  err: string;
  msg: string;
  busy: boolean;
}

export default function QuestionDiscussion({
  questionId,
  questionTitle,
  quote,
  onClearQuote,
}: {
  questionId: string;
  questionTitle: string;
  quote?: PostQuote | null;
  onClearQuote?: () => void;
}) {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [posts, setPosts] = useState<PostSummary[] | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [open, setOpen] = useState<Record<number, ExpandedState>>({});
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api<{ posts: PostSummary[] }>(
        `/api/posts?question_id=${encodeURIComponent(questionId)}&include_mine=1&sort=hot`,
      );
      setPosts(r.posts);
    } catch {
      setPosts([]);
    }
  }, [questionId]);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    async (p: PostSummary) => {
      if (openId === p.id) {
        setOpenId(null);
        return;
      }
      setOpenId(p.id);
      if (open[p.id]) return;
      try {
        const r = await api<{ post: PostSummary; comments: CommentItem[]; liked: boolean }>(
          `/api/posts/${p.id}`,
        );
        setOpen((prev) => ({
          ...prev,
          [p.id]: { comments: r.comments, liked: r.liked, reply: "", replyTo: null, err: "", msg: "", busy: false },
        }));
      } catch {
        setOpenId(null);
      }
    },
    [openId, open],
  );

  const refreshOpen = useCallback(async (p: PostSummary) => {
    if (!open[p.id]) return;
    try {
      const r = await api<{ post: PostSummary; comments: CommentItem[]; liked: boolean }>(
        `/api/posts/${p.id}`,
      );
      setOpen((prev) => ({
        ...prev,
        [p.id]: { ...prev[p.id], comments: r.comments, liked: r.liked, err: "", msg: "" },
      }));
    } catch {
      /* 忽略刷新失败 */
    }
  }, [open]);

  const like = async (p: PostSummary) => {    if (!me) return (location.href = sitePath(`/login?next=/questions/${questionId}`));
    const st = open[p.id];
    if (!st) return;
    if (p.status !== "approved") {
      setOpen((prev) => ({
        ...prev,
        [p.id]: { ...prev[p.id], msg: "", err: "帖子审核通过后才能点赞" },
      }));
      return;
    }
    try {
      const r = await api<{ liked: boolean }>(`/api/posts/${p.id}/like`, { method: "POST" });
      setOpen((prev) => ({
        ...prev,
        [p.id]: { ...prev[p.id], liked: r.liked, err: "" },
      }));
      setPosts((list) =>
        list ? list.map((x) => (x.id === p.id ? { ...x, like_count: x.like_count + (r.liked ? 1 : -1) } : x)) : list,
      );
    } catch (ex) {
      setOpen((prev) => ({
        ...prev,
        [p.id]: { ...prev[p.id], err: ex instanceof Error ? ex.message : "点赞失败" },
      }));
    }
  };

  const submitReply = async (p: PostSummary) => {
    const st = open[p.id];
    if (!st) return;
    if (!st.reply.trim()) return;
    setOpen((prev) => ({ ...prev, [p.id]: { ...prev[p.id], err: "", msg: "", busy: true } }));
    if (p.status !== "approved") {
      setOpen((prev) => ({ ...prev, [p.id]: { ...prev[p.id], busy: false, err: "帖子审核通过后才能评论" } }));
      return;
    }
    try {
      await api<{ msg?: string }>(`/api/posts/${p.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: st.reply.trim(), reply_to: null }),
      });
      setOpen((prev) => ({
        ...prev,
        [p.id]: { ...prev[p.id], reply: "", busy: false, err: "", msg: "评论已发布" },
      }));
      refreshOpen(p);
    } catch (ex) {
      setOpen((prev) => ({
        ...prev,
        [p.id]: { ...prev[p.id], busy: false, err: ex instanceof Error ? ex.message : "评论失败" },
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!title.trim()) return setErr("请填写标题");
    if (!content.trim()) return setErr("请填写正文");
    setBusy(true);
    try {
      const r = await api<{ msg: string }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          question_id: questionId,
          quote: quote ?? undefined,
        }),
      });
      setTitle("");
      setContent("");
      if (onClearQuote) onClearQuote();
      setMsg(r.msg || "已发布");
      load();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "发布失败");
    } finally {
      setBusy(false);
    }
  };

  const sharePost = (p: PostSummary) => {
    if (p.quote) {
      setShareData({
        mode: "viewpoint",
        questionTitle: p.quote.question_title || questionTitle,
        quoteTitle: p.quote.viewpoint_title || p.title,
        quoteSource: p.quote.source || "",
        quoteBody: p.quote.summary || "",
        noteLabel: "我的理解",
        note: p.content,
        noteAuthor: `${p.author.username} · ${formatTime(p.created_at)}`,
        downloadName: `honglou-post-${p.id}.png`,
      });
    } else {
      setShareData({
        mode: "discussion",
        questionTitle,
        quoteTitle: p.title,
        quoteSource: `@${p.author.username} · 社区讨论`,
        quoteBody: p.content.slice(0, 90) + (p.content.length > 90 ? "…" : ""),
        noteLabel: "我的帖子",
        note: p.content,
        noteAuthor: `${p.author.username} · ${formatTime(p.created_at)}`,
        downloadName: `honglou-post-${p.id}.png`,
      });
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold";

  return (
    <section className="mt-10 rounded-3xl border border-gold/50 bg-surface-warm p-6 md:p-8">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          你怎么看 · 讨论区
        </h2>
        <Link href="/community" className="text-xs text-primary hover:underline">
          去社区讨论 →
        </Link>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        众说纷纭，皆是一家之言。在这里发表你的观点、引用原文、与其他读者辩驳（自动审核，命中敏感词转人工复核）。
      </p>

      {me === null ? (
        <div className="mt-5 rounded-2xl bg-surface p-6 text-center">
          <p className="text-sm text-muted">登录后即可发表观点</p>
          <Link
            href={`/login?next=/questions/${questionId}`}
            className="mt-3 inline-block rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper"
          >
            去登录
          </Link>
        </div>
      ) : me ? (
        <form onSubmit={submit} className="mt-5 space-y-3 rounded-2xl bg-surface p-5 shadow-card">
          {quote?.viewpoint_title && (
            <div className="rounded-r-xl border-l-2 border-gold/70 bg-paper-deep/55 px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-sm font-semibold text-ink">{quote.viewpoint_title}</p>
                  {quote.source && <p className="mt-0.5 text-xs text-muted">{quote.source}</p>}
                  {quote.summary && (
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-body">{quote.summary}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClearQuote}
                  className="shrink-0 text-xs text-muted transition-colors hover:text-primary"
                >
                  ✕ 移除引用
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted/80">
                正在引用该观点，请在下方写下你的理解
              </p>
            </div>
          )}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder={`以「${me.username}」身份发表观点 · 一句话标题（最多 80 字）`}
            className={`${inputCls} font-serif text-base`}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            maxLength={20000}
            placeholder={
              quote?.viewpoint_title
                ? "写下你对上述观点的理解与回应…（支持 **加粗** 与多段落，最多 20000 字）"
                : "你的观点、证据、引文…（支持 **加粗** 与多段落，最多 20000 字）"
            }
            className={`${inputCls} leading-relaxed`}
          />
          {err && <p className="text-sm text-red-700">{err}</p>}
          {msg && <p className="text-sm text-green-700">{msg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-primary px-6 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {busy ? "提交中…" : "发表观点"}
          </button>
        </form>
      ) : null}

      <div className="mt-6 space-y-3">
        {posts === null && <p className="rounded-2xl bg-surface p-5 text-center text-sm text-muted">加载讨论中…</p>}
        {posts !== null && posts.length === 0 && (
          <p className="rounded-2xl bg-surface p-5 text-center text-sm text-muted">
            还没有讨论，来发表第一个观点。
          </p>
        )}
        {posts?.map((p) => {
          const st = open[p.id];
          const isOpen = openId === p.id;
          return (
            <div key={p.id} className="rounded-2xl bg-surface p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{p.tag}</span>
                <span>{p.author.username}</span>
                <span>·</span>
                <span>{formatTime(p.created_at)}</span>
                {p.status !== "approved" && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">待审核</span>
                )}
              </div>
              <h3
                className="mt-2 cursor-pointer font-serif text-[15px] font-semibold text-ink hover:text-primary"
                onClick={() => toggle(p)}
              >
                {p.title}
              </h3>
              {p.quote && <QuoteBlock quote={p.quote} compact questionId={p.question_id} />}
              {isOpen && (
                <div className="mt-2 text-[14px] text-body">{renderContent(p.content)}</div>
              )}
              <div className="mt-3 flex items-center gap-4 border-t border-line/60 pt-3 text-xs text-muted">
                <button
                  type="button"
                  onClick={() => {
                    if (!me) return (location.href = sitePath(`/login?next=/questions/${questionId}`));
                    if (!isOpen) toggle(p);
                    setTimeout(() => {
                      document
                        .getElementById(`comment-box-${p.id}`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                      (
                        document.getElementById(`comment-input-${p.id}`) as HTMLTextAreaElement | null
                      )?.focus();
                    }, 250);
                  }}
                  className="transition-colors hover:text-primary"
                >
                  评论
                </button>
                <button
                  type="button"
                  onClick={() => toggle(p)}
                  className="transition-colors hover:text-primary"
                >
                  盖楼 {st?.comments.length ?? 0} 层{isOpen ? " · 收起" : ""}
                </button>
                <span className={st?.liked ? "text-primary" : ""}>赞 {p.like_count}</span>
                <button type="button" onClick={() => sharePost(p)} className="transition-colors hover:text-primary">
                  分享
                </button>
                <Link
                  href={`/community/post/?id=${p.id}`}
                  className="transition-colors hover:text-primary"
                >
                  完整帖 →
                </Link>
              </div>

              {isOpen && st && (
                <div className="mt-4">
                  {me ? (
                    <div id={`comment-box-${p.id}`} className="space-y-2 rounded-xl bg-paper-deep/40 p-4">
                      <textarea
                        id={`comment-input-${p.id}`}
                        value={st.reply}
                        onChange={(e) =>
                          setOpen((prev) => ({
                            ...prev,
                            [p.id]: { ...prev[p.id], reply: e.target.value },
                          }))
                        }
                        rows={2}
                        maxLength={2000}
                        disabled={p.status !== "approved"}
                        placeholder={
                          p.status === "approved"
                            ? `评论「${p.title}」（最多 2000 字，自动审核）…`
                            : "帖子审核通过后才能评论"
                        }
                        className={`${inputCls} leading-relaxed`}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={st.busy || p.status !== "approved"}
                          onClick={() => submitReply(p)}
                          className="rounded-full bg-primary px-5 py-2 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
                        >
                          {st.busy ? "提交中…" : "发表评论"}
                        </button>
                        {st.err && <span className="text-xs text-red-700">{st.err}</span>}
                        {st.msg && <span className="text-xs text-green-700">{st.msg}</span>}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/login?next=/questions/${questionId}`}
                      className="inline-block rounded-full bg-paper-deep px-5 py-2 text-xs text-muted hover:text-primary"
                    >
                      登录后评论
                    </Link>
                  )}
                  <CommentThread
                    post={p}
                    comments={st.comments}
                    me={me ?? null}
                    loginNext={`/questions/${questionId}`}
                    onReload={() => refreshOpen(p)}
                  />
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => like(p)}
                      className={`text-xs transition-colors ${st.liked ? "text-primary" : "hover:text-primary"}`}
                    >
                      {st.liked ? "♥ 已赞" : "♡ 赞"} {p.like_count}
                    </button>
                    {st.err && <span className="text-xs text-red-700">{st.err}</span>}
                    {st.msg && <span className="text-xs text-green-700">{st.msg}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ShareCardModal data={shareData} onClose={() => setShareData(null)} />
    </section>
  );
}
