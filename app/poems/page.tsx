import type { Metadata } from "next";
import Link from "next/link";
import { kbPoems, characterName, chapterLabel } from "@/lib/data";
import PoemRotator from "@/components/poem-rotator";
import SectionHero from "@/components/section-hero";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "诗词",
  description: "红楼诗词：咏物、抒怀、判词——一诗一世界。",
};

export default function PoemsPage() {
  const poems = [...kbPoems].sort((a, b) => (b.chapter_id ?? 0) - (a.chapter_id ?? 0));

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <SectionHero
        sector="characters"
        eyebrow="POEMS"
        title="诗词"
        description="海棠诗社之外，还有这些书中的诗词歌赋——每日一首，细品其中滋味。"
      />

      <div className="card-print card-print--timeline mt-8 rounded-2xl bg-surface p-6">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          每日一诗
        </h2>
        <div className="mt-4">
          <PoemRotator />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          全部诗词（{poems.length} 首）
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {poems.map((p) => (
            <div key={p.id} className="card-print card-print--viewpoints rounded-2xl bg-surface p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-base font-semibold text-ink">{p.title}</h3>
                <span className="shrink-0 text-xs text-muted">
                  {p.author_character_id ? characterName(p.author_character_id) : "佚名"}
                </span>
              </div>
              {p.quote_short && (
                <p className="mt-2.5 font-serif text-sm leading-loose text-body">「{p.quote_short}」</p>
              )}
              {p.summary && <p className="mt-2 text-xs leading-relaxed text-muted">{p.summary}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
                <span className="rounded-full bg-paper-deep/70 px-2 py-0.5">{p.work_type || "诗词"}</span>
                {p.chapter_id != null && <span>第 {chapterLabel(p.chapter_id)} 回</span>}
                {p.symbolic_notes && <span className="text-gold">· {p.symbolic_notes.slice(0, 18)}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        想自己写一首？去
        <Link href={`${base}/poem-society`} className="mx-1 text-primary hover:underline">
          海棠诗社
        </Link>
        看看当期诗题
      </p>
    </div>
  );
}
