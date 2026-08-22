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
import { IconHeart, IconMessage, IconShare, IconEye, IconFlame } from "@/components/icons";

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
  const [hotPosts, setHotPosts] = useState<PostSummary[]>([]);

  useEffect(() => {
    fetchMe().then(setMe);
    api<{ posts: PostSummary[] }>("/api/posts?sort=hot&per=5")
      .then((r) => setHotPosts(r.posts))
      .catch(() => {});
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
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <Link href="/community" className="text-xs text-muted hover:text-primary">
        ← 返回讨论区
      </Link>

      <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_280px]">
        {/* 主列：原帖 + 回复链（Twitter 风格） */}
        <div className="mx-auto w-full max-w-2xl">
          <article className="border-b border-line-inner/70 pb-6">
            {/* 作者头 */}
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-lg text-primary">
                {post.author.username.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-ink">{post.author.username}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{post.tag}</span>
                </div>
                <div className="text-xs text-muted">
                  {formatTime(post.created_at)}
                  {post.status !== "approved" && (
                    <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">待审核</span>
                  )}
                </div>
              </div>
              {me && (me.id === post.author.id || me.role === "admin") && (
                <button type="button" onClick={deletePost} className="ml-auto text-xs text-red-500/80 hover:text-red-700">
                  删除
                </button>
              )}
            </div>

            {/* 正文 */}
            <h1 className="mt-4 font-serif text-2xl font-semibold leading-snug text-ink md:text-[28px]">
              {post.title}
            </h1>
            {post.quote && <QuoteBlock quote={post.quote} questionId={post.question_id} />}
            <div className="mt-4 text-[15px] leading-relaxed text-body">{renderContent(post.content)}</div>
            {!post.quote && post.question_id && <QuestionSourceBadge questionId={post.question_id} className="mt-3" />}

            {post.images.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
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

            {/* 互动统计（Twitter 风格图标条） */}
            {post.status !== "removed" && (
              <div className="mt-5 flex items-center gap-6 border-t border-line-inner/70 pt-4 text-xs text-muted">
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
                  className={`flex items-center gap-1.5 transition-colors ${liked ? "text-primary" : "hover:text-primary"}`}
                >
                  <IconHeart className="h-4 w-4" />
                  {post.like_count}
                </button>
                <span className="flex items-center gap-1.5">
                  <IconMessage className="h-4 w-4" />
                  {comments.length}
                </span>
                <span className="flex items-center gap-1.5">
                  <IconEye className="h-4 w-4" />
                  {post.view_count}
                </span>
                <button type="button" onClick={sharePost} className="flex items-center gap-1.5 hover:text-primary">
                  <IconShare className="h-4 w-4" />
                  分享
                </button>
              </div>
            )}
            {err && <p className="mt-2 text-xs text-red-700">{err}</p>}
          </article>

          {/* 回复输入（Twitter 风格：白底输入框 + 深红按钮） */}
          <div className="mt-5">
            {me ? (
              <form onSubmit={submitReply} className="space-y-2 rounded-2xl bg-surface p-4 shadow-card">
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
                  className="w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-muted/70 focus:border-gold"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={replyBusy || post.status !== "approved"}
                    className="rounded-full bg-primary px-6 py-2 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
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
          </div>

          {/* 盖楼 */}
          <section className="mt-8">
            <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
              <span className="h-4 w-1 rounded-full bg-primary" />
              盖楼 · {comments.length} 层
            </h2>
            <div className="mt-4">
              <CommentThread
                post={post}
                comments={comments}
                me={me}
                loginNext={`/community/post/?id=${post.id}`}
                onReload={loadDetail}
              />
            </div>
          </section>
        </div>

        {/* 右栏：相关讨论（Twitter 趋势栏风格） */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div className="card-print rounded-2xl bg-surface p-5">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
                <IconFlame className="h-4 w-4 text-gold" />
                相关讨论
              </h3>
              <ol className="mt-3 space-y-2.5">
                {hotPosts.map((p, i) => (
                  <li key={p.id} className="flex gap-2.5 text-sm">
                    <span className="w-4 shrink-0 font-serif text-gold">{i + 1}</span>
                    <Link href={`/community/post/?id=${p.id}`} className="line-clamp-2 text-body transition-colors hover:text-primary">
                      {p.title}
                    </Link>
                  </li>
                ))}
                {hotPosts.length === 0 && <li className="text-xs text-muted">暂无数据</li>}
              </ol>
            </div>

            <div className="card-print card-print--identity rounded-2xl bg-surface p-5">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
                <IconFlame className="h-4 w-4 text-gold" />
                关于作者
              </h3>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-serif text-base text-primary">
                  {post.author.username.slice(0, 1)}
                </span>
                <div>
                  <Link href={`/u?id=${post.author.id}`} className="font-serif text-sm text-ink hover:text-primary">
                    @{post.author.username}
                  </Link>
                  <p className="text-xs text-muted">去看看 TA 的主页</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

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
