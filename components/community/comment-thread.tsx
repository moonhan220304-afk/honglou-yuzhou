"use client";
import { IconHeart } from "@/components/icons";

import { useState } from "react";
import Link from "next/link";
import { api, sitePath } from "@/lib/api";
import type { CommentItem, Me, PostSummary } from "@/lib/api";
import { formatTime } from "@/lib/client-community";
import ShareCardModal from "@/components/community/share-card-modal";
import type { ShareCardData } from "@/components/community/share-card-modal";

function excerpt(s: string, n = 60): string {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n)}…` : t;
}

function buildTree(comments: CommentItem[]): CommentItem[] {
  const byId = new Map<number, CommentItem & { children: CommentItem[] }>();
  for (const c of comments) byId.set(c.id, { ...c, children: [] });
  const roots: CommentItem[] = [];
  for (const c of comments) {
    const node = byId.get(c.id)!;
    if (c.reply_to && byId.has(c.reply_to)) byId.get(c.reply_to)!.children.push(node);
    else roots.push(node);
  }
  return roots as CommentItem[];
}

/** 对话式评论线程：在留言下直接嵌套回复（非盖楼），支持点赞/分享/删除 */
export default function CommentThread({
  post,
  comments,
  me,
  onReload,
  loginNext,
}: {
  post: PostSummary;
  comments: CommentItem[];
  me: Me | null;
  onReload?: () => void;
  loginNext: string;
}) {
  const [openReply, setOpenReply] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [shareData, setShareData] = useState<ShareCardData | null>(null);
  const [likes, setLikes] = useState<Record<number, { count: number; liked: boolean }>>({});

  const roots = buildTree(comments);
  /* 未登录时的登录页地址（登录后回跳 loginNext） */
  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`;

  const likeComment = async (c: CommentItem) => {
    if (!me) {
      window.location.assign(sitePath(loginHref));
      return;
    }
    try {
      const r = await api<{ liked: boolean; count: number }>(
        `/api/posts/${post.id}/comments/${c.id}/like`,
        { method: "POST" },
      );
      setLikes((prev) => ({ ...prev, [c.id]: { count: r.count, liked: r.liked } }));
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "点赞失败");
    }
  };

  const submitReply = async (c: CommentItem) => {
    const text = (drafts[c.id] || "").trim();
    if (!text) return;
    if (post.status !== "approved") {
      alert("帖子审核通过后才能回复");
      return;
    }
      setBusyId(c.id);
    try {
      await api<{ msg?: string }>(`/api/posts/${post.id}/comment`, {
        method: "POST",
        body: JSON.stringify({ content: text, reply_to: c.id }),
      });
      setDrafts((d) => ({ ...d, [c.id]: "" }));
      setOpenReply(null);
      if (onReload) onReload();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "评论失败");
    } finally {
      setBusyId(null);
    }
  };

  const deleteComment = async (c: CommentItem) => {
    if (!confirm("确定删除这条评论吗？删除后不可恢复。")) return;
    try {
      await api(`/api/posts/${post.id}/comments/${c.id}`, { method: "DELETE" });
      if (onReload) onReload();
    } catch (ex) {
      alert(ex instanceof Error ? ex.message : "删除失败");
    }
  };

  const shareComment = (c: CommentItem) => {
    setShareData({
      mode: "discussion",
      questionTitle: post.quote?.question_title || "社区讨论",
      quoteTitle: post.title,
      quoteSource: `@${post.author.username} · 盖楼 ${comments.length} 层`,
      quoteBody: excerpt(post.content, 90),
      noteLabel: "我的评论",
      note: c.content,
      noteAuthor: `${c.author.username} · ${formatTime(c.created_at)}`,
      downloadName: `honglou-comment-${c.id}.png`,
    });
  };

  const renderNode = (c: CommentItem & { children?: CommentItem[] }) => {
    const lk = likes[c.id];
    const shown: CommentItem = lk ? { ...c, liked: lk.liked, like_count: lk.count } : c;
    return (
      <div key={c.id} className="rounded-xl bg-paper-deep/50 p-4">
        <div className="flex items-baseline gap-2 text-xs text-muted">
          <span className="font-serif text-sm font-semibold text-ink">{c.author.username}</span>
          <span>{formatTime(c.created_at)}</span>
          <span className="ml-auto text-muted/60">{c.floor} 楼</span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-body">{c.content}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
          <button
            type="button"
            onClick={() => likeComment(shown)}
            className={`transition-colors ${shown.liked ? "text-primary" : "hover:text-primary"}`}
          >
            {shown.liked ? <><IconHeart className="h-3.5 w-3.5 fill-primary text-primary" /> 已赞</> : <><IconHeart className="h-3.5 w-3.5" /> 赞</>} {shown.like_count > 0 ? shown.like_count : ""}
          </button>
        <button
          type="button"
          onClick={() => setOpenReply(openReply === c.id ? null : c.id)}
          className="transition-colors hover:text-primary"
        >
          回复
        </button>
        <button
          type="button"
          onClick={() => shareComment(c)}
          className="transition-colors hover:text-primary"
        >
          分享
        </button>
        {me && (me.id === c.author.id || me.role === "admin") && (
          <button
            type="button"
            onClick={() => deleteComment(c)}
            className="text-red-500/70 transition-colors hover:text-danger"
          >
            删除
          </button>
        )}
      </div>

      {openReply === c.id && (
        <div className="mt-2.5 flex gap-2">
          <textarea
            value={drafts[c.id] || ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
            rows={2}
            maxLength={2000}
            placeholder={`回复 ${c.author.username}（最多 2000 字，自动审核）…`}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink outline-none placeholder:text-muted/70 focus:border-gold"
          />
          <div className="flex flex-col justify-center gap-1.5">
            <button
              type="button"
              disabled={busyId === c.id}
              onClick={() => submitReply(c)}
              className="rounded-full bg-primary px-4 py-1.5 font-serif text-xs text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
            >
              {busyId === c.id ? "提交中…" : "回复"}
            </button>
            <button
              type="button"
              onClick={() => setOpenReply(null)}
              className="text-center text-[11px] text-muted hover:text-primary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {c.children && c.children.length > 0 && (
        <div className="mt-3 space-y-3 border-l border-line/70 pl-3">
          {c.children.map((child) => renderNode(child))}
        </div>
      )}
      </div>
    );
  };

  return (
    <>
      <div className="mt-4 space-y-3 border-t border-line/60 pt-4">
        {roots.length === 0 && (
          <p className="rounded-xl bg-paper-deep/50 p-4 text-center text-sm text-muted">
            还没有回复，来坐第一楼。
          </p>
        )}
        {roots.map((c) => renderNode(c))}
      </div>
      <ShareCardModal data={shareData} onClose={() => setShareData(null)} />
      {me === null && (
        <Link
          href={loginHref}
          className="mt-3 inline-block rounded-full bg-paper-deep px-5 py-2 text-xs text-muted hover:text-primary"
        >
          登录后回复
        </Link>
      )}
    </>
  );
}
