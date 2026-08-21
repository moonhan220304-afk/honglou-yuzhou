import type { Metadata } from "next";
import Link from "next/link";
import { journeys } from "@/lib/journeys";
import { getCharacter } from "@/lib/data";

export const metadata: Metadata = {
  title: "探索路线",
  description: "沿着《红楼梦》的叙事线索逐站前行：宝黛情缘、凤姐的权与劫、抄检之夜、十二钗的命运。",
};

export default function JourneyPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">      <header>
        <p className="text-xs tracking-[0.3em] text-gold">JOURNEYS</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">探索路线</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          不知道从哪里开始？选一条路线，跟着故事本身往前走。
          每一站都有深度解读与原文依据，走完一条路线，你会看见一条完整的命运轨迹。
        </p>
      </header>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {journeys.map((j) => {
          const cover = j.cover_character_id ? getCharacter(j.cover_character_id) : null;
          return (
            <Link
              key={j.id}
              href={`/journey/${j.id}`}
              className="group relative overflow-hidden rounded-3xl bg-surface card-print card-print--timeline p-7 transition-all hover:-translate-y-1 hover:shadow-hover"
            >
              <div className="pointer-events-none absolute -right-6 -top-8 font-serif text-[8rem] leading-none text-primary/[0.05] transition-transform duration-500 group-hover:-translate-y-2">
                {j.title.charAt(0)}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs tracking-[0.25em] text-gold">{j.tagline}</span>
                {cover && (
                  <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    主角：{cover.name}
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-ink group-hover:text-primary">
                {j.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-body">{j.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted">共 {j.stations.length} 站 ·</span>
                {j.stations.slice(0, 4).map((s, i) => (
                  <span
                    key={s.event_id}
                    className="rounded-[4px] bg-paper-deep px-2 py-0.5 text-xs text-muted"
                  >
                    {(() => {
                      const m = s.event_id.match(/ch(\d+)/);
                      return m ? `${m[1]}回` : `第${i + 1}站`;
                    })()}
                  </span>
                ))}
                {j.stations.length > 4 && (
                  <span className="text-xs text-muted">…</span>
                )}
              </div>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary">
                踏上这条路
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 rounded-3xl border border-dashed border-gold/50 bg-surface-warm p-8 text-center">
        <p className="font-serif text-lg text-secondary-btn-text">不想按顺序走？</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
          红楼没有唯一的入口——从任何一个人物、任何一个事件开始，都通向同一个世界。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href="/characters"
            className="rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0]"
          >
            从人物开始
          </Link>
          <Link
            href="/graph"
            className="rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0]"
          >
            从关系开始
          </Link>
        </div>
      </div>
    </div>
  );
}
