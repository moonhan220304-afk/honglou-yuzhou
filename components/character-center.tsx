"use client";

import { useState } from "react";
import Link from "next/link";
import type { Character, Event, Relationship, Viewpoint } from "@/lib/types";
import { characterName, getCharacter, getEvent, chapterLabel, agesOfCharacter } from "@/lib/data";
import CharacterAvatar from "@/components/character-avatar";
import TimelineNode from "@/components/timeline-node";
import FeedbackButton from "@/components/feedback-button";

interface QuestionLike {
  id: string;
  title: string;
  heat_weight: number;
  viewpoints: { id: string }[];
}

interface CenterProps {
  character: Character;
  timelineEvents: { order: number; event_id: string; title: string; event: Event }[];
  relations: Relationship[];
  viewpoints: Viewpoint[];
  questions: QuestionLike[];
}

const MODULES = [
  { key: "who", title: "是谁", hint: "身份 · 家族 · 完整小传" },
  { key: "story", title: "经历了什么", hint: "人生时间线 · 每站可展开原文依据" },
  { key: "relations", title: "与谁有关", hint: "关系网络 · 每条关系都有阶段与证据" },
  { key: "viewpoints", title: "红学怎么看", hint: "多观点并存 · 注明提出者" },
  { key: "questions", title: "关于 TA 的问题", hint: "以问题为入口 · 从问题进入世界" },
] as const;

/** 模块 → 水印模板固定映射（全人物一致）：是谁=A 经历=B 关系=C 观点=D 问题=E */
const MODULE_TEMPLATE: Record<ModuleKey, string> = {
  who: "card-print--identity",
  story: "card-print--timeline",
  relations: "card-print--relations",
  viewpoints: "card-print--viewpoints",
  questions: "card-print--questions",
};

type ModuleKey = (typeof MODULES)[number]["key"];

