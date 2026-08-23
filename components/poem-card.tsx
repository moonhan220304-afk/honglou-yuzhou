import Link from "next/link";
import type { Poem } from "@/lib/types";
import { characterName, chapterLabel } from "@/lib/data";
import { sceneImages } from "@/lib/images";
import SceneImage from "@/components/scene-image";

export default function PoemCard({ poem }: { poem: Poem }) {
  const scene = sceneImages[poem.id];

  return (
    <div className="overflow-hidden rounded-2xl bg-surface-warm card-print card-print--viewpoints">
      <div className="grid md:grid-cols-2">
        <div className="p-8">
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-semibold text-ink">{poem.title}</h3>
            <span className="text-xs text-muted">
              {chapterLabel(poem.chapter)} · {characterName(poem.author_id)}
            </span>
          </div>
          <div className="mt-6 border-l-2 border-gold/60 pl-5">
            <p className="whitespace-pre-line font-serif text-[15px] leading-loose text-ink/90">
              {poem.text}
            </p>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-muted">{poem.interpretation}</p>
          <Link href="/characters" className="mt-4 inline-block text-xs font-medium text-primary">
            了解作者 →
          </Link>
        </div>
        {scene && (
          <div className="relative min-h-48 md:min-h-full">
            <SceneImage
              src={scene}
              alt={poem.scene}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
