"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { IconHome, IconGrid, IconPlus, IconBell, IconUser, IconQuill, IconMessage, IconX } from "@/components/icons";

/** 移动端底部导航（微博/Twitter 式 5 项：首页 / 发现 / ＋发布 / 消息 / 我） */
const items = [
  { href: "/", label: "首页", icon: IconHome },
  { href: "/discover", label: "发现", icon: IconGrid },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);

  // 未读消息轮询（供「消息」tab 红点）
  useEffect(() => {
    let stop = false;
    const poll = async () => {
      try {
        const r = await api<{ unread: number }>("/api/notifications/unread");
        if (!stop) setUnread(r.unread);
      } catch {
        /* 忽略 */
      }
    };
    poll();
    const t = setInterval(poll, 60_000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, []);

  const activeOf = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      {/* 发布底部动作面板 */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setSheetOpen(false)} />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-5 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "star-panel-in 0.22s ease both" }}
          >
            <div className="flex items-center justify-between">
              <p className="font-serif text-base font-semibold text-ink">发布</p>
              <button type="button" onClick={() => setSheetOpen(false)} aria-label="关闭" className="flex h-8 w-8 items-center justify-center rounded-full bg-paper-deep text-muted">
                <IconX className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { href: "/community/status", label: "发动态", icon: IconMessage, desc: "一句话心境" },
                { href: "/community/new", label: "写长文", icon: IconQuill, desc: "标题 + 正文" },
                { href: "/poem-society/compose", label: "发诗", icon: IconQuill, desc: "参与诗题" },
              ].map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  onClick={() => setSheetOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-line/60 bg-surface-warm p-4 transition-colors active:scale-[0.98]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <o.icon className="h-5 w-5" />
                  </span>
                  <span className="font-serif text-sm text-ink">{o.label}</span>
                  <span className="text-[11px] text-muted">{o.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between">
          {items.map((it) => {
            const Icon = it.icon;
            const active = activeOf(it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
                  active ? "text-primary" : "text-muted"
                }`}
              >
                <Icon className={`h-[20px] w-[20px] ${active ? "stroke-[2]" : ""}`} />
                {it.label}
              </Link>
            );
          })}

          {/* 中央发布 FAB */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label="发布"
            className="relative -mt-4 flex w-14 shrink-0 flex-col items-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-paper shadow-[0_4px_14px_rgba(166,56,52,0.4)] transition-transform active:scale-95">
              <IconPlus className="h-6 w-6" />
            </span>
          </button>

          {/* 消息 */}
          <Link
            href="/notifications"
            className={`relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
              pathname.startsWith("/notifications") ? "text-primary" : "text-muted"
            }`}
          >
            <span className="relative">
              <IconBell className={`h-[20px] w-[20px] ${pathname.startsWith("/notifications") ? "stroke-[2]" : ""}`} />
              {unread > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-white">
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </span>
            消息
          </Link>

          {/* 我 */}
          <Link
            href="/profile"
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
              pathname.startsWith("/profile") ? "text-primary" : "text-muted"
            }`}
          >
            <IconUser className={`h-[20px] w-[20px] ${pathname.startsWith("/profile") ? "stroke-[2]" : ""}`} />
            我
          </Link>
        </div>
      </nav>
    </>
  );
}
