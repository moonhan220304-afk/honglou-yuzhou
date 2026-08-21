import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter, getEvent, characters } from "@/lib/data";
import TimelineNode from "@/components/timeline-node";

export async function generateStaticParams() {
  return Object.keys(characters).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]/timeline">): Promise<Metadata> {
  const { id } = await params;
  const c = getCharacter(id);
  return { title: c ? `${c.name} · 人生时间线` : "时间线" };
}

export default async function TimelinePage({
  params,
}: PageProps<"/characters/[id]/timeline">) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();

  const items = c.timeline
    .map((t) => ({ ...t, event: getEvent(t.event_id) }))
    .filter((t) => t.event);

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <Link href={`/characters/${id}`} className="text-xs text-muted hover:text-primary">
        ← 返回{c.name}
      </Link>
      <header className="mt-4">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          {c.name} · 人生时间线
        </h1>
        <p className="mt-2 text-sm text-muted">
          {items.length} 站人生轨迹。点击每一站，展开深度解读与原文依据。
        </p>
      </header>

      <div className="relative mt-10 pl-6">
        <div className="absolute bottom-2 left-[5px] top-2 w-px border-l border-dashed border-line" />
        <ol className="space-y-8">
          {items.map((item, i) => (
            <li key={item.event_id} className="relative">
              <span className="absolute -left-6 top-1.5 flex h-2.5 w-2.5 items-center justify-center">
                <span className="absolute h-2.5 w-2.5 rounded-full bg-primary/30" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              <TimelineNode
                title={item.title}
                event={item.event}
                defaultOpen={i === 0}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
