import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CharacterCenter from "@/components/character-center";
import {
  getCharacter,
  getEvent,
  relationshipsOf,
  viewpointsByCharacter,
  questionsOfCharacter,
  characters,
} from "@/lib/data";

export async function generateStaticParams() {
  return Object.keys(characters).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/characters/[id]">): Promise<Metadata> {
  const { id } = await params;
  const character = getCharacter(id);
  return {
    title: character ? character.name : "人物未找到",
    description: character?.summary.short,
  };
}

export default async function CharacterPage({
  params,
}: PageProps<"/characters/[id]">) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();

  const timelineEvents = character.timeline
    .map((t) => ({ ...t, event: getEvent(t.event_id) }))
    .filter((t) => t.event);
  const relations = relationshipsOf(id);
  const viewpoints = viewpointsByCharacter[id] ?? [];
  const questions = questionsOfCharacter(id).map((q) => ({
    id: q.id,
    title: q.title,
    heat_weight: q.heat_weight,
    viewpoints: q.viewpoints,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <CharacterCenter
        character={character}
        timelineEvents={timelineEvents}
        relations={relations}
        viewpoints={viewpoints}
        questions={questions}
      />
    </div>
  );
}
