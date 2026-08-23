"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiPost, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { PRESET_TAGS, uploadImages } from "@/lib/client-community";

/**
 * 发表状态 · 独立页面（与发帖讨论页对齐的形式感）
 * - 无标题，强调大字号宋体文字 + 最多 9 张配图 + 可选话题
 * - 发布 type=dynamic，个人中心「动态」tab 可正确归类
 */
export default function StatusComposerPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [text, setText] = useState("");
  const [tag, setTag] = useState("今日动态");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMe().then((m) => {
      setMe(m);
      if (!m) router.push("/login?next=/community/status");
    });
  }, [router]);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErr("");
    setBusy(true);
    try {
      const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 9 - images.length);
      const urls = await uploadImages(picked);
      setImages((prev) => [...prev, ...urls].slice(0, 9));
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "图片上传失败");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const c = text.trim();
    if (!c) return setErr("写点什么再发布吧");
    setBusy(true);
    try {
      const r = await apiPost<{ ok: boolean; id?: number; msg?: string }>("/api/posts", {
        title: "",
        content: c,
        tag: tag || "今日动态",
        type: "dynamic",
        images,
      });
      if (!r.ok) {
        setErr(r.msg ?? "发布失败");
        return;
      }
      router.push("/community?tab=new");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "发布失败");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold";

  if (me === undefined) return <div className="min-h-[50vh]" />;
  if (me === null) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/community" className="text-xs text-muted hover:text-primary">
        ← 返回讨论区
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">发表状态</h1>
      <p className="mt-2 text-sm text-muted">
        以「{me.username}」身份发布 · 一句话心境 + 最多 9 张图 · 自动审核
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs text-muted">这一刻（最多 280 字）</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            maxLength={280}
            autoFocus
            placeholder="分享此刻的心情、一句话的心境……（例如：读到「花谢花飞花满天」时，你想起谁）"
            className={`${inputCls} font-serif text-base leading-relaxed`}
          />
          <div className="mt-1.5 text-right text-xs text-muted">{text.length}/280</div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">配图（最多 9 张，自动压缩后上传）</label>
          <div className="flex flex-wrap gap-3">
            {images.map((u, i) => (
              <div key={u} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sitePath(u)} alt={`配图${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((x) => x !== u))}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                  aria-label="移除图片"
                >
                  ✕
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-line text-2xl text-muted transition-colors hover:border-gold hover:text-primary"
                aria-label="添加图片"
              >
                +
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">同步到话题（可选）</label>
          <div className="flex flex-wrap gap-2">
            {["今日动态", ...PRESET_TAGS].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  tag === t ? "bg-chat-deep text-paper" : "bg-paper-deep text-muted hover:bg-line/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {err && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}
        {busy && <p className="text-sm text-muted">正在压缩并上传图片…</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={busy || !text.trim()}
            className="flex-1 rounded-xl bg-chat-deep py-3 font-serif text-[15px] text-paper transition-colors hover:bg-[#7d442f] disabled:opacity-60"
          >
            {busy ? "发布中…" : "发布状态"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/community")}
            className="rounded-xl border border-line px-5 py-3 text-sm text-muted transition-colors hover:text-body"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
