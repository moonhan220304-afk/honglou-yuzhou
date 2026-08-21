"use client";

/** 等级徽章：如「通灵 · LV3」，朱砂底白字小圆角标签，供用户名旁使用。
 * 不传 level/levelName 时渲染 null（适合数据尚未加载的场景）。 */
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
  const label = levelName || (typeof level === "number" ? `LV${level}` : "");
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border border-gold/50 bg-primary-deep px-2 py-0.5 font-serif text-[10px] leading-none text-paper ${className}`}
      title={`等级：${label}`}
    >
      {label}
      {levelName && typeof level === "number" && level > 0 && (
        <span className="opacity-80">· LV{level}</span>
      )}
    </span>
  );
}
