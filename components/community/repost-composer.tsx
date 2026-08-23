"use client";

import { useState } from "react";
import { apiPost, sitePath } from "@/lib/api";

interface Props {
  /** 原帖信息 */
  original: {
    id: number;
    username: string;
    content: string;
    title?: string;
    images?: string[];
  };
  onClose: () => void;
  onDone?: (newId: number) => void;
}

/** 转发编辑（X/Twitter 风格）：引用原帖 + 输入自己的话，发布后展示「转发了 @原作者」 */
export default function RepostComposer({ original, onClose, onDone }: Props) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!text.trim()) return setErr("写点什么再转发吧");
    setBusy(true);
    setErr("");
    try {
      const r = await apiPost<{ id: number; msg: string }>("/api/repost", {
        post_id: original.id,
        content: text.trim(),
      });
      setDone(true);
      onDone?.(r.id);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "转发失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-surface p-5 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
              ✓
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-ink">转发成功</h3>
            <p className="mt-2 text-sm text-muted">已转发 @{original.username} 的内容</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-primary px-8 py-2.5 font-serif text-sm text-paper"
            >
              完成
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-ink">转发</h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-muted transition-colors hover:bg-line/60 hover:text-body"
              >
                ×
              </button>
            </div>

            <div className="mt-3">
              <p className="text-xs text-muted">
                转发 <span className="font-medium text-primary">@{original.username}</span> 的帖子
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={2000}
                placeholder="说点什么…"
                autoFocus
                className="mt-2 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink outline-none transition-colors focus:border-primary"
              />
            </div>

            {/* 引用原帖 */}
            <div className="mt-3 rounded-2xl border border-line/70 bg-paper-deep/50 p-3">
              <p className="text-xs font-medium text-body">@{original.username}</p>
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-muted">
                {original.title ? `【${original.title}】${original.content}` : original.content}
              </p>
              {original.images && original.images.length > 0 && (
                <div className="mt-2 flex gap-1.5">
                  {original.images.slice(0, 3).map((u) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={u}
                      loading="lazy"
                      src={sitePath(u)}
                      alt="原帖图"
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>

            {err && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{err}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={busy}
                className="flex-1 rounded-full bg-primary py-2.5 font-serif text-sm text-paper transition-opacity disabled:opacity-60"
              >
                {busy ? "转发中…" : "转发"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="flex-1 rounded-full border border-line py-2.5 font-serif text-sm text-body transition-colors hover:bg-paper-deep disabled:opacity-50"
              >
                取消
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
