import type { Metadata } from "next";
import TestFlow from "@/components/test-flow";
import TestStatsBoard from "@/components/test-stats-board";
import SectionHero from "@/components/section-hero";

export const metadata: Metadata = {
  title: "红楼人格测试",
  description: "二十四问见性情——测测你更像《红楼梦》里的谁。",
};

export default function TestPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <SectionHero
        sector="primary"
        eyebrow="PERSONALITY TEST"
        title="红楼人格测试"
        description="二十四道情境题，测一测你的性情更接近红楼中的哪一位。本测试仅作趣味参考，人物解读皆以原文为依据。"
      />
      <div className="mt-8">
        <TestStatsBoard />
      </div>
      <div className="mt-10">
        <TestFlow />
      </div>
    </div>
  );
}
