"use client";

import { useEffect, useRef, useState } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface TestShareData {
  title: string;
  characterId: string;
  characterName: string;
  avatarUrl: string | null;
  summary: string;
  dimensions: { name: string; trait: string; detail: string }[];
  traits: string[];
  statsTotal: number;
  statsSame: number;
}

/** 测试结果分享长图（1080 宽，高度按内容自适应）：头像 + 原著性格全文 + 四维度详解 + 性格特质 + 真实统计 + 二维码。
 *  底部留白固定 ~90px；trait 徽章按文字宽度自适应，杜绝重叠/溢出。 */
export default function TestResultShare({
  data,
  onClose,
}: {
  data: TestShareData | null;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    let cancelled = false;
    const d = data;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = 1080;
    const ctx0 = canvas.getContext("2d");
    if (!ctx0) return;
    const ctx: CanvasRenderingContext2D = ctx0;

    const serif = "'Songti SC', 'Noto Serif SC', 'STSong', serif";
    const sans = "'PingFang SC', 'Noto Sans SC', sans-serif";
    const PAD_X = 64;
    const contentW = W - PAD_X * 2;

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

    function drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    }

    /* ---------- 布局预计算：返回 footer 分隔线的 y（内容高度自适应，底部固定留白） ---------- */
    function computeFootY(): number {
      let cy = 56 + 52 + 48 + 320 + 40; // 头部 + 头像
      cy += 48 + 60 + 76; // 标题区（你的红楼人格 / 大标题 / 对应人物，行距充足不重叠）
      cy = sectionTitleCalc(cy);
      cy += 27 + wrap(d.summary, contentW, `400 27px ${serif}`).length * 54 + 36; // 原著性格
      cy = sectionTitleCalc(cy);
      for (const dim of d.dimensions) {
        const rows = wrap(dim.detail, contentW - 56, `400 25px ${serif}`);
        cy += 40 + 30 + 8 + rows.length * 48 + 40 + 16;
      }
      cy += 36 - 16;
      cy = sectionTitleCalc(cy); // 性格特质
      cy += 20 + 46 + 36;
      cy += 28 + 52 + 4 + 22 + 28 + 36; // 统计条
      return cy; // footer 分隔线 y
    }
    function sectionTitleCalc(yy: number): number {
      return yy + 16 + 40;
    }

    const FOOT_SPACE = 252 + 90; // footer 区高度 + 底部留白
    const H = computeFootY() + FOOT_SPACE;
    canvas.width = W;
    canvas.height = H;

    /* ---------- 正式绘制 ---------- */
    const garden = new Image();
    garden.onload = () => drawAll(garden);
    garden.onerror = () => drawAll(null);
    garden.src = `${BASE}/images/garden-linework-v1.png`;

    function drawAll(gardenImg: HTMLImageElement | null) {
      ctx.fillStyle = "#FFFBF5";
      ctx.fillRect(0, 0, W, H);

      if (gardenImg) {
        ctx.save();
        ctx.globalAlpha = 0.38;
        const scale = Math.max((W * 0.72) / gardenImg.width, (H * 0.62) / gardenImg.height);
        const dw = gardenImg.width * scale;
        const dh = gardenImg.height * scale;
        ctx.drawImage(gardenImg, W * 0.24, -30, dw, dh);
        ctx.restore();
      }
      const fadeL = ctx.createLinearGradient(0, 0, W, 0);
      fadeL.addColorStop(0, "rgba(255,251,245,1)");
      fadeL.addColorStop(0.32, "rgba(255,251,245,0)");
      ctx.fillStyle = fadeL;
      ctx.fillRect(0, 0, W, H);
      const fadeB = ctx.createLinearGradient(0, H * 0.55, 0, H);
      fadeB.addColorStop(0, "rgba(255,251,245,0)");
      fadeB.addColorStop(1, "rgba(255,251,245,1)");
      ctx.fillStyle = fadeB;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.strokeStyle = "rgba(196, 154, 108, 0.45)";
      ctx.lineWidth = 3;
      drawRoundedRect(28, 28, W - 56, H - 56, 36);
      ctx.stroke();
      ctx.restore();

      let y = 56;

      /* 头部 */
      ctx.save();
      ctx.fillStyle = "#A63834";
      ctx.fillRect(PAD_X, y, 52, 52);
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFF8EF";
      ctx.font = `600 28px ${serif}`;
      ctx.fillText("红", PAD_X + 26, y + 38);
      ctx.textAlign = "left";
      ctx.fillStyle = "#A63834";
      ctx.font = `600 36px ${serif}`;
      ctx.fillText("红楼社", PAD_X + 68, y + 38);
      const tagText = "红楼人格测试 · 结果分享";
      ctx.font = `400 22px ${sans}`;
      const tagW = ctx.measureText(tagText).width;
      ctx.fillStyle = "#F2EDE4";
      drawRoundedRect(W - PAD_X - tagW - 24, y - 6, tagW + 24, 44, 999);
      ctx.fill();
      ctx.fillStyle = "#8C8C8C";
      ctx.textAlign = "center";
      ctx.fillText(tagText, W - PAD_X - (tagW + 24) / 2, y + 24);
      ctx.textAlign = "left";
      ctx.restore();
      y += 52 + 48;

      /* 头像 */
      const AVATAR_R = 160;
      const avX = W / 2;
      const avY = y + AVATAR_R;
      const avatar = new Image();
      avatar.crossOrigin = "anonymous";
      avatar.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX, avY, AVATAR_R, 0, Math.PI * 2);
        ctx.shadowColor = "rgba(60, 45, 30, 0.25)";
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 10;
        ctx.fillStyle = "#F2EDE4";
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.arc(avX, avY, AVATAR_R, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatar, avX - AVATAR_R, avY - AVATAR_R, AVATAR_R * 2, AVATAR_R * 2);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = "rgba(196, 154, 108, 0.7)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(avX, avY, AVATAR_R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        drawBody();
      };
      avatar.onerror = drawBody;
      if (d.avatarUrl) avatar.src = d.avatarUrl;

      function drawBody() {
        let cy = avY + AVATAR_R + 40;

        /* 标题区：行距充足（48px 大标题需要上行空间），三行互不重叠 */
        ctx.textAlign = "center";
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 24px ${sans}`;
        ctx.fillText("你的红楼人格", W / 2, cy);
        cy += 48;
        ctx.fillStyle = "#2C2C2C";
        ctx.font = `700 48px ${serif}`;
        ctx.fillText(d.title, W / 2, cy);
        cy += 60;
        ctx.fillStyle = "#595959";
        ctx.font = `400 28px ${sans}`;
        ctx.fillText(`与「${d.characterName}」性格相合`, W / 2, cy);
        cy += 28 + 48;
        ctx.textAlign = "left";

        /* 原著性格（全文） */
        cy = sectionTitle(cy, "原著性格");
        ctx.fillStyle = "#595959";
        ctx.font = `400 27px ${serif}`;
        const sumLines = wrap(d.summary, contentW, `400 27px ${serif}`);
        for (const ln of sumLines) {
          ctx.fillText(ln, PAD_X, cy + 27);
          cy += 54;
        }
        cy += 36;

        /* 性格维度 */
        cy = sectionTitle(cy, "性格维度");
        for (const dim of d.dimensions) {
          const rows = wrap(dim.detail, contentW - 56, `400 25px ${serif}`);
          const bh = 40 + 30 + 8 + rows.length * 48 + 40;
          ctx.save();
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
          drawRoundedRect(PAD_X, cy, contentW, bh, 20);
          ctx.fill();
          ctx.restore();
          let iy = cy + 40;
          ctx.fillStyle = "#A63834";
          ctx.font = `700 25px ${sans}`;
          ctx.fillText(dim.name, PAD_X + 28, iy);
          const nameW = ctx.measureText(dim.name).width;
          /* trait 徽章：宽度按文字自适应，不截断、不重叠 */
          ctx.font = `400 23px ${sans}`;
          const chipW = ctx.measureText(dim.trait).width + 32;
          ctx.fillStyle = "rgba(196, 154, 108, 0.16)";
          drawRoundedRect(PAD_X + 28 + nameW + 16, iy - 24, chipW, 34, 8);
          ctx.fill();
          ctx.fillStyle = "#5C4A3D";
          ctx.textAlign = "center";
          ctx.fillText(dim.trait, PAD_X + 28 + nameW + 16 + chipW / 2, iy + 2);
          ctx.textAlign = "left";
          iy += 30 + 10;
          ctx.fillStyle = "#595959";
          ctx.font = `400 25px ${serif}`;
          for (const ln of rows) {
            ctx.fillText(ln, PAD_X + 28, iy + 25);
            iy += 48;
          }
          cy += bh + 16;
        }
        cy += 36 - 16;

        /* 性格特质 */
        cy = sectionTitle(cy, "性格特质");
        ctx.font = `400 24px ${sans}`;
        let cx = PAD_X;
        for (const chip of d.traits) {
          const cw = ctx.measureText(chip).width + 48;
          ctx.fillStyle = "rgba(166, 56, 52, 0.08)";
          drawRoundedRect(cx, cy + 20, cw, 46, 999);
          ctx.fill();
          ctx.fillStyle = "#A63834";
          ctx.textAlign = "center";
          ctx.fillText(chip, cx + cw / 2, cy + 20 + 30);
          ctx.textAlign = "left";
          cx += cw + 12;
        }
        cy += 20 + 46 + 36;

        /* 统计条 */
        const statH = 28 + 52 + 4 + 22 + 28;
        ctx.save();
        ctx.fillStyle = "rgba(166, 56, 52, 0.07)";
        drawRoundedRect(PAD_X, cy, contentW, statH, 24);
        ctx.fill();
        ctx.restore();
        ctx.textAlign = "center";
        ctx.fillStyle = "#A63834";
        ctx.font = `700 52px ${serif}`;
        ctx.fillText(String(d.statsTotal), W / 2 - 200, cy + 28 + 48);
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 22px ${sans}`;
        ctx.fillText("站内同好已测", W / 2 - 200, cy + 28 + 84);
        ctx.fillStyle = "rgba(196, 154, 108, 0.4)";
        ctx.fillRect(W / 2, cy + 22, 2, statH - 44);
        ctx.fillStyle = "#A63834";
        ctx.font = `700 52px ${serif}`;
        ctx.fillText(String(d.statsSame), W / 2 + 200, cy + 28 + 48);
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 22px ${sans}`;
        ctx.fillText("与你有多少人相同", W / 2 + 200, cy + 28 + 84);
        ctx.textAlign = "left";
        cy += statH + 36;

        drawFooter(cy);
      }

      function sectionTitle(yy: number, label: string): number {
        ctx.fillStyle = "#A63834";
        ctx.fillRect(PAD_X, yy - 26, 8, 28);
        ctx.fillStyle = "#2C2C2C";
        ctx.font = `700 28px ${sans}`;
        ctx.fillText(label, PAD_X + 20, yy);
        return yy + 16 + 40;
      }
    }

    function drawFooter(footY: number) {
      const QR_SIZE = 172;
      ctx.strokeStyle = "rgba(196, 154, 108, 0.5)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(PAD_X, footY);
      ctx.lineTo(W - PAD_X, footY);
      ctx.stroke();
      ctx.setLineDash([]);

      const qr = new Image();
      qr.onload = () => {
        ctx.save();
        ctx.shadowColor = "rgba(60, 45, 30, 0.15)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = "#FFFFFF";
        drawRoundedRect(W - PAD_X - QR_SIZE, footY + 36, QR_SIZE, QR_SIZE, 12);
        ctx.fill();
        ctx.restore();
        ctx.drawImage(qr, W - PAD_X - QR_SIZE, footY + 36, QR_SIZE, QR_SIZE);
        finishFooter();
      };
      qr.onerror = finishFooter;
      qr.src = `${BASE}/images/qr.png`;

      function finishFooter() {
        ctx.textAlign = "center";
        ctx.fillStyle = "#8C8C8C";
        ctx.font = `400 18px ${sans}`;
        ctx.fillText("扫码测测你是红楼中的谁", W - PAD_X - QR_SIZE / 2, footY + 36 + QR_SIZE + 26);
        ctx.textAlign = "left";
        ctx.fillStyle = "#2C2C2C";
        ctx.font = `600 38px ${serif}`;
        ctx.fillText("红楼社", PAD_X, footY + 60);
        ctx.fillStyle = "#786D62";
        ctx.font = `400 22px ${sans}`;
        ctx.fillText("从一个人物、一个问题、一个地点进入《红楼梦》", PAD_X, footY + 96);

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
        <img loading="lazy" src={posterUrl}
          alt="测试结果分享卡"
          className="max-h-[75vh] w-auto rounded-xl shadow-[0_18px_60px_rgba(0,0,0,0.6)]"
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
            download={`honglou-test-${data.characterId}.png`}
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
