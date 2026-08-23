"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchMe, sitePath } from "@/lib/api";
import type { Me } from "@/lib/api";
import WanderButton from "@/components/wander-button";

/** 移动版顶栏（最终定案）：左头像(开抽屉) · 中 logo(回首页) · 右随缘漫游。 */
export default function MHeader({ onOpenDrawer }: { onOpenDrawer: () => void }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState<Me | null | undefined>(undefined);

  useEffect(() => {
    fetchMe().then(setMe);
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled;
  const lightText = transparent ? "border-white/60 text-white" : "border-line text-muted";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-colors duration-300 ${
        transparent ? "bg-gradient-to-b from-black/45 to-transparent" : "border-b border-line bg-paper/95 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-[480px] items-center px-4">
        {/* 左：头像 → 开抽屉 */}
        <button
          type="button"
          onClick={onOpenDrawer}
          aria-label="打开导航菜单"
          aria-haspopup="dialog"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
        >
          {me?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img loading="lazy" src={sitePath(me.avatar)} alt="头像" className="h-8 w-8 rounded-full border border-white/70 object-cover" />
          ) : (
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border font-serif text-sm ${
                transparent ? "border-white/70 bg-white/20 text-white" : "border-line bg-surface text-primary"
              }`}
            >
              {me ? me.username.charAt(0) : "游"}
            </span>
          )}
        </button>

        {/* 中：logo → 回首页 */}
        <Link href="/" className="flex min-h-11 flex-1 items-center justify-center" aria-label="红楼社首页">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`} alt="红楼社" className="h-7 w-auto" />
        </Link>

        {/* 右：随缘漫游 */}
        <WanderButton
          label="随缘漫游"
          className={`flex h-9 shrink-0 items-center rounded-full border px-2.5 text-[11px] ${lightText}`}
        />
      </div>
    </header>
  );
}
