"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`relative py-1 text-sm transition-colors ${
        active ? "text-primary" : "text-body hover:text-primary-deep"
      }`}
    >
      {label}
      {active && (
        <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-0.5 w-full rounded-full bg-primary" />
      )}
    </Link>
  );
}
