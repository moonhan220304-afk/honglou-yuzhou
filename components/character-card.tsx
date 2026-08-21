import Link from "next/link";
import CharacterAvatar from "@/components/character-avatar";

export default function CharacterCard({
  id,
  name,
  alias,
}: {
  id: string;
  name: string;
  alias?: string;
}) {
  return (
    <Link
      href={`/characters/${id}`}
      className="group flex w-28 shrink-0 flex-col items-center gap-2 py-2"
    >
      <CharacterAvatar
        characterId={id}
        name={name}
        className="h-20 w-20 transition-transform duration-300 group-hover:scale-110"
      />
      <div className="text-center">
        <p className="font-serif text-sm font-semibold text-ink group-hover:text-primary">
          {name}
        </p>
        {alias && <p className="text-xs text-muted">{alias}</p>}
      </div>
    </Link>
  );
}
