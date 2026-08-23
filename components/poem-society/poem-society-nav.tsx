"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/poem-society", label: "当期诗题" },
  { href: "/poem-society/fill", label: "填字" },
  { href: "/poem-society/feihua", label: "飞花" },
  { href: "/poem-society/gallery", label: "佳作集" },
];

/** 海棠诗社页内导航：诗题 / 填字 / 飞花 / 佳作集 */
export default function PoemSocietyNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap items-center gap-1.5">
      {TABS.map((t) => {
        const active =
          t.href === "/poem-society"
            ? pathname === "/poem-society" || pathname.startsWith("/poem-society/topic") || pathname.startsWith("/poem-society/compose")
            : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              active
                ? "bg-primary font-medium text-paper"
                : "bg-paper-deep text-muted hover:bg-line/50 hover:text-body"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
