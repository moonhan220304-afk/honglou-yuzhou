"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "首页", icon: "M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" },
  { href: "/characters", label: "人物", icon: "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM4 21c0-4 3.6-6 8-6s8 2 8 6" },
  { href: "/questions", label: "问题", icon: "M8.5 4a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM21 12.2a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM3 21c0-3.5 2.5-5 5.5-5s5.5 1.5 5.5 5" },
  { href: "/graph", label: "图谱", icon: "M7 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM17 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM7 10h10M7 10v10M17 14V4" },
  { href: "/map", label: "大观园", icon: "M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" },
  { href: "/test", label: "测试", icon: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM12 8a2.5 2.5 0 1 0 0 4M12 15.5v.5" },
  { href: "/community", label: "讨论", icon: "M4 5h16v11H9l-5 4V5Z" },
];

/** 移动端底部导航（仅手机显示，不影响桌面排版） */
export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between">
        {items.map((it) => {
          const active =
            it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={it.icon} />
              </svg>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
