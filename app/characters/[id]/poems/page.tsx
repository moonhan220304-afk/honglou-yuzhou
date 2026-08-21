import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter, characters, poemsOfCharacter, chapterLabel } from "@/lib/data";
import FeedbackButton from "@/components/feedback-button";

export async function generateStaticParams() {
  return Object.keys(characters).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]/poems">): Promise<Metadata> {
  const { id } = await params;
  const c = getCharacter(id);
  return { title: c ? `${c.name} · 诗词` : "诗词" };
}

export default async function CharacterPoemsPage({
  params,
}: PageProps<"/characters/[id]/poems">) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();

  const poems = poemsOfCharacter(id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href={`/characters/${id}`} className="text-xs text-muted hover:text-primary">
        ← 返回{c.name}
      </Link>
      <header className="mt-4">
        <h1 className="font-serif text-3xl font-semibold text-ink">{c.name} · 诗词</h1>
        <p className="mt-2 text-sm text-muted">
          诗是人物心灵的直接出口。每首均标注创作章回与解读。
        </p>
      </header>

      <div className="mt-8 space-y-5">
        {poems.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl bg-surface card-print card-print--viewpoints p-6"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink">{p.title}</h2>
              <span className="text-xs text-muted">
                {p.chapter_id ? chapterLabel(p.chapter_id) : ""} · {p.work_type}
              </span>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              {p.quote_short ? (
                <div className="flex-1 border-l-2 border-gold/60 pl-5">
                  <p className="whitespace-pre-line font-serif text-[15px] leading-loose text-ink/90">
                    {p.quote_short}
                  </p>
                </div>
              ) : (
                <div className="flex-1" />
              )}
              <FeedbackButton type="poem" refId={p.id} title={p.title} className="shrink-0" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-body">{p.summary}</p>
            {p.symbolic_notes && (
              <p className="mt-3 rounded-xl bg-paper-deep/60 p-3 text-xs leading-relaxed text-muted">
                {p.symbolic_notes}
              </p>
            )}
          </article>
        ))}
        {poems.length === 0 && <p className="text-sm text-muted">诗词整理中……</p>}
      </div>
    </div>
  );
}
