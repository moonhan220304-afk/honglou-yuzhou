import type { Metadata } from "next";
import { Suspense } from "react";
import { characters } from "@/lib/data";
import CharactersExplorer from "@/components/search/characters-explorer";

export const metadata: Metadata = {
  title: "人物宇宙",
  description: "探索《红楼梦》中的人物档案：身份、性格、时间线与命运轨迹。",
};

export default function CharactersPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">CHARACTERS</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">人物宇宙</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          已收录 {Object.values(characters).length} 位人物：金陵十二钗完整深度档案 + 核心人物研究档案。
          每个人物均含身份信息、性格分析、事件时间线（带深度解读与原文依据）与相关关系，所有内容可逐条溯源。
        </p>
      </header>

      <Suspense fallback={<div className="mt-12 min-h-[40vh]" />}>
        <CharactersExplorer characters={characters} />
      </Suspense>
    </div>
  );
}
