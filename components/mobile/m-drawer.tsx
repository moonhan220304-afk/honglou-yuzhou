"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import type { ThemeMode } from "@/lib/theme";

/** 抽屉分组（最终定案：逛园子 / 海棠诗社 4 子项 / 一起玩 / 我的） */
const GROUPS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "逛园子",
    items: [
      { href: "/characters", label: "人物志" },
      { href: "/graph", label: "关系图谱" },
      { href: "/map", label: "大观园" },
      { href: "/journey", label: "剧情旅程" },
      { href: "/poems", label: "诗词" },
    ],
  },
  {
    title: "海棠诗社",
    items: [
      { href: "/poem-society", label: "诗题" },
      { href: "/poem-society/fill", label: "诗词填字" },
      { href: "/poem-society/feihua", label: "飞花接句" },
      { href: "/poem-society/gallery", label: "佳作集" },
    ],
  },
  {
    title: "一起玩",
    items: [
      { href: "/questions", label: "问一问" },
      { href: "/test", label: "人格测试" },
    ],
  },
  {
    title: "我的",
    items: [
      { href: "/profile", label: "个人资料" },
      { href: "/community?mine=1", label: "我的帖子" },
      { href: "/profile/points", label: "积分 · 签到" },
      { href: "/profile/edit", label: "编辑资料" },
      { href: "/about", label: "关于 · 版本更新" },
    ],
  },
];

export default function MDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [theme, setTheme] = useState<ThemeMode>("system");

  useEffect(() => {
    if (open) fetchMe().then(setMe);
  }, [open]);

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const cycleTheme = () => {
    const next: ThemeMode = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
    applyTheme(next);
  };

  // 抽屉打开时：锁定滚动 + Esc 关闭
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="导航菜单">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <aside className="absolute inset-y-0 left-0 flex w-[80%] max-w-[300px] flex-col bg-paper-deep shadow-2xl">
        {/* 用户信息区 */}
        <div className="border-b border-line px-5 pb-4 pt-[calc(env(safe-area-inset-top)+16px)]">
          {me === undefined ? (
            <div className="h-14 w-14 rounded-full bg-line/40" />
          ) : me ? (
            <Link href="/profile" onClick={onClose} className="flex items-center gap-3">
              {me.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img loading="lazy" src={sitePath(me.avatar)} alt="头像" className="h-14 w-14 rounded-full border-2 border-gold object-cover" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 font-serif text-2xl text-primary">
                  {me.username.charAt(0)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate font-serif text-base font-semibold text-ink">{me.username}</span>
                <span className="block text-xs text-muted">
                  {me.level_name ? `${me.level_name} · ` : ""}关注 {me.following ?? 0} · 粉丝 {me.followers ?? 0}
                </span>
              </span>
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" onClick={onClose} className="rounded-full border border-gold/60 px-5 py-2 font-serif text-sm text-secondary-btn-text">
                登录
              </Link>
              <Link href="/register" onClick={onClose} className="rounded-full bg-primary px-5 py-2 font-serif text-sm text-paper">
                注册
              </Link>
            </div>
          )}
        </div>

        {/* 分组 */}
        <nav className="flex-1 overflow-y-auto py-2">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="px-5 pb-1 pt-4 font-serif text-[11px] tracking-[0.2em] text-muted">{g.title}</p>
              {g.items.map((it) => (
                <Link
                  key={it.href + it.label}
                  href={it.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-5 py-2.5 text-[15px] text-ink transition-colors active:bg-surface"
                >
                  {it.label}
                  <span className="text-muted" aria-hidden>›</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* 底部：主题 + 退出（主题切换在阶段 4 落地） */}
        <div className="border-t border-line px-5 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3">
          <button
            type="button"
            onClick={cycleTheme}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-body active:bg-surface"
          >
            <span>明暗主题</span>
            <span className="text-xs text-muted">
              {theme === "dark" ? "深色" : theme === "light" ? "浅色" : "跟随系统"}
            </span>
          </button>
          {me && (
            <button
              type="button"
              onClick={async () => {
                onClose();
                try {
                  await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" });
                } catch {}
                window.location.href = sitePath("/");
              }}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-muted active:bg-surface"
            >
              退出登录
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
