"use client";

import { useState } from "react";
import { api, sitePath } from "@/lib/api";
import type { TopicKind } from "@/lib/poem-society";

const KIND_LABEL: Record<TopicKind, string> = {
  poem_topic: "诗题",
  fill: "填字",
  feihua: "飞花接句",
};

const KIND_HINT: Record<TopicKind, string> = {
  poem_topic: "出题示例：#咏月#、#思乡#——一个主题词即可，配一句说明",
  fill: "出题示例：清风［　］客梦，素月［　］归舟——用［　］留空待填",
  feihua: "出题示例：且借人间二两墨——给一个上句，让大家来接",
};

const DIFF_OPTIONS = [
  { value: "beginner", label: "初级" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
];

interface Props {
  kind: TopicKind;
  onClose: () => void;
  onCreated: () => void;
}

/** 用户出题弹窗：诗题 / 填字 / 飞花 共用（官方=0，不抢占当期，提交后进候选池） */
export default function TopicComposer({ kind, onClose, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!title.trim()) return setErr("请填写题目");
    setSending(true);
    setErr("");
    try {
      await api<{ ok: boolean }>("/api/topics", {
        method: "POST",
        body: JSON.stringify({
          kind,
          title: title.trim(),
          content: content.trim(),
          theme: theme.trim(),
          difficulty,
        }),
      });
      setDone(true);
      onCreated();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "提交失败，请稍后再试");
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-3xl bg-surface p-6 shadow-hover"
        onClick={(e) => e.stopPropagation()}
      >
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-2xl text-success">
              ✓
            </div>
            <h3 className="mt-4 font-serif text-xl font-semibold text-ink">出题成功，感谢你的贡献</h3>
            <p className="mt-2 text-sm text-muted">
              你的题目已加入候选池，会在「{KIND_LABEL[kind]}」中展示。
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-primary px-6 py-2 font-serif text-sm text-paper"
            >
              完成
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-ink">我来出题 · {KIND_LABEL[kind]}</h3>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-muted transition-colors hover:bg-line/60 hover:text-body"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <p className="mt-1 text-xs text-muted">{KIND_HINT[kind]}</p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-body">题目（必填）</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={80}
                  placeholder={kind === "fill" ? "清风［　］客梦，素月［　］归舟" : kind === "feihua" ? "且借人间二两墨" : "咏月"}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              {kind === "poem_topic" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-body">说明（选填）</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder="写一首与月有关的诗，体裁不限"
                    className="w-full resize-none rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink outline-none transition-colors focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-body">主题（选填）</label>
                <input
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  maxLength={20}
                  placeholder={kind === "feihua" ? "墨 / 春 / 月……" : "咏物 / 思乡 / 送别……"}
                  className="w-full rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink outline-none transition-colors focus:border-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-body">难度</label>
                <div className="flex gap-2">
                  {DIFF_OPTIONS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDifficulty(d.value)}
                      className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                        difficulty === d.value
                          ? "bg-primary text-paper"
                          : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {err && <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{err}</p>}

              <button
                type="button"
                onClick={submit}
                disabled={sending}
                className="w-full rounded-full bg-primary py-2.5 font-serif text-sm text-paper transition-opacity disabled:opacity-50"
              >
                {sending ? "提交中…" : "提交题目"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** 出题按钮文案（保持与「去参与」同等的简短） */
export const COMPOSE_BUTTON_LABEL = "我来出题";

/** 快捷出题跳转：未登录时先登录 */
export async function requireLoginForCompose(): Promise<boolean> {
  try {
    const r = await api<{ ok: boolean; user: { id: number } | null }>("/api/me");
    if (r.user) return true;
  } catch {
    /* 未登录走下面跳转 */
  }
  window.location.href = sitePath(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  return false;
}
