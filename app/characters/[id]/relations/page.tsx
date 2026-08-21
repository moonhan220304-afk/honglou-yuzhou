import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCharacter,
  getEvent,
  relationshipsOf,
  counterpart,
  characterName,
  chapterLabel,
  characters,
} from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";

export async function generateStaticParams() {
  return Object.keys(characters).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]/relations">): Promise<Metadata> {
  const { id } = await params;
  const c = getCharacter(id);
  return { title: c ? `${c.name} · 关系` : "关系" };
}

export default async function RelationsPage({
  params,
}: PageProps<"/characters/[id]/relations">) {
  const { id } = await params;
  const c = getCharacter(id);
  if (!c) notFound();

  const relations = relationshipsOf(id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <Link
        href={`/characters/${id}`}
        className="text-xs text-muted hover:text-primary"
      >
        ← 返回{c.name}
      </Link>
      <header className="mt-4 text-center">
        <h1 className="font-serif text-3xl font-semibold text-ink">
          {c.name} 的关系
        </h1>
        <p className="mt-2 text-sm text-muted">
          每条关系都是一条有阶段、有证据的轨迹。点击任意一方进入对方的世界。
        </p>
      </header>

      <div className="mt-10 flex flex-col items-center">
        <CharacterAvatar characterId={c.id} name={c.name} className="h-24 w-24" />
        <p className="mt-2 font-serif text-lg font-semibold text-ink">{c.name}</p>
        <span className="h-8 w-px border-l border-dashed border-line" />
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
          {relations.map((r) => {
            const otherId = counterpart(r.id, id)!;
            const other = getCharacter(otherId);
            return (
              <Link
                key={r.id}
                href={`/characters/${otherId}`}
                className="group rounded-2xl bg-surface card-print card-print--relations p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover"
              >
                <div className="flex items-center gap-4">
                  <CharacterAvatar
                    characterId={otherId}
                    name={other?.name ?? otherId}
                    className="h-14 w-14 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-serif text-base font-semibold text-ink group-hover:text-primary">
                      {other?.name ?? characterName(otherId)}
                    </p>
                    <p className="text-xs text-muted">
                      {r.type} · {r.stages.length} 个阶段
                      {r.direction === "mutual" ? " · 相向" : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-body">
                  {r.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.stages.slice(0, 4).map((s) => (
                    <span
                      key={s.stage}
                      className="rounded-[4px] bg-paper-deep px-2 py-0.5 text-xs text-muted"
                    >
                      {s.title} · {chapterLabel(s.chapter)}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
        {relations.length === 0 && (
          <p className="text-sm text-muted">关系数据整理中……</p>
        )}
      </div>

      <div className="mt-10 text-center">
        <Link href="/graph" className="text-sm font-medium text-primary">
          在全局关系图谱中查看 →
        </Link>
      </div>
    </div>
  );
}
