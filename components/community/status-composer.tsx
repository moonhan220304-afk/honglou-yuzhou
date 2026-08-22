"use client";

import { useState } from "react";
import { apiPost, fetchMe } from "@/lib/api";

/**
 * 发表状态：轻量一句话发布（类似发推文/微博），无标题，区别于「标题+正文」重型发帖。
 */
export default function StatusComposer({ onPosted }: { onPosted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const publish = async () => {
    setMsg("");
    const c = text.trim();
    if (!c) return;
    const me = await fetchMe();
    if (!me) {
      setMsg("请先登录");
      return;
    }
    setBusy(true);
    try {
      const r = await apiPost<{ ok: boolean; msg?: string }>("/api/posts", {
        title: "",
        content: c,
        tag: "今日动态",
        type: "dynamic",
      });
      if (!r.ok) {
        setMsg(r.msg ?? "发布失败");
        return;
      }
      setText("");
      setOpen(false);
      setMsg("已发布 ✓");
      onPosted?.();
    } catch (ex) {
      setMsg(ex instanceof Error ? ex.message : "发布失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full rounded-full border border-line bg-paper px-5 py-2.5 font-serif text-sm text-body transition-colors hover:border-primary/50 hover:text-primary"
        >
          ✦ 发表状态
        </button>
      ) : (
        <div className="card-print rounded-2xl bg-surface p-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={280}
            rows={2}
            autoFocus
            placeholder="分享此刻的心情、一句话的心境……（最多 280 字）"
            className="w-full resize-none rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors focus:border-primary"
          />
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-xs text-muted">{text.length}/280</span>
            <div className="flex items-center gap-2">
              {msg && <span className="text-xs text-muted">{msg}</span>}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setMsg("");
                }}
                className="rounded-full border border-line px-4 py-1.5 text-xs text-muted transition-colors hover:text-body"
              >
                取消
              </button>
              <button
                type="button"
                disabled={busy || !text.trim()}
                onClick={publish}
                className="rounded-full bg-primary px-5 py-1.5 text-xs text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
              >
                {busy ? "发布中…" : "发布"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
