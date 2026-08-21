import WanderButton from "@/components/wander-button";
import UserMenu from "@/components/user-menu";
import HeaderSearch from "@/components/header-search";

/**
 * 第二阶段：顶部改为细工具条（搜索 + 用户 + 漫游）。
 * 频道导航已移至左侧常驻导航（AppSidebar），这里不再放入口。
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/60 bg-paper/85 backdrop-blur md:pl-[232px]">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-end gap-3 px-4 md:px-6">
        <WanderButton className="hidden rounded-full border border-gold/60 bg-surface/60 px-4 py-1.5 font-serif text-xs text-secondary-btn-text transition-colors hover:border-gold hover:text-primary md:inline-block" />
        <HeaderSearch />
        <UserMenu />
      </div>
    </header>
  );
}
