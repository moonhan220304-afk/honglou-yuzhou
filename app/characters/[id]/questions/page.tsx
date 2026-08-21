import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter, characters, questionsOfCharacter } from "@/lib/data";
import { cardPrintClass } from "@/lib/card-print";

export async function generateStaticParams() {
  return Object.keys(characters).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]/questions">): Promise<Metadata> {
  const { id } = await params;
  const c = getCharacter(id);
  return { title: c ? `关于${c.name}的问题` : "问题" };
}

export default async function CharacterQuestionsPage({
  params,
}: PageProps<"/characters/[id]/questions">) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();

  const qs = questionsOfCharacter(id);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href={`/characters/${id}`} className="text-xs text-muted hover:text-primary">
        ← 返回{c.name}
      </Link>
      <header className="mt-4">
        <h1 className="font-serif text-3xl font-semibold text-ink">关于{c.name}的问题</h1>
        <p className="mt-2 text-sm text-muted">
          {qs.length} 个问题，{qs.reduce((s, q) => s + q.viewpoints.length, 0)} 种观点。
          没有标准答案，只有证据与论述。
        </p>
      </header>

      <div className="mt-8 space-y-4">
        {qs.map((q, i) => (
          <Link
            key={q.id}
            href={`/questions/${q.id}`}
            className={`group block rounded-2xl bg-surface ${cardPrintClass(i, 4)} p-6 transition-all hover:-translate-y-0.5 hover:shadow-hover`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-semibold text-ink group-hover:text-primary">
                {q.title}
              </h2>
              <span className="rounded-full bg-paper-deep px-2.5 py-0.5 text-xs text-muted">
                热度 {q.heat_weight}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{q.short_summary}</p>
            <p className="mt-3 text-xs text-gold">
              {q.viewpoints.length} 种观点 · {q.evidence.length} 条原文证据
            </p>
          </Link>
        ))}
        {qs.length === 0 && <p className="text-sm text-muted">问题整理中……</p>}
      </div>
    </div>
  );
}
