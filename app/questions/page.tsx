import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { questions, characters, characterName } from "@/lib/data";
import QuestionsExplorer from "@/components/search/questions-explorer";
import { IconFlame, IconUser } from "@/components/icons";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "问题中心",
  description: "五十个红学之问：以问题为入口，在原文证据与多元观点之间找到你自己的答案。",
};

const HOT_CHARACTERS = [
  "character_lin_daiyu",
  "character_jia_baoyu",
  "character_xue_baochai",
  "character_wang_xifeng",
  "character_jia_tanchun",
  "character_shi_xiangyun",
];

export default function QuestionsPage() {
  const hotQuestions = [...questions].sort((a, b) => (b.heat_weight ?? 0) - (a.heat_weight ?? 0)).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold">QUESTIONS</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">问一问</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
            每一个问题都不止一个答案。看看大家为哪些问题争得热闹——你的判断，才是最终的答案。
          </p>
        </div>
        <Link
          href={`${base}/questions/ask`}
          className="rounded-full bg-primary px-5 py-2.5 font-serif text-sm text-white shadow-sm transition-colors hover:bg-primary-deep"
        >
          ＋ 我要提问
        </Link>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_280px]">
        <div>
          <Suspense fallback={<div className="mt-8 min-h-[40vh]" />}>
            <QuestionsExplorer questions={questions} />
          </Suspense>
        </div>

        {/* 右侧栏：本周热门 + 热门人物 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            <div className="card-print rounded-2xl bg-surface p-5">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
                <IconFlame className="h-4 w-4 text-gold" />
                本周最热问题
              </h3>
              <ol className="mt-3 space-y-2.5">
                {hotQuestions.map((q, i) => (
                  <li key={q.id} className="flex gap-2.5 text-sm">
                    <span className="w-4 shrink-0 font-serif text-gold">{i + 1}</span>
                    <Link href={`/questions/${q.id}`} className="line-clamp-2 text-body transition-colors hover:text-primary">
                      {q.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </div>

            <div className="card-print card-print--identity rounded-2xl bg-surface p-5">
              <h3 className="flex items-center gap-2 font-serif text-base font-semibold text-ink">
                <IconUser className="h-4 w-4 text-gold" />
                大家都爱问 TA
              </h3>
              <div className="mt-3 space-y-2">
                {HOT_CHARACTERS.map((cid) => (
                  <Link
                    key={cid}
                    href={`/characters/${cid}`}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-body transition-colors hover:bg-paper-deep/60 hover:text-primary"
                  >
                    <span className="font-serif">{characterName(cid)}</span>
                    <span className="text-xs text-muted">
                      {(characters[cid] as { related_characters?: unknown[] } | undefined)?.related_characters?.length ??
                        questions.filter((q) => (q.related_character_ids ?? []).includes(cid)).length}
                      {" "}问
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
