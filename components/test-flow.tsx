"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { archetypes, testQuestions } from "@/lib/test-data";
import { getCharacter } from "@/lib/data";
import { api, fetchMe } from "@/lib/api";
import type { TestStats } from "@/lib/api";
import { characterImages } from "@/lib/images";
import Seal from "@/components/seal";
import TestResultShare from "@/components/test-result-share";
import type { TestShareData } from "@/components/test-result-share";

export default function TestFlow() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultId, setResultId] = useState<string | null>(null);

  const total = testQuestions.length;

  function answer(option: (typeof testQuestions)[0]["options"][0]) {
    const next = { ...scores };
    for (const [key, weight] of Object.entries(option.weights)) {
      next[key] = (next[key] ?? 0) + weight;
    }
    if (step + 1 < total) {
      setScores(next);
      setStep(step + 1);
    } else {
      const winner = Object.entries(next).sort((a, b) => b[1] - a[1])[0][0];
      setScores(next);
      setResultId(winner);
    }
  }

  function restart() {
    setStep(0);
    setScores({});
    setResultId(null);
  }

  if (resultId) {
    return <ResultCard archetypeId={resultId} onRestart={restart} />;
  }

  const question = testQuestions[step];

  return (
    <div className="rounded-3xl bg-surface card-print card-print--identity p-8 md:p-10">
      <div className="flex items-center gap-3">
        <span className="font-serif text-sm text-primary">
          {step + 1} / {total}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <h2 className="mt-8 font-serif text-xl font-semibold leading-relaxed text-ink">
        {question.text}
      </h2>

      <div className="mt-8 space-y-3">
        {question.options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => answer(option)}
            className="w-full rounded-2xl bg-surface-warm px-6 py-4 text-left text-sm text-body transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/70 hover:bg-paper hover:shadow-card"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  archetypeId,
  onRestart,
}: {
  archetypeId: string;
  onRestart: () => void;
}) {
  const archetype = archetypes.find((a) => a.id === archetypeId) ?? archetypes[0];
  const character = getCharacter(archetype.character_id);
  const avatar = characterImages[archetype.character_id] ?? null;
  const [stats, setStats] = useState<TestStats | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  /* 出结果后：登录用户提交结果并拉取站内统计 */
  useEffect(() => {
    (async () => {
      const u = await fetchMe();
      try {
        if (u) {
          await api("/api/test/result", {
            method: "POST",
            body: JSON.stringify({ archetype_id: archetype.id, character_id: archetype.character_id }),
          });
        }
        const r = await api<{ stats: TestStats }>("/api/test/stats");
        setStats(r.stats);
      } catch {
        /* 统计不可用时不阻塞结果展示 */
      }
    })();
  }, [archetype.id, archetype.character_id]);

  const sameCount = stats?.byType.find((t) => t.archetype_id === archetype.id)?.c ?? 0;

  const shareData: TestShareData | null = shareOpen
    ? {
        title: archetype.title,
        characterId: archetype.character_id,
        characterName: character?.name ?? archetype.title,
        avatarUrl: avatar,
        summary: archetype.summary,
        dimensions: archetype.dimensions,
        traits: archetype.traits,
        statsTotal: stats?.total ?? 0,
        statsSame: sameCount,
      }
    : null;

  async function share() {
    setShareOpen(true);
  }

  return (
    <div className="rounded-3xl bg-surface card-print card-print--timeline p-8 md:p-10">
      <div className="text-center">
        <p className="text-xs tracking-[0.3em] text-gold">你的红楼人格</p>
        <div className="mt-4 flex justify-center">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar}
              alt={character?.name ?? ""}
              className="h-24 w-24 rounded-full object-cover shadow-card ring-2 ring-gold/60"
            />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 font-serif text-2xl text-primary">
              {character?.name.charAt(0) ?? "红"}
            </span>
          )}
        </div>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-ink">
          {archetype.title}
        </h2>
        {character && (
          <p className="mt-2 text-sm text-muted">
            对应人物：{character.name}
            {character.aliases[0] && `（${character.aliases[0]}）`}
          </p>
        )}
        {stats && (
          <div className="mx-auto mt-4 inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-primary/5 px-4 py-2 text-xs text-secondary-btn-text">
            <span>
              站内已有 <b className="font-mono text-primary">{stats.total}</b> 位同好完成测试
            </span>
            <span className="text-line">|</span>
            <span>
              与你有 <b className="font-mono text-primary">{sameCount}</b> 人相同
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl bg-surface-warm card-print card-print--relations p-6">
          <p className="text-xs font-semibold tracking-wide text-gold">性格特质</p>
          <ul className="mt-3 space-y-2 text-sm text-body">
            {archetype.traits.map((t) => (
              <li key={t} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl bg-surface-warm card-print card-print--viewpoints p-6">
          <p className="text-xs font-semibold tracking-wide text-gold">优势与挑战</p>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="font-medium text-primary-deep">优势</p>
              <ul className="mt-1 space-y-1.5 text-body">
                {archetype.strengths.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-primary">挑战</p>
              <ul className="mt-1 space-y-1.5 text-body">
                {archetype.challenges.map((c) => (
                  <li key={c}>· {c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-paper p-6">
        <p className="text-xs font-semibold tracking-wide text-gold">原著性格</p>
        <p className="mt-2 text-sm leading-relaxed text-body">{archetype.summary}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-gold/40 bg-surface-warm p-6">
        <p className="text-xs font-semibold tracking-wide text-gold">性格维度</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {archetype.dimensions.map((d) => (
            <div key={d.name} className="rounded-xl bg-surface p-4 shadow-card">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wide text-primary">{d.name}</span>
                <span className="rounded-[4px] bg-gold/15 px-2 py-0.5 text-xs text-secondary-btn-text">
                  {d.trait}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-body">{d.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-paper p-6">
        <p className="text-xs font-semibold tracking-wide text-gold">推荐阅读</p>
        <ul className="mt-3 space-y-2 text-sm text-body">
          {archetype.reading.map((r) => (
            <li key={r}>《{r}》</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={share}
          className="rounded-full bg-gradient-to-b from-[#A73D3D] to-[#8B2E2E] px-8 py-3 text-sm font-semibold text-paper shadow-card transition-all hover:-translate-y-0.5 hover:shadow-hover"
        >
          分享测试结果
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="rounded-md bg-secondary-btn px-6 py-3 text-sm font-medium text-secondary-btn-text transition-colors hover:bg-[#F5EBE0]"
        >
          重新测试
        </button>
        {character && (
          <Link
            href={`/characters/${character.id}`}
            className="rounded-md bg-surface px-6 py-3 text-sm font-medium text-body transition-colors hover:border-gold/70 hover:text-primary"
          >
            了解{character.name} →
          </Link>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Seal text="趣味" className="h-7 w-12 text-xs" />
        <p className="text-xs text-muted">本测试为趣味互动，结果不构成学术观点</p>
      </div>

      <TestResultShare data={shareData} onClose={() => setShareOpen(false)} />
    </div>
  );
}
