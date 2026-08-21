import HomePage from "@/components/home-page";
import MHome from "@/components/mobile/m-home";
import { IS_MOBILE_BUILD } from "@/lib/mobile-build";

/** 首页：沉浸式首屏（开机动画）→ 点击进入内容首页（今日热议 + 右栏） */
export default function Home() {
  if (IS_MOBILE_BUILD) return <MHome />;
  return <HomePage />;
}
