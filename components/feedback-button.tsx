"use client";

import { useState } from "react";
import { sitePath } from "@/lib/api";

/**
 * 客观内容报错弹窗（全站统一交互）：
 * 点击「反馈错误」→ 居中弹窗 → 填写「哪里不对」+「正确的信息」→ 提交。
 * 自动携带定位信息（页面/类型/ID/标题），后端可精确识别数据位置。
 */
export default function FeedbackButton({
  type,
  refId,
  title,
  className = "",
}: {
  type: "character_identity" | "event" | "poem" | "question_overview";
  refId: string;
  title: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [wrong, setWrong] = useState("");
  const [correct, setCorrect] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  async function submit() {
    if (!wrong.trim() || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch(sitePath("/api/feedback"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: window.location.pathname,
          type,
          refId,
          title,
          note: wrong.trim(),
          correction: correct.trim(),
        }),
      });
      if (res.ok) {
        setState("done");
        setTimeout(() => {
          setOpen(false);
          setState("idle");
          setWrong("");
          setCorrect("");
        }, 2000);
      } else {
        setState("idle");
        alert("提交失败，请稍后再试");
      }
    } catch {
      setState("idle");
      alert("提交失败，请检查网络后重试");
    }
  }

  return (
    <span className={`inline-block ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="inline-flex items-center gap-1 text-[11px] text-muted/70 transition-colors hover:text-primary"
        title="发现客观错误？点击反馈"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
        反馈错误
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation();
            if (e.target === e.currentTarget && state !== "sending") {
              setOpen(false);
              setState("idle");
            }
          }}
        >
          <div className="fixed inset-0 bg-black/35 backdrop-blur-sm" aria-hidden />
          <div
            className="relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-hover"
            onClick={(e) => e.stopPropagation()}
          >
            {state === "done" ? (
              <div className="py-6 text-center">
                <p className="font-serif text-lg text-primary">感谢反馈</p>
                <p className="mt-2 text-sm text-muted">
                  我们会人工核实后修正。如有需要，可随时再提交其他报错。
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-base font-semibold text-ink">
                      反馈客观错误
                    </h3>
                    <p className="mt-1 text-xs text-muted">
                      {title}
                      <span className="mx-1">·</span>
                      观点争议无需反馈，我们只修正事实性错误。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setState("idle");
                    }}
                    className="ml-2 text-lg leading-none text-muted hover:text-body"
                    aria-label="关闭"
                  >
                    ×
                  </button>
                </div>

                <label className="mt-4 block text-xs font-medium text-body">
                  哪里不对？
                </label>
                <textarea
                  value={wrong}
                  onChange={(e) => setWrong(e.target.value)}
                  rows={3}
                  placeholder="例如：此处引文与通行本原文不一致……"
                  className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />

                <label className="mt-3 block text-xs font-medium text-body">
                  正确的信息（可选）
                </label>
                <textarea
                  value={correct}
                  onChange={(e) => setCorrect(e.target.value)}
                  rows={2}
                  placeholder="如知道正确内容或出处，请写下，帮助我们快速定位修正"
                  className="mt-1.5 w-full rounded-lg bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
                />

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-[11px] text-muted/70">
                    将自动记录页面位置，便于定位数据
                  </p>
                  <button
                    type="button"
                    onClick={submit}
                    disabled={!wrong.trim() || state === "sending"}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-paper transition-colors hover:bg-primary-deep disabled:opacity-40"
                  >
                    {state === "sending" ? "提交中…" : "提交反馈"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </span>
  );
}
