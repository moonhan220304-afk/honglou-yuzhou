"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "@/components/user-menu";
import { IconGame } from "@/components/icons";

/** 移动版顶栏（第二阶段）：logo + 找乐子快捷入口 + 用户。频道导航在底部 MobileNav */
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
        <Link href="/" className="flex items-center rounded-xl" aria-label="红楼社首页">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`} alt="红楼社" className="h-7 w-auto" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/test"
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
              transparent
                ? "border-white/40 text-white"
                : "border-line bg-surface text-body hover:text-primary"
            }`}
          >
            <IconGame className="h-3.5 w-3.5" />
            找乐子
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
