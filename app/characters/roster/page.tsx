import type { Metadata } from "next";
import { Suspense } from "react";
import { characters } from "@/lib/data";
import CharactersExplorer from "@/components/search/characters-explorer";
import SectionHero from "@/components/section-hero";

export const metadata: Metadata = {
  title: "人物志 · 总览",
  description: "《红楼梦》人物档案总览：身份、性格、时间线与命运轨迹。",
};

/** 人物志总览（原 /characters 页面），由抽卡页「查看全部」进入 */
export default function CharactersRosterPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHero
        sector="characters"
        eyebrow="CHARACTERS · ROSTER"
        title="人物宇宙 · 总览"
        description={`已收录 ${Object.values(characters).length} 位人物：金陵十二钗完整深度档案 + 核心人物研究档案。每个人物均含身份信息、性格分析、事件时间线（带深度解读与原文依据）与相关关系，所有内容可逐条溯源。`}
      />

      <Suspense fallback={<div className="mt-12 min-h-[40vh]" />}>
        <CharactersExplorer characters={characters} />
      </Suspense>
    </div>
  );
}
