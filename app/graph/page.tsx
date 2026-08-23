import type { Metadata } from "next";
import RelationGarden from "@/components/relation-garden";
import SectionHero from "@/components/section-hero";

export const metadata: Metadata = {
  title: "关系图谱",
  description:
    "漫天星辰皆是故人——悬停星星穿梭进入，点选星星在右侧展开人物小档案。",
};

export default function GraphPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <SectionHero
        sector="characters"
        eyebrow="RELATIONSHIP GARDEN"
        title="关系图谱"
        description="漫天星辰，皆是故人。悬停一颗星，星光照亮 TA 的全部星缘，仿佛穿梭进入它的世界；点选一颗星，右侧展开 TA 的小档案。关系不是一条线，是一条有证据的轨迹。"
      />
      <div className="mt-8">
        <RelationGarden />
      </div>
    </div>
  );
}
