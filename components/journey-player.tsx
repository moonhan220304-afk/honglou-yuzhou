"use client";

import { useState } from "react";
import Link from "next/link";
import type { Journey } from "@/lib/journeys";
import type { Event } from "@/lib/types";
import { characterName, chapterLabel } from "@/lib/data";

const typeLabel: Record<string, string> = {
  literary: "文学解读",
  character: "性格解读",
  hongxue: "红学观点",
  structure: "结构解读",
  theme: "主题解读",
};

export default function JourneyPlayer({
  journey,
  events,
}: {
  journey: Journey;
  events: Record<string, Event>;
}) {
  const [current, setCurrent] = useState(0);
  const [visited, setVisited] = useState<Set<number>>(new Set([0]));
  const total = journey.stations.length;
  const station = journey.stations[current];
  const ev = events[station.event_id];
  const isLast = current === total - 1;

  function goTo(i: number) {
    setCurrent(i);
    setVisited((prev) => new Set(prev).add(i));
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-primary transition-all duration-700"
            style={{ width: `${((current + 1) / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 font-serif text-sm text-primary">
          {current + 1} / {total}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {journey.stations.map((s, i) => {
          const e = events[s.event_id];
          return (
            <button
              key={s.event_id}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-[4px] px-2.5 py-1 text-xs transition-colors ${
                i === current
                  ? "bg-primary text-paper"
                  : visited.has(i)
                    ? "bg-primary/10 text-primary"
                    : "bg-paper-deep text-muted hover:text-primary-deep"
              }`}
            >
              {e ? `第${e.chapter.number}回` : "未知回目"}
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl bg-surface card-print card-print--timeline">
        <div className="border-b border-line-inner bg-surface-warm px-6 py-4 md:px-8">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-xs tracking-[0.3em] text-garden">
              第 {current + 1} 站
            </span>
            <h2 className="font-serif text-xl font-semibold text-ink">{ev.title}</h2>
            <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
              {chapterLabel(ev.chapter.number)} · {ev.chapter.title}
            </span>
            {ev.chapter.attribution === "gaoe" && (
              <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                后四十回续书
              </span>
            )}
          </div>
        </div>

        <div className="px-6 py-6 md:px-8">
          {station.guide && (
            <p className="font-serif text-[15px] leading-relaxed text-body">
              {station.guide}
            </p>
          )}
          <p className="mt-4 text-sm leading-relaxed text-body">{ev.summary.short}</p>

          {ev.summary.meaning.length > 0 && (
            <div className="mt-5 rounded-xl bg-paper-deep/50 p-4">
              <p className="text-xs font-semibold tracking-wide text-gold">这一站意味着什么</p>
              <ul className="mt-2 space-y-1.5">
                {ev.summary.meaning.map((m) => (
                  <li key={m} className="flex gap-2 text-sm leading-relaxed text-body">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ev.interpretations.length > 0 && (
            <div className="mt-5 space-y-3">
              {ev.interpretations.map((it) => (
                <div key={it.title} className="rounded-xl bg-surface-warm p-4 shadow-card">
                  <div className="flex items-center gap-2">
                    <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {typeLabel[it.type] ?? "深度解读"}
                    </span>
                    <p className="text-sm font-semibold text-ink">{it.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-body">{it.content}</p>
                </div>
              ))}
            </div>
          )}

          {ev.evidence.length > 0 && (
            <div className="mt-5 rounded-xl border-l-2 border-gold/70 bg-paper p-4">
              <p className="text-xs font-semibold tracking-wide text-gold">原文依据</p>
              <blockquote className="mt-2 font-serif text-sm leading-loose text-ink/85">
                “{ev.evidence[0].quote}”
              </blockquote>
              <p className="mt-2 text-xs text-muted">{ev.evidence[0].note}</p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted">这一站的人物：</span>
            {ev.participants.map((p) => {
              const href = `/characters/${p.character_id}`;
              const name = characterName(p.character_id);
              return (
                <Link
                  key={p.character_id}
                  href={href}
                  className="rounded-full bg-surface px-3 py-1 text-xs text-secondary-btn-text transition-colors hover:border-gold/70 hover:text-primary"
                  title={p.role}
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
          className="rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0] disabled:opacity-40"
        >
          ← 上一站
        </button>
        {isLast ? (
          <Link
            href="/journey"
            className="rounded-full bg-gradient-to-b from-[#A73D3D] to-[#8B2E2E] px-8 py-3 font-serif text-sm font-semibold text-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
          >
            路线走完，去探索其他路线 →
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            className="rounded-full bg-gradient-to-b from-[#A73D3D] to-[#8B2E2E] px-8 py-3 font-serif text-sm font-semibold text-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
          >
            继续前行 →
          </button>
        )}
      </div>
    </div>
  );
}
