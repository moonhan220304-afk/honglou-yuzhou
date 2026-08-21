"use client";

import { useState } from "react";
import Link from "next/link";
import type { Event } from "@/lib/types";
import { characterName, chapterLabel } from "@/lib/data";
import FeedbackButton from "@/components/feedback-button";

const typeLabel: Record<string, string> = {
  literary: "文学解读",
  character: "性格解读",
  hongxue: "红学观点",
  structure: "结构解读",
  theme: "主题解读",
};

export default function TimelineNode({
  title,
  event,
  defaultOpen,
}: {
  title: string;
  event: Event;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="rounded-2xl bg-surface card-print card-print--timeline p-5">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="block w-full text-left"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-serif text-base font-semibold text-ink">{title}</h3>
          <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
            {chapterLabel(event.chapter.number)} · {event.chapter.title}
          </span>
          {event.chapter.attribution === "gaoe" && (
            <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-xs text-primary">
              后四十回续书
            </span>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-body">{event.summary.short}</p>
        <span
          className={`mt-3 inline-flex items-center gap-1 text-xs text-primary transition-transform ${open ? "" : ""}`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
          {open ? "收起" : "展开解读与原文"}
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-line-inner pt-4">
          {event.summary.meaning.length > 0 && (
            <div className="rounded-xl bg-paper-deep/50 p-4">
              <p className="text-xs font-semibold tracking-wide text-gold">事件意义</p>
              <ul className="mt-2 space-y-1.5">
                {event.summary.meaning.map((m) => (
                  <li key={m} className="flex gap-2 text-sm leading-relaxed text-body">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {event.interpretations.length > 0 && (
            <div className="space-y-3">
              {event.interpretations.map((it) => (
                <div
                  key={it.title}
                  className="rounded-xl bg-surface-warm p-4 shadow-card"
                >
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

          {event.evidence.length > 0 && (
            <div className="rounded-xl border-l-2 border-gold/70 bg-paper p-4">
              <p className="text-xs font-semibold tracking-wide text-gold">原文依据</p>
              <blockquote className="mt-2 font-serif text-sm leading-loose text-ink/85">
                “{event.evidence[0].quote}”
              </blockquote>
              <p className="mt-2 text-xs text-muted">{event.evidence[0].note}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted">人物：</span>
              {event.participants.map((p) => (
                <Link
                  key={p.character_id}
                  href={`/characters/${p.character_id}`}
                  className="rounded-[4px] bg-paper-deep px-2 py-1 text-xs text-secondary-btn-text transition-colors hover:text-primary"
                  title={p.role}
                >
                  {characterName(p.character_id)}
                </Link>
              ))}
            </div>
            <Link
              href={`/events/${event.id}`}
              className="text-xs font-medium text-primary hover:text-primary-deep"
            >
              事件详情页 →
            </Link>
            <FeedbackButton
              type="event"
              refId={event.id}
              title={event.title}
            />
          </div>
        </div>
      )}
    </div>
  );
}