export default function CharacterCenter({
  character,
  timelineEvents,
  relations,
  viewpoints,
  questions,
}: CenterProps) {
  const [open, setOpen] = useState<ModuleKey | null>(null);
  const c = character;

  return (
    <div>
      {/* 头部：默认可见 20% */}
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <CharacterAvatar characterId={c.id} name={c.name} className="h-20 w-20 shrink-0" />
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h1 className="font-serif text-4xl font-semibold text-ink">{c.name}</h1>
              <span className="text-sm text-muted">{c.category}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {c.aliases.slice(0, 3).join(" · ")}
              {c.aliases.length > 3 ? " …" : ""}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">
              {c.summary.short}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:max-w-xs md:justify-end">
          {c.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded-full bg-paper-deep px-3 py-1 text-xs text-secondary-btn-text"
            >
              {t}
            </span>
          ))}
        </div>
      </header>

      {/* 提示：点击模块展开 */}
      <p className="mt-8 text-center text-xs tracking-[0.2em] text-muted">
        ↓ 点击下方任一模块，展开她的一部分世界 ↓
      </p>

      {/* 模块卡 */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {MODULES.map((m) => {
          const isOpen = open === m.key;
          return (
            <div
              key={m.key}
              className={`transition-all duration-500 ease-out ${
                m.key === "who" ? "md:col-span-2" : ""
              }`}
            >
              <div
                className={`rounded-2xl p-6 shadow-card transition-all duration-500 ${
                  isOpen
                    ? "card-print bg-surface-warm shadow-hover"
                    : "card-print bg-surface hover:-translate-y-0.5 hover:shadow-hover"
                } ${MODULE_TEMPLATE[m.key]}`}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpen(isOpen ? null : m.key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen(isOpen ? null : m.key);
                    }
                  }}
                  className="flex cursor-pointer items-center justify-between"
                >
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-ink">
                      {m.title}
                    </h2>
                    <p className="mt-1 text-xs text-muted">{m.hint}</p>
                  </div>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 ${
                      isOpen ? "rotate-45 bg-primary text-paper" : "bg-paper-deep text-muted group-hover:text-primary"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </div>

                {/* 展开内容 */}
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen ? "mt-5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    {m.key === "who" && <WhoContent character={c} />}
                    {m.key === "story" && (
                      <StoryContent character={c} timelineEvents={timelineEvents} />
                    )}
                    {m.key === "relations" && (
                      <RelationsContent character={c} relations={relations} />
                    )}
                    {m.key === "viewpoints" && (
                      <ViewpointsContent character={c} viewpoints={viewpoints} />
                    )}
                    {m.key === "questions" && (
                      <QuestionsContent character={c} questions={questions} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- 各模块内容 ---------- */

function WhoContent({ character: c }: { character: Character }) {
  const ages = agesOfCharacter(c.id);
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold tracking-wide text-gold">身份档案</p>
        <FeedbackButton type="character_identity" refId={c.id} title={`${c.name}身份信息`} />
      </div>
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-paper-deep/60 p-4">
          <dt className="text-xs text-muted">出身</dt>
          <dd className="mt-1 text-sm leading-relaxed text-body">{c.identity.family}</dd>
        </div>
        <div className="rounded-xl bg-paper-deep/60 p-4">
          <dt className="text-xs text-muted">身份</dt>
          <dd className="mt-1 text-sm leading-relaxed text-body">{c.identity.position}</dd>
        </div>
        <div className="rounded-xl bg-paper-deep/60 p-4">
          <dt className="text-xs text-muted">籍贯</dt>
          <dd className="mt-1 text-sm text-body">{c.identity.origin}</dd>
        </div>
        {c.identity.generation && (
          <div className="rounded-xl bg-paper-deep/60 p-4">
            <dt className="text-xs text-muted">辈分</dt>
            <dd className="mt-1 text-sm text-body">{c.identity.generation}</dd>
          </div>
        )}
      </dl>
      {ages?.text_anchors && ages.text_anchors.length > 0 && (
        <div className="rounded-xl bg-surface p-4 shadow-card">
          <p className="text-xs font-semibold tracking-wide text-gold">年龄考（据原文锚点）</p>
          <div className="mt-2 space-y-1.5">
            {ages.text_anchors.slice(0, 4).map((a, i) => (
              <p key={i} className="text-xs leading-relaxed text-muted">
                <span className="text-secondary-btn-text">
                  {a.chapter ? `第${chapterLabel(a.chapter)}` : "出处待考"}：
                </span>
                {a.evidence || ""}
                {a.age ? `（${a.age}）` : ""}
              </p>
            ))}
          </div>
        </div>
      )}
      <p className="rounded-xl bg-surface p-5 shadow-card font-serif text-sm leading-loose text-body">
        {c.summary.long}
      </p>
      {c.personality_analysis.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-wide text-gold">性格维度</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {c.personality_analysis.map((p) => (
              <span
                key={p.dimension}
                title={p.description}
                className="rounded-full bg-surface px-3 py-1.5 text-sm text-secondary-btn-text"
              >
                {p.dimension}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StoryContent({
  character: c,
  timelineEvents,
}: {
  character: Character;
  timelineEvents: { order: number; event_id: string; title: string; event: Event }[];
}) {
  if (timelineEvents.length === 0) {
    return <p className="text-sm text-muted">时间线数据整理中……</p>;
  }
  return (
    <div>
      <div className="space-y-4">
        {timelineEvents.slice(0, 4).map((t) => (
          <TimelineNode key={t.event_id} title={t.title} event={t.event} />
        ))}
      </div>
      <Link
        href={`/characters/${c.id}/timeline`}
        className="mt-4 inline-block text-sm font-medium text-primary"
      >
        查看完整人生时间线（{timelineEvents.length} 站）→
      </Link>
    </div>
  );
}

function RelationsContent({
  character: c,
  relations,
}: {
  character: Character;
  relations: Relationship[];
}) {
  if (relations.length === 0) {
    return <p className="text-sm text-muted">关系数据整理中……</p>;
  }
  return (
    <div>
      <div className="flex flex-wrap gap-4">
        {relations.map((r) => {
          const otherId = r.from === c.id ? r.to : r.from;
          const other = getCharacter(otherId);
          const inner = (
            <>
              <CharacterAvatar
                characterId={otherId}
                name={other?.name ?? characterName(otherId)}
                className="h-16 w-16 transition-transform group-hover:scale-105"
              />
              <div>
                <p className="text-sm font-medium text-ink group-hover:text-primary">
                  {other?.name ?? characterName(otherId)}
                </p>
                <p className="text-xs text-muted">{r.type}</p>
              </div>
            </>
          );
          return other ? (
            <Link
              key={r.id}
              href={`/characters/${otherId}`}
              className="group flex w-24 flex-col items-center gap-2 text-center"
            >
              {inner}
            </Link>
          ) : (
            <span
              key={r.id}
              className="group flex w-24 flex-col items-center gap-2 text-center"
              title="该人物档案整理中"
            >
              {inner}
            </span>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/characters/${c.id}/relations`}
          className="text-sm font-medium text-primary"
        >
          查看关系全图 →
        </Link>
        <Link href="/graph" className="text-sm font-medium text-primary">
          在关系图谱中查看 →
        </Link>
      </div>
    </div>
  );
}

function ViewpointsContent({
  character: c,
  viewpoints,
}: {
  character: Character;
  viewpoints: Viewpoint[];
}) {
  if (viewpoints.length === 0) {
    return (
      <div>
        <p className="text-sm text-muted">该人物的红学观点尚在整理中。</p>
        <Link
          href={`/characters/${c.id}/viewpoints`}
          className="mt-3 inline-block text-sm font-medium text-primary"
        >
          查看观点页面 →
        </Link>
      </div>
    );
  }
  return (
    <div>
      <div className="space-y-3">
        {viewpoints.slice(0, 2).map((vp) => (
          <div key={vp.id} className="rounded-xl bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-ink">{vp.title}</h3>
              <span className="text-xs text-muted">
                {vp.author}
                {vp.year ? `（${vp.year}）` : ""}
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-body">
              {vp.description}
            </p>
          </div>
        ))}
      </div>
      <Link
        href={`/characters/${c.id}/viewpoints`}
        className="mt-4 inline-block text-sm font-medium text-primary"
      >
        查看全部观点（{viewpoints.length}）→
      </Link>
    </div>
  );
}

function QuestionsContent({
  character: c,
  questions,
}: {
  character: Character;
  questions: QuestionLike[];
}) {
  if (questions.length === 0) {
    return <p className="text-sm text-muted">关于她的问题尚在整理中。</p>;
  }
  return (
    <div>
      <div className="space-y-3">
        {questions.slice(0, 3).map((q) => (
          <Link
            key={q.id}
            href={`/questions/${q.id}`}
            className="block rounded-xl bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <p className="font-serif text-[15px] font-semibold text-ink">{q.title}</p>
            <p className="mt-1 text-xs text-muted">
              {q.viewpoints.length} 种观点 · 热度 {q.heat_weight}
            </p>
          </Link>
        ))}
      </div>
      <Link
        href={`/characters/${c.id}/questions`}
        className="mt-4 inline-block text-sm font-medium text-primary"
      >
        查看全部问题（{questions.length}）→
      </Link>
    </div>
  );
}
