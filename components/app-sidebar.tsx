"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/user-menu";
import WanderButton from "@/components/wander-button";
import {
  IconHome,
  IconBook,
  IconGame,
  IconChat,
  IconQuestion,
  IconQuill,
  IconUser,
} from "@/components/icons";

/**
 * 第二阶段：左侧常驻导航（社交/内容社区布局）。
 * 桌面端固定左侧栏：LOGO + 五个频道（海棠诗社含子导航）+ 底部用户区。
 * 移动端不渲染（移动版用底部导航），由 layout 控制。
 */
const navSections = [
  {
    href: "/",
    label: "首页",
    icon: IconHome,
    match: (p: string) => p === "/",
  },
  {
    href: "/characters",
    label: "涨知识",
    icon: IconBook,
    match: (p: string) => p.startsWith("/characters") || p.startsWith("/graph") || p.startsWith("/map") || p.startsWith("/journey") || p.startsWith("/poems"),
    children: [
      { href: "/characters", label: "人物志", exact: true },
      { href: "/graph", label: "关系图谱" },
      { href: "/map", label: "大观园" },
      { href: "/journey", label: "剧情旅程" },
      { href: "/poems", label: "诗词" },
    ],
  },
  {
    href: "/test",
    label: "找乐子",
    icon: IconGame,
    match: (p: string) => p.startsWith("/test"),
  },
  {
    href: "/community",
    label: "聊一聊",
    icon: IconChat,
    match: (p: string) => p.startsWith("/community"),
  },
  {
    href: "/questions",
    label: "问一问",
    icon: IconQuestion,
    match: (p: string) => p.startsWith("/questions"),
  },
  {
    href: "/poem-society",
    label: "海棠诗社",
    icon: IconQuill,
    match: (p: string) => p.startsWith("/poem-society"),
    children: [
      { href: "/poem-society", label: "诗题", exact: true },
      { href: "/poem-society/fill", label: "诗词填字" },
      { href: "/poem-society/feihua", label: "飞花接句" },
      { href: "/poem-society/gallery", label: "佳作集" },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[232px] flex-col border-r border-line bg-paper-deep/95 backdrop-blur md:flex">
      <Link href="/" className="flex items-center px-6 pb-4 pt-5">
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`}
          alt="红楼社"
          className="h-9 w-auto"
        />
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {navSections.map((sec) => {
          const Icon = sec.icon;
          const active = sec.match(pathname);
          const childActive = sec.children?.some((c) =>
            c.exact ? pathname === c.href : pathname.startsWith(c.href),
          );
          return (
            <div key={sec.href}>
              <Link
                href={sec.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink/80 hover:bg-surface hover:text-primary"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="font-serif font-medium">{sec.label}</span>
              </Link>
              {sec.children && (active || childActive) && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-line pl-2.5">
                  {sec.children.map((c) => {
                    const on = c.exact ? pathname === c.href : pathname.startsWith(c.href);
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`block rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                          on ? "bg-surface text-primary shadow-sm" : "text-body hover:text-primary"
                        }`}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line px-3 py-3">
        <WanderButton className="mb-2 hidden w-full rounded-full border border-gold/60 bg-surface/60 px-3 py-1.5 text-center font-serif text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary md:block" />
        <UserMenu />
      </div>
    </aside>
  );
}
