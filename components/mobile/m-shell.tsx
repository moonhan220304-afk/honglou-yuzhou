"use client";

import { useState } from "react";
import MHeader from "@/components/mobile/m-header";
import MDrawer from "@/components/mobile/m-drawer";
import MobileNav from "@/components/mobile-nav";

/** 移动版外壳：统一管理左抽屉开合状态，包住顶栏 + 主内容 + 抽屉 + 底部导航。 */
export default function MShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <MHeader onOpenDrawer={() => setDrawerOpen(true)} />
      <main className="flex-1 pb-16 pt-[calc(env(safe-area-inset-top)+56px)]">{children}</main>
      <MDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <MobileNav />
    </>
  );
}
