"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { POEM_TAG } from "@/lib/poem-society";
import PoemSocietyNav from "@/components/poem-society/poem-society-nav";

interface Draft {
  title: string;
  content: string;
  savedAt: number;
}

const MODE_COPY: Record<string, { hint: string; placeholder: string }> = {
  poem: {
    hint: "写一首诗参与诗题——体裁不限，格律不限。",
    placeholder: "落笔处，自有诗心。\n\n例如：\n白玉一轮天上月，清辉几度照红楼…",
  },
  fill: {
    hint: "把原句抄一遍、填上你的字。",
    placeholder: "例：清风入客梦，素月照归舟",
  },
  feihua: {
    hint: "接下句：把原句抄一遍，写下你的接句。",
    placeholder: "例：且借人间二两墨，泼洒红尘万里波",
  },
};

export default function PoemComposer() {
  const search = useSearchParams();
  const topicId = Number(search.get("topic")) || 0;
  const mode = (search.get("mode") as "poem" | "fill" | "feihua") || "poem";
  const topicTitle = search.get("title") || "";

  const draftKey = `hlm-poem-draft:${topicId || "none"}`;
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetchMe().then((m) => setMe(m));
  }, []);

  /* 恢复草稿（async IIFE：避免 effect 内同步 setState） */
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem(draftKey);
        if (!raw) return;
        const d = JSON.parse(raw) as Partial<Draft>;
        if (typeof d.title === "string") setTitle(d.title);
        if (typeof d.content === "string") setContent(d.content);
        if (typeof d.savedAt === "number") setSavedAt(d.savedAt);
      } catch {
        /* 草稿损坏则忽略 */
      }
    })();
  }, [draftKey]);

  const saveDraft = () => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ title, content, savedAt: Date.now() } satisfies Draft));
      setSavedAt(Date.now());
      setMsg("草稿已保存在本机");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setErr("草稿保存失败（浏览器存储不可用）");
      setTimeout(() => setErr(""), 3000);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!me) {
      setErr("请先登录后再发表");
      return;
    }
    if (!content.trim()) {
      setErr("正文不能为空");
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        content: content.trim(),
        tag: POEM_TAG,
        type: mode === "poem" ? "poem" : "answer",
      };
      if (topicId) body.topic_id = topicId;
      const r = await api<{ id: number; msg?: string }>("/api/posts", {
        method: "POST",
        body: JSON.stringify(body),
      });
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      setMsg(r.msg || "已发布");
      setDone(true);
      setTimeout(() => {
        window.location.assign(
          sitePath(topicId ? `/poem-society/topic/${topicId}` : "/poem-society"),
        );
      }, 1200);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "发表失败");
    } finally {
      setBusy(false);
    }
  };

  const copy = MODE_COPY[mode] || MODE_COPY.poem;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <PoemSocietyNav />

      <header className="mt-6">
        <p className="text-xs tracking-[0.3em] text-poem">COMPOSE · 作诗</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">写诗</h1>
        {topicTitle && (
          <p className="mt-2 text-sm text-primary">参与诗题「{topicTitle}」</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-body">{copy.hint}</p>
      </header>

      {me === null && (
        <div className="mt-5 rounded-2xl bg-paper-deep/60 px-4 py-3 text-sm text-body">
          发表前请
          <Link
            href={`/login?next=${encodeURIComponent(
              topicId ? `/poem-society/compose?topic=${topicId}` : "/poem-society/compose",
            )}`}
            className="mx-1 text-primary underline decoration-dotted underline-offset-2"
          >
            先登录
          </Link>
          ——未登录也可以先打草稿。
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div className="rounded-2xl bg-surface p-5 shadow-card">
          <label className="text-xs text-muted">标题（可选）</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="给这首诗起个名字…"
            className="mt-1.5 w-full rounded-xl border border-line bg-surface-warm px-4 py-3 font-serif text-lg text-ink outline-none placeholder:text-muted/70 focus:border-gold"
          />
        </div>

        <div className="rounded-2xl bg-surface p-5 shadow-card">
          <label className="text-xs text-muted">正文</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            maxLength={20000}
            placeholder={copy.placeholder}
            className="mt-1.5 w-full resize-y rounded-xl border border-line bg-surface-warm px-4 py-4 font-serif text-lg leading-loose text-ink outline-none placeholder:text-muted/70 focus:border-gold"
          />
        </div>

        {savedAt && (
          <p className="text-xs text-muted">
            已恢复草稿（保存于 {new Date(savedAt).toLocaleString("zh-CN")}）
          </p>
        )}
        {err && <p className="text-sm text-danger">{err}</p>}
        {msg && <p className="text-sm text-success">{msg}</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy || done}
            className="rounded-full bg-primary px-7 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
          >
            {busy ? "发表中…" : done ? "已发布 ✓" : "发表"}
          </button>
          <button
            type="button"
            onClick={saveDraft}
            className="rounded-full bg-paper-deep px-5 py-2.5 text-sm text-body transition-colors hover:bg-line/50"
          >
            存草稿
          </button>
          {topicId && (
            <Link
              href={`/poem-society/topic/${topicId}`}
              className="text-xs text-muted underline decoration-dotted underline-offset-2 hover:text-primary"
            >
              返回诗题
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
