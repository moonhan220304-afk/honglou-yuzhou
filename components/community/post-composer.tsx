"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { PRESET_TAGS, uploadImages } from "@/lib/client-community";

export default function PostComposer() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState(PRESET_TAGS[0]);
  const [customTag, setCustomTag] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ id: number; msg: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMe().then((m) => {
      setMe(m);
      if (!m) router.push("/login?next=/community/new");
    });
  }, [router]);

  const effectiveTag = tag === "自建话题" ? (customTag.trim() || "自由讨论") : tag;

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
    if (!title.trim()) return setErr("请填写标题");
    if (!content.trim()) return setErr("请填写正文");
    setBusy(true);
    try {
      const r = await api<{ id: number; msg: string }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), content: content.trim(), tag: effectiveTag, images }),
      });
      setDone({ id: r.id, msg: r.msg });
      setTimeout(() => router.push("/community"), 1600);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "发布失败");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold";

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <p className="font-serif text-2xl text-ink">帖子已提交</p>
        <p className="mt-3 text-sm text-muted">{done.msg}。即将回到讨论区…</p>
      </div>
    );
  }

  if (me === undefined) return <div className="min-h-[50vh]" />;
  if (me === null) return null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Link href="/community" className="text-xs text-muted hover:text-primary">
        ← 返回讨论区
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-ink">发帖讨论</h1>
      <p className="mt-2 text-sm text-muted">
        以「{me.username}」身份发布 · 自动审核（命中敏感词转人工复核）· 支持长文与图片
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs text-muted">标题（最多 80 字）</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="一句话说清你的话题"
            className={`${inputCls} font-serif text-base`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">话题（可自建）</label>
          <div className="flex flex-wrap gap-2">
            {[...PRESET_TAGS, "自建话题"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  tag === t ? "bg-primary text-paper" : "bg-paper-deep text-muted hover:bg-line/50"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {tag === "自建话题" && (
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              maxLength={20}
              placeholder="输入你自建的话题名（最多 20 字）"
              className={`${inputCls} mt-3`}
            />
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">
            正文（支持 **加粗** 与多段落，最多 20000 字）
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="你的观点、证据、引文…"
            className={`${inputCls} leading-relaxed`}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">配图（最多 9 张，自动压缩后上传）</label>
          <div className="flex flex-wrap gap-3">
            {images.map((u, i) => (
              <div key={u} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img loading="lazy" src={sitePath(u)} alt={`配图${i + 1}`} className="h-full w-full object-cover" />
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

        {err && <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{err}</p>}
        {busy && <p className="text-sm text-muted">正在压缩并上传图片…</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-primary py-3 font-serif text-[15px] text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
        >
          {busy ? "请稍候…" : "发布"}
        </button>
      </form>
    </div>
  );
}
