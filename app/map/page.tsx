import type { Metadata } from "next";
import Link from "next/link";
import { locations, getLocation } from "@/lib/data";
import { characterName } from "@/lib/data";
import { cardPrintClass } from "@/lib/card-print";
import CharacterAvatar from "@/components/character-avatar";

export const metadata: Metadata = {
  title: "大观园地图",
  description: "十九个地点，谁住在这里，这里发生过什么——大观园空间地图。",
};

const typeLabel: Record<string, string> = {
  estate: "府邸",
  garden: "园子",
  courtyard: "院落",
  pavilion: "亭台",
  religious: "庵堂",
  landscape: "景观",
  bridge: "桥",
  manor: "府邸",
  nunnery: "庵堂",
};

export default function MapPage() {
  const manors = locations.filter(
    (l) => l.location_type === "estate" || l.location_type === "manor" || l.location_type === "garden",
  );
  const courtyards = locations.filter(
    (l) => l.location_type === "courtyard" || l.location_type === "religious" || l.location_type === "nunnery",
  );
  const spots = locations.filter(
    (l) => !["estate", "manor", "garden", "courtyard", "religious", "nunnery"].includes(l.location_type),
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <header>
        <p className="text-xs tracking-[0.3em] text-gold">DAGUANYUAN MAP</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">大观园地图</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-body">
          大观园不只是故事的舞台——每个地点都是一组人物、事件与命运的交汇处。
          点击任意地点，看看谁住在这里，这里发生过什么。
        </p>
      </header>

      <div className="mt-10 space-y-12">
        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">府邸与园子</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manors.map((l, i) => (
              <LocationCard key={l.id} locationId={l.id} i={i} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">院落与庵堂</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courtyards.map((l, i) => (
              <LocationCard key={l.id} locationId={l.id} i={i} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg font-semibold text-ink">亭台与景点</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spots.map((l, i) => (
              <LocationCard key={l.id} locationId={l.id} i={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function LocationCard({ locationId, i }: { locationId: string; i: number }) {
  const l = getLocation(locationId);
  if (!l) return null;
  return (
    <Link
      href={`/map/${l.id}`}
      className={`group rounded-2xl bg-surface ${cardPrintClass(i, 0)} p-5 transition-all hover:-translate-y-0.5 hover:shadow-hover`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-semibold text-ink group-hover:text-primary">
          {l.name}
        </h3>
        <span className="rounded-[4px] bg-paper-deep px-2 py-0.5 text-xs text-muted">
          {typeLabel[l.location_type] ?? l.location_type}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
        {l.short_intro}
      </p>
      <div className="mt-3 flex items-center gap-2">
        {l.resident_character_ids?.slice(0, 3).map((cid) => (
          <CharacterAvatar
            key={cid}
            characterId={cid}
            name={characterName(cid)}
            className="h-6 w-6 border-0 shadow-none"
          />
        ))}
        <span className="text-xs text-muted">
          {l.key_events?.length ?? 0} 件关键事件
        </span>
      </div>
    </Link>
  );
}
