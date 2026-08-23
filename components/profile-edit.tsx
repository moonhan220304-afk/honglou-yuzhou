"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { compressAndUpload } from "@/lib/client-community";

/** 编辑资料 · 独立居中页：换头像 + 个性签名 */
export default function ProfileEdit() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [signature, setSignature] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMe().then((m) => {
      setMe(m);
      setSignature(m?.signature ?? "");
      if (!m) router.push("/login?next=/profile/edit");
    });
  }, [router]);

  const onPickAvatar = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const url = await compressAndUpload(f);
      const r = await api<{ user: Me }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ avatar: url }),
      });
      setMe((m) => (m ? { ...m, avatar: r.user.avatar } : m));
      setMsg("头像已更新");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "头像更新失败");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onPickBgImage = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const url = await compressAndUpload(f);
      const r = await api<{ user: Me }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ bg_image: url }),
      });
      setMe((m) => (m ? { ...m, bg_image: r.user.bg_image } : m));
      setMsg("背景图已更新");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "背景图更新失败");
    } finally {
      setBusy(false);
      if (bgRef.current) bgRef.current.value = "";
    }
  };

  const saveSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    try {
      const r = await api<{ user: Me }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ signature: signature.trim() }),
      });
      setMe((m) => (m ? { ...m, signature: r.user.signature } : m));
      setSignature(r.user.signature ?? "");
      setMsg("个性签名已保存");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "保存失败");
    } finally {
      setBusy(false);
    }
  };

  if (me === undefined) return <div className="min-h-[50vh]" />;
  if (me === null) return null;

  return (
    <div className="mx-auto max-w-xl px-6 py-14">
      <Link href="/profile" className="text-xs text-muted transition-colors hover:text-primary">
        ← 返回个人中心
      </Link>
      <p className="mt-4 text-[11px] uppercase tracking-[0.32em] text-primary-deep">EDIT PROFILE</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold text-ink">编辑资料</h1>
      <p className="mt-2 text-sm text-muted">以「{me.username}」身份编辑你的头像、背景图与个性签名</p>

      <div className="mt-8 space-y-6">
        {/* 背景图 */}
        <div className="rounded-2xl border border-line/60 bg-surface p-5 shadow-card">
          <p className="font-serif text-base font-semibold text-ink">背景图</p>
          <p className="mt-1 text-xs text-muted">主页顶部的封面背景，建议横图（如 1200×300），自动压缩后保存</p>
          <div className="mt-3 h-28 w-full overflow-hidden rounded-xl border border-line bg-paper-deep">
            {me.bg_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={sitePath(me.bg_image)} alt="背景图" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-xs text-muted">未设置背景图（当前使用默认渐变）</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => bgRef.current?.click()}
            disabled={busy}
            className="mt-3 rounded-full border border-gold/60 px-5 py-2 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary disabled:opacity-60"
          >
            {busy ? "处理中…" : me.bg_image ? "更换背景图" : "上传背景图"}
          </button>
          <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickBgImage(e.target.files)} />
        </div>

        {/* 头像 */}
        <div className="flex items-center gap-5 rounded-2xl border border-line/60 bg-surface p-5 shadow-card">
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sitePath(me.avatar)} alt="头像" className="h-20 w-20 rounded-full border-2 border-gold object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold bg-primary/10 font-serif text-3xl text-primary">
              {me.username.charAt(0)}
            </span>
          )}
          <div>
            <p className="font-serif text-base font-semibold text-ink">头像</p>
            <p className="mt-1 text-xs text-muted">建议上传正方形图片，自动压缩后保存</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="mt-3 rounded-full border border-gold/60 px-5 py-2 text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary disabled:opacity-60"
            >
              {busy ? "处理中…" : me.avatar ? "更换头像" : "上传头像"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickAvatar(e.target.files)} />
          </div>
        </div>

        {/* 个性签名 */}
        <form onSubmit={saveSignature} className="rounded-2xl border border-line/60 bg-surface p-5 shadow-card">
          <p className="font-serif text-base font-semibold text-ink">个性签名</p>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            rows={4}
            maxLength={120}
            placeholder="一句话介绍自己（最多 120 字）"
            className="mt-3 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-gold"
          />
          <div className="mt-1.5 text-right text-xs text-muted">{signature.length}/120</div>
          {err && <p className="mt-2 text-sm text-danger">{err}</p>}
          {msg && <p className="mt-2 text-sm text-success">{msg}</p>}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="rounded-full bg-primary px-8 py-2.5 font-serif text-sm text-paper transition-colors hover:bg-primary-deep disabled:opacity-60"
            >
              保存
            </button>
            <Link href="/profile" className="rounded-full border border-line px-6 py-2.5 text-sm text-muted transition-colors hover:text-body">
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
