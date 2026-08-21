import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { questions } from "@/lib/data";
import FeedbackButton from "@/components/feedback-button";
import QuestionBody from "@/components/community/question-body";

export async function generateStaticParams() {
  return questions.map((q) => ({ id: q.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/questions/[id]">): Promise<Metadata> {
  const { id } = await params;
  const q = questions.find((x) => x.id === id);
  return {
    title: q ? q.title : "问题",
    description: q?.short_summary,
  };
}

export default async function QuestionDetailPage({
  params,
}: PageProps<"/questions/[id]">) {
  const { id } = await params;
  const q = questions.find((x) => x.id === id);
  if (!q) notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href="/questions" className="text-xs text-muted hover:text-primary">
        ← 返回问题中心
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-[10px] tracking-wider text-primary">
            热度 {q.heat_weight}
          </span>
          <span className="rounded-full bg-paper-deep px-3 py-1 font-mono text-[10px] tracking-wider text-muted">
            {q.viewpoints.length} 种观点
          </span>
          <span className="rounded-full bg-paper-deep px-3 py-1 font-mono text-[10px] tracking-wider text-muted">
            {q.evidence.length} 条原文证据
          </span>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold leading-snug text-ink">
          {q.title}
        </h1>
        <p className="mt-3 font-serif text-[15px] leading-loose text-body">
          {q.short_summary}
        </p>
      </header>

      {/* 中立概述（客观事实，可反馈） */}
      <section className="mt-8 rounded-2xl bg-surface card-print card-print--questions p-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-wide text-gold">事情本身</p>
          <FeedbackButton type="question_overview" refId={q.id} title={q.title} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-body">{q.neutral_overview}</p>
      </section>

      <QuestionBody q={q} />
    </div>
  );
}
