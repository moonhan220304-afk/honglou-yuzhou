"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { locations, characterName } from "@/lib/data";
import { characterImage } from "@/lib/images";
import { IconArrowLeft, IconArrowRight, IconMapPin } from "@/components/icons";

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

/**
 * 大观园 · 卡片式浏览（对齐人物卡片风格）
 * - 卡片加宽加大，保留卡片形态
 * - 人物头像前置（卡片上方头像墙），再往下是简介/事件
 * - 左右滑动 / 箭头切换
 */
export default function LocationCards() {
  const list = locations;
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const cur = list[Math.min(idx, list.length - 1)];
  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + list.length) % list.length);
  const residents = cur?.resident_character_ids?.slice(0, 6) ?? [];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="text-center">
        <p className="text-xs tracking-[0.35em] text-gold">DAGUANYUAN</p>
        <h1 className="mt-2 font-serif text-[34px] font-semibold text-ink">大观园</h1>
        <p className="mt-2 text-sm text-muted">一处一景，左右滑动——谁住在这里，这里发生过什么</p>
      </div>

      <div
        className="relative mx-auto mt-10 w-full max-w-[520px]"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {/* 地点大卡（人物头像前置在卡片上方） */}
        <div className="card-print card-print--relations overflow-hidden rounded-3xl bg-surface shadow-card transition-all duration-500 hover:shadow-hover">
          {/* 顶部：人物头像墙（前置） */}
          <div className="relative border-b border-line-inner bg-paper-deep/40 px-8 pb-5 pt-7">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-primary">
                <IconMapPin className="h-4 w-4" />
                {cur?.location_type ? typeLabel[cur.location_type] ?? cur.location_type : "地点"}
              </span>
              <span className="text-xs text-muted">第 {idx + 1} / {list.length} 处</span>
            </div>
            {residents.length > 0 ? (
              <div className="mt-5 flex items-center justify-center gap-4">
                {residents.map((cid) => (
                  <Link
                    key={cid}
                    href={`/characters/${cid}`}
                    title={characterName(cid)}
                    className="group flex flex-col items-center gap-1.5 transition-transform hover:-translate-y-1"
                  >
                    {characterImage(cid) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sitePath(characterImage(cid)!)}
                        alt={characterName(cid)}
                        className="h-16 w-16 rounded-full object-cover object-top ring-[3px] ring-white shadow-lg group-hover:ring-gold md:h-20 md:w-20"
                      />
                    ) : (
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 font-serif text-2xl text-primary ring-[3px] ring-white md:h-20 md:w-20">
                        {characterName(cid).slice(0, 1)}
                      </span>
                    )}
                    <span className="font-serif text-xs text-ink group-hover:text-primary">{characterName(cid)}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-4 text-center font-serif text-lg text-secondary-btn-text">{cur?.name}</div>
            )}
          </div>

          {/* 卡片主体 */}
          <div className="px-8 py-6 text-center">
            <h2 className="font-serif text-3xl font-semibold text-ink">{cur?.name}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-body">{cur?.short_intro}</p>

            {cur?.key_events && cur.key_events.length > 0 && (
              <div className="mt-5 border-t border-line-inner pt-4 text-left">
                <p className="text-xs tracking-wider text-muted">这里发生过的</p>
                <div className="mt-2 space-y-1.5">
                  {cur.key_events.slice(0, 3).map((ev, i) => (
                    <p key={i} className="flex items-center gap-2 text-sm leading-relaxed text-body">
                      <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                      {ev}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <Link
                href={`/map/${cur?.id}`}
                className="rounded-full bg-primary px-10 py-2.5 font-serif text-sm text-white transition-colors hover:bg-primary-deep"
              >
                进入这处园子 →
              </Link>
            </div>
          </div>
        </div>

        {/* 左右切换 */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一处"
          className="absolute left-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-paper/95 p-2.5 text-body shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:text-primary"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一处"
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-paper/95 p-2.5 text-body shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:text-primary"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>

      {/* 滑动指示器 */}
      <div className="mt-8 flex justify-center">
        <div className="flex items-center gap-1.5">
          <span className="h-px w-10 bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="h-px w-10 bg-line" />
        </div>
      </div>
    </div>
  );
}
