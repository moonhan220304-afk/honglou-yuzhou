"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LogoMark from "@/components/logo-mark";
import WanderButton from "@/components/wander-button";

const navItems = [
  { href: "/characters", label: "人物宇宙" },
  { href: "/graph", label: "关系图谱" },
  { href: "/journey", label: "探索路线" },
  { href: "/test", label: "人格测试" },
];

/**
 * 首页悬浮导航：滚动超过阈值后以玻璃药丸形态浮现，
 * 不占满整条，融入画面。
 */
export default function GlassNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-4 z-50 flex justify-center px-4 transition-all duration-700 ease-out ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-20 opacity-0"
      }`}
    >
      <nav className="flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:gap-3 sm:px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full bg-white/15 py-1 pl-1.5 pr-3 transition-colors hover:bg-white/25"
        >
          <LogoMark tone="light" className="h-7 w-7" />
          <span className="font-serif text-sm font-semibold tracking-wide text-white drop-shadow">
            红楼宇宙
          </span>
        </Link>
        <div className="hidden items-center gap-5 md:flex md:pl-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm text-white/85 transition-colors duration-300 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2 sm:pl-2">
          <WanderButton className="hidden rounded-full bg-white/15 px-3.5 py-1.5 font-serif text-xs text-white backdrop-blur transition-colors hover:bg-white/25 lg:inline-block" />
          <Link
            href="/journey"
            className="whitespace-nowrap rounded-full bg-white px-4 py-1.5 font-serif text-xs font-medium text-ink shadow transition-colors duration-300 hover:bg-white/85"
          >
            开始探索
          </Link>
        </div>
      </nav>
    </div>
  );
}
