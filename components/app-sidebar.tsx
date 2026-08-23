"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/user-menu";
import WanderButton from "@/components/wander-button";
import LogoMark from "@/components/logo-mark";
import {
  IconHome,
  IconCharacters,
  IconGame,
  IconChatRoll,
  IconAsk,
  IconPoem,
  IconUser,
  IconArrowLeft,
  IconArrowRight,
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
    icon: IconCharacters,
    match: (p: string) => p.startsWith("/characters") || p.startsWith("/graph") || p.startsWith("/map") || p.startsWith("/journey") || p.startsWith("/poems"),
    children: [
      { href: "/characters", label: "人物志", match: (p: string) => p.startsWith("/characters") },
      { href: "/graph", label: "关系图谱", match: (p: string) => p.startsWith("/graph") },
      { href: "/map", label: "大观园", match: (p: string) => p.startsWith("/map") },
      { href: "/journey", label: "剧情旅程", match: (p: string) => p.startsWith("/journey") },
      { href: "/poems", label: "诗词", match: (p: string) => p.startsWith("/poems") },
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
    icon: IconChatRoll,
    match: (p: string) => p.startsWith("/community"),
  },
  {
    href: "/questions",
    label: "问一问",
    icon: IconAsk,
    match: (p: string) => p.startsWith("/questions"),
  },
  {
    href: "/poem-society",
    label: "海棠诗社",
    icon: IconPoem,
    match: (p: string) => p.startsWith("/poem-society"),
    children: [
      { href: "/poem-society", label: "诗题", match: (p: string) => p === "/poem-society" || p.startsWith("/poem-society/topic") || p.startsWith("/poem-society/compose") },
      { href: "/poem-society/fill", label: "诗词填字", match: (p: string) => p.startsWith("/poem-society/fill") },
      { href: "/poem-society/feihua", label: "飞花接句", match: (p: string) => p.startsWith("/poem-society/feihua") },
      { href: "/poem-society/gallery", label: "佳作集", match: (p: string) => p.startsWith("/poem-society/gallery") },
    ],
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [tourExpanded, setTourExpanded] = useState(false);
  // trailingSlash 导出下 usePathname 带尾斜杠（如 /poem-society/），统一去掉再匹配
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const expanded = tourExpanded || hovered;

  // 新手引导（桌面）期间强制展开，让图标+文字都可见、高亮框对准
  useEffect(() => {
    const onTour = () => setTourExpanded(document.body.classList.contains("tour-expanded"));
    onTour();
    const obs = new MutationObserver(onTour);
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  // 悬停展开 / 移开收回：同步 --hlm-sidebar-w，主内容留白跟随
  useEffect(() => {
    document.documentElement.style.setProperty("--hlm-sidebar-w", expanded ? "232px" : "56px");
    return () => {
      document.documentElement.style.removeProperty("--hlm-sidebar-w");
    };
  }, [expanded]);

  return (
    <aside
      className="fixed inset-y-0 left-0 z-[60] hidden flex-col overflow-hidden border-r border-line bg-paper-deep/95 backdrop-blur transition-[width] duration-200 md:flex"
      style={{ width: expanded ? 232 : 56 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href="/" className="flex items-center px-4 pb-4 pt-5" aria-label="红楼社首页">
        {expanded ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`} alt="红楼社" className="h-9 w-auto" />
        ) : (
          <LogoMark className="h-9 w-9" />
        )}
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 md:px-3">
        {navSections.map((sec) => {
          const Icon = sec.icon;
          const active = sec.match(path);
          const childActive = sec.children?.some((c) => c.match(path));
          return (
            <div key={sec.href}>
              <Link
                href={sec.href}
                title={expanded ? undefined : sec.label}
                className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${
                  expanded ? "justify-start" : "justify-center"
                } ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink/80 hover:bg-surface hover:text-primary"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span className="font-serif font-medium">{sec.label}</span>}
              </Link>
              {expanded && sec.children && (active || childActive) && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-line pl-2.5">
                  {sec.children.map((c) => {
                    const on = c.match(path);
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

      <div className="border-t border-line px-2 py-3 md:px-3">
        {expanded ? (
          <>
            <WanderButton className="mb-2 hidden w-full rounded-full border border-gold/60 bg-surface/60 px-3 py-1.5 text-center font-serif text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary md:block" />
            <UserMenu alignUp />
          </>
        ) : (
          <div className="flex justify-center">
            <Link
              href="/profile"
              aria-label="个人中心"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-primary"
            >
              <IconUser className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
