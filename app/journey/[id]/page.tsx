import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JourneyPlayer from "@/components/journey-player";
import { journeys } from "@/lib/journeys";
import { events, getCharacter } from "@/lib/data";

export async function generateStaticParams() {
  return journeys.map((j) => ({ id: j.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/journey/[id]">): Promise<Metadata> {
  const { id } = await params;
  const journey = journeys.find((j) => j.id === id);
  return {
    title: journey ? `${journey.title} · 探索路线` : "探索路线",
    description: journey?.description,
  };
}

export default async function JourneyDetailPage({
  params,
}: PageProps<"/journey/[id]">) {
  const { id } = await params;
  const journey = journeys.find((j) => j.id === id);
  if (!journey) notFound();

  const cover = journey.cover_character_id
    ? getCharacter(journey.cover_character_id)
    : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <header className="mb-8">
        <p className="text-xs tracking-[0.3em] text-gold">{journey.tagline}</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">
          {journey.title}
        </h1>
        {cover && (
          <p className="mt-2 text-sm text-muted">
            主角：{cover.name}
            {cover.aliases[0] ? `（${cover.aliases[0]}）` : ""}
          </p>
        )}
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-body">
          {journey.description}
        </p>
      </header>
      <JourneyPlayer journey={journey} events={events} />
    </div>
  );
}
