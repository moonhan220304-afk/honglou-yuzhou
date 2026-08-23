"use client";

/** 四级四色印章徽章（雅致新中式）：懵懂素白 / 试才黛青 / 通灵金底朱边 / 元老绀紫金边。
 *  不传 level/levelName 时渲染 null（适合数据尚未加载的场景）。 */
const TIERS: Record<number, string> = {
  1: "bg-paper-deep text-secondary-btn-text border-line",
  2: "bg-characters-soft text-characters-deep border-characters/60",
  3: "bg-gold text-[#5C3A1E] border-primary/70",
  4: "bg-me text-paper border-gold",
};

export default function LevelBadge({
  level,
  levelName,
  className = "",
}: {
  level?: number;
  levelName?: string;
  className?: string;
}) {
  if (!level && !levelName) return null;
  const lv = typeof level === "number" && level > 0 ? level : 1;
  const tier = TIERS[lv] ?? TIERS[1];
  const label = levelName || (typeof level === "number" ? `LV${level}` : "");
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-[5px] border px-1.5 py-0.5 font-serif text-[10px] leading-none tracking-widest ${tier} ${className}`}
      title={`等级：${label}`}
    >
      {label}
      {levelName && typeof level === "number" && level > 0 && (
        <span className="opacity-80">· LV{level}</span>
      )}
      {lv >= 3 && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      {lv >= 4 && <span className="h-2 w-2 rounded-[2px] bg-gold/80" />}
    </span>
  );
}
