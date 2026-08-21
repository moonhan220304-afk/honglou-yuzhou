"use client";

import { useEffect, useState } from "react";
import type { CommentItem } from "@/lib/api";
import type { AiReview } from "@/lib/poem-society";
import { formatTime } from "@/lib/client-community";

export interface PoemShareData {
  title: string;
  content: string;
  author: string;
  likeCount: number;
  topicTitle: string;
  comments: CommentItem[];
  reviews: AiReview[];
}

/** 分享页（modal）：诗作 + 其评论/AI 诗评，提供复制链接；不需要真实生成图片 */
export default function PoemShareModal({
  data,
  onClose,
}: {
  data: PoemShareData | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [data, onClose]);

  if (!data) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("复制链接", location.href);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="分享诗作"
    >
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface-warm p-6 shadow-2xl md:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.3em] text-gold">SHARE · 分享诗作</p>
            <p className="mt-1 text-xs text-muted">{data.topicTitle || "海棠诗社"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-paper-deep px-3 py-1 text-xs text-muted transition-colors hover:text-primary"
          >
            关闭
          </button>
        </div>

        {/* 诗作主体 */}
        <div className="mt-5 rounded-2xl border border-line bg-surface p-5">
          {data.title && (
            <h3 className="font-serif text-lg font-semibold text-ink">{data.title}</h3>
          )}
          <div className="mt-3 border-l-2 border-gold/60 pl-4">
            <p className="whitespace-pre-line font-serif text-[15px] leading-loose text-ink/90">
              {data.content}
            </p>
          </div>
          <p className="mt-4 flex items-center gap-3 text-xs text-muted">
            <span className="font-serif text-sm font-medium text-ink">{data.author}</span>
            <span>·</span>
            <span>♥ {data.likeCount}</span>
          </p>
        </div>

        {/* AI 诗评 */}
        {data.reviews.length > 0 && (
          <div className="mt-4 rounded-xl border border-gold/60 bg-gold/10 px-4 py-3">
            <p className="text-xs font-semibold text-gold">📌 诗评 · AI 诗评</p>
            <p className="mt-1.5 whitespace-pre-line font-serif text-sm leading-relaxed text-body">
              {data.reviews[0].content}
            </p>
          </div>
        )}

        {/* 评论预览 */}
        {data.comments.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-ink">评论 · {data.comments.length}</p>
            {data.comments.slice(0, 5).map((c) => (
              <div key={c.id} className="rounded-lg bg-paper-deep/60 px-3 py-2">
                <p className="text-xs text-muted">
                  <span className="font-medium text-ink">{c.author.username}</span>
                  <span className="mx-1.5">·</span>
                  <span>{formatTime(c.created_at)}</span>
                </p>
                <p className="mt-0.5 line-clamp-3 text-[13px] leading-relaxed text-body">{c.content}</p>
              </div>
            ))}
            {data.comments.length > 5 && (
              <p className="text-xs text-muted">…共 {data.comments.length} 条评论</p>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={copyLink}
            className="rounded-full bg-primary px-5 py-2 font-serif text-sm text-paper transition-colors hover:bg-primary-deep"
          >
            {copied ? "✓ 链接已复制" : "复制链接"}
          </button>
          <span className="text-xs text-muted">复制链接发给同好，或截图保存即可分享</span>
        </div>
      </div>
    </div>
  );
}
