"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost, fetchMe, sitePath } from "@/lib/api";

const ASK_CATEGORIES = [
  { value: "人物", label: "人物类" },
  { value: "剧情", label: "剧情类" },
  { value: "主题", label: "主题类" },
];

export default function AskQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cat, setCat] = useState("人物");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!title.trim() || !content.trim()) {
      setErr("标题和描述都不能为空");
      return;
    }
    const me = await fetchMe();
    if (!me) {
      router.push("/login");
      return;
    }
    setBusy(true);
    try {
      const r = await apiPost<{ ok: boolean; msg?: string; id?: number }>("/api/posts", {
        title: title.trim(),
        content: content.trim(),
        tag: `提问·${cat}`,
        type: "post",
      });
      if (!r.ok) {
        setErr(r.msg ?? "发布失败");
        return;
      }
      router.push("/community/post/?id=" + r.id);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "发布失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <p className="text-xs tracking-[0.3em] text-gold">ASK</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">我要提问</h1>
      <p className="mt-3 text-sm leading-relaxed text-body">
        你的问题会作为一条讨论帖发布到社区，大家可以在下面各抒己见——问得好，就会被顶成热议。
      </p>

      <form onSubmit={submit} className="card-print mt-8 rounded-2xl bg-surface p-6">
        <label className="block text-sm font-medium text-ink">问题标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
          placeholder="例如：黛玉到底有没有吃醋？"
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-primary"
        />

        <label className="mt-5 block text-sm font-medium text-ink">问题描述（补充背景 / 你的疑惑）</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder="把你看到的原文、你的困惑写清楚，讨论质量会更高……"
          className="mt-2 w-full rounded-xl border border-line bg-paper px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors focus:border-primary"
        />

        <label className="mt-5 block text-sm font-medium text-ink">分类</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {ASK_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCat(c.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                cat === c.value
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-paper text-body hover:text-primary"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {err && <p className="mt-4 text-sm text-primary">{err}</p>}

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={busy}
            className="w-full max-w-[320px] rounded-full bg-primary px-8 py-3 font-serif text-sm text-white transition-colors hover:bg-primary-deep disabled:opacity-50"
          >
            {busy ? "发布中…" : "发布提问"}
          </button>
        </div>
      </form>
    </div>
  );
}
