"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";

/** 顶部用户入口：未登录 → 登录/注册；已登录 → 用户名（点进个人中心）+ 下拉（个人中心/发帖/管理/退出）
 * 注意：管理后台是 nginx 根路径例外代理，必须用裸 <a href={sitePath("/admin")}>，不能经 next/link 加 basePath。 */
export default function UserMenu() {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetchMe().then(setMe);
  }, []);

  useEffect(() => {
    if (!me) return;
    let stop = false;
    const poll = async () => {
      try {
        const r = await api<{ unread: number }>("/api/notifications/unread");
        if (!stop) setUnread(r.unread);
      } catch {
        /* 忽略轮询失败 */
      }
    };
    poll();
    const timer = setInterval(poll, 60_000);
    return () => {
      stop = true;
      clearInterval(timer);
    };
  }, [me]);

  // 点外部关闭 + Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-user-menu]")) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (me === undefined) {
    return <div className="h-8 w-8 rounded-full bg-paper-deep" />;
  }

  if (!me) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="hidden rounded-full border border-gold/60 bg-surface/60 px-4 py-1.5 font-serif text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary sm:inline-block"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-primary px-4 py-1.5 font-serif text-xs text-paper transition-colors hover:bg-primary-deep"
        >
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="relative" data-user-menu>
      <div className="flex items-center overflow-hidden rounded-full bg-surface-warm shadow-card">
        <Link
          href="/notifications"
          className="relative flex h-8 w-8 items-center justify-center text-secondary-btn-text transition-colors hover:text-primary"
          title="通知"
          aria-label="通知"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unread > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>
        <Link
          href="/profile"
          className="flex h-8 items-center gap-1.5 pl-1 pr-1 text-xs text-secondary-btn-text transition-colors hover:text-primary"
          title="个人中心"
        >
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sitePath(me.avatar)} alt="头像" className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 font-serif text-[10px] text-primary">
              {me.username.charAt(0)}
            </span>
          )}
          <span className="hidden max-w-[80px] truncate sm:inline">{me.username}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="用户菜单"
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-8 w-7 items-center justify-center text-secondary-btn-text transition-colors hover:text-primary"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-2xl border border-line/60 bg-surface p-1.5 shadow-hover">
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-body transition-colors hover:bg-paper-deep hover:text-primary"
          >
            个人中心
          </Link>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-body transition-colors hover:bg-paper-deep hover:text-primary"
          >
            <span>通知</span>
            {unread > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </Link>
          <Link
            href="/about"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-body transition-colors hover:bg-paper-deep hover:text-primary"
          >
            关于 · 版本更新
          </Link>
          <Link
            href="/community/new"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-body transition-colors hover:bg-paper-deep hover:text-primary"
          >
            发起讨论
          </Link>
          <Link
            href="/community?mine=1"
            onClick={() => setOpen(false)}
            className="block rounded-xl px-3 py-2 text-sm text-body transition-colors hover:bg-paper-deep hover:text-primary"
          >
            我的帖子
          </Link>
          {me.role === "admin" && (
            <a
              href={sitePath("/admin")}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm text-body transition-colors hover:bg-paper-deep hover:text-primary"
            >
              管理后台
            </a>
          )}
          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              try {
                await fetch(sitePath("/api/logout"), { method: "POST", credentials: "same-origin" });
              } catch {}
              window.location.href = sitePath("/");
            }}
            className="block w-full rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-paper-deep hover:text-primary"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
