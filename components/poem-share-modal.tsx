"use client";

import { useEffect, useRef, useState } from "react";
import { poemImage } from "@/lib/images";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 竖版分享海报：诗词配图作底（上半）+ 诗文纸色区 + logo/二维码 */
export default function PoemShareModal({
  open,
  poemId,
  title,
  chapterLabel,
  author,
  quote,
  summary,
  onClose,
}: {
  open: boolean;
  poemId: string;
  title: string;
  chapterLabel: string;
  author: string;
  quote: string;
  summary: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 900;
    const H = 1280;
    canvas.width = W;
    canvas.height = H;
    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0;

    const serif = "'Songti SC', 'Noto Serif SC', 'STSong', serif";
    const sans = "'PingFang SC', 'Noto Sans SC', sans-serif";
    // 书封式分享图：一幅主画面、一段诗句、一处低权重扫码入口。
    const MARGIN = 64;
    const IMAGE_TOP = 52;
    const IMAGE_H = 566;
    const IMAGE_BOTTOM = IMAGE_TOP + IMAGE_H;
    const QR_SIZE = 112;

    function wrap(text: string, maxWidth: number, font: string): string[] {
      ctx.font = font;
      const chars = text.split("");
      const lines: string[] = [];
      let line = "";
      for (const ch of chars) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    const bg = new Image();
    bg.onload = () => drawAll(bg);
    bg.onerror = () => drawAll(null);
    bg.src = poemImage(poemId) ?? "";

    function drawAll(bgImg: HTMLImageElement | null) {
      ctx.fillStyle = "#F6F0E6";
      ctx.fillRect(0, 0, W, H);

      const imageW = W - MARGIN * 2;
      ctx.save();
      ctx.shadowColor = "rgba(56, 42, 28, 0.18)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "#E7DDCF";
      ctx.beginPath();
      ctx.roundRect(MARGIN, IMAGE_TOP, imageW, IMAGE_H, 28);
      ctx.fill();
      ctx.restore();

      if (bgImg) {
        const scale = Math.max(imageW / bgImg.width, IMAGE_H / bgImg.height);
        const dw = bgImg.width * scale;
        const dh = bgImg.height * scale;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(MARGIN, IMAGE_TOP, imageW, IMAGE_H, 28);
        ctx.clip();
        ctx.drawImage(bgImg, MARGIN + (imageW - dw) / 2, IMAGE_TOP + (IMAGE_H - dh) / 2, dw, dh);
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = "rgba(119, 91, 64, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(MARGIN, IMAGE_TOP, imageW, IMAGE_H, 28);
      ctx.stroke();
      ctx.restore();

      const labelY = IMAGE_BOTTOM + 62;
      ctx.fillStyle = "#A44739";
      ctx.fillRect(MARGIN, labelY - 23, 26, 26);
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFF8EF";
      ctx.font = `600 14px ${serif}`;
      ctx.fillText("诗", MARGIN + 13, labelY - 5);
      ctx.textAlign = "left";
      ctx.fillStyle = "#876B55";
      ctx.font = `500 19px ${sans}`;
      ctx.fillText(`${chapterLabel}${author ? ` · ${author}` : ""}`, MARGIN + 42, labelY - 5);

      ctx.fillStyle = "#2E2722";
      ctx.font = `700 52px ${serif}`;
      const titleLines = wrap(title, W - MARGIN * 2, `700 52px ${serif}`).slice(0, 2);
      const titleY = labelY + 70;
      titleLines.forEach((ln, i) => ctx.fillText(ln, MARGIN, titleY + i * 60));

      const bodyWidth = W - MARGIN * 2;
      let quoteSize = 29;
      let quoteLines = wrap(quote, bodyWidth, `400 ${quoteSize}px ${serif}`);
      while (quoteLines.length > 4 && quoteSize > 26) {
        quoteSize -= 2;
        quoteLines = wrap(quote, bodyWidth, `400 ${quoteSize}px ${serif}`);
      }
      const qShown = quoteLines.slice(0, 4);
      if (quoteLines.length > 4) qShown[3] = `${qShown[3].replace(/[。，、！？…]$/, "")}……`;
      const qLineH = quoteSize + 20;
      ctx.font = `400 ${quoteSize}px ${serif}`;
      let y = titleY + titleLines.length * 60 + 66;
      ctx.fillStyle = "#453932";
      ctx.fillRect(MARGIN, y - quoteSize - 5, 3, qLineH * qShown.length + 8);
      ctx.fillStyle = "#3C332D";
      for (const line of qShown) {
        ctx.fillText(line, MARGIN + 22, y);
        y += qLineH;
      }
      drawFooter();
    }

    function drawFooter() {
      // 二维码与品牌只在页脚出现，作为读完后才会看的行动入口。
      const qr = new Image();
      qr.onload = () => {
        ctx.drawImage(qr, W - MARGIN - QR_SIZE, H - 202, QR_SIZE, QR_SIZE);
        finishFooter();
      };
      qr.onerror = finishFooter;
      qr.src = `${BASE}/images/qr.png`;

      function finishFooter() {
        ctx.textAlign = "left";
        ctx.fillStyle = "#2C2C2C";
        ctx.font = `600 24px ${serif}`;
        ctx.fillText("红楼社", MARGIN, H - 136);
        ctx.fillStyle = "#786D62";
        ctx.font = `400 17px ${sans}`;
        ctx.fillText("从一首诗，走进大观园", MARGIN, H - 102);
        ctx.textAlign = "center";
        ctx.fillText("扫码续读", W - MARGIN - QR_SIZE / 2, H - 62);
        ctx.textAlign = "left";

        if (!cancelled) setPosterUrl(canvasRef.current!.toDataURL("image/png"));
      }
    }

    return () => {
      cancelled = true;
    };
  }, [open, poemId, title, chapterLabel, author, quote, summary]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black/75 p-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-sm text-white/85">
        长按图片保存，即可分享到朋友圈
      </p>
      {posterUrl ? (
        <img loading="lazy" src={posterUrl}
          alt={`${title} · 分享海报`}
          className="max-h-[78vh] w-auto rounded-xl shadow-[0_18px_60px_rgba(0,0,0,0.6)]"
        />
      ) : (
        <div className="flex h-64 w-52 items-center justify-center rounded-xl bg-white/10">
          <span className="text-sm text-white/60">海报生成中…</span>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        className="rounded-full border border-white/30 bg-white/10 px-8 py-2.5 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
      >
        关闭
      </button>
    </div>
  );
}
