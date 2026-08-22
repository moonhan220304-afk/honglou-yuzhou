import type { Metadata } from "next";
import JourneyMap from "@/components/journey-map";

export const metadata: Metadata = {
  title: "剧情 · 探索",
  description: "以一张探索逻辑图走进《红楼梦》：四条人物路线、各自覆盖的回次范围，选一条路跟着故事走下去。",
};

/** 剧情：探索逻辑图（中心发散到四条人物路线，含回次范围与站点预览） */
export default function JourneyPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">STORY</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">剧情 · 探索</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          从人物、时间到章回——每条路线都是一条完整的命运轨迹。鼠标悬停可预览沿途站点，点击进入跟着故事走。
        </p>
      </header>

      <JourneyMap />
    </div>
  );
}
