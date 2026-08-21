"use client";

import type { ReactNode } from "react";
import { api, sitePath } from "@/lib/api";
import type { PostQuote } from "@/lib/api";
import { questionTitle } from "@/lib/data";

const MAX_DIM = 1600;
const JPEG_QUALITY = 0.8;

/** 客户端图片压缩：长边缩到 1600、JPEG 0.8，再上传，返回 /uploads/ 地址 */
export async function compressAndUpload(file: File): Promise<string> {
  const blob = await compressImage(file);
  const res = await fetch(sitePath("/api/upload"), {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": blob.type || "image/jpeg" },
    body: blob,
  });
  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.msg || "图片上传失败");
  return data.url as string;
}

export function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const scale = MAX_DIM / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas 不可用");
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (b) => {
            URL.revokeObjectURL(url);
            if (b) resolve(b);
            else reject(new Error("图片压缩失败"));
          },
          "image/jpeg",
          JPEG_QUALITY,
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e instanceof Error ? e : new Error("图片压缩失败"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片读取失败"));
    };
    img.src = url;
  });
}

/** 上传多图（逐个压缩上传），返回 url 数组 */
export async function uploadImages(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) urls.push(await compressAndUpload(f));
  return urls;
}

/** 轻量正文渲染：段落 + 换行 + **加粗** */
export function renderContent(content: string): ReactNode {
  const blocks = content.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const lines = block.split("\n");
    return (
      <p key={i} className="whitespace-pre-line leading-loose">
        {lines.map((line, j) => {
          const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, k) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={k} className="font-semibold text-ink">
                {part.slice(2, -2)}
              </strong>
            ) : (
              part
            ),
          );
          return j > 0 ? [<br key="br" />, parts] : parts;
        })}
      </p>
    );
  });
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = now - ts;
  if (diff < 60_000) return "刚刚";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86400_000 && new Date(now).getDate() === d.getDate()) {
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export const PRESET_TAGS = ["人物讨论", "观点争鸣", "脑洞讨论", "考证漫谈", "自由讨论"];

/** 被引用的红学家观点块（发帖引用 / 帖子展示共用） */
export function QuoteBlock({
  quote,
  compact,
  questionId,
}: {
  quote: PostQuote;
  compact?: boolean;
  questionId?: string | null;
}) {
  if (!quote.viewpoint_title) return null;
  const qTitle = quote.question_title;
  const href = questionId ? sitePath(`/questions/${questionId}`) : null;
  return (
    <div
      className={`rounded-r-xl border-l-2 border-gold/70 bg-paper-deep/55 px-4 py-3 ${
        compact ? "mt-2" : "mt-3"
      }`}
    >
      <p className="font-serif text-sm font-semibold text-ink">
        {quote.viewpoint_title}
      </p>
      {quote.source && <p className="mt-0.5 text-xs text-muted">{quote.source}</p>}
      {quote.summary && (
        <p className="mt-1.5 text-xs leading-relaxed text-body">
          {quote.summary}
        </p>
      )}
      {qTitle && (
        <p className="mt-1.5 text-[11px] text-muted/80">
          {href ? (
            <span
              role="link"
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                location.href = href;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") location.href = href;
              }}
              className="cursor-pointer underline decoration-dotted underline-offset-2 transition-colors hover:text-primary hover:decoration-solid"
            >
              在「{qTitle}」下发起 →
            </span>
          ) : (
            <>在「{qTitle}」下发起</>
          )}
        </p>
      )}
    </div>
  );
}

/** 帖子来源问题的回跳标识（未引用观点、但发在问题下的帖子） */
export function QuestionSourceBadge({
  questionId,
  className = "",
}: {
  questionId: string | null | undefined;
  className?: string;
}) {
  if (!questionId) return null;
  const title = questionTitle(questionId);
  if (!title) return null;
  const href = sitePath(`/questions/${questionId}`);
  return (
    <p className={`text-[11px] text-muted/80 ${className}`}>
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          location.href = href;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") location.href = href;
        }}
        className="cursor-pointer underline decoration-dotted underline-offset-2 transition-colors hover:text-primary hover:decoration-solid"
      >
        来自问题「{title}」→
      </span>
    </p>
  );
}

/** 分享：复制链接 */
export async function sharePostUrl(id: number): Promise<void> {
  const url = `${location.origin}${location.pathname.replace(/\/$/, "")}/post/?id=${id}`;
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    window.prompt("复制链接", url);
  }
}

export { api };
