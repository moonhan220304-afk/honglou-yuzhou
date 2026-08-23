"use client";

import { useEffect, useRef, useState } from "react";
import { compressAndUpload } from "@/lib/client-community";
import { api } from "@/lib/api";
import type { Me } from "@/lib/api";

/** 目标展示比例（16:9） */
const RATIO = 16 / 9;

interface Props {
  file: File;
  onCancel: () => void;
  onDone: (url: string) => void;
}

/** 背景图框选：上传后在 16:9 取景框内拖动/缩放，确认后裁剪上传 */
export default function BgCropModal({ file, onCancel, onDone }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const state = useRef({
    imgW: 0,
    imgH: 0,
    // 显示坐标（相对取景框）
    x: 0,
    y: 0,
    scale: 1,
    dragging: false as boolean,
    lastX: 0,
    lastY: 0,
  });

  // 取景框尺寸（最大宽度 480，按 16:9）
  const VIEW_W = 480;
  const VIEW_H = Math.round(VIEW_W / RATIO);

  const img = imgRef.current;

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  const applyPos = () => {
    const el = imgRef.current;
    if (!el) return;
    const s = state.current;
    el.style.left = `${s.x}px`;
    el.style.top = `${s.y}px`;
    el.style.width = `${s.imgW * s.scale}px`;
  };

  const zoom = (factor: number) => {
    const s = state.current;
    s.scale = clamp(s.scale * factor, 1, 6);
    applyPos();
  };

  useEffect(() => {
    const s = state.current;
    const onLoad = () => {
      const el = imgRef.current;
      if (!el) return;
      s.imgW = el.naturalWidth;
      s.imgH = el.naturalHeight;
      // 初始缩放：图片至少铺满取景框
      s.scale = Math.max(VIEW_W / s.imgW, VIEW_H / s.imgH);
      s.x = (VIEW_W - s.imgW * s.scale) / 2;
      s.y = (VIEW_H - s.imgH * s.scale) / 2;
      applyPos();
    };
    const el = imgRef.current;
    if (el) {
      if (el.complete) onLoad();
      else el.addEventListener("load", onLoad);
    }
    return () => el?.removeEventListener("load", onLoad);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = true;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.lastX;
    const dy = e.clientY - s.lastY;
    s.lastX = e.clientX;
    s.lastY = e.clientY;
    const el = imgRef.current;
    if (!el) return;
    // 拖动边界限制：图片须始终盖住取景框
    const dispW = s.imgW * s.scale;
    const dispH = s.imgH * s.scale;
    s.x = clamp(s.x + dx, Math.min(0, VIEW_W - dispW), Math.max(0, VIEW_W - dispW));
    s.y = clamp(s.y + dy, Math.min(0, VIEW_H - dispH), Math.max(0, VIEW_H - dispH));
    applyPos();
  };
  const onPointerUp = () => {
    state.current.dragging = false;
  };

  const doCrop = async () => {
    const el = imgRef.current;
    const s = state.current;
    if (!el || !el.naturalWidth) return;
    setSaving(true);
    setErr("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = Math.round(1280 / RATIO);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas 不可用");
      // 从原图按取景框相对位置裁剪
      const srcX = (-s.x / (s.imgW * s.scale)) * s.imgW;
      const srcY = (-s.y / (s.imgH * s.scale)) * s.imgH;
      const srcW = (VIEW_W / (s.imgW * s.scale)) * s.imgW;
      const srcH = (VIEW_H / (s.imgH * s.scale)) * s.imgH;
      ctx.drawImage(el, srcX, srcY, srcW, srcH, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
      if (!blob) throw new Error("裁剪失败");
      const url = await compressAndUpload(new File([blob], "bg.jpg", { type: "image/jpeg" }));
      const r = await api<{ user: Me }>("/api/profile", {
        method: "POST",
        body: JSON.stringify({ bg_image: url }),
      });
      onDone(r.user.bg_image ?? url);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "裁剪保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-5 shadow-hover">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-ink">选择背景图区域</h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-muted transition-colors hover:bg-line/60 hover:text-body disabled:opacity-50"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">拖动图片调整位置，按钮缩放；展示区域为 16:9。</p>

        <div className="mt-4 space-y-2">
          <div
            ref={viewRef}
            className="relative mx-auto overflow-hidden rounded-2xl border-2 border-gold/70 bg-black"
            style={{ width: "100%", maxWidth: VIEW_W, aspectRatio: `${RATIO}` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={URL.createObjectURL(file)}
              alt="背景图预览"
              draggable={false}
              className="absolute max-w-none cursor-grab select-none active:cursor-grabbing"
              style={{ left: 0, top: 0 }}
            />
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]" />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => zoom(1 / 1.15)}
              disabled={saving}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:text-body disabled:opacity-50"
            >
              －
            </button>
            <span className="text-xs text-muted">缩放</span>
            <button
              type="button"
              onClick={() => zoom(1.15)}
              disabled={saving}
              className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:text-body disabled:opacity-50"
            >
              ＋
            </button>
          </div>
        </div>

        {err && <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{err}</p>}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={doCrop}
            disabled={saving}
            className="flex-1 rounded-full bg-primary py-2.5 font-serif text-sm text-paper transition-opacity disabled:opacity-60"
          >
            {saving ? "保存中…" : "确认保存"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-full border border-line py-2.5 font-serif text-sm text-body transition-colors hover:bg-paper-deep disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
