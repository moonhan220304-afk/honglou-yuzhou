"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** 第二阶段：移动端底部导航（首页 / 涨知识 / 聊一聊 / 问一问 / 海棠诗社 / 我的） */
const items = [
  { href: "/", label: "首页", icon: "🏠" },
  { href: "/characters", label: "涨知识", icon: "📖" },
  { href: "/community", label: "聊一聊", icon: "💬" },
  { href: "/questions", label: "问一问", icon: "❓" },
  { href: "/poem-society", label: "诗社", icon: "🖋️" },
  { href: "/profile", label: "我的", icon: "👤" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const activeOf = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between">
        {items.map((it) => {
          const active = activeOf(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <span className="text-[17px] leading-none">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
