import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { events, getEvent, characterName, chapterLabel } from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";
import FeedbackButton from "@/components/feedback-button";

const typeLabel: Record<string, string> = {
  literary: "文学解读",
  character: "性格解读",
  hongxue: "红学观点",
  structure: "结构解读",
  theme: "主题解读",
};

export async function generateStaticParams() {
  return Object.keys(events).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/events/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ev = getEvent(id);
  return {
    title: ev ? ev.title : "事件未找到",
    description: ev?.summary.short,
  };
}

export default async function EventPage({ params }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const ev = getEvent(id);
  if (!ev) notFound();

  const sorted = Object.values(events).sort(
    (a, b) => a.chapter.number - b.chapter.number || a.id.localeCompare(b.id),
  );
  const idx = sorted.findIndex((e) => e.id === id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/characters" className="text-xs text-muted hover:text-primary">
        ← 返回人物宇宙
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-[4px] px-2 py-0.5 text-xs ${
              ev.event_level === "major"
                ? "bg-primary/10 text-primary"
                : ev.event_level === "minor"
                  ? "bg-gold/15 text-secondary-btn-text"
                  : "bg-paper-deep text-muted"
            }`}
          >
            {ev.event_level === "major"
              ? "关键事件"
              : ev.event_level === "minor"
                ? "一般事件"
                : "微事件"}
          </span>
          <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
            {chapterLabel(ev.chapter.number)} · {ev.chapter.title}
          </span>
          {ev.chapter.attribution === "gaoe" && (
            <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
              后四十回续书
            </span>
          )}
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-ink">{ev.title}</h1>
        <p className="mt-3 max-w-2xl font-serif text-[15px] leading-loose text-body">
          {ev.summary.short}
        </p>
        <div className="mt-4">
          <FeedbackButton type="event" refId={ev.id} title={ev.title} />
        </div>
      </header>

      {ev.summary.meaning.length > 0 && (
        <section className="mt-8 rounded-2xl bg-surface card-print card-print--timeline p-6">
          <p className="text-xs font-semibold tracking-wide text-gold">事件意义</p>
          <ul className="mt-3 space-y-2">
            {ev.summary.meaning.map((m) => (
              <li key={m} className="flex gap-2 text-sm leading-relaxed text-body">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ev.interpretations.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            深度解读
          </h2>
          <div className="mt-5 space-y-4">
            {ev.interpretations.map((it) => (
              <div
                key={it.title}
                className="rounded-2xl bg-surface card-print card-print--relations p-6"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    {typeLabel[it.type] ?? "深度解读"}
                  </span>
                  <h3 className="font-serif text-base font-semibold text-ink">{it.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-body">{it.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {ev.evidence.length > 0 && (
        <section className="mt-8 rounded-2xl border-l-2 border-gold/70 bg-paper p-6">
          <p className="text-xs font-semibold tracking-wide text-gold">原文依据</p>
          <blockquote className="mt-3 font-serif text-[15px] leading-loose text-ink/85">
            “{ev.evidence[0].quote}”
          </blockquote>
          <p className="mt-3 text-xs text-muted">{ev.evidence[0].note}</p>
        </section>
      )}

      <section className="mt-8">
        <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
          <span className="h-4 w-1 rounded-full bg-primary" />
          参与者
        </h2>
        <div className="mt-5 flex flex-wrap gap-5">
          {ev.participants.map((p) => (
            <Link
              key={p.character_id}
              href={`/characters/${p.character_id}`}
              className="group flex w-24 flex-col items-center gap-2 text-center"
            >
              <CharacterAvatar
                characterId={p.character_id}
                name={characterName(p.character_id)}
                className="h-16 w-16 transition-transform group-hover:scale-105"
              />
              <div>
                <p className="text-sm font-medium text-ink group-hover:text-primary">
                  {characterName(p.character_id)}
                </p>
                <p className="text-xs text-muted">{p.role}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {ev.related_events.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            从这里，故事继续
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {ev.related_events.map((rid) => {
              const re = getEvent(rid);
              if (!re) return null;
              return (
                <Link
                  key={rid}
                  href={`/events/${rid}`}
                  className="group rounded-2xl bg-surface card-print card-print--viewpoints p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
                      {chapterLabel(re.chapter.number)}
                    </span>
                    {re.chapter.attribution === "gaoe" && (
                      <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        续书
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-serif text-[15px] font-semibold text-ink group-hover:text-primary">
                    {re.title}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
                    {re.summary.short}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <nav className="mt-12 flex items-center justify-between border-t border-line-inner pt-6">
        {prev ? (
          <Link href={`/events/${prev.id}`} className="max-w-[45%] group">
            <p className="text-xs text-muted">← 上一个事件</p>
            <p className="mt-1 truncate font-serif text-sm font-semibold text-ink group-hover:text-primary">
              {prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/events/${next.id}`} className="max-w-[45%] text-right group">
            <p className="text-xs text-muted">下一个事件 →</p>
            <p className="mt-1 truncate font-serif text-sm font-semibold text-ink group-hover:text-primary">
              {next.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
