import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { locations, getLocation, getCharacter, getEvent, chapterLabel, questionsOfCharacter } from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";

export async function generateStaticParams() {
  return locations.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/map/[id]">): Promise<Metadata> {
  const { id } = await params;
  const l = getLocation(id);
  return { title: l ? l.name : "地点", description: l?.short_intro };
}

export default async function LocationPage({ params }: PageProps<"/map/[id]">) {
  const { id } = await params;
  const l = getLocation(id);
  if (!l) notFound();

  const residents = (l.resident_character_ids ?? []).map(getCharacter).filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/map" className="text-xs text-muted hover:text-primary">
        ← 返回大观园地图
      </Link>

      <header className="mt-6">
        <p className="text-xs tracking-[0.3em] text-gold">DAGUANYUAN · PLACE</p>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink">{l.name}</h1>
        <p className="mt-4 max-w-2xl font-serif text-[15px] leading-loose text-body">
          {l.short_intro}
        </p>
        {l.symbolic_meaning && (
          <p className="mt-4 rounded-xl bg-paper-deep/60 p-4 text-sm leading-relaxed text-body">
            <span className="font-semibold text-gold">象征意义 · </span>
            {l.symbolic_meaning}
          </p>
        )}
      </header>

      {residents.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            谁住在这里
          </h2>
          <div className="mt-5 flex flex-wrap gap-5">
            {residents.map((c) => (
              <Link
                key={c!.id}
                href={`/characters/${c!.id}`}
                className="group flex w-24 flex-col items-center gap-2 text-center"
              >
                <CharacterAvatar
                  characterId={c!.id}
                  name={c!.name}
                  className="h-16 w-16 transition-transform group-hover:scale-105"
                />
                <span className="text-sm font-medium text-ink group-hover:text-primary">
                  {c!.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {l.key_events?.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            这里发生过什么
          </h2>
          <div className="mt-5 space-y-3">
            {l.key_events.map((eid) => {
              const ev = getEvent(eid);
              if (!ev) return null;
              return (
                <Link
                  key={eid}
                  href={`/events/${eid}`}
                  className="group flex items-baseline gap-3 rounded-2xl bg-surface card-print card-print--identity p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover"
                >
                  <span className="shrink-0 rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
                    {chapterLabel(ev.chapter.number)}
                  </span>
                  <span className="font-serif text-base font-semibold text-ink group-hover:text-primary">
                    {ev.title}
                  </span>
                  <span className="hidden flex-1 truncate text-right text-xs text-muted sm:block">
                    {ev.summary.short}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {residents.length > 0 && (() => {
        const qs = residents.flatMap((c) => questionsOfCharacter(c!.id)).slice(0, 3);
        if (qs.length === 0) return null;
        return (
          <section className="mt-10">
            <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
              <span className="h-4 w-1 rounded-full bg-primary" />
              关于这里的问题
            </h2>
            <div className="mt-5 space-y-3">
              {qs.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="block rounded-2xl bg-surface card-print card-print--timeline p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover"
                >
                  <p className="font-serif text-[15px] font-semibold text-ink">{q.title}</p>
                  <p className="mt-1 text-xs text-muted">
                    {q.viewpoints.length} 种观点 · 热度 {q.heat_weight}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}
