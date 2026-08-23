"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { sitePath } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface ProfileCardData {
  username: string;
  avatar: string | null;
  signature: string | null;
  level: number;
  levelName: string;
  /** 个人空间链接（需带 basePath 前缀，二维码扫码直达） */
  profileUrl: string;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** 个人名片分享卡：纸色底 + 线稿水印，昵称 / 头像 / 等级 / 个人空间二维码。风格对齐站内既有分享卡。 */
export default function ProfileShareCard({
  data,
  onClose,
}: {
  data: ProfileCardData | null;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 720;
    const H = 960;
    canvas.width = W;
    canvas.height = H;
    const c2d = canvas.getContext("2d");
    if (!c2d) return;
    const ctx: CanvasRenderingContext2D = c2d;

    const serif = "'Songti SC', 'Noto Serif SC', 'STSong', serif";
    const sans = "'PingFang SC', 'Noto Sans SC', sans-serif";

    // 纸色底（干净，无任何线条装饰）
    ctx.fillStyle = "#FBF6EE";
    ctx.fillRect(0, 0, W, H);

    function roundedRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    draw();

    async function draw() {
      const d = data!;
      const cx = W / 2;

      // 顶部品牌：站内 Logo（图，放大），下方保留副标语，无虚线
      let logoOk = false;
      try {
        const logo = await loadImage(`${BASE}/images/logo-universal.png`);
        if (cancelled) return;
        const LW = 168;
        const LH = (logo.height / logo.width) * LW;
        ctx.drawImage(logo, cx - LW / 2, 54 - LH / 2, LW, LH);
        logoOk = true;
      } catch {
        /* logo 加载失败时回退文字 */
      }
      if (!logoOk) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#A63834";
        ctx.font = `600 30px ${serif}`;
        ctx.fillText("红 楼 社", cx, 80);
      }
      ctx.textAlign = "center";
      ctx.fillStyle = "#8C8273";
      ctx.font = `400 15px ${sans}`;
      ctx.fillText("一梦红楼 · 同好空间", cx, 118);

      // 头像（上移）
      const AV = 150;
      const AV_CY = 268;
      try {
        if (d.avatar) {
          const img = await loadImage(sitePath(d.avatar));
          if (cancelled) return;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, AV_CY, AV / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(img, cx - AV / 2, AV_CY - AV / 2, AV, AV);
          ctx.restore();
        } else {
          ctx.save();
          ctx.fillStyle = "rgba(166, 56, 52, 0.12)";
          ctx.beginPath();
          ctx.arc(cx, AV_CY, AV / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = "#A63834";
          ctx.font = `600 64px ${serif}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(d.username.charAt(0), cx, AV_CY);
          ctx.textBaseline = "alphabetic";
          ctx.restore();
        }
      } catch {
        if (cancelled) return;
      }
      // 头像金环
      ctx.strokeStyle = "#C49A6C";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, AV_CY, AV / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();

      // 昵称（下移，与头像拉开留白）
      ctx.fillStyle = "#3B332B";
      ctx.font = `600 40px ${serif}`;
      ctx.fillText(d.username, cx, 414);

      // 等级徽章
      const badgeText = `${d.levelName || "懵懂"} · LV${d.level}`;
      ctx.font = `500 19px ${sans}`;
      const bw = ctx.measureText(badgeText).width + 40;
      roundedRect(cx - bw / 2, 442, bw, 36, 18);
      ctx.fillStyle = "rgba(196, 154, 108, 0.18)";
      ctx.fill();
      ctx.fillStyle = "#8A6A45";
      ctx.textAlign = "center";
      ctx.fillText(badgeText, cx, 466);

      // 签名（选填，与二维码间距拉近）
      if (d.signature) {
        ctx.fillStyle = "#6B6155";
        ctx.font = `400 18px ${serif}`;
        const sig = d.signature.length > 18 ? d.signature.slice(0, 17) + "…" : d.signature;
        ctx.fillText(`「${sig}」`, cx, 516);
      }

      // 二维码（动态生成，指向个人空间；与签名拉近）
      const QR_SIZE = 200;
      const QR_TOP = 548;
      try {
        const qrDataUrl = await QRCode.toDataURL(d.profileUrl, {
          width: QR_SIZE,
          margin: 2,
          color: { dark: "#2C2C2C", light: "#FFFFFF" },
        });
        if (cancelled) return;
        const qr = await loadImage(qrDataUrl);
        if (cancelled) return;
        // 白底圆角
        ctx.save();
        ctx.shadowColor = "rgba(60, 45, 30, 0.18)";
        ctx.shadowBlur = 14;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#FFFFFF";
        roundedRect(cx - QR_SIZE / 2 - 14, QR_TOP, QR_SIZE + 28, QR_SIZE + 28, 16);
        ctx.fill();
        ctx.restore();
        ctx.drawImage(qr, cx - QR_SIZE / 2, QR_TOP + 14, QR_SIZE, QR_SIZE);
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 15px ${sans}`;
        ctx.fillText("扫码进入我的个人空间", cx, QR_TOP + QR_SIZE + 28 + 24);
      } catch {
        if (cancelled) return;
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 15px ${sans}`;
        ctx.fillText("扫码进入我的个人空间", cx, 700);
      }

      // 底部品牌行
      ctx.fillStyle = "#786D62";
      ctx.font = `400 15px ${sans}`;
      ctx.fillText("长按保存 · 分享给同好", cx, H - 56);

      if (!cancelled) setPosterUrl(canvas!.toDataURL("image/png"));
    }
  }, [data]);

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl bg-surface p-5 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold text-ink">我的名片</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-muted transition-colors hover:bg-line/60 hover:text-body"
            aria-label="关闭"
          >
            ×
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">扫码即可进入你的红楼社个人空间</p>

        <canvas ref={canvasRef} className="mt-4 hidden" />
        {posterUrl && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={posterUrl}
              alt={`${data.username} 的名片`}
              className="w-full rounded-2xl shadow-card"
            />
          </div>
        )}
        {!posterUrl && (
          <div className="mt-4 flex h-64 items-center justify-center rounded-2xl bg-paper-deep/60 text-sm text-muted">
            名片生成中…
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <a
            href={posterUrl ?? "#"}
            download={`红楼社-${data.username}-名片.png`}
            className={`flex-1 rounded-full bg-primary py-2.5 text-center font-serif text-sm text-paper transition-opacity ${
              posterUrl ? "" : "pointer-events-none opacity-50"
            }`}
          >
            保存图片
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-line py-2.5 font-serif text-sm text-body transition-colors hover:bg-paper-deep"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
