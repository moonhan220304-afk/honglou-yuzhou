"use client";

import { useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** 分享卡片数据：模式 viewpoint=引用红学家观点；discussion=博主话题+我的评论 */
export interface ShareCardData {
  mode: "viewpoint" | "discussion";
  questionTitle: string;
  quoteTitle: string;
  quoteSource: string;
  quoteBody: string;
  noteLabel: string;
  note: string;
  noteAuthor: string;
  downloadName?: string;
}

/** 文字卡片分享：底纹同全站模块卡（园林线稿水印 + 纸色渐隐），
 *  上=被引用内容（红学家观点 / 博主话题），下=用户注解，右下角站二维码。 */
export default function ShareCardModal({
  data,
  onClose,
}: {
  data: ShareCardData | null;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    const d = data;
    let cancelled = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 900;
    const H = 1200;
    canvas.width = W;
    canvas.height = H;
    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0;

      const serif = "'Songti SC', 'Noto Serif SC', 'STSong', serif";
      const sans = "'PingFang SC', 'Noto Sans SC', sans-serif";
      const MARGIN = 72;
      const cardW = W - MARGIN * 2;

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

    function fitLines(lines: string[], max: number): string[] {
      if (lines.length <= max) return lines;
      const shown = lines.slice(0, max);
      const last = shown[max - 1];
      shown[max - 1] = `${last.replace(/[。，、！？…；：]$/, "")}……`;
      return shown;
    }

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    }

    const garden = new Image();
    garden.onload = () => drawAll(garden);
    garden.onerror = () => drawAll(null);
    garden.src = `${BASE}/images/garden-linework-v1.png`;

    function drawAll(gardenImg: HTMLImageElement | null) {
      // 纸色底
      ctx.fillStyle = "#FFFBF5";
      ctx.fillRect(0, 0, W, H);

      // 园林线稿水印（整卡平铺，模拟 card-print 底纹——预览标准：底纹铺满、文字之上无框线）
      if (gardenImg) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        const scale = Math.max(cardW / gardenImg.width, (H - 100) / gardenImg.height);
        const dw = gardenImg.width * scale;
        const dh = gardenImg.height * scale;
        ctx.drawImage(gardenImg, (W - dw) / 2, (H - dh) / 2, dw, dh);
        ctx.restore();
      }
      // 仅边缘极浅渐隐（不盖底纹主体：左 6%、底部 90% 起）
      const fadeL = ctx.createLinearGradient(0, 0, W * 0.08, 0);
      fadeL.addColorStop(0, "rgba(255,251,245,1)");
      fadeL.addColorStop(1, "rgba(255,251,245,0)");
      ctx.fillStyle = fadeL;
      ctx.fillRect(0, 0, W, H);
      const fadeB = ctx.createLinearGradient(0, H * 0.9, 0, H);
      fadeB.addColorStop(0, "rgba(255,251,245,0)");
      fadeB.addColorStop(1, "rgba(255,251,245,1)");
      ctx.fillStyle = fadeB;
      ctx.fillRect(0, 0, W, H);

      let y = 108;

      // 头部：红楼社 + 标签
      ctx.save();
      ctx.fillStyle = "#A63834";
      ctx.fillRect(MARGIN, y - 32, 30, 30);
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFF8EF";
      ctx.font = `600 16px ${serif}`;
      ctx.fillText("红", MARGIN + 15, y - 11);
      ctx.textAlign = "left";
      ctx.fillStyle = "#A63834";
      ctx.font = `600 26px ${serif}`;
      ctx.fillText("红楼社", MARGIN + 44, y - 10);
      ctx.font = `400 14px ${sans}`;
      ctx.fillStyle = "#8C8C8C";
      const tagText = d.mode === "viewpoint" ? "问题中心 · 观点分享" : "社区讨论 · 盖楼分享";
      const tagW = ctx.measureText(tagText).width;
      ctx.fillStyle = "#F2EDE4";
      drawRoundedRect(W - MARGIN - tagW - 28, y - 50, tagW + 28, 32, 999);
      ctx.fill();
      ctx.fillStyle = "#8C8C8C";
      ctx.textAlign = "center";
      ctx.fillText(tagText, W - MARGIN - (tagW + 28) / 2, y - 28);
      ctx.textAlign = "left";
      ctx.restore();
      y += 34;

      // 问题标题（无真实问题时只显示"社区讨论"）
      const qLabel = d.questionTitle && d.questionTitle !== "社区讨论" ? `问题 · ${d.questionTitle}` : "社区讨论";
      ctx.fillStyle = "#C49A6C";
      ctx.font = `400 21px ${sans}`;
      ctx.fillText(qLabel, MARGIN, y);
      y += 36;

      // 引用块（左金线 + 浅褐底；内容整体垂直居中）
      const qbX = MARGIN;
      const qbW = cardW;
      const qbPad = 26;
      const qTitleLines = fitLines(wrap(d.quoteTitle, qbW - qbPad * 2 - 8, `700 30px ${serif}`), 2);
      const qBodyLines = fitLines(wrap(d.quoteBody, qbW - qbPad * 2 - 8, `400 19px ${serif}`), 5);
      const qContentH = qTitleLines.length * 40 + (d.quoteSource ? 28 : 0) + qBodyLines.length * 33;
      /* 顶部多让出标题字的上行空间（canvas 基线绘制，视觉上顶留白=底留白） */
      const qPadTop = 72;
      const qh = qContentH + qPadTop + 46;
      ctx.save();
      ctx.fillStyle = "rgba(242, 237, 228, 0.65)";
      drawRoundedRect(qbX, y, qbW, qh, 12);
      ctx.fill();
      ctx.fillStyle = "#C49A6C";
      ctx.fillRect(qbX, y, 3, qh);
      ctx.restore();

      let qy = y + qPadTop;
      ctx.fillStyle = "#2C2C2C";
      ctx.font = `700 30px ${serif}`;
      for (const ln of qTitleLines) {
        ctx.fillText(ln, qbX + qbPad, qy);
        qy += 40;
      }
      if (d.quoteSource) {
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 16px ${sans}`;
        ctx.fillText(d.quoteSource, qbX + qbPad, qy);
        qy += 28;
      }
      ctx.fillStyle = "#595959";
      ctx.font = `400 19px ${serif}`;
      for (const ln of qBodyLines) {
        ctx.fillText(ln, qbX + qbPad, qy + 8);
        qy += 33;
      }
      y += qh + 48;

      // 我的注解
      ctx.fillStyle = "#C49A6C";
      ctx.font = `500 16px ${sans}`;
      ctx.fillText(d.noteLabel, MARGIN, y);
      ctx.fillStyle = "#C49A6C";
      ctx.fillRect(MARGIN + ctx.measureText(d.noteLabel).width + 10, y - 7, 20, 1);
      y += 32;

      ctx.fillStyle = "#2C2C2C";
      ctx.font = `400 22px ${serif}`;
      const noteLines = fitLines(wrap(d.note, cardW - 8, `400 22px ${serif}`), 8);
      for (const ln of noteLines) {
        ctx.fillText(ln, MARGIN, y);
        y += 38;
      }

      // 作者署名（右下，二维码左侧）
      ctx.save();
      ctx.fillStyle = "#C49A6C";
      ctx.beginPath();
      ctx.arc(MARGIN, y + 30, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFBF5";
      ctx.font = `600 14px ${serif}`;
      ctx.textAlign = "center";
      ctx.fillText(d.noteAuthor.charAt(0), MARGIN, y + 34);
      ctx.textAlign = "left";
      ctx.restore();
      ctx.fillStyle = "#595959";
      ctx.font = `400 17px ${sans}`;
      ctx.fillText(d.noteAuthor, MARGIN + 26, y + 34);

      drawFooter(y + 8);
    }

    function drawFooter(footY: number) {
      // 页脚分隔线 + 品牌 + 二维码（右下）
      const QR_SIZE = 116;
      ctx.strokeStyle = "rgba(196, 154, 108, 0.4)";
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(MARGIN, footY);
      ctx.lineTo(W - MARGIN, footY);
      ctx.stroke();
      ctx.setLineDash([]);

      const qr = new Image();
      qr.onload = () => {
        ctx.save();
        ctx.shadowColor = "rgba(60, 45, 30, 0.15)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;
        ctx.fillStyle = "#FFFFFF";
        drawRoundedRect(W - MARGIN - QR_SIZE, footY + 26, QR_SIZE, QR_SIZE, 8);
        ctx.fill();
        ctx.restore();
        ctx.drawImage(qr, W - MARGIN - QR_SIZE, footY + 26, QR_SIZE, QR_SIZE);
        finishFooter();
      };
      qr.onerror = finishFooter;
      qr.src = `${BASE}/images/qr.png`;

      function finishFooter() {
        ctx.textAlign = "center";
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 15px ${sans}`;
        ctx.fillText("扫码查看原文 · 参与讨论", W - MARGIN - QR_SIZE / 2, footY + 26 + QR_SIZE + 26);
        ctx.textAlign = "left";
        ctx.fillStyle = "#2C2C2C";
        ctx.font = `600 28px ${serif}`;
        ctx.fillText("红楼社", MARGIN, footY + 78);
        ctx.fillStyle = "#786D62";
        ctx.font = `400 17px ${sans}`;
        ctx.fillText("从一个人物、一个问题、一个地点进入《红楼梦》", MARGIN, footY + 112);

        if (!cancelled) setPosterUrl(canvasRef.current!.toDataURL("image/png"));
      }
    }

    return () => {
      cancelled = true;
    };
  }, [data]);

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-black/75 p-6 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-sm text-white/85">长按图片保存，即可分享给朋友</p>
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt="分享卡片"
          className="max-h-[70vh] w-auto rounded-xl shadow-[0_18px_60px_rgba(0,0,0,0.6)]"
        />
      ) : (
        <div className="flex h-64 w-52 items-center justify-center rounded-xl bg-white/10">
          <span className="text-sm text-white/60">卡片生成中…</span>
        </div>
      )}
      <div className="flex gap-3">
        {posterUrl && (
          <a
            href={posterUrl}
            download={data.downloadName || "honglou-share.png"}
            className="rounded-full bg-white px-8 py-2.5 text-sm text-gray-900 transition-colors hover:bg-white/85"
          >
            保存图片
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/30 bg-white/10 px-8 py-2.5 text-sm text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          关闭
        </button>
      </div>
    </div>
  );
}
