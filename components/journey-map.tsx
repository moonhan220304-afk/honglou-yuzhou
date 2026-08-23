"use client";

import Link from "next/link";
import { journeys } from "@/lib/journeys";
import { getEvent, getCharacter } from "@/lib/data";
import { characterImage } from "@/lib/images";
import { IconArrowRight } from "@/components/icons";

/**
 * 剧情 · 探索逻辑图：中心「红楼梦」发散到四条人物路线（每条对应一位主要人物），
 * 每条路线标注覆盖的回次范围；hover 预览站点，点击进入路线。
 */
export default function JourneyMap() {
  const routes = journeys.map((j) => {
    const cover = j.cover_character_id ? getCharacter(j.cover_character_id) : null;
    const stations = j.stations.map((s) => getEvent(s.event_id)).filter(Boolean) as NonNullable<ReturnType<typeof getEvent>>[];
    const chapters = stations.map((e) => e.chapter?.number).filter((n): n is number => typeof n === "number");
    const from = chapters.length ? Math.min(...chapters) : null;
    const to = chapters.length ? Math.max(...chapters) : null;
    return { j, cover, stations, from, to };
  });

  return (
    <div className="mt-8">
      {/* 中心节点 */}
      <div className="flex justify-center">
        <div className="rounded-2xl bg-primary px-8 py-3 text-center shadow-lg">
          <p className="font-serif text-lg font-semibold tracking-[0.3em] text-white">红楼梦 · 大观园</p>
          <p className="mt-0.5 text-[11px] text-white/75">选一条路，跟着故事走下去</p>
        </div>
      </div>

      {/* 连接线：中轴向下 → 横向岔开 → 左右两列分支（桌面端；移动端单列无需装饰线） */}
      <div className="relative mx-auto hidden h-12 w-full max-w-3xl md:block" aria-hidden>
        {/* 中轴（从中心节点向下） */}
        <div className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-gold/70" />
        {/* 横向岔线（连通左右两列） */}
        <div className="absolute left-1/4 right-1/4 top-5 h-px bg-gold/70" />
        {/* 左列分支 */}
        <div className="absolute left-1/4 top-5 h-7 w-px -translate-x-1/2 bg-gold/70" />
        {/* 右列分支 */}
        <div className="absolute right-1/4 top-5 h-7 w-px translate-x-1/2 bg-gold/70" />
      </div>

      {/* 四条路线（2×2 逻辑图） */}
      <div className="grid gap-5 md:grid-cols-2 md:gap-x-12">
        {routes.map(({ j, cover, stations, from, to }, i) => (
          <Link
            key={j.id}
            href={`/journey/${j.id}`}
            className={`group relative rounded-2xl bg-surface p-5 shadow-card transition-all hover:-translate-y-1 hover:shadow-hover ${
              i % 2 === 0 ? "md:mr-6" : "md:ml-6"
            }`}
          >
            {/* 下排卡与上排卡之间的连接竖线 */}
            {i >= 2 && (
              <span className="absolute -top-5 left-1/2 hidden h-5 w-px -translate-x-1/2 bg-gold/50 md:block" aria-hidden />
            )}
            <div className="flex items-center gap-3">
              {cover ? (
                characterImage(cover.id) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={characterImage(cover.id)!}
                    alt={cover.name}
                    className="h-12 w-12 rounded-full object-cover object-top ring-2 ring-gold/50"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-serif text-lg text-primary">
                    {cover.name.slice(0, 1)}
                  </span>
                )
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-serif text-lg text-primary">
                  {j.title.slice(0, 1)}
                </span>
              )}
              <div>
                <p className="font-serif text-lg font-semibold text-ink group-hover:text-primary">{j.title}</p>
                <p className="text-xs text-gold">{j.tagline}</p>
              </div>
            </div>

            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{j.description}</p>

            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted">
              <span className="rounded-full bg-paper-deep px-2 py-0.5">{stations.length} 站</span>
              {from != null && (
                <span className="rounded-full bg-paper-deep px-2 py-0.5">第 {from}–{to} 回</span>
              )}
              {cover && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-primary">主角：{cover.name}</span>
              )}
            </div>

            {/* hover 站点预览 */}
            <div className="mt-3 space-y-1 border-t border-line-inner pt-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {stations.slice(0, 3).map((e) => (
                <p key={e.id} className="flex items-center gap-2 truncate text-xs text-body">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {e.chapter ? `第${e.chapter.number}回 · ` : ""}{e.title}
                </p>
              ))}
              <p className="flex items-center gap-1 pt-1 text-xs text-primary">
                走完这条路 <IconArrowRight className="h-3 w-3" />
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* 从哪开始 */}
      <div className="card-print card-print--viewpoints mt-8 rounded-2xl bg-surface p-5 text-center">
        <p className="font-serif text-sm text-ink">
          不知从何开始？推荐先走「宝黛情缘」——故事从黛玉进府讲起，最贴近《红楼梦》的开篇。
        </p>
      </div>
    </div>
  );
}
