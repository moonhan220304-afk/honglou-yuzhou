import type { Metadata } from "next";
import { Suspense } from "react";
import { questions } from "@/lib/data";
import QuestionsExplorer from "@/components/search/questions-explorer";

export const metadata: Metadata = {
  title: "问题中心",
  description: "五十个红学之问：以问题为入口，在原文证据与多元观点之间找到你自己的答案。",
};

export default function QuestionsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">QUESTIONS</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">问题中心</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          每一个问题都不止一个答案。这里呈现中立概述、多方观点与原文证据——你的判断，才是最终的答案。
        </p>
      </header>

      <Suspense fallback={<div className="mt-8 min-h-[40vh]" />}>
        <QuestionsExplorer questions={questions} />
      </Suspense>
    </div>
  );
}
