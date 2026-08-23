"use client";
import { IconHeart } from "@/components/icons";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CommentItem, Me } from "@/lib/api";
import { formatTime } from "@/lib/client-community";
import { buildCommentTree, cleanReview, type AiReview, type CommentNode, type PostDetailData } from "@/lib/poem-society";

/** 评论区（就地展开版）：金色 AI 诗评框置顶 + 评论按赞排序的楼中楼 + 底部输入框与 @AI 评诗。
 *  数据由父组件缓存（POST /api/posts/:id），提交/评诗后通过 onRefresh 回源刷新。 */
export default function ExpandableComments({
  postId,
  data,
  me,
  loginNext,
  onRefresh,
}: {
  postId: number;
  data: PostDetailData;
  me: Me | null;
  loginNext: string;
  onRefresh: (postId: number) => void;
}) {
  const [input, setInput] = useState("");
  const [submitBusy, setSubmitBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [openReply, setOpenReply] = useState<number | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<number, string>>({});
  const [commentLikes, setCommentLikes] = useState<Record<number, { count: number; liked: boolean }>>({});

  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`;
  const tree = buildCommentTree(data.comments);

  const showNotice = (ok: boolean, text: string) => {
    setNotice({ ok, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const postComment = async (content: string, replyTo: number | null) => {
    setNotice(null);
    if (!me) {
      showNotice(false, "请先登录后再评论");
      return;
    }
    if (!content.trim()) return;
    setSubmitBusy(true);
    try {
      await api<{ msg?: string }>(`/api/posts/${postId}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: content.trim(), reply_to: replyTo }),
      });
      setInput("");
      setOpenReply(null);
      if (replyTo) setReplyDraft((d) => ({ ...d, [replyTo]: "" }));
      showNotice(true, "评论已发布");
      onRefresh(postId);
    } catch (ex) {
      showNotice(false, ex instanceof Error ? ex.message : "评论失败");
    } finally {
      setSubmitBusy(false);
    }
  };

  const likeComment = async (c: CommentItem) => {
    if (!me) {
      showNotice(false, "请先登录后再点赞");
      return;
    }
    try {
      const r = await api<{ liked: boolean; count: number }>(
        `/api/posts/${postId}/comments/${c.id}/like`,
        { method: "POST" },
      );
      setCommentLikes((prev) => ({ ...prev, [c.id]: { count: r.count, liked: r.liked } }));
    } catch (ex) {
      showNotice(false, ex instanceof Error ? ex.message : "点赞失败");
    }
  };

  const triggerReview = async () => {
    setNotice(null);
    if (!me) {
      showNotice(false, "请先登录后再 @诗评");
      return;
    }
    setReviewBusy(true);
    try {
      await api<{ ok: boolean; review: AiReview }>("/api/ai/review", {
        method: "POST",
        body: JSON.stringify({ post_id: postId }),
      });
      showNotice(true, "诗评已生成");
      onRefresh(postId);
    } catch (ex) {
      showNotice(false, ex instanceof Error ? ex.message : "@诗评失败");
    } finally {
      setReviewBusy(false);
    }
  };

  const renderNode = (node: CommentNode, depth: number) => {
    const lk = commentLikes[node.id];
    const shown: CommentItem = lk ? { ...node, liked: lk.liked, like_count: lk.count } : node;
    return (
      <div key={node.id}>
        <div
          className={
            depth === 0
              ? "rounded-xl bg-paper-deep/50 p-3.5"
              : "mt-2 rounded-lg bg-paper-deep/30 px-3 py-2"
          }
        >
          <div className="flex items-baseline gap-2 text-xs text-muted">
            <span
              className={`font-medium text-ink ${depth > 0 ? "text-xs" : "font-serif text-sm"}`}
            >
              {node.author.username}
            </span>
            {depth > 0 && node.reply_to && (
              <span className="text-[11px] text-muted/70">回复</span>
            )}
            <span>{formatTime(node.created_at)}</span>
          </div>
          <p
            className={`mt-1 leading-relaxed text-body ${
              depth > 0 ? "text-xs" : "text-sm"
            }`}
          >
            {node.content}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
            <button
              type="button"
              onClick={() => likeComment(shown)}
              className={`transition-colors ${shown.liked ? "text-primary" : "hover:text-primary"}`}
            >
              {shown.liked ? <><IconHeart className="h-3.5 w-3.5 fill-primary text-primary" /> 已赞</> : <><IconHeart className="h-3.5 w-3.5" /> 赞</>} {shown.like_count > 0 ? shown.like_count : ""}
            </button>
            <button
              type="button"
              onClick={() => setOpenReply(openReply === node.id ? null : node.id)}
              className="transition-colors hover:text-primary"
            >
              回复
            </button>
          </div>
          {openReply === node.id && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyDraft[node.id] || ""}
                onChange={(e) => setReplyDraft((d) => ({ ...d, [node.id]: e.target.value }))}
                maxLength={2000}
                placeholder={`回复 ${node.author.username}…`}
                className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-gold"
              />
              <button
                type="button"
                disabled={submitBusy}
                onClick={() => postComment(replyDraft[node.id] || "", node.id)}
                className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
              >
                {submitBusy ? "…" : "回复"}
              </button>
            </div>
          )}
        </div>
        {node.children.length > 0 && (
          <div className="ml-3 space-y-2 border-l border-line/60 pl-3">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-3 rounded-xl border border-line-inner bg-surface-warm/60 px-4 py-4 md:ml-6">
      {/* AI 诗评：金色高亮框 */}
      {data.reviews.length > 0 && (
        <div className="mb-3 rounded-xl border border-gold/60 bg-gold/10 px-4 py-3">
          <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gold">
            <span>诗评 · AI 诗评</span>
            <span className="font-normal text-muted">
              {data.reviews[0].trigger_name
                ? `由 ${data.reviews[0].trigger_name} 触发`
                : "AI 为你评诗"}
            </span>
          </p>
          <p className="mt-1.5 whitespace-pre-line font-serif text-sm leading-relaxed text-body">
            {cleanReview(data.reviews[0].content)}
          </p>
        </div>
      )}

      {/* 评论列表（按赞排序，楼中楼） */}
      {tree.length === 0 ? (
        <p className="rounded-xl bg-paper-deep/50 px-4 py-3 text-center text-xs text-muted">
          还没有评论，来坐第一楼
        </p>
      ) : (
        <div className="space-y-2">
          {tree.map((c) => renderNode(c, 0))}
        </div>
      )}

      {/* 底部：评论输入 + @AI 评诗 */}
      <div className="mt-3 border-t border-line/50 pt-3">
        {notice && (
          <p className={`mb-2 text-xs ${notice.ok ? "text-success" : "text-danger"}`}>
            {notice.text}
          </p>
        )}
        {me ? (
          <>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="写下你的评论…"
              className="w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-muted/70 focus:border-gold"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={submitBusy}
                onClick={() => postComment(input, null)}
                className="rounded-full bg-primary px-4 py-1.5 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
              >
                {submitBusy ? "提交中…" : "发表评论"}
              </button>
              <button
                type="button"
                disabled={reviewBusy}
                onClick={triggerReview}
                className="rounded-full border border-gold/60 bg-gold/10 px-4 py-1.5 font-serif text-xs text-[#8a6a45] transition-colors hover:bg-gold/20 disabled:opacity-60"
              >
                {reviewBusy ? "评诗中…" : "@AI 评诗"}
              </button>
              <span className="text-[11px] text-muted/70">每日 3 次额度</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted">
            请
            <Link href={loginHref} className="mx-1 text-primary underline decoration-dotted underline-offset-2">
              先登录
            </Link>
            后再评论或 @诗评
          </p>
        )}
      </div>
    </div>
  );
}
