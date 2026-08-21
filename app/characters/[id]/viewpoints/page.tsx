import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCharacter,
  characters,
  viewpointsByCharacter,
  questionsOfCharacter,
} from "@/lib/data";
import { cardPrintClass } from "@/lib/card-print";

export async function generateStaticParams() {
  return Object.keys(characters).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]/viewpoints">): Promise<Metadata> {
  const { id } = await params;
  const c = getCharacter(id);
  return { title: c ? `${c.name} · 红学观点` : "红学观点" };
}

export default async function CharacterViewpointsPage({
  params,
}: PageProps<"/characters/[id]/viewpoints">) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();

  const vps = viewpointsByCharacter[id] ?? [];
  const qs = questionsOfCharacter(id);
  const questionViewpoints = qs.flatMap((q) =>
    q.viewpoints.map((v) => ({ ...v, questionId: q.id, questionTitle: q.title })),
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href={`/characters/${id}`} className="text-xs text-muted hover:text-primary">
        ← 返回{c.name}
      </Link>
      <header className="mt-4">
        <h1 className="font-serif text-3xl font-semibold text-ink">{c.name} · 红学观点</h1>
        <p className="mt-2 text-sm text-muted">
          观点不等于事实。同一问题常有多种说法，这里多观点并存，注明提出者与出处。
        </p>
      </header>

      {vps.length > 0 && (
        <section className="mt-8 space-y-4">
          {vps.map((vp) => (
            <article
              key={vp.id}
              className="rounded-2xl bg-surface card-print card-print--viewpoints p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-base font-semibold text-ink">{vp.title}</h2>
                {vp.type === "disputed" && (
                  <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    有争议
                  </span>
                )}
                {vp.author && (
                  <span className="text-xs text-muted">
                    提出者：{vp.author}
                    {vp.year ? `（${vp.year}）` : ""}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-body">
                {vp.description ?? (vp as { summary?: string }).summary ?? (vp as { argument_body?: string }).argument_body}
              </p>
              {(vp.opinions ?? []).length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {vp.opinions.map((op) => (
                    <div key={op.side} className="rounded-xl bg-paper-deep/50 p-4">
                      <p className="text-xs font-semibold tracking-wide text-gold">{op.side}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-body">{op.content}</p>
                      <p className="mt-2 text-xs text-muted">{op.proponent}</p>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {questionViewpoints.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-3 font-serif text-xl font-semibold text-ink">
            <span className="h-4 w-1 rounded-full bg-primary" />
            来自问题的观点（{questionViewpoints.length} 条）
          </h2>
          <div className="mt-5 space-y-4">
            {questionViewpoints.map((v, i) => (
              <Link
                key={v.id}
                href={`/questions/${v.questionId}`}
                className={`block rounded-2xl bg-surface ${cardPrintClass(i, 4)} p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover`}
              >
                <p className="text-xs text-muted">问题：{v.questionTitle}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-[15px] font-semibold text-ink">{v.title}</h3>
                  <span className="rounded-[4px] bg-paper-deep px-2 py-0.5 text-xs text-muted">
                    置信度 {v.confidence}%
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-body">
                  {v.argument_body}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
