"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/user-menu";

const navItems = [
  { href: "/characters", label: "人物" },
  { href: "/questions", label: "问题" },
  { href: "/graph", label: "图谱" },
  { href: "/map", label: "大观园" },
  { href: "/test", label: "测试" },
];

/** 移动版顶栏：首页悬浮透明（沉浸全景），其他页面纸色 */
export default function MHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-gradient-to-b from-black/45 to-transparent"
          : "border-b border-line bg-paper/95 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between px-4">
        <Link href="/" className="flex items-center rounded-xl">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`}
            alt="红楼社"
            className="h-8 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3.5">
            {navItems.map((it) => {
              const active =
                it.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(it.href);
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={`text-[13px] ${
                    transparent
                      ? "text-white/90 drop-shadow"
                      : active
                        ? "font-semibold text-primary"
                        : "text-body"
                  }`}
                >
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
