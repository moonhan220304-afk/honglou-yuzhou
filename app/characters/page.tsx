import type { Metadata } from "next";
import { Suspense } from "react";
import { characters } from "@/lib/data";
import CharacterGacha from "@/components/character-gacha";

export const metadata: Metadata = {
  title: "人物志",
  description: "一张一位，左右滑动——探索《红楼梦》中的人物档案。",
};

/** 人物志：先见抽卡式浏览，点「查看全部」进总览（/characters/roster） */
export default function CharactersPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <CharacterGacha characters={Object.values(characters)} />
    </Suspense>
  );
}
