"use client";

import { useRef, useState } from "react";
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

/** 大观园 · 卡片式浏览：一张地点卡居中，左右滑动切换（延展自手机端体验） */
export default function LocationCards() {
  const list = locations;
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);
  const cur = list[Math.min(idx, list.length - 1)];
  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + list.length) % list.length);
  const residents = cur?.resident_character_ids?.slice(0, 6) ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] text-gold">DAGUANYUAN</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">大观园</h1>
          <p className="mt-2 text-sm text-muted">一处一景，左右滑动——谁住在这里，这里发生过什么</p>
        </div>
      </div>

      <div
        className="relative mt-8"
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
        <div className="card-print card-print--relations rounded-3xl bg-surface p-7 shadow-card transition-all hover:shadow-hover md:p-9">
          <div className="flex items-center gap-3">
            <IconMapPin className="h-5 w-5 text-primary" />
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
              {cur?.location_type ? typeLabel[cur.location_type] ?? cur.location_type : "地点"}
            </span>
            <span className="text-xs text-muted">第 {idx + 1} / {list.length} 处</span>
          </div>

          <h2 className="mt-4 font-serif text-3xl font-semibold text-ink">{cur?.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-body">{cur?.short_intro}</p>

          {residents.length > 0 && (
            <div className="mt-6">
              <p className="text-xs tracking-wider text-muted">住在这里的人</p>
              <div className="mt-2.5 flex flex-wrap gap-3">
                {residents.map((cid) => (
                  <Link
                    key={cid}
                    href={`/characters/${cid}`}
                    className="flex items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1.5 transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {characterImage(cid) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sitePath(characterImage(cid)!)} alt="" className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-serif text-primary">
                        {characterName(cid).slice(0, 1)}
                      </span>
                    )}
                    <span className="font-serif text-sm">{characterName(cid)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {cur?.key_events && cur.key_events.length > 0 && (
            <div className="mt-6 border-t border-line-inner pt-5">
              <p className="text-xs tracking-wider text-muted">这里发生过的</p>
              <div className="mt-2.5 space-y-2">
                {cur.key_events.slice(0, 4).map((ev, i) => (
                  <p key={i} className="text-sm leading-relaxed text-body">
                    · {ev}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 text-center">
            <Link
              href={`/map/${cur?.id}`}
              className="rounded-full bg-primary px-8 py-2.5 font-serif text-sm text-white transition-colors hover:bg-primary-deep"
            >
              进入这处园子 →
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一处"
          className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-paper/90 p-3 text-body shadow-md transition-all hover:border-primary/50 hover:text-primary md:-left-5"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一处"
          className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line bg-paper/90 p-3 text-body shadow-md transition-all hover:border-primary/50 hover:text-primary md:-right-5"
        >
          <IconArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-1.5">
        {list.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`第 ${i + 1} 处`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-primary" : "w-1.5 bg-line hover:bg-gold"}`}
          />
        ))}
      </div>
    </div>
  );
}
