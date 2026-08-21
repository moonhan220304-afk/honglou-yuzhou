"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { CommentItem, Me, PostSummary } from "@/lib/api";
import { formatTime, renderContent, QuoteBlock, QuestionSourceBadge } from "@/lib/client-community";
import CommentThread from "@/components/community/comment-thread";
import ShareCardModal from "@/components/community/share-card-modal";
import type { ShareCardData } from "@/components/community/share-card-modal";

export default function PostDetail() {
  const router = useRouter();
  const search = useSearchParams();
  const id = Number(search.get("id")) || 0;
  const [me, setMe] = useState<Me | null>(null);
  const [post, setPost] = useState<PostSummary | null | undefined>(undefined);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [liked, setLiked] = useState(false);
  const [reply, setReply] = useState("");
  const [replyErr, setReplyErr] = useState("");
  const [replyMsg, setReplyMsg] = useState("");
  const [replyBusy, setReplyBusy] = useState(false);
  const [err, setErr] = useState("");
  const [zoomImg, setZoomImg] = useState<string | null>(null);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try {
      const r = await api<{ post: PostSummary; comments: CommentItem[]; liked: boolean }>(
        `/api/posts/${id}`,
      );
      setPost(r.post);
      setComments(r.comments);
      setLiked(r.liked);
    } catch {
      setPost(null);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      await loadDetail();
    })();
  }, [loadDetail]);

  if (post === undefined) return <div className="min-h-[50vh]" />;
  if (post === null) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">帖子不存在或尚未过审</p>
        <Link href="/community" className="mt-4 inline-block text-sm text-primary">
          ← 返回讨论区
        </Link>
      </div>
    );
  }

  const deletePost = async () => {
    if (!post || !confirm("确定删除这个帖子吗？删除后不可恢复。")) return;
    try {
      await api(`/api/posts/${post.id}`, { method: "DELETE" });
      router.push("/community");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "删除失败");
      setTimeout(() => setErr(""), 3000);
    }
  };

  const submitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;
    setReplyErr("");
    setReplyMsg("");
    if (!reply.trim()) return;
    if (post.status !== "approved") {
      setReplyErr("帖子审核通过后才能评论");
      return;
    }
    setReplyBusy(true);
    try {
      await api<{ msg?: string }>(`/api/posts/${post.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: reply.trim(), reply_to: null }),
      });
      setReply("");
      setReplyMsg("评论已发布");
      await loadDetail();
    } catch (ex) {
      setReplyErr(ex instanceof Error ? ex.message : "评论失败");
    } finally {
      setReplyBusy(false);
    }
  };

  const sharePost = () => {
    if (post.quote) {
      setShareData({
        mode: "viewpoint",
        questionTitle: post.quote.question_title || "社区讨论",
        quoteTitle: post.quote.viewpoint_title || post.title,
        quoteSource: post.quote.source || "",
        quoteBody: post.quote.summary || "",
        noteLabel: "我的理解",
        note: post.content,
        noteAuthor: `${post.author.username} · ${formatTime(post.created_at)}`,
        downloadName: `honglou-post-${post.id}.png`,
      });
    } else {
      setShareData({
        mode: "discussion",
        questionTitle: "社区讨论",
        quoteTitle: post.title,
        quoteSource: `@${post.author.username}`,
        quoteBody: post.content.slice(0, 90) + (post.content.length > 90 ? "…" : ""),
        noteLabel: "我的帖子",
        note: post.content,
        noteAuthor: `${post.author.username} · ${formatTime(post.created_at)}`,
        downloadName: `honglou-post-${post.id}.png`,
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <Link href="/community" className="text-xs text-muted hover:text-primary">
        ← 返回讨论区
      </Link>

      <article className="mt-4 rounded-3xl bg-surface p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">{post.tag}</span>
          <span>{post.author.username}</span>
          <span>·</span>
          <span>{formatTime(post.created_at)}</span>
          {post.status !== "approved" && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700">待审核</span>
          )}
        </div>
        <h1 className="mt-3 font-serif text-2xl font-semibold leading-snug text-ink md:text-3xl">
          {post.title}
        </h1>
        {post.quote && <QuoteBlock quote={post.quote} questionId={post.question_id} />}
        <div className="mt-5 text-[15px] text-body">{renderContent(post.content)}</div>
        {!post.quote && post.question_id && <QuestionSourceBadge questionId={post.question_id} className="mt-4" />}

        {post.images.length > 0 && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {post.images.map((u, i) => (
              <button
                key={u}
                type="button"
                onClick={() => setZoomImg(u)}
                className="overflow-hidden rounded-2xl border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sitePath(u)} alt={`配图${i + 1}`} className="h-56 w-full object-cover transition-transform hover:scale-105" />
              </button>
            ))}
          </div>
        )}

          {post.status === "removed" && (
            <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
              该帖子已被删除
            </p>
          )}
          {post.status !== "removed" && (
            <div className="mt-6 flex items-center gap-5 border-t border-line/60 pt-5 text-xs text-muted">
              <button
                type="button"
                onClick={async () => {
                  if (!me) return (location.href = sitePath("/login?next=/community/post/?id=" + post.id));
                  if (post.status !== "approved") {
                    setErr("帖子审核通过后才能点赞");
                    setTimeout(() => setErr(""), 3000);
                    return;
                  }
                  try {
                    const r = await api<{ liked: boolean }>(`/api/posts/${post.id}/like`, { method: "POST" });
                    setLiked(r.liked);
                    setPost((p) => (p ? { ...p, like_count: p.like_count + (r.liked ? 1 : -1) } : p));
                  } catch (ex) {
                    setErr(ex instanceof Error ? ex.message : "点赞失败");
                    setTimeout(() => setErr(""), 3000);
                  }
                }}
                className={`transition-colors ${liked ? "text-primary" : "hover:text-primary"}`}
              >
                {liked ? "♥ 已赞" : "♡ 赞"} {post.like_count}
              </button>
              <span>阅读 {post.view_count}</span>
              <span>盖楼 {comments.length} 层</span>
              <button type="button" onClick={sharePost} className="hover:text-primary">
                分享卡片
              </button>
              {me && (me.id === post.author.id || me.role === "admin") && (
                <button
                  type="button"
                  onClick={deletePost}
                  className="ml-auto text-red-500/80 transition-colors hover:text-red-700"
                >
                  删除帖子
                </button>
              )}
            </div>
          )}
          {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
      </article>

      {/* 盖楼（对话式：可在留言下直接回复/点赞/分享） */}
      <section className="mt-10">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          盖楼 · {comments.length} 层
        </h2>

        <div className="mt-5">
          {me ? (
            <form onSubmit={submitReply} className="space-y-2 rounded-2xl bg-paper-deep/40 p-4">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={2}
                maxLength={2000}
                disabled={post.status !== "approved"}
                placeholder={
                  post.status === "approved"
                    ? `评论「${post.title}」（最多 2000 字，自动审核）…`
                    : "帖子审核通过后才能评论"
                }
                className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-muted/70 focus:border-gold"
              />
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={replyBusy || post.status !== "approved"}
                  className="rounded-full bg-primary px-5 py-2 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
                >
                  {replyBusy ? "提交中…" : "发表评论"}
                </button>
                {replyErr && <span className="text-xs text-red-700">{replyErr}</span>}
                {replyMsg && <span className="text-xs text-green-700">{replyMsg}</span>}
              </div>
            </form>
          ) : (
            <Link
              href={`/login?next=${encodeURIComponent(`/community/post/?id=${post.id}`)}`}
              className="inline-block rounded-full bg-paper-deep px-5 py-2 text-xs text-muted hover:text-primary"
            >
              登录后评论
            </Link>
          )}
          <CommentThread
            post={post}
            comments={comments}
            me={me}
            loginNext={`/community/post/?id=${post.id}`}
            onReload={loadDetail}
          />
        </div>
      </section>

      {/* 配图放大 */}
      {zoomImg && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-6"
          onClick={() => setZoomImg(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sitePath(zoomImg)} alt="配图" style={{ maxWidth: "90vw", maxHeight: "90vh" }} className="rounded-xl" />
        </div>
      )}

      <ShareCardModal data={shareData} onClose={() => setShareData(null)} />
    </div>
  );
}
