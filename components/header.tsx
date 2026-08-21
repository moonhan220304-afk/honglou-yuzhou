import Link from "next/link";
import NavLink from "@/components/nav-link";
import WanderButton from "@/components/wander-button";
import UserMenu from "@/components/user-menu";
import HeaderSearch from "@/components/header-search";

const navItems = [
  { href: "/characters", label: "人物" },
  { href: "/questions", label: "问题" },
  { href: "/graph", label: "关系图谱" },
  { href: "/test", label: "人格测试" },
  { href: "/community", label: "社区讨论" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/logo-universal.png`}
            alt="红楼社"
            className="h-9 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <WanderButton className="hidden rounded-full border border-gold/60 bg-surface/60 px-4 py-1.5 font-serif text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary md:inline-block" />
          <HeaderSearch />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
