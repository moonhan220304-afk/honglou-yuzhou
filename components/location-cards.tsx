"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { sitePath } from "@/lib/api";
import { locations, characterName, getEvent } from "@/lib/data";
import { characterImage } from "@/lib/images";
import { IconArrowLeft, IconArrowRight, IconMapPin } from "@/components/icons";
import SectionHero from "@/components/section-hero";

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

const THRESHOLD = 60;

/**
 * 大观园 · 卡片式浏览（对齐人物卡片风格）
 * - 人物头像前置（卡片上方头像墙），再往下是简介/事件
 * - 左右箭头（在卡片外侧，不遮挡文字）+ 左右滑动（指针拖拽跟手）
 */
export default function LocationCards() {
  const list = locations;
  const [idx, setIdx] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ start: number; active: boolean }>({ start: 0, active: false });
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

  /* 指针拖拽（鼠标 + 触摸统一） */
  const onPointerDown = (e: React.PointerEvent) => {
    // 按在链接/按钮上时不启动拖拽，保证「进入这处园子」/头像链接的原生点击
    if ((e.target as HTMLElement).closest("a, button")) return;
    drag.current = { start: e.clientX, active: true };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    setDragX(e.clientX - drag.current.start);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const dx = e.clientX - drag.current.start;
    setDragging(false);
    if (Math.abs(dx) > THRESHOLD) {
      go(dx < 0 ? 1 : -1);
      setDragX(0);
    } else {
      setDragX(0);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <SectionHero
        sector="garden"
        eyebrow="DAGUANYUAN"
        title="大观园"
        description="一处一景，左右滑动——谁住在这里，这里发生过什么"
      />

      {/* 箭头在卡片外侧，不遮挡文字 */}
      <div className="mx-auto mt-10 flex w-full max-w-[640px] items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="上一处"
          className="shrink-0 rounded-full border border-line bg-paper p-2.5 text-body shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:text-primary md:p-3"
        >
          <IconArrowLeft className="h-5 w-5" />
        </button>

        {/* 地点大卡（可左右滑动） */}
        <div
          className="relative min-w-0 flex-1 cursor-grab touch-pan-y select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            drag.current.active = false;
            setDragging(false);
            setDragX(0);
          }}
        >
          <div
            key={cur?.id}
            className="card-print card-print--relations overflow-hidden rounded-2xl bg-surface shadow-card transition-all duration-500 hover:shadow-hover"
            style={{
              transform: `translateX(${dragX}px)`,
              transition: dragging ? "none" : "transform 300ms cubic-bezier(0.34,1.56,0.64,1)",
              animation: dragging ? "none" : "star-panel-in 0.22s ease both",
            }}
          >
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
                    {cur.key_events
                      .map((eid) => getEvent(eid)?.title)
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((title, i) => (
                        <p key={i} className="flex items-center gap-2 text-sm leading-relaxed text-body">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                          {title}
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
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="下一处"
          className="shrink-0 rounded-full border border-line bg-paper p-2.5 text-body shadow-md transition-all hover:scale-110 hover:border-primary/50 hover:text-primary md:p-3"
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
